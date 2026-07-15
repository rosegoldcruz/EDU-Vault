import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const contracts = readFileSync(new URL("../lib/contracts.ts", import.meta.url), "utf8");
const adapters = readFileSync(new URL("../lib/adapters.ts", import.meta.url), "utf8");
const mocks = readFileSync(new URL("../lib/mock-data.ts", import.meta.url), "utf8");

test("all required adapter domains are represented", () => {
  for (const key of ["identity", "membership", "wallet", "dashboard", "positions", "referrals", "tickets", "rewards", "academy", "status", "vip"]) {
    assert.match(adapters, new RegExp(`${key}:`));
  }
});

test("mock writes are explicitly non-persistent", () => {
  assert.match(adapters, /persisted: false/);
  assert.match(adapters, /No production data was changed/);
});

test("dangerous reward execution contracts are absent", () => {
  for (const term of ["privateKey", "secretKey", "sendTransaction", "payoutWorker", "cronSecret"]) {
    assert.doesNotMatch(`${contracts}\n${adapters}\n${mocks}`, new RegExp(term, "i"));
  }
});
