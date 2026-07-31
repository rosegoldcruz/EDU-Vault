"use client";

/**
 * IRON VAULT ACADEMY — LESSON INSTRUCTOR
 * ─────────────────────────────────────────────────────────────────────────
 * An avatar narrator that AUTOPLAYS when a lesson begins. No "press play"
 * button required — mount it and it starts (subject to browser autoplay rules,
 * handled below). Animated vault-fox avatar reacts while speaking. Optional
 * word-level highlight syncs the on-screen text to the voice ("follow along").
 *
 * ARCHITECTURE (verified, not guessed):
 *   - Audio is PRE-GENERATED at build time (see generate-lesson-audio.mjs) and
 *     served as a static MP3 from /public/lesson-audio/. Zero per-view cost.
 *   - This component only PLAYS a cached file + optional timing JSON. It never
 *     calls a TTS API at runtime, so there is no latency and no per-view spend.
 *   - Provider-agnostic: whether the MP3 came from ElevenLabs (Phase 1) or a
 *     HeyGen talking-head video (Phase 2) is decided by the asset + one prop,
 *     not by this component's internals.
 *
 * BROWSER AUTOPLAY REALITY:
 *   Browsers block autoplay of audio WITH SOUND until the user has interacted
 *   with the page. Because the learner clicks "Begin Lesson" to mount this,
 *   that click IS the required gesture — so autoplay works. We still guard for
 *   the blocked case and surface a single tap-to-start affordance as fallback.
 *
 * PROPS:
 *   audioSrc      (string)  required — e.g. "/lesson-audio/m1-l1.mp3"
 *   timingSrc     (string)  optional — e.g. "/lesson-audio/m1-l1.words.json"
 *                           JSON: { words: [{ word, start, end }] } (seconds)
 *   videoSrc      (string)  optional — Phase 2: a talking-head MP4/webm.
 *                           When present, renders video instead of the CSS fox.
 *   title         (string)  optional — shown under the avatar
 *   onEnded       (fn)      optional — called when narration finishes
 *   autoPlay      (bool)    optional — default true
 *   accentColor   (string)  optional — default "#AAFF00"
 * ─────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState } from "react";

export default function LessonInstructor({
  audioSrc,
  timingSrc = null,
  videoSrc = null,
  title = "The Vault Instructor",
  onEnded = null,
  autoPlay = true,
  accentColor = "#AAFF00",
}) {
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [blocked, setBlocked] = useState(false); // autoplay was blocked
  const [progress, setProgress] = useState(0); // 0..1
  const [words, setWords] = useState(null); // [{word,start,end}]
  const [activeWord, setActiveWord] = useState(-1);
  const [amp, setAmp] = useState(0); // 0..1 mouth/scale animation driver

  const mediaEl = () => (videoSrc ? videoRef.current : audioRef.current);

  // ── Load optional word-timing JSON ────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    if (!timingSrc) { setWords(null); return; }
    fetch(timingSrc)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        // Accept either {words:[...]} or a bare array
        const w = Array.isArray(data) ? data : data.words;
        if (Array.isArray(w)) setWords(w);
      })
      .catch(() => { /* timing is optional; ignore */ });
    return () => { cancelled = true; };
  }, [timingSrc]);

  // ── Attempt autoplay once the media can play ──────────────────────────────
  useEffect(() => {
    const el = mediaEl();
    if (!el) return;

    const onCanPlay = () => {
      setReady(true);
      if (!autoPlay) return;
      const p = el.play();
      if (p && typeof p.then === "function") {
        p.then(() => { setPlaying(true); setBlocked(false); })
         .catch(() => { setBlocked(true); setPlaying(false); });
      }
    };
    el.addEventListener("canplay", onCanPlay);
    // If already buffered (cached), canplay may have fired before listener
    if (el.readyState >= 3) onCanPlay();
    return () => el.removeEventListener("canplay", onCanPlay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioSrc, videoSrc, autoPlay]);

  // ── Time updates: progress, active word, amplitude animation ──────────────
  useEffect(() => {
    const el = mediaEl();
    if (!el) return;

    const onTime = () => {
      const t = el.currentTime;
      const d = el.duration || 0;
      setProgress(d ? t / d : 0);

      // Active word for highlight sync
      if (words && words.length) {
        // linear scan is fine for lesson-length narration
        let idx = -1;
        for (let i = 0; i < words.length; i++) {
          if (t >= words[i].start && t <= words[i].end) { idx = i; break; }
          if (t < words[i].start) break;
        }
        setActiveWord(idx);
      }

      // Simple amplitude proxy: oscillate while playing so the fox "talks".
      // (Real waveform analysis would need WebAudio; this is deterministic and
      //  cheap, and reads as speech motion.)
      setAmp(0.5 + 0.5 * Math.abs(Math.sin(t * 12)));
    };
    const onEnd = () => {
      setPlaying(false);
      setActiveWord(-1);
      setAmp(0);
      if (onEnded) onEnded();
    };

    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnd);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words, onEnded, audioSrc, videoSrc]);

  const toggle = () => {
    const el = mediaEl();
    if (!el) return;
    if (el.paused) {
      const p = el.play();
      if (p && typeof p.then === "function") {
        p.then(() => { setPlaying(true); setBlocked(false); }).catch(() => {});
      } else { setPlaying(true); }
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  const restart = () => {
    const el = mediaEl();
    if (!el) return;
    el.currentTime = 0;
    const p = el.play();
    if (p && typeof p.then === "function") p.then(() => setPlaying(true)).catch(() => {});
  };

  // ── Fox avatar scale/glow driven by amp while speaking ────────────────────
  const speaking = playing && !blocked;
  const ringScale = speaking ? 1 + amp * 0.06 : 1;
  const mouthOpen = speaking ? 2 + amp * 7 : 2;
  const earTwitch = speaking ? amp * 4 - 2 : 0;

  return (
    <div className="li-wrap">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500&display=swap');

        .li-wrap{
          --accent:${accentColor};
          --gold:#C9A227; --purple:#7B2FBE;
          --bg:#0F0F0F; --line:#1c1c1c;
          display:flex;gap:18px;align-items:center;
          background:linear-gradient(180deg,#0F0F0F,#0b0b0b);
          border:1px solid var(--line);border-radius:10px;
          padding:16px 18px;position:relative;overflow:hidden;
          font-family:'DM Sans',sans-serif;
          animation:liFade .5s ease;
        }
        .li-wrap::before{
          content:'';position:absolute;top:0;left:0;right:0;height:1px;
          background:linear-gradient(90deg,transparent,var(--purple),var(--accent),transparent);
        }
        @keyframes liFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}

        /* ── AVATAR ── */
        .li-avatar{
          position:relative;width:96px;height:96px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
        }
        .li-ring{
          position:absolute;inset:0;border-radius:50%;
          border:1px solid rgba(201,162,39,0.35);
          box-shadow:0 0 18px rgba(170,255,0,0.10), inset 0 0 18px rgba(170,255,0,0.05);
          transition:transform .08s linear;
        }
        .li-ring.speaking{ border-color:var(--accent); box-shadow:0 0 26px rgba(170,255,0,0.25); }
        .li-video{
          width:96px;height:96px;border-radius:50%;object-fit:cover;
          border:1px solid rgba(201,162,39,0.35);
        }

        /* ── TEXT / CONTROLS ── */
        .li-body{flex:1;min-width:0;}
        .li-tag{
          font-family:'Space Mono',monospace;font-size:8px;letter-spacing:2px;
          color:#080808;background:var(--accent);padding:2px 6px;border-radius:2px;
        }
        .li-title{
          font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:1px;
          color:#eee;margin-top:6px;
        }
        .li-status{
          font-family:'Space Mono',monospace;font-size:10px;letter-spacing:1px;
          color:#666;margin-top:2px;
        }
        .li-bar{
          height:3px;background:#181818;border-radius:2px;margin-top:12px;overflow:hidden;
        }
        .li-bar-fill{
          height:100%;background:linear-gradient(90deg,var(--purple),var(--accent));
          width:0%;transition:width .15s linear;
        }
        .li-controls{display:flex;gap:8px;margin-top:12px;align-items:center;}
        .li-btn{
          font-family:'Space Mono',monospace;font-size:10px;letter-spacing:1px;
          padding:7px 13px;border:1px solid rgba(170,255,0,0.4);
          background:rgba(170,255,0,0.06);color:var(--accent);cursor:pointer;
          border-radius:3px;transition:background .15s;
        }
        .li-btn:hover{background:rgba(170,255,0,0.14);}
        .li-btn.ghost{border-color:#333;background:transparent;color:#888;}
        .li-btn.ghost:hover{color:#ccc;border-color:#555;}

        .li-blocked{
          margin-top:10px;font-family:'Space Mono',monospace;font-size:10px;
          color:var(--gold);
        }

        /* ── WORD-SYNC HIGHLIGHT (optional) ── */
        .li-script{
          margin-top:14px;font-size:14px;line-height:1.8;color:#8a8a8a;
          max-height:150px;overflow-y:auto;padding-right:6px;
        }
        .li-word{transition:color .1s, background .1s;border-radius:3px;padding:0 1px;}
        .li-word.active{color:#0b0b0b;background:var(--accent);}
        .li-word.past{color:#cfcfcf;}
      `}</style>

      {/* ── AVATAR: video (Phase 2) OR animated CSS fox (Phase 1) ── */}
      <div className="li-avatar">
        {videoSrc ? (
          <video
            ref={videoRef}
            className="li-video"
            src={videoSrc}
            playsInline
            preload="auto"
          />
        ) : (
          <>
            <div
              className={"li-ring" + (speaking ? " speaking" : "")}
              style={{ transform: `scale(${ringScale})` }}
            />
            {/* Vault fox — simple, on-brand, animates while speaking */}
            <svg width="66" height="66" viewBox="0 0 66 66" aria-hidden="true">
              {/* ears */}
              <polygon points="18,22 26,6 32,24" fill="#1a1a1a" stroke="#C9A227" strokeWidth="1"
                style={{ transform: `rotate(${-earTwitch}deg)`, transformOrigin: "26px 18px" }} />
              <polygon points="48,22 40,6 34,24" fill="#1a1a1a" stroke="#C9A227" strokeWidth="1"
                style={{ transform: `rotate(${earTwitch}deg)`, transformOrigin: "40px 18px" }} />
              {/* head */}
              <path d="M17 24 Q33 16 49 24 Q52 40 33 52 Q14 40 17 24 Z"
                fill="#141414" stroke={speaking ? accentColor : "#C9A227"} strokeWidth="1.2" />
              {/* eyes */}
              <circle cx="27" cy="32" r="2.4" fill={accentColor} />
              <circle cx="39" cy="32" r="2.4" fill={accentColor} />
              {/* snout */}
              <path d="M30 40 Q33 42 36 40 L33 45 Z" fill="#C9A227" />
              {/* mouth — opens with amplitude while speaking */}
              <ellipse cx="33" cy={46 + mouthOpen / 2} rx="4" ry={mouthOpen / 2}
                fill="#7B2FBE" opacity={speaking ? 0.9 : 0.4} />
            </svg>
          </>
        )}
      </div>

      {/* ── BODY ── */}
      <div className="li-body">
        <span className="li-tag">INSTRUCTOR</span>
        <div className="li-title">{title}</div>
        <div className="li-status">
          {!ready ? "Loading narration…"
            : blocked ? "Tap play to begin"
            : playing ? "Speaking…"
            : progress >= 1 ? "Lesson narration complete"
            : "Paused"}
        </div>

        <div className="li-bar"><div className="li-bar-fill" style={{ width: `${progress * 100}%` }} /></div>

        <div className="li-controls">
          <button className="li-btn" onClick={toggle}>
            {playing ? "❚❚ PAUSE" : "▶ PLAY"}
          </button>
          <button className="li-btn ghost" onClick={restart}>↺ REPLAY</button>
        </div>

        {blocked && (
          <div className="li-blocked">Autoplay was blocked by the browser — tap ▶ PLAY to start the instructor.</div>
        )}

        {/* Optional follow-along transcript with word highlighting */}
        {words && (
          <div className="li-script">
            {words.map((w, i) => (
              <span
                key={i}
                className={"li-word" + (i === activeWord ? " active" : i < activeWord ? " past" : "")}
              >
                {w.word}{" "}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Hidden audio element (Phase 1). Video path uses the <video> above. */}
      {!videoSrc && <audio ref={audioRef} src={audioSrc} preload="auto" />}
    </div>
  );
}
