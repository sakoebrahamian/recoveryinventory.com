import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/recovery/language-provider";
import { SiteAnalytics } from "@/components/recovery/site-analytics";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_STRUCTURED_DATA,
  SITE_URL,
} from "@/lib/site-metadata";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: "Private Step 4 & Step 10 Journal | Recovery Inventory",
    template: "%s | Recovery Inventory",
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
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
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [{ url: "/social-preview.png", width: 1200, height: 630, alt: "Recovery Inventory logo" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/social-preview.png"],
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
        <script
          id="site-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(SITE_STRUCTURED_DATA).replace(/</g, "\\u003c"),
          }}
        />
        <LanguageProvider>
          {children}
          <SiteAnalytics />
        </LanguageProvider>
      </body>
    </html>
  );
}
