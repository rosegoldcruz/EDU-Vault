/**
 * Iron Vault landing-page content. Every state below is a public claim —
 * keep states honest per the communication standard (Claim → State → Evidence).
 */

export type SystemState = "live" | "progress" | "planned";

export interface Track {
  code: string;
  slug: string;
  name: string;
  hours: string;
  level: "Foundations" | "Core" | "Advanced";
  summary: string;
  modules: readonly string[];
}

export const tracks: readonly Track[] = [
  { code: "No. 1", slug: "money", name: "Money", hours: "4h", level: "Foundations", summary: "Build a practical model of money before evaluating digital assets or financial systems.", modules: ["Why money exists", "Ledgers and accounting", "Inflation and purchasing power", "Debt and credit", "Risk, return, and time", "Personal financial foundations"] },
  { code: "No. 2", slug: "bitcoin", name: "Bitcoin", hours: "6h", level: "Foundations", summary: "Understand Bitcoin as a monetary network, from custody and transactions to mining and supply.", modules: ["The double-spend problem", "The Bitcoin network", "Blocks and transactions", "Mining and proof of work", "Supply and issuance", "Wallets and custody", "Fees and settlement", "Evaluating Bitcoin claims"] },
  { code: "No. 3", slug: "blockchain", name: "Blockchain", hours: "7h", level: "Core", summary: "Learn what blockchains do well, where they fail, and how to inspect their claims.", modules: ["Distributed ledgers", "Consensus models", "Public and private keys", "Transactions and state", "Smart contracts", "Nodes and validators", "Scaling tradeoffs", "Interoperability", "Reading a block explorer"] },
  { code: "No. 4", slug: "solana", name: "Solana", hours: "5h", level: "Core", summary: "Read Solana accounts, programs, transactions, and token activity with operational context.", modules: ["Solana architecture", "Accounts and programs", "Transactions and fees", "Validators and consensus", "SPL tokens", "Wallet operations", "Explorer-based research"] },
  { code: "No. 5", slug: "defi", name: "DeFi", hours: "8h", level: "Advanced", summary: "Analyze decentralized finance by mechanism, risk, liquidity, and evidence rather than headline yield.", modules: ["DeFi primitives", "Automated market makers", "Liquidity pools", "Lending and borrowing", "Stablecoins", "Oracles", "Staking and restaking", "Protocol governance", "Smart-contract risk", "Position due diligence"] },
  { code: "No. 6", slug: "artificial-intelligence", name: "Artificial Intelligence", hours: "5h", level: "Core", summary: "Use modern AI systems effectively while understanding models, limitations, data, and verification.", modules: ["How models learn", "Language models", "Prompt and context design", "Verification and hallucinations", "Agents and automation", "AI governance and privacy"] },
  { code: "No. 7", slug: "security", name: "Security", hours: "6h", level: "Core", summary: "Develop repeatable habits for custody, authentication, transaction review, recovery, and incident response.", modules: ["Threat modeling", "Keys and seed phrases", "Authentication", "Phishing and social engineering", "Transaction simulation", "Device security", "Recovery planning", "Incident response"] },
  { code: "No. 8", slug: "architecture", name: "Architecture", hours: "4h", level: "Advanced", summary: "Map how identity, data, services, chains, and interfaces form a production platform.", modules: ["System boundaries", "Identity and authorization", "Data ownership", "APIs and integrations", "Reliability and observability"] },
  { code: "No. 9", slug: "compliance", name: "Compliance", hours: "3h", level: "Core", summary: "Understand the operational purpose of disclosures, consent, recordkeeping, and financial controls.", modules: ["Regulatory foundations", "Disclosures and communications", "Consent and recordkeeping", "Operational controls"] },
  { code: "No. 10", slug: "wealth-systems", name: "Wealth Systems", hours: "6h", level: "Advanced", summary: "Combine cash flow, allocation, risk controls, and review practices into a durable personal system.", modules: ["Goals and constraints", "Cash-flow systems", "Emergency reserves", "Asset allocation", "Risk management", "Tax-aware records", "Review and rebalancing"] },
] as const;

export interface SystemNode {
  id: string;
  name: string;
  state: SystemState;
  stateLabel: string;
  description: string;
  dependencies: string;
  layer: string;
}

export const systemNodes: SystemNode[] = [
  {
    id: "01",
    name: "Public Experience",
    state: "live",
    stateLabel: "Live",
    description:
      "The public site you are reading now. Explains the ecosystem, previews the Academy, and routes prospective members to advisors.",
    dependencies: "Platform infrastructure",
    layer: "Access layer",
  },
  {
    id: "02",
    name: "Vaulted Academy",
    state: "live",
    stateLabel: "In active development",
    description:
      "The knowledge layer. Structured lessons, server-verified assessments, XP progression, and unlock rules. Live for authenticated members and expanding.",
    dependencies: "Authentication · Curriculum engine · Progress tracking",
    layer: "Intelligence layer",
  },
  {
    id: "03",
    name: "Member Portal",
    state: "progress",
    stateLabel: "In development",
    description:
      "The member back office: entitlements, account state, participation history, and support. Interface built; data integration in progress.",
    dependencies: "Authentication · Entitlements · Payment rails",
    layer: "Operational layer",
  },
  {
    id: "04",
    name: "Advisor Enrollment",
    state: "live",
    stateLabel: "Available",
    description:
      "Human-led enrollment. Advisors walk prospective members through the Academy, participation structure, policies, and next steps before any commitment.",
    dependencies: "Advisor workflow · CRM integration",
    layer: "Human layer",
  },
  {
    id: "05",
    name: "IV SOL",
    state: "live",
    stateLabel: "Deployed on Solana",
    description:
      "The participation layer. A token component of the broader machine — deployed on Solana, with utility expanding through verified proof gates. Not the whole system.",
    dependencies: "Solana network · Wallet verification",
    layer: "Participation layer",
  },
  {
    id: "06",
    name: "Rewards & Participation",
    state: "progress",
    stateLabel: "Manual operations",
    description:
      "Milestone recognition tied to verified learning progress. Rewards are reviewed and issued manually — no automated transfers, by design.",
    dependencies: "Academy progress · Wallet verification · Manual review",
    layer: "Incentive layer",
  },
  {
    id: "07",
    name: "Platform Infrastructure",
    state: "live",
    stateLabel: "Operational",
    description:
      "Server-authoritative identity, entitlement checks, database, and deployment pipeline. All access control is enforced server-side — never client-only.",
    dependencies: "Authentication · Database · Hosting",
    layer: "Foundation",
  },
];

export type GateState = "verified" | "live" | "progress" | "review" | "locked";

export interface ProofGate {
  name: string;
  state: GateState;
  stateLabel: string;
  done: string;
  evidence: string;
}

export interface Pillar {
  id: string;
  name: string;
  gates: ProofGate[];
}

export const pillars: Pillar[] = [
  {
    id: "P1",
    name: "Foundation",
    gates: [
      {
        name: "Server-authoritative identity",
        state: "verified",
        stateLabel: "Verified",
        done: "Every session is verified server-side. One identity maps to one canonical member record.",
        evidence: "Privy verification enforced on all protected routes and APIs.",
      },
      {
        name: "Academy curriculum engine",
        state: "verified",
        stateLabel: "Verified",
        done: "Lessons, assessments, XP, and unlock rules run in production with server-side scoring.",
        evidence: "Assessment scoring executes in a single server transaction — the client only submits answers.",
      },
      {
        name: "Wallet verification",
        state: "verified",
        stateLabel: "Verified",
        done: "Members can prove wallet ownership through a signed challenge, verified on the server.",
        evidence: "Challenge/verify/select flow live in the member account surface.",
      },
    ],
  },
  {
    id: "P2",
    name: "Activation",
    gates: [
      {
        name: "IV SOL deployment",
        state: "live",
        stateLabel: "Live",
        done: "Token deployed on Solana with published contract data.",
        evidence: "On-chain record. Contract panel below links to the explorer when published here.",
      },
      {
        name: "Advisor-led enrollment",
        state: "live",
        stateLabel: "Available",
        done: "Enrollment conversations available through the advisor team before any commitment.",
        evidence: "Advisor workflow operating; scheduling embedded on the enrollment surface.",
      },
      {
        name: "Member back office",
        state: "progress",
        stateLabel: "In development",
        done: "Members can view entitlements, history, and account state in one portal.",
        evidence: "Interface complete in mock mode; API integration in progress.",
      },
    ],
  },
  {
    id: "P3",
    name: "Utility Expansion",
    gates: [
      {
        name: "Milestone rewards",
        state: "progress",
        stateLabel: "In progress",
        done: "Eligible learning milestones reviewed and recognized through documented manual operations.",
        evidence: "Rewards remain manual-only. No code path signs or sends assets automatically.",
      },
      {
        name: "Merchant integration",
        state: "progress",
        stateLabel: "In integration",
        done: "Payment and entitlement rails connected end-to-end with audit records.",
        evidence: "Integration work underway; lifecycle documented before launch.",
      },
      {
        name: "Expanded participation mechanics",
        state: "locked",
        stateLabel: "Planned",
        done: "Additional utility ships only after the supporting systems are deployed and verified.",
        evidence: "Unlocks when prerequisite gates above are verified.",
      },
    ],
  },
  {
    id: "P4",
    name: "Infrastructure",
    gates: [
      {
        name: "Production deployment",
        state: "verified",
        stateLabel: "Verified",
        done: "Application deployed with automated build verification on every change.",
        evidence: "Build, typecheck, and rendered-output tests run against every release.",
      },
      {
        name: "Public build ledger",
        state: "progress",
        stateLabel: "In development",
        done: "A public /build surface showing status, changelog, and curriculum versions.",
        evidence: "Status reporting designed; publication surface in development.",
      },
      {
        name: "Compliance controls",
        state: "review",
        stateLabel: "Under review",
        done: "Disclosures, refund policy, and communication standards published and dated.",
        evidence: "Policies drafted; legal review in progress before publication.",
      },
    ],
  },
];
