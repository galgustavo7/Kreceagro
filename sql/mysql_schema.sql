-- ============================================================================
-- KreceAgro — Esquema Relacional de Respaldo en MySQL 8.0+ (InnoDB / utf8mb4)
-- Crédito Avícola y Porcícola para Bodegas, Abastos y Revendedores
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  uid VARCHAR(128) NOT NULL,
  first_name VARCHAR(80) NOT NULL,
  initials VARCHAR(4) NOT NULL,
  business_name VARCHAR(120) NOT NULL,
  business_type ENUM(
    'Bodega de Barrio',
    'Abasto / Charcutería',
    'Revendedor / Ruta',
    'Mini Frigorífico'
  ) NOT NULL,
  demand_zone VARCHAR(120) NOT NULL,
  cold_chain VARCHAR(80) NOT NULL,
  points INT NOT NULL DEFAULT 0,
  tier_name VARCHAR(40) NOT NULL DEFAULT 'Bronce',
  credit_limit DECIMAL(12, 2) NOT NULL DEFAULT 250.00,
  referral_code VARCHAR(24) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (uid),
  UNIQUE KEY uq_users_referral (referral_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_private_info (
  uid VARCHAR(128) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  dni VARCHAR(32) NOT NULL,
  address VARCHAR(220) NOT NULL,
  seniority VARCHAR(60) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  email VARCHAR(140) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (uid),
  UNIQUE KEY uq_private_email (email),
  CONSTRAINT fk_private_user FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS suppliers (
  id VARCHAR(64) NOT NULL,
  code VARCHAR(8) NOT NULL,
  name VARCHAR(140) NOT NULL,
  handle VARCHAR(64) NOT NULL,
  category ENUM('avicola', 'porcicola', 'mixto', 'equipamiento') NOT NULL,
  zone VARCHAR(120) NOT NULL,
  city VARCHAR(80) NOT NULL,
  wholesale_rate_per_kg DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  suggested_retail_per_kg DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  phone VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS credit_applications (
  id VARCHAR(128) NOT NULL,
  owner_uid VARCHAR(128) NOT NULL,
  supplier_id VARCHAR(64) NOT NULL,
  contract_code VARCHAR(40) NOT NULL,
  dispatch_code VARCHAR(40) NOT NULL,
  title VARCHAR(160) NOT NULL,
  category ENUM('avicola', 'porcicola', 'mixto', 'capital') NOT NULL,
  zone VARCHAR(220) NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  initial_paid DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  remaining_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  total_installments TINYINT UNSIGNED NOT NULL,
  paid_installments TINYINT UNSIGNED NOT NULL DEFAULT 0,
  next_due_date VARCHAR(40) NOT NULL,
  status ENUM('active', 'completed') NOT NULL DEFAULT 'active',
  approval_status ENUM('aprobado', 'en_revision') NOT NULL DEFAULT 'aprobado',
  cold_chain_insured TINYINT(1) NOT NULL DEFAULT 0,
  weight_kg DECIMAL(10, 2) NULL,
  estimated_margin_pct DECIMAL(6, 2) NULL,
  purpose TEXT NULL,
  collateral_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_contract_code (contract_code),
  KEY idx_credits_owner (owner_uid),
  KEY idx_credits_status (status),
  CONSTRAINT fk_credit_owner FOREIGN KEY (owner_uid) REFERENCES users(uid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS credit_installments (
  id VARCHAR(128) NOT NULL,
  credit_id VARCHAR(128) NOT NULL,
  installment_number TINYINT UNSIGNED NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  due_date DATE NOT NULL,
  due_label VARCHAR(60) NOT NULL,
  paid TINYINT(1) NOT NULL DEFAULT 0,
  paid_date VARCHAR(40) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_credit_inst_num (credit_id, installment_number),
  CONSTRAINT fk_inst_credit FOREIGN KEY (credit_id) REFERENCES credit_applications(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS coupons (
  id VARCHAR(128) NOT NULL,
  owner_uid VARCHAR(128) NOT NULL,
  title VARCHAR(120) NOT NULL,
  description VARCHAR(220) NOT NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  category_filter ENUM('avicola', 'porcicola', 'mixto', 'capital', 'all') NOT NULL,
  expires_at VARCHAR(40) NOT NULL,
  status ENUM('available', 'used', 'expired') NOT NULL DEFAULT 'available',
  code VARCHAR(32) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_coupons_owner (owner_uid),
  CONSTRAINT fk_coupon_owner FOREIGN KEY (owner_uid) REFERENCES users(uid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
