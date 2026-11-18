import { step10Questions, step4Types, type Language } from "./inventory";

export type InventoryGuideStep = "step4" | "step10";
export type InventoryGuideMessage = { role: "member" | "guide"; text: string };

export const inventoryGuideNoteLimit = 600;
export const inventoryGuideReplyLimit = 1200;
export const inventoryGuideHistoryLimit = 4;
export const inventoryGuideDailyMemberLimit = 50;
export const inventoryGuideMonthlySiteLimit = 5000;

export function inventoryGuideAllowance(language: Language, t: (english: string, farsi: string) => string) {
  const number = new Intl.NumberFormat(language);
  return t(
    "Each member can send up to {daily} AI requests per day across both steps, both guide modes, and all languages. The site has a shared limit of {monthly} requests per month.",
    "هر عضو می‌تواند در مجموعِ هر دو گام، هر دو حالت راهنما و همه زبان‌ها، روزانه تا {daily} درخواست به هوش مصنوعی بفرستد. سقف مشترک سایت برای همه اعضا {monthly} درخواست در ماه است.",
  ).replace("{daily}", number.format(inventoryGuideDailyMemberLimit)).replace("{monthly}", number.format(inventoryGuideMonthlySiteLimit));
}

const step4Start = {
  id: "get-started", en: "Getting started", es: "Primeros pasos", fa: "شروع ترازنامه",
};
const step10Start = {
  id: "review-day", en: "Reviewing my day", es: "Repasar mi día", fa: "مرور روز من",
};

export function inventoryGuideTopics(step: InventoryGuideStep, language: Language) {
  const topics = step === "step4" ? [step4Start, ...step4Types] : [step10Start, ...step10Questions];
  return topics.map((topic) => ({ id: topic.id, label: topic[language] }));
}
