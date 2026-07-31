import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config as loadEnv } from "dotenv";

import { closeDatabasePool, getDatabasePool } from "./index";

type AppliedMigration = {
  name: string;
  checksum: string;
};

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryDirectory = resolve(packageDirectory, "../..");
const migrationsDirectory = join(packageDirectory, "migrations");
const migrationLockId = 4_290_761_981;

function loadDatabaseEnvironment(): void {
  if (process.env.DATABASE_URL) return;

  const candidates = [
    join(repositoryDirectory, "secrets/database.env"),
    join(repositoryDirectory, ".env"),
  ];

  for (const path of candidates) {
    loadEnv({ path, override: false });
    if (process.env.DATABASE_URL) return;
  }
}

function checksum(contents: string): string {
  return createHash("sha256").update(contents).digest("hex");
}

async function run(): Promise<void> {
  loadDatabaseEnvironment();
  const pool = getDatabasePool({ application_name: "iron-vault-migrations" });
  const client = await pool.connect();

  try {
    await client.query("SELECT pg_advisory_lock($1)", [migrationLockId]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        checksum TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const files = (await readdir(migrationsDirectory))
      .filter((file) => /^\d{4}_[a-z0-9_]+\.sql$/.test(file))
      .sort();
    const appliedResult = await client.query<AppliedMigration>(
      "SELECT name, checksum FROM schema_migrations",
    );
    const applied = new Map(
      appliedResult.rows.map((migration) => [migration.name, migration.checksum]),
    );

    let appliedCount = 0;

    for (const name of files) {
      const sql = await readFile(join(migrationsDirectory, name), "utf8");
      const migrationChecksum = checksum(sql);
      const previousChecksum = applied.get(name);

      if (previousChecksum) {
        if (previousChecksum !== migrationChecksum) {
          throw new Error(`Applied migration checksum mismatch: ${name}`);
        }
        continue;
      }

      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)",
          [name, migrationChecksum],
        );
        await client.query("COMMIT");
        appliedCount += 1;
        console.log(`Applied migration ${name}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    console.log(
      appliedCount === 0
        ? "Database schema is current."
        : `Applied ${appliedCount} database migration(s).`,
    );
  } finally {
    try {
      await client.query("SELECT pg_advisory_unlock($1)", [migrationLockId]);
    } finally {
      client.release();
      await closeDatabasePool();
    }
  }
}

run().catch((error: unknown) => {
  console.error(
    "Database migration failed:",
    error instanceof Error ? error.message : "Unknown error",
  );
  process.exitCode = 1;
});
