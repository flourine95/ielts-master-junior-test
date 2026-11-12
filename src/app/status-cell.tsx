import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AssignmentView, SubmissionState } from "@/lib/schema";

/**
 * Status rendering.
 *
 * `Badge` has no success variant, so the two tones this app needs are defined as
 * CSS variables (`--success`, `--warning`) in `globals.css` and applied through
 * semantic utilities. No raw palette colours: the same classes work in dark mode
 * because the variables are redefined there.
 */
const TONE: Record<SubmissionState, string> = {
  submitted: "bg-success-surface text-success border-success/30",
  "late-submission": "bg-success-surface text-success border-success/30",
  overdue: "bg-destructive/10 text-destructive border-destructive/30",
  "not-submitted": "bg-warning-surface text-warning border-warning/30",
};

export function StatusCell({ assignment }: { assignment: AssignmentView }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge variant="outline" className={cn("font-medium", TONE[assignment.status])}>
        {assignment.statusLabel}
      </Badge>
      {assignment.late && (
        <Badge
          variant="outline"
          className="bg-warning-surface text-warning border-warning/30 font-medium"
        >
          Nộp trễ
        </Badge>
      )}
    </div>
  );
}
