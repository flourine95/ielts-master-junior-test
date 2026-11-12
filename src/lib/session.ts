import { cookies } from "next/headers";

/**
 * Stand-in for real authentication.
 *
 * The brief forbids trusting a student id from the URL, so identity is read
 * server-side only: from a cookie the server set, and from a registry the client
 * cannot write. No route, page, or server action accepts `studentId` as input.
 *
 * In a real product this function would verify a signed session/JWT and return
 * the subject claim; the call sites would not change.
 */
const SESSION_COOKIE = "ielts_session";

/** Demo accounts that exist on the server. S01 is the signed-in student. */
const SESSION_REGISTRY: Record<string, { studentId: string; name: string }> = {
  "demo-s01": { studentId: "S01", name: "Học viên S01" },
  "demo-s02": { studentId: "S02", name: "Học viên S02" },
};

export type Session = { studentId: string; name: string };

export async function getSession(): Promise<Session> {
  const jar = await cookies();
  // Default to S01 so the page opens ready-to-grade; a different cookie value is
  // resolved through the registry, so an attacker cannot invent "S03".
  const token = jar.get(SESSION_COOKIE)?.value ?? "demo-s01";

  return SESSION_REGISTRY[token] ?? SESSION_REGISTRY["demo-s01"];
}

export { SESSION_COOKIE };
