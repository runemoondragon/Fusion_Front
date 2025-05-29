"use client";

import React, { useState, useEffect } from "react";
import apiClient from "../lib/apiClient";
import ModelCard from "../components/models/ModelCard";
import ModelTable from "../components/models/ModelTable";
import ModelsSidebar from "../components/models/ModelsSidebar";
import { Model, ModelFilters } from "../types/models";

export default function ModelsPage() {
  const [view, setView] = useState<"table" | "card">("table");
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ModelFilters>({
    providers: [],
    features: [],
    contextRange: [4000, 2000000],
    priceRange: [0, 10],
    showActiveOnly: false, // ✅ Fixes the error
    modalities: [],
    series: [],
    categories: [],
    parameters: [],
  });

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await apiClient.get<Model[]>('/models');
        const data = response.data;
        setModels(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  const filteredModels = models.filter(model => {
    if (filters.providers.length > 0 && !filters.providers.includes(model.provider)) {
      return false;
    }
    if (filters.features.length > 0) {
      const modelFeatures = [
        model.supports_json_mode && 'JSON',
        model.supports_tool_use && 'Tools',
        model.supports_vision && 'Vision'
      ].filter(Boolean) as string[];
      if (!filters.features.some(feature => modelFeatures.includes(feature))) {
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
    // Prompt pricing filter (input cost)
    if (filters.priceRange) {
      const [minPrice, maxPrice] = filters.priceRange;
      const inputCost = typeof model.input_cost_per_million_tokens === 'number'
        ? model.input_cost_per_million_tokens
        : parseFloat(model.input_cost_per_million_tokens);
      if (inputCost < minPrice || inputCost > maxPrice) {
        return false;
      }
    }

    // Show active only filter
    if (filters.showActiveOnly && !model.is_active) {
      return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar Wrapper */}
          <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
            <ModelsSidebar filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Main Content Area */}
          <main className="flex-1 bg-white p-6 rounded-lg shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-4 border-b border-gray-200">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3 sm:mb-0">
                Available Models
              </h1>
              <div className="flex items-center">
                <button
                  onClick={() => setView("card")}
                  aria-pressed={view === "card"}
                  className={`px-4 py-2 mr-2 text-sm font-medium border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    view === "card"
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                  }`}
                >
                  🧩 Card View
                </button>
                <button
                  onClick={() => setView("table")}
                  aria-pressed={view === "table"}
                  className={`px-4 py-2 text-sm font-medium border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    view === "table"
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                  }`}
                >
                  📊 Table View
                </button>
              </div>
            </div>

            {view === "card" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredModels.map(model => (
                  <ModelCard key={model.id} model={model} />
                ))}
              </div>
            ) : (
              <ModelTable models={filteredModels} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
