export type Language = "en" | "fa" | "es";

export type PrincipleState = "practiced" | "attention" | "na";

export type Principle = {
  id: string;
  category: "inner" | "relationships" | "recovery";
  en: string;
  fa: string;
  es: string;
  promptEn: string;
  promptFa: string;
  promptEs: string;
};

export const principles: Principle[] = [
  { id: "honesty", category: "inner", en: "Honesty", fa: "صداقت", es: "Honestidad", promptEn: "I told the truth to myself and others.", promptFa: "با خودم و دیگران صادق بودم.", promptEs: "Dije la verdad a mí mismo y a los demás." },
  { id: "open-mindedness", category: "inner", en: "Open-mindedness", fa: "ذهن باز", es: "Mentalidad abierta", promptEn: "I stayed open to another point of view.", promptFa: "برای شنیدن دیدگاه دیگری آماده بودم.", promptEs: "Me mantuve abierto a otro punto de vista." },
  { id: "willingness", category: "inner", en: "Willingness", fa: "تمایل", es: "Buena disposición", promptEn: "I was willing to take the next helpful action.", promptFa: "مایل بودم قدم مفید بعدی را بردارم.", promptEs: "Estuve dispuesto a dar el siguiente paso útil." },
  { id: "humility", category: "inner", en: "Humility", fa: "فروتنی", es: "Humildad", promptEn: "I accepted that I do not have every answer.", promptFa: "پذیرفتم که پاسخ همه چیز را نمی‌دانم.", promptEs: "Acepté que no tengo todas las respuestas." },
  { id: "responsibility", category: "inner", en: "Responsibility", fa: "مسئولیت‌پذیری", es: "Responsabilidad", promptEn: "I owned my choices without blaming.", promptFa: "مسئولیت انتخاب‌هایم را بدون سرزنش پذیرفتم.", promptEs: "Asumí mis decisiones sin culpar a los demás." },
  { id: "acceptance", category: "inner", en: "Acceptance", fa: "پذیرش", es: "Aceptación", promptEn: "I accepted what I could not control today.", promptFa: "آنچه امروز در کنترل من نبود را پذیرفتم.", promptEs: "Acepté lo que hoy no podía controlar." },
  { id: "patience", category: "inner", en: "Patience", fa: "صبر", es: "Paciencia", promptEn: "I allowed time instead of forcing an outcome.", promptFa: "به جای اجبار نتیجه، به زمان فرصت دادم.", promptEs: "Dejé que el tiempo actuara en vez de forzar un resultado." },
  { id: "courage", category: "inner", en: "Courage", fa: "شجاعت", es: "Valor", promptEn: "I faced something difficult with care.", promptFa: "با توجه و آرامش با یک دشواری روبه‌رو شدم.", promptEs: "Afronté algo difícil con cuidado." },
  { id: "tolerance", category: "relationships", en: "Tolerance", fa: "بردباری", es: "Tolerancia", promptEn: "I made room for differences.", promptFa: "برای تفاوت‌ها جا باز کردم.", promptEs: "Dejé espacio para las diferencias." },
  { id: "kindness", category: "relationships", en: "Kindness", fa: "مهربانی", es: "Amabilidad", promptEn: "My words and actions were kind.", promptFa: "گفتار و رفتارم مهربانانه بود.", promptEs: "Mis palabras y acciones fueron amables." },
  { id: "compassion", category: "relationships", en: "Compassion", fa: "همدلی", es: "Compasión", promptEn: "I responded to pain with understanding.", promptFa: "با درک و همدلی به درد پاسخ دادم.", promptEs: "Respondí al dolor con comprensión." },
  { id: "forgiveness", category: "relationships", en: "Forgiveness", fa: "بخشش", es: "Perdón", promptEn: "I loosened my hold on resentment.", promptFa: "از چسبیدن به رنجش فاصله گرفتم.", promptEs: "Aflojé mi apego al resentimiento." },
  { id: "respect", category: "relationships", en: "Respect", fa: "احترام", es: "Respeto", promptEn: "I respected myself and other people.", promptFa: "به خودم و دیگران احترام گذاشتم.", promptEs: "Me respeté a mí mismo y a los demás." },
  { id: "boundaries", category: "relationships", en: "Healthy boundaries", fa: "مرزهای سالم", es: "Límites saludables", promptEn: "I said yes or no with clarity and care.", promptFa: "با روشنی و احترام بله یا نه گفتم.", promptEs: "Dije sí o no con claridad y consideración." },
  { id: "accountability", category: "relationships", en: "Accountability", fa: "پاسخ‌گویی", es: "Rendición de cuentas", promptEn: "I acknowledged my impact on others.", promptFa: "تأثیر رفتارم بر دیگران را پذیرفتم.", promptEs: "Reconocí el efecto de mis acciones en los demás." },
  { id: "amends", category: "relationships", en: "Making things right", fa: "جبران خسارت", es: "Reparar el daño", promptEn: "I repaired harm when it was appropriate.", promptFa: "در صورت مناسب بودن، برای جبران آسیب اقدام کردم.", promptEs: "Reparé el daño cuando fue apropiado." },
  { id: "integrity", category: "recovery", en: "Integrity", fa: "درستکاری", es: "Integridad", promptEn: "My actions matched my values.", promptFa: "رفتارم با ارزش‌هایم هماهنگ بود.", promptEs: "Mis acciones estuvieron de acuerdo con mis valores." },
  { id: "self-discipline", category: "recovery", en: "Self-discipline", fa: "خودانضباطی", es: "Autodisciplina", promptEn: "I followed through on a healthy commitment.", promptFa: "به یک تعهد سالم عمل کردم.", promptEs: "Cumplí un compromiso saludable." },
  { id: "service", category: "recovery", en: "Service", fa: "خدمت", es: "Servicio", promptEn: "I helped without trying to control the result.", promptFa: "بدون تلاش برای کنترل نتیجه کمک کردم.", promptEs: "Ayudé sin intentar controlar el resultado." },
  { id: "gratitude", category: "recovery", en: "Gratitude", fa: "قدردانی", es: "Gratitud", promptEn: "I noticed something worth appreciating.", promptFa: "چیزی را که شایسته قدردانی بود دیدم.", promptEs: "Reconocí algo digno de agradecer." },
  { id: "faith", category: "recovery", en: "Faith", fa: "ایمان", es: "Fe", promptEn: "I trusted the process beyond this moment.", promptFa: "به روندی فراتر از این لحظه اعتماد کردم.", promptEs: "Confié en el proceso más allá de este momento." },
  { id: "hope", category: "recovery", en: "Hope", fa: "امید", es: "Esperanza", promptEn: "I left room for change and possibility.", promptFa: "برای تغییر و امکان تازه جا گذاشتم.", promptEs: "Dejé espacio para el cambio y nuevas posibilidades." },
  { id: "perseverance", category: "recovery", en: "Perseverance", fa: "پشتکار", es: "Perseverancia", promptEn: "I kept going without demanding perfection.", promptFa: "بدون انتظار کمال به راه ادامه دادم.", promptEs: "Seguí adelante sin exigirme perfección." },
  { id: "mindfulness", category: "recovery", en: "Mindfulness", fa: "ذهن‌آگاهی", es: "Atención plena", promptEn: "I paused and noticed what was happening inside me.", promptFa: "مکث کردم و آنچه در درونم می‌گذشت را دیدم.", promptEs: "Hice una pausa y observé lo que ocurría dentro de mí." },
];

export const principleCategories = [
  { id: "inner", en: "Inner practice", fa: "تمرین درونی", es: "Práctica interior" },
  { id: "relationships", en: "Relationships", fa: "روابط", es: "Relaciones" },
  { id: "recovery", en: "Recovery practice", fa: "تمرین بهبودی", es: "Práctica de recuperación" },
] as const;

export const step4Types = [
  {
    id: "resentment",
    en: "Resentment",
    fa: "رنجش",
    es: "Resentimiento",
    descriptionEn: "Look honestly at what happened, how it affected you, and your part in the pattern.",
    descriptionFa: "صادقانه ببینید چه اتفاقی افتاد، چگونه بر شما اثر گذاشت و سهم شما در این الگو چه بود.",
    descriptionEs: "Mira con honestidad lo que ocurrió, cómo te afectó y cuál fue tu parte en el patrón.",
  },
  {
    id: "fear",
    en: "Fear",
    fa: "ترس",
    es: "Miedo",
    descriptionEn: "Name the fear, the story underneath it, and one grounded action.",
    descriptionFa: "ترس، داستان پشت آن و یک اقدام واقع‌بینانه را مشخص کنید.",
    descriptionEs: "Nombra el miedo, la historia que hay detrás y una acción realista.",
  },
  {
    id: "relationship",
    en: "Relationships & conduct",
    fa: "روابط و رفتار",
    es: "Relaciones y conducta",
    descriptionEn: "Review patterns in close, family, and intimate relationships, including honesty, motives, consent, respect, and boundaries.",
    descriptionFa: "الگوهای روابط نزدیک، خانوادگی و صمیمی را از نظر صداقت، انگیزه، رضایت، احترام و مرزها بررسی کنید.",
    descriptionEs: "Revisa patrones en relaciones cercanas, familiares e íntimas, incluida la honestidad, los motivos, el consentimiento, el respeto y los límites.",
  },
  {
    id: "harm",
    en: "Harms to others",
    fa: "آسیب به دیگران",
    es: "Daños a otras personas",
    descriptionEn: "Identify who was affected, what happened, your responsibility, and what safe guidance or repair may eventually be considered.",
    descriptionFa: "مشخص کنید چه کسی آسیب دید، چه اتفاقی افتاد، مسئولیت شما چیست و چه راهنمایی یا جبران امنی ممکن است بعداً بررسی شود.",
    descriptionEs: "Identifica quién fue afectado, qué ocurrió, tu responsabilidad y qué orientación o reparación segura podría considerarse más adelante.",
  },
  {
    id: "pattern",
    en: "Defects & patterns",
    fa: "نقص‌های شخصیتی و الگوها",
    es: "Defectos y patrones",
    descriptionEn: "Connect recurring character defects to their specific shortcomings, consequences, and the principles that can guide change.",
    descriptionFa: "نقص‌های شخصیتی تکراری را به کمبودهای رفتاری، پیامدها و اصولی که تغییر را هدایت می‌کنند پیوند دهید.",
    descriptionEs: "Relaciona los defectos de carácter recurrentes con sus limitaciones específicas, consecuencias y los principios que pueden guiar el cambio.",
  },
  {
    id: "strength",
    en: "Strengths",
    fa: "نقاط قوت",
    es: "Fortalezas",
    descriptionEn: "Include the qualities and choices that support your recovery.",
    descriptionFa: "ویژگی‌ها و انتخاب‌هایی را که از بهبودی شما حمایت می‌کنند ثبت کنید.",
    descriptionEs: "Incluye las cualidades y decisiones que apoyan tu recuperación.",
  },
] as const;

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDisplayDate(value: string, language: Language) {
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat(language === "fa" ? "fa-IR" : language === "es" ? "es-US" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
