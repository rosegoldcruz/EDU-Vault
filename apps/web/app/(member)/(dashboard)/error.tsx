"use client"

import { MemberError } from "@/components/member/ui"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <MemberError message={error.message || "The member workspace hit an unexpected error."} onRetry={reset} />
}
