import { getDb } from "@/db";
import { getAcademyState } from "@/lib/academy/service";
import { getPublicPrivyAppId, requirePageUser } from "@/lib/auth/privy";
import { AcademyProviders } from "@/app/academy/AcademyProviders";
import { AppChrome } from "@/app/academy/AppChrome";
import { WalletManager } from "./WalletManager";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requirePageUser("/account");
  const state = await getAcademyState(getDb(), user.id);
  return (
    <AcademyProviders appId={getPublicPrivyAppId()}>
      <AppChrome user={user}>
        <main className="academy-app-main">
          <div className="academy-page-heading"><div><span className="academy-kicker">Account & wallet ownership</span><h1>Your identity. Your verified destinations.</h1><p>Authentication methods and wallet ownership are tracked separately.</p></div></div>
          <section className="academy-metric-grid"><article><span>Internal user ID</span><code>{state.user.id}</code></article><article><span>Privy identity</span><code>{state.user.privyUserId}</code></article><article><span>Authority role</span><strong>{state.user.role}</strong></article><article><span>Content entitlement</span><strong>{state.user.membershipTier}</strong><small>{state.user.membershipStatus}</small></article></section>
          <section className="academy-panel"><span className="academy-kicker">Solana wallet management</span><h2>Verify and select wallets</h2><p>A primary wallet identifies your normal onchain account. A reward wallet is a separate, explicit future payout destination. No payout occurs in this phase.</p><WalletManager savedWallets={state.wallets} /></section>
        </main>
      </AppChrome>
    </AcademyProviders>
  );
}
