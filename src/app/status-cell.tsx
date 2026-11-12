import type { AssignmentView } from "@/lib/types";

const TONE: Record<
  AssignmentView["status"],
  { className: string; dot: string }
> = {
  submitted: {
    className:
      "bg-[var(--success-bg)] text-[var(--success)] ring-[var(--success)]/20",
    dot: "bg-[var(--success)]",
  },
  "late-submission": {
    className:
      "bg-[var(--success-bg)] text-[var(--success)] ring-[var(--success)]/20",
    dot: "bg-[var(--success)]",
  },
  overdue: {
    className: "bg-[var(--error-bg)] text-[var(--error)] ring-[var(--error)]/20",
    dot: "bg-[var(--error)]",
  },
  "not-submitted": {
    className:
      "bg-[var(--warning-bg)] text-[var(--warning)] ring-[var(--warning)]/20",
    dot: "bg-[var(--warning)]",
  },
};

function Badge({ label, tone }: { label: string; tone: keyof typeof TONE }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${TONE[tone].className}`}
    >
      <span className={`size-1.5 rounded-full ${TONE[tone].dot}`} />
      {label}
    </span>
  );
}

export function StatusCell({ assignment }: { assignment: AssignmentView }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <Badge label={assignment.statusLabel} tone={assignment.status} />
      {assignment.late && <Badge label="Nộp trễ" tone="not-submitted" />}
    </span>
  );
}
