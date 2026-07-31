'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'

export default function AccessRequiredPage() {
  const router = useRouter()
  const { logout } = usePrivy()
  const [resetting, setResetting] = useState(false)

  async function handleLoginReset() {
    if (resetting) return

    setResetting(true)

    try {
      await fetch('/api/auth/privy-session', {
        method: 'DELETE',
        credentials: 'include',
        cache: 'no-store',
      }).catch(() => null)

      if (typeof logout === 'function') {
        await logout()
      }
    } catch {
      await fetch('/api/auth/privy-session', {
        method: 'DELETE',
        credentials: 'include',
        cache: 'no-store',
      }).catch(() => null)
    } finally {
      router.replace('/')
      router.refresh()
    }
  }

  return (
    <main className="iv-member-auth">
      <div className="iv-panel iv-member-access-card">
        <p className="iv-label">Member access</p>
        <h1 className="iv-member-title">Access <span className="iv-serif">required.</span></h1>
        <p className="iv-member-copy">
          This portal is available only to approved Iron Vault members. Complete payment on the main Learn page or redeem an invite if one was issued to you.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/redeem-invite"
            className="iv-btn iv-btn-ghost"
          >
            Redeem Invite
          </Link>
          <Link
            href="/enroll"
            className="iv-btn"
          >
            Enroll Now
          </Link>
          <button
            type="button"
            onClick={handleLoginReset}
            disabled={resetting}
            className="iv-btn iv-btn-ghost disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resetting ? 'Signing Out...' : 'Back to Login'}
          </button>
        </div>
      </div>
    </main>
  )
}
