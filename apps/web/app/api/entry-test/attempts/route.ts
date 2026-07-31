import { NextRequest, NextResponse } from "next/server";

import { startEntryTest } from "@/lib/server/assessment-service";

import {
  ATTEMPT_COOKIE,
  VISITOR_COOKIE,
  assertSameOrigin,
  assessmentErrorResponse,
  cookieOptions,
} from "../_shared";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const result = await startEntryTest({
      attemptHandle: request.cookies.get(ATTEMPT_COOKIE)?.value ?? null,
      visitorHandle: request.cookies.get(VISITOR_COOKIE)?.value ?? null,
    });
    const response = NextResponse.json({ ok: true, ...result.state });
    if (result.attemptHandle) {
      response.cookies.set(
        ATTEMPT_COOKIE,
        result.attemptHandle,
        cookieOptions(7 * 24 * 60 * 60),
      );
    }
    if (result.visitorHandle) {
      response.cookies.set(
        VISITOR_COOKIE,
        result.visitorHandle,
        cookieOptions(180 * 24 * 60 * 60),
      );
    }
    return response;
  } catch (error) {
    return assessmentErrorResponse(error);
  }
}
