import type { CurriculumLesson } from "@/lib/curriculum/block-types";

import { ContentBlockRenderer } from "./ContentBlockRenderer";
import { LessonProgressControl } from "./LessonProgressControl";
import styles from "./LessonRenderer.module.css";

export function LessonRenderer({ lesson }: { lesson: CurriculumLesson }) {
  return (
    <article className={styles.lesson}>
      <header className={styles.lessonHeader}>
        <p>{lesson.pathway.title} / {lesson.module.title}</p>
        <h1>{lesson.title}</h1>
        {lesson.summary ? <p>{lesson.summary}</p> : null}
        <dl>
          {lesson.estimatedMinutes ? (
            <>
              <dt>Time</dt>
              <dd>{lesson.estimatedMinutes} minutes</dd>
            </>
          ) : null}
          <dt>Access</dt>
          <dd>{lesson.accessClass}</dd>
          <dt>XP</dt>
          <dd>{lesson.xpValue}</dd>
        </dl>
      </header>
      <div className={styles.blocks}>
        {lesson.blocks.map((block) => (
          <ContentBlockRenderer block={block} key={block.id} />
        ))}
      </div>
      <LessonProgressControl
        lessonSlug={lesson.slug}
        xpValue={lesson.xpValue}
      />
    </article>
  );
}
