"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@privy-io/react-auth";

export function RefreshSession({ returnTo }: { returnTo: string }) {
  const [message, setMessage] = useState("Restoring your secure session…");
  useEffect(() => {
    void getAccessToken()
      .then((token) => {
        window.location.assign(
          token
            ? returnTo
            : `/login?returnTo=${encodeURIComponent(returnTo)}`,
        );
      })
      .catch(() => {
        setMessage("Your session expired. Returning to sign in…");
        window.location.assign(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      });
  }, [returnTo]);
  return <p className="academy-status" role="status">{message}</p>;
}
