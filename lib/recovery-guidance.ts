type Translate = (english: string, farsi: string) => string;

export function sponsorGuidance(t: Translate) {
  return t(
    "Please share your Step 10 inventory and analytics with your sponsor or someone with time in recovery. Review what is going well and where you need help together, and ask them for direction on the next step. This website only summarizes your selections; it cannot replace their experience. Sharing is always your choice.",
    "لطفاً ترازنامه و تحلیل گام ۱۰ خود را با حامی یا فردی که سابقه بهبودی دارد در میان بگذارید. با هم بررسی کنید کجا خوب پیش می‌روید و کجا به کمک نیاز دارید و برای گام بعد از او راهنمایی بخواهید. این وب‌سایت فقط انتخاب‌های شما را خلاصه می‌کند و جای تجربه او را نمی‌گیرد. اشتراک‌گذاری همیشه با انتخاب شما انجام می‌شود."
  );
}
