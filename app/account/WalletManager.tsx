"use client";

import { useState } from "react";
import { getAccessToken, useConnectWallet } from "@privy-io/react-auth";
import { useCreateWallet, useWallets } from "@privy-io/react-auth/solana";

type SavedWallet = {
  id: string;
  address: string;
  chain: string;
  network: string;
  walletType: string;
  provider: string;
  ownershipStatus: string;
  isPrimary: boolean;
  isReward: boolean;
};

function shortAddress(address: string) {
  return `${address.slice(0, 5)}…${address.slice(-5)}`;
}

async function post(path: string, body: unknown) {
  const token = await getAccessToken();
  if (!token) throw new Error("Your session expired. Sign in again.");
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const payload = await response.json() as { error?: string };
  if (!response.ok) throw new Error(payload.error ?? "The wallet request failed.");
  return payload;
}

export function WalletManager({ savedWallets }: { savedWallets: SavedWallet[] }) {
  const { ready, wallets: connectedWallets } = useWallets();
  const { createWallet } = useCreateWallet();
  const { connectWallet } = useConnectWallet();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function verify(address: string) {
    const connected = connectedWallets.find((wallet) => wallet.address === address);
    if (!connected) throw new Error("Connect this wallet before verifying ownership.");
    setBusy(address);
    setError(null);
    setMessage("Review the ownership statement in your wallet.");
    try {
      const challenge = await post("/api/academy/wallets/challenge", { address }) as { id: string; message: string };
      const result = await connected.signMessage({ message: new TextEncoder().encode(challenge.message) });
      const signature = btoa(String.fromCharCode(...result.signature));
      await post("/api/academy/wallets/verify", { challengeId: challenge.id, signature });
      setMessage("Wallet ownership verified. Refreshing your account…");
      window.location.reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Wallet verification failed.");
      setMessage(null);
      setBusy(null);
    }
  }

  async function select(walletId: string, selection: "PRIMARY" | "REWARD") {
    setBusy(`${walletId}:${selection}`);
    setError(null);
    try {
      await post("/api/academy/wallets/select", { walletId, selection });
      window.location.reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Wallet selection failed.");
      setBusy(null);
    }
  }

  return (
    <div className="academy-wallet-manager">
      <div className="academy-wallet-actions">
        <button className="academy-primary-button" type="button" onClick={() => connectWallet()}>
          Connect external Solana wallet
        </button>
        <button className="academy-secondary-button" type="button" onClick={() => void createWallet()}>
          Create Privy embedded wallet
        </button>
      </div>
      {!ready ? <p className="academy-status">Loading Privy wallet connections…</p> : null}
      {connectedWallets.length ? (
        <section>
          <h3>Privy wallet connections</h3>
          <ul className="academy-wallet-list">
            {connectedWallets.map((wallet) => {
              const saved = savedWallets.find((item) => item.address === wallet.address);
              return (
                <li key={wallet.address}>
                  <div><strong>{wallet.standardWallet.name === "Privy" ? "Embedded wallet" : "External wallet"}</strong><code title={wallet.address}>{shortAddress(wallet.address)}</code></div>
                  <span>{saved?.ownershipStatus === "VERIFIED" ? "Verified" : "Verification required"}</span>
                  {saved?.ownershipStatus === "VERIFIED" ? null : <button type="button" disabled={busy === wallet.address} onClick={() => void verify(wallet.address)}>{busy === wallet.address ? "Waiting for signature…" : "Verify ownership"}</button>}
                </li>
              );
            })}
          </ul>
        </section>
      ) : <p className="academy-empty">No wallet is currently connected in Privy.</p>}
      <section>
        <h3>Verified academy wallets</h3>
        {savedWallets.length ? <ul className="academy-wallet-list">{savedWallets.map((wallet) => <li key={wallet.id}><div><strong>{wallet.walletType === "EMBEDDED" ? "Privy embedded wallet" : "Verified external wallet"}</strong><code title={wallet.address}>{shortAddress(wallet.address)}</code><small>{wallet.chain} · {wallet.network} · {wallet.provider}</small></div><span>{wallet.ownershipStatus}</span><div className="academy-wallet-selection"><button type="button" disabled={wallet.isPrimary || busy === `${wallet.id}:PRIMARY`} onClick={() => void select(wallet.id, "PRIMARY")}>{wallet.isPrimary ? "Primary wallet" : "Set primary"}</button><button type="button" disabled={wallet.isReward || busy === `${wallet.id}:REWARD`} onClick={() => void select(wallet.id, "REWARD")}>{wallet.isReward ? "Reward wallet" : "Set reward"}</button></div></li>)}</ul> : <p className="academy-empty">No verified wallet records yet.</p>}
      </section>
      {message ? <p className="academy-notice" role="status">{message}</p> : null}
      {error ? <p className="academy-error" role="alert">{error}</p> : null}
      <p className="academy-wallet-warning"><strong>Iron Vault will never ask for your seed phrase or private key.</strong> Ownership verification signs a message only. It does not authorize a transaction.</p>
    </div>
  );
}
