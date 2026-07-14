import { getDb } from "@/db";
import { getAdminInspection } from "@/lib/academy/service";
import { requireApiUser } from "@/lib/auth/privy";
import { apiRoute } from "@/lib/http";

export async function GET(request: Request) {
  return apiRoute(async () => {
    const user = await requireApiUser(request);
    return getAdminInspection(getDb(), user);
  });
}
