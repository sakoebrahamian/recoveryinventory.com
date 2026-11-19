import { languageRoutes } from "./languages";

import { expandLocalizedRecord } from "@/lib/localization";
import type { Language } from "./inventory";

export const aboutLanguageRoutes = languageRoutes("/about");

type AboutCopy = {
  eyebrow: string;
  title: string;
  description: string;
  byline: string;
  anonymity: string;
  paragraphs: string[];
  excerpt: string;
  storyLink: string;
  demoLabel: string;
  contactHeading: string;
  contactText: string;
  contactLabel: string;
  languageLabel: string;
};

export const aboutCopy: Record<Language, AboutCopy> = expandLocalizedRecord({
  en: {
    eyebrow: "From the creator",
    title: "Why I created Recovery Inventory",
    description: "A personal story of step work, sponsor guidance, and learning to see patterns over time.",
    byline: "Paul · 18 years sober",
    anonymity: "Paul is a pseudonym used to respect the creator’s anonymity. This is his personal recovery experience.",
    paragraphs: [
      "I’m Paul—a pseudonym I use to respect my anonymity—and I’m 18 years sober.",
      "During my second year of sobriety, working the Steps with my sponsor helped me begin recognizing my own behavioral patterns. Through my Fourth Step, I saw behaviors and character defects I had blamed on other people. I had been in denial about my own part.",
      "When I reached Step 10, journaling became a way to reflect on my daily life. Writing in a notepad helped, but seeing patterns across my entries took more effort. I wanted a clearer picture of what kept repeating.",
      "That led me to develop a visual way to review my inventories. Over the years, seeing those patterns helped me recognize where I needed attention and bring more specific observations to my work with my sponsor.",
      "Today, after 18 years of sobriety and continued step work, my life is better. I’m better able to show up as a husband, father, grandfather, friend, and human being.",
      "I created Recovery Inventory to make this approach available to others: a place to journal, complete personal inventories, review patterns, and share reflections with a sponsor or someone experienced in recovery.",
      "My hope is that these tools help others understand themselves more clearly and support their own recovery, one day at a time.",
    ],
    excerpt: "Created by Paul (a pseudonym), 18 years sober, from his experience with step work, journaling, and sponsor guidance.",
    storyLink: "Read why I built Recovery Inventory",
    demoLabel: "Explore the free demo",
    contactHeading: "Questions about Recovery Inventory?",
    contactText: "Contact the site’s support address with questions about the journal or the tools.",
    contactLabel: "Email Recovery Inventory",
    languageLabel: "Read this story in",
  },
  es: {
    eyebrow: "De su creador",
    title: "Por qué creé Recovery Inventory",
    description: "Una historia personal sobre trabajar los Pasos, recibir acompañamiento y aprender a reconocer patrones con el tiempo.",
    byline: "Paul · 18 años de sobriedad",
    anonymity: "Paul es un seudónimo que respeta el anonimato del creador. Esta es su experiencia personal de recuperación.",
    paragraphs: [
      "Soy Paul, un seudónimo que uso para respetar mi anonimato, y llevo 18 años sobrio.",
      "Durante mi segundo año de sobriedad, trabajar los Pasos con el apoyo de mi padrino o madrina me ayudó a reconocer mis propios patrones de conducta. Al trabajar el Cuarto Paso, vi conductas y defectos de carácter por los que había culpado a otras personas. Había estado negando mi propia parte.",
      "Al llegar al Paso 10, escribir un diario se convirtió en una forma de reflexionar sobre mi vida cotidiana. Escribir en una libreta me ayudaba, pero reconocer patrones entre mis entradas requería más esfuerzo. Quería ver con mayor claridad lo que se repetía.",
      "Eso me llevó a desarrollar una forma visual de revisar mis inventarios. Con los años, ver esos patrones me ayudó a reconocer lo que necesitaba atención y a llevar observaciones más concretas a mis conversaciones de apadrinamiento.",
      "Hoy, después de 18 años de sobriedad y de seguir trabajando los Pasos, mi vida es mejor. Puedo estar más presente como esposo, padre, abuelo, amigo y ser humano.",
      "Creé Recovery Inventory para poner este enfoque al alcance de otras personas: un lugar para escribir un diario, completar inventarios personales, revisar patrones y compartir reflexiones con un padrino, una madrina o alguien con experiencia en recuperación.",
      "Espero que estas herramientas ayuden a otras personas a comprenderse mejor y a apoyar su propia recuperación, un día a la vez.",
    ],
    excerpt: "Creado por Paul (un seudónimo), con 18 años de sobriedad, a partir de su experiencia con los Pasos, la escritura y el apadrinamiento.",
    storyLink: "Lee por qué creé Recovery Inventory",
    demoLabel: "Explorar la demostración gratuita",
    contactHeading: "¿Tienes preguntas sobre Recovery Inventory?",
    contactText: "Escribe a la dirección de soporte del sitio si tienes preguntas sobre el diario o las herramientas.",
    contactLabel: "Enviar un correo a Recovery Inventory",
    languageLabel: "Lee esta historia en",
  },
  fa: {
    eyebrow: "از زبان سازنده",
    title: "چرا Recovery Inventory را ساختم",
    description: "روایتی شخصی از کار کردن قدم‌ها، همراهی راهنما و یاد گرفتن دیدن الگوها در گذر زمان.",
    byline: "پل · ۱۸ سال پاکی",
    anonymity: "«پل» نامی مستعار برای حفظ گمنامی سازنده است. این روایت، تجربه شخصی او در بهبودی است.",
    paragraphs: [
      "من پل هستم؛ برای حفظ گمنامی‌ام از این نام مستعار استفاده می‌کنم و ۱۸ سال است که پاک هستم.",
      "در دومین سال پاکی، کار کردن قدم‌ها با راهنمایم کمک کرد الگوهای رفتاری خودم را بشناسم. در قدم چهارم، رفتارها و نواقص شخصیتی‌ای را دیدم که دیگران را بابتشان مقصر می‌دانستم. نقش خودم را انکار کرده بودم.",
      "وقتی به قدم دهم رسیدم، روزانه‌نویسی راهی برای مرور زندگی روزمره‌ام شد. نوشتن در دفتر کمکم می‌کرد، اما دیدن الگوها در میان نوشته‌ها به تلاش بیشتری نیاز داشت. می‌خواستم تصویر روشن‌تری از چیزهایی داشته باشم که تکرار می‌شدند.",
      "همین موضوع باعث شد روشی تصویری برای مرور ترازنامه‌هایم بسازم. در طول سال‌ها، دیدن این الگوها کمک کرد بفهمم چه چیزهایی به توجه نیاز دارند و با مشاهدات مشخص‌تری با راهنمایم کار کنم.",
      "امروز، پس از ۱۸ سال پاکی و ادامه کار کردن قدم‌ها، زندگی‌ام بهتر شده است. بهتر می‌توانم در نقش همسر، پدر، پدربزرگ، دوست و یک انسان حضور داشته باشم.",
      "Recovery Inventory را ساختم تا این روش در دسترس دیگران هم باشد: جایی برای روزانه‌نویسی، نوشتن ترازنامه‌های شخصی، مرور الگوها و به اشتراک گذاشتن تأملات با راهنما یا فردی باتجربه در بهبودی.",
      "امیدوارم این ابزارها به دیگران کمک کنند خودشان را روشن‌تر بشناسند و از مسیر بهبودی‌شان حمایت کنند؛ فقط برای امروز.",
    ],
    excerpt: "ساخته پل (نام مستعار)، با ۱۸ سال پاکی، بر پایه تجربه‌اش از کار کردن قدم‌ها، روزانه‌نویسی و همراهی راهنما.",
    storyLink: "بخوانید چرا Recovery Inventory را ساختم",
    demoLabel: "مشاهده نسخه آزمایشی رایگان",
    contactHeading: "درباره Recovery Inventory پرسشی دارید؟",
    contactText: "پرسش‌های مربوط به دفتر و ابزارها را به ایمیل پشتیبانی وب‌سایت بفرستید.",
    contactLabel: "ارسال ایمیل به Recovery Inventory",
    languageLabel: "این داستان را به این زبان بخوانید",
  },
});
