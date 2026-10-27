type Translate = (english: string, farsi: string) => string;

export function sponsorGuidance(t: Translate) {
  return t(
    "Please share your Step 10 inventory and analytics with your sponsor or someone with time in recovery. Review your selections, written reflections, what is going well, and where you need help together. Ask them for direction on the next step. The site's suggested practices cannot replace their experience. Sharing is always your choice.",
    "لطفاً ترازنامه و تحلیل گام ۱۰ خود را با حامی یا فردی که سابقه بهبودی دارد در میان بگذارید. انتخاب‌ها، بازتاب‌های نوشته‌شده، جاهایی که خوب پیش می‌روید و جاهایی که به کمک نیاز دارید را با هم مرور کنید. برای گام بعد از او راهنمایی بخواهید. تمرین‌های پیشنهادی سایت جای تجربه او را نمی‌گیرد. اشتراک‌گذاری همیشه با انتخاب شما انجام می‌شود."
  );
}

export function originalFrameworkGuidance(t: Translate) {
  return t("The prompts, six workbook sections, and 24 principles are Recovery Inventory’s own reflection framework. Use these tools alongside meetings, sponsorship, and your fellowship’s literature and guidance.", "پرسش‌ها، شش بخش دفتر کار و ۲۴ اصل، چارچوب تأمل اختصاصی Recovery Inventory هستند. از این ابزارها در کنار جلسات، راهنمایی حامی و منابع و راهنمایی انجمن خود استفاده کنید.");
}

export function step10PracticeGuidance(t: Translate) {
  return t("Use this journal for a daily review, and continue noticing your actions throughout the day. Acknowledge mistakes promptly and seek guidance about appropriate repair.", "از این دفتر برای مرور روزانه استفاده کنید و در طول روز نیز به رفتارهای خود توجه داشته باشید. اشتباه‌ها را به‌موقع بپذیرید و درباره جبران مناسب راهنمایی بخواهید.");
}

export function step4WorkbookGuidance(t: Translate) {
  return t("“Writing complete” records this workbook’s writing status. Review your work with your sponsor and follow your fellowship’s guidance when working Step 4.", "«نوشتن تکمیل شد» وضعیت نوشته‌های این دفتر را ثبت می‌کند. هنگام کار روی گام چهارم، نوشته‌ها را با حامی خود مرور کنید و از راهنمایی انجمن خود پیروی کنید.");
}

export function subscriptionGuidance(t: Translate) {
  return t("The subscription pays for Recovery Inventory’s digital tools. It is separate from membership in any recovery fellowship.", "هزینه اشتراک برای ابزارهای دیجیتال Recovery Inventory است و از عضویت در هر انجمن بهبودی جداست.");
}
