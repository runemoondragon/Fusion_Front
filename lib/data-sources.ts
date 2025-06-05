import { ModelRanking, LLMStatsModel, OpenRouterModel, ArtificialAnalysisModel } from '@/types/rankings';

// Cache configuration
const CACHE_TTL = {
  LLM_STATS: 24 * 60 * 60 * 1000, // 24 hours
  OPENROUTER: 6 * 60 * 60 * 1000, // 6 hours  
  ARTIFICIAL_ANALYSIS: 12 * 60 * 60 * 1000, // 12 hours
};

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = new DataCache();

// LLM-Stats data source
export async function fetchLLMStatsData(): Promise<LLMStatsModel[]> {
  const cacheKey = 'llm-stats-latest';
  const cached = cache.get<LLMStatsModel[]>(cacheKey);
  
  if (cached) {
    console.log('Using cached LLM-Stats data');
    return cached;
  }

  try {
    console.log('Fetching fresh LLM-Stats data...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch('https://llm-stats.org/latest.json', {
      headers: {
        'User-Agent': 'Fusion-AI-Rankings/1.0',
      },
      signal: controller.signal,
      next: { revalidate: 86400 }, // 24 hours
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`LLM-Stats API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform LLM-Stats format to our internal format
    const models: LLMStatsModel[] = Object.entries(data.models || {}).map(([name, modelData]: [string, any]) => ({
      name,
      provider: modelData.provider || 'Unknown',
      pricing: {
        prompt: modelData.pricing?.prompt || 0,
        completion: modelData.pricing?.completion || 0,
      },
      benchmarks: modelData.benchmarks || {},
      context_length: modelData.context_length || 0,
      release_date: modelData.release_date,
    }));

    cache.set(cacheKey, models, CACHE_TTL.LLM_STATS);
    return models;
  } catch (error) {
    console.error('Failed to fetch LLM-Stats data:', error);
    // Return empty array instead of throwing - let the aggregator handle fallbacks
    return [];
  }
}

// OpenRouter data source
export async function fetchOpenRouterData(): Promise<OpenRouterModel[]> {
  const cacheKey = 'openrouter-models';
  const cached = cache.get<OpenRouterModel[]>(cacheKey);
  
  if (cached) {
    console.log('Using cached OpenRouter data');
    return cached;
  }

  try {
    console.log('Fetching fresh OpenRouter data...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'User-Agent': 'Fusion-AI-Rankings/1.0',
      },
      signal: controller.signal,
      next: { revalidate: 21600 }, // 6 hours
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const result = await response.json();
    const models = result.data || [];

    cache.set(cacheKey, models, CACHE_TTL.OPENROUTER);
    return models;
  } catch (error) {
    console.error('Failed to fetch OpenRouter data:', error);
    return [];
  }
}

// ArtificialAnalysis data source (GraphQL)
export async function fetchArtificialAnalysisData(): Promise<ArtificialAnalysisModel[]> {
  const cacheKey = 'artificial-analysis-models';
  const cached = cache.get<ArtificialAnalysisModel[]>(cacheKey);
  
  if (cached) {
    console.log('Using cached ArtificialAnalysis data');
    return cached;
  }

  try {
    console.log('Fetching fresh ArtificialAnalysis data...');
    
    const query = `
      query GetModels {
        models {
          model
          provider
          benchmarks {
            mmlu
            gsm8k
            hellaswag
            arc_challenge
            truthfulqa
            big_bench
          }
          performance {
            latency_p50
            latency_p95
            throughput
          }
        }
      }
    `;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch('https://api.artificialanalysis.ai/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Fusion-AI-Rankings/1.0',
        // Add API key from environment if required
        ...(process.env.ARTIFICIAL_ANALYSIS_API_KEY && {
          'Authorization': `Bearer ${process.env.ARTIFICIAL_ANALYSIS_API_KEY}`
        }),
      },
      signal: controller.signal,
      body: JSON.stringify({ query }),
      next: { revalidate: 43200 }, // 12 hours
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`ArtificialAnalysis API error: ${response.status}`);
    }

    const result = await response.json();
    const models = result.data?.models || [];

    cache.set(cacheKey, models, CACHE_TTL.ARTIFICIAL_ANALYSIS);
    return models;
  } catch (error) {
    console.error('Failed to fetch ArtificialAnalysis data:', error);
    // Don't throw here - this is optional data
    return [];
  }
}

// Composite data aggregation
export async function aggregateModelData(): Promise<ModelRanking[]> {
  const startTime = Date.now();
  console.log('Starting model data aggregation...');

  try {
    // Fetch data from all sources in parallel
    const [llmStatsData, openRouterData, artificialAnalysisData] = await Promise.allSettled([
      fetchLLMStatsData(),
      fetchOpenRouterData(), 
      fetchArtificialAnalysisData(),
    ]);

    const llmStats = llmStatsData.status === 'fulfilled' ? llmStatsData.value : [];
    const openRouter = openRouterData.status === 'fulfilled' ? openRouterData.value : [];
    const artificialAnalysis = artificialAnalysisData.status === 'fulfilled' ? artificialAnalysisData.value : [];

    console.log(`Data fetched: ${llmStats.length} LLM-Stats, ${openRouter.length} OpenRouter, ${artificialAnalysis.length} ArtificialAnalysis`);

    // Create lookup maps for efficient matching
    const openRouterMap = new Map(openRouter.map(m => [m.name.toLowerCase(), m]));
    const artificialAnalysisMap = new Map(artificialAnalysis.map(m => [m.model.toLowerCase(), m]));
    const llmStatsMap = new Map(llmStats.map(m => [m.name.toLowerCase(), m]));

    // Fusion AI featured models
    const featuredModels = new Set([
      'claude-3-5-sonnet',
      'gpt-4o', 
      'gemini-pro',
      'llama-3.1-70b',
      'claude-3-haiku',
    ]);

    const models: ModelRanking[] = [];
    const processedModels = new Set<string>();

    // Helper function to create a ModelRanking from available data
    const createModelRanking = (
      name: string,
      provider: string,
      llmStatsModel?: LLMStatsModel,
      openRouterModel?: OpenRouterModel,
      artificialAnalysisModel?: ArtificialAnalysisModel
    ): ModelRanking => {
      const modelKey = name.toLowerCase();

      // Combine benchmarks from all sources
      const benchmarks = {
        ...(llmStatsModel?.benchmarks || {}),
        ...(artificialAnalysisModel?.benchmarks || {}),
      };

      // Calculate composite score (weighted average of benchmarks)
      const benchmarkWeights = {
        mmlu: 0.25,
        gsm8k: 0.20,
        hellaswag: 0.15,
        arc_challenge: 0.15,
        truthfulqa: 0.15,
        big_bench: 0.10,
      };

      let composite_score = 0;
      let totalWeight = 0;

      Object.entries(benchmarkWeights).forEach(([benchmark, weight]) => {
        if (benchmarks[benchmark] !== undefined && benchmarks[benchmark] !== null) {
          composite_score += benchmarks[benchmark] * weight;
          totalWeight += weight;
        }
      });

      composite_score = totalWeight > 0 ? composite_score / totalWeight : 0;

      // Use OpenRouter pricing if available, otherwise LLM-Stats
      const pricing = openRouterModel ? {
        prompt_cost: parseFloat(openRouterModel.pricing.prompt) * 1000000, // Convert to per 1M tokens
        completion_cost: parseFloat(openRouterModel.pricing.completion) * 1000000,
        currency: 'USD',
      } : llmStatsModel ? {
        prompt_cost: llmStatsModel.pricing.prompt,
        completion_cost: llmStatsModel.pricing.completion,
        currency: 'USD',
      } : {
        prompt_cost: 0,
        completion_cost: 0,
        currency: 'USD',
      };

      return {
        id: `${provider}-${name}`.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        name,
        provider,
        composite_score,
        composite_rank: 0, // Will be calculated after sorting
        pricing,
        benchmarks,
        metadata: {
          context_length: openRouterModel?.context_length || llmStatsModel?.context_length || 0,
          release_date: llmStatsModel?.release_date,
          modality: openRouterModel?.architecture?.modality === 'multimodal' ? 'multimodal' : 'text',
          availability: 'active', // Default, can be overridden
          featured: featuredModels.has(modelKey),
          architecture: openRouterModel?.architecture?.tokenizer,
        },
        performance: artificialAnalysisModel?.performance,
        sources: {
          llm_stats: !!llmStatsModel,
          openrouter: !!openRouterModel,
          artificial_analysis: !!artificialAnalysisModel,
        },
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
    };

    // Process LLM-Stats models first (primary source when available)
    llmStats.forEach(model => {
      const modelKey = model.name.toLowerCase();
      const openRouterModel = openRouterMap.get(modelKey);
      const artificialAnalysisModel = artificialAnalysisMap.get(modelKey);

      models.push(createModelRanking(
        model.name,
        model.provider,
        model,
        openRouterModel,
        artificialAnalysisModel
      ));
      
      processedModels.add(modelKey);
    });

    // If LLM-Stats is empty/failed, use OpenRouter as primary source
    if (llmStats.length === 0 && openRouter.length > 0) {
      console.log('LLM-Stats unavailable, using OpenRouter as primary source');
      
      openRouter.forEach(model => {
        const modelKey = model.name.toLowerCase();
        if (!processedModels.has(modelKey)) {
          const artificialAnalysisModel = artificialAnalysisMap.get(modelKey);
          
          // Extract provider from OpenRouter model ID or use a default
          const provider = model.id.split('/')[0] || 'Unknown';

          models.push(createModelRanking(
            model.name,
            provider,
            undefined,
            model,
            artificialAnalysisModel
          ));
          
          processedModels.add(modelKey);
        }
      });
    }

    // Add any remaining models from ArtificialAnalysis that weren't processed
    artificialAnalysis.forEach(model => {
      const modelKey = model.model.toLowerCase();
      if (!processedModels.has(modelKey)) {
        models.push(createModelRanking(
          model.model,
          model.provider,
          undefined,
          openRouterMap.get(modelKey),
          model
        ));
        
        processedModels.add(modelKey);
      }
    });

    // Sort by composite score and assign ranks
    models.sort((a, b) => b.composite_score - a.composite_score);
    models.forEach((model, index) => {
      model.composite_rank = index + 1;
    });

    const elapsed = Date.now() - startTime;
    console.log(`Model data aggregation completed in ${elapsed}ms. Total models: ${models.length}`);

    return models;
  } catch (error) {
    console.error('Failed to aggregate model data:', error);
    throw error;
  }
}

// Manual refresh function for admin use
export async function refreshModelData(force = false): Promise<void> {
  if (force) {
    cache.clear();
  }
  
  await aggregateModelData();
}

// Get data source status
export function getDataSourceStatus() {
  const llmStatsCache = cache.get('llm-stats-latest');
  const openRouterCache = cache.get('openrouter-models');
  const artificialAnalysisCache = cache.get('artificial-analysis-models');

  return {
    llm_stats: {
      status: llmStatsCache ? 'ok' : 'stale',
      last_sync: llmStatsCache ? new Date().toISOString() : null,
    },
    openrouter: {
      status: openRouterCache ? 'ok' : 'stale', 
      last_sync: openRouterCache ? new Date().toISOString() : null,
    },
    artificial_analysis: {
      status: artificialAnalysisCache ? 'ok' : 'stale',
      last_sync: artificialAnalysisCache ? new Date().toISOString() : null,
    },
  };
} 