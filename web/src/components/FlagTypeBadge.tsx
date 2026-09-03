import type { FlagType } from "../api/types";

const FLAG_META: Record<FlagType, { label: string; dot: string }> = {
  inactive_seats: { label: "Inactive seats", dot: "bg-waste" },
  upcoming_renewal: { label: "Upcoming renewal", dot: "bg-risk" },
  trial_drift: { label: "Trial drift", dot: "bg-waste" },
  duplicate_spend: { label: "Duplicate spend", dot: "bg-waste" },
};

export function FlagTypeBadge({ flagType }: { flagType: FlagType }) {
  const { label, dot } = FLAG_META[flagType];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-2 py-0.5 text-xs text-muted">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}
