import { localizedText } from "./localization";
import { step10Questions, step4Types, type Language } from "./inventory";
import { reflectionChoiceText, reflectionText } from "./reflection-copy";
import { reflectionChoices } from "./reflection-journals";

export const inventoryGuideSteps = ["step4", "step10", "step67", "step89"] as const;
export type InventoryGuideStep = (typeof inventoryGuideSteps)[number];
export const inventoryGuideStepNames: Record<InventoryGuideStep, string> = {
  step4: "Step 4", step10: "Step 10", step67: "Steps 6 and 7", step89: "Steps 8 and 9",
};
export type InventoryGuideMessage = { role: "member" | "guide"; text: string };

export const inventoryGuideNoteLimit = 600;
export const inventoryGuideReplyLimit = 1200;
export const inventoryGuideHistoryLimit = 4;
export const inventoryGuideDailyMemberLimit = 50;
export const inventoryGuideMonthlySiteLimit = 5000;

export function inventoryGuideAllowance(language: Language) {
  const number = new Intl.NumberFormat(language);
  return reflectionText(language, "guideAllowance")
    .replace("{daily}", number.format(inventoryGuideDailyMemberLimit))
    .replace("{monthly}", number.format(inventoryGuideMonthlySiteLimit));
}

const step4Start = {
  id: "get-started", en: "Getting started", es: "Primeros pasos", fa: "شروع ترازنامه",
};
const step10Start = {
  id: "review-day", en: "Reviewing my day", es: "Repasar mi día", fa: "مرور روز من",
};

export function inventoryGuideTopics(step: InventoryGuideStep, language: Language) {
  const start = { id: step4Start.id, label: localizedText(step4Start, language) };
  if (step === "step67") {
    return [start, ...(["pattern", "readiness", "support", "principle"] as const).map((id) => ({
      id, label: reflectionText(language, id),
    }))];
  }
  if (step === "step89") {
    return [start, ...reflectionChoices.focus.map((id) => ({ id, label: reflectionChoiceText(language, "focus", id) }))];
  }
  const topics = step === "step4" ? [step4Start, ...step4Types] : [step10Start, ...step10Questions];
  return topics.map((topic) => ({ id: topic.id, label: localizedText(topic, language) }));
}
