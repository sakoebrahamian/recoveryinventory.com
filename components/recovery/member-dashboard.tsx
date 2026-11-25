"use client";

import { dateTimeFormat } from "@/lib/languages";

import { languageLocale, localizedPath } from "@/lib/languages";

import * as React from "react";
import { BarChart3, BookOpenText, CalendarDays, ChevronLeft, ChevronRight, CircleDollarSign, FileDown, LockKeyhole, LogOut, RefreshCw, Save, ShieldCheck, UserRound, X } from "lucide-react";
import { AddEmailAccess } from "./add-email-access";
import { PasswordAccess } from "./password-access";
import { LanguageAvailability } from "./language-availability";
import { ThemePicker } from "./theme-picker";
import { BrandMark } from "./brand-mark";
import { SiteFooter } from "./site-footer";
import { InventoryExport, type InventoryExportHandle, type InventoryRecord } from "./inventory-export";
import { LanguageToggle, useLanguage } from "./language-provider";
import { Step10Inventory, type Step10Data } from "./step10-inventory";
import { Step10Analytics } from "./step10-analytics";
import { Step4Workspace } from "./step4-workspace";
import { RecoveryLearningCenter } from "./recovery-learning-center";
import { formatDisplayDate, todayIso } from "@/lib/inventory";
import { defaultReportPeriod, type ReportPeriod } from "@/lib/step10-report-period";
import { recordSiteAction } from "@/lib/site-analytics";
import { subscriptionGuidance } from "@/lib/recovery-guidance";
import { BillingTimeoutError, requestBilling } from "@/lib/billing-client";
import { SubscriptionPlanPicker } from "./subscription-plans";
import { isBillingPlan, type BillingPlan } from "@/lib/subscription-plans";
import { useSerenityJournal } from "./serenity";
import { ReflectionJournal } from "./reflection-journal";
import { reflectionLabels, reflectionText } from "@/lib/reflection-copy";
import { isReflectionKind, reflectionKinds, reflectionSlugs, type ReflectionKind } from "@/lib/reflection-journals";

type AccountView = {
  alias: string;
  email: string | null;
  hasEmailLogin: boolean;
  username: string | null;
  hasPasswordLogin: boolean;
  subscriptionStatus: string;
  currentPeriodEnd: number | null;
  membershipActive: boolean;
  step10CanSave: boolean;
  freeWeekActive: boolean;
  freeWeekEndsAt: number | null;
  freeEntriesUsed: number;
  freeEntriesLimit: number;
  hasBillingProfile: boolean;
  analyticsOwner: boolean;
};

type MemberTool = "step10" | "step4" | "analytics" | "learning" | "account" | ReflectionKind;

const trialNoticeKey = "ri-trial-notice-hidden";

function dateForYear(year: number): string {
  const today = todayIso();
  return Number(today.slice(0, 4)) === year ? today : `${String(year).padStart(4, "0")}-01-01`;
}

export function MemberDashboard() {
  const { language, t } = useLanguage();
  const translation = React.useRef(t);
  translation.current = t;
  const currentYear = Number(todayIso().slice(0, 4));
  const [account, setAccount] = React.useState<AccountView | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [year, setYear] = React.useState(currentYear);
  const [yearDraft, setYearDraft] = React.useState(String(currentYear));
  const [selectedDate, setSelectedDate] = React.useState(todayIso());
  const [records, setRecords] = React.useState<InventoryRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = React.useState(true);
  const [activeType, setActiveType] = React.useState<MemberTool>("step10");
  const [step4Dirty, setStep4Dirty] = React.useState(false);
  const [reflectionDirty, setReflectionDirty] = React.useState(false);
  const [step10Dirty, setStep10Dirty] = React.useState(false);
  const [reflectionDate, setReflectionDate] = React.useState(todayIso);
  const [analyticsVersion, setAnalyticsVersion] = React.useState(0);
  const [reportPeriod, setReportPeriod] = React.useState(() => defaultReportPeriod(todayIso()));
  // Analytics keeps its own period so it opens on the last 30 days, while Step 10 sharing keeps the selected day.
  const [analyticsPeriod, setAnalyticsPeriod] = React.useState<ReportPeriod>(() => {
    const through = todayIso();
    const from = new Date(`${through}T12:00:00Z`);
    from.setUTCDate(from.getUTCDate() - 29);
    return { mode: "range", from: from.toISOString().slice(0, 10), through };
  });
  const [message, setMessage] = React.useState("");
  const [billingBusy, setBillingBusy] = React.useState(false);
  const [billingRecovery, setBillingRecovery] = React.useState(false);
  const [promotionCode, setPromotionCode] = React.useState("");
  const [billingPlan, setBillingPlan] = React.useState<BillingPlan>("yearly");
  const [upgradeOpen, setUpgradeOpen] = React.useState(false);
  // A per-device convenience only: hiding the trial bar never affects the account.
  const [trialNoticeHidden, setTrialNoticeHidden] = React.useState(() => {
    try { return typeof window !== "undefined" && window.localStorage.getItem(trialNoticeKey) === "1"; } catch { return false; }
  });
  useSerenityJournal(account && (activeType === "step10" || activeType === "step4") ? activeType : null, selectedDate);
  React.useEffect(() => {
    if (!step10Dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [step10Dirty]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      const search = new URLSearchParams(window.location.search);
      const plan = search.get("plan");
      const tool = search.get("tool");
      if (isBillingPlan(plan)) { setBillingPlan(plan); setActiveType("account"); setUpgradeOpen(true); }
      if (isReflectionKind(tool)) setActiveType(tool);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const exportRef = React.useRef<InventoryExportHandle>(null);
  const toolPanelRef = React.useRef<HTMLElement>(null);
  const activationRecordedRef = React.useRef(false);
  const inventoriesLoadId = React.useRef(0);

  const loadAccount = React.useCallback(async () => {
    const response = await fetch("/api/account/me", { cache: "no-store" });
    if (response.status === 401) {
      setAccount(null);
      setLoading(false);
      return null;
    }
    const result = await response.json() as AccountView & { error?: string };
    if (!response.ok) throw new Error(translation.current(result.error || "Could not open your account.", "حساب باز نشد."));
    setAccount(result);
    setLoading(false);
    return result;
  }, []);

  const loadInventories = React.useCallback(async (requestedYear: number) => {
    const loadId = ++inventoriesLoadId.current;
    setRecordsLoading(true);
    try {
      const response = await fetch(`/api/inventories?year=${requestedYear}&type=step10`, { cache: "no-store" });
      const result = await response.json() as { inventories?: InventoryRecord[]; error?: string };
      if (response.status === 401) return;
      if (!response.ok) throw new Error(translation.current(result.error || "Could not load this year.", "این سال بارگذاری نشد."));
      if (loadId === inventoriesLoadId.current) setRecords(result.inventories ?? []);
    } finally {
      if (loadId === inventoriesLoadId.current) setRecordsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let stopped = false;
    async function start() {
      try {
        const result = await loadAccount();
        if (!stopped && result) await loadInventories(year);
        else if (!stopped) setRecords([]);
      } catch (error) {
        if (!stopped) {
          setMessage(error instanceof Error ? error.message : translation.current("Please try again.", "لطفاً دوباره تلاش کنید."));
          setLoading(false);
        }
      }
    }
    void start();
    return () => { stopped = true; };
  }, [loadAccount, loadInventories, year]);

  React.useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    if (search.get("checkout") === "success") {
      const noticeTimer = window.setTimeout(() => setMessage(translation.current("Payment received. Website subscription may take a few seconds to activate.", "پرداخت دریافت شد. فعال شدن اشتراک وب‌سایت ممکن است چند ثانیه طول بکشد.")), 0);
      let attempts = 0;
      const timer = window.setInterval(async () => {
        attempts += 1;
        const refreshed = await loadAccount().catch(() => null);
        if (refreshed?.membershipActive) {
          if (!activationRecordedRef.current) {
            activationRecordedRef.current = true;
            recordSiteAction("membership_activated");
          }
          await loadInventories(year).catch(() => null);
          window.clearInterval(timer);
        } else if (attempts >= 6) {
          window.clearInterval(timer);
        }
      }, 2500);
      window.history.replaceState({}, "", "/app");
      return () => { window.clearInterval(timer); window.clearTimeout(noticeTimer); };
    }
    if (search.get("checkout") === "cancelled") {
      const noticeTimer = window.setTimeout(() => setMessage(translation.current("Checkout was canceled. Nothing was charged.", "پرداخت لغو شد. مبلغی دریافت نشد.")), 0);
      window.history.replaceState({}, "", "/app");
      return () => window.clearTimeout(noticeTimer);
    }
  }, [loadAccount, loadInventories, year]);

  function confirmDiscardStep10() {
    if (activeType !== "step10" || !step10Dirty) return true;
    if (!window.confirm(reflectionText(language, "unsaved"))) return false;
    setStep10Dirty(false);
    return true;
  }

  function chooseYear(next: number) {
    if (!Number.isInteger(next) || next < 1 || next > 9999) return;
    if (!confirmDiscardStep10()) { setYearDraft(String(year)); return; }
    setYear(next);
    setYearDraft(String(next));
    setSelectedDate(dateForYear(next));
  }

  function moveMonth(offset: number) {
    if (!confirmDiscardStep10()) return;
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

  async function saveInventory(date: string, payload: Step10Data) {
    if (!account || (!account.membershipActive && !account.step10CanSave)) throw new Error(t("Your 30-day free period has ended. Subscribe to save new Step 10 entries; your saved entries remain available to read and export.", "دوره رایگان ۳۰ روزه شما پایان یافته است. برای ذخیره گام ۱۰ جدید، اشتراک انتخاب کنید؛ نوشته‌های ذخیره‌شده برای خواندن و خروجی گرفتن در دسترس می‌مانند."));
    const request = () => fetch("/api/inventories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "step10", date, payload }),
    });
    let response: Response;
    try {
      response = await request();
    } catch {
      await new Promise((resolve) => window.setTimeout(resolve, 500));
      try {
        response = await request();
      } catch {
        throw new Error(t("The connection was interrupted. Please try saving again.", "ارتباط قطع شد. لطفاً دوباره برای ذخیره تلاش کنید."));
      }
    }
    const result = await response.json().catch(() => ({})) as { error?: string; code?: string };
    if (result.code === "free_entry_limit") throw new Error(t("Your free account includes 30 daily entries. Edit a saved date during your 30-day free period, or subscribe for more days.", "حساب رایگان شامل ۳۰ ترازنامه روزانه است. در دوره رایگان ۳۰ روزه، یک تاریخ ذخیره‌شده را ویرایش کنید یا برای روزهای بیشتر اشتراک بگیرید."));
    if (result.code === "subscription_required") throw new Error(t("Your 30-day free period has ended. Subscribe to save new Step 10 entries; your saved entries remain available to read and export.", "دوره رایگان ۳۰ روزه شما پایان یافته است. برای ذخیره گام ۱۰ جدید، اشتراک انتخاب کنید؛ نوشته‌های ذخیره‌شده برای خواندن و خروجی گرفتن در دسترس می‌مانند."));
    if (!response.ok) throw new Error(translation.current(result.error || "Could not save this inventory.", "این ترازنامه ذخیره نشد."));
    const savedYear = Number(date.slice(0, 4));
    if (savedYear !== year) {
      chooseYear(savedYear);
    } else {
      setRecords((current) => {
        const existing = current.find((record) => record.type === "step10" && record.date === date);
        const saved: InventoryRecord = {
          id: existing?.id ?? `saved-step10-${date}`,
          type: "step10",
          date,
          payload,
          updatedAt: Math.floor(Date.now() / 1000),
        };
        return [...current.filter((record) => record.type !== "step10" || record.date !== date), saved]
          .sort((left, right) => left.date.localeCompare(right.date) || left.type.localeCompare(right.type));
      });
    }
    setSelectedDate(date);
    setAnalyticsVersion((value) => value + 1);
    await loadAccount().catch(() => null);
  }

  async function openBilling(path: "checkout" | "portal") {
    setBillingBusy(true);
    setBillingRecovery(false);
    setMessage("");
    try {
      const { ok, result } = await requestBilling(path, promotionCode, { plan: billingPlan, language });
      if (!ok) throw new Error(translation.current(result.error || "Billing is not available yet.", "پرداخت هنوز در دسترس نیست."));
      if (result.activated) {
        recordSiteAction("membership_activated");
        // Open a fresh workspace without keeping the billing button busy
        // while account and inventory requests finish.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/app");
        return;
      }
      if (!result.url) throw new Error(t("Billing is not available yet.", "پرداخت هنوز در دسترس نیست."));
      recordSiteAction("checkout_started");
      window.location.assign(result.url);
    } catch (error) {
      setBillingRecovery(true);
      setMessage(error instanceof BillingTimeoutError
        ? translation.current("This is taking longer than expected. Open your workspace to check your website subscription before trying again.", "این کار بیش از حد انتظار طول کشیده است. پیش از تلاش دوباره، فضای کاری خود را باز کنید و وضعیت اشتراک وب‌سایت را بررسی کنید.")
        : error instanceof Error ? error.message : translation.current("Please try again.", "لطفاً دوباره تلاش کنید."));
    } finally {
      setBillingBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/account/logout", { method: "POST" });
    // Native navigation avoids the production Vinext client-router interception error.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/recover");
  }

  function switchTool(next: MemberTool, date = selectedDate) {
    exportRef.current?.close();
    if (next === activeType) return true;
    if (!confirmDiscardStep10()) return false;
    if (activeType === "step4" && step4Dirty && !window.confirm(t("You have unsaved Step 4 changes. Continue without saving them?", "تغییرات ذخیره‌نشده گام چهارم دارید. بدون ذخیره ادامه می‌دهید؟"))) return false;
    if (reflectionDirty && !window.confirm(reflectionText(language, "unsaved"))) return false;
    setStep4Dirty(false);
    setReflectionDirty(false);
    if (isReflectionKind(next)) setReflectionDate(date);
    setActiveType(next);
    return true;
  }

  function openUpgrade(event?: React.MouseEvent) {
    event?.preventDefault();
    if (!switchTool("account")) return;
    setUpgradeOpen(true);
    window.requestAnimationFrame(() => document.getElementById("upgrade-options")?.scrollIntoView({ block: "start" }));
  }

  function hideTrialNotice() {
    setTrialNoticeHidden(true);
    try { window.localStorage.setItem(trialNoticeKey, "1"); } catch { /* storage unavailable: hide for this visit only */ }
  }

  function openToolFromShortcut(next: "learning" | "analytics") {
    if (!switchTool(next)) return;
    window.requestAnimationFrame(() => {
      toolPanelRef.current?.focus({ preventScroll: true });
      toolPanelRef.current?.scrollIntoView({ block: "start" });
    });
  }

  if (loading) return <div className="loading-panel"><div><div className="spinner" /><p>{t("Opening your private space…", "در حال باز کردن فضای خصوصی شما…")}</p></div></div>;

  if (!account) {
    const query = isReflectionKind(activeType) ? "?tool=" + activeType + "&lang=" + language : "";
    return (
      <main className="inner-page">
        <div className="member-topbar"><BrandMark /><div className="member-header-actions"><LanguageToggle /><ThemePicker /></div></div><LanguageAvailability />
        <section className="member-locked"><div><div className="member-locked-icon"><ShieldCheck /></div><h1>{t("Your account is private", "حساب شما خصوصی است")}</h1><p>{t("Log in with a username and password, an emailed code, or a private recovery code. Anonymous members can use a private username without providing a real name or email.", "با نام کاربری و رمز عبور، کد ایمیلی یا کد بازیابی خصوصی وارد شوید. اعضای ناشناس می‌توانند بدون ارائه نام واقعی یا ایمیل از نام کاربری خصوصی استفاده کنند.")}</p><div className="hero-actions"><a className="button button-primary" href={"/recover" + query}>{t("Log in", "ورود")}</a><a className="button button-outline" href={"/join" + query}>{t("Create account", "ایجاد حساب")}</a></div></div></section>
        <SiteFooter />
      </main>
    );
  }

  const selectedStep10 = records.find((record) => record.type === "step10" && record.date === selectedDate);
  const sponsorInventory = selectedStep10 ?? records.filter((record) => record.type === "step10").at(-1);
  const locale = languageLocale(language);
  const trialProgress = account.freeWeekActive && account.freeWeekEndsAt ? <span>{t("Free saving ends:", "پایان ذخیره‌سازی دوره رایگان ۳۰ روزه:")} <time dateTime={new Date(account.freeWeekEndsAt * 1000).toISOString()}>{dateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(account.freeWeekEndsAt * 1000))}</time> · {account.freeEntriesUsed}/{account.freeEntriesLimit} {t("daily entries saved", "ترازنامه روزانه ذخیره‌شده")}</span> : null;
  const freeAccountNotice = <section className="free-account-notice">
    <h2>{account.freeWeekActive ? t("Your 30-day Step 10 trial is open", "دوره رایگان ۳۰ روزه گام ۱۰ شما فعال است") : t("Your free account keeps your saved Step 10", "حساب رایگان، گام ۱۰ ذخیره‌شده شما را نگه می‌دارد")}</h2>
    <p>{account.freeWeekActive ? t("Save up to 30 daily Step 10 entries during the first 30 days after signup. Review your own analytics and choose what to export or share. No card and no automatic charge.", "در ۳۰ روز اول پس از ثبت‌نام، تا ۳۰ ترازنامه روزانه گام ۱۰ ذخیره کنید. تحلیل خود را مرور کنید و خروجی یا اشتراک‌گذاری را خودتان انتخاب کنید. بدون کارت یا برداشت خودکار.") : t("Read and export your saved Step 10 entries at any time. Subscribe when you want to save new days or use Step 4 and the AI guide.", "نوشته‌های گام ۱۰ ذخیره‌شده را هر زمان بخوانید و خروجی بگیرید. برای ذخیره روزهای جدید یا استفاده از گام ۴ و راهنمای هوش مصنوعی، اشتراک انتخاب کنید.")}</p>
    {trialProgress && <p>{trialProgress}</p>}
    <a href="#upgrade-options" onClick={openUpgrade}>{t("See optional paid plans", "مشاهده طرح‌های پولی اختیاری")}</a>
  </section>;

  return (
    <main className="member-page">
      <header className="member-header">
        <div className="member-topbar">
          <BrandMark />
          <div className="member-header-actions">
            <LanguageToggle />
            <ThemePicker />
            <button className="button button-small button-outline" type="button" onClick={logout}><LogOut size={15} />{t("Sign out", "خروج")}</button>
          </div>
        </div>
        <LanguageAvailability />
      </header>
      <div className="dashboard-shell">
        <div className="dashboard-heading">
          <div><span>{t("Private member space", "فضای خصوصی اعضا")}</span><h1>{t("Welcome", "خوش آمدید")}, {account.alias}</h1></div>
          <div className="dashboard-heading-actions">
            {account.analyticsOwner && <a className="button button-small button-outline" href="/app/site-analytics"><BarChart3 size={15} />{t("Website audience report", "گزارش مخاطبان وب‌سایت")}</a>}
            <div className={`membership-status${account.membershipActive ? "" : " inactive"}`}>
              {account.membershipActive ? <ShieldCheck size={16} /> : <CircleDollarSign size={16} />}
              {account.membershipActive ? t("Website subscription active", "اشتراک وب‌سایت فعال") : t("Free account", "حساب رایگان")}
            </div>
          </div>
        </div>
        <nav className="ri-page-shortcuts ri-workspace-shortcuts" aria-label={t("Choose a member tool", "انتخاب ابزار اعضا")}>
          <button type="button" className="button button-outline" aria-pressed={activeType === "learning"} onClick={() => openToolFromShortcut("learning")}><BookOpenText size={17} aria-hidden="true" />{t("Learn", "یادگیری")}</button>
          <button type="button" className="button button-outline" aria-pressed={activeType === "analytics"} onClick={() => openToolFromShortcut("analytics")}><BarChart3 size={17} aria-hidden="true" />{t("Step 10 analytics", "تحلیل گام ۱۰")}</button>
        </nav>
        {message && <p className="dashboard-message" role="status">{message}</p>}
        {billingRecovery && <p className="auth-switch"><a href="/app">{t("Open your workspace", "فضای کاری خود را باز کنید")}</a></p>}

        {!account.membershipActive && (account.freeWeekActive
          ? !trialNoticeHidden && activeType !== "account" && <section className="free-account-notice is-compact" aria-label={t("Your 30-day Step 10 trial is open", "دوره رایگان ۳۰ روزه گام ۱۰ شما فعال است")}>
            <strong>{t("Your 30-day Step 10 trial is open", "دوره رایگان ۳۰ روزه گام ۱۰ شما فعال است")}</strong>
            {trialProgress}
            <a href="#upgrade-options" onClick={openUpgrade}>{t("See optional paid plans", "مشاهده طرح‌های پولی اختیاری")}</a>
            <button type="button" className="notice-dismiss" onClick={hideTrialNotice} aria-label={t("Close", "بستن")} title={t("Close", "بستن")}><X size={16} aria-hidden="true" /></button>
          </section>
          : activeType !== "account" && freeAccountNotice)}

        <div className={`dashboard-workspace dashboard-workspace-${activeType}${activeType === "step10" ? "" : " no-sidebar"}`}>
          {activeType === "step10" && <aside className="dashboard-sidebar">
            {activeType === "step10" && <section className="dashboard-card compact-calendar-card">
              <div className="compact-calendar-header">
                <button type="button" onClick={() => moveMonth(-1)} aria-label={t("Previous month", "ماه قبل")}><ChevronLeft size={18} /></button>
                <div>
                  <strong>{dateTimeFormat(locale, { month: "long", timeZone: "UTC" }).format(new Date(`${selectedDate}T12:00:00Z`))}</strong>
                  <label className="compact-year-input"><CalendarDays size={14} /><input type="number" value={yearDraft} onChange={(event) => setYearDraft(event.target.value)} onBlur={() => chooseYear(Number(yearDraft))} onKeyDown={(event) => { if (event.key === "Enter") chooseYear(Number(yearDraft)); }} aria-label={t("Calendar year", "سال تقویم")} /></label>
                </div>
                <button type="button" onClick={() => moveMonth(1)} aria-label={t("Next month", "ماه بعد")}><ChevronRight size={18} /></button>
              </div>
              <CompactCalendar locale={locale} selectedDate={selectedDate} records={records} today={todayIso()} onSelect={(date) => { if (date === selectedDate || confirmDiscardStep10()) setSelectedDate(date); }} />
              <div className="compact-calendar-footer">
                <button type="button" onClick={() => { const today = todayIso(); if (today !== selectedDate && !confirmDiscardStep10()) return; const todayYear = Number(today.slice(0, 4)); setYear(todayYear); setYearDraft(String(todayYear)); setSelectedDate(today); }}>{t("Today", "امروز")}</button>
                <div className="calendar-legend"><span><i className="dot-ten" />{t("Saved Step 10", "گام ۱۰ ذخیره‌شده")}</span></div>
              </div>
            </section>}

          </aside>}

          <section className="member-inventory-section dashboard-inventory-column" ref={toolPanelRef} tabIndex={-1}>
          <div className="member-inventory-heading">
            <div>
              <span>{activeType === "account" ? t("Account", "حساب") : activeType === "analytics" ? t("Step 10 only", "فقط گام ۱۰") : activeType === "step4" ? t("Not tied to the daily calendar", "مستقل از تقویم روزانه") : activeType === "learning" ? t("Learn", "یادگیری") : isReflectionKind(activeType) ? reflectionText(language, reflectionLabels[activeType].label) : t("Selected date", "تاریخ انتخاب‌شده")}</span>
              <h2>{activeType === "account" ? t("Account and subscription", "حساب و اشتراک") : activeType === "analytics" ? t("Your patterns through today", "الگوهای شما تا امروز") : activeType === "step4" ? t("Your reusable Step 4 workbooks", "دفترهای قابل ویرایش گام چهارم شما") : activeType === "learning" ? t("Recovery learning center", "مرکز آموزش بهبودی") : isReflectionKind(activeType) ? reflectionText(language, "moreJournals") : formatDisplayDate(selectedDate, language)}</h2>
            </div>
            <div className="member-inventory-tools">
              {activeType === "step10" && <button className="button button-outline inventory-export-trigger" type="button" onClick={() => exportRef.current?.open()}><FileDown size={17} />{t("Export Step 10", "خروجی گام ۱۰")}</button>}
              <div className="workspace-tabs member-workspace-tabs" role="tablist" aria-label={t("Choose a member tool", "انتخاب ابزار اعضا")}>
                <button className={`workspace-tab${activeType === "step10" ? " is-active" : ""}`} type="button" onClick={() => switchTool("step10")} role="tab" aria-selected={activeType === "step10"}><span>{t("Step 10 Daily Inventory", "ترازنامه روزانه گام دهم")}</span></button>
                <button className={`workspace-tab${activeType === "step4" ? " is-active" : ""}`} type="button" onClick={() => switchTool("step4")} role="tab" aria-selected={activeType === "step4"}><span>{t("Step 4 Personal Inventory", "ترازنامه شخصی گام چهارم")}</span></button>
                <button className={`workspace-tab${isReflectionKind(activeType) ? " is-active" : ""}`} type="button" onClick={() => { if (!isReflectionKind(activeType)) switchTool("step67"); }} role="tab" aria-selected={isReflectionKind(activeType)}><span>{reflectionText(language, "moreJournals")}</span></button>
                <button className={`workspace-tab${activeType === "analytics" ? " is-active" : ""}`} type="button" onClick={() => switchTool("analytics")} role="tab" aria-selected={activeType === "analytics"}><BarChart3 size={16} /><span>{t("Analytics", "تحلیل")}</span></button>
                <button className={`workspace-tab${activeType === "learning" ? " is-active" : ""}`} type="button" onClick={() => switchTool("learning")} role="tab" aria-selected={activeType === "learning"}><BookOpenText size={16} /><span>{t("Learn", "یادگیری")}</span></button>
                <button className={`workspace-tab${activeType === "account" ? " is-active" : ""}`} type="button" onClick={() => switchTool("account")} role="tab" aria-selected={activeType === "account"}><UserRound size={16} /><span>{t("Account", "حساب")}</span></button>
              </div>
            </div>
          </div>
          {activeType === "step10" && (account.membershipActive || account.step10CanSave) && (
            <p className="inventory-save-reminder" role="note">
              <Save size={17} aria-hidden="true" />
              {t(
                "Save your inventory before changing dates, leaving this page, or opening another tool.",
                "پیش از تغییر تاریخ، ترک این صفحه یا باز کردن ابزار دیگری، حتماً ترازنامه خود را ذخیره کنید."
              )}
            </p>
          )}
          <InventoryExport
            ref={exportRef}
            records={records}
            selectedDate={selectedDate}
            year={year}
            reportPeriod={activeType === "analytics" ? analyticsPeriod : reportPeriod}
            refreshKey={analyticsVersion}
          />
          {activeType === "step10" ? (
            recordsLoading ? <div className="loading-panel" role="status">{t("Loading inventories…", "در حال بارگذاری ترازنامه‌ها…")}</div> : <fieldset className="inventory-access-fieldset" disabled={!account.membershipActive && !account.step10CanSave}><Step10Inventory
              key={`step10-${selectedDate}`}
              initialData={(selectedStep10?.payload as Step10Data | undefined) ?? { date: selectedDate }}
              onSave={(data) => saveInventory(data.date, data)}
              onDirtyChange={setStep10Dirty}
              onExport={() => exportRef.current?.open({ type: "step10", format: "archive" })}
              onExportChart={() => exportRef.current?.open({ format: "chart", day: selectedDate })}
              onExportPattern={() => exportRef.current?.open({ format: "pattern", day: selectedDate })}
              onOpenLearning={() => switchTool("learning")}
              onOpenMorning={account.membershipActive ? (date) => switchTool("step11", date) : undefined}
              reportPeriod={reportPeriod}
              onReportPeriodChange={setReportPeriod}
              refreshKey={analyticsVersion}
            /></fieldset>
          ) : activeType === "step4" ? (
            account.membershipActive ? <Step4Workspace onOpenLearning={() => switchTool("learning")} onDirtyChange={setStep4Dirty} /> : <section className="dashboard-card"><LockKeyhole size={24} /><h3>{t("Step 4 is included with a paid subscription", "گام ۴ همراه با اشتراک پولی است")}</h3><p>{t("Your free account includes 30 free days of Step 10. Choose a paid plan to save Step 4 workbooks and use the AI guide.", "حساب رایگان شامل ۳۰ روز رایگان گام ۱۰ است. برای ذخیره دفترهای گام ۴ و استفاده از راهنمای هوش مصنوعی، طرح پولی انتخاب کنید.")}</p><a href="#upgrade-options" className="button button-outline" onClick={openUpgrade}>{t("See optional paid plans", "مشاهده طرح‌های پولی اختیاری")}</a><a className="text-link" href="/demo?step=4">{t("Try Step 4", "گام چهارم را امتحان کنید")}</a></section>
          ) : isReflectionKind(activeType) ? (
            <>
              <nav className="ri-inventory-mode ri-reflection-navigation" aria-label={reflectionText(language, "moreJournals")}>
                {reflectionKinds.map((kind) => <button type="button" className="button button-outline" key={kind} aria-pressed={activeType === kind} onClick={() => switchTool(kind, reflectionDate)}>{reflectionText(language, kind)}</button>)}
              </nav>
              {account.membershipActive ? <ReflectionJournal key={activeType} kind={activeType} initialDate={reflectionDate} onDirtyChange={setReflectionDirty} /> : (
                <section className="dashboard-card">
                  <LockKeyhole size={24} aria-hidden="true" />
                  <h3>{reflectionText(language, activeType)}</h3>
                  <p>{reflectionText(language, reflectionLabels[activeType].intro)}</p>
                  <p>{reflectionText(language, "paidJournals")}</p>
                  <div className="ri-reflection-actions">
                    <a href="#upgrade-options" className="button button-outline" onClick={openUpgrade}>{t("See optional paid plans", "مشاهده طرح‌های پولی اختیاری")}</a>
                    <a href={localizedPath(language, "/learn/" + reflectionSlugs[activeType])} className="text-link">{t("Read guide", "مطالعه راهنما")}</a>
                  </div>
                </section>
              )}
            </>
          ) : activeType === "account" ? (
            <div className="account-panels">
              {!account.membershipActive && freeAccountNotice}
            <section className="dashboard-card membership-card">
              <h3>{t("Subscription", "اشتراک")}</h3>
              <p>{account.membershipActive ? t("Your inventories can be saved privately.", "ترازنامه‌های شما به‌صورت خصوصی ذخیره می‌شوند.") : t("Your free account and saved Step 10 entries stay with you. Upgrade in this same account whenever you choose.", "حساب رایگان و نوشته‌های گام ۱۰ ذخیره‌شده با شما می‌مانند. هر زمان خواستید، در همین حساب ارتقا دهید.")}</p>
              {!account.membershipActive && <details id="upgrade-options" open={upgradeOpen} onToggle={event => setUpgradeOpen(event.currentTarget.open)}><summary>{t("See optional paid plans", "مشاهده طرح‌های پولی اختیاری")}</summary><p>{t("Both paid plans add ongoing Step 10 saving, Step 4 workbooks, and the optional AI guide. Existing entries stay in this account.", "هر دو طرح پولی، ذخیره مداوم گام ۱۰، دفترهای گام ۴ و راهنمای اختیاری هوش مصنوعی را اضافه می‌کنند. نوشته‌های موجود در همین حساب می‌مانند.")}</p><SubscriptionPlanPicker value={billingPlan} onChange={setBillingPlan} disabled={billingBusy} /><div className="promotion-code-field"><label htmlFor="membership-promotion-code">{t("Promotion code (optional)", "کد تخفیف (اختیاری)")}</label><input id="membership-promotion-code" className="form-input" value={promotionCode} onChange={event => setPromotionCode(event.target.value)} autoComplete="off" /></div><button className="button button-primary button-full" type="button" onClick={() => openBilling("checkout")} disabled={billingBusy}>{billingBusy ? t("Opening secure checkout…", "در حال باز کردن پرداخت امن…") : t("Upgrade my account", "ارتقای حساب من")}</button></details>}
              <p className="fine-print">{subscriptionGuidance(t)}</p>
              <p>{t("Available plans: $4.99/month or $25/year.", "اشتراک‌های موجود: ماهانه ۴٫۹۹ دلار یا سالانه ۲۵ دلار.")}</p>
              <p className="fine-print">{t("View your billing period and next payment in the billing portal.", "دوره پرداخت و پرداخت بعدی خود را در پنل پرداخت ببینید.")}</p>
              {account.membershipActive || account.hasBillingProfile ? (
                <button className="button button-outline button-full" type="button" onClick={() => openBilling("portal")} disabled={billingBusy}><RefreshCw size={16} />{t("Manage or cancel", "مدیریت یا لغو")}</button>
              ) : null}
              <p className="fine-print">{t("Paid subscriptions renew automatically at your selected billing interval until canceled. Stripe may retain the billing details required to process payment.", "اشتراک‌های پولی تا زمان لغو، بر اساس دوره پرداخت انتخابی شما به‌طور خودکار تمدید می‌شوند. Stripe ممکن است اطلاعات لازم برای پردازش پرداخت را نگه دارد.")}</p>
            </section>
            <AddEmailAccess email={account.email} onConnected={(email) => setAccount((current) => current ? { ...current, email, hasEmailLogin: true } : current)} />
            <PasswordAccess username={account.username} onConfigured={(username) => setAccount((current) => current ? { ...current, username, hasPasswordLogin: true } : current)} />
            </div>
          ) : activeType === "analytics" ? (
            <Step10Analytics
              refreshKey={analyticsVersion}
              selectedDay={selectedDate}
              onOpenDate={(date) => { const nextYear = Number(date.slice(0, 4)); setYear(nextYear); setYearDraft(String(nextYear)); setSelectedDate(date); switchTool("step10"); }}
              onOpenStep10={() => switchTool("step10")}
              reportInventory={sponsorInventory?.payload as Step10Data | undefined}
              reportPeriod={analyticsPeriod}
              onReportPeriodChange={setAnalyticsPeriod}
              onExportChart={() => exportRef.current?.open({ format: "chart" })}
              onExportPattern={() => exportRef.current?.open({ format: "pattern" })}
            />
          ) : (
            <>
              <nav className="ri-reflection-actions ri-reflection-navigation" aria-label={reflectionText(language, "moreJournals")}>
                {reflectionKinds.map((kind) => <a className="button button-outline" key={kind} href={localizedPath(language, "/learn/" + reflectionSlugs[kind])}>{reflectionText(language, reflectionLabels[kind].guide)}</a>)}
              </nav>
              <RecoveryLearningCenter />
            </>
          )}
          </section>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

function CompactCalendar({
  locale,
  selectedDate,
  records,
  today,
  onSelect,
}: {
  locale: string;
  selectedDate: string;
  records: InventoryRecord[];
  today: string;
  onSelect: (date: string) => void;
}) {
  const [year, monthNumber] = selectedDate.split("-").map(Number);
  const month = monthNumber - 1;
  const weekdays = Array.from({ length: 7 }, (_, day) => dateTimeFormat(locale, { weekday: "narrow", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 7 + day))));
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
            <button className={`calendar-day${selectedDate === date ? " is-selected" : ""}${date === today ? " is-today" : ""}`} type="button" key={date} onClick={() => onSelect(date)} aria-label={date}>
              <span>{new Intl.NumberFormat(locale, { useGrouping: false }).format(day)}</span>
              <i className="day-markers">{types?.has("step10") && <b className="dot-ten" />}</i>
            </button>
          );
        })}
      </div>
    </div>
  );
}
