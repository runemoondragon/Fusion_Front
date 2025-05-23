import express, { Request, Response } from 'express';
import axios from 'axios';
import { verifyToken, User as AuthUser } from '../middleware/auth';
import pool from '../db';
import { calculateLlmProviderCost, getNeuroSwitchClassifierFee } from '../utils/costCalculator';
import { decrypt } from '../utils/crypto';

interface NeuroSwitchResponse {
  response: string;
  tokens?: number;
  model?: string;
  provider_used?: string;
  response_time?: number;
  fallback_reason?: string | null;
  token_usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
    max_tokens?: number;
    runtime?: number;
  };
}

const router = express.Router();

// Simple pricing map (per 1K tokens, in USD)
const PRICING: Record<string, number> = {
  openai: 0.002,
  claude: 0.0025,
  gemini: 0.0018,
  mistral: 0.0015,
  // Add more as needed
};
const PREMIUM_RATE = 0.2; // 20%

// Log usage to database
async function logUsage(
  userId: number,
  provider: string | null | undefined,
  model: string | null | undefined,
  promptTokens: number | undefined,
  completionTokens: number | undefined,
  totalTokens: number | undefined,
  responseTimeInput: number | null | undefined = 0,
  fallbackReason: string | null = null,
  llmCost: number | null = null,
  apiKeyId: number | null = null,
  requestModel: string | null | undefined,
  neuroswitchFee: number | null = null
) {
  let queryParams: any[] = [];
  try {
    // Ensure responseTime is a number, default to 0 if null or undefined
    const finalResponseTime = (responseTimeInput === null || typeof responseTimeInput === 'undefined') ? 0 : responseTimeInput;
    
    queryParams = [userId, provider, model, promptTokens || 0, completionTokens || 0, totalTokens || 0, finalResponseTime, fallbackReason, llmCost, apiKeyId, requestModel, neuroswitchFee];
    console.log('Executing logUsage INSERT with params:', queryParams); // Log parameters

    await pool.query(
      `INSERT INTO usage_logs (user_id, provider, model, prompt_tokens, completion_tokens, total_tokens, response_time, fallback_reason, cost, api_key_id, request_model, neuroswitch_fee, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
      queryParams
    );
    console.log('logUsage INSERT successful for user_id:', userId); // Log success
  } catch (error) {
    console.error('Error logging usage to database:', error, 'Parameters were:', queryParams);
  }
}

// Deduct credits and log transaction in user_credits and credit_transactions
async function deductCreditsAndLog(userId: number, cost: number, provider: string, model: string, tokens: number) {
  // Convert cost to cents
  const costCents = Math.round(cost * 100);
  // Deduct credits from user_credits
  await pool.query(
    'UPDATE user_credits SET balance_cents = balance_cents - $1 WHERE user_id = $2',
    [costCents, userId]
  );
  // Log transaction in credit_transactions
  await pool.query(
    `INSERT INTO credit_transactions (user_id, amount_cents, method, status, description, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW())`,
    [userId, -costCents, 'usage', 'completed', `Usage for ${provider}/${model}, ${tokens} tokens`]
  );
}

router.post('/', verifyToken, async (req: Request, res: Response) => {
  const { prompt, model, image, mode } = req.body;
  console.log('Received /api/chat request. req.body.model:', model);
  const user = req.user as AuthUser;
  
  if (!user || typeof user.id === 'undefined') {
    return res.status(401).json({ error: 'Unauthorized: User ID not found in token' });
  }
  const userId = user.id;
  const chatIdFromHeader = req.headers['x-chat-id'] as string | undefined;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt missing' });
  }

  interface HistoryMessage {
    role: 'user' | 'assistant';
    content: string;
  }

  const isProd = process.env.NODE_ENV === 'production';

let dbHistory: HistoryMessage[] = [];

if (isProd && chatIdFromHeader) {
  try {
    const historyResult = await pool.query(
      `
      SELECT m.role, m.content
      FROM messages m
      INNER JOIN chats c ON m.chat_id = c.id
      WHERE m.chat_id = $1 AND c.user_id = $2
      ORDER BY m.timestamp ASC`,
        [parseInt(chatIdFromHeader, 10), userId]
      );
      dbHistory = historyResult.rows.map(msg => ({ role: msg.role as ('user' | 'assistant'), content: msg.content }));
    } catch (dbError: any) {
      console.error(`[API Chat] Error fetching history from DB for chat_id ${chatIdFromHeader}, user_id ${userId}. Proceeding with empty history. Error: ${dbError.message}`);
      // Proceed with empty history if DB fetch fails
      dbHistory = [];
    }
  }

  try {
    const neuroSwitchUrl = process.env.NEUROSWITCH_API_URL || 'http://localhost:5001/chat'; // Default local NeuroSwitch
    
    const payloadToNeuroSwitch: any = {
      message: prompt,
      history: dbHistory,
      return_token_usage: true,
      return_response_time: true,
      user_context: { user_id: userId },
      ...(image && { image_data: image }),
      ...(mode && { chat_mode: mode }),
    };

    // Headers for NeuroSwitch request
    const neuroSwitchHeaders: Record<string, string> = {
      'Authorization': `Bearer ${process.env.NEUROSWITCH_API_KEY || ''}`,
      'Content-Type': 'application/json'
    };
    if (chatIdFromHeader) {
      neuroSwitchHeaders['X-Session-ID'] = chatIdFromHeader;
    }

    // --- New BYOAPI Logic --- 
    const userSelectedModel = model?.toLowerCase();
    const providerHeaderMap: Record<string, string> = {
      'openai': 'X-OpenAI-API-Key',
      'claude': 'X-Claude-API-Key',
      'gemini': 'X-Gemini-API-Key'
    };

    if (userSelectedModel && userSelectedModel !== 'neuroswitch') {
      // Scenario 1: User selected a specific provider
      payloadToNeuroSwitch.requested_provider = userSelectedModel;
      try {
        const providerResult = await pool.query('SELECT id, name FROM providers WHERE LOWER(name) = LOWER($1)', [userSelectedModel]);
        if (providerResult.rows.length > 0) {
          const providerId = providerResult.rows[0].id;
          const dbProviderName = providerResult.rows[0].name.toLowerCase(); // Ensure lowercase for map lookup

          const externalKeyResult = await pool.query(
            'SELECT encrypted_api_key, is_active FROM user_external_api_keys WHERE user_id = $1 AND provider_id = $2',
            [userId, providerId]
          );

          if (externalKeyResult.rows.length > 0 && externalKeyResult.rows[0].is_active) {
            const encryptedKey = externalKeyResult.rows[0].encrypted_api_key;
            try {
              const decryptedKey = decrypt(encryptedKey);
              const headerName = providerHeaderMap[dbProviderName];
              if (headerName) {
                neuroSwitchHeaders[headerName] = decryptedKey;
                console.log(`[API Chat] Using user's active key for specific provider ${dbProviderName} via header ${headerName}. User ID: ${userId}`);
              } else {
                console.warn(`[API Chat] No specific header defined in map for provider: ${dbProviderName}`);
              }
            } catch (decryptionError) {
              console.error(`[API Chat] Failed to decrypt key for ${dbProviderName}. User ID: ${userId}. Error:`, decryptionError);
            }
          } else {
            console.log(`[API Chat] No active key found for specific provider ${dbProviderName}. User ID: ${userId}`);
          }
        } else {
          console.warn(`[API Chat] Provider '${userSelectedModel}' not found in DB. Cannot use BYOAPI for this request.`);
        }
      } catch (dbError) {
        console.error('[API Chat] DB error processing specific provider BYOAPI:', dbError);
      }
    } else {
      // Scenario 2: User selected NeuroSwitch (or no model specified, defaulting to NeuroSwitch)
      payloadToNeuroSwitch.requested_provider = 'neuroswitch';
      const targetProvidersForNeuroSwitch = ['openai', 'claude', 'gemini'];
      try {
        const activeKeysResult = await pool.query(
          `SELECT p.name as provider_db_name, ueak.encrypted_api_key
           FROM user_external_api_keys ueak
           JOIN providers p ON ueak.provider_id = p.id
           WHERE ueak.user_id = $1 AND LOWER(p.name) = ANY($2::text[]) AND ueak.is_active = TRUE`,
          [userId, targetProvidersForNeuroSwitch]
        );

        if (activeKeysResult.rows.length > 0) {
          console.log(`[API Chat] Found ${activeKeysResult.rows.length} active BYOAPI keys for NeuroSwitch routing. User ID: ${userId}`);
          for (const row of activeKeysResult.rows) {
            const dbProviderName = row.provider_db_name.toLowerCase();
            const encryptedKey = row.encrypted_api_key;
            try {
              const decryptedKey = decrypt(encryptedKey);
              const headerName = providerHeaderMap[dbProviderName];
              if (headerName) {
                neuroSwitchHeaders[headerName] = decryptedKey;
                console.log(`[API Chat] Adding header ${headerName} for provider ${dbProviderName} for NeuroSwitch routing. User ID: ${userId}`);
              }
            } catch (decryptionError) {
              console.error(`[API Chat] Failed to decrypt key for ${dbProviderName} (NeuroSwitch routing). User ID: ${userId}. Error:`, decryptionError);
            }
          }
        } else {
          console.log(`[API Chat] No active BYOAPI keys found for OpenAI, claude, or Gemini for NeuroSwitch routing. User ID: ${userId}`);
        }
      } catch (dbError) {
        console.error('[API Chat] DB error fetching multiple keys for NeuroSwitch BYOAPI:', dbError);
      }
    }
    // --- End New BYOAPI Logic ---
    
    // console.log('[API Chat] Sending to NeuroSwitch URL:', neuroSwitchUrl);
    // console.log('[API Chat] Payload to NeuroSwitch:', JSON.stringify(payloadToNeuroSwitch, null, 2));
    // console.log('[API Chat] Headers to NeuroSwitch:', neuroSwitchHeaders); // DO NOT log headers if they contain sensitive API keys

    const neuroRes = await axios.post<NeuroSwitchResponse>(
      neuroSwitchUrl,
      payloadToNeuroSwitch,
      { headers: neuroSwitchHeaders }
    );

    const data = neuroRes.data;
    // Log the full response for verification
    console.log('NeuroSwitch full response:', JSON.stringify(data, null, 2));

    // Extract token information for logging
    const tokenUsage = data.token_usage;
    const promptTokens = tokenUsage?.input_tokens;
    const completionTokens = tokenUsage?.output_tokens;
    const responseTime = tokenUsage?.runtime ?? data.response_time;
    const totalTokensForLog = tokenUsage?.total_tokens ?? data.tokens ?? undefined;

    // --- Cost calculation ---
    let llmProviderCost: number | null = null;
    let neuroSwitchFeeToLog: number | null = 0;
    let apiKeyIdToLog: number | null = null;
    let modelForCosting: string | undefined;

    const fusionRequestModel = req.body.model?.toLowerCase();
    const neuroSwitchActualProvider = data.provider_used;
    const neuroSwitchActualModel = data.model;
    const neuroSwitchFallbackReason = data.fallback_reason;

    if (fusionRequestModel === 'neuroswitch') {
      neuroSwitchFeeToLog = getNeuroSwitchClassifierFee();
    }

    let byoapiKeyUsedOrAttempted = false;
    if (fusionRequestModel && fusionRequestModel !== 'neuroswitch') {
        const headerName = providerHeaderMap[fusionRequestModel];
        if (headerName && neuroSwitchHeaders[headerName]) {
            byoapiKeyUsedOrAttempted = true;
        }
    } else if (fusionRequestModel === 'neuroswitch') {
        for (const key in providerHeaderMap) {
            if (neuroSwitchHeaders[providerHeaderMap[key]]) {
                byoapiKeyUsedOrAttempted = true;
                break;
            }
        }
    }
    
    if (totalTokensForLog !== undefined && neuroSwitchActualProvider) {
      if (byoapiKeyUsedOrAttempted && !neuroSwitchFallbackReason) {
        llmProviderCost = 0;
        // DETAILED LOGS FOR BYOAPI SUCCESS PATH
        console.log(`[API Chat] BYOAPI SUCCESS PATH Entered. Provider Used: ${neuroSwitchActualProvider}, Model Used: ${neuroSwitchActualModel}`);
        
        const providerForApiKeyLookup = neuroSwitchActualProvider.toLowerCase();
        console.log(`[API Chat] BYOAPI SUCCESS PATH: providerForApiKeyLookup: '${providerForApiKeyLookup}'`);
        
        const pResult = await pool.query('SELECT id, name FROM providers WHERE LOWER(name) = $1', [providerForApiKeyLookup]);
        console.log('[API Chat] BYOAPI SUCCESS PATH: pResult (providers table query results):', pResult.rows);

        if (pResult.rows.length > 0) {
            const pid = pResult.rows[0].id;
            const foundProviderName = pResult.rows[0].name;
            console.log(`[API Chat] BYOAPI SUCCESS PATH: Found provider_id (pid): ${pid} for provider '${foundProviderName}'`);
            // Restore original query
            const keyRes = await pool.query('SELECT id FROM user_external_api_keys WHERE user_id = $1 AND provider_id = $2 AND is_active = TRUE', [userId, pid]);
            console.log(`[API Chat] BYOAPI SUCCESS PATH: keyRes (user_external_api_keys table query results for userId ${userId}, pid ${pid} WITH is_active = TRUE check):`, keyRes.rows);
            
            if (keyRes.rows.length > 0) {
                apiKeyIdToLog = keyRes.rows[0].id;
                console.log(`[API Chat] BYOAPI SUCCESS PATH: apiKeyIdToLog successfully set to: ${apiKeyIdToLog}`);
            } else {
                console.log(`[API Chat] BYOAPI SUCCESS PATH: No active key found in user_external_api_keys for userId ${userId}, pid ${pid}.`);
            }
        } else {
            console.log(`[API Chat] BYOAPI SUCCESS PATH: Provider '${providerForApiKeyLookup}' not found in providers table.`);
        }
      } else {
        // Internal key was used (either direct or fallback)
        console.log(`[API Chat] INTERNAL KEY PATH Entered. byoapiKeyUsedOrAttempted: ${byoapiKeyUsedOrAttempted}, neuroSwitchFallbackReason: ${neuroSwitchFallbackReason}, Provider Used: ${neuroSwitchActualProvider}, Model Used: ${neuroSwitchActualModel}`);
        
        const providerForCosting = neuroSwitchActualProvider.toLowerCase();
        modelForCosting = neuroSwitchActualModel?.toLowerCase();

        // Set default models (id_strings) for costing if model is undefined
        if (!modelForCosting) {
          if (providerForCosting === 'gemini') {
            modelForCosting = 'google//gemini-flash-1.5';
          } else if (providerForCosting === 'claude') {
            modelForCosting = 'anthropic/claude-3.5-sonnet'; 
          } else if (providerForCosting === 'openai') {
            modelForCosting = 'openai/gpt-4.1';
          }
          console.log(`[API Chat] INTERNAL KEY PATH: neuroSwitchActualModel was undefined. Set modelForCosting to default: ${modelForCosting} for provider ${providerForCosting}`);
        }

        if (totalTokensForLog !== undefined) {
          llmProviderCost = await calculateLlmProviderCost(
            providerForCosting, 
            modelForCosting, 
            promptTokens || 0,
            completionTokens || 0
          );
          console.log(`[API Chat] Internal key used. Provider for costing: ${providerForCosting}, Model for costing: ${modelForCosting}. Calculated LLM Provider Cost: ${llmProviderCost}`);
          
          const totalCostToDeduct = (llmProviderCost || 0) + (neuroSwitchFeeToLog || 0);
          console.log(`[API Chat] Total cost to deduct (LLM + NeuroSwitch Fee): ${totalCostToDeduct}`);

          if (totalCostToDeduct > 0) { 
            await deductCreditsAndLog(userId, totalCostToDeduct, neuroSwitchActualProvider.toLowerCase(), modelForCosting || 'unknown_model', totalTokensForLog);
          }
        }
      }
    }

    // Log usage
    // Ensure neuroSwitchActualModel is used for logging if BYOAPI was successful, otherwise modelForCosting for internal.
    const modelLoggedToDb = (byoapiKeyUsedOrAttempted && !neuroSwitchFallbackReason && neuroSwitchActualModel) 
                            ? neuroSwitchActualModel 
                            : modelForCosting || neuroSwitchActualModel; // Fallback chain

    console.log(`[API Chat] FINAL LOGGING PARAMS: neuroSwitchFeeToLog: ${neuroSwitchFeeToLog}, llmProviderCost: ${llmProviderCost}, apiKeyIdToLog: ${apiKeyIdToLog}, requestModel: ${req.body.model}, modelLoggedToDb: ${modelLoggedToDb}`); 
    await logUsage(
      userId,
      neuroSwitchActualProvider,
      modelLoggedToDb || 'undefined', // Ensure we log something for the model column
      promptTokens,
      completionTokens,
      totalTokensForLog,
      responseTime,
      neuroSwitchFallbackReason,
      llmProviderCost,
      apiKeyIdToLog,
      req.body.model,
      neuroSwitchFeeToLog
    );

    res.json({
      prompt,
      response: { text: data.response },
      model: neuroSwitchActualModel || neuroSwitchActualProvider,
      tokens: data.token_usage || { total_tokens: data.tokens },
      cost: llmProviderCost,
      neuroswitch_fee: neuroSwitchFeeToLog,
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    console.error('[API Chat] NeuroSwitch or internal error:', err.message);

    if (err.response) {
      return res.status(err.response.status).json({
        error: 'AI service error',
        details: err.response.data
      });
    } else if (err.request) {
      return res.status(503).json({
        error: 'AI service unavailable',
        details: 'The AI service is currently not responding'
      });
    } else {
      return res.status(500).json({
        error: 'Internal server error',
        details: err.message
      });
    }
  }
});

export default router;
