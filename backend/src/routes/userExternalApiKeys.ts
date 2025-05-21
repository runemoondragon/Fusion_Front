import express, { Request, Response } from 'express';
import pool from '../db';
import { verifyToken, User as AuthUser } from '../middleware/auth';
import { encrypt } from '../utils/crypto';

const router = express.Router();

// GET /api/external-keys - Fetch all external API keys for the authenticated user
router.get('/', verifyToken, async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  if (!user || typeof user.id === 'undefined') {
    return res.status(401).json({ error: 'Unauthorized: User ID not found in token' });
  }
  const userId = user.id;

  try {
    const result = await pool.query(
      `SELECT ueak.id, ueak.provider_id, p.name as provider_name, ueak.key_name, ueak.key_preview, ueak.is_active, ueak.created_at, ueak.updated_at
       FROM user_external_api_keys ueak
       JOIN providers p ON ueak.provider_id = p.id
       WHERE ueak.user_id = $1
       ORDER BY p.name ASC, ueak.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('[API] Error fetching external API keys:', error);
    res.status(500).json({ error: 'Failed to fetch external API keys' });
  }
});

// POST /api/external-keys - Add a new external API key
router.post('/', verifyToken, async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  if (!user || typeof user.id === 'undefined') {
    return res.status(401).json({ error: 'Unauthorized: User ID not found in token' });
  }
  const userId = user.id;

  const { provider_name, api_key, key_name } = req.body; // Expect provider_name from frontend

  if (!provider_name || !api_key || !key_name) {
    return res.status(400).json({ error: 'provider_name, api_key, and key_name are required' });
  }
  if (typeof api_key !== 'string' || api_key.trim() === '') {
    return res.status(400).json({ error: 'API key cannot be empty' });
  }
  if (typeof key_name !== 'string' || key_name.trim().length === 0) {
    return res.status(400).json({ error: 'Key name cannot be empty' });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    // Get provider_id from provider_name
    const providerResult = await client.query('SELECT id FROM providers WHERE LOWER(name) = LOWER($1)', [provider_name.trim()]);
    if (providerResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Provider '${provider_name}' not found or not supported.` });
    }
    const providerId = providerResult.rows[0].id;

    const encryptedApiKey = encrypt(api_key.trim());
    
    const trimmedKey = api_key.trim();
    let keyPreview = '';
    if (trimmedKey.length > 8) {
      keyPreview = `${trimmedKey.substring(0, 4)}...${trimmedKey.substring(trimmedKey.length - 4)}`;
    } else if (trimmedKey.length > 0) {
      keyPreview = `${trimmedKey.substring(0, Math.min(4, trimmedKey.length))}...`;
    }

    const insertResult = await client.query(
      'INSERT INTO user_external_api_keys (user_id, provider_id, key_name, encrypted_api_key, key_preview) VALUES ($1, $2, $3, $4, $5) RETURNING id, provider_id, key_name, key_preview, is_active, created_at, updated_at',
      [userId, providerId, key_name.trim(), encryptedApiKey, keyPreview]
    );

    await client.query('COMMIT');
    
    const newKey = insertResult.rows[0];
    res.status(201).json({ ...newKey, provider_name }); // Return provider_name for consistency

  } catch (error: any) {
    if (client) await client.query('ROLLBACK');
    console.error('[API] Error adding external API key:', error);
    if (error.code === '23505') { // unique_violation (user_id, provider_id)
      return res.status(409).json({ error: `An API key for provider '${provider_name}' already exists.` });
    }
    if (error.message && error.message.includes('Encryption key is misconfigured')) {
        return res.status(500).json({ error: 'Server encryption configuration error. Please contact support.' });
    }
    res.status(500).json({ error: 'Failed to add external API key' });
  } finally {
    if (client) client.release();
  }
});

// PUT /api/external-keys/:id - Update an external API key's name
router.put('/:id', verifyToken, async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  if (!user || typeof user.id === 'undefined') {
    return res.status(401).json({ error: 'Unauthorized: User ID not found in token' });
  }
  const userId = user.id;
  const { id: keyId } = req.params;
  const { key_name } = req.body;

  if (!key_name || typeof key_name !== 'string' || key_name.trim().length === 0) {
    return res.status(400).json({ error: 'Key name is required and cannot be empty' });
  }

  try {
    const result = await pool.query(
      `UPDATE user_external_api_keys ueak
       SET key_name = $1, updated_at = CURRENT_TIMESTAMP
       FROM providers p
       WHERE ueak.id = $2 AND ueak.user_id = $3 AND ueak.provider_id = p.id
       RETURNING ueak.id, ueak.provider_id, p.name as provider_name, ueak.key_name, ueak.key_preview, ueak.is_active, ueak.created_at, ueak.updated_at`,
      [key_name.trim(), keyId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'External API key not found or user unauthorized' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('[API] Error updating external API key:', error);
    res.status(500).json({ error: 'Failed to update external API key' });
  }
});

// DELETE /api/external-keys/:id - Delete an external API key
router.delete('/:id', verifyToken, async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  if (!user || typeof user.id === 'undefined') {
    return res.status(401).json({ error: 'Unauthorized: User ID not found in token' });
  }
  const userId = user.id;
  const { id: keyId } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM user_external_api_keys WHERE id = $1 AND user_id = $2 RETURNING id',
      [keyId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'External API key not found or user unauthorized' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('[API] Error deleting external API key:', error);
    res.status(500).json({ error: 'Failed to delete external API key' });
  }
});

// PUT /api/external-keys/:id/status - Toggle an external API key's active status
router.put('/:id/status', verifyToken, async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  if (!user || typeof user.id === 'undefined') {
    return res.status(401).json({ error: 'Unauthorized: User ID not found in token' });
  }
  const userId = user.id;
  const { id: keyId } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ error: 'isActive (boolean) is required in the request body' });
  }

  try {
    const result = await pool.query(
      `UPDATE user_external_api_keys ueak
       SET is_active = $1, updated_at = CURRENT_TIMESTAMP
       FROM providers p
       WHERE ueak.id = $2 AND ueak.user_id = $3 AND ueak.provider_id = p.id
       RETURNING ueak.id, ueak.provider_id, p.name as provider_name, ueak.key_name, ueak.key_preview, ueak.is_active, ueak.created_at, ueak.updated_at`,
      [isActive, keyId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'External API key not found or user unauthorized' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('[API] Error updating external API key status:', error);
    res.status(500).json({ error: 'Failed to update external API key status' });
  }
});

export default router; 