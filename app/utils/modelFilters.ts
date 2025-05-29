import { Model, ModelFilters } from '../types/models';

export const filterModels = (models: Model[], filters: ModelFilters): Model[] => {
  return models.filter(model => {
    // Provider filter
    if (filters.providers.length > 0 && !filters.providers.includes(model.provider)) {
      return false;
    }

    // Features filter
    if (filters.features.length > 0) {
      const modelFeatures = [
        model.supports_json_mode && 'JSON',
        model.supports_tool_use && 'Tools',
        model.supports_vision && 'Vision'
      ].filter(Boolean) as string[];
      
      if (!filters.features.every(feature => modelFeatures.includes(feature))) {
        return false;
      }
    }

    // Context length filter
    if (filters.contextRange) {
      const [minContext, maxContext] = filters.contextRange;
      if (model.context_length_tokens < minContext || model.context_length_tokens > maxContext) {
        return false;
      }
    }

    // Price filter
    if (filters.priceRange) {
      const [minPrice, maxPrice] = filters.priceRange;
      const inputCost = typeof model.input_cost_per_million_tokens === 'string' 
        ? parseFloat(model.input_cost_per_million_tokens) 
        : model.input_cost_per_million_tokens;
      const outputCost = typeof model.output_cost_per_million_tokens === 'string'
        ? parseFloat(model.output_cost_per_million_tokens)
        : model.output_cost_per_million_tokens;
      
      if (inputCost > maxPrice || outputCost > maxPrice) {
        return false;
      }
    }

    // Modalities filter (if implemented in backend)
    if (filters.modalities && filters.modalities.length > 0) {
      // This will need to be implemented once backend supports modalities
      return true;
    }

    // Series filter (if implemented in backend)
    if (filters.series && filters.series.length > 0) {
      // This will need to be implemented once backend supports series
      return true;
    }

    // Categories filter (if implemented in backend)
    if (filters.categories && filters.categories.length > 0) {
      // This will need to be implemented once backend supports categories
      return true;
    }

    // Parameters filter (if implemented in backend)
    if (filters.parameters && filters.parameters.length > 0) {
      // This will need to be implemented once backend supports parameters
      return true;
    }

    return true;
  });
}; 