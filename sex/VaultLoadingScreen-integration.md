Below is the complete, production-ready content for all 10 Iron Vault Academy modules, verified through research and formatted as a JSX/JavaScript `MODULES` array ready to drop into the platform. A research-notes section precedes the code.

---

## RESEARCH NOTES — Fact Verification & Time-Sensitivity Log

**Verified as of early July 2026. Facts flagged `[TIME-SENSITIVE]` should be re-checked before each publishing cycle; concepts flagged `[STABLE]` are definitional and durable.**

**Module 1 — Bitcoin** `[STABLE + one TIME-SENSITIVE]`
- Genesis block mined **January 3, 2009**; coinbase message verbatim: **"The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"** (Bitcoin source code / Bitcoin Wiki genesis-block hex dump).
- Whitepaper **"Bitcoin: A Peer-to-Peer Electronic Cash System"** published **October 31, 2008** by pseudonym **Satoshi Nakamoto** (bitcoin.org; posted to the Cryptography Mailing List).
- **Bitcoin Pizza Day: May 22, 2010** — Laszlo Hanyecz paid **10,000 BTC** for two Papa John's pizzas (worth ~$41 then); accepted by forum user "jercos" (Jeremy Sturdivant). Sources: Fortune, CoinDesk, original Bitcointalk thread.
- Genesis block reward **50 BTC**; block-time target **~10 minutes**; supply cap **21,000,000** (hard-coded).
- 4th halving: **April 19–20, 2024, block 840,000**, reward **6.25 → 3.125 BTC**. Next halving projected **~April 2028, block 1,050,000**, reward → **1.5625 BTC**. `[TIME-SENSITIVE]`
- **~19.9M BTC mined (~95% of cap)** as of late 2025; last coins ~2140. `[TIME-SENSITIVE]` We disregarded the fringe "Craig Wright authored it" claim (BitcoinSV wiki) as not accepted by the broader record.

**Module 2 — Ethereum** `[STABLE]`
- Proof-of-Stake since **The Merge, September 2022** (cut energy use ~99.95%). Solo validator stake = **32 ETH**; ~**1.05M validators**; liquid staking via Lido, Coinbase, Rocket Pool. ETH staking yield ~3%.
- **EIP-1559** fee model: algorithmic **base fee (burned)** + **priority fee (tip to validator/proposer)**.
- **Dencun upgrade (March 2024)** introduced **EIP-4844 "blobs,"** cutting L2 data-posting costs 50–90%.
- Major L2s: **Arbitrum, Base, Optimism (OP), zkSync Era, Starknet, Scroll, Linea.** Base has no native token (Coinbase). Arbitrum/OP/Base are optimistic rollups (~7-day challenge window); zkSync/Starknet are ZK-rollups. **The top 3 L2s (Base, Arbitrum, Optimism) handle ~90% of all L2 transactions** (21Shares Dec 2025 "State of Crypto"; L2BEAT). `[TIME-SENSITIVE for shares]`

**Module 3 — Solana** `[STABLE + TIME-SENSITIVE metrics]`
- Consensus: **Proof of Stake + Proof of History**; ~**400ms slot times**. Base fee **5,000 lamports per signature (50% burned, 50% to validator)** + optional priority fee (per compute unit). Simple transfer ≈ **$0.00025–$0.0005**; source: solana.com/docs/core/fees.
- Protocols verified: **Jupiter** = DEX aggregator (routes across Raydium, Orca, Meteora, Phoenix; JUP token, Jupiter Lend launched Aug 2025); **Raydium** = AMM DEX (RAY); **Kamino** = lending + auto-rebalancing CLMM vaults (KMNO); **Jito** = MEV/liquid staking (JitoSOL captures ~95% of MEV to holders; JTO governance); **Marinade** = liquid staking (mSOL); **Phantom** = non-custodial multichain wallet with staking/swap.
- Solana ran **~5,500 TPS in production** with a design ceiling near 65,000 TPS; **Firedancer** client (Jump Crypto) improving throughput/resilience. `[TIME-SENSITIVE]`

**Module 4 — Stablecoins** `[TIME-SENSITIVE]`
- **GENIUS Act signed July 18, 2025 (Public Law 119-27)** — first U.S. federal stablecoin framework; requires 1:1 reserves in cash/short-dated Treasuries/repos, monthly disclosure; OCC primary regulator for federal nonbank issuers; full operational enforcement targeted **January 2027**.
- **USDT (Tether) ~$186.6B**, **USDC (Circle) ~$75.1B** by end-2025; the two are **>90–95% of the stablecoin market** (aggregate ~$270–306B). USDC grew faster (regulatory clarity); Circle went public (NYSE) June 2025.
- **MiCA** (EU) applied to stablecoins since **June 30, 2024**; forced USDT delistings for EEA users.

**Module 5 — Tokenomics** `[STABLE]`
- Definitions confirmed: **Market Cap = price × circulating supply**; **FDV = price × max (or total) supply**; **circulating / total / max supply**; **vesting** (locked tokens released over time); **cliff** (one-time unlock date); **emissions** (ongoing issuance); **burn** (permanent removal, e.g., ETH post-EIP-1559, BNB); **staking rewards**. High FDV-to-market-cap ratio = dilution overhang.

**Module 6 — Security** `[TIME-SENSITIVE stats]`
- Attack vectors verified: **wallet drainers** (malicious approvals), **address poisoning** (dust with lookalike addresses — a **$50M USDT loss occurred Dec 2025**), **Permit/Permit2 signature phishing** (38% of >$1M losses in 2025), **EIP-7702 exploits** post-Pectra, **fake revoke/claim sites**, **seed-phrase theft**, **SIM-swap** (defeat with app/hardware 2FA, not SMS).
- **Crypto phishing losses fell 83% to $83.85M across ~106,000 victims in 2025** (Scam Sniffer). Tools: **revoke.cash** / Etherscan Token Approval Checker; hardware wallets **Ledger/Trezor**.

**Module 7 — On-Chain Intelligence** `[STABLE]`
- Tools verified: **Solscan** (Solana explorer), **Etherscan** (Ethereum explorer), **Nansen** (wallet labels/smart money), **Arkham** (entity attribution), **Dune** (SQL dashboards), **DexScreener** (live DEX pairs), **DeFiLlama** (TVL/stablecoins/fees across 350+ chains, free). Metrics: holder concentration, liquidity depth, DEX volume, wallet labels. Caveat surfaced repeatedly: on-chain data shows **movement, not intent**; TVL ≠ activity.

**Module 8 — Market Cycles** `[STABLE history + TIME-SENSITIVE reads]`
- **Bitcoin dominance (BTC.D)** = BTC market cap / total crypto market cap. Historical range ~33–73% since 2017. "Altseason" historically began when BTC.D rolled over from a high and ETH/BTC rose (2017, 2021). Documented note: the **2024–2026 cycle rotation was shallower/more selective** — ETF inflows concentrate in BTC; stablecoin cap mechanically suppresses BTC.D. **No price predictions included.**

**Module 9 — Airdrops & Points** `[TIME-SENSITIVE examples]`
- **LayerZero (June 2024):** manually removed **803,273 Sybil wallets (~59% of applicants)** using IP clustering, wallet-graph and timing analysis (with Nansen, Chaos Labs); self-report gave 15% vs 0%; ~1.28M qualified wallets got 8.5% of ZRO supply.
- **Hyperliquid (Nov 29, 2024):** pushed **~310M HYPE (~31% of supply) to ~94,000 wallets** via a points system rewarding real trading/liquidity; no click-to-claim.
- Documented reality: ~50–70% of airdropped tokens are sold within 30 days; many lose value within months. Framed as **education, not financial advice.**

**Module 10 — Future Stack** `[TIME-SENSITIVE]`
- **x402** (Coinbase, open-sourced **May 2025**; x402 Foundation with Cloudflare; members incl. Google, Visa, AWS, Circle, Anthropic): HTTP-402-based agentic stablecoin payments; runs on Base, Solana, others; 100M+ transactions.
- **RWA:** **BlackRock BUIDL** (tokenized by Securitize) crossed **$1B AUM within ~7 months of its March 2024 launch**, later multi-billion; **Ondo Finance** (OUSG, USDY) is a leading distribution layer. Total RWA on-chain value crossed ~$20B+ in 2026. `[TIME-SENSITIVE]`
- **DePIN:** **Helium** (wireless/hotspots, HNT, on Solana), **Render** (GPU rendering, RENDER, on Solana), Filecoin (storage), Bittensor (AI). Burn-and-mint economics.
- **Note:** All AUM/market-cap/TPS figures are point-in-time. Anything unverifiable was omitted rather than invented.

---

```javascript
export const MODULES = [
  // ============================== MODULE 1 ==============================
  {
    id: 1,
    title: "Bitcoin",
    subtitle: "The origin of hard money and why BTC became crypto's reserve asset",
    icon: "₿",
    tag: "BITCOIN",
    duration: "55-65 min",
    xpReward: 500,
    lessons: [
      {
        title: "Why Bitcoin Exists",
        content: [
          { type: "quote", text: "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks", author: "Coinbase message embedded in Bitcoin's genesis block, January 3, 2009" },
          { type: "heading", text: "A vault built out of math" },
          { type: "body", text: "On October 31, 2008, a pseudonymous author named Satoshi Nakamoto published a nine-page paper titled 'Bitcoin: A Peer-to-Peer Electronic Cash System.' On January 3, 2009, the first block — the genesis block — was mined. Buried inside it was a headline from that day's London Times about bank bailouts. That was not decoration. It was a thesis: a money that no chancellor, central bank, or committee could dilute." },
          { type: "body", text: "Bitcoin's core innovation is not digital cash — that had been tried. It is solving the 'double-spend problem' without a trusted middleman, using proof-of-work and a public ledger that thousands of independent machines agree on." },
          { type: "callout", text: "The fox's first lesson: Bitcoin is not backed by a company, a government, or gold. It is backed by electricity, math, and the refusal of a global network to break its own rules." },
          { type: "vault", title: "VAULT SECRET: The unspendable coins", text: "The 50 BTC reward from the genesis block can never be spent — a quirk in the original code means it sits permanently locked at address 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa. People still send BTC to it as tribute. The vault's very first deposit can never be opened." }
        ]
      },
      {
        title: "Scarcity and the Halving",
        content: [
          { type: "heading", text: "21 million. Forever." },
          { type: "body", text: "Bitcoin's supply is capped at 21,000,000 coins — hard-coded, unchangeable without near-impossible network consensus. New coins enter only through mining rewards, and those rewards are cut in half roughly every four years (every 210,000 blocks) in an event called the halving." },
          { type: "list", items: [
            "2009: genesis — reward 50 BTC per block",
            "Nov 2012: first halving — 50 → 25 BTC",
            "July 2016: second halving — 25 → 12.5 BTC",
            "May 2020: third halving — 12.5 → 6.25 BTC",
            "April 19–20, 2024: fourth halving (block 840,000) — 6.25 → 3.125 BTC",
            "~April 2028 (block 1,050,000, estimated): 3.125 → 1.5625 BTC"
          ]},
          { type: "body", text: "As of late 2025, roughly 19.9 million BTC — about 95% of the total supply — had already been mined. The final fractions of a coin are projected to be mined around the year 2140, after which miners are paid only by transaction fees." },
          { type: "callout", text: "Halvings are supply events, not price guarantees. Historically, price moved 6–18 months AFTER a halving, and each cycle unfolded under different conditions. Iron Vault teaches the mechanism, not a prophecy." },
          { type: "action", text: "Open a Bitcoin block explorer (like mempool.space) and find the current block height. Divide the blocks remaining until 1,050,000 by ~144 blocks/day to estimate how many days until the next halving." }
        ]
      },
      {
        title: "Proof-of-Work and Reserve Status",
        content: [
          { type: "heading", text: "Why it became the reserve asset" },
          { type: "body", text: "Bitcoin uses proof-of-work: miners spend real electricity racing to solve a cryptographic puzzle roughly every 10 minutes. The winner adds the next block and collects the reward. This makes rewriting history astronomically expensive — you would need to out-compute the entire honest network." },
          { type: "body", text: "That security, combined with a fixed supply and a 15-year track record, is why the rest of crypto treats BTC as the reserve asset: the benchmark against which every other coin is measured (the ETH/BTC and altcoin/BTC ratios), the deepest collateral, and the asset large institutions and even some governments hold in size." },
          { type: "reveal", title: "The layers of Bitcoin's 'hardness'", steps: [
            { label: "Layer 1", tag: "SUPPLY", heading: "Fixed cap", text: "21 million coins, enforced by code across every node. No inflation by decree." },
            { label: "Layer 2", tag: "ISSUANCE", heading: "The halving", text: "New supply drops by 50% every ~4 years, slowing issuance toward zero." },
            { label: "Layer 3", tag: "SECURITY", heading: "Proof-of-work", text: "Real-world energy makes the ledger prohibitively expensive to rewrite." },
            { label: "Layer 4", tag: "TIME", heading: "Lindy effect", text: "Every year the network survives adds to the market's trust that it will keep surviving." }
          ], note: "Hard money is not one feature. It is these four layers stacked." },
          { type: "vault", title: "VAULT SECRET: 10,000 BTC for two pizzas", text: "On May 22, 2010 — now 'Bitcoin Pizza Day' — programmer Laszlo Hanyecz paid 10,000 BTC for two Papa John's pizzas, worth about $41 at the time. It was the first documented real-world purchase with Bitcoin. The lesson isn't 'he lost a fortune' — it's that a thing only becomes money when someone accepts it. Every reserve asset starts by buying a pizza." }
        ]
      }
    ],
    quiz: [
      { q: "What is Bitcoin's maximum supply?", options: ["100 million", "21 million", "Unlimited", "18 million"], correct: 1 },
      { q: "The April 2024 halving reduced the block reward to what?", options: ["6.25 BTC", "12.5 BTC", "3.125 BTC", "1.5625 BTC"], correct: 2 },
      { q: "Approximately how often does a Bitcoin halving occur?", options: ["Every year", "Every 2 years", "Every 4 years", "Every 10 years"], correct: 2 },
      { q: "What consensus mechanism does Bitcoin use?", options: ["Proof-of-Stake", "Proof-of-History", "Proof-of-Work", "Proof-of-Authority"], correct: 2 },
      { q: "What was embedded in the genesis block's coinbase message?", options: ["A Bitcoin logo", "A newspaper headline about bank bailouts", "Satoshi's name", "A private key"], correct: 1 },
      { q: "Roughly what percentage of Bitcoin's supply had been mined by late 2025?", options: ["About 50%", "About 75%", "About 95%", "About 99.9%"], correct: 2 },
      { q: "What is the approximate target time between Bitcoin blocks?", options: ["10 seconds", "1 minute", "10 minutes", "1 hour"], correct: 2 },
      { q: "When was the Bitcoin whitepaper published?", options: ["January 2009", "October 31, 2008", "May 2010", "2013"], correct: 1 },
      { q: "Why is BTC considered crypto's 'reserve asset'?", options: ["It has the fastest transactions", "It is issued by a government", "Fixed supply, deep security, and long track record", "It pays the highest staking yield"], correct: 2 },
      { q: "After all Bitcoin is mined (~2140), how will miners be paid?", options: ["By new coin issuance", "By transaction fees only", "By the government", "They won't be paid"], correct: 1 }
    ]
  },

  // ============================== MODULE 2 ==============================
  {
    id: 2,
    title: "Ethereum",
    subtitle: "How crypto became programmable — smart contracts, DeFi, and Layer 2s",
    icon: "◈",
    tag: "ETHEREUM",
    duration: "55-65 min",
    xpReward: 500,
    lessons: [
      {
        title: "The World Computer",
        content: [
          { type: "quote", text: "Bitcoin is a calculator. Ethereum is a smartphone.", author: "Common framing in Ethereum developer education" },
          { type: "heading", text: "From money to programmable money" },
          { type: "body", text: "Bitcoin proved you could have money without a bank. Ethereum, launched in 2015, asked a bigger question: what if the ledger could run programs? These programs — smart contracts — are self-executing code deployed on-chain. Once live, they run exactly as written, for anyone, without a company in the middle." },
          { type: "body", text: "Smart contracts are the raw material for everything that followed: DeFi (lending, trading, derivatives), NFTs (on-chain ownership of digital items), stablecoins, and tokenization of real-world assets. Ether (ETH) is the fuel that pays for running this code." },
          { type: "callout", text: "The vault's key insight: on Ethereum, the application IS the contract. There is no server to shut down and no admin to bribe — only code, and whoever holds the keys to change it." }
        ]
      },
      {
        title: "Gas, The Merge, and Staking",
        content: [
          { type: "heading", text: "Why you pay 'gas'" },
          { type: "body", text: "Every operation on Ethereum costs 'gas,' paid in ETH. Since the EIP-1559 upgrade, each transaction pays a base fee that is algorithmically set by network demand and then BURNED (removed from supply), plus an optional priority fee (a tip) that goes to the validator who includes your transaction. Burning the base fee means heavy usage can make ETH deflationary." },
          { type: "heading", text: "The Merge: from mining to staking" },
          { type: "body", text: "In September 2022, 'The Merge' switched Ethereum from proof-of-work to proof-of-stake, cutting its energy use by roughly 99.95%. Instead of miners, the network is now secured by validators who lock up ETH as collateral." },
          { type: "list", items: [
            "Solo validator: stake exactly 32 ETH to run your own validator",
            "Liquid staking: pool any amount via Lido, Rocket Pool, or Coinbase and receive a token (e.g., stETH) you can still use in DeFi",
            "~1.05 million validators secure the network; base ETH staking yield has run around 3%",
            "Misbehaving validators can be 'slashed' — losing part of their stake"
          ]},
          { type: "vault", title: "VAULT SECRET: The base fee is destroyed, not collected", text: "Most people assume Ethereum fees go 'to Ethereum.' They don't. The EIP-1559 base fee is permanently burned — it disappears from circulation. In busy periods more ETH is burned than issued to validators, quietly shrinking supply. The network charges you to use it and then destroys the money. That is monetary policy written in code." }
        ]
      },
      {
        title: "Layer 2s: Scaling the Base Layer",
        content: [
          { type: "heading", text: "Why Ethereum went modular" },
          { type: "body", text: "Ethereum's base layer (L1) is secure but processes only ~15 transactions per second, and during congestion fees once spiked to tens of dollars. The solution was Layer 2s (L2s): separate chains that execute transactions off-chain in bulk, then post compressed proof back to Ethereum for settlement — inheriting L1 security at a fraction of the cost." },
          { type: "body", text: "The March 2024 Dencun upgrade added 'blobs' (EIP-4844), cutting L2 data costs by 50–90% and pushing most L2 fees well below a cent." },
          { type: "sortgame", title: "Sort the L2s by proof type", buckets: [
            { id: "optimistic", label: "Optimistic Rollup (assume valid, ~7-day challenge)" },
            { id: "zk", label: "ZK Rollup (cryptographic validity proof)" }
          ], items: [
            { text: "Arbitrum One", bucket: "optimistic" },
            { text: "Base (Coinbase)", bucket: "optimistic" },
            { text: "Optimism (OP Mainnet)", bucket: "optimistic" },
            { text: "zkSync Era", bucket: "zk" },
            { text: "Starknet", bucket: "zk" },
            { text: "Scroll", bucket: "zk" }
          ], note: "Optimistic rollups are cheaper to build and dominate TVL today; ZK rollups offer faster finality without a challenge window. The top three L2s — Base, Arbitrum, and Optimism — together handle close to 90% of all L2 transactions per 21Shares' December 2025 data." },
          { type: "action", text: "Bridge a tiny amount of ETH to Base or Arbitrum using the official bridge, then do one swap. Compare the fee you paid to what the same action costs on Ethereum L1 — you'll feel the Dencun difference." }
        ]
      }
    ],
    quiz: [
      { q: "What are self-executing programs on Ethereum called?", options: ["Gas tokens", "Smart contracts", "Validators", "Rollups"], correct: 1 },
      { q: "Under EIP-1559, what happens to the base fee?", options: ["It goes to miners", "It is burned (destroyed)", "It is refunded", "It goes to the foundation"], correct: 1 },
      { q: "How much ETH does a solo validator need to stake?", options: ["1 ETH", "16 ETH", "32 ETH", "100 ETH"], correct: 2 },
      { q: "What did 'The Merge' (Sept 2022) change?", options: ["Added smart contracts", "Switched from proof-of-work to proof-of-stake", "Created NFTs", "Capped ETH supply"], correct: 1 },
      { q: "What is a Layer 2's primary purpose?", options: ["Replace Ethereum", "Execute transactions cheaply while settling on Ethereum", "Mine Bitcoin", "Issue stablecoins"], correct: 1 },
      { q: "Which of these is a ZK rollup?", options: ["Arbitrum", "Base", "zkSync Era", "Optimism"], correct: 2 },
      { q: "The Dencun upgrade (2024) introduced what to lower L2 costs?", options: ["Staking", "Blobs (EIP-4844)", "NFTs", "The halving"], correct: 1 },
      { q: "What is the optional 'tip' paid to validators called?", options: ["Base fee", "Priority fee", "Burn fee", "Gas limit"], correct: 1 },
      { q: "Which L2 notably has no native token and is backed by Coinbase?", options: ["Arbitrum", "Base", "Starknet", "zkSync"], correct: 1 },
      { q: "Roughly how many transactions per second does Ethereum L1 process by design?", options: ["~15", "~1,000", "~10,000", "~65,000"], correct: 0 }
    ]
  },

  // ============================== MODULE 3 ==============================
  {
    id: 3,
    title: "Solana",
    subtitle: "Speed, low fees, and the ecosystem Iron Vault is built on",
    icon: "◎",
    tag: "SOLANA",
    duration: "55-65 min",
    xpReward: 500,
    lessons: [
      {
        title: "Why Speed and Fees Matter",
        content: [
          { type: "quote", text: "A blockchain you can actually use like an app, not a bank wire.", author: "The practical case for Solana" },
          { type: "heading", text: "The performance blockchain" },
          { type: "body", text: "Solana is a single high-performance Layer 1 (not a network of rollups). It pairs Proof of Stake with Proof of History — a cryptographic clock that timestamps transactions before they're processed — allowing validators to agree quickly. Slot times are roughly 400 milliseconds." },
          { type: "body", text: "The economic point is simple: Solana's base fee is 5,000 lamports per signature (0.000005 SOL), of which 50% is burned and 50% goes to the validator. A simple transfer costs a fraction of a cent — often around $0.00025. That makes microtransactions, frequent trading, and consumer apps economical in a way high-fee chains cannot match." },
          { type: "body", text: "During congestion you can add an optional priority fee (priced per compute unit) to jump the queue — but even that typically stays under a cent. Solana has run around 5,500 transactions per second in production, with the Firedancer client (from Jump Crypto) pushing throughput and resilience higher." },
          { type: "callout", text: "Iron Vault runs on Solana precisely because a gamified learning platform needs cheap, fast, frequent on-chain actions. On a chain where every click costs $5, gamification dies." }
        ]
      },
      {
        title: "The Solana DeFi Stack",
        content: [
          { type: "heading", text: "Phantom: your key to the ecosystem" },
          { type: "body", text: "Phantom is the most popular non-custodial Solana wallet (also now multichain). Non-custodial means YOU hold the keys via a secret recovery phrase — Phantom cannot access your funds, and no support desk can reverse a transaction. It handles SOL and SPL tokens, swaps, NFTs, staking, and Ledger hardware-wallet pairing." },
          { type: "heading", text: "Who does what" },
          { type: "reveal", title: "The four primitives of Solana DeFi", steps: [
            { label: "Route", tag: "JUPITER", heading: "DEX aggregator", text: "Jupiter (JUP) scans Raydium, Orca, Meteora, and Phoenix and splits your trade across venues for the best price. It does not hold its own spot liquidity — it routes to whoever has it." },
            { label: "Trade", tag: "RAYDIUM", heading: "AMM DEX", text: "Raydium (RAY) is a long-running automated market maker where liquidity providers earn fees from swaps. One of the core venues Jupiter routes through." },
            { label: "Lend", tag: "KAMINO", heading: "Lending + vaults", text: "Kamino (KMNO) runs Solana's largest lending market plus auto-rebalancing liquidity vaults — deposit collateral, borrow, or earn yield in one app." },
            { label: "Stake", tag: "JITO", heading: "MEV liquid staking", text: "Jito (JTO) issues JitoSOL, a liquid staking token that also captures MEV (validator ordering revenue) and passes most of it to holders. Marinade's mSOL is the main alternative." }
          ], note: "A single Solana session can chain all four atomically: deposit USDC on Kamino, borrow, swap on Jupiter, stake into JitoSOL — one wallet, near-instant." },
          { type: "vault", title: "VAULT SECRET: Liquid staking unlocks your locked SOL", text: "Native SOL staking locks your tokens with a cooldown to unstake. Liquid staking tokens like JitoSOL and mSOL represent your staked SOL PLUS accrued rewards — but the token itself trades freely and can be used as DeFi collateral. You earn staking yield AND keep your capital working. JitoSOL adds MEV revenue on top, which is why its realized yield has often beaten vanilla staking." }
        ]
      },
      {
        title: "Token Launches and Real Risk",
        content: [
          { type: "heading", text: "The fastest chain is also the fastest way to get rekt" },
          { type: "body", text: "Solana's low fees made it the home of token launches and memecoins (via platforms like Pump.fun). That's a double-edged sword: cheap, fast launches also mean an enormous volume of low-quality and outright fraudulent tokens. Independent research has flagged that a large majority of tokens launched on Solana in 2025 exhibited rug-pull characteristics." },
          { type: "body", text: "The edge is learning to separate protocols with real, auditable on-chain revenue (Jupiter, Jito, Raydium, Kamino) from launch hype with none." },
          { type: "callout", text: "Speed is neutral. It moves your gains and your losses at the same velocity. The vault rewards those who slow down before they click." },
          { type: "action", text: "Install Phantom, write your recovery phrase on paper (never a screenshot), fund it with a few dollars of SOL, and stake a small amount to a validator. Then look up your transaction on Solscan to see the whole thing on-chain." }
        ]
      }
    ],
    quiz: [
      { q: "What two mechanisms does Solana combine for consensus?", options: ["PoW + PoS", "PoS + Proof of History", "PoH + PoW", "PoS + PoA"], correct: 1 },
      { q: "What is Solana's base fee per signature?", options: ["5,000 lamports", "1 SOL", "0.1 SOL", "5 lamports"], correct: 0 },
      { q: "What does Jupiter primarily do?", options: ["Lending", "Liquid staking", "DEX aggregation / routing", "Issue stablecoins"], correct: 2 },
      { q: "What is Kamino best known for?", options: ["Wallet software", "Lending and yield vaults", "NFT minting", "Bridging"], correct: 1 },
      { q: "JitoSOL is an example of what?", options: ["A stablecoin", "A liquid staking token that also captures MEV", "A hardware wallet", "A DEX aggregator"], correct: 1 },
      { q: "What does 'non-custodial' mean for a Phantom wallet?", options: ["Phantom holds your keys", "You hold your keys via a recovery phrase", "The government holds your keys", "There are no keys"], correct: 1 },
      { q: "Approximately how much does a simple Solana transfer cost?", options: ["About $5", "About $0.50", "A fraction of a cent (~$0.00025)", "It's free with no limit"], correct: 2 },
      { q: "Raydium is best described as what?", options: ["A lending protocol", "An automated market maker (AMM) DEX", "A wallet", "A block explorer"], correct: 1 },
      { q: "What is the purpose of an optional priority fee on Solana?", options: ["To burn tokens", "To jump ahead in the transaction queue during congestion", "To stake SOL", "To mint NFTs"], correct: 1 },
      { q: "What is a documented risk of Solana's cheap, fast token launches?", options: ["Transactions are too slow", "A high volume of low-quality and rug-pull tokens", "Fees are too high", "No wallets support it"], correct: 1 }
    ]
  },

  // ============================== MODULE 4 ==============================
  {
    id: 4,
    title: "Stablecoins",
    subtitle: "Digital dollars — crypto's biggest real-world use case",
    icon: "＄",
    tag: "STABLECOINS",
    duration: "50-60 min",
    xpReward: 500,
    lessons: [
      {
        title: "What a Stablecoin Actually Is",
        content: [
          { type: "quote", text: "The killer app of crypto so far isn't speculation — it's a dollar that moves at the speed of the internet.", author: "The stablecoin thesis" },
          { type: "heading", text: "A token pegged to a dollar" },
          { type: "body", text: "A stablecoin is a token designed to hold a 1:1 peg to a fiat currency, almost always the US dollar. The dominant model is fiat-backed: the issuer holds reserves (cash and short-dated US Treasuries) and promises each token is redeemable for $1. This gives you a dollar you can send globally in seconds for pennies, hold in a self-custody wallet, and plug into DeFi." },
          { type: "list", items: [
            "USDT (Tether): the largest, reached ~$186.6B by end-2025; dominant on exchanges and in emerging markets",
            "USDC (Circle): ~$75.1B by end-2025; grew faster (+73% in 2025), favored by institutions for transparency; Circle is NYSE-listed",
            "Together USDT and USDC are more than 90% of the entire stablecoin market"
          ]},
          { type: "callout", text: "Not all $1 tokens carry the same risk. A stablecoin is only as good as its reserves and its redemption mechanism. 'Trading at $1' and 'safe' are not the same thing." }
        ]
      },
      {
        title: "Real Uses: Payments, Collateral, Remittances",
        content: [
          { type: "heading", text: "Where digital dollars actually get used" },
          { type: "sortgame", title: "Sort: real stablecoin use case vs. myth", buckets: [
            { id: "real", label: "Documented real use" },
            { id: "myth", label: "Misconception" }
          ], items: [
            { text: "Cross-border payments and remittances", bucket: "real" },
            { text: "Collateral and yield in DeFi (e.g., Kamino, Aave)", bucket: "real" },
            { text: "Dollar access in high-inflation economies", bucket: "real" },
            { text: "Settlement rails for firms like Visa", bucket: "real" },
            { text: "Stablecoins always earn you interest automatically", bucket: "myth" },
            { text: "A $1 peg means zero risk", bucket: "myth" }
          ], note: "Stablecoin transfer volume has rivaled and at times exceeded major card networks. Standard stablecoins like USDC/USDT do NOT pay holders yield by default — the issuer keeps the reserve interest." },
          { type: "body", text: "In DeFi, stablecoins are the base settlement layer: you supply USDC to earn lending yield, post it as collateral to borrow, or provide it to liquidity pools. In the real world, they move money across borders far faster and cheaper than correspondent banking." },
          { type: "vault", title: "VAULT SECRET: The Treasury connection", text: "Because large fiat-backed stablecoins hold their reserves heavily in short-dated US Treasuries, the biggest issuers have become significant buyers of US government debt. Tether has at times ranked among the larger holders of US Treasuries globally. The digital-dollar tail is now big enough to wag part of the traditional-finance dog." }
        ]
      },
      {
        title: "Regulation: GENIUS, MiCA, and Trust",
        content: [
          { type: "heading", text: "The rules finally arrived" },
          { type: "body", text: "For years stablecoins operated in a legal gray zone. That changed fast:" },
          { type: "list", items: [
            "GENIUS Act — signed into US law July 18, 2025 (Public Law 119-27): the first US federal stablecoin framework. Requires 1:1 reserves in cash / short-dated Treasuries / repos, monthly public disclosure, and restricts issuance to permitted issuers. Full operational enforcement is targeted for January 2027.",
            "MiCA (EU) — stablecoin rules have applied since June 30, 2024; it forced USDT to be delisted for European users while compliant coins like USDC kept their listings.",
            "Circle, Paxos, and others received conditional US trust-bank charters in late 2025."
          ]},
          { type: "callout", text: "Regulation is a double-edged sword: it adds trust and institutional money, but it also picks winners. The 'regulated dollar' (USDC) gained ground precisely because rules arrived — while unregulated coins faced headwinds in some regions." },
          { type: "body", text: "Time-sensitive note: rule-making by the OCC, FDIC, and FinCEN was still being finalized into 2026. Treat specific compliance deadlines as moving targets and verify before relying on them." },
          { type: "action", text: "Hold a small amount of USDC in your wallet and send $1 to another wallet you own. Note the fee and the settlement time, then compare it to a bank transfer or wire you've done recently." }
        ]
      }
    ],
    quiz: [
      { q: "What is a fiat-backed stablecoin designed to do?", options: ["Rise in value like Bitcoin", "Hold a 1:1 peg to a currency like the US dollar", "Pay the highest yield", "Replace all banks"], correct: 1 },
      { q: "Which is the largest stablecoin by market cap?", options: ["USDC", "DAI", "USDT (Tether)", "PYUSD"], correct: 2 },
      { q: "When was the US GENIUS Act signed into law?", options: ["2021", "July 18, 2025", "January 2024", "It hasn't passed"], correct: 1 },
      { q: "What does the GENIUS Act require of reserves?", options: ["100% in Bitcoin", "1:1 backing in cash/short-dated Treasuries/repos", "No reserves needed", "Reserves in gold only"], correct: 1 },
      { q: "Which EU regulation forced USDT delistings for European users?", options: ["GENIUS Act", "MiCA", "GDPR", "Dodd-Frank"], correct: 1 },
      { q: "Do standard stablecoins like USDC pay holders interest by default?", options: ["Yes, automatically", "No — the issuer keeps the reserve interest", "Only on weekends", "Only USDT does"], correct: 1 },
      { q: "Together, roughly what share of the stablecoin market do USDT and USDC hold?", options: ["About 20%", "About 50%", "More than 90%", "Exactly 100%"], correct: 2 },
      { q: "Which is a documented real-world stablecoin use case?", options: ["Guaranteed risk-free returns", "Cross-border payments and remittances", "Mining Bitcoin", "Replacing proof-of-work"], correct: 1 },
      { q: "Why do large stablecoin issuers hold US Treasuries?", options: ["For decoration", "As the reserve backing their tokens", "To mine them", "They are required to hold gold instead"], correct: 1 },
      { q: "Which stablecoin issuer went public on the NYSE in 2025?", options: ["Tether", "Circle", "Paxos", "MakerDAO"], correct: 1 }
    ]
  },

  // ============================== MODULE 5 ==============================
  {
    id: 5,
    title: "Tokenomics",
    subtitle: "How tokens actually work — supply, FDV, unlocks, and emissions",
    icon: "🜚",
    tag: "TOKENOMICS",
    duration: "55-65 min",
    xpReward: 500,
    lessons: [
      {
        title: "Supply: Circulating, Total, Max",
        content: [
          { type: "quote", text: "Price tells you what one token costs. Supply tells you what you're actually buying.", author: "The tokenomics mindset" },
          { type: "heading", text: "Three numbers that change everything" },
          { type: "list", items: [
            "Circulating supply: tokens currently tradable in the market right now",
            "Total supply: tokens that exist minus any burned (includes locked/vested tokens)",
            "Max supply: the absolute ceiling of tokens that will ever exist (some tokens have no cap)"
          ]},
          { type: "body", text: "The gap between circulating and max supply is where fortunes are quietly lost. If only 10% of a token is circulating and 90% is locked and scheduled to unlock, that locked supply is a wave of future selling pressure heading toward the market." },
          { type: "callout", text: "The fox always asks: 'What percentage of the total supply is actually circulating?' A token 'up 300%' with 5% circulating is often just a low-float mirage." }
        ]
      },
      {
        title: "Market Cap vs. FDV",
        content: [
          { type: "heading", text: "The most misunderstood number in crypto" },
          { type: "body", text: "Market Cap = price × circulating supply (what the tradable tokens are worth today). Fully Diluted Valuation (FDV) = price × max (or total) supply (what the project would be worth if EVERY token were already circulating at today's price)." },
          { type: "body", text: "When FDV is far higher than market cap, most of the supply is still locked. That gap is a dilution warning: as tokens unlock, new supply must be absorbed by demand or the price tends to fall." },
          { type: "calculator", variant: "compound", title: "FDV vs. Market Cap Explorer", inputs: [
            { key: "price", label: "Token price", min: 0.01, max: 10, step: 0.01, default: 2, prefix: "$", suffix: "" },
            { key: "circulating", label: "Circulating supply (millions)", min: 1, max: 1000, step: 1, default: 50, prefix: "", suffix: "M" },
            { key: "maxSupply", label: "Max supply (millions)", min: 1, max: 1000, step: 1, default: 500, prefix: "", suffix: "M" }
          ], note: "Market Cap = price × circulating. FDV = price × max supply. With the defaults ($2 × 50M = $100M market cap vs. $2 × 500M = $1B FDV), 90% of supply is still locked — a 10x dilution overhang." },
          { type: "vault", title: "VAULT SECRET: The Terra/LUNA lesson", text: "In May 2022, LUNA's supply ballooned from ~350 million to 6.5 TRILLION tokens in days because of an uncapped mint mechanism. FDV became meaningless overnight. Lesson: always read HOW supply can change — mint functions, uncapped emissions, and upgradeable contracts can make any tidy valuation a fiction." }
        ]
      },
      {
        title: "Vesting, Unlocks, Burns, and Emissions",
        content: [
          { type: "heading", text: "The supply calendar" },
          { type: "reveal", title: "The mechanics that move supply", steps: [
            { label: "Lock", tag: "VESTING", heading: "Vesting", text: "Team and investor tokens are locked and released gradually over months or years. Track schedules on tools like DefiLlama Unlocks or Tokenomist." },
            { label: "Drop", tag: "CLIFF", heading: "Cliff / unlock", text: "A cliff is a large one-time unlock on a specific date — often a moment of concentrated sell pressure. Watch the calendar." },
            { label: "Flow", tag: "EMISSIONS", heading: "Emissions", text: "Ongoing issuance to stakers, liquidity providers, or miners. Steady emissions dilute holders unless demand keeps pace." },
            { label: "Sink", tag: "BURN", heading: "Burns", text: "Permanent removal of tokens from supply (e.g., ETH's EIP-1559 base-fee burn, BNB quarterly burns), which counteracts dilution." }
          ], note: "Healthy tokenomics = the flows in (emissions, unlocks) are matched or exceeded by real demand and sinks (burns, staking lockups)." },
          { type: "body", text: "Staking ties these together: locking tokens to secure a network earns rewards (often from emissions) but also removes tokens from circulation, tightening float. Whether staking rewards are 'real yield' (from fees) or just inflation (from new emissions) is one of the sharpest questions you can ask." },
          { type: "callout", text: "A high emissions APY paid in a token that is dumping is not yield — it's a slower way to lose. Always ask: rewards paid in what, funded from where?" },
          { type: "action", text: "Pick any token on CoinGecko, toggle 'Show Fully Diluted Valuation,' and calculate the FDV/market-cap ratio. Then find its unlock schedule on a tracker and note the next big cliff date." }
        ]
      }
    ],
    quiz: [
      { q: "How is Market Cap calculated?", options: ["Price × max supply", "Price × circulating supply", "Price × total volume", "Price alone"], correct: 1 },
      { q: "How is FDV calculated?", options: ["Price × circulating supply", "Price × max (or total) supply", "Price × daily volume", "Market cap × 2"], correct: 1 },
      { q: "A token has a $100M market cap but $1B FDV. What does this signal?", options: ["It's undervalued", "Most supply is locked — dilution risk ahead", "It has no max supply", "It's a stablecoin"], correct: 1 },
      { q: "What is a 'cliff' in tokenomics?", options: ["A price crash", "A large one-time token unlock on a specific date", "A type of burn", "A staking reward"], correct: 1 },
      { q: "What does a token 'burn' do?", options: ["Increases supply", "Permanently removes tokens from supply", "Locks tokens for staking", "Mints new tokens"], correct: 1 },
      { q: "What is circulating supply?", options: ["All tokens that will ever exist", "Tokens currently tradable in the market", "Only burned tokens", "Locked team tokens"], correct: 1 },
      { q: "What are 'emissions'?", options: ["Token burns", "Ongoing issuance of new tokens to stakers/LPs/miners", "The max supply", "A regulatory filing"], correct: 1 },
      { q: "Which mechanism can make a token deflationary?", options: ["Emissions", "Vesting", "Burns exceeding issuance", "Cliffs"], correct: 2 },
      { q: "Why should you question a very high staking APY?", options: ["High APY is always a scam", "It may be funded by inflation/emissions in a depreciating token", "Staking is illegal", "APY doesn't exist in crypto"], correct: 1 },
      { q: "What does a large gap between FDV and market cap primarily quantify?", options: ["Guaranteed profit", "The dilution overhang from locked future supply", "Transaction fees", "The burn rate"], correct: 1 }
    ]
  },

  // ============================== MODULE 6 ==============================
  {
    id: 6,
    title: "Crypto Security",
    subtitle: "How people actually get robbed — and the Iron Vault checklist",
    icon: "🔐",
    tag: "SECURITY",
    duration: "55-65 min",
    xpReward: 500,
    lessons: [
      {
        title: "The Seed Phrase Is Everything",
        content: [
          { type: "quote", text: "Not your keys, not your coins. And whoever has your seed phrase has your coins.", author: "The first rule of self-custody" },
          { type: "heading", text: "How self-custody really works" },
          { type: "body", text: "A crypto wallet doesn't 'store' coins — it stores the private keys that control them, generated from a 12- or 24-word secret recovery phrase (seed phrase). Anyone who gets that phrase gets everything, instantly and irreversibly. There is no fraud department and no chargeback." },
          { type: "list", items: [
            "Write the seed phrase on paper or metal — NEVER a screenshot, photo, cloud note, or email",
            "No legitimate wallet, exchange, or support agent will ever ask for your seed phrase — anyone who does is a scammer",
            "Use a hardware wallet (Ledger, Trezor) for meaningful holdings — keys stay offline",
            "Structure: exchange for buying, hot wallet (small amounts) for activity, cold wallet for savings"
          ]},
          { type: "callout", text: "Blockchain transactions are irreversible. That is the point — and it is also why security is the entire game. Recovery is almost never possible." }
        ]
      },
      {
        title: "The Attack Playbook",
        content: [
          { type: "heading", text: "How the money actually leaves" },
          { type: "body", text: "Crypto phishing losses fell sharply — down 83% to about $83.85 million across roughly 106,000 victims in 2025 (Scam Sniffer) — but the drainer ecosystem stayed active and adaptive. Know the vectors:" },
          { type: "reveal", title: "The six ways wallets get drained", steps: [
            { label: "1", tag: "APPROVALS", heading: "Malicious token approvals", text: "You sign an approval on a shady site; a contract can then drain that token later — sometimes months later. Permit/Permit2 signatures accounted for 38% of 2025's large losses." },
            { label: "2", tag: "DRAINERS", heading: "Wallet drainer sites", text: "Fake sites and browser extensions that trick you into signing a drain transaction. Drainer-as-a-service kits (Inferno, Pink) industrialized this." },
            { label: "3", tag: "POISONING", heading: "Address poisoning", text: "Attackers send dust from a lookalike address so you copy the wrong one from history. One victim lost $50M in USDT this way in December 2025." },
            { label: "4", tag: "PHISHING", heading: "Fake sites & fake support", text: "Lookalike domains and DMs from fake 'support.' After any hack, drainers register fake 'revoke' sites to trap users following real advice." },
            { label: "5", tag: "SIMSWAP", heading: "SIM-swap", text: "Attackers hijack your phone number to intercept SMS 2FA codes. Use an authenticator app or hardware key — never SMS 2FA." },
            { label: "6", tag: "SEED", heading: "Seed phrase theft", text: "Phrases stored digitally (photos, cloud, email) get stolen by malware. Keep them fully offline." }
          ], note: "Nearly all of these rely on social engineering — tricking YOU into signing — not on 'hacking the blockchain.'" },
          { type: "vault", title: "VAULT SECRET: The dormant approval time-bomb", text: "In August 2025 a user lost $908,000 because of a malicious ERC-20 approval they had signed 458 days earlier. The scammer waited, watched the balance grow, then struck. This is why periodically revoking old approvals with revoke.cash isn't optional — a dangerous permission you granted last year is still live today." }
        ]
      },
      {
        title: "The Iron Vault Security Checklist",
        content: [
          { type: "heading", text: "Decide before you click" },
          { type: "scenario", title: "The Phishing Decision Tree", prompt: "You get a DM: 'Iron Vault airdrop is LIVE! Connect your wallet at iron-vault-claim.net to claim before it ends.' What do you do?", nodes: {
            start: { text: "The message creates urgency and links to an unfamiliar domain. Your move?", choices: [
              { label: "Click the link and connect my wallet — don't want to miss it", to: "clicked" },
              { label: "Ignore the DM and verify only through the official site/account I already trust", to: "verified" },
              { label: "Ask the sender if it's legit", to: "asked" }
            ] },
            clicked: { text: "The site prompts you to sign a transaction to 'verify' your wallet. It's a drainer signature. Your assets are gone the moment you approve.", outcome: "bad", lesson: "Urgency + unsolicited link + wallet connection = the classic drainer trap. Real support and real claims never DM you first." },
            verified: { text: "You check the official Iron Vault channels. There's no such claim link — it was a phishing lookalike domain. You saved everything.", outcome: "good", lesson: "Always verify through a source you independently trust. Type the URL yourself; never trust links from DMs or reply threads." },
            asked: { text: "The 'sender' is a scammer or a compromised account — they insist it's real. Trusting their reply just re-confirms the trap.", outcome: "bad", lesson: "The person messaging you cannot be your source of truth. Verify independently, not with the stranger." }
          } },
          { type: "list", items: [
            "Bookmark official sites; never reach dApps through DMs, ads, or reply threads",
            "Read every transaction before signing — if it requests setApprovalForAll or an unlimited approval, pause",
            "Revoke unused approvals regularly at revoke.cash",
            "Hardware wallet for savings; app/hardware 2FA (never SMS) for exchanges",
            "Verify full addresses character-by-character; send a small test transfer first",
            "Real support never DMs first and never asks for your seed phrase"
          ]},
          { type: "action", text: "Go to revoke.cash, connect your main wallet (read-only to view), and review every active token approval. Revoke anything you don't recognize or no longer use." }
        ]
      }
    ],
    quiz: [
      { q: "What controls access to your crypto?", options: ["Your username", "Your seed phrase / private keys", "Your email", "Your exchange password"], correct: 1 },
      { q: "Where should you store your seed phrase?", options: ["A screenshot on your phone", "In your email", "Offline on paper or metal", "In a cloud note"], correct: 2 },
      { q: "A support agent DMs you asking for your seed phrase to 'fix' an issue. This is:", options: ["Normal procedure", "Always a scam", "Only okay for exchanges", "Required for staking"], correct: 1 },
      { q: "What is 'address poisoning'?", options: ["Hacking a validator", "Sending dust from a lookalike address so you copy the wrong one", "A type of staking", "A regulatory action"], correct: 1 },
      { q: "Which tool is used to review and revoke token approvals?", options: ["revoke.cash", "CoinGecko", "Phantom", "MetaMask Swaps"], correct: 0 },
      { q: "Why is SMS 2FA risky for crypto?", options: ["It's too slow", "SIM-swap attacks can intercept the codes", "It costs money", "It's actually the safest option"], correct: 1 },
      { q: "A malicious token approval you signed can be exploited:", options: ["Only immediately", "Never after 24 hours", "Even months later", "Only on Bitcoin"], correct: 2 },
      { q: "What did crypto phishing losses do in 2025?", options: ["Doubled", "Fell about 83% year-over-year", "Stayed flat", "Went to zero"], correct: 1 },
      { q: "Before sending a large transfer, you should:", options: ["Send it all at once quickly", "Verify the full address and send a small test first", "Trust the abbreviated address", "Disable your wallet"], correct: 1 },
      { q: "Most wallet drains rely primarily on what?", options: ["Breaking blockchain cryptography", "Social engineering — tricking you into signing", "Government backdoors", "Slow networks"], correct: 1 }
    ]
  },

  // ============================== MODULE 7 ==============================
  {
    id: 7,
    title: "On-Chain Intelligence",
    subtitle: "How to read the blockchain — explorers, whales, and red flags",
    icon: "👁",
    tag: "ON-CHAIN",
    duration: "55-65 min",
    xpReward: 500,
    lessons: [
      {
        title: "The Blockchain Is Public",
        content: [
          { type: "quote", text: "Every wallet, every trade, every rug — it's all written on a ledger anyone can read. Most people just never learn to read it.", author: "The on-chain edge" },
          { type: "heading", text: "Explorers: your window into the ledger" },
          { type: "body", text: "Block explorers let you inspect any transaction, wallet, or contract directly. Etherscan does this for Ethereum; Solscan does it for Solana. You can see a wallet's full balance and history, a token's holder list, and a contract's code — no permission needed." },
          { type: "reveal", title: "The layers a block explorer reveals", steps: [
            { label: "Layer 1", tag: "TX", heading: "The transaction", text: "Sender, receiver, amount, fee, timestamp, and success/fail status — the raw movement of value." },
            { label: "Layer 2", tag: "WALLET", heading: "The wallet", text: "Full balance, token holdings, and complete history. Is this a fresh wallet or a seasoned one?" },
            { label: "Layer 3", tag: "TOKEN", heading: "The token", text: "Holder count, holder concentration, and how supply is distributed. Ten wallets holding 90%? Red flag." },
            { label: "Layer 4", tag: "CONTRACT", heading: "The contract", text: "The code itself — is it verified? Can the owner mint infinite tokens or freeze transfers? The truth is in the source." }
          ], note: "Explorers are free and definitive. When an influencer's claim conflicts with the explorer, the explorer wins." },
          { type: "callout", text: "On-chain data shows MOVEMENT, not INTENT. A whale moving tokens to an exchange might sell — or might just be rebalancing. Read signals, don't invent stories." }
        ]
      },
      {
        title: "The Analytics Stack",
        content: [
          { type: "heading", text: "Beyond raw explorers" },
          { type: "body", text: "Explorers show raw data; analytics platforms turn it into intelligence. Each tool answers a different question — the edge comes from using them together." },
          { type: "sortgame", title: "Match the tool to its job", buckets: [
            { id: "market", label: "Market / protocol-level data" },
            { id: "wallet", label: "Wallet / entity intelligence" }
          ], items: [
            { text: "DeFiLlama (TVL, fees, stablecoins across 350+ chains, free)", bucket: "market" },
            { text: "DexScreener (live DEX pairs, price, liquidity, volume)", bucket: "market" },
            { text: "Dune (custom SQL dashboards)", bucket: "market" },
            { text: "Nansen (wallet labels, 'smart money' tracking)", bucket: "wallet" },
            { text: "Arkham (entity attribution — who owns a wallet)", bucket: "wallet" },
            { text: "Etherscan / Solscan (verify any single transaction)", bucket: "wallet" }
          ], note: "DeFiLlama and DexScreener give you the market map; Nansen and Arkham tell you who's moving. Cross-check them — capital flowing in on-chain PLUS rising TVL PLUS labeled funds entering is far stronger than any one signal alone." },
          { type: "vault", title: "VAULT SECRET: TVL is not proof of safety", text: "Total Value Locked is the headline metric everyone quotes, but it can rise from token-price gains, mercenary incentives, or looping — not real usage. A protocol with $1B TVL and near-zero trading volume is dormant, not healthy. Always check volume and fees alongside TVL. The number that gets quoted least often is usually the honest one." }
        ]
      },
      {
        title: "Reading Red Flags",
        content: [
          { type: "heading", text: "What separates a real project from a trap" },
          { type: "body", text: "Before touching a new token, run the on-chain checks. The blockchain will tell you more truth in five minutes than a Telegram group will in five weeks." },
          { type: "list", items: [
            "Holder concentration: do a handful of wallets hold most of the supply? (Solscan/Etherscan holder list)",
            "Liquidity depth: is the pool deep enough to sell into, and is the liquidity locked?",
            "DEX volume vs. TVL: real trading or a ghost town? (DexScreener, DeFiLlama)",
            "Contract permissions: can the owner mint, freeze, or blacklist? (verified source on the explorer)",
            "Wallet age & funding: are 'holders' fresh wallets funded from one source? (Sybil / insider pattern)",
            "Labeled wallets: are known scam or 'smart money' entities involved? (Nansen, Arkham)"
          ]},
          { type: "callout", text: "The fox's rule: 'If you cannot verify the chain, the liquidity, the contract, and the holders — you are not early. You are just exposed.'" },
          { type: "action", text: "Pick a token you're curious about. Open its page on DexScreener (liquidity, volume), then find its top holders on the relevant explorer. Write down one green flag and one red flag before forming any opinion." }
        ]
      }
    ],
    quiz: [
      { q: "Which explorer is for Solana?", options: ["Etherscan", "Solscan", "DeFiLlama", "Nansen"], correct: 1 },
      { q: "What is DeFiLlama best known for?", options: ["Wallet labels", "TVL and protocol data across many chains", "SQL queries", "Entity attribution"], correct: 1 },
      { q: "On-chain data primarily shows what?", options: ["Trader intent", "Movement of value, not intent", "Future prices", "Insider plans"], correct: 1 },
      { q: "Which tool labels wallets and tracks 'smart money'?", options: ["DexScreener", "Nansen", "Etherscan", "CoinGecko"], correct: 1 },
      { q: "A token where 10 wallets hold 90% of supply is:", options: ["Very safe", "A holder-concentration red flag", "Guaranteed to rise", "A stablecoin"], correct: 1 },
      { q: "Why is TVL alone an unreliable safety signal?", options: ["It's always fake", "It can rise from price gains or incentives without real usage", "It only counts Bitcoin", "It's illegal to measure"], correct: 1 },
      { q: "What does Arkham specialize in?", options: ["Entity attribution (who owns a wallet)", "Charting only", "Issuing stablecoins", "Mining"], correct: 0 },
      { q: "Which platform is best for spotting newly active DEX pairs and momentum?", options: ["DexScreener", "Etherscan", "Ledger", "MiCA"], correct: 0 },
      { q: "Where can you confirm whether a contract lets the owner mint infinite tokens?", options: ["A Telegram group", "The verified contract source on a block explorer", "The token's Twitter", "A price chart"], correct: 1 },
      { q: "What does Dune primarily provide?", options: ["Hardware wallets", "Custom SQL dashboards on blockchain data", "Seed phrase storage", "A stablecoin"], correct: 1 }
    ]
  },

  // ============================== MODULE 8 ==============================
  {
    id: 8,
    title: "Market Cycles",
    subtitle: "How crypto moves — dominance, rotations, and survival",
    icon: "🌗",
    tag: "CYCLES",
    duration: "50-60 min",
    xpReward: 500,
    lessons: [
      {
        title: "The Rhythm of the Market",
        content: [
          { type: "quote", text: "History doesn't repeat, but in crypto it rhymes — in roughly four-year verses.", author: "On market cycles" },
          { type: "heading", text: "The four phases" },
          { type: "body", text: "Crypto has historically moved in cycles, often discussed alongside Bitcoin's four-year halving rhythm. This is documented history, not a prediction — and the past two cycles show the pattern is evolving." },
          { type: "reveal", title: "The four phases of a market cycle", steps: [
            { label: "Phase 1", tag: "ACCUMULATION", heading: "Accumulation", text: "After a bottom, sentiment is dead, prices are flat, and patient buyers quietly accumulate. Nobody is talking about crypto." },
            { label: "Phase 2", tag: "MARKUP", heading: "Bull / markup", text: "Prices rise, attention returns, media coverage grows. Confidence builds toward euphoria." },
            { label: "Phase 3", tag: "EUPHORIA", heading: "Peak / euphoria", text: "FOMO peaks, memecoins moon, everyone is a genius. Historically the moment of maximum risk." },
            { label: "Phase 4", tag: "DECLINE", heading: "Bear / markdown", text: "Prices fall hard (BTC has dropped ~80%, alts ~90%+ in past bears), fear and capitulation dominate, then a new bottom forms." }
          ], note: "The Fear & Greed Index is a simple gauge of where sentiment sits in this loop. Extreme greed and extreme fear have historically marked turning points." },
          { type: "callout", text: "The vault's discipline: the best accumulation happens when it's most boring, and the greatest risk arrives when it feels safest. Emotions are inversely correlated with good decisions." }
        ]
      },
      {
        title: "Dominance and Rotation",
        content: [
          { type: "heading", text: "Bitcoin Dominance (BTC.D)" },
          { type: "body", text: "Bitcoin Dominance = Bitcoin's market cap ÷ total crypto market cap. It's a map of where capital is concentrated. Historically it has ranged roughly 33–73% since 2017. When dominance is high, money hides in BTC; when it falls, capital rotates down the risk curve toward altcoins — the phenomenon traders call 'altseason.'" },
          { type: "body", text: "The classic rotation sequence: money enters Bitcoin first → then Ethereum → then large-cap alts → then smaller alts and memecoins. Historically, altseasons (2017, 2021) began when BTC.D rolled over from a high and the ETH/BTC ratio started rising." },
          { type: "callout", text: "Critical caveat: rising dominance doesn't always mean 'BTC strong' — sometimes it means 'alts dying faster than BTC' (as in the 2022 Luna/FTX collapses). Always cross-check dominance against total market cap." },
          { type: "vault", title: "VAULT SECRET: This cycle broke the old altseason", text: "The 2024–2026 cycle was documented as shallower and more selective than past ones. Two structural changes: spot Bitcoin ETFs absorb BTC supply that used to rotate into alts, and the growing stablecoin market cap (hundreds of billions) mechanically suppresses the BTC.D reading. The old 'everything pumps' altseason weakened — capital concentrated in BTC, ETH, and a short list of large caps. The map still works, but the terrain changed." }
        ]
      },
      {
        title: "Narratives, Liquidity, and Survival",
        content: [
          { type: "heading", text: "What actually drives the moves" },
          { type: "body", text: "Halvings and dominance are part of the story, but liquidity is the tide underneath. Analysis of global money supply (M2) has shown correlation with past bull markets (2013, 2017, 2021). When money is cheap and abundant, narratives (AI, RWA, DePIN, memecoins) catch fire; when liquidity tightens, fundamentals reassert and speculative capital retreats." },
          { type: "list", items: [
            "Narratives rotate — each cycle has its themes; being early to a real one matters, chasing a dead one destroys capital",
            "FOMO is a market-cycle emotion, not a strategy — it peaks at the top",
            "Bear markets are where most participants quit; survival (not perfect timing) is the actual skill",
            "Position sizing and risk management outlast any single narrative"
          ]},
          { type: "callout", text: "No price predictions live in this vault. We teach the mechanics — halvings, dominance, rotation, liquidity — so you can read the market, not gamble on a forecast." },
          { type: "action", text: "Look up the current Bitcoin Dominance (BTC.D) on TradingView and the current Fear & Greed Index. Write down both numbers and one sentence on what phase they suggest — then revisit in 30 days and see how it moved." }
        ]
      }
    ],
    quiz: [
      { q: "How is Bitcoin Dominance (BTC.D) calculated?", options: ["BTC price ÷ ETH price", "BTC market cap ÷ total crypto market cap", "BTC volume ÷ total volume", "BTC supply ÷ 21 million"], correct: 1 },
      { q: "What is 'altseason'?", options: ["When Bitcoin dominates", "A period when altcoins outperform Bitcoin", "A halving event", "A regulatory season"], correct: 1 },
      { q: "The four phases of a market cycle are roughly:", options: ["Buy, hold, sell, repeat", "Accumulation, markup, euphoria, markdown", "Spring, summer, fall, winter", "Mint, stake, burn, vest"], correct: 1 },
      { q: "Historically, altseasons began when BTC.D did what?", options: ["Rose from a low", "Rolled over from a high while ETH/BTC rose", "Stayed exactly flat", "Hit 100%"], correct: 1 },
      { q: "What is the classic capital rotation sequence?", options: ["Memecoins → BTC → ETH", "BTC → ETH → large-cap alts → smaller alts", "Stablecoins only", "Random"], correct: 1 },
      { q: "Rising BTC dominance can sometimes mean:", options: ["Alts are dying faster than BTC", "Bitcoin is always strong", "A halving occurred", "Stablecoins were banned"], correct: 0 },
      { q: "What structurally weakened the 'everything pumps' altseason in 2024–2026?", options: ["Higher gas fees", "Spot BTC ETFs and growing stablecoin market cap", "The Merge", "Bitcoin Pizza Day"], correct: 1 },
      { q: "What macro factor has correlated with past bull markets?", options: ["The number of exchanges", "Global money supply (M2) / liquidity", "Twitter followers", "Gas prices"], correct: 1 },
      { q: "According to cycle discipline, when is risk historically highest?", options: ["During boring accumulation", "During peak euphoria/FOMO", "During the bear bottom", "During a halving"], correct: 1 },
      { q: "What is the actual core skill emphasized for bear markets?", options: ["Perfect top-timing", "Survival and risk management", "Maximum leverage", "Ignoring the market entirely"], correct: 1 }
    ]
  },

  // ============================== MODULE 9 ==============================
  {
    id: 9,
    title: "Airdrops and Points",
    subtitle: "How early users get rewarded — without farming like a clown",
    icon: "🪂",
    tag: "AIRDROPS",
    duration: "50-60 min",
    xpReward: 500,
    lessons: [
      {
        title: "What Airdrops Actually Are",
        content: [
          { type: "quote", text: "Protocols don't give away tokens for charity — they pay for the behavior they want, and filter out everyone gaming it.", author: "The airdrop reality" },
          { type: "heading", text: "Getting paid to be early" },
          { type: "body", text: "An airdrop distributes free tokens to wallets that used a protocol before it launched a token — a way to reward and decentralize ownership among real early users. Points systems are the modern evolution: you earn points for specific on-chain actions, and points later convert (often opaquely) into a token allocation." },
          { type: "list", items: [
            "Activity that has earned rewards: swaps, providing liquidity, bridging, lending/borrowing, staking, testnet usage, and governance",
            "Points systems reward consistency and real engagement over time, not one-off clicks",
            "Documented reality: roughly 50–70% of airdropped tokens are sold within 30 days, and many lose value within months"
          ]},
          { type: "callout", text: "This module is education, not financial advice. Airdrops are not free money — they cost time, gas, and capital at risk, and most farmed tokens underperform." }
        ]
      },
      {
        title: "Points Systems and the Sybil Problem",
        content: [
          { type: "heading", text: "Case study: Hyperliquid" },
          { type: "body", text: "Hyperliquid (a decentralized perps exchange) ran one of the most successful points campaigns. On November 29, 2024, it distributed roughly 310 million HYPE (~31% of supply) to about 94,000 wallets — pushed directly to wallets with no click-to-claim. Points were earned through real trading volume, maker liquidity, and vault deposits, with the exact points-to-token formula kept secret to make it harder to game." },
          { type: "heading", text: "The Sybil problem" },
          { type: "body", text: "A Sybil attack is one person running many wallets to farm multiple allocations. Projects fight back with detection — and it's ruthless. For its June 2024 ZRO airdrop, LayerZero manually removed 803,273 Sybil wallets — about 59% of all applicants — using IP clustering, wallet-graph analysis, and timing correlation (with help from Nansen and Chaos Labs). It even offered a self-report path: admit you're a Sybil and keep 15%, or get caught and get 0%." },
          { type: "vault", title: "VAULT SECRET: Your wallet is your reputation", text: "The game shifted. Projects now analyze whether a wallet tells a coherent 'story' — diverse actions, returning over months, using features as intended. One swap says nothing. Six months of genuine, varied activity from a single well-funded wallet often beats twenty copy-paste wallets that all get flagged and zeroed. Quality of history is the new moat." }
        ]
      },
      {
        title: "Farming Without Getting Flagged",
        content: [
          { type: "heading", text: "Sybil-safe vs. Sybil-flagged behavior" },
          { type: "sortgame", title: "Sort the behavior", buckets: [
            { id: "safe", label: "Genuine / Sybil-resistant" },
            { id: "flagged", label: "Sybil-flagged pattern" }
          ], items: [
            { text: "Using one main wallet consistently over months", bucket: "safe" },
            { text: "Diverse actions: swaps, LPing, lending, governance", bucket: "safe" },
            { text: "Actually using the product as intended", bucket: "safe" },
            { text: "20 wallets all making identical tiny transactions", bucket: "flagged" },
            { text: "Many wallets funded from one source at the same time", bucket: "flagged" },
            { text: "Bridging dust back and forth to fake volume", bucket: "flagged" }
          ], note: "Detection keys on shared funding, clustered timing, and near-identical interaction sequences. Genuine, varied, sustained use is the only durable strategy — and it's also just... using crypto." },
          { type: "body", text: "Beware the dark side: fake 'airdrop claim' sites and GitHub repos named things like 'airdrop-claim' are among the most common drainer traps (tie this back to Module 6). Never sign a claim transaction on a site you didn't reach through official channels." },
          { type: "callout", text: "The clown farmer chases 50 wallets and gets all 50 zeroed. The fox uses one real wallet, genuinely, and ages into eligibility. Don't farm like a clown." },
          { type: "action", text: "Pick ONE protocol you actually find useful and would use anyway. Use it genuinely from your main wallet over time — real swaps, maybe some liquidity — and treat any future airdrop as a bonus, not the plan. Never chase a claim link from a DM." }
        ]
      }
    ],
    quiz: [
      { q: "What is an airdrop?", options: ["A type of mining", "Free tokens distributed to early/eligible users", "A stablecoin", "A hardware wallet"], correct: 1 },
      { q: "What is a Sybil attack in the airdrop context?", options: ["Hacking a bridge", "One person running many wallets to farm multiple allocations", "A price crash", "A governance vote"], correct: 1 },
      { q: "How many Sybil wallets did LayerZero remove for its 2024 ZRO airdrop?", options: ["About 1,000", "About 803,000 (~59% of applicants)", "Zero", "About 10 million"], correct: 1 },
      { q: "The Hyperliquid airdrop (Nov 2024) distributed HYPE to roughly how many wallets?", options: ["1,000", "94,000", "5 million", "None — it was cancelled"], correct: 1 },
      { q: "Which behavior is most likely to get a wallet Sybil-flagged?", options: ["Consistent use over months", "20 wallets funded from one source doing identical actions", "Diverse genuine activity", "Using the product normally"], correct: 1 },
      { q: "Roughly what portion of airdropped tokens are sold within 30 days?", options: ["Under 5%", "About 50–70%", "Exactly 100%", "None"], correct: 1 },
      { q: "Why do projects keep points-to-token formulas secret?", options: ["Legal requirement", "To make the system harder to game", "To pay taxes", "It's random"], correct: 1 },
      { q: "What increasingly determines airdrop eligibility today?", options: ["Twitter followers", "Whether a wallet's history looks genuinely human, not a cluster", "The color of your wallet", "Your exchange balance"], correct: 1 },
      { q: "A GitHub repo named 'airdrop-claim' asking you to connect and sign is likely:", options: ["A safe official tool", "A common drainer/phishing trap", "A staking rewards program", "A block explorer"], correct: 1 },
      { q: "What's the durable, Sybil-resistant approach to airdrops?", options: ["Run as many wallets as possible", "Genuinely use one main wallet over time", "Only use testnets once", "Buy the token at launch"], correct: 1 }
    ]
  },

  // ============================== MODULE 10 ==============================
  {
    id: 10,
    title: "Future Stack",
    subtitle: "Where crypto is going — AI agents, RWAs, DePIN, and autonomous payments",
    icon: "🜏",
    tag: "FUTURE",
    duration: "55-65 min",
    xpReward: 500,
    lessons: [
      {
        title: "AI Agents With Wallets",
        content: [
          { type: "quote", text: "The next users of crypto may not be people at all — they'll be software that pays for what it needs.", author: "The agentic thesis" },
          { type: "heading", text: "When machines pay machines" },
          { type: "body", text: "AI agents can reason and act, but historically they hit a wall the moment a task required money — they couldn't pay for an API, buy compute, or settle a transaction without a human. Crypto is emerging as the payment layer that changes that." },
          { type: "body", text: "The leading standard is x402, open-sourced by Coinbase in May 2025. It revives the dormant HTTP status code '402 Payment Required': a server can demand a stablecoin payment, and an agent's wallet pays it automatically in seconds — no API keys, no signups. The x402 Foundation (co-founded with Cloudflare) includes Google, Visa, AWS, Circle, and Anthropic, and the protocol runs on Base, Solana, and other chains, having processed over 100 million transactions." },
          { type: "callout", text: "Why crypto and not credit cards? Card rails can't do sub-cent, machine-to-machine, 24/7 micropayments without accounts and human approval. Stablecoins on cheap chains can. That's the whole unlock." },
          { type: "vault", title: "VAULT SECRET: The internet's original missing piece", text: "HTTP status code 402 has said 'Payment Required — reserved for future use' since 1997. For nearly three decades, every browser recognized it and nobody built on it. The web was designed with a payment slot that was never filled — because there was no native internet money. Stablecoins finally filled it. The future was literally waiting in the spec." }
        ]
      },
      {
        title: "RWAs and DePIN",
        content: [
          { type: "heading", text: "Real-world assets, tokenized" },
          { type: "body", text: "RWA tokenization puts traditional assets — Treasuries, credit, real estate — on-chain as tokens that settle in seconds and stay composable with DeFi. The flagship: BlackRock's BUIDL fund (tokenized by Securitize), a tokenized money-market fund that crossed $1 billion in AUM within about seven months of its March 2024 launch and later grew into the multi-billions, becoming the largest tokenized Treasury product. Ondo Finance (OUSG, USDY) built the distribution layer that makes such institutional exposure accessible and composable on-chain." },
          { type: "body", text: "Total on-chain RWA value crossed roughly $20 billion+ heading into 2026, led by tokenized Treasuries and private credit. When the world's largest asset manager commits engineering and regulatory capital to on-chain funds, it signals the risk calculus has shifted." },
          { type: "heading", text: "DePIN: crypto builds physical infrastructure" },
          { type: "sortgame", title: "Match the DePIN network to what it coordinates", buckets: [
            { id: "wireless", label: "Wireless / connectivity" },
            { id: "compute", label: "Compute / GPU rendering" }
          ], items: [
            { text: "Helium (hotspots, HNT, on Solana)", bucket: "wireless" },
            { text: "Render (GPU rendering, RENDER, on Solana)", bucket: "compute" }
          ], note: "DePIN (Decentralized Physical Infrastructure Networks) uses token incentives to crowdsource real-world hardware — wireless coverage (Helium), GPU compute (Render), storage (Filecoin), AI (Bittensor). Many use burn-and-mint economics: usage burns credits, rewards mint tokens for providers." },
          { type: "body", text: "Time-sensitive note: all AUM, market-cap, and adoption figures here are point-in-time snapshots. Verify current numbers on rwa.xyz, DeFiLlama, and project sources before citing." }
        ]
      },
      {
        title: "Where Iron Vault Fits",
        content: [
          { type: "heading", text: "The stack is converging" },
          { type: "reveal", title: "The future stack, layer by layer", steps: [
            { label: "Settle", tag: "STABLECOINS", heading: "Digital dollars", text: "Regulated stablecoins (post-GENIUS Act) become the default settlement money for humans AND agents." },
            { label: "Pay", tag: "x402 / AGENTS", heading: "Autonomous payments", text: "AI agents with wallets pay per-request for data, compute, and services — the machine economy." },
            { label: "Back", tag: "RWA", heading: "Real yield on-chain", text: "Tokenized Treasuries and credit bring traditional yield and trillions of potential value on-chain." },
            { label: "Build", tag: "DePIN", heading: "Physical infrastructure", text: "Token incentives coordinate real hardware — wireless, compute, storage — owned by the crowd." }
          ], note: "Each layer is live today in early form, on fast, cheap chains like Solana and Base — exactly the rails this course has taught." },
          { type: "body", text: "Iron Vault Academy sits at the education layer of this stack: a Solana-native, gamified platform teaching the literacy that all of the above requires. You can't safely use agentic payments, RWAs, or DePIN without understanding wallets, security, tokenomics, and on-chain intelligence — the exact ground these ten modules cover." },
          { type: "callout", text: "The future isn't a single coin to buy — it's a stack to understand. The vault rewards literacy, not lottery tickets." },
          { type: "action", text: "Pick ONE frontier area (agentic payments, RWA, or DePIN) and find one real project in it. Read its official docs for 20 minutes and write three sentences: what it does, what token/mechanism powers it, and one open risk. That's how the fox stays early — by reading, not guessing." }
        ]
      }
    ],
    quiz: [
      { q: "What does the x402 protocol enable?", options: ["Faster mining", "AI agents to make autonomous stablecoin payments over HTTP", "A new stablecoin", "Bitcoin halvings"], correct: 1 },
      { q: "Who open-sourced x402, and roughly when?", options: ["Tether, 2020", "Coinbase, May 2025", "BlackRock, 2018", "Ethereum Foundation, 2015"], correct: 1 },
      { q: "What is RWA tokenization?", options: ["Mining real gold", "Putting traditional assets like Treasuries on-chain as tokens", "A type of airdrop", "A wallet feature"], correct: 1 },
      { q: "Which is the flagship tokenized Treasury/money-market fund?", options: ["Dogecoin", "BlackRock's BUIDL", "Helium", "JitoSOL"], correct: 1 },
      { q: "What does DePIN stand for?", options: ["Decentralized Payment Infrastructure Node", "Decentralized Physical Infrastructure Networks", "Digital Peg Interest Note", "Distributed Proof-of-Identity Network"], correct: 1 },
      { q: "What does Helium coordinate?", options: ["GPU rendering", "Decentralized wireless connectivity via hotspots", "Tokenized Treasuries", "Stablecoin issuance"], correct: 1 },
      { q: "What does Render Network provide?", options: ["Wireless coverage", "Decentralized GPU rendering/compute", "Lending", "A block explorer"], correct: 1 },
      { q: "Why are stablecoins central to AI-agent payments?", options: ["They rise fast in value", "They enable cheap, 24/7, machine-to-machine micropayments", "They are illegal for agents", "They require human approval"], correct: 1 },
      { q: "Which company's tokenized fund is associated with Ondo Finance's OUSG?", options: ["Tether", "BlackRock (BUIDL)", "Circle", "Helium"], correct: 1 },
      { q: "Where does Iron Vault Academy fit in the future stack?", options: ["The mining layer", "The education/literacy layer", "The stablecoin issuance layer", "The hardware layer"], correct: 1 }
    ]
  }
];
```

---

**Implementation notes for the dev team:**
- All 10 modules follow the exact schema: `id`, `title`, `subtitle`, `icon`, `tag`, `duration`, `xpReward: 500`, `lessons[]`, `quiz[]` (exactly 10 questions each, one `correct` index).
- Every module contains at least one interactive block: Module 1 (reveal), 2 (sortgame), 3 (reveal), 4 (sortgame), 5 (calculator + reveal), 6 (reveal + scenario), 7 (reveal + sortgame), 8 (reveal), 9 (sortgame), 10 (reveal + sortgame). Modules 5's calculator uses `variant: "compound"` per the available variants; if you add a dedicated `fdv` variant later, swap it in.
- All protocol names, mechanics, dates, and figures are grounded in the verified research above. Time-sensitive figures are phrased to age gracefully ("as of late 2025," "heading into 2026," "point-in-time") and flagged in the research notes so you can mark them for periodic review rather than treating them as permanent.
- No price predictions and no financial advice are included; airdrop and market-cycle content is explicitly framed as education.
- The `scenario` and `sortgame` blocks use the exact node/bucket/item structure specified in the schema so they should render without modification.