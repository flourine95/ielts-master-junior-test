import { NextResponse } from "next/server";
import { getAssignmentsForStudent } from "@/lib/assignment-service";
import { getSession } from "@/lib/session";
import { SIMULATED_NOW_ISO } from "@/lib/now";

/**
 * GET /api/assignments
 *
 * The response is scoped to whoever the server says is signed in. Query
 * parameters are read for nothing: `?studentId=S02` changes nothing, which is
 * the point. The body also carries no `studentId` field, so the payload itself
 * cannot be replayed to fetch another student.
 */
export async function GET() {
  const session = await getSession();
  const assignments = getAssignmentsForStudent(session.studentId);

  return NextResponse.json(
    {
      viewer: { name: session.name },
      simulatedNow: SIMULATED_NOW_ISO,
      assignments,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
