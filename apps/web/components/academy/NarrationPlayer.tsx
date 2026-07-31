"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./LessonRenderer.module.css";

export function NarrationPlayer({ title, transcript }: { title: string; transcript: string }) {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setSupported("speechSynthesis" in window));
    return () => window.speechSynthesis?.cancel();
  }, []);

  function play() {
    if (!supported) return;
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
      setPlaying(true);
      return;
    }
    window.speechSynthesis.cancel();
    const next = new SpeechSynthesisUtterance(transcript);
    next.rate = rate;
    next.onend = () => { setPlaying(false); setPaused(false); };
    next.onerror = () => { setPlaying(false); setPaused(false); };
    utterance.current = next;
    window.speechSynthesis.speak(next);
    setPlaying(true);
  }

  function pause() {
    if (!supported || !playing) return;
    window.speechSynthesis.pause();
    setPlaying(false);
    setPaused(true);
  }

  function restart() {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setPlaying(false);
    setPaused(false);
    window.setTimeout(play, 0);
  }

  function changeRate(nextRate: number) {
    setRate(nextRate);
    if (playing || paused) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      setPaused(false);
    }
  }

  return (
    <section className={styles.instructor} aria-label="Lesson narration">
      <div className={styles.instructorIdentity}><span aria-hidden="true">IV</span><div><small>Vault Instructor</small><strong>{title}</strong></div></div>
      <p>Studio audio is not generated yet. Use browser narration now, or open the complete transcript below.</p>
      <div className={styles.narrationControls}>
        <button type="button" onClick={playing ? pause : play} disabled={!supported}>{playing ? "Pause" : paused ? "Resume" : "Play"}</button>
        <button type="button" onClick={restart} disabled={!supported}>Restart</button>
        <label>Speed<select value={rate} onChange={(event) => changeRate(Number(event.target.value))}><option value={0.75}>0.75×</option><option value={1}>1×</option><option value={1.25}>1.25×</option><option value={1.5}>1.5×</option><option value={2}>2×</option></select></label>
        <button type="button" onClick={() => setShowTranscript((value) => !value)} aria-expanded={showTranscript}>{showTranscript ? "Hide transcript" : "Transcript"}</button>
      </div>
      {!supported ? <p>Your browser does not support spoken transcript playback. The transcript remains available.</p> : null}
      {showTranscript ? <div className={styles.transcript}><h3>Transcript</h3><p>{transcript}</p></div> : null}
    </section>
  );
}
