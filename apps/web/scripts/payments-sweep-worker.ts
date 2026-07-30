import "dotenv/config";

import { getPaymentsPool } from "../lib/server/payments-db";

function intervalMs(): number {
  const parsed = Number(process.env.WORKER_INTERVAL_MS);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 60_000;
}

async function expireStalePendingPayments(): Promise<void> {
  const result = await getPaymentsPool().query(
    `
      UPDATE payments
      SET status = 'expired'
      WHERE status = 'pending'
        AND created_at < NOW() - INTERVAL '1 day'
      RETURNING id
    `,
  );

  if (result.rowCount && result.rowCount > 0) {
    console.log(`expired ${result.rowCount} stale pending payments`);
  }
}

async function runSweep(): Promise<void> {
  try {
    await expireStalePendingPayments();
  } catch (error) {
    console.error("worker sweep failed", error);
  }
}

const interval = intervalMs();
console.log(`iron-vault payments sweep started (interval=${interval}ms)`);
void runSweep();
setInterval(() => {
  void runSweep();
}, interval);
