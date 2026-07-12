const modules = [
  { n: "01", title: "Blockchain, decoded", text: "Understand blocks, wallets, keys, and consensus without the jargon fog." },
  { n: "02", title: "DeFi from first principles", text: "See how swaps, lending, liquidity, and stablecoins actually work onchain." },
  { n: "03", title: "Risk before reward", text: "Learn to read protocols, spot fragile mechanics, and make informed decisions." },
  { n: "04", title: "Put knowledge onchain", text: "Follow guided labs that turn concepts into practical, repeatable skills." },
];

const outcomes = [
  ["Read", "a block explorer with confidence"],
  ["Explain", "where DeFi yield really comes from"],
  ["Evaluate", "protocol design and smart-contract risk"],
  ["Act", "with a framework—not a hunch"],
];

export default function Home() {
  return (
    <main>
      <nav className="nav shell" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Blockwise Academy home">
          <span className="brand-mark"><i /><i /><i /></span>
          <span>BLOCKWISE<span className="brand-dot">/</span>ACADEMY</span>
        </a>
        <div className="nav-links">
          <a href="#curriculum">Curriculum</a>
          <a href="#method">How it works</a>
          <a href="#faq">FAQ</a>
        </div>
        <a className="button button-small" href="#enroll">Explore the academy <span>↗</span></a>
      </nav>

      <section className="hero shell" id="top">
        <div className="eyebrow"><span className="pulse" /> Crypto education for the conviction era</div>
        <h1>Don’t chase the future.<br /><span>Understand it.</span></h1>
        <p className="hero-copy">The education platform that turns crypto, blockchain, and DeFi from noise into knowledge you can actually use.</p>
        <div className="hero-actions">
          <a className="button" href="#enroll">Start learning now <span>↗</span></a>
          <a className="text-link" href="#curriculum">View the curriculum <span>↓</span></a>
        </div>
        <OrbitLearning />
        <div className="proof-strip">
          <span>Built for beginners</span><i /> <span>Practical onchain labs</span><i /> <span>No hype. No signals.</span><i /> <span>Learn at your pace</span>
        </div>
      </section>

      <section className="statement shell" id="method">
        <div className="section-tag">[ OUR POSITION ]</div>
        <p>Crypto doesn’t need more noise.<br /><strong>It needs more people who understand it.</strong></p>
        <div className="statement-grid">
          <div><span>NOT A</span><b>Trading room</b></div><div><span>NOT A</span><b>Token pitch</b></div><div><span>NOT A</span><b>Shortcut</b></div><div className="yes"><span>BUILT TO</span><b>Teach you how it works</b></div>
        </div>
      </section>

      <section className="curriculum" id="curriculum">
        <div className="shell">
          <div className="section-head">
            <div><div className="section-tag">[ THE LEARNING PATH ]</div><h2>From curious<br />to <span>crypto-literate.</span></h2></div>
            <p>A focused curriculum designed to build your knowledge in the right order—one clear concept at a time.</p>
          </div>
          <div className="module-grid">
            {modules.map((m) => <article className="module" key={m.n}><span className="module-num">{m.n}</span><div className="module-icon">{m.n === "01" ? "◇" : m.n === "02" ? "⇄" : m.n === "03" ? "⌁" : "↗"}</div><h3>{m.title}</h3><p>{m.text}</p><a href="#enroll">Explore module <span>↗</span></a></article>)}
          </div>
        </div>
      </section>

      <section className="outcomes shell">
        <div><div className="section-tag">[ WHAT CHANGES ]</div><h2>Leave with more<br />than information.</h2></div>
        <div className="outcome-list">
          {outcomes.map(([verb, detail], i) => <div key={verb}><span>0{i + 1}</span><p><strong>{verb}</strong> {detail}</p><b>✓</b></div>)}
        </div>
      </section>

      <section className="protocol shell">
        <div className="protocol-card">
          <div className="section-tag">[ HOW YOU LEARN ]</div>
          <h2>A protocol for<br /><span>real understanding.</span></h2>
          <div className="steps">
            <div><b>01</b><h3>See it clearly</h3><p>Visual lessons make complex systems click.</p></div>
            <div><b>02</b><h3>Test the idea</h3><p>Knowledge checks reveal what you truly know.</p></div>
            <div><b>03</b><h3>Use it onchain</h3><p>Guided labs connect theory to the real world.</p></div>
          </div>
        </div>
      </section>

      <section className="faq shell" id="faq">
        <div><div className="section-tag">[ COMMON QUESTIONS ]</div><h2>Start with clarity.</h2></div>
        <div className="faq-list">
          <details open><summary>Do I need crypto experience?<span>−</span></summary><p>No. The path starts with first principles and builds deliberately from there.</p></details>
          <details><summary>Is this financial advice or trading signals?<span>+</span></summary><p>No. Blockwise is education: concepts, systems, research skills, and risk awareness.</p></details>
          <details><summary>How do the practical labs work?<span>+</span></summary><p>Step-by-step simulations and guided onchain activities let you apply each lesson safely.</p></details>
          <details><summary>Can I learn at my own pace?<span>+</span></summary><p>Yes. Lessons are on demand, so your learning path fits your schedule.</p></details>
        </div>
      </section>

      <section className="cta" id="enroll">
        <div className="shell">
          <div className="eyebrow"><span className="pulse" /> Your education is the edge</div>
          <h2>The next era is onchain.<br /><span>Be ready to understand it.</span></h2>
          <p>Join the education platform built for people who want knowledge—not noise.</p>
          <a className="button button-light" href="mailto:learn@blockwise.academy?subject=Blockwise%20Academy%20Access">Explore the academy <span>↗</span></a>
          <small>Education only. No hype. No financial advice.</small>
        </div>
      </section>

      <footer className="shell">
        <a className="brand" href="#top"><span className="brand-mark"><i /><i /><i /></span><span>BLOCKWISE<span className="brand-dot">/</span>ACADEMY</span></a>
        <p>Crypto knowledge, built block by block.</p>
        <div><a href="#curriculum">Curriculum</a><a href="#method">Method</a><a href="#faq">FAQ</a></div>
        <span>© 2026 Blockwise Academy</span>
      </footer>
    </main>
  );
}
import { OrbitLearning } from "./OrbitLearning";
