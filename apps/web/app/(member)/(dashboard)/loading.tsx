import { MemberState } from "@/components/member/ui"

export default function DashboardLoading() {
  return (
    <div className="iv-shell iv-member-main">
      <MemberState
        title="Opening your member workspace"
        message="Loading your verified account, access, and activity."
        tone="loading"
      />
    </div>
  )
}
