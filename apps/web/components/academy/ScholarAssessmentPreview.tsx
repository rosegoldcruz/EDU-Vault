"use client";

import { useState } from "react";

import type { DraftAssessmentPreview } from "@/lib/server/draft-curriculum";

import styles from "./ScholarAssessmentPreview.module.css";

export function ScholarAssessmentPreview({ assessment }: { assessment: DraftAssessmentPreview }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const question = assessment.questions[index];
  const answered = Object.keys(answers).length;
  return (
    <section className={styles.assessment}>
      <header className={styles.topline}><span>Question {index + 1} of {assessment.questions.length}</span><span>{answered} answered</span></header>
      <div className={styles.progress}><i style={{ width: `${(answered / assessment.questions.length) * 100}%` }} /></div>
      <nav className={styles.questionNav} aria-label="Assessment questions">{assessment.questions.map((item, questionIndex) => <button type="button" key={item.id} onClick={() => setIndex(questionIndex)} aria-current={questionIndex === index ? "step" : undefined} data-answered={Boolean(answers[item.id])}>{questionIndex + 1}</button>)}</nav>
      <fieldset className={styles.question}>
        <legend>{question.prompt}</legend>
        {question.options.map((option) => <label key={option.id}><input type="radio" name={question.id} value={option.id} checked={answers[question.id] === option.id} onChange={() => { setAnswers((current) => ({ ...current, [question.id]: option.id })); setSubmitted(false); }} /><span>{option.text}</span></label>)}
      </fieldset>
      <footer className={styles.actions}>
        <button type="button" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}>Previous</button>
        {index < assessment.questions.length - 1 ? <button type="button" onClick={() => setIndex((value) => value + 1)}>Next question</button> : <button type="button" onClick={() => setSubmitted(true)}>Submit preview</button>}
      </footer>
      {submitted ? <p className={styles.notice} role="status">Preview mode — scoring disabled. Your selected option IDs were not submitted or saved.</p> : <p className={styles.notice}>Preview mode — scoring disabled.</p>}
    </section>
  );
}
