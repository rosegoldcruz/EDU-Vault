'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'

import { MemberError, MemberPageHeader, MemberPanel, MemberState } from '@/components/member/ui'

type RewardProgramState =
  | 'pending_review'
  | 'approved'
  | 'fulfilled'
  | 'not_currently_eligible'

type LegacyMilestone = {
  milestone_number: number
  module_start: number
  module_end: number
  status: string
  eligible_at: string | null
}

type LegacyPayoutJob = {
  milestone_number: number | null
  module_number: number | null
  status: string
  amount_raw: string
  attempts: number
  last_error: string | null
}

type LegacyTransaction = {
  milestone_number: number | null
  module_number: number | null
  signature: string
  status: string
  confirmed_at: string | null
  explorerUrl: string | null
}

type RewardStatusPayload = {
  rewardProgram: {
    id: string | null
    name: string | null
    state: RewardProgramState
    requirements: string[]
    progress: Record<string, unknown> | null
    message?: string
  }
  curriculum: {
    releaseId: string
    releaseVersion: string
  }
  solanaIvtWalletAddress: string | null
  solanaExplorerWalletUrl: string | null
  ivtTokenMintExplorerUrl: string | null
  ivtTokenBalance: {
    amountRaw: string
    decimals: number
    uiAmount: string
  } | null
  legacyRewardHistory: {
    milestones: LegacyMilestone[]
    payoutJobs: LegacyPayoutJob[]
    transactions: LegacyTransaction[]
  }
}

const STATE_LABELS: Record<RewardProgramState, string> = {
  pending_review: 'Pending review',
  approved: 'Approved',
  fulfilled: 'Fulfilled',
  not_currently_eligible: 'Not currently eligible',
}

function CopyButton({ value }: { value: string | null }) {
  if (!value) return null
  return (
    <button
      type="button"
      className="iv-textlink text-sm"
      onClick={() => void navigator.clipboard.writeText(value)}
    >
      Copy wallet
    </button>
  )
}

export default function RewardsPage() {
  const { ready, authenticated, getAccessToken } = usePrivy()
  const [data, setData] = useState<RewardStatusPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ready || !authenticated) return
    let cancelled = false

    async function load() {
      try {
        const token = await getAccessToken()
        if (!token) throw new Error('Unable to retrieve the authenticated session.')
        const response = await fetch('/api/rewards/status', {
          cache: 'no-store',
          headers: { Authorization: `Bearer ${token}` },
        })
        const payload = await response.json() as RewardStatusPayload & { error?: string }
        if (!response.ok) throw new Error(payload.error ?? 'Unable to load reward status.')
        if (!cancelled) setData(payload)
      } catch (loadError: unknown) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load reward status.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [authenticated, getAccessToken, ready])

  const historyCount = data
    ? data.legacyRewardHistory.milestones.length
      + data.legacyRewardHistory.payoutJobs.length
      + data.legacyRewardHistory.transactions.length
    : 0

  return (
    <section className="space-y-6">
      <MemberPageHeader
        title="Rewards"
        accent="Program status."
        description="Reward programs are governed by the approved policy assigned to your account, independently from Academy completion."
      />

      {loading ? <MemberState title="Loading reward program" message="Resolving your assigned policy and history." tone="loading" /> : null}
      {error ? <MemberError message={error} /> : null}

      {data ? (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <MemberPanel
              title="Reward program status"
              description={data.rewardProgram.name ?? 'No active policy assigned'}
            >
              <div className="space-y-4">
                <span className="iv-chip" data-state={data.rewardProgram.state === 'fulfilled' ? 'verified' : 'pending'}>
                  {STATE_LABELS[data.rewardProgram.state]}
                </span>
                <p className="iv-member-copy">
                  {data.rewardProgram.message
                    ?? 'Eligibility and fulfillment follow the approved requirements shown below.'}
                </p>
                {data.rewardProgram.requirements.length > 0 ? (
                  <div>
                    <p className="iv-member-meta mb-3">Eligibility requirements</p>
                    <ul className="space-y-2">
                      {data.rewardProgram.requirements.map((requirement) => (
                        <li key={requirement} className="iv-member-copy text-sm">• {requirement}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {data.rewardProgram.progress ? (
                  <pre className="overflow-auto border border-[color:var(--iv-hairline)] bg-[color:var(--iv-white)] p-4 text-xs text-[color:var(--iv-ink-2)]">
                    {JSON.stringify(data.rewardProgram.progress, null, 2)}
                  </pre>
                ) : null}
              </div>
            </MemberPanel>

            <MemberPanel title="Reward wallet" description="Wallet details are informational and do not imply eligibility or a pending payout.">
              <div className="space-y-4">
                <div>
                  <p className="iv-member-meta mb-2">Solana wallet</p>
                  <p className="break-all text-sm text-[color:var(--iv-ink)]">
                    {data.solanaIvtWalletAddress ?? 'No wallet available'}
                  </p>
                </div>
                <div>
                  <p className="iv-member-meta mb-2">Current token balance</p>
                  <p className="iv-member-card-title text-3xl">{data.ivtTokenBalance?.uiAmount ?? 'Unavailable'}</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <CopyButton value={data.solanaIvtWalletAddress} />
                  {data.solanaExplorerWalletUrl ? (
                    <a className="iv-textlink text-sm" href={data.solanaExplorerWalletUrl} target="_blank" rel="noreferrer">View wallet</a>
                  ) : null}
                  {data.ivtTokenMintExplorerUrl ? (
                    <a className="iv-textlink text-sm" href={data.ivtTokenMintExplorerUrl} target="_blank" rel="noreferrer">View token mint</a>
                  ) : null}
                </div>
              </div>
            </MemberPanel>
          </div>

          <MemberPanel
            title="Legacy Reward History"
            description="Historical milestones, payout jobs, and transactions are preserved for recordkeeping and do not define current Academy progression."
          >
            {historyCount === 0 ? (
              <MemberState title="No legacy reward records" message="No historical reward activity is recorded for this account." />
            ) : (
              <div className="space-y-6">
                {data.legacyRewardHistory.milestones.length > 0 ? (
                  <div>
                    <p className="iv-member-meta mb-3">Historical milestones</p>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {data.legacyRewardHistory.milestones.map((milestone) => (
                        <article key={milestone.milestone_number} className="border border-[color:var(--iv-hairline)] bg-[color:var(--iv-white)] p-4">
                          <p className="iv-member-card-title text-xl">Legacy milestone {milestone.milestone_number}</p>
                          <p className="iv-member-copy mt-2 text-sm">Recorded status: {milestone.status}</p>
                          <p className="iv-member-meta mt-2">Historical module metadata: {milestone.module_start}–{milestone.module_end}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null}

                {data.legacyRewardHistory.payoutJobs.map((job, index) => (
                  <div key={`${job.milestone_number ?? 'module'}-${job.module_number ?? 'none'}-${index}`} className="border border-[color:var(--iv-hairline)] bg-[color:var(--iv-white)] p-4">
                    <p className="iv-member-card-title text-lg">Legacy payout job</p>
                    <p className="iv-member-copy mt-1 text-sm">Status: {job.status}</p>
                    {job.last_error ? <p className="mt-2 text-sm text-[#ffb4a8]">{job.last_error}</p> : null}
                  </div>
                ))}

                {data.legacyRewardHistory.transactions.map((transaction) => (
                  <div key={transaction.signature} className="border border-[color:var(--iv-hairline)] bg-[color:var(--iv-white)] p-4">
                    <p className="iv-member-card-title text-lg">Legacy transaction</p>
                    <p className="iv-member-copy mt-1 text-sm">Status: {transaction.status}</p>
                    <p className="iv-member-meta mt-2 break-all">{transaction.signature}</p>
                    {transaction.explorerUrl ? (
                      <a className="iv-textlink mt-3 text-sm" href={transaction.explorerUrl} target="_blank" rel="noreferrer">View transaction</a>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </MemberPanel>
        </>
      ) : null}
    </section>
  )
}
