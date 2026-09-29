type Translate = (english: string, farsi: string) => string;

const farsiMessages: Record<string, string> = {
  "Choose an alias between 2 and 40 characters.": "یک نام مستعار بین ۲ تا ۴۰ نویسه انتخاب کنید.",
  "Choose a username between 3 and 32 characters.": "یک نام کاربری بین ۳ تا ۳۲ نویسه انتخاب کنید.",
  "Use printable characters for your username.": "برای نام کاربری از نویسه‌های قابل نمایش استفاده کنید.",
  "Choose a different username.": "یک نام کاربری دیگر انتخاب کنید.",
  "Enter a password.": "رمز عبور را وارد کنید.",
  "Use at least 10 characters for your password.": "برای رمز عبور حداقل از ۱۰ نویسه استفاده کنید.",
  "Use 128 characters or fewer for your password.": "برای رمز عبور از ۱۲۸ نویسه یا کمتر استفاده کنید.",
  "Choose a less common password that is different from your username, name, and email.": "رمز عبوری کمتر رایج و متفاوت از نام کاربری، نام و ایمیل خود انتخاب کنید.",
  "That username is already in use. Choose another one.": "این نام کاربری قبلاً استفاده شده است. نام دیگری انتخاب کنید.",
  "Username or password was not recognized. After repeated attempts, wait 15 minutes and try again.": "نام کاربری یا رمز عبور شناخته نشد. پس از تلاش‌های تکراری، ۱۵ دقیقه صبر کنید و دوباره تلاش کنید.",
  "Enter a password with at least 10 characters.": "رمزی با حداقل ۱۰ نویسه وارد کنید.",
  "Your current password was not recognized.": "رمز عبور فعلی شما شناخته نشد.",
};

export function translatePasswordError(
  t: Translate,
  error: string | undefined,
  fallbackEnglish: string,
  fallbackFarsi: string,
): string {
  const english = error || fallbackEnglish;
  return t(english, farsiMessages[english] ?? fallbackFarsi);
}
