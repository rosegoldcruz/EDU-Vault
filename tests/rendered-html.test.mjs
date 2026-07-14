import assert from "node:assert/strict";
import test from "node:test";

async function getWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  return (await import(workerUrl.href)).default;
}

async function request(path, init) {
  const worker = await getWorker();
  return worker.fetch(
    new Request(`http://localhost${path}`, init),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("public homepage remains intact", async () => {
  const response = await request("/", { headers: { accept: "text/html" } });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Iron Vault \| Vaulted Academy/);
  assert.match(html, /Don.t chase the future/);
  assert.match(html, /See how the academy works/);
});

test("login renders a finite authentication state", async () => {
  const response = await request("/login", { headers: { accept: "text/html" } });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Continue your learning path/);
  assert.match(html, /Restoring your secure session|Privy configuration required|Sign in with Privy/);
});

test("protected page redirects and protected API rejects anonymous access", async () => {
  const page = await request("/academy", { headers: { accept: "text/html" }, redirect: "manual" });
  assert.ok([302, 303, 307, 308].includes(page.status));
  assert.match(page.headers.get("location") ?? "", /\/login\?returnTo=/);

  const api = await request("/api/academy/state", { headers: { accept: "application/json" } });
  assert.equal(api.status, 401);
});
