"use client";

import { useEffect, useState } from "react";

import type { CurriculumContentBlock } from "@/lib/curriculum/block-types";

import styles from "./LessonRenderer.module.css";

function text(payload: Record<string, unknown>, key = "text"): string {
  return typeof payload[key] === "string" ? payload[key] : "";
}

function number(payload: Record<string, unknown>, key: string, fallback = 0): number {
  const value = Number(payload[key]);
  return Number.isFinite(value) ? value : fallback;
}

function objects(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => (
      item !== null && typeof item === "object" && !Array.isArray(item)
    ))
    : [];
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function evidenceLabel(block: CurriculumContentBlock): string | null {
  if (!block.evidenceClass) return null;
  return block.evidenceClass.charAt(0).toUpperCase() + block.evidenceClass.slice(1);
}

function Sources({ block }: { block: CurriculumContentBlock }) {
  if (block.citations.length === 0) return null;
  return (
    <footer className={styles.sources}>
      <span>Sources</span>
      <ul>
        {block.citations.map((citation) => (
          <li key={`${citation.label}:${citation.url ?? ""}`}>
            {citation.url ? (
              <a href={citation.url} rel="noreferrer" target="_blank">{citation.label}</a>
            ) : citation.label}
          </li>
        ))}
      </ul>
    </footer>
  );
}

function StructuredItems({ items }: { items: Array<Record<string, unknown>> }) {
  return (
    <ol className={styles.structuredItems}>
      {items.map((item, index) => (
        <li key={`${text(item, "title") || text(item, "heading")}:${index}`}>
          {text(item, "title") || text(item, "heading") ? (
            <strong>{text(item, "title") || text(item, "heading")}</strong>
          ) : null}
          <p>{text(item) || text(item, "description")}</p>
        </li>
      ))}
    </ol>
  );
}

function RevealBlock({ block }: { block: CurriculumContentBlock }) {
  const steps = objects(block.payload.steps);
  const [revealed, setRevealed] = useState(0);
  if (steps.length === 0) {
    return (
      <details className={styles.reveal}>
        <summary>{text(block.payload, "title") || "Reveal"}</summary>
        <p>{text(block.payload)}</p>
      </details>
    );
  }
  return (
    <section className={styles.activity}>
      <header><span>Reveal</span><h3>{text(block.payload, "title")}</h3></header>
      <ol className={styles.structuredItems}>
        {steps.map((step, index) => (
          <li key={`${text(step, "label")}:${index}`}>
            <strong>{text(step, "label")}{text(step, "tag") ? ` · ${text(step, "tag")}` : ""}</strong>
            {index < revealed ? (
              <p><b>{text(step, "heading")}</b><br />{text(step)}</p>
            ) : <p>Locked until revealed.</p>}
          </li>
        ))}
      </ol>
      <div className={styles.controls}>
        <button type="button" disabled={revealed >= steps.length} onClick={() => setRevealed((value) => value + 1)}>
          {revealed === 0 ? "Begin" : revealed >= steps.length ? "Complete" : "Reveal next"}
        </button>
        {revealed > 0 ? <button type="button" onClick={() => setRevealed(0)}>Reset</button> : null}
      </div>
      {revealed >= steps.length && text(block.payload, "note") ? <p>{text(block.payload, "note")}</p> : null}
    </section>
  );
}

function ScenarioBlock({ block }: { block: CurriculumContentBlock }) {
  const nodes = block.payload.nodes;
  const nodeMap = nodes && typeof nodes === "object" && !Array.isArray(nodes)
    ? nodes as Record<string, Record<string, unknown>>
    : {};
  const [nodeId, setNodeId] = useState("start");
  const node = nodeMap[nodeId];
  if (!node) {
    return (
      <section className={styles.unsupported}>
        <strong>Scenario preview warning</strong>
        <p>This scenario has no valid start node.</p>
      </section>
    );
  }
  const choices = objects(node.choices);
  return (
    <section className={styles.activity}>
      <header>
        <span>{evidenceLabel(block) ?? "Scenario"}</span>
        <h3>{text(block.payload, "title") || "Decision scenario"}</h3>
      </header>
      {nodeId === "start" && text(block.payload, "prompt") ? <p>{text(block.payload, "prompt")}</p> : null}
      <p>{text(node)}</p>
      {text(node, "lesson") ? <p><strong>{text(node, "lesson")}</strong></p> : null}
      <div className={styles.controls}>
        {choices.map((choice, index) => (
          <button
            key={`${text(choice, "label")}:${index}`}
            type="button"
            onClick={() => setNodeId(text(choice, "to"))}
          >
            {text(choice, "label")}
          </button>
        ))}
        {text(node, "to") ? (
          <button type="button" onClick={() => setNodeId(text(node, "to"))}>Continue</button>
        ) : null}
        {nodeId !== "start" && (choices.length === 0 || text(node, "outcome")) ? (
          <button type="button" onClick={() => setNodeId("start")}>Run again</button>
        ) : null}
      </div>
      <Sources block={block} />
    </section>
  );
}

function SortingBlock({ block }: { block: CurriculumContentBlock }) {
  const buckets = objects(block.payload.buckets);
  const items = objects(block.payload.items);
  const [placed, setPlaced] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const correct = items.filter((item, index) => placed[index] === text(item, "bucket")).length;
  return (
    <section className={styles.activity}>
      <header><span>Sorting</span><h3>{text(block.payload, "title") || "Sort the evidence"}</h3></header>
      <div className={styles.sortingItems}>
        {items.map((item, index) => (
          <div key={`${text(item)}:${index}`} data-correct={checked ? String(placed[index] === text(item, "bucket")) : undefined}>
            <p>{text(item)}</p>
            <div className={styles.controls}>
              {buckets.map((bucket) => (
                <button
                  type="button"
                  aria-pressed={placed[index] === text(bucket, "id")}
                  key={text(bucket, "id")}
                  onClick={() => {
                    setPlaced((current) => ({ ...current, [index]: text(bucket, "id") }));
                    setChecked(false);
                  }}
                >
                  {text(bucket, "label")}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.controls}>
        <button type="button" disabled={Object.keys(placed).length !== items.length} onClick={() => setChecked(true)}>Check</button>
        <button type="button" onClick={() => { setPlaced({}); setChecked(false); }}>Clear</button>
      </div>
      {checked ? <p>{correct} / {items.length} correct.</p> : null}
      {text(block.payload, "note") ? <p>{text(block.payload, "note")}</p> : null}
    </section>
  );
}

function CalculatorBlock({ block }: { block: CurriculumContentBlock }) {
  const inputs = objects(block.payload.inputs);
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(inputs.map((input) => [
      text(input, "key"),
      number(input, "default"),
    ])));
  const variant = text(block.payload, "variant");
  let result = 0;
  let resultLabel = "Result";
  if (variant === "compound") {
    const principal = values.principal ?? 0;
    const monthly = values.monthly ?? 0;
    const rate = (values.rate ?? 0) / 100 / 12;
    const months = (values.years ?? 0) * 12;
    const principalFuture = principal * Math.pow(1 + rate, months);
    const contributionsFuture = rate === 0
      ? monthly * months
      : monthly * ((Math.pow(1 + rate, months) - 1) / rate);
    result = principalFuture + contributionsFuture;
    resultLabel = "Projected balance";
  } else if (variant === "streams") {
    result = inputs.reduce((sum, input) => sum + (values[text(input, "key")] ?? 0), 0) * 12;
    resultLabel = "Annual income";
  }
  return (
    <section className={styles.activity}>
      <header><span>Calculator</span><h3>{text(block.payload, "title")}</h3></header>
      <div className={styles.rangeInputs}>
        {inputs.map((input) => {
          const key = text(input, "key");
          return (
            <label key={key}>
              <span>{text(input, "label")}: {text(input, "prefix")}{values[key]?.toLocaleString()}{text(input, "suffix")}</span>
              <input
                type="range"
                min={number(input, "min")}
                max={number(input, "max", 100)}
                step={number(input, "step", 1)}
                value={values[key] ?? 0}
                onChange={(event) => setValues((current) => ({ ...current, [key]: Number(event.target.value) }))}
              />
            </label>
          );
        })}
      </div>
      <p className={styles.result}><strong>{resultLabel}</strong> ${Math.round(result).toLocaleString()}</p>
      {text(block.payload, "note") ? <p>{text(block.payload, "note")}</p> : null}
    </section>
  );
}

function SimulationBlock({ block }: { block: CurriculumContentBlock }) {
  const start = number(block.payload, "start", 1000);
  const rounds = number(block.payload, "rounds", 100);
  const bet = block.payload.betPct;
  const betConfig = bet && typeof bet === "object" && !Array.isArray(bet) ? bet as Record<string, unknown> : {};
  const [betPercent, setBetPercent] = useState(number(betConfig, "default", 25));
  const [result, setResult] = useState<{ balance: number; peak: number; rounds: number } | null>(null);
  function run() {
    let balance = start;
    let peak = start;
    let completed = 0;
    for (let index = 0; index < rounds && balance > 0.01; index += 1) {
      const stake = balance * (betPercent / 100);
      balance = Math.random() < number(block.payload, "winProb", 0.5)
        ? balance + stake * (number(block.payload, "winMult", 2) - 1)
        : balance - stake * number(block.payload, "loseMult", 1);
      balance = Math.max(0, balance);
      peak = Math.max(peak, balance);
      completed += 1;
    }
    setResult({ balance, peak, rounds: completed });
  }
  return (
    <section className={styles.activity}>
      <header><span>Simulation</span><h3>{text(block.payload, "title")}</h3></header>
      <label className={styles.rangeInputs}>
        <span>Position size: {betPercent}% of bankroll</span>
        <input
          type="range"
          min={number(betConfig, "min", 1)}
          max={number(betConfig, "max", 100)}
          step={number(betConfig, "step", 1)}
          value={betPercent}
          onChange={(event) => setBetPercent(Number(event.target.value))}
        />
      </label>
      <div className={styles.controls}>
        <button type="button" onClick={run}>Run the odds</button>
        <button type="button" onClick={() => setResult(null)}>Reset</button>
      </div>
      {result ? (
        <p className={styles.result}>
          Final bankroll ${Math.round(result.balance).toLocaleString()}
          {" · "}Peak ${Math.round(result.peak).toLocaleString()}
          {" · "}{result.rounds}/{rounds} rounds
        </p>
      ) : null}
      {text(block.payload, "note") ? <p>{text(block.payload, "note")}</p> : null}
    </section>
  );
}

function MediaBlock({ block }: { block: CurriculumContentBlock }) {
  const available = block.payload.available === true;
  const audioUrl = text(block.payload, "audioUrl");
  const mediaUrl = text(block.payload, "url") || text(block.payload, "src");
  return (
    <figure className={styles.media}>
      <figcaption>{text(block.payload, "title") || block.type}</figcaption>
      {block.type === "narration" ? (
        available && audioUrl ? (
          <audio controls preload="metadata" src={audioUrl}>
            Your browser does not support audio playback.
          </audio>
        ) : <p>Narration metadata imported; audio has not been generated.</p>
      ) : mediaUrl ? (
        <a href={mediaUrl} rel="noreferrer" target="_blank">Open lesson media</a>
      ) : <p>{text(block.payload, "description") || text(block.payload) || "Media reference unavailable."}</p>}
      <Sources block={block} />
    </figure>
  );
}

function AssignmentBlock({ block }: { block: CurriculumContentBlock }) {
  const storageKey = `iv-scholar-assignment:${block.id}`;
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return;
    try {
      const value = JSON.parse(stored) as { draft?: string; complete?: boolean };
      queueMicrotask(() => {
        setDraft(value.draft ?? "");
        setComplete(value.complete === true);
      });
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  function save(nextComplete = complete) {
    window.localStorage.setItem(storageKey, JSON.stringify({ draft, complete: nextComplete }));
    setComplete(nextComplete);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <section className={styles.activity} data-assignment-id={block.id}>
      <header><span>Assignment · {complete ? "Complete" : "Not complete"}</span><h3>{text(block.payload, "title") || "Put it into practice"}</h3></header>
      <p>{text(block.payload) || text(block.payload, "instructions")}</p>
      <p><strong>Expected output:</strong> {text(block.payload, "expectedOutput") || "A concise written response that addresses each part of the prompt."}</p>
      <label className={styles.assignmentDraft}>
        <span>Your working draft</span>
        <textarea value={draft} onChange={(event) => { setDraft(event.target.value); setSaved(false); }} placeholder="Write your response here…" rows={6} />
      </label>
      <div className={styles.controls}>
        <button type="button" onClick={() => save()}>Save draft</button>
        <button type="button" disabled={!draft.trim()} onClick={() => save(!complete)}>{complete ? "Mark incomplete" : "Mark complete"}</button>
      </div>
      <p className={styles.previewNote}>{saved ? "Saved on this device." : "Preview only — assignment submissions are not sent to the Academy yet."}</p>
      <Sources block={block} />
    </section>
  );
}

export function ContentBlockRenderer({ block }: { block: CurriculumContentBlock }) {
  const payload = block.payload;
  const label = evidenceLabel(block);
  const title = text(payload, "title");

  if (block.type === "heading") return <h2 className={styles.heading}>{text(payload)}</h2>;
  if (block.type === "body") return <p className={styles.body}>{text(payload)}</p>;
  if (block.type === "list") return <ul className={styles.list}>{stringList(payload.items).map((item) => <li key={item}>{item}</li>)}</ul>;
  if (block.type === "quote") {
    return <figure className={styles.quote}><blockquote>{text(payload)}</blockquote>{text(payload, "author") ? <figcaption>— {text(payload, "author")}</figcaption> : null}</figure>;
  }
  if (block.type === "reveal") return <RevealBlock block={block} />;
  if (block.type === "scenario") return <ScenarioBlock block={block} />;
  if (block.type === "sorting") return <SortingBlock block={block} />;
  if (block.type === "calculator") return <CalculatorBlock block={block} />;
  if (block.type === "simulation") return <SimulationBlock block={block} />;
  if (block.type === "timeline" || block.type === "comparison") {
    return (
      <section className={styles.activity}>
        <header>{label ? <span>{label}</span> : null}<h3>{title || block.type}</h3></header>
        {text(payload, "instructions") ? <p>{text(payload, "instructions")}</p> : null}
        <StructuredItems items={objects(payload.items)} />
        <Sources block={block} />
      </section>
    );
  }
  if (block.type === "assignment") return <AssignmentBlock block={block} />;
  if (block.type === "quiz" || block.type === "project") {
    return (
      <section className={styles.activity}>
        <header><span>{block.type}</span><h3>{title || "Apply what you learned"}</h3></header>
        <p>{text(payload) || text(payload, "instructions")}</p>
        {block.type === "quiz" ? <p>Knowledge-check grading is disabled for this imported draft.</p> : null}
        <Sources block={block} />
      </section>
    );
  }
  if (block.type === "media" || block.type === "narration") return <MediaBlock block={block} />;
  if (block.type === "source" || block.type === "warning" || block.type === "callout" || block.type === "action") {
    const variant = typeof payload.variant === "string" ? payload.variant : block.type;
    return (
      <aside className={styles.callout} data-variant={variant}>
        <header>{label ? <span>{label}</span> : null}{title ? <h3>{title}</h3> : null}</header>
        <p>{text(payload)}</p>
        <Sources block={block} />
      </aside>
    );
  }
  return (
    <section className={styles.unsupported} data-block-id={block.id}>
      <strong>Admin preview warning</strong>
      <p>Unsupported content block “{block.type}” was preserved but cannot be rendered interactively. Record: {block.id}</p>
    </section>
  );
}
