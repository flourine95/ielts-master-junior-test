import { ASSIGNMENTS } from "./assignments";
import { SIMULATED_NOW } from "./now";
import { toView } from "./status";
import type { AssignmentView } from "./schema";

/**
 * The single read path for assignment data, used by both the page and the API.
 *
 * Filtering happens here, against the authenticated student id — never in a
 * component, never on an id supplied by the caller. Anything that needs
 * assignment data goes through this function, so there is exactly one place
 * where cross-student leakage could happen, and it is covered by tests.
 *
 * Deliberately an in-memory array: the brief says no real database is required,
 * and a two-query store adds an install step (and a Node version requirement)
 * without changing a single line of the status logic or the UI.
 */
export function getAssignmentsForStudent(
  studentId: string,
  now: number = SIMULATED_NOW
): AssignmentView[] {
  return ASSIGNMENTS.filter(
    (assignment) => assignment.studentId === studentId
  ).map((assignment) => toView(assignment, now));
}
