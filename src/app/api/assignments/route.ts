import { NextResponse } from "next/server";
import { getAssignmentsForStudent } from "@/lib/assignment-service";
import { getSession } from "@/lib/session";
import { SIMULATED_NOW_ISO } from "@/lib/now";
import { assignmentsResponseSchema } from "@/lib/schema";

/**
 * GET /api/assignments
 *
 * The response is scoped to whoever the server says is signed in. Query
 * parameters are read for nothing: `?studentId=S02` changes nothing, which is
 * the point. The body carries no `studentId`, so the payload itself cannot be
 * replayed to fetch another student.
 *
 * The payload is validated on the way out, so the shape advertised here and the
 * shape the tests assert cannot drift apart silently.
 */
export async function GET() {
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
