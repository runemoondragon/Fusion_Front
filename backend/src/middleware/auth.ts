import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db';

// This User interface should align with the data you expect to be available on req.user
// after successful authentication via JWT or system API key.
export interface User {
  id: number;
  email?: string;       // From users table
  name?: string;        // display_name from users table
  role?: string;        // Added role
  // Add other relevant fields from your 'users' table that might be needed globally
  // For example: role, is_active, etc.
}

declare global {
  namespace Express {
    interface Request {
      user?: User; // Augment Express Request type
    }
  }
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header provided' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Invalid authorization header format. Expected "Bearer <token>" or "ApiKey <key>".' });
  }

  const scheme = parts[0];
  const tokenOrKey = parts[1];

  if (scheme.toLowerCase() === 'bearer') {
    // JWT Authentication
    if (!tokenOrKey) {
      return res.status(401).json({ error: 'Bearer token missing' });
    }
    try {
      const decoded = jwt.verify(tokenOrKey, process.env.JWT_SECRET || 'your-jwt-secret') as any; // `any` for flexibility with JWT payload
      
      // Fetch fresh user details from DB to ensure up-to-date info and existence
      const userResult = await pool.query(
        'SELECT id, email, display_name as name, role FROM users WHERE id = $1 AND is_active = TRUE',
        [decoded.id]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ error: 'User not found, inactive, or JWT token invalid' });
      }
      req.user = userResult.rows[0] as User; // Cast to our User type
      return next();
    } catch (err) {
      // Log the error for server-side debugging, but return a generic message to client
      console.error('[Auth] JWT verification error:', err);
      return res.status(401).json({ error: 'Invalid or expired JWT token' });
    }
  } else if (scheme.toLowerCase() === 'apikey') {
    // System API Key Authentication (for sk-fusion-xxx keys)
    if (!tokenOrKey) {
        return res.status(401).json({ error: 'ApiKey value missing' });
    }
    // Optional: Add prefix check if your system API keys have a specific prefix like 'sk-fusion-'
    // if (!tokenOrKey.startsWith('sk-fusion-')) {
    //     return res.status(401).json({ error: 'Invalid API key format for system key.' });
    // }
    try {
      const apiKeyResult = await pool.query(
        'SELECT user_id FROM api_keys WHERE api_key = $1 AND is_active = TRUE',
        [tokenOrKey]
      );

      if (apiKeyResult.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid or inactive system API key' });
      }

      const userId = apiKeyResult.rows[0].user_id;
      const userResult = await pool.query(
        'SELECT id, email, display_name as name, role FROM users WHERE id = $1 AND is_active = TRUE',
        [userId]
      );

      if (userResult.rows.length === 0) {
        // This case should ideally not happen if DB foreign keys are set up correctly
        // and user deactivation also deactivates their API keys or handles this scenario.
        return res.status(401).json({ error: 'User associated with system API key not found or inactive' });
      }

      req.user = userResult.rows[0] as User;
      return next();
    } catch (err) {
      console.error('[Auth] System API key authentication error:', err);
      return res.status(500).json({ error: 'Internal server error during API key authentication' });
    }
  } else {
    return res.status(401).json({ error: 'Unsupported authentication scheme. Use Bearer (JWT) or ApiKey.' });
  }
}; 