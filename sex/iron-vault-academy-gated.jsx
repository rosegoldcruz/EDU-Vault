# Lesson Instructor — Integration Guide

The instructor **pops up and autoplays** when the learner clicks **Begin Lesson**.
No "press play" step. Zero per-view cost (audio is pre-generated once and cached).

---

## The pipeline (how the pieces connect)

```
MODULES array (lesson content)
   │  buildNarrationManifest()  ← derives narration text from content blocks
   ▼
lesson-narration.json   { "m1-l1": "narration text…", … }
   │  node generate-lesson-audio.mjs   ← calls ElevenLabs ONCE per lesson, caches
   ▼
/public/lesson-audio/
   ├── m1-l1.mp3
   ├── m1-l1.words.json      ← word timings for follow-along highlight
   └── .cache.json           ← skip-unchanged cache
   │
   ▼
<LessonInstructor audioSrc="/lesson-audio/m1-l1.mp3" … />  ← autoplays on mount
```

One source of truth: narration is **derived from the MODULES content**, so editing a lesson and re-running the script updates its audio automatically. Unchanged lessons are skipped (content-hash cache) — you never pay to regenerate them.

---

## Step 1 — Env vars (never hardcode)

Add to `.env.local` (values from YOUR ElevenLabs account — pull the real ones, don't invent):

```env
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
ELEVENLABS_MODEL_ID=
```

- `ELEVENLABS_MODEL_ID` is optional; defaults to `eleven_multilingual_v2`. Other valid current models: `eleven_turbo_v2_5`, `eleven_flash_v2_5`, `eleven_v3`.
- Get `ELEVENLABS_VOICE_ID` from your ElevenLabs voice library (the voice you picked for the instructor).

If either required var is missing, the script exits with `Missing required env var: EXACT_NAME` — by design.

---

## Step 2 — Generate the audio (build time)

Put `generate-lesson-audio.mjs` in `scripts/`. Build the narration manifest from your modules, then run the generator. Wire both into `prebuild` so it happens automatically on every deploy:

```jsonc
// package.json
{
  "scripts": {
    "gen:narration": "node scripts/build-narration.mjs",
    "gen:audio": "node scripts/generate-lesson-audio.mjs",
    "prebuild": "npm run gen:narration && npm run gen:audio",
    "build": "next build"
  }
}
```

`scripts/build-narration.mjs`:
```js
import { buildNarrationManifest } from "./generate-lesson-audio.mjs";
import { MODULES } from "../data/modules.js"; // your modules array
await buildNarrationManifest(MODULES, "./lesson-narration.json");
```

First run generates all lessons; subsequent runs only regenerate lessons whose text changed.

---

## Step 3 — Autoplay on "Begin Lesson"

The learner's click to open a lesson is the browser gesture that permits autoplay. Mount the instructor when the lesson opens and it starts on its own:

```jsx
"use client";
import { useState } from "react";
import LessonInstructor from "@/components/LessonInstructor";

function LessonView({ module, lessonIndex, lesson }) {
  const [started, setStarted] = useState(false);
  const lessonId = `m${module.id}-l${lessonIndex + 1}`;

  if (!started) {
    return (
      <button className="begin-lesson-btn" onClick={() => setStarted(true)}>
        ▶ Begin Lesson
      </button>
    );
  }

  return (
    <>
      {/* Instructor pops up and autoplays the moment the lesson begins */}
      <LessonInstructor
        audioSrc={`/lesson-audio/${lessonId}.mp3`}
        timingSrc={`/lesson-audio/${lessonId}.words.json`}  // omit to disable highlight
        title="The Vault Instructor"
        accentColor="#AAFF00"
      />

      {/* Your existing lesson content blocks render below, as normal */}
      {lesson.content.map((b, i) => <ContentBlock key={i} b={b} />)}
    </>
  );
}
```

That's the whole "baked in" behavior: click Begin → instructor appears and speaks, no extra tap.

**Autoplay guard:** browsers block autoplay-with-sound until a user gesture. Because Begin Lesson *is* that gesture, autoplay works. If a browser still blocks it (rare edge cases), the component detects it and shows a single "tap ▶ PLAY" affordance — it never silently fails.

---

## Follow-along highlight

Pass `timingSrc` and the component highlights each word as it's spoken (word timings come free from ElevenLabs' with-timestamps endpoint, which the generator uses by default). To turn it off, either omit `timingSrc` or set `LESSON_AUDIO_TIMESTAMPS=false` when generating (smaller output, plain MP3 only).

---

## Phase 2 — HeyGen talking-head upgrade (no lesson-code changes)

When you want a real face instead of the CSS fox, the swap is **config, not a rewrite** — because the component already takes a `videoSrc` prop and HeyGen's API uses the **same ElevenLabs voice** under the hood.

Verified from HeyGen's API surface:
- `create_video_from_avatar` / `create_video_from_image` accept `voiceSettings.engine_settings.engine_type: "elevenlabs"` with the same models (`eleven_multilingual_v2`, `eleven_turbo_v2_5`, `eleven_flash_v2_5`, `eleven_v3`). Same voice, now with a face.
- Generation is async (webhook/callback when the MP4 is ready), so it stays a **build-time** step exactly like the audio — pre-render per lesson, host the MP4, done. No per-view cost, no runtime latency.

Then just point the component at the video:
```jsx
<LessonInstructor
  videoSrc={`/lesson-video/${lessonId}.mp4`}   // ← renders video instead of the fox
  timingSrc={`/lesson-audio/${lessonId}.words.json`}  // highlight still works
  title="The Vault Instructor"
/>
```

The lesson view code above doesn't change at all.

---

## Phase 3 — Conversational tutor (only if you want it later)

If the endgame is a tutor the learner can *interrupt and ask questions*, that's a different product: LiveKit (real-time transport) + streaming STT/LLM/TTS. It carries real per-minute cost and complexity, so it's a deliberate later decision — not needed for "read the lesson and follow along."

---

## What works now / what to verify / next step

**Works now:** click Begin → avatar autoplays cached narration → optional word highlight → `onEnded` fires when done. No per-view API cost, no runtime latency.

**Verify after wiring:** run `npm run gen:audio` once, confirm `m1-l1.mp3` lands in `/public/lesson-audio/`, open Module 1 Lesson 1, click Begin — the fox should animate and speak. If it loads but doesn't auto-start, the browser blocked autoplay and you'll see the tap-to-play affordance (expected on some setups).

**Next convergence step:** generate audio for all 10 free modules in one `prebuild` run, spot-check three lessons for pronunciation of crypto terms (e.g. "Solana", "DeFi", "Nakamoto"), and if any are off, add a pronunciation pass to the narration text (ElevenLabs respects phonetic spelling in the input text). Then decide Phase 2 (HeyGen face) as a pure asset swap.
