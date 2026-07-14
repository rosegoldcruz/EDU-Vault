import { getDb } from "@/db";
import { getAcademyState } from "@/lib/academy/service";
import { requireApiUser } from "@/lib/auth/privy";
import { apiRoute } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return apiRoute(async () => {
    const user = await requireApiUser(request);
    return getAcademyState(getDb(), user.id);
  });
}
