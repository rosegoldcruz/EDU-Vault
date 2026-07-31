import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { after, before, test } from "node:test";

const PORT = 3999;
const BASE = `http://127.0.0.1:${PORT}`;

let server;

async function waitForServer(timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE}/`, { headers: { accept: "text/html" } });
      if (response.status < 500) return;
    } catch {
      // server not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("next start did not become ready in time");
}

before(async () => {
  server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    cwd: new URL("..", import.meta.url).pathname,
    stdio: "ignore",
    env: { ...process.env, NODE_ENV: "production" },
  });
  await waitForServer();
});

after(() => {
  server?.kill("SIGTERM");
});

async function request(path, init) {
  return fetch(`${BASE}${path}`, { redirect: "manual", ...init });
}

test("public homepage remains intact", async () => {
  const response = await request("/", { headers: { accept: "text/html" } });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Iron Vault \| Vaulted Academy/);
  assert.match(html, /Learn first\./);
  assert.match(html, /Participate with context\./);
  assert.match(html, /The token is a component\./);
  assert.match(html, /Not the whole machine\./);
  assert.match(html, /Built in the open/);
});

test("login renders a finite authentication state", async () => {
  const response = await request("/login", { headers: { accept: "text/html" } });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Continue your /);
  assert.match(html, /learning path\./);
  assert.match(html, /Restoring your secure session|Privy configuration required|Sign in with Privy/);
});

test("protected page redirects and protected API rejects anonymous access", async () => {
  const page = await request("/dashboard", { headers: { accept: "text/html" } });
  assert.ok([302, 303, 307, 308].includes(page.status));
  assert.match(page.headers.get("location") ?? "", /\/login\?returnTo=|\/access-required/);

  const api = await request("/api/rewards/status", { headers: { accept: "application/json" } });
  assert.equal(api.status, 401);

  const academyState = await request("/api/academy/state", { headers: { accept: "application/json" } });
  assert.equal(academyState.status, 401);
});

test("academy hub requires a server-authenticated member session", async () => {
  const response = await request("/academy", { headers: { accept: "text/html" } });
  assert.ok([302, 303, 307, 308].includes(response.status));
  assert.match(response.headers.get("location") ?? "", /\/login\?returnTo=|\/access-required/);
});

test("retired member learning routes return to the restored academy", async () => {
  for (const path of ["/entry-test", "/academy/lessons/retired-foundation"]) {
    const response = await request(path, { headers: { accept: "text/html" } });
    assert.ok([302, 303, 307, 308].includes(response.status));
    assert.equal(response.headers.get("location"), "/academy");
  }
});

test("session inspection endpoint rejects anonymous access without method drift", async () => {
  const response = await request("/api/auth/privy-session", {
    headers: { accept: "application/json" },
  });
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), {
    ok: false,
    authenticated: false,
    reason: "session_not_authenticated",
  });
});
