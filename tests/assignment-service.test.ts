import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getAssignmentsForStudent } from "@/lib/assignment-service";
import { openDatabase } from "@/lib/db";
import { selectAssignmentsByStudent } from "@/lib/assignment-repository";
import { SIMULATED_NOW } from "@/lib/now";
import { assignmentsResponseSchema } from "@/lib/schema";

/**
 * These tests exercise the real query path — `getAssignmentsForStudent` opens a
 * freshly seeded in-memory database, so a broken WHERE clause fails here rather
 * than being papered over by an in-memory fixture.
 */
describe("assignment data scoping", () => {
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
});

describe("repository", () => {
  it("filters in SQL, so an unknown id never sees seeded rows", () => {
    const db = openDatabase(":memory:");
    try {
      expect(selectAssignmentsByStudent(db, "S01")).toHaveLength(4);
      expect(selectAssignmentsByStudent(db, "S02")).toHaveLength(1);
      expect(selectAssignmentsByStudent(db, "NOPE")).toEqual([]);
    } finally {
      db.close();
    }
  });

  it("seeds only once when the same file is opened twice", () => {
    const file = path.join(tmpdir(), `ielts-${randomUUID()}.db`);
    try {
      const first = openDatabase(file);
      expect(selectAssignmentsByStudent(first, "S01")).toHaveLength(4);
      first.close();

      const second = openDatabase(file);
      expect(selectAssignmentsByStudent(second, "S01")).toHaveLength(4);
      second.close();
    } finally {
      rmSync(file, { force: true });
      rmSync(`${file}-wal`, { force: true });
      rmSync(`${file}-shm`, { force: true });
    }
  });
});
