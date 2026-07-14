import { AcademyExperience } from "./AcademyExperience";
import { Hero } from "./Hero";
import { LandingBrand } from "./LandingBrand";
import { Nav } from "./Nav";
import { landingNavItems } from "./landingNavigation";

const methodStages = [
  {
    number: "01",
    title: "Learn",
    text: "Structured lessons build first-principles understanding across crypto, wallets, DeFi, security, and onchain research.",
  },
  {
    number: "02",
    title: "Prove",
    text: "Knowledge checks and assessments verify understanding instead of rewarding passive completion.",
  },
  {
    number: "03",
    title: "Operate",
    text: "Scenario-based practice prepares you to interpret transactions, assess risk, and use wallets safely.",
    note: "Practical execution is the method; live lab availability may vary.",
  },
  {
    number: "04",
    title: "Earn",
    text: "XP, ranks, achievements, access, credentials, and eligible milestones recognize progress.",
  },
];

const curriculum = [
  {
    title: "Crypto Foundations",
    text: "Understand money, networks, keys, transactions, and the ideas beneath crypto systems.",
  },
  {
    title: "Wallets and Custody",
    text: "Understand ownership, signing, custody models, recovery practices, and operational security.",
  },
  {
    title: "Blockchain Operations",
    text: "Read transaction flows, fees, confirmations, explorers, and network behavior.",
  },
  {
    title: "DeFi Systems",
    text: "Explain swaps, liquidity, lending, stablecoins, yields, and protocol dependencies.",
  },
  {
    title: "Trading and Market Structure",
    text: "Interpret liquidity, order flow, volatility, and risk without chasing signals.",
  },
  {
    title: "Tokenomics and Project Analysis",
    text: "Evaluate incentives, supply mechanics, governance, and project design.",
  },
  {
    title: "Security and Scam Defense",
    text: "Recognize attack patterns, verify claims, and protect keys and approvals.",
  },
  {
    title: "Onchain Research",
    text: "Use public data and structured reasoning to investigate wallets, protocols, and activity.",
  },
  {
    title: "Advanced Protocol Analysis",
    text: "Assess architecture, dependencies, failure modes, and systemic risk.",
  },
];

const progressionSystems = [
  ["XP", "Measures learning activity and mastery."],
  ["Rank", "Reflects long-term academy progress."],
  ["Badges", "Recognize specific competencies."],
  ["Streaks", "Encourage consistency."],
  ["Credentials", "Verify completed pathways."],
  ["Vault access", "Unlocks advanced content and experiences."],
  ["Eligible IVT rewards", "Recognize certain milestones—not every lesson or action."],
];

const rewardStandards = [
  "Rewards connect to eligible milestones and completion requirements.",
  "Learning progress and token rewards are separate systems.",
  "XP does not automatically equal token value.",
  "Rewards may be reviewed, limited, or unavailable.",
  "Token values can fluctuate. Education is the primary product.",
];

const standards = [
  "Structured curriculum",
  "Beginner-to-advanced progression",
  "Practical security emphasis",
  "Clear explanations without unnecessary jargon",
  "Content reviewed as the ecosystem evolves",
  "No requests for seed phrases or private keys",
  "No personalized financial instructions",
  "Focus on systems, evidence, and risk",
];

function ArrowUpRight() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M4 12 12 4M6 4h6v6" />
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M8 2v11M3.5 8.5 8 13l4.5-4.5" />
    </svg>
  );
}

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />

      <section className="method shell section-space" id="method">
        <div className="section-tag">[ THE IRON VAULT METHOD ]</div>
        <h2>Learn. Prove. Operate. Earn.</h2>
        <ol className="method-rail">
          {methodStages.map((stage) => (
            <li key={stage.number}>
              <span className="stage-number">{stage.number}</span>
              <h3>{stage.title}</h3>
              <p>{stage.text}</p>
              {stage.note ? <small>{stage.note}</small> : null}
            </li>
          ))}
        </ol>
        <p className="method-caption"><i /> One connected system—from first principle to capable operation.</p>
      </section>

      <section className="curriculum" id="curriculum">
        <div className="shell section-space">
          <div className="section-intro curriculum-intro">
            <div>
              <div className="section-tag">[ CURRICULUM DEPTH ]</div>
              <h2>From first principles<br />to <span>onchain fluency.</span></h2>
            </div>
            <p>A beginner-to-advanced curriculum built in the order capable operators need.</p>
          </div>

          <div className="curriculum-grid">
            {curriculum.map((item, index) => (
              <article key={item.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>

          <a className="button curriculum-cta" href="#academy-experience">
            Explore the Vaulted Academy Experience <ArrowUpRight />
          </a>
        </div>
      </section>

      <section className="experience shell section-space" id="academy-experience">
        <div className="section-intro experience-intro">
          <div>
            <div className="section-tag">[ ACADEMY EXPERIENCE ]</div>
            <h2>See how the academy works.</h2>
            <p>A structured learning path makes the next action clear—from lesson to assessment to mastery.</p>
          </div>
          <a className="button" href="#curriculum">Explore the Curriculum <ArrowUpRight /></a>
        </div>
        <AcademyExperience />
      </section>

      <section className="progression" id="progression">
        <div className="shell section-space">
          <div className="section-intro progression-intro">
            <div>
              <div className="section-tag">[ PROGRESSION + REWARDS ]</div>
              <h2>Progress has more<br />than one signal.</h2>
            </div>
            <div>
              <p>Each system has a distinct job. Rewards support the education system; they do not define it.</p>
              <a className="text-link dark-link" href="#rewards">How rewards work <ArrowDown /></a>
            </div>
          </div>

          <div className="progression-layout">
            <ol className="progression-list">
              {progressionSystems.map(([label, text], index) => (
                <li key={label}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{label}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>

            <div className="reward-explainer" id="rewards">
              <div className="section-tag">[ REWARD TRANSPARENCY ]</div>
              <h2>How rewards work</h2>
              <ul>
                {rewardStandards.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <p className="reward-note">Education first. Rewards apply only to eligible milestones.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="standards shell section-space" id="standards">
        <div className="standards-copy">
          <div className="section-tag">[ TRUST + STANDARDS ]</div>
          <h2>Competence requires <span>standards.</span></h2>
          <p>Protective by design. Practical by default.</p>
        </div>
        <ol className="standards-list">
          {standards.map((item, index) => (
            <li key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item}</strong>
              <i aria-hidden="true" />
            </li>
          ))}
        </ol>
      </section>

      <section className="cta" id="enroll">
        <div className="shell">
          <h2>Learn the system. <span>Prove what you know.</span></h2>
          <p>Build the knowledge, judgment, and operating habits required to move onchain with competence.</p>
          <div className="cta-actions">
            <a className="button button-dark" href="#academy-experience">Enter Vaulted Academy <ArrowUpRight /></a>
            <a className="text-link dark-link" href="#curriculum">Explore the Curriculum <ArrowUpRight /></a>
          </div>
          <small>Education first. Rewards apply only to eligible milestones.</small>
        </div>
      </section>

      <footer className="shell">
        <a className="brand" href="#top" aria-label="Iron Vault | Vaulted Academy home"><LandingBrand /></a>
        <nav aria-label="Footer navigation">
          {landingNavItems.map(({ label, href }) => <a href={href} key={href}>{label}</a>)}
        </nav>
        <div className="footer-meta">
          <span>© 2026 Iron Vault | Vaulted Academy</span>
          <p>Learn. Prove. Operate. Earn.</p>
        </div>
      </footer>
    </main>
  );
}
