import crypto from "node:crypto";

import "dotenv/config";

import { getPaymentsPool as getPool } from "../lib/server/payments-db";

const migrationSql = `
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  entitlement_key TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  member_id TEXT,
  email TEXT NOT NULL,
  product_id TEXT NOT NULL REFERENCES products(id),
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_session_id TEXT,
  provider_payment_id TEXT,
  checkout_session_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS entitlements (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  entitlement_key TEXT NOT NULL,
  payment_id TEXT REFERENCES payments(id),
  source TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (member_id, entitlement_key)
);

CREATE TABLE IF NOT EXISTS gateway_notifications (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  signature_valid BOOLEAN NOT NULL,
  checkout_session_id TEXT,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  actor TEXT NOT NULL,
  subject_type TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

async function run(): Promise<void> {
  const pool = getPool();
  await pool.query(migrationSql);

  await pool.query(
    `
      INSERT INTO audit_events (id, event_type, actor, subject_type, subject_id, payload)
      VALUES ($1, $2, $3, $4, $5, $6::jsonb)
    `,
    [
      crypto.randomUUID(),
      "migration.applied",
      "system",
      "database",
      "core",
      JSON.stringify({ migration: "api-initial" }),
    ],
  );

  await pool.end();
  console.log("Database migration completed.");
}

run().catch((error) => {
  console.error("Database migration failed.", error);
  process.exitCode = 1;
});
