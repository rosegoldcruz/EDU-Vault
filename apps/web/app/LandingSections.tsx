"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef, useState, type CSSProperties } from "react";
import { VaultAccordion, type VaultAccordionItem } from "./VaultAccordion";
import { useMotionTokens } from "./motion/tokens";
import { useScrollSteps } from "./useScrollSteps";

const tabContent = [
  {
    label: "Foundation",
    title: "Concepts become usable mental models.",
    text: "Learners connect wallets, keys, blocks, transactions, fees, and custody before moving into protocol behavior.",
  },
  {
    label: "Execution",
    title: "Practice makes the next action legible.",
    text: "Assessments and guided scenarios train the habit of reading a transaction, checking assumptions, and explaining risk.",
  },
  {
    label: "Proof",
    title: "Progress is earned through demonstrated understanding.",
    text: "XP, rank, credentials, access, and eligible milestones are tied to completion requirements rather than passive activity.",
  },
];

const surfaceCards = [
  {
    title: "Wallet Confidence",
    text: "Understand signing, approvals, custody tradeoffs, and recovery decisions before value is at risk.",
    href: "#benefits",
  },
  {
    title: "DeFi Literacy",
    text: "Read swaps, liquidity, lending, stablecoins, yields, and protocol dependencies with a systems view.",
    href: "#benefits",
  },
  {
    title: "Research Discipline",
    text: "Use onchain evidence, project design, incentives, and token mechanics to build informed analysis.",
    href: "#benefits",
  },
  {
    title: "Security Standards",
    text: "Recognize attack patterns, verify claims, and keep private keys and seed phrases out of every workflow.",
    href: "#faq",
  },
];

const benefitItems: VaultAccordionItem[] = [
  {
    title: "Beginner-to-advanced curriculum",
    detail: "The path starts with crypto primitives and moves into DeFi, trading structure, security, tokenomics, and protocol analysis in the order learners need.",
  },
  {
    title: "Verified knowledge checks",
    detail: "Progression depends on demonstrated comprehension, so the academy can distinguish completion from genuine operating readiness.",
  },
  {
    title: "Scenario-based practice",
    detail: "Learners rehearse wallet approvals, transaction interpretation, custody decisions, and risk review before they meet those choices in the wild.",
  },
  {
    title: "Separate education and rewards logic",
    detail: "XP, ranks, badges, credentials, and eligible IVT rewards have distinct jobs. Education remains the product, and rewards apply only to defined milestones.",
  },
  {
    title: "Standards-first safety posture",
    detail: "The academy avoids seed phrase requests, private-key handling, personalized financial instructions, and token-value framing.",
  },
];

const faqItems: VaultAccordionItem[] = [
  {
    title: "Is Vaulted Academy financial advice?",
    detail: "No. The academy teaches systems, evidence, security, and risk reasoning. It does not provide personalized investment instructions.",
  },
  {
    title: "Do learners earn rewards for every lesson?",
    detail: "No. Rewards are separate from ordinary XP and apply only to eligible milestones, completion requirements, and review conditions.",
  },
  {
    title: "Will the academy ask for seed phrases or private keys?",
    detail: "No. Seed phrases and private keys should never be shared. Security standards are part of the curriculum and the platform posture.",
  },
  {
    title: "Who is the curriculum built for?",
    detail: "It is built for beginners who need a clean foundation and advancing learners who want stronger judgment across wallets, DeFi, research, and protocol risk.",
  },
];

function CardIcon() {
  return (
    <svg className="surface-card-icon" aria-hidden="true" viewBox="0 0 28 28">
      <path d="M5 15.5 12.5 23 23 6" />
      <path className="icon-orbit" d="M6 7h16v16H6z" />
    </svg>
  );
}

function ArrowUpRight() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M4 12 12 4M6 4h6v6" />
    </svg>
  );
}

export function StatementTabs() {
  const [selected, setSelected] = useState(0);
  const storyRef = useRef<HTMLElement>(null);
  const tokens = useMotionTokens();
  const transition = tokens ? { duration: tokens.micro, ease: tokens.easeHover } : undefined;

  useScrollSteps({
    rootRef: storyRef,
    stepCount: tabContent.length,
    onStepChange: setSelected,
    pinSelector: ".statement-pinned",
    stepViewportRatio: 0.76,
    refreshPriority: 4,
  });

  return (
    <section className="statement-scroll-story" id="method" ref={storyRef}>
      <div className="statement statement-pinned shell section-space">
      <div className="statement-copy">
        <div className="section-tag">[ THE IRON VAULT METHOD ]</div>
        <h2>
          <span className="gsap-reveal-line">Learn the system.</span>
          <span className="gsap-reveal-line">Prove the knowledge.</span>
          <span className="gsap-reveal-line">Operate with <em>standards<i className="statement-accent-line" aria-hidden="true" /></em>.</span>
        </h2>
      </div>

      <div className="tab-strip-shell">
        <div className="tab-strip" role="tablist" aria-label="Academy method stages">
          {tabContent.map((tab, index) => (
            <button
              type="button"
              role="tab"
              aria-selected={selected === index}
              aria-controls={`tab-panel-${index}`}
              id={`tab-${index}`}
              onClick={() => setSelected(index)}
              key={tab.label}
            >
              {selected === index ? <motion.span className="tab-active-bg" layoutId="academy-tab-bg" transition={transition} /> : null}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="tab-panel-frame">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              className="tab-panel"
              role="tabpanel"
              id={`tab-panel-${selected}`}
              aria-labelledby={`tab-${selected}`}
              key={tabContent[selected].label}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={transition}
            >
              <h3>{tabContent[selected].title}</h3>
              <p>{tabContent[selected].text}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="scroll-story-counter" aria-live="polite">
        <span>{String(selected + 1).padStart(2, "0")}</span>
        <i aria-hidden="true"><b style={{ transform: `scaleX(${(selected + 1) / tabContent.length})` }} /></i>
        <span>{String(tabContent.length).padStart(2, "0")}</span>
      </div>
      </div>
    </section>
  );
}

export function LightSurfaceCardGrid() {
  const [selected, setSelected] = useState(0);
  const storyRef = useRef<HTMLElement>(null);
  const tokens = useMotionTokens();
  const reduceMotion = useReducedMotion();
  const transition = tokens ? { duration: tokens.micro, ease: tokens.easeHover } : undefined;

  useScrollSteps({
    rootRef: storyRef,
    stepCount: surfaceCards.length,
    onStepChange: setSelected,
    pinSelector: ".light-surface-pinned",
    stepViewportRatio: 0.78,
    refreshPriority: 3,
  });

  return (
    <section className="light-surface light-surface-scroll-story" id="curriculum" ref={storyRef}>
      <div className="light-surface-pinned shell section-space">
        <div className="section-intro light-surface-intro">
          <div>
            <div className="section-tag">[ CURRICULUM DEPTH ]</div>
            <h2>From first principles<br />to <span>onchain fluency.</span></h2>
          </div>
          <p>A structured curriculum built around the capabilities learners actually need before they operate onchain.</p>
        </div>

        <div className="surface-card-grid">
          {surfaceCards.map((card, index) => {
            const offset = index - selected;
            return (
            <div
              className={`surface-card-shell${index === selected ? " is-active" : ""}${index < selected ? " is-before" : " is-after"}`}
              style={{ "--card-offset": offset } as CSSProperties}
              aria-hidden={Math.abs(offset) > 1}
              key={card.title}
            >
              <motion.article className="surface-card" whileHover={reduceMotion || index !== selected ? undefined : { y: -6 }} transition={transition}>
                <span className="surface-card-number">{String(index + 1).padStart(2, "0")}</span>
                <CardIcon />
                <h3>{card.title}</h3>
                <p>{card.text}</p>
                <a href={card.href}>
                  Explore capability <ArrowUpRight />
                </a>
              </motion.article>
            </div>
          )})}
        </div>
        <div className="curriculum-scroll-status" aria-live="polite">
          <span>{surfaceCards[selected].title}</span>
          <div>{surfaceCards.map((card, index) => <i className={index <= selected ? "is-complete" : ""} key={card.title} />)}</div>
          <b>{String(selected + 1).padStart(2, "0")} / {String(surfaceCards.length).padStart(2, "0")}</b>
        </div>
      </div>
    </section>
  );
}

export function BenefitsChecklist() {
  const [selected, setSelected] = useState(0);
  const storyRef = useRef<HTMLElement>(null);

  useScrollSteps({
    rootRef: storyRef,
    stepCount: benefitItems.length,
    onStepChange: setSelected,
    pinSelector: ".benefits-pinned",
    stepViewportRatio: 0.72,
    refreshPriority: 1,
  });

  return (
    <section className="benefits-scroll-story" id="benefits" ref={storyRef}>
      <div className="benefits benefits-pinned shell section-space">
      <div className="benefits-headline">
        <div className="section-tag">[ BENEFITS CHECKLIST ]</div>
        <h2>Competence compounds when the path is clear.</h2>
        <p>Every layer of the academy is designed to reduce guessing and increase operational judgment.</p>
      </div>
      <div className="benefits-list">
        <VaultAccordion
          items={benefitItems}
          label="Vaulted Academy benefits"
          revealClassName="benefits-reveal-item"
          activeIndex={selected}
          onActiveIndexChange={(index) => {
            if (index >= 0) setSelected(index);
          }}
        />
      </div>
      </div>
    </section>
  );
}

export function FAQAccordion() {
  const [selected, setSelected] = useState(0);
  const storyRef = useRef<HTMLElement>(null);
  const scrollStepRef = useRef(0);
  const manualOverrideRef = useRef<null | { baseStep: number }>(null);

  useScrollSteps({
    rootRef: storyRef,
    stepCount: faqItems.length,
    onStepChange: (index) => {
      scrollStepRef.current = index;
      const manualOverride = manualOverrideRef.current;

      // Keep manual selection stable until the user actually advances scroll steps.
      if (manualOverride) {
        if (index === manualOverride.baseStep) return;
        manualOverrideRef.current = null;
      }

      setSelected(index);
    },
    pinSelector: ".faq-pinned",
    stepViewportRatio: 0.72,
    pinOnMobile: false,
    pinMinWidth: 1025,
    refreshPriority: 0,
  });

  return (
    <section className="faq-scroll-story" id="faq" ref={storyRef}>
      <div className="faq faq-pinned shell section-space">
        <div className="section-intro faq-intro">
          <div>
            <div className="section-tag">[ FAQ ]</div>
            <h2>Clear boundaries. Clear expectations.</h2>
          </div>
          <p>The same expansion pattern is reused here so interaction behavior stays consistent across the page.</p>
        </div>
        <div className="faq-list">
          <VaultAccordion
            items={faqItems}
            label="Vaulted Academy frequently asked questions"
            mode="faq"
            revealClassName="faq-reveal-item"
            activeIndex={selected}
            onActiveIndexChange={(index) => {
              if (index < 0) return;
              manualOverrideRef.current = { baseStep: scrollStepRef.current };
              setSelected(index);
            }}
          />
        </div>
      </div>
    </section>
  );
}
