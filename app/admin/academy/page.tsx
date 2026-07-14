import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { AcademyError, getAdminInspection } from "@/lib/academy/service";
import { getPublicPrivyAppId, requirePageUser } from "@/lib/auth/privy";
import { AcademyProviders } from "@/app/academy/AcademyProviders";
import { AppChrome } from "@/app/academy/AppChrome";

export const dynamic = "force-dynamic";

export default async function AcademyAdminPage() {
  const actor = await requirePageUser("/admin/academy");
  let records;
  try {
    records = await getAdminInspection(getDb(), actor);
  } catch (error) {
    if (error instanceof AcademyError && error.status === 403) notFound();
    throw error;
  }
  return (
    <AcademyProviders appId={getPublicPrivyAppId()}>
      <AppChrome user={actor}>
        <main className="academy-app-main"><div className="academy-page-heading"><div><span className="academy-kicker">Administrator inspection</span><h1>Vaulted Academy foundation records</h1><p>Read-only identity, entitlement, wallet, progress, and XP evidence.</p></div></div><section className="academy-admin-list">{records.length ? records.map(({ user, wallets, completions, moduleProgress, xpEvents }) => <article className="academy-panel" key={user.id}><header><div><strong>{user.displayName ?? user.primaryEmail ?? user.id}</strong><code>{user.id}</code></div><span>{user.role} · {user.membershipTier} · {user.membershipStatus}</span></header><dl><div><dt>Privy user</dt><dd>{user.privyUserId}</dd></div><div><dt>Wallets</dt><dd>{wallets.length} ({wallets.filter((wallet) => wallet.ownershipStatus === "VERIFIED").length} verified)</dd></div><div><dt>Reward wallet</dt><dd>{wallets.find((wallet) => wallet.isReward)?.address ?? "Not selected"}</dd></div><div><dt>Lesson completions</dt><dd>{completions.filter((item) => item.status === "COMPLETED").length}</dd></div><div><dt>Module progress</dt><dd>{moduleProgress[0]?.percentComplete ?? 0}%</dd></div><div><dt>XP events</dt><dd>{xpEvents.length} / {xpEvents.reduce((total, event) => total + event.amount, 0)} XP</dd></div></dl></article>) : <p className="academy-empty">No Vaulted Academy users have signed in yet.</p>}</section></main>
      </AppChrome>
    </AcademyProviders>
  );
}
