-- ============================================================================
-- KreceAgro — Esquema Relacional de Respaldo en PostgreSQL 16+
-- Crédito Avícola y Porcícola para Bodegas, Abastos y Revendedores
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  uid VARCHAR(128) PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  initials VARCHAR(4) NOT NULL,
  business_name VARCHAR(120) NOT NULL,
  business_type VARCHAR(50) NOT NULL CHECK (
    business_type IN (
      'Bodega de Barrio',
      'Abasto / Charcutería',
      'Revendedor / Ruta',
      'Mini Frigorífico'
    )
  ),
  demand_zone VARCHAR(120) NOT NULL,
  cold_chain VARCHAR(80) NOT NULL,
  points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  tier_name VARCHAR(40) NOT NULL DEFAULT 'Bronce',
  credit_limit NUMERIC(12, 2) NOT NULL DEFAULT 250.00 CHECK (credit_limit >= 0),
  referral_code VARCHAR(24) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_private_info (
  uid VARCHAR(128) PRIMARY KEY REFERENCES users(uid) ON DELETE CASCADE,
  full_name VARCHAR(120) NOT NULL,
  dni VARCHAR(32) NOT NULL,
  address VARCHAR(220) NOT NULL,
  seniority VARCHAR(60) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  email VARCHAR(140) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suppliers (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(8) NOT NULL,
  name VARCHAR(140) NOT NULL,
  handle VARCHAR(64) NOT NULL,
  category VARCHAR(24) NOT NULL CHECK (
    category IN ('avicola', 'porcicola', 'mixto', 'equipamiento')
  ),
  zone VARCHAR(120) NOT NULL,
  city VARCHAR(80) NOT NULL,
  wholesale_rate_per_kg NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  suggested_retail_per_kg NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  phone VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_applications (
  id VARCHAR(128) PRIMARY KEY,
  owner_uid VARCHAR(128) NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  supplier_id VARCHAR(64) NOT NULL,
  contract_code VARCHAR(40) NOT NULL UNIQUE,
  dispatch_code VARCHAR(40) NOT NULL,
  title VARCHAR(160) NOT NULL,
  category VARCHAR(24) NOT NULL CHECK (
    category IN ('avicola', 'porcicola', 'mixto', 'capital')
  ),
  zone VARCHAR(220) NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  initial_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  remaining_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total_installments INTEGER NOT NULL CHECK (total_installments BETWEEN 1 AND 12),
  paid_installments INTEGER NOT NULL DEFAULT 0,
  next_due_date VARCHAR(40) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'completed')),
  approval_status VARCHAR(20) NOT NULL DEFAULT 'aprobado' CHECK (
    approval_status IN ('aprobado', 'en_revision')
  ),
  cold_chain_insured BOOLEAN NOT NULL DEFAULT FALSE,
  weight_kg NUMERIC(10, 2),
  estimated_margin_pct NUMERIC(6, 2),
  purpose TEXT,
  collateral_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_installments (
  id VARCHAR(128) PRIMARY KEY,
  credit_id VARCHAR(128) NOT NULL REFERENCES credit_applications(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL CHECK (installment_number >= 1),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  due_date DATE NOT NULL,
  due_label VARCHAR(60) NOT NULL,
  paid BOOLEAN NOT NULL DEFAULT FALSE,
  paid_date VARCHAR(40),
  UNIQUE (credit_id, installment_number)
);

CREATE TABLE IF NOT EXISTS coupons (
  id VARCHAR(128) PRIMARY KEY,
  owner_uid VARCHAR(128) NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  title VARCHAR(120) NOT NULL,
  description VARCHAR(220) NOT NULL,
  discount_amount NUMERIC(10, 2) NOT NULL CHECK (discount_amount >= 0),
  category_filter VARCHAR(24) NOT NULL CHECK (
    category_filter IN ('avicola', 'porcicola', 'mixto', 'capital', 'all')
  ),
  expires_at VARCHAR(40) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('available', 'used', 'expired')),
  code VARCHAR(32) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_credits_owner ON credit_applications(owner_uid);
CREATE INDEX IF NOT EXISTS idx_credits_status ON credit_applications(status);
CREATE INDEX IF NOT EXISTS idx_installments_credit ON credit_installments(credit_id);
CREATE INDEX IF NOT EXISTS idx_coupons_owner ON coupons(owner_uid);
