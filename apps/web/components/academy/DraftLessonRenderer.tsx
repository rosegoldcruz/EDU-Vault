import Link from "next/link";

import type { CurriculumContentBlock } from "@/lib/curriculum/block-types";
import { scholarHref, type ScholarLesson } from "@/lib/server/scholar-academy";

import { ContentBlockRenderer } from "./ContentBlockRenderer";
import { NarrationPlayer } from "./NarrationPlayer";
import { ScholarLessonProgress } from "./ScholarLessonProgress";
import styles from "./LessonRenderer.module.css";

function collectText(value: unknown, result: string[]): void {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed && !/^https?:\/\//.test(trimmed)) result.push(trimmed);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectText(item, result);
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      if (!["id", "sourceType", "sourceIndex", "audioUrl", "timingUrl", "narrationContentHash", "generationOperation"].includes(key)) collectText(item, result);
    }
  }
}

function transcriptFor(title: string, blocks: CurriculumContentBlock[]): string {
  const result = [title];
  for (const block of blocks) if (block.type !== "narration") collectText(block.payload, result);
  return [...new Set(result)].join(". ");
}

export function DraftLessonRenderer({ preview }: { preview: ScholarLesson }) {
  const { lesson, summary } = preview;
  const narration = lesson.blocks.find((block) => block.type === "narration");
  const teachingBlocks = lesson.blocks.filter((block) => block.type !== "narration");
  const opening = teachingBlocks.find((block) => block.type === "quote" || block.type === "callout")?.payload.text;
  const objective = lesson.summary || teachingBlocks.find((block) => block.type === "body")?.payload.text;
  return (
    <>
      <article className={styles.lesson}>
        <header className={styles.lessonHeader}>
          <p>{lesson.pathway.title} / {lesson.course.title} / {lesson.module.title}</p>
          <h1>{lesson.title}</h1>
          {typeof opening === "string" ? <p>{opening}</p> : null}
          <dl>
            <dt>Learning time</dt><dd>{summary.minutes} minutes</dd>
            <dt>Assignments</dt><dd>{summary.assignmentCount}</dd>
            <dt>Interactions</dt><dd>{summary.interactionCount}</dd>
            <dt>Narration</dt><dd>{narration ? "Ready" : "Unavailable"}</dd>
          </dl>
        </header>
        {typeof objective === "string" && objective !== opening ? <aside className={styles.objective}><strong>Learning objective</strong><p>{objective}</p></aside> : null}
        {narration ? <NarrationPlayer title={typeof narration.payload.title === "string" ? narration.payload.title : "Vault Instructor"} transcript={transcriptFor(lesson.title, teachingBlocks)} /> : null}
        <div className={styles.blocks}>
          {teachingBlocks.map((block) => <ContentBlockRenderer block={block} key={block.id} />)}
        </div>
      </article>
      <ScholarLessonProgress lessonId={lesson.id} initialComplete={summary.state === "completed"} />
      <nav className={styles.lessonNav} aria-label="Lesson navigation">
        {preview.previous ? <Link href={scholarHref("lessons", preview.previous.slug)}>← {preview.previous.title}</Link> : <span>First lesson</span>}
        <Link href={scholarHref("modules", lesson.module.slug)}>Return to module</Link>
        {preview.next ? <Link href={scholarHref("lessons", preview.next.slug)}>{preview.next.title} →</Link> : <span>Final lesson</span>}
      </nav>
    </>
  );
}
