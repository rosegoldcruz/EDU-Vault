import { z } from "zod";
import { getDb } from "@/db";
import { verifyWalletChallenge } from "@/lib/academy/service";
import { requireApiUser } from "@/lib/auth/privy";
import { apiRoute } from "@/lib/http";

const input = z.object({
  challengeId: z.string().uuid(),
  signature: z.string().min(80).max(120),
});

export async function POST(request: Request) {
  return apiRoute(async () => {
    const user = await requireApiUser(request);
    const payload = input.parse(await request.json());
    return verifyWalletChallenge(
      getDb(),
      user,
      payload.challengeId,
      payload.signature,
    );
  });
}
