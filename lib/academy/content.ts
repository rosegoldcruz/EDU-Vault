export const ACADEMY_IDS = {
  path: "path_crypto_foundations",
  module: "module_wallet_foundations",
  lessons: [
    "lesson_wallet_ownership",
    "lesson_transaction_signing",
    "lesson_custody_models",
  ],
} as const;

export const CORE_CURRICULUM = {
  path: {
    id: ACADEMY_IDS.path,
    title: "Crypto Foundations",
    slug: "crypto-foundations",
    description:
      "Understand money, networks, keys, transactions, and the ideas beneath crypto systems.",
    outcome:
      "Build first-principles understanding across crypto, wallets, DeFi, security, and onchain research.",
    difficulty: "Beginner",
    estimatedMinutes: 24,
    accessTier: "MEMBER" as const,
    order: 1,
    isPublished: true,
  },
  module: {
    id: ACADEMY_IDS.module,
    learningPathId: ACADEMY_IDS.path,
    title: "Wallet Foundations",
    slug: "wallet-foundations",
    description:
      "Understand ownership, signing, custody models, recovery practices, and operational security.",
    order: 1,
    accessTier: "MEMBER" as const,
    isPublished: true,
  },
  lessons: [
    {
      id: ACADEMY_IDS.lessons[0],
      moduleId: ACADEMY_IDS.module,
      title: "Wallet ownership",
      slug: "wallet-ownership",
      summary:
        "Understand who can authorize a transaction and why control begins with keys.",
      content:
        "Understand who can authorize a transaction and why control begins with keys.",
      lessonType: "READING",
      order: 1,
      estimatedMinutes: 8,
      xpValue: 50,
      isRequired: true,
      accessTier: "MEMBER" as const,
      isPublished: true,
    },
    {
      id: ACADEMY_IDS.lessons[1],
      moduleId: ACADEMY_IDS.module,
      title: "Transaction signing",
      slug: "transaction-signing",
      summary:
        "Read what a wallet is asking you to approve before an action moves onchain.",
      content:
        "Read what a wallet is asking you to approve before an action moves onchain.",
      lessonType: "READING",
      order: 2,
      estimatedMinutes: 8,
      xpValue: 50,
      isRequired: true,
      accessTier: "MEMBER" as const,
      isPublished: true,
    },
    {
      id: ACADEMY_IDS.lessons[2],
      moduleId: ACADEMY_IDS.module,
      title: "Custody models",
      slug: "custody-models",
      summary:
        "Compare self-custody and managed custody through control, recovery, and risk.",
      content:
        "Compare self-custody and managed custody through control, recovery, and risk.",
      lessonType: "READING",
      order: 3,
      estimatedMinutes: 8,
      xpValue: 50,
      isRequired: true,
      accessTier: "MEMBER" as const,
      isPublished: true,
    },
  ],
};
