import type { Subscription } from "../api/types";
import type { SortField, SortOrder } from "../hooks/useSubscriptions";
import { StatusBadge } from "./StatusBadge";

interface SubscriptionsTableProps {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
  search: string;
  onSearch: (q: string) => void;
  sort: SortField | null;
  order: SortOrder;
  onToggleSort: (field: SortField) => void;
  onAdd: () => void;
  onEdit: (sub: Subscription) => void;
  onDelete: (sub: Subscription) => void;
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function SortHeader({
  label,
  field,
  sort,
  order,
  onToggle,
}: {
  label: string;
  field: SortField;
  sort: SortField | null;
  order: SortOrder;
  onToggle: (f: SortField) => void;
}) {
  const active = sort === field;
  return (
    <button
      type="button"
      className="inline-flex min-h-11 items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted hover:text-ink"
      onClick={() => onToggle(field)}
      aria-label={`Sort by ${label}`}
    >
      {label}
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        aria-hidden="true"
        className={`transition-transform duration-150 ${active && order === "asc" ? "rotate-180" : ""}`}
      >
        <path d="M5 8L1 3h8L5 8Z" fill="currentColor" />
      </svg>
    </button>
  );
}

export function SubscriptionsTable({
  subscriptions,
  loading,
  error,
  search,
  onSearch,
  sort,
  order,
  onToggleSort,
  onAdd,
  onEdit,
  onDelete,
}: SubscriptionsTableProps) {
  return (
    <section aria-label="Subscriptions">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-ink">Subscriptions</h2>
        <div className="flex items-center gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search name or vendor"
            aria-label="Search subscriptions by name or vendor"
            className="min-h-11 w-52 rounded-lg border border-hairline bg-surface px-3 text-sm text-ink placeholder:text-muted"
          />
          <button
            type="button"
            onClick={onAdd}
            className="min-h-11 rounded-lg bg-accent px-4 text-sm font-medium text-on-accent transition active:translate-y-[-1px] active:scale-[0.98]"
          >
            Add subscription
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-hairline bg-surface p-4 text-sm text-risk">
          {error}
        </p>
      )}

      {/* Mobile: stacked cards (design spec §4) / Desktop: table */}
      {loading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-14 w-full" aria-label="Loading subscriptions" />
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <p className="mt-6 rounded-lg border border-hairline bg-surface p-6 text-sm text-muted">
          No subscriptions match your search.
        </p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-4 hidden overflow-x-auto sm:block">
            <table aria-label="All subscriptions" className="w-full border-collapse text-sm">
              <thead className="sticky top-14 z-10 bg-surface">
                <tr className="border-b border-hairline text-left">
                  <th scope="col" className="p-3 text-xs font-medium uppercase tracking-wide text-muted">Name</th>
                  <th scope="col" className="p-3 text-xs font-medium uppercase tracking-wide text-muted">Vendor</th>
                  <th scope="col" className="p-3 text-xs font-medium uppercase tracking-wide text-muted">Category</th>
                  <th
                    scope="col"
                    aria-sort={sort === "cost" ? (order === "asc" ? "ascending" : "descending") : "none"}
                    className="p-3 text-xs font-medium uppercase tracking-wide text-muted"
                  >
                    <SortHeader label="Cost" field="cost" sort={sort} order={order} onToggle={onToggleSort} />
                  </th>
                  <th scope="col" className="p-3 text-xs font-medium uppercase tracking-wide text-muted">Cycle</th>
                  <th
                    scope="col"
                    aria-sort={sort === "renewal" ? (order === "asc" ? "ascending" : "descending") : "none"}
                    className="p-3 text-xs font-medium uppercase tracking-wide text-muted"
                  >
                    <SortHeader label="Renewal date" field="renewal" sort={sort} order={order} onToggle={onToggleSort} />
                  </th>
                  <th scope="col" className="p-3 text-xs font-medium uppercase tracking-wide text-muted">Seats</th>
                  <th scope="col" className="p-3 text-xs font-medium uppercase tracking-wide text-muted">Department</th>
                  <th scope="col" className="p-3 text-xs font-medium uppercase tracking-wide text-muted">Status</th>
                  <th scope="col" className="p-3 text-right text-xs font-medium uppercase tracking-wide text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub, i) => (
                  <tr
                    key={sub.id}
                    data-index={i}
                    className="row-cascade min-h-11 border-b border-hairline text-ink"
                  >
                    <td className="p-3 font-medium">{sub.name}</td>
                    <td className="p-3 text-muted">{sub.vendor}</td>
                    <td className="p-3 capitalize text-muted">{sub.category}</td>
                    <td className="num p-3 text-right">{usd.format(sub.monthlyCost)}</td>
                    <td className="p-3 capitalize text-muted">{sub.billingCycle}</td>
                    <td className="num p-3">{formatDate(sub.renewalDate)}</td>
                    <td className="num p-3">
                      {sub.seatsActive}/{sub.seatsProvisioned}
                    </td>
                    <td className="p-3 text-muted">{sub.owningDepartment}</td>
                    <td className="p-3">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(sub)}
                          aria-label={`Edit ${sub.name}`}
                          className="min-h-11 rounded-lg border border-hairline px-3 text-xs text-ink hover:border-accent"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(sub)}
                          aria-label={`Delete ${sub.name}`}
                          className="min-h-11 rounded-lg border border-hairline px-3 text-xs text-risk hover:border-risk"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile stacked cards */}
          <ul className="mt-4 space-y-3 sm:hidden" aria-label="All subscriptions">
            {subscriptions.map((sub) => (
              <li key={sub.id} className="rounded-card border border-hairline bg-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-ink">{sub.name}</p>
                  <p className="num text-lg font-medium text-ink">{usd.format(sub.monthlyCost)}</p>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {sub.vendor} · <span className="capitalize">{sub.category}</span>
                </p>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <dt className="text-xs text-muted">Renewal</dt>
                    <dd className="num text-ink">{formatDate(sub.renewalDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Seats</dt>
                    <dd className="num text-ink">{sub.seatsActive}/{sub.seatsProvisioned}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Department</dt>
                    <dd className="text-ink">{sub.owningDepartment}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Status</dt>
                    <dd><StatusBadge status={sub.status} /></dd>
                  </div>
                </dl>
                {sub.notes && (
                  <p className="mt-3 line-clamp-2 text-sm text-muted">{sub.notes}</p>
                )}
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(sub)}
                    aria-label={`Edit ${sub.name}`}
                    className="min-h-11 rounded-lg border border-hairline px-3 text-xs text-ink"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(sub)}
                    aria-label={`Delete ${sub.name}`}
                    className="min-h-11 rounded-lg border border-hairline px-3 text-xs text-risk"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
