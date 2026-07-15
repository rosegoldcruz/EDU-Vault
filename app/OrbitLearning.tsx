"use client";

const orbitModules = [
  { number: "01", title: "FOUNDATIONS", subtitle: "Wallets · Keys · Blocks", className: "card-a", href: "#curriculum" },
  { number: "02", title: "DEFI SYSTEMS", subtitle: "Liquidity · Lending · Yield", className: "card-b", href: "#curriculum" },
  { number: "03", title: "RISK & RESEARCH", subtitle: "Evaluate · Verify · Decide", className: "card-c", href: "#standards" },
];

const stageLabels = ["FOUNDATIONS", "DEFI SYSTEMS", "RISK & RESEARCH", "ONCHAIN READY"];

export function OrbitLearning({ activeStep }: { activeStep: number }) {
  const currentStage = stageLabels[activeStep] ?? stageLabels[0];

  return (
    <div
      className={`hero-stage learning-orbit is-active is-scroll-controlled stage-${activeStep}`}
      aria-label="A connected learning orbit from crypto foundations through DeFi systems and risk research"
    >
      <div className="orbit-grid" aria-hidden="true" />
      <div className="core-pulse" aria-hidden="true" />
      <div className="orbit orbit-inner" aria-hidden="true" />
      <div className="orbit orbit-middle" aria-hidden="true" />
      <div className="orbit orbit-outer" aria-hidden="true" />
      <div className="orbit-signal" aria-hidden="true"><i /></div>

      {orbitModules.map((module, index) => (
        <div className={`orbit-node ${module.className}${activeStep === index ? " is-current" : ""}${activeStep > index ? " is-complete" : ""}`} key={module.number}>
          <div className="orbit-parallax-layer" data-parallax-max={[8, 12, 16][index]}>
            <a
              className="chain-card"
              style={{ "--module-delay": `${1.05 + index * 1.15}s` } as React.CSSProperties}
              href={module.href}
              aria-label={`${module.title}: ${module.subtitle}`}
            >
              <span className="module-tick">{module.number}</span>
              <span className="module-title">{module.title}</span>
              <small>{module.subtitle}</small>
              <span className="card-proof" aria-hidden="true">PATH STAGE</span>
              <i className="connection-line" aria-hidden="true" />
            </a>
          </div>
        </div>
      ))}

      <div className="core" aria-live="polite">
        <span className="core-kicker">LEARNING STATE</span>
        <div className="core-sequence"><strong className="core-word is-current">{currentStage}</strong></div>
        <div className="core-progress">
          {stageLabels.map((label, index) => <i className={index <= activeStep ? "is-complete" : ""} aria-label={label} key={label} />)}
        </div>
      </div>

      <div className="stage-label label-left">LEARN THE SYSTEM</div>
      <div className="stage-label label-right">PROVE THE KNOWLEDGE</div>
      <div className="orbit-proof" aria-hidden="true">
        <span>STRUCTURED PATH</span>
        <div>{stageLabels.map((label, index) => <i className={index <= activeStep ? "is-complete" : ""} key={label} />)}</div>
        <b>{String(activeStep + 1).padStart(2, "0")} / 04</b>
      </div>
    </div>
  );
}
