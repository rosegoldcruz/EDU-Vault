"use client";

import { useRef, useState } from "react";
import { useScrollSteps } from "./useScrollSteps";

const lessons = [
  {
    title: "Wallet ownership",
    guidance: "Understand who can authorize a transaction and why control begins with keys.",
    assessment: "Knowledge check complete",
    next: "Transaction signing",
  },
  {
    title: "Transaction signing",
    guidance: "Read what a wallet is asking you to approve before an action moves onchain.",
    assessment: "Knowledge check ready",
    next: "Custody models",
  },
  {
    title: "Custody models",
    guidance: "Compare self-custody and managed custody through control, recovery, and risk.",
    assessment: "Knowledge check available",
    next: "Knowledge check",
  },
  {
    title: "Knowledge check",
    guidance: "Verify the core ideas behind wallet ownership, signing, and custody decisions.",
    assessment: "Assessment ready",
    next: "Continue the learning path",
  },
];

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={direction === "left" ? "chevron-left" : ""}>
      <path d="m5.5 3 5 5-5 5" />
    </svg>
  );
}

export function AcademyExperience() {
  const [selectedLesson, setSelectedLesson] = useState(0);
  const storyRef = useRef<HTMLDivElement>(null);
  const lesson = lessons[selectedLesson];

  useScrollSteps({
    rootRef: storyRef,
    stepCount: lessons.length,
    onStepChange: setSelectedLesson,
    pinSelector: ".academy-console-pinned",
    start: "top top+=84px",
    stepViewportRatio: 0.72,
    refreshPriority: 2,
  });

  const move = (direction: -1 | 1) => {
    setSelectedLesson((current) => (current + direction + lessons.length) % lessons.length);
  };

  return (
    <div className="academy-experience-story" ref={storyRef}>
    <div className="academy-console academy-console-pinned" aria-label="Neutral academy interface preview">
      <aside className="academy-sidebar">
        <div className="academy-path">
          <span>Current path</span>
          <strong>Crypto Foundations</strong>
          <em>In progress</em>
        </div>

        <div className="lesson-nav">
          <span>Lesson navigation</span>
          {lessons.map((item, index) => (
            <button
              type="button"
              className={index === selectedLesson ? "is-selected" : ""}
              aria-pressed={index === selectedLesson}
              onClick={() => setSelectedLesson(index)}
              key={item.title}
            >
              <i aria-hidden="true" />
              {item.title}
            </button>
          ))}
        </div>

        <div className="recommended-next">
          <span>Recommended next</span>
          <strong>{lesson.next}</strong>
        </div>
      </aside>

      <div className="academy-main">
        <div className="academy-topline">
          <span>Learning state</span>
          <span>{String(selectedLesson + 1).padStart(2, "0")} / {String(lessons.length).padStart(2, "0")}</span>
        </div>

        <div className="academy-lesson-title">
          <i aria-hidden="true" />
          <div>
            <h3>{lesson.title}</h3>
            <p>{lesson.guidance}</p>
          </div>
        </div>

        <div className="academy-states">
          <article className="is-active">
            <span>01 / Assessment</span>
            <i aria-hidden="true">✓</i>
            <p>{lesson.assessment}</p>
          </article>
          <article>
            <span>02 / Progression</span>
            <i aria-hidden="true" />
            <p>Learning activity and mastery evidence</p>
          </article>
          <article>
            <span>03 / Milestone</span>
            <i aria-hidden="true" />
            <p>Eligibility reviewed at defined milestones</p>
          </article>
        </div>

        <div className="academy-controls">
          <span>Use the lesson rail or controls to explore the preview.</span>
          <div>
            <button type="button" onClick={() => move(-1)} aria-label="Previous lesson"><Chevron direction="left" /></button>
            <button type="button" onClick={() => move(1)} aria-label="Next lesson"><Chevron direction="right" /></button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
