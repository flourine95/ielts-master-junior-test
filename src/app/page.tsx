import { CalendarClockIcon, ClockAlertIcon, InboxIcon } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getAssignmentsForStudent } from "@/lib/assignment-service";
import { getSession } from "@/lib/session";
import { SIMULATED_NOW_ISO, SIMULATED_NOW_LABEL } from "@/lib/now";
import type { AssignmentView } from "@/lib/schema";
import { StatusCell } from "./status-cell";

/** Counts are derived from the same view models the list renders. */
function Summary({ assignments }: { assignments: AssignmentView[] }) {
  const submitted = assignments.filter((a) => a.submittedAt !== null).length;
  const overdue = assignments.filter((a) => a.status === "overdue").length;
  const pending = assignments.filter((a) => a.status === "not-submitted").length;

  const tiles = [
    { label: "Tổng bài", value: assignments.length, tone: "text-foreground" },
    { label: "Đã nộp", value: submitted, tone: "text-success" },
    { label: "Quá hạn", value: overdue, tone: "text-destructive" },
    { label: "Chưa nộp", value: pending, tone: "text-warning" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((tile) => (
        <Card key={tile.label} size="sm" className="gap-1">
          <CardContent className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              {tile.label}
            </span>
            <span
              className={cn(
                "font-heading text-2xl font-semibold tabular-nums",
                tile.tone
              )}
            >
              {tile.value}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

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

      <Summary assignments={assignments} />

      {assignments.length === 0 ? (
        <Empty className="mt-8 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <InboxIcon />
            </EmptyMedia>
            <EmptyTitle>Chưa có bài tập nào được giao</EmptyTitle>
            <EmptyDescription>
              Khi giảng viên giao bài, danh sách sẽ xuất hiện ở đây.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <Card className="mt-8 hidden overflow-hidden py-0 md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4">Bài tập</TableHead>
                  <TableHead className="px-4">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarClockIcon className="size-3.5" />
                      Hạn nộp
                    </span>
                  </TableHead>
                  <TableHead className="px-4">Đã nộp</TableHead>
                  <TableHead className="px-4">
                    <span className="inline-flex items-center gap-1.5">
                      <ClockAlertIcon className="size-3.5" />
                      Trạng thái
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="px-4 py-3">
                      <span className="block font-medium">
                        {assignment.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {assignment.id}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 tabular-nums text-muted-foreground">
                      {assignment.dueAtLabel}
                    </TableCell>
                    <TableCell className="px-4 py-3 tabular-nums text-muted-foreground">
                      {assignment.submittedAtLabel ?? "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusCell assignment={assignment} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <ul className="mt-6 flex flex-col gap-3 md:hidden">
            {assignments.map((assignment) => (
              <li key={assignment.id}>
                <Card size="sm">
                  <CardHeader>
                    <CardTitle>{assignment.title}</CardTitle>
                    <CardDescription>{assignment.id}</CardDescription>
                    <CardAction>
                      <StatusCell assignment={assignment} />
                    </CardAction>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <Separator />
                    <dl className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <dt className="text-muted-foreground">Hạn nộp</dt>
                        <dd className="mt-0.5 tabular-nums">
                          {assignment.dueAtLabel}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Đã nộp</dt>
                        <dd className="mt-0.5 tabular-nums">
                          {assignment.submittedAtLabel ?? "—"}
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}

      <footer className="mt-8 text-xs text-muted-foreground">
        Dữ liệu thuộc tài khoản đang đăng nhập; danh sách được lọc ở server.
      </footer>
    </main>
  );
}
