-- Drop old tables if they exist (clean slate)
DROP TABLE IF EXISTS app_config;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,     -- Account is active, not banned/disabled by admin
    is_verified BOOLEAN DEFAULT FALSE,  -- Email address has been verified
    email_verification_token TEXT NULLABLE, -- Stores the current verification token
    email_verification_token_expires_at TIMESTAMP NULLABLE, -- Expiry for the token
    email_verified_at TIMESTAMP NULLABLE, -- Timestamp of when email was verified
    role VARCHAR(50) DEFAULT 'user',
    emergency_fallback_tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    stripe_customer_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NULL -- This was added later via ALTER, consolidated here
);


-- API keys table
CREATE TABLE api_keys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) DEFAULT 'My API Key',
    api_key TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- chats table
CREATE TABLE chats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    ui_selected_provider TEXT, -- User's choice in the UI (e.g., 'neuroswitch', 'openai', 'claude')
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- To sort chats by recent activity
);

-- messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    provider TEXT, -- Actual provider for assistant messages (e.g., OpenAI, Claude) or NULL/User for user messages
    model_used TEXT, -- Specific model used (e.g., gpt-4-turbo) or NULL
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Or 'created_at'
);

-- Usage logs table
CREATE TABLE usage_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    api_key_id INTEGER REFERENCES user_external_api_keys(id) ON DELETE SET NULL,
    request_model VARCHAR(255) DEFAULT NULL,
    model VARCHAR(255),
    provider VARCHAR(255),
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    cost NUMERIC(10,6) DEFAULT 0.000000,
    neuroswitch_fee NUMERIC(10,4) DEFAULT 0.0000,
    fallback_reason TEXT,
    response_time INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User settings (generic key-value)
CREATE TABLE user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    setting_key VARCHAR(255) NOT NULL,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, setting_key)
);

-- Organizations table
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Organization membership
CREATE TABLE organization_members (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Model preference configuration
CREATE TABLE model_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    default_model VARCHAR(255),
    allowed_providers TEXT[],
    ignored_providers TEXT[],
    sort_strategy VARCHAR(100) DEFAULT 'balanced',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI provider metadata table
CREATE TABLE providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    base_url TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON organization_members(user_id);

-- User Credits table
CREATE TABLE user_credits (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    balance_cents INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Credit Transactions table
CREATE TABLE credit_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL, -- Can be positive (purchase) or negative (refund/adjustment)
    method VARCHAR(50) NOT NULL, -- 'stripe' or 'btcpay'
    status VARCHAR(50) NOT NULL, -- 'pending', 'completed', 'failed'
    provider_transaction_id VARCHAR(255), -- ID from Stripe or BTCPay
    description TEXT, -- Optional description, e.g., "Purchase of 1000 credits"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Function to update user_credits.updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_credits_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on user_credits table
CREATE TRIGGER update_user_credits_modtime
BEFORE UPDATE ON user_credits
FOR EACH ROW
EXECUTE FUNCTION update_user_credits_updated_at_column();

-- Index for credit_transactions for faster lookups
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_status ON credit_transactions(status);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_method ON credit_transactions(method);

-- Trigger for user_credits updated_at
CREATE TRIGGER set_timestamp_user_credits
BEFORE UPDATE ON user_credits
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Table for storing user's auto top-up settings
CREATE TABLE user_auto_topup_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    stripe_payment_method_id VARCHAR(255) NULL, -- Stripe PaymentMethod ID
    threshold_cents INTEGER NULL,                 -- When balance falls below this (in cents)
    topup_amount_cents INTEGER NULL,              -- Amount to top-up (in cents)
    last4 VARCHAR(4) NULL,                        -- Last 4 digits of the card
    card_brand VARCHAR(50) NULL,                  -- Card brand (e.g., Visa, Mastercard)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on user_id for faster lookups
CREATE INDEX idx_user_auto_topup_settings_user_id ON user_auto_topup_settings(user_id);

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER set_timestamp_user_auto_topup_settings
BEFORE UPDATE ON user_auto_topup_settings
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Add the name column to the users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255) NULL;

-- You might also want to add a display_name or similar if you plan to have more complex name handling 

CREATE TABLE IF NOT EXISTS models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    id_string VARCHAR(255) NOT NULL UNIQUE,
    provider VARCHAR(100) NOT NULL,
    input_cost_per_million_tokens DECIMAL(10, 2) NOT NULL,
    output_cost_per_million_tokens DECIMAL(10, 2) NOT NULL,
    context_length_tokens INTEGER NOT NULL,
    supports_json_mode BOOLEAN DEFAULT false,
    supports_tool_use BOOLEAN DEFAULT false,
    supports_vision BOOLEAN DEFAULT false,
    description TEXT,
    release_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_models_updated_at
    BEFORE UPDATE ON models
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- User External API Keys table (for BYOAPI)
CREATE TABLE IF NOT EXISTS user_external_api_keys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    key_name VARCHAR(255) NOT NULL,
    encrypted_api_key TEXT NOT NULL,
    key_preview VARCHAR(50), -- e.g., "sk-abc...xyz" for UI display
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    -- Recommended for future: is_valid BOOLEAN DEFAULT FALSE,
    -- Recommended for future: last_validated_at TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, provider_id) -- Ensures one key per provider per user
);

-- Trigger for user_external_api_keys to update updated_at timestamp
CREATE TRIGGER update_user_external_api_keys_updated_at
    BEFORE UPDATE ON user_external_api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for user_external_api_keys
CREATE INDEX IF NOT EXISTS idx_ueak_user_id ON user_external_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_ueak_provider_id ON user_external_api_keys(provider_id); 

-- Table for logging actions performed by administrators
CREATE TABLE admin_actions_logs (
    id SERIAL PRIMARY KEY,
    admin_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- User who performed the action
    action_type VARCHAR(255) NOT NULL,
    target_entity_type VARCHAR(100),
    target_entity_id VARCHAR(255),
    details JSONB,
    summary TEXT,
    ip_address VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_actions_logs_admin_user_id ON admin_actions_logs(admin_user_id);
CREATE INDEX idx_admin_actions_logs_action_type ON admin_actions_logs(action_type);
CREATE INDEX idx_admin_actions_logs_target_entity_id ON admin_actions_logs(target_entity_id);
CREATE INDEX idx_admin_actions_logs_timestamp ON admin_actions_logs(timestamp DESC);

-- Consider adding other tables like feature_flags or platform_settings later as needed 

-- Table for global application configuration settings
CREATE TABLE IF NOT EXISTS app_config (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for app_config to update updated_at timestamp
-- (Reusing existing update_updated_at_column function if it's generic enough, 
-- otherwise, create a specific one or ensure it's defined before this table)
-- Assuming update_updated_at_column is suitable:
CREATE TRIGGER update_app_config_updated_at
    BEFORE UPDATE ON app_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Initial default configuration values for usage limits
-- Commenting out old generic limits (or they can be manually deleted/migrated)
-- INSERT INTO app_config (key, value, description) VALUES
--    ('internal_api_monthly_cost_limit_cents', '1000', 'Monthly internal API cost limit per user (excluding admins) in cents. Set to 0 for unlimited.'),
--    ('neuroswitch_monthly_requests_limit', '1000', 'Monthly NeuroSwitch request limit per user (excluding admins). Set to 0 for unlimited.')
-- ON CONFLICT (key) DO NOTHING;

-- Role-specific free allowances - ONLY FOR TESTERS
INSERT INTO app_config (key, value, description) VALUES
    ('limit_internal_api_cost_cents_tester', '2000', 'TESTER: Monthly free internal API cost allowance (cents). 0 for unlimited.'),
    ('limit_neuroswitch_requests_tester', '2000', 'TESTER: Monthly free NeuroSwitch request allowance. 0 for unlimited.')
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

-- New settings for Pricing & Billing
INSERT INTO app_config (key, value, description) VALUES
    ('pricing_prime_percentage', '20', 'Global pricing prime percentage (e.g., 20 for 20%). Applied to LLM costs.'),
    ('neuroswitch_classifier_fee_cents', '1', 'NeuroSwitch classifier fee in cents (e.g., 1 for $0.001, 10 for $0.01).')
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP; 