import type { Language } from "@/lib/inventory";

export type LocalizedText = {
  en: string;
  fa: string;
  es: string;
};

export type PrincipleGuide = {
  id: string;
  definition: LocalizedText;
  practices: LocalizedText[];
  reflection: LocalizedText;
};

export type ShortcomingGuide = {
  name: LocalizedText;
  explanation: LocalizedText;
};

export type CharacterDefectGuide = {
  id: string;
  name: LocalizedText;
  definition: LocalizedText;
  shortcomings: ShortcomingGuide[];
  principleIds: string[];
  recoveryPath: LocalizedText[];
};

const text = (en: string, fa: string, es: string): LocalizedText => ({ en, fa, es });
const shortcoming = (name: LocalizedText, explanation: LocalizedText): ShortcomingGuide => ({ name, explanation });

export function localized(value: LocalizedText, language: Language) {
  return value[language];
}

export const principleGuides: PrincipleGuide[] = [
  {
    id: "honesty",
    definition: text("Facing reality and communicating truthfully with ourselves and others, even when the truth is uncomfortable.", "روبرو شدن با واقعیت و گفتن حقیقت به خود و دیگران، حتی زمانی که حقیقت ناراحت‌کننده است.", "Afrontar la realidad y comunicarnos con sinceridad con nosotros mismos y con los demás, incluso cuando la verdad resulte incómoda."),
    practices: [text("Pause before answering and give a complete, accurate response.", "پیش از پاسخ دادن مکث کنید و پاسخی کامل و دقیق بدهید.", "Haz una pausa antes de responder y da una respuesta completa y precisa."), text("Correct a misleading statement and admit mistakes promptly.", "یک گفته گمراه‌کننده را اصلاح کنید و اشتباه را زود بپذیرید.", "Corrige una afirmación engañosa y reconoce los errores con prontitud.")],
    reflection: text("Where would greater honesty bring relief or clarity today?", "امروز صداقت بیشتر کجا می‌تواند آرامش یا روشنی ایجاد کند؟", "¿Dónde aportaría hoy una mayor honestidad alivio o claridad?"),
  },
  {
    id: "open-mindedness",
    definition: text("Remaining willing to consider information, experience, and viewpoints beyond our first conclusion.", "آماده ماندن برای بررسی اطلاعات، تجربه‌ها و دیدگاه‌هایی فراتر از نتیجه‌گیری نخست خود.", "Mantener la disposición a considerar información, experiencias y puntos de vista más allá de nuestra primera conclusión."),
    practices: [text("Ask one curious question before defending your position.", "پیش از دفاع از نظر خود یک پرسش کنجکاوانه مطرح کنید.", "Haz una pregunta con curiosidad antes de defender tu posición."), text("Listen for what may be useful, even when you disagree.", "حتی هنگام مخالفت، به نکته‌ای که ممکن است مفید باشد گوش دهید.", "Escucha lo que pueda ser útil, incluso cuando no estés de acuerdo.")],
    reflection: text("What possibility have I not considered yet?", "هنوز چه امکانی را در نظر نگرفته‌ام؟", "¿Qué posibilidad no he considerado todavía?"),
  },
  {
    id: "willingness",
    definition: text("Readiness to take a helpful action even before we feel completely comfortable or certain.", "آمادگی برای انجام یک اقدام مفید، حتی پیش از آنکه کاملاً راحت یا مطمئن باشیم.", "La disposición a realizar una acción útil incluso antes de sentirnos totalmente cómodos o seguros."),
    practices: [text("Choose the smallest healthy next step and begin it.", "کوچک‌ترین قدم سالم بعدی را انتخاب کرده و آغاز کنید.", "Elige el siguiente paso saludable más pequeño y comienza."), text("Ask for guidance instead of waiting to feel perfectly ready.", "به جای انتظار برای آمادگی کامل، راهنمایی بخواهید.", "Pide orientación en vez de esperar a sentirte completamente preparado." )],
    reflection: text("What helpful action am I willing to take today?", "امروز مایلم چه اقدام مفیدی انجام دهم؟", "¿Qué acción útil estoy dispuesto a realizar hoy?"),
  },
  {
    id: "humility",
    definition: text("Seeing ourselves accurately: neither above nor below others, and able to recognize both strengths and limitations.", "دیدن خود به‌صورت واقع‌بینانه؛ نه بالاتر و نه پایین‌تر از دیگران، همراه با شناخت توانایی‌ها و محدودیت‌ها.", "Vernos con precisión, ni por encima ni por debajo de los demás, reconociendo fortalezas y limitaciones."),
    practices: [text("Admit when you do not know and ask for help.", "وقتی نمی‌دانید بپذیرید و کمک بخواهید.", "Admite cuando no sabes algo y pide ayuda."), text("Receive feedback without immediately explaining it away.", "بازخورد را بدون توجیه فوری دریافت کنید.", "Recibe comentarios sin justificarlos de inmediato.")],
    reflection: text("What can I learn if I do not need to be right?", "اگر لازم نباشد حق با من باشد، چه چیزی می‌توانم یاد بگیرم؟", "¿Qué puedo aprender si no necesito tener la razón?"),
  },
  {
    id: "responsibility",
    definition: text("Owning our choices, duties, and impact without blaming others or carrying what is not ours.", "پذیرفتن انتخاب‌ها، وظایف و تأثیر رفتار خود بدون سرزنش دیگران یا به دوش گرفتن مسئولیت دیگران.", "Asumir nuestras decisiones, deberes e impacto sin culpar a otros ni cargar con lo que no nos corresponde."),
    practices: [text("Name your part in a situation without adding excuses.", "سهم خود را در یک موقعیت بدون آوردن بهانه مشخص کنید.", "Nombra tu parte en una situación sin añadir excusas."), text("Complete one commitment or communicate honestly about a delay.", "یک تعهد را انجام دهید یا درباره تأخیر صادقانه اطلاع دهید.", "Cumple un compromiso o comunica honestamente un retraso.")],
    reflection: text("What part is mine to own, and what is not mine?", "کدام بخش مسئولیت من است و کدام بخش نیست؟", "¿Qué parte me corresponde asumir y cuál no?"),
  },
  {
    id: "acceptance",
    definition: text("Acknowledging reality as it is so we can respond wisely instead of fighting what has already happened.", "پذیرفتن واقعیت همان‌گونه که هست تا به جای جنگیدن با آنچه رخ داده، خردمندانه پاسخ دهیم.", "Reconocer la realidad tal como es para responder con sabiduría en lugar de luchar contra lo que ya ocurrió."),
    practices: [text("Name one fact you cannot change and one response you can choose.", "یک واقعیت تغییرناپذیر و یک پاسخ قابل انتخاب را نام ببرید.", "Nombra un hecho que no puedes cambiar y una respuesta que sí puedes elegir."), text("Let feelings be present without treating them as instructions.", "اجازه دهید احساسات حضور داشته باشند بدون اینکه آنها را دستور عمل بدانید.", "Permite que los sentimientos estén presentes sin tratarlos como instrucciones." )],
    reflection: text("What becomes possible when I stop arguing with this reality?", "وقتی دست از جنگیدن با این واقعیت بردارم چه چیزی ممکن می‌شود؟", "¿Qué se vuelve posible cuando dejo de discutir con esta realidad?"),
  },
  {
    id: "patience",
    definition: text("Allowing growth, people, and circumstances the time they need without forcing an immediate result.", "دادن زمان لازم به رشد، افراد و شرایط بدون اجبار برای نتیجه فوری.", "Permitir que el crecimiento, las personas y las circunstancias tengan el tiempo necesario sin forzar un resultado inmediato."),
    practices: [text("Slow your pace before making a pressured decision.", "پیش از تصمیم‌گیری تحت فشار سرعت خود را کم کنید.", "Reduce el ritmo antes de tomar una decisión bajo presión."), text("Focus on the next responsible action rather than the final outcome.", "به جای نتیجه نهایی بر اقدام مسئولانه بعدی تمرکز کنید.", "Concéntrate en la siguiente acción responsable en vez del resultado final." )],
    reflection: text("What am I trying to force before its time?", "در تلاش هستم چه چیزی را پیش از زمانش مجبور کنم؟", "¿Qué estoy intentando forzar antes de tiempo?"),
  },
  {
    id: "courage",
    definition: text("Taking a values-based action while fear is present, with care rather than recklessness.", "انجام اقدامی بر پایه ارزش‌ها در حضور ترس، با دقت و نه بی‌پروایی.", "Actuar de acuerdo con los valores aunque exista miedo, con cuidado y no con imprudencia."),
    practices: [text("Say the truthful thing you have been safely avoiding.", "حقیقتی را که به‌طور امن از گفتنش دوری کرده‌اید بیان کنید.", "Di aquello verdadero que has estado evitando de manera segura."), text("Ask for support before taking a difficult step.", "پیش از برداشتن گامی دشوار حمایت بخواهید.", "Pide apoyo antes de dar un paso difícil." )],
    reflection: text("What would a careful act of courage look like today?", "امروز یک اقدام شجاعانه و سنجیده چگونه خواهد بود؟", "¿Cómo sería hoy un acto de valentía cuidadoso?"),
  },
  {
    id: "tolerance",
    definition: text("Making room for differences and discomfort without becoming cruel, dismissive, or controlling.", "جا دادن برای تفاوت‌ها و ناراحتی بدون بی‌رحمی، بی‌اعتنایی یا کنترل‌گری.", "Dar espacio a las diferencias y al malestar sin volvernos crueles, despectivos o controladores."),
    practices: [text("Separate disagreement from disrespect.", "مخالفت را از بی‌احترامی جدا کنید.", "Separa el desacuerdo de la falta de respeto."), text("Let another person be different without trying to correct them.", "اجازه دهید دیگری متفاوت باشد بدون تلاش برای اصلاح او.", "Permite que otra persona sea diferente sin intentar corregirla." )],
    reflection: text("Where can I make room for a difference without abandoning my boundaries?", "کجا می‌توانم بدون کنار گذاشتن مرزهایم برای تفاوت جا باز کنم؟", "¿Dónde puedo dar espacio a una diferencia sin abandonar mis límites?"),
  },
  {
    id: "kindness",
    definition: text("Choosing words and actions that protect dignity while remaining honest and appropriately boundaried.", "انتخاب گفتار و رفتاری که کرامت را حفظ می‌کند و در عین حال صادقانه و دارای مرز سالم است.", "Elegir palabras y acciones que protejan la dignidad, manteniendo la honestidad y límites adecuados."),
    practices: [text("Lower your tone and speak without attacking character.", "لحن خود را آرام کنید و بدون حمله به شخصیت صحبت کنید.", "Baja el tono y habla sin atacar el carácter."), text("Offer yourself the same respectful language you would offer someone else.", "همان زبان محترمانه‌ای را که با دیگری دارید با خود نیز به کار ببرید.", "Ofrécete el mismo lenguaje respetuoso que ofrecerías a otra persona." )],
    reflection: text("How can I be both truthful and kind here?", "چگونه می‌توانم در اینجا هم صادق و هم مهربان باشم؟", "¿Cómo puedo ser sincero y amable en esta situación?"),
  },
  {
    id: "compassion",
    definition: text("Recognizing suffering with understanding and responding without excusing harmful behavior.", "دیدن رنج با درک و پاسخ دادن بدون توجیه رفتار آسیب‌زا.", "Reconocer el sufrimiento con comprensión y responder sin justificar conductas dañinas."),
    practices: [text("Consider what pain may be present before reacting.", "پیش از واکنش، رنجی را که ممکن است وجود داشته باشد در نظر بگیرید.", "Considera qué dolor puede estar presente antes de reaccionar."), text("Respond with care while keeping necessary limits.", "با مراقبت پاسخ دهید و مرزهای لازم را حفظ کنید.", "Responde con cuidado manteniendo los límites necesarios." )],
    reflection: text("What does compassionate accountability require?", "پاسخ‌گویی همراه با همدلی چه چیزی می‌طلبد؟", "¿Qué requiere una responsabilidad compasiva?"),
  },
  {
    id: "forgiveness",
    definition: text("Gradually releasing the hold of resentment; it does not require forgetting, excusing harm, or restoring unsafe contact.", "رها کردن تدریجی چسبیدن به رنجش؛ این کار به معنای فراموشی، توجیه آسیب یا بازگشت به رابطه ناامن نیست.", "Soltar gradualmente el resentimiento; no exige olvidar, justificar el daño ni restablecer un contacto inseguro."),
    practices: [text("Name the hurt honestly without feeding a revenge story.", "آسیب را صادقانه نام ببرید بدون پرورش داستان انتقام.", "Nombra el daño con honestidad sin alimentar una historia de venganza."), text("Release one expectation that keeps you tied to the injury.", "یک انتظار را که شما را به آسیب پیوند می‌دهد رها کنید.", "Suelta una expectativa que te mantiene atado a la herida." )],
    reflection: text("What can I release while still protecting myself?", "در حالی که از خود محافظت می‌کنم چه چیزی را می‌توانم رها کنم؟", "¿Qué puedo soltar mientras sigo protegiéndome?"),
  },
  {
    id: "respect",
    definition: text("Honoring the dignity, rights, limits, and autonomy of ourselves and other people.", "ارج نهادن به کرامت، حقوق، مرزها و اختیار خود و دیگران.", "Honrar la dignidad, los derechos, los límites y la autonomía propios y de los demás."),
    practices: [text("Listen without interrupting or belittling.", "بدون قطع کردن یا کوچک شمردن گوش دهید.", "Escucha sin interrumpir ni menospreciar."), text("Honor a clear no, including your own.", "به یک نه روشن، از جمله نه خودتان، احترام بگذارید.", "Respeta un no claro, incluido el tuyo." )],
    reflection: text("What response protects everyone’s dignity?", "چه پاسخی کرامت همه را حفظ می‌کند؟", "¿Qué respuesta protege la dignidad de todos?"),
  },
  {
    id: "boundaries",
    definition: text("Clear limits that define what we will do, accept, share, or participate in while respecting others’ choices.", "مرزهای روشنی که مشخص می‌کنند چه کاری انجام می‌دهیم، چه چیزی را می‌پذیریم یا به اشتراک می‌گذاریم و در چه چیزی مشارکت می‌کنیم.", "Límites claros que definen lo que haremos, aceptaremos, compartiremos o en lo que participaremos, respetando las decisiones ajenas."),
    practices: [text("State a limit as your action, not as a threat to control someone.", "مرز را به‌عنوان اقدام خود بیان کنید، نه تهدیدی برای کنترل دیگری.", "Expresa un límite como una acción propia, no como una amenaza para controlar a alguien."), text("Notice where fear or guilt leads you to say yes when you mean no.", "ببینید ترس یا احساس گناه کجا باعث می‌شود وقتی منظورتان نه است بله بگویید.", "Observa dónde el miedo o la culpa te hacen decir sí cuando quieres decir no." )],
    reflection: text("What clear and respectful limit is needed here?", "در اینجا چه مرز روشن و محترمانه‌ای لازم است؟", "¿Qué límite claro y respetuoso se necesita aquí?"),
  },
  {
    id: "accountability",
    definition: text("Acknowledging our impact, accepting appropriate consequences, and taking action to change repeated behavior.", "پذیرفتن تأثیر رفتار خود، قبول پیامدهای مناسب و اقدام برای تغییر رفتار تکراری.", "Reconocer nuestro impacto, aceptar consecuencias apropiadas y actuar para cambiar conductas repetidas."),
    practices: [text("Describe what you did and its impact without adding a defense.", "آنچه انجام دادید و تأثیرش را بدون دفاع توضیح دهید.", "Describe lo que hiciste y su impacto sin añadir una defensa."), text("Name the specific behavior you will change next time.", "رفتار مشخصی را که دفعه بعد تغییر می‌دهید نام ببرید.", "Nombra la conducta específica que cambiarás la próxima vez." )],
    reflection: text("What repair and changed behavior would demonstrate accountability?", "چه جبران و تغییر رفتاری پاسخ‌گویی را نشان می‌دهد؟", "¿Qué reparación y cambio de conducta demostrarían responsabilidad?"),
  },
  {
    id: "amends",
    definition: text("Taking appropriate action to repair harm and change behavior, while avoiding actions that would create further harm.", "انجام اقدام مناسب برای جبران آسیب و تغییر رفتار، بدون کاری که آسیب بیشتری ایجاد کند.", "Tomar medidas apropiadas para reparar el daño y cambiar la conducta, evitando causar más daño."),
    practices: [text("Consult a trusted person before attempting a sensitive repair.", "پیش از جبران حساس با فردی قابل اعتماد مشورت کنید.", "Consulta con una persona de confianza antes de intentar una reparación delicada."), text("Let changed behavior support your words over time.", "اجازه دهید رفتار تغییرکرده در طول زمان پشتیبان کلمات شما باشد.", "Permite que el cambio de conducta respalde tus palabras con el tiempo." )],
    reflection: text("What repair is appropriate, safe, and focused on the person harmed?", "چه جبرانی مناسب، امن و متمرکز بر فرد آسیب‌دیده است؟", "¿Qué reparación es apropiada, segura y centrada en la persona afectada?"),
  },
  {
    id: "integrity",
    definition: text("Aligning our private choices, public behavior, and stated values.", "هماهنگ کردن انتخاب‌های خصوصی، رفتار آشکار و ارزش‌های بیان‌شده.", "Alinear nuestras decisiones privadas, nuestra conducta pública y los valores que afirmamos."),
    practices: [text("Keep one promise that no one else is monitoring.", "به یک قول عمل کنید حتی وقتی کسی نظارت نمی‌کند.", "Cumple una promesa aunque nadie más la esté observando."), text("Choose the action you would be comfortable describing honestly.", "اقدامی را انتخاب کنید که بتوانید آن را صادقانه توضیح دهید.", "Elige la acción que podrías describir con honestidad." )],
    reflection: text("Do my actions match the person I say I want to be?", "آیا رفتارم با انسانی که می‌خواهم باشم هماهنگ است؟", "¿Mis acciones coinciden con la persona que digo querer ser?"),
  },
  {
    id: "self-discipline",
    definition: text("Following through on healthy commitments when comfort, impulse, or mood pulls in another direction.", "عمل کردن به تعهدهای سالم وقتی راحتی، تکانه یا خلق‌وخو ما را به جهت دیگری می‌کشاند.", "Cumplir compromisos saludables cuando la comodidad, el impulso o el estado de ánimo nos llevan en otra dirección."),
    practices: [text("Make the next action small, specific, and scheduled.", "اقدام بعدی را کوچک، مشخص و زمان‌بندی‌شده کنید.", "Haz que la siguiente acción sea pequeña, específica y programada."), text("Remove one cue that repeatedly pulls you away from the commitment.", "یک محرک تکراری را که شما را از تعهد دور می‌کند حذف کنید.", "Elimina una señal que repetidamente te aleja del compromiso." )],
    reflection: text("What commitment needs action rather than another intention?", "کدام تعهد به اقدام نیاز دارد نه نیت دوباره؟", "¿Qué compromiso necesita acción en lugar de otra intención?"),
  },
  {
    id: "service",
    definition: text("Contributing to another person or the community without controlling the result or neglecting healthy limits.", "کمک به دیگری یا جامعه بدون کنترل نتیجه یا نادیده گرفتن مرزهای سالم.", "Contribuir a otra persona o a la comunidad sin controlar el resultado ni descuidar límites saludables."),
    practices: [text("Offer one useful action without seeking recognition.", "یک کار مفید را بدون انتظار دیده شدن انجام دهید.", "Ofrece una acción útil sin buscar reconocimiento."), text("Ask what would actually help instead of assuming.", "به جای فرض کردن بپرسید چه چیزی واقعاً کمک می‌کند.", "Pregunta qué ayudaría realmente en vez de suponerlo." )],
    reflection: text("How can I be useful without rescuing or controlling?", "چگونه می‌توانم مفید باشم بدون نجات‌گری یا کنترل؟", "¿Cómo puedo ser útil sin rescatar ni controlar?"),
  },
  {
    id: "gratitude",
    definition: text("Intentionally noticing what is supportive, meaningful, or good without denying pain or difficulty.", "توجه آگاهانه به آنچه حمایت‌کننده، معنادار یا خوب است بدون انکار درد یا دشواری.", "Notar intencionalmente lo que sostiene, tiene significado o es bueno sin negar el dolor ni la dificultad."),
    practices: [text("Name one specific person, moment, or resource you appreciate.", "یک فرد، لحظه یا منبع مشخص را که قدردانش هستید نام ببرید.", "Nombra una persona, momento o recurso específico que agradeces."), text("Express appreciation directly when it is appropriate.", "در صورت مناسب بودن قدردانی را مستقیم بیان کنید.", "Expresa el agradecimiento directamente cuando sea apropiado." )],
    reflection: text("What is supporting me that I may be overlooking?", "چه چیزی از من حمایت می‌کند که شاید آن را نادیده گرفته‌ام؟", "¿Qué me está apoyando y quizá estoy pasando por alto?"),
  },
  {
    id: "faith",
    definition: text("Trusting that help, meaning, or a recovery process can exist beyond what we can control in this moment.", "اعتماد به اینکه کمک، معنا یا مسیر بهبودی می‌تواند فراتر از کنترل ما در این لحظه وجود داشته باشد.", "Confiar en que puede existir ayuda, sentido o un proceso de recuperación más allá de lo que podemos controlar en este momento."),
    practices: [text("Take the next right action without demanding certainty about the outcome.", "اقدام درست بعدی را بدون نیاز به اطمینان از نتیجه انجام دهید.", "Da el siguiente paso correcto sin exigir certeza sobre el resultado."), text("Connect with a source of guidance or support meaningful to you.", "با منبع راهنمایی یا حمایتی که برایتان معنا دارد ارتباط بگیرید.", "Conéctate con una fuente de orientación o apoyo significativa para ti." )],
    reflection: text("What can I entrust to something larger than my immediate control?", "چه چیزی را می‌توانم به نیرویی فراتر از کنترل فوری خود بسپارم؟", "¿Qué puedo confiar a algo mayor que mi control inmediato?"),
  },
  {
    id: "hope",
    definition: text("Keeping room for change and possibility while responding honestly to present circumstances.", "باز نگه داشتن فضا برای تغییر و امکان، همراه با پاسخ صادقانه به شرایط کنونی.", "Mantener espacio para el cambio y la posibilidad mientras respondemos con honestidad a las circunstancias presentes."),
    practices: [text("Remember one difficulty that changed through steady action.", "یک دشواری را به یاد آورید که با اقدام پیوسته تغییر کرد.", "Recuerda una dificultad que cambió mediante acciones constantes."), text("Identify one sign that movement is still possible.", "یک نشانه پیدا کنید که نشان می‌دهد حرکت هنوز ممکن است.", "Identifica una señal de que el avance sigue siendo posible." )],
    reflection: text("What small possibility can I leave room for today?", "امروز برای چه امکان کوچکی می‌توانم جا باز بگذارم؟", "¿A qué pequeña posibilidad puedo darle espacio hoy?"),
  },
  {
    id: "perseverance",
    definition: text("Continuing a meaningful course through discomfort, setbacks, and imperfect progress.", "ادامه دادن مسیر معنادار در میان ناراحتی، عقب‌گرد و پیشرفت ناقص.", "Continuar un camino significativo a través del malestar, los contratiempos y el progreso imperfecto."),
    practices: [text("Return after a setback instead of declaring the effort ruined.", "پس از عقب‌گرد بازگردید به جای اینکه تلاش را شکست‌خورده بدانید.", "Vuelve después de un tropiezo en vez de considerar arruinado el esfuerzo."), text("Measure consistency in small actions, not perfection.", "پیوستگی را با اقدامات کوچک بسنجید نه کمال.", "Mide la constancia mediante acciones pequeñas, no la perfección." )],
    reflection: text("What is worth continuing, one manageable step at a time?", "چه چیزی ارزش ادامه دادن دارد، هر بار با یک قدم قابل انجام؟", "¿Qué vale la pena continuar, un paso manejable a la vez?"),
  },
  {
    id: "mindfulness",
    definition: text("Noticing present thoughts, emotions, body sensations, and surroundings without immediately reacting.", "دیدن افکار، احساسات، حس‌های بدنی و محیط اکنون بدون واکنش فوری.", "Observar pensamientos, emociones, sensaciones corporales y el entorno presente sin reaccionar de inmediato."),
    practices: [text("Pause for three slow breaths before responding.", "پیش از پاسخ سه نفس آرام بکشید.", "Haz una pausa de tres respiraciones lentas antes de responder."), text("Name what you notice as a thought, feeling, or sensation.", "آنچه می‌بینید را به‌عنوان فکر، احساس یا حس بدنی نام ببرید.", "Nombra lo que observas como pensamiento, emoción o sensación." )],
    reflection: text("What is happening inside me before I choose my next action?", "پیش از انتخاب اقدام بعدی چه چیزی درون من می‌گذرد؟", "¿Qué está ocurriendo dentro de mí antes de elegir mi siguiente acción?"),
  },
];

export const characterDefects: CharacterDefectGuide[] = [
  {
    id: "dishonesty",
    name: text("Dishonesty", "عدم صداقت", "Deshonestidad"),
    definition: text("A pattern of hiding, changing, or avoiding the truth to escape consequences, protect an image, or control an outcome.", "الگوی پنهان کردن، تغییر دادن یا دوری از حقیقت برای فرار از پیامدها، حفظ تصویر خود یا کنترل نتیجه.", "Un patrón de ocultar, cambiar o evitar la verdad para escapar de consecuencias, proteger una imagen o controlar un resultado."),
    shortcomings: [
      shortcoming(text("Lying", "دروغ گفتن", "Mentir"), text("Knowingly presenting something false as true.", "آگاهانه چیزی نادرست را درست نشان دادن.", "Presentar conscientemente algo falso como verdadero.")),
      shortcoming(text("Omission", "حذف حقیقت", "Omisión"), text("Leaving out important facts so another person receives a false impression.", "حذف واقعیت‌های مهم به‌گونه‌ای که دیگری برداشت نادرستی پیدا کند.", "Excluir hechos importantes para que otra persona reciba una impresión falsa.")),
      shortcoming(text("Denial and rationalization", "انکار و توجیه", "Negación y racionalización"), text("Refusing reality or creating excuses that make harmful behavior appear acceptable.", "نپذیرفتن واقعیت یا ساختن بهانه برای قابل قبول نشان دادن رفتار آسیب‌زا.", "Rechazar la realidad o crear excusas para que una conducta dañina parezca aceptable.")),
      shortcoming(text("Manipulation", "دستکاری", "Manipulación"), text("Using misleading information, pressure, or hidden motives to control another person’s choice.", "استفاده از اطلاعات گمراه‌کننده، فشار یا انگیزه پنهان برای کنترل انتخاب دیگری.", "Usar información engañosa, presión o motivos ocultos para controlar la decisión de otra persona.")),
    ],
    principleIds: ["honesty", "integrity", "accountability", "courage"],
    recoveryPath: [text("Tell the complete truth, beginning with yourself.", "حقیقت کامل را ابتدا به خودتان بگویید.", "Di la verdad completa, comenzando contigo mismo."), text("Correct misleading statements and accept appropriate consequences.", "گفته‌های گمراه‌کننده را اصلاح کنید و پیامد مناسب را بپذیرید.", "Corrige afirmaciones engañosas y acepta consecuencias apropiadas."), text("Practice consistent truthfulness in small daily choices.", "صداقت پیوسته را در انتخاب‌های کوچک روزانه تمرین کنید.", "Practica una sinceridad constante en pequeñas decisiones diarias.")],
  },
  {
    id: "resentment",
    name: text("Resentment", "رنجش", "Resentimiento"),
    definition: text("Repeatedly holding and replaying anger about a perceived injury, injustice, or unmet expectation.", "نگه داشتن و مرور مداوم خشم درباره آسیب، بی‌عدالتی یا انتظار برآورده‌نشده.", "Mantener y repetir la ira por una herida, injusticia o expectativa incumplida."),
    shortcomings: [
      shortcoming(text("Scorekeeping", "حساب نگه داشتن", "Llevar la cuenta"), text("Collecting evidence of wrongs while overlooking context, change, or one’s own part.", "جمع کردن شواهد خطاها و نادیده گرفتن زمینه، تغییر یا سهم خود.", "Acumular pruebas de agravios ignorando el contexto, el cambio o la propia parte.")),
      shortcoming(text("Rumination", "نشخوار فکری", "Rumiación"), text("Replaying the injury until it repeatedly renews anger and pain.", "مرور آسیب تا جایی که خشم و درد را بارها تازه می‌کند.", "Repetir la herida hasta renovar una y otra vez la ira y el dolor.")),
      shortcoming(text("Punishing withdrawal", "کناره‌گیری تنبیهی", "Retirada punitiva"), text("Withholding communication or care to make another person suffer.", "دریغ کردن ارتباط یا توجه برای رنج دادن دیگری.", "Retener comunicación o afecto para hacer sufrir a otra persona.")),
      shortcoming(text("Revenge", "انتقام", "Venganza"), text("Trying to return pain rather than seek safety, resolution, or appropriate accountability.", "تلاش برای بازگرداندن درد به جای ایمنی، حل مسئله یا پاسخ‌گویی مناسب.", "Intentar devolver el dolor en vez de buscar seguridad, resolución o responsabilidad apropiada.")),
    ],
    principleIds: ["forgiveness", "acceptance", "compassion", "tolerance"],
    recoveryPath: [text("Name the injury and its impact without minimizing it.", "آسیب و تأثیرش را بدون کوچک شمردن نام ببرید.", "Nombra la herida y su impacto sin minimizarla."), text("Separate what belongs to you from what belongs to the other person.", "آنچه متعلق به شماست از مسئولیت دیگری جدا کنید.", "Separa lo que te corresponde de lo que pertenece a la otra persona."), text("Release revenge while maintaining any boundary needed for safety.", "انتقام را رها کنید و مرز لازم برای ایمنی را حفظ کنید.", "Suelta la venganza manteniendo los límites necesarios para tu seguridad.")],
  },
  {
    id: "fear",
    name: text("Fear", "ترس", "Miedo"),
    definition: text("Allowing anticipated danger, rejection, loss, or uncertainty to direct choices beyond what present facts require.", "اجازه دادن به خطر، طرد، فقدان یا عدم قطعیت پیش‌بینی‌شده برای هدایت انتخاب‌ها بیش از آنچه واقعیت اکنون می‌طلبد.", "Permitir que el peligro, rechazo, pérdida o incertidumbre anticipados dirijan decisiones más allá de lo que exigen los hechos presentes."),
    shortcomings: [
      shortcoming(text("Avoidance", "اجتناب", "Evitación"), text("Escaping conversations, decisions, or responsibilities that feel uncomfortable.", "فرار از گفت‌وگوها، تصمیم‌ها یا مسئولیت‌های ناراحت‌کننده.", "Escapar de conversaciones, decisiones o responsabilidades incómodas.")),
      shortcoming(text("Control", "کنترل‌گری", "Control"), text("Trying to manage people or outcomes to prevent uncertainty.", "تلاش برای مدیریت افراد یا نتایج به‌منظور جلوگیری از عدم قطعیت.", "Intentar manejar personas o resultados para evitar la incertidumbre.")),
      shortcoming(text("Defensiveness", "حالت دفاعی", "Actitud defensiva"), text("Protecting against shame or criticism before fully hearing what is being said.", "محافظت در برابر شرم یا انتقاد پیش از شنیدن کامل سخن دیگری.", "Protegerse de la vergüenza o la crítica antes de escuchar plenamente.")),
      shortcoming(text("Isolation", "انزوا", "Aislamiento"), text("Withdrawing from safe support to avoid vulnerability or rejection.", "کناره‌گیری از حمایت امن برای دوری از آسیب‌پذیری یا طرد.", "Alejarse de apoyo seguro para evitar vulnerabilidad o rechazo.")),
    ],
    principleIds: ["courage", "faith", "hope", "willingness"],
    recoveryPath: [text("Separate present facts from imagined outcomes.", "واقعیت‌های اکنون را از نتایج خیالی جدا کنید.", "Separa los hechos presentes de los resultados imaginados."), text("Share the fear with a trusted person instead of hiding it.", "به جای پنهان کردن ترس، آن را با فردی قابل اعتماد در میان بگذارید.", "Comparte el miedo con una persona de confianza en vez de ocultarlo."), text("Take one careful action that fear has been delaying.", "یک اقدام سنجیده را که ترس به تأخیر انداخته انجام دهید.", "Realiza una acción cuidadosa que el miedo ha estado retrasando.")],
  },
  {
    id: "selfishness",
    name: text("Selfishness", "خودخواهی", "Egoísmo"),
    definition: text("Consistently placing personal wants above the legitimate needs, dignity, or well-being of others.", "قرار دادن مداوم خواسته‌های شخصی بالاتر از نیازهای واقعی، کرامت یا سلامت دیگران.", "Colocar constantemente los deseos personales por encima de las necesidades legítimas, la dignidad o el bienestar de los demás."),
    shortcomings: [
      shortcoming(text("Entitlement", "حق‌به‌جانبی", "Sentido de derecho"), text("Expecting special treatment without equal responsibility or consideration.", "انتظار رفتار ویژه بدون مسئولیت یا ملاحظه برابر.", "Esperar un trato especial sin responsabilidad ni consideración equivalentes.")),
      shortcoming(text("Neglect", "بی‌توجهی", "Descuido"), text("Ignoring responsibilities or another person’s reasonable needs when inconvenient.", "نادیده گرفتن مسئولیت یا نیاز منطقی دیگری وقتی ناراحت‌کننده است.", "Ignorar responsabilidades o necesidades razonables de otra persona cuando resultan incómodas.")),
      shortcoming(text("Taking without giving", "گرفتن بدون بخشیدن", "Recibir sin dar"), text("Using support, time, or resources without mutual care or contribution.", "استفاده از حمایت، زمان یا منابع بدون توجه یا مشارکت متقابل.", "Usar apoyo, tiempo o recursos sin cuidado ni contribución mutuos.")),
    ],
    principleIds: ["service", "compassion", "kindness", "responsibility"],
    recoveryPath: [text("Pause to consider how your choice affects others.", "مکث کنید و تأثیر انتخاب خود بر دیگران را در نظر بگیرید.", "Haz una pausa para considerar cómo afecta tu decisión a los demás."), text("Ask what support is actually helpful rather than assuming.", "بپرسید چه حمایتی واقعاً مفید است به جای اینکه فرض کنید.", "Pregunta qué apoyo es realmente útil en vez de suponerlo."), text("Contribute consistently while keeping healthy boundaries.", "با حفظ مرزهای سالم به‌طور پیوسته مشارکت کنید.", "Contribuye de forma constante manteniendo límites saludables.")],
  },
  {
    id: "self-seeking",
    name: text("Self-seeking", "منفعت‌طلبی", "Interés propio"),
    definition: text("Using people, situations, or appearances primarily to obtain approval, advantage, attention, or control.", "استفاده از افراد، موقعیت‌ها یا ظاهر برای به دست آوردن تأیید، منفعت، توجه یا کنترل.", "Usar personas, situaciones o apariencias principalmente para obtener aprobación, ventaja, atención o control."),
    shortcomings: [
      shortcoming(text("Hidden motives", "انگیزه‌های پنهان", "Motivos ocultos"), text("Presenting an action as generous while privately expecting a benefit.", "نشان دادن یک عمل به‌عنوان بخشندگی در حالی که در خفا انتظار منفعت وجود دارد.", "Presentar una acción como generosa mientras se espera un beneficio privado.")),
      shortcoming(text("Approval-seeking", "تأییدطلبی", "Búsqueda de aprobación"), text("Changing behavior or values mainly to gain praise or avoid disapproval.", "تغییر رفتار یا ارزش‌ها عمدتاً برای گرفتن تحسین یا دوری از نارضایتی.", "Cambiar conductas o valores principalmente para recibir elogios o evitar desaprobación.")),
      shortcoming(text("Exploitation", "بهره‌کشی", "Explotación"), text("Treating another person as a means to an outcome rather than a person with autonomy.", "دیدن دیگری به‌عنوان وسیله‌ای برای نتیجه، نه انسانی دارای اختیار.", "Tratar a otra persona como medio para un resultado y no como alguien con autonomía.")),
    ],
    principleIds: ["integrity", "honesty", "humility", "service"],
    recoveryPath: [text("Name what you truly want before acting.", "پیش از اقدام خواسته واقعی خود را نام ببرید.", "Nombra lo que realmente quieres antes de actuar."), text("Ask directly instead of using pressure or indirect strategies.", "به جای فشار یا روش غیرمستقیم، خواسته خود را مستقیم بیان کنید.", "Pide directamente en vez de usar presión o estrategias indirectas."), text("Let service be useful even when no recognition follows.", "اجازه دهید خدمت مفید باشد حتی اگر دیده نشود.", "Permite que el servicio sea útil aunque no reciba reconocimiento.")],
  },
  {
    id: "pride",
    name: text("Pride", "غرور", "Orgullo"),
    definition: text("Protecting an inflated or fragile self-image by resisting help, correction, equality, or honest limitation.", "محافظت از تصویر بزرگ‌شده یا شکننده خود با مقاومت در برابر کمک، اصلاح، برابری یا محدودیت واقعی.", "Proteger una imagen propia inflada o frágil resistiendo ayuda, corrección, igualdad o limitaciones reales."),
    shortcomings: [
      shortcoming(text("Superiority", "برتری‌طلبی", "Superioridad"), text("Treating others as less valuable, capable, or worthy of respect.", "کم‌ارزش‌تر، کم‌توان‌تر یا نالایق احترام دانستن دیگران.", "Tratar a otros como menos valiosos, capaces o dignos de respeto.")),
      shortcoming(text("Refusal of help", "رد کمک", "Rechazo de ayuda"), text("Avoiding needed support because receiving it feels weak or exposing.", "دوری از حمایت لازم چون دریافت آن نشانه ضعف یا آشکار شدن به نظر می‌رسد.", "Evitar apoyo necesario porque recibirlo parece débil o revelador.")),
      shortcoming(text("Inability to admit error", "ناتوانی در پذیرش خطا", "Incapacidad para admitir errores"), text("Defending a position after evidence shows it was mistaken.", "دفاع از موضع حتی پس از روشن شدن اشتباه بودن آن.", "Defender una posición después de que la evidencia demuestra que era equivocada.")),
    ],
    principleIds: ["humility", "open-mindedness", "accountability", "respect"],
    recoveryPath: [text("Acknowledge one limitation without attacking yourself.", "یک محدودیت را بدون حمله به خود بپذیرید.", "Reconoce una limitación sin atacarte."), text("Ask for and receive appropriate help.", "کمک مناسب بخواهید و آن را بپذیرید.", "Pide y recibe ayuda apropiada."), text("Let another person be right without making yourself smaller.", "اجازه دهید دیگری درست بگوید بدون اینکه خود را کوچک کنید.", "Permite que otra persona tenga razón sin hacerte menos.")],
  },
  {
    id: "anger",
    name: text("Unmanaged anger", "خشم مدیریت‌نشده", "Ira no manejada"),
    definition: text("Allowing anger to control speech or behavior rather than using it as information about hurt, fear, injustice, or boundaries.", "اجازه دادن به خشم برای کنترل گفتار یا رفتار به جای استفاده از آن به‌عنوان نشانه‌ای از آسیب، ترس، بی‌عدالتی یا مرزها.", "Permitir que la ira controle palabras o conductas en vez de usarla como información sobre dolor, miedo, injusticia o límites."),
    shortcomings: [
      shortcoming(text("Harsh speech", "گفتار تند", "Habla hiriente"), text("Using insults, contempt, or volume to overpower another person.", "استفاده از توهین، تحقیر یا صدای بلند برای غلبه بر دیگری.", "Usar insultos, desprecio o volumen para dominar a otra persona.")),
      shortcoming(text("Impulsiveness", "تکانشگری", "Impulsividad"), text("Acting before considering consequences, safety, or values.", "اقدام پیش از در نظر گرفتن پیامدها، ایمنی یا ارزش‌ها.", "Actuar antes de considerar consecuencias, seguridad o valores.")),
      shortcoming(text("Intimidation", "ارعاب", "Intimidación"), text("Using anger, threats, or presence to make others comply.", "استفاده از خشم، تهدید یا حضور برای وادار کردن دیگران به اطاعت.", "Usar ira, amenazas o presencia para obligar a otros a obedecer.")),
    ],
    principleIds: ["patience", "kindness", "mindfulness", "tolerance"],
    recoveryPath: [text("Pause and create distance before speaking or acting.", "پیش از گفتار یا عمل مکث کرده و فاصله ایجاد کنید.", "Haz una pausa y toma distancia antes de hablar o actuar."), text("Name the hurt, fear, need, or boundary beneath the anger.", "آسیب، ترس، نیاز یا مرز زیر خشم را نام ببرید.", "Nombra el dolor, miedo, necesidad o límite que hay debajo de la ira."), text("Return to the issue with clear, respectful language.", "با زبان روشن و محترمانه به موضوع بازگردید.", "Vuelve al asunto con lenguaje claro y respetuoso.")],
  },
  {
    id: "control",
    name: text("Control", "کنترل‌گری", "Control"),
    definition: text("Trying to manage other people, uncertainty, or outcomes that are outside our legitimate responsibility.", "تلاش برای مدیریت افراد، عدم قطعیت یا نتایجی که بیرون از مسئولیت واقعی ما هستند.", "Intentar manejar a otras personas, la incertidumbre o resultados fuera de nuestra responsabilidad legítima."),
    shortcomings: [
      shortcoming(text("Micromanaging", "ریزمدیریت", "Microgestión"), text("Directing details that others can responsibly decide for themselves.", "هدایت جزئیاتی که دیگران می‌توانند مسئولانه خودشان تصمیم بگیرند.", "Dirigir detalles que otros pueden decidir responsablemente por sí mismos.")),
      shortcoming(text("Coercion", "اجبار", "Coacción"), text("Using pressure, guilt, or threats to obtain compliance.", "استفاده از فشار، احساس گناه یا تهدید برای گرفتن اطاعت.", "Usar presión, culpa o amenazas para obtener obediencia.")),
      shortcoming(text("Inability to delegate", "ناتوانی در واگذاری", "Incapacidad para delegar"), text("Holding every task because trusting others or tolerating differences feels unsafe.", "نگه داشتن همه کارها چون اعتماد به دیگران یا تحمل تفاوت‌ها ناامن به نظر می‌رسد.", "Retener todas las tareas porque confiar en otros o tolerar diferencias parece inseguro.")),
    ],
    principleIds: ["acceptance", "faith", "boundaries", "respect"],
    recoveryPath: [text("Identify what is actually within your responsibility.", "مشخص کنید چه چیزی واقعاً در مسئولیت شماست.", "Identifica lo que realmente está bajo tu responsabilidad."), text("Make a request and allow the other person to choose.", "درخواست کنید و اجازه دهید دیگری انتخاب کند.", "Haz una petición y permite que la otra persona elija."), text("Practice tolerating a safe outcome that is different from your preference.", "تحمل نتیجه‌ای امن اما متفاوت با ترجیح خود را تمرین کنید.", "Practica tolerar un resultado seguro diferente de tu preferencia.")],
  },
  {
    id: "impatience",
    name: text("Impatience", "بی‌صبری", "Impaciencia"),
    definition: text("Demanding that people, growth, or circumstances move faster than they realistically can.", "خواستن اینکه افراد، رشد یا شرایط سریع‌تر از توان واقعی‌شان پیش بروند.", "Exigir que las personas, el crecimiento o las circunstancias avancen más rápido de lo que realmente pueden."),
    shortcomings: [
      shortcoming(text("Rushing", "عجله", "Prisa"), text("Moving too quickly to think, listen, or complete something carefully.", "حرکت چنان سریع که فرصت فکر، گوش دادن یا انجام دقیق باقی نمی‌ماند.", "Avanzar demasiado rápido para pensar, escuchar o completar algo con cuidado.")),
      shortcoming(text("Forcing outcomes", "تحمیل نتیجه", "Forzar resultados"), text("Applying unnecessary pressure because waiting feels intolerable.", "اعمال فشار غیرضروری چون انتظار غیرقابل تحمل به نظر می‌رسد.", "Aplicar presión innecesaria porque esperar resulta intolerable.")),
      shortcoming(text("Irritability", "تحریک‌پذیری", "Irritabilidad"), text("Directing frustration at people who do not meet an internal timetable.", "خالی کردن ناامیدی بر سر افرادی که با زمان‌بندی ذهنی ما هماهنگ نیستند.", "Dirigir frustración a quienes no cumplen un calendario interno.")),
    ],
    principleIds: ["patience", "acceptance", "mindfulness", "perseverance"],
    recoveryPath: [text("Slow down enough to identify the next responsible action.", "آن‌قدر آهسته شوید که اقدام مسئولانه بعدی را تشخیص دهید.", "Reduce el ritmo lo suficiente para identificar la siguiente acción responsable."), text("Allow progress to be gradual and imperfect.", "اجازه دهید پیشرفت تدریجی و ناقص باشد.", "Permite que el progreso sea gradual e imperfecto."), text("Notice urgency without automatically obeying it.", "احساس فوریت را ببینید بدون اینکه خودکار از آن پیروی کنید.", "Observa la urgencia sin obedecerla automáticamente.")],
  },
  {
    id: "intolerance",
    name: text("Intolerance and judgment", "نابردباری و قضاوت", "Intolerancia y juicio"),
    definition: text("Reducing people to differences, mistakes, or labels and refusing to make room for their humanity or perspective.", "تقلیل دادن افراد به تفاوت‌ها، اشتباه‌ها یا برچسب‌ها و جا ندادن برای انسانیت یا دیدگاه آنها.", "Reducir a las personas a diferencias, errores o etiquetas y negarse a dar espacio a su humanidad o perspectiva."),
    shortcomings: [
      shortcoming(text("Labeling", "برچسب‌زنی", "Etiquetar"), text("Defining a whole person by one behavior, trait, or disagreement.", "تعریف کل یک انسان بر اساس یک رفتار، ویژگی یا اختلاف.", "Definir a una persona completa por una conducta, rasgo o desacuerdo.")),
      shortcoming(text("Rigidity", "خشکی فکری", "Rigidez"), text("Treating one preferred way as the only acceptable way.", "تنها راه قابل قبول دانستن روش مورد ترجیح خود.", "Tratar una forma preferida como la única aceptable.")),
      shortcoming(text("Dismissiveness", "بی‌اعتنایی", "Desestimación"), text("Rejecting another person’s experience without trying to understand it.", "رد تجربه دیگری بدون تلاش برای درک آن.", "Rechazar la experiencia de otra persona sin intentar comprenderla.")),
    ],
    principleIds: ["tolerance", "open-mindedness", "compassion", "respect"],
    recoveryPath: [text("Describe behavior without defining the entire person.", "رفتار را توصیف کنید بدون اینکه کل فرد را تعریف کنید.", "Describe la conducta sin definir a la persona completa."), text("Listen for the experience underneath a different opinion.", "به تجربه زیر یک نظر متفاوت گوش دهید.", "Escucha la experiencia que hay debajo de una opinión diferente."), text("Hold your boundary without contempt.", "مرز خود را بدون تحقیر حفظ کنید.", "Mantén tu límite sin desprecio.")],
  },
  {
    id: "envy",
    name: text("Envy and jealousy", "حسادت", "Envidia y celos"),
    definition: text("Comparing our worth or security to what another person has, receives, or represents.", "مقایسه ارزش یا امنیت خود با آنچه دیگری دارد، دریافت می‌کند یا نمایانگر آن است.", "Comparar nuestro valor o seguridad con lo que otra persona tiene, recibe o representa."),
    shortcomings: [
      shortcoming(text("Comparison", "مقایسه", "Comparación"), text("Measuring personal worth through another person’s appearance, progress, or attention.", "سنجیدن ارزش خود با ظاهر، پیشرفت یا توجهی که دیگری دریافت می‌کند.", "Medir el valor propio mediante la apariencia, progreso o atención de otra persona.")),
      shortcoming(text("Possessiveness", "مالکیت‌طلبی", "Posesividad"), text("Treating another person’s time, affection, or choices as property.", "رفتار با زمان، محبت یا انتخاب‌های دیگری به‌عنوان دارایی خود.", "Tratar el tiempo, afecto o decisiones de otra persona como propiedad.")),
      shortcoming(text("Undermining", "تضعیف دیگران", "Desacreditar"), text("Minimizing or attacking another person’s success to reduce personal discomfort.", "کوچک کردن یا حمله به موفقیت دیگری برای کاهش ناراحتی خود.", "Minimizar o atacar el éxito ajeno para reducir el propio malestar.")),
    ],
    principleIds: ["gratitude", "acceptance", "respect", "hope"],
    recoveryPath: [text("Name the unmet need beneath the comparison.", "نیاز برآورده‌نشده زیر مقایسه را نام ببرید.", "Nombra la necesidad no satisfecha debajo de la comparación."), text("Practice gratitude for what is already present without denying desire.", "بدون انکار خواسته، برای آنچه اکنون وجود دارد قدردانی کنید.", "Practica gratitud por lo presente sin negar el deseo."), text("Let another person’s good fortune exist without treating it as your loss.", "اجازه دهید خوشبختی دیگری وجود داشته باشد بدون اینکه آن را زیان خود بدانید.", "Permite que la buena fortuna ajena exista sin tratarla como una pérdida propia.")],
  },
  {
    id: "irresponsibility",
    name: text("Irresponsibility", "بی‌مسئولیتی", "Irresponsabilidad"),
    definition: text("Avoiding ownership of commitments, choices, or consequences that legitimately belong to us.", "دوری از پذیرفتن تعهدها، انتخاب‌ها یا پیامدهایی که واقعاً مسئولیت ما هستند.", "Evitar asumir compromisos, decisiones o consecuencias que legítimamente nos corresponden."),
    shortcomings: [
      shortcoming(text("Blaming", "سرزنش", "Culpar"), text("Assigning all responsibility to others while ignoring personal choices.", "دادن تمام مسئولیت به دیگران و نادیده گرفتن انتخاب‌های خود.", "Asignar toda la responsabilidad a otros ignorando las decisiones propias.")),
      shortcoming(text("Excuses", "بهانه‌تراشی", "Excusas"), text("Using explanations to avoid repair, learning, or changed behavior.", "استفاده از توضیح برای دوری از جبران، یادگیری یا تغییر رفتار.", "Usar explicaciones para evitar reparación, aprendizaje o cambio de conducta.")),
      shortcoming(text("Broken commitments", "تعهدهای انجام‌نشده", "Compromisos incumplidos"), text("Repeatedly failing to follow through without honest communication.", "عمل نکردن مکرر به قول بدون ارتباط صادقانه.", "No cumplir repetidamente sin comunicación honesta.")),
    ],
    principleIds: ["responsibility", "accountability", "self-discipline", "integrity"],
    recoveryPath: [text("State your part plainly and without qualification.", "سهم خود را روشن و بدون شرط بیان کنید.", "Expresa tu parte con claridad y sin condiciones."), text("Repair what can be repaired and communicate what cannot be completed.", "آنچه قابل جبران است جبران کنید و درباره آنچه انجام نمی‌شود اطلاع دهید.", "Repara lo reparable y comunica lo que no puede completarse."), text("Use small, reliable commitments to rebuild trust.", "با تعهدهای کوچک و قابل اعتماد، اعتماد را بازسازی کنید.", "Usa compromisos pequeños y confiables para reconstruir la confianza.")],
  },
  {
    id: "perfectionism",
    name: text("Perfectionism", "کمال‌گرایی", "Perfeccionismo"),
    definition: text("Demanding error-free performance or certainty and tying worth to an impossible standard.", "خواستن عملکرد بی‌نقص یا قطعیت و گره زدن ارزش خود به معیاری ناممکن.", "Exigir desempeño sin errores o certeza y vincular el valor personal a un estándar imposible."),
    shortcomings: [
      shortcoming(text("Procrastination", "اهمال‌کاری", "Procrastinación"), text("Delaying action because an imperfect attempt feels unacceptable.", "به تأخیر انداختن اقدام چون تلاش ناقص غیرقابل قبول به نظر می‌رسد.", "Retrasar la acción porque un intento imperfecto parece inaceptable.")),
      shortcoming(text("Harsh self-criticism", "خودانتقادی شدید", "Autocrítica severa"), text("Treating mistakes as proof of personal failure rather than information for learning.", "دیدن اشتباه به‌عنوان اثبات شکست شخصی به جای اطلاعاتی برای یادگیری.", "Tratar los errores como prueba de fracaso personal y no como información para aprender.")),
      shortcoming(text("Criticism of others", "انتقاد از دیگران", "Crítica hacia otros"), text("Holding others to rigid standards that leave little room for humanity or growth.", "سنجیدن دیگران با معیارهای سخت که جایی برای انسانیت یا رشد باقی نمی‌گذارد.", "Someter a otros a estándares rígidos que dejan poco espacio para humanidad o crecimiento.")),
    ],
    principleIds: ["acceptance", "humility", "compassion", "perseverance"],
    recoveryPath: [text("Define what is sufficient and complete the next version.", "مشخص کنید چه چیزی کافی است و نسخه بعدی را کامل کنید.", "Define lo que es suficiente y completa la siguiente versión."), text("Treat mistakes as specific information, not identity.", "اشتباه را اطلاعاتی مشخص بدانید نه هویت خود.", "Trata los errores como información específica, no como identidad."), text("Practice progress through repeated imperfect action.", "پیشرفت را با اقدامات ناقص اما تکرارشونده تمرین کنید.", "Practica el progreso mediante acciones imperfectas y repetidas.")],
  },
  {
    id: "isolation",
    name: text("Isolation", "انزوا", "Aislamiento"),
    definition: text("Withdrawing from safe connection and support in ways that protect secrecy, fear, shame, or avoidance.", "کناره‌گیری از ارتباط و حمایت امن به شکلی که پنهان‌کاری، ترس، شرم یا اجتناب را حفظ می‌کند.", "Retirarse de conexiones y apoyo seguros de manera que protege el secreto, el miedo, la vergüenza o la evitación."),
    shortcomings: [
      shortcoming(text("Withholding", "پنهان‌کاری", "Ocultamiento"), text("Keeping important struggles secret from people who could safely help.", "پنهان نگه داشتن دشواری‌های مهم از کسانی که می‌توانند به‌طور امن کمک کنند.", "Mantener dificultades importantes en secreto ante personas que podrían ayudar de forma segura.")),
      shortcoming(text("Refusing support", "رد حمایت", "Rechazo de apoyo"), text("Automatically declining care because dependence or vulnerability feels threatening.", "رد خودکار مراقبت چون وابستگی یا آسیب‌پذیری تهدیدکننده به نظر می‌رسد.", "Rechazar automáticamente el cuidado porque la dependencia o vulnerabilidad parecen amenazantes.")),
      shortcoming(text("Emotional withdrawal", "کناره‌گیری عاطفی", "Retirada emocional"), text("Becoming unavailable rather than communicating a need for space or safety.", "در دسترس نبودن به جای بیان نیاز به فاصله یا ایمنی.", "Volverse inaccesible en vez de comunicar la necesidad de espacio o seguridad.")),
    ],
    principleIds: ["willingness", "courage", "honesty", "service"],
    recoveryPath: [text("Identify one person or group that has earned reasonable trust.", "یک فرد یا گروه را که اعتماد منطقی شما را به دست آورده مشخص کنید.", "Identifica una persona o grupo que haya ganado una confianza razonable."), text("Share one truthful piece rather than the whole story at once.", "به جای گفتن همه چیز یکباره، یک بخش صادقانه را در میان بگذارید.", "Comparte una parte sincera en vez de toda la historia de una vez."), text("Stay connected while using clear boundaries for safety.", "با حفظ مرزهای روشن برای ایمنی، در ارتباط بمانید.", "Mantente conectado usando límites claros para la seguridad.")],
  },
  {
    id: "people-pleasing",
    name: text("People-pleasing", "راضی نگه داشتن دیگران", "Complacer a los demás"),
    definition: text("Abandoning honest needs, limits, or values to gain approval, prevent conflict, or manage another person’s feelings.", "کنار گذاشتن نیازها، مرزها یا ارزش‌های صادقانه برای گرفتن تأیید، جلوگیری از تعارض یا مدیریت احساسات دیگری.", "Abandonar necesidades, límites o valores honestos para obtener aprobación, evitar conflicto o manejar los sentimientos ajenos."),
    shortcomings: [
      shortcoming(text("False agreement", "موافقت غیرصادقانه", "Acuerdo falso"), text("Saying yes or pretending to agree when the truthful answer is different.", "بله گفتن یا وانمود به موافقت وقتی پاسخ واقعی متفاوت است.", "Decir sí o fingir acuerdo cuando la respuesta sincera es diferente.")),
      shortcoming(text("Weak boundaries", "مرزهای ضعیف", "Límites débiles"), text("Accepting demands that create harm, exhaustion, or resentment.", "پذیرفتن خواسته‌هایی که آسیب، خستگی یا رنجش ایجاد می‌کنند.", "Aceptar exigencias que generan daño, agotamiento o resentimiento.")),
      shortcoming(text("Resentful caretaking", "مراقبت همراه با رنجش", "Cuidado resentido"), text("Giving beyond capacity and then silently blaming others for accepting it.", "بخشیدن فراتر از توان و سپس در سکوت سرزنش دیگران برای پذیرفتن آن.", "Dar más allá de la capacidad y luego culpar en silencio a otros por aceptarlo.")),
    ],
    principleIds: ["honesty", "boundaries", "courage", "respect"],
    recoveryPath: [text("Pause before agreeing and check your honest capacity.", "پیش از موافقت مکث کنید و توان واقعی خود را بسنجید.", "Haz una pausa antes de aceptar y revisa tu capacidad real."), text("Use a clear, respectful yes or no without excessive explanation.", "یک بله یا نه روشن و محترمانه بدون توضیح بیش از حد به کار ببرید.", "Usa un sí o no claro y respetuoso sin explicaciones excesivas."), text("Allow others to have feelings without making those feelings your responsibility.", "اجازه دهید دیگران احساسات خود را داشته باشند بدون اینکه آن را مسئولیت خود بدانید.", "Permite que otros tengan sentimientos sin convertirlos en tu responsabilidad.")],
  },
];
