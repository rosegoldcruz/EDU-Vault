"use client";

import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";

function safeReturnTo(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/academy";
}

export function LoginPanel({ appId, returnTo }: { appId: string | null; returnTo: string }) {
  if (!appId) {
    return (
      <div className="academy-notice academy-notice-error" role="alert">
        <strong>Privy configuration required</strong>
        <p>
          Set <code>NEXT_PUBLIC_PRIVY_APP_ID</code> and <code>PRIVY_APP_SECRET</code>,
          then register this origin in the Privy dashboard.
        </p>
      </div>
    );
  }
  return <ConfiguredLogin returnTo={safeReturnTo(returnTo)} />;
}

function ConfiguredLogin({ returnTo }: { returnTo: string }) {
  const { ready, authenticated, login } = usePrivy();

  useEffect(() => {
    if (ready && authenticated) window.location.assign(returnTo);
  }, [authenticated, ready, returnTo]);

  if (!ready) {
    return <p className="academy-status" role="status">Restoring your secure session…</p>;
  }
  if (authenticated) {
    return <p className="academy-status" role="status">Opening your academy…</p>;
  }
  return (
    <button className="academy-primary-button" type="button" onClick={login}>
      Sign in with Privy
    </button>
  );
}
