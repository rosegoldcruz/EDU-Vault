CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TABLE visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  browser_token_hash TEXT NOT NULL UNIQUE,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  first_touch JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_touch JSONB NOT NULL DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (length(browser_token_hash) >= 32)
);

CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'active',
  display_name TEXT,
  locale TEXT,
  timezone TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (status IN ('active', 'suspended', 'closed'))
);

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID REFERENCES visitors(id) ON DELETE SET NULL,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  email TEXT,
  source TEXT NOT NULL DEFAULT 'unknown',
  lifecycle_status TEXT NOT NULL DEFAULT 'new',
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  consent_recorded_at TIMESTAMPTZ,
  consent_source TEXT,
  acquisition JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (lifecycle_status IN ('new', 'engaged', 'member', 'unsubscribed', 'invalid')),
  CHECK (
    marketing_consent = FALSE
    OR consent_recorded_at IS NOT NULL
  )
);

CREATE TABLE identity_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  provider TEXT NOT NULL,
  provider_subject TEXT NOT NULL,
  provider_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  first_authenticated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_authenticated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, provider_subject)
);

CREATE TABLE member_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  normalized_email TEXT GENERATED ALWAYS AS (lower(btrim(email))) STORED,
  source TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (member_id, normalized_email),
  CHECK (length(normalized_email) > 3)
);

CREATE UNIQUE INDEX member_emails_one_primary_per_member
  ON member_emails (member_id)
  WHERE is_primary;

CREATE INDEX member_emails_normalized_email_idx
  ON member_emails (normalized_email);

CREATE TABLE member_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  chain TEXT NOT NULL,
  network TEXT NOT NULL,
  address TEXT NOT NULL,
  normalized_address TEXT NOT NULL,
  wallet_type TEXT NOT NULL,
  provider TEXT NOT NULL,
  ownership_status TEXT NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  is_reward BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (chain, network, normalized_address),
  CHECK (wallet_type IN ('embedded', 'external')),
  CHECK (ownership_status IN ('pending', 'verified', 'revoked')),
  CHECK (
    ownership_status <> 'verified'
    OR verified_at IS NOT NULL
  )
);

CREATE UNIQUE INDEX member_wallets_one_primary_per_member
  ON member_wallets (member_id)
  WHERE is_primary;

CREATE UNIQUE INDEX member_wallets_one_reward_per_member
  ON member_wallets (member_id)
  WHERE is_reward;

CREATE INDEX member_wallets_member_idx ON member_wallets (member_id);

CREATE TABLE wallet_verification_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  chain TEXT NOT NULL,
  network TEXT NOT NULL,
  normalized_address TEXT NOT NULL,
  nonce_hash TEXT NOT NULL UNIQUE,
  message TEXT NOT NULL,
  origin TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (expires_at > created_at)
);

CREATE INDEX wallet_verification_challenges_member_created_idx
  ON wallet_verification_challenges (member_id, created_at DESC);

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE member_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  granted_by_member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  reason TEXT,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  UNIQUE NULLS NOT DISTINCT (member_id, role_id, revoked_at),
  CHECK (revoked_at IS NULL OR revoked_at >= granted_at)
);

INSERT INTO roles (code, name, description)
VALUES
  ('member', 'Member', 'Standard authenticated Iron Vault member'),
  ('admin', 'Administrator', 'Operational administration authority'),
  ('support', 'Support', 'Member support authority without commercial administration'),
  ('content_editor', 'Content editor', 'Curriculum drafting and editorial workflow authority')
ON CONFLICT (code) DO NOTHING;

CREATE INDEX leads_visitor_idx ON leads (visitor_id);
CREATE INDEX leads_member_idx ON leads (member_id);
CREATE INDEX identity_accounts_member_idx ON identity_accounts (member_id);
CREATE INDEX member_role_assignments_active_member_idx
  ON member_role_assignments (member_id)
  WHERE revoked_at IS NULL;

CREATE TRIGGER set_visitors_updated_at
BEFORE UPDATE ON visitors
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_members_updated_at
BEFORE UPDATE ON members
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_leads_updated_at
BEFORE UPDATE ON leads
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_identity_accounts_updated_at
BEFORE UPDATE ON identity_accounts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_member_emails_updated_at
BEFORE UPDATE ON member_emails
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_member_wallets_updated_at
BEFORE UPDATE ON member_wallets
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
