import crypto from "node:crypto";

function timingSafeEqualText(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  return crypto.timingSafeEqual(left, right);
}

export function verifyAuthorizeNetSignature(
  rawBody: string,
  signatureHeader: string,
  signatureKey: string,
): boolean {
  if (!signatureKey || !signatureHeader) {
    return false;
  }

  const normalizedHeader = signatureHeader.toLowerCase();
  const normalizedKey = signatureKey.trim();

  const hmac = crypto
    .createHmac("sha512", Buffer.from(normalizedKey, "hex"))
    .update(rawBody, "utf8")
    .digest("hex")
    .toLowerCase();

  const expected = `sha512=${hmac}`;
  return timingSafeEqualText(normalizedHeader, expected);
}

export function extractCheckoutSessionId(
  payload: Record<string, unknown> | undefined,
): string | null {
  if (!payload) {
    return null;
  }

  const order = payload.order as Record<string, unknown> | undefined;
  const invoice = typeof order?.invoiceNumber === "string" ? order.invoiceNumber : null;
  return invoice;
}

export function isSuccessfulPaymentEvent(eventType: string): boolean {
  return [
    "net.authorize.payment.authcapture.created",
    "net.authorize.payment.capture.created",
    "net.authorize.payment.fraud.approved",
  ].includes(eventType);
}
