import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/assignments/route";

/**
 * Route-level proof of the brief's hardest rule: the response is scoped to S01,
 * and nothing in the request can widen it.
 *
 * The real handler, the real session, the real filter and the real Zod contract
 * all run — nothing is mocked. So a regression that starts reading an input
 * fails here, not just in a manual curl.
 */
const S01_IDS = ["A01", "A02", "A03", "A04"];
const ENDPOINT = "http://localhost:3000/api/assignments";

async function idsFor(path = "", headers?: HeadersInit) {
  const response = await GET(new Request(`${ENDPOINT}${path}`, { headers }));
  const body = await response.json();

  return body.assignments.map((assignment: { id: string }) => assignment.id);
}

describe("GET /api/assignments", () => {
  it("returns exactly S01's four rows", async () => {
    expect(await idsFor()).toEqual(S01_IDS);
  });

  it.each([
    ["a query parameter", "?studentId=S02"],
    ["a different query name", "?student=S02&id=S02"],
    ["a duplicated parameter", "?studentId=S01&studentId=S02"],
  ])("ignores %s instead of trusting it", async (_label, query) => {
    // Exact list, not merely "no B01": an empty result would also satisfy the
    // weaker assertion, so inertness has to be shown.
    expect(await idsFor(query)).toEqual(S01_IDS);
  });

  it.each(["demo-s01", "demo-s02", "__proto__", "constructor"])(
    "cannot be moved to another student by the cookie %s",
    async (token) => {
      expect(
        await idsFor("", { Cookie: `ielts_session=${token}` })
      ).toEqual(S01_IDS);
    }
  );

  it("carries no studentId in the payload and forbids shared caching", async () => {
    const response = await GET(new Request(ENDPOINT));
    const text = await response.text();

    expect(text).not.toContain("studentId");
    expect(text).not.toContain("B01");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
