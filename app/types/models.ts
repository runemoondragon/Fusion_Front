export interface Model {
  id: number;
  name: string;
  id_string: string;
  provider: string;
  input_cost_per_million_tokens: number | string;
  output_cost_per_million_tokens: number | string;
  context_length_tokens: number;
  supports_json_mode: boolean;
  supports_tool_use: boolean;
  supports_vision: boolean;
  description?: string;
  release_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModelFilters {
  providers: string[];
  features: string[];
  contextRange?: [number, number]; // [min, max] tokens
  priceRange?: [number, number];   // [min, max] dollars
  showActiveOnly: boolean;
  modalities?: string[];
  series?: string[];
  categories?: string[];
  parameters?: string[];
} 