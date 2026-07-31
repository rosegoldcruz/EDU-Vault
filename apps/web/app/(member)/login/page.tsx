import Link from "next/link";
import { LoginPanel } from "./LoginPanel";
import { ThemeToggle } from "@/app/iv/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo = "/dashboard" } = await searchParams;
  return (
    <main className="iv-member-auth">
      <header className="iv-member-auth-nav iv-shell">
        <Link href="/" className="iv-wordmark">Iron Vault <em>Vaulted Academy</em></Link>
        <ThemeToggle />
      </header>
      <section className="iv-member-auth-card">
        <span className="iv-label">Secure member access</span>
        <h1>Continue your <span className="iv-serif">learning path.</span></h1>
        <p>
          Privy restores your identity and linked accounts. Your curriculum progress,
          XP, membership, and entitlements stay attached to your member profile.
        </p>
        <LoginPanel returnTo={returnTo} />
        <small>Email and Solana wallet sign-in use Iron Vault&rsquo;s secure identity provider.</small>
      </section>
    </main>
  );
}
