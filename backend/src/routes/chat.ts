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
  model_used?: string;
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
  const { prompt, provider, model: modelFromRequest, image, mode } = req.body;
  console.log('[API Chat] Received request on /api/chat. Provider:', provider, 'Model:', modelFromRequest, 'Prompt:', prompt ? 'Exists' : 'Missing');
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

    // Define the mapping from provider name (lowercase) to HTTP header name for BYOAPI keys
    const providerHeaderMap: Record<string, string> = {
      'openai': 'X-OpenAI-API-Key',
      'claude': 'X-Claude-API-Key',
      'gemini': 'X-Gemini-API-Key'
      // Add other providers here if they have specific headers for API keys
    };

    // Determine requested_provider and model for NeuroSwitch payload
    if (provider && provider.toLowerCase() === 'neuroswitch') {
      payloadToNeuroSwitch.requested_provider = 'neuroswitch';
      // modelFromRequest should be undefined in this case as per frontend logic
      // If modelFromRequest was present, NeuroSwitch would need to handle it or ignore it.
      // For now, we assume frontend sends provider: 'neuroswitch' and no model field.
    } else if (provider) { // A specific provider (e.g., openai, claude, gemini) was sent
      payloadToNeuroSwitch.requested_provider = provider.toLowerCase();
      if (modelFromRequest) { // A specific model under that provider was also specified
        payloadToNeuroSwitch.model = modelFromRequest;
      } else {
        // If only provider is sent (e.g. provider: 'openai', no model), 
        // NeuroSwitch will use the default for that provider.
        // No specific payloadToNeuroSwitch.model is set here.
      }
    } else {
      // Fallback: If neither 'neuroswitch' nor any other provider is specified by the frontend.
      // This case should ideally not be hit if the frontend always sends a provider.
      console.warn('[API Chat] No provider specified by frontend. Defaulting to NeuroSwitch. Request body:', req.body);
      payloadToNeuroSwitch.requested_provider = 'neuroswitch';
    }

    // --- BYOAPI Logic Adjustment ---
    // This logic adds BYOAPI keys to neuroSwitchHeaders if applicable
    const targetProviderForBYOAPI = payloadToNeuroSwitch.requested_provider?.toLowerCase();

    if (targetProviderForBYOAPI && targetProviderForBYOAPI !== 'neuroswitch') {
      // Scenario 1: A specific provider is targeted (e.g., openai, claude, gemini)
      console.log(`[API Chat] BYOAPI Check: Targeting specific provider: ${targetProviderForBYOAPI}. User ID: ${userId}`);
      try {
        // Fetch the provider ID from the database based on the name
        const providerDbResult = await pool.query('SELECT id, name FROM providers WHERE LOWER(name) = LOWER($1)', [targetProviderForBYOAPI]);
        if (providerDbResult.rows.length > 0) {
          const providerId = providerDbResult.rows[0].id;
          const dbProviderName = providerDbResult.rows[0].name.toLowerCase(); // Use normalized name for map lookup

          // Fetch the user's external API key for this provider
          const externalKeyResult = await pool.query(
            'SELECT encrypted_api_key, is_active FROM user_external_api_keys WHERE user_id = $1 AND provider_id = $2',
            [userId, providerId]
          );

          if (externalKeyResult.rows.length > 0 && externalKeyResult.rows[0].is_active) {
            const encryptedKey = externalKeyResult.rows[0].encrypted_api_key;
            try {
              const decryptedKey = decrypt(encryptedKey);
              const headerName = providerHeaderMap[dbProviderName]; // providerHeaderMap should be defined earlier
              if (headerName) {
                neuroSwitchHeaders[headerName] = decryptedKey;
                console.log(`[API Chat] BYOAPI Success: Using user's active key for ${dbProviderName} via header ${headerName}. User ID: ${userId}`);
              } else {
                console.warn(`[API Chat] BYOAPI Skip: No specific header defined in providerHeaderMap for provider: ${dbProviderName}`);
              }
            } catch (decryptionError) {
              console.error(`[API Chat] BYOAPI Error: Failed to decrypt key for ${dbProviderName}. User ID: ${userId}. Error:`, decryptionError);
            }
          } else {
            console.log(`[API Chat] BYOAPI Skip: No active key found for specific provider ${dbProviderName}. User ID: ${userId}`);
          }
        } else {
          console.warn(`[API Chat] BYOAPI Skip: Provider '${targetProviderForBYOAPI}' not found in DB providers table. Cannot use BYOAPI for this request.`);
        }
      } catch (dbError) {
        console.error('[API Chat] BYOAPI Error: DB error processing specific provider BYOAPI:', dbError);
      }
    } else if (targetProviderForBYOAPI === 'neuroswitch') {
      // Scenario 2: NeuroSwitch is the target, attempt to add all relevant BYOAPI keys
      console.log(`[API Chat] BYOAPI Check: NeuroSwitch targeted. Fetching all relevant active keys for user ${userId}.`);
      const targetProvidersForNeuroSwitchRouting = ['openai', 'claude', 'gemini']; // Providers NeuroSwitch might route to
      try {
        const activeKeysResult = await pool.query(
          `SELECT p.name as provider_db_name, ueak.encrypted_api_key
           FROM user_external_api_keys ueak
           JOIN providers p ON ueak.provider_id = p.id
           WHERE ueak.user_id = $1 AND LOWER(p.name) = ANY($2::text[]) AND ueak.is_active = TRUE`,
          [userId, targetProvidersForNeuroSwitchRouting]
        );

        if (activeKeysResult.rows.length > 0) {
          console.log(`[API Chat] BYOAPI Info: Found ${activeKeysResult.rows.length} active BYOAPI keys for potential NeuroSwitch routing. User ID: ${userId}`);
          for (const row of activeKeysResult.rows) {
            const dbProviderName = row.provider_db_name.toLowerCase();
            const encryptedKey = row.encrypted_api_key;
            try {
              const decryptedKey = decrypt(encryptedKey);
              const headerName = providerHeaderMap[dbProviderName]; // providerHeaderMap should be defined earlier
              if (headerName) {
                neuroSwitchHeaders[headerName] = decryptedKey;
                console.log(`[API Chat] BYOAPI Info: Adding header ${headerName} for provider ${dbProviderName} for NeuroSwitch routing. User ID: ${userId}`);
              }
            } catch (decryptionError) {
              console.error(`[API Chat] BYOAPI Error: Failed to decrypt key for ${dbProviderName} (NeuroSwitch routing). User ID: ${userId}. Error:`, decryptionError);
            }
          }
        } else {
          console.log(`[API Chat] BYOAPI Info: No active BYOAPI keys found for OpenAI, Claude, or Gemini for NeuroSwitch routing. User ID: ${userId}`);
        }
      } catch (dbError) {
        console.error('[API Chat] BYOAPI Error: DB error fetching multiple keys for NeuroSwitch BYOAPI:', dbError);
      }
    }
    // --- End BYOAPI Logic Adjustment ---
    
    console.log('[API Chat] Sending to NeuroSwitch URL:', neuroSwitchUrl);
    console.log('[API Chat] Payload to NeuroSwitch:', JSON.stringify(payloadToNeuroSwitch, null, 2));
    // console.log('[API Chat] Headers to NeuroSwitch:', neuroSwitchHeaders); // DO NOT log sensitive headers in prod

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

    const neuroSwitchActualProvider = data.provider_used;
    const neuroSwitchActualModel = data.model_used;
    const neuroSwitchFallbackReason = data.fallback_reason;

    // Determine NeuroSwitch classifier fee if "neuroswitch" was the initial provider selected by the user
    if (provider && provider.toLowerCase() === 'neuroswitch') { // 'provider' is from req.body
      neuroSwitchFeeToLog = getNeuroSwitchClassifierFee();
    }

    // Check if a BYOAPI key was successfully used or if it's an internal transaction/fallback
    if (totalTokensForLog !== undefined && neuroSwitchActualProvider && neuroSwitchActualProvider.toLowerCase() !== 'neuroswitch') {
      // Only proceed if NeuroSwitch reports using a specific LLM provider (not 'neuroswitch' itself as the provider_used)
      
      const providerNameFromNeuroSwitch = neuroSwitchActualProvider.toLowerCase(); // Use this directly for querying 'providers' table
      
      // Query Fusion's 'providers' table using the direct name from NeuroSwitch (e.g., "gemini", "claude")
      const providerDbResult = await pool.query('SELECT id FROM providers WHERE LOWER(name) = $1', [providerNameFromNeuroSwitch]);

      let userApiKeyIdForActualProvider: number | null = null;
      if (providerDbResult.rows.length > 0) {
        const providerIdFromDb = providerDbResult.rows[0].id;
        // Check if the user has an active key for this specific provider_id
        const keyRes = await pool.query(
          'SELECT id FROM user_external_api_keys WHERE user_id = $1 AND provider_id = $2 AND is_active = TRUE',
          [userId, providerIdFromDb]
        );
        if (keyRes.rows.length > 0) {
          userApiKeyIdForActualProvider = keyRes.rows[0].id; // User has an active key for the provider NeuroSwitch used
          console.log(`[API Chat] User has active key ID ${userApiKeyIdForActualProvider} for provider ${providerNameFromNeuroSwitch}.`);
        } else {
          console.log(`[API Chat] User does NOT have an active key for provider ${providerNameFromNeuroSwitch}.`);
        }
      } else {
        console.warn(`[API Chat] Provider ${providerNameFromNeuroSwitch} (from NeuroSwitch) not found in Fusion's providers table.`);
      }

      // Scenario 1: Successful BYOAPI transaction
      // Conditions: User has an active key for the provider NeuroSwitch used, AND NeuroSwitch didn't report a fallback.
      if (userApiKeyIdForActualProvider && !neuroSwitchFallbackReason) {
        llmProviderCost = 0; // LLM cost is $0 for the user
        apiKeyIdToLog = userApiKeyIdForActualProvider; // Log the user's specific API key ID
        console.log(`[API Chat] BYOAPI SUCCESS: Provider: ${neuroSwitchActualProvider}, Model: ${neuroSwitchActualModel}. LLM Cost: 0. API Key ID: ${apiKeyIdToLog}.`);
      } else {
        // Scenario 2: Internal Key used OR NeuroSwitch Fallback occurred
        console.log(`[API Chat] INTERNAL/FALLBACK: Provider: ${neuroSwitchActualProvider}, Model: ${neuroSwitchActualModel}. Fallback: ${neuroSwitchFallbackReason}. UserKeyFound: ${userApiKeyIdForActualProvider !== null}.`);
        
        const providerForCosting = neuroSwitchActualProvider.toLowerCase(); // Provider reported by NeuroSwitch
        modelForCosting = neuroSwitchActualModel?.toLowerCase(); // Specific model reported by NeuroSwitch

        if (!modelForCosting && providerForCosting) {
          // Assign a default model id_string for accurate costing with internal keys if NeuroSwitch didn't specify one.
          // Note: calculateLlmProviderCost performs its own internal mapping (e.g. gemini->google) if needed.
          if (providerForCosting === 'gemini') { modelForCosting = 'gemini-1.5-flash-latest'; }
          else if (providerForCosting === 'claude') { modelForCosting = 'claude-3-haiku-20240307'; }
          else if (providerForCosting === 'openai') { modelForCosting = 'gpt-4o-mini'; }
          console.log(`[API Chat] INTERNAL/FALLBACK: Model for costing (defaulted): ${modelForCosting} for provider ${providerForCosting}`);
        }

        if (modelForCosting) { // Ensure modelForCosting is defined before trying to calculate cost
          llmProviderCost = await calculateLlmProviderCost(
            providerForCosting, // Pass the direct provider name (e.g. "gemini", "claude")
            modelForCosting,
            promptTokens || 0,
            completionTokens || 0
          );
          console.log(`[API Chat] INTERNAL/FALLBACK: Cost: ${llmProviderCost}.`);
        } else {
          console.warn(`[API Chat] INTERNAL/FALLBACK: Cost calculation skipped. modelForCosting is undefined.`);
          llmProviderCost = null; // Cost cannot be determined
        }
        // apiKeyIdToLog remains null for internal/fallback path
      }
    } else if (totalTokensForLog !== undefined && neuroSwitchActualProvider && neuroSwitchActualProvider.toLowerCase() === 'neuroswitch') {
        console.log(`[API Chat] NeuroSwitch reported as actual provider. LLM cost assumed 0. NeuroSwitch Fee: ${neuroSwitchFeeToLog}`);
        llmProviderCost = 0; 
    } else {
      console.warn(`[API Chat] Cost calculation skipped: totalTokensForLog is ${totalTokensForLog}, neuroSwitchActualProvider is ${neuroSwitchActualProvider}.`);
      llmProviderCost = null;
    }

    const totalCostToDeduct = (llmProviderCost || 0) + (neuroSwitchFeeToLog || 0);
    if (totalCostToDeduct > 0) {
      console.log(`[API Chat] Total cost to deduct: ${totalCostToDeduct}`);
      await deductCreditsAndLog(userId, totalCostToDeduct, neuroSwitchActualProvider || 'unknown_provider', modelForCosting || neuroSwitchActualModel || 'unknown_model', totalTokensForLog || 0);
    }

    // Determine the model string to log in the database
    // If BYOAPI was successful (apiKeyIdToLog is set), use the actual model NeuroSwitch reported.
    // Otherwise, use the model determined for costing (if any), or fallback to NeuroSwitch's actual model.
    const modelLoggedToDb = (apiKeyIdToLog && neuroSwitchActualModel) 
                            ? neuroSwitchActualModel 
                            : modelForCosting || neuroSwitchActualModel;

    console.log(`[API Chat] FINAL LOGGING PARAMS: neuroSwitchFeeToLog: ${neuroSwitchFeeToLog}, llmProviderCost: ${llmProviderCost}, apiKeyIdToLog: ${apiKeyIdToLog}, requestModel(from frontend): ${req.body.model}, modelLoggedToDb: ${modelLoggedToDb}`);

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
      provider: neuroSwitchActualProvider,
      model: neuroSwitchActualModel,
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
