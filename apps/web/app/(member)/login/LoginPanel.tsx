"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";

function safeReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export function LoginPanel({ returnTo }: { returnTo?: string }) {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();
  const destination = safeReturnTo(returnTo);
  const [sessionFailed, setSessionFailed] = useState(false);
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (!ready || !authenticated) return;

    const redirect = () => {
      if (redirectedRef.current) return;
      redirectedRef.current = true;
      router.replace(destination);
    };
    const fail = () => setSessionFailed(true);

    window.addEventListener("privy-server-session-ready", redirect);
    window.addEventListener("privy-server-session-failed", fail);
    return () => {
      window.removeEventListener("privy-server-session-ready", redirect);
      window.removeEventListener("privy-server-session-failed", fail);
    };
  }, [ready, authenticated, destination, router]);

  if (!ready) {
    return <p className="academy-status">Restoring your secure session…</p>;
  }

  if (authenticated) {
    return (
      <p className="academy-status">
        {sessionFailed ? "Session sync failed. Refresh and try again." : "Signed in. Redirecting…"}
      </p>
    );
  }

  return (
    <button type="button" className="academy-primary-button" onClick={() => login()}>
      Sign in with Privy
    </button>
  );
}
