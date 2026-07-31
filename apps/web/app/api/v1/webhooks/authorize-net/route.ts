import crypto from "node:crypto";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  extractProviderReferenceId,
  extractProviderTransactionId,
  isSuccessfulPaymentEvent,
  verifyAuthorizeNetSignature,
} from "@/lib/server/authorize-net";
import { withPaymentsTransaction } from "@/lib/server/payments-db";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

export const dynamic = "force-dynamic";

const webhookSchema = z
  .object({
    notificationId: z.string().optional(),
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
  const providerReferenceId = extractProviderReferenceId(payload);
  const providerTransactionId = extractProviderTransactionId(payload);
  let duplicate = false;
  let entitlementGrant: {
    memberId: string;
    email: string;
    entitlementKey: string;
  } | null = null;

  await withPaymentsTransaction(async (client) => {
    const notificationResult = await client.query(
      `
        INSERT INTO gateway_notifications (id, provider, provider_notification_id, event_type, signature_valid, checkout_session_id, payload)
        VALUES ($1, 'authorize-net', $2, $3, $4, $5, $6::jsonb)
        ON CONFLICT (provider, provider_notification_id) DO NOTHING
      `,
      [
        crypto.randomUUID(),
        webhook.notificationId ?? crypto.randomUUID(),
        webhook.eventType,
        signatureValid,
        providerReferenceId,
        rawBody,
      ],
    );

    if (notificationResult.rowCount === 0) {
      duplicate = true;
    }

    if (!signatureValid) {
      await client.query(
        `
          INSERT INTO audit_events (id, event_type, actor, subject_type, subject_id, payload)
          VALUES ($1, 'payment.webhook.rejected', 'authorize-net', 'gateway_notification', $2, $3::jsonb)
        `,
        [crypto.randomUUID(), providerReferenceId ?? "unknown", JSON.stringify({ reason: "invalid-signature" })],
      );
      return;
    }

    if (!providerReferenceId || !providerTransactionId) {
      await client.query(
        `
          INSERT INTO audit_events (id, event_type, actor, subject_type, subject_id, payload)
          VALUES ($1, 'payment.webhook.ignored', 'authorize-net', 'gateway_notification', 'missing-session', $2::jsonb)
        `,
        [crypto.randomUUID(), JSON.stringify({ eventType: webhook.eventType, reason: "missing-reference" })],
      );
      return;
    }

    const paymentResult = await client.query<{
      id: string;
      member_id: string;
      email: string;
      product_id: string;
      provider_payment_id: string | null;
      entitlement_key: string;
      amount_cents: number;
    }>(
      `
        SELECT p.id, p.member_id, p.email, p.product_id, p.provider_payment_id, p.amount_cents, pr.entitlement_key
        FROM payments p
        JOIN products pr ON pr.id = p.product_id
        WHERE p.provider_session_id = $1
        LIMIT 1
      `,
      [providerReferenceId],
    );

    if (paymentResult.rowCount === 0) {
      await client.query(
        `
          INSERT INTO audit_events (id, event_type, actor, subject_type, subject_id, payload)
          VALUES ($1, 'payment.webhook.unmatched', 'authorize-net', 'checkout_session', $2, $3::jsonb)
        `,
        [crypto.randomUUID(), providerReferenceId, JSON.stringify({ eventType: webhook.eventType })],
      );
      return;
    }

    const payment = paymentResult.rows[0];

    const responseCode = Number(payload?.responseCode);
    const authAmountCents = Math.round(Number(payload?.authAmount) * 100);
    const paymentMatches = responseCode === 1
      && Number.isFinite(authAmountCents)
      && authAmountCents === payment.amount_cents;

    if (isSuccessfulPaymentEvent(webhook.eventType) && paymentMatches) {
      await client.query(
        `
          UPDATE payments
          SET status = 'paid',
              paid_at = COALESCE(paid_at, NOW()),
              provider_payment_id = COALESCE(provider_payment_id, $2)
          WHERE id = $1
        `,
        [payment.id, providerTransactionId],
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
        [crypto.randomUUID(), payment.id, JSON.stringify({ providerReferenceId, providerTransactionId, eventType: webhook.eventType })],
      );
      entitlementGrant = {
        memberId: payment.member_id,
        email: payment.email,
        entitlementKey: payment.entitlement_key,
      };
    } else if (isSuccessfulPaymentEvent(webhook.eventType)) {
      await client.query(
        `
          INSERT INTO audit_events (id, event_type, actor, subject_type, subject_id, payload)
          VALUES ($1, 'payment.webhook.rejected', 'authorize-net', 'payment', $2, $3::jsonb)
        `,
        [crypto.randomUUID(), payment.id, JSON.stringify({ reason: "payment-mismatch", eventType: webhook.eventType })],
      );
    }
  });

  if (!signatureValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (entitlementGrant) {
    const grant = entitlementGrant as {
      memberId: string;
      email: string;
      entitlementKey: string;
    };
    const { error } = await getSupabaseAdmin()
      .from("iv_member_entitlements")
      .upsert(
        {
          privy_user_id: grant.memberId,
          email: grant.email,
          source: "authorize_net",
          status: "active",
          payment_provider: "authorize-net",
          provider_checkout_session_id: providerReferenceId,
          provider_payment_id: providerTransactionId,
          metadata: {
            access_type: "all_modules",
            reward_track: "full_academy",
            entitlement_key: grant.entitlementKey,
          },
        },
        { onConflict: "provider_checkout_session_id" },
      );

    if (error) {
      console.error("[authorize-net/webhook] entitlement sync failed", {
        code: error.code,
        message: error.message,
      });
      return NextResponse.json({ error: "Entitlement synchronization failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ accepted: true, duplicate }, { status: 200 });
}
