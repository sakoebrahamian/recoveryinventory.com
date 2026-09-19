import type { Metadata } from "next";

export const SITE_NAME = "Recovery Inventory";
export const SITE_URL = "https://recoveryinventory.com";
export const SITE_DESCRIPTION =
  "Private, encrypted Step 4 and Step 10 reflection tools with analytics, learning guidance, and anonymous or email-based membership.";

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
    inLanguage: ["en", "fa", "es"],
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
  },
] as const;
