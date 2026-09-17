export type Language = "en" | "fa";

export type PrincipleState = "practiced" | "attention" | "na";

export type Principle = {
  id: string;
  category: "inner" | "relationships" | "recovery";
  en: string;
  fa: string;
  promptEn: string;
  promptFa: string;
};

export const principles: Principle[] = [
  { id: "honesty", category: "inner", en: "Honesty", fa: "صداقت", promptEn: "I told the truth to myself and others.", promptFa: "با خودم و دیگران صادق بودم." },
  { id: "open-mindedness", category: "inner", en: "Open-mindedness", fa: "ذهن باز", promptEn: "I stayed open to another point of view.", promptFa: "برای شنیدن دیدگاه دیگری آماده بودم." },
  { id: "willingness", category: "inner", en: "Willingness", fa: "تمایل", promptEn: "I was willing to take the next helpful action.", promptFa: "مایل بودم قدم مفید بعدی را بردارم." },
  { id: "humility", category: "inner", en: "Humility", fa: "فروتنی", promptEn: "I accepted that I do not have every answer.", promptFa: "پذیرفتم که پاسخ همه چیز را نمی‌دانم." },
  { id: "responsibility", category: "inner", en: "Responsibility", fa: "مسئولیت‌پذیری", promptEn: "I owned my choices without blaming.", promptFa: "مسئولیت انتخاب‌هایم را بدون سرزنش پذیرفتم." },
  { id: "acceptance", category: "inner", en: "Acceptance", fa: "پذیرش", promptEn: "I accepted what I could not control today.", promptFa: "آنچه امروز در کنترل من نبود را پذیرفتم." },
  { id: "patience", category: "inner", en: "Patience", fa: "صبر", promptEn: "I allowed time instead of forcing an outcome.", promptFa: "به جای اجبار نتیجه، به زمان فرصت دادم." },
  { id: "courage", category: "inner", en: "Courage", fa: "شجاعت", promptEn: "I faced something difficult with care.", promptFa: "با توجه و آرامش با یک دشواری روبه‌رو شدم." },
  { id: "tolerance", category: "relationships", en: "Tolerance", fa: "بردباری", promptEn: "I made room for differences.", promptFa: "برای تفاوت‌ها جا باز کردم." },
  { id: "kindness", category: "relationships", en: "Kindness", fa: "مهربانی", promptEn: "My words and actions were kind.", promptFa: "گفتار و رفتارم مهربانانه بود." },
  { id: "compassion", category: "relationships", en: "Compassion", fa: "همدلی", promptEn: "I responded to pain with understanding.", promptFa: "با درک و همدلی به درد پاسخ دادم." },
  { id: "forgiveness", category: "relationships", en: "Forgiveness", fa: "بخشش", promptEn: "I loosened my hold on resentment.", promptFa: "از چسبیدن به رنجش فاصله گرفتم." },
  { id: "respect", category: "relationships", en: "Respect", fa: "احترام", promptEn: "I respected myself and other people.", promptFa: "به خودم و دیگران احترام گذاشتم." },
  { id: "boundaries", category: "relationships", en: "Healthy boundaries", fa: "مرزهای سالم", promptEn: "I said yes or no with clarity and care.", promptFa: "با روشنی و احترام بله یا نه گفتم." },
  { id: "accountability", category: "relationships", en: "Accountability", fa: "پاسخ‌گویی", promptEn: "I acknowledged my impact on others.", promptFa: "تأثیر رفتارم بر دیگران را پذیرفتم." },
  { id: "amends", category: "relationships", en: "Making things right", fa: "جبران خسارت", promptEn: "I repaired harm when it was appropriate.", promptFa: "در صورت مناسب بودن، برای جبران آسیب اقدام کردم." },
  { id: "integrity", category: "recovery", en: "Integrity", fa: "درستکاری", promptEn: "My actions matched my values.", promptFa: "رفتارم با ارزش‌هایم هماهنگ بود." },
  { id: "self-discipline", category: "recovery", en: "Self-discipline", fa: "خودانضباطی", promptEn: "I followed through on a healthy commitment.", promptFa: "به یک تعهد سالم عمل کردم." },
  { id: "service", category: "recovery", en: "Service", fa: "خدمت", promptEn: "I helped without trying to control the result.", promptFa: "بدون تلاش برای کنترل نتیجه کمک کردم." },
  { id: "gratitude", category: "recovery", en: "Gratitude", fa: "قدردانی", promptEn: "I noticed something worth appreciating.", promptFa: "چیزی را که شایسته قدردانی بود دیدم." },
  { id: "faith", category: "recovery", en: "Faith", fa: "ایمان", promptEn: "I trusted the process beyond this moment.", promptFa: "به روندی فراتر از این لحظه اعتماد کردم." },
  { id: "hope", category: "recovery", en: "Hope", fa: "امید", promptEn: "I left room for change and possibility.", promptFa: "برای تغییر و امکان تازه جا گذاشتم." },
  { id: "perseverance", category: "recovery", en: "Perseverance", fa: "پشتکار", promptEn: "I kept going without demanding perfection.", promptFa: "بدون انتظار کمال به راه ادامه دادم." },
  { id: "mindfulness", category: "recovery", en: "Mindfulness", fa: "ذهن‌آگاهی", promptEn: "I paused and noticed what was happening inside me.", promptFa: "مکث کردم و آنچه در درونم می‌گذشت را دیدم." },
];

export const principleCategories = [
  { id: "inner", en: "Inner practice", fa: "تمرین درونی" },
  { id: "relationships", en: "Relationships", fa: "روابط" },
  { id: "recovery", en: "Recovery practice", fa: "تمرین بهبودی" },
] as const;

export const step4Types = [
  {
    id: "resentment",
    en: "Resentment",
    fa: "رنجش",
    descriptionEn: "Look honestly at what happened, how it affected you, and your part in the pattern.",
    descriptionFa: "صادقانه ببینید چه اتفاقی افتاد، چگونه بر شما اثر گذاشت و سهم شما در این الگو چه بود.",
  },
  {
    id: "fear",
    en: "Fear",
    fa: "ترس",
    descriptionEn: "Name the fear, the story underneath it, and one grounded action.",
    descriptionFa: "ترس، داستان پشت آن و یک اقدام واقع‌بینانه را مشخص کنید.",
  },
  {
    id: "relationship",
    en: "Relationships & harms",
    fa: "روابط و آسیب‌ها",
    descriptionEn: "Notice repeating behavior, its impact, and what repair or boundary may be needed.",
    descriptionFa: "رفتار تکراری، تأثیر آن و جبران یا مرز لازم را بررسی کنید.",
  },
  {
    id: "strength",
    en: "Strengths",
    fa: "نقاط قوت",
    descriptionEn: "Include the qualities and choices that support your recovery.",
    descriptionFa: "ویژگی‌ها و انتخاب‌هایی را که از بهبودی شما حمایت می‌کنند ثبت کنید.",
  },
] as const;

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDisplayDate(value: string, language: Language) {
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat(language === "fa" ? "fa-IR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
