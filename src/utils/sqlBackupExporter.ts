import { Coupon, CreditRecord, MerchantProfile, Supplier } from '../types/credit';

export type SqlDialect = 'postgresql' | 'mysql';

function esc(value: string | undefined | null): string {
  if (!value) return "''";
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
}

export function generateSqlBackup(
  dialect: SqlDialect,
  uid: string,
  merchant: MerchantProfile,
  credits: CreditRecord[],
  coupons: Coupon[],
  suppliers: Supplier[]
): string {
  const isPg = dialect === 'postgresql';
  const lines: string[] = [];

  lines.push(`-- ============================================================================`);
  lines.push(
    `-- Respaldo de Datos KreceAgro (${isPg ? 'PostgreSQL 16+' : 'MySQL 8.0+ InnoDB'})`
  );
  lines.push(`-- Generado: ${new Date().toISOString()}`);
  lines.push(`-- Usuario UID: ${uid}`);
  lines.push(`-- ============================================================================`);
  lines.push('');

  if (isPg) {
    lines.push('BEGIN;');
  } else {
    lines.push('START TRANSACTION;');
  }
  lines.push('');

  // 1. User Commercial Profile
  lines.push('-- 1. Perfil comercial del usuario');
  lines.push(
    isPg
      ? `INSERT INTO users (uid, first_name, initials, business_name, business_type, demand_zone, cold_chain, points, tier_name, credit_limit, referral_code)
VALUES (${esc(uid)}, ${esc(merchant.firstName)}, ${esc(merchant.initials)}, ${esc(merchant.businessName)}, ${esc(merchant.businessType)}, ${esc(merchant.zone)}, ${esc(merchant.coldChain)}, ${merchant.points}, ${esc(merchant.tierName)}, ${merchant.creditLimit.toFixed(2)}, ${esc(merchant.referralCode)})
ON CONFLICT (uid) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  business_type = EXCLUDED.business_type,
  demand_zone = EXCLUDED.demand_zone,
  cold_chain = EXCLUDED.cold_chain,
  points = EXCLUDED.points,
  tier_name = EXCLUDED.tier_name,
  credit_limit = EXCLUDED.credit_limit;`
      : `INSERT INTO users (uid, first_name, initials, business_name, business_type, demand_zone, cold_chain, points, tier_name, credit_limit, referral_code)
VALUES (${esc(uid)}, ${esc(merchant.firstName)}, ${esc(merchant.initials)}, ${esc(merchant.businessName)}, ${esc(merchant.businessType)}, ${esc(merchant.zone)}, ${esc(merchant.coldChain)}, ${merchant.points}, ${esc(merchant.tierName)}, ${merchant.creditLimit.toFixed(2)}, ${esc(merchant.referralCode)})
ON DUPLICATE KEY UPDATE
  business_name = VALUES(business_name),
  business_type = VALUES(business_type),
  demand_zone = VALUES(demand_zone),
  cold_chain = VALUES(cold_chain),
  points = VALUES(points),
  tier_name = VALUES(tier_name),
  credit_limit = VALUES(credit_limit);`
  );
  lines.push('');

  // 2. Private User Info
  lines.push('-- 2. Información personal y contacto del solicitante');
  lines.push(
    isPg
      ? `INSERT INTO user_private_info (uid, full_name, dni, address, seniority, phone, email)
VALUES (${esc(uid)}, ${esc(merchant.fullName)}, ${esc(merchant.rifOrId)}, ${esc(merchant.address)}, ${esc(merchant.seniority)}, ${esc(merchant.phone)}, ${esc(merchant.email)})
ON CONFLICT (uid) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  dni = EXCLUDED.dni,
  address = EXCLUDED.address,
  seniority = EXCLUDED.seniority,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email;`
      : `INSERT INTO user_private_info (uid, full_name, dni, address, seniority, phone, email)
VALUES (${esc(uid)}, ${esc(merchant.fullName)}, ${esc(merchant.rifOrId)}, ${esc(merchant.address)}, ${esc(merchant.seniority)}, ${esc(merchant.phone)}, ${esc(merchant.email)})
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  dni = VALUES(dni),
  address = VALUES(address),
  seniority = VALUES(seniority),
  phone = VALUES(phone),
  email = VALUES(email);`
  );
  lines.push('');

  // 3. Suppliers catalog
  lines.push('-- 3. Proveedores y mataderos aliados');
  for (const sup of suppliers) {
    lines.push(
      isPg
        ? `INSERT INTO suppliers (id, code, name, handle, category, zone, city, wholesale_rate_per_kg, suggested_retail_per_kg, phone)
VALUES (${esc(sup.id)}, ${esc(sup.code)}, ${esc(sup.name)}, ${esc(sup.handle)}, ${esc(sup.category)}, ${esc(sup.zone)}, ${esc(sup.city)}, ${sup.wholesaleRatePerKg.toFixed(2)}, ${sup.suggestedRetailPerKg.toFixed(2)}, ${esc(sup.phone)})
ON CONFLICT (id) DO NOTHING;`
        : `INSERT IGNORE INTO suppliers (id, code, name, handle, category, zone, city, wholesale_rate_per_kg, suggested_retail_per_kg, phone)
VALUES (${esc(sup.id)}, ${esc(sup.code)}, ${esc(sup.name)}, ${esc(sup.handle)}, ${esc(sup.category)}, ${esc(sup.zone)}, ${esc(sup.city)}, ${sup.wholesaleRatePerKg.toFixed(2)}, ${sup.suggestedRetailPerKg.toFixed(2)}, ${esc(sup.phone)});`
    );
  }
  lines.push('');

  // 4. Credit Applications & Installments
  lines.push('-- 4. Solicitudes de crédito y cuotas semanales');
  for (const cred of credits) {
    const collateralStr = cred.applicantDetails?.collateral
      ? JSON.stringify(cred.applicantDetails.collateral)
      : null;
    const purposeStr = cred.applicantDetails?.purpose || cred.title;

    lines.push(
      isPg
        ? `INSERT INTO credit_applications (id, owner_uid, supplier_id, contract_code, dispatch_code, title, category, zone, total_amount, initial_paid, paid_amount, remaining_amount, total_installments, paid_installments, next_due_date, status, approval_status, cold_chain_insured, weight_kg, estimated_margin_pct, purpose, collateral_json)
VALUES (${esc(cred.id)}, ${esc(uid)}, ${esc(cred.supplierId)}, ${esc(cred.contractCode)}, ${esc(cred.dispatchCode)}, ${esc(cred.title)}, ${esc(cred.category)}, ${esc(cred.zone)}, ${cred.totalAmount.toFixed(2)}, ${cred.initialPaid.toFixed(2)}, ${cred.paidAmount.toFixed(2)}, ${cred.remainingAmount.toFixed(2)}, ${cred.totalInstallments}, ${cred.paidInstallments}, ${esc(cred.nextDueDate)}, ${esc(cred.status)}, ${esc(cred.approvalStatus || 'aprobado')}, ${cred.coldChainInsured ? 'TRUE' : 'FALSE'}, ${cred.weightKg ?? 'NULL'}, ${cred.estimatedMarginPct ?? 'NULL'}, ${esc(purposeStr)}, ${collateralStr ? `${esc(collateralStr)}::jsonb` : 'NULL'})
ON CONFLICT (id) DO UPDATE SET
  paid_amount = EXCLUDED.paid_amount,
  remaining_amount = EXCLUDED.remaining_amount,
  paid_installments = EXCLUDED.paid_installments,
  status = EXCLUDED.status;`
        : `INSERT INTO credit_applications (id, owner_uid, supplier_id, contract_code, dispatch_code, title, category, zone, total_amount, initial_paid, paid_amount, remaining_amount, total_installments, paid_installments, next_due_date, status, approval_status, cold_chain_insured, weight_kg, estimated_margin_pct, purpose, collateral_json)
VALUES (${esc(cred.id)}, ${esc(uid)}, ${esc(cred.supplierId)}, ${esc(cred.contractCode)}, ${esc(cred.dispatchCode)}, ${esc(cred.title)}, ${esc(cred.category)}, ${esc(cred.zone)}, ${cred.totalAmount.toFixed(2)}, ${cred.initialPaid.toFixed(2)}, ${cred.paidAmount.toFixed(2)}, ${cred.remainingAmount.toFixed(2)}, ${cred.totalInstallments}, ${cred.paidInstallments}, ${esc(cred.nextDueDate)}, ${esc(cred.status)}, ${esc(cred.approvalStatus || 'aprobado')}, ${cred.coldChainInsured ? 1 : 0}, ${cred.weightKg ?? 'NULL'}, ${cred.estimatedMarginPct ?? 'NULL'}, ${esc(purposeStr)}, ${collateralStr ? esc(collateralStr) : 'NULL'})
ON DUPLICATE KEY UPDATE
  paid_amount = VALUES(paid_amount),
  remaining_amount = VALUES(remaining_amount),
  paid_installments = VALUES(paid_installments),
  status = VALUES(status);`
    );

    for (const inst of cred.installments) {
      lines.push(
        isPg
          ? `INSERT INTO credit_installments (id, credit_id, installment_number, amount, due_date, due_label, paid, paid_date)
VALUES (${esc(inst.id)}, ${esc(cred.id)}, ${inst.number}, ${inst.amount.toFixed(2)}, ${esc(inst.dueDate)}, ${esc(inst.dueLabel)}, ${inst.paid ? 'TRUE' : 'FALSE'}, ${inst.paidDate ? esc(inst.paidDate) : 'NULL'})
ON CONFLICT (id) DO UPDATE SET paid = EXCLUDED.paid, paid_date = EXCLUDED.paid_date;`
          : `INSERT INTO credit_installments (id, credit_id, installment_number, amount, due_date, due_label, paid, paid_date)
VALUES (${esc(inst.id)}, ${esc(cred.id)}, ${inst.number}, ${inst.amount.toFixed(2)}, ${esc(inst.dueDate)}, ${esc(inst.dueLabel)}, ${inst.paid ? 1 : 0}, ${inst.paidDate ? esc(inst.paidDate) : 'NULL'})
ON DUPLICATE KEY UPDATE paid = VALUES(paid), paid_date = VALUES(paid_date);`
      );
    }
  }
  lines.push('');

  // 5. Coupons
  lines.push('-- 5. Cupones del comercio');
  for (const cup of coupons) {
    lines.push(
      isPg
        ? `INSERT INTO coupons (id, owner_uid, title, description, discount_amount, category_filter, expires_at, status, code)
VALUES (${esc(cup.id)}, ${esc(uid)}, ${esc(cup.title)}, ${esc(cup.description)}, ${cup.discountAmount.toFixed(2)}, ${esc(cup.categoryFilter)}, ${esc(cup.expiresAt)}, ${esc(cup.status)}, ${esc(cup.code)})
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;`
        : `INSERT INTO coupons (id, owner_uid, title, description, discount_amount, category_filter, expires_at, status, code)
VALUES (${esc(cup.id)}, ${esc(uid)}, ${esc(cup.title)}, ${esc(cup.description)}, ${cup.discountAmount.toFixed(2)}, ${esc(cup.categoryFilter)}, ${esc(cup.expiresAt)}, ${esc(cup.status)}, ${esc(cup.code)})
ON DUPLICATE KEY UPDATE status = VALUES(status);`
    );
  }

  lines.push('');
  lines.push('COMMIT;');
  return lines.join('\n');
}
