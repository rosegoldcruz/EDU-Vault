/**
 * IRON VAULT ACADEMY — MODULES 13–22
 * ─────────────────────────────────────────────────────────────────────────
 * Drop into the MODULES array after Module 12.
 * Schema matches verified source (v2_lessons.md):
 *   { id, title, subtitle, icon, tag, duration, xpReward, lessons[], quiz[] }
 *   content blocks: quote|heading|body|callout|list|vault|action
 *   + NEW interactive: calculator|simulator|scenario|sortgame|reveal
 *     (requires contentblock-interactive-extension.jsx installed first)
 *   quiz: { q, options[], correct }  // correct is 0-indexed
 *
 * TONE: esoteric edge, documented history over conspiracy claims.
 * Modules 13–14 = crypto. 15–22 = wealth mechanics, each with one interactive.
 * ─────────────────────────────────────────────────────────────────────────
 */

const MODULES_13_22 = [

  // ═══════════════════════════════════════════════════════════════════════
  // MODULE 13 — CRYPTO FOUNDATIONS
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 13, title: "Crypto Foundations", subtitle: "Keys, custody, and the end of permission",
    icon: "🔑", tag: "CRYPTO", duration: "55–70 min", xpReward: 500,
    lessons: [
      {
        title: "Not Your Keys, Not Your Coins",
        content: [
          { type: "quote", text: "The root problem with conventional currency is all the trust that's required to make it work.", author: "Satoshi Nakamoto, 2009" },
          { type: "heading", text: "Ownership in crypto is defined by a single thing: who holds the private key" },
          { type: "body", text: "A cryptocurrency wallet does not 'contain' coins the way a physical wallet contains cash. The coins live on the blockchain — a public ledger replicated across thousands of computers. What your wallet holds is a private key: a cryptographic secret that proves you have the authority to move a specific balance. Whoever controls the private key controls the funds. Full stop." },
          { type: "callout", text: "When you leave crypto on an exchange, the exchange holds the private keys — not you. You hold an IOU. History has repeatedly shown what happens when that custodian fails: Mt. Gox (2014), Celsius (2022), FTX (2022). In each case, users held balances on a screen while the actual keys were controlled — and mismanaged — by someone else." },
          { type: "vault", title: "VAULT SECRET: The Seed Phrase Is the Master Key", text: "A 12- or 24-word seed phrase is a human-readable representation of your wallet's master private key. From those words, every address and key in your wallet can be regenerated. This means: anyone with your seed phrase has total control, and losing it with no backup means the funds are unrecoverable — permanently. Estimates suggest millions of Bitcoin are lost forever to forgotten keys. The technology grants absolute ownership and absolute responsibility in the same breath." },
          {
            type: "simulator", variant: "bankroll",
            title: "Custody vs. Self-Custody — The Trust Ledger",
            start: 1000, betPct: { min: 0, max: 100, step: 5, default: 100 }, rounds: 60,
            winProb: 0.94, winMult: 2, loseMult: 1,
            note: "Each round = leaving 100% of funds on a custodian. ~94% of the time nothing happens. But run it enough times and the rare custodial-failure event compounds. This is why self-custody exists: not because exchanges usually fail, but because when they do, you hold an IOU, not keys."
          },
          { type: "action", text: "Write down the difference between a custodial and a non-custodial wallet in one sentence each. Then ask: for the amount we're holding, which model matches our risk tolerance?" }
        ]
      },
      {
        title: "Wallets — Hot, Cold, and the Spectrum Between",
        content: [
          { type: "heading", text: "Every wallet is a trade-off between convenience and security" },
          { type: "list", items: [
            "Hot wallets — connected to the internet (browser extensions, mobile apps). Convenient for daily use, higher attack surface.",
            "Cold wallets — offline hardware devices. Keys never touch an internet-connected machine. Maximum security, less convenient.",
            "Custodial — a third party holds the keys (exchanges). Easiest to use, you don't truly own the keys.",
            "Multi-sig — requires multiple keys to authorize a transaction. Used by treasuries and serious holders."
          ]},
          { type: "body", text: "The right choice depends on purpose. Small amounts for active trading or DeFi use may live in a hot wallet. Long-term holdings — the vault position — belong in cold storage. The wealthy in crypto don't pick one; they layer them, matching the security model to the size and purpose of each holding." },
          { type: "callout", text: "A hardware wallet signs transactions internally and only ever exports the signature — never the private key itself. Even plugged into a compromised computer, the key stays sealed inside the device. This is the same principle banks use for hardware security modules, made accessible for a few hundred dollars." },
          { type: "vault", title: "VAULT SECRET: The Layered Custody Model", text: "The operational pattern used by sophisticated holders: a small hot wallet for daily transactions and DeFi (think of it as a checking account), a hardware cold wallet for the core position (the savings vault), and for large sums, a multi-signature setup where no single device can move funds alone. Keys and backups are geographically separated. This isn't paranoia — it's the same principle as not keeping all your cash in your pocket." },
          { type: "action", text: "Map our current crypto holdings against the wallet spectrum. Is our long-term position sitting in a hot wallet or on an exchange? If so, that's the first thing we move." }
        ]
      },
      {
        title: "The Anatomy of a Blockchain",
        content: [
          { type: "heading", text: "A blockchain is a ledger that no single party can rewrite" },
          { type: "body", text: "Transactions are grouped into blocks. Each block is cryptographically linked to the one before it, forming a chain. To alter a past transaction, you would have to redo the computational work of every block after it — and outpace the entire rest of the network simultaneously. This is what makes the ledger effectively immutable: not a promise, but mathematics." },
          { type: "callout", text: "Two dominant consensus mechanisms secure this process. Proof of Work (Bitcoin) requires miners to expend energy solving cryptographic puzzles. Proof of Stake (Ethereum since 2022, Solana) requires validators to lock up capital as collateral, which is slashed if they act dishonestly. Both make attacking the network economically irrational." },
          {
            type: "reveal",
            title: "How a Transaction Actually Settles",
            steps: [
              { label: "STEP 1", tag: "SIGN", heading: "You sign", text: "Your wallet uses your private key to create a digital signature authorizing the transfer. The key itself never leaves your device." },
              { label: "STEP 2", tag: "BROADCAST", heading: "The network hears it", text: "The signed transaction is broadcast to thousands of nodes. They independently verify the signature is valid and you hold the balance." },
              { label: "STEP 3", tag: "MEMPOOL", heading: "It waits in the pool", text: "Valid transactions sit in the mempool. Validators select which to include next — often prioritizing higher fees." },
              { label: "STEP 4", tag: "CONFIRM", heading: "It enters a block", text: "A validator includes your transaction in a new block and proposes it to the network. Other nodes confirm the block is valid." },
              { label: "STEP 5", tag: "FINAL", heading: "It becomes permanent", text: "As more blocks build on top, reversing the transaction becomes computationally impossible. It is now part of the permanent ledger." }
            ],
            note: "No bank approved this. No business hours applied. No single entity could stop it. The network reached agreement through math and incentives alone."
          },
          { type: "action", text: "Look up a real transaction on a block explorer (etherscan.io or solscan.io). Trace the sender, receiver, fee, and confirmation count. Watching one settle makes the abstraction concrete." }
        ]
      },
      {
        title: "Security — The Threats That Actually Drain Wallets",
        content: [
          { type: "quote", text: "In crypto, you are your own bank. That includes being your own security department.", author: "Andreas Antonopoulos" },
          { type: "heading", text: "Almost no one is hacked. Almost everyone who loses funds is tricked." },
          { type: "body", text: "The blockchain itself is rarely broken. The losses happen at the edges: phishing sites that mimic real ones, malicious token approvals that grant a contract permission to drain your wallet, fake support agents, and seed phrases entered into fraudulent 'wallet validation' pages. The attack is almost always social, not cryptographic." },
          { type: "callout", text: "A token approval is permission you grant a smart contract to spend your tokens. Malicious dApps request unlimited approvals, then drain the wallet later. This is the single most common way active DeFi users lose funds — and it's entirely preventable by reviewing and revoking approvals." },
          { type: "vault", title: "VAULT SECRET: The Non-Negotiable Rules", text: "One: your seed phrase is never entered into any website, ever — legitimate wallets never ask for it online. Two: bookmark the real URLs of every dApp and exchange you use; never click links from DMs or emails. Three: use a separate 'burner' wallet for interacting with new or unaudited contracts. Four: periodically review and revoke token approvals (revoke.cash). Five: a hardware wallet defeats nearly every remote attack because the key never touches the internet. Follow these five and you eliminate the vast majority of real-world loss vectors." },
          { type: "action", text: "Audit our security posture against the five rules. Where's the gap? Close it before the next transaction, not after the next loss." }
        ]
      }
    ],
    quiz: [
      { q: "In crypto, ownership of funds is fundamentally determined by:", options: ["The exchange account balance shown on screen", "Who controls the private key", "The wallet app you downloaded", "Your government-issued ID"], correct: 1 },
      { q: "A seed phrase is best described as:", options: ["A password you can reset if forgotten", "A human-readable representation of the wallet's master private key", "A username for your wallet", "A backup email address"], correct: 1 },
      { q: "'Not your keys, not your coins' warns primarily against:", options: ["Using hardware wallets", "Holding assets on custodial exchanges where you don't control the keys", "Writing down your seed phrase", "Using proof of stake networks"], correct: 1 },
      { q: "A cold wallet is more secure than a hot wallet because:", options: ["It holds more coins", "Its private keys stay offline, away from internet-connected machines", "It is issued by a bank", "It requires no seed phrase"], correct: 1 },
      { q: "What makes a blockchain effectively immutable?", options: ["A company guarantees it", "Altering past blocks would require redoing all subsequent work and outpacing the whole network", "Transactions are encrypted so no one can read them", "Governments enforce it"], correct: 1 },
      { q: "Proof of Stake secures a network by:", options: ["Requiring miners to solve energy-intensive puzzles", "Requiring validators to lock up capital that is slashed for dishonesty", "Printing new coins for validators", "Charging users a monthly fee"], correct: 1 },
      { q: "The most common way active DeFi users lose funds is:", options: ["The blockchain being hacked", "Malicious token approvals and phishing — social attacks, not cryptographic ones", "Network downtime", "High gas fees"], correct: 1 },
      { q: "A legitimate wallet or exchange will ask for your seed phrase:", options: ["When you log in", "During identity verification", "Never — no legitimate service asks for it online", "Only over the phone"], correct: 2 },
      { q: "A token approval is:", options: ["A tax document", "Permission granted to a smart contract to spend your tokens", "A type of cold wallet", "A network fee"], correct: 1 },
      { q: "The layered custody model recommends:", options: ["Keeping everything on one exchange", "Matching the security model to the size and purpose of each holding", "Never using hardware wallets", "Storing the seed phrase in your email"], correct: 1 }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MODULE 14 — ON-CHAIN MECHANICS
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 14, title: "On-Chain Mechanics", subtitle: "Gas, tokens, and reading the ledger yourself",
    icon: "⛓", tag: "CRYPTO", duration: "55–70 min", xpReward: 500,
    lessons: [
      {
        title: "Gas — The Cost of Certainty",
        content: [
          { type: "heading", text: "Every on-chain action consumes computational resources — and those resources are priced" },
          { type: "body", text: "Gas is the fee paid to validators for the computational work of processing a transaction. It exists for two reasons: to compensate the validators securing the network, and to prevent spam by making it costly to flood the chain. On Ethereum, gas prices rise and fall with demand — like surge pricing for block space. On Solana, fees are a fraction of a cent by design, enabling high-frequency activity that would be uneconomical elsewhere." },
          { type: "callout", text: "Gas is denominated in the network's native token — ETH on Ethereum, SOL on Solana. This is why you cannot transact on a chain without holding a small amount of its native asset, even if the asset you're moving is a different token. The network must be paid in its own currency." },
          { type: "vault", title: "VAULT SECRET: Timing the Chain", text: "Ethereum gas fees are predictable if you watch the patterns. Weekends and off-peak hours (late night US time) consistently show lower fees. Tools like Etherscan's gas tracker show real-time and historical fee levels. Sophisticated users batch non-urgent transactions for low-fee windows, saving meaningful amounts over time. On high-throughput chains like Solana, this matters far less — which is precisely why they were built." },
          { type: "action", text: "Check the current gas price on Ethereum and the typical fee on Solana. Write both down. That spread explains a huge amount about why different chains exist." }
        ]
      },
      {
        title: "Tokens — Coins, Standards, and What They Represent",
        content: [
          { type: "quote", text: "The blockchain does one thing: it replaces third-party trust with mathematical proof.", author: "Unknown" },
          { type: "heading", text: "Not all crypto assets are the same kind of thing" },
          { type: "list", items: [
            "Native coins — the base asset of a chain (BTC, ETH, SOL). Used to pay gas and secure the network.",
            "Fungible tokens — interchangeable units built on a chain (ERC-20 on Ethereum, SPL on Solana). Stablecoins, governance tokens, project tokens.",
            "Non-fungible tokens (NFTs) — unique, non-interchangeable tokens representing ownership of a specific item.",
            "Stablecoins — tokens pegged to a stable value, usually the US dollar (USDC, USDT). The bridge between crypto and traditional value."
          ]},
          { type: "body", text: "A token standard is simply a shared set of rules that lets wallets, exchanges, and contracts interact with any token the same way. ERC-20 defined how fungible tokens behave on Ethereum; SPL does the same on Solana. Standards are why you can hold thousands of different tokens in one wallet — they all speak the same language." },
          { type: "callout", text: "Stablecoins are the most-used product in all of crypto by transaction volume. They solve the volatility problem: you can hold dollar value on-chain, move it globally in seconds for pennies, and deploy it into DeFi — without ever touching a bank wire. This is quietly one of the most significant financial innovations of the decade." },
          { type: "action", text: "Identify one token in each category that we actually hold or have used. If we've only ever held a native coin, note which token standard our chain uses for everything else." }
        ]
      },
      {
        title: "Reading the Ledger — Block Explorers as X-Ray Vision",
        content: [
          { type: "heading", text: "Everything on-chain is public. The skill is learning to read it." },
          { type: "body", text: "A block explorer (Etherscan, Solscan) is a search engine for the blockchain. Every transaction, wallet balance, token transfer, and smart contract interaction is visible. This radical transparency is a feature: you can verify a project's treasury, watch whale movements, confirm a transaction settled, and inspect a contract before interacting with it — all without asking anyone's permission." },
          {
            type: "reveal",
            title: "What a Block Explorer Reveals",
            steps: [
              { label: "LAYER 1", tag: "BALANCE", heading: "Any wallet's full holdings", text: "Enter any address and see its complete balance and token holdings. Every wallet is an open book — including those of projects, funds, and founders." },
              { label: "LAYER 2", tag: "HISTORY", heading: "Every transaction ever made", text: "The full transaction history of any address, timestamped and permanent. You can reconstruct exactly how funds moved." },
              { label: "LAYER 3", tag: "CONTRACT", heading: "The code behind a token", text: "For verified contracts, the actual source code is published. You can confirm what a token or protocol actually does before trusting it." },
              { label: "LAYER 4", tag: "FLOW", heading: "Where money is going", text: "Track large transfers, exchange inflows and outflows, and treasury movements. Analysts read these flows to anticipate market behavior." },
              { label: "LAYER 5", tag: "PROOF", heading: "Verification without trust", text: "You never have to take a project's word for its reserves, its distribution, or its activity. The ledger is the proof. This is the entire point." }
            ],
            note: "Traditional finance hides the ledger and asks for your trust. On-chain finance publishes the ledger and asks you to verify. Learning to read it is the difference between believing and knowing."
          },
          { type: "vault", title: "VAULT SECRET: Following the Smart Money", text: "Because every wallet is public, on-chain analysts track the addresses of successful traders, funds, and early investors — 'smart money.' When these wallets accumulate a token, it's visible before any announcement. Platforms like Nansen and Arkham label known wallets and surface these flows. This is a form of market intelligence that simply does not exist in traditional markets, where positions are hidden until quarterly filings. The ledger tells you what people do, not what they say." },
          { type: "action", text: "Pick any token we're interested in. Open its contract on a block explorer. Check: how many holders, how concentrated is the top 10, is the contract verified? Those three facts filter out a huge share of bad projects." }
        ]
      },
      {
        title: "Bridges, Layers, and the Multi-Chain Reality",
        content: [
          { type: "heading", text: "There is no single blockchain — there is an expanding network of them" },
          { type: "body", text: "Ethereum pioneered smart contracts but faces congestion and high fees at scale. The response was layers: Layer 2 networks (Arbitrum, Optimism, Base) process transactions off the main chain and settle back to Ethereum, inheriting its security while slashing costs. Alternative Layer 1s (Solana, Avalanche) took different architectural bets on speed and cost. The result is a multi-chain world where assets and activity move across many networks." },
          { type: "callout", text: "Bridges move assets between chains — but they have historically been the single most exploited component in all of crypto. The Ronin bridge ($625M) and Wormhole ($320M) hacks were both bridge exploits. Bridges hold large pools of locked assets, making them prime targets. Use established, audited bridges and never move more than necessary in a single transaction." },
          { type: "vault", title: "VAULT SECRET: Why Solana Anchors the Iron Vault Thesis", text: "Real-world asset distribution — regular, small, automated income payments — requires a chain where transactions cost fractions of a cent and settle in under a second. On Ethereum mainnet, distributing income to thousands of holders would cost more in gas than the income itself. Solana's architecture makes high-frequency, low-value on-chain activity economically viable. This is not a preference; it's a structural requirement for the model to function." },
          { type: "action", text: "List the chains we currently hold assets on. Are we consolidated or scattered across bridges? Map where our assets actually live before the next move." }
        ]
      }
    ],
    quiz: [
      { q: "Gas fees exist primarily to:", options: ["Enrich developers", "Compensate validators and prevent network spam", "Fund governments", "Set token prices"], correct: 1 },
      { q: "To transact on a chain, you must hold:", options: ["A government license", "A small amount of the chain's native token to pay gas", "At least $1,000", "A hardware wallet"], correct: 1 },
      { q: "A stablecoin is:", options: ["A coin that never moves", "A token pegged to a stable value, usually the US dollar", "The native coin of Ethereum", "An NFT standard"], correct: 1 },
      { q: "A token standard (like ERC-20 or SPL) is:", options: ["A government regulation", "A shared set of rules letting wallets and contracts interact with tokens uniformly", "A type of hardware wallet", "A mining algorithm"], correct: 1 },
      { q: "By transaction volume, the most-used product in crypto is:", options: ["NFTs", "Stablecoins", "Meme coins", "Governance tokens"], correct: 1 },
      { q: "A block explorer lets you:", options: ["Hide your transactions", "Publicly view balances, transaction history, and verified contract code", "Reverse a transaction", "Mine new blocks"], correct: 1 },
      { q: "'Following the smart money' on-chain is possible because:", options: ["Wallets file quarterly reports", "Every wallet's activity is public and some can be labeled", "Exchanges publish customer data", "Validators announce trades"], correct: 1 },
      { q: "Layer 2 networks (Arbitrum, Base) primarily provide:", options: ["A separate, unrelated blockchain", "Lower-cost transactions that settle back to and inherit Ethereum's security", "A way to avoid all fees", "Government-backed guarantees"], correct: 1 },
      { q: "Historically, the most-exploited component in crypto has been:", options: ["Cold wallets", "Cross-chain bridges", "Stablecoins", "Block explorers"], correct: 1 },
      { q: "Solana anchors the Iron Vault model because:", options: ["It has the most users", "Its sub-cent, sub-second transactions make high-frequency income distribution viable", "It is the oldest blockchain", "It is government approved"], correct: 1 }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MODULE 15 — THE PSYCHOLOGY OF MONEY
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 15, title: "The Psychology of Money", subtitle: "The invisible scripts that run your finances",
    icon: "🜛", tag: "MINDSET", duration: "50–65 min", xpReward: 500,
    lessons: [
      {
        title: "The Scarcity Program",
        content: [
          { type: "quote", text: "Financial success is not about what you know. It's about how you behave.", author: "Morgan Housel, The Psychology of Money" },
          { type: "heading", text: "Most financial decisions are made by a nervous system, not a calculator" },
          { type: "body", text: "The human brain evolved under scarcity. For most of history, resources were limited and the threat of loss was constant. That wiring persists. Under perceived scarcity, the brain narrows its focus to immediate survival — spending on relief, avoiding risk that could pay off, and struggling to think long-term. This isn't a character flaw. It's an ancient program running on modern hardware." },
          { type: "callout", text: "Research on scarcity (Mullainathan and Shafir, 'Scarcity', 2013) found that the mental strain of financial lack measurably reduces cognitive bandwidth — the equivalent of losing significant IQ points temporarily. Poverty doesn't just limit resources; it taxes the very decision-making needed to escape it. The system compounds itself." },
          {
            type: "scenario",
            title: "Two Minds, One Windfall",
            prompt: "An unexpected $5,000 lands in your account. Watch which program runs.",
            nodes: {
              start: { text: "The money hits. Your first instinct is:", choices: [
                { label: "Finally — I can get the things I've been putting off", to: "scarcity1" },
                { label: "Pause. This is capital, not relief. What's the highest use?", to: "abundance1" }
              ]},
              scarcity1: { text: "You spend most of it on immediate wants and relief purchases. Within two months, it's gone and little has changed. The relief was real but temporary.", outcome: "bad", lesson: "The scarcity program spends to soothe. It treats windfalls as rare events to be consumed, not deployed — because scarcity says another may never come." },
              abundance1: { text: "You treat the $5,000 as a seed. You clear a high-interest debt draining you monthly and route the rest into an asset. The windfall keeps working after the moment passes.", outcome: "good", lesson: "The abundance program asks 'what will this become?' It sees capital as a tool that compounds, because it trusts that more can be created." }
            }
          },
          { type: "vault", title: "VAULT SECRET: Rewiring the Default", text: "The scarcity program can't be argued away — it's pre-verbal. But it can be interrupted with structure. Automating a fixed percentage of income into assets before it ever reaches your spending account removes the decision from the anxious nervous system entirely. You're not asking the scarcity mind to behave; you're routing around it. This is why 'pay yourself first' works when willpower fails: it defeats the program with architecture, not discipline." },
          { type: "action", text: "Identify one financial decision we recently made from scarcity — a purchase for relief, or a good risk avoided from fear. Name the program. Naming it is the first interruption." }
        ]
      },
      {
        title: "The Stories We Inherited",
        content: [
          { type: "heading", text: "You were handed a money script before you could question it" },
          { type: "body", text: "By age seven, most children have absorbed the core financial beliefs they'll carry for life — from watching how the adults around them handled money, stress, and scarcity. 'Money is the root of evil.' 'People like us don't get rich.' 'You have to work brutally hard for every dollar.' These aren't conclusions you reasoned into. They're inherited scripts, running silently, shaping every decision." },
          { type: "callout", text: "Financial psychologist Brad Klontz identified recurring 'money scripts' — money avoidance, money worship, money status, and money vigilance. Each began as a survival adaptation to the environment you grew up in. The problem is that an adaptation to your childhood conditions is often a liability in your adult ones." },
          { type: "vault", title: "VAULT SECRET: The Fox Sees the Trap", text: "The fox in the Vulpine tradition is not the strongest animal — it's the most aware. It survives by seeing the pattern others miss, the trap beneath the bait. Applied to money: your inherited scripts are the terrain you were born into, but awareness is the gift that lets you move differently. You cannot delete the script, but the moment you see it operating, you gain the choice to override it. Most people never see it at all. They simply live it and call it 'just how I am.'" },
          { type: "action", text: "Write the three money beliefs we absorbed before age 12. For each, ask: is this true, or is it just old? Which one is costing us the most right now?" }
        ]
      },
      {
        title: "Enough — The Word That Defeats the Game",
        content: [
          { type: "quote", text: "The hardest financial skill is getting the goalpost to stop moving.", author: "Morgan Housel" },
          { type: "heading", text: "Without a definition of enough, no amount is ever enough" },
          { type: "body", text: "The modern economy runs on manufactured insufficiency — the engineered feeling that you are always one purchase away from adequacy. This is not accidental; entire industries depend on the goalpost never being reached. The person who has defined what 'enough' means for their life has, in a real sense, stepped outside the game. They can accumulate deliberately rather than compulsively." },
          { type: "callout", text: "Studies on lottery winners and rapidly wealthy individuals repeatedly show that happiness resets to a baseline within a year or two. The external number changed; the internal setpoint didn't. Meanwhile, those who defined 'enough' before acquiring wealth report far greater satisfaction with the same or less. The variable was never the money. It was the definition." },
          { type: "vault", title: "VAULT SECRET: Enough Is a Number You Choose First", text: "Sophisticated wealth-builders define their 'enough' as an explicit figure — the annual passive income that covers the life they actually want — before chasing more. Once assets throw off that number reliably, additional acquisition becomes a choice made from freedom rather than a compulsion driven by lack. The goalpost stops moving because you nailed it to the ground on purpose. This single act separates wealth that liberates from wealth that enslaves." },
          { type: "action", text: "Calculate our 'enough' number: the annual passive income that would cover the life we genuinely want — not the life we're told to want. Write it down. Now it's a target instead of a horizon." }
        ]
      }
    ],
    quiz: [
      { q: "According to behavioral finance, most financial decisions are driven primarily by:", options: ["Careful calculation", "Behavior and emotional wiring", "Perfect information", "Government policy"], correct: 1 },
      { q: "The scarcity mindset tends to:", options: ["Improve long-term planning", "Narrow focus to immediate survival and reduce cognitive bandwidth", "Increase risk tolerance for good bets", "Have no measurable effect"], correct: 1 },
      { q: "Research on scarcity found that financial lack:", options: ["Sharpens decision-making", "Measurably taxes cognitive bandwidth, hindering the decisions needed to escape it", "Only affects spending, not thinking", "Improves memory"], correct: 1 },
      { q: "Most core money beliefs are formed:", options: ["In college", "In early childhood, absorbed from surrounding adults", "After the first job", "When you open a bank account"], correct: 1 },
      { q: "'Money scripts' (Brad Klontz) are:", options: ["Budgeting software", "Inherited, often subconscious beliefs about money formed as survival adaptations", "Legal contracts", "Investment strategies"], correct: 1 },
      { q: "The 'pay yourself first' automation works because it:", options: ["Requires strong willpower daily", "Routes around the scarcity-driven nervous system with structure", "Earns higher interest", "Avoids all taxes"], correct: 1 },
      { q: "Defining 'enough' matters because:", options: ["It limits your income permanently", "Without it, no amount ever feels sufficient and the goalpost keeps moving", "It is required by law", "It guarantees happiness"], correct: 1 },
      { q: "Studies on lottery winners show that happiness:", options: ["Permanently increases with wealth", "Tends to reset to a baseline within a year or two", "Always decreases", "Depends only on the amount won"], correct: 1 },
      { q: "In the Vulpine tradition, the fox represents:", options: ["Raw strength", "Awareness — seeing the pattern and trap others miss", "Speed alone", "Wealth itself"], correct: 1 },
      { q: "Defining 'enough' as an explicit number allows you to:", options: ["Never invest again", "Accumulate from freedom rather than compulsion", "Avoid all financial planning", "Guarantee you'll be a millionaire"], correct: 1 }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MODULE 16 — COMPOUNDING & TIME
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 16, title: "Compounding & Time", subtitle: "The eighth wonder, and why almost no one uses it",
    icon: "🝆", tag: "GROWTH", duration: "45–60 min", xpReward: 500,
    lessons: [
      {
        title: "The Force That Builds Every Fortune",
        content: [
          { type: "quote", text: "Compound interest is the eighth wonder of the world. He who understands it, earns it. He who doesn't, pays it.", author: "Attributed to Albert Einstein" },
          { type: "heading", text: "Compounding is growth earning growth on itself" },
          { type: "body", text: "Simple growth adds the same amount each period. Compound growth adds a percentage of an ever-larger base — so the gains themselves start generating gains. Early on, the difference looks trivial. Given enough time, it becomes the difference between comfort and generational wealth. The mechanism is not complicated. The discipline to let it run uninterrupted is where nearly everyone fails." },
          { type: "callout", text: "The counterintuitive truth: the majority of compounding's payoff arrives at the very end of the timeline. A sum doubling every period spends most of its life looking small, then explodes in the final stretch. This is why people abandon the strategy — the exciting part comes last, long after impatience has claimed most of them." },
          {
            type: "calculator", variant: "compound",
            title: "Watch Time Do the Work",
            inputs: [
              { key: "principal", label: "Starting amount", min: 0, max: 100000, step: 500, default: 5000, prefix: "$" },
              { key: "monthly", label: "Added each month", min: 0, max: 5000, step: 50, default: 300, prefix: "$" },
              { key: "rate", label: "Annual return", min: 1, max: 20, step: 0.5, default: 8, suffix: "%" },
              { key: "years", label: "Years of patience", min: 1, max: 40, step: 1, default: 25 }
            ],
            note: "Move the 'years' slider slowly and watch the growth figure. Notice how little happens in the early years and how violently it accelerates near the end. That final surge is the entire game — and it only exists for those who don't interrupt it."
          },
          { type: "action", text: "Set the calculator to our real numbers. Then change only the 'years' from 25 to 30. Note how much the final figure jumps for five more years of doing nothing. Time is the most undervalued input." }
        ]
      },
      {
        title: "The Cost of Waiting",
        content: [
          { type: "heading", text: "The most expensive financial decision is delay" },
          { type: "body", text: "Because compounding rewards time above almost everything else, starting earlier with less routinely beats starting later with more. Two people invest the same monthly amount at the same return; one starts ten years earlier and stops contributing when the other begins. The early starter, despite contributing for fewer total years, often ends with more — because their money had a decade of extra compounding the latecomer can never buy back." },
          { type: "callout", text: "This is the brutal asymmetry of time: you can always add more money, but you can never add more time to a given deadline. Every year of delay isn't a linear cost — it's removed from the most powerful end of the curve, where the largest gains would have occurred. Waiting doesn't cost you the early years; it costs you the explosive final ones." },
          {
            type: "calculator", variant: "compound",
            title: "The Price of Ten Years",
            inputs: [
              { key: "principal", label: "Starting amount", min: 0, max: 50000, step: 500, default: 0, prefix: "$" },
              { key: "monthly", label: "Added each month", min: 50, max: 2000, step: 50, default: 400, prefix: "$" },
              { key: "rate", label: "Annual return", min: 1, max: 15, step: 0.5, default: 8, suffix: "%" },
              { key: "years", label: "Years invested", min: 5, max: 40, step: 1, default: 30 }
            ],
            note: "Run it at 30 years. Now drop to 20 years — a decade of delay. The difference in the final figure, for the exact same monthly contribution, is the literal price of waiting. It's almost always larger than people expect."
          },
          { type: "vault", title: "VAULT SECRET: The Best Time Was Yesterday", text: "There is an old proverb: the best time to plant a tree was twenty years ago; the second-best time is now. Compounding is the financial expression of that truth. Every day of delay is subtracted from the steepest, most valuable part of the curve. The wealthy don't wait for the perfect amount or the perfect moment — they start the clock, because they understand the clock is the asset. Perfect timing is a myth; time in the position is the reality." },
          { type: "action", text: "If we've been waiting to start until conditions are 'right' — more income, less debt, more certainty — calculate what one more year of waiting costs using the tool above. Let the number decide." }
        ]
      },
      {
        title: "Compounding Beyond Money",
        content: [
          { type: "quote", text: "The person who compounds knowledge, relationships, and reputation becomes unstoppable — because those compound faster than money.", author: "Naval Ravikant (paraphrased)" },
          { type: "heading", text: "The same force governs skill, reputation, and relationships" },
          { type: "body", text: "Money is only the most visible thing that compounds. Knowledge builds on prior knowledge, accelerating how fast you learn what's next. Reputation compounds — each honored commitment makes the next opportunity more likely. Relationships deepen and refer. The people who win over decades understand that they are running many compounding engines at once, and that neglecting the non-financial ones is a hidden, enormous cost." },
          { type: "callout", text: "Here's the leverage: financial compounding is capped by the returns the market offers — a few percent to low double digits. But knowledge, skill, and reputation can compound at far higher rates, and they feed back into the financial engine by increasing what you can earn and access. The wealthiest people compound the inputs that raise the ceiling, not just the money under the ceiling." },
          { type: "vault", title: "VAULT SECRET: Stack the Engines", text: "The convergence pattern of durable wealth: money compounds in assets, skill compounds through deliberate practice, reputation compounds through kept commitments, and network compounds through generous connection. Each engine feeds the others — skill raises income, income buys assets, reputation opens deals, network surfaces opportunities. Run one and you do fine. Run all four in parallel and the growth becomes non-linear in a way that looks like luck from the outside. It isn't luck. It's stacked compounding." },
          { type: "action", text: "Name the four compounding engines in our life right now — money, skill, reputation, network. Rate each 1–10 on how deliberately we're compounding it. The lowest score is our highest-leverage fix." }
        ]
      }
    ],
    quiz: [
      { q: "Compound growth differs from simple growth because:", options: ["It adds the same fixed amount each period", "Gains themselves generate further gains on an ever-larger base", "It only applies to bank accounts", "It grows more slowly over time"], correct: 1 },
      { q: "Most of compounding's payoff arrives:", options: ["In the first few years", "Evenly across the timeline", "At the very end of the timeline", "Only if you contribute more each year"], correct: 2 },
      { q: "Why do most people fail to benefit from compounding?", options: ["The math is too complex", "They lack the discipline to let it run uninterrupted", "It only works for the wealthy", "Returns are guaranteed to be negative"], correct: 1 },
      { q: "Starting earlier with less often beats starting later with more because:", options: ["Early investments have higher returns", "The early money gets extra years at the powerful end of the curve", "Later markets always crash", "Fees are lower when young"], correct: 1 },
      { q: "The core asymmetry of time in investing is:", options: ["You can add more time whenever you want", "You can always add more money, but never more time to a given deadline", "Time has no financial value", "Money and time are interchangeable"], correct: 1 },
      { q: "A year of delay in investing primarily removes:", options: ["An early, low-impact year", "A year from the steepest, most valuable end of the compounding curve", "Nothing meaningful", "Only the contribution, not the growth"], correct: 1 },
      { q: "Financial compounding is ultimately capped by:", options: ["Your contribution amount only", "The returns the market offers", "Government limits", "Your age"], correct: 1 },
      { q: "Knowledge, reputation, and relationships can compound:", options: ["Slower than money always", "At potentially higher rates than money, and they raise your earning ceiling", "Only in business settings", "Only with formal education"], correct: 1 },
      { q: "The 'stack the engines' principle means:", options: ["Focus solely on money", "Run money, skill, reputation, and network compounding in parallel", "Avoid non-financial pursuits", "Compound only one thing at a time"], correct: 1 },
      { q: "The proverb about planting a tree illustrates that:", options: ["Trees are good investments", "The best time to start compounding was earlier; the second-best is now", "You should wait for perfect timing", "Delay has no cost"], correct: 1 }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MODULE 17 — RISK, RUIN & POSITION SIZING
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 17, title: "Risk, Ruin & Position Sizing", subtitle: "How to survive long enough to win",
    icon: "🜍", tag: "RISK", duration: "50–65 min", xpReward: 500,
    lessons: [
      {
        title: "The Math of Ruin",
        content: [
          { type: "quote", text: "To succeed you must first survive.", author: "Warren Buffett" },
          { type: "heading", text: "A single catastrophic loss erases a lifetime of gains" },
          { type: "body", text: "Losses and gains are not symmetric. Lose 50% and you need a 100% gain just to break even. Lose 90% and you need a 900% gain to recover. This asymmetry means that avoiding catastrophic loss matters more than capturing any single upside. The first rule of building wealth isn't maximizing returns — it's staying in the game. You cannot compound from zero." },
          { type: "callout", text: "'Risk of ruin' is the probability that a series of losses wipes you out entirely. It rises sharply as you bet a larger fraction of your capital on any single outcome. Even with a genuine edge — a strategy that wins more than it loses — betting too large guarantees eventual ruin. The edge doesn't save you if the position size kills you first." },
          {
            type: "simulator", variant: "bankroll",
            title: "The Ruin Machine — A Favorable Bet, Sized Wrong",
            start: 1000, betPct: { min: 5, max: 100, step: 5, default: 60 }, rounds: 100,
            winProb: 0.55, winMult: 2, loseMult: 1,
            note: "This bet is FAVORABLE — 55% win rate, even payout. You have a real edge. Now set the bet size to 60% and run it repeatedly. Watch how often the edge still ends in ruin because the position was too large. Then drop to 10% and run it again. Same edge. Completely different survival. Position size, not the edge, decides who's left standing."
          },
          { type: "action", text: "Think of our largest current financial position as a percentage of our total net worth. If it went to zero tomorrow, would we be wounded or ruined? Write the honest answer." }
        ]
      },
      {
        title: "Position Sizing — The Kelly Insight",
        content: [
          { type: "heading", text: "The size of the bet matters more than the direction of the bet" },
          { type: "body", text: "Amateurs obsess over what to buy. Professionals obsess over how much. The Kelly criterion — developed at Bell Labs in 1956 — is a formula for the bet size that maximizes long-term growth given your edge. Its deepest lesson isn't the exact math; it's that there is an optimal size, that betting more than it actually reduces your long-term growth, and that betting far more courts ruin even with a winning strategy." },
          { type: "callout", text: "Full Kelly is aggressive and produces stomach-churning swings. Most professionals use 'fractional Kelly' — often half or a quarter of the formula's recommendation — accepting slightly lower theoretical growth for dramatically smoother survival. The lesson generalizes far beyond gambling: never concentrate so heavily in one position that a normal loss becomes a fatal one." },
          { type: "vault", title: "VAULT SECRET: Diversification Is Position Sizing in Disguise", text: "When advisors say 'don't put all your eggs in one basket,' they're describing position sizing without the math. Spreading capital across uncorrelated assets caps how much any single failure can hurt you. The wealthy don't diversify because they lack conviction — they diversify because survival is the precondition for compounding, and compounding is where fortunes are actually made. A concentrated bet can make you rich once; disciplined sizing keeps you rich across every cycle." },
          { type: "action", text: "Map our capital across positions as percentages. Is any single position large enough that its failure would end our ability to keep playing? That's the one to trim first — not because it's wrong, but because it's too big." }
        ]
      },
      {
        title: "Asymmetric Bets — Risk a Little, Win a Lot",
        content: [
          { type: "quote", text: "Heads I win a lot; tails I lose a little. Seek those.", author: "Nassim Taleb (paraphrased)" },
          { type: "heading", text: "The ideal bet has capped downside and open-ended upside" },
          { type: "body", text: "Not all risks are equal. A symmetric bet risks as much as it can gain. An asymmetric bet risks a small, defined amount for a potentially large, undefined gain. A handful of asymmetric bets — where the most you can lose is your small stake but the upside is many multiples — can define an entire financial life, because a single winner can pay for all the losers many times over." },
          { type: "callout", text: "This is the actual structure of venture capital and early-stage investing: most bets return little or nothing, but the rare winner returns hundreds of times the stake, carrying the whole portfolio. The discipline is keeping each individual stake small enough that the inevitable losses can't ruin you, while ensuring you're positioned to catch the rare, outsized win." },
          { type: "vault", title: "VAULT SECRET: The Barbell", text: "Taleb's 'barbell strategy': place the large majority of capital in maximally safe, boring assets that cannot be wiped out, and a small minority in high-risk, high-asymmetry bets with capped downside and explosive upside. Avoid the mediocre middle — moderately risky assets that can still hurt you badly without the compensating upside. The safe base guarantees survival; the aggressive tip provides the shot at outsized gains. You are protected on one end and exposed to fortune on the other, with nothing wasted in between." },
          { type: "action", text: "Examine our portfolio for the 'mediocre middle' — positions risky enough to hurt but without the upside to justify it. Could a barbell — safer base, small asymmetric tip — serve us better?" }
        ]
      }
    ],
    quiz: [
      { q: "To recover from a 50% loss, you need a gain of:", options: ["50%", "75%", "100%", "25%"], correct: 2 },
      { q: "The first principle of building wealth is:", options: ["Maximizing returns on every bet", "Avoiding catastrophic loss and staying in the game", "Using maximum leverage", "Timing the market perfectly"], correct: 1 },
      { q: "'Risk of ruin' rises sharply when you:", options: ["Diversify broadly", "Bet a large fraction of capital on a single outcome", "Hold cash reserves", "Use fractional position sizing"], correct: 1 },
      { q: "The simulator shows that even a favorable bet leads to ruin when:", options: ["The win rate is above 50%", "The position size is too large", "You stop early", "The payout is even"], correct: 1 },
      { q: "The Kelly criterion's deepest lesson is that:", options: ["You should always bet everything", "There is an optimal bet size, and exceeding it reduces long-term growth", "Direction matters more than size", "Diversification is unnecessary"], correct: 1 },
      { q: "Most professionals use 'fractional Kelly' because:", options: ["It maximizes theoretical returns", "It trades slightly lower growth for dramatically smoother survival", "It is required by regulators", "It eliminates all risk"], correct: 1 },
      { q: "Diversification is essentially:", options: ["A lack of conviction", "Position sizing applied across uncorrelated assets to cap any single failure", "A way to guarantee gains", "Only for beginners"], correct: 1 },
      { q: "An asymmetric bet has:", options: ["Equal risk and reward", "Capped, small downside and large, open-ended upside", "Guaranteed returns", "Unlimited downside"], correct: 1 },
      { q: "Early-stage/venture investing works because:", options: ["Most bets win big", "A rare outsized winner can pay for many losers, if each stake stays small", "There is no risk", "Returns are steady and predictable"], correct: 1 },
      { q: "Taleb's barbell strategy places capital in:", options: ["Entirely moderate-risk assets", "A safe base plus a small high-asymmetry tip, avoiding the mediocre middle", "One concentrated position", "Only cash"], correct: 1 }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MODULE 18 — MARKET CYCLES & MANIAS
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 18, title: "Market Cycles & Manias", subtitle: "The same story, told in every generation",
    icon: "🜔", tag: "CYCLES", duration: "50–65 min", xpReward: 500,
    lessons: [
      {
        title: "The Anatomy of a Bubble",
        content: [
          { type: "quote", text: "History doesn't repeat itself, but it often rhymes.", author: "Attributed to Mark Twain" },
          { type: "heading", text: "Every mania follows the same emotional architecture" },
          { type: "body", text: "Economist Hyman Minsky mapped the stages every speculative bubble moves through: a genuine innovation or shift (displacement), rising prices and growing interest (boom), broad excitement and easy credit (euphoria), the smart money quietly exiting (profit-taking), and the collapse (panic). The specific asset changes every time — tulips, railways, radio, internet stocks, crypto — but the emotional sequence is remarkably constant, because it's driven by human nature, which does not update." },
          { type: "callout", text: "The engine of every bubble is the same story: 'This time is different.' Sometimes the underlying innovation is real and world-changing — the internet was. But real innovation and unsustainable price are two separate things. Prices detach from value when the story overwhelms the arithmetic, and the story always feels most convincing right before the top." },
          {
            type: "reveal",
            title: "Four Centuries, One Pattern",
            steps: [
              { label: "1637", tag: "MANIA", heading: "Tulip Mania", text: "In the Dutch Republic, single tulip bulbs traded for the price of a house. A futures market formed around flowers. When confidence broke, prices collapsed to near nothing within weeks. The first well-documented speculative bubble." },
              { label: "1720", tag: "MANIA", heading: "The South Sea Bubble", text: "A trading company's stock rose roughly tenfold on speculation and promises, sweeping in nobles and commoners alike. It collapsed and ruined thousands. Isaac Newton lost a fortune and reportedly said he could calculate the motions of the heavens but not the madness of people." },
              { label: "1929", tag: "MANIA", heading: "The Roaring Twenties Crash", text: "Stocks bought on heavy margin soared through the decade on the belief in a new permanent prosperity. The crash erased fortunes and helped usher in the Great Depression." },
              { label: "2000", tag: "MANIA", heading: "The Dot-Com Bubble", text: "Internet companies with no profits reached staggering valuations on the true belief that the web would change everything. The web did — and most of those specific companies still went to zero. Real innovation, unsustainable prices." },
              { label: "NOW", tag: "PATTERN", heading: "The lesson, not the prediction", text: "The point is not that every rising asset is a bubble. It's that when you hear 'this time is different,' when credit is easy and everyone is certain, you are seeing a pattern four centuries old. Recognizing the emotional stage you're in is the skill." }
            ],
            note: "The asset always changes. The innovation is sometimes real. The human emotional sequence never changes. Learn the sequence and you can locate yourself within it."
          },
          { type: "action", text: "Think of a market moment we lived through — buying or selling driven by the crowd. Which Minsky stage were we in? Recognizing it in hindsight trains us to recognize it in real time." }
        ]
      },
      {
        title: "Fear and Greed — The Two Engines",
        content: [
          { type: "heading", text: "Markets are voting machines in the short run, driven by two emotions" },
          { type: "body", text: "Benjamin Graham observed that in the short run the market is a voting machine — a measure of popularity and emotion — but in the long run it's a weighing machine, measuring actual value. Short-term prices swing on fear and greed; long-term prices gravitate toward underlying worth. The investor who understands this can act against the crowd's emotion while the crowd is trapped inside it." },
          { type: "callout", text: "This is the origin of the most quoted contrarian principle in finance: be fearful when others are greedy, and greedy when others are fearful. It's simple to say and brutally hard to do, because it requires acting against the powerful social and emotional pull of the crowd precisely when that pull is strongest. Knowing the principle and executing it are separated by a wide gap of discipline." },
          { type: "vault", title: "VAULT SECRET: The Crowd Is Loudest at the Turns", text: "The maximum point of collective euphoria — everyone certain prices only go up — tends to cluster near tops. The maximum point of collective despair — everyone certain it's over — tends to cluster near bottoms. The emotional extreme of the crowd is itself a signal, often pointing the opposite direction of where the crowd is looking. The fox watches the herd's emotion as data, not as instruction. When the herd is most sure, the fox grows most cautious." },
          { type: "action", text: "Recall a time we followed the crowd into a financial decision. What was the collective emotion at that moment? Would treating that emotion as a contrarian signal have served us better?" }
        ]
      },
      {
        title: "Positioning Across the Cycle",
        content: [
          { type: "quote", text: "The four most dangerous words in investing are: 'this time it's different.'", author: "Sir John Templeton" },
          { type: "heading", text: "You cannot time the top or bottom — but you can position for the cycle" },
          { type: "body", text: "No one reliably calls the exact top or bottom; those who claim to are lucky or lying. But you don't need precision. You need a plan that acknowledges cycles exist: accumulating deliberately when fear is high and assets are cheap, taking some profit when euphoria is high and assets are expensive, and never being so exposed that a normal downturn forces you to sell at the worst possible moment. The goal isn't perfect timing — it's never being a forced seller." },
          { type: "callout", text: "The forced seller is the true victim of every cycle. Those wiped out in crashes are usually those who were over-leveraged or over-committed and had to sell at the bottom to survive. Those who hold reserves and reasonable exposure can wait out the storm — and even buy from the forced sellers at generational discounts. Survival through the cycle is what converts volatility from a threat into an opportunity." },
          { type: "vault", title: "VAULT SECRET: Dry Powder Is a Position", text: "Holding cash reserves feels unproductive during a boom — it earns little while everything else soars, and the crowd mocks it. But cash is optionality. When a cycle turns and quality assets go on sale, the person with reserves buys what the forced sellers must dump. The wealthy deliberately hold 'dry powder' precisely so they can act when others are paralyzed. In a mania, patience looks foolish; in a panic, it looks like genius. It was the same patience the whole time." },
          { type: "action", text: "Assess our current cycle exposure: if a significant downturn hit next quarter, would we be a forced seller or a patient buyer? Do we hold any dry powder? Position for the answer we want before the cycle decides for us." }
        ]
      }
    ],
    quiz: [
      { q: "The stages of a speculative bubble were mapped by economist:", options: ["Adam Smith", "Hyman Minsky", "Milton Friedman", "John Maynard Keynes"], correct: 1 },
      { q: "Across all historical bubbles, what stays constant?", options: ["The specific asset", "The human emotional sequence", "The exact price levels", "The time period"], correct: 1 },
      { q: "The phrase that fuels nearly every bubble is:", options: ["'Buy low, sell high'", "'This time is different'", "'Cash is king'", "'Diversify broadly'"], correct: 1 },
      { q: "Real innovation and unsustainable price are:", options: ["Always the same thing", "Two separate things — the innovation can be real while prices detach from value", "Never related", "Both guaranteed to last"], correct: 1 },
      { q: "Benjamin Graham described the market as a voting machine short-term and a ___ machine long-term:", options: ["Printing", "Weighing", "Gambling", "Random"], correct: 1 },
      { q: "The classic contrarian principle is:", options: ["Follow the crowd always", "Be fearful when others are greedy and greedy when others are fearful", "Never sell", "Only buy at the top"], correct: 1 },
      { q: "Extreme collective euphoria in a market tends to cluster near:", options: ["Bottoms", "Tops", "The middle of a cycle", "Nowhere in particular"], correct: 1 },
      { q: "Regarding market timing, the realistic goal is to:", options: ["Perfectly call the top and bottom", "Position for the cycle and never be a forced seller", "Ignore cycles entirely", "Always stay fully invested"], correct: 1 },
      { q: "The true victim of every market crash is usually:", options: ["The patient holder", "The forced seller who was over-leveraged", "The cash holder", "The long-term investor"], correct: 1 },
      { q: "Holding 'dry powder' (cash reserves) provides:", options: ["Guaranteed high returns", "Optionality to buy quality assets when others are forced to sell", "Protection from all losses", "A way to time the market perfectly"], correct: 1 }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MODULE 19 — CASH FLOW ARCHITECTURE
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 19, title: "Cash Flow Architecture", subtitle: "Engineering income that outlives your labor",
    icon: "🝊", tag: "SYSTEMS", duration: "50–65 min", xpReward: 500,
    lessons: [
      {
        title: "The Freedom Equation",
        content: [
          { type: "quote", text: "Financial freedom is when your passive income exceeds your expenses. Everything before that is a job.", author: "Common financial principle" },
          { type: "heading", text: "Freedom is a math problem: passive income minus expenses" },
          { type: "body", text: "The definition of financial freedom is precise and unemotional: the moment your income from assets — money that arrives whether or not you work — reliably exceeds your cost of living. Below that line, you must trade time for money to survive. Above it, work becomes a choice. Everything in wealth-building is, in some sense, engineering toward crossing that single line. The number is knowable, and once you know it, it becomes a target instead of a mystery." },
          { type: "callout", text: "This reframes the entire goal. You don't need to be 'rich' in the abstract — you need enough income-producing assets to cover your specific expenses. A person with modest expenses and solid passive income is freer than a high earner who spends everything they make. Freedom is a ratio, not a number. Lowering expenses moves the line down; raising passive income moves you up toward it. Both count." },
          {
            type: "calculator", variant: "streams",
            title: "Build Your Freedom Stack",
            inputs: [
              { key: "rental", label: "Rental / real estate income", min: 0, max: 10000, step: 100, default: 0, prefix: "$" },
              { key: "dividends", label: "Dividends & interest", min: 0, max: 10000, step: 50, default: 0, prefix: "$" },
              { key: "royalties", label: "Royalties / digital products", min: 0, max: 10000, step: 50, default: 0, prefix: "$" },
              { key: "business", label: "Business / systematized income", min: 0, max: 10000, step: 100, default: 0, prefix: "$" },
              { key: "staking", label: "Staking / on-chain yield", min: 0, max: 10000, step: 50, default: 0, prefix: "$" }
            ],
            note: "Set each stream to what it currently produces per month — most will start at zero, and that's the honest starting point. The annual figure is our current passive income. The gap between it and our annual expenses is the exact distance to freedom. Now it's a measurable target."
          },
          { type: "action", text: "Enter our real monthly passive income by stream above. Then write our annual expenses. The difference is the precise gap we're engineering to close. Name the single stream we can most realistically grow first." }
        ]
      },
      {
        title: "Uncorrelated Streams — The Resilient Portfolio of Income",
        content: [
          { type: "heading", text: "One income stream is a single point of failure" },
          { type: "body", text: "A person with one income source — even a large one — is fragile. A single event (a layoff, an industry shift, an illness) can eliminate everything. The wealthy engineer multiple income streams that don't all fail at once. When streams are uncorrelated — they respond to different forces — a blow to one doesn't take down the others. This is diversification applied to income rather than investments, and it's the difference between a fragile life and a resilient one." },
          { type: "callout", text: "The strongest architectures combine streams with different characteristics: some active (consulting, services), some passive (rentals, dividends), some tied to the economy, some counter-cyclical. The goal is a portfolio of income where no single failure is fatal, and where the streams ideally feed one another — active income buying passive assets, which fund the next active venture." },
          { type: "vault", title: "VAULT SECRET: The Convergence Loop", text: "The most durable wealth architectures aren't just multiple streams — they're a loop where each feeds the next. Active income (a service or business) generates surplus. Surplus buys income-producing assets (real estate, dividend equity, on-chain yield). Those assets throw off passive income. Passive income funds the next venture or asset, reducing dependence on the original active source. Run the loop long enough and the active income becomes optional — the system sustains and grows itself. This is the engineering behind the phrase 'money works for you.'" },
          { type: "action", text: "List every income stream we have. Mark each active or passive, and note what would kill it. If losing one stream would end us, building a second uncorrelated stream is our highest-priority project." }
        ]
      },
      {
        title: "The Bottleneck — Why Systems Beat Hustle",
        content: [
          { type: "quote", text: "If you cannot separate yourself from your income, you do not own a business — you own a job.", author: "Michael Gerber (paraphrased)" },
          { type: "heading", text: "Income that requires your constant presence has a hard ceiling" },
          { type: "body", text: "There are only so many hours in a life. Any income that requires you to be personally present for every dollar is capped by time and vulnerable to your absence. The transition that builds real wealth is converting your presence into systems — documented processes, trained people, automated flows — that generate income without your hands on every transaction. This is the difference between owning a job and owning an asset that happens to produce cash." },
          { type: "callout", text: "The critical constraint for most builders isn't starting — it's finishing the systemization. It's tempting to keep doing the work yourself because you're good at it and it feels productive. But every hour spent in the work is an hour not spent on the system that would replace that work. Integration debt compounds: unfinished systems, half-built automations, processes that live only in your head. The bottleneck is almost never vision — it's convergence, closing the loop end to end." },
          { type: "vault", title: "VAULT SECRET: Document to Multiply", text: "The single highest-leverage act in building self-sustaining income is documentation. A process written down clearly enough that someone else can execute it becomes an asset that can be delegated, automated, scaled, or sold. Knowledge trapped in your head is a liability disguised as expertise — it makes you the permanent bottleneck. The wealthy compulsively convert their know-how into documented systems, because a system runs without them and a skill does not. Write it down, and you've begun turning your labor into an asset." },
          { type: "action", text: "Identify the one income-generating task most dependent on us personally. Write its steps as if training a replacement who can ask no questions. That document is the first brick of a system that runs without us." }
        ]
      }
    ],
    quiz: [
      { q: "Financial freedom is precisely defined as:", options: ["Having a million dollars", "Passive income reliably exceeding your expenses", "A high salary", "Owning a home"], correct: 1 },
      { q: "Financial freedom is best understood as:", options: ["A fixed dollar amount everyone needs", "A ratio of passive income to expenses", "Only achievable by high earners", "The same for everyone"], correct: 1 },
      { q: "Lowering your expenses affects freedom by:", options: ["Having no effect", "Moving the freedom line down, closer to your passive income", "Requiring more income", "Only mattering for the wealthy"], correct: 1 },
      { q: "A person with a single large income source is:", options: ["Perfectly secure", "Fragile — one event can eliminate everything", "Automatically wealthy", "Diversified"], correct: 1 },
      { q: "'Uncorrelated' income streams means:", options: ["Streams that always rise together", "Streams that respond to different forces, so one failing doesn't take the others down", "Streams from the same employer", "Streams that are all passive"], correct: 1 },
      { q: "The 'convergence loop' describes:", options: ["Spending all income immediately", "Active income buying assets that produce passive income that funds the next venture", "Relying on one income source", "Avoiding all active work"], correct: 1 },
      { q: "Income requiring your constant presence is:", options: ["Unlimited", "Capped by your available time and vulnerable to your absence", "The best kind of income", "Always passive"], correct: 1 },
      { q: "The main bottleneck in building self-sustaining income is usually:", options: ["Lack of vision", "Failing to finish systemizing — closing the loop end to end", "Too much capital", "Too many ideas"], correct: 1 },
      { q: "The highest-leverage act in building scalable income is:", options: ["Working longer hours", "Documenting processes so they can be delegated, automated, or sold", "Keeping knowledge in your head", "Avoiding delegation"], correct: 1 },
      { q: "Knowledge trapped only in your head is:", options: ["Your greatest asset", "A liability that makes you the permanent bottleneck", "Impossible to change", "Always sufficient"], correct: 1 }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MODULE 20 — NEGOTIATION & LEVERAGE
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 20, title: "Negotiation & Leverage", subtitle: "The skill that pays more than any other",
    icon: "🜎", tag: "LEVERAGE", duration: "50–65 min", xpReward: 500,
    lessons: [
      {
        title: "You Don't Get What You Deserve — You Get What You Negotiate",
        content: [
          { type: "quote", text: "In business and in life, you don't get what you deserve. You get what you negotiate.", author: "Chester Karrass" },
          { type: "heading", text: "Negotiation is the highest-return skill you can develop" },
          { type: "body", text: "Almost every meaningful financial outcome passes through a negotiation: salary, business deals, purchases, partnerships, rates. A single successful salary negotiation early in a career can compound into hundreds of thousands over a lifetime, because every future raise builds off that higher base. Few skills offer this leverage — hours invested in becoming a better negotiator return more per hour than almost anything else you could learn." },
          { type: "callout", text: "The most expensive belief is that terms are fixed. Prices, salaries, rates, and conditions are far more negotiable than most people assume — but only for those who ask. The person who accepts the first offer subsidizes the person who negotiates. This isn't about being aggressive; it's about understanding that 'no negotiation' is itself a choice, and usually a costly one." },
          {
            type: "scenario",
            title: "The Salary Conversation",
            prompt: "You've received a job offer. The number is lower than you hoped. The recruiter is waiting.",
            nodes: {
              start: { text: "The offer is $75,000. You expected $85,000. The recruiter asks: 'Does that work for you?'", choices: [
                { label: "\"Yes, that works, thank you.\" (Accept immediately)", to: "accept" },
                { label: "\"Thank you. Based on my research and the value I bring, I was targeting $88,000. Can we get closer?\"", to: "counter" },
                { label: "\"That's too low.\" (Reject flatly)", to: "reject" }
              ]},
              accept: { text: "You took the first number. The company had budgeted up to $85,000 and expected a counter. You left $10,000 on the table in year one — and every future raise now builds off the lower base.", outcome: "bad", lesson: "The first offer is rarely the ceiling. Accepting instantly signals the number was never tested. Silence and a calm counter cost nothing to attempt." },
              counter: { text: "You anchored slightly above your target, backed by research, and stayed warm. The recruiter comes back at $82,000. You've gained $7,000 over the initial offer for one two-minute conversation.", outcome: "good", lesson: "Anchor with justification, aim slightly high, stay collaborative. Most negotiators leave room precisely because they expect a counter. The ask itself is the leverage." },
              reject: { text: "A flat rejection with no counter-number gives the recruiter nothing to work with and sets an adversarial tone. They may simply move on. Emotion without a specific ask rarely improves terms.", outcome: "neutral", lesson: "Push back with a specific number and a reason, not raw rejection. Negotiation is collaborative problem-solving toward a number, not a fight to win." }
            }
          },
          { type: "action", text: "Recall the last time we accepted a price or offer without negotiating. Estimate what a single calm counter might have saved. That number is our tuition for learning this skill." }
        ]
      },
      {
        title: "Leverage — The Source of All Negotiating Power",
        content: [
          { type: "heading", text: "Leverage is simply your ability to walk away" },
          { type: "body", text: "The core of negotiating power is your BATNA — Best Alternative To a Negotiated Agreement. It's what happens if you walk away with no deal. The stronger your alternatives, the more power you hold, because you can genuinely say no. The person who needs the deal loses to the person who can walk. This is why building options — savings, skills, multiple opportunities — quietly increases your power in every negotiation you'll ever enter." },
          { type: "callout", text: "This explains why an emergency fund is a negotiating tool. When you can afford to walk away from a bad job or deal, you negotiate from strength. When you're desperate, the other side feels it and terms reflect it. Financial reserves don't just protect you — they change the outcome of every deal by making 'no' a credible option. Your balance sheet negotiates for you before you say a word." },
          { type: "vault", title: "VAULT SECRET: Manufacture Alternatives", text: "The most powerful negotiators create leverage before they need it. They cultivate multiple options — competing offers, alternative suppliers, backup plans — so they never enter a negotiation dependent on a single outcome. When you have three real alternatives, you negotiate calmly and win more, because the deal in front of you is genuinely optional. Desperation is the enemy of good terms, and manufactured alternatives are its cure. Build the options first; negotiate second." },
          { type: "action", text: "Before our next significant negotiation, list our real alternatives if it falls through. If the list is thin, our first task isn't negotiating harder — it's manufacturing more alternatives to negotiate from strength." }
        ]
      },
      {
        title: "The Tactics That Actually Work",
        content: [
          { type: "quote", text: "He who cares less, wins. But you must actually build a life where you can afford to care less.", author: "Negotiation principle" },
          { type: "heading", text: "A few reliable principles beat a hundred manipulative tricks" },
          { type: "list", items: [
            "Anchor first when you have information — the first number shapes the entire range that follows.",
            "Use silence — after making an offer, stop talking. Silence pressures the other side to fill it, often with concessions.",
            "Ask open questions — 'How did you arrive at that number?' surfaces information and constraints you can work with.",
            "Never negotiate against yourself — don't lower your own ask before they've even responded.",
            "Aim for the relationship, not just the transaction — the best deals leave both sides willing to deal again."
          ]},
          { type: "body", text: "Great negotiation isn't manipulation or domination — it's collaborative problem-solving where you understand the other side's needs well enough to find terms that work for both, while protecting your own interests. The reputation you build across many negotiations becomes its own compounding asset: people want to deal with those who deal fairly and firmly." },
          { type: "vault", title: "VAULT SECRET: The Long-Game Reputation", text: "The wealthiest operators think in repeated games, not single transactions. A reputation for negotiating firmly but fairly — driving hard on terms while honoring every commitment — compounds over a career. People bring their best deals to those they trust to be both sharp and honest. Winning a single negotiation by burning the other side is a one-time gain; building a reputation that makes people want to deal with you is a compounding asset that surfaces opportunities for decades. Play the long game." },
          { type: "action", text: "Pick one tactic above — anchoring or strategic silence is easiest to start — and consciously use it in our next negotiation, however small. Skill is built through deliberate reps, not theory." }
        ]
      }
    ],
    quiz: [
      { q: "The principle 'you get what you negotiate' means:", options: ["Outcomes are based purely on merit", "Meaningful financial outcomes depend on negotiation, not just what you deserve", "Negotiation doesn't matter", "Only executives negotiate"], correct: 1 },
      { q: "A single successful early salary negotiation compounds because:", options: ["It's a one-time bonus", "Every future raise builds off the higher base", "It reduces your taxes", "It has no lasting effect"], correct: 1 },
      { q: "The most expensive belief in negotiation is that:", options: ["You should always counter", "Terms are fixed and non-negotiable", "Relationships matter", "Silence is powerful"], correct: 1 },
      { q: "In the salary scenario, accepting the first offer instantly:", options: ["Maximizes your outcome", "Often leaves money on the table the company had budgeted", "Is always the right move", "Signals confidence"], correct: 1 },
      { q: "Your BATNA is:", options: ["Your opening offer", "Your Best Alternative To a Negotiated Agreement — what happens if you walk away", "A negotiation tactic", "Your final price"], correct: 1 },
      { q: "An emergency fund is a negotiating tool because:", options: ["It impresses the other side", "It lets you credibly walk away, negotiating from strength", "It's required for deals", "It raises your salary directly"], correct: 1 },
      { q: "The most powerful negotiators create leverage by:", options: ["Being aggressive", "Manufacturing multiple real alternatives before they need them", "Accepting first offers", "Hiding their BATNA"], correct: 1 },
      { q: "Anchoring first is advantageous when:", options: ["You have no information", "You have information — the first number shapes the range", "You want to concede", "The other side is desperate"], correct: 1 },
      { q: "After making an offer, strategic silence:", options: ["Weakens your position", "Pressures the other side to fill it, often with concessions", "Should always be avoided", "Signals uncertainty"], correct: 1 },
      { q: "The wealthiest operators approach negotiation as:", options: ["A single transaction to win at all costs", "A repeated game where a fair-but-firm reputation compounds", "A chance to burn the other side", "Something to avoid"], correct: 1 }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MODULE 21 — TAX STRATEGY & ENTITIES
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 21, title: "Tax Strategy & Entities", subtitle: "The legal architecture the wealthy actually use",
    icon: "🜹", tag: "STRUCTURE", duration: "55–70 min", xpReward: 500,
    lessons: [
      {
        title: "The Two Tax Systems",
        content: [
          { type: "quote", text: "Anyone may arrange his affairs so that his taxes shall be as low as possible; he is not bound to choose that pattern which best pays the treasury.", author: "Judge Learned Hand, 1934" },
          { type: "heading", text: "There are two tax systems, and you were only taught one" },
          { type: "body", text: "The employee tax system is simple: earn, get taxed, spend what remains. The business owner tax system operates in a different order: earn, spend on legitimate business expenses, then get taxed on what remains. Same gross income, structurally different outcome. This isn't a loophole — it's how the tax code is deliberately written, to reward the ownership and investment that the code's authors wanted to encourage." },
          { type: "callout", text: "Tax avoidance (legally arranging your affairs to minimize tax) is entirely legal and expected. Tax evasion (illegally hiding income or lying) is a crime. The entire game the wealthy play happens on the legal side — using deductions, entities, timing, and structure that the code explicitly provides. The difference between the two is disclosure and legitimacy, not aggressiveness." },
          {
            type: "sortgame",
            title: "Deductible or Not? — The Business Expense Filter",
            buckets: [
              { id: "yes", label: "Deductible" },
              { id: "no", label: "Not" }
            ],
            items: [
              { text: "Software subscriptions used to run your business", bucket: "yes" },
              { text: "A personal vacation with no business purpose", bucket: "no" },
              { text: "Mileage driven to meet a client", bucket: "yes" },
              { text: "Groceries for your family's dinners", bucket: "no" },
              { text: "A portion of home internet used for business work", bucket: "yes" },
              { text: "A new wardrobe for everyday personal wear", bucket: "no" },
              { text: "Professional education that maintains or improves business skills", bucket: "yes" },
              { text: "A speeding ticket", bucket: "no" }
            ],
            note: "The line is legitimate business purpose. A real, documented business expense reduces taxable income. A personal expense dressed up as business is exactly what triggers audits. The wealthy stay firmly on the legitimate side — and document everything."
          },
          { type: "action", text: "List our recurring expenses. How many have a legitimate business purpose that, with the right entity and documentation, could become deductible? That list is the argument for structure." }
        ]
      },
      {
        title: "Entities — The Container Changes Everything",
        content: [
          { type: "heading", text: "The wealthy don't own things personally — their entities do" },
          { type: "body", text: "An entity is a legal structure — LLC, S-Corporation, C-Corporation, or trust — that can own assets, earn income, incur expenses, and exist separately from you personally. Entities provide two core benefits: liability protection (separating your personal assets from business risk) and tax flexibility (accessing deductions and treatment unavailable to individuals). This is why serious wealth-builders route income and assets through entities rather than holding everything in their personal name." },
          { type: "callout", text: "Different entities serve different purposes. An LLC offers simplicity and liability protection. An S-Corp can reduce self-employment taxes for profitable businesses through reasonable-salary structuring. A C-Corp has distinct tax treatment used by larger operations and those raising capital. A trust holds and passes assets. The right structure depends entirely on your specific situation — which is precisely why this is a conversation with a qualified professional, not a template to copy blindly." },
          { type: "vault", title: "VAULT SECRET: The Separation Principle", text: "The foundational move of sophisticated wealth structuring is separation — creating legal distance between you and your assets. Assets held inside properly structured entities are harder to reach in lawsuits, can access business tax treatment, and can be passed to heirs more efficiently. Your personal name stays clean and low-profile while your entities do the owning, the earning, and the borrowing. This isn't secrecy — it's structure. Every substantial wealth-builder uses some version of it, and it was simply never part of the standard education." },
          { type: "action", text: "Ask honestly: do we own our income-producing activities personally or through an entity? If personally, researching the right entity structure with a qualified professional is likely our highest-leverage structural move." }
        ]
      },
      {
        title: "Timing, Losses, and the Long Game",
        content: [
          { type: "quote", text: "It's not what you earn, it's what you keep — and when you're required to pay tax on it.", author: "Tax planning principle" },
          { type: "heading", text: "When you pay tax is nearly as important as how much" },
          { type: "body", text: "Sophisticated tax strategy plays with timing. Tax-advantaged accounts let investments grow deferred or tax-free. Holding assets longer than a year qualifies for lower long-term capital gains rates. Losses can be harvested to offset gains. Income can sometimes be deferred to lower-tax years. None of this is hidden — it's written into the code — but it requires thinking about tax as an ongoing strategy across years, not a once-a-year filing event." },
          { type: "callout", text: "The employee experiences tax as a fixed withholding they can't influence. The business owner and investor experience tax as a variable they actively manage through timing, structure, and strategy across the whole year and across years. The shift from passive taxpayer to active tax strategist is one of the quiet dividing lines between those who keep their wealth and those who watch it get taxed away." },
          { type: "vault", title: "VAULT SECRET: Buy, Borrow, Die — Revisited", text: "The most powerful long-game structure combines everything: hold appreciating assets inside entities, never sell them (avoiding capital gains entirely), borrow against them for tax-free liquidity since loans aren't income, and pass them to heirs at a stepped-up basis that erases the accumulated gain. Done within the law and properly structured, a lifetime of asset growth can pass with minimal tax. This is documented, legal, and used by the wealthiest families — and understanding it is the whole reason to learn the entity and timing game in the first place." },
          { type: "action", text: "Identify one timing lever available to us right now — a tax-advantaged account we're underusing, or a gain we could hold past the long-term threshold. Small timing decisions compound into large tax differences over a lifetime." }
        ]
      }
    ],
    quiz: [
      { q: "The key structural difference for a business owner vs. an employee is:", options: ["Business owners always earn more", "Owners are taxed after legitimate expenses; employees are taxed before spending", "Employees get more deductions", "There is no difference"], correct: 1 },
      { q: "Tax avoidance vs. tax evasion:", options: ["Both are illegal", "Avoidance is legal arrangement of affairs; evasion is illegal hiding of income", "Both are legal", "Avoidance is the crime"], correct: 1 },
      { q: "The dividing line for a deductible business expense is:", options: ["The dollar amount", "A legitimate, documented business purpose", "Whether you paid cash", "The time of year"], correct: 1 },
      { q: "The two core benefits an entity provides are:", options: ["Fame and secrecy", "Liability protection and tax flexibility", "Guaranteed profits and no taxes", "Higher salary and lower expenses"], correct: 1 },
      { q: "An S-Corp can specifically help by:", options: ["Eliminating all taxes", "Reducing self-employment taxes through reasonable-salary structuring", "Guaranteeing liability", "Avoiding all paperwork"], correct: 1 },
      { q: "The 'separation principle' means:", options: ["Hiding money illegally", "Creating legal distance between you and your assets via entities", "Keeping all assets in your personal name", "Separating from business partners"], correct: 1 },
      { q: "Holding an asset longer than a year typically:", options: ["Increases your tax rate", "Qualifies for lower long-term capital gains rates", "Has no tax effect", "Is illegal"], correct: 1 },
      { q: "Tax-loss harvesting is:", options: ["Illegally hiding losses", "Using losses to offset gains and reduce taxable income", "A type of entity", "A retirement account"], correct: 1 },
      { q: "The shift that separates wealth-keepers from others is:", options: ["Earning more", "Moving from passive taxpayer to active tax strategist", "Avoiding all investments", "Never using entities"], correct: 1 },
      { q: "The 'stepped-up basis' at death:", options: ["Increases the tax owed by heirs", "Resets an asset's cost basis to market value, erasing accumulated capital gains", "Is illegal", "Only applies to cash"], correct: 1 }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MODULE 22 — THE SOVEREIGN ENDGAME
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 22, title: "The Sovereign Endgame", subtitle: "Assembling the complete architecture",
    icon: "🜚", tag: "MASTERY", duration: "60–75 min", xpReward: 500,
    lessons: [
      {
        title: "The Full Map",
        content: [
          { type: "quote", text: "Freedom is not a number in an account. It is a structure that no single failure can collapse.", author: "The Vault" },
          { type: "heading", text: "Everything in this vault was building toward one architecture" },
          { type: "body", text: "Each module was a component. Money mechanics gave you the language. Economics revealed the field. Debt, wealth transfer, DeFi, real-world assets — the instruments. Psychology, compounding, risk, cycles — the operating principles. Cash flow, negotiation, tax structure — the engineering. Alone, each is a tool. Assembled deliberately, they form a single architecture: a financial life engineered so that no one failure can collapse it, and where the system grows itself over time." },
          { type: "callout", text: "The most common failure among people who learn all of this is accumulation without convergence — collecting knowledge, accounts, and half-built systems that never connect into a working whole. Knowing every component is worthless if they remain isolated. Integration is the entire game. The map matters less than closing the loops between its points." },
          {
            type: "reveal",
            title: "The Sovereign Architecture — Assembled",
            steps: [
              { label: "FOUNDATION", tag: "SURVIVE", heading: "Reserves & clean debt", text: "An emergency fund creates decision-making power. Bad debt is eliminated. You can no longer be forced into bad terms. This is the base every other layer stands on — survival first, always." },
              { label: "ENGINE", tag: "COMPOUND", heading: "Assets that grow themselves", text: "Capital is deployed into income-producing and appreciating assets — equities, real estate, on-chain yield. Compounding runs uninterrupted. The engine of growth is now running independent of your labor." },
              { label: "FLOW", tag: "MULTIPLY", heading: "Stacked, uncorrelated income", text: "Multiple income streams feed one another in a convergence loop. Active income buys assets; assets fund the next venture. No single stream's failure is fatal. The system becomes resilient." },
              { label: "STRUCTURE", tag: "PROTECT", heading: "Entities & tax architecture", text: "Assets sit inside legal structures that protect them, optimize tax treatment, and enable efficient transfer. Your personal name stays clean; your entities do the owning. Structure defends the wealth the engine builds." },
              { label: "OPTIONALITY", tag: "FREE", heading: "Alternatives & leverage", text: "Multiple options, reserves, and negotiating leverage mean you are never dependent on any single outcome, employer, or jurisdiction. Freedom is the ability to walk away from anything." },
              { label: "MASTERY", tag: "SOVEREIGN", heading: "The self-sustaining system", text: "The components are integrated into a loop that grows itself. Passive income exceeds expenses. Work becomes a choice. No single failure collapses the structure. This is the endgame — not a number, but a sovereign architecture." }
            ],
            note: "Reveal them in order and see the structure assemble. This is the entire vault, converged into one map. Your work now is not to learn more — it's to build the loops that connect what you already know."
          },
          { type: "action", text: "For each of the six layers above, rate honestly where we stand: not started, in progress, or solid. The lowest-rated layer that the others depend on is our single highest-priority build. Convergence over accumulation." }
        ]
      },
      {
        title: "Convergence Over Accumulation",
        content: [
          { type: "heading", text: "The bottleneck is never vision — it's finishing" },
          { type: "body", text: "The pattern that stops most people isn't a lack of knowledge or ideas. It's the failure to converge — to finish end-to-end, to connect the isolated pieces into a working system. We start systems fast and abandon them half-built. Integration debt compounds faster than vision: a dozen unfinished structures produce nothing, while one completed loop produces forever. The discipline that separates outcomes isn't learning more; it's closing what's already open." },
          { type: "callout", text: "This is why the fox, not the strongest animal, is the emblem. The fox finishes the hunt. It doesn't chase every rabbit it sees — it commits to one, sees it through, and eats. Applied here: pick the one loop that most needs closing, and close it completely before starting the next. A single working system beats ten brilliant half-built ones every time." },
          { type: "vault", title: "VAULT SECRET: The One-Loop Rule", text: "When overwhelmed by everything you could build, collapse it to a single question: what is the one loop that, if closed end-to-end, would change everything downstream? Usually it's the earliest incomplete layer — the reserve not yet built, the entity not yet formed, the first income stream not yet producing. Close that one loop completely. Then and only then move to the next. Sequential completion beats parallel accumulation. This single discipline — finishing one thing before starting another — is what converts a vault full of knowledge into actual sovereignty." },
          { type: "action", text: "Name the one loop in our financial architecture most in need of closing. Commit to finishing it completely before opening anything new. Write the specific 'done' condition. Then close it." }
        ]
      },
      {
        title: "The Sovereign Mindset",
        content: [
          { type: "quote", text: "The ultimate luxury is the freedom to spend your time as you choose. Everything else is a means to that end.", author: "The Vault" },
          { type: "heading", text: "The goal was never money — it was sovereignty over your time" },
          { type: "body", text: "Wealth, correctly understood, is not the accumulation of numbers. It is the accumulation of choice — the freedom to spend your finite time as you decide, unforced by financial necessity. Every module in this vault was ultimately about that: engineering a life where your time belongs to you. The person who has built the architecture but forgotten the purpose has missed the point entirely. Money is the means. Sovereignty over your one life is the end." },
          { type: "callout", text: "There is a trap at the summit: the goalpost that never stops moving, the accumulation that becomes its own compulsion, the wealth that enslaves instead of frees. The antidote is the discipline from the psychology module — defining 'enough,' and building deliberately toward it rather than compulsively past it. Sovereignty includes sovereignty over the desire for more. The fox that has eaten does not keep killing." },
          { type: "vault", title: "VAULT SECRET: The Final Unlock", text: "The complete architecture produces something the numbers alone never could: the ability to say no. No to work that violates your values. No to deals that don't serve you. No to anyone's control over your time. This is the true output of the entire vault — not a balance, but a stance. When your assets cover your needs, your options are wide, and your structure is sound, you have achieved the only wealth that ever mattered: sovereignty over your own life. The vault was never about money. It was about becoming ungovernable by financial necessity. That is the final unlock, and it was the point all along." },
          { type: "action", text: "Write our definition of 'enough' — the annual passive income and the structure that would let us say no to anything that violated our values. That definition, nailed down, is the true finish line. Everything else is the build toward it." }
        ]
      }
    ],
    quiz: [
      { q: "The Sovereign Endgame frames the whole vault as building toward:", options: ["A single large bank balance", "One integrated architecture no single failure can collapse", "A high salary", "A collection of accounts"], correct: 1 },
      { q: "The most common failure among those who learn all of this is:", options: ["Learning too little", "Accumulation without convergence — knowledge and systems that never connect", "Working too hard", "Being too cautious"], correct: 1 },
      { q: "The foundation layer of the sovereign architecture is:", options: ["Complex tax entities", "Reserves and eliminating bad debt — survival first", "High-risk investments", "A second passport"], correct: 1 },
      { q: "In the architecture, entities and tax structure serve to:", options: ["Generate all income", "Protect assets, optimize tax, and enable efficient transfer", "Replace the emergency fund", "Guarantee returns"], correct: 1 },
      { q: "'Optionality' in the endgame means:", options: ["Owning stock options", "Having alternatives and leverage so you depend on no single outcome", "A type of entity", "Maximizing risk"], correct: 1 },
      { q: "The primary bottleneck that stops most people is:", options: ["Lack of vision or ideas", "Failure to converge — to finish and connect the pieces end-to-end", "Too little ambition", "Not enough knowledge"], correct: 1 },
      { q: "The fox is the emblem because it:", options: ["Is the strongest animal", "Finishes the hunt — commits to one target and sees it through", "Chases every opportunity", "Avoids all risk"], correct: 1 },
      { q: "The 'one-loop rule' advises you to:", options: ["Build everything in parallel", "Close the single most important incomplete loop end-to-end before starting the next", "Never finish anything", "Focus only on money"], correct: 1 },
      { q: "Correctly understood, wealth is the accumulation of:", options: ["Numbers in an account", "Choice — freedom over your finite time", "Possessions", "Status"], correct: 1 },
      { q: "The 'final unlock' of the complete architecture is:", options: ["Unlimited spending", "The ability to say no — sovereignty over your own life and time", "A guaranteed income", "Fame"], correct: 1 }
    ]
  }

];

// Append to the master MODULES array:
//   const MODULES = [ ...existing1through12, ...MODULES_13_22 ];
// Or if MODULES is a single literal, paste the objects above directly after Module 12.
export default MODULES_13_22;
