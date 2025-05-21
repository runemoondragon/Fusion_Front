import express from 'express';
import pool  from '../db';

const router = express.Router();

// GET /api/models - Get all models
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        name,
        id_string,
        provider,
        input_cost_per_million_tokens,
        output_cost_per_million_tokens,
        context_length_tokens,
        supports_json_mode,
        supports_tool_use,
        supports_vision,
        description,
        release_date,
        created_at,
        updated_at
      FROM models
      ORDER BY provider, name
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/models/:id - Get a specific model
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM models WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Model not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching model:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/models - Create a new model (protected, admin only)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      id_string,
      provider,
      input_cost_per_million_tokens,
      output_cost_per_million_tokens,
      context_length_tokens,
      supports_json_mode,
      supports_tool_use,
      supports_vision,
      description,
      release_date
    } = req.body;

    const result = await pool.query(`
      INSERT INTO models (
        name,
        id_string,
        provider,
        input_cost_per_million_tokens,
        output_cost_per_million_tokens,
        context_length_tokens,
        supports_json_mode,
        supports_tool_use,
        supports_vision,
        description,
        release_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      name,
      id_string,
      provider,
      input_cost_per_million_tokens,
      output_cost_per_million_tokens,
      context_length_tokens,
      supports_json_mode,
      supports_tool_use,
      supports_vision,
      description,
      release_date
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating model:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/models/:id - Update a model (protected, admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      id_string,
      provider,
      input_cost_per_million_tokens,
      output_cost_per_million_tokens,
      context_length_tokens,
      supports_json_mode,
      supports_tool_use,
      supports_vision,
      description,
      release_date
    } = req.body;

    const result = await pool.query(`
      UPDATE models
      SET
        name = $1,
        id_string = $2,
        provider = $3,
        input_cost_per_million_tokens = $4,
        output_cost_per_million_tokens = $5,
        context_length_tokens = $6,
        supports_json_mode = $7,
        supports_tool_use = $8,
        supports_vision = $9,
        description = $10,
        release_date = $11
      WHERE id = $12
      RETURNING *
    `, [
      name,
      id_string,
      provider,
      input_cost_per_million_tokens,
      output_cost_per_million_tokens,
      context_length_tokens,
      supports_json_mode,
      supports_tool_use,
      supports_vision,
      description,
      release_date,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Model not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating model:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 