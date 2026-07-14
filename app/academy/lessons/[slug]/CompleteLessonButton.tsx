"use client";

import { useState } from "react";
import { getAccessToken } from "@privy-io/react-auth";

export function CompleteLessonButton({ slug, completed }: { slug: string; completed: boolean }) {
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">(completed ? "done" : "idle");
  const [error, setError] = useState<string | null>(null);
  async function complete() {
    setState("saving");
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Your session expired. Sign in again.");
      const response = await fetch("/api/academy/lessons/complete", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ lessonSlug: slug }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Completion could not be saved.");
      setState("done");
      window.location.reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Completion could not be saved.");
      setState("error");
    }
  }
  return (
    <div className="academy-complete-action">
      <button className="academy-primary-button" type="button" disabled={state === "saving" || state === "done"} onClick={() => void complete()}>
        {state === "saving" ? "Saving completion…" : state === "done" ? "Lesson completed" : "Complete lesson"}
      </button>
      {error ? <p className="academy-error" role="alert">{error}</p> : null}
    </div>
  );
}
