import { formatDisplayDate, principles, type Language } from "@/lib/inventory";
import type { Step10AnalyticsData } from "@/lib/step10-analytics";
import { buildStep10Patterns } from "@/lib/step10-patterns";
import type { ReportBounds } from "@/lib/step10-report-period";

type Translate = (en: string, fa: string) => string;
const kinds = ["practiced", "attention", "na", "unanswered"] as const;
const colors = { practiced: "#28734e", attention: "#b95d1c", na: "#b9a4d8", unanswered: "#d5dfd9" };
const symbols = { practiced: "+", attention: "!", na: "–", unanswered: "?" };
const width = 1600;
const height = 1132;
const escape = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Counts only: saved writing, account details, and previous-period data never enter the sheet. */
export function patternSummaryData(analytics: Step10AnalyticsData, bounds: ReportBounds) {
  const days = analytics.days.filter((day) => day.date >= bounds.from && day.date <= bounds.through);
  const patterns = buildStep10Patterns({ ...analytics, days }, bounds);
  const totals = patterns.rows.reduce((sum, row) => {
    for (const kind of kinds) sum[kind] += row[kind];
    return sum;
  }, { practiced: 0, attention: 0, na: 0, unanswered: 0 });
  const chunk = Math.max(1, Math.ceil(patterns.buckets.length / 48));
  const timeline = [];
  for (let index = 0; index < patterns.buckets.length; index += chunk) {
    const buckets = patterns.buckets.slice(index, index + chunk);
    const counts = { practiced: 0, attention: 0, na: 0, unanswered: 0 };
    for (const row of patterns.rows) for (const cell of row.cells.slice(index, index + chunk)) for (const kind of kinds) counts[kind] += cell[kind];
    const from = buckets[0].from;
    const through = buckets.at(-1)!.through;
    timeline.push({ from, through, ...counts, savedDays: days.filter((day) => day.date >= from && day.date <= through).length });
  }
  return { ...patterns, totals, timeline, savedDays: days.length, calendarDays: Math.round((Date.parse(bounds.through) - Date.parse(bounds.from)) / 86400000) + 1 };
}

export function step10PatternSummarySvg(analytics: Step10AnalyticsData, bounds: ReportBounds, language: Language, t: Translate, demo = false) {
  const data = patternSummaryData(analytics, bounds);
  const rtl = language === "fa";
  const locale = rtl ? "fa-IR" : language === "es" ? "es-US" : "en-US";
  const number = (value: number) => new Intl.NumberFormat(locale).format(value);
  const name = (id: string) => principles.find((p) => p.id === id)?.[language] ?? id;
  const labels = { practiced: t("Practiced", "تمرین کردم"), attention: t("Needs attention", "نیازمند توجه"), na: t("Didn’t come up today", "امروز پیش نیامد"), unanswered: t("Not answered", "پاسخ داده نشده") };
  const title = t("One-page pattern summary", "خلاصه یک‌صفحه‌ای الگوها");
  const range = bounds.from === bounds.through ? formatDisplayDate(bounds.from, language) : `${formatDisplayDate(bounds.from, language)} – ${formatDisplayDate(bounds.through, language)}`;
  const parts: string[] = [`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="summary-title summary-description"><title id="summary-title">${escape(title)}</title><desc id="summary-description">${escape(range)}</desc><rect width="1600" height="1132" fill="white"/><g font-family="Arial, Tahoma, sans-serif" fill="#173f3a">`];
  function rect(x: number, y: number, w: number, h: number, fill: string, radius = 0, stroke?: string) {
    parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}"${stroke ? ` stroke="${stroke}"` : ""}/>`);
  }
  function text(value: string, x: number, y: number, size: number, max: number, bold = false, direction = rtl, center = false) {
    const estimated = value.length * size * (bold ? .65 : .58);
    parts.push(`<text x="${center ? x + max / 2 : direction ? x + max : x}" y="${y}" font-size="${size}"${bold ? ' font-weight="700"' : ""} direction="${direction ? "rtl" : "ltr"}" text-anchor="${center ? "middle" : "start"}"${estimated > max ? ` textLength="${max}" lengthAdjust="spacingAndGlyphs"` : ""}>${escape(value)}</text>`);
  }
  function lines(value: string, x: number, y: number, max: number, size = 19) {
    let line = "";
    let offset = 0;
    for (const word of value.split(/\s+/)) {
      if (line && (line.length + word.length + 1) * size * .55 > max) { text(line, x, y + offset, size, max); line = word; offset += size * 1.4; }
      else line = line ? `${line} ${word}` : word;
    }
    if (line) text(line, x, y + offset, size, max);
  }
  function bar(counts: typeof data.totals, x: number, y: number, w: number, h: number) {
    const total = kinds.reduce((sum, kind) => sum + counts[kind], 0);
    rect(x, y, w, h, "#f1f4f1", 3, "#cedbd1");
    let offset = 0;
    for (const kind of kinds) {
      const part = total ? counts[kind] / total * w : 0;
      if (part) rect(rtl ? x + w - offset - part : x + offset, y, part, h, colors[kind]);
      offset += part;
    }
  }
  text("RECOVERY INVENTORY · recoveryinventory.com", 56, 40, 16, 1000, true, false);
  text(demo ? t("Sample data", "داده نمونه") : t("Saved answers only", "فقط پاسخ‌های ذخیره‌شده"), 1130, 40, 16, 414, false, rtl);
  text(title, 56, 88, 34, 1488, true);
  text(range, 56, 125, 21, 1488);
  const stats = [{ label: t("Saved days", "روزهای ذخیره‌شده"), value: `${number(data.savedDays)} / ${number(data.calendarDays)}` }, ...kinds.map((kind) => ({ label: labels[kind], value: number(data.totals[kind]) }))];
  stats.forEach((stat, index) => {
    const x = 56 + (rtl ? 4 - index : index) * 300;
    rect(x, 149, 288, 86, "#f4f8f3", 10);
    text(stat.label, x + 16, 176, 17, 256);
    text(stat.value, x + 16, 214, 28, 256, true, false);
  });
  kinds.forEach((kind, index) => {
    const x = 56 + (rtl ? 3 - index : index) * 375;
    rect(rtl ? x + 346 : x, 254, 24, 24, colors[kind], 3);
    text(symbols[kind], rtl ? x + 346 : x, 272, 17, 24, true, false, true);
    text(labels[kind], rtl ? x : x + 34, 273, 19, 337);
  });
  (["strengths", "focus"] as const).forEach((kind, index) => {
    const x = 56 + (rtl ? 1 - index : index) * 756;
    rect(x, 297, 732, 112, kind === "strengths" ? "#edf6ef" : "#fff1e8", 10);
    text(kind === "strengths" ? t("Consistent practice", "تمرین پیوسته") : t("Recurring needs for attention", "نیازهای تکرارشونده به توجه"), x + 20, 328, 21, 692, true);
    const fallback = data.savedDays < 3 ? t("More recorded days are needed to identify a repeated pattern.", "برای شناسایی الگوی تکرارشونده، روزهای ثبت‌شده بیشتری لازم است.") : t("No repeated pattern meets this threshold.", "هیچ الگوی تکرارشونده‌ای به این آستانه نرسیده است.");
    lines(data[kind].length ? data[kind].map((row) => name(row.id)).join(" · ") : fallback, x + 20, 360, 692, 20);
  });
  text(t("24 journal principles", "۲۴ اصل این دفتر"), 56, 447, 23, 680, true);
  text(t("Counts in legend order: + / ! / – / ?", "شمارش به ترتیب راهنما: + / ! / – / ?"), 824, 447, 17, 720);
  data.rows.forEach((row, index) => {
    const column = Math.floor(index / 12);
    const x = 56 + (rtl ? 1 - column : column) * 756;
    const y = 480 + index % 12 * 30;
    rect(x, y + 9, 732, 1, "#e5ece7");
    text(name(row.id), rtl ? x + 504 : x, y, 18, 228, true);
    bar(row, rtl ? x + 190 : x + 238, y - 16, 295, 18);
    text((rtl ? [...kinds].reverse() : kinds).map((kind) => number(row[kind])).join(" / "), rtl ? x : x + 548, y, 17, 180, false, false);
  });
  text(t("Answers across the selected dates", "پاسخ‌ها در تاریخ‌های انتخاب‌شده"), 56, 865, 22, 1488, true);
  const step = 1488 / Math.max(1, data.timeline.length);
  const tickEvery = Math.max(1, Math.ceil(data.timeline.length / 15));
  const shortDate = new Intl.DateTimeFormat(locale, { month: "numeric", day: "numeric", ...(data.calendarDays > 366 ? { year: "2-digit" as const } : {}), timeZone: "UTC" });
  data.timeline.forEach((point, index) => {
    const x = 56 + (rtl ? data.timeline.length - index - 1 : index) * step;
    const total = kinds.reduce((sum, kind) => sum + point[kind], 0);
    rect(x + 2, 885, step - 5, 84, "#fafbf9", 2, "#c6d5cb");
    let offset = 0;
    if (!point.savedDays) text("·", x + 2, 939, 30, step - 5, true, false, true);
    for (const kind of kinds) {
      const part = total ? point[kind] / total * 84 : 0;
      if (part) rect(x + 2, 969 - offset - part, step - 5, part, colors[kind]);
      offset += part;
    }
    if (index % tickEvery === 0) text(shortDate.format(new Date(`${point.from}T12:00:00Z`)), x, 994, 15, Math.min(step * tickEvery - 5, 1544 - x), false, rtl);
  });
  lines(t("Bars show the mix of saved answers. Timeline labels mark the start of each period; blank periods have no saved inventory. Main and follow-up questions count separately.", "نوارها ترکیب پاسخ‌های ذخیره‌شده را نشان می‌دهند. برچسب‌های خط زمانی آغاز هر بازه‌اند؛ بازه خالی ترازنامه ذخیره‌شده ندارد. پرسش‌های اصلی و تکمیلی جداگانه شمرده می‌شوند."), 56, 1030, 1488, 16);
  lines(t("Pattern callouts require scored answers on at least three days. Didn’t come up today, unanswered questions, and missing days are not negative answers. This is not a recovery grade.", "الگوهای برجسته به پاسخ‌های تمرین کردم یا نیازمند توجه در دست‌کم سه روز نیاز دارند. «امروز پیش نیامد»، پرسش‌های بی‌پاسخ و روزهای ثبت‌نشده پاسخ منفی نیستند. این نمره بهبودی نیست."), 56, 1070, 1488, 16);
  text(t("Summary only · no written reflections or notes", "فقط خلاصه · بدون نوشته‌ها و یادداشت‌ها"), 56, 1110, 14, 1488);
  parts.push("</g></svg>");
  return parts.join("");
}

/** A single landscape page containing the full-resolution image, including shaped RTL text. */
export function patternSummaryPdf(jpeg: Uint8Array, imageWidth: number, imageHeight: number): Uint8Array {
  const encode = (value: string) => new TextEncoder().encode(value);
  const chunks: Uint8Array[] = [];
  let length = 0;
  const offsets = [0];
  const add = (value: string | Uint8Array) => { const bytes = typeof value === "string" ? encode(value) : value; chunks.push(bytes); length += bytes.length; };
  const object = (id: number, value: string) => { offsets[id] = length; add(`${id} 0 obj\n${value}\nendobj\n`); };
  add("%PDF-1.4\n");
  object(1, "<< /Type /Catalog /Pages 2 0 R >>");
  object(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  object(3, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /XObject << /Summary 4 0 R >> >> /Contents 5 0 R >>");
  offsets[4] = length;
  add(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);
  add(jpeg);
  add("\nendstream\nendobj\n");
  const scale = Math.min(806 / imageWidth, 559 / imageHeight);
  const w = imageWidth * scale;
  const h = imageHeight * scale;
  const content = `q ${w} 0 0 ${h} ${(842 - w) / 2} ${(595 - h) / 2} cm /Summary Do Q`;
  object(5, `<< /Length ${encode(content).length} >>\nstream\n${content}\nendstream`);
  const xref = length;
  add("xref\n0 6\n0000000000 65535 f \n");
  for (let id = 1; id <= 5; id++) add(`${String(offsets[id]).padStart(10, "0")} 00000 n \n`);
  add(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  const result = new Uint8Array(length);
  let cursor = 0;
  for (const chunk of chunks) { result.set(chunk, cursor); cursor += chunk.length; }
  return result;
}

export async function preparePatternSummary(analytics: Step10AnalyticsData, bounds: ReportBounds, language: Language, t: Translate, demo = false) {
  await document.fonts.ready;
  const svg = step10PatternSummarySvg(analytics, bounds, language, t, demo);
  const source = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const image = new Image();
    image.src = source;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = width * 2;
    canvas.height = height * 2;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Summary image unavailable");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = (type: string) => new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Summary image unavailable")), type, .95));
    const [png, jpeg] = await Promise.all([blob("image/png"), blob("image/jpeg")]);
    const stem = `step10-pattern-summary-${language}-${bounds.from}-${bounds.through}`;
    const pdf = patternSummaryPdf(new Uint8Array(await jpeg.arrayBuffer()), canvas.width, canvas.height);
    return { png: new File([png], `${stem}.png`, { type: "image/png" }), pdf: new File([pdf as BlobPart], `${stem}.pdf`, { type: "application/pdf" }) };
  } finally { URL.revokeObjectURL(source); }
}
