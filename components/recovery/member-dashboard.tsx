"use client";

import * as React from "react";
import { CalendarDays, ChevronLeft, ChevronRight, CircleDollarSign, FileDown, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { BrandMark } from "./brand-mark";
import { InventoryExport, type InventoryExportHandle, type InventoryRecord } from "./inventory-export";
import { LanguageToggle, useLanguage } from "./language-provider";
import { Step10Inventory, type Step10Data } from "./step10-inventory";
import { Step4Inventory, type Step4Data } from "./step4-inventory";
import { formatDisplayDate, todayIso } from "@/lib/inventory";

type AccountView = {
  alias: string;
  subscriptionStatus: string;
  currentPeriodEnd: number | null;
  membershipActive: boolean;
  hasBillingProfile: boolean;
};

function dateForYear(year: number): string {
  const today = todayIso();
  return Number(today.slice(0, 4)) === year ? today : `${String(year).padStart(4, "0")}-01-01`;
}

export function MemberDashboard() {
  const { language, t } = useLanguage();
  const currentYear = Number(todayIso().slice(0, 4));
  const [account, setAccount] = React.useState<AccountView | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [year, setYear] = React.useState(currentYear);
  const [yearDraft, setYearDraft] = React.useState(String(currentYear));
  const [selectedDate, setSelectedDate] = React.useState(todayIso());
  const [records, setRecords] = React.useState<InventoryRecord[]>([]);
  const [activeType, setActiveType] = React.useState<"step10" | "step4">("step10");
  const [message, setMessage] = React.useState("");
  const [billingBusy, setBillingBusy] = React.useState(false);
  const exportRef = React.useRef<InventoryExportHandle>(null);

  const loadAccount = React.useCallback(async () => {
    const response = await fetch("/api/account/me", { cache: "no-store" });
    if (response.status === 401) {
      setAccount(null);
      setLoading(false);
      return null;
    }
    const result = await response.json() as AccountView & { error?: string };
    if (!response.ok) throw new Error(result.error || t("Could not open your account.", "حساب باز نشد."));
    setAccount(result);
    setLoading(false);
    return result;
  }, [t]);

  const loadInventories = React.useCallback(async (requestedYear: number) => {
    const response = await fetch(`/api/inventories?year=${requestedYear}`, { cache: "no-store" });
    const result = await response.json() as { inventories?: InventoryRecord[]; error?: string };
    if (response.status === 401) return;
    if (!response.ok) throw new Error(result.error || t("Could not load this year.", "این سال بارگذاری نشد."));
    setRecords(result.inventories ?? []);
  }, [t]);

  React.useEffect(() => {
    let stopped = false;
    async function start() {
      try {
        const result = await loadAccount();
        if (!stopped && result) await loadInventories(year);
      } catch (error) {
        if (!stopped) {
          setMessage(error instanceof Error ? error.message : t("Please try again.", "لطفاً دوباره تلاش کنید."));
          setLoading(false);
        }
      }
    }
    void start();
    return () => { stopped = true; };
  }, [loadAccount, loadInventories, t, year]);

  React.useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    if (search.get("checkout") === "success") {
      const noticeTimer = window.setTimeout(() => setMessage(t("Payment received. Membership may take a few seconds to activate.", "پرداخت دریافت شد. فعال شدن عضویت ممکن است چند ثانیه طول بکشد.")), 0);
      let attempts = 0;
      const timer = window.setInterval(async () => {
        attempts += 1;
        const refreshed = await loadAccount().catch(() => null);
        if (refreshed?.membershipActive || attempts >= 6) window.clearInterval(timer);
      }, 2500);
      window.history.replaceState({}, "", "/app");
      return () => { window.clearInterval(timer); window.clearTimeout(noticeTimer); };
    }
    if (search.get("checkout") === "cancelled") {
      const noticeTimer = window.setTimeout(() => setMessage(t("Checkout was canceled. Nothing was charged.", "پرداخت لغو شد. مبلغی دریافت نشد.")), 0);
      window.history.replaceState({}, "", "/app");
      return () => window.clearTimeout(noticeTimer);
    }
  }, [loadAccount, t]);

  function chooseYear(next: number) {
    if (!Number.isInteger(next) || next < 1 || next > 9999) return;
    setYear(next);
    setYearDraft(String(next));
    setSelectedDate(dateForYear(next));
  }

  function moveMonth(offset: number) {
    const [selectedYear, selectedMonth, selectedDay] = selectedDate.split("-").map(Number);
    const targetFirst = new Date(Date.UTC(selectedYear, selectedMonth - 1 + offset, 1));
    const targetYear = targetFirst.getUTCFullYear();
    const targetMonth = targetFirst.getUTCMonth();
    const targetLastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
    const targetDate = `${String(targetYear).padStart(4, "0")}-${String(targetMonth + 1).padStart(2, "0")}-${String(Math.min(selectedDay, targetLastDay)).padStart(2, "0")}`;
    if (targetYear !== year) {
      setYear(targetYear);
      setYearDraft(String(targetYear));
    }
    setSelectedDate(targetDate);
  }

  async function saveInventory(type: "step10" | "step4", date: string, payload: Step10Data | Step4Data) {
    if (!account?.membershipActive) throw new Error(t("Renew your membership to save changes.", "برای ذخیره تغییرات، عضویت خود را تمدید کنید."));
    const response = await fetch("/api/inventories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type, date, payload }),
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) throw new Error(result.error || t("Could not save this inventory.", "این ترازنامه ذخیره نشد."));
    const savedYear = Number(date.slice(0, 4));
    if (savedYear !== year) chooseYear(savedYear);
    else await loadInventories(year);
    setSelectedDate(date);
  }

  async function openBilling(path: "checkout" | "portal") {
    setBillingBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/billing/${path}`, { method: "POST" });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || t("Billing is not available yet.", "پرداخت هنوز در دسترس نیست."));
      window.location.assign(result.url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("Please try again.", "لطفاً دوباره تلاش کنید."));
      setBillingBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/account/logout", { method: "POST" });
    // Native navigation avoids the production Vinext client-router interception error.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/recover");
  }

  if (loading) return <div className="loading-panel"><div><div className="spinner" /><p>{t("Opening your private space…", "در حال باز کردن فضای خصوصی شما…")}</p></div></div>;

  if (!account) {
    return (
      <main className="inner-page">
        <div className="member-topbar"><BrandMark /><LanguageToggle compact /></div>
        <section className="member-locked"><div><div className="member-locked-icon"><ShieldCheck /></div><h1>{t("Your account is private", "حساب شما خصوصی است")}</h1><p>{t("Use your recovery code to open it, or create a new anonymous account.", "برای ورود از کد بازیابی استفاده کنید یا یک حساب ناشناس جدید بسازید.")}</p><div className="hero-actions"><a className="button button-primary" href="/recover">{t("Use recovery code", "استفاده از کد بازیابی")}</a><a className="button button-outline" href="/join">{t("Create account", "ایجاد حساب")}</a></div></div></section>
      </main>
    );
  }

  const selectedStep10 = records.find((record) => record.type === "step10" && record.date === selectedDate);
  const selectedStep4 = records.find((record) => record.type === "step4" && record.date === selectedDate);
  const locale = language === "fa" ? "fa-IR" : "en-US";

  return (
    <main className="member-page">
      <header className="member-header">
        <div className="member-topbar">
          <BrandMark />
          <div className="member-header-actions">
            <LanguageToggle compact />
            <button className="button button-small button-outline" type="button" onClick={logout}><LogOut size={15} />{t("Sign out", "خروج")}</button>
          </div>
        </div>
      </header>
      <div className="dashboard-shell">
        <div className="dashboard-heading">
          <div><span>{t("Private member space", "فضای خصوصی اعضا")}</span><h1>{t("Welcome", "خوش آمدید")}, {account.alias}</h1></div>
          <div className={`membership-status${account.membershipActive ? "" : " inactive"}`}>
            {account.membershipActive ? <ShieldCheck size={16} /> : <CircleDollarSign size={16} />}
            {account.membershipActive ? t("Membership active", "عضویت فعال") : t("Membership inactive", "عضویت غیرفعال")}
          </div>
        </div>
        {message && <p className="dashboard-message" role="status">{message}</p>}

        <div className="dashboard-workspace">
          <aside className="dashboard-sidebar">
            <section className="dashboard-card compact-calendar-card">
              <div className="compact-calendar-header">
                <button type="button" onClick={() => moveMonth(-1)} aria-label={t("Previous month", "ماه قبل")}><ChevronLeft size={18} /></button>
                <div>
                  <strong>{new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" }).format(new Date(`${selectedDate}T12:00:00Z`))}</strong>
                  <label className="compact-year-input"><CalendarDays size={14} /><input type="number" value={yearDraft} onChange={(event) => setYearDraft(event.target.value)} onBlur={() => chooseYear(Number(yearDraft))} onKeyDown={(event) => { if (event.key === "Enter") chooseYear(Number(yearDraft)); }} aria-label={t("Calendar year", "سال تقویم")} /></label>
                </div>
                <button type="button" onClick={() => moveMonth(1)} aria-label={t("Next month", "ماه بعد")}><ChevronRight size={18} /></button>
              </div>
              <CompactCalendar locale={locale} selectedDate={selectedDate} records={records} onSelect={setSelectedDate} />
              <div className="compact-calendar-footer">
                <button type="button" onClick={() => { const today = todayIso(); const todayYear = Number(today.slice(0, 4)); setYear(todayYear); setYearDraft(String(todayYear)); setSelectedDate(today); }}>{t("Today", "امروز")}</button>
                <div className="calendar-legend"><span><i className="dot-ten" />{t("Step 10", "گام ۱۰")}</span><span><i className="dot-four" />{t("Step 4", "گام ۴")}</span></div>
              </div>
            </section>

            <section className="dashboard-card membership-card">
              <h3>{t("Membership", "عضویت")}</h3>
              <p>{account.membershipActive ? t("Your inventories can be saved privately.", "ترازنامه‌های شما به‌صورت خصوصی ذخیره می‌شوند.") : t("Saved inventories remain available to review. Renew to save new changes.", "ترازنامه‌های ذخیره‌شده برای مرور در دسترس می‌مانند. برای ذخیره تغییرات جدید، تمدید کنید.")}</p>
              <div className="membership-price"><strong>$25</strong><span>{t("per year", "در سال")}</span></div>
              {account.membershipActive || account.hasBillingProfile ? (
                <button className="button button-outline button-full" type="button" onClick={() => openBilling("portal")} disabled={billingBusy}><RefreshCw size={16} />{t("Manage or cancel", "مدیریت یا لغو")}</button>
              ) : (
                <button className="button button-primary button-full" type="button" onClick={() => openBilling("checkout")} disabled={billingBusy}><CircleDollarSign size={16} />{t("Activate membership", "فعال‌سازی عضویت")}</button>
              )}
              <p className="fine-print">{t("Auto-renews yearly until canceled. Stripe may retain the billing details required to process payment.", "تا زمان لغو، سالانه به‌طور خودکار تمدید می‌شود. Stripe ممکن است اطلاعات لازم برای پردازش پرداخت را نگه دارد.")}</p>
            </section>
          </aside>

          <section className="member-inventory-section dashboard-inventory-column">
          <div className="member-inventory-heading">
            <div><span>{t("Selected date", "تاریخ انتخاب‌شده")}</span><h2>{formatDisplayDate(selectedDate, language)}</h2></div>
            <div className="member-inventory-tools">
              <button className="button button-outline inventory-export-trigger" type="button" onClick={() => exportRef.current?.open()}><FileDown size={17} />{t("Export inventories", "خروجی ترازنامه‌ها")}</button>
              <div className="workspace-tabs" role="tablist">
                <button className={`workspace-tab${activeType === "step10" ? " is-active" : ""}`} type="button" onClick={() => setActiveType("step10")}>10 <span>{t("Daily", "روزانه")}</span></button>
                <button className={`workspace-tab${activeType === "step4" ? " is-active" : ""}`} type="button" onClick={() => setActiveType("step4")}>4 <span>{t("Personal", "شخصی")}</span></button>
              </div>
            </div>
          </div>
          <InventoryExport ref={exportRef} records={records} selectedDate={selectedDate} year={year} />
          {!account.membershipActive && <div className="setup-notice">{t("Review, print, or share saved work at any time. An active membership is needed only to save changes.", "هر زمان می‌توانید مطالب ذخیره‌شده را مرور، چاپ یا اشتراک‌گذاری کنید. عضویت فعال فقط برای ذخیره تغییرات لازم است.")}</div>}
          {activeType === "step10" ? (
            <Step10Inventory
              key={`step10-${selectedDate}-${selectedStep10?.updatedAt ?? 0}-${language}`}
              initialData={(selectedStep10?.payload as Step10Data | undefined) ?? { date: selectedDate }}
              onSave={(data) => saveInventory("step10", data.date, data)}
              onExport={() => exportRef.current?.open({ type: "step10" })}
            />
          ) : (
            <Step4Inventory
              key={`step4-${selectedDate}-${selectedStep4?.updatedAt ?? 0}-${language}`}
              initialData={(selectedStep4?.payload as Step4Data | undefined) ?? { date: selectedDate }}
              onSave={(data) => saveInventory("step4", data.date, data)}
              onExport={() => exportRef.current?.open({ type: "step4" })}
            />
          )}
          </section>
        </div>
      </div>
    </main>
  );
}

function CompactCalendar({
  locale,
  selectedDate,
  records,
  onSelect,
}: {
  locale: string;
  selectedDate: string;
  records: InventoryRecord[];
  onSelect: (date: string) => void;
}) {
  const [year, monthNumber] = selectedDate.split("-").map(Number);
  const month = monthNumber - 1;
  const weekdays = Array.from({ length: 7 }, (_, day) => new Intl.DateTimeFormat(locale, { weekday: "narrow", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 7 + day))));
  const recordMap = React.useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const record of records) {
      const set = map.get(record.date) ?? new Set<string>();
      set.add(record.type);
      map.set(record.date, set);
    }
    return map;
  }, [records]);

  const firstDay = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  return (
    <div className="compact-calendar-grid">
      <div className="calendar-weekdays">{weekdays.map((weekday, index) => <span key={`${weekday}-${index}`}>{weekday}</span>)}</div>
      <div className="calendar-days">
        {Array.from({ length: firstDay }, (_, index) => <span className="calendar-blank" key={`blank-${index}`} />)}
        {Array.from({ length: days }, (_, index) => {
          const day = index + 1;
          const date = `${String(year).padStart(4, "0")}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const types = recordMap.get(date);
          return (
            <button className={`calendar-day${selectedDate === date ? " is-selected" : ""}${date === todayIso() ? " is-today" : ""}`} type="button" key={date} onClick={() => onSelect(date)} aria-label={date}>
              <span>{new Intl.NumberFormat(locale, { useGrouping: false }).format(day)}</span>
              <i className="day-markers">{types?.has("step10") && <b className="dot-ten" />}{types?.has("step4") && <b className="dot-four" />}</i>
            </button>
          );
        })}
      </div>
    </div>
  );
}
