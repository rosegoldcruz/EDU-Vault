"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { ArrowRight, Check, LoaderCircle, Save } from "lucide-react";

import styles from "./LessonProgressControl.module.css";

type LearningState = {
  status: "not_started" | "started" | "completed";
  percentComplete: number;
  xpAwarded: number;
  xpTotal: number;
  nextLesson: { slug: string; title: string } | null;
};

export function LessonProgressControl({
  lessonSlug,
  xpValue,
}: {
  lessonSlug: string;
  xpValue: number;
}) {
  const { ready, authenticated, login, getAccessToken } = usePrivy();
  const [state, setState] = useState<LearningState | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(async (action: "start" | "complete") => {
    setWorking(true);
    setError(null);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Your sign-in session is not ready.");
      const response = await fetch(
        `/api/academy/lessons/${encodeURIComponent(lessonSlug)}/progress`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        },
      );
      const payload = await response.json() as {
        ok: boolean;
        state?: LearningState;
        error?: string;
      };
      if (!response.ok || !payload.ok || !payload.state) {
        throw new Error(payload.error ?? "Progress could not be saved.");
      }
      setState(payload.state);
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Progress could not be saved.",
      );
    } finally {
      setWorking(false);
    }
  }, [getAccessToken, lessonSlug]);

  useEffect(() => {
    if (!ready || !authenticated || state !== null || working) return;
    const timer = window.setTimeout(() => void update("start"), 0);
    return () => window.clearTimeout(timer);
  }, [authenticated, ready, state, update, working]);

  if (!ready) {
    return (
      <section className={styles.card}>
        <LoaderCircle className={styles.spinner} aria-hidden="true" />
        <p>Preparing progress controls…</p>
      </section>
    );
  }

  if (!authenticated) {
    return (
      <section className={styles.card}>
        <Save aria-hidden="true" />
        <div>
          <h2>Save your learning progress</h2>
          <p>
            This lesson is free to read. Sign in when you want to save
            completion and earn {xpValue} XP.
          </p>
        </div>
        <button onClick={login} type="button">Sign in to save</button>
      </section>
    );
  }

  if (state?.status === "completed") {
    return (
      <section className={styles.card} data-complete="true">
        <Check aria-hidden="true" />
        <div>
          <h2>Lesson complete</h2>
          <p>
            {state.xpAwarded > 0
              ? `${state.xpAwarded} XP added. `
              : "Completion is already saved. "}
            Your total is {state.xpTotal} XP.
          </p>
        </div>
        {state.nextLesson ? (
          <Link href={`/academy/lessons/${state.nextLesson.slug}`}>
            Next lesson <ArrowRight aria-hidden="true" />
          </Link>
        ) : (
          <Link href="/academy">Return to Academy</Link>
        )}
      </section>
    );
  }

  return (
    <section className={styles.card}>
      <Save aria-hidden="true" />
      <div>
        <h2>Finish this lesson</h2>
        <p>
          Mark it complete to save your progress and earn {xpValue} XP once.
        </p>
        {error ? <p className={styles.error}>{error}</p> : null}
      </div>
      <button
        disabled={working || state === null}
        onClick={() => void update("complete")}
        type="button"
      >
        {working || state === null ? "Saving…" : "Complete lesson"}
      </button>
    </section>
  );
}
