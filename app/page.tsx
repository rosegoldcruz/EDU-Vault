import { AcademyExperience } from "./AcademyExperience";
import { DeferredBottomLandingSections, DeferredTopLandingSections } from "./DeferredLandingSections";
import { Hero } from "./Hero";
import { LandingBrand } from "./LandingBrand";
import { Nav } from "./Nav";
import { landingNavItems } from "./landingNavigation";

function ArrowUpRight() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M4 12 12 4M6 4h6v6" />
    </svg>
  );
}

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <DeferredTopLandingSections />

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

      <DeferredBottomLandingSections />

      <section className="cta" id="enroll">
        <div className="shell">
          <h2>Learn the system. <span>Prove what you know.</span></h2>
          <p>Build the knowledge, judgment, and operating habits required to move onchain with competence.</p>
          <div className="cta-actions">
            <a className="button button-dark" href="#academy-experience">Enter Vaulted Academy <ArrowUpRight /></a>
            <a className="text-link dark-link" href="#benefits">Review the Benefits <ArrowUpRight /></a>
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
