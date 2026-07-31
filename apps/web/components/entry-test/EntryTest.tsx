"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import {
  ArrowRight,
  Check,
  CircleAlert,
  ShieldCheck,
} from "lucide-react";

import styles from "./EntryTest.module.css";

type Question = {
  id: string;
  prompt: string;
  topic: string;
  options: Array<{ id: string; text: string }>;
};

type TopicFeedback = {
  topic: string;
  correct: boolean;
  feedback: string;
  nextTopic: string | null;
  sources: Array<{ label: string; url?: string }>;
};

type TestResult = {
  score: number;
  maxScore: number;
  level: string;
  topicFeedback: TopicFeedback[];
  recommendedAction: { label: string; href: string };
  claimed?: boolean;
  xpAwarded?: number;
};

type AttemptResponse = {
  ok: boolean;
  status: "open" | "submitted" | "claimed";
  questions: Question[];
  result: TestResult | null;
  error?: string;
};

function resultTitle(level: string): string {
  if (level === "strong-foundation") return "Strong foundation";
  if (level === "building-foundation") return "Foundation in progress";
  return "Start with the foundations";
}

export function EntryTest() {
  const { ready, authenticated, login, getAccessToken } = usePrivy();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [claimRequested, setClaimRequested] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const response = await fetch("/api/entry-test/attempts", {
          method: "POST",
          credentials: "include",
        });
        const payload = await response.json() as AttemptResponse;
        if (!response.ok || !payload.ok) {
          throw new Error(payload.error ?? "The Entry Test could not start.");
        }
        if (cancelled) return;
        setQuestions(payload.questions);
        setResult(payload.result);
      } catch (startError) {
        if (!cancelled) {
          setError(
            startError instanceof Error
              ? startError.message
              : "The Entry Test could not start.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void start();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!claimRequested || !ready || !authenticated || result === null) {
      return;
    }
    let cancelled = false;
    async function claim() {
      setSaving(true);
      setError(null);
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) throw new Error("Your sign-in session is not ready.");
        const response = await fetch("/api/entry-test/claim", {
          method: "POST",
          credentials: "include",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const payload = await response.json() as {
          ok: boolean;
          result?: TestResult;
          error?: string;
        };
        if (!response.ok || !payload.ok || !payload.result) {
          throw new Error(payload.error ?? "Your result could not be saved.");
        }
        if (!cancelled) {
          setResult(payload.result);
          setClaimRequested(false);
        }
      } catch (claimError) {
        if (!cancelled) {
          setError(
            claimError instanceof Error
              ? claimError.message
              : "Your result could not be saved.",
          );
          setClaimRequested(false);
        }
      } finally {
        if (!cancelled) setSaving(false);
      }
    }
    void claim();
    return () => {
      cancelled = true;
    };
  }, [
    authenticated,
    claimRequested,
    getAccessToken,
    ready,
    result,
  ]);

  async function selectAnswer(questionId: string, optionId: string) {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/entry-test/responses", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, optionId }),
      });
      const payload = await response.json() as { ok: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Your answer could not be saved.");
      }
      setAnswers((current) => ({ ...current, [questionId]: optionId }));
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Your answer could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/entry-test/submit", {
        method: "POST",
        credentials: "include",
      });
      const payload = await response.json() as {
        ok: boolean;
        result?: TestResult;
        error?: string;
      };
      if (!response.ok || !payload.ok || !payload.result) {
        throw new Error(payload.error ?? "The Entry Test could not be scored.");
      }
      setResult(payload.result);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The Entry Test could not be scored.",
      );
    } finally {
      setSaving(false);
    }
  }

  function requestClaim() {
    setClaimRequested(true);
    if (ready && !authenticated) login();
  }

  if (loading) {
    return (
      <main className={styles.shell}>
        <div className={styles.loading}>Preparing your Entry Test…</div>
      </main>
    );
  }

  if (error && questions.length === 0 && !result) {
    return (
      <main className={styles.shell}>
        <section className={styles.errorCard}>
          <CircleAlert aria-hidden="true" />
          <h1>Entry Test unavailable</h1>
          <p>{error}</p>
          <Link href="/">Return home</Link>
        </section>
      </main>
    );
  }

  if (result) {
    return (
      <main className={styles.shell}>
        <section className={styles.resultHeader}>
          <span>Iron Vault Entry Test</span>
          <p className={styles.score}>
            {result.score}<small>/{result.maxScore}</small>
          </p>
          <h1>{resultTitle(result.level)}</h1>
          <p>
            This is a starting-point diagnosis, not a financial profile or an
            investment recommendation.
          </p>
        </section>

        <section className={styles.feedbackList} aria-label="Topic feedback">
          {result.topicFeedback.map((item) => (
            <article className={styles.feedback} key={item.topic}>
              <div data-correct={item.correct}>
                {item.correct ? <Check aria-hidden="true" /> : <CircleAlert aria-hidden="true" />}
              </div>
              <div>
                <span>{item.nextTopic ?? item.topic}</span>
                <p>{item.feedback}</p>
                {item.sources.length > 0 ? (
                  <p className={styles.sources}>
                    {item.sources.map((source, index) => (
                      <span key={source.label}>
                        {index > 0 ? " · " : ""}
                        {source.url ? (
                          <a href={source.url} rel="noreferrer" target="_blank">
                            {source.label}
                          </a>
                        ) : source.label}
                      </span>
                    ))}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </section>

        <section className={styles.claimCard}>
          <ShieldCheck aria-hidden="true" />
          {result.claimed ? (
            <>
              <div>
                <h2>Result saved</h2>
                <p>
                  Your member learning record now includes this diagnosis
                  {result.xpAwarded ? ` and ${result.xpAwarded} XP` : ""}.
                </p>
              </div>
              <Link
                className={styles.primaryButton}
                href={result.recommendedAction.href}
              >
                {result.recommendedAction.label}
                <ArrowRight aria-hidden="true" />
              </Link>
            </>
          ) : (
            <>
              <div>
                <h2>Keep the result</h2>
                <p>
                  Sign in after receiving your feedback to save this attempt
                  and continue into free Foundations.
                </p>
              </div>
              <button
                className={styles.primaryButton}
                disabled={saving || claimRequested}
                onClick={requestClaim}
                type="button"
              >
                {saving || claimRequested ? "Saving…" : "Save and continue"}
                <ArrowRight aria-hidden="true" />
              </button>
            </>
          )}
          {error ? <p className={styles.inlineError}>{error}</p> : null}
        </section>
      </main>
    );
  }

  const question = questions[currentIndex];
  if (!question) return null;
  const selected = answers[question.id];
  const isLast = currentIndex === questions.length - 1;

  return (
    <main className={styles.shell}>
      <header className={styles.testHeader}>
        <Link href="/">Iron Vault</Link>
        <span>Entry Test</span>
      </header>
      <section className={styles.questionCard}>
        <div className={styles.progress}>
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <div>
            <i style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
          </div>
        </div>
        <span className={styles.topic}>{question.topic.replaceAll("-", " ")}</span>
        <h1>{question.prompt}</h1>
        <div className={styles.options}>
          {question.options.map((option, index) => (
            <button
              className={styles.option}
              data-selected={selected === option.id}
              disabled={saving}
              key={option.id}
              onClick={() => void selectAnswer(question.id, option.id)}
              type="button"
            >
              <span>{String.fromCharCode(65 + index)}</span>
              {option.text}
              {selected === option.id ? <Check aria-hidden="true" /> : null}
            </button>
          ))}
        </div>
        <footer>
          <button
            disabled={currentIndex === 0 || saving}
            onClick={() => setCurrentIndex((index) => index - 1)}
            type="button"
          >
            Back
          </button>
          <button
            className={styles.primaryButton}
            disabled={!selected || saving}
            onClick={() => {
              if (isLast) void submit();
              else setCurrentIndex((index) => index + 1);
            }}
            type="button"
          >
            {saving ? "Saving…" : isLast ? "See my result" : "Next"}
            <ArrowRight aria-hidden="true" />
          </button>
        </footer>
        {error ? <p className={styles.inlineError}>{error}</p> : null}
      </section>
      <p className={styles.privacy}>
        No sign-up is required to take the test. Answers are scored on the
        server and stored under an anonymous attempt until you choose to save it.
      </p>
    </main>
  );
}
