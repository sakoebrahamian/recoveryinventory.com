import type { Language } from "@/lib/languages";
import { localizedText, translateForLanguage } from "@/lib/localization";
import { principles } from "@/lib/inventory";
import { reflectionPatternLabels, type ReflectionChoiceField, type ReflectionKind, type ReflectionPattern } from "@/lib/reflection-journals";

export const reflectionMessages = {
  quick: ["Two-minute check-in", "مرور دو دقیقه‌ای"],
  full: ["Full 39-question inventory", "ترازنامه کامل ۳۹ پرسشی"],
  wentWell: ["What went well today?", "امروز چه چیزی خوب پیش رفت؟"],
  needsAttention: ["What needs attention today?", "امروز چه چیزی نیاز به توجه دارد؟"],
  independent: ["An independent journal for people working a 12-step program.", "دفتر مستقلی برای کسانی که برنامه‌ای دوازده‌گامی را دنبال می‌کنند."],
  trial: ["Save up to 30 Step 10 entries in 30 days. No payment required. Read and export saved entries after the free month.", "در ۳۰ روز تا ۳۰ نوشته گام ۱۰ ذخیره کنید. نیازی به پرداخت نیست. پس از ماه رایگان هم نوشته‌هایتان را بخوانید و خروجی بگیرید."],
  freeStep4: ["Try the free Step 4 demo", "نسخه آزمایشی رایگان گام ۴ را امتحان کنید"],
  saveStep4: ["Saving Step 4 workbooks is included with membership.", "ذخیره دفترهای گام ۴ در اشتراک گنجانده شده است."],
  membership: ["Both plans include saved Step 4 workbooks and private journals for Steps 6 and 7, Steps 8 and 9, and Step 11.", "هر دو طرح شامل ذخیره دفترهای گام ۴ و دفترهای خصوصی گام‌های ۶ و ۷، گام‌های ۸ و ۹ و گام ۱۱ هستند."],
  privateStorage: ["Saved reflections for Steps 6 and 7, Steps 8 and 9, and Step 11 use encrypted account storage and are available with a paid membership.", "نوشته‌های ذخیره‌شده گام‌های ۶ و ۷، گام‌های ۸ و ۹ و گام ۱۱ با رمزگذاری در حساب نگهداری می‌شوند و با اشتراک پولی در دسترس‌اند."],
  weekTitle: ["What a week can show you", "یک هفته چه چیزی به شما نشان می‌دهد؟"],
  weekCaption: ["Fictional week · Patience", "هفته‌ای فرضی · صبر"],
  weekSummary: ["In this example, patience needed attention twice. On two other days, the writer paused before responding.", "در این نمونه، صبر دو بار نیاز به توجه داشت. در دو روز دیگر، نویسنده پیش از پاسخ دادن مکث کرد."],
  weekAction: ["Next time plans change, I’ll take a breath before responding.", "دفعه بعد که برنامه‌ها تغییر کرد، پیش از پاسخ دادن نفسی می‌کشم."],
  secondNote: ["I gave myself a moment to listen before I replied.", "پیش از پاسخ دادن، لحظه‌ای به خودم فرصت دادم تا گوش کنم."],
  previewSponsor: ["Preview a sponsor summary", "پیش‌نمایش خلاصه برای حامی"],
  chooseSample: ["Choose which sample notes to include. The preview updates as you make your selection.", "یادداشت‌های نمونه‌ای را که می‌خواهید در گزارش باشند انتخاب کنید. پیش‌نمایش با انتخاب شما به‌روز می‌شود."],
  moreJournals: ["More journals", "دفترهای بیشتر"],
  paidJournals: ["Saving these journals is included with membership.", "ذخیره این دفترها در اشتراک گنجانده شده است."],
  openJournal: ["Open this journal", "این دفتر را باز کنید"],
  savedDates: ["Saved dates", "تاریخ‌های ذخیره‌شده"],
  tracked: ["Patterns you’ve tracked", "الگوهایی که ثبت کرده‌اید"],
  unsaved: ["You have unsaved journal changes. Continue without saving them?", "در دفتر تغییرات ذخیره‌نشده دارید. بدون ذخیره ادامه می‌دهید؟"],
  readError: ["Could not load this journal. Try again.", "این دفتر بارگذاری نشد. دوباره تلاش کنید."],
  writeFirst: ["Add a reflection before saving.", "پیش از ذخیره کمی درباره این موضوع بنویسید."],
  step67: ["Patterns I’m Ready to Change", "الگوهایی که آماده‌ام تغییر دهم"],
  step89: ["Preparing for Amends", "آمادگی برای جبران"],
  step11: ["Morning Reflection", "تأمل صبحگاهی"],
  step67Label: ["Steps 6 and 7", "گام‌های ۶ و ۷"],
  step89Label: ["Steps 8 and 9", "گام‌های ۸ و ۹"],
  step11Label: ["Step 11", "گام ۱۱"],
  pattern: ["A pattern I’ve noticed in Step 4 or Step 10", "الگویی که در گام ۴ یا گام ۱۰ دیده‌ام"],
  willingness: ["What am I ready to work on, and what makes it hard to change?", "آماده‌ام روی چه چیزی کار کنم و چه چیزی تغییر را دشوار می‌کند؟"],
  humility: ["Where do I need help with this pattern, and how do I want to ask for it?", "برای این الگو کجا به کمک نیاز دارم و می‌خواهم چگونه آن را بخواهم؟"],
  higherPower: ["If asking a Higher Power for help is part of your practice, use your own words.", "اگر کمک خواستن از نیروی برتر بخشی از تمرین شماست، آن را با واژه‌های خودتان بنویسید."],
  initials: ["Initials (optional)", "حروف اول نام (اختیاری)"],
  responsibility: ["What can I take responsibility for or change in my behavior?", "مسئولیت چه چیزی را می‌توانم بپذیرم یا چه رفتاری را می‌توانم تغییر دهم؟"],
  boundaries: ["What boundaries and possible effects should I consider?", "به چه مرزها و پیامدهای احتمالی باید توجه کنم؟"],
  sponsor: ["What would I like to discuss with my sponsor before I act?", "پیش از اقدام می‌خواهم چه چیزی را با حامی خود در میان بگذارم؟"],
  practice: ["Reflection practice (optional)", "شیوه تأمل (اختیاری)"],
  intention: ["What principle do I want to practice today, and what would that look like?", "امروز می‌خواهم کدام اصل را تمرین کنم و در عمل چگونه خواهد بود؟"],
  prayer: ["Prayer", "دعا"],
  meditation: ["Meditation", "مراقبه"],
  quiet: ["Quiet reflection", "تأمل در سکوت"],
  morningIntention: ["Your morning intention", "نیت صبحگاهی شما"],
  step67Guide: ["Working With Recurring Patterns", "کار روی الگوهای تکرارشونده"],
  step11Guide: ["Building a Morning Reflection Habit", "ساختن عادت تأمل صبحگاهی"],
  step67GuideText: ["Choose a behavior you notice repeating. In this guide, character defects and shortcomings are familiar terms for patterns and habits you want to work on. Use willingness to name what you’re ready to change and humility to consider the help you want to ask for.", "رفتاری را انتخاب کنید که تکرار آن را می‌بینید. در این راهنما، «نقص‌های شخصیتی» و «کاستی‌ها» اصطلاحاتی برای الگوها و عادت‌هایی هستند که می‌خواهید روی آن‌ها کار کنید. با تمایل مشخص کنید آماده چه تغییری هستید و با فروتنی به کمکی فکر کنید که می‌خواهید درخواست کنید."],
  step89GuideText: ["Use this worksheet to reflect on your part, the impact on the other person, and a change you can make. Consider their boundaries. Bring your questions to your sponsor before deciding whether or how to make contact.", "با این برگه به نقش خود، تأثیر رفتارتان بر دیگری و تغییری که می‌توانید انجام دهید فکر کنید. مرزهای فرد دیگر را در نظر بگیرید و پیش از تصمیم درباره تماس یا شیوه آن، پرسش‌ها را با حامی خود در میان بگذارید."],
  step11GuideText: ["After prayer, meditation, or quiet reflection, choose one intention for today. Use spiritual language that fits your beliefs. Revisit your intention in that day’s Step 10 to see where you put it into practice.", "پس از دعا، مراقبه یا تأمل در سکوت، یک نیت برای امروز انتخاب کنید. از زبان معنوی متناسب با باورهایتان استفاده کنید. در گام ۱۰ همان روز به نیت خود برگردید و ببینید کجا آن را به کار بردید."],
  step67Example: ["I get defensive when someone corrects me. I’m willing to pause before replying, and I want help listening through the first moment of discomfort.", "وقتی کسی اشتباهم را گوشزد می‌کند حالت دفاعی می‌گیرم. آماده‌ام پیش از پاسخ مکث کنم و کمک می‌خواهم تا با وجود ناراحتی اولیه به حرفش گوش بدهم."],
  step89Example: ["I interrupted J. during a difficult conversation. I can take responsibility by listening more carefully. I’ll ask my sponsor how to consider J.’s space before deciding on a next step.", "در گفت‌وگویی سخت حرف «ج.» را قطع کردم. با گوش دادن دقیق‌تر می‌توانم مسئولیت بپذیرم. پیش از تصمیم درباره گام بعد، از حامی‌ام می‌پرسم چگونه حریم «ج.» را رعایت کنم."],
  step11Example: ["After a few minutes of quiet, I chose patience. At lunch, I’ll let the other person finish before I respond.", "پس از چند دقیقه سکوت، صبر را انتخاب کردم. هنگام ناهار می‌گذارم طرف مقابل حرفش را تمام کند و بعد پاسخ می‌دهم."],
  fictionalExample: ["Fictional example", "نمونه فرضی"],
  fellowshipResources: ["Fellowship resources", "منابع انجمن‌ها"],
  resourcesIntro: ["Find meetings and official literature directly from the fellowships that publish these resources.", "جلسه‌ها و منابع رسمی را مستقیماً در وب‌سایت انجمن‌هایی بیابید که این منابع را منتشر می‌کنند."],
  findMeetings: ["Find meetings", "یافتن جلسه‌ها"],
  officialLiterature: ["Official literature", "منابع رسمی"],
  choosePattern: ["Choose a pattern or write your own", "یک الگو را انتخاب کنید یا با واژه‌های خودتان بنویسید"],
  suggestedPatterns: ["Suggested patterns", "الگوهای پیشنهادی"],
  savedPatterns: ["My past patterns", "الگوهای گذشته من"],
  readiness: ["How ready am I to work on it?", "چقدر آماده‌ام روی این الگو کار کنم؟"],
  noticing: ["I’m noticing it", "دارم به این الگو توجه می‌کنم"],
  open: ["I’m open to working on it", "مایلم روی این الگو کار کنم"],
  ready: ["I’m ready to try a different response", "آماده‌ام پاسخ متفاوتی را امتحان کنم"],
  support: ["What help would I like to seek?", "دوست دارم چه کمکی بگیرم؟"],
  seekHigherPower: ["Ask my Higher Power for help", "از نیروی برترم کمک بگیرم"],
  seekSponsor: ["Talk with my sponsor", "با حامی‌ام گفت‌وگو کنم"],
  seekTrustedPerson: ["Reach out to someone I trust", "با کسی که به او اعتماد دارم صحبت کنم"],
  principle: ["Which principle would I like to practice?", "دوست دارم کدام اصل را تمرین کنم؟"],
  focus: ["What’s my focus today?", "تمرکز امروز من بر چیست؟"],
  focusResponsibility: ["Taking responsibility", "مسئولیت‌پذیری"],
  focusBoundaries: ["Considering the other person’s boundaries", "توجه به مرزهای فرد مقابل"],
  focusSponsor: ["Preparing to talk with my sponsor", "آماده شدن برای گفت‌وگو با حامی‌ام"],
  focusBehavior: ["Changing my behavior", "تغییر رفتارم"],
  filterFocus: ["Filter saved dates by focus", "نمایش تاریخ‌های ذخیره‌شده بر اساس موضوع"],
  allFocuses: ["All focus areas", "همه موضوع‌ها"],
  noFocusDates: ["No saved dates for this focus yet.", "هنوز تاریخی برای این موضوع ذخیره نشده است."],
  last30: ["Last 30 days", "۳۰ روز گذشته"],
  last90: ["Last 90 days", "۹۰ روز گذشته"],
  allDates: ["All saved dates", "همه تاریخ‌های ذخیره‌شده"],
  filterPattern: ["Filter by pattern", "فیلتر بر اساس الگو"],
  allPatterns: ["All patterns", "همه الگوها"],
  patternAnalytics: ["Pattern analytics", "تحلیل الگوها"],
  analyticsDemo: ["Analytics demo", "نسخه آزمایشی تحلیل"],
  periodCount: ["{count} saved dates", "{count} تاریخ ذخیره‌شده"],
  readinessCounts: ["Readiness choices", "انتخاب‌های آمادگی"],
  supportCounts: ["Help I want to seek", "کمکی که می‌خواهم بگیرم"],
  principleCounts: ["Principles I want to practice", "اصولی که می‌خواهم تمرین کنم"],
  noChoices: ["No choices saved for this view yet.", "هنوز انتخابی برای این نما ذخیره نشده است."],
  guideAvailability: ["Members can use AI chat and guided questions in Step 4, Steps 6 and 7, Steps 8 and 9, and Step 10.", "اعضا می‌توانند در گام ۴، گام‌های ۶ و ۷، گام‌های ۸ و ۹ و گام ۱۰ از گفت‌وگو با هوش مصنوعی و پرسش‌های هدایت‌شده استفاده کنند."],
  guideAllowance: ["Each member can send up to {daily} AI requests per day across all supported steps, both guide modes, and all languages. The site has a shared limit of {monthly} requests per month.", "هر عضو می‌تواند در مجموعِ گام‌های دارای راهنما، هر دو حالت و همه زبان‌ها، روزانه تا {daily} درخواست به هوش مصنوعی بفرستد. سقف مشترک سایت برای همه اعضا {monthly} درخواست در ماه است."],
  guideStart67: ["What pattern would you like to understand or change?", "دوست دارید کدام الگو را بهتر بشناسید یا تغییر دهید؟"],
  guideStart89: ["What part of this situation would you like to reflect on?", "دوست دارید درباره کدام بخش از این موقعیت فکر کنید؟"],
} as const;

export type ReflectionMessage = keyof typeof reflectionMessages;

export function reflectionText(language: Language, key: ReflectionMessage) {
  const [english, farsi] = reflectionMessages[key];
  return translateForLanguage(language, english, farsi);
}

const choiceLabels: Record<Exclude<ReflectionChoiceField, "patternChoice" | "principle">, Record<string, ReflectionMessage>> = {
  readiness: { noticing: "noticing", open: "open", ready: "ready" },
  support: { "higher-power": "seekHigherPower", sponsor: "seekSponsor", "trusted-person": "seekTrustedPerson" },
  focus: { responsibility: "focusResponsibility", boundaries: "focusBoundaries", "sponsor-conversation": "focusSponsor", "changing-behavior": "focusBehavior" },
};

export function reflectionChoiceText(language: Language, field: ReflectionChoiceField, value: string) {
  if (field === "patternChoice") return reflectionPatternLabels[value as ReflectionPattern]?.[language] ?? "";
  if (field === "principle") {
    const principle = principles.find(({ id }) => id === value);
    return principle ? localizedText(principle, language) : "";
  }
  const label = choiceLabels[field][value];
  return label ? reflectionText(language, label) : "";
}

export const reflectionLabels = {
  step67: { label: "step67Label", guide: "step67Guide", intro: "step67GuideText", example: "step67Example", prompt: "willingness" },
  step89: { label: "step89Label", guide: "step89", intro: "step89GuideText", example: "step89Example", prompt: "sponsor" },
  step11: { label: "step11Label", guide: "step11Guide", intro: "step11GuideText", example: "step11Example", prompt: "intention" },
} as const satisfies Record<ReflectionKind, Record<"label" | "guide" | "intro" | "example" | "prompt", ReflectionMessage>>;
