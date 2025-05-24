import React from 'react';
import { ModelFilters } from '../../types/models';
import { Switch } from '@headlessui/react';

interface ModelsSidebarProps {
  filters: ModelFilters;
  onFiltersChange: (filters: ModelFilters) => void;
}

const CONTEXT_MIN = 4000;
const CONTEXT_MAX = 2000000;
const PRICE_MIN = 0;
const PRICE_MAX = 10;

const filterGroups = [
  {
    name: 'Input Modalities',
    options: ['Text', 'Image', 'File'],
    category: 'modalities' as const,
  },
  {
    name: 'Series',
    options: ['GPT', 'Claude', 'Gemini', 'Grok', 'Cohere', 'Nova', 'Qwen', 'Yi', 'DeepSeek', 'Mistral', 'Llama2', 'Llama3', 'RWKV', 'Qwen3', 'Router', 'Media', 'Other', 'PaLM'],
    category: 'series' as const,
  },
  {
    name: 'Providers',
    options: [
      'OpenAI','Anthropic','Google AI Studio', 'Google Vertex','AI21', 'AionLabs', 'Alibaba', 'Amazon Bedrock',  'Atoma', 'Avian.io', 'Azure', 'BaseTen', 'CentML', 'Cerebras', 'Chutes', 'Cloudflare', 'Cohere', 'Crusoe', 'DeepInfra', 'DeepSeek', 'Enfer', 'Featherless', 'Fireworks', 'Friendli', 'GMICloud',  'Groq', 'Hyperbolic', 'Inception', 'inference.net', 'Infermatic', 'Inflection', 'InoCloud', 'kluster.ai', 'Lambda', 'Liquid', 'Mancer', 'Mancer (private)', 'Meta', 'Minimax', 'Mistral', 'nCompass', 'Nebius AI Studio', 'NextBit', 'Nineteen', 'NovitaAI', 'OpenAI', 'OpenInference', 'Parasail', 'Perplexity', 'Phala', 'SambaNova', 'Stealth', 'Targon', 'Together', 'Ubicloud', 'Venice', 'xAI'
    ],
    category: 'providers' as const,
  },
  {
    name: 'Categories',
    options: [
      'Roleplay', 'Programming', 'Marketing', 'Marketing/Seo', 'Technology', 'Science', 'Translation', 'Legal', 'Finance', 'Health', 'Trivia', 'Academia'
    ],
    category: 'categories' as const,
  },
  {
    name: 'Supported Parameters',
    options: [
      'tools', 'temperature', 'top_p', 'top_k', 'min_p', 'top_a', 'frequency_penalty', 'presence_penalty', 'repetition_penalty', 'max_tokens', 'logit_bias', 'logprobs', 'top_logprobs', 'seed', 'response_format', 'structured_outputs', 'stop', 'include_reasoning', 'reasoning', 'web_search_options'
    ],
    category: 'parameters' as const,
  },
  {
    name: 'Features',
    options: ['JSON', 'Tools', 'Vision'],
    category: 'features' as const,
  },
];

const defaultFilters: ModelFilters = {
  providers: [],
  features: [],
  contextRange: [CONTEXT_MIN, CONTEXT_MAX],
  priceRange: [PRICE_MIN, PRICE_MAX],
  modalities: [],
  series: [],
  categories: [],
  parameters: [],
  showActiveOnly: false,
};

const ModelsSidebar: React.FC<ModelsSidebarProps> = ({ filters, onFiltersChange }) => {
  const handleFilterChange = (category: keyof ModelFilters, value: string) => {
    const currentFilters = (filters[category] as string[] | undefined) ?? [];
    const newFilters = currentFilters.includes(value)
      ? currentFilters.filter(f => f !== value)
      : [...currentFilters, value];
    
    onFiltersChange({
      ...filters,
      [category]: newFilters
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({ ...defaultFilters });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg h-full overflow-y-auto max-h-[90vh]">
      <h2 className="text-xl font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-200">
        Filters
      </h2>

      {/* Show Active Only Toggle */}
      <div className="mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">Show only available models</span>
          <Switch
            checked={filters.showActiveOnly}
            onChange={(value) => onFiltersChange({ ...filters, showActiveOnly: value })}
            className={`${filters.showActiveOnly ? 'bg-indigo-600' : 'bg-gray-200'}
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 
              focus:ring-indigo-500 focus:ring-offset-2`}
          >
            <span className="sr-only">Show only available models</span>
            <span
              aria-hidden="true"
              className={`${filters.showActiveOnly ? 'translate-x-5' : 'translate-x-0'}
                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow 
                ring-0 transition duration-200 ease-in-out`}
            />
          </Switch>
        </div>
      </div>

      {/* Context Length Slider */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Context length</span>
        </div>
        <input
          type="range"
          min={CONTEXT_MIN}
          max={CONTEXT_MAX}
          step={1000}
          value={filters.contextRange ? filters.contextRange[1] : CONTEXT_MAX}
          onChange={e =>
            onFiltersChange({
              ...filters,
              contextRange: [CONTEXT_MIN, Number(e.target.value)],
            })
          }
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>4K</span>
          <span>64K</span>
          <span>1M</span>
          <span>2M</span>
        </div>
      </div>

      {/* Prompt Pricing Slider */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Prompt pricing</span>
        </div>
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={0.1}
          value={filters.priceRange ? filters.priceRange[1] : PRICE_MAX}
          onChange={e =>
            onFiltersChange({
              ...filters,
              priceRange: [PRICE_MIN, Number(e.target.value)],
            })
          }
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>FREE</span>
          <span>$0.5</span>
          <span>$10+</span>
        </div>
      </div>

      <div className="space-y-6">
        {filterGroups.map((group) => (
          <div key={group.name}>
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-3">
              {group.name}
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {group.options.map((option) => (
                <label key={option} className="flex items-center text-gray-700 hover:text-indigo-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={((filters[group.category] as string[] | undefined) ?? []).includes(option)}
                    onChange={() => handleFilterChange(group.category, option)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-2.5"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleClearFilters}
        className="mt-6 w-full text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-200 rounded py-2"
      >
        Clear all filters
      </button>
    </div>
  );
};

export default ModelsSidebar;
