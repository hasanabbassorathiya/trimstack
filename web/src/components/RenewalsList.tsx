import type { UpcomingRenewal } from "../api/types";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function daysUntil(iso: string): number {
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(`${iso}T00:00:00Z`).getTime();
  return Math.round((target - today) / 86_400_000);
}

function relativeHint(iso: string): string {
  const days = daysUntil(iso);
  if (days === 0) return "today";
  if (days === 1) return "in 1 day";
  return `in ${days} days`;
}

export function RenewalsList({ renewals, loading }: { renewals: UpcomingRenewal[]; loading: boolean }) {
  return (
    <section aria-label="Upcoming renewals" className="rounded-card border border-hairline bg-surface p-5">
      <h2 className="text-lg font-semibold tracking-tight text-ink">
        Upcoming renewals
        <span className="num ml-2 text-sm font-normal text-muted">{renewals.length}</span>
      </h2>

      {loading ? (
        <ul className="mt-4 space-y-2" aria-label="Loading renewals">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="skeleton h-11 w-full" />
          ))}
        </ul>
      ) : renewals.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No renewals in the next 60 days.</p>
      ) : (
        <ul className="mt-4 divide-y divide-hairline">
          {renewals.map((r) => (
            <li key={`${r.name}-${r.renewalDate}`} className="flex min-h-11 items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{r.name}</p>
                <p className="num text-xs text-muted">
                  {new Date(`${r.renewalDate}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  <span className="ml-1">· {relativeHint(r.renewalDate)}</span>
                </p>
              </div>
              <p className="num whitespace-nowrap text-sm text-ink">{usd.format(r.monthlyCost)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
