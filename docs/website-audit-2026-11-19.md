# Recovery Inventory: website audit baseline and initial release

Audit reviewed on November 19, 2026. These are the audit's original scores, not new scores assigned by this implementation. This record describes the initial release and the completion batch requested by the owner; the original scores are retained for comparison when the audit is rerun. The first-batch table below is historical; the completion section records the remaining work.

## Baseline dimensions

| Dimension | Original score | Audit status |
| --- | --- | --- |
| Positioning | 19/25 | Partial |
| Conversion clarity | 20/25 | Partial |
| Trust signals and social proofs | 3/20 | Fail |
| Paywall and pricing | 13.5/15 | Pass |
| SEO basics | 11.5/15 | Pass |
| Brief fit | 9/10 | Pass |

## Findings below full marks

| Finding | Original score | First-batch disposition |
| --- | --- | --- |
| D1.1 Hook | 4/6 | Preview: name AA, NA, and other twelve-step fellowship members in the hero eyebrow. |
| D1.2 Pain match | 4/5 | Preview: explain the value of membership alongside the free demo. |
| D1.3 JTBD coverage | 3/4 | Preview: describe the AI guide as help reflecting on the day or putting an inventory into words. |
| D1.4 Objection handling | 2/3 | Preview: answer the paid-versus-free objection and clarify the role of sponsors alongside AI. |
| D1.5 Desired-result visualization | 2/3 | Preview: early members describe easier journaling, clearer patterns, sponsor sharing, and help choosing what to write. A longer-term illustrative visualization remains deferred. |
| D2.1 Five-second comprehension | 5/7 | Preview: identify the product as an online journal with Step 10 daily inventories and Step 4 workbooks. |
| D2.3 Visual hierarchy and scroll flow | 4/5 | Browser-reviewed; keep existing section order and CTA hierarchy. |
| D2.5 Mobile experience | 2/4 | Preview: 44px header controls and 14px control text; verified 375px layout in a browser viewport frame. Physical-device testing is separate. |
| D3.1 Quantity proof | 0/4 | Preview: visible feedback from four early members, with their chosen display names. This counts the quoted contributors, not a live adoption or paid-member counter. |
| D3.2 Story proof | 0/5 | Preview: owner-supplied English excerpts with publication permission, labeled Spanish/Farsi translations, and one analytics quote beside membership. |
| D3.3 Founder-led trust | 0/4 | Preview: About pages in three languages, a homepage creator note, footer links, and a clear pseudonym disclosure. |
| D3.4 Transactional trust | 3/4 | Deferred: no refund guarantee, trial, or post-cancellation access promise added. |
| D3.5 Third-party and recency signals | 0/3 | Deferred: requires a genuine external mention or listing. |
| D4.2 Tier and offer design | 3/4 | Deferred: trial or free-tier policy is a business decision. |
| D4.4 Pricing versus competitors | 3.5/4 | Deferred: no unverified competitor statements or new trial policy. |
| D5.3 Indexable content and comparisons | 3/4 | Deferred: comparison-page research and writing remain a later batch. New About pages are included in the sitemap. |
| D5.4 Page speed | 2/3 | No production speed or page-weight claim made from a development preview. |
| D5.5 AI-driven discovery and structured data | 1.5/3 | Preview: SoftwareApplication data with both USD offers, derived from the same price constants as billing. FAQ markup and llms.txt are deferred. |

Full-mark findings are not targets for redesign: D1.6, D2.2, D2.4, D4.1, D4.3, D5.1, and D5.2. Existing prices, renewals, cancellation/refund policy, demo/account behavior, privacy disclosures, and the independence disclaimer are retained.

## Change log

- D1.1 (was 4/6): named the audience in the homepage eyebrow in English, Spanish, and Farsi (`app/page.tsx`, `lib/translations-es.ts`).
- D1.2 (was 4/5): added a plain explanation of paid membership and what the free demo includes (`app/page.tsx`, `lib/translations-es.ts`).
- D1.3 (was 3/4): reframed AI guidance around reflecting on a day and writing an inventory (`components/recovery/inventory-guide-promo.tsx`, `lib/translations-es.ts`).
- D1.4 (was 2/3): added FAQs about paid tools, demo limits, AI's role alongside sponsorship, and sponsor access to exported reports (`app/page.tsx`, `lib/translations-es.ts`).
- D1.5 (was 2/3): added early-member descriptions of useful results in the homepage feedback section (`lib/member-feedback.ts`, `components/recovery/member-testimonials.tsx`).
- D2.1 (was 5/7): made the hero description explicit about the journal and its two inventories; corrected a missing space in the Spanish headline (`app/page.tsx`, `lib/translations-es.ts`).
- D2.5 (was 2/4): increased mobile header controls to 44px and control text to 14px; checked phone-width rendering (`app/globals.css`).
- D3.1 (was 0/4): added visible, permissioned feedback from four early members using their chosen display names (`components/recovery/member-testimonials.tsx`, `lib/member-feedback.ts`).
- D3.2 (was 0/5): added four verbatim English testimonial excerpts between membership and FAQ, marked translations in Spanish/Farsi, and Nancy's analytics excerpt beside the price decision (`app/page.tsx`, `components/recovery/member-testimonials.tsx`, `lib/member-feedback.ts`).
- D3.3 (was 0/4): added `/about`, `/es/about`, and `/fa/about`, with Paul's approved story, a pseudonym notice, homepage and footer links, localized metadata, and sitemap entries (`lib/about-content.ts`, `components/recovery/about-page.tsx`, About routes, `components/recovery/site-footer.tsx`, `app/sitemap.ts`).
- D5.5 (was 1.5/3): added SoftwareApplication JSON-LD with $25 yearly and $4.99 monthly offers derived from existing billing constants (`lib/site-metadata.ts`, `app/page.tsx`).

## Verification

- TypeScript check and production build passed.
- Existing billing, Step 10, inventory-guide, analytics, and password-auth checks passed.
- Browser-checked all three About routes, language links, localized metadata, founder excerpts, FAQ expansion, and monthly plan handoff.
- Phone-width checks used a temporary same-origin browser frame with a 375px × 812px viewport. The test frame was removed from source after QA.
- No horizontal overflow observed on the tested homepage, About, demo, and signup views. Homepage demo CTA remained within the first screen in all three languages.
- Monthly signup query selected monthly after hydration; existing yearly default is preserved.
- No live Stripe transaction or production-account mutation was performed.
- Managed preview uses locally emulated bindings; production bindings and secrets are unchanged.
- Member-feedback follow-up: verified all four names and English excerpts, labeled translations in Spanish/Farsi, the analytics excerpt beside pricing, and a single-column 375px card layout without horizontal overflow in all three languages.

## Member-feedback provenance

The owner supplied feedback and explicit publication permission for Francis, Nancy, Red Dot, and Lucy on November 19, 2026. Those are the approved display names; Nancy is used rather than the also-permitted Nancy M. Each English excerpt is copied verbatim from the supplied feedback. Non-English versions are identified as translations. The source feedback and permission statements remain in the conversation; the public page includes only selected excerpts and names.

Francis's new-user qualification is retained. Nancy and Red Dot discuss analytics and sponsor sharing. Lucy's membership duration is not presented as the age or duration of use of the AI feature. No review scores, photos, sobriety histories, or claims of typical or guaranteed results were added.

## Completion batch

The owner requested completion of the remaining work. The audit's alternative to a new guarantee/trial was used: make the free demo and monthly commitment clear, and state existing cancellation, paid-access, and refund terms beside the purchase decision. No refund entitlement, trial billing, free account tier, price, or existing member access was changed.

### Completion change log

- D1.4 (was 2/3): added a trial/refund FAQ, purchase explanations, and sourced comparison pages (`app/page.tsx`, `lib/translations-es.ts`, comparison pages).
- D1.5 (was 2/3): added an interactive six-month pattern example between analytics and how-it-works, with three principles, visible sample counts, and a sponsor reflection question (`components/recovery/pattern-history-example.tsx`).
- D2.5 (was 2/4): corrected low-contrast text reported by the mobile performance audit and checked new content at 375 × 812, including Farsi name isolation and stacked comparison rows (`app/globals.css`, comparison components).
- D3.2 (was 0/5): added the audit's longer-term visual example, prominently labeled as made-up sample data rather than a member result; the four permissioned testimonials remain separate (`components/recovery/pattern-history-example.tsx`).
- D3.4 (was 3/4): placed the monthly option, cancellation/access explanation, existing non-refundable-payment statement, and terms link beside the membership CTA (`app/page.tsx`, `lib/translations-es.ts`).
- D3.5 (was 0/3): prepared a dated external-mentions component for the homepage and About pages; it renders nothing until a genuine source is supplied (`lib/external-mentions.ts`, `components/recovery/external-mentions.tsx`). This finding remains dependent on real third-party evidence.
- D4.2 (was 3/4): made the free path visible at the plan decision and distinguished an unsaved demo from a saved-account trial, including the live-AI limitation (`app/page.tsx`, `lib/translations-es.ts`).
- D4.4 (was 3.5/4): explained the demo/monthly approach and compared current competitor entry prices and free-access models without changing existing billing (`lib/product-comparisons.ts`, homepage pricing copy).
- D5.3 (was 3/4): added comparisons with 12 Steps Online, InnerAscent, and pen and paper in English, Spanish, and Farsi, with footer/learning-center links, canonical URLs, hreflang, dated official sources, and 12 new sitemap entries (`app/**/vs`, `lib/product-comparisons.ts`, comparison components, `app/sitemap.ts`).
- D5.4 (was 2/3): measured the deployed initial release using PageSpeed Insights mobile Lighthouse: 100 performance, 1.1 s FCP/LCP, 0 ms blocking time, 0 layout shift, and 268 KiB total network payload. The color-contrast finding was addressed in this completion batch. These are lab observations, not field-data or future-performance guarantees.
- D5.5 (was 1.5/3): generated FAQPage JSON-LD from the same localized question/answer list shown on the homepage and added a text/plain `/llms.txt` route with product facts, live price constants, terms, and learning links (`app/page.tsx`, `app/llms.txt/route.ts`). Existing SoftwareApplication offers are retained. No Google rich-result or ranking benefit is promised.

### Sources checked

Official pages were checked November 19, 2026, rather than copying older assumptions from the audit:

- <https://12steps.io/index.php>: all-step writing, journals, analytics/progress, browser support, 14-day trial, and listed monthly/yearly prices. Its pricing block uses a dollar symbol without labeling the currency; the comparison says to confirm the currency at checkout.
- <https://12steps.io/terms-conditions>: new-account trial and subscription requirement after the trial.
- <https://innerascent.app/>: current iOS/Android availability, no web app, free core tools, 30-day trial, and current USD monthly price. Older cached pages mention an annual price and iOS coming soon; the comparison uses the current homepage and does not repeat those stale claims.
- <https://innerascent.app/faq>: named languages, anonymity, and consent-based sponsor sharing.

Published comparisons describe the linked sources and are not represented as hands-on competitor tests or independent endorsements. They acknowledge when the other option may suit a reader better. Illustrative analytics do not claim typical outcomes or a recovery score.

### Completion verification

- Production build and TypeScript check passed; no dependency change was required.
- Existing billing, Step 10, analytics, AI-guide, and password-account suites passed. File watching was disabled in three one-shot test harnesses after the workspace watcher limit interrupted their initial runs; assertions were retained and the affected suites passed on rerun.
- Browser checks covered all nine comparison articles at 375px, one h1 per page, correct language/canonical URLs, Farsi RTL, stacked comparison rows, and no horizontal overflow. The Farsi product names are isolated to keep Latin text in order.
- Homepage demo CTA stayed within the first 812px in all three languages. New sample controls exceed 44px; monthly/yearly cards remain stacked on phones.
- Verified the interactive sample changes its values/caption/reflection, localized pricing explanations, 13 visible FAQs and matching schema entries, all 12 comparison sitemap URLs (31 total URLs), text discovery content, and an unknown comparison's 404 page.
- The temporary phone-viewport harness was removed before release. No production account or paid Stripe transaction was used for testing.
- Baseline mobile report: <https://pagespeed.web.dev/analysis/https-recoveryinventory-com/0wemtz1ipu?form_factor=mobile>. There was no real-user field dataset available; lab scores may vary.

### Only external dependency

A real, dated third-party listing, article, review, or community mention is still needed for D3.5. A paid private audit is not an endorsement, and an unverified badge or quote will not be invented. The empty source list and render-nothing component are ready for that evidence. No outside message or listing submission was sent. The creator remains anonymous under the disclosed pseudonym.
