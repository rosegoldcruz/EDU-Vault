import { NextRequest, NextResponse } from "next/server"
import { getProgress, markLessonComplete } from "@/lib/education-actions"
import { ensureUserProfile } from "@/lib/backoffice-profile"
import { getLegacyModuleByNumber } from "@/lib/server/active-curriculum"
import { canAccessAcademyModule, getAcademyAccessScope, requireMemberAccess, type MemberAccessScope } from "@/lib/server/member-access"

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function mapAccessErrorToStatus(error: unknown): number {
  const message = error instanceof Error ? error.message : ""
  if (message.startsWith("Unauthorized:")) return 401
  if (message.startsWith("Forbidden:")) return 403
  return 500
}

function getMetadataString(metadata: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = metadata?.[key]
  return typeof value === "string" ? value : undefined
}

async function persistEducationProgressWithoutRewards(
  privyUserId: string,
  accessScope: MemberAccessScope,
  moduleId: number,
  persist: () => Promise<void>,
) {
  const curriculumModule = await getLegacyModuleByNumber(moduleId)
  if (!curriculumModule || !canAccessAcademyModule(accessScope, moduleId)) {
    return null
  }

  await persist()
  return { completedModules: [], eligibleMilestones: [], queuedMilestones: [], walletMissing: false }
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown

    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
    }

    const payload = (body ?? {}) as {
      action?: string
      moduleIndex?: unknown
      lessonIndex?: unknown
      score?: unknown
      passed?: unknown
      userId?: unknown
    }

    if (!isNonEmptyString(payload.action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    let privyUserId: string
    let accessScope: MemberAccessScope
    try {
      const academyAccess = await getAcademyAccessScope(req)
      if (!academyAccess.auth) {
        return NextResponse.json({ error: "Unauthorized: authentication required to save progress" }, { status: 401 })
      }

      privyUserId = academyAccess.auth.privyUserId
      accessScope = academyAccess.scope

      let memberAccess: Awaited<ReturnType<typeof requireMemberAccess>> | null = null
      if (accessScope.accessType !== "free") {
        memberAccess = await requireMemberAccess(req)
      }

      await ensureUserProfile(academyAccess.auth.privyUserId, {
        email: academyAccess.auth.email,
        walletAddress: academyAccess.auth.walletAddress,
        tier: getMetadataString(memberAccess?.entitlement?.metadata, "tier"),
      })
    } catch (error: unknown) {
      const status = mapAccessErrorToStatus(error)
      const message = error instanceof Error ? error.message : "Failed to verify member access"
      return NextResponse.json({ error: message }, { status })
    }

    if (payload.action === "get") {
      const data = await getProgress(privyUserId)
      return NextResponse.json(data)
    }

    if (payload.action === "lesson") {
      const moduleId = Number(payload.moduleIndex)
      const lessonIndex = Number(payload.lessonIndex)

      if (!Number.isInteger(moduleId) || !Number.isInteger(lessonIndex)) {
        return NextResponse.json({ error: "Invalid moduleIndex or lessonIndex" }, { status: 400 })
      }

      const progressSummary = await persistEducationProgressWithoutRewards(
        privyUserId,
        accessScope,
        moduleId,
        () => markLessonComplete(privyUserId, moduleId, lessonIndex),
      )
      if (!progressSummary) {
        return NextResponse.json({ error: "Forbidden: module access not purchased" }, { status: 403 })
      }
      return NextResponse.json({ success: true, ...progressSummary })
    }

    if (payload.action === "quiz") {
      return NextResponse.json(
        { error: "Graded Academy submissions are disabled until secure server scoring is connected." },
        { status: 503 },
      )
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to process progress request"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
