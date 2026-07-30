import crypto from "node:crypto";

import "dotenv/config";

import { getPaymentsPool as getPool } from "../lib/server/payments-db";

const products = [
  {
    code: "academy-monthly",
    name: "Vaulted Academy Monthly",
    amountCents: 9900,
    currency: "USD",
    entitlementKey: "academy.monthly",
  },
  {
    code: "academy-annual",
    name: "Vaulted Academy Annual",
    amountCents: 99000,
    currency: "USD",
    entitlementKey: "academy.annual",
  },
] as const;

async function run(): Promise<void> {
  const pool = getPool();

  for (const product of products) {
    await pool.query(
      `
      INSERT INTO products (id, code, name, amount_cents, currency, entitlement_key)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (code)
      DO UPDATE SET
        name = EXCLUDED.name,
        amount_cents = EXCLUDED.amount_cents,
        currency = EXCLUDED.currency,
        entitlement_key = EXCLUDED.entitlement_key,
        is_active = TRUE
      `,
      [
        crypto.randomUUID(),
        product.code,
        product.name,
        product.amountCents,
        product.currency,
        product.entitlementKey,
      ],
    );
  }

  await pool.end();
  console.log("Database seed completed.");
}

run().catch((error) => {
  console.error("Database seed failed.", error);
  process.exitCode = 1;
});
