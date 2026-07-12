"use client";

import { useEffect, useRef, useState } from "react";

const orbitModules = [
  { number: "01", title: "FOUNDATIONS", subtitle: "Wallets · Keys · Blocks", className: "card-a" },
  { number: "02", title: "DEFI SYSTEMS", subtitle: "Liquidity · Lending · Yield", className: "card-b" },
  { number: "03", title: "RISK & RESEARCH", subtitle: "Evaluate · Verify · Decide", className: "card-c" },
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
      aria-label="An interactive learning orbit from crypto foundations through DeFi systems and risk research"
    >
      <div className="orbit-grid" aria-hidden="true" />
      <div className="core-pulse" aria-hidden="true" />
      <div className="orbit orbit-inner" aria-hidden="true" />
      <div className="orbit orbit-middle" aria-hidden="true" />
      <div className="orbit orbit-outer" aria-hidden="true" />
      <div className="orbit-signal" aria-hidden="true" />

      {orbitModules.map((module, index) => (
        <button
          className={`chain-card ${module.className}`}
          style={{ "--module-delay": `${1.05 + index * 1.15}s` } as React.CSSProperties}
          type="button"
          key={module.number}
          aria-label={`${module.title}: ${module.subtitle}`}
        >
          <span className="module-tick">{module.number}</span>
          <span className="module-title">{module.title}</span>
          <small>{module.subtitle}</small>
          <span className="card-proof" aria-hidden="true">VERIFIED</span>
          <i className="connection-line" aria-hidden="true" />
        </button>
      ))}

      <div className="core" aria-live="polite">
        <span className="core-kicker">LEARNING STATE</span>
        <div className="core-sequence">
          <strong className="core-word word-knowledge">KNOWLEDGE</strong>
          <strong className="core-word word-understanding">UNDERSTANDING</strong>
          <strong className="core-word word-conviction">CONVICTION</strong>
        </div>
        <div className="core-progress"><i /><i /><i /></div>
      </div>

      <div className="stage-label label-left">LEARN THE SYSTEM</div>
      <div className="stage-label label-right">USE THE KNOWLEDGE</div>
      <div className="orbit-proof" aria-hidden="true">
        <span>LEARNING PROOF</span>
        <div><i /><i /><i /></div>
        <b>03 / 03</b>
      </div>
    </div>
  );
}
