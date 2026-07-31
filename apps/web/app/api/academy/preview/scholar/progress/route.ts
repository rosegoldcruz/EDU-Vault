import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { withDatabaseTransaction } from "@iron-vault/database";

import { requireAdminAccess } from "@/lib/server/member-access";
import { SCHOLAR_RELEASE_VERSION } from "@/lib/server/draft-curriculum";

const payloadSchema = z.object({ lessonId: z.string().uuid(), complete: z.boolean() });

export async function POST(request: NextRequest) {
  try {
    const access = await requireAdminAccess(request);
    const payload = payloadSchema.parse(await request.json());
    await withDatabaseTransaction(async (client) => {
      const target = await client.query<{ lesson_id: string; module_id: string; member_id: string }>(
        `
          SELECT lessons.id AS lesson_id, curriculum_modules.id AS module_id, members.id AS member_id
          FROM curriculum_releases
          INNER JOIN pathways ON pathways.release_id = curriculum_releases.id
          INNER JOIN courses ON courses.pathway_id = pathways.id
          INNER JOIN curriculum_modules ON curriculum_modules.course_id = courses.id
          INNER JOIN lessons ON lessons.module_id = curriculum_modules.id
          INNER JOIN identity_accounts
            ON identity_accounts.provider = 'privy'
            AND identity_accounts.provider_subject = $2
          INNER JOIN members ON members.id = identity_accounts.member_id AND members.status = 'active'
          WHERE curriculum_releases.version = $1
            AND curriculum_releases.status IN ('imported', 'draft', 'review')
            AND curriculum_releases.published_at IS NULL
            AND lessons.id = $3
            AND lessons.access_class = 'internal'
          LIMIT 1
        `,
        [SCHOLAR_RELEASE_VERSION, access.auth.privyUserId, payload.lessonId],
      );
      const row = target.rows[0];
      if (!row) throw new Error("Not found");
      await client.query(
        `
          INSERT INTO lesson_progress (member_id, lesson_id, status, percent_complete, completed_at, last_activity_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
          ON CONFLICT (member_id, lesson_id) DO UPDATE SET
            status = EXCLUDED.status,
            percent_complete = EXCLUDED.percent_complete,
            completed_at = EXCLUDED.completed_at,
            last_activity_at = NOW(),
            updated_at = NOW()
        `,
        [row.member_id, row.lesson_id, payload.complete ? "completed" : "started", payload.complete ? 100 : 0, payload.complete ? new Date() : null],
      );
      await client.query(
        `
          INSERT INTO module_progress (member_id, module_id, completed_lessons, required_lessons, percent_complete, last_activity_at, completed_at)
          SELECT
            $1,
            $2,
            count(*) FILTER (WHERE lessons.is_required AND lesson_progress.status = 'completed')::int,
            count(*) FILTER (WHERE lessons.is_required)::int,
            CASE WHEN count(*) FILTER (WHERE lessons.is_required) = 0 THEN 0 ELSE round(
              100.0 * count(*) FILTER (WHERE lessons.is_required AND lesson_progress.status = 'completed')
              / count(*) FILTER (WHERE lessons.is_required)
            )::int END,
            NOW(),
            CASE WHEN count(*) FILTER (WHERE lessons.is_required AND lesson_progress.status IS DISTINCT FROM 'completed') = 0 THEN NOW() ELSE NULL END
          FROM lessons
          LEFT JOIN lesson_progress ON lesson_progress.lesson_id = lessons.id AND lesson_progress.member_id = $1
          WHERE lessons.module_id = $2
          ON CONFLICT (member_id, module_id) DO UPDATE SET
            completed_lessons = EXCLUDED.completed_lessons,
            required_lessons = EXCLUDED.required_lessons,
            percent_complete = EXCLUDED.percent_complete,
            last_activity_at = EXCLUDED.last_activity_at,
            completed_at = EXCLUDED.completed_at,
            updated_at = NOW()
        `,
        [row.member_id, row.module_id],
      );
    });
    return NextResponse.json({ ok: true, xpAwarded: 0 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to save progress";
    const status = message.startsWith("Unauthorized:") ? 401 : message.startsWith("Forbidden:") ? 403 : message === "Not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
