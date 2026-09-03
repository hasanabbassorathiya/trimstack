import type { SubStatus } from "../api/types";

const STATUS_STYLES: Record<SubStatus, { dot: string; label: string }> = {
  active: { dot: "bg-accent", label: "Active" },
  trial: { dot: "bg-waste", label: "Trial" },
  cancelled: { dot: "bg-neutralbadge", label: "Cancelled" },
};

export function StatusBadge({ status }: { status: SubStatus }) {
  const { dot, label } = STATUS_STYLES[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}
