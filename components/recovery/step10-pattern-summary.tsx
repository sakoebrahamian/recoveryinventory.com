"use client";

import * as React from "react";
import { createPortal, flushSync } from "react-dom";
import { Download, Printer, Share2 } from "lucide-react";
import type { Step10AnalyticsData } from "@/lib/step10-analytics";
import type { ReportBounds } from "@/lib/step10-report-period";
import { preparePatternSummary } from "@/lib/step10-pattern-summary";
import { useLanguage } from "./language-provider";

type PreparedSummary = Awaited<ReturnType<typeof preparePatternSummary>> & { url: string };

export function Step10PatternSummary({ analytics, bounds, demo = false }: { analytics: Step10AnalyticsData; bounds: ReportBounds; demo?: boolean }) {
  const { language, t } = useLanguage();
  const [summary, setSummary] = React.useState<PreparedSummary | null>(null);
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [failed, setFailed] = React.useState(false);
  const [format, setFormat] = React.useState<"pdf" | "png">("pdf");
  const [printing, setPrinting] = React.useState(false);
  const current = React.useRef<PreparedSummary | null>(null);
  const revision = React.useRef(0);
  const restorePrint = React.useRef<(() => void) | null>(null);
  React.useEffect(() => {
    revision.current += 1;
    setSummary(null); setOpen(false); setBusy(false); setReady(false); setMessage(""); setFailed(false);
    return () => {
      revision.current += 1;
      if (current.current) URL.revokeObjectURL(current.current.url);
      current.current = null;
      restorePrint.current?.();
    };
  }, [analytics, bounds.from, bounds.through, language, demo]);

  async function preview() {
    if (summary) { setOpen((value) => !value); return; }
    const version = revision.current;
    setBusy(true); setMessage(""); setFailed(false);
    try {
      const files = await preparePatternSummary(analytics, bounds, language, t, demo);
      if (version !== revision.current) return;
      const prepared = { ...files, url: URL.createObjectURL(files.png) };
      current.current = prepared;
      setSummary(prepared); setOpen(true);
    } catch {
      if (version === revision.current) { setFailed(true); setMessage(t("The summary could not be prepared. Please try again.", "خلاصه آماده نشد. لطفاً دوباره تلاش کنید.")); }
    } finally { if (version === revision.current) setBusy(false); }
  }
  function download(file: File) {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url; link.download = file.name;
    document.body.appendChild(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  async function share() {
    if (!summary) return;
    const file = summary[format];
    setFailed(false); setMessage("");
    try {
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: t("One-page pattern summary", "خلاصه یک‌صفحه‌ای الگوها"), files: [file] });
        setMessage(t("Summary share completed.", "اشتراک خلاصه انجام شد."));
        return;
      }
    } catch (error) { if ((error as Error).name === "AbortError") return; }
    download(file);
    setMessage(t("File sharing is unavailable here. The summary was downloaded so you can attach it yourself.", "اشتراک فایل در اینجا در دسترس نیست. خلاصه دانلود شد تا خودتان آن را پیوست کنید."));
  }
  function print() {
    if (!summary || !ready) return;
    const title = document.title;
    const restore = () => {
      document.documentElement.classList.remove("pattern-summary-printing");
      document.title = title;
      window.removeEventListener("afterprint", restore);
      restorePrint.current = null;
      setPrinting(false);
    };
    restorePrint.current = restore;
    flushSync(() => setPrinting(true));
    document.documentElement.classList.add("pattern-summary-printing");
    document.title = summary.pdf.name.replace(/\.pdf$/, "");
    window.addEventListener("afterprint", restore, { once: true });
    try { window.print(); } catch { restore(); }
  }
  return <section className="pattern-summary-export" aria-label={t("One-page pattern summary", "خلاصه یک‌صفحه‌ای الگوها")}>
    <div><h4>{t("One-page pattern summary", "خلاصه یک‌صفحه‌ای الگوها")}</h4><p>{t("A landscape sheet with all 24 principles, answer totals, recurring patterns, and a timeline for your selected dates. Preview it, print it, or save and share a PDF or image.", "یک برگه افقی با هر ۲۴ اصل، مجموع پاسخ‌ها، الگوهای تکرارشونده و خط زمانیِ تاریخ‌های انتخاب‌شده. آن را پیش‌نمایش کنید، چاپ کنید یا به‌صورت PDF یا تصویر ذخیره و به اشتراک بگذارید.")}</p><p className="pattern-method-note">{t("This summary contains answer counts only. Written reflections and notes are not included. Review the preview before sharing.", "این خلاصه فقط شمارش پاسخ‌ها را دارد و نوشته‌ها و یادداشت‌ها را شامل نمی‌شود. پیش از اشتراک، پیش‌نمایش را بررسی کنید.")}</p></div>
    <button type="button" className="button button-primary" disabled={busy} aria-expanded={open} onClick={() => void preview()}>{busy ? t("Preparing summary…", "در حال آماده‌سازی خلاصه…") : open ? t("Hide summary preview", "پنهان کردن پیش‌نمایش خلاصه") : t("Preview one-page summary", "پیش‌نمایش خلاصه یک‌صفحه‌ای")}</button>
    {open && summary && <div className="pattern-summary-preview">
      <div className="pattern-summary-export-actions">
        <button type="button" className="button button-outline button-small" onClick={() => download(summary.pdf)}><Download size={16} />{t("Download PDF", "دانلود PDF")}</button>
        <button type="button" className="button button-outline button-small" onClick={() => download(summary.png)}><Download size={16} />{t("Download image (PNG)", "دانلود تصویر (PNG)")}</button>
        <button type="button" className="button button-outline button-small" disabled={!ready} onClick={print}><Printer size={16} />{t("Print / Save PDF", "چاپ / ذخیره PDF")}</button>
        <label>{t("Share format", "قالب اشتراک")}<select value={format} onChange={(event) => setFormat(event.target.value as "pdf" | "png")}><option value="pdf">PDF</option><option value="png">PNG</option></select></label>
        <button type="button" className="button button-outline button-small" onClick={() => void share()}><Share2 size={16} />{t("Share summary", "اشتراک خلاصه")}</button>
      </div>
      <figure><a href={summary.url} target="_blank" rel="noopener noreferrer" aria-label={t("Open full-size summary image", "باز کردن تصویر خلاصه در اندازه کامل")}><img className="pattern-summary-sheet" src={summary.url} width={3200} height={2264} alt={t("One-page chart of all 24 principles, answer counts, recurring patterns, and selected-date timeline", "نمودار یک‌صفحه‌ایِ هر ۲۴ اصل، شمارش پاسخ‌ها، الگوهای تکرارشونده و خط زمانی تاریخ‌های انتخاب‌شده")} onLoad={() => setReady(true)} /></a><figcaption>{t("Tap the preview to see the full-size image. Print in landscape and fit to one page; turn off browser headers and footers.", "برای دیدن تصویر در اندازه کامل، پیش‌نمایش را لمس کنید. به‌صورت افقی و متناسب با یک صفحه چاپ کنید؛ سربرگ و پابرگ مرورگر را خاموش کنید.")}</figcaption></figure>
    </div>}
    {message && <p role={failed ? "alert" : "status"}>{message}</p>}
    {printing && summary && createPortal(<div className="pattern-summary-print-root"><style>{`@media print { @page { size: A4 landscape; margin: 8mm; } }`}</style><img src={summary.url} alt={t("One-page pattern summary", "خلاصه یک‌صفحه‌ای الگوها")} /></div>, document.body)}
  </section>;
}
