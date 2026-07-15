# Curriculum Inventory

## Authority and provenance

- Legacy authority: `/home/vupi-projects/member.ironvaulttoken.com`.
- Branch and committed baseline: `academy-free-course-modules-7-12` at `29f622310c82640d8b89e2643f644cf593e19979`.
- Curriculum source: `/home/vupi-projects/member.ironvaulttoken.com/iron-vault-academy-unlocked.jsx` at committed HEAD.
- The worktree-only `/learn` pages are previews/placeholders and do not contain the authoritative lesson or assessment bodies.
- `repomix-output.xml` mirrors the worktree source set; it does not reveal an additional curriculum source.
- A 96-commit, all-branch Git history search found no Module 13 or higher curriculum data.
- No live Supabase query was performed. The repository has no curriculum-table reads; all verified curriculum is source-code-only.

## Verified totals

- Learning paths explicitly modeled in legacy: **0**. The UI presents one linear Academy curriculum.
- Modules: **13** (Module 0 plus paid Modules 1-12).
- Lessons: **77**.
- Assessments: **13** (one quiz per module).
- Questions: **130** (ten per assessment).
- Total configured XP: **6250** (250 for Module 0 and 500 for each paid module).
- Pass threshold: **8/10** for every module quiz.
- Reward relevance: Modules 1-6 feed the legacy reward pipeline; Module 0 and Modules 7-12 are education-only.

## Product claim mismatches

| Claim/source | Evidence | Decision |
|---|---|---|
| Legacy `README.md`: all 6 modules | Stale relative to the committed 0-12 Academy component | Do not use as curriculum authority |
| Legacy Vault/rewards copy: complete 6 modules | Accurately describes only the reward-bearing subset | Retain as reward scope, not curriculum count |
| Worktree `/learn` preview titles | Twelve labels do not match the authoritative module titles | Rebuild preview from canonical curriculum records |
| Canonical `PAYMENTS-AND-ENTITLEMENTS.md`: Modules 1-22 | No supporting legacy source or Git-history evidence | Correct to verified paid Modules 1-12 pending a human-approved expansion |
| Current canonical EDU Vault | One path, one module, three short lessons, no assessments | Foundation only; not the product curriculum |

## Module overview

| No. | Title | Subtitle | Duration | XP | Lessons | Questions | Access | Reward | Current UI | Target |
|---:|---|---|---:|---:|---:|---:|---|---|---|---|
| 0 | Iron Vault Orientation | Complete this free lesson to qualify for your presale token allocation | 10–15 min | 250 | 1 | 10 | Authenticated free member, final capture rule pending | No; education-only | `/academy` internal view | `/academy/modules/iron-vault-orientation` |
| 1 | Money & Wealth Basics | Unlearn everything you were taught | 45–60 min | 500 | 6 | 10 | Valid full entitlement or matching single-module entitlement | Yes; legacy reward-bearing subset | `/academy` internal view | `/academy/modules/money-and-wealth-basics` |
| 2 | How the Economy Actually Works | The 10 concepts they never taught you in school | 50–65 min | 500 | 10 | 10 | Valid full entitlement or matching single-module entitlement | Yes; legacy reward-bearing subset | `/academy` internal view | `/academy/modules/how-the-economy-actually-works` |
| 3 | Traditional Finance Systems | Know the game before you play it | 50–65 min | 500 | 6 | 10 | Valid full entitlement or matching single-module entitlement | Yes; legacy reward-bearing subset | `/academy` internal view | `/academy/modules/traditional-finance-systems` |
| 4 | Introduction to Crypto & Blockchain | The technology they couldn't contain | 55–70 min | 500 | 6 | 10 | Valid full entitlement or matching single-module entitlement | Yes; legacy reward-bearing subset | `/academy` internal view | `/academy/modules/introduction-to-crypto-and-blockchain` |
| 5 | Digital Assets & Modern Wealth | The strategies they keep to themselves | 50–65 min | 500 | 6 | 10 | Valid full entitlement or matching single-module entitlement | Yes; legacy reward-bearing subset | `/academy` internal view | `/academy/modules/digital-assets-and-modern-wealth` |
| 6 | The Iron Vault System | Why we built this. What comes next. | 45–60 min | 500 | 6 | 10 | Valid full entitlement or matching single-module entitlement | Yes; legacy reward-bearing subset | `/academy` internal view | `/academy/modules/the-iron-vault-system` |
| 7 | The Debt Economy | How debt became the product — and how to make it work for you instead | 50–65 min | 500 | 6 | 10 | Valid full entitlement | No; education-only | `/academy` internal view | `/academy/modules/the-debt-economy` |
| 8 | How Wealth Is Actually Transferred | The generational playbook they've been running for centuries | 55–70 min | 500 | 6 | 10 | Valid full entitlement | No; education-only | `/academy` internal view | `/academy/modules/how-wealth-is-actually-transferred` |
| 9 | DeFi & The Parallel Financial System | A financial system was built without permission. Here's how it works. | 55–70 min | 500 | 6 | 10 | Valid full entitlement | No; education-only | `/academy` internal view | `/academy/modules/defi-and-the-parallel-financial-system` |
| 10 | Tokenized Real World Assets & the Ownership Revolution | When physical assets meet programmable money — and why it changes everything | 55–70 min | 500 | 6 | 10 | Valid full entitlement | No; education-only | `/academy` internal view | `/academy/modules/tokenized-real-world-assets-and-the-ownership-revolution` |
| 11 | Building Income That Doesn't Require You | The difference between a job, a business, and an asset | 55–70 min | 500 | 6 | 10 | Valid full entitlement | No; education-only | `/academy` internal view | `/academy/modules/building-income-that-doesn-t-require-you` |
| 12 | The Exit Strategy | How the ultra-wealthy reduce, relocate, and restructure their tax obligations entirely | 60–75 min | 500 | 6 | 10 | Valid full entitlement | No; education-only | `/academy` internal view | `/academy/modules/the-exit-strategy` |

## Detailed inventory

### Module 0: Iron Vault Orientation

- Slug: `iron-vault-orientation` (proposed canonical slug; legacy has no module URL slug).
- Description/objective: Complete this free lesson to qualify for your presale token allocation. No separate learning-objective field exists.
- Content source: `iron-vault-academy-unlocked.jsx`, `FREE_MODULE_0`.
- Lesson type: mixed structured reading blocks: heading, body, quote, list, callout, vault, and action as present per lesson.
- Duration: 10–15 min.
- XP: 250.
- Prerequisite: None.
- Access: Authenticated free member in the canonical model; legacy also permits anonymous viewing and quiz taking.
- Assessment: all lessons marked complete in browser state, then ten-question quiz; pass threshold 8/10.
- Reward relevance: No automatic reward relevance.
- Published state: rendered from a committed source literal; no database publication record exists.
- Current route: `/academy` with internal component state. Target module route: `/academy/modules/iron-vault-orientation`.

| Lesson | Title | Blocks/types | Objective field | Access/prerequisite | Current route | Target route |
|---:|---|---|---|---|---|---|
| 1 | Why We Teach First — And What That Gets You | 20; quote, heading, body, callout, list, vault, action | Not separately modeled; do not invent | Module access | `/academy` internal lesson view | `/academy/lessons/why-we-teach-first-and-what-that-gets-you` |

#### Assessment: Module 0

- Proposed target route: `/academy/assessments/iron-vault-orientation-assessment`.
- Legacy answer-key exposure: every `correct` index is shipped to the browser.
- Canonical rule: options may reach the browser; correct answers must remain server-only. The API receives selected option IDs, scores authoritatively, stores the attempt and selected answers, and awards progression/XP once in one transaction.

| Q | Prompt | Options | Correct answer |
|---:|---|---|---|
| 1 | Iron Vault Token (IVT) is built on which blockchain? | A. Ethereum<br>B. Bitcoin<br>C. Solana<br>D. Cardano | C. Solana |
| 2 | What is the Iron Vault Token presale price per token? | A. $0.01<br>B. $0.001<br>C. $1.00<br>D. $0.0001 | B. $0.001 |
| 3 | In Phase 3 of the Iron Vault roadmap, the goal is to: | A. Launch a new NFT collection<br>B. List IVT on Coinbase<br>C. Launch a stablecoin backed by acquired commercial real estate assets<br>D. Distribute all funds to early holders and close the project | C. Launch a stablecoin backed by acquired commercial real estate assets |
| 4 | Of the 6% transaction fee on IVT trades, what percentage goes to royalty position holders? | A. 6% — the entire fee<br>B. 1%<br>C. 3%<br>D. 2% | C. 3% |
| 5 | What is the total token supply of Iron Vault Token at launch? | A. 100,000,000<br>B. 21,000,000<br>C. 10,000,000,000<br>D. 1,000,000,000 | D. 1,000,000,000 |
| 6 | A smart contract is best described as: | A. A legal contract stored with a government agency<br>B. Self-executing code on a blockchain that runs automatically when conditions are met<br>C. An agreement between two banks to exchange digital assets<br>D. A type of hardware wallet for storing private keys | B. Self-executing code on a blockchain that runs automatically when conditions are met |
| 7 | DeFi stands for: | A. Digital Finance Initiative<br>B. Decentralized Financial Index<br>C. Decentralized Finance — financial services operating without traditional intermediaries<br>D. Defined Funding Instrument | C. Decentralized Finance — financial services operating without traditional intermediaries |
| 8 | A token's market capitalization is calculated by: | A. Total tokens created divided by current price<br>B. Current token price multiplied by circulating supply<br>C. The amount of money raised in the presale<br>D. Total trading volume over the last 24 hours | B. Current token price multiplied by circulating supply |
| 9 | What does 'DYOR' mean in crypto culture? | A. Deposit Your Own Reserves<br>B. Do Your Own Research — verify information independently before investing<br>C. Distribute Yield On Returns<br>D. Dynamic Yield Optimization Ratio | B. Do Your Own Research — verify information independently before investing |
| 10 | On-chain transparency in a blockchain project means: | A. The company publishes quarterly reports like a public stock<br>B. All transactions and smart contract activity are publicly verifiable on the blockchain by anyone<br>C. Only token holders can see financial data<br>D. Government regulators have access to all transaction records | B. All transactions and smart contract activity are publicly verifiable on the blockchain by anyone |

### Module 1: Money & Wealth Basics

- Slug: `money-and-wealth-basics` (proposed canonical slug; legacy has no module URL slug).
- Description/objective: Unlearn everything you were taught. No separate learning-objective field exists.
- Content source: `iron-vault-academy-unlocked.jsx`, `ORIGINAL_SIX_MODULES`.
- Lesson type: mixed structured reading blocks: heading, body, quote, list, callout, vault, and action as present per lesson.
- Duration: 45–60 min.
- XP: 500.
- Prerequisite: Valid entitlement; Module 0 is not required by legacy code.
- Access: Full Academy, matching single-module entitlement, or administrator.
- Assessment: all lessons marked complete in browser state, then ten-question quiz; pass threshold 8/10.
- Reward relevance: Yes. Completion may create legacy milestones/payout jobs and must be converted to manual review eligibility.
- Published state: rendered from a committed source literal; no database publication record exists.
- Current route: `/academy` with internal component state. Target module route: `/academy/modules/money-and-wealth-basics`.

| Lesson | Title | Blocks/types | Objective field | Access/prerequisite | Current route | Target route |
|---:|---|---|---|---|---|---|
| 1 | What Money Actually Is — And Who Controls It | 8; quote, heading, list, body, callout, vault, action | Not separately modeled; do not invent | Module access | `/academy` internal lesson view | `/academy/lessons/what-money-actually-is-and-who-controls-it` |
| 2 | Inflation — The Silent Tax on the Poor | 7; quote, heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 1 complete | `/academy` internal lesson view | `/academy/lessons/inflation-the-silent-tax-on-the-poor` |
| 3 | Budgeting — But Make It Real | 6; quote, heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 2 complete | `/academy` internal lesson view | `/academy/lessons/budgeting-but-make-it-real` |
| 4 | Assets vs Liabilities — The Real Divide | 6; quote, heading, list, body, vault, action | Not separately modeled; do not invent | Lesson 3 complete | `/academy` internal lesson view | `/academy/lessons/assets-vs-liabilities-the-real-divide` |
| 5 | Emergency Funds — Your First Defense | 6; heading, body, callout, list, vault, action | Not separately modeled; do not invent | Lesson 4 complete | `/academy` internal lesson view | `/academy/lessons/emergency-funds-your-first-defense` |
| 6 | Goals That Actually Change Your Life | 6; quote, heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 5 complete | `/academy` internal lesson view | `/academy/lessons/goals-that-actually-change-your-life` |

#### Assessment: Module 1

- Proposed target route: `/academy/assessments/money-and-wealth-basics-assessment`.
- Legacy answer-key exposure: every `correct` index is shipped to the browser.
- Canonical rule: options may reach the browser; correct answers must remain server-only. The API receives selected option IDs, scores authoritatively, stores the attempt and selected answers, and awards progression/XP once in one transaction.

| Q | Prompt | Options | Correct answer |
|---:|---|---|---|
| 1 | Money serves which three primary functions? | A. Entertainment, credit, debt<br>B. Medium of exchange, unit of account, store of value<br>C. Borrowing, investing, saving<br>D. Spending, taxes, budgeting | B. Medium of exchange, unit of account, store of value |
| 2 | The Federal Reserve is best described as: | A. A fully government-owned agency<br>B. A private banking institution that controls U.S. money supply<br>C. A department of the U.S. Treasury<br>D. An international bank based in Switzerland | B. A private banking institution that controls U.S. money supply |
| 3 | The Cantillon Effect describes: | A. How inflation affects everyone equally<br>B. How newly created money benefits those closest to its source first<br>C. Why gold is the best investment<br>D. How taxes are collected | B. How newly created money benefits those closest to its source first |
| 4 | Under the 50/30/20 method, 20% is commonly used for: | A. Luxury spending<br>B. Taxes only<br>C. Savings and debt reduction<br>D. Rent and utilities | C. Savings and debt reduction |
| 5 | The 'Buy, Borrow, Die' strategy allows the wealthy to: | A. Pay higher taxes than average citizens<br>B. Access wealth without taxable income events<br>C. Earn interest from savings accounts<br>D. Avoid estate planning entirely | B. Access wealth without taxable income events |
| 6 | Which is generally considered bad debt? | A. Low-interest loan for productive growth<br>B. Credit card debt at high interest<br>C. Mortgage with manageable payments<br>D. Business equipment with clear ROI | B. Credit card debt at high interest |
| 7 | A starter emergency fund target is often: | A. $50<br>B. $1,000<br>C. $25,000 minimum<br>D. No savings needed | B. $1,000 |
| 8 | The U.S. officially left the gold standard in: | A. 1913<br>B. 1945<br>C. 1971<br>D. 1999 | C. 1971 |
| 9 | A business owner vs a W-2 employee primarily differs in that: | A. Business owners earn more always<br>B. Business owners pay taxes after expenses; employees pay taxes before spending<br>C. W-2 employees get more deductions<br>D. There is no meaningful tax difference | B. Business owners pay taxes after expenses; employees pay taxes before spending |
| 10 | What is the primary advantage of a High-Yield Savings Account over a big bank savings account? | A. No FDIC insurance needed<br>B. Significantly higher interest rates with same safety<br>C. Only available to wealthy clients<br>D. Requires a minimum of $100,000 | B. Significantly higher interest rates with same safety |

### Module 2: How the Economy Actually Works

- Slug: `how-the-economy-actually-works` (proposed canonical slug; legacy has no module URL slug).
- Description/objective: The 10 concepts they never taught you in school. No separate learning-objective field exists.
- Content source: `iron-vault-academy-unlocked.jsx`, `ORIGINAL_SIX_MODULES`.
- Lesson type: mixed structured reading blocks: heading, body, quote, list, callout, vault, and action as present per lesson.
- Duration: 50–65 min.
- XP: 500.
- Prerequisite: Previous module 1 passed for full-Academy access; single-module access bypasses sequence.
- Access: Full Academy, matching single-module entitlement, or administrator.
- Assessment: all lessons marked complete in browser state, then ten-question quiz; pass threshold 8/10.
- Reward relevance: Yes. Completion may create legacy milestones/payout jobs and must be converted to manual review eligibility.
- Published state: rendered from a committed source literal; no database publication record exists.
- Current route: `/academy` with internal component state. Target module route: `/academy/modules/how-the-economy-actually-works`.

| Lesson | Title | Blocks/types | Objective field | Access/prerequisite | Current route | Target route |
|---:|---|---|---|---|---|---|
| 1 | The Velocity of Money | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Module access | `/academy` internal lesson view | `/academy/lessons/the-velocity-of-money` |
| 2 | Asymmetric Information | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 1 complete | `/academy` internal lesson view | `/academy/lessons/asymmetric-information` |
| 3 | Arbitrage | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 2 complete | `/academy` internal lesson view | `/academy/lessons/arbitrage` |
| 4 | Opportunity Cost | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 3 complete | `/academy` internal lesson view | `/academy/lessons/opportunity-cost` |
| 5 | Elasticity of Demand | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 4 complete | `/academy` internal lesson view | `/academy/lessons/elasticity-of-demand` |
| 6 | The Principal-Agent Problem | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 5 complete | `/academy` internal lesson view | `/academy/lessons/the-principal-agent-problem` |
| 7 | Animal Spirits | 6; quote, heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 6 complete | `/academy` internal lesson view | `/academy/lessons/animal-spirits` |
| 8 | Marginal Analysis | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 7 complete | `/academy` internal lesson view | `/academy/lessons/marginal-analysis` |
| 9 | The Accelerator Effect | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 8 complete | `/academy` internal lesson view | `/academy/lessons/the-accelerator-effect` |
| 10 | The Circular Flow of Money | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 9 complete | `/academy` internal lesson view | `/academy/lessons/the-circular-flow-of-money` |

#### Assessment: Module 2

- Proposed target route: `/academy/assessments/how-the-economy-actually-works-assessment`.
- Legacy answer-key exposure: every `correct` index is shipped to the browser.
- Canonical rule: options may reach the browser; correct answers must remain server-only. The API receives selected option IDs, scores authoritatively, stores the attempt and selected answers, and awards progression/XP once in one transaction.

| Q | Prompt | Options | Correct answer |
|---:|---|---|---|
| 1 | The velocity of money refers to: | A. How fast you can withdraw from a bank<br>B. How many times a dollar circulates through the economy<br>C. The speed of wire transfers<br>D. How quickly prices rise | B. How many times a dollar circulates through the economy |
| 2 | Asymmetric information means: | A. Both parties know the same amount<br>B. One party has more information and benefits from the gap<br>C. Information spreads equally in free markets<br>D. News travels faster online | B. One party has more information and benefits from the gap |
| 3 | Arbitrage is best described as: | A. Gambling on price movements<br>B. Exploiting price or information gaps between markets<br>C. Buying and holding long term<br>D. Diversifying across asset classes | B. Exploiting price or information gaps between markets |
| 4 | Opportunity cost is: | A. The fee charged for an investment<br>B. The tax on capital gains<br>C. The value of the next best alternative you gave up<br>D. The total cost of ownership | C. The value of the next best alternative you gave up |
| 5 | An inelastic product or service is one where: | A. Demand disappears when price rises<br>B. Demand holds steady even as price rises<br>C. Supply increases when price rises<br>D. Competition eliminates pricing power | B. Demand holds steady even as price rises |
| 6 | The principal-agent problem occurs when: | A. Two businesses compete for the same customer<br>B. The decision maker's incentives differ from those bearing the consequences<br>C. A government regulates a private company<br>D. An investor diversifies across asset classes | B. The decision maker's incentives differ from those bearing the consequences |
| 7 | Animal spirits in economics refers to: | A. Commodity markets for livestock<br>B. Human emotion and confidence driving market behavior<br>C. Algorithmic trading systems<br>D. Natural resource pricing | B. Human emotion and confidence driving market behavior |
| 8 | Marginal analysis focuses on: | A. The total cost of all past decisions<br>B. The average return across a portfolio<br>C. The cost and benefit of one additional unit<br>D. Historical performance trends | C. The cost and benefit of one additional unit |
| 9 | The accelerator effect describes: | A. How inflation compounds over time<br>B. How small demand increases trigger disproportionately large investment increases<br>C. How interest rates affect bond prices<br>D. How tax cuts stimulate consumer spending | B. How small demand increases trigger disproportionately large investment increases |
| 10 | The circular flow of money shows: | A. How cash is printed and distributed<br>B. How value moves between households, businesses, government, and banks<br>C. Why stock markets go up over time<br>D. How trade deficits are calculated | B. How value moves between households, businesses, government, and banks |

### Module 3: Traditional Finance Systems

- Slug: `traditional-finance-systems` (proposed canonical slug; legacy has no module URL slug).
- Description/objective: Know the game before you play it. No separate learning-objective field exists.
- Content source: `iron-vault-academy-unlocked.jsx`, `ORIGINAL_SIX_MODULES`.
- Lesson type: mixed structured reading blocks: heading, body, quote, list, callout, vault, and action as present per lesson.
- Duration: 50–65 min.
- XP: 500.
- Prerequisite: Previous module 2 passed for full-Academy access; single-module access bypasses sequence.
- Access: Full Academy, matching single-module entitlement, or administrator.
- Assessment: all lessons marked complete in browser state, then ten-question quiz; pass threshold 8/10.
- Reward relevance: Yes. Completion may create legacy milestones/payout jobs and must be converted to manual review eligibility.
- Published state: rendered from a committed source literal; no database publication record exists.
- Current route: `/academy` with internal component state. Target module route: `/academy/modules/traditional-finance-systems`.

| Lesson | Title | Blocks/types | Objective field | Access/prerequisite | Current route | Target route |
|---:|---|---|---|---|---|---|
| 1 | How Banks Really Work — Follow the Money | 6; quote, heading, body, callout, vault, action | Not separately modeled; do not invent | Module access | `/academy` internal lesson view | `/academy/lessons/how-banks-really-work-follow-the-money` |
| 2 | Stocks, Bonds & Index Funds — The Honest Truth | 6; quote, heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 1 complete | `/academy` internal lesson view | `/academy/lessons/stocks-bonds-and-index-funds-the-honest-truth` |
| 3 | Real Estate — The Wealth Machine They Can't Print More Of | 6; quote, heading, list, callout, vault, action | Not separately modeled; do not invent | Lesson 2 complete | `/academy` internal lesson view | `/academy/lessons/real-estate-the-wealth-machine-they-can-t-print-more-of` |
| 4 | Retirement Accounts — The Hidden Power Most People Ignore | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 3 complete | `/academy` internal lesson view | `/academy/lessons/retirement-accounts-the-hidden-power-most-people-ignore` |
| 5 | Credit — The Score That Controls Your Access to Capital | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 4 complete | `/academy` internal lesson view | `/academy/lessons/credit-the-score-that-controls-your-access-to-capital` |
| 6 | Comparing Wealth Paths — Employee vs Owner | 6; quote, heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 5 complete | `/academy` internal lesson view | `/academy/lessons/comparing-wealth-paths-employee-vs-owner` |

#### Assessment: Module 3

- Proposed target route: `/academy/assessments/traditional-finance-systems-assessment`.
- Legacy answer-key exposure: every `correct` index is shipped to the browser.
- Canonical rule: options may reach the browser; correct answers must remain server-only. The API receives selected option IDs, scores authoritatively, stores the attempt and selected answers, and awards progression/XP once in one transaction.

| Q | Prompt | Options | Correct answer |
|---:|---|---|---|
| 1 | Fractional reserve banking means: | A. Banks keep all deposits in a vault<br>B. Banks loan out multiples of their actual deposits<br>C. Banks only accept gold<br>D. Banks are fully government-owned | B. Banks loan out multiples of their actual deposits |
| 2 | A 1031 Exchange allows investors to: | A. Avoid all taxes permanently<br>B. Defer capital gains by reinvesting into another property<br>C. Sell stocks tax-free<br>D. Access retirement funds early | B. Defer capital gains by reinvesting into another property |
| 3 | An index fund is designed to: | A. Hold many investments in one fund<br>B. Guarantee profits every year<br>C. Replace all savings accounts<br>D. Eliminate market risk entirely | A. Hold many investments in one fund |
| 4 | The Roth IRA's main advantage is: | A. Tax-free growth and tax-free withdrawals in retirement<br>B. Immediate tax deduction on contributions<br>C. No contribution limits<br>D. Guaranteed returns | A. Tax-free growth and tax-free withdrawals in retirement |
| 5 | Business credit differs from personal credit in that: | A. It doesn't exist<br>B. It's a separate profile that doesn't require your SSN for all accounts<br>C. It always requires personal guarantees<br>D. It's only for corporations | B. It's a separate profile that doesn't require your SSN for all accounts |
| 6 | An S-Corp salary structure can reduce taxes by: | A. Eliminating income tax entirely<br>B. Allowing some profit to be taken as distributions not subject to self-employment tax<br>C. Hiding income from the IRS<br>D. Moving income offshore automatically | B. Allowing some profit to be taken as distributions not subject to self-employment tax |
| 7 | Which strategy can create large paper losses to offset real income in real estate? | A. Flipping houses<br>B. Cost segregation<br>C. Renting below market<br>D. Paying cash for properties | B. Cost segregation |
| 8 | The Backdoor Roth IRA is primarily used by: | A. People with no income<br>B. High-income earners who exceed direct Roth contribution limits<br>C. People under age 18<br>D. Foreign nationals only | B. High-income earners who exceed direct Roth contribution limits |
| 9 | A Solo 401(k) allows self-employed individuals to contribute: | A. Only $6,000 annually<br>B. As both employer and employee — up to $66,000+<br>C. Nothing until age 50<br>D. Only in gold | B. As both employer and employee — up to $66,000+ |
| 10 | The tax code primarily rewards: | A. High-income W-2 employees<br>B. Business ownership and investment income over labor income<br>C. People who save cash<br>D. Those who spend the most | B. Business ownership and investment income over labor income |

### Module 4: Introduction to Crypto & Blockchain

- Slug: `introduction-to-crypto-and-blockchain` (proposed canonical slug; legacy has no module URL slug).
- Description/objective: The technology they couldn't contain. No separate learning-objective field exists.
- Content source: `iron-vault-academy-unlocked.jsx`, `ORIGINAL_SIX_MODULES`.
- Lesson type: mixed structured reading blocks: heading, body, quote, list, callout, vault, and action as present per lesson.
- Duration: 55–70 min.
- XP: 500.
- Prerequisite: Previous module 3 passed for full-Academy access; single-module access bypasses sequence.
- Access: Full Academy, matching single-module entitlement, or administrator.
- Assessment: all lessons marked complete in browser state, then ten-question quiz; pass threshold 8/10.
- Reward relevance: Yes. Completion may create legacy milestones/payout jobs and must be converted to manual review eligibility.
- Published state: rendered from a committed source literal; no database publication record exists.
- Current route: `/academy` with internal component state. Target module route: `/academy/modules/introduction-to-crypto-and-blockchain`.

| Lesson | Title | Blocks/types | Objective field | Access/prerequisite | Current route | Target route |
|---:|---|---|---|---|---|---|
| 1 | What Problem Does Blockchain Actually Solve? | 6; quote, heading, body, callout, vault, action | Not separately modeled; do not invent | Module access | `/academy` internal lesson view | `/academy/lessons/what-problem-does-blockchain-actually-solve` |
| 2 | Bitcoin & Ethereum — Two Different Revolutions | 6; quote, heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 1 complete | `/academy` internal lesson view | `/academy/lessons/bitcoin-and-ethereum-two-different-revolutions` |
| 3 | Solana & Why Speed Matters for the New Economy | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 2 complete | `/academy` internal lesson view | `/academy/lessons/solana-and-why-speed-matters-for-the-new-economy` |
| 4 | Wallets, Private Keys & Self-Custody | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 3 complete | `/academy` internal lesson view | `/academy/lessons/wallets-private-keys-and-self-custody` |
| 5 | What a Token Actually Is — And How to Evaluate One | 5; heading, body, list, callout, action | Not separately modeled; do not invent | Lesson 4 complete | `/academy` internal lesson view | `/academy/lessons/what-a-token-actually-is-and-how-to-evaluate-one` |
| 6 | Risks Everyone Ignores — Including the Ones You Can't See | 6; quote, heading, list, callout, vault, action | Not separately modeled; do not invent | Lesson 5 complete | `/academy` internal lesson view | `/academy/lessons/risks-everyone-ignores-including-the-ones-you-can-t-see` |

#### Assessment: Module 4

- Proposed target route: `/academy/assessments/introduction-to-crypto-and-blockchain-assessment`.
- Legacy answer-key exposure: every `correct` index is shipped to the browser.
- Canonical rule: options may reach the browser; correct answers must remain server-only. The API receives selected option IDs, scores authoritatively, stores the attempt and selected answers, and awards progression/XP once in one transaction.

| Q | Prompt | Options | Correct answer |
|---:|---|---|---|
| 1 | Blockchain technology primarily attempts to solve: | A. Making all investments risk-free<br>B. The need to trust a central middleman for records and transfers<br>C. Eliminating taxes worldwide<br>D. Guaranteeing profits for users | B. The need to trust a central middleman for records and transfers |
| 2 | What happened to FTX customer funds in November 2022? | A. They doubled in value<br>B. Withdrawals were frozen and billions were lost<br>C. They were transferred to Bitcoin<br>D. The government reimbursed everyone | B. Withdrawals were frozen and billions were lost |
| 3 | 'Not your keys, not your coins' means: | A. You should change passwords frequently<br>B. Crypto on exchanges is not truly yours until in self-custody<br>C. Keys are required to open blockchain apps<br>D. Bitcoin requires a physical key | B. Crypto on exchanges is not truly yours until in self-custody |
| 4 | Solana was selected for Iron Vault Token primarily because: | A. It's the cheapest blockchain to use<br>B. It offers high speed and low fees suited for real-world asset distribution<br>C. It has the most users globally<br>D. It requires no regulation | B. It offers high speed and low fees suited for real-world asset distribution |
| 5 | Bitcoin's supply is fixed at: | A. 100 million coins<br>B. 21 million coins<br>C. 1 billion coins<br>D. It increases annually with inflation | B. 21 million coins |
| 6 | Puerto Rico Act 60 can reduce capital gains tax to: | A. 15%<br>B. 10%<br>C. 5%<br>D. 0% | D. 0% |
| 7 | A seed phrase should be: | A. Stored in a password manager app<br>B. Photographed and saved to the cloud<br>C. Engraved on steel and stored in multiple physical locations<br>D. Shared with a trusted exchange for recovery | C. Engraved on steel and stored in multiple physical locations |
| 8 | Which of the following is a common crypto risk many ignore? | A. Rug pulls and phishing scams<br>B. Guaranteed monthly returns<br>C. Government insurance on all wallets<br>D. Automatic fraud reversal | A. Rug pulls and phishing scams |
| 9 | The question that separates investment from speculation in tokens is: | A. Will the price go up?<br>B. Does any influencer promote it?<br>C. If price never moved, would this token still have value?<br>D. Is it listed on Coinbase? | C. If price never moved, would this token still have value? |
| 10 | A responsible beginner approach to crypto is: | A. Borrow money to invest quickly<br>B. Invest more than you can afford to lose<br>C. Learn first and use only risk capital if participating<br>D. Buy based only on hype | C. Learn first and use only risk capital if participating |

### Module 5: Digital Assets & Modern Wealth

- Slug: `digital-assets-and-modern-wealth` (proposed canonical slug; legacy has no module URL slug).
- Description/objective: The strategies they keep to themselves. No separate learning-objective field exists.
- Content source: `iron-vault-academy-unlocked.jsx`, `ORIGINAL_SIX_MODULES`.
- Lesson type: mixed structured reading blocks: heading, body, quote, list, callout, vault, and action as present per lesson.
- Duration: 50–65 min.
- XP: 500.
- Prerequisite: Previous module 4 passed for full-Academy access; single-module access bypasses sequence.
- Access: Full Academy, matching single-module entitlement, or administrator.
- Assessment: all lessons marked complete in browser state, then ten-question quiz; pass threshold 8/10.
- Reward relevance: Yes. Completion may create legacy milestones/payout jobs and must be converted to manual review eligibility.
- Published state: rendered from a committed source literal; no database publication record exists.
- Current route: `/academy` with internal component state. Target module route: `/academy/modules/digital-assets-and-modern-wealth`.

| Lesson | Title | Blocks/types | Objective field | Access/prerequisite | Current route | Target route |
|---:|---|---|---|---|---|---|
| 1 | Stablecoins & Real-World Asset Backing | 6; heading, body, list, callout, vault, action | Not separately modeled; do not invent | Module access | `/academy` internal lesson view | `/academy/lessons/stablecoins-and-real-world-asset-backing` |
| 2 | Revenue-Sharing Models & How to Evaluate Them | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 1 complete | `/academy` internal lesson view | `/academy/lessons/revenue-sharing-models-and-how-to-evaluate-them` |
| 3 | Token Utility vs Speculation — Know What You're Buying | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 2 complete | `/academy` internal lesson view | `/academy/lessons/token-utility-vs-speculation-know-what-you-re-buying` |
| 4 | The Infinite Banking Concept — How the Wealthy Use Life Insurance | 6; quote, heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 3 complete | `/academy` internal lesson view | `/academy/lessons/the-infinite-banking-concept-how-the-wealthy-use-life-insurance` |
| 5 | Tax Strategy — Legal Structures the Wealthy Actually Use | 6; quote, heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 4 complete | `/academy` internal lesson view | `/academy/lessons/tax-strategy-legal-structures-the-wealthy-actually-use` |
| 6 | Building a Sustainable Strategy — Process Over Prediction | 6; quote, heading, list, callout, vault, action | Not separately modeled; do not invent | Lesson 5 complete | `/academy` internal lesson view | `/academy/lessons/building-a-sustainable-strategy-process-over-prediction` |

#### Assessment: Module 5

- Proposed target route: `/academy/assessments/digital-assets-and-modern-wealth-assessment`.
- Legacy answer-key exposure: every `correct` index is shipped to the browser.
- Canonical rule: options may reach the browser; correct answers must remain server-only. The API receives selected option IDs, scores authoritatively, stores the attempt and selected answers, and awards progression/XP once in one transaction.

| Q | Prompt | Options | Correct answer |
|---:|---|---|---|
| 1 | A stablecoin is generally designed to: | A. Increase in price every month<br>B. Maintain a relatively stable value<br>C. Replace all stocks permanently<br>D. Eliminate taxes | B. Maintain a relatively stable value |
| 2 | The Infinite Banking Concept involves: | A. Hiding money in Swiss accounts<br>B. Using life insurance cash value as a personal borrowing facility<br>C. Investing only in index funds<br>D. Opening multiple checking accounts | B. Using life insurance cash value as a personal borrowing facility |
| 3 | An Irrevocable Life Insurance Trust (ILIT) primarily benefits heirs by: | A. Paying them monthly during your lifetime<br>B. Passing death benefits outside the taxable estate<br>C. Replacing a will<br>D. Providing government matching funds | B. Passing death benefits outside the taxable estate |
| 4 | The 'on-paper-broke' LLC strategy works because: | A. It hides income illegally<br>B. The LLC legitimately receives income and deducts business expenses, reducing personal taxable income<br>C. LLCs don't pay taxes ever<br>D. Only applies to corporations | B. The LLC legitimately receives income and deducts business expenses, reducing personal taxable income |
| 5 | Token utility means the token provides: | A. Guaranteed profits<br>B. Access or function within an ecosystem independent of price<br>C. Automatic government insurance<br>D. Free tax refunds | B. Access or function within an ecosystem independent of price |
| 6 | The Accredited Investor standard historically excludes regular people from: | A. Opening bank accounts<br>B. The most lucrative private investment opportunities<br>C. Buying public stocks<br>D. Filing taxes | B. The most lucrative private investment opportunities |
| 7 | Long-term capital gains are taxed compared to W-2 wages: | A. At identical rates<br>B. At significantly lower rates<br>C. At higher rates<br>D. They are not taxed at all | B. At significantly lower rates |
| 8 | Why is the Roth IRA powerful for wealth building? | A. Contributions are tax-deductible<br>B. Growth and qualifying withdrawals are completely tax-free<br>C. It has no contribution limits<br>D. It guarantees returns | B. Growth and qualifying withdrawals are completely tax-free |
| 9 | In the Buy, Borrow, Die strategy, borrowing against assets is advantageous because: | A. Loans carry zero interest<br>B. Loan proceeds are not taxable income<br>C. It eliminates estate taxes automatically<br>D. Banks are required to approve these loans | B. Loan proceeds are not taxable income |
| 10 | A sustainable crypto strategy primarily emphasizes: | A. Borrowing heavily and trading emotionally<br>B. Learning first, building structure, and using only risk capital<br>C. Buying every trending asset immediately<br>D. Relying on tips from social media | B. Learning first, building structure, and using only risk capital |

### Module 6: The Iron Vault System

- Slug: `the-iron-vault-system` (proposed canonical slug; legacy has no module URL slug).
- Description/objective: Why we built this. What comes next.. No separate learning-objective field exists.
- Content source: `iron-vault-academy-unlocked.jsx`, `ORIGINAL_SIX_MODULES`.
- Lesson type: mixed structured reading blocks: heading, body, quote, list, callout, vault, and action as present per lesson.
- Duration: 45–60 min.
- XP: 500.
- Prerequisite: Previous module 5 passed for full-Academy access; single-module access bypasses sequence.
- Access: Full Academy, matching single-module entitlement, or administrator.
- Assessment: all lessons marked complete in browser state, then ten-question quiz; pass threshold 8/10.
- Reward relevance: Yes. Completion may create legacy milestones/payout jobs and must be converted to manual review eligibility.
- Published state: rendered from a committed source literal; no database publication record exists.
- Current route: `/academy` with internal component state. Target module route: `/academy/modules/the-iron-vault-system`.

| Lesson | Title | Blocks/types | Objective field | Access/prerequisite | Current route | Target route |
|---:|---|---|---|---|---|---|
| 1 | The Iron Vault 3-Phase Vision | 9; quote, heading, body, callout, action | Not separately modeled; do not invent | Module access | `/academy` internal lesson view | `/academy/lessons/the-iron-vault-3-phase-vision` |
| 2 | How Real Assets Connect to Digital Systems | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 1 complete | `/academy` internal lesson view | `/academy/lessons/how-real-assets-connect-to-digital-systems` |
| 3 | Why Education-First Is Actually the Strategy | 6; quote, heading, body, callout, action | Not separately modeled; do not invent | Lesson 2 complete | `/academy` internal lesson view | `/academy/lessons/why-education-first-is-actually-the-strategy` |
| 4 | Risks, Disclosures & Eyes Wide Open | 5; heading, list, callout, body, action | Not separately modeled; do not invent | Lesson 3 complete | `/academy` internal lesson view | `/academy/lessons/risks-disclosures-and-eyes-wide-open` |
| 5 | What You Do After This Course | 5; heading, list, callout, vault, action | Not separately modeled; do not invent | Lesson 4 complete | `/academy` internal lesson view | `/academy/lessons/what-you-do-after-this-course` |
| 6 | Completion — What You Now Know That Most People Don't | 6; quote, heading, body, callout, action | Not separately modeled; do not invent | Lesson 5 complete | `/academy` internal lesson view | `/academy/lessons/completion-what-you-now-know-that-most-people-don-t` |

#### Assessment: Module 6

- Proposed target route: `/academy/assessments/the-iron-vault-system-assessment`.
- Legacy answer-key exposure: every `correct` index is shipped to the browser.
- Canonical rule: options may reach the browser; correct answers must remain server-only. The API receives selected option IDs, scores authoritatively, stores the attempt and selected answers, and awards progression/XP once in one transaction.

| Q | Prompt | Options | Correct answer |
|---:|---|---|---|
| 1 | Iron Vault's Phase 1 focuses on: | A. Immediate token launch and sales<br>B. Community building and education before scale<br>C. Eliminating all financial intermediaries<br>D. Guaranteed monthly distributions | B. Community building and education before scale |
| 2 | Iron Vault's smart contracts are built on: | A. Ethereum<br>B. Bitcoin<br>C. Solana<br>D. Cardano | C. Solana |
| 3 | Real-world asset tokenization can improve: | A. Only marketing optics<br>B. Transparency, distribution speed, and accessibility<br>C. Nothing that traditional finance can't already do<br>D. Government tax collection | B. Transparency, distribution speed, and accessibility |
| 4 | An education-first model benefits the community by: | A. Guaranteeing profits for early participants<br>B. Creating panic-resistant, informed participants less susceptible to manipulation<br>C. Replacing all legal disclosures<br>D. Removing all investment risk | B. Creating panic-resistant, informed participants less susceptible to manipulation |
| 5 | Which of the following is a real risk Iron Vault discloses? | A. Execution delays and regulatory changes<br>B. Guaranteed upside only<br>C. Automatic liquidity always available<br>D. No downside exists | A. Execution delays and regulatory changes |
| 6 | The first structural financial move most people skip is: | A. Buying Bitcoin immediately<br>B. Forming an LLC and opening a business checking account<br>C. Moving to Puerto Rico<br>D. Buying a rental property | B. Forming an LLC and opening a business checking account |
| 7 | Financial literacy is best viewed as: | A. A one-time certificate to earn<br>B. An ongoing, lifelong strategic advantage<br>C. Something only relevant if you're wealthy<br>D. Unrelated to everyday decisions | B. An ongoing, lifelong strategic advantage |
| 8 | Smart contract distributions are advantageous because: | A. They require bank approval to process<br>B. They execute automatically, proportionally, and publicly on-chain<br>C. They are only accessible to accredited investors<br>D. They eliminate all tax obligations | B. They execute automatically, proportionally, and publicly on-chain |
| 9 | There are guarantees of returns, success, or appreciation in Iron Vault: | A. Yes, as stated in the smart contract<br>B. Only for founding members<br>C. No — participation involves real risk<br>D. Yes, backed by government insurance | C. No — participation involves real risk |
| 10 | The appropriate mindset after completing this course is: | A. Rush into all available investment opportunities immediately<br>B. Share nothing — information is power to keep private<br>C. Apply knowledge deliberately, structurally, and with full awareness of risk<br>D. Wait until the market is perfect before acting | C. Apply knowledge deliberately, structurally, and with full awareness of risk |

### Module 7: The Debt Economy

- Slug: `the-debt-economy` (proposed canonical slug; legacy has no module URL slug).
- Description/objective: How debt became the product — and how to make it work for you instead. No separate learning-objective field exists.
- Content source: `iron-vault-academy-unlocked.jsx`, `NEW_SIX_MODULES`.
- Lesson type: mixed structured reading blocks: heading, body, quote, list, callout, vault, and action as present per lesson.
- Duration: 50–65 min.
- XP: 500.
- Prerequisite: Previous module 6 passed.
- Access: Full Academy or administrator.
- Assessment: all lessons marked complete in browser state, then ten-question quiz; pass threshold 8/10.
- Reward relevance: No automatic reward relevance.
- Published state: rendered from a committed source literal; no database publication record exists.
- Current route: `/academy` with internal component state. Target module route: `/academy/modules/the-debt-economy`.

| Lesson | Title | Blocks/types | Objective field | Access/prerequisite | Current route | Target route |
|---:|---|---|---|---|---|---|
| 1 | Debt Is Not an Accident. It's the Business Model. | 6; quote, heading, body, callout, vault, action | Not separately modeled; do not invent | Module access | `/academy` internal lesson view | `/academy/lessons/debt-is-not-an-accident-it-s-the-business-model` |
| 2 | Good Debt vs. Bad Debt: The Distinction That Changes Everything | 6; quote, heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 1 complete | `/academy` internal lesson view | `/academy/lessons/good-debt-vs-bad-debt-the-distinction-that-changes-everything` |
| 3 | Student Loans: The $1.7 Trillion Experiment on the Middle Class | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 2 complete | `/academy` internal lesson view | `/academy/lessons/student-loans-the-1-7-trillion-experiment-on-the-middle-class` |
| 4 | Medical Debt: The Uniquely American Trap | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 3 complete | `/academy` internal lesson view | `/academy/lessons/medical-debt-the-uniquely-american-trap` |
| 5 | Using Debt as a Tool: The Wealthy Playbook | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 4 complete | `/academy` internal lesson view | `/academy/lessons/using-debt-as-a-tool-the-wealthy-playbook` |
| 6 | Building Credit as Infrastructure, Not as a Score | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 5 complete | `/academy` internal lesson view | `/academy/lessons/building-credit-as-infrastructure-not-as-a-score` |

#### Assessment: Module 7

- Proposed target route: `/academy/assessments/the-debt-economy-assessment`.
- Legacy answer-key exposure: every `correct` index is shipped to the browser.
- Canonical rule: options may reach the browser; correct answers must remain server-only. The API receives selected option IDs, scores authoritatively, stores the attempt and selected answers, and awards progression/XP once in one transaction.

| Q | Prompt | Options | Correct answer |
|---:|---|---|---|
| 1 | The primary business model of credit card companies is: | A. Providing payment convenience<br>B. Collecting interest over long repayment periods<br>C. Offering rewards to loyal customers<br>D. Competing with banks on savings rates | B. Collecting interest over long repayment periods |
| 2 | "Good debt" is best defined as: | A. Any debt with low interest<br>B. Debt that finances consumption under $1,000<br>C. Debt that finances assets producing more return than the cost of borrowing<br>D. Debt you can discharge in bankruptcy | C. Debt that finances assets producing more return than the cost of borrowing |
| 3 | Student loans are unique among most U.S. debt because: | A. They carry the highest interest rates<br>B. They cannot be discharged in bankruptcy in most cases<br>C. They are always forgiven after 10 years<br>D. They are only issued by the government | B. They cannot be discharged in bankruptcy in most cases |
| 4 | The Cantillon-adjacent concept here is that minimum credit card payments are set low to: | A. Help struggling borrowers stay current<br>B. Maximize long-term interest collection<br>C. Comply with federal consumer protection laws<br>D. Reduce default rates across the portfolio | B. Maximize long-term interest collection |
| 5 | Medical debt in the U.S. is negotiable because: | A. Federal law requires a 50% discount for all uninsured patients<br>B. Hospitals routinely accept less than full balance rather than write it off entirely<br>C. The ACA eliminated all medical debt<br>D. Credit bureaus never report medical debt | B. Hospitals routinely accept less than full balance rather than write it off entirely |
| 6 | Leverage in wealth-building means: | A. Taking on as much debt as possible<br>B. Using borrowed capital to control assets larger than your own capital base<br>C. Using other people's labor to generate income<br>D. Avoiding all debt until you're wealthy | B. Using borrowed capital to control assets larger than your own capital base |
| 7 | The debt payoff method that is mathematically optimal is: | A. Snowball — smallest balance first<br>B. Random — whichever feels right<br>C. Avalanche — highest interest rate first<br>D. Minimum payments across all accounts | C. Avalanche — highest interest rate first |
| 8 | Public Service Loan Forgiveness (PSLF) forgives federal student loans after: | A. 25 years of any payments<br>B. 10 years of payments while working for qualifying employers<br>C. Completing a financial literacy course<br>D. Filing for bankruptcy | B. 10 years of payments while working for qualifying employers |
| 9 | The authorized user credit strategy works because: | A. It gives you access to the primary cardholder's spending limit<br>B. The primary account's history and utilization appear on your credit report<br>C. It automatically removes negative items from your report<br>D. It is a government-mandated credit repair program | B. The primary account's history and utilization appear on your credit report |
| 10 | The zero-interest arbitrage strategy involves: | A. Investing in zero-coupon bonds<br>B. Placing 0% APR promotional credit card funds into yield-bearing accounts during the intro period<br>C. Paying off all debt before investing anything<br>D. Transferring balances between family members | B. Placing 0% APR promotional credit card funds into yield-bearing accounts during the intro period |

### Module 8: How Wealth Is Actually Transferred

- Slug: `how-wealth-is-actually-transferred` (proposed canonical slug; legacy has no module URL slug).
- Description/objective: The generational playbook they've been running for centuries. No separate learning-objective field exists.
- Content source: `iron-vault-academy-unlocked.jsx`, `NEW_SIX_MODULES`.
- Lesson type: mixed structured reading blocks: heading, body, quote, list, callout, vault, and action as present per lesson.
- Duration: 55–70 min.
- XP: 500.
- Prerequisite: Previous module 7 passed.
- Access: Full Academy or administrator.
- Assessment: all lessons marked complete in browser state, then ten-question quiz; pass threshold 8/10.
- Reward relevance: No automatic reward relevance.
- Published state: rendered from a committed source literal; no database publication record exists.
- Current route: `/academy` with internal component state. Target module route: `/academy/modules/how-wealth-is-actually-transferred`.

| Lesson | Title | Blocks/types | Objective field | Access/prerequisite | Current route | Target route |
|---:|---|---|---|---|---|---|
| 1 | Why the Wealthy Don't Die Rich — They Transfer Rich | 6; quote, heading, body, callout, vault, action | Not separately modeled; do not invent | Module access | `/academy` internal lesson view | `/academy/lessons/why-the-wealthy-don-t-die-rich-they-transfer-rich` |
| 2 | Trusts: The Wealth Protection Vehicle Most People Never Use | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 1 complete | `/academy` internal lesson view | `/academy/lessons/trusts-the-wealth-protection-vehicle-most-people-never-use` |
| 3 | Family Limited Partnerships and LLCs: Controlling Assets You Don't Own | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 2 complete | `/academy` internal lesson view | `/academy/lessons/family-limited-partnerships-and-llcs-controlling-assets-you-don-t-own` |
| 4 | Life Insurance as a Wealth Transfer Vehicle | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 3 complete | `/academy` internal lesson view | `/academy/lessons/life-insurance-as-a-wealth-transfer-vehicle` |
| 5 | Charitable Giving as a Wealth Strategy (Not Just Altruism) | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 4 complete | `/academy` internal lesson view | `/academy/lessons/charitable-giving-as-a-wealth-strategy-not-just-altruism` |
| 6 | Building Your Own Legacy Architecture | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 5 complete | `/academy` internal lesson view | `/academy/lessons/building-your-own-legacy-architecture` |

#### Assessment: Module 8

- Proposed target route: `/academy/assessments/how-wealth-is-actually-transferred-assessment`.
- Legacy answer-key exposure: every `correct` index is shipped to the browser.
- Canonical rule: options may reach the browser; correct answers must remain server-only. The API receives selected option IDs, scores authoritatively, stores the attempt and selected answers, and awards progression/XP once in one transaction.

| Q | Prompt | Options | Correct answer |
|---:|---|---|---|
| 1 | Dynasty trusts are most effective at: | A. Providing income to the grantor during retirement<br>B. Passing assets across multiple generations outside the estate tax system<br>C. Reducing income taxes on W-2 earnings<br>D. Replacing a standard will | B. Passing assets across multiple generations outside the estate tax system |
| 2 | The annual gift tax exclusion allows each person to gift up to (2024): | A. $5,000 per recipient<br>B. $10,000 per recipient<br>C. $18,000 per recipient<br>D. $50,000 per recipient | C. $18,000 per recipient |
| 3 | Probate is problematic because: | A. It distributes assets too quickly<br>B. It is public, expensive, and can take 1–2 years<br>C. It only applies to estates over $1 million<br>D. It requires a jury trial | B. It is public, expensive, and can take 1–2 years |
| 4 | A valuation discount in a Family Limited Partnership works because: | A. The IRS allows all family transfers to be discounted<br>B. Limited partner interests carry no control rights and are legitimately valued below the underlying asset value<br>C. Family members are exempt from gift tax rules<br>D. The IRS does not audit family partnerships | B. Limited partner interests carry no control rights and are legitimately valued below the underlying asset value |
| 5 | A life insurance death benefit held in an ILIT: | A. Is subject to income tax at the highest rate<br>B. Passes income tax free and outside the taxable estate<br>C. Must be distributed within 10 years<br>D. Reduces Social Security benefits for heirs | B. Passes income tax free and outside the taxable estate |
| 6 | A Donor-Advised Fund allows you to: | A. Take a charitable deduction in a future tax year<br>B. Take an immediate deduction and distribute to charities over time<br>C. Avoid all income taxes permanently<br>D. Pass assets to heirs without estate tax | B. Take an immediate deduction and distribute to charities over time |
| 7 | The SECURE Act primarily affected estate planning by: | A. Increasing the estate tax exemption<br>B. Eliminating most stretch IRA distributions, forcing withdrawals within 10 years<br>C. Reducing capital gains tax rates for inherited assets<br>D. Requiring all trusts to register federally | B. Eliminating most stretch IRA distributions, forcing withdrawals within 10 years |
| 8 | Your beneficiary designations on retirement accounts and insurance: | A. Can be overridden by your will if they conflict<br>B. Are secondary to what your will states<br>C. Override your will regardless of what it says<br>D. Expire after 10 years automatically | C. Override your will regardless of what it says |
| 9 | A Charitable Remainder Trust is primarily useful for: | A. People with no assets who want to give to charity<br>B. Selling appreciated assets while deferring and minimizing capital gains tax<br>C. Replacing Social Security income<br>D. Funding a child's education | B. Selling appreciated assets while deferring and minimizing capital gains tax |
| 10 | The correct order to build legacy architecture is: | A. Dynasty trust first, then will<br>B. Wait until you have $1M, then start<br>C. Will and beneficiary designations first, then trust, then advanced structures as wealth grows<br>D. Life insurance first and nothing else | C. Will and beneficiary designations first, then trust, then advanced structures as wealth grows |

### Module 9: DeFi & The Parallel Financial System

- Slug: `defi-and-the-parallel-financial-system` (proposed canonical slug; legacy has no module URL slug).
- Description/objective: A financial system was built without permission. Here's how it works.. No separate learning-objective field exists.
- Content source: `iron-vault-academy-unlocked.jsx`, `NEW_SIX_MODULES`.
- Lesson type: mixed structured reading blocks: heading, body, quote, list, callout, vault, and action as present per lesson.
- Duration: 55–70 min.
- XP: 500.
- Prerequisite: Previous module 8 passed.
- Access: Full Academy or administrator.
- Assessment: all lessons marked complete in browser state, then ten-question quiz; pass threshold 8/10.
- Reward relevance: No automatic reward relevance.
- Published state: rendered from a committed source literal; no database publication record exists.
- Current route: `/academy` with internal component state. Target module route: `/academy/modules/defi-and-the-parallel-financial-system`.

| Lesson | Title | Blocks/types | Objective field | Access/prerequisite | Current route | Target route |
|---:|---|---|---|---|---|---|
| 1 | What DeFi Actually Is (And Why Banks Hate It) | 6; quote, heading, body, callout, vault, action | Not separately modeled; do not invent | Module access | `/academy` internal lesson view | `/academy/lessons/what-defi-actually-is-and-why-banks-hate-it` |
| 2 | Decentralized Exchanges (DEXs): Trading Without a Middleman | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 1 complete | `/academy` internal lesson view | `/academy/lessons/decentralized-exchanges-dexs-trading-without-a-middleman` |
| 3 | DeFi Lending and Borrowing: Collateralized Loans Without Banks | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 2 complete | `/academy` internal lesson view | `/academy/lessons/defi-lending-and-borrowing-collateralized-loans-without-banks` |
| 4 | Yield Farming and Liquidity Mining: Earning on Your Assets | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 3 complete | `/academy` internal lesson view | `/academy/lessons/yield-farming-and-liquidity-mining-earning-on-your-assets` |
| 5 | DeFi Risks: What Can Actually Go Wrong | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 4 complete | `/academy` internal lesson view | `/academy/lessons/defi-risks-what-can-actually-go-wrong` |
| 6 | DeFi on Solana: Speed, Cost, and the Iron Vault Connection | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 5 complete | `/academy` internal lesson view | `/academy/lessons/defi-on-solana-speed-cost-and-the-iron-vault-connection` |

#### Assessment: Module 9

- Proposed target route: `/academy/assessments/defi-and-the-parallel-financial-system-assessment`.
- Legacy answer-key exposure: every `correct` index is shipped to the browser.
- Canonical rule: options may reach the browser; correct answers must remain server-only. The API receives selected option IDs, scores authoritatively, stores the attempt and selected answers, and awards progression/XP once in one transaction.

| Q | Prompt | Options | Correct answer |
|---:|---|---|---|
| 1 | DeFi differs from traditional finance primarily because: | A. It is regulated by the SEC<br>B. It operates through automated smart contracts without centralized intermediaries<br>C. It is only available to accredited investors<br>D. It requires a bank account to access | B. It operates through automated smart contracts without centralized intermediaries |
| 2 | Total Value Locked (TVL) in DeFi grew from ~$1B to ~$180B in approximately: | A. 10 years<br>B. 1 year<br>C. 5 years<br>D. 6 months | B. 1 year |
| 3 | A decentralized exchange (DEX) differs from a centralized exchange because: | A. DEXs require more KYC documentation<br>B. Assets never leave your custody and trades execute via smart contracts<br>C. DEXs only support Bitcoin and Ethereum<br>D. DEXs have lower trading volumes | B. Assets never leave your custody and trades execute via smart contracts |
| 4 | Impermanent loss in liquidity provision occurs when: | A. Gas fees exceed trading profits<br>B. The price ratio of pooled tokens changes significantly, reducing total value vs simply holding<br>C. The protocol is hacked<br>D. You withdraw liquidity before 30 days | B. The price ratio of pooled tokens changes significantly, reducing total value vs simply holding |
| 5 | DeFi lending protocols are overcollateralized because: | A. Regulators require it<br>B. There is no credit check system, so collateral must exceed loan value to eliminate credit risk<br>C. It maximizes yield for borrowers<br>D. It is required by the Ethereum protocol | B. There is no credit check system, so collateral must exceed loan value to eliminate credit risk |
| 6 | "Real yield" in DeFi refers to: | A. Any yield above 10% APY<br>B. Yields paid in Bitcoin only<br>C. Yields backed by actual protocol revenue from real economic activity<br>D. Yields guaranteed by a smart contract audit | C. Yields backed by actual protocol revenue from real economic activity |
| 7 | The largest category of DeFi loss has come from: | A. Inflation of protocol tokens<br>B. Smart contract exploits and hacks<br>C. Government seizures<br>D. User error in sending funds | B. Smart contract exploits and hacks |
| 8 | Liquid staking advantages over standard staking include: | A. Higher guaranteed returns<br>B. Government insurance on staked assets<br>C. Maintaining liquidity through a tradeable token while still earning staking rewards<br>D. Shorter lock-up periods only | C. Maintaining liquidity through a tradeable token while still earning staking rewards |
| 9 | Solana's primary advantage for DeFi participation compared to Ethereum is: | A. Larger total value locked<br>B. Older, more battle-tested smart contracts<br>C. Higher throughput and lower fees making small transactions economically viable<br>D. Better regulatory clarity | C. Higher throughput and lower fees making small transactions economically viable |
| 10 | Before depositing into a DeFi protocol, a responsible first check is: | A. Whether any celebrities promote it<br>B. The current APY only<br>C. Security audits, protocol age, TVL history, and team identity<br>D. Whether it is listed on Coinbase | C. Security audits, protocol age, TVL history, and team identity |

### Module 10: Tokenized Real World Assets & the Ownership Revolution

- Slug: `tokenized-real-world-assets-and-the-ownership-revolution` (proposed canonical slug; legacy has no module URL slug).
- Description/objective: When physical assets meet programmable money — and why it changes everything. No separate learning-objective field exists.
- Content source: `iron-vault-academy-unlocked.jsx`, `NEW_SIX_MODULES`.
- Lesson type: mixed structured reading blocks: heading, body, quote, list, callout, vault, and action as present per lesson.
- Duration: 55–70 min.
- XP: 500.
- Prerequisite: Previous module 9 passed.
- Access: Full Academy or administrator.
- Assessment: all lessons marked complete in browser state, then ten-question quiz; pass threshold 8/10.
- Reward relevance: No automatic reward relevance.
- Published state: rendered from a committed source literal; no database publication record exists.
- Current route: `/academy` with internal component state. Target module route: `/academy/modules/tokenized-real-world-assets-and-the-ownership-revolution`.

| Lesson | Title | Blocks/types | Objective field | Access/prerequisite | Current route | Target route |
|---:|---|---|---|---|---|---|
| 1 | What Real World Asset Tokenization Actually Means | 6; quote, heading, body, callout, vault, action | Not separately modeled; do not invent | Module access | `/academy` internal lesson view | `/academy/lessons/what-real-world-asset-tokenization-actually-means` |
| 2 | Tokenized Real Estate: Fractional Ownership Without Barriers | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 1 complete | `/academy` internal lesson view | `/academy/lessons/tokenized-real-estate-fractional-ownership-without-barriers` |
| 3 | Tokenized Bonds and Private Credit: Institutional Yield Goes Retail | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 2 complete | `/academy` internal lesson view | `/academy/lessons/tokenized-bonds-and-private-credit-institutional-yield-goes-retail` |
| 4 | The Regulatory Landscape for RWAs | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 3 complete | `/academy` internal lesson view | `/academy/lessons/the-regulatory-landscape-for-rwas` |
| 5 | Iron Vault's Position in the RWA Ecosystem | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 4 complete | `/academy` internal lesson view | `/academy/lessons/iron-vault-s-position-in-the-rwa-ecosystem` |
| 6 | Where RWA Tokenization Goes Next | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 5 complete | `/academy` internal lesson view | `/academy/lessons/where-rwa-tokenization-goes-next` |

#### Assessment: Module 10

- Proposed target route: `/academy/assessments/tokenized-real-world-assets-and-the-ownership-revolution-assessment`.
- Legacy answer-key exposure: every `correct` index is shipped to the browser.
- Canonical rule: options may reach the browser; correct answers must remain server-only. The API receives selected option IDs, scores authoritatively, stores the attempt and selected answers, and awards progression/XP once in one transaction.

| Q | Prompt | Options | Correct answer |
|---:|---|---|---|
| 1 | Real World Asset tokenization primarily means: | A. Creating fictional digital currencies backed by nothing<br>B. Representing ownership or economic rights in physical or financial assets on a blockchain<br>C. Converting cryptocurrency into government bonds<br>D. Registering assets with the SEC | B. Representing ownership or economic rights in physical or financial assets on a blockchain |
| 2 | BlackRock's entry into tokenized assets signals: | A. That tokenization is primarily a retail phenomenon<br>B. That institutions are rebuilding their core financial infrastructure on blockchain rails<br>C. That crypto assets are now government-insured<br>D. That tokenization is illegal for retail investors | B. That institutions are rebuilding their core financial infrastructure on blockchain rails |
| 3 | The primary barrier tokenized real estate removes is: | A. Property taxes<br>B. The need for property management<br>C. High minimum investment requirements and illiquidity<br>D. Mortgage requirements | C. High minimum investment requirements and illiquidity |
| 4 | Tokenized U.S. Treasury products are most comparable to: | A. Speculative DeFi yield farming<br>B. A high-yield savings account backed by government debt<br>C. Equity investments in Treasury companies<br>D. Physical gold holdings | B. A high-yield savings account backed by government debt |
| 5 | The most important due diligence item for any RWA project is: | A. The team's social media following<br>B. The current APY offered<br>C. The legal structure connecting the token to the underlying asset<br>D. Whether a celebrity has endorsed it | C. The legal structure connecting the token to the underlying asset |
| 6 | Impermanent loss in RWA tokens differs from DeFi yield farming because: | A. RWA tokens are backed by real assets that provide independent value<br>B. RWA tokens can never lose value<br>C. RWA tokens are government insured<br>D. There is no difference | A. RWA tokens are backed by real assets that provide independent value |
| 7 | Regulation D in the U.S. restricts many RWA offerings to: | A. Institutional investors only<br>B. Non-U.S. persons only<br>C. Accredited investors<br>D. Investors with wallets older than one year | C. Accredited investors |
| 8 | Iron Vault's education-first model addresses which RWA project failure mode: | A. Insufficient token supply<br>B. Community panic-selling due to not understanding what they own<br>C. Regulatory approval delays<br>D. Smart contract speed limitations | B. Community panic-selling due to not understanding what they own |
| 9 | The "liquidity premium" in tokenized real estate refers to: | A. Higher rents charged on tokenized properties<br>B. The potential for tokenized assets to trade at a premium due to added exit liquidity<br>C. Transaction fees charged by the tokenization platform<br>D. The cost of converting tokens back to cash | B. The potential for tokenized assets to trade at a premium due to added exit liquidity |
| 10 | RWA tokenization is currently in which phase of adoption: | A. Full mass adoption<br>B. Exclusively retail<br>C. Primarily institutional infrastructure-building with retail access beginning to emerge<br>D. Already replaced traditional finance entirely | C. Primarily institutional infrastructure-building with retail access beginning to emerge |

### Module 11: Building Income That Doesn't Require You

- Slug: `building-income-that-doesn-t-require-you` (proposed canonical slug; legacy has no module URL slug).
- Description/objective: The difference between a job, a business, and an asset. No separate learning-objective field exists.
- Content source: `iron-vault-academy-unlocked.jsx`, `NEW_SIX_MODULES`.
- Lesson type: mixed structured reading blocks: heading, body, quote, list, callout, vault, and action as present per lesson.
- Duration: 55–70 min.
- XP: 500.
- Prerequisite: Previous module 10 passed.
- Access: Full Academy or administrator.
- Assessment: all lessons marked complete in browser state, then ten-question quiz; pass threshold 8/10.
- Reward relevance: No automatic reward relevance.
- Published state: rendered from a committed source literal; no database publication record exists.
- Current route: `/academy` with internal component state. Target module route: `/academy/modules/building-income-that-doesn-t-require-you`.

| Lesson | Title | Blocks/types | Objective field | Access/prerequisite | Current route | Target route |
|---:|---|---|---|---|---|---|
| 1 | The Three Income Models (And Why Only One Scales) | 6; quote, heading, body, callout, vault, action | Not separately modeled; do not invent | Module access | `/academy` internal lesson view | `/academy/lessons/the-three-income-models-and-why-only-one-scales` |
| 2 | Digital Products: The Highest Margin Asset Class on Earth | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 1 complete | `/academy` internal lesson view | `/academy/lessons/digital-products-the-highest-margin-asset-class-on-earth` |
| 3 | Licensing and Royalties: Getting Paid for What You've Already Created | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 2 complete | `/academy` internal lesson view | `/academy/lessons/licensing-and-royalties-getting-paid-for-what-you-ve-already-created` |
| 4 | Rental Income: The Oldest Passive Income Model in Human History | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 3 complete | `/academy` internal lesson view | `/academy/lessons/rental-income-the-oldest-passive-income-model-in-human-history` |
| 5 | Building Systems That Run Without You | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 4 complete | `/academy` internal lesson view | `/academy/lessons/building-systems-that-run-without-you` |
| 6 | Stacking Income Streams: The Architecture of Financial Resilience | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 5 complete | `/academy` internal lesson view | `/academy/lessons/stacking-income-streams-the-architecture-of-financial-resilience` |

#### Assessment: Module 11

- Proposed target route: `/academy/assessments/building-income-that-doesn-t-require-you-assessment`.
- Legacy answer-key exposure: every `correct` index is shipped to the browser.
- Canonical rule: options may reach the browser; correct answers must remain server-only. The API receives selected option IDs, scores authoritatively, stores the attempt and selected answers, and awards progression/XP once in one transaction.

| Q | Prompt | Options | Correct answer |
|---:|---|---|---|
| 1 | Passive income is defined as: | A. Income from part-time work<br>B. Income that generates independent of your ongoing time through assets or systems<br>C. Any income under $50,000/year<br>D. Income received monthly rather than weekly | B. Income that generates independent of your ongoing time through assets or systems |
| 2 | The highest margin digital products are so valuable because: | A. They can be sold at unlimited prices<br>B. The marginal cost of each additional sale is approximately zero<br>C. They are tax-exempt<br>D. They qualify for government subsidies | B. The marginal cost of each additional sale is approximately zero |
| 3 | A royalty is best described as: | A. A one-time payment for creative work<br>B. Ongoing payment for the use of intellectual property you own<br>C. A tax on high earners<br>D. Revenue shared with investors | B. Ongoing payment for the use of intellectual property you own |
| 4 | House hacking refers to: | A. Purchasing foreclosed properties below market<br>B. Buying a multi-unit property, living in one unit, and renting the others<br>C. Renovating homes and flipping them quickly<br>D. Hacking into property management systems | B. Buying a multi-unit property, living in one unit, and renting the others |
| 5 | The E-Myth's core distinction is between: | A. Employees and freelancers<br>B. Working in a business vs. building a system that runs the business<br>C. Profitable and unprofitable businesses<br>D. Online and offline business models | B. Working in a business vs. building a system that runs the business |
| 6 | Short-term rental arbitrage requires: | A. Property ownership<br>B. A real estate license<br>C. Signing long-term leases and subletting at short-term rental rates with appropriate permissions<br>D. At least $100,000 in capital | C. Signing long-term leases and subletting at short-term rental rates with appropriate permissions |
| 7 | IRS passive activity rules mean: | A. Passive losses can be deducted against any income<br>B. Passive income is always tax-free<br>C. Passive losses generally can only offset passive income<br>D. Rental income is exempt from taxation | C. Passive losses generally can only offset passive income |
| 8 | Documented SOPs increase business value because: | A. They satisfy government compliance requirements<br>B. They demonstrate the business can operate without the founder, increasing buyer certainty<br>C. They reduce payroll costs automatically<br>D. They are required for LLC formation | B. They demonstrate the business can operate without the founder, increasing buyer certainty |
| 9 | The "1000 True Fans" concept suggests: | A. You need millions of followers to generate significant income<br>B. 1,000 deeply engaged customers spending meaningfully can generate sustainable creator income<br>C. Social media following directly determines income<br>D. You need a traditional publisher to monetize content | B. 1,000 deeply engaged customers spending meaningfully can generate sustainable creator income |
| 10 | The correct sequence for building income streams generally starts with: | A. Buying rental property immediately<br>B. Launching a digital product first<br>C. Building emergency reserves and eliminating bad debt before deploying capital<br>D. Investing in crypto before anything else | C. Building emergency reserves and eliminating bad debt before deploying capital |

### Module 12: The Exit Strategy

- Slug: `the-exit-strategy` (proposed canonical slug; legacy has no module URL slug).
- Description/objective: How the ultra-wealthy reduce, relocate, and restructure their tax obligations entirely. No separate learning-objective field exists.
- Content source: `iron-vault-academy-unlocked.jsx`, `NEW_SIX_MODULES`.
- Lesson type: mixed structured reading blocks: heading, body, quote, list, callout, vault, and action as present per lesson.
- Duration: 60–75 min.
- XP: 500.
- Prerequisite: Previous module 11 passed.
- Access: Full Academy or administrator.
- Assessment: all lessons marked complete in browser state, then ten-question quiz; pass threshold 8/10.
- Reward relevance: No automatic reward relevance.
- Published state: rendered from a committed source literal; no database publication record exists.
- Current route: `/academy` with internal component state. Target module route: `/academy/modules/the-exit-strategy`.

| Lesson | Title | Blocks/types | Objective field | Access/prerequisite | Current route | Target route |
|---:|---|---|---|---|---|---|
| 1 | Flag Theory: Why the Ultra-Wealthy Are Citizens of the World | 6; quote, heading, body, callout, vault, action | Not separately modeled; do not invent | Module access | `/academy` internal lesson view | `/academy/lessons/flag-theory-why-the-ultra-wealthy-are-citizens-of-the-world` |
| 2 | Puerto Rico Act 60: The Most Powerful Tax Incentive Available to U.S. Citizens | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 1 complete | `/academy` internal lesson view | `/academy/lessons/puerto-rico-act-60-the-most-powerful-tax-incentive-available-to-u-s-citizens` |
| 3 | Citizenship by Investment: The Second Passport Playbook | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 2 complete | `/academy` internal lesson view | `/academy/lessons/citizenship-by-investment-the-second-passport-playbook` |
| 4 | Offshore Structures: What's Legal, What Isn't, and What the Wealthy Actually Do | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 3 complete | `/academy` internal lesson view | `/academy/lessons/offshore-structures-what-s-legal-what-isn-t-and-what-the-wealthy-actually-do` |
| 5 | Territorial Tax Countries: Living and Earning Without the IRS | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 4 complete | `/academy` internal lesson view | `/academy/lessons/territorial-tax-countries-living-and-earning-without-the-irs` |
| 6 | The Long Game: Building a Sovereign Financial Life | 5; heading, body, callout, vault, action | Not separately modeled; do not invent | Lesson 5 complete | `/academy` internal lesson view | `/academy/lessons/the-long-game-building-a-sovereign-financial-life` |

#### Assessment: Module 12

- Proposed target route: `/academy/assessments/the-exit-strategy-assessment`.
- Legacy answer-key exposure: every `correct` index is shipped to the browser.
- Canonical rule: options may reach the browser; correct answers must remain server-only. The API receives selected option IDs, scores authoritatively, stores the attempt and selected answers, and awards progression/XP once in one transaction.

| Q | Prompt | Options | Correct answer |
|---:|---|---|---|
| 1 | Flag theory is best described as: | A. A strategy to avoid all legal obligations internationally<br>B. Distributing key aspects of your financial and personal life across multiple jurisdictions to reduce dependence on any single government<br>C. A method to obtain multiple passports illegally<br>D. A conspiracy theory about government surveillance | B. Distributing key aspects of your financial and personal life across multiple jurisdictions to reduce dependence on any single government |
| 2 | Puerto Rico Act 60's capital gains tax rate for qualifying residents is: | A. 15%<br>B. 5%<br>C. 20%<br>D. 0% | D. 0% |
| 3 | The IRS bona fide residency test for Puerto Rico requires: | A. Simply having a Puerto Rico mailing address<br>B. 30 days physical presence per year<br>C. Meeting presence, tax home, and closer connection tests<br>D. Renouncing U.S. citizenship | C. Meeting presence, tax home, and closer connection tests |
| 4 | Citizenship by Investment programs allow: | A. Illegal immigration through investment<br>B. Obtaining citizenship of a foreign country through qualifying investment<br>C. Avoiding all taxes permanently worldwide<br>D. Purchasing a U.S. green card directly | B. Obtaining citizenship of a foreign country through qualifying investment |
| 5 | The U.S. is unusual in international taxation because: | A. It has the world's lowest tax rates<br>B. It taxes citizens on worldwide income regardless of where they live<br>C. It does not tax investment income<br>D. It allows unlimited foreign income exclusions | B. It taxes citizens on worldwide income regardless of where they live |
| 6 | The Grenada CBI program is uniquely valuable because: | A. It offers the lowest investment threshold of any CBI program<br>B. It provides visa-free access to all countries<br>C. Grenadian citizens can apply for a U.S. E-2 investor visa<br>D. It includes a guaranteed return on investment | C. Grenadian citizens can apply for a U.S. E-2 investor visa |
| 7 | Offshore structures become illegal when: | A. They are used by non-U.S. persons<br>B. They involve assets in the Cayman Islands<br>C. They are used to hide assets from required disclosure<br>D. They hold more than $1 million in assets | C. They are used to hide assets from required disclosure |
| 8 | The Foreign Earned Income Exclusion (FEIE) allows qualifying U.S. citizens abroad to exclude approximately: | A. $50,000 annually<br>B. $126,500 annually (2024)<br>C. All income without limit<br>D. $10,000 monthly | B. $126,500 annually (2024) |
| 9 | Territorial tax countries are advantageous because: | A. They have no laws governing business activity<br>B. They only tax income earned within their borders, exempting foreign-sourced income<br>C. They provide automatic citizenship to investors<br>D. They are immune to international tax treaties | B. They only tax income earned within their borders, exempting foreign-sourced income |
| 10 | The core principle of sovereign financial architecture is: | A. Hiding wealth from all governments<br>B. Concentrating all assets in the strongest currency<br>C. Building optionality across jurisdictions so no single government controls your entire financial life<br>D. Renouncing citizenship as soon as possible | C. Building optionality across jurisdictions so no single government controls your entire financial life |

## Canonical import requirements

- Preserve source text exactly during extraction; legal/product review may revise claims later, but migration must not silently rewrite curriculum.
- Store paths, modules, lessons, content blocks, assessments, questions, options, answer keys, prerequisites, publication state, and revision provenance in PostgreSQL.
- Keep answer keys in API/private repository queries only. Do not serialize them in member lesson or assessment payloads.
- Create stable source provenance for every imported record: source repo, commit, source constant, module ID, lesson index, question index, and content digest.
- Module 0 lead capture and qualification behavior needs a human decision before publication. The unauthenticated legacy GHL webhook must not be ported.
- The source includes financial, tax, legal, product, token, pricing, roadmap, and return-related statements. Content/legal review is required before canonical publication; this audit records content and does not validate claims.
