import crypto from "node:crypto";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  extractCheckoutSessionId,
  isSuccessfulPaymentEvent,
  verifyAuthorizeNetSignature,
} from "@/lib/server/authorize-net";
import { withPaymentsTransaction } from "@/lib/server/payments-db";

export const dynamic = "force-dynamic";

const webhookSchema = z
  .object({
    eventType: z.string(),
    payload: z.record(z.string(), z.any()).optional(),
  })
  .passthrough();

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("x-anet-signature") ?? "";
  const signatureKey = process.env.AUTHORIZE_NET_SIGNATURE_KEY ?? "";

  const signatureValid = verifyAuthorizeNetSignature(rawBody, signatureHeader, signatureKey);

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  const parsed = webhookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  const webhook = parsed.data;
  const payload = (webhook.payload as Record<string, unknown> | undefined) ?? undefined;
  const checkoutSessionId = extractCheckoutSessionId(payload);

  await withPaymentsTransaction(async (client) => {
    await client.query(
      `
        INSERT INTO gateway_notifications (id, provider, event_type, signature_valid, checkout_session_id, payload)
        VALUES ($1, 'authorize-net', $2, $3, $4, $5::jsonb)
      `,
      [
        crypto.randomUUID(),
        webhook.eventType,
        signatureValid,
        checkoutSessionId,
        rawBody,
      ],
    );

    if (!signatureValid) {
      await client.query(
        `
          INSERT INTO audit_events (id, event_type, actor, subject_type, subject_id, payload)
          VALUES ($1, 'payment.webhook.rejected', 'authorize-net', 'gateway_notification', $2, $3::jsonb)
        `,
        [crypto.randomUUID(), checkoutSessionId ?? "unknown", JSON.stringify({ reason: "invalid-signature" })],
      );
      return;
    }

    if (!checkoutSessionId) {
      await client.query(
        `
          INSERT INTO audit_events (id, event_type, actor, subject_type, subject_id, payload)
          VALUES ($1, 'payment.webhook.ignored', 'authorize-net', 'gateway_notification', 'missing-session', $2::jsonb)
        `,
        [crypto.randomUUID(), JSON.stringify({ eventType: webhook.eventType })],
      );
      return;
    }

    const paymentResult = await client.query<{
      id: string;
      member_id: string;
      product_id: string;
      provider_payment_id: string | null;
      entitlement_key: string;
    }>(
      `
        SELECT p.id, p.member_id, p.product_id, p.provider_payment_id, pr.entitlement_key
        FROM payments p
        JOIN products pr ON pr.id = p.product_id
        WHERE p.checkout_session_id = $1
        LIMIT 1
      `,
      [checkoutSessionId],
    );

    if (paymentResult.rowCount === 0) {
      await client.query(
        `
          INSERT INTO audit_events (id, event_type, actor, subject_type, subject_id, payload)
          VALUES ($1, 'payment.webhook.unmatched', 'authorize-net', 'checkout_session', $2, $3::jsonb)
        `,
        [crypto.randomUUID(), checkoutSessionId, JSON.stringify({ eventType: webhook.eventType })],
      );
      return;
    }

    const payment = paymentResult.rows[0];

    if (isSuccessfulPaymentEvent(webhook.eventType)) {
      await client.query(
        `
          UPDATE payments
          SET status = 'paid',
              paid_at = COALESCE(paid_at, NOW()),
              provider_payment_id = COALESCE(provider_payment_id, $2)
          WHERE id = $1
        `,
        [payment.id, checkoutSessionId],
      );

      await client.query(
        `
          INSERT INTO entitlements (id, member_id, entitlement_key, payment_id, source)
          VALUES ($1, $2, $3, $4, 'payment')
          ON CONFLICT (member_id, entitlement_key)
          DO NOTHING
        `,
        [crypto.randomUUID(), payment.member_id, payment.entitlement_key, payment.id],
      );

      await client.query(
        `
          INSERT INTO audit_events (id, event_type, actor, subject_type, subject_id, payload)
          VALUES ($1, 'payment.captured', 'authorize-net', 'payment', $2, $3::jsonb)
        `,
        [crypto.randomUUID(), payment.id, JSON.stringify({ checkoutSessionId, eventType: webhook.eventType })],
      );
    }
  });

  return NextResponse.json({ accepted: true }, { status: 202 });
}
