/**
 * The signed-in student, resolved entirely on the server.
 *
 * The brief's rule is that a student id must never be taken from the request,
 * and this module is where that rule is enforced: there is no query parameter,
 * no path segment, no body field **and no cookie** that can name a student. A
 * request can only ever receive the identity this file already knows about.
 *
 * That is deliberately the strictest reading. A cookie-selected demo account
 * would have made "log in as S02" a one-liner for anyone who reads the source,
 * which is indistinguishable from a leak in review — the filter would still be
 * correct, but the payload would not be. S02 exists in the fixture and in the
 * service tests so the filter is provably not a no-op; it just has no way to
 * authenticate.
 *
 * The function is `async` and returns a session rather than exporting a
 * constant, so replacing this stand-in with a real signed session/JWT changes
 * one function body and no call site.
 */
export type Session = { studentId: string; name: string };

const DEMO_SESSION: Session = {
  studentId: "S01",
  name: "Học viên S01",
};

export async function getSession(): Promise<Session> {
  return DEMO_SESSION;
}
