import IronVaultAcademyUnlocked from "@/iron-vault-academy-unlocked"
import { getActiveCurriculumRelease } from "@/lib/server/active-curriculum"
import { getMemberAccessScope } from "@/lib/server/member-access"

export const dynamic = "force-dynamic"

export default async function AcademyPage() {
  const [scope, release] = await Promise.all([
    getMemberAccessScope(),
    getActiveCurriculumRelease(),
  ])
  const legacyNumberById = new Map(
    release.modules
      .filter((module) => module.legacyNumber !== null)
      .map((module) => [module.id, module.legacyNumber as number]),
  )
  const prerequisitesByModule = Object.fromEntries(
    release.modules
      .filter((module) => module.legacyNumber !== null)
      .map((module) => [
        module.legacyNumber as number,
        module.prerequisiteModuleIds
          .map((id) => legacyNumberById.get(id))
          .filter((value): value is number => value !== undefined),
      ]),
  )

  return (
    <section className="iv-academy-embedded">
      <IronVaultAcademyUnlocked
        accessType={scope.accessType}
        allowedModules={scope.allowedModules}
        curriculum={{
          releaseVersion: release.version,
          moduleCount: release.moduleCount,
          lessonCount: release.lessonCount,
          requiredLessonCount: release.requiredLessonCount,
          configuredXp: release.configuredXp,
          freeModuleCount: release.modules.filter((module) => module.accessClass === "free").length,
          restrictedModuleCount: release.modules.filter((module) => module.accessClass !== "free").length,
          prerequisitesByModule,
        }}
        embedded
        gradedAssessmentsEnabled={false}
      />
    </section>
  )
}
