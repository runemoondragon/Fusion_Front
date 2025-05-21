const fs = require('fs');
const path = require('path');

// Use path.join to handle spaces in paths correctly
const data = require(path.join(__dirname, '..', 'liderboard.json'));

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const providerMap = [
  { key: 'Claude', provider: 'Anthropic' },
  { key: 'Grok', provider: 'xAI' },
  { key: 'Gemini', provider: 'Google' },
  { key: 'Llama', provider: 'Meta' },
  { key: 'GPT', provider: 'OpenAI' },
  { key: 'DeepSeek', provider: 'DeepSeek' },
  { key: 'Phi', provider: 'Microsoft' },
  { key: 'Qwen', provider: 'Alibaba' },
  { key: 'Nova', provider: 'Nova' },
  { key: 'Mistral', provider: 'Mistral' },
  { key: 'Gemma', provider: 'Google' },
  { key: 'Jamba', provider: 'AI21' },
  { key: 'Command', provider: 'Cohere' },
  { key: 'Kimi', provider: 'Moonshot' },
  { key: 'IBM', provider: 'IBM' },
  { key: 'Granite', provider: 'IBM' }
];

function guessProvider(name) {
  for (const { key, provider } of providerMap) {
    if (name.startsWith(key)) return provider;
  }
  return 'Other';
}

function toNull(val) {
  return val === "null" ? null : val;
}

const enriched = data.map(entry => ({
  id: slugify(entry['Name']),
  model: entry['Name'],
  provider: guessProvider(entry['Name']),
  release_date: entry['Release Date'],
  input_context: entry['Input Context'],
  output_context: entry['Output Context'],
  gpqa: toNull(entry['GPQA']),
  mmlu: toNull(entry['MMLU']),
  math: toNull(entry['MATH']),
  humaneval: toNull(entry['HumanEval']),
  mmlu_pro: toNull(entry['MMLU-Pro']),
  mmmu: toNull(entry['MMMU']),
  aime_2024: toNull(entry['AIME 2024']),
  trend: [Math.random(), Math.random(), Math.random()].join(',')
}));

// Create public/mock directory if it doesn't exist
const outputDir = path.join(__dirname, '..', 'public', 'mock');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write the enriched data
fs.writeFileSync(
  path.join(outputDir, 'leaderboard.json'),
  JSON.stringify(enriched, null, 2)
);

console.log('Done! Enriched data written to public/mock/leaderboard.json'); 