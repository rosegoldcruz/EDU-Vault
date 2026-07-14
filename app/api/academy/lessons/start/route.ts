import { z } from "zod";
import { getDb } from "@/db";
import { startLesson } from "@/lib/academy/service";
import { requireApiUser } from "@/lib/auth/privy";
import { apiRoute } from "@/lib/http";

const input = z.object({ lessonSlug: z.string().min(1).max(120) });

export async function POST(request: Request) {
  return apiRoute(async () => {
    const user = await requireApiUser(request);
    const payload = input.parse(await request.json());
    return startLesson(getDb(), user, payload.lessonSlug);
  });
}
