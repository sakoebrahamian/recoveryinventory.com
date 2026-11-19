# Recovery Inventory: second audit review and free accounts

Audit: <https://app.heycatch.ai/audit/hck_pk_1wzH29ea6iDOypVDZ2wQ2e3Kl0P-2glO?surface=website>

Reviewed November 19, 2026. All six finding panels and the complete prioritized action plan were read before implementation. The five scored dimensions now total 80.5/100 (22/25 positioning, 22/25 conversion, 9/20 trust, 14/15 pricing, 13.5/15 SEO). Brief fit is separately 9/10. These are the audit's current pre-change scores, not predicted new scores. The earlier release baseline is retained in website-audit-2026-11-19.md.

## Change log

- D1.1 (was 5/6): Named the product category and Steps 4 and 10 in the homepage h1; added an explicit audience/scope FAQ, in English, Spanish, and Farsi.
- D1.2 (was 4/5): Explained the saved-history, pattern-review, and sponsor-conversation reasons for membership in the homepage pricing body; added an app-intent landing page.
- D1.3 (was 3/4): Added a visible account-history paragraph describing a record of the days, practices, and next actions the member chose.
- D2.1 (was 6/7): Replaced the poetic homepage h1 with “A private journal for Step 4 and Step 10.”
- D2.3 (was 4/5): Kept the existing page sequence; separated the product preview caption from the visual and gave crowded desktop navigation a second row at intermediate widths.
- D2.5 (was 2/4): Verified homepage, demo, pricing, signup, and free/expired workspaces in a 375×812 browser frame; checked all three homepage languages, CTA reach, stacked prices, form input types, controls, and horizontal overflow.
- D2.B (was +1/2): Added the audit's sponsor/home-group audience boundary in the homepage FAQ, with matching FAQ JSON-LD.
- D3.1 (was 0/4): Added a dated count of six permissioned feedback contributors beside the hero trust items, linked to their quotes; explicitly counts feedback contributors rather than live members, paid subscribers, or inventories.
- D3.2 (was 3/5): Restored Nancy's month-of-use and Red Dot's two-week context from the supplied feedback and published the approved Ben Addict and Sober Dan excerpts in all three languages.
- D3.3 (was 3/4): Added the pseudonymous founder's 18-year sobriety note in hero trust and a localized “Why I built this” desktop navigation link.
- D3.4 (was 3/4): Added real free accounts with a saved first week instead of introducing an unapproved refund promise; updated signup, dashboard, pricing, FAQ, terms, privacy, own-product comparison facts, and llms.txt consistently.
- D4.2 (was 3/4): Implemented a server-enforced free Step 10 tier with optional same-account monthly/yearly upgrades, keeping paid Step 4 and live AI access protected.
- D5.4 (was 2/3): Recorded the measured production-speed baseline and the release-verification method; no speed score or page-weight result is inferred from the development server. Fresh deployment evidence is recorded in the release PR.
- D5.5 (was 2.5/3): Added descriptive semantic captions for the interactive hero preview and illustrative analytics table; kept the controls accessible rather than turning them into an image role.
- Build a category landing page for Step 10 nightly review searches: Added /step-10-daily-inventory-app plus Spanish/Farsi routes with app-specific copy, 39-question framing, a copyable template/example, free-account and demo links, canonical/hreflang metadata, homepage/Learn links, sitemap entries, and llms.txt discovery.

## Free-account behavior

Creating an account requires no card and makes no Stripe subscription. The first seven days start from the existing server-stored users.created_at value. Accounts can save at most seven distinct Step 10 dates during that window; editing an existing date during the window uses no extra slot. A single atomic SQL statement enforces the limit across competing saves. Inventories use the same existing encryption and owner-scoped storage. No database migration is needed.

After the window, Step 10 remains readable and exportable and its private analytics remain available. New saves require membership. Step 4 saving and the live AI guide require paid membership throughout. Existing paid members keep full access. Monthly $4.99 and yearly $25 checkout, promotions, webhooks, and billing portal behavior are retained. There is no automatic trial-to-paid conversion and no Stripe Dashboard configuration change. Upgrades preserve the account and entries.

Existing inactive accounts use their original creation time; this release does not restart their free period. Optional AI limits remain 50 per member/day and 5,000 shared requests/month. No real customer inventories were inspected or used in tests.

## Evidence and limitations

- New integration suite uses real SQLite with the existing schemas and actual API handlers: real anonymous signup without Stripe, server-owned timestamps, encrypted saves, seven-day boundary, seven-date cap, edits, competing saves for the last slot, retained data/analytics after expiry, cross-account isolation, same-account upgrade continuity, cancellation read access, and paid-only Step 4/AI gates.
- Billing, password-authentication, Step 10, detailed analytics, and AI guide regression suites passed. Password-auth test storage was extended for the new account count query without removing existing assertions.
- TypeScript validation, whitespace checks, and the complete production build passed. The route manifest includes all three new category pages and excludes all temporary QA routes.
- Browser QA used synthetic accounts in an isolated local D1 database. A real free save was confirmed, reloaded, and retained. Expired writes were disabled while the export preview remained accessible. Optional monthly selection expanded without starting checkout. Temporary fixtures, phone frame, and non-production encryption key were removed before the production build.
- At 375px frame width, homepage demo CTA bottoms were 608px English, 688px Spanish, and 652px Farsi; header controls were 44px high. No horizontal document overflow was found on checked pages. Signup inputs use the appropriate text/password/autocomplete values at 16px. Demo tool targets were 72px high; pricing choices stacked at full card width. This is browser evidence, not a claim of physical-device testing.
- The template and metadata were checked in the browser, including English and Spanish routes. Existing full-mark comparison research, analytics sample data, paid pricing calculations, and learning guides were retained; additions only provide the requested new page links and correct own-product free-access facts.
- The previous production mobile PageSpeed report was performance 98, accessibility 100, best practices 100, SEO 100, LCP 1.1s, total blocking time 0ms, CLS 0, and 278KiB. That report describes the previous deployment, not this release: <https://pagespeed.web.dev/analysis/https-recoveryinventory-com/rbd9hqqwi6?form_factor=mobile>. Fresh deployment checks belong in the release PR after publication.

## Feedback provenance and external dependency

The owner supplied feedback and publication permission for Francis, Nancy, Red Dot, Lucy, Ben Addict, and Sober Dan. Each quote uses the supplied display name; Spanish and Farsi are marked translations. The count is a dated review of these six contributors, not a live activity metric. No new sobriety outcomes, member numbers, star ratings, photographs, or usage totals were invented. “Paul” remains a disclosed pseudonym.

D3.5 remains 0/3: one genuine, dated independent review or mention must be supplied or collected externally. The existing empty external-mentions configuration/component remains ready and renders no fabricated endorsement. No outreach was sent. A paid audit itself was not presented as a customer endorsement.

The owner supplied Twelva pricing as $36.99/year and $4.99/month. At those supplied prices, Recovery Inventory's $25 annual subscription is $11.99 lower. No unverified competitor price claim was added to public copy and no existing passing competitor page was rewritten around this correction.

Automated audit tools may continue to cap mobile and speed findings if their fetcher cannot inspect rendered layouts or real performance. The verification evidence above is distinct from a rerun score or a conversion guarantee.
