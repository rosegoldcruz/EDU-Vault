import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
};

export const academyUsers = sqliteTable(
  "academy_users",
  {
    id: text("id").primaryKey(),
    privyUserId: text("privy_user_id").notNull(),
    primaryEmail: text("primary_email"),
    displayName: text("display_name"),
    role: text("role", { enum: ["MEMBER", "VIP", "ADMIN"] })
      .notNull()
      .default("MEMBER"),
    membershipTier: text("membership_tier", { enum: ["MEMBER", "VIP"] })
      .notNull()
      .default("MEMBER"),
    membershipStatus: text("membership_status", {
      enum: ["ACTIVE", "INACTIVE", "EXPIRED"],
    })
      .notNull()
      .default("ACTIVE"),
    membershipStartedAt: integer("membership_started_at", {
      mode: "timestamp_ms",
    }),
    membershipExpiresAt: integer("membership_expires_at", {
      mode: "timestamp_ms",
    }),
    membershipSource: text("membership_source").notNull().default("ACADEMY"),
    membershipManualOverride: integer("membership_manual_override", {
      mode: "boolean",
    })
      .notNull()
      .default(false),
    membershipAdminNotes: text("membership_admin_notes"),
    lastLoginAt: integer("last_login_at", { mode: "timestamp_ms" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("academy_users_privy_user_id_unique").on(table.privyUserId),
    check(
      "academy_users_role_check",
      sql`${table.role} in ('MEMBER', 'VIP', 'ADMIN')`,
    ),
    check(
      "academy_users_membership_tier_check",
      sql`${table.membershipTier} in ('MEMBER', 'VIP')`,
    ),
    check(
      "academy_users_membership_status_check",
      sql`${table.membershipStatus} in ('ACTIVE', 'INACTIVE', 'EXPIRED')`,
    ),
  ],
);

export const linkedAccounts = sqliteTable(
  "linked_accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => academyUsers.id, { onDelete: "cascade" }),
    accountType: text("account_type").notNull(),
    provider: text("provider").notNull(),
    accountIdentifier: text("account_identifier").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("linked_accounts_identity_unique").on(
      table.accountType,
      table.provider,
      table.accountIdentifier,
    ),
    index("linked_accounts_user_idx").on(table.userId),
  ],
);

export const wallets = sqliteTable(
  "wallets",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => academyUsers.id, { onDelete: "cascade" }),
    chain: text("chain").notNull().default("SOLANA"),
    network: text("network").notNull().default("MAINNET"),
    address: text("address").notNull(),
    walletType: text("wallet_type", { enum: ["EMBEDDED", "EXTERNAL"] })
      .notNull(),
    provider: text("provider").notNull(),
    ownershipStatus: text("ownership_status", {
      enum: ["PENDING", "VERIFIED"],
    })
      .notNull()
      .default("PENDING"),
    verifiedAt: integer("verified_at", { mode: "timestamp_ms" }),
    isPrimary: integer("is_primary", { mode: "boolean" })
      .notNull()
      .default(false),
    isReward: integer("is_reward", { mode: "boolean" })
      .notNull()
      .default(false),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("wallets_chain_network_address_unique").on(
      table.chain,
      table.network,
      table.address,
    ),
    uniqueIndex("wallets_one_primary_per_user")
      .on(table.userId)
      .where(sql`${table.isPrimary} = 1`),
    uniqueIndex("wallets_one_reward_per_user")
      .on(table.userId)
      .where(sql`${table.isReward} = 1`),
    index("wallets_user_idx").on(table.userId),
    check("wallets_chain_check", sql`${table.chain} = 'SOLANA'`),
  ],
);

export const walletChallenges = sqliteTable(
  "wallet_challenges",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => academyUsers.id, { onDelete: "cascade" }),
    walletAddress: text("wallet_address").notNull(),
    nonceHash: text("nonce_hash").notNull(),
    message: text("message").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    usedAt: integer("used_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    uniqueIndex("wallet_challenges_nonce_hash_unique").on(table.nonceHash),
    index("wallet_challenges_user_created_idx").on(
      table.userId,
      table.createdAt,
    ),
  ],
);

export const learningPaths = sqliteTable(
  "learning_paths",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull(),
    outcome: text("outcome").notNull(),
    difficulty: text("difficulty").notNull(),
    estimatedMinutes: integer("estimated_minutes").notNull(),
    accessTier: text("access_tier", { enum: ["MEMBER", "VIP"] })
      .notNull()
      .default("MEMBER"),
    order: integer("sort_order").notNull(),
    isPublished: integer("is_published", { mode: "boolean" })
      .notNull()
      .default(false),
    ...timestamps,
  },
  (table) => [uniqueIndex("learning_paths_slug_unique").on(table.slug)],
);

export const modules = sqliteTable(
  "modules",
  {
    id: text("id").primaryKey(),
    learningPathId: text("learning_path_id")
      .notNull()
      .references(() => learningPaths.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull(),
    order: integer("sort_order").notNull(),
    accessTier: text("access_tier", { enum: ["MEMBER", "VIP"] })
      .notNull()
      .default("MEMBER"),
    isPublished: integer("is_published", { mode: "boolean" })
      .notNull()
      .default(false),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("modules_path_slug_unique").on(
      table.learningPathId,
      table.slug,
    ),
  ],
);

export const lessons = sqliteTable(
  "lessons",
  {
    id: text("id").primaryKey(),
    moduleId: text("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    summary: text("summary").notNull(),
    content: text("content").notNull(),
    lessonType: text("lesson_type").notNull().default("READING"),
    order: integer("sort_order").notNull(),
    estimatedMinutes: integer("estimated_minutes").notNull(),
    xpValue: integer("xp_value").notNull(),
    isRequired: integer("is_required", { mode: "boolean" })
      .notNull()
      .default(true),
    accessTier: text("access_tier", { enum: ["MEMBER", "VIP"] })
      .notNull()
      .default("MEMBER"),
    isPublished: integer("is_published", { mode: "boolean" })
      .notNull()
      .default(false),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("lessons_module_slug_unique").on(table.moduleId, table.slug),
    check("lessons_xp_nonnegative", sql`${table.xpValue} >= 0`),
  ],
);

export const lessonProgress = sqliteTable(
  "lesson_progress",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => academyUsers.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["STARTED", "COMPLETED"] })
      .notNull()
      .default("STARTED"),
    startedAt: integer("started_at", { mode: "timestamp_ms" }).notNull(),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("lesson_progress_user_lesson_unique").on(
      table.userId,
      table.lessonId,
    ),
  ],
);

export const moduleProgress = sqliteTable(
  "module_progress",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => academyUsers.id, { onDelete: "cascade" }),
    moduleId: text("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    completedLessons: integer("completed_lessons").notNull().default(0),
    requiredLessons: integer("required_lessons").notNull().default(0),
    percentComplete: integer("percent_complete").notNull().default(0),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("module_progress_user_module_unique").on(
      table.userId,
      table.moduleId,
    ),
  ],
);

export const xpEvents = sqliteTable(
  "xp_events",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => academyUsers.id, { onDelete: "cascade" }),
    eventType: text("event_type", {
      enum: ["LESSON_COMPLETED", "ADMIN_ADJUSTMENT"],
    }).notNull(),
    sourceEntityType: text("source_entity_type").notNull(),
    sourceEntityId: text("source_entity_id").notNull(),
    amount: integer("amount").notNull(),
    metadata: text("metadata"),
    administrativeReason: text("administrative_reason"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    uniqueIndex("xp_events_automatic_source_unique").on(
      table.userId,
      table.eventType,
      table.sourceEntityType,
      table.sourceEntityId,
    ),
  ],
);

export const contentUnlocks = sqliteTable(
  "content_unlocks",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => academyUsers.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    unlockedAt: integer("unlocked_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    uniqueIndex("content_unlocks_user_lesson_unique").on(
      table.userId,
      table.lessonId,
    ),
  ],
);

export type AcademyUser = typeof academyUsers.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
