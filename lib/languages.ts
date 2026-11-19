/** Stable BCP 47 identifiers are shared by accounts, AI, reports and public URLs. */
export const languages = ["en", "es", "fa", "fr", "pt-BR", "ar", "de", "hy", "it", "el"] as const;
export type Language = (typeof languages)[number];
export type OriginalLanguage = "en" | "es" | "fa";
export const addedLanguages = ["fr", "pt-BR", "ar", "de", "hy", "it", "el"] as const;

export const languageNames: Record<Language, string> = {
  en: "English", es: "Español", fa: "فارسی", fr: "Français", "pt-BR": "Português (Brasil)",
  ar: "العربية", de: "Deutsch", hy: "Հայերեն", it: "Italiano", el: "Ελληνικά",
};
export const replyLanguageNames: Record<Language, string> = {
  en: "English", es: "Spanish", fa: "Persian (Farsi)", fr: "French", "pt-BR": "Brazilian Portuguese",
  ar: "Modern Standard Arabic", de: "German", hy: "Eastern Armenian", it: "Italian", el: "Greek",
};
export function supportedLanguage(value: unknown): Language | null {
  if (typeof value !== "string") return null;
  return languages.find((language) => language.toLowerCase() === value.toLowerCase()) ?? null;
}
export function isRtlLanguage(language: Language) { return language === "fa" || language === "ar"; }
export function languageLocale(language: Language, gregorian = false): string {
  if (language === "fa") return gregorian ? "fa-IR-u-ca-gregory" : "fa-IR";
  if (language === "ar") return "ar-EG-u-ca-gregory";
  return ({ en: "en-US", es: "es-US", fr: "fr-FR", "pt-BR": "pt-BR", de: "de-DE", hy: "hy-AM", it: "it-IT", el: "el-GR" } as const)[language];
}
export function localizedPath(language: Language, path: string): `/${string}` {
  return (language === "en" ? path : `/${language.toLowerCase()}${path}`) as `/${string}`;
}
export function languageRoutes(path: string): Record<Language, `/${string}`> {
  return Object.fromEntries(languages.map((language) => [language, localizedPath(language, path)])) as Record<Language, `/${string}`>;
}

/** Some browsers ship no Armenian ICU data. Keep calendar/report labels Armenian there too. */
export function dateTimeFormat(locale: string, options: Intl.DateTimeFormatOptions) {
  const native = new Intl.DateTimeFormat(locale, options);
  if (!locale.startsWith("hy") || native.resolvedOptions().locale.startsWith("hy")) return native;
  const months = ["հունվար", "փետրվար", "մարտ", "ապրիլ", "մայիս", "հունիս", "հուլիս", "օգոստոս", "սեպտեմբեր", "հոկտեմբեր", "նոյեմբեր", "դեկտեմբեր"];
  const englishMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekdays = ["կիրակի", "երկուշաբթի", "երեքշաբթի", "չորեքշաբթի", "հինգշաբթի", "ուրբաթ", "շաբաթ"];
  const englishWeekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const shortDays = ["Կիր", "Երկ", "Երք", "Չրք", "Հնգ", "Ուրբ", "Շբթ"];
  const fallback = new Intl.DateTimeFormat("en-US", {
    ...options,
    ...(options.weekday ? { weekday: "long" as const } : {}),
    ...(options.month && ["short", "long", "narrow"].includes(options.month) ? { month: "long" as const } : {}),
    ...((options.hour || options.timeStyle) && options.hour12 === undefined ? { hour12: false } : {}),
  });
  const formatToParts = (date?: Date | number) => fallback.formatToParts(date).map(part => {
    if (part.type === "month") {
      const index = englishMonths.findIndex(month => month.startsWith(part.value));
      if (index >= 0) return { ...part, value: options.month === "narrow" ? months[index][0] : options.month === "short" || options.dateStyle === "medium" ? months[index].slice(0, 3) : months[index] };
    }
    if (part.type === "weekday") {
      const index = englishWeekdays.indexOf(part.value);
      if (index >= 0) return { ...part, value: options.weekday === "long" || options.dateStyle === "full" ? weekdays[index] : shortDays[index] };
    }
    return part;
  });
  return { formatToParts, format: (date?: Date | number) => formatToParts(date).map(part => part.value).join("") };
}
