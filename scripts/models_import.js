const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:loveboy@localhost:5432/aiappdb'
});

// Raw GitHub URLs for each provider
const PROVIDER_URLS = [
  'https://raw.githubusercontent.com/JonathanChavezTamales/llm-leaderboard/main/providers/anthropic/provider.json',
  'https://raw.githubusercontent.com/JonathanChavezTamales/llm-leaderboard/main/providers/google/provider.json',
  'https://raw.githubusercontent.com/JonathanChavezTamales/llm-leaderboard/main/providers/openai/provider.json'
];

const today = new Date().toISOString().split('T')[0];

const importProviderModels = async (url) => {
  try {
    const response = await axios.get(url);
    const providerData = response.data;

    const providerName = providerData.name;
    const models = providerData.providermodels;

    let inserted = 0;
    let skipped = 0;

    for (const model of models) {
      const name = model.model_id;
      const id_string = model.model_id;
      const inputCost = model.price_per_input_token * 1_000_000;
      const outputCost = model.price_per_output_token * 1_000_000;
      const contextLength = 1048576; // default
      const releaseDate = model.updated_at;

      if (!id_string) {
        console.error('Skipping model due to missing id_string:', name);
        skipped++;
        continue;
      }

      try {
        await pool.query(
          `INSERT INTO models (
              name, id_string, provider,
              input_cost_per_million_tokens, output_cost_per_million_tokens, context_length_tokens,
              supports_json_mode, supports_tool_use, supports_vision,
              description, release_date, created_at, updated_at, is_active
           ) VALUES (
              $1, $2, $3,
              $4, $5, $6,
              false, false, false,
              '', $7, $8, $8, true
           )
           ON CONFLICT (id_string) DO NOTHING`,
          [
            name,
            id_string,
            providerName,
            inputCost,
            outputCost,
            contextLength,
            releaseDate,
            today
          ]
        );
        console.log(`✅ Inserted: ${providerName} - ${name}`);
        inserted++;
      } catch (err) {
        console.error(`❌ Error inserting ${name}:`, err.message);
        skipped++;
      }
    }

    console.log(`Finished ${providerName}: Inserted ${inserted}, Skipped ${skipped}`);
  } catch (err) {
    console.error(`Error loading ${url}:`, err.message);
  }
};

const run = async () => {
  for (const url of PROVIDER_URLS) {
    await importProviderModels(url);
  }

  await pool.end();
  console.log('✅ All providers processed.');
};

run();
