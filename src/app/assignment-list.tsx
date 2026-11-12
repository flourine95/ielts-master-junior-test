import Link from "next/link";
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
import type { AssignmentView, SubmissionState } from "@/lib/schema";
import { StatusCell } from "./status-cell";

/**
 * The filter lives in the URL, not in component state.
 *
 * `?status=overdue` is shareable, survives a reload, works with the browser's
 * back button, and renders without JavaScript at all. That also keeps the page a
 * server component: no toggle library, no client bundle, no hydration for what
 * is four links.
 */
export type Filter = "all" | SubmissionState;

export const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Tổng bài" },
  { value: "submitted", label: "Đã nộp" },
  { value: "overdue", label: "Quá hạn" },
  { value: "not-submitted", label: "Chưa nộp" },
];

/**
 * Reads `?status=` back into a filter, falling back to "all".
 *
 * Anything a visitor can type arrives here, so the value is matched against the
 * known list rather than cast; `?status=<script>` behaves like no parameter.
 */
export function parseFilter(value: string | string[] | undefined): Filter {
  const candidate = Array.isArray(value) ? value[0] : value;

  return FILTERS.some((option) => option.value === candidate)
    ? (candidate as Filter)
    : "all";
}

/**
 * Which rows a filter shows.
 *
 * "late-submission" counts as submitted: the brief puts A04 under "Đã nộp" and
 * adds "Nộp trễ" as an annotation, so a filter that hid it would contradict the
 * status the same row displays.
 */
export function matchesFilter(
  assignment: AssignmentView,
  filter: Filter
): boolean {
  if (filter === "all") return true;
  if (filter === "submitted") {
    return (
      assignment.status === "submitted" || assignment.status === "late-submission"
    );
  }

  return assignment.status === filter;
}

const TONE: Record<Filter, string> = {
  all: "text-foreground",
  submitted: "text-success",
  overdue: "text-destructive",
  "not-submitted": "text-warning",
  "late-submission": "text-success",
};

const EMPTY_COPY: Record<Filter, { title: string; description: string }> = {
  all: {
    title: "Chưa có bài tập nào được giao",
    description: "Khi giảng viên giao bài, danh sách sẽ xuất hiện ở đây.",
  },
  submitted: {
    title: "Chưa nộp bài nào",
    description: "Chọn “Tổng bài” để xem lại toàn bộ danh sách.",
  },
  overdue: {
    title: "Không có bài nào quá hạn",
    description: "Chọn “Tổng bài” để xem lại toàn bộ danh sách.",
  },
  "not-submitted": {
    title: "Không còn bài nào đang chờ nộp",
    description: "Chọn “Tổng bài” để xem lại toàn bộ danh sách.",
  },
  "late-submission": {
    title: "Không có bài nào nộp trễ",
    description: "Chọn “Tổng bài” để xem lại toàn bộ danh sách.",
  },
};

export function AssignmentList({
  assignments,
  filter,
}: {
  assignments: AssignmentView[];
  filter: Filter;
}) {
  const visible = assignments.filter((assignment) =>
    matchesFilter(assignment, filter)
  );

  return (
    <>
      <nav aria-label="Lọc theo trạng thái">
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {FILTERS.map((option) => {
            const active = option.value === filter;
            const count = assignments.filter((a) =>
              matchesFilter(a, option.value)
            ).length;

            return (
              <li key={option.value}>
                <Link
                  href={option.value === "all" ? "/" : `/?status=${option.value}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-full flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 transition-colors",
                    "hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                    active
                      ? "border-foreground/70 bg-muted/40"
                      : "border-border"
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-medium",
                      active ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {option.label}
                  </span>
                  <span
                    className={cn(
                      "font-heading text-2xl font-semibold tabular-nums",
                      TONE[option.value]
                    )}
                  >
                    {count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {visible.length === 0 ? (
        <Empty className="mt-8 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <InboxIcon />
            </EmptyMedia>
            <EmptyTitle>{EMPTY_COPY[filter].title}</EmptyTitle>
            <EmptyDescription>{EMPTY_COPY[filter].description}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <Card className="mt-6 hidden overflow-hidden py-0 md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col" className="px-4">
                    Bài tập
                  </TableHead>
                  <TableHead scope="col" className="px-4">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarClockIcon className="size-3.5" aria-hidden />
                      Hạn nộp
                    </span>
                  </TableHead>
                  <TableHead scope="col" className="px-4">
                    Đã nộp
                  </TableHead>
                  <TableHead scope="col" className="px-4">
                    <span className="inline-flex items-center gap-1.5">
                      <ClockAlertIcon className="size-3.5" aria-hidden />
                      Trạng thái
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="px-4 py-3">
                      <span className="block font-medium">{assignment.title}</span>
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
            {visible.map((assignment) => (
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
    </>
  );
}
