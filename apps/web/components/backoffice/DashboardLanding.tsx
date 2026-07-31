"use client"

import Link from 'next/link'
import { ArrowRight, GraduationCap, Vault, Users, LifeBuoy, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useBackofficeAuth } from '@/hooks/useBackofficeAuth'
import { DailyDefiNewsSection } from '@/components/backoffice/DailyDefiNewsModal'
import { MemberMetric, MemberPageHeader } from '@/components/member/ui'

const baseQuickLinks = [
  { href: '/vault', title: 'Open Vault', desc: 'View your position matrix, investments, and referral stats.', icon: Vault },
  { href: '/referrals', title: 'Refer a Friend', desc: 'Share your referral link and submit new leads.', icon: Users },
  { href: '/status', title: 'Submit Status Request', desc: 'Open a support ticket with the Iron Vault team.', icon: LifeBuoy },
  { href: '/vip', title: 'View VIP Access', desc: 'Check your VIP status and premium member benefits.', icon: Star },
]

type AcademyState = {
  release: { id: string; version: string; title: string }
  progress: { completedRequired: number; totalRequired: number; percent: number }
  nextAction: {
    lessonId: string
    lessonTitle: string
    moduleId: string
    moduleTitle: string
    href: string
  } | null
}

export function DashboardLanding() {
  const { profile } = useBackofficeAuth()
  const { ready, authenticated, getAccessToken } = usePrivy()
  const [academyState, setAcademyState] = useState<AcademyState | null>(null)

  useEffect(() => {
    if (!ready || !authenticated) return
    let cancelled = false

    getAccessToken()
      .then((token) => {
        if (!token) return null
        return fetch('/api/academy/state', {
          cache: 'no-store',
          headers: { Authorization: `Bearer ${token}` },
        })
      })
      .then(async (response) => {
        if (!response?.ok) return null
        return await response.json() as AcademyState
      })
      .then((state) => {
        if (!cancelled && state) setAcademyState(state)
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [authenticated, getAccessToken, ready])

  const academyDescription = academyState?.nextAction
    ? `Continue “${academyState.nextAction.lessonTitle}” in ${academyState.nextAction.moduleTitle}.`
    : academyState && academyState.progress.totalRequired > 0
      ? `Required items complete: ${academyState.progress.completedRequired} of ${academyState.progress.totalRequired}.`
      : 'Resume the active curriculum assigned to your account.'
  const quickLinks = [
    {
      href: academyState?.nextAction?.href ?? '/academy',
      title: 'Continue Academy',
      desc: academyDescription,
      icon: GraduationCap,
    },
    ...baseQuickLinks,
  ]

  return (
    <section className="space-y-8">
      <MemberPageHeader
        title={`Welcome${profile?.email ? `, ${profile.email.split('@')[0]}.` : '.'}`}
        accent="Your vault is ready."
        description="Your Academy, Vault, referrals, rewards, and support are organized in one focused workspace."
      />
      <div className="iv-member-metrics">
        <MemberMetric label="Email" value={profile?.email ?? 'No email'} detail="Authenticated identity" />
        <MemberMetric label="Role" value={profile?.role ?? 'MEMBER'} detail="Current permissions" />
        <MemberMetric label="Tier" value={profile?.current_tier ?? 'MEMBER'} detail="Member access" />
        <MemberMetric label="Vault XP" value={(profile?.vault_xp ?? 0).toLocaleString()} detail="Verified learning activity" />
      </div>

      {/* Quick action links */}
      <div>
        <h2 className="iv-member-meta mb-4">Quick access</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.href}
                href={card.href}
                className="iv-panel iv-member-link-card group p-5"
              >
                <div className="iv-chip mb-4 inline-flex h-11 w-11 items-center justify-center" data-state="verified">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="iv-member-card-title mb-2 text-2xl">{card.title}</h3>
                <p className="iv-member-copy mb-4 text-sm">{card.desc}</p>
                <span className="iv-textlink text-sm">
                  Open <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Daily DeFi news */}
      <div>
        <DailyDefiNewsSection />
      </div>
    </section>
  )
}
