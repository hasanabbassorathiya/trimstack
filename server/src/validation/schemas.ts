import { z } from "zod";

const categoryEnum = z.enum([
  "dev", "design", "marketing", "sales", "productivity",
  "security", "analytics", "hr", "other",
]);
const billingCycleEnum = z.enum(["monthly", "annual"]);
const statusEnum = z.enum(["active", "trial", "cancelled"]);

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD")
  .refine((s) => {
    const d = new Date(`${s}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
  }, {
    message: "must be a valid calendar date",
  });

const seatsActiveBody = z.number().int("must be a whole number").min(0);

export const subscriptionCreateSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    vendor: z.string().min(1, "Vendor is required"),
    category: categoryEnum,
    monthlyCost: z.number().positive("must be greater than 0"),
    billingCycle: billingCycleEnum,
    renewalDate: isoDate,
    seatsProvisioned: z.number().int("must be a whole number").min(0),
    seatsActive: seatsActiveBody,
    owningDepartment: z.string().min(1, "Department is required"),
    status: statusEnum,
    notes: z.string().nullable().optional(),
  })
  .refine((data) => data.seatsActive <= data.seatsProvisioned, {
    message: "Active seats cannot exceed provisioned seats",
    path: ["seatsActive"],
  });

export const subscriptionUpdateSchema = z
  .object({
    name: z.string().min(1, "Name is required").optional(),
    vendor: z.string().min(1, "Vendor is required").optional(),
    category: categoryEnum.optional(),
    monthlyCost: z.number().positive("must be greater than 0").optional(),
    billingCycle: billingCycleEnum.optional(),
    renewalDate: isoDate.optional(),
    seatsProvisioned: z.number().int("must be a whole number").min(0).optional(),
    seatsActive: seatsActiveBody.optional(),
    owningDepartment: z.string().min(1, "Department is required").optional(),
    status: statusEnum.optional(),
    notes: z.string().nullable().optional(),
  })
  .refine(
    (data) =>
      data.seatsActive === undefined ||
      data.seatsProvisioned === undefined ||
      data.seatsActive <= data.seatsProvisioned,
    { message: "Active seats cannot exceed provisioned seats", path: ["seatsActive"] },
  );

export const resolveAlertSchema = z.object({
  actionTaken: z.string().min(1, "Action taken is required"),
});

export type SubscriptionCreateInput = z.infer<typeof subscriptionCreateSchema>;
export type SubscriptionUpdateInput = z.infer<typeof subscriptionUpdateSchema>;
