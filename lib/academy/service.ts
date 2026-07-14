import { createHash, randomBytes, randomUUID } from "node:crypto";
import bs58 from "bs58";
import {
  and,
  asc,
  desc,
  eq,
  gt,
  inArray,
  isNull,
  sql,
} from "drizzle-orm";
import nacl from "tweetnacl";
import type { AcademyDatabase } from "@/db";
import {
  academyUsers,
  contentUnlocks,
  learningPaths,
  lessonProgress,
  lessons,
  linkedAccounts,
  moduleProgress,
  modules,
  walletChallenges,
  wallets,
  xpEvents,
  type AcademyUser,
} from "@/db/schema";
import { ACADEMY_IDS, CORE_CURRICULUM } from "./content";

export type VerifiedIdentity = {
  privyUserId: string;
  email: string | null;
  displayName: string | null;
  linkedAccounts: Array<{
    type: string;
    provider: string;
    identifier: string;
    address?: string;
    chainType?: string;
    embedded?: boolean;
  }>;
};

export class AcademyError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
  }
}

function now() {
  return new Date();
}

function canAccessTier(user: AcademyUser, tier: "MEMBER" | "VIP") {
  if (user.role === "ADMIN") return true;
  if (user.membershipStatus !== "ACTIVE") return false;
  if (user.membershipExpiresAt && user.membershipExpiresAt <= now()) return false;
  return tier === "MEMBER" || user.membershipTier === "VIP";
}

export function assertMembership(
  user: AcademyUser,
  tier: "MEMBER" | "VIP",
) {
  if (!canAccessTier(user, tier)) {
    throw new AcademyError(
      tier === "VIP"
        ? "This lesson requires an active VIP membership."
        : "An active academy membership is required.",
      403,
      "MEMBERSHIP_REQUIRED",
    );
  }
}

export async function seedCoreCurriculum(db: AcademyDatabase) {
  const date = now();
  await db
    .insert(learningPaths)
    .values({ ...CORE_CURRICULUM.path, createdAt: date, updatedAt: date })
    .onConflictDoUpdate({
      target: learningPaths.id,
      set: { ...CORE_CURRICULUM.path, updatedAt: date },
    });
  await db
    .insert(modules)
    .values({ ...CORE_CURRICULUM.module, createdAt: date, updatedAt: date })
    .onConflictDoUpdate({
      target: modules.id,
      set: { ...CORE_CURRICULUM.module, updatedAt: date },
    });
  for (const lesson of CORE_CURRICULUM.lessons) {
    await db
      .insert(lessons)
      .values({ ...lesson, createdAt: date, updatedAt: date })
      .onConflictDoUpdate({
        target: lessons.id,
        set: { ...lesson, updatedAt: date },
      });
  }
}

async function ensureInitialUnlock(db: AcademyDatabase, userId: string) {
  await db
    .insert(contentUnlocks)
    .values({
      id: randomUUID(),
      userId,
      lessonId: ACADEMY_IDS.lessons[0],
      reason: "FIRST_LESSON",
      unlockedAt: now(),
    })
    .onConflictDoNothing();
}

export async function syncAcademyUser(
  db: AcademyDatabase,
  identity: VerifiedIdentity,
) {
  const [existing] = await db
    .select()
    .from(academyUsers)
    .where(eq(academyUsers.privyUserId, identity.privyUserId))
    .limit(1);
  const date = now();
  const userId = existing?.id ?? randomUUID();

  if (existing) {
    await db
      .update(academyUsers)
      .set({
        primaryEmail: identity.email ?? existing.primaryEmail,
        displayName: identity.displayName ?? existing.displayName,
        lastLoginAt: date,
        updatedAt: date,
      })
      .where(eq(academyUsers.id, userId));
  } else {
    await db.insert(academyUsers).values({
      id: userId,
      privyUserId: identity.privyUserId,
      primaryEmail: identity.email,
      displayName: identity.displayName,
      role: "MEMBER",
      membershipTier: "MEMBER",
      membershipStatus: "ACTIVE",
      membershipStartedAt: date,
      membershipSource: "PRIVY_SIGN_IN",
      membershipManualOverride: false,
      lastLoginAt: date,
      createdAt: date,
      updatedAt: date,
    });
  }

  for (const account of identity.linkedAccounts) {
    await db
      .insert(linkedAccounts)
      .values({
        id: randomUUID(),
        userId,
        accountType: account.type,
        provider: account.provider,
        accountIdentifier: account.identifier,
        createdAt: date,
        updatedAt: date,
      })
      .onConflictDoNothing();

    if (account.embedded && account.chainType === "solana" && account.address) {
      await db
        .insert(wallets)
        .values({
          id: randomUUID(),
          userId,
          chain: "SOLANA",
          network: "MAINNET",
          address: account.address,
          walletType: "EMBEDDED",
          provider: "PRIVY",
          ownershipStatus: "VERIFIED",
          verifiedAt: date,
          isPrimary: false,
          isReward: false,
          createdAt: date,
          updatedAt: date,
        })
        .onConflictDoNothing();
    }
  }

  await ensureInitialUnlock(db, userId);
  const [user] = await db
    .select()
    .from(academyUsers)
    .where(eq(academyUsers.id, userId))
    .limit(1);
  return user;
}

async function getLessonContext(db: AcademyDatabase, lessonSlug: string) {
  const [row] = await db
    .select({ lesson: lessons, module: modules, path: learningPaths })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(learningPaths, eq(modules.learningPathId, learningPaths.id))
    .where(eq(lessons.slug, lessonSlug))
    .limit(1);
  if (!row || !row.lesson.isPublished || !row.module.isPublished || !row.path.isPublished) {
    throw new AcademyError("Lesson not found.", 404, "LESSON_NOT_FOUND");
  }
  return row;
}

async function assertLessonUnlocked(
  db: AcademyDatabase,
  user: AcademyUser,
  lesson: typeof lessons.$inferSelect,
) {
  assertMembership(user, lesson.accessTier);
  const [unlock] = await db
    .select({ id: contentUnlocks.id })
    .from(contentUnlocks)
    .where(
      and(
        eq(contentUnlocks.userId, user.id),
        eq(contentUnlocks.lessonId, lesson.id),
      ),
    )
    .limit(1);
  if (!unlock) {
    throw new AcademyError(
      "Complete the previous lesson to unlock this lesson.",
      403,
      "LESSON_LOCKED",
    );
  }
}

export async function startLesson(
  db: AcademyDatabase,
  user: AcademyUser,
  lessonSlug: string,
) {
  const { lesson } = await getLessonContext(db, lessonSlug);
  await assertLessonUnlocked(db, user, lesson);
  const date = now();
  await db
    .insert(lessonProgress)
    .values({
      id: randomUUID(),
      userId: user.id,
      lessonId: lesson.id,
      status: "STARTED",
      startedAt: date,
      createdAt: date,
      updatedAt: date,
    })
    .onConflictDoNothing();
  return getAcademyState(db, user.id);
}

export async function completeLesson(
  db: AcademyDatabase,
  user: AcademyUser,
  lessonSlug: string,
) {
  const { lesson, module } = await getLessonContext(db, lessonSlug);
  await assertLessonUnlocked(db, user, lesson);
  const date = now();

  await db.transaction(async (tx) => {
    const [current] = await tx
      .select()
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.userId, user.id),
          eq(lessonProgress.lessonId, lesson.id),
        ),
      )
      .limit(1);

    if (current?.status !== "COMPLETED") {
      await tx
        .insert(lessonProgress)
        .values({
          id: randomUUID(),
          userId: user.id,
          lessonId: lesson.id,
          status: "COMPLETED",
          startedAt: current?.startedAt ?? date,
          completedAt: date,
          createdAt: current?.createdAt ?? date,
          updatedAt: date,
        })
        .onConflictDoUpdate({
          target: [lessonProgress.userId, lessonProgress.lessonId],
          set: { status: "COMPLETED", completedAt: date, updatedAt: date },
        });

      await tx
        .insert(xpEvents)
        .values({
          id: randomUUID(),
          userId: user.id,
          eventType: "LESSON_COMPLETED",
          sourceEntityType: "LESSON",
          sourceEntityId: lesson.id,
          amount: lesson.xpValue,
          metadata: JSON.stringify({ lessonSlug: lesson.slug }),
          createdAt: date,
        })
        .onConflictDoNothing();
    }

    const required = await tx
      .select({ id: lessons.id })
      .from(lessons)
      .where(
        and(
          eq(lessons.moduleId, module.id),
          eq(lessons.isRequired, true),
          eq(lessons.isPublished, true),
        ),
      );
    const completed = await tx
      .select({ id: lessonProgress.lessonId })
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.userId, user.id),
          eq(lessonProgress.status, "COMPLETED"),
          inArray(
            lessonProgress.lessonId,
            required.map((item) => item.id),
          ),
        ),
      );
    const percent = required.length
      ? Math.round((completed.length / required.length) * 100)
      : 0;
    await tx
      .insert(moduleProgress)
      .values({
        id: randomUUID(),
        userId: user.id,
        moduleId: module.id,
        completedLessons: completed.length,
        requiredLessons: required.length,
        percentComplete: percent,
        completedAt: percent === 100 ? date : null,
        createdAt: date,
        updatedAt: date,
      })
      .onConflictDoUpdate({
        target: [moduleProgress.userId, moduleProgress.moduleId],
        set: {
          completedLessons: completed.length,
          requiredLessons: required.length,
          percentComplete: percent,
          completedAt: percent === 100 ? date : null,
          updatedAt: date,
        },
      });

    const [next] = await tx
      .select()
      .from(lessons)
      .where(
        and(
          eq(lessons.moduleId, module.id),
          gt(lessons.order, lesson.order),
          eq(lessons.isPublished, true),
        ),
      )
      .orderBy(asc(lessons.order))
      .limit(1);
    if (next) {
      await tx
        .insert(contentUnlocks)
        .values({
          id: randomUUID(),
          userId: user.id,
          lessonId: next.id,
          reason: `COMPLETED:${lesson.id}`,
          unlockedAt: date,
        })
        .onConflictDoNothing();
    }
  });

  return getAcademyState(db, user.id);
}

export async function getAcademyState(db: AcademyDatabase, userId: string) {
  const [user] = await db
    .select()
    .from(academyUsers)
    .where(eq(academyUsers.id, userId))
    .limit(1);
  if (!user) throw new AcademyError("User not found.", 404, "USER_NOT_FOUND");

  const [lessonRows, progressRows, unlockRows, walletRows, eventRows, totalRow] =
    await Promise.all([
      db
        .select()
        .from(lessons)
        .where(eq(lessons.moduleId, ACADEMY_IDS.module))
        .orderBy(asc(lessons.order)),
      db
        .select()
        .from(lessonProgress)
        .where(eq(lessonProgress.userId, userId)),
      db
        .select()
        .from(contentUnlocks)
        .where(eq(contentUnlocks.userId, userId)),
      db.select().from(wallets).where(eq(wallets.userId, userId)),
      db
        .select()
        .from(xpEvents)
        .where(eq(xpEvents.userId, userId))
        .orderBy(desc(xpEvents.createdAt))
        .limit(8),
      db
        .select({ total: sql<number>`coalesce(sum(${xpEvents.amount}), 0)` })
        .from(xpEvents)
        .where(eq(xpEvents.userId, userId)),
    ]);

  const progressByLesson = new Map(
    progressRows.map((item) => [item.lessonId, item]),
  );
  const unlocked = new Set(unlockRows.map((item) => item.lessonId));
  const completedCount = progressRows.filter(
    (item) => item.status === "COMPLETED",
  ).length;
  const decoratedLessons = lessonRows.map((lesson) => ({
    ...lesson,
    state: progressByLesson.get(lesson.id)?.status ??
      (unlocked.has(lesson.id) ? "AVAILABLE" : "LOCKED"),
    lockedReason: unlocked.has(lesson.id)
      ? null
      : "Complete the previous lesson to unlock this lesson.",
  }));
  const nextLesson = decoratedLessons.find(
    (lesson) => lesson.state !== "COMPLETED" && lesson.state !== "LOCKED",
  );

  return {
    user: {
      id: user.id,
      privyUserId: user.privyUserId,
      primaryEmail: user.primaryEmail,
      displayName: user.displayName,
      role: user.role,
      membershipTier: user.membershipTier,
      membershipStatus: user.membershipStatus,
      membershipExpiresAt: user.membershipExpiresAt,
    },
    path: CORE_CURRICULUM.path,
    module: CORE_CURRICULUM.module,
    lessons: decoratedLessons,
    nextLesson: nextLesson ?? null,
    progressPercent: lessonRows.length
      ? Math.round((completedCount / lessonRows.length) * 100)
      : 0,
    xpTotal: Number(totalRow[0]?.total ?? 0),
    wallets: walletRows,
    recentActivity: eventRows,
  };
}

function validateSolanaAddress(address: string) {
  let bytes: Uint8Array;
  try {
    bytes = bs58.decode(address);
  } catch {
    throw new AcademyError(
      "Enter a valid Solana wallet address.",
      400,
      "INVALID_WALLET_ADDRESS",
    );
  }
  if (bytes.length !== 32) {
    throw new AcademyError(
      "Enter a valid Solana wallet address.",
      400,
      "INVALID_WALLET_ADDRESS",
    );
  }
  return bytes;
}

export async function createWalletChallenge(
  db: AcademyDatabase,
  user: AcademyUser,
  address: string,
  origin: string,
) {
  validateSolanaAddress(address);
  const recent = await db
    .select({ id: walletChallenges.id })
    .from(walletChallenges)
    .where(
      and(
        eq(walletChallenges.userId, user.id),
        gt(walletChallenges.createdAt, new Date(Date.now() - 60_000)),
      ),
    );
  if (recent.length >= 5) {
    throw new AcademyError(
      "Too many verification attempts. Try again in one minute.",
      429,
      "RATE_LIMITED",
    );
  }

  const nonce = randomBytes(24).toString("base64url");
  const issuedAt = now();
  const expiresAt = new Date(issuedAt.getTime() + 5 * 60_000);
  const message = [
    "Iron Vault | Vaulted Academy",
    "Wallet ownership verification",
    `Origin: ${origin}`,
    `Address: ${address}`,
    `Vaulted Academy user: ${user.id}`,
    `Nonce: ${nonce}`,
    `Issued at: ${issuedAt.toISOString()}`,
    `Expires at: ${expiresAt.toISOString()}`,
    "This signature proves wallet ownership and does not authorize a transaction.",
  ].join("\n");
  const id = randomUUID();
  await db.insert(walletChallenges).values({
    id,
    userId: user.id,
    walletAddress: address,
    nonceHash: createHash("sha256").update(nonce).digest("hex"),
    message,
    expiresAt,
    createdAt: issuedAt,
  });
  return { id, address, message, expiresAt };
}

export async function verifyWalletChallenge(
  db: AcademyDatabase,
  user: AcademyUser,
  challengeId: string,
  signatureBase64: string,
) {
  const [challenge] = await db
    .select()
    .from(walletChallenges)
    .where(
      and(
        eq(walletChallenges.id, challengeId),
        eq(walletChallenges.userId, user.id),
      ),
    )
    .limit(1);
  if (!challenge) {
    throw new AcademyError("Verification challenge not found.", 404, "CHALLENGE_NOT_FOUND");
  }
  if (challenge.usedAt) {
    throw new AcademyError("This verification challenge was already used.", 409, "CHALLENGE_REPLAYED");
  }
  if (challenge.expiresAt <= now()) {
    throw new AcademyError("This verification challenge has expired.", 410, "CHALLENGE_EXPIRED");
  }

  let signature: Uint8Array;
  try {
    signature = Uint8Array.from(Buffer.from(signatureBase64, "base64"));
  } catch {
    throw new AcademyError("The wallet signature is invalid.", 400, "INVALID_SIGNATURE");
  }
  const publicKey = validateSolanaAddress(challenge.walletAddress);
  if (
    signature.length !== nacl.sign.signatureLength ||
    !nacl.sign.detached.verify(
      new TextEncoder().encode(challenge.message),
      signature,
      publicKey,
    )
  ) {
    throw new AcademyError("The wallet signature was rejected.", 400, "INVALID_SIGNATURE");
  }

  const date = now();
  await db.transaction(async (tx) => {
    const consumed = await tx
      .update(walletChallenges)
      .set({ usedAt: date })
      .where(
        and(
          eq(walletChallenges.id, challenge.id),
          isNull(walletChallenges.usedAt),
          gt(walletChallenges.expiresAt, date),
        ),
      )
      .returning({ id: walletChallenges.id });
    if (!consumed.length) {
      throw new AcademyError("This verification challenge is no longer valid.", 409, "CHALLENGE_REPLAYED");
    }

    const [ownedBy] = await tx
      .select({ userId: wallets.userId })
      .from(wallets)
      .where(
        and(
          eq(wallets.chain, "SOLANA"),
          eq(wallets.network, "MAINNET"),
          eq(wallets.address, challenge.walletAddress),
        ),
      )
      .limit(1);
    if (ownedBy && ownedBy.userId !== user.id) {
      throw new AcademyError(
        "This verified wallet belongs to another academy account.",
        409,
        "WALLET_ALREADY_OWNED",
      );
    }

    await tx
      .insert(wallets)
      .values({
        id: randomUUID(),
        userId: user.id,
        chain: "SOLANA",
        network: "MAINNET",
        address: challenge.walletAddress,
        walletType: "EXTERNAL",
        provider: "PRIVY_EXTERNAL",
        ownershipStatus: "VERIFIED",
        verifiedAt: date,
        isPrimary: false,
        isReward: false,
        createdAt: date,
        updatedAt: date,
      })
      .onConflictDoUpdate({
        target: [wallets.chain, wallets.network, wallets.address],
        set: { ownershipStatus: "VERIFIED", verifiedAt: date, updatedAt: date },
      });
  });
  return getAcademyState(db, user.id);
}

export async function selectWallet(
  db: AcademyDatabase,
  user: AcademyUser,
  walletId: string,
  selection: "PRIMARY" | "REWARD",
) {
  const [wallet] = await db
    .select()
    .from(wallets)
    .where(and(eq(wallets.id, walletId), eq(wallets.userId, user.id)))
    .limit(1);
  if (!wallet) throw new AcademyError("Wallet not found.", 404, "WALLET_NOT_FOUND");
  if (wallet.ownershipStatus !== "VERIFIED") {
    throw new AcademyError(
      "Only a verified wallet can be selected.",
      403,
      "WALLET_NOT_VERIFIED",
    );
  }
  const date = now();
  await db.transaction(async (tx) => {
    await tx
      .update(wallets)
      .set(
        selection === "PRIMARY"
          ? { isPrimary: false, updatedAt: date }
          : { isReward: false, updatedAt: date },
      )
      .where(eq(wallets.userId, user.id));
    await tx
      .update(wallets)
      .set(
        selection === "PRIMARY"
          ? { isPrimary: true, updatedAt: date }
          : { isReward: true, updatedAt: date },
      )
      .where(and(eq(wallets.id, wallet.id), eq(wallets.userId, user.id)));
  });
  return getAcademyState(db, user.id);
}

export async function getAdminInspection(
  db: AcademyDatabase,
  actor: AcademyUser,
) {
  if (actor.role !== "ADMIN") {
    throw new AcademyError("Administrator access is required.", 403, "ADMIN_REQUIRED");
  }
  const users = await db.select().from(academyUsers).orderBy(desc(academyUsers.createdAt));
  const data = await Promise.all(
    users.map(async (user) => {
      const [userWallets, completions, progress, events] = await Promise.all([
        db.select().from(wallets).where(eq(wallets.userId, user.id)),
        db.select().from(lessonProgress).where(eq(lessonProgress.userId, user.id)),
        db.select().from(moduleProgress).where(eq(moduleProgress.userId, user.id)),
        db.select().from(xpEvents).where(eq(xpEvents.userId, user.id)),
      ]);
      return { user, wallets: userWallets, completions, moduleProgress: progress, xpEvents: events };
    }),
  );
  return data;
}
