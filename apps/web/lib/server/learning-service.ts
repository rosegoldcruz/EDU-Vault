import {
  withDatabaseTransaction,
  type PoolClient,
} from "@iron-vault/database";

export class LearningError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
  }
}

type PublishedLessonRow = {
  id: string;
  slug: string;
  module_id: string;
  sort_order: number;
  xp_value: number;
};

export type LessonLearningState = {
  status: "not_started" | "started" | "completed";
  percentComplete: number;
  xpAwarded: number;
  xpTotal: number;
  nextLesson: { slug: string; title: string } | null;
};

export type AcademyLessonProgress = {
  lessonId: string;
  status: "not_started" | "started" | "completed";
  percentComplete: number;
  unlocked: boolean;
};

async function publishedLesson(
  client: PoolClient,
  slug: string,
): Promise<PublishedLessonRow> {
  const result = await client.query<PublishedLessonRow>(
    `
      SELECT
        lessons.id,
        lessons.slug,
        lessons.module_id,
        lessons.sort_order,
        lessons.xp_value
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
        AND lessons.access_class = 'free'
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
  if (!result.rows[0]) {
    throw new LearningError(
      "This lesson is not available.",
      404,
      "LESSON_NOT_FOUND",
    );
  }
  return result.rows[0];
}

async function xpTotal(
  client: PoolClient,
  memberId: string,
): Promise<number> {
  const result = await client.query<{ xp_total: string }>(
    "SELECT xp_total::text FROM member_xp_totals WHERE member_id = $1",
    [memberId],
  );
  return Number(result.rows[0]?.xp_total ?? 0);
}

async function assertLessonUnlocked(
  client: PoolClient,
  memberId: string,
  lesson: PublishedLessonRow,
): Promise<void> {
  const result = await client.query<{ locked: boolean }>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM lessons AS previous_lesson
        WHERE previous_lesson.module_id = $2
          AND previous_lesson.access_class = 'free'
          AND previous_lesson.editorial_state = 'published'
          AND previous_lesson.sort_order < $3
          AND NOT EXISTS (
            SELECT 1
            FROM lesson_progress
            WHERE lesson_progress.member_id = $1
              AND lesson_progress.lesson_id = previous_lesson.id
              AND lesson_progress.status = 'completed'
          )
      ) AS locked
    `,
    [memberId, lesson.module_id, lesson.sort_order],
  );
  if (result.rows[0]?.locked) {
    throw new LearningError(
      "Complete the previous Foundations lesson first.",
      403,
      "LESSON_LOCKED",
    );
  }
}

async function nextPublishedLesson(
  client: PoolClient,
  lesson: PublishedLessonRow,
): Promise<{ slug: string; title: string } | null> {
  const result = await client.query<{ slug: string; title: string }>(
    `
      SELECT slug, title
      FROM lessons
      WHERE module_id = $1
        AND access_class = 'free'
        AND editorial_state = 'published'
        AND sort_order > $2
      ORDER BY sort_order
      LIMIT 1
    `,
    [lesson.module_id, lesson.sort_order],
  );
  return result.rows[0] ?? null;
}

export async function getAcademyLessonProgress(
  memberId: string,
): Promise<AcademyLessonProgress[]> {
  return withDatabaseTransaction(async (client) => {
    const result = await client.query<{
      lesson_id: string;
      status: "not_started" | "started" | "completed";
      percent_complete: number;
      unlocked: boolean;
    }>(
      `
        SELECT
          lessons.id AS lesson_id,
          COALESCE(lesson_progress.status, 'not_started') AS status,
          COALESCE(lesson_progress.percent_complete, 0)::int AS percent_complete,
          NOT EXISTS (
            SELECT 1
            FROM lessons AS previous_lesson
            WHERE previous_lesson.module_id = lessons.module_id
              AND previous_lesson.access_class = 'free'
              AND previous_lesson.editorial_state = 'published'
              AND previous_lesson.sort_order < lessons.sort_order
              AND NOT EXISTS (
                SELECT 1
                FROM lesson_progress AS previous_progress
                WHERE previous_progress.member_id = $1
                  AND previous_progress.lesson_id = previous_lesson.id
                  AND previous_progress.status = 'completed'
              )
          ) AS unlocked
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
        LEFT JOIN lesson_progress
          ON lesson_progress.lesson_id = lessons.id
         AND lesson_progress.member_id = $1
        WHERE lessons.access_class = 'free'
          AND lessons.editorial_state = 'published'
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
      [memberId],
    );
    return result.rows.map((row) => ({
      lessonId: row.lesson_id,
      status: row.status,
      percentComplete: row.percent_complete,
      unlocked: row.unlocked,
    }));
  });
}

export async function getLessonLearningState(input: {
  memberId: string;
  lessonSlug: string;
}): Promise<LessonLearningState> {
  return withDatabaseTransaction(async (client) => {
    const lesson = await publishedLesson(client, input.lessonSlug);
    await assertLessonUnlocked(client, input.memberId, lesson);
    const progress = await client.query<{
      status: "started" | "completed";
      percent_complete: number;
    }>(
      `
        SELECT status, percent_complete
        FROM lesson_progress
        WHERE member_id = $1
          AND lesson_id = $2
      `,
      [input.memberId, lesson.id],
    );
    return {
      status: progress.rows[0]?.status ?? "not_started",
      percentComplete: progress.rows[0]?.percent_complete ?? 0,
      xpAwarded: 0,
      xpTotal: await xpTotal(client, input.memberId),
      nextLesson: progress.rows[0]?.status === "completed"
        ? await nextPublishedLesson(client, lesson)
        : null,
    };
  });
}

export async function startLesson(input: {
  memberId: string;
  lessonSlug: string;
}): Promise<LessonLearningState> {
  return withDatabaseTransaction(async (client) => {
    const lesson = await publishedLesson(client, input.lessonSlug);
    await assertLessonUnlocked(client, input.memberId, lesson);
    const progress = await client.query<{
      status: "started" | "completed";
      percent_complete: number;
    }>(
      `
        INSERT INTO lesson_progress (
          member_id,
          lesson_id,
          status,
          percent_complete
        )
        VALUES ($1, $2, 'started', 0)
        ON CONFLICT (member_id, lesson_id)
        DO UPDATE SET last_activity_at = NOW()
        RETURNING status, percent_complete
      `,
      [input.memberId, lesson.id],
    );
    await client.query(
      `
        INSERT INTO learning_events (
          member_id,
          event_type,
          entity_type,
          entity_id,
          idempotency_key
        )
        VALUES ($1, 'lesson_started', 'lesson', $2, $3)
        ON CONFLICT (idempotency_key)
          WHERE idempotency_key IS NOT NULL
        DO NOTHING
      `,
      [
        input.memberId,
        lesson.id,
        `lesson-started:${input.memberId}:${lesson.id}`,
      ],
    );
    return {
      status: progress.rows[0].status,
      percentComplete: progress.rows[0].percent_complete,
      xpAwarded: 0,
      xpTotal: await xpTotal(client, input.memberId),
      nextLesson: progress.rows[0].status === "completed"
        ? await nextPublishedLesson(client, lesson)
        : null,
    };
  });
}

export async function completeLesson(input: {
  memberId: string;
  lessonSlug: string;
}): Promise<LessonLearningState> {
  return withDatabaseTransaction(async (client) => {
    const lesson = await publishedLesson(client, input.lessonSlug);
    await assertLessonUnlocked(client, input.memberId, lesson);
    await client.query(
      `
        INSERT INTO lesson_progress (
          member_id,
          lesson_id,
          status,
          percent_complete,
          completed_at
        )
        VALUES ($1, $2, 'completed', 100, NOW())
        ON CONFLICT (member_id, lesson_id)
        DO UPDATE SET
          status = 'completed',
          percent_complete = 100,
          completed_at = COALESCE(lesson_progress.completed_at, NOW()),
          last_activity_at = NOW()
      `,
      [input.memberId, lesson.id],
    );
    const event = await client.query<{ id: string }>(
      `
        INSERT INTO learning_events (
          member_id,
          event_type,
          entity_type,
          entity_id,
          idempotency_key
        )
        VALUES ($1, 'lesson_completed', 'lesson', $2, $3)
        ON CONFLICT (idempotency_key)
          WHERE idempotency_key IS NOT NULL
        DO UPDATE SET idempotency_key = EXCLUDED.idempotency_key
        RETURNING id
      `,
      [
        input.memberId,
        lesson.id,
        `lesson-completed:${input.memberId}:${lesson.id}`,
      ],
    );
    const awarded = await client.query<{ amount: number }>(
      `
        INSERT INTO xp_events (
          member_id,
          event_type,
          source_entity_type,
          source_entity_id,
          amount,
          idempotency_key,
          learning_event_id,
          metadata
        )
        VALUES (
          $1,
          'lesson_completed',
          'lesson',
          $2,
          $3,
          $4,
          $5,
          '{"source":"published_lesson_completion"}'::jsonb
        )
        ON CONFLICT (idempotency_key) DO NOTHING
        RETURNING amount
      `,
      [
        input.memberId,
        lesson.id,
        lesson.xp_value,
        `lesson-xp:${input.memberId}:${lesson.id}`,
        event.rows[0].id,
      ],
    );
    const moduleState = await client.query<{
      required_lessons: number;
      completed_lessons: number;
    }>(
      `
        SELECT
          COUNT(*) FILTER (WHERE lessons.is_required)::int AS required_lessons,
          COUNT(*) FILTER (
            WHERE lessons.is_required
              AND lesson_progress.status = 'completed'
          )::int AS completed_lessons
        FROM lessons
        LEFT JOIN lesson_progress
          ON lesson_progress.lesson_id = lessons.id
         AND lesson_progress.member_id = $2
        WHERE lessons.module_id = $1
          AND lessons.editorial_state = 'published'
      `,
      [lesson.module_id, input.memberId],
    );
    const required = moduleState.rows[0]?.required_lessons ?? 0;
    const completed = moduleState.rows[0]?.completed_lessons ?? 0;
    const percent = required > 0 ? Math.floor((completed / required) * 100) : 0;
    await client.query(
      `
        INSERT INTO module_progress (
          member_id,
          module_id,
          completed_lessons,
          required_lessons,
          percent_complete,
          last_activity_at,
          completed_at
        )
        VALUES (
          $1, $2, $3, $4, $5, NOW(),
          CASE WHEN $4 > 0 AND $3 = $4 THEN NOW() ELSE NULL END
        )
        ON CONFLICT (member_id, module_id)
        DO UPDATE SET
          completed_lessons = EXCLUDED.completed_lessons,
          required_lessons = EXCLUDED.required_lessons,
          percent_complete = EXCLUDED.percent_complete,
          last_activity_at = NOW(),
          completed_at = CASE
            WHEN EXCLUDED.required_lessons > 0
              AND EXCLUDED.completed_lessons = EXCLUDED.required_lessons
            THEN COALESCE(module_progress.completed_at, NOW())
            ELSE NULL
          END
      `,
      [
        input.memberId,
        lesson.module_id,
        completed,
        required,
        percent,
      ],
    );
    if (required > 0 && completed === required) {
      await client.query(
        `
          INSERT INTO learning_events (
            member_id,
            event_type,
            entity_type,
            entity_id,
            idempotency_key
          )
          VALUES ($1, 'module_completed', 'module', $2, $3)
          ON CONFLICT (idempotency_key)
            WHERE idempotency_key IS NOT NULL
          DO NOTHING
        `,
        [
          input.memberId,
          lesson.module_id,
          `module-completed:${input.memberId}:${lesson.module_id}`,
        ],
      );
    }
    await client.query(
      `
        UPDATE recommendations
        SET status = 'acted',
            acted_at = NOW(),
            updated_at = NOW()
        WHERE member_id = $1
          AND resource_type = 'lesson'
          AND resource_id = $2
          AND status = 'active'
      `,
      [input.memberId, lesson.id],
    );
    const nextLesson = await nextPublishedLesson(client, lesson);
    if (nextLesson) {
      await client.query(
        `
          INSERT INTO recommendations (
            member_id,
            recommendation_type,
            resource_type,
            resource_id,
            reason_code,
            explanation,
            priority
          )
          SELECT
            $1,
            'continue',
            'lesson',
            lessons.id,
            'previous_lesson_completed',
            'Continue the Safe Start sequence.',
            90
          FROM lessons
          WHERE lessons.module_id = $2
            AND lessons.slug = $3
          ON CONFLICT (
            member_id,
            recommendation_type,
            resource_type,
            resource_id
          )
            WHERE status = 'active'
          DO UPDATE SET
            generated_at = NOW(),
            priority = EXCLUDED.priority,
            updated_at = NOW()
        `,
        [input.memberId, lesson.module_id, nextLesson.slug],
      );
    }
    return {
      status: "completed",
      percentComplete: 100,
      xpAwarded: awarded.rows[0]?.amount ?? 0,
      xpTotal: await xpTotal(client, input.memberId),
      nextLesson,
    };
  });
}
