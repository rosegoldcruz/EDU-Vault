"use client";

import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";

export function AppChrome({
  user,
  children,
}: {
  user: { displayName: string | null; primaryEmail: string | null; role: string };
  children: React.ReactNode;
}) {
  const { logout } = usePrivy();
  return (
    <div className="academy-app">
      <header className="academy-app-header">
        <Link href="/" className="academy-app-brand">Iron Vault | Vaulted Academy</Link>
        <nav aria-label="Vaulted Academy navigation">
          <Link href="/academy">Dashboard</Link>
          <Link href="/academy/paths/crypto-foundations">Learning path</Link>
          <Link href="/account">Account & wallets</Link>
          {user.role === "ADMIN" ? <Link href="/admin/academy">Admin</Link> : null}
        </nav>
        <button
          type="button"
          className="academy-quiet-button"
          onClick={() => void logout().then(() => window.location.assign("/login"))}
        >
          Sign out
        </button>
      </header>
      <div className="academy-app-identity">
        <span>{user.displayName ?? user.primaryEmail ?? "Vaulted Academy member"}</span>
        <em>{user.role}</em>
      </div>
      {children}
    </div>
  );
}
