import { Pool, type PoolClient, type PoolConfig } from "pg";

let pool: Pool | null = null;

export function getDatabasePool(config: PoolConfig = {}): Pool {
  if (!pool) {
    const connectionString = config.connectionString ?? process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("Missing required environment variable: DATABASE_URL");
    }

    pool = new Pool({
      ...config,
      connectionString,
      application_name: config.application_name ?? "iron-vault-web",
    });
  }

  return pool;
}

export async function withDatabaseTransaction<T>(
  run: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getDatabasePool().connect();

  try {
    await client.query("BEGIN");
    const result = await run(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function closeDatabasePool(): Promise<void> {
  if (!pool) return;
  const currentPool = pool;
  pool = null;
  await currentPool.end();
}

export type { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";
