"use client"

import { useBackofficeAuth } from '@/hooks/useBackofficeAuth'

function CopyButton({ value, label }: { value: string | null | undefined; label: string }) {
  if (!value) return null
  return (
    <button type="button" className="iv-textlink text-xs" onClick={() => void navigator.clipboard.writeText(value)}>
      {label}
    </button>
  )
}

export function AccountPanel() {
  const { profile } = useBackofficeAuth()

  return (
    <section className="space-y-6">
      <div className="iv-panel p-6 sm:p-8">
        <p className="iv-label mb-2">Member Identity</p>
        <h1 className="iv-member-title mb-3">Account</h1>
        <p className="iv-member-copy">Profile values are sourced from your authenticated Iron Vault member identity.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="iv-panel p-4">
          <p className="iv-member-meta mb-2">Email</p>
          <p className="text-sm break-all">{profile?.email ?? 'No email on file'}</p>
        </div>
        <div className="iv-panel p-4">
          <p className="iv-member-meta mb-2">Current tier</p>
          <p className="text-sm">{profile?.current_tier ?? 'MEMBER'}</p>
        </div>
        <div className="iv-panel p-4">
          <p className="iv-member-meta mb-2">Role</p>
          <p className="text-sm">{profile?.role ?? 'MEMBER'}</p>
        </div>
        <div className="iv-panel p-4">
          <p className="iv-member-meta mb-2">Referral code</p>
          <p className="text-sm">{profile?.referral_code ?? 'Unavailable'}</p>
        </div>
        <div className="iv-panel p-4">
          <p className="iv-member-meta mb-2">EVM Wallet</p>
          <p className="text-sm break-all">{profile?.evm_wallet_address ?? 'No EVM wallet linked'}</p>
        </div>
        <div className="iv-panel p-4">
          <p className="iv-member-meta mb-2">Solana IVT Wallet</p>
          <p className="text-sm break-all">{profile?.solana_ivt_wallet_address ?? 'Solana wallet not found'}</p>
          {!profile?.solana_ivt_wallet_address ? <p className="mt-3 text-sm text-amber-300">Solana wallet not found. Complete wallet setup before rewards can be sent.</p> : null}
          <div className="mt-3 flex flex-wrap gap-3">
            {profile?.solana_explorer_wallet_url ? (
              <a className="iv-textlink text-xs" href={profile.solana_explorer_wallet_url} target="_blank" rel="noreferrer">
                View Wallet on Solscan
              </a>
            ) : null}
            <CopyButton value={profile?.solana_ivt_wallet_address} label="Copy Solana Wallet" />
          </div>
        </div>
        <div className="iv-panel p-4">
          <p className="iv-member-meta mb-2">Vault XP</p>
          <p className="text-sm">{profile?.vault_xp?.toLocaleString() ?? '0'}</p>
        </div>
      </div>
    </section>
  )
}
