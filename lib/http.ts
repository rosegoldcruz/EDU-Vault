import { AcademyError } from "@/lib/academy/service";
import { ZodError } from "zod";

export async function apiRoute(handler: () => Promise<unknown>) {
  try {
    return Response.json(await handler());
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof AcademyError) {
      return Response.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }
    if (error instanceof ZodError) {
      return Response.json(
        { error: "The request payload is invalid.", code: "INVALID_INPUT" },
        { status: 400 },
      );
    }
    console.error("Academy API error", error);
    return Response.json(
      { error: "The academy service is temporarily unavailable.", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
