import { describe, expect, it } from "vitest";
import { getStatus } from "@/lib/status";
import { SIMULATED_NOW, SIMULATED_NOW_ISO } from "@/lib/now";
import { parseInstant } from "@/lib/instant";

describe("getStatus — the four required cases at 11/11/2026 09:00 (GMT+7)", () => {
  it("A01: unsubmitted, deadline in the future → Chưa nộp", () => {
    expect(
      getStatus(
        { dueAt: "2026-11-13T23:59:00+07:00", submittedAt: null },
        SIMULATED_NOW
      )
    ).toEqual({ status: "not-submitted", statusLabel: "Chưa nộp", late: false });
  });

  it("A02: unsubmitted, deadline passed → Quá hạn", () => {
    expect(
      getStatus(
        { dueAt: "2026-11-09T23:59:00+07:00", submittedAt: null },
        SIMULATED_NOW
      )
    ).toEqual({ status: "overdue", statusLabel: "Quá hạn", late: false });
  });

  it("A03: submitted before the deadline → Đã nộp, not late", () => {
    expect(
      getStatus(
        {
          dueAt: "2026-11-10T23:59:00+07:00",
          submittedAt: "2026-11-10T20:00:00+07:00",
        },
        SIMULATED_NOW
      )
    ).toEqual({ status: "submitted", statusLabel: "Đã nộp", late: false });
  });

  it("A04: submitted after the deadline → Đã nộp + Nộp trễ, never Quá hạn", () => {
    expect(
      getStatus(
        {
          dueAt: "2026-11-08T23:59:00+07:00",
          submittedAt: "2026-11-10T12:00:00+07:00",
        },
        SIMULATED_NOW
      )
    ).toEqual({ status: "late-submission", statusLabel: "Đã nộp", late: true });
  });
});

describe("getStatus — boundaries", () => {
  it("submitting exactly at the deadline is on time", () => {
    const dueAt = "2026-11-10T23:59:00+07:00";
    expect(getStatus({ dueAt, submittedAt: dueAt }, SIMULATED_NOW).late).toBe(
      false
    );
  });

  it("now exactly at the deadline is not yet overdue", () => {
    const dueAt = "2026-11-11T09:00:00+07:00";
    expect(getStatus({ dueAt, submittedAt: null }, SIMULATED_NOW)).toEqual({
      status: "not-submitted",
      statusLabel: "Chưa nộp",
      late: false,
    });
  });

  it("one millisecond past the deadline is overdue", () => {
    const dueAt = "2026-11-11T08:59:59.999+07:00";
    expect(
      getStatus({ dueAt, submittedAt: null }, SIMULATED_NOW).status
    ).toBe("overdue");
  });

  it("compares instants, not strings: a later date in another offset can be earlier", () => {
    // 2026-11-11T09:00+07:00 == 2026-11-11T02:00Z, which is *before*
    // 2026-11-11T03:00Z. String comparison would get this backwards.
    expect(
      getStatus(
        { dueAt: "2026-11-11T03:00:00+00:00", submittedAt: null },
        SIMULATED_NOW
      ).status
    ).toBe("not-submitted");
  });

  it("rejects timestamps with no explicit offset instead of guessing a timezone", () => {
    expect(() => parseInstant("2026-11-13T23:59:00")).toThrow(
      /explicit UTC offset/
    );
  });

  it("the simulated now is the fixed brief instant, not wall-clock time", () => {
    expect(SIMULATED_NOW_ISO).toBe("2026-11-11T09:00:00+07:00");
    expect(SIMULATED_NOW).toBe(Date.UTC(2026, 10, 11, 2, 0, 0));
  });
});
