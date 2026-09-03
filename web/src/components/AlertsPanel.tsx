import type { Alert } from "../api/types";
import { FlagTypeBadge } from "./FlagTypeBadge";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

interface AlertsPanelProps {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
  analysisRunning: boolean;
  onRunAnalysis: () => void;
  onResolve: (alert: Alert) => void;
  onDismiss: (alert: Alert) => void;
  onExport: () => void;
  hasOpenAlerts: boolean;
}

function SparkGlyph() {
  return (
    <svg width="40" height="24" viewBox="0 0 40 24" fill="none" aria-hidden="true" className="opacity-40">
      <path d="M2 18l6-8 5 5 7-12 6 9 5-4 7 8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function CheckGlyph() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true" className="opacity-40">
      <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.5 14.5l4 4 7-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AlertsPanel({
  alerts,
  loading,
  error,
  analysisRunning,
  onRunAnalysis,
  onResolve,
  onDismiss,
  onExport,
  hasOpenAlerts,
}: AlertsPanelProps) {
  return (
    <section aria-label="Optimization alerts" className="rounded-card bg-surface p-5 shadow-whisper">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          Optimization alerts
          <span className="num ml-2 rounded-full border border-hairline px-2 py-0.5 text-xs text-muted" aria-live="polite">
            {alerts.length}
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExport}
            disabled={!hasOpenAlerts}
            title={hasOpenAlerts ? "Download the waste report" : "No open alerts to export"}
            aria-disabled={!hasOpenAlerts}
            className="min-h-11 rounded-lg border border-hairline px-4 text-sm text-ink transition hover:border-accent disabled:opacity-50"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={onRunAnalysis}
            disabled={analysisRunning}
            className={`min-h-11 rounded-lg bg-accent px-4 text-sm font-medium text-on-accent transition active:translate-y-[-1px] active:scale-[0.98] disabled:opacity-70 ${
              analysisRunning ? "analysis-running" : ""
            }`}
          >
            {analysisRunning ? "Analyzing..." : "Run analysis"}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-hairline p-3 text-sm text-risk">
          {error}
        </p>
      )}

      {loading ? (
        <ul className="mt-4 space-y-2" aria-label="Loading alerts">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="skeleton h-16 w-full" />
          ))}
        </ul>
      ) : alerts.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 py-8 text-muted">
          {hasOpenAlerts === false && loading === false ? <CheckGlyph /> : <SparkGlyph />}
          <p className="text-sm">
            {hasOpenAlerts === false ? "No open alerts. Your stack looks clean." : "Run analysis to detect waste."}
          </p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-hairline" aria-label="Open alerts by potential savings">
          {alerts.map((alert, i) => (
            <li
              key={alert.id}
              style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
              className="row-cascade flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <FlagTypeBadge flagType={alert.flagType} />
                  <span className="truncate font-medium text-ink">{alert.subscriptionName}</span>
                </div>
                <p className="mt-1 truncate text-sm text-muted" title={alert.recommendation}>
                  {alert.recommendation}
                </p>
              </div>
              <div className="flex items-center gap-3 sm:justify-end">
                {alert.estimatedMonthlySavings !== null ? (
                  <span className="num whitespace-nowrap font-medium text-waste">
                    +{usd.format(alert.estimatedMonthlySavings)}/mo
                  </span>
                ) : (
                  <span className="num whitespace-nowrap text-sm text-muted">Risk</span>
                )}
                <button
                  type="button"
                  onClick={() => onResolve(alert)}
                  className="min-h-11 rounded-lg border border-hairline px-3 text-xs text-accent transition hover:border-accent"
                >
                  Resolve
                </button>
                <button
                  type="button"
                  onClick={() => onDismiss(alert)}
                  className="min-h-11 rounded-lg border border-hairline px-3 text-xs text-muted transition hover:text-ink"
                >
                  Dismiss
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
