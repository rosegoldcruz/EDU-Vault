/**
 * Iron Vault landing-page content. Every state below is a public claim —
 * keep states honest per the communication standard (Claim → State → Evidence).
 */

export type SystemState = "live" | "progress" | "planned";

export interface Track {
  code: string;
  slug: string;
  name: string;
  audience: string;
  duration?: string;
  summary: string;
  unitLabel: "courses" | "modules" | "weeks";
  units: readonly { title: string; detail?: string }[];
}

export const tracks: readonly Track[] = [
  {
    code: "Path 01",
    slug: "core-literacy",
    name: "Start Here / Core Literacy",
    audience: "Beginners and token-community members",
    summary: "Understand wallets, Bitcoin, blockchain, Web3, risk, and safe participation.",
    unitLabel: "courses",
    units: [
      { title: "Web3 Foundations" },
      { title: "Blockchain Foundations" },
      { title: "Blockchain & Bitcoin Intensive" },
    ],
  },
  {
    code: "Path 02",
    slug: "blockchain-foundations",
    name: "Blockchain Foundations",
    audience: "Professionals and advisors",
    duration: "5 hours",
    summary: "Explain blockchain mechanics, consensus, cryptography, wallets, dApps, and business use cases.",
    unitLabel: "modules",
    units: [
      { title: "Background and Basics", detail: "History, Bitcoin, mining, hashing, and blockchain properties." },
      { title: "Different Types of Blockchains", detail: "Private, public, permissioned, permissionless, and hybrid models." },
      { title: "Consensus", detail: "Consensus mechanisms, protocol examples, and simulator." },
      { title: "Cryptography and Hashing", detail: "Cryptography, hash properties, and avalanche-effect lab." },
      { title: "Smart Contracts" },
      { title: "Blockchain Wallets" },
      { title: "Pros and Cons" },
      { title: "Public Blockchain-Based Applications" },
      { title: "Blockchain and Crypto Regulation" },
      { title: "Regulatory Reporting" },
      { title: "Distributed Autonomous Organizations" },
      { title: "Blockchain Today" },
      { title: "The Trilemma" },
    ],
  },
  {
    code: "Path 03",
    slug: "defi-practitioner",
    name: "DeFi Practitioner",
    audience: "Beginner-to-intermediate users",
    duration: "8 weeks",
    summary: "Safely practice wallets, stablecoins, swaps, lending, governance, tokenization, and security.",
    unitLabel: "weeks",
    units: [
      { title: "Welcome to Web3 & Why DeFi Matters", detail: "Web3 evolution, decentralization, DeFi fundamentals, and safety." },
      { title: "Your First Wallet & Moving Money", detail: "Wallet types, security practices, and testnet transactions." },
      { title: "Stablecoins and Digital Dollars", detail: "Stablecoin models, settlement, remittance, and savings use cases." },
      { title: "Trading Without Banks — DEXs", detail: "DEXs, liquidity pools, and CEX-versus-DEX comparison." },
      { title: "Lending, Borrowing & Yield", detail: "Collateral, liquidation, leverage, and yield fundamentals." },
      { title: "DAOs and Digital Cooperatives", detail: "Governance, token voting, and a simulated proposal." },
      { title: "NFTs & Tokenization of Assets", detail: "Digital ownership, fractionalization, and a practice NFT mint." },
      { title: "Security & the Future of Web3", detail: "Threats, security practices, regulation, and participation pathways." },
    ],
  },
  {
    code: "Path 04",
    slug: "web3-developer",
    name: "Web3 Developer",
    audience: "Developers and technical learners",
    summary: "Build, test, secure, and ship Solidity contracts and Ethereum applications.",
    unitLabel: "courses",
    units: [
      { title: "Web3 Foundations" },
      { title: "Blockchain Foundations" },
      { title: "Blockchain & Bitcoin Intensive" },
      { title: "Blockchain Development Decision" },
      { title: "zk-SNARKs Essentials" },
      { title: "Solidity Smart Contract Developer (EVM)" },
      { title: "Smart Contract Security" },
      { title: "Understanding L1 and L2 Blockchains" },
      { title: "Ethereum DApp Developer" },
      { title: "Blockchain Architecture 101" },
      { title: "Blockchain Architecture 201" },
      { title: "Key Management" },
      { title: "Blockchain Security" },
      { title: "Blockchain Architecture 301" },
    ],
  },
  {
    code: "Path 05",
    slug: "architecture-enterprise",
    name: "Architecture & Enterprise",
    audience: "Architects, operators, and business leaders",
    summary: "Evaluate platforms, governance, architecture, integration, risk, and adoption.",
    unitLabel: "courses",
    units: [
      { title: "Blockchain Development Decision" },
      { title: "Blockchain Enterprise Strategy" },
      { title: "Blockchain Architecture 101" },
      { title: "Blockchain Architecture 201" },
      { title: "Blockchain Architecture 301" },
      { title: "Ethereum Enterprise Strategist" },
      { title: "Understanding L1 and L2 Blockchains" },
      { title: "Fundamentals of DeFi & Primitives" },
      { title: "Non-Fungible Token Essentials" },
      { title: "Tokenomic Essentials" },
    ],
  },
  {
    code: "Path 06",
    slug: "security-risk-compliance",
    name: "Security, Risk & Compliance",
    audience: "Operators, analysts, and regulated teams",
    summary: "Manage keys, cyber risk, smart-contract risk, data protection, and sanctions awareness.",
    unitLabel: "courses",
    units: [
      { title: "Key Management" },
      { title: "Information Security and Cyber Risk Awareness" },
      { title: "Smart Contract Security" },
      { title: "Blockchain Security" },
      { title: "Risk Management for Blockchain-Based Technology Companies" },
      { title: "Data Protection Regulation: GDPR and CPRA/CCPA" },
      { title: "OFAC Compliance Essentials" },
    ],
  },
  {
    code: "Path 07",
    slug: "ai-prompt-engineer",
    name: "AI Prompt Engineer",
    audience: "Creators, operators, marketers, and developers",
    summary: "Use conversational, image, music, and developer-oriented generative AI workflows.",
    unitLabel: "courses",
    units: [
      { title: "AI Essentials" },
      { title: "Web3 Foundations" },
      { title: "Blockchain Foundations" },
      { title: "Blockchain & Bitcoin Intensive" },
      { title: "Prompt Engineering 101: AI Chatbot (ChatGPT)" },
      { title: "AI Prompt Engineering 201: Advanced Topics" },
      { title: "AI Prompt Engineering 301: Developer Topics" },
      { title: "Mastering Image Generative AI" },
      { title: "Mastering Music Generative AI" },
      { title: "AI Prompt Engineer Capstone and Mastery Assessment" },
    ],
  },
  {
    code: "Path 08",
    slug: "web3-growth-community",
    name: "Web3 Growth & Community",
    audience: "Founders, growth teams, and community operators",
    summary: "Position, fund, distribute, and sustain a Web3 project responsibly.",
    unitLabel: "modules",
    units: [
      { title: "Project Essence", detail: "Problem, positioning, tagline, keywords, value, and audience." },
      { title: "Target Audience", detail: "Separate newcomers, users, builders, investors, operators, and institutions." },
      { title: "Marketing Budget", detail: "Set budget before selecting acquisition, content, partnership, and community tactics." },
      { title: "Channel Possibilities", detail: "Evaluate creators, SEO, email, education, partnerships, community, and airdrops." },
      { title: "Community Continuity", detail: "Support users, communicate, collect feedback, and sustain participation." },
    ],
  },
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
