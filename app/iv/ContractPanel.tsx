"use client";

import { useState } from "react";

interface ContractPanelProps {
  mintAddress: string | null;
}

/**
 * Terminal-style contract readout. Renders live contract data when the mint
 * address is configured; otherwise states plainly that publication is pending.
 * Never fabricates on-chain data.
 */
export function ContractPanel({ mintAddress }: ContractPanelProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!mintAddress) return;
    try {
      await navigator.clipboard.writeText(mintAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — the address remains selectable */
    }
  }

  return (
    <div className="iv-contract iv-panel">
      <div className="iv-contract-row">
        <span>Token</span>
        <code>IV SOL</code>
      </div>
      <div className="iv-contract-row">
        <span>Network</span>
        <code>Solana mainnet-beta</code>
      </div>
      <div className="iv-contract-row">
        <span>Contract address</span>
        {mintAddress ? (
          <>
            <code>{mintAddress}</code>
            <button className="iv-copy-btn" type="button" onClick={copy} data-copied={copied}>
              {copied ? "Copied" : "Copy"}
            </button>
            <a
              href={`https://solscan.io/token/${mintAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on explorer
            </a>
          </>
        ) : (
          <code style={{ color: "var(--iv-amber)" }}>Publication pending — verify only against official channels</code>
        )}
      </div>
      <div className="iv-contract-row">
        <span>Rewards policy</span>
        <code>Manual review only — no automated transfers</code>
      </div>
    </div>
  );
}
