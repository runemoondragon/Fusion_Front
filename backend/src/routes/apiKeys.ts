import express, { Request, Response } from 'express';
import pool from '../db';
import { verifyToken } from '../middleware/auth'; // Assuming your verifyToken middleware is here
import crypto from 'crypto';

const router = express.Router();

// API Key Generation Function (can be a shared utility)
const generateNewApiKey = (prefix = 'sk-fusion-'): string => {
  return prefix + crypto.randomBytes(28).toString('hex');
};

// GET /api/keys - Fetch all API keys for the authenticated user
router.get('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id: number }).id;
    if (!userId) {
      return res.status(403).json({ error: 'User ID not found in token (after assertion)' });
    }

    const result = await pool.query(
      'SELECT id, name, api_key, created_at, last_used_at, is_active FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    // Mask the API key before sending it to the client
    const maskedKeys = result.rows.map(key => ({
      ...key,
      api_key: key.api_key ? `${key.api_key.substring(0, 12)}...${key.api_key.substring(key.api_key.length - 4)}` : null
    }));

    res.json(maskedKeys);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

// POST /api/keys - Create a new API key
router.post('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id: number }).id;
    if (!userId) {
      return res.status(403).json({ error: 'User ID not found in token (after assertion)' });
    }

    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'API key name is required and must be a non-empty string' });
    }

    const apiKey = generateNewApiKey();

    const result = await pool.query(
      'INSERT INTO api_keys (user_id, name, api_key) VALUES ($1, $2, $3) RETURNING id, name, api_key, created_at, is_active',
      [userId, name.trim(), apiKey]
    );
    
    const newKey = result.rows[0];
    // IMPORTANT: Send the full unmasked key only ONCE upon creation.
    // Subsequent GET requests will show the masked version.
    res.status(201).json({
        id: newKey.id,
        name: newKey.name,
        api_key: newKey.api_key, // Full key
        created_at: newKey.created_at,
        is_active: newKey.is_active,
        message: "API Key created successfully. Please save this key securely. You will not be able to see it again."
    });

  } catch (error) {
    console.error('Error creating API key:', error);
    if ((error as any).code === '23505') { // unique_violation
        return res.status(409).json({ error: 'Failed to generate a unique API key. Please try again.'})
    }
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

// PUT /api/keys/:keyId - Update an API key's name
router.put('/:keyId', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id: number }).id;
    const { keyId } = req.params;
    if (!userId) {
      return res.status(403).json({ error: 'User ID not found in token (after assertion)' });
    }

    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'API key name is required' });
    }

    const result = await pool.query(
      'UPDATE api_keys SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING id, name, created_at, last_used_at, is_active',
      [name.trim(), keyId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'API key not found or user unauthorized' });
    }
    
    // Return the updated key (masked)
    const updatedKey = result.rows[0];
    const apiKeyFull = await pool.query('SELECT api_key FROM api_keys WHERE id = $1', [updatedKey.id]);
    
    res.json({
        ...updatedKey,
        api_key: apiKeyFull.rows[0].api_key ? `${apiKeyFull.rows[0].api_key.substring(0, 12)}...${apiKeyFull.rows[0].api_key.substring(apiKeyFull.rows[0].api_key.length - 4)}` : null
    });

  } catch (error) {
    console.error('Error updating API key:', error);
    res.status(500).json({ error: 'Failed to update API key' });
  }
});

// PUT /api/keys/:keyId/status - Update an API key's active status
router.put('/:keyId/status', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id: number }).id;
    const { keyId } = req.params;
    if (!userId) {
      return res.status(403).json({ error: 'User ID not found in token (after assertion)' });
    }

    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive status (boolean) is required' });
    }

    const result = await pool.query(
      'UPDATE api_keys SET is_active = $1 WHERE id = $2 AND user_id = $3 RETURNING id, name, api_key, created_at, last_used_at, is_active',
      [isActive, keyId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'API key not found or user unauthorized' });
    }
    
    const updatedKey = result.rows[0];
    // Mask the API key before sending it back
    res.json({
      ...updatedKey,
      api_key: updatedKey.api_key ? `${updatedKey.api_key.substring(0, 12)}...${updatedKey.api_key.substring(updatedKey.api_key.length - 4)}` : null
    });

  } catch (error) {
    console.error('Error updating API key status:', error);
    res.status(500).json({ error: 'Failed to update API key status' });
  }
});

// DELETE /api/keys/:keyId - Delete an API key
router.delete('/:keyId', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id: number }).id;
    const { keyId } = req.params;

    if (!userId) {
      return res.status(403).json({ error: 'User ID not found in token (after assertion)' });
    }

    const result = await pool.query(
      'DELETE FROM api_keys WHERE id = $1 AND user_id = $2',
      [keyId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'API key not found or user unauthorized' });
    }

    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).json({ error: 'Failed to delete API key' });
  }
});

// GET /api/keys/:keyId/activity - Fetch usage logs for a specific API key
router.get('/:keyId/activity', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id: number }).id;
    const { keyId } = req.params;

    if (!userId) {
      return res.status(403).json({ error: 'User ID not found in token (after assertion)' });
    }

    // First, verify the API key belongs to the user
    const apiKeyCheck = await pool.query(
      'SELECT id FROM api_keys WHERE id = $1 AND user_id = $2',
      [keyId, userId]
    );

    if (apiKeyCheck.rowCount === 0) {
      return res.status(404).json({ error: 'API key not found or user unauthorized' });
    }

    // Fetch usage logs
    // You might want to add pagination here for large datasets
    const activityResult = await pool.query(
      `SELECT id, model, provider, prompt_tokens, completion_tokens, total_tokens, cost, fallback_reason, response_time, created_at 
       FROM usage_logs 
       WHERE api_key_id = $1 
       ORDER BY created_at DESC
       LIMIT 50`,
      [keyId]
    );

    res.json(activityResult.rows);
  } catch (error) {
    console.error('Error fetching API key activity:', error);
    res.status(500).json({ error: 'Failed to fetch API key activity' });
  }
});


export default router; 