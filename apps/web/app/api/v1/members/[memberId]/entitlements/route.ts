import { NextRequest, NextResponse } from "next/server";
import { requirePrivyUser } from "@/lib/server/privy-auth";
import { getPaymentsPool } from "@/lib/server/payments-db";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> },
) {
  try {
    await requirePrivyUser(request);
  } catch {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { memberId } = await params;

  const result = await getPaymentsPool().query<{
    entitlement_key: string;
    active: boolean;
    created_at: string;
  }>(
    `
      SELECT entitlement_key, active, created_at
      FROM entitlements
      WHERE member_id = $1
      ORDER BY created_at DESC
    `,
    [memberId],
  );

  return NextResponse.json({
    memberId,
    entitlements: result.rows,
  });
}
