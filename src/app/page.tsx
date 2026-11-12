import { getAssignmentsForStudent } from "@/lib/assignment-service";
import { getSession } from "@/lib/session";
import { SIMULATED_NOW_ISO, SIMULATED_NOW_LABEL } from "@/lib/now";
import { AssignmentList } from "./assignment-list";

/**
 * Server component: resolves identity, filters, and formats before any HTML
 * leaves the process. The client component below receives only S01's rows, so
 * the filter controls can narrow that list but have nothing else to reveal.
 */
export default async function MyAssignmentsPage() {
  const session = await getSession();
  const assignments = getAssignmentsForStudent(session.studentId);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 flex flex-col gap-1.5">
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
          Bài tập của tôi
        </h1>
        <p className="text-sm text-muted-foreground">
          {session.name}, trạng thái tính tại{" "}
          <time
            dateTime={SIMULATED_NOW_ISO}
            className="font-medium tabular-nums text-foreground"
          >
            {SIMULATED_NOW_LABEL} (GMT+7)
          </time>
        </p>
      </header>

      <AssignmentList assignments={assignments} />

      <footer className="mt-8 text-xs text-muted-foreground">
        Dữ liệu thuộc tài khoản đang đăng nhập; danh sách được lọc ở server.
      </footer>
    </main>
  );
}
