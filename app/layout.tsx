import type { Metadata } from "next";
import "./globals.css";
import "./journal-theme-art.css";
import { LanguageProvider } from "@/components/recovery/language-provider";
import { SiteAnalytics } from "@/components/recovery/site-analytics";
import { MarketingAnalyticsNotice } from "@/components/recovery/marketing-analytics-choices";
import { ThemeProvider } from "@/components/recovery/theme-provider";
import { journalThemeStyles, journalThemeBootstrap } from "@/lib/journal-themes";
import {
  createPublicPageMetadata,
  SITE_DESCRIPTION,
  SITE_HOME_TITLE,
  SITE_NAME,
  SITE_STRUCTURED_DATA,
  SITE_URL,
} from "@/lib/site-metadata";

export const metadata: Metadata = {
  ...createPublicPageMetadata({ title: SITE_HOME_TITLE, description: SITE_DESCRIPTION, path: "/" }),
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: SITE_HOME_TITLE,
    template: "%s | Recovery Inventory",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style id="journal-color-themes">{journalThemeStyles}</style>
        <script id="journal-theme-preference" dangerouslySetInnerHTML={{ __html: journalThemeBootstrap }} />
      </head>
      <body>
        <script
          id="site-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(SITE_STRUCTURED_DATA).replace(/</g, "\\u003c"),
          }}
        />
        <LanguageProvider>
          <ThemeProvider>
            {children}
            <SiteAnalytics />
            <MarketingAnalyticsNotice />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
