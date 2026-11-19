import type { Language } from "./inventory";

export const memberFeedbackIds = ["francis", "nancy", "redDot", "lucy"] as const;
export type MemberFeedbackId = (typeof memberFeedbackIds)[number];

type MemberFeedback = {
  name: string;
  feature: Record<Language, string>;
  quote: Record<Language, string>;
};

// English excerpts and display names were supplied with publication permission
// by the site owner on 2026-11-19. Other languages are labeled translations.
export const memberFeedback: Record<MemberFeedbackId, MemberFeedback> = {
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
      en: "Being able to look back over a few weeks and actually see patterns in my behavior and reactions has given me a much clearer perspective than just looking at a single day on its own.",
      es: "Poder revisar varias semanas y ver patrones en mi conducta y mis reacciones me ha dado una perspectiva mucho más clara que mirar un solo día de forma aislada.",
      fa: "اینکه می‌توانم چند هفته گذشته را مرور کنم و الگوهای رفتار و واکنش‌هایم را ببینم، در مقایسه با نگاه کردن به یک روز به‌تنهایی، دید بسیار روشن‌تری به من داده است.",
    },
  },
  redDot: {
    name: "Red Dot",
    feature: { en: "Sharing with a sponsor", es: "Compartir con mi padrino o madrina", fa: "اشتراک‌گذاری با راهنما" },
    quote: {
      en: "It makes the whole process of getting my entries over to my sponsor seamless, which keeps me much more consistent and accountable with writing things down regularly.",
      es: "Facilita mucho compartir mis entradas con mi padrino o madrina, lo que me ayuda a escribir con mucha más constancia y responsabilidad.",
      fa: "فرستادن نوشته‌هایم برای راهنمایم را بسیار آسان می‌کند و کمک می‌کند منظم‌تر بنویسم و در قبال نوشتن مسئولیت‌پذیرتر باشم.",
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
    description: "Four early users shared their experience. These excerpts are shared with permission, using each person’s chosen display name.",
    translationNote: "Translated from English",
  },
  es: {
    eyebrow: "Comentarios de los primeros usuarios",
    title: "Lo que los usuarios encuentran útil.",
    description: "Cuatro de los primeros usuarios compartieron su experiencia. Estos fragmentos se publican con su permiso y con el nombre que cada persona eligió mostrar.",
    translationNote: "Traducción del inglés",
  },
  fa: {
    eyebrow: "بازخورد کاربران اولیه",
    title: "چه چیزهایی برای کاربران مفید بوده است؟",
    description: "چهار نفر از کاربران اولیه تجربه‌شان را در میان گذاشته‌اند. این بخش‌ها با اجازه آن‌ها و با نام نمایشی انتخابی هر فرد منتشر می‌شوند.",
    translationNote: "ترجمه از انگلیسی",
  },
};
