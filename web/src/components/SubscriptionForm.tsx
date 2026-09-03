import { useState, type FormEvent } from "react";
import type { Category, Subscription, SubscriptionInput } from "../api/types";
import { ApiError, createSubscription, updateSubscription } from "../api/client";

const CATEGORIES: Category[] = [
  "dev", "design", "marketing", "sales", "productivity",
  "security", "analytics", "hr", "other",
];

interface FormFieldErrors {
  [field: string]: string | undefined;
}

interface SubscriptionFormProps {
  existing?: Subscription | null;
  onDone: () => void;
  onSaved: () => void;
}

const inputClass =
  "min-h-11 w-full rounded-lg border border-hairline bg-canvas px-3 text-sm text-ink placeholder:text-muted";
const errorText = "mt-1 text-xs text-risk";

export function SubscriptionForm({ existing, onDone, onSaved }: SubscriptionFormProps) {
  const [values, setValues] = useState({
    name: existing?.name ?? "",
    vendor: existing?.vendor ?? "",
    category: existing?.category ?? ("other" as Category),
    monthlyCost: existing ? String(existing.monthlyCost) : "",
    billingCycle: existing?.billingCycle ?? ("monthly" as const),
    renewalDate: existing?.renewalDate ?? "",
    seatsProvisioned: existing ? String(existing.seatsProvisioned) : "",
    seatsActive: existing ? String(existing.seatsActive) : "",
    owningDepartment: existing?.owningDepartment ?? "",
    status: existing?.status ?? ("active" as const),
    notes: existing?.notes ?? "",
  });
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const set = (field: string, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setFieldErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = (): FormFieldErrors => {
    const errors: FormFieldErrors = {};
    if (!values.name.trim()) errors.name = "Name is required";
    if (!values.vendor.trim()) errors.vendor = "Vendor is required";
    if (!values.owningDepartment.trim()) errors.owningDepartment = "Department is required";

    const cost = Number(values.monthlyCost);
    if (!values.monthlyCost || Number.isNaN(cost) || cost <= 0) {
      errors.monthlyCost = "Monthly cost must be a positive number";
    }

    if (!values.renewalDate) {
      errors.renewalDate = "Renewal date is required";
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(values.renewalDate) || Number.isNaN(new Date(`${values.renewalDate}T00:00:00`).getTime())) {
      errors.renewalDate = "Enter a valid date (YYYY-MM-DD)";
    }

    const provisioned = Number(values.seatsProvisioned);
    const active = Number(values.seatsActive);
    if (!values.seatsProvisioned || Number.isNaN(provisioned) || provisioned < 0 || !Number.isInteger(provisioned)) {
      errors.seatsProvisioned = "Provisioned seats must be a whole number of at least 0";
    }
    if (!values.seatsActive || Number.isNaN(active) || active < 0 || !Number.isInteger(active)) {
      errors.seatsActive = "Active seats must be a whole number of at least 0";
    } else if (!Number.isNaN(provisioned) && !Number.isNaN(active) && active > provisioned) {
      errors.seatsActive = "Active seats cannot exceed provisioned seats";
    }

    return errors;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    const input: SubscriptionInput = {
      name: values.name.trim(),
      vendor: values.vendor.trim(),
      category: values.category,
      monthlyCost: Number(values.monthlyCost),
      billingCycle: values.billingCycle,
      renewalDate: values.renewalDate,
      seatsProvisioned: Number(values.seatsProvisioned),
      seatsActive: Number(values.seatsActive),
      owningDepartment: values.owningDepartment.trim(),
      status: values.status,
      notes: values.notes.trim() || null,
    };

    try {
      if (existing) {
        await updateSubscription(existing.id, input);
      } else {
        await createSubscription(input);
      }
      onSaved();
      onDone();
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        const mapped: FormFieldErrors = {};
        for (const d of err.details) mapped[d.field] = d.message;
        setFieldErrors(mapped);
      } else {
        setServerError(err instanceof Error ? err.message : "Failed to save subscription");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const label = "mb-1 block text-sm font-medium text-ink";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {serverError && (
        <p role="alert" className="rounded-lg border border-hairline bg-surface p-3 text-sm text-risk">
          {serverError}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="sub-name" className={label}>Name</label>
          <input id="sub-name" className={inputClass} value={values.name}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={!!fieldErrors.name} aria-describedby={fieldErrors.name ? "err-name" : undefined} />
          {fieldErrors.name && <p id="err-name" className={errorText}>{fieldErrors.name}</p>}
        </div>
        <div>
          <label htmlFor="sub-vendor" className={label}>Vendor</label>
          <input id="sub-vendor" className={inputClass} value={values.vendor}
            onChange={(e) => set("vendor", e.target.value)}
            aria-invalid={!!fieldErrors.vendor} aria-describedby={fieldErrors.vendor ? "err-vendor" : undefined} />
          {fieldErrors.vendor && <p id="err-vendor" className={errorText}>{fieldErrors.vendor}</p>}
        </div>
        <div>
          <label htmlFor="sub-category" className={label}>Category</label>
          <select id="sub-category" className={inputClass} value={values.category}
            onChange={(e) => set("category", e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sub-cost" className={label}>Monthly cost (USD)</label>
          <input id="sub-cost" type="number" step="0.01" min="0.01" className={`${inputClass} num`}
            value={values.monthlyCost} onChange={(e) => set("monthlyCost", e.target.value)}
            aria-invalid={!!fieldErrors.monthlyCost} aria-describedby={fieldErrors.monthlyCost ? "err-cost" : undefined} />
          {fieldErrors.monthlyCost && <p id="err-cost" className={errorText}>{fieldErrors.monthlyCost}</p>}
        </div>
        <div>
          <label htmlFor="sub-cycle" className={label}>Billing cycle</label>
          <select id="sub-cycle" className={inputClass} value={values.billingCycle}
            onChange={(e) => set("billingCycle", e.target.value)}>
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
          </select>
        </div>
        <div>
          <label htmlFor="sub-renewal" className={label}>Renewal date</label>
          <input id="sub-renewal" type="date" className={`${inputClass} num`} value={values.renewalDate}
            onChange={(e) => set("renewalDate", e.target.value)}
            aria-invalid={!!fieldErrors.renewalDate} aria-describedby={fieldErrors.renewalDate ? "err-renewal" : undefined} />
          {fieldErrors.renewalDate && <p id="err-renewal" className={errorText}>{fieldErrors.renewalDate}</p>}
        </div>
        <div>
          <label htmlFor="sub-provisioned" className={label}>Seats provisioned</label>
          <input id="sub-provisioned" type="number" min="0" step="1" className={`${inputClass} num`}
            value={values.seatsProvisioned} onChange={(e) => set("seatsProvisioned", e.target.value)}
            aria-invalid={!!fieldErrors.seatsProvisioned} aria-describedby={fieldErrors.seatsProvisioned ? "err-prov" : undefined} />
          {fieldErrors.seatsProvisioned && <p id="err-prov" className={errorText}>{fieldErrors.seatsProvisioned}</p>}
        </div>
        <div>
          <label htmlFor="sub-active" className={label}>Seats active <span className="font-normal text-muted">(last 30 days)</span></label>
          <input id="sub-active" type="number" min="0" step="1" className={`${inputClass} num`}
            value={values.seatsActive} onChange={(e) => set("seatsActive", e.target.value)}
            aria-invalid={!!fieldErrors.seatsActive} aria-describedby={fieldErrors.seatsActive ? "err-active" : undefined} />
          {fieldErrors.seatsActive && <p id="err-active" className={errorText}>{fieldErrors.seatsActive}</p>}
        </div>
        <div>
          <label htmlFor="sub-dept" className={label}>Owning department</label>
          <input id="sub-dept" className={inputClass} value={values.owningDepartment}
            onChange={(e) => set("owningDepartment", e.target.value)}
            aria-invalid={!!fieldErrors.owningDepartment} aria-describedby={fieldErrors.owningDepartment ? "err-dept" : undefined} />
          {fieldErrors.owningDepartment && <p id="err-dept" className={errorText}>{fieldErrors.owningDepartment}</p>}
        </div>
        <div>
          <label htmlFor="sub-status" className={label}>Status</label>
          <select id="sub-status" className={inputClass} value={values.status}
            onChange={(e) => set("status", e.target.value)}>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="sub-notes" className={label}>Notes <span className="font-normal text-muted">(optional)</span></label>
        <textarea id="sub-notes" rows={2} className={inputClass} value={values.notes}
          onChange={(e) => set("notes", e.target.value)} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onDone}
          className="min-h-11 rounded-lg border border-hairline px-4 text-sm text-muted hover:text-ink">
          Cancel
        </button>
        <button type="submit" disabled={submitting}
          className="min-h-11 rounded-lg bg-accent px-4 text-sm font-medium text-on-accent transition active:translate-y-[-1px] active:scale-[0.98] disabled:opacity-60">
          {submitting ? "Saving..." : existing ? "Save changes" : "Add subscription"}
        </button>
      </div>
    </form>
  );
}
