import express from 'express';
import passport from 'passport';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { Strategy as AppleStrategy } from 'passport-apple';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import chatRoutes from './routes/chat';
import apiKeysRouter from './routes/apiKeys';
import userActivityRouter from './routes/userActivity';
import userProfileRoutes from './routes/userProfile';
import chatHistoryRoutes from './routes/chatHistory';
import stripeRoutes from './routes/stripe';
import btcpayRoutes from './routes/btcpay';
import creditRoutes from './routes/credits';
import { verifyToken } from './middleware/auth';
import path from 'path';
import pool from './db';
import http from 'http';
import modelsRouter from './routes/models';
import userExternalApiKeysRouter from './routes/userExternalApiKeys';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Extend Express Request type to include rawBody
declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
    }
  }
}

// API Key Generation Function
const generateApiKey = (prefix = 'sk-fusion-'): string => {
  return prefix + crypto.randomBytes(28).toString('hex'); // Generates a key similar to sk-fusion-xxxxxxxx...
};

// Helper function to set up default settings and API key for a new user
async function setupNewUserDefaults(userId: number, dbPool: Pool) {
  try {
    // 1. Insert default user_settings
    const defaultSettings = [
      { key: 'theme', value: 'light' },
      { key: 'notifications_enabled', value: 'true' },
      { key: 'default_sort', value: 'balanced' },
      { key: 'default_provider', value: 'NeuroSwitch' },
      { key: 'default_model', value: 'neuroswitch:mix' },
      { key: 'token_display_mode', value: 'percentage' },
    ];

    for (const setting of defaultSettings) {
      await dbPool.query(
        'INSERT INTO user_settings (user_id, setting_key, setting_value) VALUES ($1, $2, $3)',
        [userId, setting.key, setting.value]
      );
    }

    // 2. Insert default model_preferences
    await dbPool.query(
      'INSERT INTO model_preferences (user_id, default_model, allowed_providers, ignored_providers) VALUES ($1, $2, $3, $4)',
      [userId, 'neuroswitch:mix', [], []] // Empty arrays for allowed/ignored providers
    );

    // 3. Generate and insert an initial API key
    const apiKey = generateApiKey();
    await dbPool.query(
      'INSERT INTO api_keys (user_id, api_key) VALUES ($1, $2)',
      [userId, apiKey]
    );

    console.log(`Default settings and API key created for user ID: ${userId}`);

  } catch (error) {
    console.error('Error setting up new user defaults:', error);
    // Depending on the desired behavior, you might want to throw this error
    // or handle it more gracefully (e.g., log and continue).
    // For now, we'll log it and let the main user creation process continue.
  }
}

// Middleware
app.use(express.json({
  verify: (req: http.IncomingMessage, res: http.ServerResponse, buf: Buffer, encoding: BufferEncoding) => {
    const expressReq = req as express.Request; // Cast to express.Request to access originalUrl
    if (expressReq.originalUrl && (expressReq.originalUrl.startsWith('/webhooks/stripe') || expressReq.originalUrl.startsWith('/webhooks/btcpay'))) {
      expressReq.rawBody = buf;
    }
  }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Serve Static Files for Avatars
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Mount routes
app.use('/api/chat', verifyToken, chatRoutes);
app.use('/api/keys', verifyToken, apiKeysRouter);
app.use('/api/user', verifyToken, userActivityRouter);
app.use('/api/profile', verifyToken, userProfileRoutes);
app.use('/api/chats', verifyToken, chatHistoryRoutes);

// Mount the new router for user-provided external API keys
app.use('/api/external-keys', verifyToken, userExternalApiKeysRouter);

// Payment and Webhook Routes
// Stripe API routes (e.g., create-session, billing-portal) - protected
app.use('/api/stripe', verifyToken, stripeRoutes);
// BTCPay API routes (e.g., create-invoice) - protected
app.use('/api/btcpay', verifyToken, btcpayRoutes);
// Credit management routes (e.g., get balance) - protected
app.use('/api/credits', verifyToken, creditRoutes);

// Webhook specific routes - these are typically not behind /api and not protected by user token auth
// The Stripe router itself handles which sub-routes are open (e.g. /webhooks/stripe)
// We mount the entire stripeRoutes again at /webhooks to catch /webhooks/stripe without verifyToken
// A bit of a workaround, better would be to split webhook handlers into separate routers if they grow.
app.use('/webhooks', stripeRoutes); // For /webhooks/stripe (defined inside stripe.ts, without verifyToken)
app.use('/webhooks', btcpayRoutes); // For /webhooks/btcpay (defined inside btcpay.ts, without verifyToken)

// Public routes
app.use('/api/models', modelsRouter);

// Serialize/Deserialize User
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    const user = result.rows[0];
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Configure OAuth Strategies
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE oauth_id = $1 AND oauth_provider = $2',
        [profile.id, 'google']
      );

      if (existingUser.rows.length > 0) {
        return done(null, existingUser.rows[0]);
      }

      // Create new user
      const newUserResult = await pool.query(
        'INSERT INTO users (email, oauth_provider, oauth_id) VALUES ($1, $2, $3) RETURNING *',
        [profile.emails?.[0]?.value || '', 'google', profile.id]
      );
      const newUser = newUserResult.rows[0];
      await setupNewUserDefaults(newUser.id, pool);
      return done(null, newUser);
    } catch (err) {
      return done(err, false);
    }
  }));
}

// Setup other OAuth providers with similar pattern
// Microsoft
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  passport.use(new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    callbackURL: '/auth/microsoft/callback',
    scope: ['user.read']
  }, async (_accessToken: string, _refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
    try {
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE oauth_id = $1 AND oauth_provider = $2',
        [profile.id, 'microsoft']
      );

      if (existingUser.rows.length > 0) {
        return done(null, existingUser.rows[0]);
      }

      const newUserResult = await pool.query(
        'INSERT INTO users (email, oauth_provider, oauth_id) VALUES ($1, $2, $3) RETURNING *',
        [profile.emails?.[0]?.value || '', 'microsoft', profile.id]
      );
      const newUser = newUserResult.rows[0];
      await setupNewUserDefaults(newUser.id, pool);
      return done(null, newUser);
    } catch (err) {
      return done(err, false);
    }
  }));
}

// Apple, Amazon, LinkedIn, Facebook would follow similar patterns
// They are omitted here for brevity but would be implemented similarly

// Auth Routes

// Google
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const passportUser = req.user as any; // User from passport
    const payload = {
      id: passportUser.id,
      email: passportUser.email, 
      name: passportUser.display_name || passportUser.displayName, // Use display_name or displayName from passport
      stripe_customer_id: passportUser.stripe_customer_id 
    };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '24h' }
    );
    // Redirect with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
  }
);

// Microsoft
app.get('/auth/microsoft', passport.authenticate('microsoft'));
app.get('/auth/microsoft/callback',
  passport.authenticate('microsoft', { failureRedirect: '/login' }),
  (req, res) => {
    const passportUser = req.user as any;
    const payload = {
      id: passportUser.id,
      email: passportUser.email,
      name: passportUser.displayName || passportUser.display_name, // Use displayName or display_name from passport
      stripe_customer_id: passportUser.stripe_customer_id
    };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '24h' }
    );
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
  }
);

// Routes for other OAuth providers would be similar

// Email Registration
app.post('/auth/email/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body; // Expect displayName from frontend
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const newUserResult = await pool.query(
      'INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name, stripe_customer_id',
      [email, hashedPassword, displayName || null] // Store displayName
    );
    const newUser = newUserResult.rows[0];
    await setupNewUserDefaults(newUser.id, pool);
    
    // Generate JWT token
    const payload = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.display_name, // Use display_name here
      stripe_customer_id: newUser.stripe_customer_id
    };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({ token, userId: newUser.id, email: newUser.email, name: newUser.display_name }); // Send back display_name as name
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Email Login
app.post('/auth/email/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user - ensure you SELECT display_name and stripe_customer_id
    const userResult = await pool.query('SELECT id, email, display_name, password_hash, stripe_customer_id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = userResult.rows[0];
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const payload = {
      id: user.id,
      email: user.email,
      name: user.display_name, // Use display_name here
      stripe_customer_id: user.stripe_customer_id
    };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '24h' }
    );
    
    res.json({ token, userId: user.id, email: user.email, name: user.display_name }); // Send back display_name as name
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// JWT Authentication Middleware
export const authenticateJWT = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret', (err: any, user: any) => {
      if (err) {
        return res.sendStatus(403);
      }
      
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Example protected route
app.get('/user/profile', authenticateJWT, async (req: any, res: any) => {
  try {
    const user = await pool.query('SELECT id, email, created_at FROM users WHERE id = $1', [req.user.id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.rows[0]);
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Root path for basic check
app.get('/', (req, res) => res.send('Fusion Backend is Active'));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app; 