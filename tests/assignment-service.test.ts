import { describe, expect, it } from "vitest";
import { getAssignmentsForStudent } from "@/lib/assignment-service";
import { SIMULATED_NOW } from "@/lib/now";

describe("getAssignmentsForStudent — S01 isolation", () => {
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
    }
  });

  it("produces the statuses the brief expects at 11/11/2026 09:00 (GMT+7)", () => {
    expect(
      s01.map((a) => ({
        id: a.id,
        status: a.statusLabel,
        late: a.late,
      }))
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
});
