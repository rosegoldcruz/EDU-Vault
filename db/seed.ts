import { mkdir } from "node:fs/promises";
import { getDb } from "./index";
import { seedCoreCurriculum } from "../lib/academy/service";

if (!process.env.DATABASE_URL) await mkdir(".data", { recursive: true });
await seedCoreCurriculum(getDb());
console.log("Vaulted Academy curriculum seeded.");
