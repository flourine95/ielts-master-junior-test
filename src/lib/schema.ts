import { z } from "zod";

/**
 * Every timestamp in this app is ISO-8601 **with an explicit UTC offset**.
 *
 * `z.iso.datetime({ offset: true })` rejects `"2026-11-13T23:59:00"` (no offset)
 * and `"2026-11-13"` alike. Without that rule, `Date.parse` would silently read
 * an offset-less string in the server's own timezone, which is exactly the bug
 * this exercise is built around. Validating at the boundary means the rest of
 * the code can treat instants as trustworthy.
 */
export const instantSchema = z.iso.datetime({ offset: true });

/**
 * A row exactly as it comes out of SQLite. `node:sqlite` returns untyped values,
 * so this schema is what turns `unknown[]` into something the compiler can see.
 */
export const assignmentRowSchema = z.object({
  id: z.string().min(1),
  student_id: z.string().min(1),
  title: z.string().min(1),
  due_at: instantSchema,
  submitted_at: instantSchema.nullable(),
});

/** What the service is allowed to hand to the UI. */
export const assignmentViewSchema = z.object({
  id: z.string(),
  title: z.string(),
  dueAt: instantSchema,
  dueAtLabel: z.string(),
  submittedAt: instantSchema.nullable(),
  submittedAtLabel: z.string().nullable(),
  status: z.enum(["not-submitted", "overdue", "submitted", "late-submission"]),
  statusLabel: z.enum(["Chưa nộp", "Quá hạn", "Đã nộp"]),
  late: z.boolean(),
});

/** The wire contract for GET /api/assignments, asserted in tests. */
export const assignmentsResponseSchema = z.object({
  viewer: z.object({ name: z.string() }),
  simulatedNow: instantSchema,
  assignments: z.array(assignmentViewSchema),
});

export type AssignmentRow = z.infer<typeof assignmentRowSchema>;
export type AssignmentView = z.infer<typeof assignmentViewSchema>;
export type AssignmentsResponse = z.infer<typeof assignmentsResponseSchema>;
export type SubmissionState = AssignmentView["status"];
