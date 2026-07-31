import { NextRequest, NextResponse } from "next/server";

import {
  AssessmentError,
  submitEntryTest,
} from "@/lib/server/assessment-service";

import {
  ATTEMPT_COOKIE,
  assertSameOrigin,
  assessmentErrorResponse,
} from "../_shared";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const attemptHandle = request.cookies.get(ATTEMPT_COOKIE)?.value;
    if (!attemptHandle) {
      throw new AssessmentError("Attempt not found.", 404, "ATTEMPT_NOT_FOUND");
    }
    const result = await submitEntryTest(attemptHandle);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return assessmentErrorResponse(error);
  }
}
