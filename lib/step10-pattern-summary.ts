
import { dateTimeFormat } from "@/lib/languages";
import { localizedText } from "./localization";

import { isRtlLanguage, languageLocale } from "@/lib/languages";
import { formatDisplayDate, principles, type Language } from "@/lib/inventory";
import type { Step10AnalyticsData } from "@/lib/step10-analytics";
import { buildStep10Patterns, patternSymbols, patternToneLabel, type PatternTone } from "@/lib/step10-patterns";
import type { ReportBounds } from "@/lib/step10-report-period";

type Translate = (en: string, fa: string) => string;
const kinds = ["practiced", "attention", "na", "unanswered"] as const;
const colors = { practiced: "#28734e", attention: "#b95d1c", na: "#b9a4d8", unanswered: "#d5dfd9" };
const symbols = { practiced: "+", attention: "!", na: "–", unanswered: "?" };
const width = 1600;
const height = 1132;
const escape = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function patternSheet(title: string, range: string, rtl: boolean) {
  const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="summary-title summary-description"><title id="summary-title">${escape(title)}</title><desc id="summary-description">${escape(range)}</desc><rect width="${width}" height="${height}" fill="white"/><g font-family="Arial, Tahoma, sans-serif" fill="#173f3a">`];
  function rect(x: number, y: number, w: number, h: number, fill: string, radius = 0, stroke?: string) {
    parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}"${stroke ? ` stroke="${stroke}"` : ""}/>`);
  }
  function text(value: string, x: number, y: number, size: number, max: number, bold = false, direction = rtl, center = false, fill?: string) {
    const estimated = value.length * size * (bold ? .65 : .58);
    parts.push(`<text x="${center ? x + max / 2 : direction ? x + max : x}" y="${y}" font-size="${size}"${fill ? ` fill="${fill}"` : ""}${bold ? ' font-weight="700"' : ""} direction="${direction ? "rtl" : "ltr"}" text-anchor="${center ? "middle" : "start"}"${estimated > max ? ` textLength="${max}" lengthAdjust="spacingAndGlyphs"` : ""}>${escape(value)}</text>`);
  }
  return { parts, rect, text };
}

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
  const rtl = isRtlLanguage(language);
  const locale = languageLocale(language);
  const number = (value: number) => new Intl.NumberFormat(locale).format(value);
  const name = (id: string) => (() => { const item = principles.find((p) => p.id === id); return item ? localizedText(item, language) : id; })();
  const labels = { practiced: t("Practiced", "تمرین کردم"), attention: t("Needs attention", "نیازمند توجه"), na: t("Didn’t come up today", "امروز پیش نیامد"), unanswered: t("Not answered", "پاسخ داده نشده") };
  const title = t("One-page pattern summary", "خلاصه یک‌صفحه‌ای الگوها");
  const range = bounds.from === bounds.through ? formatDisplayDate(bounds.from, language) : `${formatDisplayDate(bounds.from, language)} – ${formatDisplayDate(bounds.through, language)}`;
  const { parts, rect, text } = patternSheet(title, range, rtl);
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
  const shortDate = dateTimeFormat(locale, { month: "numeric", day: "numeric", ...(data.calendarDays > 366 ? { year: "2-digit" as const } : {}), timeZone: "UTC" });
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

/** Most date columns that still read clearly on one landscape page. Daily maps never exceed 62 days. */
export const patternMapColumnLimits = { onePage: 62, perPage: 30 } as const;

/** Landscape map pages with no member writing. fitOnePage shrinks the squares so up to two months fit on one page. */
export function step10PatternMapSvgs(analytics: Step10AnalyticsData, bounds: ReportBounds, language: Language, t: Translate, demo = false, fitOnePage = true) {
  const days = analytics.days.filter((day) => day.date >= bounds.from && day.date <= bounds.through);
  const { buckets, rows, interval } = buildStep10Patterns({ ...analytics, days }, bounds);
  const rtl = isRtlLanguage(language);
  const locale = languageLocale(language, true);
  const number = new Intl.NumberFormat(locale);
  const title = t("Pattern map", "نقشه الگوها");
  const columnsPerPage = fitOnePage ? Math.max(1, Math.min(buckets.length, patternMapColumnLimits.onePage)) : patternMapColumnLimits.perPage;
  const pageCount = Math.ceil(buckets.length / columnsPerPage);
  const dateLabel = dateTimeFormat(locale, {
    month: "numeric", ...(interval === "month" ? { year: "2-digit" as const } : { day: "numeric" as const }),
    timeZone: "UTC",
  });
  const tones = Object.keys(patternSymbols) as PatternTone[];
  const mapColors: Record<PatternTone, string> = {
    practiced: "#28734e", attention: "#a65319", mixed: "#e2f0e4", na: "#ebe4f8",
    unanswered: "#e0e6e2", "no-entry": "#fff", "not-included": "#f5f5f1",
  };
  const labels = Object.fromEntries(tones.map(tone => [tone, patternToneLabel(tone, t)]));
  const names = new Map(principles.map(principle => [principle.id, localizedText(principle, language)]));

  return Array.from({ length: pageCount }, (_, page) => {
    const start = page * columnsPerPage;
    const columns = buckets.slice(start, start + columnsPerPage);
    const first = formatDisplayDate(columns[0].from, language);
    const last = formatDisplayDate(columns[columns.length - 1].through, language);
    const { parts, rect, text } = patternSheet(title, first === last ? first : first + " – " + last, rtl);
    const pageLabel = t("Page {page} of {total}", "صفحه {page} از {total}")
      .replace("{page}", number.format(page + 1)).replace("{total}", number.format(pageCount));
    text("RECOVERY INVENTORY · recoveryinventory.com", 56, 42, 16, 800, true, false);
    text(demo ? t("Sample data", "داده نمونه") : t("Saved answers only", "فقط پاسخ‌های ذخیره‌شده"), 1110, 42, 16, 434);
    text(title, 56, 89, 35, 1488, true);
    text(first === last ? first : first + " – " + last, 56, 128, 22, 1488);
    const columnUnit = Math.min(120, 1220 / columns.length);
    const labelX = rtl ? 1276 : 56;
    const columnX = (index: number) => rtl ? 1276 - (index + 1) * columnUnit : 324 + index * columnUnit;

    const columnPeriod = interval === "day" ? t("Day", "روز")
      : interval === "week" ? t("Calendar week", "هفته تقویمی") : t("Month", "ماه");
    text(columnPeriod, 56, 160, 17, 1488, true);
    const labelSize = columnUnit < 30 ? 12 : columnUnit < 42 ? 14 : 16;
    const labelEvery = columnUnit < 24 ? 2 : 1;
    columns.forEach((bucket, index) => {
      if (index % labelEvery) return;
      text(dateLabel.format(new Date(bucket.from + "T12:00:00Z")), columnX(index) - (labelEvery - 1) * columnUnit / 2, 192, labelSize, columnUnit * labelEvery - 3, true, false, true);
    });
    function square(tone: PatternTone, x: number, y: number, w: number, h: number) {
      rect(x, y, w, h, mapColors[tone], 4, "#c4d1c9");
      if (tone === "mixed") rect(x + w / 2, y + 1, w / 2 - 1, h - 2, "#f9d9bd", 2);
      const ink = tone === "practiced" || tone === "attention" ? "#fff" : "#173f3a";
      text(patternSymbols[tone], x, y + 18, Math.min(18, Math.round(w * .7)), w, true, false, true, ink);
    }
    text(t("Principle", "اصل"), labelX, 192, 18, 248, true);
    rows.forEach((row, index) => {
      const y = 207 + index * 31;
      if (index % 2 === 0) rect(56, y, 1488, 30, "#f6f9f6", 4);
      text(names.get(row.id) ?? row.id, labelX, y + 21, 17, 248, true);
      row.cells.slice(start, start + columns.length).forEach((cell, column) => square(cell.tone, columnX(column) + 1, y + 2, columnUnit - 3, 25));
    });
    tones.forEach((tone, index) => {
      const col = rtl ? 3 - index % 4 : index % 4;
      const x = 56 + col * 372;
      const y = 967 + Math.floor(index / 4) * 36;
      square(tone, rtl ? x + 339 : x, y, 27, 24);
      text(labels[tone], rtl ? x : x + 36, y + 18, 17, 330);
    });
    text(t("Saved answers only. Written reflections and notes stay private.", "فقط پاسخ‌های ذخیره‌شده. نوشته‌ها و یادداشت‌ها خصوصی می‌مانند."), rtl ? 304 : 56, 1091, 16, 1240);
    text(pageLabel, rtl ? 56 : 1398, 1091, 16, 146, true, false, true);
    parts.push("</g></svg>");
    return parts.join("");
  });
}

export function patternSummaryPdf(jpeg: Uint8Array | Uint8Array[], imageWidth: number, imageHeight: number): Uint8Array {
  const images = Array.isArray(jpeg) ? jpeg : [jpeg];
  const encode = (value: string) => new TextEncoder().encode(value);
  const chunks: Uint8Array[] = [];
  let length = 0;
  const offsets = [0];
  const add = (value: string | Uint8Array) => { const bytes = typeof value === "string" ? encode(value) : value; chunks.push(bytes); length += bytes.length; };
  const object = (id: number, value: string) => { offsets[id] = length; add(`${id} 0 obj\n${value}\nendobj\n`); };
  const pageIds = images.map((_, index) => 3 + 3 * index);
  add("%PDF-1.4\n");
  object(1, "<< /Type /Catalog /Pages 2 0 R >>");
  object(2, `<< /Type /Pages /Kids [${pageIds.map(id => id + " 0 R").join(" ")}] /Count ${images.length} >>`);
  const scale = Math.min(806 / imageWidth, 559 / imageHeight);
  const w = imageWidth * scale;
  const h = imageHeight * scale;
  const content = `q ${w} 0 0 ${h} ${(842 - w) / 2} ${(595 - h) / 2} cm /Summary Do Q`;
  images.forEach((image, index) => {
    const pageId = pageIds[index];
    const imageId = pageId + 1;
    const contentId = pageId + 2;
    object(pageId, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /XObject << /Summary ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    offsets[imageId] = length;
    add(`${imageId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>\nstream\n`);
    add(image);
    add("\nendstream\nendobj\n");
    object(contentId, `<< /Length ${encode(content).length} >>\nstream\n${content}\nendstream`);
  });
  const xref = length;
  add(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);
  for (const offset of offsets.slice(1)) add(`${String(offset).padStart(10, "0")} 00000 n \n`);
  add(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  const result = new Uint8Array(length);
  let cursor = 0;
  for (const chunk of chunks) { result.set(chunk, cursor); cursor += chunk.length; }
  return result;
}

export async function preparePatternSummary(analytics: Step10AnalyticsData, bounds: ReportBounds, language: Language, t: Translate, demo = false, view: "summary" | "map" = "summary", fitOnePage = true) {
  await document.fonts.ready;
  const sheets = view === "map"
    ? step10PatternMapSvgs(analytics, bounds, language, t, demo, fitOnePage)
    : [step10PatternSummarySvg(analytics, bounds, language, t, demo)];
  const stem = `step10-pattern-${view}-${language}-${bounds.from}-${bounds.through}`;
  const canvas = document.createElement("canvas");
  canvas.width = width * 2;
  canvas.height = height * 2;
  const context = canvas.getContext("2d");
  if (!context || !sheets.length) throw new Error("Pattern report unavailable");
  const pngs: File[] = [];
  const jpegs: Uint8Array[] = [];
  const blob = (type: string) => new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Pattern image unavailable")), type, .95);
  });
  for (const [index, svg] of sheets.entries()) {
    const source = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    try {
      const image = new Image();
      image.src = source;
      await image.decode();
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const [png, jpeg] = await Promise.all([blob("image/png"), blob("image/jpeg")]);
      const pageSuffix = sheets.length > 1 ? `-page-${index + 1}` : "";
      pngs.push(new File([png], `${stem}${pageSuffix}.png`, { type: "image/png" }));
      jpegs.push(new Uint8Array(await jpeg.arrayBuffer()));
    } finally {
      URL.revokeObjectURL(source);
    }
  }
  const pdf = patternSummaryPdf(jpegs, canvas.width, canvas.height);
  return { pngs, pdf: new File([pdf as BlobPart], `${stem}.pdf`, { type: "application/pdf" }) };
}
