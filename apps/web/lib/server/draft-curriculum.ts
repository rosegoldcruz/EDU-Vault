import { cache } from "react";

import { getDatabasePool } from "@iron-vault/database";

import {
  CONTENT_BLOCK_TYPES,
  type ContentBlockType,
  type CurriculumContentBlock,
  type CurriculumLesson,
  type EvidenceClass,
  type SourceCitation,
} from "@/lib/curriculum/block-types";

export const SCHOLAR_RELEASE_VERSION = "scholar-archive-import-v1";

type HierarchyRow = {
  release_id: string;
  version: string;
  release_status: string;
  published_at: Date | null;
  pathway_id: string;
  pathway_slug: string;
  pathway_title: string;
  pathway_state: string;
  pathway_metadata: unknown;
  pathway_sort: number;
  course_id: string;
  course_slug: string;
  course_title: string;
  course_state: string;
  course_metadata: unknown;
  course_sort: number;
  module_id: string;
  module_slug: string;
  module_title: string;
  module_subtitle: string;
  module_state: string;
  module_metadata: unknown;
  module_sort: number;
  lesson_id: string;
  lesson_slug: string;
  lesson_title: string;
  lesson_state: string;
  lesson_sort: number;
  block_count: string;
  interaction_count: string;
  assignment_count: string;
  narration_available: boolean;
  assessment_slug: string | null;
  assessment_title: string | null;
  assessment_status: string | null;
  question_count: string;
};

type LessonRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  lesson_type: string;
  access_class: CurriculumLesson["accessClass"];
  estimated_minutes: number | null;
  xp_value: number;
  editorial_state: string;
  prerequisites: unknown;
  module_id: string;
  module_slug: string;
  module_title: string;
  course_id: string;
  course_slug: string;
  course_title: string;
  pathway_id: string;
  pathway_slug: string;
  pathway_title: string;
};

type BlockRow = {
  id: string;
  block_type: string;
  sort_order: number;
  payload: unknown;
  evidence_class: string | null;
  source_citations: unknown;
};

type ProvenanceRow = {
  source_path: string;
  source_key: string;
  source_hash: string;
  importer_version: string;
  source_metadata: unknown;
  imported_at: Date;
};

type AssessmentRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  module_title: string;
  editorial_state: string;
  question_id: string;
  prompt: unknown;
  topic_key: string;
  question_sort: number;
  option_id: string;
  option_content: unknown;
  option_sort: number;
};

const contentBlockTypes = new Set<string>(CONTENT_BLOCK_TYPES);

function object(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function citations(value: unknown): SourceCitation[] {
  if (!Array.isArray(value)) return [];
  return value.filter((citation): citation is SourceCitation => (
    citation !== null
    && typeof citation === "object"
    && "label" in citation
    && typeof citation.label === "string"
  ));
}

function mapBlock(row: BlockRow): CurriculumContentBlock {
  if (!contentBlockTypes.has(row.block_type)) {
    return {
      id: row.id,
      type: "warning",
      order: row.sort_order,
      payload: {
        title: "Unsupported imported block",
        text: `The preview renderer does not support database block type “${row.block_type}”.`,
        unsupportedType: row.block_type,
      },
      evidenceClass: null,
      citations: [],
    };
  }
  const allowedEvidence = new Set(["fact", "interpretation", "hypothesis", "scenario"]);
  const evidenceClass = allowedEvidence.has(row.evidence_class ?? "")
    ? row.evidence_class as EvidenceClass
    : null;
  return {
    id: row.id,
    type: row.block_type as ContentBlockType,
    order: row.sort_order,
    payload: object(row.payload),
    evidenceClass,
    citations: citations(row.source_citations),
  };
}

export type DraftLessonSummary = {
  id: string;
  slug: string;
  title: string;
  editorialState: string;
  blockCount: number;
  interactionCount: number;
  assignmentCount: number;
  narrationAvailable: boolean;
};

export type DraftModuleSummary = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  editorialState: string;
  proposedAccessClassification: string;
  lessons: DraftLessonSummary[];
  assessment: {
    slug: string;
    title: string;
    status: string;
    questionCount: number;
  } | null;
};

export type DraftCourseSummary = {
  id: string;
  slug: string;
  title: string;
  editorialState: string;
  proposedAccessClassifications: string[];
  modules: DraftModuleSummary[];
};

export type DraftPathwaySummary = {
  id: string;
  slug: string;
  title: string;
  editorialState: string;
  proposedAccessClassification: string;
  courses: DraftCourseSummary[];
};

export type CanvasBlueprintPreview = {
  id: string;
  title: string;
  section: string;
  outlineKey: string;
  reconciliationStatus: string;
  bodyMissing: boolean;
};

export type DraftReleasePreview = {
  id: string;
  version: string;
  status: string;
  publishedAt: Date | null;
  pathways: DraftPathwaySummary[];
  blueprints: CanvasBlueprintPreview[];
};

function string(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export const getDraftReleasePreview = cache(async (
  version = SCHOLAR_RELEASE_VERSION,
): Promise<DraftReleasePreview | null> => {
  const pool = getDatabasePool();
  const hierarchyResult = await pool.query<HierarchyRow>(
    `
      SELECT
        curriculum_releases.id AS release_id,
        curriculum_releases.version,
        curriculum_releases.status AS release_status,
        curriculum_releases.published_at,
        pathways.id AS pathway_id,
        pathways.slug AS pathway_slug,
        pathways.title AS pathway_title,
        pathways.editorial_state AS pathway_state,
        pathways.prerequisites AS pathway_metadata,
        pathways.sort_order AS pathway_sort,
        courses.id AS course_id,
        courses.slug AS course_slug,
        courses.title AS course_title,
        courses.editorial_state AS course_state,
        courses.prerequisites AS course_metadata,
        courses.sort_order AS course_sort,
        curriculum_modules.id AS module_id,
        curriculum_modules.slug AS module_slug,
        curriculum_modules.title AS module_title,
        curriculum_modules.subtitle AS module_subtitle,
        curriculum_modules.editorial_state AS module_state,
        curriculum_modules.prerequisites AS module_metadata,
        curriculum_modules.sort_order AS module_sort,
        lessons.id AS lesson_id,
        lessons.slug AS lesson_slug,
        lessons.title AS lesson_title,
        lessons.editorial_state AS lesson_state,
        lessons.sort_order AS lesson_sort,
        (
          SELECT count(*)
          FROM content_blocks
          WHERE content_blocks.lesson_id = lessons.id
            AND content_blocks.block_type <> 'narration'
        ) AS block_count,
        (
          SELECT count(*)
          FROM interactions
          WHERE interactions.lesson_id = lessons.id
        ) AS interaction_count,
        (
          SELECT count(*)
          FROM content_blocks
          WHERE content_blocks.lesson_id = lessons.id
            AND content_blocks.block_type = 'assignment'
        ) AS assignment_count,
        EXISTS (
          SELECT 1
          FROM content_blocks
          WHERE content_blocks.lesson_id = lessons.id
            AND content_blocks.block_type = 'narration'
            AND COALESCE((content_blocks.payload ->> 'available')::boolean, FALSE)
        ) AS narration_available,
        assessments.slug AS assessment_slug,
        assessments.title AS assessment_title,
        assessments.status AS assessment_status,
        (
          SELECT count(*)
          FROM assessment_questions
          WHERE assessment_questions.assessment_id = assessments.id
        ) AS question_count
      FROM curriculum_releases
      INNER JOIN pathways ON pathways.release_id = curriculum_releases.id
      INNER JOIN courses ON courses.pathway_id = pathways.id
      INNER JOIN curriculum_modules ON curriculum_modules.course_id = courses.id
      INNER JOIN lessons ON lessons.module_id = curriculum_modules.id
      LEFT JOIN assessments
        ON assessments.release_id = curriculum_releases.id
        AND assessments.module_id = curriculum_modules.id
      WHERE curriculum_releases.version = $1
        AND curriculum_releases.status IN ('imported', 'draft', 'review')
        AND curriculum_releases.published_at IS NULL
      ORDER BY
        pathways.sort_order,
        courses.sort_order,
        curriculum_modules.sort_order,
        lessons.sort_order
    `,
    [version],
  );
  const first = hierarchyResult.rows[0];
  if (!first) return null;

  const pathways = new Map<string, DraftPathwaySummary>();
  for (const row of hierarchyResult.rows) {
    let pathway = pathways.get(row.pathway_id);
    if (!pathway) {
      const metadata = object(row.pathway_metadata);
      pathway = {
        id: row.pathway_id,
        slug: row.pathway_slug,
        title: row.pathway_title,
        editorialState: row.pathway_state,
        proposedAccessClassification: string(metadata.proposed_access_classification),
        courses: [],
      };
      pathways.set(row.pathway_id, pathway);
    }
    let course = pathway.courses.find((item) => item.id === row.course_id);
    if (!course) {
      const metadata = object(row.course_metadata);
      course = {
        id: row.course_id,
        slug: row.course_slug,
        title: row.course_title,
        editorialState: row.course_state,
        proposedAccessClassifications: stringArray(metadata.proposed_access_classifications),
        modules: [],
      };
      pathway.courses.push(course);
    }
    let courseModule = course.modules.find((item) => item.id === row.module_id);
    if (!courseModule) {
      const metadata = object(row.module_metadata);
      courseModule = {
        id: row.module_id,
        slug: row.module_slug,
        title: row.module_title,
        subtitle: row.module_subtitle,
        editorialState: row.module_state,
        proposedAccessClassification: string(metadata.proposed_access_classification),
        lessons: [],
        assessment: row.assessment_slug ? {
          slug: row.assessment_slug,
          title: row.assessment_title ?? "Module assessment",
          status: row.assessment_status ?? "imported",
          questionCount: Number(row.question_count),
        } : null,
      };
      course.modules.push(courseModule);
    }
    courseModule.lessons.push({
      id: row.lesson_id,
      slug: row.lesson_slug,
      title: row.lesson_title,
      editorialState: row.lesson_state,
      blockCount: Number(row.block_count),
      interactionCount: Number(row.interaction_count),
      assignmentCount: Number(row.assignment_count),
      narrationAvailable: row.narration_available,
    });
  }

  const blueprintResult = await pool.query<{
    source_metadata: unknown;
  }>(
    `
      SELECT source_metadata
      FROM curriculum_source_records
      WHERE release_id = $1
        AND source_key LIKE 'canvas-blueprint:%'
      ORDER BY source_key
    `,
    [first.release_id],
  );
  const blueprints = blueprintResult.rows.map((row) => {
    const metadata = object(row.source_metadata);
    return {
      id: string(metadata.id),
      title: string(metadata.title),
      section: string(metadata.sourceSection),
      outlineKey: string(metadata.outlineKey),
      reconciliationStatus: string(metadata.reconciliationStatus),
      bodyMissing: metadata.bodyMissing === true,
    };
  });

  return {
    id: first.release_id,
    version: first.version,
    status: first.release_status,
    publishedAt: first.published_at,
    pathways: [...pathways.values()],
    blueprints,
  };
});

export type DraftLessonPreview = {
  lesson: CurriculumLesson;
  editorialState: string;
  review: Record<string, unknown>;
  proposedAccessClassification: string;
  provenance: Array<{
    sourcePath: string;
    sourceKey: string;
    sourceHash: string;
    importerVersion: string;
    metadata: Record<string, unknown>;
    importedAt: Date;
  }>;
};

export const getDraftLessonPreview = cache(async (
  lessonSlug: string,
  version = SCHOLAR_RELEASE_VERSION,
): Promise<DraftLessonPreview | null> => {
  const pool = getDatabasePool();
  const lessonResult = await pool.query<LessonRow>(
    `
      SELECT
        lessons.id,
        lessons.slug,
        lessons.title,
        lessons.summary,
        lessons.lesson_type,
        lessons.access_class,
        lessons.estimated_minutes,
        lessons.xp_value,
        lessons.editorial_state,
        lessons.prerequisites,
        curriculum_modules.id AS module_id,
        curriculum_modules.slug AS module_slug,
        curriculum_modules.title AS module_title,
        courses.id AS course_id,
        courses.slug AS course_slug,
        courses.title AS course_title,
        pathways.id AS pathway_id,
        pathways.slug AS pathway_slug,
        pathways.title AS pathway_title
      FROM lessons
      INNER JOIN curriculum_modules ON curriculum_modules.id = lessons.module_id
      INNER JOIN courses ON courses.id = curriculum_modules.course_id
      INNER JOIN pathways ON pathways.id = courses.pathway_id
      INNER JOIN curriculum_releases ON curriculum_releases.id = pathways.release_id
      WHERE curriculum_releases.version = $1
        AND curriculum_releases.status IN ('imported', 'draft', 'review')
        AND curriculum_releases.published_at IS NULL
        AND lessons.slug = $2
      LIMIT 1
    `,
    [version, lessonSlug],
  );
  const row = lessonResult.rows[0];
  if (!row) return null;

  const [blockResult, provenanceResult] = await Promise.all([
    pool.query<BlockRow>(
      `
        SELECT id, block_type, sort_order, payload, evidence_class, source_citations
        FROM content_blocks
        WHERE lesson_id = $1
        ORDER BY sort_order
      `,
      [row.id],
    ),
    pool.query<ProvenanceRow>(
      `
        SELECT source_path, source_key, source_hash, importer_version,
               source_metadata, imported_at
        FROM curriculum_source_records
        WHERE entity_type = 'lesson'
          AND entity_id = $1
          AND source_key NOT LIKE 'duplicate:%'
        ORDER BY imported_at, source_key
      `,
      [row.id],
    ),
  ]);
  const prerequisiteMetadata = object(row.prerequisites);
  const mainProvenance = provenanceResult.rows[0];
  const mainMetadata = object(mainProvenance?.source_metadata);

  return {
    lesson: {
      id: row.id,
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      lessonType: row.lesson_type,
      accessClass: row.access_class,
      estimatedMinutes: row.estimated_minutes,
      xpValue: row.xp_value,
      module: { id: row.module_id, slug: row.module_slug, title: row.module_title },
      course: { id: row.course_id, slug: row.course_slug, title: row.course_title },
      pathway: { id: row.pathway_id, slug: row.pathway_slug, title: row.pathway_title },
      blocks: blockResult.rows.map(mapBlock),
    },
    editorialState: row.editorial_state,
    review: object(mainMetadata.review),
    proposedAccessClassification: string(prerequisiteMetadata.proposed_access_classification),
    provenance: provenanceResult.rows.map((source) => ({
      sourcePath: source.source_path,
      sourceKey: source.source_key,
      sourceHash: source.source_hash,
      importerVersion: source.importer_version,
      metadata: object(source.source_metadata),
      importedAt: source.imported_at,
    })),
  };
});

export type DraftAssessmentPreview = {
  id: string;
  slug: string;
  title: string;
  status: string;
  moduleTitle: string;
  editorialState: string;
  questions: Array<{
    id: string;
    prompt: string;
    topic: string;
    options: Array<{ id: string; text: string }>;
  }>;
};

export const getDraftAssessmentPreview = cache(async (
  assessmentSlug: string,
  version = SCHOLAR_RELEASE_VERSION,
): Promise<DraftAssessmentPreview | null> => {
  const pool = getDatabasePool();
  // Deliberately does not join assessment_answer_keys.
  const result = await pool.query<AssessmentRow>(
    `
      SELECT
        assessments.id,
        assessments.slug,
        assessments.title,
        assessments.status,
        curriculum_modules.title AS module_title,
        assessment_questions.editorial_state,
        assessment_questions.id AS question_id,
        assessment_questions.prompt,
        assessment_questions.topic_key,
        assessment_questions.sort_order AS question_sort,
        answer_options.id AS option_id,
        answer_options.content AS option_content,
        answer_options.sort_order AS option_sort
      FROM assessments
      INNER JOIN curriculum_releases
        ON curriculum_releases.id = assessments.release_id
      INNER JOIN curriculum_modules
        ON curriculum_modules.id = assessments.module_id
      INNER JOIN assessment_questions
        ON assessment_questions.assessment_id = assessments.id
      INNER JOIN answer_options
        ON answer_options.question_id = assessment_questions.id
      WHERE curriculum_releases.version = $1
        AND curriculum_releases.status IN ('imported', 'draft', 'review')
        AND curriculum_releases.published_at IS NULL
        AND assessments.slug = $2
      ORDER BY assessment_questions.sort_order, answer_options.sort_order
    `,
    [version, assessmentSlug],
  );
  const first = result.rows[0];
  if (!first) return null;
  const questions = new Map<string, DraftAssessmentPreview["questions"][number]>();
  for (const row of result.rows) {
    let question = questions.get(row.question_id);
    if (!question) {
      question = {
        id: row.question_id,
        prompt: string(object(row.prompt).text),
        topic: row.topic_key,
        options: [],
      };
      questions.set(row.question_id, question);
    }
    question.options.push({
      id: row.option_id,
      text: string(object(row.option_content).text),
    });
  }
  return {
    id: first.id,
    slug: first.slug,
    title: first.title,
    status: first.status,
    moduleTitle: first.module_title,
    editorialState: first.editorial_state,
    questions: [...questions.values()],
  };
});
