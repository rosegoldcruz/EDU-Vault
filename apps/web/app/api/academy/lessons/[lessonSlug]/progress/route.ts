import { NextRequest, NextResponse } from "next/server";

import {
  completeLesson,
  getLessonLearningState,
  LearningError,
  startLesson,
} from "@/lib/server/learning-service";
import { syncCanonicalMember } from "@/lib/server/identity-service";
import { requirePrivyUser } from "@/lib/server/privy-auth";

function assertSameOrigin(request: NextRequest): void {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const expectedHost = request.headers.get("x-forwarded-host")
    ?? request.headers.get("host");
  if (!expectedHost || new URL(origin).host !== expectedHost) {
    throw new LearningError(
      "Cross-origin request rejected.",
      403,
      "ORIGIN_REJECTED",
    );
  }
}

async function activeMember(request: NextRequest) {
  let identity: Awaited<ReturnType<typeof requirePrivyUser>>;
  try {
    identity = await requirePrivyUser(request);
  } catch {
    throw new LearningError(
      "Sign in to save lesson progress.",
      401,
      "AUTHENTICATION_REQUIRED",
    );
  }
  const member = await syncCanonicalMember(identity);
  if (member.status !== "active") {
    throw new LearningError(
      "This member account is not active.",
      403,
      "MEMBER_NOT_ACTIVE",
    );
  }
  return member;
}

function errorResponse(error: unknown): NextResponse {
  if (error instanceof LearningError) {
    return NextResponse.json(
      { ok: false, code: error.code, error: error.message },
      { status: error.status },
    );
  }
  console.error("[academy-progress] request failed", {
    message: error instanceof Error ? error.message : "Unknown error",
  });
  return NextResponse.json(
    { ok: false, code: "INTERNAL_ERROR", error: "Request failed." },
    { status: 500 },
  );
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ lessonSlug: string }> },
) {
  try {
    const member = await activeMember(request);
    const { lessonSlug } = await context.params;
    const state = await getLessonLearningState({
      memberId: member.id,
      lessonSlug,
    });
    return NextResponse.json({ ok: true, state });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ lessonSlug: string }> },
) {
  try {
    assertSameOrigin(request);
    const member = await activeMember(request);
    const { lessonSlug } = await context.params;
    const body = await request.json() as { action?: unknown };
    if (body.action !== "start" && body.action !== "complete") {
      throw new LearningError(
        "Unsupported progress action.",
        400,
        "INVALID_ACTION",
      );
    }
    const state = body.action === "complete"
      ? await completeLesson({ memberId: member.id, lessonSlug })
      : await startLesson({ memberId: member.id, lessonSlug });
    return NextResponse.json({ ok: true, state });
  } catch (error) {
    return errorResponse(error);
  }
}
