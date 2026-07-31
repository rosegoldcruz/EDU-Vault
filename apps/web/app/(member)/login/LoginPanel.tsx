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
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const redirect = () => {
      if (cancelled || redirectedRef.current) return;
      redirectedRef.current = true;
      router.replace(destination);
    };
    const fail = () => setSessionFailed(true);
    const confirmSession = async (attempt = 0) => {
      const response = await fetch("/api/auth/privy-session", {
        credentials: "include",
        cache: "no-store",
      }).catch(() => null);
      if (cancelled) return;
      if (response?.ok) {
        redirect();
        return;
      }
      if (attempt < 5) {
        retryTimer = setTimeout(
          () => void confirmSession(attempt + 1),
          400 * (attempt + 1),
        );
      } else {
        fail();
      }
    };

    window.addEventListener("privy-server-session-ready", redirect);
    window.addEventListener("privy-server-session-failed", fail);
    void confirmSession();
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      window.removeEventListener("privy-server-session-ready", redirect);
      window.removeEventListener("privy-server-session-failed", fail);
    };
  }, [ready, authenticated, destination, router]);

  if (!ready) {
    return <p className="iv-member-auth-status">Restoring your secure session…</p>;
  }

  if (authenticated) {
    return (
      <p className="iv-member-auth-status">
        {sessionFailed ? "Session sync failed. Refresh and try again." : "Signed in. Redirecting…"}
      </p>
    );
  }

  return (
    <button type="button" className="iv-btn" onClick={() => login()}>
      Sign in with Privy
    </button>
  );
}
