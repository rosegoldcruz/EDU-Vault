import { z } from "zod";
import { getDb } from "@/db";
import { createWalletChallenge } from "@/lib/academy/service";
import { requireApiUser } from "@/lib/auth/privy";
import { apiRoute } from "@/lib/http";

const input = z.object({ address: z.string().min(32).max(64) });

export async function POST(request: Request) {
  return apiRoute(async () => {
    const user = await requireApiUser(request);
    const payload = input.parse(await request.json());
    return createWalletChallenge(
      getDb(),
      user,
      payload.address,
      new URL(request.url).origin,
    );
  });
}
