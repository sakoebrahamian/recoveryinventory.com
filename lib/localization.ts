import { spanishTranslations } from "./translations-es";
import { addedLanguages, type Language, type OriginalLanguage } from "./languages";

export type TranslationDictionary = Record<string, string>;
const dictionaries: Partial<Record<Language, TranslationDictionary>> = { es: spanishTranslations };
const pending: Partial<Record<Language, Promise<TranslationDictionary>>> = {};

export function installTranslations(language: Language, dictionary: TranslationDictionary) {
  dictionaries[language] = dictionary;
}
export async function loadTranslations(language: Language): Promise<TranslationDictionary> {
  if (dictionaries[language]) return dictionaries[language]!;
  if (language === "en" || language === "fa") return {};
  // Explicit imports create a separate, cacheable bundle for each chosen language.
  const loaders = {
    fr: () => import("./locales/fr.json"), "pt-BR": () => import("./locales/pt-BR.json"),
    ar: () => import("./locales/ar.json"), de: () => import("./locales/de.json"),
    hy: () => import("./locales/hy.json"), it: () => import("./locales/it.json"), el: () => import("./locales/el.json"),
  };
  const loader = loaders[language as keyof typeof loaders];
  pending[language] ??= loader().then((module) => {
    installTranslations(language, module.default);
    return module.default;
  }).catch((error) => { delete pending[language]; throw error; });
  return pending[language]!;
}
export function translateForLanguage(language: Language, english: string, farsi = english): string {
  if (language === "fa") return farsi;
  return dictionaries[language]?.[english] ?? english;
}
/** Original approved Spanish/Farsi text remains authoritative; new locales use English source keys. */
export function localizedText(value: { en: string; es: string; fa: string }, language: Language): string {
  return language === "en" || language === "es" || language === "fa" ? value[language] : translateForLanguage(language, value.en);
}
function translateContent<T>(value: T, language: Language): T {
  if (typeof value === "string") return translateForLanguage(language, value) as T;
  if (Array.isArray(value)) return value.map((item) => translateContent(item, language)) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, translateContent(item, language)])) as T;
  return value;
}
/** Getters defer translation until the selected dictionary has loaded. No user writing passes here. */
export function expandLocalizedRecord<T>(original: Record<OriginalLanguage, T>): Record<Language, T> {
  const result = { ...original } as Record<Language, T>;
  for (const language of addedLanguages) Object.defineProperty(result, language, {
    enumerable: true, get: () => translateContent(original.en, language),
  });
  return result;
}
