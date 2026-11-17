export type BillingPlan = "yearly" | "monthly";

export const subscriptionPricing = {
  yearly: 2500,
  monthly: 499,
  monthlyLookupKey: "standard_monthly",
} as const;

export const yearlySavings = subscriptionPricing.monthly * 12 - subscriptionPricing.yearly;
export const yearlySavingsPercent = Math.round(yearlySavings / (subscriptionPricing.monthly * 12) * 100);

export function isBillingPlan(value: unknown): value is BillingPlan {
  return value === "yearly" || value === "monthly";
}
