import { z } from "zod";

/**
 * Every timestamp in this app is ISO-8601 **with an explicit UTC offset**.
 *
 * `z.iso.datetime({ offset: true })` rejects `"2026-11-13T23:59:00"` (no offset)
 * and `"2026-11-13"` alike. Without that rule, `Date.parse` would silently read
 * an offset-less string in the server's own timezone, which is exactly the bug
 * this exercise is built around.
 */
export const instantSchema = z.iso.datetime({ offset: true });

/**
 * One seeded assignment, exactly as the brief's table represents it.
 *
 * `studentId` lives here and nowhere else: it is used to filter, then dropped.
 * The view type below is what callers receive, and it carries no identity field,
 * so a payload can never be replayed against another student.
 */
export const assignmentSchema = z.object({
  id: z.string().min(1),
  studentId: z.string().min(1),
  title: z.string().min(1),
  dueAt: instantSchema,
  submittedAt: instantSchema.nullable(),
});

export const submissionStateSchema = z.enum([
  "not-submitted",
  "overdue",
  "submitted",
  "late-submission",
]);

/**
 * What the service is allowed to hand to the UI.
 *
 * `strictObject`, not `object`: Zod's default strips unknown keys, which would
 * turn a leaked `studentId` into a silently-clean payload. Strict makes the same
 * mistake throw at the boundary, so the leak is visible in the response and in
 * the tests rather than quietly removed.
 */
export const assignmentViewSchema = z.strictObject({
  id: z.string(),
  title: z.string(),
  dueAt: instantSchema,
  dueAtLabel: z.string(),
  submittedAt: instantSchema.nullable(),
  submittedAtLabel: z.string().nullable(),
  status: submissionStateSchema,
  statusLabel: z.enum(["Chưa nộp", "Quá hạn", "Đã nộp"]),
  late: z.boolean(),
});

/** The wire contract for GET /api/assignments, asserted in tests. */
export const assignmentsResponseSchema = z.strictObject({
  viewer: z.strictObject({ name: z.string() }),
  simulatedNow: instantSchema,
  assignments: z.array(assignmentViewSchema),
});

export type Assignment = z.infer<typeof assignmentSchema>;
export type AssignmentView = z.infer<typeof assignmentViewSchema>;
export type SubmissionState = z.infer<typeof submissionStateSchema>;
