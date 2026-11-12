import { assignmentSchema, type Assignment } from "./schema";

/**
 * Fixture data, transcribed from the brief.
 *
 * Stored as ISO-8601 with an explicit +07:00 offset so nothing is re-interpreted
 * against the machine's timezone. B01 belongs to S02 and exists precisely so the
 * isolation test has a row it must never return.
 *
 * The array is parsed through the schema at module load, so a typo in a
 * timestamp fails on import instead of producing a wrong badge at runtime.
 */
export const ASSIGNMENTS: readonly Assignment[] = assignmentSchema
  .array()
  .parse([
    {
      id: "A01",
      studentId: "S01",
      title: "Foundation U1 – Reading",
      dueAt: "2026-11-13T23:59:00+07:00",
      submittedAt: null,
    },
    {
      id: "A02",
      studentId: "S01",
      title: "Foundation U2 – Listening",
      dueAt: "2026-11-09T23:59:00+07:00",
      submittedAt: null,
    },
    {
      id: "A03",
      studentId: "S01",
      title: "Foundation U3 – Writing",
      dueAt: "2026-11-10T23:59:00+07:00",
      submittedAt: "2026-11-10T20:00:00+07:00",
    },
    {
      id: "A04",
      studentId: "S01",
      title: "Foundation U4 – Speaking",
      dueAt: "2026-11-08T23:59:00+07:00",
      submittedAt: "2026-11-10T12:00:00+07:00",
    },
    {
      id: "B01",
      studentId: "S02",
      title: "Foundation U1 – Reading",
      dueAt: "2026-11-13T23:59:00+07:00",
      submittedAt: null,
    },
  ]);
