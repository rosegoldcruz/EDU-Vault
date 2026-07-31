import { NextRequest, NextResponse } from "next/server";

import {
  AssessmentError,
  claimEntryTest,
} from "@/lib/server/assessment-service";
import { syncCanonicalMember } from "@/lib/server/identity-service";
import { requirePrivyUser } from "@/lib/server/privy-auth";

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
    let identity: Awaited<ReturnType<typeof requirePrivyUser>>;
    try {
      identity = await requirePrivyUser(request);
    } catch {
      throw new AssessmentError(
        "Sign in to save this result.",
        401,
        "AUTHENTICATION_REQUIRED",
      );
    }
    const member = await syncCanonicalMember(identity);
    if (member.status !== "active") {
      throw new AssessmentError(
        "This member account is not active.",
        403,
        "MEMBER_NOT_ACTIVE",
      );
    }
    const result = await claimEntryTest({
      attemptHandle,
      memberId: member.id,
    });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return assessmentErrorResponse(error);
  }
}
