import { NextRequest, NextResponse } from "next/server";

import { AssessmentError } from "@/lib/server/assessment-service";

export const ATTEMPT_COOKIE = "iv-entry-attempt";
export const VISITOR_COOKIE = "iv-visitor";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function assertSameOrigin(request: NextRequest): void {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const expectedHost = request.headers.get("x-forwarded-host")
    ?? request.headers.get("host");
  if (!expectedHost || new URL(origin).host !== expectedHost) {
    throw new AssessmentError(
      "Cross-origin request rejected.",
      403,
      "ORIGIN_REJECTED",
    );
  }
}

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function assessmentErrorResponse(error: unknown): NextResponse {
  if (error instanceof AssessmentError) {
    return NextResponse.json(
      { ok: false, code: error.code, error: error.message },
      { status: error.status },
    );
  }
  console.error("[entry-test] request failed", {
    message: error instanceof Error ? error.message : "Unknown error",
  });
  return NextResponse.json(
    { ok: false, code: "INTERNAL_ERROR", error: "Request failed." },
    { status: 500 },
  );
}
