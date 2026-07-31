const fs = require("node:fs");

function readRequiredEnvValue(path, name) {
  const line = fs
    .readFileSync(path, "utf8")
    .split(/\r?\n/)
    .find((entry) => entry.startsWith(`${name}=`));
  const rawValue = line?.slice(name.length + 1).trim();
  const value =
    rawValue &&
    ((rawValue.startsWith('"') && rawValue.endsWith('"')) ||
      (rawValue.startsWith("'") && rawValue.endsWith("'")))
      ? rawValue.slice(1, -1)
      : rawValue;

  if (!value) {
    throw new Error(`Missing ${name} in ${path}`);
  }

  return value;
}

const databaseUrl = readRequiredEnvValue(
  "/opt/iron-vault/secrets/database.env",
  "DATABASE_URL"
);
const stagingPrivyAppId = readRequiredEnvValue(
  "/opt/iron-vault/.env",
  "STAGING_PRIVY_APP_ID"
);
const stagingPrivyAppSecret = readRequiredEnvValue(
  "/opt/iron-vault/.env",
  "STAGING_PRIVY_APP_SECRET"
);

module.exports = {
  apps: [
    {
      name: "iron-vault-web",
      cwd: "/opt/iron-vault/apps/web",
      script: "pnpm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        DATABASE_URL: databaseUrl,
        ACADEMY_RELEASE_VERSION: "legacy-2026-import-v1"
      },
      env_staging: {
        NODE_ENV: "production",
        PORT: "3000",
        APP_WEB_ORIGIN: "https://staging.ironvaulttoken.com",
        DATABASE_URL: databaseUrl,
        ACADEMY_RELEASE_VERSION: "legacy-2026-import-v1",
        NEXT_PUBLIC_PRIVY_APP_ID: stagingPrivyAppId,
        PRIVY_APP_ID: stagingPrivyAppId,
        PRIVY_APP_SECRET: stagingPrivyAppSecret
      }
    },
    {
      name: "iron-vault-payments-sweep",
      cwd: "/opt/iron-vault/apps/web",
      script: "pnpm",
      args: "payments:sweep",
      env: {
        NODE_ENV: "production",
        WORKER_INTERVAL_MS: "60000"
      }
    }
  ]
};
