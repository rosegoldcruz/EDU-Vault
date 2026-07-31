import Link from "next/link";
import type { ReactNode } from "react";

import {
  scholarHref,
  type LearningState,
  type ScholarAcademy,
  type ScholarCourse,
  type ScholarModule,
  type ScholarPathway,
} from "@/lib/server/scholar-academy";

import styles from "./ScholarAcademy.module.css";

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} hr ${remainder} min` : `${hours} hr`;
}

export function State({ value }: { value: LearningState }) {
  return <span className={styles.status} data-state={value}>{value.replace("-", " ")}</span>;
}

export function Breadcrumbs({ children }: { children: ReactNode }) {
  return <nav className={styles.breadcrumbs} aria-label="Breadcrumb"><Link href={scholarHref()}>Academy</Link><span>/</span>{children}</nav>;
}

export function AcademyHome({ academy }: { academy: ScholarAcademy }) {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <h1>Build knowledge that compounds.</h1>
          <p>Move from financial foundations through blockchain, digital assets, DeFi, tokenization, and advanced systems—one clear lesson at a time.</p>
        </div>
        <aside className={styles.heroAction}>
          <small>{academy.completedLessons ? "Continue learning" : "Your first lesson"}</small>
          <strong>{academy.nextLesson.title}</strong>
          <span className={styles.meta}>{academy.nextLesson.moduleTitle} · {formatMinutes(academy.nextLesson.minutes)}</span>
          <Link className={styles.button} href={scholarHref("lessons", academy.nextLesson.slug)}>{academy.completedLessons ? "Continue lesson" : "Start learning"}</Link>
          <div className={styles.progressTrack} aria-label={`${academy.percentComplete}% complete`}><i style={{ width: `${academy.percentComplete}%` }} /></div>
          <small>{academy.completedLessons} of {academy.counts.lessons} lessons complete</small>
        </aside>
      </section>

      <section className={styles.stats} aria-label="Academy overview">
        <div><strong>{academy.counts.pathways}</strong><span>Learning pathways</span></div>
        <div><strong>{academy.counts.courses}</strong><span>Courses</span></div>
        <div><strong>{academy.counts.lessons}</strong><span>Complete lessons</span></div>
        <div><strong>{academy.counts.assessments}</strong><span>Assessments</span></div>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeading}>
          <h2>Choose your pathway</h2>
          <p>Every pathway is open for owner review. Your progress is saved without changing the live member curriculum.</p>
        </header>
        <div className={styles.grid}>
          {academy.pathways.map((pathway) => <PathwayCard pathway={pathway} key={pathway.id} />)}
        </div>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeading}><h2>Recommended next courses</h2><p>Start with foundations or continue the first course already in progress.</p></header>
        <div className={styles.gridThree}>
          {academy.pathways.flatMap((pathway) => pathway.courses).sort((a, b) => (a.state === "active" ? -1 : 0) - (b.state === "active" ? -1 : 0)).slice(0, 6).map((course) => <CourseCard course={course} key={course.id} />)}
        </div>
      </section>
    </main>
  );
}

export function PathwayCard({ pathway }: { pathway: ScholarPathway }) {
  return (
    <Link className={styles.card} href={scholarHref("pathways", pathway.slug)}>
      <State value={pathway.state} />
      <h2>{pathway.title}</h2>
      <p>{pathway.description}</p>
      <div className={styles.cardFooter}><span>{pathway.courses.length} courses · {pathway.lessonCount} lessons</span><small>{formatMinutes(pathway.minutes)}</small></div>
    </Link>
  );
}

export function CourseCard({ course }: { course: ScholarCourse }) {
  return (
    <Link className={styles.card} href={scholarHref("courses", course.slug)}>
      <State value={course.state} />
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      <div className={styles.cardFooter}><span>{course.modules.length} module{course.modules.length === 1 ? "" : "s"} · {course.lessonCount} lessons</span><small>{formatMinutes(course.minutes)}</small></div>
    </Link>
  );
}

export function ModuleCard({ module }: { module: ScholarModule }) {
  return (
    <article className={`${styles.card} ${styles.moduleCard}`}>
      <div className={styles.moduleCardHeader}><div><State value={module.state} /><h3>{module.title}</h3></div><span className={styles.meta}>{formatMinutes(module.minutes)}</span></div>
      <p>{module.description}</p>
      <div className={styles.cardFooter}><span>{module.lessons.length} lessons · {module.assignmentCount} assignments</span><Link className={styles.buttonSecondary} href={scholarHref("modules", module.slug)}>{module.state === "not-started" ? "Start module" : "Continue"}</Link></div>
    </article>
  );
}

export function PathwayView({ pathway }: { pathway: ScholarPathway }) {
  return (
    <main className={styles.page}>
      <Breadcrumbs><span>{pathway.title}</span></Breadcrumbs>
      <div className={styles.detailLayout}>
        <aside className={styles.detailRail}>
          <State value={pathway.state} /><h1>{pathway.title}</h1><p>{pathway.description}</p>
          <ul className={styles.outcomes}><li>{pathway.outcome}</li><li>Complete exercises and assessments as you advance.</li></ul>
          <dl><div><dt>Courses</dt><dd>{pathway.courses.length}</dd></div><div><dt>Modules</dt><dd>{pathway.moduleCount}</dd></div><div><dt>Lessons</dt><dd>{pathway.lessonCount}</dd></div><div><dt>Learning time</dt><dd>{formatMinutes(pathway.minutes)}</dd></div><div><dt>Progress</dt><dd>{pathway.percentComplete}%</dd></div></dl>
          <Link className={styles.button} href={scholarHref("courses", pathway.courses[0].slug)}>{pathway.state === "not-started" ? "Start pathway" : "Continue pathway"}</Link>
        </aside>
        <section className={styles.stack} aria-label={`${pathway.title} courses`}>{pathway.courses.map((course) => <CourseCard course={course} key={course.id} />)}</section>
      </div>
    </main>
  );
}

export function CourseView({ course, pathway }: { course: ScholarCourse; pathway: ScholarPathway }) {
  return (
    <main className={styles.page}>
      <Breadcrumbs><Link href={scholarHref("pathways", pathway.slug)}>{pathway.title}</Link><span>/</span><span>{course.title}</span></Breadcrumbs>
      <div className={styles.detailLayout}>
        <aside className={styles.detailRail}>
          <State value={course.state} /><h1>{course.title}</h1><p>{course.description}</p>
          <ul className={styles.outcomes}><li>{course.outcome}</li><li>Apply each concept through {course.assignmentCount} practical assignment{course.assignmentCount === 1 ? "" : "s"}.</li></ul>
          <dl><div><dt>Modules</dt><dd>{course.modules.length}</dd></div><div><dt>Lessons</dt><dd>{course.lessonCount}</dd></div><div><dt>Assignments</dt><dd>{course.assignmentCount}</dd></div><div><dt>Learning time</dt><dd>{formatMinutes(course.minutes)}</dd></div><div><dt>Progress</dt><dd>{course.percentComplete}%</dd></div><div><dt>Prerequisites</dt><dd>Open for review</dd></div></dl>
          <Link className={styles.button} href={scholarHref("modules", course.modules[0].slug)}>{course.state === "not-started" ? "Start course" : "Continue course"}</Link>
        </aside>
        <section className={styles.stack} aria-label={`${course.title} modules`}>{course.modules.map((module) => <ModuleCard module={module} key={module.id} />)}</section>
      </div>
    </main>
  );
}

export { styles as scholarStyles };
