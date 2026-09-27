type Translate = (english: string, farsi: string) => string;

export function sponsorGuidance(t: Translate) {
  return t(
    "Please share your Step 10 inventory and analytics with your sponsor or someone with time in recovery. Review your selections, written reflections, what is going well, and where you need help together. Ask them for direction on the next step. The site's suggested practices cannot replace their experience. Sharing is always your choice.",
    "لطفاً ترازنامه و تحلیل گام ۱۰ خود را با حامی یا فردی که سابقه بهبودی دارد در میان بگذارید. انتخاب‌ها، بازتاب‌های نوشته‌شده، جاهایی که خوب پیش می‌روید و جاهایی که به کمک نیاز دارید را با هم مرور کنید. برای گام بعد از او راهنمایی بخواهید. تمرین‌های پیشنهادی سایت جای تجربه او را نمی‌گیرد. اشتراک‌گذاری همیشه با انتخاب شما انجام می‌شود."
  );
}
