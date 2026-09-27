import { formatDisplayDate, principleCategories, principles, type Language } from "@/lib/inventory";
import type { Step10AnalyticsData, PrincipleAnalytics, ReflectionField, WrittenExcerpt } from "@/lib/step10-analytics";
import type { Step10Data } from "@/components/recovery/step10-inventory";
import { summarizeStep10Insights } from "@/lib/step10-insights";
import { sponsorGuidance } from "@/lib/recovery-guidance";
import { practiceForPrinciple } from "@/lib/step10-practices";

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
    tomorrow: t("One action for tomorrow", "یک اقدام برای فردا"),
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

function formatWrittenExcerpt(item: WrittenExcerpt, language: Language, t: Translate) {
  const names = item.attentionPrincipleIds.map((id) => principles.find((principle) => principle.id === id)?.[language] ?? id);
  return `  ${formatDisplayDate(item.date, language)}: “${item.text.replace(/\r?\n/g, " ")}”${names.length ? ` (${t("Marked Needs attention that day", "اصولی که آن روز نیازمند توجه ثبت شدند")}: ${names.join(", ")})` : ""}`;
}

export function formatStep10Written(analytics: Step10AnalyticsData, language: Language, t: Translate) {
  const written = analytics.written;
  const focus = writtenFocusPrinciples(analytics);
  return [
    t("What you wrote over time", "آنچه در طول زمان نوشته‌اید").toLocaleUpperCase(language),
    t("Counts cover all saved Step 10 entries through today. The dated words below are the two most recent excerpts for each field, not a full transcript. They stay in the language you wrote them.", "شمارش‌ها همه نوشته‌های ذخیره‌شده گام ۱۰ تا امروز را در بر می‌گیرند. متن‌های تاریخ‌دار زیر دو نمونه اخیر از هر بخش هستند، نه رونویسی کامل. زبان نوشته‌های شما حفظ می‌شود."),
    "",
    ...written.reflections.flatMap((item) => [
      `${step10ReflectionLabel(item.field, t)} — ${item.count} ${t("days with writing", "روز دارای نوشته")}`,
      ...(item.excerpts.length ? item.excerpts.map((sample) => formatWrittenExcerpt(
        item.field === "highlights" || item.field === "tomorrow" || item.field === "gratitude"
          ? { ...sample, attentionPrincipleIds: [] }
          : sample, language, t,
      )) : [`  ${t("No written reflection saved yet.", "هنوز بازتابی نوشته و ذخیره نشده است.")}`]),
      "",
    ]),
    t("Principles to discuss and practice", "اصولی برای گفت‌وگو و تمرین").toLocaleUpperCase(language),
    t("The suggestions follow the principles you marked Needs attention. They are starting points to discuss with a sponsor, not interpretations of your words.", "این پیشنهادها بر اساس اصولی هستند که «نیازمند توجه» انتخاب کرده‌اید. آن‌ها نقطه شروع گفت‌وگو با حامی‌اند، نه تفسیر نوشته‌های شما."),
    ...(focus.length ? focus.flatMap((item) => {
      const guide = practiceForPrinciple(item.id, language);
      const notes = written.principles.find((note) => note.id === item.id);
      return [
        "",
        `${guide?.primary ?? item.id} — ${item.attention} ${t("times marked Needs attention", "بار نیازمند توجه ثبت شده")}; ${notes?.count ?? 0} ${t("written explanations", "توضیح نوشته‌شده")}`,
        `${t("Principles to discuss", "اصولی برای گفت‌وگو")}: ${guide?.primary ?? item.id}${guide ? ` + ${guide.companion}` : ""}`,
        ...(guide ? [`${t("Possible practice to discuss", "تمرین پیشنهادی برای گفت‌وگو")}: ${guide.action}`] : []),
        ...(notes?.excerpts.length ? notes.excerpts.map((sample) => formatWrittenExcerpt({ ...sample, attentionPrincipleIds: [] }, language, t)) : [`  ${t("No written explanation saved for this principle yet.", "هنوز توضیحی برای این اصل ذخیره نشده است.")}`]),
      ];
    }) : [t("No principles marked Needs attention yet.", "هنوز هیچ اصلی نیازمند توجه ثبت نشده است.")]),
  ].join("\n");
}

export function formatStep10Inventory(data: Step10Data, language: Language, t: Translate) {
  const answer = (value?: string) => (value?.trim() || "—").replace(/\r?\n/g, "\n  ");
  const principleSections = principleCategories.flatMap((category) => [
    localized(category, language).toLocaleUpperCase(language),
    "",
    ...principles.flatMap((principle, index) => {
      if (principle.category !== category.id) return [];
      const state = data.states[principle.id];
      const stateLabel = state === "practiced" ? t("Practiced", "تمرین کردم")
        : state === "attention" ? t("Needs attention", "نیازمند توجه")
          : state === "na" ? t("Not applicable", "کاربرد ندارد")
            : t("Not answered", "پاسخ داده نشده");
      const prompt = language === "fa" ? principle.promptFa : language === "es" ? principle.promptEs : principle.promptEn;
      const note = state === "attention" ? data.attentionNotes[principle.id]?.trim() : "";
      return [
        `${index + 1}. ${localized(principle, language)} — ${stateLabel}`,
        `  ${prompt}`,
        ...(note ? [`  ${t("What happened today that needs attention?", "امروز چه اتفاقی افتاد که نیاز به توجه دارد؟")}`, `  ${answer(note)}`] : []),
        "",
      ];
    }),
  ]);
  const reflections = [
    [t("Where did I live my principles?", "کجا بر اساس اصولم زندگی کردم؟"), data.highlights],
    [t("Where do I still need to work?", "کجا هنوز نیاز به کار دارم؟"), data.attention],
    [t("What character pattern, including self-pity, did I notice, and how did I work on it?", "چه الگوی رفتاری، از جمله ترحم به خود، را دیدم و چگونه روی آن کار کردم؟"), data.patternAction],
    [t("If another person's drinking or substance use affected me or my family today, what happened and what could I control?", "اگر مصرف الکل یا موادِ فرد دیگری امروز بر من یا خانواده‌ام اثر گذاشت، چه اتفاقی افتاد و چه چیزی در اختیار من بود؟"), data.familyContext],
    [t("Do I owe an apology or amends?", "آیا به کسی عذرخواهی یا جبران بدهکارم؟"), data.amends],
    [t("One action for tomorrow", "یک اقدام برای فردا"), data.tomorrow],
    [t("What am I grateful for?", "برای چه چیزی سپاسگزارم؟"), data.gratitude],
  ];

  return [
    t("Step 10 Daily Inventory", "ترازنامه روزانه گام دهم"),
    formatDisplayDate(data.date, language),
    "",
    ...principleSections,
    t("Daily reflection", "بازتاب روزانه").toLocaleUpperCase(language),
    "",
    ...reflections.flatMap(([label, value]) => [label, `  ${answer(value)}`, ""]),
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

export function formatStep10Analytics(analytics: Step10AnalyticsData, language: Language, t: Translate, sample = false) {
  if (analytics.totalEntries === 0) {
    return [
      t("Step 10 analytics", "تحلیل گام ۱۰"),
      `${t("All saved Step 10 inventories through", "همه ترازنامه‌های ذخیره‌شده گام ۱۰ تا")} ${formatDisplayDate(analytics.through, language)}`,
      "",
      t("Save your first Step 10 inventory to begin seeing patterns across time.", "اولین ترازنامه گام ۱۰ خود را ذخیره کنید تا الگوها را در طول زمان ببینید."),
    ].join("\n");
  }
  const locale = language === "fa" ? "fa-IR" : language === "es" ? "es-US" : "en-US";
  const formatPrinciples = (items: PrincipleAnalytics[], countKey: "practiced" | "attention") =>
    items.length ? items.map((item, index) => {
      const principle = principles.find((candidate) => candidate.id === item.id);
      const countLabel = countKey === "practiced" ? t("practiced", "تمرین‌شده") : t("needs attention", "نیازمند توجه");
      const rate = countKey === "practiced" ? item.practiceRate : 100 - item.practiceRate;
      return `${index + 1}. ${principle ? localized(principle, language) : item.id} — ${item[countKey]} ${countLabel} (${rate}%)`;
    }) : [t("No pattern yet", "هنوز الگویی وجود ندارد")];
  const change = analytics.recentChange;
  const changeLabel = change === null
    ? t("Not enough history yet", "هنوز سابقه کافی نیست")
    : `${change > 0 ? "+" : ""}${change} ${t("percentage points", "واحد درصد")}`;
  const monthly = analytics.allMonths.map((month) => {
    const label = new Intl.DateTimeFormat(locale, { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${month.month}-01T12:00:00Z`));
    return `• ${label}: ${month.entries} ${t("saved inventories", "ترازنامه ذخیره‌شده")}`;
  });
  const insights = summarizeStep10Insights(analytics);
  const latestHighlight = analytics.written.reflections.find((item) => item.field === "highlights")?.excerpts[0];
  const latestConcern = analytics.written.reflections.find((item) => item.field === "attention")?.excerpts[0];
  const insightLines = (items: PrincipleAnalytics[], countKey: "practiced" | "attention") => items.map((item) => {
    const principle = principles.find((candidate) => candidate.id === item.id);
    const label = countKey === "practiced"
      ? t("recorded answers marked Practiced", "پاسخ ثبت‌شده با برچسب «تمرین کردم»")
      : t("recorded answers marked Needs attention", "پاسخ ثبت‌شده با برچسب «نیازمند توجه»");
    return `• ${principle ? localized(principle, language) : item.id}: ${item[countKey]} ${t("of", "از")} ${item.answered} ${label}`;
  });

  return [
    t("Step 10 analytics", "تحلیل گام ۱۰"),
    ...(sample ? [t("Sample data", "داده نمونه")] : []),
    `${t("All saved Step 10 inventories through", "همه ترازنامه‌های ذخیره‌شده گام ۱۰ تا")} ${formatDisplayDate(analytics.through, language)}`,
    `${t("From the first saved inventory through today", "از نخستین ترازنامه ذخیره‌شده تا امروز")}: ${analytics.firstEntryDate ? formatDisplayDate(analytics.firstEntryDate, language) : "—"} – ${formatDisplayDate(analytics.through, language)}`,
    "",
    `${t("Practiced share", "سهم تمرین‌شده")}: ${analytics.practiceRate}% ${t("of scored selections", "از انتخاب‌های امتیازدار")}`,
    `${t("Saved inventories", "ترازنامه‌های ذخیره‌شده")}: ${analytics.totalEntries}`,
    `${t("Current streak", "روند پیوسته فعلی")}: ${analytics.currentStreak} ${t("days", "روز")}`,
    "",
    `${t("Your current pattern", "الگوی فعلی شما")}: ${describeStep10Pattern(analytics, t)}`,
    `${t("Last seven vs. previous seven", "هفت مورد اخیر در برابر هفت مورد پیشین")}: ${changeLabel}`,
    "",
    t("What your inventories show", "ترازنامه‌های شما چه نشان می‌دهند").toLocaleUpperCase(language),
    t("These patterns describe your recorded choices, not your worth or a recovery score. We look for repeated answers on at least three days; N/A and unanswered principles do not count.", "این الگوها انتخاب‌های ثبت‌شده شما را توصیف می‌کنند، نه ارزش شما یا نمره بهبودی‌تان را. ما پاسخ‌های تکرارشده در دست‌کم سه روز را بررسی می‌کنیم؛ گزینه «کاربرد ندارد» و پاسخ‌های خالی محاسبه نمی‌شوند."),
    "",
    t("Where you are doing well", "جاهایی که خوب پیش می‌روید"),
    ...(insights.strengths.length ? insightLines(insights.strengths, "practiced") : [insights.enoughHistory
      ? t("No repeated Practiced pattern is clear yet. Review your entries with your sponsor.", "هنوز الگوی روشنی از «تمرین کردم» دیده نمی‌شود. نوشته‌هایتان را با حامی مرور کنید.")
      : t("Save more inventories to see a repeated pattern. Discuss what you have recorded with your sponsor.", "برای دیدن الگوی تکرارشونده، ترازنامه‌های بیشتری ذخیره کنید. موارد ثبت‌شده را با حامی در میان بگذارید.")]),
    ...(latestHighlight ? [`${t("Recent words about what went well", "نوشته اخیر درباره آنچه خوب پیش رفت")} — ${formatDisplayDate(latestHighlight.date, language)}: “${latestHighlight.text.replace(/\r?\n/g, " ")}”`] : []),
    "",
    t("Where to ask for help", "جاهایی که می‌توانید کمک بخواهید"),
    ...(insights.focus.length ? insightLines(insights.focus, "attention") : [insights.enoughHistory
      ? t("Among principles answered on at least three days, none was marked Needs attention at least half the time. Bring any concerns to your sponsor anyway.", "در میان اصولی که در دست‌کم سه روز به آن‌ها پاسخ داده‌اید، هیچ‌کدام دست‌کم در نیمی از موارد «نیازمند توجه» نبوده‌اند. با این حال نگرانی‌های خود را با حامی در میان بگذارید.")
      : t("Save more inventories before looking for a recurring focus. Your sponsor can still help with today's concerns.", "پیش از جست‌وجوی تمرکز تکرارشونده، ترازنامه‌های بیشتری ذخیره کنید. حامی همچنان می‌تواند درباره نگرانی‌های امروز کمک کند.")]),
    ...(latestConcern ? [`${t("Recent words about what needs attention", "نوشته اخیر درباره آنچه نیازمند توجه است")} — ${formatDisplayDate(latestConcern.date, language)}: “${latestConcern.text.replace(/\r?\n/g, " ")}”`] : []),
    "",
    formatStep10Written(analytics, language, t),
    "",
    `${t("Review this with your sponsor", "این گزارش را با حامی مرور کنید")}: ${sponsorGuidance(t)}`,
    "",
    t("Practiced most often", "بیشترین تمرین").toLocaleUpperCase(language),
    ...formatPrinciples(analytics.topPracticed, "practiced"),
    "",
    t("Recurring focus", "تمرکز تکرارشونده").toLocaleUpperCase(language),
    ...formatPrinciples(analytics.topAttention, "attention"),
    "",
    t("Practice by area", "تمرین بر اساس حوزه").toLocaleUpperCase(language),
    ...analytics.categories.map((category) => {
      const definition = principleCategories.find((candidate) => candidate.id === category.id);
      return `• ${definition ? localized(definition, language) : category.id}: ${category.practiceRate}% (${category.answered} ${t("scored selections", "انتخاب امتیازدار")})`;
    }),
    "",
    t("Activity over time", "فعالیت در طول زمان").toLocaleUpperCase(language),
    ...monthly,
    "",
    t("This private summary organizes saved Step 10 selections and written reflections by field and selected principle. It does not interpret every nuance of your words, analyze Step 4, or provide a diagnosis or clinical assessment.", "این خلاصه خصوصی، انتخاب‌ها و بازتاب‌های نوشته‌شده ذخیره‌شده گام ۱۰ را بر اساس بخش و اصل انتخابی مرتب می‌کند. همه ظرافت‌های نوشته‌های شما را تفسیر نمی‌کند، گام ۴ را تحلیل نمی‌کند و تشخیص یا ارزیابی بالینی ارائه نمی‌دهد."),
  ].join("\n").trimEnd();
}

export function formatStep10SponsorReport(data: Step10Data, analytics: Step10AnalyticsData, language: Language, t: Translate, sample = false) {
  return `${formatStep10Inventory(data, language, t)}\n\n━━━━━━━━━━━━━━━━━━━━\n\n${formatStep10Analytics(analytics, language, t, sample)}`;
}
