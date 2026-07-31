import { NextRequest, NextResponse } from "next/server";

import {
  AssessmentError,
  saveEntryTestResponse,
} from "@/lib/server/assessment-service";

import {
  ATTEMPT_COOKIE,
  assertSameOrigin,
  assessmentErrorResponse,
  isUuid,
} from "../_shared";

export async function PUT(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const attemptHandle = request.cookies.get(ATTEMPT_COOKIE)?.value;
    if (!attemptHandle) {
      throw new AssessmentError("Attempt not found.", 404, "ATTEMPT_NOT_FOUND");
    }
    const body = await request.json() as {
      questionId?: unknown;
      optionId?: unknown;
    };
    if (!isUuid(body.questionId) || !isUuid(body.optionId)) {
      throw new AssessmentError(
        "Question and option IDs are required.",
        400,
        "INVALID_RESPONSE",
      );
    }
    await saveEntryTestResponse({
      attemptHandle,
      questionId: body.questionId,
      optionId: body.optionId,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return assessmentErrorResponse(error);
  }
}
