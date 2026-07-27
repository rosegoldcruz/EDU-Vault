"use client";

import { useState } from "react";
import { systemNodes } from "./data";

/**
 * Interactive platform architecture. Selecting a node opens the inspection
 * panel with plain-English description, current state, and dependencies.
 */
export function SystemDiagram() {
  const [activeId, setActiveId] = useState(systemNodes[1].id);
  const active = systemNodes.find((node) => node.id === activeId) ?? systemNodes[0];

  return (
    <div className="iv-system-wrap">
      <div className="iv-node-grid iv-panel" role="tablist" aria-label="Iron Vault system modules">
        {systemNodes.map((node) => (
          <button
            key={node.id}
            type="button"
            role="tab"
            aria-selected={node.id === activeId}
            aria-controls="iv-system-inspector"
            className="iv-node"
            data-active={node.id === activeId}
            onClick={() => setActiveId(node.id)}
          >
            <span className="iv-node-id">{node.id}</span>
            <b>{node.name}</b>
            <span className="iv-chip" data-state={node.state}>
              <span className="iv-dot" data-state={node.state} />
              {node.stateLabel}
            </span>
          </button>
        ))}
      </div>

      <aside className="iv-inspector iv-panel" id="iv-system-inspector" role="tabpanel" aria-live="polite">
        <span className="iv-inspector-kicker">Module {active.id}</span>
        <h3>{active.name}</h3>
        <span className="iv-chip" data-state={active.state}>
          <span className="iv-dot" data-state={active.state} />
          {active.stateLabel}
        </span>
        <p className="iv-inspector-desc">{active.description}</p>
        <div className="iv-inspector-meta">
          <div><span>Layer</span><span>{active.layer}</span></div>
          <div><span>Dependencies</span><span>{active.dependencies}</span></div>
        </div>
      </aside>
    </div>
  );
}
