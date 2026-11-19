import type { Language } from "./inventory";

export const memberFeedbackIds = ["nancy", "redDot", "benAddict", "soberDan", "francis", "lucy"] as const;
export type MemberFeedbackId = (typeof memberFeedbackIds)[number];

type MemberFeedback = {
  name: string;
  feature: Record<Language, string>;
  quote: Record<Language, string>;
  pricingQuote?: Record<Language, string>;
};

// English excerpts and display names were supplied with publication permission
// by the site owner on 2026-11-19. Other languages are labeled translations.
export const memberFeedback: Record<MemberFeedbackId, MemberFeedback> = {
  benAddict: {
    name: "Ben Addict",
    feature: { en: "Patterns and group conversations", es: "Patrones y conversaciones en el grupo", fa: "الگوها و گفت‌وگو در گروه" },
    quote: {
      en: "It gives me exactly what I need to spot my patterns, which makes it much easier to walk into my group meetings and talk about my progress and successes.",
      es: "Me da justo lo que necesito para reconocer mis patrones, lo que me facilita mucho llegar a las reuniones de mi grupo y hablar de mis avances y logros.",
      fa: "دقیقاً همان چیزی را که برای دیدن الگوهایم نیاز دارم در اختیارم می‌گذارد و باعث می‌شود خیلی راحت‌تر وارد جلسات گروهم شوم و درباره پیشرفت‌ها و موفقیت‌هایم صحبت کنم.",
    },
  },
  soberDan: {
    name: "Sober Dan",
    feature: { en: "Step 10 and AI guidance", es: "Paso 10 y guía con IA", fa: "گام ۱۰ و راهنمای هوش مصنوعی" },
    quote: {
      en: "I really appreciate how straightforward and uncomplicated the Step 10 journal is to use. On top of that, having the AI option has been a big help when I’m trying to figure out what to really answer for each defect—it takes the guesswork out of digging a little deeper into my entries.",
      es: "Valoro mucho lo sencillo y directo que es usar el diario del Paso 10. Además, la opción de IA me ha ayudado mucho a decidir qué responder realmente sobre cada defecto; me ayuda a profundizar un poco más en mis entradas sin tener que adivinar por dónde empezar.",
      fa: "از اینکه استفاده از دفتر گام ۱۰ این‌قدر ساده و بی‌پیچیدگی است خیلی راضی‌ام. علاوه بر آن، گزینه هوش مصنوعی وقتی می‌خواهم بفهمم واقعاً درباره هر نقص چه پاسخی بدهم خیلی کمکم کرده و کمک می‌کند بدون سردرگمی کمی عمیق‌تر به نوشته‌هایم نگاه کنم.",
    },
  },
  francis: {
    name: "Francis",
    feature: { en: "Private journaling", es: "Diario privado", fa: "روزانه‌نویسی خصوصی" },
    quote: {
      en: "I just started using the site, so I’m still exploring and getting the hang of everything, but so far it has been really helpful. Having a clean, private space dedicated specifically to doing my inventory makes it a lot easier to sit down and get my thoughts out without feeling overwhelmed.",
      es: "Acabo de empezar a usar el sitio, así que todavía estoy explorando y aprendiendo cómo funciona todo, pero hasta ahora me ha resultado muy útil. Tener un espacio claro y privado dedicado específicamente a hacer mi inventario me facilita mucho sentarme y expresar lo que pienso sin sentir que todo me supera.",
      fa: "تازه استفاده از سایت را شروع کرده‌ام و هنوز در حال آشنا شدن با بخش‌های مختلف آن هستم، اما تا اینجا خیلی مفید بوده است. داشتن فضایی مرتب و خصوصی که مخصوص نوشتن ترازنامه‌ام باشد، کمک می‌کند راحت‌تر بنشینم و افکارم را بدون احساس فشار و آشفتگی بنویسم.",
    },
  },
  nancy: {
    name: "Nancy",
    feature: { en: "Analytics", es: "Análisis de patrones", fa: "تحلیل الگوها" },
    quote: {
      en: "I’ve been using the site for about a month now, and the Analytics feature has been by far the most helpful part for me. Being able to look back over a few weeks and actually see patterns in my behavior and reactions has given me a much clearer perspective than just looking at a single day on its own.",
      es: "Llevo aproximadamente un mes usando el sitio y la función de análisis ha sido, con diferencia, lo más útil para mí. Poder revisar varias semanas y ver patrones en mi conducta y mis reacciones me ha dado una perspectiva mucho más clara que mirar un solo día de forma aislada.",
      fa: "حدود یک ماه است از سایت استفاده می‌کنم و بخش تحلیل، بیش از هر بخش دیگری برایم مفید بوده است. اینکه می‌توانم چند هفته گذشته را مرور کنم و الگوهای رفتار و واکنش‌هایم را ببینم، در مقایسه با نگاه کردن به یک روز به‌تنهایی، دید بسیار روشن‌تری به من داده است.",
    },
    pricingQuote: {
      en: "Being able to look back over a few weeks and actually see patterns in my behavior and reactions has given me a much clearer perspective than just looking at a single day on its own.",
      es: "Poder revisar varias semanas y ver patrones en mi conducta y mis reacciones me ha dado una perspectiva mucho más clara que mirar un solo día de forma aislada.",
      fa: "اینکه می‌توانم چند هفته گذشته را مرور کنم و الگوهای رفتار و واکنش‌هایم را ببینم، در مقایسه با نگاه کردن به یک روز به‌تنهایی، دید بسیار روشن‌تری به من داده است.",
    },
  },
  redDot: {
    name: "Red Dot",
    feature: { en: "Sharing with a sponsor", es: "Compartir con mi padrino o madrina", fa: "اشتراک‌گذاری با راهنما" },
    quote: {
      en: "I've been on the site for two weeks now, and the \"share with sponsor\" feature has been a huge help for my journaling. It makes the whole process of getting my entries over to my sponsor seamless, which keeps me much more consistent and accountable with writing things down regularly.",
      es: "Llevo dos semanas en el sitio y la función de compartir con mi padrino o madrina me ha ayudado mucho con el diario. Facilita mucho compartir mis entradas, lo que me ayuda a escribir con mucha más constancia y responsabilidad.",
      fa: "دو هفته است از سایت استفاده می‌کنم و قابلیت «اشتراک‌گذاری با راهنما» کمک بزرگی به روزانه‌نویسی‌ام کرده است. فرستادن نوشته‌هایم برای راهنمایم را بسیار آسان می‌کند و کمک می‌کند منظم‌تر بنویسم و در قبال نوشتن مسئولیت‌پذیرتر باشم.",
    },
  },
  lucy: {
    name: "Lucy",
    feature: { en: "AI Inventory Guide", es: "Guía de inventario con IA", fa: "راهنمای ترازنامه با هوش مصنوعی" },
    quote: {
      en: "Whenever I get stuck or have trouble deciding what to focus on in certain areas of my journaling, it helps me get past that mental block and figure out what to write.",
      es: "Cuando me atasco o no sé en qué centrarme en alguna parte de mi diario, me ayuda a superar ese bloqueo y a decidir qué escribir.",
      fa: "هر وقت گیر می‌کنم یا نمی‌دانم در بخشی از روزانه‌نویسی‌ام روی چه چیزی تمرکز کنم، کمکم می‌کند از آن بن‌بست ذهنی عبور کنم و بفهمم چه بنویسم.",
    },
  },
};

export const memberFeedbackCopy: Record<Language, {
  eyebrow: string;
  title: string;
  description: string;
  translationNote: string;
}> = {
  en: {
    eyebrow: "Early user feedback",
    title: "What people are finding useful.",
    description: "Six early users shared their experience. These excerpts are shared with permission, using each person’s chosen display name.",
    translationNote: "Translated from English",
  },
  es: {
    eyebrow: "Comentarios de los primeros usuarios",
    title: "Lo que los usuarios encuentran útil.",
    description: "Seis de los primeros usuarios compartieron su experiencia. Estos fragmentos se publican con su permiso y con el nombre que cada persona eligió mostrar.",
    translationNote: "Traducción del inglés",
  },
  fa: {
    eyebrow: "بازخورد کاربران اولیه",
    title: "چه چیزهایی برای کاربران مفید بوده است؟",
    description: "شش نفر از کاربران اولیه تجربه‌شان را در میان گذاشته‌اند. این بخش‌ها با اجازه آن‌ها و با نام نمایشی انتخابی هر فرد منتشر می‌شوند.",
    translationNote: "ترجمه از انگلیسی",
  },
};
