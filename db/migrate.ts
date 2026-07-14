import { mkdir } from "node:fs/promises";
import { migrate } from "drizzle-orm/libsql/migrator";
import { getDb } from "./index";

if (!process.env.DATABASE_URL) await mkdir(".data", { recursive: true });
await migrate(getDb(), { migrationsFolder: "drizzle" });
console.log("Vaulted Academy database migrations applied.");
