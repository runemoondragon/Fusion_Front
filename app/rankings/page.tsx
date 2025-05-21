"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { fetchLeaderboardData } from '../utils/fetchLeaderboardData';
import RankingsStackedBarChart from '../components/rankings/RankingsStackedBarChart';

const PAGE_SIZE = 15;

// Tooltip helper
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <span className="relative group cursor-help">
    {children}
    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-xs px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none z-10 whitespace-pre-line">
      {text}
    </span>
  </span>
);

// Type for leaderboard model row
type LeaderboardModel = {
  id: string;
  model: string;
  provider: string;
  release_date?: string;
  input_context?: string;
  output_context?: string;
  gpqa?: number | null;
  mmlu?: number | null;
  math?: number | null;
  humaneval?: number | null;
  mmlu_pro?: number | null;
  mmmu?: number | null;
  aime_2024?: number | null;
};

export default function RankingsPage() {
  const [models, setModels] = useState<LeaderboardModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchLeaderboardData()
      .then((data: LeaderboardModel[]) => {
        if (mounted) {
          setModels(data);
          setLoading(false);
        }
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
    // Poll every 60s
    const interval = setInterval(() => {
      fetchLeaderboardData().then((data: LeaderboardModel[]) => mounted && setModels(data));
    }, 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Filter and sort
  const filtered = useMemo(() => {
    let filtered = models;
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        m => m.model?.toLowerCase().includes(s) || m.provider?.toLowerCase().includes(s)
      );
    }
    // Default sort: GPQA desc
    filtered = filtered.slice().sort((a, b) => {
      const av = a.gpqa ?? -1;
      const bv = b.gpqa ?? -1;
      return bv - av;
    });
    return filtered;
  }, [models, search]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Expand/collapse
  const handleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  // Helper for displaying values
  const show = (val: any) => val === null || val === undefined ? 'N/A' : val;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <RankingsStackedBarChart />
      <h1 className="text-3xl font-bold mb-6">AI Model Rankings</h1>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <input
          type="text"
          placeholder="Search models or providers..."
          className="border rounded px-3 py-2 w-full md:w-72"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-700">
              <th className="py-2 px-3 text-left">#</th>
              <th className="py-2 px-3 text-left">Model</th>
              <th className="py-2 px-3 text-left">Provider</th>
              <th className="py-2 px-3 text-left">
                <Tooltip text="General Performance on GPQA (higher is better)">GPQA</Tooltip>
              </th>
              <th className="py-2 px-3 text-left">
                <Tooltip text="Massive Multitask Language Understanding">MMLU</Tooltip>
              </th>
              <th className="py-2 px-3 text-left">
                <Tooltip text="Mathematical Reasoning">MATH</Tooltip>
              </th>
              <th className="py-2 px-3 text-left">
                <Tooltip text="Code Generation">HumanEval</Tooltip>
              </th>
              <th className="py-2 px-3 text-left">
                <Tooltip text="Multimodal Understanding">MMMU</Tooltip>
              </th>
              <th className="py-2 px-3 text-left">
                <Tooltip text="AIME 2024 Math Competition">AIME 2024</Tooltip>
              </th>
              <th className="py-2 px-3 text-left">
                <Tooltip text="Max Input Context (tokens)">Input Ctx</Tooltip>
              </th>
              <th className="py-2 px-3 text-left">
                <Tooltip text="Max Output Context (tokens)">Output Ctx</Tooltip>
              </th>
              <th className="py-2 px-3 text-left">
                <Tooltip text="Release Date">Release</Tooltip>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={13} className="text-center py-8">Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan={13} className="text-center py-8 text-red-500">Failed to load data</td></tr>
            ) : paged.length === 0 ? (
              <tr><td colSpan={13} className="text-center py-8">No models found</td></tr>
            ) : paged.map((m, i) => {
              const rank = (page - 1) * PAGE_SIZE + i + 1;
              const isExpanded = expanded === m.id;
              return (
                <React.Fragment key={m.id || m.model}>
                  <tr className="border-b hover:bg-blue-50 transition cursor-pointer" onClick={() => handleExpand(m.id)}>
                    <td className="py-2 px-3 font-bold">{rank}</td>
                    <td className="py-2 px-3">{m.model}</td>
                    <td className="py-2 px-3">{m.provider}</td>
                    <td className="py-2 px-3">{show(m.gpqa)}</td>
                    <td className="py-2 px-3">{show(m.mmlu)}</td>
                    <td className="py-2 px-3">{show(m.math)}</td>
                    <td className="py-2 px-3">{show(m.humaneval)}</td>
                    <td className="py-2 px-3">{show(m.mmmu)}</td>
                    <td className="py-2 px-3">{show(m.aime_2024)}</td>
                    <td className="py-2 px-3">{show(m.input_context)}</td>
                    <td className="py-2 px-3">{show(m.output_context)}</td>
                    <td className="py-2 px-3">{show(m.release_date)}</td>
                    <td className="py-2 px-3">
                      <button
                        className="text-blue-600 hover:underline text-xs"
                        onClick={e => { e.stopPropagation(); handleExpand(m.id); }}
                      >
                        {isExpanded ? 'Hide' : 'Details'}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-blue-50">
                      <td colSpan={13} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(m).map(([key, value]) => (
                            <div key={key} className="mb-2 text-sm text-gray-600">
                              <span className="font-semibold text-gray-800">{key}:</span> <span className="text-gray-900">{show(value)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >Prev</button>
          <button
            className="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >Next</button>
        </div>
      </div>
    </div>
  );
}
