import { useState } from "react";
import type { Alert } from "../api/types";
import { Modal } from "./Modal";

interface ResolveDialogProps {
  alert: Alert;
  onCancel: () => void;
  onResolve: (actionTaken: string) => Promise<void>;
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function ResolveDialog({ alert, onCancel, onResolve }: ResolveDialogProps) {
  const [actionTaken, setActionTaken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onResolve(actionTaken.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve alert");
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Resolve alert" onClose={submitting ? () => undefined : onCancel}>
      <p className="text-sm text-muted">
        {alert.subscriptionName}
        {alert.estimatedMonthlySavings !== null && (
          <span className="num text-waste"> · {usd.format(alert.estimatedMonthlySavings)}/mo potential</span>
        )}
      </p>

      <label htmlFor="action-taken" className="mt-4 block text-sm font-medium text-ink">
        What did you do?
      </label>
      <textarea
        id="action-taken"
        rows={3}
        value={actionTaken}
        onChange={(e) => setActionTaken(e.target.value)}
        placeholder="e.g. Downgraded to 50 seats"
        className="mt-1 min-h-22 w-full rounded-lg border border-hairline bg-canvas p-3 text-sm text-ink placeholder:text-muted"
      />
      {error && <p role="alert" className="mt-2 text-xs text-risk">{error}</p>}

      <div className="mt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="min-h-11 rounded-lg border border-hairline px-4 text-sm text-muted hover:text-ink"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void submit()}
          disabled={submitting || actionTaken.trim().length === 0}
          className="min-h-11 rounded-lg bg-accent px-4 text-sm font-medium text-on-accent transition active:translate-y-[-1px] active:scale-[0.98] disabled:opacity-60"
        >
          {submitting ? "Resolving..." : "Resolve"}
        </button>
      </div>
    </Modal>
  );
}
