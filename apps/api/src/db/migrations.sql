-- Enable uuid-ossp if gen_random_uuid() is not built-in, though Postgres 13+ has it built-in.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    phone_verified_at TIMESTAMP WITH TIME ZONE,
    email VARCHAR(255) UNIQUE,
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(255),
    name VARCHAR(255),
    dob DATE,
    profile_photo_asset_id UUID, -- Foreign key added later to avoid circular dependency
    storage_used_bytes BIGINT DEFAULT 0 NOT NULL,
    storage_quota_bytes BIGINT DEFAULT 52428800 NOT NULL, -- 50MB
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    headline VARCHAR(255),
    career_goal TEXT,
    bio TEXT,
    completion_pct INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. profile_sections
CREATE TABLE IF NOT EXISTS profile_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'about', 'education', 'projects', 'experience', 'certificates', 'achievements', 'research', 'contact'
    entries JSONB[] DEFAULT '{}'::JSONB[] NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    position INTEGER DEFAULT 0 NOT NULL,
    UNIQUE(profile_id, type)
);

-- 4. assets
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    section_type VARCHAR(50) NOT NULL, -- 'resume', 'photo', 'project', 'certificate', 'achievement', 'research'
    entry_id UUID,
    kind VARCHAR(20) NOT NULL, -- 'image', 'pdf'
    gcs_path TEXT NOT NULL,
    cdn_asset_id VARCHAR(255) UNIQUE NOT NULL,
    size_bytes BIGINT NOT NULL,
    width INTEGER,
    height INTEGER,
    thumbnail_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Circular reference constraint on users
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_profile_photo;
ALTER TABLE users ADD CONSTRAINT fk_profile_photo FOREIGN KEY (profile_photo_asset_id) REFERENCES assets(id) ON DELETE SET NULL;

-- 5. entry_links
CREATE TABLE IF NOT EXISTS entry_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID NOT NULL, -- references entry in profile_sections entries JSONB
    section_type VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    label VARCHAR(255) NOT NULL,
    position INTEGER DEFAULT 0 NOT NULL
);

-- 6. organizations
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) UNIQUE NOT NULL,
    plan_type VARCHAR(50) NOT NULL
);

-- 7. activation_keys
CREATE TABLE IF NOT EXISTS activation_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    batch_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'unused' NOT NULL, -- 'unused', 'redeemed', 'expired', 'revoked'
    redeemed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    redeemed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 8. templates
CREATE TABLE IF NOT EXISTS templates (
    id VARCHAR(50) PRIMARY KEY, -- 'minimal', 'editorial', 'bold'
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    thumbnail_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    tier VARCHAR(20) DEFAULT 'free' NOT NULL -- 'free', 'paid'
);

-- 9. theme_variants
CREATE TABLE IF NOT EXISTS theme_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id VARCHAR(50) NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    tokens JSONB NOT NULL
);

-- 10. portfolios
CREATE TABLE IF NOT EXISTS portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    handle VARCHAR(100) UNIQUE NOT NULL,
    selected_template_id VARCHAR(50) REFERENCES templates(id) ON DELETE SET NULL,
    selected_theme_id UUID REFERENCES theme_variants(id) ON DELETE SET NULL,
    domain_id UUID, -- nullable domain mapping ID added later or just kept as raw uuid
    is_indexable BOOLEAN DEFAULT true NOT NULL,
    is_published BOOLEAN DEFAULT false NOT NULL,
    draft_preview_token VARCHAR(255) UNIQUE,
    published_at TIMESTAMP WITH TIME ZONE
);

-- 11. domain_mappings
CREATE TABLE IF NOT EXISTS domain_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain VARCHAR(255) UNIQUE NOT NULL,
    portfolio_id UUID UNIQUE NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    verified_at TIMESTAMP WITH TIME ZONE
);

-- Add domain mapping reference to portfolios
ALTER TABLE portfolios DROP CONSTRAINT IF EXISTS fk_portfolio_domain;
ALTER TABLE portfolios ADD CONSTRAINT fk_portfolio_domain FOREIGN KEY (domain_id) REFERENCES domain_mappings(id) ON DELETE SET NULL;

-- 12. subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source VARCHAR(50) NOT NULL, -- 'activation_key', 'purchase'
    plan VARCHAR(50) NOT NULL, -- 'annual', 'lifetime'
    razorpay_sub_id VARCHAR(255),
    activation_key_id UUID REFERENCES activation_keys(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL, -- 'active', 'cancelled', 'expired', 'past_due'
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 13. payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    razorpay_payment_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 14. analytics_events
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    visitor_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- INDEXES for Query Optimization
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_profile_sections_entries ON profile_sections USING gin(entries);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_activation_keys_code ON activation_keys(code);
CREATE INDEX IF NOT EXISTS idx_portfolios_handle ON portfolios(handle);
CREATE INDEX IF NOT EXISTS idx_analytics_events_portfolio ON analytics_events(portfolio_id);

-- 15. audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    target_id VARCHAR(255),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON audit_logs(admin_user_id);
