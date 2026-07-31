import crypto from "node:crypto";

type AuthorizeEnvironment = "sandbox" | "production";

function getAuthorizeEnvironment(): AuthorizeEnvironment {
  return process.env.AUTHORIZE_NET_ENVIRONMENT?.trim().toLowerCase() === "production"
    ? "production"
    : "sandbox";
}

function requireCredential(name: "AUTHORIZE_NET_API_LOGIN_ID" | "AUTHORIZE_NET_TRANSACTION_KEY"): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function getAcceptHostedFormUrl(): string {
  return getAuthorizeEnvironment() === "production"
    ? "https://accept.authorize.net/payment/payment"
    : "https://test.authorize.net/payment/payment";
}

export async function createAcceptHostedToken(input: {
  providerReferenceId: string;
  amountCents: number;
  email: string;
  description: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const apiUrl = getAuthorizeEnvironment() === "production"
    ? "https://api.authorize.net/xml/v1/request.api"
    : "https://apitest.authorize.net/xml/v1/request.api";

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      getHostedPaymentPageRequest: {
        merchantAuthentication: {
          name: requireCredential("AUTHORIZE_NET_API_LOGIN_ID"),
          transactionKey: requireCredential("AUTHORIZE_NET_TRANSACTION_KEY"),
        },
        refId: input.providerReferenceId,
        transactionRequest: {
          transactionType: "authCaptureTransaction",
          amount: (input.amountCents / 100).toFixed(2),
          order: {
            invoiceNumber: input.providerReferenceId,
            description: input.description.slice(0, 255),
          },
          customer: { email: input.email },
        },
        hostedPaymentSettings: {
          setting: [
            {
              settingName: "hostedPaymentReturnOptions",
              settingValue: JSON.stringify({
                showReceipt: true,
                url: input.successUrl,
                urlText: "Return to Iron Vault",
                cancelUrl: input.cancelUrl,
                cancelUrlText: "Cancel",
              }),
            },
            {
              settingName: "hostedPaymentButtonOptions",
              settingValue: JSON.stringify({ text: "Pay" }),
            },
            {
              settingName: "hostedPaymentPaymentOptions",
              settingValue: JSON.stringify({
                cardCodeRequired: true,
                showCreditCard: true,
                showBankAccount: false,
              }),
            },
            {
              settingName: "hostedPaymentShippingAddressOptions",
              settingValue: JSON.stringify({ show: false, required: false }),
            },
            {
              settingName: "hostedPaymentCustomerOptions",
              settingValue: JSON.stringify({ showEmail: true, requiredEmail: true }),
            },
            {
              settingName: "hostedPaymentOrderOptions",
              settingValue: JSON.stringify({ show: true, merchantName: "Iron Vault" }),
            },
          ],
        },
      },
    }),
  });

  const result = await response.json().catch(() => null) as {
    token?: string;
    messages?: { resultCode?: string; message?: Array<{ code?: string; text?: string }> };
  } | null;

  if (!response.ok || result?.messages?.resultCode !== "Ok" || !result.token) {
    const message = result?.messages?.message?.[0]?.text ?? "Authorize.Net hosted checkout request failed";
    throw new Error(message);
  }

  return result.token;
}

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

  const normalizedHeader = signatureHeader.trim().toLowerCase();
  const normalizedKey = signatureKey.trim();
  if (!/^[a-fA-F0-9]+$/.test(normalizedKey) || normalizedKey.length % 2 !== 0) {
    return false;
  }

  const hmac = crypto
    .createHmac("sha512", Buffer.from(normalizedKey, "hex"))
    .update(rawBody, "utf8")
    .digest("hex")
    .toLowerCase();

  const expected = `sha512=${hmac}`;
  return timingSafeEqualText(normalizedHeader, expected);
}

export function extractProviderReferenceId(
  payload: Record<string, unknown> | undefined,
): string | null {
  if (!payload) {
    return null;
  }

  if (typeof payload.merchantReferenceId === "string") return payload.merchantReferenceId;
  const order = payload.order as Record<string, unknown> | undefined;
  return typeof order?.invoiceNumber === "string" ? order.invoiceNumber : null;
}

export function extractProviderTransactionId(
  payload: Record<string, unknown> | undefined,
): string | null {
  return typeof payload?.id === "string" ? payload.id : null;
}

export function isSuccessfulPaymentEvent(eventType: string): boolean {
  return [
    "net.authorize.payment.authcapture.created",
    "net.authorize.payment.capture.created",
    "net.authorize.payment.fraud.approved",
  ].includes(eventType);
}
