import type { DatabaseSync } from "node:sqlite";
import { assignmentRowSchema, type AssignmentRow } from "./schema";

/**
 * Reads one student's assignments.
 *
 * The student id is a bound parameter of the WHERE clause, so the filter is part
 * of the query rather than a post-processing step a caller could forget. Rows
 * come back untyped from `node:sqlite`, so each one is parsed through Zod before
 * it can reach application code — the cast happens once, here, not at every
 * call site.
 */
export function selectAssignmentsByStudent(
  db: DatabaseSync,
  studentId: string
): AssignmentRow[] {
  const rows = db
    .prepare(
      `SELECT id, student_id, title, due_at, submitted_at
         FROM assignments
        WHERE student_id = ?
        ORDER BY id ASC`
    )
    .all(studentId);

  return rows.map((row) => assignmentRowSchema.parse(row));
}
