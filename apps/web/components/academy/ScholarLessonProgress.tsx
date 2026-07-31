"use client";

import { useEffect, useState } from "react";

import styles from "./LessonRenderer.module.css";

export function ScholarLessonProgress({ lessonId, initialComplete }: { lessonId: string; initialComplete: boolean }) {
  const [complete, setComplete] = useState(initialComplete);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(`iv-scholar-position:${lessonId}`);
    if (!saved) return;
    const position = Number(saved);
    if (Number.isFinite(position) && position > 0) window.scrollTo({ top: position, behavior: "instant" });
    const onScroll = () => window.localStorage.setItem(`iv-scholar-position:${lessonId}`, String(Math.round(window.scrollY)));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lessonId]);

  async function update() {
    setSaving(true);
    setMessage("");
    const nextComplete = !complete;
    try {
      const response = await fetch("/api/academy/preview/scholar/progress", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lessonId, complete: nextComplete }),
      });
      if (!response.ok) throw new Error("Unable to save progress");
      setComplete(nextComplete);
      setMessage(nextComplete ? "Lesson complete. No XP was awarded in preview mode." : "Lesson returned to in progress.");
    } catch {
      setMessage("Progress could not be saved. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return <section className={styles.completion}><button type="button" onClick={update} disabled={saving}>{saving ? "Saving…" : complete ? "Mark as in progress" : "Complete lesson"}</button>{message ? <p role="status">{message}</p> : null}<small>Your reading position is saved on this device.</small></section>;
}
