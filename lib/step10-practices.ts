import { principles, type Language } from "@/lib/inventory";

type Practice = { companion: string; en: string; es: string; fa: string };

// These are conversation starters for a sponsor, not conclusions drawn from a person's writing.
const practices: Record<string, Practice> = {
  honesty: { companion: "courage", en: "Name one truth you avoided and ask how to speak it with care.", es: "Nombra una verdad que evitaste y pregunta cómo expresarla con cuidado.", fa: "حقیقتی را که از آن دوری کردید نام ببرید و بپرسید چگونه با ملاحظه بیانش کنید." },
  "open-mindedness": { companion: "humility", en: "Listen to another view and repeat what you understood before replying.", es: "Escucha otra perspectiva y repite lo que entendiste antes de responder.", fa: "به دیدگاهی دیگر گوش دهید و پیش از پاسخ، آنچه فهمیدید را بازگو کنید." },
  willingness: { companion: "courage", en: "Choose one small helpful action and ask for support in following through.", es: "Elige una pequeña acción útil y pide apoyo para llevarla a cabo.", fa: "یک اقدام مفید کوچک انتخاب کنید و برای انجامش کمک بخواهید." },
  humility: { companion: "service", en: "Notice when your needs crowd out others and make room to listen or help.", es: "Observa cuándo tus necesidades desplazan a los demás y haz espacio para escuchar o ayudar.", fa: "ببینید چه زمانی نیازهای خودتان جای دیگران را می‌گیرد و برای شنیدن یا کمک جا باز کنید." },
  responsibility: { companion: "accountability", en: "Identify your part without taking responsibility for another person's choices.", es: "Reconoce tu parte sin responsabilizarte de las decisiones de otra persona.", fa: "سهم خود را مشخص کنید، بدون آنکه مسئولیت انتخاب دیگران را به عهده بگیرید." },
  acceptance: { companion: "mindfulness", en: "Separate what you can change from what you cannot, then choose one action within your control.", es: "Separa lo que puedes cambiar de lo que no y elige una acción bajo tu control.", fa: "آنچه را می‌توانید تغییر دهید از آنچه نمی‌توانید جدا کنید و اقدامی در اختیار خود برگزینید." },
  patience: { companion: "mindfulness", en: "Pause and breathe before responding when a plan changes or your temper rises.", es: "Haz una pausa y respira antes de responder cuando cambie un plan o te alteres.", fa: "وقتی برنامه‌ای عوض می‌شود یا خشم بالا می‌گیرد، پیش از پاسخ مکث کنید و نفس بکشید." },
  courage: { companion: "honesty", en: "Name the hard conversation and prepare one honest, respectful sentence.", es: "Nombra la conversación difícil y prepara una frase honesta y respetuosa.", fa: "گفت‌وگوی دشوار را مشخص کنید و یک جمله صادقانه و محترمانه آماده کنید." },
  tolerance: { companion: "acceptance", en: "Notice a difference without trying to control the other person.", es: "Reconoce una diferencia sin intentar controlar a la otra persona.", fa: "تفاوت را ببینید، بدون تلاش برای کنترل کردن طرف مقابل." },
  kindness: { companion: "respect", en: "Replace one criticism with a clear and considerate request.", es: "Cambia una crítica por una petición clara y considerada.", fa: "یک انتقاد را با درخواستی روشن و مهربانانه جایگزین کنید." },
  compassion: { companion: "kindness", en: "Ask what support is welcome before assuming what someone needs.", es: "Pregunta qué apoyo sería bienvenido antes de suponer lo que alguien necesita.", fa: "پیش از فرض کردن نیاز دیگران، بپرسید چه کمکی برایشان مفید است." },
  forgiveness: { companion: "acceptance", en: "Name the resentment and discuss a safe step toward letting it go.", es: "Nombra el resentimiento y conversa sobre un paso seguro para soltarlo.", fa: "رنجش را نام ببرید و درباره گامی امن برای رها کردن آن گفت‌وگو کنید." },
  respect: { companion: "patience", en: "Pause during disagreement and speak about the issue without putting anyone down.", es: "Haz una pausa al discrepar y habla del asunto sin menospreciar a nadie.", fa: "هنگام اختلاف مکث کنید و بدون تحقیر کسی درباره موضوع صحبت کنید." },
  boundaries: { companion: "honesty", en: "Practice a clear yes or no that respects your limits and the other person.", es: "Practica un sí o un no claro que respete tus límites y a la otra persona.", fa: "بله یا نه‌ای روشن را تمرین کنید که هم به مرزهای خود و هم به دیگری احترام بگذارد." },
  accountability: { companion: "responsibility", en: "Admit a specific mistake promptly without adding excuses or blame.", es: "Admite pronto un error concreto sin añadir excusas ni culpas.", fa: "اشتباهی مشخص را زود بپذیرید، بی‌آنکه بهانه یا سرزنش اضافه کنید." },
  amends: { companion: "accountability", en: "Discuss with your sponsor when and how a safe repair would be appropriate.", es: "Consulta con tu padrino o madrina cuándo y cómo sería adecuada una reparación segura.", fa: "با حامی خود درباره زمان و شیوه مناسب جبرانِ امن گفت‌وگو کنید." },
  integrity: { companion: "honesty", en: "Compare one choice today with your values and choose one aligned action tomorrow.", es: "Compara una decisión de hoy con tus valores y elige una acción coherente para mañana.", fa: "یک انتخاب امروز را با ارزش‌هایتان بسنجید و برای فردا اقدامی هماهنگ برگزینید." },
  "self-discipline": { companion: "perseverance", en: "Pick one realistic commitment and decide when you will follow through.", es: "Elige un compromiso realista y decide cuándo lo cumplirás.", fa: "تعهدی واقع‌بینانه انتخاب کنید و زمان انجامش را مشخص کنید." },
  service: { companion: "humility", en: "Offer one useful act without controlling how it is received.", es: "Ofrece una acción útil sin intentar controlar cómo se recibe.", fa: "یک کار مفید انجام دهید، بی‌آنکه بخواهید نتیجه یا واکنش دیگران را کنترل کنید." },
  gratitude: { companion: "mindfulness", en: "Name something specific you appreciated today and why it mattered.", es: "Nombra algo concreto que agradeciste hoy y por qué fue importante.", fa: "چیزی مشخص را که امروز برایش سپاسگزار بودید و دلیل اهمیتش را نام ببرید." },
  faith: { companion: "willingness", en: "If it fits your beliefs, ask your Higher Power for help and take one willing action.", es: "Si va con tus creencias, pide ayuda a tu Poder Superior y da un paso con buena disposición.", fa: "اگر با باورهایتان سازگار است، از نیروی برتر کمک بخواهید و یک قدم با تمایل بردارید." },
  hope: { companion: "perseverance", en: "Identify one possibility for change and the next manageable step.", es: "Identifica una posibilidad de cambio y el siguiente paso alcanzable.", fa: "یک امکان برای تغییر و قدم کوچک بعدی را مشخص کنید." },
  perseverance: { companion: "self-discipline", en: "Return to a manageable practice after a setback without demanding perfection.", es: "Retoma una práctica alcanzable tras un tropiezo sin exigirte perfección.", fa: "پس از یک لغزش، بدون انتظار کمال به تمرینی شدنی برگردید." },
  mindfulness: { companion: "patience", en: "Pause, notice your feeling, and choose a response before you act.", es: "Haz una pausa, observa lo que sientes y elige una respuesta antes de actuar.", fa: "مکث کنید، احساس خود را ببینید و پیش از اقدام پاسخی آگاهانه برگزینید." },
};

export function practiceForPrinciple(id: string, language: Language) {
  const practice = practices[id];
  if (!practice) return null;
  const primary = principles.find((principle) => principle.id === id)?.[language] ?? id;
  const companion = principles.find((principle) => principle.id === practice.companion)?.[language] ?? practice.companion;
  return { primary, companion, action: practice[language] };
}
