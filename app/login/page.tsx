import Link from "next/link";
import { AcademyProviders } from "@/app/academy/AcademyProviders";
import { getPublicPrivyAppId } from "@/lib/auth/privy";
import { LoginPanel } from "./LoginPanel";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo = "/academy" } = await searchParams;
  const appId = getPublicPrivyAppId();
  return (
    <AcademyProviders appId={appId}>
      <main className="academy-auth-page">
        <section className="academy-auth-card">
          <Link href="/" className="academy-eyebrow">Iron Vault | Vaulted Academy</Link>
          <span className="academy-kicker">Secure Vaulted Academy access</span>
          <h1>Continue your learning path.</h1>
          <p>
            Privy restores your identity and linked accounts. Your curriculum progress,
            XP, membership, and wallet selections remain in the Vaulted Academy database.
          </p>
          <LoginPanel appId={appId} returnTo={returnTo} />
          <small>Email, social, external Solana wallet, and embedded wallet methods follow the project’s Privy configuration.</small>
        </section>
      </main>
    </AcademyProviders>
  );
}
