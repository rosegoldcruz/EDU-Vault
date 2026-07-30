import Link from "next/link";
import { LoginPanel } from "./LoginPanel";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo = "/dashboard" } = await searchParams;
  return (
    <main className="academy-auth-page">
      <section className="academy-auth-card">
        <Link href="/" className="academy-eyebrow">Iron Vault | Vaulted Academy</Link>
        <span className="academy-kicker">Secure member access</span>
        <h1>Continue your learning path.</h1>
        <p>
          Privy restores your identity and linked accounts. Your curriculum progress,
          XP, membership, and entitlements stay attached to your member profile.
        </p>
        <LoginPanel returnTo={returnTo} />
        <small>Email and Solana wallet sign-in follow the project&rsquo;s Privy configuration.</small>
      </section>
    </main>
  );
}
