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

const contentBlockTypes = new Set<string>(CONTENT_BLOCK_TYPES);

type LessonRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  lesson_type: string;
  access_class: CurriculumLesson["accessClass"];
  estimated_minutes: number | null;
  xp_value: number;
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

type PublishedLessonSummaryRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  access_class: CurriculumLesson["accessClass"];
  estimated_minutes: number | null;
  xp_value: number;
  lesson_sort_order: number;
  module_slug: string;
  module_title: string;
  module_description: string;
  module_sort_order: number;
  course_slug: string;
  course_title: string;
  course_description: string;
  pathway_slug: string;
  pathway_title: string;
  pathway_description: string;
};

export type PublishedLessonSummary = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  accessClass: CurriculumLesson["accessClass"];
  estimatedMinutes: number | null;
  xpValue: number;
};

export type PublishedModuleSummary = {
  slug: string;
  title: string;
  description: string;
  lessons: PublishedLessonSummary[];
};

export type PublishedCourseSummary = {
  slug: string;
  title: string;
  description: string;
  pathway: {
    slug: string;
    title: string;
    description: string;
  };
  modules: PublishedModuleSummary[];
};

function objectPayload(value: unknown): Record<string, unknown> {
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
    throw new Error(`Unsupported published content block: ${row.block_type}`);
  }
  const evidenceClass = row.evidence_class;
  if (
    evidenceClass !== null
    && evidenceClass !== "fact"
    && evidenceClass !== "interpretation"
    && evidenceClass !== "hypothesis"
    && evidenceClass !== "scenario"
  ) {
    throw new Error(`Unsupported evidence classification: ${evidenceClass}`);
  }

  return {
    id: row.id,
    type: row.block_type as ContentBlockType,
    order: row.sort_order,
    payload: objectPayload(row.payload),
    evidenceClass: evidenceClass as EvidenceClass | null,
    citations: citations(row.source_citations),
  };
}

export const getPublishedCourses = cache(
  async (): Promise<PublishedCourseSummary[]> => {
    const pool = getDatabasePool();
    const result = await pool.query<PublishedLessonSummaryRow>(
      `
        SELECT
          lessons.id,
          lessons.slug,
          lessons.title,
          lessons.summary,
          lessons.access_class,
          lessons.estimated_minutes,
          lessons.xp_value,
          lessons.sort_order AS lesson_sort_order,
          curriculum_modules.slug AS module_slug,
          curriculum_modules.title AS module_title,
          curriculum_modules.description AS module_description,
          curriculum_modules.sort_order AS module_sort_order,
          courses.slug AS course_slug,
          courses.title AS course_title,
          courses.description AS course_description,
          pathways.slug AS pathway_slug,
          pathways.title AS pathway_title,
          pathways.description AS pathway_description
        FROM lessons
        INNER JOIN curriculum_modules
          ON curriculum_modules.id = lessons.module_id
        INNER JOIN courses
          ON courses.id = curriculum_modules.course_id
        INNER JOIN pathways
          ON pathways.id = courses.pathway_id
        INNER JOIN curriculum_releases
          ON curriculum_releases.id = pathways.release_id
        INNER JOIN academies
          ON academies.id = curriculum_releases.academy_id
        WHERE lessons.editorial_state = 'published'
          AND curriculum_modules.editorial_state = 'published'
          AND courses.editorial_state = 'published'
          AND pathways.editorial_state = 'published'
          AND curriculum_releases.status = 'published'
          AND academies.status = 'active'
        ORDER BY
          pathways.sort_order,
          courses.sort_order,
          curriculum_modules.sort_order,
          lessons.sort_order
      `,
    );

    const courses = new Map<string, PublishedCourseSummary>();
    for (const row of result.rows) {
      let course = courses.get(row.course_slug);
      if (!course) {
        course = {
          slug: row.course_slug,
          title: row.course_title,
          description: row.course_description,
          pathway: {
            slug: row.pathway_slug,
            title: row.pathway_title,
            description: row.pathway_description,
          },
          modules: [],
        };
        courses.set(row.course_slug, course);
      }
      let courseModule = course.modules.find(
        (candidate) => candidate.slug === row.module_slug,
      );
      if (!courseModule) {
        courseModule = {
          slug: row.module_slug,
          title: row.module_title,
          description: row.module_description,
          lessons: [],
        };
        course.modules.push(courseModule);
      }
      courseModule.lessons.push({
        id: row.id,
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        accessClass: row.access_class,
        estimatedMinutes: row.estimated_minutes,
        xpValue: row.xp_value,
      });
    }
    return [...courses.values()];
  },
);

export const getPublishedLessonBySlug = cache(
  async (slug: string): Promise<CurriculumLesson | null> => {
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
        INNER JOIN curriculum_modules
          ON curriculum_modules.id = lessons.module_id
        INNER JOIN courses
          ON courses.id = curriculum_modules.course_id
        INNER JOIN pathways
          ON pathways.id = courses.pathway_id
        INNER JOIN curriculum_releases
          ON curriculum_releases.id = pathways.release_id
        INNER JOIN academies
          ON academies.id = curriculum_releases.academy_id
        WHERE lessons.slug = $1
          AND lessons.editorial_state = 'published'
          AND curriculum_modules.editorial_state = 'published'
          AND courses.editorial_state = 'published'
          AND pathways.editorial_state = 'published'
          AND curriculum_releases.status = 'published'
          AND academies.status = 'active'
        LIMIT 1
      `,
      [slug],
    );
    const row = lessonResult.rows[0];
    if (!row) return null;

    const blockResult = await pool.query<BlockRow>(
      `
        SELECT
          id,
          block_type,
          sort_order,
          payload,
          evidence_class,
          source_citations
        FROM content_blocks
        WHERE lesson_id = $1
          AND editorial_state = 'published'
        ORDER BY sort_order ASC
      `,
      [row.id],
    );

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      lessonType: row.lesson_type,
      accessClass: row.access_class,
      estimatedMinutes: row.estimated_minutes,
      xpValue: row.xp_value,
      module: {
        id: row.module_id,
        slug: row.module_slug,
        title: row.module_title,
      },
      course: {
        id: row.course_id,
        slug: row.course_slug,
        title: row.course_title,
      },
      pathway: {
        id: row.pathway_id,
        slug: row.pathway_slug,
        title: row.pathway_title,
      },
      blocks: blockResult.rows.map(mapBlock),
    };
  },
);
