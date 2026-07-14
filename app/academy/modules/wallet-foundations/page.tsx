import Link from "next/link";
import { getDb } from "@/db";
import { getAcademyState } from "@/lib/academy/service";
import { requirePageUser } from "@/lib/auth/privy";

export default async function WalletFoundationsModulePage() {
  const user = await requirePageUser("/academy/modules/wallet-foundations");
  const state = await getAcademyState(getDb(), user.id);

  return (
    <main className="academy-app-main">
      <nav className="academy-breadcrumb" aria-label="Breadcrumb">
        <Link href="/academy">Vaulted Academy</Link>
        <span>/</span>
        <Link href="/academy/paths/crypto-foundations">{state.path.title}</Link>
        <span>/</span>
        <span>{state.module.title}</span>
      </nav>
      <div className="academy-page-heading">
        <div>
          <span className="academy-kicker">Module 01</span>
          <h1>{state.module.title}</h1>
          <p>{state.module.description}</p>
        </div>
        <strong>{state.progressPercent}% complete</strong>
      </div>
      <section className="academy-panel">
        <ol className="academy-lesson-list">
          {state.lessons.map((lesson) => (
            <li key={lesson.id} data-state={lesson.state.toLowerCase()}>
              <span>{String(lesson.order).padStart(2, "0")}</span>
              <div>
                <strong>{lesson.title}</strong>
                <small>
                  {lesson.estimatedMinutes} min · {lesson.xpValue} XP · {lesson.state}
                </small>
              </div>
              {lesson.state === "LOCKED" ? (
                <i title={lesson.lockedReason ?? undefined}>Locked</i>
              ) : (
                <Link href={`/academy/lessons/${lesson.slug}`}>Open</Link>
              )}
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
