import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/recovery/language-provider";

export const metadata: Metadata = {
  title: {
    default: "Recovery Inventory",
    template: "%s | Recovery Inventory",
  },
  description:
    "Private Step 10 and Step 4 recovery inventories in English, Farsi, and Spanish, with anonymous or verified email access.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
