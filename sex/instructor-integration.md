#!/usr/bin/env node
/**
 * IRON VAULT ACADEMY — LESSON AUDIO GENERATOR (build-time)
 * ─────────────────────────────────────────────────────────────────────────
 * Reads narration text for each lesson, calls the TTS provider ONCE per lesson,
 * and writes a cached MP3 (+ optional word-timing JSON) into /public/lesson-audio/.
 * Re-running skips lessons whose text hasn't changed (content-hash cache), so we
 * never pay to regenerate unchanged narration.
 *
 * PROVIDER: ElevenLabs direct (Phase 1). Verified endpoints/params:
 *   - POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
 *       header: xi-api-key: <key>
 *       body: { text, model_id, voice_settings }
 *       returns: audio/mpeg (MP3 bytes)
 *   - Timestamps (for word-sync highlight) use the with-timestamps variant:
 *       POST .../text-to-speech/{voice_id}/with-timestamps
 *       returns JSON: { audio_base64, alignment:{characters,character_start_times_seconds,character_end_times_seconds} }
 *     We convert character alignment → word spans below.
 *
 * NO SECRETS IN CODE. Reads from env:
 *   ELEVENLABS_API_KEY   (required)
 *   ELEVENLABS_VOICE_ID  (required — the voice you chose in your ElevenLabs account)
 *   ELEVENLABS_MODEL_ID  (optional — defaults to eleven_multilingual_v2)
 *
 * If any required env var is missing, this exits with:
 *   Missing required env var: EXACT_NAME
 *
 * USAGE:
 *   node generate-lesson-audio.mjs
 *   # or add to package.json:  "prebuild": "node scripts/generate-lesson-audio.mjs"
 *
 * INPUT: a lessons manifest (JSON) mapping lessonId -> narration text.
 *   Default path: ./lesson-narration.json  (override with LESSON_NARRATION_PATH)
 *   Shape: { "m1-l1": "Full narration text...", "m1-l2": "..." }
 *   (A helper to build this manifest from the MODULES array is at the bottom.)
 *
 * OUTPUT (into ./public/lesson-audio/ by default, override with LESSON_AUDIO_OUT):
 *   {lessonId}.mp3
 *   {lessonId}.words.json        -> { words:[{word,start,end}] }  (if timestamps on)
 *   .cache.json                  -> { lessonId: contentHash }     (skip-unchanged)
 * ─────────────────────────────────────────────────────────────────────────
 */

import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

// ── Config from env (fail loud, never invent) ──────────────────────────────
const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";
const WITH_TIMESTAMPS = process.env.LESSON_AUDIO_TIMESTAMPS !== "false"; // default on
const NARRATION_PATH = process.env.LESSON_NARRATION_PATH || "./lesson-narration.json";
const OUT_DIR = process.env.LESSON_AUDIO_OUT || "./public/lesson-audio";

function requireEnv(name, val) {
  if (!val) { console.error(`Missing required env var: ${name}`); process.exit(1); }
}
requireEnv("ELEVENLABS_API_KEY", API_KEY);
requireEnv("ELEVENLABS_VOICE_ID", VOICE_ID);

const BASE = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;
const ENDPOINT = WITH_TIMESTAMPS ? `${BASE}/with-timestamps` : BASE;

const hash = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);

// ── Convert ElevenLabs character alignment → word spans ────────────────────
function charsToWords(alignment) {
  if (!alignment) return null;
  const chars = alignment.characters || [];
  const starts = alignment.character_start_times_seconds || [];
  const ends = alignment.character_end_times_seconds || [];
  const words = [];
  let cur = "", wStart = null, wEnd = null;
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    const isSpace = /\s/.test(c);
    if (!isSpace) {
      if (cur === "") wStart = starts[i];
      cur += c;
      wEnd = ends[i];
    } else if (cur !== "") {
      words.push({ word: cur, start: wStart, end: wEnd });
      cur = "";
    }
  }
  if (cur !== "") words.push({ word: cur, start: wStart, end: wEnd });
  return words;
}

async function synth(text) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "xi-api-key": API_KEY,
      "Content-Type": "application/json",
      "Accept": WITH_TIMESTAMPS ? "application/json" : "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`ElevenLabs ${res.status}: ${detail.slice(0, 300)}`);
  }

  if (WITH_TIMESTAMPS) {
    const json = await res.json();
    const audio = Buffer.from(json.audio_base64, "base64");
    const words = charsToWords(json.alignment);
    return { audio, words };
  } else {
    const audio = Buffer.from(await res.arrayBuffer());
    return { audio, words: null };
  }
}

async function main() {
  if (!existsSync(NARRATION_PATH)) {
    console.error(`Missing narration manifest at ${NARRATION_PATH}.`);
    console.error(`Build it from your MODULES array first (see buildNarrationManifest at bottom).`);
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  const manifest = JSON.parse(await readFile(NARRATION_PATH, "utf8"));

  const cachePath = path.join(OUT_DIR, ".cache.json");
  let cache = {};
  if (existsSync(cachePath)) {
    try { cache = JSON.parse(await readFile(cachePath, "utf8")); } catch { cache = {}; }
  }

  const ids = Object.keys(manifest);
  let generated = 0, skipped = 0;

  for (const id of ids) {
    const text = (manifest[id] || "").trim();
    if (!text) { console.warn(`  · ${id}: empty narration, skipping`); continue; }

    const h = hash(text + "::" + MODEL_ID + "::" + VOICE_ID + "::" + WITH_TIMESTAMPS);
    const mp3Path = path.join(OUT_DIR, `${id}.mp3`);
    const wordsPath = path.join(OUT_DIR, `${id}.words.json`);

    // Skip if unchanged AND the mp3 still exists on disk
    if (cache[id] === h && existsSync(mp3Path)) {
      skipped++;
      continue;
    }

    process.stdout.write(`  · ${id}: generating… `);
    try {
      const { audio, words } = await synth(text);
      await writeFile(mp3Path, audio);
      if (words) await writeFile(wordsPath, JSON.stringify({ words }));
      cache[id] = h;
      generated++;
      console.log("done");
    } catch (err) {
      console.log("FAILED");
      console.error(`    ${err.message}`);
      // Continue with the rest; don't fail the whole build for one lesson.
    }
  }

  await writeFile(cachePath, JSON.stringify(cache, null, 2));
  console.log(`\nLesson audio: ${generated} generated, ${skipped} cached, ${ids.length} total.`);
  console.log(`Output: ${OUT_DIR}/`);
}

main().catch((e) => { console.error(e); process.exit(1); });

/* ───────────────────────────────────────────────────────────────────────────
 * HELPER: build lesson-narration.json from the MODULES array.
 * Run this once (or in prebuild) to turn lesson content blocks into narration
 * text keyed by "m{moduleId}-l{lessonIndex}". Adjust which block types are read
 * aloud to taste. This keeps ONE source of truth (the MODULES content) and
 * derives narration from it — no separate script to maintain.
 *
 *   import { MODULES } from "../data/modules.js";
 *   buildNarrationManifest(MODULES, "./lesson-narration.json");
 *
 * Only these block types are narrated by default: heading, body, callout,
 * quote (as "<text> — <author>"), vault (title + text), action.
 * Interactive blocks (calculator/simulator/scenario/sortgame/reveal) are skipped
 * — the learner DOES those, they aren't read aloud.
 * ─────────────────────────────────────────────────────────────────────────── */
export function narrationForLesson(lesson) {
  const parts = [];
  for (const b of lesson.content || []) {
    switch (b.type) {
      case "heading": parts.push(b.text); break;
      case "body":    parts.push(b.text); break;
      case "callout": parts.push(b.text); break;
      case "quote":   parts.push(`${b.text}${b.author ? ` — ${b.author}` : ""}`); break;
      case "vault":   parts.push(`${(b.title || "Vault secret.").replace(/^VAULT SECRET:\s*/i, "Vault secret. ")} ${b.text}`); break;
      case "action":  parts.push(`Your move: ${b.text}`); break;
      case "list":    if (Array.isArray(b.items)) parts.push(b.items.join(". ")); break;
      default: /* interactive blocks are not narrated */ break;
    }
  }
  return parts.join("\n\n");
}

export async function buildNarrationManifest(MODULES, outPath = "./lesson-narration.json") {
  const manifest = {};
  for (const mod of MODULES) {
    (mod.lessons || []).forEach((lesson, li) => {
      const id = `m${mod.id}-l${li + 1}`;
      manifest[id] = narrationForLesson(lesson);
    });
  }
  const { writeFile } = await import("node:fs/promises");
  await writeFile(outPath, JSON.stringify(manifest, null, 2));
  console.log(`Wrote ${Object.keys(manifest).length} lesson narrations → ${outPath}`);
  return manifest;
}
