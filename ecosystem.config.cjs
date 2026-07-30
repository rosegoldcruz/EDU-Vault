module.exports = {
  apps: [
    {
      name: "iron-vault-web",
      cwd: "/opt/iron-vault/apps/web",
      script: "pnpm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: "3000"
      }
    },
    {
      name: "iron-vault-info",
      cwd: "/opt/iron-vault/apps/info",
      script: "pnpm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: "3002"
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
