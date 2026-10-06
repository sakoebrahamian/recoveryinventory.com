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
  followUpQuestions?: Array<{ id: string; en: string; fa: string; es: string }>;
};

export const principles: Principle[] = [
  { id: "honesty", category: "inner", en: "Honesty", fa: "صداقت", es: "Honestidad", promptEn: "Was I truthful in my words and actions?", promptFa: "آیا در گفتار و رفتارم صادق بودم؟", promptEs: "¿Fui sincero en mis palabras y acciones?", followUpQuestions: [{ id: "honesty-motives", en: "Was I honest with myself about my motives?", fa: "آیا درباره انگیزه‌هایم با خودم صادق بودم؟", es: "¿Fui sincero conmigo mismo sobre mis motivos?" }] },
  { id: "open-mindedness", category: "inner", en: "Open-mindedness", fa: "ذهن باز", es: "Mentalidad abierta", promptEn: "Did I listen to other viewpoints with an open mind?", promptFa: "آیا با ذهنی باز به دیدگاه‌های دیگر گوش دادم؟", promptEs: "¿Escuché otros puntos de vista con la mente abierta?", followUpQuestions: [{ id: "open-mindedness-being-mistaken", en: "Did I consider that I might be mistaken?", fa: "آیا در نظر گرفتم که ممکن است اشتباه کنم؟", es: "¿Consideré que podía estar equivocado?" }] },
  { id: "willingness", category: "inner", en: "Willingness", fa: "تمایل", es: "Buena disposición", promptEn: "Was I willing to take the next helpful action?", promptFa: "آیا مایل بودم قدم مفید بعدی را بردارم؟", promptEs: "¿Estuve dispuesto a dar el siguiente paso útil?", followUpQuestions: [{ id: "willingness-accepting-help", en: "Did I accept help when I needed it?", fa: "آیا وقتی نیاز داشتم کمک را پذیرفتم؟", es: "¿Acepté ayuda cuando la necesitaba?" }] },
  { id: "humility", category: "inner", en: "Humility", fa: "فروتنی", es: "Humildad", promptEn: "Did I make room for others instead of focusing only on myself?", promptFa: "آیا به جای تمرکز فقط بر خودم، برای دیگران جا باز کردم؟", promptEs: "¿Dejé espacio para los demás en vez de centrarme solo en mí?", followUpQuestions: [{ id: "humility-asking-for-help", en: "Did I acknowledge my limits and ask for help?", fa: "آیا محدودیت‌هایم را پذیرفتم و کمک خواستم؟", es: "¿Reconocí mis límites y pedí ayuda?" }] },
  { id: "responsibility", category: "inner", en: "Responsibility", fa: "مسئولیت‌پذیری", es: "Responsabilidad", promptEn: "Did I acknowledge my mistakes and take responsibility for my actions?", promptFa: "آیا اشتباهاتم را پذیرفتم و مسئولیت رفتارم را به عهده گرفتم؟", promptEs: "¿Reconocí mis errores y asumí la responsabilidad de mis acciones?", followUpQuestions: [{ id: "responsibility-my-part", en: "Did I focus on my part without taking responsibility for someone else's choices?", fa: "آیا بر سهم خودم تمرکز کردم، بدون اینکه مسئولیت انتخاب‌های دیگران را به عهده بگیرم؟", es: "¿Me centré en mi parte sin asumir la responsabilidad de las decisiones de otra persona?" }] },
  { id: "acceptance", category: "inner", en: "Acceptance", fa: "پذیرش", es: "Aceptación", promptEn: "Did I accept what I could not control?", promptFa: "آیا آنچه را در کنترلم نبود پذیرفتم؟", promptEs: "¿Acepté lo que no podía controlar?", followUpQuestions: [{ id: "acceptance-taking-action", en: "Did I act on what was within my control?", fa: "آیا برای آنچه در اختیارم بود اقدام کردم؟", es: "¿Actué sobre lo que estaba bajo mi control?" }] },
  { id: "patience", category: "inner", en: "Patience", fa: "صبر", es: "Paciencia", promptEn: "Did I allow things to take time without trying to rush them?", promptFa: "آیا اجازه دادم کارها زمان لازم را طی کنند، بدون اینکه عجله کنم؟", promptEs: "¿Permití que las cosas tomaran su tiempo sin intentar apresurarlas?", followUpQuestions: [{ id: "patience-pausing", en: "Did I pause before reacting when I felt frustrated?", fa: "آیا وقتی احساس ناکامی کردم، پیش از واکنش مکث کردم؟", es: "¿Hice una pausa antes de reaccionar cuando me sentí frustrado?" }] },
  { id: "courage", category: "inner", en: "Courage", fa: "شجاعت", es: "Valor", promptEn: "Did I face something difficult with care?", promptFa: "آیا با ملاحظه با یک دشواری روبه‌رو شدم؟", promptEs: "¿Afronté algo difícil con cuidado?" },
  { id: "tolerance", category: "relationships", en: "Tolerance", fa: "بردباری", es: "Tolerancia", promptEn: "Did I make room for differences without trying to change others?", promptFa: "آیا تفاوت‌ها را پذیرفتم، بدون اینکه بخواهم دیگران را تغییر دهم؟", promptEs: "¿Acepté las diferencias sin intentar cambiar a los demás?" },
  { id: "kindness", category: "relationships", en: "Kindness", fa: "مهربانی", es: "Amabilidad", promptEn: "Did I treat others with kindness and respect?", promptFa: "آیا با دیگران با مهربانی و احترام رفتار کردم؟", promptEs: "¿Traté a los demás con amabilidad y respeto?", followUpQuestions: [{ id: "kindness-fairness", en: "Did I avoid putting people down or criticizing them unfairly?", fa: "آیا از تحقیر دیگران یا انتقاد ناعادلانه از آن‌ها خودداری کردم؟", es: "¿Evité menospreciar a las personas o criticarlas injustamente?" }] },
  { id: "compassion", category: "relationships", en: "Compassion", fa: "همدلی", es: "Compasión", promptEn: "Did I respond to pain with understanding?", promptFa: "آیا با درک و همدلی به درد پاسخ دادم؟", promptEs: "¿Respondí al dolor con comprensión?", followUpQuestions: [{ id: "compassion-self-care", en: "Did I show myself the care I would offer someone else?", fa: "آیا همان مراقبتی را که به دیگری نشان می‌دهم، به خودم نیز نشان دادم؟", es: "¿Me traté con el cuidado que ofrecería a otra persona?" }] },
  { id: "forgiveness", category: "relationships", en: "Forgiveness", fa: "بخشش", es: "Perdón", promptEn: "Did I take a step toward letting go of resentment?", promptFa: "آیا قدمی برای رها کردن رنجش برداشتم؟", promptEs: "¿Di un paso para soltar el resentimiento?" },
  { id: "respect", category: "relationships", en: "Respect", fa: "احترام", es: "Respeto", promptEn: "Did I speak respectfully, even when I disagreed?", promptFa: "آیا حتی هنگام مخالفت با احترام صحبت کردم؟", promptEs: "¿Hablé con respeto, incluso cuando no estuve de acuerdo?" },
  { id: "boundaries", category: "relationships", en: "Healthy boundaries", fa: "مرزهای سالم", es: "Límites saludables", promptEn: "Did I communicate my limits and respect other people's limits?", promptFa: "آیا مرزهایم را بیان کردم و به مرزهای دیگران احترام گذاشتم؟", promptEs: "¿Comuniqué mis límites y respeté los límites de los demás?", followUpQuestions: [{ id: "boundaries-saying-no", en: "Did I say yes or no clearly and with care?", fa: "آیا با روشنی و ملاحظه بله یا نه گفتم؟", es: "¿Dije sí o no con claridad y consideración?" }] },
  { id: "accountability", category: "relationships", en: "Accountability", fa: "پاسخ‌گویی", es: "Rendición de cuentas", promptEn: "Did I promptly admit when I was wrong?", promptFa: "آیا وقتی اشتباه کردم، زود آن را پذیرفتم؟", promptEs: "¿Admití enseguida cuando me equivoqué?", followUpQuestions: [{ id: "accountability-listening", en: "Did I listen to how my actions affected someone else?", fa: "آیا شنیدم که رفتارم چگونه بر دیگری اثر گذاشت؟", es: "¿Escuché cómo mis acciones afectaron a otra persona?" }] },
  { id: "amends", category: "relationships", en: "Making things right", fa: "جبران خسارت", es: "Reparar el daño", promptEn: "Did I take an appropriate step to repair harm I caused?", promptFa: "آیا قدم مناسبی برای جبران آسیبی که ایجاد کردم برداشتم؟", promptEs: "¿Di un paso apropiado para reparar el daño que causé?", followUpQuestions: [{ id: "amends-seeking-guidance", en: "Did I seek guidance if I was unsure how to make things right?", fa: "آیا وقتی درباره شیوه جبران مطمئن نبودم، راهنمایی خواستم؟", es: "¿Busqué orientación cuando no sabía cómo reparar el daño?" }] },
  { id: "integrity", category: "recovery", en: "Integrity", fa: "درستکاری", es: "Integridad", promptEn: "Did my actions match my values?", promptFa: "آیا رفتارم با ارزش‌هایم هماهنگ بود؟", promptEs: "¿Mis acciones estuvieron de acuerdo con mis valores?" },
  { id: "self-discipline", category: "recovery", en: "Self-discipline", fa: "خودانضباطی", es: "Autodisciplina", promptEn: "Did I follow through on a healthy commitment?", promptFa: "آیا به یک تعهد سالم عمل کردم؟", promptEs: "¿Cumplí un compromiso saludable?" },
  { id: "service", category: "recovery", en: "Service", fa: "خدمت", es: "Servicio", promptEn: "Did I help without trying to control the result?", promptFa: "آیا بدون تلاش برای کنترل نتیجه کمک کردم؟", promptEs: "¿Ayudé sin intentar controlar el resultado?", followUpQuestions: [{ id: "service-expectations", en: "Did I help without expecting praise or something in return?", fa: "آیا بدون انتظار تعریف یا دریافت چیزی در عوض کمک کردم؟", es: "¿Ayudé sin esperar elogios ni algo a cambio?" }] },
  { id: "gratitude", category: "recovery", en: "Gratitude", fa: "قدردانی", es: "Gratitud", promptEn: "Did I notice something worth appreciating?", promptFa: "آیا چیزی را که شایسته قدردانی بود دیدم؟", promptEs: "¿Reconocí algo digno de agradecer?" },
  { id: "faith", category: "recovery", en: "Faith", fa: "ایمان", es: "Fe", promptEn: "Did I ask my Higher Power for help, if that is part of my practice?", promptFa: "آیا اگر بخشی از باور من است، از نیروی برترم کمک خواستم؟", promptEs: "¿Pedí ayuda a mi Poder Superior, si eso forma parte de mi práctica?", followUpQuestions: [{ id: "faith-guidance", en: "Did I use my spiritual practice to guide my next action?", fa: "آیا از تمرین معنوی‌ام برای هدایت اقدام بعدی استفاده کردم؟", es: "¿Usé mi práctica espiritual para orientar mi siguiente acción?" }] },
  { id: "hope", category: "recovery", en: "Hope", fa: "امید", es: "Esperanza", promptEn: "Did I leave room for change and new possibilities?", promptFa: "آیا برای تغییر و امکان‌های تازه جا گذاشتم؟", promptEs: "¿Dejé espacio para el cambio y nuevas posibilidades?" },
  { id: "perseverance", category: "recovery", en: "Perseverance", fa: "پشتکار", es: "Perseverancia", promptEn: "Did I keep going without demanding perfection?", promptFa: "آیا بدون انتظار کمال به راه ادامه دادم؟", promptEs: "¿Seguí adelante sin exigirme perfección?" },
  { id: "mindfulness", category: "recovery", en: "Mindfulness", fa: "ذهن‌آگاهی", es: "Atención plena", promptEn: "Did I pause and notice what was happening inside me?", promptFa: "آیا مکث کردم و آنچه در درونم می‌گذشت را دیدم؟", promptEs: "¿Hice una pausa y observé lo que ocurría dentro de mí?", followUpQuestions: [{ id: "mindfulness-feelings", en: "Did I notice my feelings before acting on them?", fa: "آیا پیش از عمل کردن بر اساس احساساتم، آن‌ها را دیدم؟", es: "¿Reconocí mis sentimientos antes de actuar según ellos?" }] },
];

export type Step10Question = {
  id: string;
  principleId: string;
  category: Principle["category"];
  followUp: boolean;
  en: string;
  fa: string;
  es: string;
};

export const step10QuestionSetVersion = 2;

/** Main questions retain their original saved IDs; follow-ups have independent, stable IDs. */
export const step10Questions: Step10Question[] = principles.flatMap((principle) => [
  { id: principle.id, principleId: principle.id, category: principle.category, followUp: false,
    en: principle.promptEn, fa: principle.promptFa, es: principle.promptEs },
  ...(principle.followUpQuestions ?? []).map((question) => ({
    ...question, principleId: principle.id, category: principle.category, followUp: true,
  })),
]);

/** Older inventories did not ask the follow-ups, so they must not acquire unanswered items. */
export function step10QuestionsForPayload(payload: unknown): Step10Question[] {
  const content = payload && typeof payload === "object"
    ? payload as { questionSetVersion?: unknown; states?: Record<string, unknown> } : {};
  const expanded = (typeof content.questionSetVersion === "number" && content.questionSetVersion >= step10QuestionSetVersion)
    || step10Questions.some((question) => question.followUp && content.states && Object.hasOwn(content.states, question.id));
  return expanded ? step10Questions : step10Questions.filter((question) => !question.followUp);
}

/** The same question labels an inventory item, its chart bar, and its reports. */
export function principleQuestion(id: string, language: Language) {
  return step10Questions.find((question) => question.id === id)?.[language] ?? id;
}

export function principleForQuestion(id: string) {
  const principleId = step10Questions.find((question) => question.id === id)?.principleId ?? id;
  return principles.find((principle) => principle.id === principleId);
}

export function questionPrincipleName(id: string, language: Language) {
  return principleForQuestion(id)?.[language] ?? id;
}

export function questionWithPrinciple(id: string, language: Language) {
  return `${principleQuestion(id, language)} (${questionPrincipleName(id, language)})`;
}

/** The learning center also presents each principle's additional reflection questions. */
export function principleFollowUpQuestions(id: string, language: Language) {
  return principles.find((item) => item.id === id)?.followUpQuestions?.map((question) => question[language]) ?? [];
}

const step10ReflectionPrinciples = {
  highlights: ["integrity"],
  attention: ["honesty", "willingness"],
  patternAction: ["mindfulness", "self-discipline"],
  familyContext: ["acceptance", "boundaries"],
  amends: ["amends", "accountability"],
  tomorrow: ["willingness", "perseverance"],
  gratitude: ["gratitude"],
} as const;

export function reflectionPrincipleNames(field: keyof typeof step10ReflectionPrinciples, language: Language) {
  return step10ReflectionPrinciples[field].map((id) => questionPrincipleName(id, language)).join(" · ");
}

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

export function localDateIso(value = new Date()) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${String(year).padStart(4, "0")}-${month}-${day}`;
}

export function todayIso() {
  return localDateIso();
}

export function formatDisplayDate(value: string, language: Language) {
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat(language === "fa" ? "fa-IR" : language === "es" ? "es-US" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
