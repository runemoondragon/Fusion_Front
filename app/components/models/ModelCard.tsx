import React from 'react';
import { Model } from '../../types/models';

interface ModelCardProps {
  model: Model;
}

const ModelCard: React.FC<ModelCardProps> = ({ model }) => {
  const formatCost = (cost: number | string) => {
    const num = typeof cost === 'number' ? cost : parseFloat(cost);
    return num === 0 ? 'Free' : `$${num.toFixed(2)} / 1M tokens`;
  };

  const formatContextLength = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M tokens`;
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(0)}K tokens`;
    }
    return `${tokens} tokens`;
  };

  return (
    <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{model.name}</h3>
          <p className="text-sm text-gray-500">{model.provider}</p>
        </div>
        <div className="flex space-x-2">
          {model.supports_json_mode && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              JSON
            </span>
          )}
          {model.supports_tool_use && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Tools
            </span>
          )}
          {model.supports_vision && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Vision
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Input Cost:</span>
          <span className="text-gray-900">{formatCost(model.input_cost_per_million_tokens)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Output Cost:</span>
          <span className="text-gray-900">{formatCost(model.output_cost_per_million_tokens)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Context Length:</span>
          <span className="text-gray-900">{formatContextLength(model.context_length_tokens)}</span>
        </div>
      </div>

      {model.description && (
        <p className="mt-4 text-sm text-gray-600">{model.description}</p>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">ID: {model.id_string}</p>
      </div>
    </div>
  );
};

export default ModelCard;
