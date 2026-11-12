import { ASSIGNMENTS } from "./assignments";
import { SIMULATED_NOW } from "./now";
import { toView } from "./status";
import type { AssignmentView } from "./types";

/**
 * The single read path for assignment data.
 *
 * Filtering happens here, on the server, against the authenticated student id —
 * never in a component and never on an id supplied by the caller. Anything that
 * needs assignment data goes through this function, so there is exactly one
 * place where cross-student leakage could happen, and it is covered by tests.
 */
export function getAssignmentsForStudent(
  studentId: string,
  now: number = SIMULATED_NOW
): AssignmentView[] {
  return ASSIGNMENTS.filter(
    (assignment) => assignment.studentId === studentId
  ).map((assignment) => toView(assignment, now));
}
