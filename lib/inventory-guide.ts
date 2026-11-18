import { step10Questions, step4Types, type Language } from "./inventory";

export type InventoryGuideStep = "step4" | "step10";
export type InventoryGuideMessage = { role: "member" | "guide"; text: string };

export const inventoryGuideNoteLimit = 600;
export const inventoryGuideReplyLimit = 1200;
export const inventoryGuideHistoryLimit = 4;

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
