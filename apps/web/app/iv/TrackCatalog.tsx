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
              <span className="iv-chip" data-state="planned">{track.unitLabel}</span>
            </div>
            <h3>{track.name}</h3>
            <div className="iv-track-meta">
              <span>{track.units.length} {track.unitLabel}</span>
              {track.duration !== `${track.units.length} ${track.unitLabel}` && track.duration && <span>{track.duration}</span>}
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
          <div
            className="iv-dialog-panel"
            data-lenis-prevent
            data-lenis-prevent-wheel
            onWheel={(event) => event.stopPropagation()}
          >
            <div className="iv-dialog-head">
              <div>
                <span className="iv-label">{selected.code} · {selected.audience}</span>
                <h2 id="iv-syllabus-title">{selected.name}</h2>
              </div>
              <button className="iv-dialog-close" type="button" onClick={close} aria-label="Close syllabus">Close</button>
            </div>
            <p className="iv-dialog-summary">{selected.summary}</p>
            <ol className="iv-syllabus">
              {selected.units.map((unit, index) => (
                <li key={unit.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{unit.title}</strong>
                    {unit.detail && <small>{unit.detail}</small>}
                  </div>
                </li>
              ))}
            </ol>
            <div className="iv-dialog-footer">
              <span>{selected.duration ?? `${selected.units.length} ${selected.unitLabel}`} · Verified completion credential</span>
              <a className="iv-btn" href="/login">Enter the Academy</a>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}