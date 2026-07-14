import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { AcademyError, startLesson } from "@/lib/academy/service";
import { requirePageUser } from "@/lib/auth/privy";
import { CompleteLessonButton } from "./CompleteLessonButton";

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requirePageUser(`/academy/lessons/${slug}`);
  let state;
  try {
    state = await startLesson(getDb(), user, slug);
  } catch (error) {
    if (error instanceof AcademyError && error.status === 404) notFound();
    if (error instanceof AcademyError && error.code === "LESSON_LOCKED") {
      return <main className="academy-app-main"><section className="academy-panel academy-locked"><span>Locked lesson</span><h1>This lesson is not available yet.</h1><p>{error.message}</p><Link className="academy-primary-button" href="/academy/paths/crypto-foundations">Return to learning path</Link></section></main>;
    }
    throw error;
  }
  const lesson = state.lessons.find((item) => item.slug === slug);
  if (!lesson) notFound();
  const index = state.lessons.findIndex((item) => item.id === lesson.id);
  const previous = state.lessons[index - 1];
  const next = state.lessons[index + 1];
  return (
    <main className="academy-app-main academy-lesson-page">
      <nav className="academy-breadcrumb" aria-label="Breadcrumb"><Link href="/academy">Vaulted Academy</Link><span>/</span><Link href="/academy/paths/crypto-foundations">{state.path.title}</Link><span>/</span><span>{lesson.title}</span></nav>
      <article className="academy-lesson-content"><header><span className="academy-kicker">{state.module.title} · Lesson {lesson.order}</span><h1>{lesson.title}</h1><p>{lesson.summary}</p><div><span>{lesson.estimatedMinutes} minutes</span><span>{lesson.xpValue} XP</span><span>{lesson.state}</span></div></header><div className="academy-reading"><p>{lesson.content}</p><aside><strong>Operational standard</strong><p>Iron Vault will never ask for your seed phrase or private key.</p></aside></div><CompleteLessonButton slug={slug} completed={lesson.state === "COMPLETED"} /></article>
      <nav className="academy-lesson-navigation">{previous ? <Link href={`/academy/lessons/${previous.slug}`}>← {previous.title}</Link> : <span />}{next && next.state !== "LOCKED" ? <Link href={`/academy/lessons/${next.slug}`}>{next.title} →</Link> : next ? <span title={next.lockedReason ?? undefined}>{next.title} · Locked</span> : <Link href="/academy">Back to Vaulted Academy dashboard →</Link>}</nav>
    </main>
  );
}
