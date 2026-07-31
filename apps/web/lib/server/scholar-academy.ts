import { cache } from "react";

import { getDatabasePool } from "@iron-vault/database";

import {
  getDraftAssessmentPreview,
  getDraftLessonPreview,
  SCHOLAR_RELEASE_VERSION,
  type DraftAssessmentPreview,
  type DraftLessonPreview,
} from "@/lib/server/draft-curriculum";

export type LearningState = "completed" | "active" | "locked" | "not-started";

export type ScholarLessonSummary = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  minutes: number;
  sortOrder: number;
  blockCount: number;
  assignmentCount: number;
  interactionCount: number;
  narrationReady: boolean;
  state: LearningState;
  percentComplete: number;
};

export type ScholarAssessmentSummary = {
  id: string;
  slug: string;
  title: string;
  questionCount: number;
};

export type ScholarModule = {
  id: string;
  slug: string;
  title: string;
  description: string;
  sortOrder: number;
  lessons: ScholarLessonSummary[];
  assessment: ScholarAssessmentSummary | null;
  state: LearningState;
  percentComplete: number;
  minutes: number;
  assignmentCount: number;
};

export type ScholarCourse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  outcome: string;
  sortOrder: number;
  modules: ScholarModule[];
  state: LearningState;
  percentComplete: number;
  minutes: number;
  lessonCount: number;
  assignmentCount: number;
};

export type ScholarPathway = {
  id: string;
  slug: string;
  title: string;
  description: string;
  outcome: string;
  sortOrder: number;
  courses: ScholarCourse[];
  state: LearningState;
  percentComplete: number;
  minutes: number;
  lessonCount: number;
  moduleCount: number;
};

export type ScholarAcademy = {
  version: string;
  title: string;
  pathways: ScholarPathway[];
  counts: {
    pathways: number;
    courses: number;
    modules: number;
    lessons: number;
    assessments: number;
    assignments: number;
    interactions: number;
    narrationManifests: number;
  };
  percentComplete: number;
  completedLessons: number;
  nextLesson: ScholarLessonSummary & {
    pathwaySlug: string;
    courseSlug: string;
    moduleSlug: string;
    moduleTitle: string;
  };
};

type HierarchyRow = {
  release_title: string;
  pathway_id: string;
  pathway_slug: string;
  pathway_title: string;
  pathway_description: string;
  pathway_outcome: string;
  pathway_sort: number;
  course_id: string;
  course_slug: string;
  course_title: string;
  course_description: string;
  course_outcome: string;
  course_sort: number;
  module_id: string;
  module_slug: string;
  module_title: string;
  module_description: string;
  module_subtitle: string;
  module_sort: number;
  lesson_id: string;
  lesson_slug: string;
  lesson_title: string;
  lesson_summary: string;
  lesson_sort: number;
  minutes: string;
  block_count: string;
  assignment_count: string;
  interaction_count: string;
  narration_ready: boolean;
  progress_status: string | null;
  percent_complete: number | null;
  assessment_id: string | null;
  assessment_slug: string | null;
  assessment_title: string | null;
  question_count: string;
};

function learnerDescription(value: string, title: string, noun: "pathway" | "course" | "module"): string {
  const editorialCopy = /unpublished|canonical placement|editorial review/i.test(value);
  if (value.trim() && !editorialCopy) return value;
  if (noun === "pathway") return `Follow a focused learning journey through ${title.toLowerCase()} and put each idea into practice.`;
  if (noun === "course") return `Build practical understanding of ${title.toLowerCase()} through ordered lessons, exercises, and review.`;
  return `Work through the core ideas in ${title.toLowerCase()}, then test your understanding.`;
}

function learnerOutcome(value: string, title: string): string {
  if (value.trim() && !/retain complete authored|review|pending/i.test(value)) return value;
  return `Explain the central ideas in ${title.toLowerCase()} and apply them to real decisions.`;
}

function aggregateState(completed: number, active: number, total: number): LearningState {
  if (total > 0 && completed === total) return "completed";
  if (completed > 0 || active > 0) return "active";
  return "not-started";
}

function summarizeModule(module: ScholarModule): void {
  const completed = module.lessons.filter((lesson) => lesson.state === "completed").length;
  const active = module.lessons.filter((lesson) => lesson.state === "active").length;
  module.state = aggregateState(completed, active, module.lessons.length);
  module.percentComplete = module.lessons.length ? Math.round((completed / module.lessons.length) * 100) : 0;
  module.minutes = module.lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);
  module.assignmentCount = module.lessons.reduce((sum, lesson) => sum + lesson.assignmentCount, 0);
}

function summarizeCourse(course: ScholarCourse): void {
  const lessons = course.modules.flatMap((module) => module.lessons);
  const completed = lessons.filter((lesson) => lesson.state === "completed").length;
  const active = lessons.filter((lesson) => lesson.state === "active").length;
  course.state = aggregateState(completed, active, lessons.length);
  course.percentComplete = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;
  course.minutes = lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);
  course.lessonCount = lessons.length;
  course.assignmentCount = lessons.reduce((sum, lesson) => sum + lesson.assignmentCount, 0);
}

function summarizePathway(pathway: ScholarPathway): void {
  const lessons = pathway.courses.flatMap((course) => course.modules.flatMap((module) => module.lessons));
  const completed = lessons.filter((lesson) => lesson.state === "completed").length;
  const active = lessons.filter((lesson) => lesson.state === "active").length;
  pathway.state = aggregateState(completed, active, lessons.length);
  pathway.percentComplete = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;
  pathway.minutes = lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);
  pathway.lessonCount = lessons.length;
  pathway.moduleCount = pathway.courses.reduce((sum, course) => sum + course.modules.length, 0);
}

export function scholarHref(kind?: "pathways" | "courses" | "modules" | "lessons" | "assessments", slug?: string): string {
  const root = `/academy/preview/${SCHOLAR_RELEASE_VERSION}`;
  return kind && slug ? `${root}/${kind}/${slug}` : root;
}

export const getScholarAcademy = cache(async (privyUserId: string): Promise<ScholarAcademy | null> => {
  const result = await getDatabasePool().query<HierarchyRow>(
    `
      WITH viewer AS (
        SELECT members.id
        FROM identity_accounts
        INNER JOIN members ON members.id = identity_accounts.member_id
        INNER JOIN member_role_assignments roles_for_member
          ON roles_for_member.member_id = members.id
          AND roles_for_member.revoked_at IS NULL
        INNER JOIN roles ON roles.id = roles_for_member.role_id
        WHERE identity_accounts.provider = 'privy'
          AND identity_accounts.provider_subject = $2
          AND members.status = 'active'
          AND roles.code = 'admin'
        LIMIT 1
      )
      SELECT
        curriculum_releases.title AS release_title,
        pathways.id AS pathway_id,
        pathways.slug AS pathway_slug,
        pathways.title AS pathway_title,
        pathways.description AS pathway_description,
        pathways.outcome AS pathway_outcome,
        pathways.sort_order AS pathway_sort,
        courses.id AS course_id,
        courses.slug AS course_slug,
        courses.title AS course_title,
        courses.description AS course_description,
        courses.outcome AS course_outcome,
        courses.sort_order AS course_sort,
        curriculum_modules.id AS module_id,
        curriculum_modules.slug AS module_slug,
        curriculum_modules.title AS module_title,
        curriculum_modules.description AS module_description,
        curriculum_modules.subtitle AS module_subtitle,
        curriculum_modules.sort_order AS module_sort,
        lessons.id AS lesson_id,
        lessons.slug AS lesson_slug,
        lessons.title AS lesson_title,
        lessons.summary AS lesson_summary,
        lessons.sort_order AS lesson_sort,
        COALESCE(
          lessons.estimated_minutes,
          GREATEST(5, CEIL(COALESCE(block_stats.words, 0) / 190.0)::int)
        )::text AS minutes,
        COALESCE(block_stats.block_count, 0)::text AS block_count,
        COALESCE(block_stats.assignment_count, 0)::text AS assignment_count,
        COALESCE(interaction_stats.interaction_count, 0)::text AS interaction_count,
        COALESCE(block_stats.narration_ready, FALSE) AS narration_ready,
        lesson_progress.status AS progress_status,
        lesson_progress.percent_complete,
        assessments.id AS assessment_id,
        assessments.slug AS assessment_slug,
        assessments.title AS assessment_title,
        COALESCE(question_stats.question_count, 0)::text AS question_count
      FROM curriculum_releases
      INNER JOIN pathways ON pathways.release_id = curriculum_releases.id
      INNER JOIN courses ON courses.pathway_id = pathways.id
      INNER JOIN curriculum_modules ON curriculum_modules.course_id = courses.id
      INNER JOIN lessons ON lessons.module_id = curriculum_modules.id
      LEFT JOIN LATERAL (
        SELECT
          count(*) FILTER (WHERE content_blocks.block_type <> 'narration') AS block_count,
          count(*) FILTER (WHERE content_blocks.block_type = 'assignment') AS assignment_count,
          count(*) FILTER (WHERE content_blocks.block_type = 'narration') > 0 AS narration_ready,
          sum(array_length(regexp_split_to_array(content_blocks.payload::text, '\\s+'), 1)) AS words
        FROM content_blocks
        WHERE content_blocks.lesson_id = lessons.id
      ) block_stats ON TRUE
      LEFT JOIN LATERAL (
        SELECT count(*) AS interaction_count
        FROM interactions
        WHERE interactions.lesson_id = lessons.id
      ) interaction_stats ON TRUE
      LEFT JOIN lesson_progress
        ON lesson_progress.lesson_id = lessons.id
        AND lesson_progress.member_id = (SELECT id FROM viewer)
      LEFT JOIN assessments
        ON assessments.release_id = curriculum_releases.id
        AND assessments.module_id = curriculum_modules.id
      LEFT JOIN LATERAL (
        SELECT count(*) AS question_count
        FROM assessment_questions
        WHERE assessment_questions.assessment_id = assessments.id
      ) question_stats ON TRUE
      WHERE curriculum_releases.version = $1
        AND curriculum_releases.status IN ('imported', 'draft', 'review')
        AND curriculum_releases.published_at IS NULL
        AND pathways.access_class = 'internal'
        AND courses.access_class = 'internal'
        AND curriculum_modules.access_class = 'internal'
        AND lessons.access_class = 'internal'
      ORDER BY pathways.sort_order, courses.sort_order, curriculum_modules.sort_order, lessons.sort_order
    `,
    [SCHOLAR_RELEASE_VERSION, privyUserId],
  );
  const first = result.rows[0];
  if (!first) return null;

  const pathways = new Map<string, ScholarPathway>();
  for (const row of result.rows) {
    let pathway = pathways.get(row.pathway_id);
    if (!pathway) {
      pathway = {
        id: row.pathway_id,
        slug: row.pathway_slug,
        title: row.pathway_title,
        description: learnerDescription(row.pathway_description, row.pathway_title, "pathway"),
        outcome: learnerOutcome(row.pathway_outcome, row.pathway_title),
        sortOrder: row.pathway_sort,
        courses: [], state: "not-started", percentComplete: 0, minutes: 0, lessonCount: 0, moduleCount: 0,
      };
      pathways.set(row.pathway_id, pathway);
    }
    let course = pathway.courses.find((item) => item.id === row.course_id);
    if (!course) {
      course = {
        id: row.course_id,
        slug: row.course_slug,
        title: row.course_title,
        description: learnerDescription(row.course_description, row.course_title, "course"),
        outcome: learnerOutcome(row.course_outcome, row.course_title),
        sortOrder: row.course_sort,
        modules: [], state: "not-started", percentComplete: 0, minutes: 0, lessonCount: 0, assignmentCount: 0,
      };
      pathway.courses.push(course);
    }
    let courseModule = course.modules.find((item) => item.id === row.module_id);
    if (!courseModule) {
      courseModule = {
        id: row.module_id,
        slug: row.module_slug,
        title: row.module_title,
        description: learnerDescription(row.module_description || row.module_subtitle, row.module_title, "module"),
        sortOrder: row.module_sort,
        lessons: [],
        assessment: row.assessment_id ? {
          id: row.assessment_id,
          slug: row.assessment_slug ?? "",
          title: row.assessment_title ?? "Module assessment",
          questionCount: Number(row.question_count),
        } : null,
        state: "not-started", percentComplete: 0, minutes: 0, assignmentCount: 0,
      };
      course.modules.push(courseModule);
    }
    const progress = row.progress_status === "completed" ? "completed" : row.progress_status ? "active" : "not-started";
    courseModule.lessons.push({
      id: row.lesson_id,
      slug: row.lesson_slug,
      title: row.lesson_title,
      summary: row.lesson_summary,
      minutes: Number(row.minutes),
      sortOrder: row.lesson_sort,
      blockCount: Number(row.block_count),
      assignmentCount: Number(row.assignment_count),
      interactionCount: Number(row.interaction_count),
      narrationReady: row.narration_ready,
      state: progress,
      percentComplete: row.percent_complete ?? 0,
    });
  }

  for (const pathway of pathways.values()) {
    for (const course of pathway.courses) {
      for (const courseModule of course.modules) summarizeModule(courseModule);
      summarizeCourse(course);
    }
    summarizePathway(pathway);
  }
  const pathwayList = [...pathways.values()];
  const flattened = pathwayList.flatMap((pathway) => pathway.courses.flatMap((course) => course.modules.flatMap((courseModule) => courseModule.lessons.map((lesson) => ({ lesson, pathway, course, module: courseModule })) )));
  const next = flattened.find(({ lesson }) => lesson.state !== "completed") ?? flattened[0];
  const completedLessons = flattened.filter(({ lesson }) => lesson.state === "completed").length;
  const modules = pathwayList.flatMap((pathway) => pathway.courses.flatMap((course) => course.modules));
  return {
    version: SCHOLAR_RELEASE_VERSION,
    title: first.release_title,
    pathways: pathwayList,
    counts: {
      pathways: pathwayList.length,
      courses: pathwayList.reduce((sum, pathway) => sum + pathway.courses.length, 0),
      modules: modules.length,
      lessons: flattened.length,
      assessments: modules.filter((courseModule) => courseModule.assessment).length,
      assignments: flattened.reduce((sum, item) => sum + item.lesson.assignmentCount, 0),
      interactions: flattened.reduce((sum, item) => sum + item.lesson.interactionCount, 0),
      narrationManifests: flattened.filter((item) => item.lesson.narrationReady).length,
    },
    percentComplete: flattened.length ? Math.round((completedLessons / flattened.length) * 100) : 0,
    completedLessons,
    nextLesson: {
      ...next.lesson,
      pathwaySlug: next.pathway.slug,
      courseSlug: next.course.slug,
      moduleSlug: next.module.slug,
      moduleTitle: next.module.title,
    },
  };
});

export const getScholarPathway = cache(async (slug: string, privyUserId: string) => {
  const academy = await getScholarAcademy(privyUserId);
  return academy?.pathways.find((pathway) => pathway.slug === slug) ?? null;
});

export const getScholarCourse = cache(async (slug: string, privyUserId: string) => {
  const academy = await getScholarAcademy(privyUserId);
  if (!academy) return null;
  for (const pathway of academy.pathways) {
    const course = pathway.courses.find((item) => item.slug === slug);
    if (course) return { course, pathway };
  }
  return null;
});

export const getScholarModule = cache(async (slug: string, privyUserId: string) => {
  const academy = await getScholarAcademy(privyUserId);
  if (!academy) return null;
  for (const pathway of academy.pathways) for (const course of pathway.courses) {
    const courseModule = course.modules.find((item) => item.slug === slug);
    if (courseModule) {
      const modules = pathway.courses.flatMap((item) => item.modules);
      const index = modules.findIndex((item) => item.id === courseModule.id);
      return { module: courseModule, course, pathway, previous: modules[index - 1] ?? null, next: modules[index + 1] ?? null };
    }
  }
  return null;
});

export type ScholarLesson = DraftLessonPreview & {
  summary: ScholarLessonSummary;
  previous: ScholarLessonSummary | null;
  next: ScholarLessonSummary | null;
};

export const getScholarLesson = cache(async (slug: string, privyUserId: string): Promise<ScholarLesson | null> => {
  const [academy, preview] = await Promise.all([
    getScholarAcademy(privyUserId),
    getDraftLessonPreview(slug),
  ]);
  if (!academy || !preview) return null;
  const lessons = academy.pathways.flatMap((pathway) => pathway.courses.flatMap((course) => course.modules.flatMap((module) => module.lessons)));
  const index = lessons.findIndex((lesson) => lesson.id === preview.lesson.id);
  if (index < 0) return null;
  return { ...preview, summary: lessons[index], previous: lessons[index - 1] ?? null, next: lessons[index + 1] ?? null };
});

export type ScholarAssessment = {
  assessment: DraftAssessmentPreview;
  module: ScholarModule;
  course: ScholarCourse;
  pathway: ScholarPathway;
};

export const getScholarAssessment = cache(async (slug: string, privyUserId: string): Promise<ScholarAssessment | null> => {
  const [academy, assessment] = await Promise.all([
    getScholarAcademy(privyUserId),
    getDraftAssessmentPreview(slug),
  ]);
  if (!academy || !assessment) return null;
  for (const pathway of academy.pathways) for (const course of pathway.courses) for (const courseModule of course.modules) {
    if (courseModule.assessment?.id === assessment.id) return { assessment, module: courseModule, course, pathway };
  }
  return null;
});
