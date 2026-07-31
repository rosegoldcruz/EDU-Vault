'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'

type Summary = {
  totalCompletions: number
  eligibleMilestones: number
  queuedPayouts: number
  processingPayouts: number
  paidPayouts: number
  failedPayouts: number
  totalAmountRawPaid: string
}

type PayoutJob = {
  id: string
  privy_user_id: string
  milestone_number: number
  wallet_address: string
  token_mint: string
  amount_raw: string
  status: string
  attempts: number
  max_attempts: number
  next_attempt_at: string | null
  last_error: string | null
  locked_at: string | null
  locked_by: string | null
  created_at: string
  updated_at: string
}

type Transaction = {
  id: string
  payout_job_id: string
  privy_user_id: string
  milestone_number: number
  wallet_address: string
  token_mint: string
  amount_raw: string
  signature: string
  status: string
  confirmed_at: string | null
  created_at: string
}

const STATUS_OPTIONS = ['all', 'queued', 'processing', 'paid', 'failed', 'canceled'] as const

function statusClasses(status: string): string {
  switch (status) {
    case 'eligible': return 'text-amber-300 border-amber-500/30 bg-amber-500/10'
    case 'queued': return 'text-[color:var(--iv-ink-2)] border-[color:var(--iv-hairline)] bg-[color:var(--iv-soft-fill)]'
    case 'processing': return 'text-[color:var(--iv-ink-2)] border-[color:var(--iv-hairline)] bg-[color:var(--iv-soft-fill)]'
    case 'paid': return 'text-[color:var(--iv-accent)] border-acid/30 bg-acid/10'
    case 'failed': return 'text-[#ffb4a8] border-[#6f3934] bg-[#6f3934]/15'
    case 'canceled': return 'text-[color:var(--iv-ink-2)] border-[color:var(--iv-hairline)] bg-[color:var(--iv-soft-fill)]'
    default: return 'text-[color:var(--iv-ink-2)] border-[color:var(--iv-hairline)] bg-[color:var(--iv-soft-fill)]'
  }
}

export function AdminRewardsDashboard() {
  const { ready, authenticated, getAccessToken } = usePrivy()

  const [summary, setSummary] = useState<Summary | null>(null)
  const [jobs, setJobs] = useState<PayoutJob[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]>('all')
  const [milestoneFilter, setMilestoneFilter] = useState('all')
  const [search, setSearch] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionJobId, setActionJobId] = useState<string | null>(null)

  const fetchJson = useCallback(async (path: string) => {
    const token = await getAccessToken()
    if (!token) throw new Error('Missing auth token')

    const response = await fetch(path, { headers: { Authorization: `Bearer ${token}` } })
    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      const message = payload && typeof payload.error === 'string' ? payload.error : 'Request failed'
      throw new Error(message)
    }
    return payload
  }, [getAccessToken])

  const loadData = useCallback(async () => {
    if (!ready || !authenticated) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const query = new URLSearchParams()
      if (statusFilter !== 'all') query.set('status', statusFilter)
      if (milestoneFilter !== 'all') query.set('milestone', milestoneFilter)

      const [summaryPayload, jobsPayload, txPayload] = await Promise.all([
        fetchJson('/api/admin/rewards/summary'),
        fetchJson(`/api/admin/rewards/payout-jobs${query.toString() ? `?${query.toString()}` : ''}`),
        fetchJson(`/api/admin/rewards/transactions${query.toString() ? `?${query.toString()}` : ''}`),
      ])

      setSummary(summaryPayload as Summary)
      setJobs((jobsPayload as { jobs: PayoutJob[] }).jobs ?? [])
      setTransactions((txPayload as { transactions: Transaction[] }).transactions ?? [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load admin rewards data')
    } finally {
      setLoading(false)
    }
  }, [authenticated, fetchJson, milestoneFilter, ready, statusFilter])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const filteredJobs = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return jobs

    return jobs.filter((job) => {
      return (
        job.privy_user_id.toLowerCase().includes(needle)
        || job.wallet_address.toLowerCase().includes(needle)
        || job.id.toLowerCase().includes(needle)
      )
    })
  }, [jobs, search])
  const milestoneOptions = useMemo(() => {
    const values = new Set<number>()
    for (const job of jobs) {
      if (Number.isInteger(job.milestone_number)) values.add(job.milestone_number)
    }
    for (const transaction of transactions) {
      if (Number.isInteger(transaction.milestone_number)) values.add(transaction.milestone_number)
    }
    return ['all', ...Array.from(values).sort((a, b) => a - b).map(String)]
  }, [jobs, transactions])

  async function retryJob(id: string) {
    setActionJobId(id)
    setError(null)
    try {
      await fetchJson(`/api/admin/rewards/payout-jobs/${id}/retry`)
      await loadData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retry payout job')
    } finally {
      setActionJobId(null)
    }
  }

  async function cancelJob(id: string) {
    setActionJobId(id)
    setError(null)
    try {
      await fetchJson(`/api/admin/rewards/payout-jobs/${id}/cancel`)
      await loadData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to cancel payout job')
    } finally {
      setActionJobId(null)
    }
  }

  return (
    <section className="space-y-6">
      <div className="iv-panel  p-6">
        <p className="iv-label mb-2">Admin</p>
        <h1 className="iv-member-title mb-2 text-5xl">Reward Operations</h1>
        <p className="iv-member-copy text-sm">Monitor milestones, payout jobs, and transaction history.</p>
      </div>

      {error ? <div className="border border-[#6f3934] bg-[color:var(--iv-paper)] p-5 text-sm text-[#ffb4a8]">{error}</div> : null}

      {summary ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="iv-panel p-4"><p className="iv-member-meta">Completions</p><p className="iv-member-card-title text-3xl">{summary.totalCompletions}</p></div>
          <div className="iv-panel p-4"><p className="iv-member-meta">Eligible</p><p className="iv-member-card-title text-3xl">{summary.eligibleMilestones}</p></div>
          <div className="iv-panel p-4"><p className="iv-member-meta">Queued / Processing</p><p className="iv-member-card-title text-3xl">{summary.queuedPayouts} / {summary.processingPayouts}</p></div>
          <div className="iv-panel p-4"><p className="iv-member-meta">Paid / Failed</p><p className="iv-member-card-title text-3xl">{summary.paidPayouts} / {summary.failedPayouts}</p></div>
        </div>
      ) : null}

      {summary ? (
        <div className="iv-panel p-5">
          <p className="iv-member-meta mb-1">Total Raw Amount Paid</p>
          <p className="text-sm text-[color:var(--iv-accent)] break-all">{summary.totalAmountRawPaid}</p>
        </div>
      ) : null}

      <div className="iv-panel space-y-4 p-5">
        <div className="flex flex-wrap gap-3">
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as (typeof STATUS_OPTIONS)[number])} className="iv-member-field px-3 py-2 text-sm">
            {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>

          <select value={milestoneFilter} onChange={(event) => setMilestoneFilter(event.target.value)} className="iv-member-field px-3 py-2 text-sm">
            {milestoneOptions.map((milestone) => <option key={milestone} value={milestone}>{milestone === 'all' ? 'all legacy milestones' : `legacy milestone ${milestone}`}</option>)}
          </select>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search user, wallet, or job id"
            className="iv-member-field min-w-[260px] flex-1 px-3 py-2 text-sm"
          />

          <button
            onClick={() => void loadData()}
            className="iv-btn iv-btn-ghost px-3 py-2 text-xs"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="iv-panel p-5">
        <p className="iv-member-meta mb-3">Payout Jobs</p>
        <div className="space-y-3">
          {filteredJobs.length === 0 ? <p className="text-sm text-[color:var(--iv-ink-2)]">No jobs found.</p> : null}
          {filteredJobs.map((job) => (
            <div key={job.id} className="border border-[color:var(--iv-hairline)] bg-[color:var(--iv-white)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="iv-member-card-title text-xl break-all">{job.id}</p>
                  <p className="text-xs text-[color:var(--iv-ink-2)] break-all">User: {job.privy_user_id}</p>
                  <p className="text-xs text-[color:var(--iv-ink-2)] break-all">Wallet: {job.wallet_address}</p>
                  <p className="text-xs text-[color:var(--iv-ink-2)]">Milestone {job.milestone_number} · Amount {job.amount_raw}</p>
                  <p className="text-xs text-[color:var(--iv-ink-2)]">Attempts {job.attempts} / {job.max_attempts}</p>
                  {job.last_error ? <p className="text-xs text-[#ffb4a8] break-all">Last Error: {job.last_error}</p> : null}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`inline-flex border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${statusClasses(job.status)}`}>
                    {job.status}
                  </span>

                  {job.status === 'failed' ? (
                    <button
                      onClick={() => void retryJob(job.id)}
                      disabled={actionJobId === job.id}
                      className="border border-acid/40 bg-acid/10 px-3 py-1.5 text-xs text-[color:var(--iv-accent)] disabled:opacity-50"
                    >
                      {actionJobId === job.id ? 'Retrying...' : 'Retry'}
                    </button>
                  ) : null}

                  {(job.status === 'failed' || job.status === 'queued' || job.status === 'processing') ? (
                    <button
                      onClick={() => void cancelJob(job.id)}
                      disabled={actionJobId === job.id}
                      className="border border-[#6f3934] bg-[#6f3934]/15 px-3 py-1.5 text-xs text-[#ffb4a8] disabled:opacity-50"
                    >
                      {actionJobId === job.id ? 'Canceling...' : 'Cancel'}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="iv-panel p-5">
        <p className="iv-member-meta mb-3">Transactions</p>
        <div className="space-y-3">
          {transactions.length === 0 ? <p className="text-sm text-[color:var(--iv-ink-2)]">No transactions found.</p> : null}
          {transactions.map((tx) => (
            <div key={tx.id} className="border border-[color:var(--iv-hairline)] bg-[color:var(--iv-white)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="iv-member-card-title text-xl">Milestone {tx.milestone_number}</p>
                  <p className="text-xs text-[color:var(--iv-ink-2)] break-all">Signature: {tx.signature}</p>
                  <p className="text-xs text-[color:var(--iv-ink-2)] break-all">User: {tx.privy_user_id}</p>
                  <p className="text-xs text-[color:var(--iv-ink-2)]">Amount Raw: {tx.amount_raw}</p>
                  <p className="text-xs text-[color:var(--iv-ink-2)]">Confirmed: {tx.confirmed_at ?? 'Pending'}</p>
                </div>
                <span className={`inline-flex border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${statusClasses(tx.status)}`}>
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
