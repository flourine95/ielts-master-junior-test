import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AssignmentView, SubmissionState } from "@/lib/schema";

/**
 * Status rendering.
 *
 * `Badge` ships no success variant, so the tones this app needs are CSS variables
 * (`--success`, `--warning`, `--destructive-surface`) defined in `globals.css` and
 * applied through semantic utilities. No raw palette colours: dark mode works
 * because the variables are redefined, not because every class is repeated with
 * a `dark:` twin.
 *
 * "Nộp trễ" is drawn as an unfilled annotation next to the status, not as a
 * second state, so it can never be confused with the amber "Chưa nộp" badge.
 */
const TONE: Record<SubmissionState, string> = {
  submitted: "bg-success-surface text-success border-success/30",
  "late-submission": "bg-success-surface text-success border-success/30",
  overdue: "bg-destructive-surface text-destructive border-destructive/30",
  "not-submitted": "bg-warning-surface text-warning border-warning/30",
};

const LATE_TONE = "border-warning/40 text-warning";

export function StatusCell({ assignment }: { assignment: AssignmentView }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge
        variant="outline"
        className={cn("font-medium", TONE[assignment.status])}
      >
        {assignment.statusLabel}
      </Badge>
      {assignment.late && (
        <Badge variant="outline" className={cn("font-medium", LATE_TONE)}>
          Nộp trễ
        </Badge>
      )}
    </div>
  );
}
