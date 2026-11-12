import { describe, expect, it } from "vitest";
import { getAssignmentsForStudent } from "@/lib/assignment-service";
import { ASSIGNMENTS } from "@/lib/assignments";
import { SIMULATED_NOW } from "@/lib/now";
import { assignmentSchema, assignmentsResponseSchema } from "@/lib/schema";
import { parseInstant } from "@/lib/instant";

/**
 * These tests exercise the same function the page and the API call — not a
 * re-implementation of the filter — so a broken WHERE-style predicate fails
 * here rather than being papered over.
 */
describe("assignment scoping", () => {
  const s01 = getAssignmentsForStudent("S01", SIMULATED_NOW);

  it("returns exactly S01's four assignments, in table order", () => {
    expect(s01.map((a) => a.id)).toEqual(["A01", "A02", "A03", "A04"]);
  });

  it("never exposes S02's B01 row", () => {
    expect(s01.map((a) => a.id)).not.toContain("B01");
    expect(JSON.stringify(s01)).not.toContain("B01");
  });

  it("carries no studentId field that could be replayed against another student", () => {
    for (const assignment of s01) {
      expect(assignment).not.toHaveProperty("studentId");
      expect(assignment).not.toHaveProperty("student_id");
    }
  });

  it("produces the statuses the brief expects at 11/11/2026 09:00 (GMT+7)", () => {
    expect(
      s01.map((a) => ({ id: a.id, status: a.statusLabel, late: a.late }))
    ).toEqual([
      { id: "A01", status: "Chưa nộp", late: false },
      { id: "A02", status: "Quá hạn", late: false },
      { id: "A03", status: "Đã nộp", late: false },
      { id: "A04", status: "Đã nộp", late: true },
    ]);
  });

  it("scopes S02 to its own single row", () => {
    expect(getAssignmentsForStudent("S02", SIMULATED_NOW).map((a) => a.id)).toEqual(
      ["B01"]
    );
  });

  it("returns an empty list for an unknown student rather than everything", () => {
    expect(getAssignmentsForStudent("S99", SIMULATED_NOW)).toEqual([]);
  });

  it("formats both timestamps as GMT+7 regardless of the machine's timezone", () => {
    expect(s01[0]).toMatchObject({
      dueAtLabel: "13/11/2026 23:59",
      submittedAtLabel: null,
    });
    expect(s01[3]).toMatchObject({
      dueAtLabel: "08/11/2026 23:59",
      submittedAtLabel: "10/11/2026 12:00",
      late: true,
    });
  });

  it("matches the API wire contract", () => {
    const payload = assignmentsResponseSchema.parse({
      viewer: { name: "Học viên S01" },
      simulatedNow: "2026-11-11T09:00:00+07:00",
      assignments: s01,
    });
    expect(payload.assignments).toHaveLength(4);
  });

  it("changes nothing when the clock moves but the data does not", () => {
    // Same rows, a later "now": A01 flips to overdue, the rest keep their state.
    const later = parseInstant("2026-11-14T09:00:00+07:00");
    expect(
      getAssignmentsForStudent("S01", later).map((a) => [a.id, a.status])
    ).toEqual([
      ["A01", "overdue"],
      ["A02", "overdue"],
      ["A03", "submitted"],
      ["A04", "late-submission"],
    ]);
  });
});

describe("fixture integrity", () => {
  it("validates at module load, so a malformed timestamp cannot ship", () => {
    expect(() =>
      assignmentSchema.parse({
        id: "X",
        studentId: "S01",
        title: "No offset",
        dueAt: "2026-11-13T23:59:00",
        submittedAt: null,
      })
    ).toThrow();
  });

  it("every seeded row parses and uses an explicit offset", () => {
    for (const assignment of ASSIGNMENTS) {
      expect(assignmentSchema.safeParse(assignment).success).toBe(true);
      expect(assignment.dueAt).toMatch(/[+-]\d{2}:\d{2}$/);
    }
  });
});
