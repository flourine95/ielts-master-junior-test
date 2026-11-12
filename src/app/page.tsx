import { getAssignmentsForStudent } from "@/lib/assignment-service";
import { getSession } from "@/lib/session";
import { SIMULATED_NOW_ISO, SIMULATED_NOW_LABEL } from "@/lib/now";
import { AssignmentList, parseFilter } from "./assignment-list";

/**
 * Server component. It reads one value from the URL — the status filter — and
 * nothing else. Identity still comes only from `getSession()`, so `?status=`
 * cannot reach a row that S01 does not own.
 */
export default async function MyAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  const assignments = getAssignmentsForStudent(session.studentId);
  const filter = parseFilter((await searchParams).status);

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

      <AssignmentList assignments={assignments} filter={filter} />

      <footer className="mt-8 text-xs text-muted-foreground">
        Dữ liệu thuộc tài khoản đang đăng nhập; danh sách được lọc ở server.
      </footer>
    </main>
  );
}
