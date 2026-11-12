import { parseInstant, formatVietnamTime } from "./instant";
import type { Assignment, AssignmentView } from "./schema";

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
  assignment: Pick<Assignment, "dueAt" | "submittedAt">,
  now: number
): Pick<AssignmentView, "status" | "statusLabel" | "late"> {
  const due = parseInstant(assignment.dueAt);

  if (assignment.submittedAt !== null) {
    const late = parseInstant(assignment.submittedAt) > due;
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
 * Narrows a stored assignment into what the UI is allowed to see: no
 * `studentId`, and timestamps pre-formatted in GMT+7 so no component does date
 * maths.
 */
export function toView(assignment: Assignment, now: number): AssignmentView {
  return {
    id: assignment.id,
    title: assignment.title,
    dueAt: assignment.dueAt,
    dueAtLabel: formatVietnamTime(parseInstant(assignment.dueAt)),
    submittedAt: assignment.submittedAt,
    submittedAtLabel:
      assignment.submittedAt === null
        ? null
        : formatVietnamTime(parseInstant(assignment.submittedAt)),
    ...getStatus(assignment, now),
  };
}
