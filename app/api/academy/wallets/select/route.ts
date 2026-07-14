import { z } from "zod";
import { getDb } from "@/db";
import { selectWallet } from "@/lib/academy/service";
import { requireApiUser } from "@/lib/auth/privy";
import { apiRoute } from "@/lib/http";

const input = z.object({
  walletId: z.string().uuid(),
  selection: z.enum(["PRIMARY", "REWARD"]),
});

export async function POST(request: Request) {
  return apiRoute(async () => {
    const user = await requireApiUser(request);
    const payload = input.parse(await request.json());
    return selectWallet(getDb(), user, payload.walletId, payload.selection);
  });
}
