import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import {
  closeDatabasePool,
  getDatabasePool,
  type PoolClient,
} from "@iron-vault/database";
import { config as loadEnv } from "dotenv";

const repositoryDirectory = resolve(import.meta.dirname, "../../..");
const packageDirectory = join(repositoryDirectory, "scholar-archive-package");
const dataDirectory = join(packageDirectory, "data");
const releaseVersion = "scholar-archive-import-v1";
const importerVersion = "scholar-archive-import-v1";
const advisoryLockId = 4_290_762_026;

type JsonObject = Record<string, unknown>;
type ReviewFlags = {
  editorialStatus: string;
  publicationStatus: string;
  factReviewRequired: boolean;
  legalReviewRequired: boolean;
  ownerApprovalRequired: boolean;
  timeSensitiveReviewRequired: boolean;
};
type PackageBlock = JsonObject & {
  id: string;
  type: string;
  sourceType: string;
  sourceIndex: number;
};
type PackageLesson = {
  id: string;
  slug: string;
  title: string;
  sourcePath: string;
  sourceFilename: string;
  sourceHash: string;
  sourceKey: string;
  sourceFamily: string;
  sourceRelease: string;
  originalModuleIndex: number;
  originalLessonIndex: number;
  contentHash: string;
  blocks: PackageBlock[];
  narrationText: string;
  review: ReviewFlags;
};
type PackageModule = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  legacyIndex: number;
  duration: string | null;
  xpIntent: number | null;
  sourcePath: string;
  sourceFilename: string;
  sourceHash: string;
  sourceKey: string;
  sourceFamily: string;
  sourceRelease: string;
  lessons: PackageLesson[];
  review: ReviewFlags;
  proposedPlacement: {
    pathway: string;
    course: string;
    module: string;
  };
};
type PackageAssessment = {
  id: string;
  slug: string;
  title: string;
  moduleId: string;
  sourceFamily: string;
  sourcePath: string;
  sourceHash: string;
  sourceKey: string;
  sourceRelease: string;
  questions: Array<{
    id: string;
    prompt: string;
    sourceIndex: number;
    explanationAvailable: boolean;
    options: Array<{ id: string; label: string; sourceIndex: number }>;
  }>;
};
type PackageAnswerKey = {
  assessmentId: string;
  questionId: string;
  correctOptionId: string;
  correctSourceIndex: number;
  explanation: string | null;
  sourceKey: string;
};
type PackageInteraction = {
  id: string;
  lessonId: string;
  moduleId: string;
  type: string;
  sourceType: string;
  definition: JsonObject;
  sourcePath: string;
  sourceKey: string;
};
type NarrationAssociation = {
  lessonId: string;
  sourceKey: string;
  text: string;
  contentHash: string;
  proposedAudioPath: string;
  proposedTimingPath: string;
  audioPresentInArchive: boolean;
  timingPresentInArchive: boolean;
  videoPresentInArchive: boolean;
};
type CanvasCoverageItem = JsonObject & {
  id: string;
  outlineKey: string;
  title: string;
  sourceSection: string;
  reconciliationStatus: string;
  publicationStatus: string;
};
type DuplicateRelationship = JsonObject & {
  primaryLessonId: string;
  duplicateLessonId: string;
  relationship: string;
};
type SourceRecord = {
  sourceFilename: string;
  sourcePath: string;
  sha256: string;
};

type ImportPackage = {
  modules: PackageModule[];
  assessments: PackageAssessment[];
  answerKeys: PackageAnswerKey[];
  interactions: PackageInteraction[];
  narration: Record<string, NarrationAssociation>;
  canvasCoverage: CanvasCoverageItem[];
  duplicateRelationships: DuplicateRelationship[];
  sources: SourceRecord[];
  manifestHash: string;
};

type ImportCounts = Record<string, number>;

function loadDatabaseEnvironment(): void {
  if (process.env.DATABASE_URL) return;
  loadEnv({ path: join(repositoryDirectory, "secrets/database.env"), override: false });
  if (process.env.DATABASE_URL) return;
  loadEnv({ path: join(repositoryDirectory, ".env"), override: false });
}

function hash(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function stableUuid(key: string): string {
  const bytes = createHash("sha256")
    .update(`iron-vault:${importerVersion}:${key}`)
    .digest()
    .subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}

function slugify(value: string): string {
  const result = value.normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!result) throw new Error(`Unable to create slug for ${value}`);
  return result;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Scholar package validation failed: ${message}`);
}

async function jsonFile<T>(name: string): Promise<{ value: T; raw: string }> {
  const raw = await readFile(join(dataDirectory, name), "utf8");
  return { value: JSON.parse(raw) as T, raw };
}

async function loadAndValidatePackage(): Promise<ImportPackage> {
  const [
    curriculumFile,
    assessmentsFile,
    keysFile,
    interactionsFile,
    activitiesFile,
    narrationFile,
    canvasFile,
    canvasCoverageFile,
    duplicatesFile,
    capabilityFile,
    missingFile,
    validationFile,
    sourcesFile,
  ] = await Promise.all([
    jsonFile<PackageModule[]>("curriculum-canonical.json"),
    jsonFile<PackageAssessment[]>("assessments.json"),
    jsonFile<PackageAnswerKey[]>("answer-keys.private.json"),
    jsonFile<PackageInteraction[]>("interactions.json"),
    jsonFile<{ assignments: unknown[] }>("learning-activities.json"),
    jsonFile<Record<string, NarrationAssociation>>("narration-manifest.json"),
    jsonFile<JsonObject>("canvas-blueprints.json"),
    jsonFile<CanvasCoverageItem[]>("canvas-coverage-map.json"),
    jsonFile<DuplicateRelationship[]>("duplicate-reconciliation-map.json"),
    jsonFile<JsonObject>("capability-map.json"),
    jsonFile<unknown[]>("missing-content.json"),
    jsonFile<JsonObject>("validation.json"),
    jsonFile<SourceRecord[]>("sources.json"),
  ]);

  const modules = curriculumFile.value;
  const lessons = modules.flatMap((module) => module.lessons);
  const blocks = lessons.flatMap((lesson) => lesson.blocks);
  const questions = assessmentsFile.value.flatMap((assessment) => assessment.questions);
  const options = questions.flatMap((question) => question.options);
  const publicAssessmentText = assessmentsFile.raw;
  const allCanonicalIds = [
    ...modules.map((module) => module.id),
    ...lessons.map((lesson) => lesson.id),
    ...blocks.map((block) => block.id),
    ...assessmentsFile.value.map((assessment) => assessment.id),
    ...questions.map((question) => question.id),
    ...options.map((option) => option.id),
  ];
  const moduleIds = new Set(modules.map((module) => module.id));
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  const questionIds = new Set(questions.map((question) => question.id));
  const optionIds = new Set(options.map((option) => option.id));
  const keyByQuestion = new Map(keysFile.value.map((key) => [key.questionId, key]));

  assert(modules.length === 32, `expected 32 modules, received ${modules.length}`);
  assert(lessons.length === 138, `expected 138 lessons, received ${lessons.length}`);
  assert(assessmentsFile.value.length === 32, `expected 32 assessments, received ${assessmentsFile.value.length}`);
  assert(questions.length === 320, `expected 320 questions, received ${questions.length}`);
  assert(keysFile.value.length === 320, `expected 320 answer keys, received ${keysFile.value.length}`);
  assert(activitiesFile.value.assignments.length === 118, "expected 118 assignments");
  assert(interactionsFile.value.length === 26, "expected 26 interactions");
  assert(Object.keys(narrationFile.value).length === 138, "expected 138 narration associations");
  assert(canvasCoverageFile.value.length === 180, "expected 180 Canvas blueprint items");
  assert(duplicatesFile.value.length === 40, "expected 40 duplicate relationships");
  assert(allCanonicalIds.length === new Set(allCanonicalIds).size, "duplicate canonical IDs detected");
  assert(!/"correct(?:OptionId|SourceIndex|ness|Answer|Index)?"\s*:/i.test(publicAssessmentText), "public assessment data contains correctness fields");
  assert(modules.every((module) => module.id && module.slug && module.sourcePath && module.sourceHash && module.sourceKey), "module identity or provenance missing");
  assert(lessons.every((lesson) => lesson.id && lesson.slug && lesson.sourcePath && lesson.sourceHash && lesson.sourceKey), "lesson identity or provenance missing");
  assert(modules.every((module) => module.lessons.every((lesson) => lesson.originalModuleIndex === module.legacyIndex)), "lesson/module metadata relationship broken");
  assert(assessmentsFile.value.every((assessment) => moduleIds.has(assessment.moduleId)), "assessment/module relationship broken");
  assert(interactionsFile.value.every((interaction) => lessonIds.has(interaction.lessonId) && moduleIds.has(interaction.moduleId)), "interaction relationship broken");
  assert(Object.values(narrationFile.value).every((item) => lessonIds.has(item.lessonId)), "narration relationship broken");
  assert(questions.every((question) => {
    const key = keyByQuestion.get(question.id);
    return key && questionIds.has(key.questionId) && optionIds.has(key.correctOptionId);
  }), "question missing a valid private answer key");
  assert(keysFile.value.every((key) => key.assessmentId && key.questionId && key.correctOptionId), "incomplete private answer key");
  assert(canvasFile.value.documentStatus === "outline-blueprint-only", "Canvas blueprint status drifted");
  assert(validationFile.value.canonicalLessons === 138 && validationFile.value.answerKeysComplete === true, "package validation report drifted");
  assert(capabilityFile.value.packageStatus === "reference-only-unmounted", "capability package status drifted");
  assert(missingFile.value.length > 0, "missing-content register is empty");

  const manifestHash = hash([
    curriculumFile.raw,
    assessmentsFile.raw,
    keysFile.raw,
    interactionsFile.raw,
    activitiesFile.raw,
    narrationFile.raw,
    canvasFile.raw,
    canvasCoverageFile.raw,
    duplicatesFile.raw,
    capabilityFile.raw,
    missingFile.raw,
    validationFile.raw,
  ].join("\n"));

  return {
    modules,
    assessments: assessmentsFile.value,
    answerKeys: keysFile.value,
    interactions: interactionsFile.value,
    narration: narrationFile.value,
    canvasCoverage: canvasCoverageFile.value,
    duplicateRelationships: duplicatesFile.value,
    sources: sourcesFile.value,
    manifestHash,
  };
}

function editorialState(review: ReviewFlags): "legal_review" | "fact_review" | "draft" {
  if (review.legalReviewRequired) return "legal_review";
  if (review.factReviewRequired || review.timeSensitiveReviewRequired) return "fact_review";
  return "draft";
}

function accessRecommendation(module: PackageModule): "free_candidate" | "paid_core_candidate" | "premium_vip_candidate" | "sovereign_review" {
  if (module.proposedPlacement.pathway === "Sovereign Systems Lab") return "sovereign_review";
  if (module.proposedPlacement.pathway === "Iron Vault Foundations") return "free_candidate";
  if (
    module.title === "Introduction to Crypto & Blockchain"
    || module.title === "Crypto Foundations"
    || ["Bitcoin", "Ethereum", "Solana", "Stablecoins", "Tokenomics", "Crypto Security"].includes(module.title)
  ) return "free_candidate";
  return "paid_core_candidate";
}

function databaseBlockType(type: string): string {
  if (type === "text") return "body";
  if (type === "simulator") return "simulation";
  return type;
}

function databaseInteractionType(type: string): string {
  if (type === "simulator") return "simulation";
  if (type === "sortgame") return "sorting";
  return type;
}

function evidenceClass(block: PackageBlock): string | null {
  if (block.type === "quote") return "fact";
  if (block.type === "scenario" || block.type === "simulation" || block.type === "simulator" || block.type === "sorting") return "scenario";
  if (block.type === "callout") return "interpretation";
  return null;
}

function payloadForBlock(block: PackageBlock): JsonObject {
  const { sourceType, sourceIndex } = block;
  const payload = Object.fromEntries(
    Object.entries(block).filter(
      ([key]) =>
        !["id", "type", "sourceType", "sourceIndex"].includes(key),
    ),
  );
  return {
    ...payload,
    sourceType,
    sourceIndex,
  };
}

async function insert(
  client: PoolClient,
  counts: ImportCounts,
  countKey: string,
  sql: string,
  values: unknown[],
): Promise<number> {
  const result = await client.query(sql, values);
  const inserted = result.rowCount ?? 0;
  counts[countKey] = (counts[countKey] ?? 0) + inserted;
  return inserted;
}

async function recordSource(
  client: PoolClient,
  counts: ImportCounts,
  input: {
    releaseId: string;
    entityType: string;
    entityId: string;
    sourcePath: string;
    sourceKey: string;
    sourceHash: string;
    metadata: JsonObject;
  },
): Promise<number> {
  return insert(
    client,
    counts,
    "sourceRecords",
    `
      INSERT INTO curriculum_source_records (
        id, release_id, entity_type, entity_id, source_path,
        source_key, source_hash, importer_version, source_metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (release_id, source_path, source_key) DO NOTHING
    `,
    [
      stableUuid(`source:${input.sourcePath}:${input.sourceKey}`),
      input.releaseId,
      input.entityType,
      input.entityId,
      input.sourcePath,
      input.sourceKey,
      input.sourceHash,
      importerVersion,
      input.metadata,
    ],
  );
}

async function importPackage(pkg: ImportPackage): Promise<{ releaseId: string; inserted: ImportCounts }> {
  loadDatabaseEnvironment();
  const pool = getDatabasePool({ application_name: "iron-vault-scholar-import" });
  const client = await pool.connect();
  const counts: ImportCounts = {};

  try {
    await client.query("SELECT pg_advisory_lock($1)", [advisoryLockId]);
    await client.query("BEGIN");

    const academyResult = await client.query<{ id: string }>(
      "SELECT id FROM academies WHERE slug = 'iron-vault-academy' FOR UPDATE",
    );
    const academyId = academyResult.rows[0]?.id;
    assert(academyId, "canonical Iron Vault Academy row does not exist");

    const releaseId = stableUuid(`release:${releaseVersion}`);
    const existingRelease = await client.query<{
      source_manifest_hash: string | null;
      status: string;
      published_at: Date | null;
    }>(
      "SELECT source_manifest_hash, status, published_at FROM curriculum_releases WHERE id = $1 FOR UPDATE",
      [releaseId],
    );
    if (existingRelease.rows[0]) {
      assert(existingRelease.rows[0].source_manifest_hash === pkg.manifestHash, "release manifest changed; create a new release version");
      assert(existingRelease.rows[0].status === "imported" || existingRelease.rows[0].status === "draft", "existing release is not an unpublished import");
      assert(existingRelease.rows[0].published_at === null, "existing Scholar release is already published");
    }

    await insert(
      client,
      counts,
      "releases",
      `
        INSERT INTO curriculum_releases (
          id, academy_id, version, title, status, source_manifest_hash, published_at
        )
        VALUES ($1, $2, $3, 'Scholar Archive Import v1', 'imported', $4, NULL)
        ON CONFLICT (id) DO NOTHING
      `,
      [releaseId, academyId, releaseVersion, pkg.manifestHash],
    );

    const pathwayOrder = [...new Set(pkg.modules.map((module) => module.proposedPlacement.pathway))];
    const pathwayIdByTitle = new Map<string, string>();
    const courseIdByKey = new Map<string, string>();
    const modulesByPathway = Map.groupBy(pkg.modules, (module) => module.proposedPlacement.pathway);
    const coursePathwaysByTitle = Map.groupBy(
      [...new Map(pkg.modules.map((module) => [
        `${module.proposedPlacement.pathway}:${module.proposedPlacement.course}`,
        { pathway: module.proposedPlacement.pathway, course: module.proposedPlacement.course },
      ])).values()],
      (placement) => placement.course,
    );

    for (const [pathwayIndex, pathwayTitle] of pathwayOrder.entries()) {
      const pathwayId = stableUuid(`pathway:${pathwayTitle}`);
      pathwayIdByTitle.set(pathwayTitle, pathwayId);
      const pathwayModules = modulesByPathway.get(pathwayTitle) ?? [];
      const state = pathwayModules.some((module) => editorialState(module.review) === "legal_review")
        ? "legal_review"
        : "fact_review";
      const proposedClass = pathwayTitle === "Sovereign Systems Lab"
        ? "sovereign_review"
        : pathwayModules.some((module) => accessRecommendation(module) === "free_candidate")
          ? "mixed_proposal"
          : "paid_core_candidate";
      await insert(
        client,
        counts,
        "pathways",
        `
          INSERT INTO pathways (
            id, release_id, slug, title, description, outcome, access_class,
            editorial_state, sort_order, prerequisites
          )
          VALUES ($1, $2, $3, $4, $5, $6, 'internal', $7, $8, $9)
          ON CONFLICT (id) DO NOTHING
        `,
        [
          pathwayId,
          releaseId,
          slugify(pathwayTitle),
          pathwayTitle,
          "Unpublished Scholar Archive pathway proposed for editorial review.",
          "Preserve authored lessons while review, access, and publication decisions remain pending.",
          state,
          pathwayIndex,
          { proposed_access_classification: proposedClass, activated: false },
        ],
      );
      await recordSource(client, counts, {
        releaseId,
        entityType: "pathway",
        entityId: pathwayId,
        sourcePath: "scholar-archive-package/data/proposed-placement.json",
        sourceKey: `pathway:${slugify(pathwayTitle)}`,
        sourceHash: pkg.manifestHash,
        metadata: { proposedAccessClassification: proposedClass, activated: false },
      });

      const courseOrder = [...new Set(pathwayModules.map((module) => module.proposedPlacement.course))];
      for (const [courseIndex, courseTitle] of courseOrder.entries()) {
        const courseKey = `${pathwayTitle}:${courseTitle}`;
        const courseId = stableUuid(`course:${courseKey}`);
        courseIdByKey.set(courseKey, courseId);
        const courseModules = pathwayModules.filter((module) => module.proposedPlacement.course === courseTitle);
        const courseState = courseModules.some((module) => editorialState(module.review) === "legal_review")
          ? "legal_review"
          : "fact_review";
        const recommendationSet = [...new Set(courseModules.map(accessRecommendation))];
        const courseSlug = (coursePathwaysByTitle.get(courseTitle)?.length ?? 0) > 1
          ? `${slugify(pathwayTitle)}--${slugify(courseTitle)}`
          : slugify(courseTitle);
        await insert(
          client,
          counts,
          "courses",
          `
            INSERT INTO courses (
              id, pathway_id, slug, title, description, outcome, access_class,
              editorial_state, sort_order, prerequisites
            )
            VALUES ($1, $2, $3, $4, $5, $6, 'internal', $7, $8, $9)
            ON CONFLICT (id) DO NOTHING
          `,
          [
            courseId,
            pathwayId,
            courseSlug,
            courseTitle,
            "Unpublished canonical placement for Scholar Archive modules.",
            "Retain complete authored bodies and complete editorial, fact, legal, and owner review.",
            courseState,
            courseIndex,
            { proposed_access_classifications: recommendationSet, activated: false },
          ],
        );
        await recordSource(client, counts, {
          releaseId,
          entityType: "course",
          entityId: courseId,
          sourcePath: "scholar-archive-package/data/proposed-placement.json",
          sourceKey: `course:${slugify(pathwayTitle)}:${slugify(courseTitle)}`,
          sourceHash: pkg.manifestHash,
          metadata: { proposedAccessClassifications: recommendationSet, activated: false },
        });
      }
    }

    for (const curriculumModule of pkg.modules) {
      const courseKey = `${curriculumModule.proposedPlacement.pathway}:${curriculumModule.proposedPlacement.course}`;
      const courseId = courseIdByKey.get(courseKey);
      assert(courseId, `missing proposed course for module ${curriculumModule.id}`);
      const courseModules = pkg.modules.filter((candidate) =>
        candidate.proposedPlacement.pathway === curriculumModule.proposedPlacement.pathway
        && candidate.proposedPlacement.course === curriculumModule.proposedPlacement.course);
      const moduleIndex = courseModules.findIndex((candidate) => candidate.id === curriculumModule.id);
      const recommendation = accessRecommendation(curriculumModule);
      const state = editorialState(curriculumModule.review);

      await insert(
        client,
        counts,
        "modules",
        `
          INSERT INTO curriculum_modules (
            id, course_id, slug, title, subtitle, description, access_class,
            editorial_state, source_legacy_number, sort_order, xp_value, prerequisites
          )
          VALUES ($1, $2, $3, $4, $5, $6, 'internal', $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO NOTHING
        `,
        [
          curriculumModule.id,
          courseId,
          curriculumModule.slug,
          curriculumModule.title,
          curriculumModule.subtitle ?? "",
          "Imported authored Scholar module. Unpublished and unavailable to members.",
          state,
          curriculumModule.legacyIndex,
          moduleIndex,
          curriculumModule.xpIntent ?? 0,
          {
            proposed_access_classification: recommendation,
            access_activated: false,
            source_family: curriculumModule.sourceFamily,
            source_release: curriculumModule.sourceRelease,
          },
        ],
      );
      await recordSource(client, counts, {
        releaseId,
        entityType: "module",
        entityId: curriculumModule.id,
        sourcePath: curriculumModule.sourcePath,
        sourceKey: curriculumModule.sourceKey,
        sourceHash: curriculumModule.sourceHash,
        metadata: {
          legacyIndex: curriculumModule.legacyIndex,
          proposedAccessClassification: recommendation,
          review: curriculumModule.review,
          publicationStatus: "unpublished",
        },
      });

      for (const [lessonIndex, lesson] of curriculumModule.lessons.entries()) {
        const lessonState = editorialState(lesson.review);
        const hasInteraction = lesson.blocks.some((block) =>
          ["calculator", "simulation", "simulator", "scenario", "sorting", "reveal", "quiz"].includes(block.type));
        const hasMedia = Boolean(pkg.narration[lesson.id]);
        const lessonType = hasInteraction && hasMedia ? "mixed"
          : hasInteraction ? "interactive"
            : hasMedia ? "media"
              : "reading";
        await insert(
          client,
          counts,
          "lessons",
          `
            INSERT INTO lessons (
              id, module_id, slug, title, summary, lesson_type, access_class,
              editorial_state, source_legacy_index, sort_order, xp_value,
              is_required, prerequisites
            )
            VALUES ($1, $2, $3, $4, '', $5, 'internal', $6, $7, $8, 0, TRUE, $9)
            ON CONFLICT (id) DO NOTHING
          `,
          [
            lesson.id,
            curriculumModule.id,
            lesson.slug,
            lesson.title,
            lessonType,
            lessonState,
            lesson.originalLessonIndex,
            lessonIndex,
            {
              proposed_access_classification: recommendation,
              access_activated: false,
              owner_approval_required: lesson.review.ownerApprovalRequired,
            },
          ],
        );
        await recordSource(client, counts, {
          releaseId,
          entityType: "lesson",
          entityId: lesson.id,
          sourcePath: lesson.sourcePath,
          sourceKey: lesson.sourceKey,
          sourceHash: lesson.sourceHash,
          metadata: {
            contentHash: lesson.contentHash,
            originalModuleIndex: lesson.originalModuleIndex,
            originalLessonIndex: lesson.originalLessonIndex,
            sourceFamily: lesson.sourceFamily,
            sourceRelease: lesson.sourceRelease,
            proposedAccessClassification: recommendation,
            review: lesson.review,
            publicationStatus: "unpublished",
          },
        });

        for (const [blockIndex, block] of lesson.blocks.entries()) {
          const dbType = databaseBlockType(block.type);
          await insert(
            client,
            counts,
            "contentBlocks",
            `
              INSERT INTO content_blocks (
                id, lesson_id, block_type, sort_order, payload,
                evidence_class, source_citations, editorial_state
              )
              VALUES ($1, $2, $3, $4, $5, $6, '[]'::jsonb, $7)
              ON CONFLICT (id) DO NOTHING
            `,
            [
              block.id,
              lesson.id,
              dbType,
              blockIndex,
              payloadForBlock(block),
              evidenceClass(block),
              lessonState,
            ],
          );
          await recordSource(client, counts, {
            releaseId,
            entityType: "content_block",
            entityId: block.id,
            sourcePath: lesson.sourcePath,
            sourceKey: `${lesson.sourceKey}:block:${block.sourceIndex}`,
            sourceHash: lesson.sourceHash,
            metadata: {
              sourceType: block.sourceType,
              normalizedType: block.type,
              databaseType: dbType,
              sourceIndex: block.sourceIndex,
              review: lesson.review,
            },
          });
        }

        const narration = pkg.narration[lesson.id];
        assert(narration, `missing narration association for lesson ${lesson.id}`);
        const narrationBlockId = stableUuid(`narration:${lesson.id}`);
        await insert(
          client,
          counts,
          "narrationBlocks",
          `
            INSERT INTO content_blocks (
              id, lesson_id, block_type, sort_order, payload,
              evidence_class, source_citations, editorial_state
            )
            VALUES ($1, $2, 'narration', $3, $4, NULL, '[]'::jsonb, $5)
            ON CONFLICT (id) DO NOTHING
          `,
          [
            narrationBlockId,
            lesson.id,
            lesson.blocks.length,
            {
              title: "Vault Instructor",
              available: narration.audioPresentInArchive,
              audioUrl: narration.audioPresentInArchive ? narration.proposedAudioPath : null,
              timingUrl: narration.timingPresentInArchive ? narration.proposedTimingPath : null,
              videoAvailable: narration.videoPresentInArchive,
              narrationContentHash: narration.contentHash,
              generationOperation: "offline-admin-only",
            },
            lessonState,
          ],
        );
        await recordSource(client, counts, {
          releaseId,
          entityType: "content_block",
          entityId: narrationBlockId,
          sourcePath: "scholar-archive-package/data/narration-manifest.json",
          sourceKey: `${lesson.sourceKey}:narration`,
          sourceHash: lesson.sourceHash,
          metadata: {
            narrationContentHash: narration.contentHash,
            audioPresent: narration.audioPresentInArchive,
            timingPresent: narration.timingPresentInArchive,
            videoPresent: narration.videoPresentInArchive,
            generationOperation: "offline-admin-only",
          },
        });
      }
    }

    const lessonById = new Map(pkg.modules.flatMap((module) => module.lessons).map((lesson) => [lesson.id, lesson]));
    for (const interaction of pkg.interactions) {
      const lesson = lessonById.get(interaction.lessonId);
      assert(lesson, `interaction ${interaction.id} references missing lesson`);
      const type = databaseInteractionType(interaction.type);
      await insert(
        client,
        counts,
        "interactions",
        `
          INSERT INTO interactions (
            id, lesson_id, slug, interaction_type, prompt,
            configuration, is_scored, sort_order, editorial_state
          )
          VALUES ($1, $2, $3, $4, $5, $6, FALSE, $7, $8)
          ON CONFLICT (id) DO NOTHING
        `,
        [
          interaction.id,
          interaction.lessonId,
          `${type}-${interaction.id.slice(0, 8)}`,
          type,
          {
            title: typeof interaction.definition.title === "string" ? interaction.definition.title : type,
            prompt: typeof interaction.definition.prompt === "string" ? interaction.definition.prompt : null,
          },
          interaction.definition,
          Number(interaction.definition.sourceIndex ?? 0),
          editorialState(lesson.review),
        ],
      );
      await recordSource(client, counts, {
        releaseId,
        entityType: "interaction",
        entityId: interaction.id,
        sourcePath: interaction.sourcePath,
        sourceKey: interaction.sourceKey,
        sourceHash: lesson.sourceHash,
        metadata: {
          sourceType: interaction.sourceType,
          normalizedType: interaction.type,
          databaseType: type,
          scored: false,
        },
      });
    }

    const moduleById = new Map(pkg.modules.map((curriculumModule) => [curriculumModule.id, curriculumModule]));
    for (const assessment of pkg.assessments) {
      const curriculumModule = moduleById.get(assessment.moduleId);
      assert(curriculumModule, `assessment ${assessment.id} references missing module`);
      const state = editorialState(curriculumModule.review);
      await insert(
        client,
        counts,
        "assessments",
        `
          INSERT INTO assessments (
            id, release_id, module_id, slug, title, purpose, audience,
            status, passing_score, max_attempts, configuration, published_at
          )
          VALUES ($1, $2, $3, $4, $5, 'module_quiz', 'internal',
            'imported', NULL, NULL, $6, NULL)
          ON CONFLICT (id) DO NOTHING
        `,
        [
          assessment.id,
          releaseId,
          assessment.moduleId,
          assessment.slug,
          assessment.title,
          {
            gradingEnabled: false,
            answerKeysServerPrivate: true,
            sourceFamily: assessment.sourceFamily,
            sourceRelease: assessment.sourceRelease,
            editorialState: state,
          },
        ],
      );
      await recordSource(client, counts, {
        releaseId,
        entityType: "assessment",
        entityId: assessment.id,
        sourcePath: assessment.sourcePath,
        sourceKey: assessment.sourceKey,
        sourceHash: assessment.sourceHash,
        metadata: {
          questionCount: assessment.questions.length,
          gradingEnabled: false,
          answerKeysServerPrivate: true,
          editorialState: state,
        },
      });

      for (const [questionIndex, question] of assessment.questions.entries()) {
        await insert(
          client,
          counts,
          "questions",
          `
            INSERT INTO assessment_questions (
              id, assessment_id, prompt, feedback, topic_key, question_type,
              points, sort_order, randomize_options, editorial_state
            )
            VALUES ($1, $2, $3, '{}'::jsonb, $4, 'single_choice', 1, $5, FALSE, $6)
            ON CONFLICT (id) DO NOTHING
          `,
          [
            question.id,
            assessment.id,
            { text: question.prompt },
            `${curriculumModule.slug}:question:${question.sourceIndex}`,
            questionIndex,
            state,
          ],
        );
        await recordSource(client, counts, {
          releaseId,
          entityType: "question",
          entityId: question.id,
          sourcePath: assessment.sourcePath,
          sourceKey: `${assessment.sourceKey}:question:${question.sourceIndex}`,
          sourceHash: assessment.sourceHash,
          metadata: { sourceIndex: question.sourceIndex, explanationAvailable: question.explanationAvailable },
        });

        for (const [optionIndex, option] of question.options.entries()) {
          await insert(
            client,
            counts,
            "answerOptions",
            `
              INSERT INTO answer_options (id, question_id, content, sort_order)
              VALUES ($1, $2, $3, $4)
              ON CONFLICT (id) DO NOTHING
            `,
            [option.id, question.id, { text: option.label }, optionIndex],
          );
          await recordSource(client, counts, {
            releaseId,
            entityType: "answer_option",
            entityId: option.id,
            sourcePath: assessment.sourcePath,
            sourceKey: `${assessment.sourceKey}:question:${question.sourceIndex}:option:${option.sourceIndex}`,
            sourceHash: assessment.sourceHash,
            metadata: { sourceIndex: option.sourceIndex },
          });
        }
      }
    }

    for (const key of pkg.answerKeys) {
      await insert(
        client,
        counts,
        "answerKeys",
        `
          INSERT INTO assessment_answer_keys (
            id, question_id, answer_option_id, scoring_weight, explanation
          )
          VALUES ($1, $2, $3, 1, $4)
          ON CONFLICT (id) DO NOTHING
        `,
        [
          stableUuid(`answer-key:${key.questionId}`),
          key.questionId,
          key.correctOptionId,
          key.explanation ? { text: key.explanation } : {},
        ],
      );
    }

    const canvasSource = pkg.sources.find((source) => source.sourceFilename === "LessonInstructor.jsx");
    assert(canvasSource, "Master Canvas source provenance is missing");
    const firstCourseId = courseIdByKey.values().next().value;
    assert(firstCourseId, "no course exists for Canvas blueprint provenance");
    for (const item of pkg.canvasCoverage) {
      const insertedBlueprint = await recordSource(client, counts, {
        releaseId,
        entityType: "course",
        entityId: firstCourseId,
        sourcePath: canvasSource.sourcePath,
        sourceKey: `canvas-blueprint:${item.id}`,
        sourceHash: canvasSource.sha256,
        metadata: {
          ...item,
          bodyMissing: true,
          blueprintOnly: true,
          accessActivated: false,
        },
      });
      counts.canvasBlueprints = (counts.canvasBlueprints ?? 0) + insertedBlueprint;
    }

    for (const relationship of pkg.duplicateRelationships) {
      const primaryLesson = lessonById.get(relationship.primaryLessonId);
      assert(primaryLesson, `duplicate relationship references missing primary lesson ${relationship.primaryLessonId}`);
      const insertedDuplicate = await recordSource(client, counts, {
        releaseId,
        entityType: "lesson",
        entityId: relationship.primaryLessonId,
        sourcePath: "scholar-archive-package/data/duplicate-reconciliation-map.json",
        sourceKey: `duplicate:${relationship.primaryLessonId}:${relationship.duplicateLessonId}`,
        sourceHash: pkg.manifestHash,
        metadata: { ...relationship },
      });
      counts.duplicateRelationships = (counts.duplicateRelationships ?? 0) + insertedDuplicate;
    }

    await client.query("COMMIT");
    return { releaseId, inserted: counts };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    try {
      await client.query("SELECT pg_advisory_unlock($1)", [advisoryLockId]);
    } finally {
      client.release();
      await closeDatabasePool();
    }
  }
}

async function databaseCounts(releaseId: string): Promise<JsonObject> {
  loadDatabaseEnvironment();
  const pool = getDatabasePool({ application_name: "iron-vault-scholar-import-report" });
  try {
    const result = await pool.query<JsonObject>(
      `
        SELECT
          releases.id AS release_id,
          releases.version,
          releases.status,
          releases.published_at,
          (SELECT count(*)::int FROM pathways WHERE release_id = releases.id) AS pathways,
          (
            SELECT count(*)::int FROM courses
            INNER JOIN pathways ON pathways.id = courses.pathway_id
            WHERE pathways.release_id = releases.id
          ) AS courses,
          (
            SELECT count(*)::int FROM curriculum_modules
            INNER JOIN courses ON courses.id = curriculum_modules.course_id
            INNER JOIN pathways ON pathways.id = courses.pathway_id
            WHERE pathways.release_id = releases.id
          ) AS modules,
          (
            SELECT count(*)::int FROM lessons
            INNER JOIN curriculum_modules ON curriculum_modules.id = lessons.module_id
            INNER JOIN courses ON courses.id = curriculum_modules.course_id
            INNER JOIN pathways ON pathways.id = courses.pathway_id
            WHERE pathways.release_id = releases.id
          ) AS lessons,
          (
            SELECT count(*)::int FROM content_blocks
            INNER JOIN lessons ON lessons.id = content_blocks.lesson_id
            INNER JOIN curriculum_modules ON curriculum_modules.id = lessons.module_id
            INNER JOIN courses ON courses.id = curriculum_modules.course_id
            INNER JOIN pathways ON pathways.id = courses.pathway_id
            WHERE pathways.release_id = releases.id
          ) AS content_blocks,
          (
            SELECT count(*)::int FROM content_blocks
            INNER JOIN lessons ON lessons.id = content_blocks.lesson_id
            INNER JOIN curriculum_modules ON curriculum_modules.id = lessons.module_id
            INNER JOIN courses ON courses.id = curriculum_modules.course_id
            INNER JOIN pathways ON pathways.id = courses.pathway_id
            WHERE pathways.release_id = releases.id
              AND content_blocks.block_type = 'assignment'
          ) AS assignments,
          (
            SELECT count(*)::int FROM content_blocks
            INNER JOIN lessons ON lessons.id = content_blocks.lesson_id
            INNER JOIN curriculum_modules ON curriculum_modules.id = lessons.module_id
            INNER JOIN courses ON courses.id = curriculum_modules.course_id
            INNER JOIN pathways ON pathways.id = courses.pathway_id
            WHERE pathways.release_id = releases.id
              AND content_blocks.block_type = 'narration'
          ) AS narrations,
          (
            SELECT count(*)::int FROM interactions
            INNER JOIN lessons ON lessons.id = interactions.lesson_id
            INNER JOIN curriculum_modules ON curriculum_modules.id = lessons.module_id
            INNER JOIN courses ON courses.id = curriculum_modules.course_id
            INNER JOIN pathways ON pathways.id = courses.pathway_id
            WHERE pathways.release_id = releases.id
          ) AS interactions,
          (SELECT count(*)::int FROM assessments WHERE release_id = releases.id) AS assessments,
          (
            SELECT count(*)::int FROM assessment_questions
            INNER JOIN assessments ON assessments.id = assessment_questions.assessment_id
            WHERE assessments.release_id = releases.id
          ) AS questions,
          (
            SELECT count(*)::int FROM assessment_answer_keys
            INNER JOIN assessment_questions ON assessment_questions.id = assessment_answer_keys.question_id
            INNER JOIN assessments ON assessments.id = assessment_questions.assessment_id
            WHERE assessments.release_id = releases.id
          ) AS answer_keys,
          (
            SELECT count(*)::int FROM curriculum_source_records
            WHERE release_id = releases.id
              AND source_key LIKE 'canvas-blueprint:%'
          ) AS canvas_blueprints,
          (
            SELECT count(*)::int FROM curriculum_source_records
            WHERE release_id = releases.id
              AND source_key LIKE 'duplicate:%'
          ) AS duplicate_relationships
        FROM curriculum_releases AS releases
        WHERE releases.id = $1
      `,
      [releaseId],
    );
    return result.rows[0] ?? {};
  } finally {
    await closeDatabasePool();
  }
}

async function main(): Promise<void> {
  const pkg = await loadAndValidatePackage();
  const result = await importPackage(pkg);
  const totals = await databaseCounts(result.releaseId);
  console.log(JSON.stringify({
    packageValidation: {
      modules: pkg.modules.length,
      lessons: pkg.modules.flatMap((module) => module.lessons).length,
      assessments: pkg.assessments.length,
      questions: pkg.assessments.flatMap((assessment) => assessment.questions).length,
      answerKeys: pkg.answerKeys.length,
      interactions: pkg.interactions.length,
      narrations: Object.keys(pkg.narration).length,
      canvasBlueprints: pkg.canvasCoverage.length,
      duplicateRelationships: pkg.duplicateRelationships.length,
      manifestHash: pkg.manifestHash,
    },
    releaseId: result.releaseId,
    releaseVersion,
    insertedThisRun: result.inserted,
    databaseTotals: totals,
  }, null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
