import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

export type AcademyDatabase = LibSQLDatabase<typeof schema>;

let client: Client | null = null;
let database: AcademyDatabase | null = null;

function databaseConfig() {
  const url = process.env.DATABASE_URL;
  if (!url && process.env.NODE_ENV === "production") {
    throw new Error(
      "DATABASE_URL is required in production. Use a persistent LibSQL/Turso URL for Vercel.",
    );
  }

  return {
    url: url ?? "file:.data/academy.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  };
}

export function createAcademyDatabase(
  url: string,
  authToken?: string,
): AcademyDatabase {
  return drizzle(createClient({ url, authToken }), { schema });
}

export function getDb(): AcademyDatabase {
  if (!database) {
    client = createClient(databaseConfig());
    database = drizzle(client, { schema });
  }
  return database;
}

export function resetDatabaseForTests() {
  client?.close();
  client = null;
  database = null;
}
