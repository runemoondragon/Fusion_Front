// Cost calculation utility for usage-based billing

import pool from '../db'; // Import the database pool

// const PRICING: Record<string, Record<string, { input: number; output: number }>> = { ... }; // This should be removed

const DEFAULT_FALLBACK_RATE = { input: 0.002, output: 0.002 }; // Per 1K tokens
const NEUROSWITCH_CLASSIFIER_FEE_PER_USE = 0.0001;

/**
 * Calculates the cost for LLM provider usage based on input and output tokens,
 * fetching rates from the 'models' database table.
 * @param neuroSwitchProvider The provider string from NeuroSwitch (e.g., "openai", "claude", "gemini").
 * @param modelIdString The specific model id_string (e.g., "openai/gpt-4o-mini", "anthropic/claude-3-sonnet").
 * @param inputTokens Number of input tokens.
 * @param outputTokens Number of output tokens.
 * @returns The calculated cost, rounded to 6 decimal places, or cost based on fallback rate if not found.
 */
export async function calculateLlmProviderCost(
  neuroSwitchProvider: string,
  modelIdString: string | undefined,
  inputTokens: number,
  outputTokens: number
): Promise<number> {
  if (!modelIdString) {
    console.warn(`[costCalculator] Model ID string is undefined for provider ${neuroSwitchProvider}. Using default fallback rate.`);
    const cost = ( (inputTokens / 1000) * DEFAULT_FALLBACK_RATE.input ) + ( (outputTokens / 1000) * DEFAULT_FALLBACK_RATE.output );
    return parseFloat(cost.toFixed(6));
  }

  let dbProvider = neuroSwitchProvider.toLowerCase();
  if (dbProvider === 'gemini') {
    dbProvider = 'google';
  } else if (dbProvider === 'claude') {
    dbProvider = 'anthropic';
  }
  // 'openai' already matches

  try {
    const result = await pool.query(
      'SELECT input_cost_per_million_tokens, output_cost_per_million_tokens FROM models WHERE LOWER(provider) = LOWER($1) AND LOWER(id_string) = LOWER($2)',
      [dbProvider, modelIdString.toLowerCase()]
    );

    if (result.rows.length > 0) {
      const dbRow = result.rows[0];
      const inputRatePer1k = parseFloat(dbRow.input_cost_per_million_tokens) / 1000;
      const outputRatePer1k = parseFloat(dbRow.output_cost_per_million_tokens) / 1000;
      
      if (isNaN(inputRatePer1k) || isNaN(outputRatePer1k)) {
        console.warn(`[costCalculator] Invalid rates in DB for ${dbProvider}/${modelIdString}. input: ${dbRow.input_cost_per_million_tokens}, output: ${dbRow.output_cost_per_million_tokens}. Using fallback.`);
        const fallbackCost = ( (inputTokens / 1000) * DEFAULT_FALLBACK_RATE.input ) + ( (outputTokens / 1000) * DEFAULT_FALLBACK_RATE.output );
        return parseFloat(fallbackCost.toFixed(6));
      }

      const cost = ( (inputTokens / 1000) * inputRatePer1k ) + ( (outputTokens / 1000) * outputRatePer1k );
      return parseFloat(cost.toFixed(6));
    } else {
      console.warn(`[costCalculator] Pricing not found in DB for provider: ${dbProvider}, model: ${modelIdString}. Using default fallback rate.`);
      const fallbackCost = ( (inputTokens / 1000) * DEFAULT_FALLBACK_RATE.input ) + ( (outputTokens / 1000) * DEFAULT_FALLBACK_RATE.output );
      return parseFloat(fallbackCost.toFixed(6));
    }
  } catch (error) {
    console.error(`[costCalculator] DB error fetching pricing for ${dbProvider}/${modelIdString}:`, error);
    console.warn(`[costCalculator] Using default fallback rate due to DB error.`);
    const fallbackCost = ( (inputTokens / 1000) * DEFAULT_FALLBACK_RATE.input ) + ( (outputTokens / 1000) * DEFAULT_FALLBACK_RATE.output );
    return parseFloat(fallbackCost.toFixed(6));
  }
}

/**
 * Returns the flat fee for using the NeuroSwitch classifier.
 * @returns The NeuroSwitch classifier fee.
 */
export function getNeuroSwitchClassifierFee(): number {
  return NEUROSWITCH_CLASSIFIER_FEE_PER_USE;
}

// Old calculateCost function (to be removed or commented out)
/*
const PRICING_OLD: Record<string, number> = {
  openai: 0.002,
  claude: 0.0025,
  gemini: 0.0018,
  mistral: 0.0015,
};
const PREMIUM_RATE = 0.2; // 20%

export function calculateCost(provider: string, totalTokens: number): number {
  const pricePer1K = PRICING_OLD[provider.toLowerCase()] ?? 0.002; // Default to OpenAI price if unknown
  let cost = ((totalTokens / 1000) * pricePer1K) * (1 + PREMIUM_RATE);
  cost = Math.round(cost * 10000) / 10000; // Round to 4 decimals
  return cost;
}
*/ 