import { PrivyClient, type LinkedAccount, type User } from "@privy-io/node";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { syncAcademyUser, type VerifiedIdentity } from "@/lib/academy/service";

let privy: PrivyClient | null = null;

export class AuthenticationError extends Error {
  constructor(message = "Your authentication session is invalid or expired.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

function getPrivyClient() {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error(
      "Privy is not configured. Set NEXT_PUBLIC_PRIVY_APP_ID and PRIVY_APP_SECRET.",
    );
  }
  if (!privy) {
    privy = new PrivyClient({
      appId,
      appSecret,
      jwtVerificationKey: process.env.PRIVY_VERIFICATION_KEY,
    });
  }
  return privy;
}

function stringValue(account: Record<string, unknown>, key: string) {
  const value = account[key];
  return typeof value === "string" && value ? value : null;
}

function linkedAccountIdentity(account: LinkedAccount) {
  const value = account as unknown as Record<string, unknown>;
  const type = String(account.type);
  const address = stringValue(value, "address");
  const identifier =
    address ??
    stringValue(value, "address") ??
    stringValue(value, "subject") ??
    stringValue(value, "phone_number") ??
    stringValue(value, "username") ??
    stringValue(value, "custom_user_id") ??
    stringValue(value, "telegram_user_id") ??
    stringValue(value, "public_key");
  if (!identifier) return null;
  const walletClient = stringValue(value, "wallet_client_type");
  return {
    type,
    provider: walletClient ?? type,
    identifier,
    address: address ?? undefined,
    chainType: stringValue(value, "chain_type") ?? undefined,
    embedded:
      stringValue(value, "connector_type") === "embedded" ||
      walletClient === "privy",
  };
}

function mapPrivyUser(user: User): VerifiedIdentity {
  const accounts = user.linked_accounts;
  const emailAccount = accounts.find((account) => account.type === "email") as
    | (LinkedAccount & { address?: string })
    | undefined;
  const profile = accounts.find((account) => {
    const value = account as unknown as Record<string, unknown>;
    return typeof value.name === "string" || typeof value.username === "string";
  }) as unknown as Record<string, unknown> | undefined;
  return {
    privyUserId: user.id,
    email: emailAccount?.address ?? null,
    displayName:
      (profile && (stringValue(profile, "name") ?? stringValue(profile, "username"))) ??
      emailAccount?.address ??
      null,
    linkedAccounts: accounts
      .map(linkedAccountIdentity)
      .filter((account): account is NonNullable<typeof account> => Boolean(account)),
  };
}

function bearerToken(request: Request) {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    const token = header.slice(7).trim();
    return token && token !== "null" && token !== "undefined" ? token : null;
  }
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("privy-token="));
  return cookie ? decodeURIComponent(cookie.slice("privy-token=".length)) : null;
}

export async function authenticateRequest(request: Request) {
  const token = bearerToken(request);
  if (!token) return null;
  const client = getPrivyClient();
  let verifiedUserId: string;
  let privyUser: User;
  try {
    const verified = await client.utils().auth().verifyAccessToken(token);
    verifiedUserId = verified.user_id;
    const identityToken = request.headers.get("privy-id-token");
    privyUser = identityToken
      ? await client.users().get({ id_token: identityToken })
      : await client.users()._get(verifiedUserId);
  } catch {
    throw new AuthenticationError();
  }
  if (privyUser.id !== verifiedUserId) {
    throw new AuthenticationError("Privy access and identity tokens do not match.");
  }
  return syncAcademyUser(getDb(), mapPrivyUser(privyUser));
}

export async function requireApiUser(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) throw new AuthenticationError("Authentication required.");
    return user;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw new Response(error.message, { status: 401 });
    }
    throw error;
  }
}

export async function requirePageUser(returnTo: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("privy-token")?.value;
  if (!token) redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  const requestHeaders = await headers();
  const origin = requestHeaders.get("host") ?? "localhost";
  const request = new Request(`https://${origin}${returnTo}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  try {
    const user = await authenticateRequest(request);
    if (!user) redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
    return user;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      redirect(`/refresh?returnTo=${encodeURIComponent(returnTo)}`);
    }
    throw error;
  }
}

export function getPublicPrivyAppId() {
  return process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? null;
}
