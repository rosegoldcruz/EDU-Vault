import crypto from "node:crypto";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createAcceptHostedToken, getAcceptHostedFormUrl } from "@/lib/server/authorize-net";
import { getPaymentsPool, withPaymentsTransaction } from "@/lib/server/payments-db";
import { requirePrivyUser } from "@/lib/server/privy-auth";

export const dynamic = "force-dynamic";

const checkoutSchema = z.object({
  productCode: z.string().min(2),
  successPath: z.string().startsWith("/").optional(),
  cancelPath: z.string().startsWith("/").optional(),
});

export async function POST(request: NextRequest) {
  let auth: Awaited<ReturnType<typeof requirePrivyUser>>;
  try {
    auth = await requirePrivyUser(request);
  } catch {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (!auth.email) {
    return NextResponse.json({ error: "An email address is required for checkout" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid checkout payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const payload = parsed.data;

  const productResult = await getPaymentsPool().query<{
    id: string;
    code: string;
    name: string;
    amount_cents: number;
    currency: string;
    entitlement_key: string;
  }>(
    `
      SELECT id, code, name, amount_cents, currency, entitlement_key
      FROM products
      WHERE code = $1
        AND is_active = TRUE
      LIMIT 1
    `,
    [payload.productCode],
  );

  if (productResult.rowCount === 0) {
    return NextResponse.json({ error: "Selected product is not available" }, { status: 404 });
  }

  const product = productResult.rows[0];
  const paymentId = crypto.randomUUID();
  const checkoutSessionId = crypto.randomUUID();
  const providerSessionId = `iv_${crypto.randomBytes(8).toString("hex")}`;
  const webOrigin = process.env.APP_WEB_ORIGIN ?? "https://ironvaulttoken.com";
  const successPath = payload.successPath ?? "/dashboard";
  const cancelPath = payload.cancelPath ?? "/enroll";
  const formToken = await createAcceptHostedToken({
    providerReferenceId: providerSessionId,
    amountCents: product.amount_cents,
    email: auth.email,
    description: product.name,
    successUrl: `${webOrigin}${successPath}?sessionId=${encodeURIComponent(checkoutSessionId)}`,
    cancelUrl: `${webOrigin}${cancelPath}`,
  });

  await withPaymentsTransaction(async (client) => {
    await client.query(
      `
        INSERT INTO payments (
          id,
          member_id,
          email,
          product_id,
          amount_cents,
          currency,
          provider,
          provider_session_id,
          checkout_session_id,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'authorize-net', $7, $8, 'pending')
      `,
      [
        paymentId,
        auth.privyUserId,
        auth.email,
        product.id,
        product.amount_cents,
        product.currency,
        providerSessionId,
        checkoutSessionId,
      ],
    );

    await client.query(
      `
        INSERT INTO audit_events (id, event_type, actor, subject_type, subject_id, payload)
        VALUES ($1, 'payment.checkout.created', $2, 'payment', $3, $4::jsonb)
      `,
      [
        crypto.randomUUID(),
        auth.privyUserId,
        paymentId,
        JSON.stringify({
          productCode: product.code,
          amountCents: product.amount_cents,
          currency: product.currency,
          checkoutSessionId,
        }),
      ],
    );
  });

  return NextResponse.json(
    {
      checkoutSessionId,
      formToken,
      formUrl: getAcceptHostedFormUrl(),
      provider: "authorize-net",
      amountCents: product.amount_cents,
      currency: product.currency,
    },
    { status: 201 },
  );
}
