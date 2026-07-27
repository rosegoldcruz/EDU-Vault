import { ContractPanel } from "./iv/ContractPanel";
import { FreeLesson } from "./iv/FreeLesson";
import { IvNav } from "./iv/IvNav";
import { SystemDiagram } from "./iv/SystemDiagram";
import { pillars, tracks } from "./iv/data";

const specRows = [
  ["Attention before understanding", "Capability before participation"],
  ["Checkout before context", "Advisor guidance before enrollment"],
  ["Community measured through liquidity", "Community as a learning and feedback network"],
  ["Roadmaps built around promises", "Progress measured through proof gates"],
  ["Product access after purchase", "Free product experience before commitment"],
  ["Progress described through marketing", "Progress shown through shipped systems"],
] as const;

const commTerms = [
  { term: "Building", tier: "active" },
  { term: "Developing", tier: "active" },
  { term: "Preparing", tier: "active" },
  { term: "Integrating", tier: "active" },
  { term: "Testing", tier: "active" },
  { term: "Deployed", tier: "deployed" },
  { term: "Available", tier: "deployed" },
  { term: "Verified", tier: "deployed" },
] as const;

export default function Home() {
  const mintAddress = process.env.NEXT_PUBLIC_IVSOL_MINT?.trim() || null;

  return (
    <div className="iv-root" id="top">
      <IvNav />

      <main>
        {/* ============ FOLD 1 — Immediate recognition ============ */}
        <section className="iv-hero iv-shell">
          <span className="iv-label">An education-first ecosystem</span>
          <h1>
            Learn first.
            <span className="iv-serif">Participate with context.</span>
          </h1>
          <p className="iv-hero-sub">
            Iron Vault is built around financial literacy, emerging technology, operational
            transparency, and informed participation.
          </p>
          <div className="iv-hero-actions">
            <a className="iv-btn" href="/login">Enter Vaulted Academy</a>
            <a className="iv-textlink" href="#system">View the system</a>
          </div>
          <div className="iv-hero-layers">
            <span><b>Vaulted Academy</b> — the knowledge layer</span>
            <span><b>IV SOL</b> — the participation layer</span>
          </div>

          <div className="iv-status-strip" aria-label="Current status">
            <span><span className="iv-dot" data-state="live" />IV SOL deployed on Solana</span>
            <span><span className="iv-dot" data-state="progress" />Academy in active development</span>
            <span><span className="iv-dot" data-state="live" />Enrollment available through advisors</span>
            <span><span className="iv-dot" data-state="progress" />Merchant integration in progress</span>
          </div>
        </section>

        {/* ============ FOLD 2 — The operating thesis ============ */}
        <section className="iv-section iv-section-alt">
          <div className="iv-thesis iv-shell">
            <div className="iv-manifesto">
              <span className="iv-label">Our thesis</span>
              <h2>Most token websites sell attention around an asset. Iron Vault is building the system <span className="iv-serif">around the participant.</span></h2>
              <p>
                The distinction is structural, not rhetorical. Every surface on this platform is
                designed to build capability before it invites participation — and to prove its
                progress with evidence rather than promises.
              </p>
              <ul className="iv-principles">
                <li><i>i.</i>Evidence before marketing</li>
                <li><i>ii.</i>Capability before speculation</li>
                <li><i>iii.</i>Education before participation</li>
                <li><i>iv.</i>Shipped work before promises</li>
                <li><i>v.</i>Transparency before hype</li>
              </ul>
            </div>

            <div className="iv-spec iv-panel" role="table" aria-label="Specification comparison">
              <div className="iv-spec-head" role="row">
                <span role="columnheader">Conventional token experience</span>
                <span role="columnheader">Iron Vault</span>
              </div>
              {specRows.map(([conventional, ironVault]) => (
                <div className="iv-spec-row" role="row" key={ironVault}>
                  <div role="cell">{conventional}</div>
                  <div role="cell">{ironVault}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ FOLD 3 — Vaulted Academy preview ============ */}
        <section className="iv-section" id="academy">
          <div className="iv-shell">
            <div className="iv-section-head iv-section-head-row" style={{ maxWidth: "none" }}>
              <div>
                <span className="iv-label">Vaulted Academy</span>
                <h2>The intelligence layer <span className="iv-serif">of the system.</span></h2>
                <p className="iv-sub">
                  Structured tracks, server-verified assessments, and progression that unlocks with
                  demonstrated understanding — not with a checkout page.
                </p>
              </div>
              <a className="iv-textlink" href="/login">Open the Academy</a>
            </div>

            <div className="iv-track-grid">
              {tracks.map((track) => (
                <article className="iv-track" key={track.code}>
                  <div className="iv-track-top">
                    <span className="iv-track-code">{track.code}</span>
                    <span className="iv-chip" data-state="planned">{track.level}</span>
                  </div>
                  <h3>{track.name}</h3>
                  <div className="iv-track-meta">
                    <span>{track.modules} modules</span>
                    <span>~{track.hours}</span>
                  </div>
                </article>
              ))}
              <FreeLesson />
            </div>
          </div>
        </section>

        {/* ============ FOLD 4 — Platform architecture ============ */}
        <section className="iv-section iv-section-alt" id="system">
          <div className="iv-shell">
            <div className="iv-section-head">
              <span className="iv-label">The platform</span>
              <h2>One system. <span className="iv-serif">Inspect any module.</span></h2>
              <p className="iv-sub">
                The ecosystem as it actually exists — each module labeled with its real,
                current state. Select a module to read its plain-English description.
              </p>
            </div>
            <SystemDiagram />
          </div>
        </section>

        {/* ============ FOLD 5 — IV SOL, honestly ============ */}
        <section className="iv-section" id="token">
          <div className="iv-shell">
            <div className="iv-section-head">
              <span className="iv-label">IV SOL</span>
              <h2>The token is a component. <span className="iv-serif">Not the whole machine.</span></h2>
            </div>

            <div className="iv-token-cols">
              <div className="iv-token-col">
                <h3>What it is</h3>
                <p>
                  IV SOL is the participation layer of the Iron Vault ecosystem — a token deployed
                  on Solana that connects verified members to the platform&rsquo;s participation
                  mechanics.
                </p>
                <ul>
                  <li>Deployed on the Solana network</li>
                  <li>One component of a larger operational system</li>
                  <li>Scoped by what is actually built and verified</li>
                </ul>
              </div>
              <div className="iv-token-col">
                <h3>What it does</h3>
                <p>
                  Participation mechanics expand only through verified proof gates. Current and
                  intended utility is stated precisely — deployed functionality is never conflated
                  with planned capability.
                </p>
                <ul>
                  <li>Wallet verification for members is live</li>
                  <li>Milestone recognition operates through manual review</li>
                  <li>Expanded utility unlocks as supporting systems ship</li>
                </ul>
              </div>
              <div className="iv-token-col">
                <h3>What it is not</h3>
                <p>Stated plainly, because precision in language is part of the product:</p>
                <ul>
                  <li>Not equity</li>
                  <li>Not ownership in the company</li>
                  <li>Not guaranteed income</li>
                  <li>Not guaranteed appreciation</li>
                  <li>Not passive yield</li>
                  <li>Not a promise of financial return</li>
                </ul>
              </div>
            </div>

            <ContractPanel mintAddress={mintAddress} />
          </div>
        </section>

        {/* ============ FOLD 6 — Roadmap as proof gates ============ */}
        <section className="iv-section iv-section-alt" id="proof">
          <div className="iv-shell">
            <div className="iv-section-head">
              <span className="iv-label">Progress</span>
              <h2>No dates. <span className="iv-serif">Definitions of done.</span></h2>
              <p className="iv-sub">
                A milestone only displays as complete when the corresponding proof exists. Open
                any item to read its definition of done and current evidence.
              </p>
            </div>

            <div className="iv-pillars">
              {pillars.map((pillar) => (
                <div className="iv-pillar iv-panel" key={pillar.id}>
                  <div className="iv-pillar-head">
                    <i>{pillar.id}.</i>
                    <h3>{pillar.name}</h3>
                  </div>
                  {pillar.gates.map((gate) => (
                    <details className="iv-gate" data-state={gate.state} key={gate.name}>
                      <summary>
                        {gate.name}
                        <span className="iv-gate-state" aria-hidden="true" />
                      </summary>
                      <div className="iv-gate-body">
                        <div>
                          <b>State</b>
                          {gate.stateLabel}
                        </div>
                        <div>
                          <b>Definition of done</b>
                          {gate.done}
                        </div>
                        <div>
                          <b>Evidence</b>
                          {gate.evidence}
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ FOLD 7 — Advisor-led enrollment ============ */}
        <section className="iv-section" id="enroll">
          <div className="iv-enroll iv-shell">
            <div>
              <span className="iv-label">Enrollment</span>
              <h2>Emerging technology creates questions <span className="iv-serif">a checkout page cannot answer.</span></h2>
              <p className="iv-enroll-lede">
                Iron Vault uses advisor-led enrollment so prospective members understand the
                Academy, the participation structure, platform access, policies, and next steps —
                before committing to anything.
              </p>
              <a className="iv-btn" href="/login">Speak with an advisor</a>
              <p className="iv-enroll-note">
                The conversation is informational and enrollment-focused. No pressure mechanics.
              </p>
            </div>

            <div className="iv-enroll-card iv-panel">
              <h3>What the conversation covers</h3>
              <ul>
                <li><b>Academy walkthrough</b><span>Curriculum + progression</span></li>
                <li><b>Participation structure</b><span>How IV SOL fits in</span></li>
                <li><b>Platform access</b><span>What is available today</span></li>
                <li><b>Policies &amp; disclosures</b><span>Before any commitment</span></li>
                <li><b>Typical length</b><span>20–30 minutes</span></li>
              </ul>
            </div>
          </div>
        </section>

        {/* ============ FOLD 8 + 9 — Accountability & language ============ */}
        <section className="iv-section iv-section-alt">
          <div className="iv-anchor iv-shell">
            <div className="iv-anchor-card iv-panel">
              <span className="iv-label">Phoenix, Arizona</span>
              <h3>Built and operated by identifiable people.</h3>
              <p>
                Iron Vault is not an anonymous website attached to a temporary Discord server. It
                is a real platform operated from Phoenix, Arizona, with a named team, a legal
                operating entity, and public accountability commitments — building in the open.
              </p>
            </div>

            <div className="iv-anchor-card iv-panel">
              <span className="iv-label">Our language</span>
              <h3>Planned functionality is never described as available.</h3>
              <p>
                Every public statement on this platform distinguishes clearly between the
                following states — and the interface reflects them through status indicators,
                timestamps, and proof links:
              </p>
              <div className="iv-comm-terms">
                {commTerms.map(({ term, tier }) => (
                  <span key={term} data-tier={tier}>{term}</span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ============ Footer — colophon ============ */}
      <footer className="iv-footer">
        <div className="iv-shell">
          <div className="iv-footer-grid">
            <div className="iv-footer-readout" aria-label="Current status summary">
              <span><b>Network</b> — Solana</span>
              <span><b>Token</b> — IV SOL, deployed</span>
              <span><b>Academy</b> — in active development</span>
              <span><b>Rewards</b> — manual review only</span>
            </div>
            <nav aria-label="Footer navigation">
              <a href="#academy">Academy</a>
              <a href="#system">Platform</a>
              <a href="#token">IV SOL</a>
              <a href="#proof">Progress</a>
              <a href="#enroll">Enroll</a>
              <a href="/login">Sign in</a>
            </nav>
          </div>
          <div className="iv-footer-sig">
            <span className="iv-serif">Iron Vault — Phoenix, Arizona. Built in the open.</span>
            <span>© 2026 Iron Vault | Vaulted Academy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
