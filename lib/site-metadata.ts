import { languages } from "./languages";
import type { Metadata } from "next";
import { subscriptionPricing } from "./subscription-plans";

export const SITE_NAME = "Recovery Inventory";
export const SITE_URL = "https://recoveryinventory.com";
export const SITE_DESCRIPTION =
  "Private Step 4 workbooks and Step 10 daily inventories with optional AI journaling guidance for members, charts, and sponsor reports in 10 languages.";
export const SITE_HOME_TITLE = "Private Step 4 & Step 10 Journal | Recovery Inventory";

const SHARE_IMAGE = {
  url: "/social-preview.png",
  width: 1200,
  height: 630,
  alt: "Recovery Inventory wordmark and RI monogram for the private Step 4 and Step 10 journal",
};

export const RECOVERY_APP_STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${SITE_URL}/#application`,
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "HealthApplication",
  operatingSystem: "Web browser",
  inLanguage: languages,
  publisher: { "@id": `${SITE_URL}/#organization` },
  offers: ([
    ["yearly", subscriptionPricing.yearly, "P1Y"],
    ["monthly", subscriptionPricing.monthly, "P1M"],
  ] as const).map(([plan, cents, duration]) => ({
    "@type": "Offer",
    name: plan === "yearly" ? "Yearly membership" : "Monthly membership",
    url: `${SITE_URL}/#membership`,
    price: (cents / 100).toFixed(2),
    priceCurrency: "USD",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: (cents / 100).toFixed(2),
      priceCurrency: "USD",
      billingDuration: duration,
    },
  })),
};

type PageMetadataOptions = {
  title: string;
  description: string;
  path: `/${string}` | "/";
  languages?: Record<string, string>;
};

export function createPublicPageMetadata({
  title,
  description,
  path,
  languages,
}: PageMetadataOptions): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
      ...(languages ? { languages } : {}),
    },
    openGraph: {
      type: "website",
      url: path,
      siteName: SITE_NAME,
      title,
      description,
      images: [SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SHARE_IMAGE],
    },
  };
}

export function createPrivatePageMetadata({
  title,
  description,
  path,
}: PageMetadataOptions): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
  };
}

export const SITE_STRUCTURED_DATA = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    email: "support@recoveryinventory.com",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: languages,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
  },
] as const;
