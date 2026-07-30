import { NextResponse } from "next/server";
import { getPaymentsPool } from "@/lib/server/payments-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await getPaymentsPool().query("SELECT 1");
    return NextResponse.json({ ok: true, service: "iron-vault-web" });
  } catch {
    return NextResponse.json({ ok: false, service: "iron-vault-web" }, { status: 503 });
  }
}
