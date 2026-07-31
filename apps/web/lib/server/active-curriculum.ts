import { cache } from "react"

import { getDatabasePool } from "@iron-vault/database"

const DEFAULT_ACTIVE_RELEASE_VERSION = "legacy-2026-import-v1"

type CurriculumModuleRow = {
  id: string
  slug: string
  title: string
  access_class: string
  source_legacy_number: number | null
  sort_order: number
  xp_value: number
  prerequisites: unknown
  lesson_count: string
  required_lesson_count: string
  pathway_sort_order: number
  course_sort_order: number
}

type CurriculumReleaseRow = {
  id: string
  version: string
  title: string
  status: string
  pathway_count: string
  course_count: string
}

export type ActiveCurriculumModule = {
  id: string
  slug: string
  title: string
  accessClass: string
  legacyNumber: number | null
  order: number
  xpValue: number
  lessonCount: number
  requiredLessonCount: number
  prerequisiteModuleIds: string[]
}

export type ActiveCurriculumRelease = {
  id: string
  version: string
  title: string
  status: string
  pathwayCount: number
  courseCount: number
  moduleCount: number
  lessonCount: number
  requiredLessonCount: number
  configuredXp: number
  modules: ActiveCurriculumModule[]
}

export type ActiveCurriculumLesson = {
  id: string
  slug: string
  title: string
  moduleId: string
  moduleTitle: string
  moduleLegacyNumber: number | null
  order: number
  legacyIndex: number | null
  required: boolean
  prerequisiteLessonIds: string[]
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((entry): entry is string => typeof entry === "string" && entry.length > 0)
}

function prerequisiteModuleIds(value: unknown): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return []
  const policy = value as Record<string, unknown>
  return [
    ...stringArray(policy.required_module_ids),
    ...stringArray(policy.module_ids),
    ...stringArray(policy.all_of),
  ].filter((id, index, ids) => ids.indexOf(id) === index)
}

function prerequisiteLessonIds(value: unknown): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return []
  const policy = value as Record<string, unknown>
  return [
    ...stringArray(policy.required_lesson_ids),
    ...stringArray(policy.lesson_ids),
    ...stringArray(policy.all_of),
  ].filter((id, index, ids) => ids.indexOf(id) === index)
}

function selectedReleaseVersion(): string {
  return process.env.ACADEMY_RELEASE_VERSION?.trim() || DEFAULT_ACTIVE_RELEASE_VERSION
}

export const getActiveCurriculumRelease = cache(async (): Promise<ActiveCurriculumRelease> => {
  const pool = getDatabasePool()
  const version = selectedReleaseVersion()
  const releaseResult = await pool.query<CurriculumReleaseRow>(
    `
      SELECT
        curriculum_releases.id,
        curriculum_releases.version,
        curriculum_releases.title,
        curriculum_releases.status,
        COUNT(DISTINCT pathways.id)::text AS pathway_count,
        COUNT(DISTINCT courses.id)::text AS course_count
      FROM curriculum_releases
      INNER JOIN academies
        ON academies.id = curriculum_releases.academy_id
      LEFT JOIN pathways
        ON pathways.release_id = curriculum_releases.id
       AND pathways.editorial_state NOT IN ('retired', 'rejected')
      LEFT JOIN courses
        ON courses.pathway_id = pathways.id
       AND courses.editorial_state NOT IN ('retired', 'rejected')
      WHERE academies.slug = 'iron-vault-academy'
        AND curriculum_releases.version = $1
        AND curriculum_releases.status <> 'retired'
      GROUP BY curriculum_releases.id
      LIMIT 1
    `,
    [version],
  )
  const release = releaseResult.rows[0]
  if (!release) {
    throw new Error(`Configured Academy release is unavailable: ${version}`)
  }

  const moduleResult = await pool.query<CurriculumModuleRow>(
    `
      SELECT
        curriculum_modules.id,
        curriculum_modules.slug,
        curriculum_modules.title,
        curriculum_modules.access_class,
        curriculum_modules.source_legacy_number,
        curriculum_modules.sort_order,
        curriculum_modules.xp_value,
        curriculum_modules.prerequisites,
        pathways.sort_order AS pathway_sort_order,
        courses.sort_order AS course_sort_order,
        COUNT(lessons.id) FILTER (
          WHERE lessons.editorial_state NOT IN ('retired', 'rejected')
        )::text AS lesson_count,
        COUNT(lessons.id) FILTER (
          WHERE lessons.editorial_state NOT IN ('retired', 'rejected')
            AND lessons.is_required = TRUE
        )::text AS required_lesson_count
      FROM curriculum_modules
      INNER JOIN courses
        ON courses.id = curriculum_modules.course_id
       AND courses.editorial_state NOT IN ('retired', 'rejected')
      INNER JOIN pathways
        ON pathways.id = courses.pathway_id
       AND pathways.editorial_state NOT IN ('retired', 'rejected')
      LEFT JOIN lessons
        ON lessons.module_id = curriculum_modules.id
      WHERE pathways.release_id = $1
        AND curriculum_modules.editorial_state NOT IN ('retired', 'rejected')
      GROUP BY curriculum_modules.id, pathways.sort_order, courses.sort_order
      ORDER BY pathways.sort_order, courses.sort_order, curriculum_modules.sort_order
    `,
    [release.id],
  )

  const modules = moduleResult.rows.map<ActiveCurriculumModule>((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    accessClass: row.access_class,
    legacyNumber: row.source_legacy_number,
    order: row.sort_order,
    xpValue: row.xp_value,
    lessonCount: Number(row.lesson_count),
    requiredLessonCount: Number(row.required_lesson_count),
    prerequisiteModuleIds: prerequisiteModuleIds(row.prerequisites),
  }))

  return {
    id: release.id,
    version: release.version,
    title: release.title,
    status: release.status,
    pathwayCount: Number(release.pathway_count),
    courseCount: Number(release.course_count),
    moduleCount: modules.length,
    lessonCount: modules.reduce((total, module) => total + module.lessonCount, 0),
    requiredLessonCount: modules.reduce((total, module) => total + module.requiredLessonCount, 0),
    configuredXp: modules.reduce((total, module) => total + module.xpValue, 0),
    modules,
  }
})

export async function getLegacyModuleByNumber(moduleNumber: number): Promise<ActiveCurriculumModule | null> {
  if (!Number.isInteger(moduleNumber)) return null
  const release = await getActiveCurriculumRelease()
  return release.modules.find((module) => module.legacyNumber === moduleNumber) ?? null
}

export async function getLegacyModuleNumbers(): Promise<number[]> {
  const release = await getActiveCurriculumRelease()
  return release.modules
    .map((module) => module.legacyNumber)
    .filter((moduleNumber): moduleNumber is number => Number.isInteger(moduleNumber))
}

export const getActiveCurriculumLessons = cache(async (): Promise<ActiveCurriculumLesson[]> => {
  const release = await getActiveCurriculumRelease()
  const result = await getDatabasePool().query<{
    id: string
    slug: string
    title: string
    module_id: string
    module_title: string
    source_legacy_number: number | null
    sort_order: number
    source_legacy_index: number | null
    is_required: boolean
    prerequisites: unknown
  }>(
    `
      SELECT
        lessons.id,
        lessons.slug,
        lessons.title,
        curriculum_modules.id AS module_id,
        curriculum_modules.title AS module_title,
        curriculum_modules.source_legacy_number,
        lessons.sort_order,
        lessons.source_legacy_index,
        lessons.is_required,
        lessons.prerequisites
      FROM lessons
      INNER JOIN curriculum_modules
        ON curriculum_modules.id = lessons.module_id
       AND curriculum_modules.editorial_state NOT IN ('retired', 'rejected')
      INNER JOIN courses
        ON courses.id = curriculum_modules.course_id
       AND courses.editorial_state NOT IN ('retired', 'rejected')
      INNER JOIN pathways
        ON pathways.id = courses.pathway_id
       AND pathways.editorial_state NOT IN ('retired', 'rejected')
      WHERE pathways.release_id = $1
        AND lessons.editorial_state NOT IN ('retired', 'rejected')
      ORDER BY pathways.sort_order, courses.sort_order, curriculum_modules.sort_order, lessons.sort_order
    `,
    [release.id],
  )

  return result.rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    moduleId: row.module_id,
    moduleTitle: row.module_title,
    moduleLegacyNumber: row.source_legacy_number,
    order: row.sort_order,
    legacyIndex: row.source_legacy_index,
    required: row.is_required,
    prerequisiteLessonIds: prerequisiteLessonIds(row.prerequisites),
  }))
})
