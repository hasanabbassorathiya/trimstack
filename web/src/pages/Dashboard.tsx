import { useState } from "react";
import type { Subscription } from "../api/types";
import { deleteSubscription } from "../api/client";
import { useDashboardData } from "../hooks/useDashboardData";
import { useAlerts } from "../hooks/useAlerts";
import { useSubscriptions } from "../hooks/useSubscriptions";
import { runAnalysis, dismissAlert, resolveAlert, getAlertsCsvUrl } from "../api/client";
import { MetricCard } from "../components/MetricCard";
import { SubscriptionsTable } from "../components/SubscriptionsTable";
import { SubscriptionForm } from "../components/SubscriptionForm";
import { AlertsPanel } from "../components/AlertsPanel";
import { RenewalsList } from "../components/RenewalsList";
import { Modal } from "../components/Modal";
import { ResolveDialog } from "../components/ResolveDialog";
import type { Alert } from "../api/types";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const usd0 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

type FormMode = { kind: "closed" } | { kind: "add" } | { kind: "edit"; sub: Subscription };

export function Dashboard() {
  const { summary, loading, error, refetch: refetchDashboard } = useDashboardData();
  const { alerts, loading: alertsLoading, error: alertsError, refetch: refetchAlerts } = useAlerts();
  const subs = useSubscriptions();

  const [formMode, setFormMode] = useState<FormMode>({ kind: "closed" });
  const [deleteTarget, setDeleteTarget] = useState<Subscription | null>(null);
  const [resolveTarget, setResolveTarget] = useState<Alert | null>(null);
  const [analysisRunning, setAnalysisRunning] = useState(false);

  const refreshAll = async () => {
    await Promise.all([refetchDashboard(), refetchAlerts(), subs.refetch()]);
  };

  const onRunAnalysis = async () => {
    setAnalysisRunning(true);
    try {
      await runAnalysis();
      await refreshAll();
    } finally {
      setAnalysisRunning(false);
    }
  };

  const onResolve = async (actionTaken: string) => {
    if (!resolveTarget) return;
    await resolveAlert(resolveTarget.id, actionTaken);
    setResolveTarget(null);
    await refreshAll();
  };

  const onDismiss = async (alert: Alert) => {
    await dismissAlert(alert.id);
    await refreshAll();
  };

  const onDelete = async () => {
    if (!deleteTarget) return;
    await deleteSubscription(deleteTarget.id);
    setDeleteTarget(null);
    await refreshAll();
  };

  return (
    <div className="space-y-8">
      {/* F4 metric strip — asymmetric: Wasted Monthly hero at 2x weight */}
      <section aria-label="Spend metrics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <MetricCard
            label="Wasted monthly"
            value={summary ? usd.format(summary.wastedMonthly) : ""}
            hero
            tone="waste"
            loading={loading}
          />
          <MetricCard
            label="Total monthly spend"
            value={summary ? usd.format(summary.totalMonthlySpend) : ""}
            loading={loading}
          />
          <MetricCard
            label="Projected annual spend"
            value={summary ? usd0.format(summary.projectedAnnualSpend) : ""}
            loading={loading}
          />
          <MetricCard
            label="Recovered"
            value={summary ? usd.format(summary.recoveredTotal) : ""}
            tone="recovered"
            loading={loading}
          />
          <MetricCard
            label="Waste as % of spend"
            value={summary ? `${summary.wastePercent.toFixed(1)}%` : ""}
            loading={loading}
          />
        </div>
        {error && (
          <p role="alert" className="mt-4 rounded-lg border border-hairline bg-surface p-4 text-sm text-risk">
            {error}
          </p>
        )}
      </section>

      {/* Alerts + renewals row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AlertsPanel
            alerts={alerts}
            loading={alertsLoading}
            error={alertsError}
            analysisRunning={analysisRunning}
            onRunAnalysis={() => void onRunAnalysis()}
            onResolve={(a) => setResolveTarget(a)}
            onDismiss={(a) => void onDismiss(a)}
            onExport={() => window.location.assign(getAlertsCsvUrl())}
            hasOpenAlerts={alerts.length > 0}
          />
        </div>
        <RenewalsList renewals={summary?.upcomingRenewals ?? []} loading={loading} />
      </div>

      {/* Subscriptions registry */}
      <SubscriptionsTable
        subscriptions={subs.subscriptions}
        loading={subs.loading}
        error={subs.error}
        search={subs.search}
        onSearch={subs.setSearch}
        sort={subs.sort}
        order={subs.order}
        onToggleSort={subs.toggleSort}
        onAdd={() => setFormMode({ kind: "add" })}
        onEdit={(sub) => setFormMode({ kind: "edit", sub })}
        onDelete={(sub) => setDeleteTarget(sub)}
      />

      {/* Add / edit modal */}
      {formMode.kind !== "closed" && (
        <Modal
          title={formMode.kind === "add" ? "Add subscription" : "Edit subscription"}
          onClose={() => setFormMode({ kind: "closed" })}
        >
          <SubscriptionForm
            existing={formMode.kind === "edit" ? formMode.sub : null}
            onDone={() => setFormMode({ kind: "closed" })}
            onSaved={() => void refreshAll()}
          />
        </Modal>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <Modal title="Delete subscription" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-muted">
            Delete <span className="font-medium text-ink">{deleteTarget.name}</span>? Its alerts are removed too.
          </p>
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="min-h-11 rounded-lg border border-hairline px-4 text-sm text-muted hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void onDelete()}
              className="min-h-11 rounded-lg border border-hairline px-4 text-sm text-risk hover:border-risk"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}

      {/* Resolve dialog */}
      {resolveTarget && (
        <ResolveDialog
          alert={resolveTarget}
          onCancel={() => setResolveTarget(null)}
          onResolve={onResolve}
        />
      )}
    </div>
  );
}
