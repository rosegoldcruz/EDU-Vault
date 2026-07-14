"use client";

import { useEffect, useRef, useState } from "react";

const orbitModules = [
  { number: "01", title: "FOUNDATIONS", subtitle: "Wallets · Keys · Blocks", className: "card-a", href: "#curriculum" },
  { number: "02", title: "DEFI SYSTEMS", subtitle: "Liquidity · Lending · Yield", className: "card-b", href: "#curriculum" },
  { number: "03", title: "RISK & RESEARCH", subtitle: "Evaluate · Verify · Decide", className: "card-c", href: "#standards" },
];

export function OrbitLearning() {
  const orbitRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const orbit = orbitRef.current;
    if (!orbit) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.32 },
    );

    observer.observe(orbit);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={orbitRef}
      className={`hero-stage learning-orbit${isActive ? " is-active" : ""}`}
      aria-label="A connected learning orbit from crypto foundations through DeFi systems and risk research"
    >
      <div className="orbit-grid" aria-hidden="true" />
      <div className="core-pulse" aria-hidden="true" />
      <div className="orbit orbit-inner" aria-hidden="true" />
      <div className="orbit orbit-middle" aria-hidden="true" />
      <div className="orbit orbit-outer" aria-hidden="true" />
      <div className="orbit-signal" aria-hidden="true" />

      {orbitModules.map((module, index) => (
        <div className={`orbit-node ${module.className}`} key={module.number}>
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
        <div className="core-sequence">
          <strong className="core-word word-knowledge">LEARN</strong>
          <strong className="core-word word-understanding">PROVE</strong>
          <strong className="core-word word-conviction">ONCHAIN READY</strong>
        </div>
        <div className="core-progress"><i /><i /><i /></div>
      </div>

      <div className="stage-label label-left">LEARN THE SYSTEM</div>
      <div className="stage-label label-right">PROVE THE KNOWLEDGE</div>
      <div className="orbit-proof" aria-hidden="true">
        <span>STRUCTURED PATH</span>
        <div><i /><i /><i /></div>
        <b>CONNECTED</b>
      </div>
    </div>
  );
}
