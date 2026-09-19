import type { Language } from "@/lib/inventory";

export type LearningStage = {
  label: string;
  title: string;
  description: string;
  points: string[];
};

export type LearningArticleCopy = {
  eyebrow: string;
  title: string;
  description: string;
  summary: string;
  lead: string;
  contextTitle: string;
  contextParagraphs: string[];
  stagesTitle: string;
  stagesIntro: string;
  stages: LearningStage[];
  practiceTitle: string;
  practices: string[];
  reflectionTitle: string;
  reflection: string;
  closingTitle: string;
  closing: string;
};

export type PublicLearningTopic = {
  id: "step10" | "step4" | "dishonesty";
  slug: string;
  copy: Record<Language, LearningArticleCopy>;
};

export const learningHubCopy: Record<Language, {
  eyebrow: string;
  title: string;
  description: string;
  libraryLabel: string;
  sectionTitle: string;
  sectionIntro: string;
  readGuide: string;
  languageLabel: string;
  ctaTitle: string;
  ctaText: string;
  demoLabel: string;
  joinLabel: string;
  safetyNote: string;
}> = {
  en: {
    eyebrow: "Public learning center",
    title: "Understand the pattern. Practice the principle.",
    description: "Original, practical guides to Step 10 reflection, a reusable Step 4 inventory, and the path from character defects to corrective principles.",
    libraryLabel: "Three practical guides",
    sectionTitle: "Start with one guide",
    sectionIntro: "Read at your own pace. These guides explain the ideas; the private member tools help you put them into practice.",
    readGuide: "Read guide",
    languageLabel: "Read in another language",
    ctaTitle: "See how the private tools work",
    ctaText: "Try the demo before creating an anonymous or email-based account.",
    demoLabel: "Try the demo",
    joinLabel: "View membership options",
    safetyNote: "These guides support personal reflection. They are not diagnosis, therapy, crisis support, or a substitute for professional care or trusted recovery guidance.",
  },
  es: {
    eyebrow: "Centro público de aprendizaje",
    title: "Comprende el patrón. Practica el principio.",
    description: "Guías originales y prácticas sobre la reflexión del Paso 10, un inventario reutilizable del Paso 4 y el camino desde los defectos de carácter hasta los principios correctivos.",
    libraryLabel: "Tres guías prácticas",
    sectionTitle: "Comienza con una guía",
    sectionIntro: "Lee a tu propio ritmo. Estas guías explican las ideas; las herramientas privadas para miembros te ayudan a ponerlas en práctica.",
    readGuide: "Leer la guía",
    languageLabel: "Leer en otro idioma",
    ctaTitle: "Mira cómo funcionan las herramientas privadas",
    ctaText: "Prueba la demostración antes de crear una cuenta anónima o una cuenta con correo electrónico.",
    demoLabel: "Probar la demostración",
    joinLabel: "Ver opciones de membresía",
    safetyNote: "Estas guías apoyan la reflexión personal. No son diagnóstico, terapia, apoyo para crisis ni sustituyen la atención profesional o la orientación confiable para la recuperación.",
  },
  fa: {
    eyebrow: "مرکز آموزش عمومی",
    title: "الگو را بشناسید. اصل را تمرین کنید.",
    description: "راهنماهای اصیل و عملی درباره تأمل روزانه گام دهم، ترازنامه قابل ویرایش گام چهارم و مسیر حرکت از نقص‌های شخصیتی به اصول اصلاحی.",
    libraryLabel: "سه راهنمای عملی",
    sectionTitle: "با یک راهنما آغاز کنید",
    sectionIntro: "با سرعت مناسب خود مطالعه کنید. این راهنماها مفاهیم را توضیح می‌دهند و ابزارهای خصوصی اعضا به شما کمک می‌کنند آنها را تمرین کنید.",
    readGuide: "مطالعه راهنما",
    languageLabel: "مطالعه به زبان دیگر",
    ctaTitle: "نحوه کار ابزارهای خصوصی را ببینید",
    ctaText: "پیش از ساخت حساب ناشناس یا ایمیلی، نسخه آزمایشی را امتحان کنید.",
    demoLabel: "مشاهده نسخه آزمایشی",
    joinLabel: "مشاهده گزینه‌های عضویت",
    safetyNote: "این راهنماها برای تأمل شخصی هستند و تشخیص، درمان، پشتیبانی بحران یا جایگزین مراقبت حرفه‌ای و راهنمایی قابل اعتماد در بهبودی نیستند.",
  },
};

export const publicLearningTopics: PublicLearningTopic[] = [
  {
    id: "step10",
    slug: "step-10-daily-inventory",
    copy: {
      en: {
        eyebrow: "Daily reflection guide",
        title: "How a daily Step 10 inventory works",
        description: "A practical guide to reviewing the day, recognizing patterns, practicing recovery principles, and choosing a grounded next action.",
        summary: "Use a short, honest review to notice what happened, own your part, recognize practiced principles, and choose one useful action for tomorrow.",
        lead: "A daily Step 10 inventory is a brief review of the day—not a trial and not a demand for perfection. Its purpose is to notice patterns while they are still fresh, take responsibility where it belongs, and keep helpful principles active in ordinary life.",
        contextTitle: "A review, not a verdict",
        contextParagraphs: [
          "The most useful inventory stays specific. Instead of deciding that the whole day was good or bad, look at particular moments: what happened, what you felt, what you did, and what effect followed.",
          "Include strengths as well as places that need attention. Recognizing honesty, patience, courage, or a healthy boundary gives you something real to repeat. Naming a mistake gives you something workable to repair.",
        ],
        stagesTitle: "A four-part daily review",
        stagesIntro: "The review can be completed in a few quiet minutes. Longer writing is optional; accuracy matters more than length.",
        stages: [
          { label: "1", title: "Settle and name the facts", description: "Pause before interpreting the day. Describe the event plainly and separate facts from assumptions.", points: ["What happened?", "What feelings were present?", "What story did I tell myself about it?"] },
          { label: "2", title: "Review the principles", description: "Notice which principles you practiced and which ones need attention without turning either answer into a judgment of your worth.", points: ["Where was I honest, patient, responsible, or kind?", "Where did fear, control, avoidance, or resentment direct me?"] },
          { label: "3", title: "Own your part", description: "Name your behavior and its impact. Responsibility means owning your part—not accepting blame for another person’s choices.", points: ["Did I cause harm or leave something important unsaid?", "Do I need guidance, a boundary, or an appropriate repair?"] },
          { label: "4", title: "Choose the next right action", description: "Close the review with one concrete action instead of carrying a vague promise to do better.", points: ["Correct a statement or have a needed conversation", "Ask for help, practice a principle, or express gratitude", "Write the action clearly enough to recognize when it is complete"] },
        ],
        practiceTitle: "Keep the practice useful",
        practices: [
          "Use short, specific sentences instead of broad labels about yourself or other people.",
          "Complete the review regularly, but return with honesty rather than abandoning it after a missed day.",
          "Share only what you choose, and use a trusted sponsor, mentor, counselor, or professional when guidance is needed.",
          "Treat an inventory as information for action—not as proof that you are failing.",
        ],
        reflectionTitle: "Reflection prompt",
        reflection: "What one moment from today deserves an honest second look, and what principle would help you respond differently next time?",
        closingTitle: "When to pause",
        closing: "If reflection becomes overwhelming, brings up an unsafe situation, or raises questions beyond a personal inventory, pause and seek appropriate help. A written review should support care and responsibility, not replace crisis services, medical care, therapy, legal advice, or trusted recovery guidance.",
      },
      es: {
        eyebrow: "Guía de reflexión diaria",
        title: "Cómo funciona un inventario diario del Paso 10",
        description: "Una guía práctica para revisar el día, reconocer patrones, practicar principios de recuperación y elegir una próxima acción realista.",
        summary: "Usa una revisión breve y honesta para observar lo ocurrido, asumir tu parte, reconocer los principios practicados y elegir una acción útil para mañana.",
        lead: "Un inventario diario del Paso 10 es una revisión breve del día, no un juicio ni una exigencia de perfección. Su propósito es observar los patrones mientras están recientes, asumir la responsabilidad que corresponde y mantener activos los principios útiles en la vida cotidiana.",
        contextTitle: "Una revisión, no un veredicto",
        contextParagraphs: [
          "El inventario más útil es específico. En vez de decidir que todo el día fue bueno o malo, observa momentos concretos: qué ocurrió, qué sentiste, qué hiciste y qué efecto tuvo.",
          "Incluye fortalezas y áreas que necesitan atención. Reconocer honestidad, paciencia, valor o un límite saludable te muestra algo que puedes repetir. Nombrar un error te muestra algo que puedes reparar.",
        ],
        stagesTitle: "Una revisión diaria en cuatro partes",
        stagesIntro: "La revisión puede completarse en unos minutos tranquilos. Escribir más es opcional; la precisión importa más que la extensión.",
        stages: [
          { label: "1", title: "Haz una pausa y nombra los hechos", description: "Detente antes de interpretar el día. Describe el suceso con claridad y separa los hechos de las suposiciones.", points: ["¿Qué ocurrió?", "¿Qué sentimientos estuvieron presentes?", "¿Qué historia me conté acerca de lo ocurrido?"] },
          { label: "2", title: "Revisa los principios", description: "Observa qué principios practicaste y cuáles necesitan atención, sin convertir ninguna respuesta en un juicio sobre tu valor personal.", points: ["¿Dónde fui honesto, paciente, responsable o amable?", "¿Dónde me dirigieron el miedo, el control, la evitación o el resentimiento?"] },
          { label: "3", title: "Asume tu parte", description: "Nombra tu conducta y su efecto. Responsabilidad significa asumir tu parte, no cargar con las decisiones de otra persona.", points: ["¿Causé daño o dejé algo importante sin decir?", "¿Necesito orientación, un límite o una reparación apropiada?"] },
          { label: "4", title: "Elige la siguiente acción correcta", description: "Cierra la revisión con una acción concreta en lugar de una promesa vaga de hacerlo mejor.", points: ["Corregir una afirmación o tener una conversación necesaria", "Pedir ayuda, practicar un principio o expresar gratitud", "Escribir la acción con suficiente claridad para saber cuándo está completa"] },
        ],
        practiceTitle: "Mantén útil la práctica",
        practices: [
          "Usa frases breves y específicas en vez de etiquetas generales sobre ti o sobre otras personas.",
          "Haz la revisión con regularidad, pero si pierdes un día, vuelve con honestidad en vez de abandonarla.",
          "Comparte solo lo que elijas y busca a un padrino, mentor, consejero o profesional de confianza cuando necesites orientación.",
          "Trata el inventario como información para actuar, no como prueba de que estás fracasando.",
        ],
        reflectionTitle: "Pregunta para reflexionar",
        reflection: "¿Qué momento de hoy merece una segunda mirada honesta y qué principio te ayudaría a responder de otra manera la próxima vez?",
        closingTitle: "Cuándo hacer una pausa",
        closing: "Si la reflexión se vuelve abrumadora, revela una situación insegura o plantea preguntas que van más allá de un inventario personal, haz una pausa y busca ayuda apropiada. Una revisión escrita debe apoyar el cuidado y la responsabilidad; no sustituye los servicios de crisis, la atención médica, la terapia, el consejo legal ni la orientación confiable para la recuperación.",
      },
      fa: {
        eyebrow: "راهنمای تأمل روزانه",
        title: "ترازنامه روزانه گام دهم چگونه کار می‌کند",
        description: "راهنمایی عملی برای مرور روز، شناخت الگوها، تمرین اصول بهبودی و انتخاب یک اقدام واقع‌بینانه بعدی.",
        summary: "با یک مرور کوتاه و صادقانه، اتفاق‌های روز و سهم خود را ببینید، اصول تمرین‌شده را بشناسید و یک اقدام مفید برای فردا انتخاب کنید.",
        lead: "ترازنامه روزانه گام دهم مرور کوتاهی از روز است؛ نه محاکمه و نه درخواست کمال. هدف آن دیدن الگوها در زمانی است که هنوز تازه‌اند، پذیرفتن مسئولیت در جای درست و زنده نگه داشتن اصول مفید در زندگی روزمره است.",
        contextTitle: "مرور، نه حکم",
        contextParagraphs: [
          "ترازنامه زمانی مفیدتر است که مشخص باشد. به جای خوب یا بد دانستن تمام روز، لحظه‌های معین را ببینید: چه اتفاقی افتاد، چه احساسی داشتید، چه کردید و چه اثری به دنبال داشت.",
          "هم نقاط قوت و هم بخش‌های نیازمند توجه را ثبت کنید. دیدن صداقت، صبر، شجاعت یا یک مرز سالم، رفتاری واقعی برای تکرار به شما می‌دهد. نام بردن از اشتباه نیز چیزی قابل جبران ایجاد می‌کند.",
        ],
        stagesTitle: "مرور روزانه در چهار بخش",
        stagesIntro: "این مرور می‌تواند در چند دقیقه آرام انجام شود. نوشتن بیشتر اختیاری است؛ دقت از طول نوشته مهم‌تر است.",
        stages: [
          { label: "۱", title: "مکث کنید و واقعیت‌ها را نام ببرید", description: "پیش از تفسیر روز مکث کنید. رویداد را ساده توضیح دهید و واقعیت را از فرض جدا کنید.", points: ["چه اتفاقی افتاد؟", "چه احساس‌هایی حضور داشتند؟", "درباره آن اتفاق چه داستانی به خودم گفتم؟"] },
          { label: "۲", title: "اصول را مرور کنید", description: "ببینید کدام اصول را تمرین کرده‌اید و کدام‌ها نیازمند توجه‌اند، بدون اینکه پاسخ را به قضاوت درباره ارزش خود تبدیل کنید.", points: ["کجا صادق، صبور، مسئول یا مهربان بودم؟", "کجا ترس، کنترل، اجتناب یا رنجش مرا هدایت کرد؟"] },
          { label: "۳", title: "سهم خود را بپذیرید", description: "رفتار و تأثیر آن را نام ببرید. مسئولیت‌پذیری یعنی پذیرفتن سهم خود، نه قبول مسئولیت انتخاب‌های دیگری.", points: ["آیا آسیبی زدم یا موضوع مهمی را نگفتم؟", "آیا به راهنمایی، یک مرز سالم یا جبران مناسب نیاز دارم؟"] },
          { label: "۴", title: "اقدام درست بعدی را انتخاب کنید", description: "مرور را با یک اقدام روشن پایان دهید، نه با وعده‌ای مبهم برای بهتر شدن.", points: ["اصلاح یک گفته یا انجام گفت‌وگوی لازم", "کمک خواستن، تمرین یک اصل یا ابراز قدردانی", "نوشتن اقدام با روشنی کافی تا پایان آن قابل تشخیص باشد"] },
        ],
        practiceTitle: "تمرین را مفید نگه دارید",
        practices: [
          "به جای برچسب‌های کلی درباره خود یا دیگران، جمله‌های کوتاه و مشخص بنویسید.",
          "مرور را منظم انجام دهید، اما پس از یک روز از دست‌رفته با صداقت برگردید و آن را رها نکنید.",
          "فقط آنچه را خودتان انتخاب می‌کنید به اشتراک بگذارید و هنگام نیاز از حامی، راهنما، مشاور یا متخصص قابل اعتماد کمک بگیرید.",
          "ترازنامه را اطلاعاتی برای اقدام بدانید، نه مدرکی برای شکست خود.",
        ],
        reflectionTitle: "پرسش برای تأمل",
        reflection: "کدام لحظه امروز شایسته نگاه صادقانه دوباره است و کدام اصل کمک می‌کند دفعه بعد متفاوت پاسخ دهید؟",
        closingTitle: "چه زمانی مکث کنیم",
        closing: "اگر تأمل طاقت‌فرسا شد، موقعیتی ناامن را آشکار کرد یا پرسشی فراتر از ترازنامه شخصی پیش آورد، مکث کنید و کمک مناسب بگیرید. مرور نوشته‌شده باید از مراقبت و مسئولیت حمایت کند و جایگزین خدمات بحران، مراقبت پزشکی، درمان، مشاوره حقوقی یا راهنمایی قابل اعتماد در بهبودی نیست.",
      },
    },
  },
  {
    id: "step4",
    slug: "step-4-personal-inventory",
    copy: {
      en: {
        eyebrow: "Personal inventory guide",
        title: "How to build a Step 4 inventory over time",
        description: "Learn how a reusable Step 4 workbook can organize facts, effects, patterns, responsibility, strengths, and principles without rushing the process.",
        summary: "Step 4 is a detailed personal inventory you can build, save, revisit, revise, and complete—then begin another only when you choose.",
        lead: "A Step 4 inventory is not a daily checklist. It is a deeper piece of work that can be developed over time. A useful workbook lets you return to an entry, add what becomes clearer, correct what was inaccurate, and mark the inventory complete when it has served its purpose.",
        contextTitle: "Thorough does not mean rushed",
        contextParagraphs: [
          "Detail is valuable when it creates clarity. It is less useful when the writing becomes an attempt to punish yourself, diagnose other people, or solve every part of your life in one sitting.",
          "Work in manageable sections. Facts, effects, recurring patterns, your responsibility, strengths, and relevant principles can be recorded separately. This makes a complicated experience easier to examine honestly.",
        ],
        stagesTitle: "A practical workbook structure",
        stagesIntro: "Each section answers a different question. You can save your work and return without forcing a final conclusion too early.",
        stages: [
          { label: "1", title: "Choose a clear focus", description: "Begin with one resentment, fear, relationship pattern, harm, recurring defect, or strength rather than trying to cover everything at once.", points: ["Name the person, situation, or pattern", "Record dates or context when they help", "State why this subject belongs in the inventory"] },
          { label: "2", title: "Record facts and effects", description: "Describe what happened and how it affected safety, trust, self-respect, relationships, work, or peace of mind.", points: ["Separate observable facts from conclusions about motives", "Name emotions and consequences without minimizing them", "Allow uncertainty where you do not know the full story"] },
          { label: "3", title: "Examine patterns and your part", description: "Look for your behavior, motives, avoidance, expectations, or repeated responses. Owning your part does not excuse harm done by someone else.", points: ["What did I do, avoid, or repeat?", "What responsibility is truly mine?", "What is not mine to carry?"] },
          { label: "4", title: "Connect the pattern to principles", description: "Translate a broad character defect into specific shortcomings, then identify principles and actions that offer a different response.", points: ["Defect: the underlying pattern", "Shortcoming: the behavior the pattern produces", "Principle: the value to practice", "Action: a safe, observable way to live that value"] },
        ],
        practiceTitle: "Work carefully and honestly",
        practices: [
          "Use concrete examples and include strengths so the inventory remains balanced and accurate.",
          "Save and revise rather than forcing yourself to finish while tired, flooded, or unsafe.",
          "Protect privacy and share only with a person you deliberately trust.",
          "Seek guidance before attempting a sensitive amends or action that could cause further harm.",
        ],
        reflectionTitle: "Reflection prompt",
        reflection: "Which single situation or pattern would become more workable if you separated the facts, the effects, your part, and the principle you want to practice?",
        closingTitle: "Completion is not perfection",
        closing: "A completed inventory does not mean every memory is settled or every answer is final. It means you have made an honest, useful record for this stage of the work. You may revise the same workbook or begin a separate inventory later. Use trusted recovery or professional guidance when material involves trauma, abuse, danger, legal concerns, or mental-health needs.",
      },
      es: {
        eyebrow: "Guía de inventario personal",
        title: "Cómo elaborar un inventario del Paso 4 con el tiempo",
        description: "Aprende cómo un cuaderno reutilizable del Paso 4 puede organizar hechos, efectos, patrones, responsabilidad, fortalezas y principios sin apresurar el proceso.",
        summary: "El Paso 4 es un inventario personal detallado que puedes crear, guardar, revisar, modificar y completar; comienza otro solo cuando tú lo decidas.",
        lead: "Un inventario del Paso 4 no es una lista diaria. Es un trabajo más profundo que puede desarrollarse con el tiempo. Un cuaderno útil te permite volver a una entrada, añadir lo que se vuelve más claro, corregir lo inexacto y marcar el inventario como completo cuando haya cumplido su propósito.",
        contextTitle: "Ser minucioso no significa apresurarse",
        contextParagraphs: [
          "El detalle es valioso cuando produce claridad. Es menos útil cuando escribir se convierte en una manera de castigarte, diagnosticar a otras personas o resolver toda tu vida en una sola sesión.",
          "Trabaja en secciones manejables. Los hechos, los efectos, los patrones repetidos, tu responsabilidad, las fortalezas y los principios relevantes pueden registrarse por separado. Así una experiencia compleja resulta más fácil de examinar con honestidad.",
        ],
        stagesTitle: "Una estructura práctica para el cuaderno",
        stagesIntro: "Cada sección responde una pregunta diferente. Puedes guardar el trabajo y regresar sin forzar una conclusión final demasiado pronto.",
        stages: [
          { label: "1", title: "Elige un enfoque claro", description: "Comienza con un resentimiento, miedo, patrón de relación, daño, defecto recurrente o fortaleza, en vez de intentar abarcarlo todo.", points: ["Nombra la persona, situación o patrón", "Incluye fechas o contexto cuando ayuden", "Explica por qué este tema pertenece al inventario"] },
          { label: "2", title: "Registra los hechos y sus efectos", description: "Describe lo ocurrido y cómo afectó la seguridad, la confianza, el respeto propio, las relaciones, el trabajo o la tranquilidad.", points: ["Separa los hechos observables de las conclusiones sobre motivos", "Nombra emociones y consecuencias sin minimizarlas", "Deja espacio para la incertidumbre cuando no conozcas toda la historia"] },
          { label: "3", title: "Examina los patrones y tu parte", description: "Observa tu conducta, motivos, evitación, expectativas o respuestas repetidas. Asumir tu parte no justifica el daño causado por otra persona.", points: ["¿Qué hice, evité o repetí?", "¿Qué responsabilidad es realmente mía?", "¿Qué no me corresponde cargar?"] },
          { label: "4", title: "Relaciona el patrón con los principios", description: "Convierte un defecto general en limitaciones concretas e identifica principios y acciones que permitan una respuesta diferente.", points: ["Defecto: el patrón subyacente", "Limitación: la conducta que produce el patrón", "Principio: el valor que se practicará", "Acción: una forma segura y observable de vivir ese valor"] },
        ],
        practiceTitle: "Trabaja con cuidado y honestidad",
        practices: [
          "Usa ejemplos concretos e incluye fortalezas para mantener el inventario equilibrado y preciso.",
          "Guarda y revisa el trabajo en vez de obligarte a terminar cuando estés agotado, abrumado o en una situación insegura.",
          "Protege la privacidad y comparte solo con una persona que hayas elegido deliberadamente por su confianza.",
          "Busca orientación antes de intentar una reparación delicada o una acción que pueda causar más daño.",
        ],
        reflectionTitle: "Pregunta para reflexionar",
        reflection: "¿Qué situación o patrón se volvería más manejable si separaras los hechos, los efectos, tu parte y el principio que deseas practicar?",
        closingTitle: "Completar no significa ser perfecto",
        closing: "Un inventario completo no significa que cada recuerdo esté resuelto o que cada respuesta sea definitiva. Significa que has creado un registro honesto y útil para esta etapa del trabajo. Puedes revisar el mismo cuaderno o comenzar otro más adelante. Busca orientación profesional o de recuperación confiable cuando el material incluya trauma, abuso, peligro, asuntos legales o necesidades de salud mental.",
      },
      fa: {
        eyebrow: "راهنمای ترازنامه شخصی",
        title: "چگونه ترازنامه گام چهارم را به‌مرور تکمیل کنیم",
        description: "بیاموزید چگونه دفتر قابل ویرایش گام چهارم می‌تواند واقعیت‌ها، تأثیرها، الگوها، مسئولیت، نقاط قوت و اصول را بدون عجله سازمان دهد.",
        summary: "گام چهارم ترازنامه‌ای شخصی و دقیق است که می‌توانید آن را بسازید، ذخیره کنید، دوباره ببینید، ویرایش و کامل کنید؛ و فقط زمانی که می‌خواهید ترازنامه دیگری آغاز کنید.",
        lead: "ترازنامه گام چهارم فهرست روزانه نیست. این کار عمیق‌تری است که می‌تواند در طول زمان شکل بگیرد. یک دفتر مفید اجازه می‌دهد به نوشته برگردید، آنچه روشن‌تر شده اضافه کنید، بخش نادرست را اصلاح کنید و وقتی ترازنامه هدف خود را انجام داد آن را کامل علامت بزنید.",
        contextTitle: "کامل بودن به معنای عجله کردن نیست",
        contextParagraphs: [
          "جزئیات زمانی ارزشمندند که روشنی ایجاد کنند. وقتی نوشتن به تلاش برای تنبیه خود، تشخیص دادن دیگران یا حل تمام زندگی در یک نشست تبدیل شود، فایده آن کمتر می‌شود.",
          "در بخش‌های قابل مدیریت کار کنید. واقعیت‌ها، تأثیرها، الگوهای تکراری، مسئولیت شما، نقاط قوت و اصول مرتبط را می‌توان جداگانه ثبت کرد. این روش بررسی صادقانه یک تجربه پیچیده را آسان‌تر می‌کند.",
        ],
        stagesTitle: "ساختار عملی دفتر",
        stagesIntro: "هر بخش به پرسشی متفاوت پاسخ می‌دهد. می‌توانید کار را ذخیره کنید و بدون اجبار برای نتیجه‌گیری زودهنگام به آن برگردید.",
        stages: [
          { label: "۱", title: "موضوعی روشن انتخاب کنید", description: "با یک رنجش، ترس، الگوی رابطه، آسیب، نقص تکراری یا نقطه قوت آغاز کنید و تلاش نکنید همه چیز را یک‌باره پوشش دهید.", points: ["فرد، موقعیت یا الگو را نام ببرید", "در صورت کمک‌کننده بودن، تاریخ یا زمینه را ثبت کنید", "بنویسید چرا این موضوع باید در ترازنامه باشد"] },
          { label: "۲", title: "واقعیت‌ها و تأثیرها را ثبت کنید", description: "آنچه رخ داد و تأثیر آن بر امنیت، اعتماد، عزت نفس، روابط، کار یا آرامش ذهن را توضیح دهید.", points: ["واقعیت قابل مشاهده را از نتیجه‌گیری درباره انگیزه‌ها جدا کنید", "احساس‌ها و پیامدها را بدون کوچک شمردن نام ببرید", "جایی که تمام داستان را نمی‌دانید، عدم قطعیت را بپذیرید"] },
          { label: "۳", title: "الگوها و سهم خود را بررسی کنید", description: "رفتار، انگیزه، اجتناب، انتظار یا پاسخ‌های تکراری خود را ببینید. پذیرفتن سهم خود، آسیب دیگری را توجیه نمی‌کند.", points: ["چه کردم، از چه دوری کردم یا چه چیزی را تکرار کردم؟", "کدام مسئولیت واقعاً متعلق به من است؟", "چه چیزی را نباید به دوش بکشم؟"] },
          { label: "۴", title: "الگو را به اصول پیوند دهید", description: "یک نقص شخصیتی کلی را به کمبودهای رفتاری مشخص تبدیل کنید و سپس اصول و اقدام‌هایی را بیابید که پاسخ متفاوتی می‌سازند.", points: ["نقص: الگوی زیربنایی", "کمبود رفتاری: رفتاری که الگو ایجاد می‌کند", "اصل: ارزشی که باید تمرین شود", "اقدام: راهی امن و قابل مشاهده برای زندگی کردن آن ارزش"] },
        ],
        practiceTitle: "با دقت و صداقت کار کنید",
        practices: [
          "از مثال‌های روشن استفاده کنید و نقاط قوت را نیز بنویسید تا ترازنامه متعادل و دقیق بماند.",
          "وقتی خسته، آشفته یا ناامن هستید خود را مجبور به پایان نکنید؛ ذخیره کنید و بعداً برگردید.",
          "از حریم خصوصی محافظت کنید و فقط با فردی که آگاهانه به او اعتماد دارید به اشتراک بگذارید.",
          "پیش از جبران حساس یا اقدامی که ممکن است آسیب بیشتری ایجاد کند، راهنمایی بگیرید.",
        ],
        reflectionTitle: "پرسش برای تأمل",
        reflection: "کدام موقعیت یا الگو با جدا کردن واقعیت‌ها، تأثیرها، سهم شما و اصلی که می‌خواهید تمرین کنید، قابل مدیریت‌تر می‌شود؟",
        closingTitle: "کامل کردن به معنای بی‌نقص بودن نیست",
        closing: "ترازنامه کامل به این معنا نیست که هر خاطره حل شده یا هر پاسخ نهایی است. یعنی برای این مرحله از کار، گزارشی صادقانه و مفید ساخته‌اید. می‌توانید همین دفتر را ویرایش یا بعداً ترازنامه جداگانه‌ای آغاز کنید. وقتی موضوع شامل آسیب روانی، سوءاستفاده، خطر، مسئله حقوقی یا نیاز سلامت روان است از راهنمایی حرفه‌ای یا بهبودی قابل اعتماد کمک بگیرید.",
      },
    },
  },
  {
    id: "dishonesty",
    slug: "dishonesty-to-honesty",
    copy: {
      en: {
        eyebrow: "Defect → shortcoming → principle",
        title: "Dishonesty, its shortcomings, and the principle of honesty",
        description: "See how dishonesty can appear as lying, omission, denial, rationalization, or manipulation—and how honesty, integrity, accountability, and courage support change.",
        summary: "Turn the broad label of dishonesty into specific behaviors you can recognize, corrective principles you can practice, and actions you can repeat.",
        lead: "Calling dishonesty a character defect does not mean labeling a person as permanently dishonest. It names a recurring pattern: hiding, changing, or avoiding the truth to escape consequences, protect an image, or control an outcome. The pattern becomes workable when it is translated into specific behavior.",
        contextTitle: "Move from a label to a pathway",
        contextParagraphs: [
          "A broad label can produce shame without direction. A shortcoming describes what the defect actually does. Once the behavior is clear, a corrective principle and a practical action can be chosen.",
          "The goal is not forced disclosure without judgment or safety. Honesty works together with care, appropriate boundaries, accountability, and guidance about what should be shared, with whom, and when.",
        ],
        stagesTitle: "The recovery pathway",
        stagesIntro: "Follow the pattern from its underlying defect to observable behavior, then to principles and repeated actions.",
        stages: [
          { label: "1", title: "Character defect: dishonesty", description: "A pattern of hiding, changing, or avoiding truth to escape consequences, protect an image, or control an outcome.", points: ["It may begin with dishonesty toward yourself", "It can be active, indirect, or hidden inside a technically true statement"] },
          { label: "2", title: "Related shortcomings", description: "These are common ways the underlying defect can appear in behavior.", points: ["Lying: knowingly presenting something false as true", "Omission: leaving out important facts to create a false impression", "Denial or rationalization: refusing reality or making harmful behavior seem acceptable", "Manipulation: using misleading information, pressure, or hidden motives to control a choice"] },
          { label: "3", title: "Corrective principles", description: "Several principles work together to counter the pattern rather than merely suppress it.", points: ["Honesty: face and communicate reality", "Integrity: align private choices with stated values", "Accountability: acknowledge impact and change repeated behavior", "Courage: take a careful, values-based action even when truth feels uncomfortable"] },
          { label: "4", title: "Recovery actions", description: "Principles become useful through small actions that can be observed and repeated.", points: ["Tell the complete truth to yourself first", "Correct a misleading statement without adding another excuse", "Accept an appropriate consequence and repair what can safely be repaired", "Practice truthfulness in ordinary choices before a crisis demands it"] },
        ],
        practiceTitle: "Practice honesty with care",
        practices: [
          "Write the exact fact, the story you added, and the information you left out.",
          "Pause before answering when fear makes a misleading response feel automatic.",
          "Ask a trusted person for guidance when disclosure could affect safety, privacy, legal matters, or another person.",
          "Do not use blunt disclosure as a weapon; honesty does not require cruelty or unsafe contact.",
        ],
        reflectionTitle: "Reflection prompt",
        reflection: "Where am I protecting an image or outcome by changing, hiding, or avoiding the truth—and what is one careful act of honesty I can take?",
        closingTitle: "Progress is repeated alignment",
        closing: "One truthful statement does not erase a pattern, and one dishonest response does not define an entire person. Change grows as honesty, integrity, accountability, and courage are practiced consistently. When truth involves danger, abuse, legal exposure, trauma, or serious mental-health concerns, seek qualified guidance before acting.",
      },
      es: {
        eyebrow: "Defecto → limitación → principio",
        title: "La deshonestidad, sus limitaciones y el principio de honestidad",
        description: "Observa cómo la deshonestidad puede aparecer como mentira, omisión, negación, racionalización o manipulación, y cómo la honestidad, integridad, responsabilidad y valentía apoyan el cambio.",
        summary: "Convierte la etiqueta general de deshonestidad en conductas concretas que puedas reconocer, principios correctivos que puedas practicar y acciones que puedas repetir.",
        lead: "Llamar a la deshonestidad un defecto de carácter no significa etiquetar a una persona como deshonesta para siempre. Nombra un patrón repetido: ocultar, cambiar o evitar la verdad para escapar de consecuencias, proteger una imagen o controlar un resultado. El patrón se vuelve manejable cuando se traduce en una conducta concreta.",
        contextTitle: "Pasa de una etiqueta a un camino",
        contextParagraphs: [
          "Una etiqueta amplia puede producir vergüenza sin orientación. Una limitación describe lo que el defecto hace en la práctica. Cuando la conducta está clara, se puede elegir un principio correctivo y una acción concreta.",
          "La meta no es una revelación forzada sin considerar el juicio o la seguridad. La honestidad trabaja junto con el cuidado, los límites apropiados, la responsabilidad y la orientación sobre qué compartir, con quién y cuándo.",
        ],
        stagesTitle: "El camino de recuperación",
        stagesIntro: "Sigue el patrón desde el defecto subyacente hasta la conducta observable, y después hacia los principios y las acciones repetidas.",
        stages: [
          { label: "1", title: "Defecto de carácter: deshonestidad", description: "Un patrón de ocultar, cambiar o evitar la verdad para escapar de consecuencias, proteger una imagen o controlar un resultado.", points: ["Puede comenzar con la deshonestidad hacia uno mismo", "Puede ser activa, indirecta o esconderse dentro de una afirmación técnicamente cierta"] },
          { label: "2", title: "Limitaciones relacionadas", description: "Estas son maneras comunes en que el defecto subyacente puede aparecer en la conducta.", points: ["Mentira: presentar conscientemente algo falso como verdadero", "Omisión: excluir hechos importantes para crear una impresión falsa", "Negación o racionalización: rechazar la realidad o hacer que una conducta dañina parezca aceptable", "Manipulación: usar información engañosa, presión o motivos ocultos para controlar una decisión"] },
          { label: "3", title: "Principios correctivos", description: "Varios principios trabajan juntos para contrarrestar el patrón en vez de limitarse a reprimirlo.", points: ["Honestidad: afrontar y comunicar la realidad", "Integridad: alinear las decisiones privadas con los valores declarados", "Responsabilidad: reconocer el impacto y cambiar la conducta repetida", "Valentía: realizar una acción cuidadosa basada en valores aunque la verdad resulte incómoda"] },
          { label: "4", title: "Acciones de recuperación", description: "Los principios se vuelven útiles mediante acciones pequeñas que pueden observarse y repetirse.", points: ["Decirte primero la verdad completa", "Corregir una afirmación engañosa sin añadir otra excusa", "Aceptar una consecuencia apropiada y reparar lo que pueda repararse con seguridad", "Practicar la sinceridad en decisiones ordinarias antes de que una crisis la exija"] },
        ],
        practiceTitle: "Practica la honestidad con cuidado",
        practices: [
          "Escribe el hecho exacto, la historia que añadiste y la información que omitiste.",
          "Haz una pausa antes de responder cuando el miedo convierta una respuesta engañosa en algo automático.",
          "Pide orientación a una persona de confianza cuando revelar información pueda afectar la seguridad, la privacidad, asuntos legales o a otra persona.",
          "No uses una revelación brusca como arma; la honestidad no exige crueldad ni contacto inseguro.",
        ],
        reflectionTitle: "Pregunta para reflexionar",
        reflection: "¿Dónde estoy protegiendo una imagen o un resultado al cambiar, ocultar o evitar la verdad, y cuál es un acto cuidadoso de honestidad que puedo realizar?",
        closingTitle: "El progreso es una alineación repetida",
        closing: "Una afirmación sincera no borra un patrón y una respuesta deshonesta no define a toda una persona. El cambio crece cuando la honestidad, la integridad, la responsabilidad y la valentía se practican de forma constante. Cuando la verdad implique peligro, abuso, exposición legal, trauma o problemas graves de salud mental, busca orientación calificada antes de actuar.",
      },
      fa: {
        eyebrow: "نقص ← کمبود رفتاری ← اصل",
        title: "عدم صداقت، کمبودهای رفتاری آن و اصل صداقت",
        description: "ببینید عدم صداقت چگونه به شکل دروغ، حذف حقیقت، انکار، توجیه یا دستکاری ظاهر می‌شود و صداقت، درستکاری، پاسخ‌گویی و شجاعت چگونه از تغییر حمایت می‌کنند.",
        summary: "برچسب کلی عدم صداقت را به رفتارهای مشخص قابل شناسایی، اصول اصلاحی قابل تمرین و اقدام‌های تکرارشدنی تبدیل کنید.",
        lead: "نامیدن عدم صداقت به‌عنوان یک نقص شخصیتی به معنای برچسب زدن دائمی یک فرد نیست. این نام، الگویی تکراری را مشخص می‌کند: پنهان کردن، تغییر دادن یا دوری از حقیقت برای فرار از پیامدها، حفظ تصویر خود یا کنترل نتیجه. وقتی الگو به رفتاری مشخص تبدیل شود، قابل کار کردن می‌شود.",
        contextTitle: "از برچسب به مسیر حرکت کنید",
        contextParagraphs: [
          "یک برچسب کلی می‌تواند شرم ایجاد کند، بدون اینکه جهت بدهد. کمبود رفتاری نشان می‌دهد نقص در عمل چه می‌کند. وقتی رفتار روشن شد، می‌توان یک اصل اصلاحی و اقدام عملی انتخاب کرد.",
          "هدف، افشای اجباری بدون توجه به قضاوت یا ایمنی نیست. صداقت در کنار مراقبت، مرزهای مناسب، پاسخ‌گویی و راهنمایی درباره اینکه چه چیزی، با چه کسی و چه زمانی در میان گذاشته شود کار می‌کند.",
        ],
        stagesTitle: "مسیر بهبودی",
        stagesIntro: "الگو را از نقص زیربنایی تا رفتار قابل مشاهده و سپس تا اصول و اقدام‌های تکرارشونده دنبال کنید.",
        stages: [
          { label: "۱", title: "نقص شخصیتی: عدم صداقت", description: "الگوی پنهان کردن، تغییر دادن یا دوری از حقیقت برای فرار از پیامدها، حفظ تصویر خود یا کنترل نتیجه.", points: ["ممکن است با عدم صداقت نسبت به خود آغاز شود", "می‌تواند مستقیم، غیرمستقیم یا پنهان در یک گفته ظاهراً درست باشد"] },
          { label: "۲", title: "کمبودهای رفتاری مرتبط", description: "اینها شکل‌های رایجی هستند که نقص زیربنایی می‌تواند در رفتار نشان دهد.", points: ["دروغ: آگاهانه چیزی نادرست را درست نشان دادن", "حذف حقیقت: کنار گذاشتن واقعیت‌های مهم برای ایجاد برداشت نادرست", "انکار یا توجیه: نپذیرفتن واقعیت یا قابل قبول نشان دادن رفتار آسیب‌زا", "دستکاری: استفاده از اطلاعات گمراه‌کننده، فشار یا انگیزه پنهان برای کنترل انتخاب دیگری"] },
          { label: "۳", title: "اصول اصلاحی", description: "چند اصل در کنار هم با الگو مقابله می‌کنند، نه اینکه فقط آن را سرکوب کنند.", points: ["صداقت: روبرو شدن با واقعیت و بیان آن", "درستکاری: هماهنگ کردن انتخاب‌های خصوصی با ارزش‌های بیان‌شده", "پاسخ‌گویی: پذیرفتن تأثیر و تغییر رفتار تکراری", "شجاعت: انجام اقدام سنجیده و ارزش‌محور حتی وقتی حقیقت ناراحت‌کننده است"] },
          { label: "۴", title: "اقدام‌های بهبودی", description: "اصول با اقدام‌های کوچک، قابل مشاهده و تکرارشدنی مفید می‌شوند.", points: ["ابتدا حقیقت کامل را به خود بگویید", "یک گفته گمراه‌کننده را بدون افزودن بهانه تازه اصلاح کنید", "پیامد مناسب را بپذیرید و آنچه را می‌توان با ایمنی جبران کرد اصلاح کنید", "پیش از آنکه بحران صداقت را تحمیل کند، در انتخاب‌های روزمره آن را تمرین کنید"] },
        ],
        practiceTitle: "صداقت را با مراقبت تمرین کنید",
        practices: [
          "واقعیت دقیق، داستانی که به آن افزودید و اطلاعاتی را که حذف کردید بنویسید.",
          "وقتی ترس پاسخ گمراه‌کننده را خودکار می‌کند، پیش از جواب دادن مکث کنید.",
          "وقتی افشا ممکن است بر ایمنی، حریم خصوصی، مسئله حقوقی یا فرد دیگری اثر بگذارد از شخصی قابل اعتماد راهنمایی بگیرید.",
          "افشای تند را به سلاح تبدیل نکنید؛ صداقت به بی‌رحمی یا تماس ناامن نیاز ندارد.",
        ],
        reflectionTitle: "پرسش برای تأمل",
        reflection: "کجا با تغییر، پنهان کردن یا دوری از حقیقت در حال محافظت از یک تصویر یا نتیجه هستم و یک اقدام سنجیده صادقانه چیست؟",
        closingTitle: "پیشرفت یعنی هماهنگی تکرارشونده",
        closing: "یک گفته صادقانه الگویی را پاک نمی‌کند و یک پاسخ ناصادقانه تمام یک فرد را تعریف نمی‌کند. تغییر با تمرین پیوسته صداقت، درستکاری، پاسخ‌گویی و شجاعت رشد می‌کند. اگر حقیقت شامل خطر، سوءاستفاده، پیامد حقوقی، آسیب روانی یا نگرانی جدی سلامت روان است، پیش از اقدام راهنمایی تخصصی بگیرید.",
      },
    },
  },
];

export function learningBasePath(language: Language) {
  return language === "en" ? "/learn" : `/${language}/learn`;
}

export function learningTopicPath(language: Language, slug: string) {
  return `${learningBasePath(language)}/${slug}`;
}

export function learningLanguageRoutes(slug?: string) {
  return {
    en: slug ? learningTopicPath("en", slug) : learningBasePath("en"),
    es: slug ? learningTopicPath("es", slug) : learningBasePath("es"),
    fa: slug ? learningTopicPath("fa", slug) : learningBasePath("fa"),
  } satisfies Record<Language, string>;
}

export function findLearningTopic(slug: string) {
  return publicLearningTopics.find((topic) => topic.slug === slug);
}
