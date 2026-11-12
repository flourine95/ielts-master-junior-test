"use client";

import { useState } from "react";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import type { AssignmentView, SubmissionState } from "@/lib/schema";
import { StatusCell } from "./status-cell";

/**
 * A filter, not a second authority on status.
 *
 * Every row arrives already scoped to S01 and already carrying its status; this
 * component only chooses which of those rows to draw. Filtering here cannot
 * widen what the server sent, so a bug in this file can hide a row, never reveal
 * one that belonged to S02.
 */
export type Filter = "all" | SubmissionState;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Tổng bài" },
  { value: "submitted", label: "Đã nộp" },
  { value: "overdue", label: "Quá hạn" },
  { value: "not-submitted", label: "Chưa nộp" },
];

/**
 * Which rows a filter shows.
 *
 * "late-submission" counts as submitted: the brief puts A04 under "Đã nộp" and
 * adds "Nộp trễ" as an annotation, so a filter that hid it would contradict the
 * status the same row displays. Exported so that rule is testable without a DOM.
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

const EMPTY_COPY: Record<Filter, string> = {
  all: "Chưa có bài tập nào được giao",
  submitted: "Chưa nộp bài nào",
  overdue: "Không có bài nào quá hạn",
  "not-submitted": "Không còn bài nào đang chờ nộp",
  "late-submission": "Không có bài nào nộp trễ",
};

export function AssignmentList({ assignments }: { assignments: AssignmentView[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const visible = assignments.filter((assignment) =>
      matchesFilter(assignment, filter)
    );

  return (
    <>
      <ToggleGroup
        type="single"
        value={filter}
        onValueChange={(next) => {
          // Radix clears the value when the active item is pressed again; staying
          // on that filter is what a reader expects from a stat row.
          if (next) setFilter(next as Filter);
        }}
        aria-label="Lọc danh sách theo trạng thái"
        className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {FILTERS.map((option) => {
          const count = assignments.filter((a) =>
            matchesFilter(a, option.value)
          ).length;

          return (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              variant="outline"
              aria-label={`${option.label}: ${count} bài`}
              className={cn(
                "group/tile h-auto w-full flex-col items-start gap-0.5 rounded-xl border-border px-3 py-2.5",
                // Selected state has to survive a glance: a washed tint on a near
                // white page is invisible. A 2px dark ring is not.
                "data-[state=on]:border-foreground data-[state=on]:bg-foreground/[0.04] data-[state=on]:ring-2 data-[state=on]:ring-foreground/15"
              )}
            >
              <span className="text-xs font-medium text-muted-foreground group-data-[state=on]/tile:text-foreground">
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
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>

      {visible.length === 0 ? (
        <Empty className="mt-8 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <InboxIcon />
            </EmptyMedia>
            <EmptyTitle>{EMPTY_COPY[filter]}</EmptyTitle>
            <EmptyDescription>
              {filter === "all"
                ? "Khi giảng viên giao bài, danh sách sẽ xuất hiện ở đây."
                : "Chọn “Tổng bài” để xem lại toàn bộ danh sách."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <Card className="mt-6 hidden overflow-hidden py-0 md:block">
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
