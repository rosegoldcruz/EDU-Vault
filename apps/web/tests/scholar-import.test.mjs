import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { config as loadEnv } from "dotenv";
import { Pool } from "pg";

const webDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryDirectory = resolve(webDirectory, "../..");
const packageData = join(repositoryDirectory, "scholar-archive-package", "data");
const releaseVersion = "scholar-archive-import-v1";

loadEnv({ path: join(repositoryDirectory, "secrets/database.env"), override: false });
if (!process.env.DATABASE_URL) {
  loadEnv({ path: join(repositoryDirectory, ".env"), override: false });
}

test("public Scholar assessment package contains no correctness fields", async () => {
  const publicAssessment = await readFile(join(packageData, "assessments.json"), "utf8");
  assert.doesNotMatch(publicAssessment, /"correct(?:OptionId|SourceIndex|ness|Answer|Index)?"\s*:/i);
  const privateKeys = JSON.parse(await readFile(join(packageData, "answer-keys.private.json"), "utf8"));
  assert.equal(privateKeys.length, 320);
  assert.ok(privateKeys.every((key) => key.questionId && key.correctOptionId));
});

test("draft assessment preview query never joins private answer keys", async () => {
  const service = await readFile(join(webDirectory, "lib/server/draft-curriculum.ts"), "utf8");
  const assessmentFunction = service.slice(service.indexOf("export const getDraftAssessmentPreview"));
  const query = assessmentFunction.slice(
    assessmentFunction.indexOf("SELECT"),
    assessmentFunction.indexOf("const first"),
  );
  assert.doesNotMatch(query, /assessment_answer_keys/i);
});

test("all Scholar preview pages enforce the server admin gate", async () => {
  const routeRoot = join(
    webDirectory,
    "app/(member)/(dashboard)/academy/preview/scholar-archive-import-v1",
  );
  const pages = [
    join(routeRoot, "page.tsx"),
    join(routeRoot, "pathways/[pathwaySlug]/page.tsx"),
    join(routeRoot, "courses/[courseSlug]/page.tsx"),
    join(routeRoot, "modules/[moduleSlug]/page.tsx"),
    join(routeRoot, "lessons/[lessonSlug]/page.tsx"),
    join(routeRoot, "assessments/[assessmentSlug]/page.tsx"),
  ];
  for (const page of pages) {
    const source = await readFile(page, "utf8");
    assert.match(source, /requireAdminAccess/);
    assert.match(source, /notFound\(\)/);
  }
});

test("Scholar learner surfaces do not expose import metadata or answer keys", async () => {
  const routeRoot = join(webDirectory, "app/(member)/(dashboard)/academy/preview/scholar-archive-import-v1");
  const files = [
    join(routeRoot, "page.tsx"),
    join(routeRoot, "pathways/[pathwaySlug]/page.tsx"),
    join(routeRoot, "courses/[courseSlug]/page.tsx"),
    join(routeRoot, "modules/[moduleSlug]/page.tsx"),
    join(routeRoot, "lessons/[lessonSlug]/page.tsx"),
    join(routeRoot, "assessments/[assessmentSlug]/page.tsx"),
    join(webDirectory, "components/academy/ScholarAcademyViews.tsx"),
    join(webDirectory, "components/academy/DraftLessonRenderer.tsx"),
    join(webDirectory, "components/academy/ScholarAssessmentPreview.tsx"),
  ];
  const source = (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");
  assert.doesNotMatch(source, /source manifest|source inventory|body-missing|import boundary|assessment_answer_keys|correctOptionId|sourceHash|provenance dashboard/i);
});

test("all imported Scholar interaction and assignment records have a visible renderer", async () => {
  assert.ok(process.env.DATABASE_URL, "DATABASE_URL is required for integration verification");
  const renderer = await readFile(join(webDirectory, "components/academy/ContentBlockRenderer.tsx"), "utf8");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, application_name: "iron-vault-scholar-renderer-test" });
  try {
    const result = await pool.query(`
      SELECT content_blocks.block_type, count(*)::int AS count
      FROM content_blocks
      INNER JOIN lessons ON lessons.id = content_blocks.lesson_id
      INNER JOIN curriculum_modules ON curriculum_modules.id = lessons.module_id
      INNER JOIN courses ON courses.id = curriculum_modules.course_id
      INNER JOIN pathways ON pathways.id = courses.pathway_id
      INNER JOIN curriculum_releases ON curriculum_releases.id = pathways.release_id
      WHERE curriculum_releases.version = $1
        AND content_blocks.block_type IN ('assignment', 'calculator', 'reveal', 'scenario', 'simulation', 'sorting')
      GROUP BY content_blocks.block_type
    `, [releaseVersion]);
    const counts = Object.fromEntries(result.rows.map((row) => [row.block_type, row.count]));
    assert.equal(counts.assignment, 118);
    assert.equal(Object.entries(counts).filter(([type]) => type !== "assignment").reduce((sum, [, count]) => sum + count, 0), 26);
    for (const type of Object.keys(counts)) assert.match(renderer, new RegExp(`${type}`, "i"));
  } finally {
    await pool.end();
  }
});

test("admin authorization uses canonical PostgreSQL role assignments", async () => {
  const memberAccessSource = await readFile(
    join(webDirectory, "lib/server/member-access.ts"),
    "utf8",
  );

  assert.match(memberAccessSource, /FROM identity_accounts/);
  assert.match(memberAccessSource, /member_role_assignments/);
  assert.match(memberAccessSource, /roles\.code = 'admin'/);
  assert.doesNotMatch(
    memberAccessSource,
    /\.from\(['"]iv_user_profiles['"]\)[\s\S]*?\.select\(['"]role['"]\)/,
  );
});

test("database Scholar release is complete, unpublished, internal, and has no member state", async () => {
  assert.ok(process.env.DATABASE_URL, "DATABASE_URL is required for integration verification");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    application_name: "iron-vault-scholar-test",
  });
  try {
    const releaseResult = await pool.query(
      `
        SELECT id, status, published_at
        FROM curriculum_releases
        WHERE version = $1
      `,
      [releaseVersion],
    );
    assert.equal(releaseResult.rowCount, 1);
    assert.equal(releaseResult.rows[0].status, "imported");
    assert.equal(releaseResult.rows[0].published_at, null);
    const releaseId = releaseResult.rows[0].id;

    const counts = await pool.query(
      `
        SELECT
          (SELECT count(*)::int FROM pathways WHERE release_id = $1) AS pathways,
          (
            SELECT count(*)::int FROM courses
            INNER JOIN pathways ON pathways.id = courses.pathway_id
            WHERE pathways.release_id = $1
          ) AS courses,
          (
            SELECT count(*)::int FROM curriculum_modules
            INNER JOIN courses ON courses.id = curriculum_modules.course_id
            INNER JOIN pathways ON pathways.id = courses.pathway_id
            WHERE pathways.release_id = $1
          ) AS modules,
          (
            SELECT count(*)::int FROM lessons
            INNER JOIN curriculum_modules ON curriculum_modules.id = lessons.module_id
            INNER JOIN courses ON courses.id = curriculum_modules.course_id
            INNER JOIN pathways ON pathways.id = courses.pathway_id
            WHERE pathways.release_id = $1
          ) AS lessons,
          (SELECT count(*)::int FROM assessments WHERE release_id = $1) AS assessments,
          (
            SELECT count(*)::int FROM assessment_questions
            INNER JOIN assessments ON assessments.id = assessment_questions.assessment_id
            WHERE assessments.release_id = $1
          ) AS questions,
          (
            SELECT count(*)::int FROM assessment_answer_keys
            INNER JOIN assessment_questions ON assessment_questions.id = assessment_answer_keys.question_id
            INNER JOIN assessments ON assessments.id = assessment_questions.assessment_id
            WHERE assessments.release_id = $1
          ) AS answer_keys,
          (
            SELECT count(*)::int FROM interactions
            INNER JOIN lessons ON lessons.id = interactions.lesson_id
            INNER JOIN curriculum_modules ON curriculum_modules.id = lessons.module_id
            INNER JOIN courses ON courses.id = curriculum_modules.course_id
            INNER JOIN pathways ON pathways.id = courses.pathway_id
            WHERE pathways.release_id = $1
          ) AS interactions,
          (
            SELECT count(*)::int FROM content_blocks
            INNER JOIN lessons ON lessons.id = content_blocks.lesson_id
            INNER JOIN curriculum_modules ON curriculum_modules.id = lessons.module_id
            INNER JOIN courses ON courses.id = curriculum_modules.course_id
            INNER JOIN pathways ON pathways.id = courses.pathway_id
            WHERE pathways.release_id = $1 AND content_blocks.block_type = 'assignment'
          ) AS assignments,
          (
            SELECT count(*)::int FROM content_blocks
            INNER JOIN lessons ON lessons.id = content_blocks.lesson_id
            INNER JOIN curriculum_modules ON curriculum_modules.id = lessons.module_id
            INNER JOIN courses ON courses.id = curriculum_modules.course_id
            INNER JOIN pathways ON pathways.id = courses.pathway_id
            WHERE pathways.release_id = $1 AND content_blocks.block_type = 'narration'
          ) AS narrations,
          (
            SELECT count(*)::int
            FROM curriculum_source_records
            WHERE release_id = $1 AND source_key LIKE 'canvas-blueprint:%'
          ) AS canvas_blueprints
      `,
      [releaseId],
    );
    assert.deepEqual(counts.rows[0], {
      pathways: 7,
      courses: 25,
      modules: 32,
      lessons: 138,
      assessments: 32,
      questions: 320,
      answer_keys: 320,
      interactions: 26,
      assignments: 118,
      narrations: 138,
      canvas_blueprints: 180,
    });

    const access = await pool.query(
      `
        SELECT
          count(*) FILTER (WHERE access_class <> 'internal')::int AS non_internal,
          count(*) FILTER (WHERE editorial_state = 'published')::int AS published
        FROM (
          SELECT access_class, editorial_state FROM pathways WHERE release_id = $1
          UNION ALL
          SELECT courses.access_class, courses.editorial_state
          FROM courses INNER JOIN pathways ON pathways.id = courses.pathway_id
          WHERE pathways.release_id = $1
          UNION ALL
          SELECT curriculum_modules.access_class, curriculum_modules.editorial_state
          FROM curriculum_modules
          INNER JOIN courses ON courses.id = curriculum_modules.course_id
          INNER JOIN pathways ON pathways.id = courses.pathway_id
          WHERE pathways.release_id = $1
          UNION ALL
          SELECT lessons.access_class, lessons.editorial_state
          FROM lessons
          INNER JOIN curriculum_modules ON curriculum_modules.id = lessons.module_id
          INNER JOIN courses ON courses.id = curriculum_modules.course_id
          INNER JOIN pathways ON pathways.id = courses.pathway_id
          WHERE pathways.release_id = $1
        ) AS resources
      `,
      [releaseId],
    );
    assert.deepEqual(access.rows[0], { non_internal: 0, published: 0 });

    const memberState = await pool.query(
      `
        SELECT
          (
            SELECT count(*)::int FROM lesson_progress
            INNER JOIN lessons ON lessons.id = lesson_progress.lesson_id
            INNER JOIN curriculum_modules ON curriculum_modules.id = lessons.module_id
            INNER JOIN courses ON courses.id = curriculum_modules.course_id
            INNER JOIN pathways ON pathways.id = courses.pathway_id
            WHERE pathways.release_id = $1
          ) AS lesson_progress,
          (
            SELECT count(*)::int FROM module_progress
            INNER JOIN curriculum_modules ON curriculum_modules.id = module_progress.module_id
            INNER JOIN courses ON courses.id = curriculum_modules.course_id
            INNER JOIN pathways ON pathways.id = courses.pathway_id
            WHERE pathways.release_id = $1
          ) AS module_progress,
          (
            SELECT count(*)::int FROM assessment_attempts
            INNER JOIN assessments ON assessments.id = assessment_attempts.assessment_id
            WHERE assessments.release_id = $1
          ) AS assessment_attempts
      `,
      [releaseId],
    );
    assert.deepEqual(memberState.rows[0], {
      lesson_progress: 0,
      module_progress: 0,
      assessment_attempts: 0,
    });
  } finally {
    await pool.end();
  }
});
