import { parseInstant, formatVietnamTime } from "./instant";
import type { AssignmentRow, AssignmentView } from "./schema";

/**
 * Maps one assignment to its status, given a reference instant.
 *
 * `now` is a parameter rather than a `Date.now()` call so the rule is pure and
 * directly testable against the fixed 11/11/2026 09:00 reference point.
 *
 * Order matters: a submitted assignment is never "Quá hạn". A late submission is
 * still "Đã nộp", with the late flag carried alongside it. Boundaries are
 * inclusive — submitting exactly at the deadline is on time, and `now` exactly
 * at the deadline is not yet overdue (`>` not `>=`).
 */
export function getStatus(
  assignment: Pick<AssignmentRow, "due_at" | "submitted_at">,
  now: number
): Pick<AssignmentView, "status" | "statusLabel" | "late"> {
  const due = parseInstant(assignment.due_at);

  if (assignment.submitted_at !== null) {
    const late = parseInstant(assignment.submitted_at) > due;
    return {
      status: late ? "late-submission" : "submitted",
      statusLabel: "Đã nộp",
      late,
    };
  }

  if (now > due) {
    return { status: "overdue", statusLabel: "Quá hạn", late: false };
  }

  return { status: "not-submitted", statusLabel: "Chưa nộp", late: false };
}

/**
 * Narrows a stored row into what the UI is allowed to see: no `student_id`, and
 * timestamps pre-formatted in GMT+7 so no component does date maths.
 */
export function toView(row: AssignmentRow, now: number): AssignmentView {
  return {
    id: row.id,
    title: row.title,
    dueAt: row.due_at,
    dueAtLabel: formatVietnamTime(parseInstant(row.due_at)),
    submittedAt: row.submitted_at,
    submittedAtLabel:
      row.submitted_at === null
        ? null
        : formatVietnamTime(parseInstant(row.submitted_at)),
    ...getStatus(row, now),
  };
}
