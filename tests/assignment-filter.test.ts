import { describe, expect, it } from "vitest";
import {
  matchesFilter,
  parseFilter,
  type Filter,
} from "@/app/assignment-list";
import { getAssignmentsForStudent } from "@/lib/assignment-service";
import { SIMULATED_NOW } from "@/lib/now";

/**
 * The filter is the only place a reader can hide a row, so it gets the same
 * treatment as the status rule: named cases against the brief's own answer.
 *
 * Expected values come from the brief (A01 Chưa nộp, A02 Quá hạn, A03 Đã nộp,
 * A04 Đã nộp + Nộp trễ), not from re-running the predicate.
 */
const rows = getAssignmentsForStudent("S01", SIMULATED_NOW);

const idsShownBy = (filter: Filter) =>
  rows.filter((assignment) => matchesFilter(assignment, filter)).map((a) => a.id);

describe("status filter", () => {
  it("shows every row under Tổng bài", () => {
    expect(idsShownBy("all")).toEqual(["A01", "A02", "A03", "A04"]);
  });

  it("counts a late submission under Đã nộp, matching the badge that row shows", () => {
    expect(idsShownBy("submitted")).toEqual(["A03", "A04"]);
  });

  it("separates the three unsubmitted outcomes", () => {
    expect(idsShownBy("overdue")).toEqual(["A02"]);
    expect(idsShownBy("not-submitted")).toEqual(["A01"]);
  });

  it("treats anything unrecognised in ?status= as no filter", () => {
    expect(parseFilter("overdue")).toBe("overdue");
    expect(parseFilter(["submitted", "overdue"])).toBe("submitted");
    // A visitor can type this; it must not become a filter, a lookup, or an error.
    expect(parseFilter("<script>alert(1)</script>")).toBe("all");
    expect(parseFilter("status=overdue")).toBe("all");
    expect(parseFilter(undefined)).toBe("all");
  });

  it("never lets a filter widen the server's scope", () => {
    // B01 is S02's row and is not in `rows` at all; the count is the proof that
    // the four filters partition exactly the four rows they were given.
    const union = [
      ...idsShownBy("overdue"),
      ...idsShownBy("not-submitted"),
      ...idsShownBy("submitted"),
    ].sort();

    expect(union).toEqual(["A01", "A02", "A03", "A04"]);
    expect(union).not.toContain("B01");
  });
});
