"use client";

import { languageLocale } from "@/lib/languages";

import { useId } from "react";
import { useLanguage } from "./language-provider";
import { subscriptionPricing, yearlySavings, yearlySavingsPercent, type BillingPlan } from "@/lib/subscription-plans";

export function SubscriptionSavings() {
  const { language, t } = useLanguage();
  const money = (cents: number) => new Intl.NumberFormat(languageLocale(language), {
    style: "currency", currency: "USD",
  }).format(cents / 100);
  return (
    <div className="subscription-savings">
      <strong>{t("Choose yearly and save $34.88 a year (about 58%).", "اشتراک سالانه را انتخاب کنید و هر سال ۳۴٫۸۸ دلار (حدود ۵۸٪) صرفه‌جویی کنید.")}</strong>
      <details>
        <summary>{t("How savings are calculated", "روش محاسبه صرفه‌جویی")}</summary>
        <p className="subscription-calculation" dir="ltr">
          {money(subscriptionPricing.monthly)} × 12 = {money(subscriptionPricing.monthly * 12)}<br />
          {money(subscriptionPricing.monthly * 12)} − {money(subscriptionPricing.yearly)} = {money(yearlySavings)} ({new Intl.NumberFormat(language).format(yearlySavingsPercent)}%)
        </p>
        <small>{t("Savings compare 12 monthly payments with one yearly payment, before any discounts or applicable tax.", "این صرفه‌جویی از مقایسه ۱۲ پرداخت ماهانه با یک پرداخت سالانه، پیش از تخفیف یا مالیات احتمالی، محاسبه شده است.")}</small>
      </details>
    </div>
  );
}

export function SubscriptionPlanPicker({ value, onChange, disabled = false }: {
  value: BillingPlan;
  onChange: (plan: BillingPlan) => void;
  disabled?: boolean;
}) {
  const { t } = useLanguage();
  const name = useId();
  return (
    <fieldset className="subscription-plan-picker" disabled={disabled}>
      <legend>{t("Choose your billing plan", "دوره پرداخت خود را انتخاب کنید")}</legend>
      <p className="subscription-plan-intro">{t("Same full access with either plan. Choose yearly for the best value, or monthly for a smaller upfront payment.", "هر دو اشتراک دسترسی کامل یکسانی دارند. برای صرفه‌جویی بیشتر، سالانه و برای پرداخت اولیه کمتر، ماهانه را انتخاب کنید.")}</p>
      <div className="subscription-plan-options">
        <label className={`subscription-plan-option${value === "yearly" ? " is-selected" : ""}`}>
          <input type="radio" name={name} value="yearly" checked={value === "yearly"} onChange={() => onChange("yearly")} />
          <span className="subscription-plan-content">
            <span className="subscription-plan-heading"><strong>{t("Yearly", "سالانه")}</strong><span className="subscription-value-badge">{t("Best value", "بهترین ارزش")}</span></span>
            <span className="subscription-plan-price"><bdi>$25</bdi> <small>{t("per year", "در سال")}</small></span>
            <span className="subscription-plan-detail">{t("About $2.08/month, billed $25 yearly.", "معادل حدود ۲٫۰۸ دلار در ماه؛ پرداخت سالانه ۲۵ دلار.")}</span>
          </span>
        </label>
        <label className={`subscription-plan-option${value === "monthly" ? " is-selected" : ""}`}>
          <input type="radio" name={name} value="monthly" checked={value === "monthly"} onChange={() => onChange("monthly")} />
          <span className="subscription-plan-content">
            <span className="subscription-plan-heading"><strong>{t("Monthly", "ماهانه")}</strong></span>
            <span className="subscription-plan-price"><bdi>$4.99</bdi> <small>{t("per month", "در ماه")}</small></span>
            <span className="subscription-plan-detail">{t("Billed $4.99 every month.", "پرداخت ماهانه ۴٫۹۹ دلار.")}</span>
          </span>
        </label>
      </div>
      <SubscriptionSavings />
      <p className="subscription-renewal">{t("Prices in USD. Renews automatically at your selected billing interval until canceled. Cancel anytime in the billing portal.", "قیمت‌ها به دلار آمریکا هستند. اشتراک تا زمان لغو، بر اساس دوره پرداخت انتخابی شما به‌طور خودکار تمدید می‌شود. هر زمان می‌توانید در پنل پرداخت لغو کنید.")}</p>
    </fieldset>
  );
}
