import { SITE_URL } from "@/lib/site-metadata";
import { subscriptionPricing } from "@/lib/subscription-plans";

export function GET() {
  const content = `# Recovery Inventory

> A private web journal for members of AA, NA, and other twelve-step fellowships, with Step 10 daily inventories, Step 4 workbooks, pattern analytics, and selected reports for sponsor conversations.

## Product facts

- Web app for phone, tablet, and computer browsers; an internet connection is required.
- English, Spanish, Farsi, French, Brazilian Portuguese, Arabic, German, Armenian, Italian, and Greek, with right-to-left Farsi and Arabic support.
- Step 10 has 39 questions across 24 principles. Step 4 has six editable workbook sections. These are Recovery Inventory's original reflection framework, not official fellowship literature.
- Members can save inventories, review date-filtered analytics, and choose notes and principles for reports they preview, copy, print, or export. Nothing is shared automatically.
- Anonymous username/password accounts with a recovery code, or verified email accounts.
- Optional AI writing guidance requires membership. Each member can send up to 50 requests per day; the website has a shared 5,000-request monthly limit. AI is not a sponsor or professional care.

## Pricing and free access

- $${(subscriptionPricing.monthly / 100).toFixed(2)} USD monthly or $${(subscriptionPricing.yearly / 100).toFixed(2)} USD yearly. Both subscriptions include the same features and renew until canceled. Taxes may apply.
- Free demo: no account or card needed. Demo entries are not saved. The demo includes inventory tools, sample analytics, learning tools, and public AI examples; it does not include live AI access.
- Free accounts need no card. During the first 30 days after signup, an account can save up to 30 daily Step 10 entries, review its own Step 10 analytics, and export or share its entries. Saved Step 10 remains readable and exportable after the 30-day free period. Upgrade the same account to keep saving and unlock Step 4 workbooks and the AI guide. No automatic charge or automatic paid conversion occurs.
- Paid payments are non-refundable except where required by law. Cancel future renewals in the billing portal; paid access continues through the paid period. Existing Step 10 remains available to read and export.
- [Membership plans](${SITE_URL}/#membership)
- [Payment terms](${SITE_URL}/terms)

## Start here

- [Website](${SITE_URL}/)
- [Free demo](${SITE_URL}/demo)
- [Frequently asked questions](${SITE_URL}/#faq)
- [Why the creator built it](${SITE_URL}/about): personal recovery experience, published under the disclosed pseudonym Paul.
- [Compare inventory options](${SITE_URL}/vs)
- [Privacy](${SITE_URL}/privacy)

## Learning guides

- [Step 10 daily inventory template and example](${SITE_URL}/learn/step-10-daily-inventory)
- [Step 10 daily inventory app and free-account details](${SITE_URL}/step-10-daily-inventory-app)
- [Step 4 personal inventory](${SITE_URL}/learn/step-4-personal-inventory)
- [From dishonesty to honesty](${SITE_URL}/learn/dishonesty-to-honesty)
- [Spanish learning center](${SITE_URL}/es/learn)
- [Farsi learning center](${SITE_URL}/fa/learn)

Recovery Inventory is independent and is not affiliated with or endorsed by AA, NA, AAWS, or NAWS. It supports reflection alongside meetings, sponsorship, and fellowship literature. It is not treatment or a substitute for professional care.

Content reviewed: November 19, 2026. Live pricing and terms are authoritative.
`;
  return new Response(content, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" } });
}
