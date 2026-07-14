import Link from "next/link";
import { getDb } from "@/db";
import { getAcademyState } from "@/lib/academy/service";
import { requirePageUser } from "@/lib/auth/privy";

export default async function AcademyDashboard() {
  const user = await requirePageUser("/academy");
  const state = await getAcademyState(getDb(), user.id);
  const rewardWallet = state.wallets.find((wallet) => wallet.isReward);
  const connected = state.wallets.length;
  return (
    <main className="academy-app-main">
      <div className="academy-page-heading">
        <div><span className="academy-kicker">Academy dashboard</span><h1>Your next move is clear.</h1></div>
        <Link className="academy-primary-button" href={`/academy/lessons/${state.nextLesson?.slug ?? "wallet-ownership"}`}>
          {state.progressPercent === 100 ? "Review the module" : "Continue learning"}
        </Link>
      </div>
      <section className="academy-metric-grid" aria-label="Academy status">
        <article><span>Membership</span><strong>{state.user.membershipTier}</strong><small>{state.user.membershipStatus}</small></article>
        <article><span>Path progress</span><strong>{state.progressPercent}%</strong><small>{state.module.title}</small></article>
        <article><span>XP earned</span><strong>{state.xpTotal}</strong><small>From verified completion events</small></article>
        <article><span>Wallet readiness</span><strong>{connected ? `${connected} linked` : "Not linked"}</strong><small>{rewardWallet ? "Reward wallet selected" : "Reward wallet not selected"}</small></article>
      </section>
      <section className="academy-panel academy-current-path">
        <div>
          <span className="academy-kicker">Current learning path</span>
          <h2>{state.path.title}</h2>
          <p>{state.path.outcome}</p>
          <div className="academy-progress-track"><i style={{ width: `${state.progressPercent}%` }} /></div>
        </div>
        <ol className="academy-lesson-list">
          {state.lessons.map((lesson) => (
            <li key={lesson.id} data-state={lesson.state.toLowerCase()}>
              <span>{String(lesson.order).padStart(2, "0")}</span>
              <div><strong>{lesson.title}</strong><small>{lesson.state === "LOCKED" ? lesson.lockedReason : lesson.state}</small></div>
              {lesson.state === "LOCKED" ? <i aria-label="Locked">Locked</i> : <Link href={`/academy/lessons/${lesson.slug}`}>Open</Link>}
            </li>
          ))}
        </ol>
      </section>
      <section className="academy-panel">
        <span className="academy-kicker">Recent completion activity</span>
        {state.recentActivity.length ? (
          <ul className="academy-activity-list">{state.recentActivity.map((event) => <li key={event.id}><strong>Lesson completed</strong><span>+{event.amount} XP</span><time>{event.createdAt.toLocaleDateString()}</time></li>)}</ul>
        ) : <p className="academy-empty">Complete your first lesson to begin your activity history.</p>}
      </section>
    </main>
  );
}
