import { getDatabase } from "./db";
import { selectAssignmentsByStudent } from "./assignment-repository";
import { SIMULATED_NOW } from "./now";
import { toView } from "./status";
import type { AssignmentView } from "./schema";

/**
 * The single read path for assignment data, used by both the page and the API.
 *
 * Filtering happens in SQL against the authenticated student id — never in a
 * component, never on an id supplied by the caller. Anything that needs
 * assignment data goes through here, so there is exactly one place where
 * cross-student leakage could happen, and it is covered by tests.
 */
export function getAssignmentsForStudent(
  studentId: string,
  now: number = SIMULATED_NOW
): AssignmentView[] {
  return selectAssignmentsByStudent(getDatabase(), studentId).map((row) =>
    toView(row, now)
  );
}
