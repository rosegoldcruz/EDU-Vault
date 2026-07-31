import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs, State, formatMinutes, scholarStyles as styles } from "@/components/academy/ScholarAcademyViews";
import { requireAdminAccess } from "@/lib/server/member-access";
import { getScholarModule, scholarHref } from "@/lib/server/scholar-academy";

export const dynamic = "force-dynamic";

export default async function ScholarModulePage({ params }: { params: Promise<{ moduleSlug: string }> }) {
  let access;
  try { access = await requireAdminAccess(); } catch { notFound(); }
  const { moduleSlug } = await params;
  const detail = await getScholarModule(moduleSlug, access.auth.privyUserId);
  if (!detail) notFound();
  const { module, course, pathway, previous, next } = detail;
  return (
    <main className={styles.page}>
      <Breadcrumbs><Link href={scholarHref("pathways", pathway.slug)}>{pathway.title}</Link><span>/</span><Link href={scholarHref("courses", course.slug)}>{course.title}</Link><span>/</span><span>{module.title}</span></Breadcrumbs>
      <section className={styles.hero}>
        <div><State value={module.state} /><h1>{module.title}</h1><p>{module.description}</p></div>
        <aside className={styles.heroAction}><strong>{module.lessons.length} lessons</strong><span className={styles.meta}>{formatMinutes(module.minutes)} · {module.assignmentCount} assignments</span><div className={styles.progressTrack}><i style={{ width: `${module.percentComplete}%` }} /></div><Link className={styles.button} href={scholarHref("lessons", module.lessons.find((lesson) => lesson.state !== "completed")?.slug ?? module.lessons[0].slug)}>{module.state === "not-started" ? "Start module" : "Continue module"}</Link></aside>
      </section>
      <section className={styles.section}>
        <header className={styles.sectionHeading}><h2>Lessons</h2><p>Work through the lessons in order, or open any lesson directly during owner review.</p></header>
        <ol className={styles.lessonList}>
          {module.lessons.map((lesson, index) => <li key={lesson.id}><span>{String(index + 1).padStart(2, "0")}</span><Link href={scholarHref("lessons", lesson.slug)}><strong>{lesson.title}</strong><small>{formatMinutes(lesson.minutes)} · {lesson.assignmentCount} assignment{lesson.assignmentCount === 1 ? "" : "s"}{lesson.interactionCount ? ` · ${lesson.interactionCount} interaction${lesson.interactionCount === 1 ? "" : "s"}` : ""}</small></Link><State value={lesson.state} /></li>)}
        </ol>
        {module.assessment ? <Link className={styles.assessmentLink} href={scholarHref("assessments", module.assessment.slug)}><div><strong>{module.assessment.title}</strong><p className={styles.meta}>{module.assessment.questionCount} questions · Preview mode</p></div><span>Open assessment</span></Link> : null}
        <nav className={styles.navigation} aria-label="Module navigation">{previous ? <Link href={scholarHref("modules", previous.slug)}>← {previous.title}</Link> : <span>First module</span>}{next ? <Link href={scholarHref("modules", next.slug)}>{next.title} →</Link> : <span>Final module</span>}</nav>
      </section>
    </main>
  );
}
