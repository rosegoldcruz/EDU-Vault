import { getSupabaseAdmin } from '@/lib/server/supabase-admin'
import { resolveEducationAuthUserId } from '@/lib/education-actions'
import { getLegacyModuleNumbers } from '@/lib/server/active-curriculum'

type LatestQuizRow = {
  module_index: number
  passed: boolean
  attempted_at: string
}

export type ModuleCompletionStatus = {
  moduleNumber: number
  completed: boolean
  completedAt?: string | null
  reason?: string
}

async function getLatestQuizByModule(privyUserId: string): Promise<Map<number, LatestQuizRow>> {
  const configuredModules = new Set(await getLegacyModuleNumbers())
  const resolvedUserId = await resolveEducationAuthUserId(privyUserId)

  const { data, error } = await getSupabaseAdmin()
    .from('quiz_results')
    .select('module_index, passed, attempted_at')
    .eq('user_id', resolvedUserId)
    .order('attempted_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const latestByModule = new Map<number, LatestQuizRow>()

  for (const row of (data ?? []) as LatestQuizRow[]) {
    const moduleNumber = Number(row.module_index)
    if (!configuredModules.has(moduleNumber)) continue
    if (!latestByModule.has(moduleNumber)) {
      latestByModule.set(moduleNumber, row)
    }
  }

  return latestByModule
}

export async function getUserModuleCompletionStatus(
  privyUserId: string,
): Promise<ModuleCompletionStatus[]> {
  const configuredModules = await getLegacyModuleNumbers()
  const latestByModule = await getLatestQuizByModule(privyUserId)

  return configuredModules.map((moduleNumber): ModuleCompletionStatus => {
    const latestQuiz = latestByModule.get(moduleNumber)

    if (!latestQuiz) {
      return {
        moduleNumber,
        completed: false,
        completedAt: null,
        reason: 'No quiz attempt recorded for module',
      }
    }

    if (!latestQuiz.passed) {
      return {
        moduleNumber,
        completed: false,
        completedAt: null,
        reason: 'Latest quiz attempt is not passed',
      }
    }

    return {
      moduleNumber,
      completed: true,
      completedAt: latestQuiz.attempted_at,
      reason: 'Latest quiz attempt is passed',
    }
  })
}

export async function isModuleComplete(
  privyUserId: string,
  moduleNumber: number,
): Promise<boolean> {
  const configuredModules = await getLegacyModuleNumbers()
  if (!configuredModules.includes(moduleNumber)) {
    throw new Error('Invalid moduleNumber: not present in the active curriculum release')
  }

  const statuses = await getUserModuleCompletionStatus(privyUserId)
  const status = statuses.find((entry) => entry.moduleNumber === moduleNumber)

  return status?.completed === true
}
