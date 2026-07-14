import Link from "next/link";
import { getDb } from "@/db";
import { getAcademyState } from "@/lib/academy/service";
import { requirePageUser } from "@/lib/auth/privy";

export default async function LearningPathPage() {
  const user = await requirePageUser("/academy/paths/crypto-foundations");
  const state = await getAcademyState(getDb(), user.id);
  return (
    <main className="academy-app-main">
      <div className="academy-page-heading"><div><span className="academy-kicker">Learning path</span><h1>{state.path.title}</h1><p>{state.path.description}</p></div><strong>{state.progressPercent}% complete</strong></div>
      <section className="academy-panel academy-path-detail">
        <div className="academy-detail-rail"><span>Outcome</span><p>{state.path.outcome}</p><dl><div><dt>Difficulty</dt><dd>{state.path.difficulty}</dd></div><div><dt>Duration</dt><dd>{state.path.estimatedMinutes} minutes</dd></div><div><dt>Lessons</dt><dd>{state.lessons.length}</dd></div></dl></div>
        <article><span className="academy-kicker">Module 01</span><h2><Link href="/academy/modules/wallet-foundations">{state.module.title}</Link></h2><p>{state.module.description}</p><ol className="academy-lesson-list">{state.lessons.map((lesson) => <li key={lesson.id} data-state={lesson.state.toLowerCase()}><span>{String(lesson.order).padStart(2, "0")}</span><div><strong>{lesson.title}</strong><small>{lesson.estimatedMinutes} min · {lesson.xpValue} XP · {lesson.state}</small></div>{lesson.state === "LOCKED" ? <i>Locked</i> : <Link href={`/academy/lessons/${lesson.slug}`}>Open</Link>}</li>)}</ol></article>
      </section>
    </main>
  );
}
