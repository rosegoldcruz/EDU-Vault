import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { BackofficeProvider } from '@/components/backoffice/BackofficeProvider'
import { BackofficeLayout } from '@/components/backoffice/BackofficeLayout'
import { canAccessDashboard, getMemberAccessScope } from '@/lib/server/member-access'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  try {
    const scope = await getMemberAccessScope()
    if (!canAccessDashboard(scope)) {
      redirect('/access-required')
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Access denied'
    if (message.startsWith('Unauthorized:')) {
      redirect('/login?returnTo=%2Fdashboard')
    }
    redirect('/access-required')
  }

  const cookieStore = await cookies()
  const initialCollapsed = cookieStore.get('iv-member-sidebar')?.value === 'collapsed'

  return (
    <BackofficeProvider>
      <BackofficeLayout initialCollapsed={initialCollapsed}>
        {children}
      </BackofficeLayout>
    </BackofficeProvider>
  )
}
