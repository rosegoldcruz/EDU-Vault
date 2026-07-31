"use client"

import { useEffect, useState } from 'react'
import { ExternalLink, Newspaper, RefreshCw, Sparkles } from 'lucide-react'

type DailyDefiNewsItem = {
  title: string
  url: string
  source: string
  publishedAt: string | null
  summary: string
  positiveLens: string
}

type DailyDefiNewsResponse = {
  asOf: string
  items: DailyDefiNewsItem[]
  sources: Array<{
    name: string
    url: string
    focus: string
  }>
}

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

function formatDate(value: string | null): string {
  if (!value) return 'Latest'

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function DailyDefiNewsSection() {
  const [loadState, setLoadState] = useState<LoadState>('idle')
  const [payload, setPayload] = useState<DailyDefiNewsResponse | null>(null)

  const loadNews = async () => {
    setLoadState('loading')
    try {
      const response = await fetch('/api/crypto-news/daily', {
        credentials: 'include',
        cache: 'no-store',
      })
      if (!response.ok) throw new Error('Unable to load news')
      const data = (await response.json()) as DailyDefiNewsResponse
      setPayload(data)
      setLoadState('ready')
    } catch {
      setLoadState('error')
    }
  }

  useEffect(() => {
    void loadNews()
  }, [])

  const items = payload?.items ?? []

  return (
    <div className="iv-panel  p-5 sm:p-6">
      <div className="mb-5 border-b border-[color:var(--iv-hairline)] pb-5">
        <div className="min-w-0">
          <p className="iv-label mb-2 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Daily DeFi Brief
          </p>
          <h2 className="iv-member-title text-3xl sm:text-4xl">Crypto Momentum Watch</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--iv-ink-2)]">
            A constructive scan of today&apos;s DeFi and digital asset headlines for Iron Vault members.
          </p>
        </div>
      </div>

      {loadState === 'loading' ? (
        <div className="flex min-h-48 items-center justify-center text-sm text-[color:var(--iv-ink-2)]">
          <RefreshCw className="mr-2 h-4 w-4 animate-spin text-[color:var(--iv-accent)]" />
          Loading today&apos;s DeFi headlines
        </div>
      ) : null}

      {loadState === 'error' ? (
        <div className="border border-[color:var(--iv-hairline)] bg-[color:var(--iv-white)] p-5 text-center">
          <Newspaper className="mx-auto mb-4 h-8 w-8 text-[color:var(--iv-ink-3)]" />
          <h3 className="iv-member-card-title mb-2 text-2xl">News feed unavailable</h3>
          <p className="mx-auto mb-5 max-w-md text-sm leading-6 text-[color:var(--iv-ink-2)]">
            The daily feed could not be reached right now. Please retry in a moment.
          </p>
          <button type="button" onClick={() => void loadNews()} className="iv-btn px-5 py-2 text-sm">
            Retry
          </button>
        </div>
      ) : null}

      {loadState === 'ready' && items.length === 0 ? (
        <div className="border border-[color:var(--iv-hairline)] bg-[color:var(--iv-white)] p-5 text-center">
          <Newspaper className="mx-auto mb-4 h-8 w-8 text-[color:var(--iv-ink-3)]" />
          <h3 className="iv-member-card-title mb-2 text-2xl">No DeFi headlines matched yet</h3>
          <p className="mx-auto max-w-md text-sm leading-6 text-[color:var(--iv-ink-2)]">
            The source scan ran, but there were no strong DeFi matches. Check back later today.
          </p>
        </div>
      ) : null}

      {loadState === 'ready' && items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <a
              key={item.url}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="block border border-[color:var(--iv-hairline)] bg-[color:var(--iv-white)] p-4 transition hover:border-acid/40 hover:bg-[color:var(--iv-paper)]"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[color:var(--iv-ink-3)]">
                <span className="iv-chip px-2 py-0.5 font-mono">{item.source}</span>
                <span>{formatDate(item.publishedAt)}</span>
                <ExternalLink className="h-3 w-3" />
              </div>
              <h3 className="text-base font-semibold leading-6 text-[color:var(--iv-ink)]">{item.title}</h3>
              {item.summary ? (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[color:var(--iv-ink-2)]">{item.summary}</p>
              ) : null}
              <p className="mt-3 border-l border-acid/35 pl-3 text-sm leading-6 text-[color:var(--iv-accent)]">
                {item.positiveLens}
              </p>
            </a>
          ))}
        </div>
      ) : null}

      <div className="mt-5 border-t border-[color:var(--iv-hairline)] pt-5">
        <p className="text-xs leading-5 text-[color:var(--iv-ink-3)]">
          Sources include The Defiant, Cointelegraph DeFi, CoinDesk, and Decrypt. Headlines link to the original publishers.
        </p>
      </div>
    </div>
  )
}
