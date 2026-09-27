import { formatDisplayDate, principleCategories, principles, type Language } from "@/lib/inventory";
import type { Step10AnalyticsData, PrincipleAnalytics } from "@/lib/step10-analytics";
import type { Step10Data } from "@/components/recovery/step10-inventory";
import { summarizeStep10Insights } from "@/lib/step10-insights";
import { sponsorGuidance } from "@/lib/recovery-guidance";

type Translate = (english: string, farsi: string) => string;

function localized(item: { en: string; es: string; fa: string }, language: Language) {
  return item[language];
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
  const monthly = analytics.months.map((month) => {
    const label = new Intl.DateTimeFormat(locale, { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${month.month}-01T12:00:00Z`));
    return `• ${label}: ${month.entries} ${t("saved inventories", "ترازنامه ذخیره‌شده")}`;
  });
  const insights = summarizeStep10Insights(analytics);
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
    "",
    t("Where to ask for help", "جاهایی که می‌توانید کمک بخواهید"),
    ...(insights.focus.length ? insightLines(insights.focus, "attention") : [insights.enoughHistory
      ? t("Among principles answered on at least three days, none was marked Needs attention at least half the time. Bring any concerns to your sponsor anyway.", "در میان اصولی که در دست‌کم سه روز به آن‌ها پاسخ داده‌اید، هیچ‌کدام دست‌کم در نیمی از موارد «نیازمند توجه» نبوده‌اند. با این حال نگرانی‌های خود را با حامی در میان بگذارید.")
      : t("Save more inventories before looking for a recurring focus. Your sponsor can still help with today's concerns.", "پیش از جست‌وجوی تمرکز تکرارشونده، ترازنامه‌های بیشتری ذخیره کنید. حامی همچنان می‌تواند درباره نگرانی‌های امروز کمک کند.")]),
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
    t("This summary uses only the principle selections in your saved Step 10 inventories. It does not analyze Step 4, and it is not a diagnosis or clinical assessment.", "این خلاصه فقط از انتخاب‌های اصول در ترازنامه‌های ذخیره‌شده گام ۱۰ شما استفاده می‌کند. گام ۴ را تحلیل نمی‌کند و تشخیص یا ارزیابی بالینی نیست."),
  ].join("\n").trimEnd();
}

export function formatStep10SponsorReport(data: Step10Data, analytics: Step10AnalyticsData, language: Language, t: Translate, sample = false) {
  return `${formatStep10Inventory(data, language, t)}\n\n━━━━━━━━━━━━━━━━━━━━\n\n${formatStep10Analytics(analytics, language, t, sample)}`;
}
