import { NextResponse } from "next/server";
import { getAssignmentsForStudent } from "@/lib/assignment-service";
import { getSession } from "@/lib/session";
import { SIMULATED_NOW_ISO } from "@/lib/now";
import { assignmentsResponseSchema } from "@/lib/schema";

/**
 * GET /api/assignments
 *
 * The response is scoped to S01, resolved on the server. Nothing in the request
 * is read: the parameter is accepted and deliberately unused, so a reader can
 * see that no query string, header, cookie or body reaches the query. A body
 * `studentId` would have nowhere to go — the payload carries none.
 *
 * The payload is validated on the way out (`strictObject`), so an accidental
 * extra field fails the request instead of being stripped and shipped.
 */
export async function GET(_request: Request) {
  const session = await getSession();

  const payload = assignmentsResponseSchema.parse({
    viewer: { name: session.name },
    simulatedNow: SIMULATED_NOW_ISO,
    assignments: getAssignmentsForStudent(session.studentId),
  });

  return NextResponse.json(payload, {
    headers: { "Cache-Control": "no-store" },
  });
}
