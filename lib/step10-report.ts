import { formatDisplayDate, principleCategories, step10QuestionsForPayload, questionWithPrinciple, reflectionPrincipleNames, type Language } from "@/lib/inventory";
import { reflectionFields, type Step10AnalyticsData, type PrincipleAnalytics, type ReflectionField, type WrittenExcerpt, type WrittenWeek } from "@/lib/step10-analytics";
import type { Step10Data } from "@/components/recovery/step10-inventory";
import { summarizeStep10Insights } from "@/lib/step10-insights";
import { sponsorGuidance } from "@/lib/recovery-guidance";
import { practiceForPrinciple } from "@/lib/step10-practices";
import type { ReportBounds } from "@/lib/step10-report-period";

type Translate = (english: string, farsi: string) => string;

function localized(item: { en: string; es: string; fa: string }, language: Language) {
  return item[language];
}

export function step10ReflectionLabel(field: ReflectionField, t: Translate) {
  const labels: Record<ReflectionField, string> = {
    highlights: t("Where did I live my principles?", "کجا بر اساس اصولم زندگی کردم؟"),
    attention: t("Where do I still need to work?", "کجا هنوز نیاز به کار دارم؟"),
    patternAction: t("What character pattern, including self-pity, did I notice, and how did I work on it?", "چه الگوی رفتاری، از جمله ترحم به خود، را دیدم و چگونه روی آن کار کردم؟"),
    familyContext: t("If another person's drinking or substance use affected me or my family today, what happened and what could I control?", "اگر مصرف الکل یا موادِ فرد دیگری امروز بر من یا خانواده‌ام اثر گذاشت، چه اتفاقی افتاد و چه چیزی در اختیار من بود؟"),
    amends: t("Do I owe an apology or amends?", "آیا به کسی عذرخواهی یا جبران بدهکارم؟"),
    tomorrow: t("What is one helpful action I can take tomorrow?", "فردا چه اقدام مفیدی می‌توانم انجام دهم؟"),
    gratitude: t("What am I grateful for?", "برای چه چیزی سپاسگزارم؟"),
  };
  return labels[field];
}

export function writtenFocusPrinciples(analytics: Step10AnalyticsData) {
  const ranked = analytics.principles.filter((item) => item.attention > 0)
    .sort((left, right) => right.attention - left.attention || left.id.localeCompare(right.id));
  const ids = new Set([...ranked.slice(0, 5).map((item) => item.id), ...analytics.written.principles.map((item) => item.id)]);
  return ranked.filter((item) => ids.has(item.id));
}

function formatWrittenExcerpt(item: WrittenExcerpt, language: Language) {
  return `  ${formatDisplayDate(item.date, language)}: “${item.text.replace(/\r?\n/g, " ")}”`;
}

export function formatStep10Written(analytics: Step10AnalyticsData, language: Language, t: Translate) {
  const written = analytics.written;
  const focus = writtenFocusPrinciples(analytics);
  return [
    t("What you wrote over time", "آنچه در طول زمان نوشته‌اید").toLocaleUpperCase(language),
    t("Counts cover all saved Step 10 entries through today. The dated words below are the two most recent excerpts for each field, not a full transcript. They stay in the language you wrote them.", "شمارش‌ها همه نوشته‌های ذخیره‌شده گام ۱۰ تا امروز را در بر می‌گیرند. متن‌های تاریخ‌دار زیر دو نمونه اخیر از هر بخش هستند، نه رونویسی کامل. زبان نوشته‌های شما حفظ می‌شود."),
    "",
    ...written.reflections.flatMap((item) => [
      `${step10ReflectionLabel(item.field, t)} (${reflectionPrincipleNames(item.field, language)}) — ${item.count} ${t("days with writing", "روز دارای نوشته")}`,
      ...(item.excerpts.length ? item.excerpts.map((sample) => formatWrittenExcerpt(sample, language)) : [`  ${t("No written reflection saved yet.", "هنوز بازتابی نوشته و ذخیره نشده است.")}`]),
      "",
    ]),
    t("Principles to discuss and practice", "اصولی برای گفت‌وگو و تمرین").toLocaleUpperCase(language),
    t("The suggestions follow the principles you marked Needs attention. They are starting points to discuss with a sponsor, not interpretations of your words.", "این پیشنهادها بر اساس اصولی هستند که «نیازمند توجه» انتخاب کرده‌اید. آن‌ها نقطه شروع گفت‌وگو با حامی‌اند، نه تفسیر نوشته‌های شما."),
    ...(focus.length ? focus.flatMap((item) => {
      const guide = practiceForPrinciple(item.id, language);
      const notes = written.principles.find((note) => note.id === item.id);
      return [
        "",
        `${questionWithPrinciple(item.id, language)} — ${item.attention} ${t("times marked Needs attention", "بار نیازمند توجه ثبت شده")}; ${notes?.count ?? 0} ${t("written explanations", "توضیح نوشته‌شده")}`,
        `${t("Principles to discuss", "اصولی برای گفت‌وگو")}: ${guide?.primary ?? item.id}${guide ? ` + ${guide.companion}` : ""}`,
        ...(guide ? [`${t("Possible practice to discuss", "تمرین پیشنهادی برای گفت‌وگو")}: ${guide.action}`] : []),
        ...(notes?.excerpts.length ? notes.excerpts.map((sample) => formatWrittenExcerpt(sample, language)) : [`  ${t("No written explanation saved for this principle yet.", "هنوز توضیحی برای این اصل ذخیره نشده است.")}`]),
      ];
    }) : [t("No principles marked Needs attention yet.", "هنوز هیچ اصلی نیازمند توجه ثبت نشده است.")]),
  ].join("\n");
}

export function formatStep10Inventory(data: Step10Data, language: Language, t: Translate) {
  const answer = (value?: string) => (value?.trim() || "—").replace(/\r?\n/g, "\n  ");
  const principleSections = principleCategories.flatMap((category) => [
    localized(category, language).toLocaleUpperCase(language),
    "",
    ...step10QuestionsForPayload(data).flatMap((principle, index) => {
      if (principle.category !== category.id) return [];
      const state = data.states[principle.id];
      const stateLabel = state === "practiced" ? t("Practiced", "تمرین کردم")
        : state === "attention" ? t("Needs attention", "نیازمند توجه")
          : state === "na" ? t("Not applicable", "کاربرد ندارد")
            : t("Not answered", "پاسخ داده نشده");
      const note = state === "attention" ? data.attentionNotes?.[principle.id]?.trim() : "";
      return [
        `${index + 1}. ${questionWithPrinciple(principle.id, language)} — ${stateLabel}`,
        ...(note ? [`  ${t("What happened today that needs attention?", "امروز چه اتفاقی افتاد که نیاز به توجه دارد؟")}`, `  ${answer(note)}`] : []),
        "",
      ];
    }),
  ]);

  return [
    t("Step 10 Daily Inventory", "ترازنامه روزانه گام دهم"),
    formatDisplayDate(data.date, language),
    "",
    ...principleSections,
    t("Daily reflection", "بازتاب روزانه").toLocaleUpperCase(language),
    "",
    ...reflectionFields.flatMap((field) => [step10ReflectionLabel(field, t), `  ${t("Related principles", "اصول مرتبط")}: ${reflectionPrincipleNames(field, language)}`, `  ${answer(data[field])}`, ""]),
  ].join("\n").trimEnd();
}

export function describeStep10Pattern(analytics: Step10AnalyticsData, t: Translate) {
  const change = analytics.recentChange;
  return analytics.totalEntries < 3
    ? t("Save at least three Step 10 inventories to make your patterns clearer.", "برای روشن‌تر شدن الگوها، دست‌کم سه ترازنامه گام ۱۰ ذخیره کنید.")
    : change === null
      ? t("There are not enough scored answers in both groups of seven entries to compare a recent direction.", "در هر دو گروه هفت‌تایی، پاسخ‌های امتیازدار کافی برای مقایسه روند اخیر وجود ندارد.")
      : change >= 5
        ? t("A larger share of answers in your last seven saved entries was marked Practiced than in the previous seven.", "سهم بیشتری از پاسخ‌های هفت نوشته ذخیره‌شده اخیر شما در مقایسه با هفت نوشته پیشین با «تمرین کردم» مشخص شده است.")
        : change <= -5
          ? t("A smaller share of answers in your last seven saved entries was marked Practiced than in the previous seven.", "سهم کمتری از پاسخ‌های هفت نوشته ذخیره‌شده اخیر شما در مقایسه با هفت نوشته پیشین با «تمرین کردم» مشخص شده است.")
          : t("The share marked Practiced is close to the preceding seven saved entries.", "سهم پاسخ‌های «تمرین کردم» به هفت نوشته ذخیره‌شده پیشین نزدیک است.");
}

function formatStep10Week(week: WrittenWeek, language: Language, t: Translate) {
  const name = (id: string) => questionWithPrinciple(id, language);
  const list = (items: WrittenWeek["strengths"]) => items.length
    ? items.map((item) => `${name(item.id)} (${item.count})`).join(", ")
    : t("None marked", "هیچ موردی ثبت نشده");
  const guide = week.focus[0] ? practiceForPrinciple(week.focus[0].id, language) : null;
  const sample = (label: string, item: WrittenExcerpt | null) => item
    ? [`${label} — ${formatDisplayDate(item.date, language)}: “${item.text.replace(/\r?\n/g, " ")}”`]
    : [];
  return [
    `${formatDisplayDate(week.start, language)} – ${formatDisplayDate(week.end, language)} · ${week.entries} ${t("saved days", "روز ذخیره‌شده")}`,
    `${t("Most marked Practiced", "بیشترین تمرین‌شده")}: ${list(week.strengths)}`,
    `${t("Most marked Needs attention", "بیشترین نیازمند توجه")}: ${list(week.focus)}`,
    ...sample(t("Example of what went well", "نمونه‌ای از آنچه خوب پیش رفت"), week.highlight),
    ...sample(`${t("Example of a concern", "نمونه‌ای از نگرانی")}${week.concern?.principleId ? ` (${name(week.concern.principleId)})` : ""}`, week.concern),
    ...sample(t("Next action you wrote", "اقدام بعدی که نوشته‌اید"), week.nextAction),
    ...(guide ? [`${t("Possible practice to discuss", "تمرین پیشنهادی برای گفت‌وگو")}: ${guide.primary} + ${guide.companion} — ${guide.action}`] : []),
  ].join("\n");
}

export function formatStep10Analytics(analytics: Step10AnalyticsData, language: Language, t: Translate, sample = false) {
  if (analytics.totalEntries === 0) {
    return [
      t("Step 10 analytics", "تحلیل گام ۱۰"),
      `${t("All saved Step 10 inventories through", "همه ترازنامه‌های ذخیره‌شده گام ۱۰ تا")} ${formatDisplayDate(analytics.through, language)}`,
      "",
      t("Save your first Step 10 inventory to begin seeing patterns across time.", "اولین ترازنامه گام ۱۰ خود را ذخیره کنید تا الگوها را در طول زمان ببینید."),
    ].join("\n");
  }
  const insights = summarizeStep10Insights(analytics);
  const insightLines = (items: PrincipleAnalytics[], countKey: "practiced" | "attention") => items.map((item) => {
    const label = countKey === "practiced"
      ? t("recorded answers marked Practiced", "پاسخ ثبت‌شده با برچسب «تمرین کردم»")
      : t("recorded answers marked Needs attention", "پاسخ ثبت‌شده با برچسب «نیازمند توجه»");
    return `• ${questionWithPrinciple(item.id, language)}: ${item[countKey]} ${t("of", "از")} ${item.answered} ${label}`;
  });

  return [
    t("Step 10 analytics", "تحلیل گام ۱۰"),
    ...(sample ? [t("Sample data", "داده نمونه")] : []),
    `${t("All saved Step 10 inventories through", "همه ترازنامه‌های ذخیره‌شده گام ۱۰ تا")} ${formatDisplayDate(analytics.through, language)}`,
    `${t("From the first saved inventory through today", "از نخستین ترازنامه ذخیره‌شده تا امروز")}: ${analytics.firstEntryDate ? formatDisplayDate(analytics.firstEntryDate, language) : "—"} – ${formatDisplayDate(analytics.through, language)}`,
    "",
    `${t("Practiced share", "سهم تمرین‌شده")}: ${analytics.practiceRate}% ${t("of scored selections", "از انتخاب‌های امتیازدار")}`,
    `${t("Saved inventories", "ترازنامه‌های ذخیره‌شده")}: ${analytics.totalEntries}`,
    `${t("Practiced", "تمرین کردم")}: ${analytics.totalPracticed} · ${t("Needs attention", "نیازمند توجه")}: ${analytics.totalAttention} · ${t("Not applicable", "کاربرد ندارد")}: ${analytics.totalNA}`,
    `${t("Current streak", "روند پیوسته فعلی")}: ${analytics.currentStreak} ${t("days", "روز")}`,
    "",
    `${t("Your current pattern", "الگوی فعلی شما")}: ${describeStep10Pattern(analytics, t)}`,
    "",
    t("What your inventories show", "ترازنامه‌های شما چه نشان می‌دهند").toLocaleUpperCase(language),
    t("These patterns describe your recorded choices, not your worth or a recovery score. We look for repeated answers on at least three days; N/A and unanswered questions do not count.", "این الگوها انتخاب‌های ثبت‌شده شما را توصیف می‌کنند، نه ارزش شما یا نمره بهبودی‌تان را. ما پاسخ‌های تکرارشده در دست‌کم سه روز را بررسی می‌کنیم؛ گزینه «کاربرد ندارد» و پاسخ‌های خالی محاسبه نمی‌شوند."),
    "",
    t("Where you are doing well", "جاهایی که خوب پیش می‌روید"),
    ...(insights.strengths.length ? insightLines(insights.strengths, "practiced") : [insights.enoughHistory
      ? t("No repeated Practiced pattern is clear yet. Review your entries with your sponsor.", "هنوز الگوی روشنی از «تمرین کردم» دیده نمی‌شود. نوشته‌هایتان را با حامی مرور کنید.")
      : t("Save more inventories to see a repeated pattern. Discuss what you have recorded with your sponsor.", "برای دیدن الگوی تکرارشونده، ترازنامه‌های بیشتری ذخیره کنید. موارد ثبت‌شده را با حامی در میان بگذارید.")]),
    "",
    t("Where to ask for help", "جاهایی که می‌توانید کمک بخواهید"),
    ...(insights.focus.length ? insightLines(insights.focus, "attention") : [insights.enoughHistory
      ? t("Among questions answered on at least three days, none was marked Needs attention at least half the time. Bring any concerns to your sponsor anyway.", "در میان پرسش‌هایی که در دست‌کم سه روز به آن‌ها پاسخ داده‌اید، هیچ‌کدام دست‌کم در نیمی از موارد «نیازمند توجه» نبوده‌اند. با این حال نگرانی‌های خود را با حامی در میان بگذارید.")
      : t("Save more inventories before looking for a recurring focus. Your sponsor can still help with today's concerns.", "پیش از جست‌وجوی تمرکز تکرارشونده، ترازنامه‌های بیشتری ذخیره کنید. حامی همچنان می‌تواند درباره نگرانی‌های امروز کمک کند.")]),
    "",
    t("Recent weekly writing", "نوشته‌های هفتگی اخیر").toLocaleUpperCase(language),
    t("Last four calendar weeks (Monday–Sunday), including this week. Weeks without saved entries are omitted. These are selected examples in your own words, not an interpretation or a full transcript.", "چهار هفته تقویمی اخیر (دوشنبه تا یکشنبه)، شامل این هفته. هفته‌های بدون نوشته ذخیره‌شده نمایش داده نمی‌شوند. این‌ها نمونه‌هایی از نوشته‌های خودتان هستند، نه تفسیر یا رونویسی کامل."),
    ...(analytics.weekly.length ? analytics.weekly.flatMap((week) => ["", formatStep10Week(week, language, t)]) : [t("No saved entries in these four weeks.", "در این چهار هفته نوشته ذخیره‌شده‌ای وجود ندارد.")]),
    "",
    `${t("Review this with your sponsor", "این گزارش را با حامی مرور کنید")}: ${sponsorGuidance(t)}`,
    "",
    t("This private summary counts all saved Step 10 selections and shows selected writing from recent weeks. It does not interpret every nuance of your words, analyze Step 4, or provide a diagnosis or clinical assessment.", "این خلاصه خصوصی، همه انتخاب‌های ذخیره‌شده گام ۱۰ را می‌شمارد و نمونه‌هایی از نوشته‌های هفته‌های اخیر را نشان می‌دهد. همه ظرافت‌های نوشته‌های شما را تفسیر نمی‌کند، گام ۴ را تحلیل نمی‌کند و تشخیص یا ارزیابی بالینی ارائه نمی‌دهد."),
  ].join("\n").trimEnd();
}

function bar(practiced: number, answered: number) {
  if (!answered) return "──────────";
  const filled = Math.round((practiced / answered) * 10);
  return `${"█".repeat(filled)}${"░".repeat(10 - filled)}`;
}

export function formatStep10ReportAnalytics(analytics: Step10AnalyticsData, bounds: ReportBounds, language: Language, t: Translate, sample = false) {
  const daily = bounds.mode === "day" || bounds.mode === "today";
  const insights = summarizeStep10Insights(analytics);
  const period = bounds.from === bounds.through
    ? formatDisplayDate(bounds.from, language)
    : `${formatDisplayDate(bounds.from, language)} – ${formatDisplayDate(bounds.through, language)}`;
  const unanswered = analytics.principles.reduce((sum, item) => sum + item.unanswered, 0);
  const name = (id: string) => questionWithPrinciple(id, language);
  return [
    t("Step 10 report analytics", "تحلیل گزارش گام ۱۰"),
    ...(sample ? [t("Sample data", "داده نمونه")] : []),
    `${t("Analytics period", "بازه تحلیل")}: ${period}`,
    `${daily ? t("Inventory represented", "ترازنامه نمایش‌داده‌شده") : t("Saved days in this period", "روزهای ذخیره‌شده در این بازه")}: ${analytics.totalEntries}`,
    "",
    `${t("Practiced", "تمرین کردم")}: ${analytics.totalPracticed} · ${t("Needs attention", "نیازمند توجه")}: ${analytics.totalAttention} · ${t("Not applicable", "کاربرد ندارد")}: ${analytics.totalNA} · ${t("Not answered", "پاسخ داده نشده")}: ${unanswered}`,
    `${t("Practiced share", "سهم تمرین‌شده")}: ${analytics.practiceRate}% ${t("of Practiced and Needs attention answers; N/A and unanswered are excluded", "از پاسخ‌های «تمرین کردم» و «نیازمند توجه»؛ «کاربرد ندارد» و پاسخ‌های خالی محاسبه نمی‌شوند")}`,
    "",
    t("Daily questions at a glance", "پرسش‌های روزانه در یک نگاه").toLocaleUpperCase(language),
    t("Each bar shows Practiced among scored answers. Counts beside it show Needs attention and N/A separately.", "هر نوار سهم «تمرین کردم» را در میان پاسخ‌های امتیازدار نشان می‌دهد. شمارش‌های کنار آن، «نیازمند توجه» و «کاربرد ندارد» را جداگانه نشان می‌دهند."),
    ...analytics.principles.map((item) => daily
      ? `• ${name(item.id)}: ${item.practiced ? t("Practiced", "تمرین کردم") : item.attention ? t("Needs attention", "نیازمند توجه") : item.na ? t("Not applicable", "کاربرد ندارد") : t("Not answered", "پاسخ داده نشده")}`
      : `• ${name(item.id)}: ${bar(item.practiced, item.answered)} ${item.practiced}/${item.answered} ${t("Practiced", "تمرین کردم")} · ${item.attention} ${t("Needs attention", "نیازمند توجه")} · ${item.na} ${t("N/A", "کاربرد ندارد")}`),
    "",
    t("Where you practiced", "جاهایی که تمرین کردید").toLocaleUpperCase(language),
    ...(daily
      ? (analytics.principles.filter((item) => item.practiced).map((item) => `• ${name(item.id)}`))
      : insights.strengths.map((item) => `• ${name(item.id)}: ${item.practiced}/${item.answered} ${t("marked Practiced", "با برچسب تمرین کردم")}`)),
    ...(!daily && !insights.enoughHistory ? [t("More saved days are needed to describe a repeated pattern.", "برای توصیف الگوی تکرارشونده روزهای ذخیره‌شده بیشتری لازم است.")] : []),
    "",
    t("Where to ask for help", "جاهایی که می‌توانید کمک بخواهید").toLocaleUpperCase(language),
    ...(daily ? analytics.principles.filter((item) => item.attention) : insights.focus).flatMap((item) => {
      const guide = practiceForPrinciple(item.id, language);
      return [`• ${name(item.id)}${daily ? "" : `: ${item.attention}/${item.answered} ${t("marked Needs attention", "با برچسب نیازمند توجه")}`}`,
        ...(guide ? [`  ${t("Principles to discuss", "اصولی برای گفت‌وگو")}: ${guide.primary} + ${guide.companion}`, `  ${t("Possible practice to discuss", "تمرین پیشنهادی برای گفت‌وگو")}: ${guide.action}`] : [])];
    }),
    "",
    ...(daily ? [] : [
      t("Selected weekly writing", "نوشته‌های هفتگی منتخب").toLocaleUpperCase(language),
      t("Up to four recent calendar weeks within this period; examples are your own words, not an AI interpretation.", "حداکثر چهار هفته تقویمی اخیر در این بازه؛ نمونه‌ها نوشته‌های خودتان هستند، نه تفسیر هوش مصنوعی."),
      ...(analytics.weekly.length ? analytics.weekly.flatMap((week) => ["", formatStep10Week(week, language, t)]) : [t("No saved writing in those weeks.", "در این هفته‌ها نوشته ذخیره‌شده‌ای وجود ندارد.")]),
      "",
    ]),
    `${t("Review this with your sponsor", "این گزارش را با حامی مرور کنید")}: ${sponsorGuidance(t)}`,
    t("This is a summary of your recorded choices, not a diagnosis or a recovery score. Step 4 is not analyzed.", "این خلاصه‌ای از انتخاب‌های ثبت‌شده شماست، نه تشخیص یا نمره بهبودی. گام ۴ تحلیل نمی‌شود."),
  ].join("\n").trimEnd();
}

export function formatStep10SponsorReport(data: Step10Data, analytics: Step10AnalyticsData, bounds: ReportBounds, language: Language, t: Translate, sample = false) {
  return `${formatStep10Inventory(data, language, t)}\n\n━━━━━━━━━━━━━━━━━━━━\n\n${formatStep10ReportAnalytics(analytics, bounds, language, t, sample)}`;
}
