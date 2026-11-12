/** A row of the fixture table, as stored. */
export type Assignment = {
  id: string;
  studentId: string;
  title: string;
  /** ISO-8601 with explicit offset, e.g. "2026-11-13T23:59:00+07:00". */
  dueAt: string;
  /** null = not submitted yet. */
  submittedAt: string | null;
};

export type SubmissionState =
  | "not-submitted"
  | "overdue"
  | "submitted"
  | "late-submission";

/** What the service returns to the API and the page. No cross-student fields. */
export type AssignmentView = {
  id: string;
  title: string;
  dueAt: string;
  dueAtLabel: string;
  submittedAt: string | null;
  submittedAtLabel: string | null;
  status: SubmissionState;
  /** "Đã nộp" | "Chưa nộp" | "Quá hạn" */
  statusLabel: string;
  /** true only when the submission happened after the deadline. */
  late: boolean;
};
