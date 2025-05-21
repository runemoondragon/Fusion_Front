// Cost calculation utility for usage-based billing

// Simple pricing map (per 1K tokens, in USD)
const PRICING: Record<string, number> = {
  openai: 0.002,
  claude: 0.0025,
  gemini: 0.0018,
  mistral: 0.0015,
  // Add more as needed
};
const PREMIUM_RATE = 0.2; // 20%

export function calculateCost(provider: string, totalTokens: number): number {
  const pricePer1K = PRICING[provider.toLowerCase()] ?? 0.002; // Default to OpenAI price if unknown
  let cost = ((totalTokens / 1000) * pricePer1K) * (1 + PREMIUM_RATE);
  cost = Math.round(cost * 10000) / 10000; // Round to 4 decimals
  return cost;
} 