CREATE TABLE `academy_users` (
	`id` text PRIMARY KEY NOT NULL,
	`privy_user_id` text NOT NULL,
	`primary_email` text,
	`display_name` text,
	`role` text DEFAULT 'MEMBER' NOT NULL,
	`membership_tier` text DEFAULT 'MEMBER' NOT NULL,
	`membership_status` text DEFAULT 'ACTIVE' NOT NULL,
	`membership_started_at` integer,
	`membership_expires_at` integer,
	`membership_source` text DEFAULT 'ACADEMY' NOT NULL,
	`membership_manual_override` integer DEFAULT false NOT NULL,
	`membership_admin_notes` text,
	`last_login_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	CONSTRAINT "academy_users_role_check" CHECK("academy_users"."role" in ('MEMBER', 'VIP', 'ADMIN')),
	CONSTRAINT "academy_users_membership_tier_check" CHECK("academy_users"."membership_tier" in ('MEMBER', 'VIP')),
	CONSTRAINT "academy_users_membership_status_check" CHECK("academy_users"."membership_status" in ('ACTIVE', 'INACTIVE', 'EXPIRED'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `academy_users_privy_user_id_unique` ON `academy_users` (`privy_user_id`);--> statement-breakpoint
CREATE TABLE `content_unlocks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`reason` text NOT NULL,
	`unlocked_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `academy_users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `content_unlocks_user_lesson_unique` ON `content_unlocks` (`user_id`,`lesson_id`);--> statement-breakpoint
CREATE TABLE `learning_paths` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text NOT NULL,
	`outcome` text NOT NULL,
	`difficulty` text NOT NULL,
	`estimated_minutes` integer NOT NULL,
	`access_tier` text DEFAULT 'MEMBER' NOT NULL,
	`sort_order` integer NOT NULL,
	`is_published` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `learning_paths_slug_unique` ON `learning_paths` (`slug`);--> statement-breakpoint
CREATE TABLE `lesson_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`status` text DEFAULT 'STARTED' NOT NULL,
	`started_at` integer NOT NULL,
	`completed_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `academy_users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lesson_progress_user_lesson_unique` ON `lesson_progress` (`user_id`,`lesson_id`);--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`module_id` text NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`summary` text NOT NULL,
	`content` text NOT NULL,
	`lesson_type` text DEFAULT 'READING' NOT NULL,
	`sort_order` integer NOT NULL,
	`estimated_minutes` integer NOT NULL,
	`xp_value` integer NOT NULL,
	`is_required` integer DEFAULT true NOT NULL,
	`access_tier` text DEFAULT 'MEMBER' NOT NULL,
	`is_published` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "lessons_xp_nonnegative" CHECK("lessons"."xp_value" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lessons_module_slug_unique` ON `lessons` (`module_id`,`slug`);--> statement-breakpoint
CREATE TABLE `linked_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`account_type` text NOT NULL,
	`provider` text NOT NULL,
	`account_identifier` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `academy_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `linked_accounts_identity_unique` ON `linked_accounts` (`account_type`,`provider`,`account_identifier`);--> statement-breakpoint
CREATE INDEX `linked_accounts_user_idx` ON `linked_accounts` (`user_id`);--> statement-breakpoint
CREATE TABLE `module_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`module_id` text NOT NULL,
	`completed_lessons` integer DEFAULT 0 NOT NULL,
	`required_lessons` integer DEFAULT 0 NOT NULL,
	`percent_complete` integer DEFAULT 0 NOT NULL,
	`completed_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `academy_users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `module_progress_user_module_unique` ON `module_progress` (`user_id`,`module_id`);--> statement-breakpoint
CREATE TABLE `modules` (
	`id` text PRIMARY KEY NOT NULL,
	`learning_path_id` text NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text NOT NULL,
	`sort_order` integer NOT NULL,
	`access_tier` text DEFAULT 'MEMBER' NOT NULL,
	`is_published` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`learning_path_id`) REFERENCES `learning_paths`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `modules_path_slug_unique` ON `modules` (`learning_path_id`,`slug`);--> statement-breakpoint
CREATE TABLE `wallet_challenges` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`wallet_address` text NOT NULL,
	`nonce_hash` text NOT NULL,
	`message` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `academy_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wallet_challenges_nonce_hash_unique` ON `wallet_challenges` (`nonce_hash`);--> statement-breakpoint
CREATE INDEX `wallet_challenges_user_created_idx` ON `wallet_challenges` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`chain` text DEFAULT 'SOLANA' NOT NULL,
	`network` text DEFAULT 'MAINNET' NOT NULL,
	`address` text NOT NULL,
	`wallet_type` text NOT NULL,
	`provider` text NOT NULL,
	`ownership_status` text DEFAULT 'PENDING' NOT NULL,
	`verified_at` integer,
	`is_primary` integer DEFAULT false NOT NULL,
	`is_reward` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `academy_users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "wallets_chain_check" CHECK("wallets"."chain" = 'SOLANA')
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wallets_chain_network_address_unique` ON `wallets` (`chain`,`network`,`address`);--> statement-breakpoint
CREATE UNIQUE INDEX `wallets_one_primary_per_user` ON `wallets` (`user_id`) WHERE "wallets"."is_primary" = 1;--> statement-breakpoint
CREATE UNIQUE INDEX `wallets_one_reward_per_user` ON `wallets` (`user_id`) WHERE "wallets"."is_reward" = 1;--> statement-breakpoint
CREATE INDEX `wallets_user_idx` ON `wallets` (`user_id`);--> statement-breakpoint
CREATE TABLE `xp_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`event_type` text NOT NULL,
	`source_entity_type` text NOT NULL,
	`source_entity_id` text NOT NULL,
	`amount` integer NOT NULL,
	`metadata` text,
	`administrative_reason` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `academy_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `xp_events_automatic_source_unique` ON `xp_events` (`user_id`,`event_type`,`source_entity_type`,`source_entity_id`);