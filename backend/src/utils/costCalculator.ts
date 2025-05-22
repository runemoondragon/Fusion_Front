// Cost calculation utility for usage-based billing

// Detailed pricing map (per 1K tokens, in USD)
// These are representative prices and should be verified and updated regularly.
const PRICING: Record<string, Record<string, { input: number; output: number }>> = {
  openai: {
    "gpt-4-turbo": { input: 0.01, output: 0.03 },
    "gpt-4": { input: 0.03, output: 0.06 },
    "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 }, // Common model like gpt-3.5-turbo-0125
    // Add other OpenAI models as needed
  },
  anthropic: {
    "claude-3-opus": { input: 0.015, output: 0.075 },
    "claude-3.5-sonnet": { input: 0.003, output: 0.015 },
    "claude-3-haiku": { input: 0.00025, output: 0.00125 },
    // Add other Anthropic models as needed
  },
  google: { // Changed from 'gemini' to 'google' for provider name consistency
    "gemini-1.5-pro": { input: 0.007, output: 0.021 }, // Rates can vary by context window
    "gemini-1.0-pro": { input: 0.000125, output: 0.000375 },
    // Add other Google models as needed
  },
  // Add other providers like Mistral etc. as needed
};

const DEFAULT_FALLBACK_RATE = { input: 0.002, output: 0.002 }; // A generic fallback if provider/model unknown
const NEUROSWITCH_CLASSIFIER_FEE_PER_USE = 0.0001;

/**
 * Calculates the cost for LLM provider usage based on input and output tokens.
 * @param provider The LLM provider (e.g., "openai", "anthropic").
 * @param model The specific model used (e.g., "gpt-4-turbo", "claude-3-opus").
 * @param inputTokens Number of input tokens.
 * @param outputTokens Number of output tokens.
 * @returns The calculated cost, rounded to 6 decimal places, or 0 if pricing is not found.
 */
export function calculateLlmProviderCost(
  provider: string,
  model: string | undefined,
  inputTokens: number,
  outputTokens: number
): number {
  if (!model) {
    console.warn(`[costCalculator] Model undefined for provider ${provider}. Returning 0 cost.`);
    return 0;
  }

  const lowerProvider = provider.toLowerCase();
  const lowerModel = model.toLowerCase();

  const providerPricing = PRICING[lowerProvider];
  if (!providerPricing) {
    console.warn(`[costCalculator] Pricing not found for provider: ${lowerProvider}. Using default fallback rate.`);
    // Fallback for unknown provider (could use a very generic rate or 0)
    const cost = ( (inputTokens / 1000) * DEFAULT_FALLBACK_RATE.input ) + ( (outputTokens / 1000) * DEFAULT_FALLBACK_RATE.output );
    return parseFloat(cost.toFixed(6)); // Round to 6 decimal places
  }

  const modelRates = providerPricing[lowerModel] || providerPricing[model]; // Try lowercase then original, or just expect normalized keys
  if (!modelRates) {
    console.warn(`[costCalculator] Pricing not found for model: ${lowerModel} (provider: ${lowerProvider}). Using default fallback rate for provider.`);
    // Fallback for unknown model within a known provider (could use a default for that provider or 0)
    // For simplicity, using the general default fallback here, but could be more specific
    const cost = ( (inputTokens / 1000) * DEFAULT_FALLBACK_RATE.input ) + ( (outputTokens / 1000) * DEFAULT_FALLBACK_RATE.output );
    return parseFloat(cost.toFixed(6));
  }

  const cost = ( (inputTokens / 1000) * modelRates.input ) + ( (outputTokens / 1000) * modelRates.output );
  return parseFloat(cost.toFixed(6)); // Round to 6 decimal places for precision
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