"use client";

import { useEffect, useRef, useState } from "react";
import type { Track } from "./data";

export function TrackCatalog({ tracks }: { tracks: readonly Track[] }) {
  const [selected, setSelected] = useState<Track | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!selected) return;
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, [selected]);

  const close = () => {
    dialogRef.current?.close();
    setSelected(null);
  };

  return (
    <>
      <div className="iv-track-grid" aria-label="Academy learning tracks">
        {tracks.map((track) => (
          <button className="iv-track" type="button" key={track.slug} onClick={() => setSelected(track)}>
            <div className="iv-track-top">
              <span className="iv-track-code">{track.code}</span>
              <span className="iv-chip" data-state="planned">{track.level}</span>
            </div>
            <h3>{track.name}</h3>
            <div className="iv-track-meta">
              <span>{track.modules.length} modules</span>
              <span>~{track.hours}</span>
            </div>
            <span className="iv-track-action">View syllabus</span>
          </button>
        ))}
      </div>

      {selected && (
        <dialog
          className="iv-dialog"
          ref={dialogRef}
          aria-labelledby="iv-syllabus-title"
          onCancel={(event) => { event.preventDefault(); close(); }}
          onClick={(event) => { if (event.target === event.currentTarget) close(); }}
        >
          <div className="iv-dialog-panel">
            <div className="iv-dialog-head">
              <div>
                <span className="iv-label">{selected.code} · {selected.level}</span>
                <h2 id="iv-syllabus-title">{selected.name}</h2>
              </div>
              <button className="iv-dialog-close" type="button" onClick={close} aria-label="Close syllabus">Close</button>
            </div>
            <p className="iv-dialog-summary">{selected.summary}</p>
            <ol className="iv-syllabus">
              {selected.modules.map((module, index) => (
                <li key={module}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{module}</strong>
                </li>
              ))}
            </ol>
            <div className="iv-dialog-footer">
              <span>Estimated track time: {selected.hours}</span>
              <a className="iv-btn" href="/login">Enter the Academy</a>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}