import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

/**
 * SQLite via Node's built-in `node:sqlite`.
 *
 * The brief says a real database is not required, but a real one is cheap here
 * and it removes the main project risk: an in-memory array cannot show how the
 * app behaves when data lives behind a query, and it makes "seed once" and
 * "filter in SQL vs. filter in JS" impossible to talk about. No ORM, no native
 * build step, no Docker — the driver ships with Node.
 *
 * The file lives in `.data/` (git-ignored) and is created on first boot.
 */

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS assignments (
    id           TEXT PRIMARY KEY,
    student_id   TEXT NOT NULL,
    title        TEXT NOT NULL,
    due_at       TEXT NOT NULL,
    submitted_at TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_assignments_student
    ON assignments (student_id, id);
`;

/**
 * Seed rows, transcribed from the brief. Timestamps carry an explicit +07:00
 * offset so nothing is re-interpreted against the machine's timezone. B01
 * belongs to S02 and exists precisely so the isolation test has something to
 * catch.
 */
const SEED: ReadonlyArray<
  [id: string, studentId: string, title: string, dueAt: string, submittedAt: string | null]
> = [
  ["A01", "S01", "Foundation U1 – Reading", "2026-11-13T23:59:00+07:00", null],
  ["A02", "S01", "Foundation U2 – Listening", "2026-11-09T23:59:00+07:00", null],
  ["A03", "S01", "Foundation U3 – Writing", "2026-11-10T23:59:00+07:00", "2026-11-10T20:00:00+07:00"],
  ["A04", "S01", "Foundation U4 – Speaking", "2026-11-08T23:59:00+07:00", "2026-11-10T12:00:00+07:00"],
  ["B01", "S02", "Foundation U1 – Reading", "2026-11-13T23:59:00+07:00", null],
];

/**
 * Opens (creating if needed) a database and guarantees the fixture rows exist.
 * `":memory:"` yields a fresh, fully seeded database — what the tests use.
 */
export function openDatabase(filename: string): DatabaseSync {
  if (filename !== ":memory:") {
    mkdirSync(path.dirname(filename), { recursive: true });
  }

  const db = new DatabaseSync(filename);
  db.exec("PRAGMA foreign_keys = ON");
  if (filename !== ":memory:") {
    db.exec("PRAGMA journal_mode = WAL");
  }
  db.exec(SCHEMA);

  const { count } = db
    .prepare("SELECT COUNT(*) AS count FROM assignments")
    .get() as { count: number };

  if (count === 0) {
    const insert = db.prepare(
      "INSERT INTO assignments (id, student_id, title, due_at, submitted_at) VALUES (?, ?, ?, ?, ?)"
    );
    db.exec("BEGIN");
    try {
      for (const row of SEED) insert.run(...row);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  return db;
}

/**
 * Dev server reloads modules on every edit; without this cache each reload would
 * leak a connection. `globalThis` survives the reload, a module-scoped variable
 * does not.
 */
const globalForDb = globalThis as { __ieltsDb?: DatabaseSync };

/**
 * Path is overridable so tests can run against `":memory:"` and never touch the
 * developer's `.data/ielts.db`.
 */
export function getDatabase(): DatabaseSync {
  globalForDb.__ieltsDb ??= openDatabase(
    process.env.IELTS_DB_PATH ?? path.join(process.cwd(), ".data", "ielts.db")
  );
  return globalForDb.__ieltsDb;
}
