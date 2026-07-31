import { createHash, randomBytes } from "node:crypto";

import {
  withDatabaseTransaction,
  type PoolClient,
} from "@iron-vault/database";

const ENTRY_TEST_SLUG = "entry-test";
const ATTEMPT_TTL_MS = 7 * 24 * 60 * 60 * 1_000;
const ENTRY_TEST_CLAIM_XP = 50;
const FIRST_FOUNDATIONS_LESSON_ID =
  "bc531628-44bc-d030-d251-f243aecac1a7";
const FIRST_FOUNDATIONS_LESSON_HREF =
  "/academy/lessons/wallet-control";

export class AssessmentError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
  }
}

type AttemptRow = {
  id: string;
  assessment_id: string;
  visitor_id: string | null;
  member_id: string | null;
  status: "open" | "submitted" | "claimed" | "expired" | "invalidated";
  score: number | null;
  max_score: number | null;
  result: Record<string, unknown>;
  expires_at: Date;
};

type QuestionRow = {
  id: string;
  prompt: Record<string, unknown>;
  feedback: Record<string, unknown>;
  topic_key: string;
  points: number;
  sort_order: number;
};

type OptionRow = {
  id: string;
  question_id: string;
  content: Record<string, unknown>;
  sort_order: number;
};

type AnswerRow = {
  question_id: string;
  answer_option_id: string;
};

export type EntryTestQuestion = {
  id: string;
  prompt: string;
  topic: string;
  options: Array<{ id: string; text: string }>;
};

export type EntryTestState = {
  status: AttemptRow["status"];
  questions: EntryTestQuestion[];
  result: Record<string, unknown> | null;
};

function token(): string {
  return randomBytes(32).toString("base64url");
}

function tokenHash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function payloadText(
  payload: Record<string, unknown>,
  key = "text",
): string {
  const value = payload[key];
  return typeof value === "string" ? value : "";
}

function stableOptionOrder(attemptId: string, optionId: string): string {
  return createHash("sha256")
    .update(`${attemptId}:${optionId}`)
    .digest("hex");
}

function currentResult(
  result: Record<string, unknown>,
  claimed = false,
): Record<string, unknown> {
  return {
    ...result,
    recommendedAction: {
      label: "Start Foundations",
      href: FIRST_FOUNDATIONS_LESSON_HREF,
    },
    ...(claimed
      ? { claimed: true, xpAwarded: ENTRY_TEST_CLAIM_XP }
      : {}),
  };
}

async function getEntryAssessmentId(client: PoolClient): Promise<string> {
  const result = await client.query<{ id: string }>(
    `
      SELECT assessments.id
      FROM assessments
      INNER JOIN curriculum_releases
        ON curriculum_releases.id = assessments.release_id
      WHERE assessments.slug = $1
        AND assessments.purpose = 'entry_test'
        AND assessments.audience = 'public'
        AND assessments.status = 'published'
        AND curriculum_releases.status = 'published'
      ORDER BY assessments.published_at DESC
      LIMIT 1
    `,
    [ENTRY_TEST_SLUG],
  );
  if (!result.rows[0]) {
    throw new AssessmentError(
      "The Entry Test is not available.",
      503,
      "ASSESSMENT_UNAVAILABLE",
    );
  }
  return result.rows[0].id;
}

async function findAttempt(
  client: PoolClient,
  attemptHandle: string,
  lock = false,
): Promise<AttemptRow | null> {
  const result = await client.query<AttemptRow>(
    `
      SELECT
        id,
        assessment_id,
        visitor_id,
        member_id,
        status,
        score,
        max_score,
        result,
        expires_at
      FROM assessment_attempts
      WHERE public_handle_hash = $1
      ${lock ? "FOR UPDATE" : ""}
    `,
    [tokenHash(attemptHandle)],
  );
  const attempt = result.rows[0] ?? null;
  if (
    attempt
    && attempt.status === "open"
    && attempt.expires_at.getTime() <= Date.now()
  ) {
    await client.query(
      "UPDATE assessment_attempts SET status = 'expired' WHERE id = $1",
      [attempt.id],
    );
    attempt.status = "expired";
  }
  return attempt;
}

async function ensureVisitor(
  client: PoolClient,
  visitorHandle: string | null,
): Promise<{ id: string; handle: string | null }> {
  if (visitorHandle) {
    const existing = await client.query<{ id: string }>(
      `
        UPDATE visitors
        SET last_seen_at = NOW(),
            expires_at = NOW() + INTERVAL '180 days'
        WHERE browser_token_hash = $1
          AND (expires_at IS NULL OR expires_at > NOW())
        RETURNING id
      `,
      [tokenHash(visitorHandle)],
    );
    if (existing.rows[0]) {
      return { id: existing.rows[0].id, handle: null };
    }
  }

  const handle = token();
  const created = await client.query<{ id: string }>(
    `
      INSERT INTO visitors (browser_token_hash, expires_at)
      VALUES ($1, NOW() + INTERVAL '180 days')
      RETURNING id
    `,
    [tokenHash(handle)],
  );
  return { id: created.rows[0].id, handle };
}

async function publicQuestions(
  client: PoolClient,
  attempt: AttemptRow,
): Promise<EntryTestQuestion[]> {
  const questionResult = await client.query<QuestionRow>(
    `
        SELECT id, prompt, feedback, topic_key, points, sort_order
        FROM assessment_questions
        WHERE assessment_id = $1
          AND editorial_state = 'published'
        ORDER BY sort_order ASC
    `,
    [attempt.assessment_id],
  );
  const optionResult = await client.query<OptionRow>(
    `
        SELECT answer_options.id, answer_options.question_id,
               answer_options.content, answer_options.sort_order
        FROM answer_options
        INNER JOIN assessment_questions
          ON assessment_questions.id = answer_options.question_id
        WHERE assessment_questions.assessment_id = $1
    `,
    [attempt.assessment_id],
  );
  const optionsByQuestion = new Map<string, OptionRow[]>();
  for (const option of optionResult.rows) {
    const options = optionsByQuestion.get(option.question_id) ?? [];
    options.push(option);
    optionsByQuestion.set(option.question_id, options);
  }

  return questionResult.rows.map((question) => ({
    id: question.id,
    prompt: payloadText(question.prompt),
    topic: question.topic_key,
    options: (optionsByQuestion.get(question.id) ?? [])
      .toSorted((a, b) => (
        stableOptionOrder(attempt.id, a.id)
          .localeCompare(stableOptionOrder(attempt.id, b.id))
      ))
      .map((option) => ({
        id: option.id,
        text: payloadText(option.content),
      })),
  }));
}

export async function startEntryTest(input: {
  attemptHandle: string | null;
  visitorHandle: string | null;
}): Promise<{
  attemptHandle: string | null;
  visitorHandle: string | null;
  state: EntryTestState;
}> {
  return withDatabaseTransaction(async (client) => {
    if (input.attemptHandle) {
      const existing = await findAttempt(client, input.attemptHandle, true);
      if (
        existing
        && (existing.status === "open"
          || existing.status === "submitted"
          || existing.status === "claimed")
      ) {
        return {
          attemptHandle: null,
          visitorHandle: null,
          state: {
            status: existing.status,
            questions: existing.status === "open"
              ? await publicQuestions(client, existing)
              : [],
            result: existing.status === "open"
              ? null
              : currentResult(
                existing.result,
                existing.status === "claimed",
              ),
          },
        };
      }
    }

    const visitor = await ensureVisitor(client, input.visitorHandle);
    const assessmentId = await getEntryAssessmentId(client);
    const attemptHandle = token();
    const attemptResult = await client.query<AttemptRow>(
      `
        INSERT INTO assessment_attempts (
          assessment_id,
          visitor_id,
          public_handle_hash,
          expires_at
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
          id, assessment_id, visitor_id, member_id, status,
          score, max_score, result, expires_at
      `,
      [
        assessmentId,
        visitor.id,
        tokenHash(attemptHandle),
        new Date(Date.now() + ATTEMPT_TTL_MS),
      ],
    );
    const attempt = attemptResult.rows[0];
    await client.query(
      `
        INSERT INTO learning_events (
          visitor_id,
          event_type,
          entity_type,
          entity_id,
          assessment_attempt_id,
          idempotency_key
        )
        VALUES ($1, 'assessment_started', 'assessment', $2, $3, $4)
        ON CONFLICT (idempotency_key)
          WHERE idempotency_key IS NOT NULL
        DO NOTHING
      `,
      [
        visitor.id,
        assessmentId,
        attempt.id,
        `assessment-started:${attempt.id}`,
      ],
    );

    return {
      attemptHandle,
      visitorHandle: visitor.handle,
      state: {
        status: attempt.status,
        questions: await publicQuestions(client, attempt),
        result: null,
      },
    };
  });
}

export async function saveEntryTestResponse(input: {
  attemptHandle: string;
  questionId: string;
  optionId: string;
}): Promise<void> {
  await withDatabaseTransaction(async (client) => {
    const attempt = await findAttempt(client, input.attemptHandle, true);
    if (!attempt) {
      throw new AssessmentError("Attempt not found.", 404, "ATTEMPT_NOT_FOUND");
    }
    if (attempt.status !== "open") {
      throw new AssessmentError(
        "This attempt can no longer be changed.",
        409,
        "ATTEMPT_CLOSED",
      );
    }
    const validOption = await client.query<{ valid: boolean }>(
      `
        SELECT EXISTS (
          SELECT 1
          FROM answer_options
          INNER JOIN assessment_questions
            ON assessment_questions.id = answer_options.question_id
          WHERE answer_options.id = $1
            AND assessment_questions.id = $2
            AND assessment_questions.assessment_id = $3
        ) AS valid
      `,
      [input.optionId, input.questionId, attempt.assessment_id],
    );
    if (!validOption.rows[0]?.valid) {
      throw new AssessmentError(
        "The selected answer is invalid.",
        400,
        "INVALID_RESPONSE",
      );
    }
    await client.query(
      `
        INSERT INTO assessment_responses (
          attempt_id,
          question_id,
          selected_option_ids
        )
        VALUES ($1, $2, ARRAY[$3::uuid])
        ON CONFLICT (attempt_id, question_id)
        DO UPDATE SET
          selected_option_ids = EXCLUDED.selected_option_ids,
          answered_at = NOW(),
          updated_at = NOW()
      `,
      [attempt.id, input.questionId, input.optionId],
    );
  });
}

export async function submitEntryTest(
  attemptHandle: string,
): Promise<Record<string, unknown>> {
  return withDatabaseTransaction(async (client) => {
    const attempt = await findAttempt(client, attemptHandle, true);
    if (!attempt) {
      throw new AssessmentError("Attempt not found.", 404, "ATTEMPT_NOT_FOUND");
    }
    if (attempt.status === "submitted" || attempt.status === "claimed") {
      return currentResult(
        attempt.result,
        attempt.status === "claimed",
      );
    }
    if (attempt.status !== "open") {
      throw new AssessmentError(
        "This attempt can no longer be submitted.",
        409,
        "ATTEMPT_CLOSED",
      );
    }

    const questions = await client.query<QuestionRow>(
      `
          SELECT id, prompt, feedback, topic_key, points, sort_order
          FROM assessment_questions
          WHERE assessment_id = $1
            AND editorial_state = 'published'
          ORDER BY sort_order ASC
      `,
      [attempt.assessment_id],
    );
    const answers = await client.query<AnswerRow>(
      `
          SELECT assessment_answer_keys.question_id,
                 assessment_answer_keys.answer_option_id
          FROM assessment_answer_keys
          INNER JOIN assessment_questions
            ON assessment_questions.id = assessment_answer_keys.question_id
          WHERE assessment_questions.assessment_id = $1
      `,
      [attempt.assessment_id],
    );
    const responses = await client.query<{
      id: string;
      question_id: string;
      selected_option_ids: string[];
    }>(
      `
          SELECT id, question_id, selected_option_ids
          FROM assessment_responses
          WHERE attempt_id = $1
      `,
      [attempt.id],
    );
    if (responses.rows.length !== questions.rows.length) {
      throw new AssessmentError(
        "Answer all five questions before submitting.",
        400,
        "INCOMPLETE_ATTEMPT",
      );
    }

    const correctByQuestion = new Map(
      answers.rows.map((answer) => [
        answer.question_id,
        answer.answer_option_id,
      ]),
    );
    const responseByQuestion = new Map(
      responses.rows.map((response) => [response.question_id, response]),
    );
    let score = 0;
    const topicFeedback: Array<Record<string, unknown>> = [];

    for (const question of questions.rows) {
      const response = responseByQuestion.get(question.id);
      const correct = Boolean(
        response
        && response.selected_option_ids[0] === correctByQuestion.get(question.id),
      );
      const awardedPoints = correct ? question.points : 0;
      score += awardedPoints;
      const feedbackText = payloadText(
        question.feedback,
        correct ? "correct" : "incorrect",
      );
      topicFeedback.push({
        topic: question.topic_key,
        correct,
        feedback: feedbackText,
        nextTopic: question.feedback.nextTopic ?? null,
        sources: question.feedback.sources ?? [],
      });
      if (response) {
        await client.query(
          `
            UPDATE assessment_responses
            SET awarded_points = $2,
                feedback = $3::jsonb,
                updated_at = NOW()
            WHERE id = $1
          `,
          [
            response.id,
            awardedPoints,
            JSON.stringify({
              correct,
              text: feedbackText,
              sources: question.feedback.sources ?? [],
            }),
          ],
        );
      }
    }

    const maxScore = questions.rows.reduce(
      (total, question) => total + question.points,
      0,
    );
    const result = {
      score,
      maxScore,
      level: score === maxScore
        ? "strong-foundation"
        : score >= 3
          ? "building-foundation"
          : "start-with-foundations",
      topicFeedback,
      recommendedAction: {
        label: "Start Foundations",
        href: FIRST_FOUNDATIONS_LESSON_HREF,
      },
    };
    await client.query(
      `
        UPDATE assessment_attempts
        SET status = 'submitted',
            score = $2,
            max_score = $3,
            passed = NULL,
            result = $4::jsonb,
            submitted_at = NOW(),
            updated_at = NOW()
        WHERE id = $1
      `,
      [attempt.id, score, maxScore, JSON.stringify(result)],
    );
    await client.query(
      `
        INSERT INTO learning_events (
          visitor_id,
          event_type,
          entity_type,
          entity_id,
          assessment_attempt_id,
          idempotency_key,
          payload
        )
        VALUES ($1, 'assessment_submitted', 'assessment', $2, $3, $4, $5::jsonb)
        ON CONFLICT (idempotency_key)
          WHERE idempotency_key IS NOT NULL
        DO NOTHING
      `,
      [
        attempt.visitor_id,
        attempt.assessment_id,
        attempt.id,
        `assessment-submitted:${attempt.id}`,
        JSON.stringify({ score, maxScore }),
      ],
    );
    return result;
  });
}

export async function claimEntryTest(input: {
  attemptHandle: string;
  memberId: string;
}): Promise<Record<string, unknown>> {
  return withDatabaseTransaction(async (client) => {
    const attempt = await findAttempt(client, input.attemptHandle, true);
    if (!attempt) {
      throw new AssessmentError("Attempt not found.", 404, "ATTEMPT_NOT_FOUND");
    }
    if (attempt.status === "claimed") {
      if (attempt.member_id !== input.memberId) {
        throw new AssessmentError(
          "This result belongs to another member.",
          409,
          "ATTEMPT_ALREADY_CLAIMED",
        );
      }
      return currentResult(attempt.result, true);
    }
    if (attempt.status !== "submitted") {
      throw new AssessmentError(
        "Submit the Entry Test before claiming it.",
        409,
        "ATTEMPT_NOT_SUBMITTED",
      );
    }
    const existingClaim = await client.query<{ id: string }>(
      `
        SELECT id
        FROM assessment_attempts
        WHERE member_id = $1
          AND assessment_id = $2
          AND status = 'claimed'
        LIMIT 1
        FOR UPDATE
      `,
      [input.memberId, attempt.assessment_id],
    );
    if (
      existingClaim.rows[0]
      && existingClaim.rows[0].id !== attempt.id
    ) {
      throw new AssessmentError(
        "This member has already claimed an Entry Test result.",
        409,
        "MEMBER_ASSESSMENT_ALREADY_CLAIMED",
      );
    }

    await client.query(
      `
        UPDATE assessment_attempts
        SET member_id = $2,
            status = 'claimed',
            claimed_at = NOW(),
            updated_at = NOW()
        WHERE id = $1
      `,
      [attempt.id, input.memberId],
    );
    const eventResult = await client.query<{ id: string }>(
      `
        INSERT INTO learning_events (
          member_id,
          visitor_id,
          event_type,
          entity_type,
          entity_id,
          assessment_attempt_id,
          idempotency_key
        )
        VALUES ($1, $2, 'assessment_claimed', 'assessment', $3, $4, $5)
        ON CONFLICT (idempotency_key)
          WHERE idempotency_key IS NOT NULL
        DO UPDATE SET idempotency_key = EXCLUDED.idempotency_key
        RETURNING id
      `,
      [
        input.memberId,
        attempt.visitor_id,
        attempt.assessment_id,
        attempt.id,
        `assessment-claimed:${attempt.id}`,
      ],
    );
    await client.query(
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
          $1, 'assessment_claimed', 'assessment', $2, $3, $4, $5, $6::jsonb
        )
        ON CONFLICT (idempotency_key) DO NOTHING
      `,
      [
        input.memberId,
        attempt.assessment_id,
        ENTRY_TEST_CLAIM_XP,
        `entry-test-xp:${attempt.id}`,
        eventResult.rows[0].id,
        JSON.stringify({ attemptId: attempt.id }),
      ],
    );
    await client.query(
      `
        INSERT INTO saved_results (
          member_id,
          result_type,
          source_entity_type,
          source_entity_id,
          title,
          result
        )
        VALUES ($1, 'assessment', 'assessment', $2, 'Iron Vault Entry Test', $3::jsonb)
        ON CONFLICT (
          member_id,
          result_type,
          source_entity_type,
          source_entity_id
        )
        DO UPDATE SET
          result = EXCLUDED.result,
          saved_at = NOW(),
          updated_at = NOW()
      `,
      [input.memberId, attempt.assessment_id, JSON.stringify(attempt.result)],
    );
    await client.query(
      `
        INSERT INTO lesson_progress (
          member_id,
          lesson_id,
          status,
          percent_complete
        )
        VALUES ($1, $2, 'started', 0)
        ON CONFLICT (member_id, lesson_id) DO NOTHING
      `,
      [input.memberId, FIRST_FOUNDATIONS_LESSON_ID],
    );
    await client.query(
      `
        INSERT INTO learning_events (
          member_id,
          event_type,
          entity_type,
          entity_id,
          idempotency_key,
          payload
        )
        VALUES (
          $1,
          'lesson_started',
          'lesson',
          $2,
          $3,
          '{"source":"entry_test_claim"}'::jsonb
        )
        ON CONFLICT (idempotency_key)
          WHERE idempotency_key IS NOT NULL
        DO NOTHING
      `,
      [
        input.memberId,
        FIRST_FOUNDATIONS_LESSON_ID,
        `foundations-started:${input.memberId}`,
      ],
    );
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
        VALUES (
          $1,
          'continue',
          'lesson',
          $2,
          'entry_test_claimed',
          'Begin with wallet control and evidence-first operating habits.',
          100
        )
        ON CONFLICT (
          member_id,
          recommendation_type,
          resource_type,
          resource_id
        )
          WHERE status = 'active'
        DO UPDATE SET
          reason_code = EXCLUDED.reason_code,
          explanation = EXCLUDED.explanation,
          priority = EXCLUDED.priority,
          generated_at = NOW(),
          updated_at = NOW()
      `,
      [input.memberId, FIRST_FOUNDATIONS_LESSON_ID],
    );

    return currentResult(attempt.result, true);
  });
}
