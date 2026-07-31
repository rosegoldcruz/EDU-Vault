import { NextRequest, NextResponse } from "next/server"

import { getExistingProgress } from "@/lib/education-actions"
import {
  getActiveCurriculumLessons,
  getActiveCurriculumRelease,
} from "@/lib/server/active-curriculum"
import { getMemberAccessScope, requireMemberAccess } from "@/lib/server/member-access"

export async function GET(request: NextRequest) {
  try {
    const access = await requireMemberAccess(request)
    const [scope, release, lessons, legacyProgress] = await Promise.all([
      getMemberAccessScope(request),
      getActiveCurriculumRelease(),
      getActiveCurriculumLessons(),
      getExistingProgress(access.auth.privyUserId),
    ])

    const completedLegacyLessons = new Set(
      legacyProgress.lessons.map((lesson) => `${lesson.module_index}:${lesson.lesson_index}`),
    )
    const passedLegacyModules = new Set(
      legacyProgress.quizResults
        .filter((result) => result.passed)
        .map((result) => result.module_index),
    )
    const moduleById = new Map(release.modules.map((module) => [module.id, module]))
    const accessibleModuleIds = new Set(
      scope.allowedModuleIds.filter((moduleId) => {
        const curriculumModule = moduleById.get(moduleId)
        if (!curriculumModule) return false
        return curriculumModule.prerequisiteModuleIds.every((requiredId) => {
          const requiredModule = moduleById.get(requiredId)
          return requiredModule?.legacyNumber !== null
            && requiredModule?.legacyNumber !== undefined
            && passedLegacyModules.has(requiredModule.legacyNumber)
        })
      }),
    )
    const accessibleLessons = lessons.filter((lesson) => accessibleModuleIds.has(lesson.moduleId))
    const completedLessonIds = new Set(
      accessibleLessons
        .filter((lesson) => (
          lesson.moduleLegacyNumber !== null
          && lesson.legacyIndex !== null
          && completedLegacyLessons.has(`${lesson.moduleLegacyNumber}:${lesson.legacyIndex}`)
        ))
        .map((lesson) => lesson.id),
    )
    const nextLesson = accessibleLessons.find((lesson) => (
      !completedLessonIds.has(lesson.id)
      && lesson.prerequisiteLessonIds.every((requiredId) => completedLessonIds.has(requiredId))
    )) ?? null
    const requiredLessons = accessibleLessons.filter((lesson) => lesson.required)
    const completedRequired = requiredLessons.filter((lesson) => completedLessonIds.has(lesson.id)).length

    return NextResponse.json({
      release: {
        id: release.id,
        version: release.version,
        title: release.title,
      },
      progress: {
        completedRequired,
        totalRequired: requiredLessons.length,
        percent: requiredLessons.length === 0
          ? 0
          : Math.round((completedRequired / requiredLessons.length) * 100),
      },
      nextAction: nextLesson
        ? {
            lessonId: nextLesson.id,
            lessonTitle: nextLesson.title,
            moduleId: nextLesson.moduleId,
            moduleTitle: nextLesson.moduleTitle,
            href: "/academy",
          }
        : null,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to resolve Academy state"
    const status = message.startsWith("Unauthorized:")
      ? 401
      : message.startsWith("Forbidden:")
        ? 403
        : 500
    return NextResponse.json({ error: message }, { status })
  }
}
