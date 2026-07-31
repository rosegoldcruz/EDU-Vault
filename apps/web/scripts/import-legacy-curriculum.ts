import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  closeDatabasePool,
  getDatabasePool,
  type PoolClient,
} from "@iron-vault/database";
import { config as loadEnv } from "dotenv";

import {
  parseLegacyAcademy,
  type LegacyContentBlock,
} from "../lib/curriculum/legacy-parser";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const webDirectory = resolve(scriptDirectory, "..");
const repositoryDirectory = resolve(webDirectory, "../..");
const sourcePath = join(webDirectory, "iron-vault-academy-unlocked.jsx");
const sourceRecordPath = "apps/web/iron-vault-academy-unlocked.jsx";
const importerVersion = "legacy-jsx-v1";

function loadDatabaseEnvironment(): void {
  if (process.env.DATABASE_URL) return;
  loadEnv({
    path: join(repositoryDirectory, "secrets/database.env"),
    override: false,
  });
  if (process.env.DATABASE_URL) return;
  loadEnv({ path: join(repositoryDirectory, ".env"), override: false });
}

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function hashJson(value: unknown): string {
  return hash(JSON.stringify(value));
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
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) throw new Error(`Could not create slug for: ${value}`);
  return slug;
}

function uniqueSlug(
  title: string,
  seen: Map<string, number>,
): string {
  const base = slugify(title);
  const count = (seen.get(base) ?? 0) + 1;
  seen.set(base, count);
  return count === 1 ? base : `${base}-${count}`;
}

function normalizeBlock(block: LegacyContentBlock): {
  blockType: string;
  payload: Record<string, unknown>;
  evidenceClass: string | null;
} {
  const { type, ...payload } = block;
  if (type === "vault") {
    return {
      blockType: "callout",
      payload: { ...payload, variant: "vault" },
      evidenceClass: "interpretation",
    };
  }

  const supported = new Set([
    "heading",
    "body",
    "list",
    "quote",
    "callout",
    "action",
  ]);
  if (!supported.has(type)) {
    throw new Error(`Unsupported legacy block type: ${type}`);
  }

  return {
    blockType: type,
    payload,
    evidenceClass:
      type === "quote" ? "fact"
      : type === "callout" ? "interpretation"
      : null,
  };
}

async function recordSource(
  client: PoolClient,
  input: {
    releaseId: string;
    entityType: string;
    entityId: string;
    sourceKey: string;
    value: unknown;
  },
): Promise<void> {
  await client.query(
    `
      INSERT INTO curriculum_source_records (
        id,
        release_id,
        entity_type,
        entity_id,
        source_path,
        source_key,
        source_hash,
        importer_version
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (release_id, source_path, source_key) DO NOTHING
    `,
    [
      stableUuid(`source:${input.sourceKey}`),
      input.releaseId,
      input.entityType,
      input.entityId,
      sourceRecordPath,
      input.sourceKey,
      hashJson(input.value),
      importerVersion,
    ],
  );
}

async function importCorpus(): Promise<void> {
  loadDatabaseEnvironment();
  const source = await readFile(sourcePath, "utf8");
  const modules = parseLegacyAcademy(source);
  const sourceFileHash = hash(source);
  const manifestHash = hashJson(modules);
  const pool = getDatabasePool({
    application_name: "iron-vault-curriculum-import",
  });
  const client = await pool.connect();

  const academyId = stableUuid("academy:iron-vault-academy");
  const releaseId = stableUuid("release:legacy-2026-import-v1");
  const pathwayId = stableUuid("pathway:legacy-archive");
  const courseId = stableUuid("course:legacy-curriculum");

  try {
    await client.query("BEGIN");

    const existingRelease = await client.query<{
      source_manifest_hash: string | null;
    }>(
      "SELECT source_manifest_hash FROM curriculum_releases WHERE id = $1 FOR UPDATE",
      [releaseId],
    );
    const priorHash = existingRelease.rows[0]?.source_manifest_hash;
    if (
      priorHash
      && priorHash !== manifestHash
      && priorHash !== sourceFileHash
    ) {
      throw new Error(
        "The legacy source changed after this release was imported; create a new importer/release version",
      );
    }
    if (priorHash === sourceFileHash && priorHash !== manifestHash) {
      await client.query(
        "UPDATE curriculum_releases SET source_manifest_hash = $2 WHERE id = $1",
        [releaseId, manifestHash],
      );
    }

    await client.query(
      `
        INSERT INTO academies (id, slug, title, description, status)
        VALUES ($1, 'iron-vault-academy', 'Iron Vault Academy', 'Iron Vault education system', 'draft')
        ON CONFLICT (id) DO NOTHING
      `,
      [academyId],
    );
    await client.query(
      `
        INSERT INTO curriculum_releases (
          id,
          academy_id,
          version,
          title,
          status,
          source_manifest_hash
        )
        VALUES ($1, $2, 'legacy-2026-import-v1', 'Legacy 2026 JSX archive', 'imported', $3)
        ON CONFLICT (id) DO NOTHING
      `,
      [releaseId, academyId, manifestHash],
    );
    await client.query(
      `
        INSERT INTO pathways (
          id, release_id, slug, title, description, outcome,
          access_class, editorial_state, sort_order
        )
        VALUES (
          $1, $2, 'legacy-archive', 'Legacy Academy Archive',
          'Preserved source hierarchy pending editorial normalization.',
          'Retain and review every legacy lesson before pathway extraction.',
          'internal', 'legal_review', 0
        )
        ON CONFLICT (id) DO NOTHING
      `,
      [pathwayId, releaseId],
    );
    await recordSource(client, {
      releaseId,
      entityType: "pathway",
      entityId: pathwayId,
      sourceKey: "pathway:legacy-archive",
      value: { moduleIds: modules.map((module) => module.id) },
    });
    await client.query(
      `
        INSERT INTO courses (
          id, pathway_id, slug, title, description, outcome,
          access_class, editorial_state, sort_order
        )
        VALUES (
          $1, $2, 'legacy-curriculum', 'Legacy Linear Curriculum',
          'Direct preservation of the module 0–12 browser curriculum.',
          'Provide a lossless review source; not a publishable course.',
          'internal', 'legal_review', 0
        )
        ON CONFLICT (id) DO NOTHING
      `,
      [courseId, pathwayId],
    );
    await recordSource(client, {
      releaseId,
      entityType: "course",
      entityId: courseId,
      sourceKey: "course:legacy-curriculum",
      value: { moduleCount: modules.length },
    });

    let blockCount = 0;
    let questionCount = 0;
    let optionCount = 0;

    for (const [moduleIndex, module] of modules.entries()) {
      const moduleKey = `module:${module.id}`;
      const moduleId = stableUuid(moduleKey);
      const accessClass = module.id === 0 ? "free" : "premium";
      await client.query(
        `
          INSERT INTO curriculum_modules (
            id, course_id, slug, title, subtitle, description,
            access_class, editorial_state, source_legacy_number,
            sort_order, xp_value
          )
          VALUES ($1, $2, $3, $4, $5, '', $6, 'legal_review', $7, $8, $9)
          ON CONFLICT (id) DO NOTHING
        `,
        [
          moduleId,
          courseId,
          slugify(module.title),
          module.title,
          module.subtitle,
          accessClass,
          module.id,
          moduleIndex,
          module.xpReward,
        ],
      );
      await recordSource(client, {
        releaseId,
        entityType: "module",
        entityId: moduleId,
        sourceKey: moduleKey,
        value: module,
      });

      const lessonSlugs = new Map<string, number>();
      for (const [lessonIndex, lesson] of module.lessons.entries()) {
        const lessonKey = `${moduleKey}:lesson:${lessonIndex}`;
        const lessonId = stableUuid(lessonKey);
        await client.query(
          `
            INSERT INTO lessons (
              id, module_id, slug, title, lesson_type, access_class,
              editorial_state, source_legacy_index, sort_order, xp_value
            )
            VALUES ($1, $2, $3, $4, 'mixed', $5, 'legal_review', $6, $6, 0)
            ON CONFLICT (id) DO NOTHING
          `,
          [
            lessonId,
            moduleId,
            uniqueSlug(lesson.title, lessonSlugs),
            lesson.title,
            accessClass,
            lessonIndex,
          ],
        );
        await recordSource(client, {
          releaseId,
          entityType: "lesson",
          entityId: lessonId,
          sourceKey: lessonKey,
          value: lesson,
        });

        for (const [blockIndex, legacyBlock] of lesson.content.entries()) {
          const blockKey = `${lessonKey}:block:${blockIndex}`;
          const blockId = stableUuid(blockKey);
          const block = normalizeBlock(legacyBlock);
          await client.query(
            `
              INSERT INTO content_blocks (
                id, lesson_id, block_type, sort_order, payload,
                evidence_class, editorial_state
              )
              VALUES ($1, $2, $3, $4, $5::jsonb, $6, 'legal_review')
              ON CONFLICT (id) DO NOTHING
            `,
            [
              blockId,
              lessonId,
              block.blockType,
              blockIndex,
              JSON.stringify(block.payload),
              block.evidenceClass,
            ],
          );
          await recordSource(client, {
            releaseId,
            entityType: "content_block",
            entityId: blockId,
            sourceKey: blockKey,
            value: legacyBlock,
          });
          blockCount += 1;
        }
      }

      const assessmentKey = `${moduleKey}:assessment`;
      const assessmentId = stableUuid(assessmentKey);
      await client.query(
        `
          INSERT INTO assessments (
            id, release_id, module_id, slug, title, purpose, audience,
            status, passing_score, configuration
          )
          VALUES (
            $1, $2, $3, $4, $5, 'module_quiz', $6,
            'imported', 8, $7::jsonb
          )
          ON CONFLICT (id) DO NOTHING
        `,
        [
          assessmentId,
          releaseId,
          moduleId,
          `${slugify(module.title)}-assessment`,
          `${module.title} Assessment`,
          module.id === 0 ? "public" : "premium",
          JSON.stringify({
            legacyPassScore: 8,
            answerOrder: "legacy",
            publicationBlocked: true,
          }),
        ],
      );
      await recordSource(client, {
        releaseId,
        entityType: "assessment",
        entityId: assessmentId,
        sourceKey: assessmentKey,
        value: module.quiz,
      });

      for (const [questionIndex, question] of module.quiz.entries()) {
        const questionKey = `${assessmentKey}:question:${questionIndex}`;
        const questionId = stableUuid(questionKey);
        await client.query(
          `
            INSERT INTO assessment_questions (
              id, assessment_id, prompt, topic_key, points,
              sort_order, editorial_state
            )
            VALUES ($1, $2, $3::jsonb, $4, 1, $5, 'legal_review')
            ON CONFLICT (id) DO NOTHING
          `,
          [
            questionId,
            assessmentId,
            JSON.stringify({ text: question.q }),
            `legacy-module-${module.id}`,
            questionIndex,
          ],
        );
        await recordSource(client, {
          releaseId,
          entityType: "question",
          entityId: questionId,
          sourceKey: questionKey,
          value: question,
        });

        for (const [optionIndex, option] of question.options.entries()) {
          const optionKey = `${questionKey}:option:${optionIndex}`;
          const optionId = stableUuid(optionKey);
          await client.query(
            `
              INSERT INTO answer_options (id, question_id, content, sort_order)
              VALUES ($1, $2, $3::jsonb, $4)
              ON CONFLICT (id) DO NOTHING
            `,
            [optionId, questionId, JSON.stringify({ text: option }), optionIndex],
          );
          await recordSource(client, {
            releaseId,
            entityType: "answer_option",
            entityId: optionId,
            sourceKey: optionKey,
            value: option,
          });
          if (optionIndex === question.correct) {
            await client.query(
              `
                INSERT INTO assessment_answer_keys (
                  id, question_id, answer_option_id, scoring_weight
                )
                VALUES ($1, $2, $3, 1)
                ON CONFLICT (id) DO NOTHING
              `,
              [
                stableUuid(`${questionKey}:answer-key`),
                questionId,
                optionId,
              ],
            );
          }
          optionCount += 1;
        }
        questionCount += 1;
      }
    }

    const importedCounts = await client.query<{
      modules: number;
      lessons: number;
      blocks: number;
      assessments: number;
      questions: number;
      options: number;
      answer_keys: number;
    }>(
      `
        SELECT
          (SELECT COUNT(*)::int FROM curriculum_modules WHERE course_id = $1) AS modules,
          (SELECT COUNT(*)::int FROM lessons INNER JOIN curriculum_modules ON curriculum_modules.id = lessons.module_id WHERE curriculum_modules.course_id = $1) AS lessons,
          (SELECT COUNT(*)::int FROM content_blocks INNER JOIN lessons ON lessons.id = content_blocks.lesson_id INNER JOIN curriculum_modules ON curriculum_modules.id = lessons.module_id WHERE curriculum_modules.course_id = $1) AS blocks,
          (SELECT COUNT(*)::int FROM assessments WHERE release_id = $2) AS assessments,
          (SELECT COUNT(*)::int FROM assessment_questions INNER JOIN assessments ON assessments.id = assessment_questions.assessment_id WHERE assessments.release_id = $2) AS questions,
          (SELECT COUNT(*)::int FROM answer_options INNER JOIN assessment_questions ON assessment_questions.id = answer_options.question_id INNER JOIN assessments ON assessments.id = assessment_questions.assessment_id WHERE assessments.release_id = $2) AS options,
          (SELECT COUNT(*)::int FROM assessment_answer_keys INNER JOIN assessment_questions ON assessment_questions.id = assessment_answer_keys.question_id INNER JOIN assessments ON assessments.id = assessment_questions.assessment_id WHERE assessments.release_id = $2) AS answer_keys
      `,
      [courseId, releaseId],
    );
    const counts = importedCounts.rows[0];
    const expected = {
      modules: modules.length,
      lessons: modules.reduce(
        (total, module) => total + module.lessons.length,
        0,
      ),
      blocks: blockCount,
      assessments: modules.length,
      questions: questionCount,
      options: optionCount,
      answer_keys: questionCount,
    };
    for (const [key, value] of Object.entries(expected)) {
      if (counts[key as keyof typeof counts] !== value) {
        throw new Error(
          `Curriculum reconciliation failed for ${key}: expected ${value}, received ${counts[key as keyof typeof counts]}`,
        );
      }
    }

    await client.query("COMMIT");
    console.log(
      JSON.stringify({
        release: "legacy-2026-import-v1",
        manifestHash,
        sourceFileHash,
        status: "imported",
        ...counts,
      }),
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await closeDatabasePool();
  }
}

importCorpus().catch((error: unknown) => {
  console.error(
    "Legacy curriculum import failed:",
    error instanceof Error ? error.message : "Unknown error",
  );
  process.exitCode = 1;
});
