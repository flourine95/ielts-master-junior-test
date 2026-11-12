import { getAssignmentsForStudent } from "@/lib/assignment-service";
import { getSession } from "@/lib/session";
import { SIMULATED_NOW_LABEL } from "@/lib/now";
import type { AssignmentView } from "@/lib/types";
import { StatusCell } from "./status-cell";

function Summary({ assignments }: { assignments: AssignmentView[] }) {
  const counts = {
    submitted: assignments.filter((a) => a.submittedAt !== null).length,
    overdue: assignments.filter((a) => a.status === "overdue").length,
    pending: assignments.filter((a) => a.status === "not-submitted").length,
  };

  const tiles = [
    { label: "Tổng bài", value: assignments.length, tone: "text-foreground" },
    { label: "Đã nộp", value: counts.submitted, tone: "text-[var(--success)]" },
    { label: "Quá hạn", value: counts.overdue, tone: "text-[var(--error)]" },
    {
      label: "Chưa nộp",
      value: counts.pending,
      tone: "text-[var(--warning)]",
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
        >
          <dt className="text-xs font-medium text-[var(--muted)]">
            {tile.label}
          </dt>
          <dd className={`mt-1 text-2xl font-semibold ${tile.tone}`}>
            {tile.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default async function MyAssignmentsPage() {
  const session = await getSession();
  const assignments = getAssignmentsForStudent(session.studentId);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
          IELTS Master · E-learning
        </p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
          Bài tập của tôi
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {session.name} · Bài tập được tính theo thời điểm giả lập{" "}
          <time dateTime="2026-11-11T09:00:00+07:00">
            {SIMULATED_NOW_LABEL} (GMT+7)
          </time>
        </p>
      </header>

      <Summary assignments={assignments} />

      {assignments.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-[var(--border)] px-4 py-10 text-center text-sm text-[var(--muted)]">
          Chưa có bài tập nào được giao.
        </p>
      ) : (
        <>
          {/* Table from sm up. */}
          <div className="mt-8 hidden overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] sm:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted)]">
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Bài tập
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Hạn nộp
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Đã nộp
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr
                    key={assignment.id}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="px-4 py-4">
                      <span className="block font-medium">
                        {assignment.title}
                      </span>
                      <span className="text-xs text-[var(--muted)]">
                        {assignment.id}
                      </span>
                    </td>
                    <td className="px-4 py-4 tabular-nums text-[var(--muted)]">
                      {assignment.dueAtLabel}
                    </td>
                    <td className="px-4 py-4 tabular-nums text-[var(--muted)]">
                      {assignment.submittedAtLabel ?? "—"}
                    </td>
                    <td className="px-4 py-4">
                      <StatusCell assignment={assignment} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards below sm. */}
          <ul className="mt-6 space-y-3 sm:hidden">
            {assignments.map((assignment) => (
              <li
                key={assignment.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{assignment.title}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {assignment.id}
                    </p>
                  </div>
                  <StatusCell assignment={assignment} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-[var(--border)] pt-3 text-xs">
                  <div>
                    <dt className="text-[var(--muted)]">Hạn nộp</dt>
                    <dd className="mt-0.5 tabular-nums">
                      {assignment.dueAtLabel}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">Đã nộp</dt>
                    <dd className="mt-0.5 tabular-nums">
                      {assignment.submittedAtLabel ?? "—"}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </>
      )}

      <footer className="mt-8 text-xs text-[var(--muted)]">
        Dữ liệu thuộc tài khoản đang đăng nhập; danh sách được lọc ở server.
      </footer>
    </main>
  );
}
