/**
 * IRON VAULT ACADEMY — INTERACTIVE CONTENTBLOCK EXTENSION
 * ─────────────────────────────────────────────────────────────────────────
 * Adds 5 interactive block types to the existing ContentBlock switch:
 *   calculator | simulator | scenario | sortgame | reveal
 *
 * VERIFIED AGAINST SOURCE (v2_lessons.md / unlocked_vault.md):
 *   - ContentBlock dispatches on b.type via switch, default: return null
 *   - React imports available: useState, useEffect ONLY (line 3)
 *     → every component below uses local useState/useEffect, no new deps
 *   - Color system: #080808 bg | #0F0F0F surface | #141414 card
 *                    #AAFF00 lime | #7B2FBE purple | #C9A227 gold
 *   - Class convention: c-{name}; animation: fadeUp 0.4s ease
 *   - Fonts already loaded globally: Bebas Neue, DM Sans, Space Mono
 *
 * INTEGRATION (3 steps):
 *   1. Ensure top import includes useState (already present) — no change needed.
 *   2. Replace the existing `default: return null;` line inside ContentBlock
 *      with the 5 new cases below (keep default: return null as the last line).
 *   3. Append the CSS block (c-calc, c-sim, c-scn, c-sort, c-rev …) into the
 *      component's <style> string, next to the existing .c-vault rules.
 * ─────────────────────────────────────────────────────────────────────────
 */

/* ═══════════════════════════════════════════════════════════════════════
   STEP 2 — NEW CASES for the ContentBlock switch.
   Paste these BEFORE `default: return null;`
   ═══════════════════════════════════════════════════════════════════════ */

/*
    case "calculator": return <CalcBlock b={b} />;
    case "simulator":  return <SimBlock b={b} />;
    case "scenario":   return <ScenarioBlock b={b} />;
    case "sortgame":   return <SortGameBlock b={b} />;
    case "reveal":     return <RevealBlock b={b} />;
*/

/* ═══════════════════════════════════════════════════════════════════════
   INTERACTIVE COMPONENTS
   Each is self-contained. Data comes from the block object `b`.
   ═══════════════════════════════════════════════════════════════════════ */

// ─── 1. CALCULATOR ─────────────────────────────────────────────────────────
// Block schema:
// { type:"calculator", variant:"compound"|"streams",
//   title, note,
//   inputs:[{ key, label, min, max, step, default, prefix, suffix }],
//   // compound uses keys: principal, monthly, rate, years
//   // streams uses inputs as an editable list of income streams (see variant)
// }
function CalcBlock({ b }) {
  const init = {};
  (b.inputs || []).forEach((i) => { init[i.key] = i.default; });
  const [vals, setVals] = useState(init);

  const set = (k, v) => setVals((p) => ({ ...p, [k]: v }));
  const fmt = (n) =>
    "$" + Math.round(n).toLocaleString("en-US");

  let result = null;
  let breakdown = null;

  if (b.variant === "compound") {
    const P = Number(vals.principal) || 0;
    const M = Number(vals.monthly) || 0;
    const r = (Number(vals.rate) || 0) / 100 / 12;
    const n = (Number(vals.years) || 0) * 12;
    // Future value: principal compounded + monthly contributions (annuity)
    const fvP = P * Math.pow(1 + r, n);
    const fvM = r === 0 ? M * n : M * ((Math.pow(1 + r, n) - 1) / r);
    const total = fvP + fvM;
    const contributed = P + M * n;
    const growth = total - contributed;
    result = total;
    breakdown = [
      { label: "You put in", value: fmt(contributed), color: "#777" },
      { label: "Growth (the vault's work)", value: fmt(growth), color: "#AAFF00" },
      { label: "Final balance", value: fmt(total), color: "#C9A227" },
    ];
  }

  if (b.variant === "streams") {
    const total = (b.inputs || []).reduce(
      (sum, i) => sum + (Number(vals[i.key]) || 0), 0
    );
    result = total * 12;
    breakdown = (b.inputs || []).map((i) => ({
      label: i.label,
      value: fmt((Number(vals[i.key]) || 0)) + "/mo",
      color: "#777",
    }));
    breakdown.push({
      label: "Annual passive income",
      value: fmt(total * 12),
      color: "#C9A227",
    });
  }

  return (
    <div className="c-calc">
      <div className="c-calc-head">
        <span className="c-int-tag">CALCULATOR</span>
        <span className="c-calc-title">{b.title}</span>
      </div>
      {(b.inputs || []).map((i) => (
        <div className="c-calc-row" key={i.key}>
          <div className="c-calc-label">
            <span>{i.label}</span>
            <span className="c-calc-val">
              {i.prefix || ""}{Number(vals[i.key]).toLocaleString("en-US")}{i.suffix || ""}
            </span>
          </div>
          <input
            type="range"
            min={i.min} max={i.max} step={i.step}
            value={vals[i.key]}
            onChange={(e) => set(i.key, Number(e.target.value))}
            className="c-range"
          />
        </div>
      ))}
      <div className="c-calc-result">
        {breakdown.map((row, idx) => (
          <div className="c-calc-brk" key={idx}>
            <span className="c-calc-brk-label">{row.label}</span>
            <span className="c-calc-brk-val" style={{ color: row.color }}>{row.value}</span>
          </div>
        ))}
      </div>
      {b.note && <div className="c-int-note">{b.note}</div>}
    </div>
  );
}

// ─── 2. SIMULATOR ──────────────────────────────────────────────────────────
// Block schema:
// { type:"simulator", variant:"bankroll",
//   title, note,
//   start:1000, betPct:{min,max,step,default}, rounds:100,
//   winProb:0.5, winMult:2, loseMult:1  // payoff on win/loss of the staked amount
// }
// Runs a repeated favorable-bet simulation to teach ruin / position sizing.
function SimBlock({ b }) {
  const [betPct, setBetPct] = useState(b.betPct?.default ?? 25);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState([b.start ?? 1000]);
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (!running) return;
    if (round >= (b.rounds ?? 100)) { setRunning(false); return; }
    const t = setTimeout(() => {
      setHistory((h) => {
        const bal = h[h.length - 1];
        if (bal <= 0.01) { setRunning(false); return h; }
        const stake = bal * (betPct / 100);
        const win = Math.random() < (b.winProb ?? 0.5);
        const next = win
          ? bal + stake * ((b.winMult ?? 2) - 1)
          : bal - stake * (b.loseMult ?? 1);
        return [...h, Math.max(0, next)];
      });
      setRound((r) => r + 1);
    }, 40);
    return () => clearTimeout(t);
  }, [running, round, betPct, b]);

  const reset = () => { setHistory([b.start ?? 1000]); setRound(0); setRunning(false); };
  const run = () => { reset(); setTimeout(() => setRunning(true), 30); };

  const bal = history[history.length - 1];
  const start = b.start ?? 1000;
  const peak = Math.max(...history);
  const max = Math.max(peak, start) * 1.1;
  const pts = history.map((v, i) => {
    const x = (i / Math.max(1, (b.rounds ?? 100))) * 100;
    const y = 100 - (v / max) * 100;
    return `${x},${y}`;
  }).join(" ");
  const ruined = bal <= 0.01;
  const up = bal >= start;

  return (
    <div className="c-sim">
      <div className="c-calc-head">
        <span className="c-int-tag">SIMULATOR</span>
        <span className="c-calc-title">{b.title}</span>
      </div>
      <div className="c-calc-row">
        <div className="c-calc-label">
          <span>Bet size per round</span>
          <span className="c-calc-val">{betPct}% of bankroll</span>
        </div>
        <input
          type="range"
          min={b.betPct?.min ?? 1} max={b.betPct?.max ?? 100} step={b.betPct?.step ?? 1}
          value={betPct} disabled={running}
          onChange={(e) => setBetPct(Number(e.target.value))}
          className="c-range"
        />
      </div>
      <div className="c-sim-chart">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="c-sim-svg">
          <line x1="0" y1={100 - (start / max) * 100} x2="100" y2={100 - (start / max) * 100}
            stroke="#333" strokeWidth="0.4" strokeDasharray="1.5,1.5" />
          <polyline points={pts} fill="none"
            stroke={ruined ? "#7B2FBE" : up ? "#AAFF00" : "#C9A227"} strokeWidth="0.8" />
        </svg>
      </div>
      <div className="c-sim-stats">
        <div className="c-sim-stat">
          <span className="c-sim-stat-label">BANKROLL</span>
          <span className="c-sim-stat-val" style={{ color: ruined ? "#7B2FBE" : up ? "#AAFF00" : "#C9A227" }}>
            ${Math.round(bal).toLocaleString("en-US")}
          </span>
        </div>
        <div className="c-sim-stat">
          <span className="c-sim-stat-label">ROUND</span>
          <span className="c-sim-stat-val">{round}/{b.rounds ?? 100}</span>
        </div>
        <div className="c-sim-stat">
          <span className="c-sim-stat-label">STATUS</span>
          <span className="c-sim-stat-val" style={{ color: ruined ? "#7B2FBE" : "#777" }}>
            {ruined ? "RUINED" : running ? "RUNNING" : "READY"}
          </span>
        </div>
      </div>
      <div className="c-int-btns">
        <button className="c-int-btn" onClick={run} disabled={running}>▶ RUN THE ODDS</button>
        <button className="c-int-btn gold" onClick={reset} disabled={running}>↺ RESET</button>
      </div>
      {b.note && <div className="c-int-note">{b.note}</div>}
    </div>
  );
}

// ─── 3. SCENARIO ───────────────────────────────────────────────────────────
// Block schema:
// { type:"scenario", title, prompt,
//   nodes: {
//     start: { text, choices:[{ label, to }] },
//     <id>:  { text, outcome:"good"|"bad"|"neutral", lesson, to?  } | { text, choices:[...] }
//   }
// }
function ScenarioBlock({ b }) {
  const [nodeId, setNodeId] = useState("start");
  const [path, setPath] = useState(["start"]);
  const node = b.nodes[nodeId];

  const go = (to) => { setNodeId(to); setPath((p) => [...p, to]); };
  const restart = () => { setNodeId("start"); setPath(["start"]); };

  const outcomeColor = node.outcome === "good" ? "#AAFF00"
    : node.outcome === "bad" ? "#7B2FBE" : "#C9A227";

  return (
    <div className="c-scn">
      <div className="c-calc-head">
        <span className="c-int-tag">SCENARIO</span>
        <span className="c-calc-title">{b.title}</span>
      </div>
      {b.prompt && nodeId === "start" && <div className="c-scn-prompt">{b.prompt}</div>}
      <div className="c-scn-text" style={node.outcome ? { borderLeftColor: outcomeColor } : {}}>
        {node.text}
      </div>
      {node.lesson && (
        <div className="c-scn-lesson" style={{ color: outcomeColor }}>
          {node.outcome === "good" ? "▲ " : node.outcome === "bad" ? "▼ " : "◆ "}{node.lesson}
        </div>
      )}
      {node.choices && (
        <div className="c-scn-choices">
          {node.choices.map((c, i) => (
            <button key={i} className="c-scn-choice" onClick={() => go(c.to)}>{c.label}</button>
          ))}
        </div>
      )}
      {node.to && (
        <div className="c-scn-choices">
          <button className="c-scn-choice" onClick={() => go(node.to)}>Continue →</button>
        </div>
      )}
      {(node.outcome || (!node.choices && !node.to)) && (
        <div className="c-int-btns">
          <button className="c-int-btn gold" onClick={restart}>↺ RUN IT AGAIN</button>
        </div>
      )}
    </div>
  );
}

// ─── 4. SORTGAME ───────────────────────────────────────────────────────────
// Block schema:
// { type:"sortgame", title, note,
//   buckets:[{ id, label }, { id, label }],
//   items:[{ text, bucket }]   // bucket = correct bucket id
// }
function SortGameBlock({ b }) {
  const [placed, setPlaced] = useState({}); // itemIndex -> bucketId
  const [checked, setChecked] = useState(false);

  const place = (idx, bucketId) => {
    setPlaced((p) => ({ ...p, [idx]: bucketId }));
    setChecked(false);
  };
  const allPlaced = (b.items || []).every((_, i) => placed[i] != null);
  const correct = (b.items || []).filter((it, i) => placed[i] === it.bucket).length;

  return (
    <div className="c-sort">
      <div className="c-calc-head">
        <span className="c-int-tag">SORT</span>
        <span className="c-calc-title">{b.title}</span>
      </div>
      <div className="c-sort-items">
        {(b.items || []).map((it, i) => {
          const isRight = checked && placed[i] === it.bucket;
          const isWrong = checked && placed[i] != null && placed[i] !== it.bucket;
          return (
            <div className="c-sort-item" key={i}
              style={isRight ? { borderColor: "#AAFF00" } : isWrong ? { borderColor: "#7B2FBE" } : {}}>
              <span className="c-sort-item-text">{it.text}</span>
              <div className="c-sort-item-btns">
                {b.buckets.map((bk) => (
                  <button key={bk.id}
                    className={"c-sort-pick" + (placed[i] === bk.id ? " active" : "")}
                    onClick={() => place(i, bk.id)}>
                    {bk.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="c-int-btns">
        <button className="c-int-btn" disabled={!allPlaced} onClick={() => setChecked(true)}>
          ✓ CHECK
        </button>
        <button className="c-int-btn gold" onClick={() => { setPlaced({}); setChecked(false); }}>
          ↺ CLEAR
        </button>
      </div>
      {checked && (
        <div className="c-int-note" style={{ color: correct === b.items.length ? "#AAFF00" : "#C9A227" }}>
          {correct} / {b.items.length} correct.
          {correct === b.items.length ? " The vault recognizes you." : " Review the misses and run it again."}
        </div>
      )}
      {b.note && <div className="c-int-note">{b.note}</div>}
    </div>
  );
}

// ─── 5. REVEAL ─────────────────────────────────────────────────────────────
// Block schema:
// { type:"reveal", title, note,
//   steps:[{ label, heading, text, tag? }]   // progressive unlock, one at a time
// }
function RevealBlock({ b }) {
  const [open, setOpen] = useState(0); // number of revealed steps
  const total = (b.steps || []).length;

  return (
    <div className="c-rev">
      <div className="c-calc-head">
        <span className="c-int-tag">REVEAL</span>
        <span className="c-calc-title">{b.title}</span>
      </div>
      <div className="c-rev-track">
        {(b.steps || []).map((s, i) => {
          const shown = i < open;
          return (
            <div className={"c-rev-step" + (shown ? " open" : "")} key={i}>
              <div className="c-rev-node">
                <span className="c-rev-dot" style={shown ? { background: "#AAFF00", boxShadow: "0 0 8px #AAFF00" } : {}} />
                {i < total - 1 && <span className="c-rev-line" style={shown ? { background: "#AAFF00" } : {}} />}
              </div>
              <div className="c-rev-content">
                <div className="c-rev-label">{s.label}{s.tag ? ` · ${s.tag}` : ""}</div>
                {shown ? (
                  <>
                    <div className="c-rev-heading">{s.heading}</div>
                    <div className="c-rev-text">{s.text}</div>
                  </>
                ) : (
                  <div className="c-rev-locked">◇ locked</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="c-int-btns">
        <button className="c-int-btn" disabled={open >= total} onClick={() => setOpen((o) => o + 1)}>
          {open === 0 ? "▶ BEGIN" : open >= total ? "✓ COMPLETE" : "▼ REVEAL NEXT"}
        </button>
        {open > 0 && <button className="c-int-btn gold" onClick={() => setOpen(0)}>↺ RESET</button>}
      </div>
      {b.note && open >= total && <div className="c-int-note">{b.note}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   STEP 3 — CSS. Append into the component's <style> string,
   alongside the existing .c-vault / .c-callout rules.
   All colors + fadeUp animation match verified source conventions.
   ═══════════════════════════════════════════════════════════════════════ */
const INTERACTIVE_CSS = `
  /* ── SHARED INTERACTIVE CHROME ── */
  .c-calc,.c-sim,.c-scn,.c-sort,.c-rev{
    background:#0F0F0F;border:1px solid #1c1c1c;border-radius:6px;
    padding:20px;position:relative;overflow:hidden;animation:fadeUp 0.4s ease;
  }
  .c-calc::before,.c-sim::before,.c-scn::before,.c-sort::before,.c-rev::before{
    content:'';position:absolute;top:0;left:0;right:0;height:1px;
    background:linear-gradient(90deg,transparent,#7B2FBE,#AAFF00,transparent);
  }
  .c-calc-head{display:flex;align-items:center;gap:10px;margin-bottom:18px;}
  .c-int-tag{
    font-family:'Space Mono',monospace;font-size:8px;letter-spacing:2px;
    color:#080808;background:#AAFF00;padding:3px 7px;border-radius:2px;flex-shrink:0;
  }
  .c-calc-title{font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:1px;color:#eee;}
  .c-int-note{
    margin-top:14px;font-family:'Space Mono',monospace;font-size:11px;
    line-height:1.6;color:#666;letter-spacing:0.3px;
  }
  .c-int-btns{display:flex;gap:10px;margin-top:16px;}
  .c-int-btn{
    font-family:'Space Mono',monospace;font-size:10px;letter-spacing:1.5px;
    padding:9px 16px;border:1px solid rgba(170,255,0,0.4);
    background:rgba(170,255,0,0.06);color:#AAFF00;cursor:pointer;
    border-radius:3px;transition:background 0.15s;
  }
  .c-int-btn:hover:not(:disabled){background:rgba(170,255,0,0.14);}
  .c-int-btn:disabled{opacity:0.35;cursor:not-allowed;}
  .c-int-btn.gold{border-color:rgba(201,162,39,0.4);background:rgba(201,162,39,0.06);color:#C9A227;}
  .c-int-btn.gold:hover:not(:disabled){background:rgba(201,162,39,0.14);}

  /* ── RANGE SLIDER ── */
  .c-range{
    -webkit-appearance:none;appearance:none;width:100%;height:4px;
    background:#1c1c1c;border-radius:2px;outline:none;margin-top:4px;
  }
  .c-range::-webkit-slider-thumb{
    -webkit-appearance:none;appearance:none;width:16px;height:16px;border-radius:50%;
    background:#AAFF00;cursor:pointer;box-shadow:0 0 8px rgba(170,255,0,0.5);
  }
  .c-range::-moz-range-thumb{
    width:16px;height:16px;border-radius:50%;border:none;
    background:#AAFF00;cursor:pointer;box-shadow:0 0 8px rgba(170,255,0,0.5);
  }
  .c-range:disabled::-webkit-slider-thumb{background:#555;box-shadow:none;}

  /* ── CALCULATOR ── */
  .c-calc-row{margin-bottom:16px;}
  .c-calc-label{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px;}
  .c-calc-label>span:first-child{font-size:13px;color:#999;}
  .c-calc-val{font-family:'Space Mono',monospace;font-size:12px;color:#AAFF00;}
  .c-calc-result{
    margin-top:20px;padding-top:16px;border-top:1px solid #1c1c1c;
    display:flex;flex-direction:column;gap:8px;
  }
  .c-calc-brk{display:flex;justify-content:space-between;align-items:baseline;}
  .c-calc-brk-label{font-size:13px;color:#777;}
  .c-calc-brk-val{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:1px;}

  /* ── SIMULATOR ── */
  .c-sim-chart{
    height:120px;margin:16px 0;background:#0a0a0a;border:1px solid #1a1a1a;
    border-radius:4px;overflow:hidden;
  }
  .c-sim-svg{width:100%;height:100%;display:block;}
  .c-sim-stats{display:flex;gap:10px;}
  .c-sim-stat{
    flex:1;background:#0a0a0a;border:1px solid #1a1a1a;border-radius:4px;
    padding:10px 12px;display:flex;flex-direction:column;gap:4px;
  }
  .c-sim-stat-label{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:1.5px;color:#555;}
  .c-sim-stat-val{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:1px;color:#ccc;}

  /* ── SCENARIO ── */
  .c-scn-prompt{font-size:13px;color:#888;line-height:1.7;margin-bottom:14px;font-style:italic;}
  .c-scn-text{
    font-size:14px;color:#bbb;line-height:1.75;padding:14px 16px;
    background:#0a0a0a;border-left:3px solid #7B2FBE;border-radius:0 4px 4px 0;
  }
  .c-scn-lesson{
    margin-top:12px;font-family:'Space Mono',monospace;font-size:12px;
    line-height:1.6;letter-spacing:0.3px;
  }
  .c-scn-choices{display:flex;flex-direction:column;gap:8px;margin-top:14px;}
  .c-scn-choice{
    text-align:left;font-family:'DM Sans',sans-serif;font-size:13px;color:#ccc;
    padding:12px 14px;background:#111;border:1px solid #222;border-radius:4px;
    cursor:pointer;transition:all 0.15s;
  }
  .c-scn-choice:hover{border-color:#7B2FBE;background:rgba(123,47,190,0.08);color:#fff;}

  /* ── SORTGAME ── */
  .c-sort-items{display:flex;flex-direction:column;gap:10px;}
  .c-sort-item{
    display:flex;justify-content:space-between;align-items:center;gap:12px;
    padding:12px 14px;background:#0a0a0a;border:1px solid #1c1c1c;border-radius:4px;
    transition:border-color 0.2s;
  }
  .c-sort-item-text{font-size:13px;color:#bbb;line-height:1.5;flex:1;}
  .c-sort-item-btns{display:flex;gap:6px;flex-shrink:0;}
  .c-sort-pick{
    font-family:'Space Mono',monospace;font-size:9px;letter-spacing:1px;
    padding:6px 10px;background:#141414;border:1px solid #222;color:#666;
    border-radius:3px;cursor:pointer;transition:all 0.15s;
  }
  .c-sort-pick:hover{border-color:#7B2FBE;color:#aaa;}
  .c-sort-pick.active{background:#7B2FBE;border-color:#7B2FBE;color:#fff;}

  /* ── REVEAL ── */
  .c-rev-track{display:flex;flex-direction:column;}
  .c-rev-step{display:flex;gap:14px;}
  .c-rev-node{display:flex;flex-direction:column;align-items:center;flex-shrink:0;width:14px;}
  .c-rev-dot{
    width:12px;height:12px;border-radius:50%;background:#222;border:1px solid #333;
    margin-top:3px;transition:all 0.3s;flex-shrink:0;
  }
  .c-rev-line{width:1px;flex:1;min-height:24px;background:#222;transition:background 0.3s;}
  .c-rev-content{padding-bottom:20px;flex:1;}
  .c-rev-label{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:1.5px;color:#666;margin-bottom:4px;}
  .c-rev-heading{font-family:'Bebas Neue',sans-serif;font-size:15px;letter-spacing:0.5px;color:#C9A227;margin-bottom:4px;}
  .c-rev-text{font-size:13px;color:#888;line-height:1.7;}
  .c-rev-locked{font-family:'Space Mono',monospace;font-size:11px;color:#444;letter-spacing:1px;}
  .c-rev-step.open .c-rev-content{animation:fadeUp 0.4s ease;}
`;
