"use client";

import * as React from "react";
import { createPortal, flushSync } from "react-dom";
import { Download, Printer, Share2 } from "lucide-react";
import type { Step10AnalyticsData } from "@/lib/step10-analytics";
import type { ReportBounds } from "@/lib/step10-report-period";
import { openPrintPreview } from "@/lib/print-preview";
import { preparePatternSummary } from "@/lib/step10-pattern-summary";
import { useLanguage } from "./language-provider";

type PatternPage = { file: File; url: string };
type PreparedSummary = { pdf: File; pages: PatternPage[] };
type Props = {
  analytics: Step10AnalyticsData;
  bounds: ReportBounds;
  demo?: boolean;
  view?: "summary" | "map";
  onPrintClosed?: () => void;
};

function download(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export function Step10PatternSummary({ analytics, bounds, demo = false, view = "summary", onPrintClosed }: Props) {
  const { language, t } = useLanguage();
  const [summary, setSummary] = React.useState<PreparedSummary | null>(null);
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [failed, setFailed] = React.useState(false);
  const [format, setFormat] = React.useState<"pdf" | "png">("pdf");
  const [page, setPage] = React.useState(0);
  const [printing, setPrinting] = React.useState(false);
  const current = React.useRef<PreparedSummary | null>(null);
  const revision = React.useRef(0);
  const clearPrint = React.useRef<(() => void) | null>(null);
  const map = view === "map";
  const title = map ? t("Pattern map", "نقشه الگوها") : t("One-page pattern summary", "خلاصه یک‌صفحه‌ای الگوها");
  const activePage = summary?.pages[page];
  const number = new Intl.NumberFormat(language);
  const pageLabel = (index: number) => t("Page {page} of {total}", "صفحه {page} از {total}")
    .replace("{page}", number.format(index + 1))
    .replace("{total}", number.format(summary?.pages.length ?? 0));

  React.useEffect(() => {
    setSummary(null);
    setOpen(false);
    setBusy(false);
    setPrinting(false);
    setPage(0);
    setMessage("");
    setFailed(false);
    return () => {
      revision.current += 1;
      clearPrint.current?.();
      current.current?.pages.forEach(({ url }) => URL.revokeObjectURL(url));
      current.current = null;
    };
  }, [analytics, bounds.from, bounds.through, language, demo, view]);

  async function preview() {
    if (summary) {
      clearPrint.current?.();
      setPrinting(false);
      setOpen((value) => !value);
      return;
    }
    const version = revision.current;
    const pages: PatternPage[] = [];
    setBusy(true);
    setMessage("");
    setFailed(false);
    try {
      const files = await preparePatternSummary(analytics, bounds, language, t, demo, view);
      if (version !== revision.current) return;
      files.pngs.forEach((file) => pages.push({ file, url: URL.createObjectURL(file) }));
      await Promise.all(pages.map(async ({ url }) => {
        const image = new Image();
        image.src = url;
        await image.decode();
      }));
      if (version !== revision.current) return;
      const prepared = { pdf: files.pdf, pages };
      current.current = prepared;
      setSummary(prepared);
      setOpen(true);
    } catch {
      if (version === revision.current) {
        setFailed(true);
        setMessage(t("The summary could not be prepared. Please try again.", "خلاصه آماده نشد. لطفاً دوباره تلاش کنید."));
      }
    } finally {
      if (current.current?.pages !== pages) pages.forEach(({ url }) => URL.revokeObjectURL(url));
      if (version === revision.current) setBusy(false);
    }
  }

  async function share() {
    if (!summary || !activePage) return;
    const file = format === "pdf" ? summary.pdf : activePage.file;
    setFailed(false);
    setMessage("");
    try {
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title, files: [file] });
        setMessage(map ? t("Pattern map shared.", "نقشه الگوها به اشتراک گذاشته شد.") : t("Summary share completed.", "اشتراک خلاصه انجام شد."));
        return;
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
    }
    download(file);
    setMessage(t("File sharing is unavailable here. The file was downloaded so you can attach it yourself.", "اشتراک فایل در اینجا در دسترس نیست. فایل دانلود شد تا خودتان آن را پیوست کنید."));
  }

  function print() {
    if (!summary) return;
    flushSync(() => setPrinting(true));
    clearPrint.current = openPrintPreview("pattern-summary-printing", summary.pdf.name.replace(/\.pdf$/, ""), () => {
      setPrinting(false);
      onPrintClosed?.();
    });
  }

  const previewLabel = map
    ? open ? t("Hide pattern map preview", "پنهان کردن پیش‌نمایش نقشه الگوها") : t("Preview pattern map", "پیش‌نمایش نقشه الگوها")
    : open ? t("Hide summary preview", "پنهان کردن پیش‌نمایش خلاصه") : t("Preview one-page summary", "پیش‌نمایش خلاصه یک‌صفحه‌ای");

  return (
    <section className="pattern-summary-export" aria-label={title}>
      <div>
        <h4>{title}</h4>
        {map ? <p className="pattern-method-note">{t("Saved answers only. Written reflections and notes stay private.", "فقط پاسخ‌های ذخیره‌شده. نوشته‌ها و یادداشت‌ها خصوصی می‌مانند.")}</p> : <>
          <p>{t("A landscape sheet with all 24 principles, answer totals, recurring patterns, and a timeline for your selected dates. Preview it, print it, or save and share a PDF or image.", "یک برگه افقی با هر ۲۴ اصل، مجموع پاسخ‌ها، الگوهای تکرارشونده و خط زمانیِ تاریخ‌های انتخاب‌شده. آن را پیش‌نمایش کنید، چاپ کنید یا به‌صورت PDF یا تصویر ذخیره و به اشتراک بگذارید.")}</p>
          <p className="pattern-method-note">{t("This summary contains answer counts only. Written reflections and notes are not included. Review the preview before sharing.", "این خلاصه فقط شمارش پاسخ‌ها را دارد و نوشته‌ها و یادداشت‌ها را شامل نمی‌شود. پیش از اشتراک، پیش‌نمایش را بررسی کنید.")}</p>
        </>}
      </div>
      <button type="button" className="button button-primary" disabled={busy} aria-expanded={open} onClick={() => void preview()}>
        {busy ? t("Preparing summary…", "در حال آماده‌سازی خلاصه…") : previewLabel}
      </button>
      {open && summary && activePage && (
        <div className="pattern-summary-preview">
          {summary.pages.length > 1 && (
            <div className="pattern-summary-pages">
              <select aria-label={title} value={page} onChange={(event) => setPage(Number(event.target.value))}>
                {summary.pages.map(({ url }, index) => <option key={url} value={index}>{pageLabel(index)}</option>)}
              </select>
              <small>{t("PDF includes every page. PNG includes the displayed page.", "PDF شامل همه صفحه‌هاست. PNG شامل صفحه نمایش‌داده‌شده است.")}</small>
            </div>
          )}
          <div className="pattern-summary-export-actions">
            <button type="button" className="button button-outline button-small" onClick={() => download(summary.pdf)}><Download size={16} />{t("Download PDF", "دانلود PDF")}</button>
            <button type="button" className="button button-outline button-small" onClick={() => download(activePage.file)}><Download size={16} />{t("Download image (PNG)", "دانلود تصویر (PNG)")}</button>
            <button type="button" className="button button-outline button-small" disabled={printing} onClick={print}><Printer size={16} />{t("Print / Save PDF", "چاپ / ذخیره PDF")}</button>
            <label>{t("Share format", "قالب اشتراک")}<select value={format} onChange={(event) => setFormat(event.target.value as "pdf" | "png")}><option value="pdf">PDF</option><option value="png">PNG</option></select></label>
            <button type="button" className="button button-outline button-small" onClick={() => void share()}><Share2 size={16} />{map ? t("Share pattern map", "اشتراک نقشه الگوها") : t("Share summary", "اشتراک خلاصه")}</button>
          </div>
          <figure>
            <a href={activePage.url} target="_blank" rel="noopener noreferrer" aria-label={t("Open full-size summary image", "باز کردن تصویر خلاصه در اندازه کامل")}>
              <img className="pattern-summary-sheet" src={activePage.url} width={3200} height={2264} alt={map ? title : t("One-page chart of all 24 principles, answer counts, recurring patterns, and selected-date timeline", "نمودار یک‌صفحه‌ایِ هر ۲۴ اصل، شمارش پاسخ‌ها، الگوهای تکرارشونده و خط زمانی تاریخ‌های انتخاب‌شده")} />
            </a>
          </figure>
        </div>
      )}
      {message && <p role={failed ? "alert" : "status"}>{message}</p>}
      {printing && summary && createPortal(
        <div className="pattern-summary-print-root">
          {summary.pages.map(({ url }, index) => (
            <div className="pattern-print-sheet" key={url}><img src={url} alt={summary.pages.length > 1 ? title + " · " + pageLabel(index) : title} /></div>
          ))}
        </div>,
        document.body
      )}
    </section>
  );
}
