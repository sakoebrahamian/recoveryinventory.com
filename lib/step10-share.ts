import { formatDisplayDate, principles, type Language } from "@/lib/inventory";
import type { Step10AnalyticsData } from "@/lib/step10-analytics";
import type { ReportBounds } from "@/lib/step10-report-period";

type Translate = (english: string, farsi: string) => string;
type ChartKind = "practiced" | "attention" | "na" | "unanswered";

const colors: Record<ChartKind, string> = {
  practiced: "#23836c",
  attention: "#cc7955",
  na: "#6b4fb3",
  unanswered: "#aebbb4",
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
}

function chartDetails(analytics: Step10AnalyticsData, bounds: ReportBounds, language: Language, t: Translate) {
  const labels: Record<ChartKind, string> = {
    practiced: t("Practiced", "تمرین کردم"),
    attention: t("Needs attention", "نیازمند توجه"),
    na: t("N/A", "کاربرد ندارد"),
    unanswered: t("Not answered", "پاسخ داده نشده"),
  };
  const kinds: ChartKind[] = ["practiced", "attention", "na", "unanswered"];
  const total = analytics.totalEntries * principles.length;
  const counts: Record<ChartKind, number> = {
    practiced: analytics.totalPracticed,
    attention: analytics.totalAttention,
    na: analytics.totalNA,
    unanswered: Math.max(0, total - analytics.totalPracticed - analytics.totalAttention - analytics.totalNA),
  };
  const period = bounds.from === bounds.through ? formatDisplayDate(bounds.from, language) : `${formatDisplayDate(bounds.from, language)} – ${formatDisplayDate(bounds.through, language)}`;
  const rows = analytics.principles.map((item) => ({
    name: principles.find((principle) => principle.id === item.id)?.[language] ?? item.id,
    counts: { practiced: item.practiced, attention: item.attention, na: item.na, unanswered: item.unanswered },
    answered: item.answered,
  }));
  return { labels, kinds, counts, total, period, rows, daily: bounds.mode === "day" || bounds.mode === "today", title: t("Principles at a glance", "اصول در یک نگاه") };
}

/** A self-contained HTML chart for rich-text paste. Plain-text paste still gets the full report and its text chart. */
export function step10RichReport(text: string, analytics: Step10AnalyticsData, bounds: ReportBounds, language: Language, t: Translate) {
  const chart = chartDetails(analytics, bounds, language, t);
  const empty = analytics.totalEntries === 0;
  const bar = (counts: Record<ChartKind, number>, total: number) => `<div style="display:flex;width:100%;height:14px;border-radius:7px;overflow:hidden;background:#dce3df">${chart.kinds.map((kind) => counts[kind] ? `<span style="display:block;height:14px;width:${total ? counts[kind] / total * 100 : 0}%;background:${colors[kind]}"></span>` : "").join("")}</div>`;
  const legend = chart.kinds.map((kind) => `<span style="display:inline-block;margin:0 14px 8px 0"><span style="display:inline-block;width:10px;height:10px;background:${colors[kind]};margin-right:5px"></span>${escapeHtml(chart.labels[kind])}: ${chart.counts[kind]}</span>`).join("");
  const rows = chart.rows.map((row) => {
    const state = chart.kinds.find((kind) => row.counts[kind]) ?? "unanswered";
    return `<tr><th style="text-align:start;padding:6px;border-bottom:1px solid #e5e9e6">${escapeHtml(row.name)}</th><td style="padding:6px;border-bottom:1px solid #e5e9e6">${bar(row.counts, analytics.totalEntries)}</td><td style="padding:6px;border-bottom:1px solid #e5e9e6;text-align:end">${chart.daily ? `<span style="color:${state === "unanswered" ? "#62716b" : colors[state]};font-weight:bold">${escapeHtml(chart.labels[state])}</span>` : `${row.counts.practiced}/${row.answered} ${escapeHtml(chart.labels.practiced)} · ${row.counts.na} ${escapeHtml(chart.labels.na)}`}</td></tr>`;
  }).join("");
  return `<div dir="${language === "fa" ? "rtl" : "ltr"}" style="font-family:Arial,sans-serif;color:#173f3a"><h2>${escapeHtml(chart.title)}</h2><p>${escapeHtml(t("Analytics period", "بازه تحلیل"))}: ${escapeHtml(chart.period)}</p>${empty ? `<p>${escapeHtml(t("No saved Step 10 inventories in this period.", "هیچ ترازنامه ذخیره‌شده گام ۱۰ در این بازه وجود ندارد."))}</p>` : `${bar(chart.counts, chart.total)}<p>${legend}</p><table style="width:100%;border-collapse:collapse;font-size:13px"><tbody>${rows}</tbody></table>`}<hr><div style="white-space:pre-wrap;line-height:1.5">${escapeHtml(text).replace(/\n/g, "<br>")}</div></div>`;
}

/** A PNG chart accompanies the full text in native sharing apps that support file sharing. */
function step10ChartPng(analytics: Step10AnalyticsData, bounds: ReportBounds, language: Language, t: Translate): File {
  const chart = chartDetails(analytics, bounds, language, t);
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = analytics.totalEntries ? 270 + chart.rows.length * 58 : 210;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Chart image unavailable");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.textBaseline = "middle";
  context.direction = language === "fa" ? "rtl" : "ltr";
  context.textAlign = language === "fa" ? "right" : "left";
  const titleX = language === "fa" ? 1155 : 45;
  context.fillStyle = "#173f3a";
  context.font = "bold 30px Arial, sans-serif";
  context.fillText(chart.title, titleX, 48, 1110);
  context.font = "20px Arial, sans-serif";
  context.fillText(`${t("Analytics period", "بازه تحلیل")}: ${chart.period}`, titleX, 90);
  if (!analytics.totalEntries) {
    context.fillText(t("No saved Step 10 inventories in this period.", "هیچ ترازنامه ذخیره‌شده گام ۱۰ در این بازه وجود ندارد."), titleX, 150, 1110);
  } else {
  const paintBar = (counts: Record<ChartKind, number>, total: number, x: number, y: number, width: number, height: number) => {
    context.fillStyle = colors.unanswered;
    context.fillRect(x, y, width, height);
    let offset = 0;
    for (const kind of chart.kinds) {
      const part = total ? counts[kind] / total * width : 0;
      context.fillStyle = colors[kind];
      context.fillRect(x + offset, y, part, height);
      offset += part;
    }
  };
  paintBar(chart.counts, chart.total, 45, 119, 1110, 18);
  context.font = "17px Arial, sans-serif";
  for (const [index, kind] of chart.kinds.entries()) {
    const legendX = 45 + index % 2 * 555;
    const legendY = 158 + Math.floor(index / 2) * 31;
    context.fillStyle = colors[kind];
    context.fillRect(legendX, legendY, 12, 12);
    context.fillStyle = "#173f3a";
    context.direction = "ltr";
    context.textAlign = "left";
    const label = `${chart.labels[kind]}: ${chart.counts[kind]}`;
    context.fillText(label, legendX + 19, legendY + 6, 515);
  }
  chart.rows.forEach((row, index) => {
    const y = 250 + index * 58;
    context.fillStyle = "#edf0ee";
    context.fillRect(45, y + 26, 1110, 1);
    context.fillStyle = "#173f3a";
    context.direction = language === "fa" ? "rtl" : "ltr";
    context.textAlign = language === "fa" ? "right" : "left";
    context.fillText(row.name, language === "fa" ? 405 : 45, y, 360);
    paintBar(row.counts, analytics.totalEntries, 465, y - 7, 410, 15);
    if (chart.daily) {
      const state = chart.kinds.find((kind) => row.counts[kind]) ?? "unanswered";
      context.fillStyle = colors[state] === colors.unanswered ? "#62716b" : colors[state];
      context.fillText(chart.labels[state], language === "fa" ? 1150 : 900, y, 250);
    } else {
      context.fillStyle = "#173f3a";
      context.direction = "ltr";
      context.textAlign = "left";
      context.fillText(`${row.counts.practiced}/${row.answered} ${chart.labels.practiced} · ${row.counts.na} ${chart.labels.na}`, 900, y, 250);
    }
  });
  }
  const base64 = canvas.toDataURL("image/png").split(",")[1];
  const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
  return new File([bytes], `step10-chart-${bounds.from}-${bounds.through}.png`, { type: "image/png" });
}

export async function copyStep10Report(text: string, analytics: Step10AnalyticsData, bounds: ReportBounds, language: Language, t: Translate): Promise<"rich" | "text"> {
  if (navigator.clipboard?.write && typeof ClipboardItem !== "undefined") {
    try {
      const html = step10RichReport(text, analytics, bounds, language, t);
      await navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }), "text/plain": new Blob([text], { type: "text/plain" }) })]);
      return "rich";
    } catch { /* Some browsers allow only plain-text clipboard data. */ }
  }
  await navigator.clipboard.writeText(text);
  return "text";
}

export async function shareStep10Report(text: string, analytics: Step10AnalyticsData, bounds: ReportBounds, language: Language, t: Translate): Promise<"image" | "text" | "rich-copy" | "text-copy"> {
  if (navigator.share) {
    const title = t("My Step 10 inventory and analytics", "ترازنامه و تحلیل گام دهم من");
    if (navigator.canShare) {
      try {
        const chart = step10ChartPng(analytics, bounds, language, t);
        if (navigator.canShare({ files: [chart] })) {
          await navigator.share({ title, text, files: [chart] });
          return "image";
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") throw error;
      }
    }
    await navigator.share({ title, text });
    return "text";
  }
  return (await copyStep10Report(text, analytics, bounds, language, t)) === "rich" ? "rich-copy" : "text-copy";
}
