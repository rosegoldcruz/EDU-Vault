import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import bs58 from "bs58";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/libsql/migrator";
import nacl from "tweetnacl";
import { createAcademyDatabase } from "../db/index";
import {
  academyUsers,
  lessonProgress,
  walletChallenges,
  wallets,
  xpEvents,
  type AcademyUser,
} from "../db/schema";
import {
  AcademyError,
  assertMembership,
  completeLesson,
  createWalletChallenge,
  getAcademyState,
  getAdminInspection,
  seedCoreCurriculum,
  selectWallet,
  startLesson,
  syncAcademyUser,
  verifyWalletChallenge,
  type VerifiedIdentity,
} from "../lib/academy/service";
import { authenticateRequest } from "../lib/auth/privy";

const identity: VerifiedIdentity = {
  privyUserId: "did:privy:test-member",
  email: "member@example.test",
  displayName: "Test Member",
  linkedAccounts: [
    { type: "email", provider: "email", identifier: "member@example.test" },
  ],
};

test("Core Academy vertical slice", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "vaulted-academy-"));
  const db = createAcademyDatabase(`file:${join(directory, "academy.db")}`);
  await migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
  await seedCoreCurriculum(db);
  t.after(async () => rm(directory, { recursive: true, force: true }));

  await t.test("unauthenticated requests do not resolve an academy user", async () => {
    assert.equal(await authenticateRequest(new Request("http://academy.test/api")), null);
  });

  const user: AcademyUser = await syncAcademyUser(db, identity);
  await t.test("one Privy identity resolves to one stable internal user", async () => {
    const second = await syncAcademyUser(db, identity);
    assert.equal(user.id, second.id);
    assert.equal((await db.select().from(academyUsers)).length, 1);
  });

  await t.test("membership and admin authority are enforced separately", async () => {
    assert.doesNotThrow(() => assertMembership(user, "MEMBER"));
    assert.throws(
      () => assertMembership(user, "VIP"),
      (error: unknown) => error instanceof AcademyError && error.code === "MEMBERSHIP_REQUIRED",
    );
    await assert.rejects(
      getAdminInspection(db, user),
      (error: unknown) => error instanceof AcademyError && error.code === "ADMIN_REQUIRED",
    );
    const expired = { ...user, membershipStatus: "EXPIRED" as const };
    assert.throws(() => assertMembership(expired, "MEMBER"));
  });

  await t.test("locked lesson URLs reject prerequisite bypass", async () => {
    await assert.rejects(
      startLesson(db, user, "transaction-signing"),
      (error: unknown) => error instanceof AcademyError && error.code === "LESSON_LOCKED",
    );
  });

  await t.test("completion, XP, progress, and unlock are server-authoritative and idempotent", async () => {
    await startLesson(db, user, "wallet-ownership");
    const afterFirst = await completeLesson(db, user, "wallet-ownership");
    assert.equal(afterFirst.xpTotal, 50);
    assert.equal(afterFirst.lessons[0].state, "COMPLETED");
    assert.equal(afterFirst.lessons[1].state, "AVAILABLE");
    assert.equal(afterFirst.progressPercent, 33);

    const afterRetry = await completeLesson(db, user, "wallet-ownership");
    assert.equal(afterRetry.xpTotal, 50);
    assert.equal((await db.select().from(xpEvents)).length, 1);
    assert.equal((await db.select().from(lessonProgress)).length, 1);

    const restored = await getAcademyState(db, user.id);
    assert.equal(restored.lessons[0].state, "COMPLETED");
    assert.equal(restored.xpTotal, 50);
  });

  await t.test("wallet address submission alone never verifies ownership", async () => {
    const pair = nacl.sign.keyPair();
    const address = bs58.encode(pair.publicKey);
    await createWalletChallenge(db, user, address, "https://academy.test");
    assert.equal((await db.select().from(wallets)).length, 0);
  });

  await t.test("valid Solana signature verifies ownership and replay is rejected", async () => {
    const pair = nacl.sign.keyPair();
    const address = bs58.encode(pair.publicKey);
    const challenge = await createWalletChallenge(db, user, address, "https://academy.test");
    const signature = nacl.sign.detached(
      new TextEncoder().encode(challenge.message),
      pair.secretKey,
    );
    const encoded = Buffer.from(signature).toString("base64");
    const state = await verifyWalletChallenge(db, user, challenge.id, encoded);
    const verified = state.wallets.find((wallet) => wallet.address === address);
    assert.equal(verified?.ownershipStatus, "VERIFIED");
    await assert.rejects(
      verifyWalletChallenge(db, user, challenge.id, encoded),
      (error: unknown) => error instanceof AcademyError && error.code === "CHALLENGE_REPLAYED",
    );
  });

  await t.test("invalid and expired wallet signatures are rejected", async () => {
    const pair = nacl.sign.keyPair();
    const address = bs58.encode(pair.publicKey);
    const invalid = await createWalletChallenge(db, user, address, "https://academy.test");
    const wrongPair = nacl.sign.keyPair();
    const wrongSignature = nacl.sign.detached(
      new TextEncoder().encode(invalid.message),
      wrongPair.secretKey,
    );
    await assert.rejects(
      verifyWalletChallenge(db, user, invalid.id, Buffer.from(wrongSignature).toString("base64")),
      (error: unknown) => error instanceof AcademyError && error.code === "INVALID_SIGNATURE",
    );

    const expired = await createWalletChallenge(db, user, address, "https://academy.test");
    await db
      .update(walletChallenges)
      .set({ expiresAt: new Date(Date.now() - 1_000) })
      .where(eq(walletChallenges.id, expired.id));
    const signature = nacl.sign.detached(
      new TextEncoder().encode(expired.message),
      pair.secretKey,
    );
    await assert.rejects(
      verifyWalletChallenge(db, user, expired.id, Buffer.from(signature).toString("base64")),
      (error: unknown) => error instanceof AcademyError && error.code === "CHALLENGE_EXPIRED",
    );
  });

  await t.test("only verified wallets can become reward wallets", async () => {
    const [verified] = await db.select().from(wallets).limit(1);
    assert.ok(verified);
    const state = await selectWallet(db, user, verified.id, "REWARD");
    assert.equal(state.wallets.find((wallet) => wallet.id === verified.id)?.isReward, true);

    const pendingPair = nacl.sign.keyPair();
    const pendingAddress = bs58.encode(pendingPair.publicKey);
    const pendingId = crypto.randomUUID();
    const date = new Date();
    await db.insert(wallets).values({
      id: pendingId,
      userId: user.id,
      chain: "SOLANA",
      network: "MAINNET",
      address: pendingAddress,
      walletType: "EXTERNAL",
      provider: "TEST",
      ownershipStatus: "PENDING",
      isPrimary: false,
      isReward: false,
      createdAt: date,
      updatedAt: date,
    });
    await assert.rejects(
      selectWallet(db, user, pendingId, "REWARD"),
      (error: unknown) => error instanceof AcademyError && error.code === "WALLET_NOT_VERIFIED",
    );
  });

  await t.test("admin inspection exposes read-only foundation records to admins", async () => {
    await db.update(academyUsers).set({ role: "ADMIN" }).where(eq(academyUsers.id, user.id));
    const [admin] = await db.select().from(academyUsers).where(eq(academyUsers.id, user.id));
    const inspection = await getAdminInspection(db, admin);
    assert.equal(inspection.length, 1);
    assert.equal(inspection[0].xpEvents.length, 1);
    assert.ok(inspection[0].wallets.some((wallet) => wallet.isReward));
  });
});
