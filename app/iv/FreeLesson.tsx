"use client";

import { useEffect, useRef, useState } from "react";

const options = [
  { id: "a", label: "Whoever holds the private keys controls the assets." },
  { id: "b", label: "The exchange where the wallet was created controls it." },
  { id: "c", label: "The blockchain validators control every wallet." },
];

const correctOption = "a";

/**
 * Free micro-lesson: runs entirely in-page, no account required.
 * Explanation → diagram → comprehension check → completion state.
 */
export function FreeLesson() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const answered = selected !== null;
  const correct = selected === correctOption;

  useEffect(() => {
    if (open && dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal();
  }, [open]);

  const close = () => {
    dialogRef.current?.close();
    setOpen(false);
    setSelected(null);
  };

  return (
    <>
      <button className="iv-track-free" type="button" onClick={() => setOpen(true)}>
        <div className="iv-track-top">
          <span className="iv-track-code">Free lesson</span>
          <span className="iv-chip">No account needed</span>
        </div>
        <h3><span>Try a 3-minute lesson</span>Keys, Wallets, and Custody</h3>
        <div className="iv-track-meta">
          <span>1 comprehension check</span>
          <span>Opens without leaving this page</span>
        </div>
      </button>

      {open && <dialog
        className="iv-dialog iv-lesson-dialog"
        ref={dialogRef}
        aria-labelledby="iv-free-lesson-title"
        onCancel={(event) => { event.preventDefault(); close(); }}
        onClick={(event) => { if (event.target === event.currentTarget) close(); }}
      >
      <div
        className="iv-lesson iv-dialog-panel"
        data-lenis-prevent
        data-lenis-prevent-wheel
        onWheel={(event) => event.stopPropagation()}
      >
      <div className="iv-lesson-head">
        <span className="iv-label">Free lesson</span>
        <button
          className="iv-lesson-close"
          type="button"
          onClick={close}
        >
          Close
        </button>
      </div>

      <h3 id="iv-free-lesson-title">Keys, Wallets, and Custody</h3>
      <p className="iv-lesson-body">
        A crypto wallet does not store coins. It stores <strong>keys</strong>. The assets live on
        the blockchain; the <strong>private key</strong> is the credential that authorizes moving
        them. Whoever holds that key has final control — which is why custody is the first thing
        the Academy teaches, before any participation.
      </p>

      <div className="iv-lesson-diagram" aria-label="Custody flow: private key signs a transaction which the network verifies">
        <div>
          <b>Private key</b>
          <small>Held by you (self-custody) or a provider (custodial). Controls everything below.</small>
        </div>
        <div className="iv-flow-arrow" aria-hidden="true">→</div>
        <div>
          <b>Signed transaction</b>
          <small>The key produces a cryptographic signature no one can forge without it.</small>
        </div>
        <div className="iv-flow-arrow" aria-hidden="true">→</div>
        <div>
          <b>Network verifies</b>
          <small>The chain checks the signature and updates the ledger. No signature, no movement.</small>
        </div>
      </div>

      <div className="iv-quiz">
        <p>Comprehension check — who ultimately controls the assets in a wallet?</p>
        <div className="iv-quiz-options">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={answered}
              data-result={
                !answered ? undefined
                : option.id === correctOption ? "correct"
                : option.id === selected ? "incorrect"
                : undefined
              }
              onClick={() => setSelected(option.id)}
            >
              <i>{option.id}.</i>
              {option.label}
            </button>
          ))}
        </div>
        {answered && (
          <p className="iv-quiz-feedback" data-state={correct ? "correct" : "incorrect"} role="status">
            {correct
              ? "Correct. Keys are control. Everything else in custody design follows from that."
              : "Not quite — the private key is the control point. Exchanges and validators can only act within what signatures allow."}
          </p>
        )}
      </div>

      {answered && (
        <div className="iv-lesson-complete">
          <p>Lesson complete. This is one micro-lesson — the full curriculum goes far deeper.</p>
          <a className="iv-btn" href="/login">Enter Vaulted Academy</a>
        </div>
      )}
      </div>
      </dialog>}
    </>
  );
}
