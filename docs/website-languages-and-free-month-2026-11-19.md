# Ten languages and a 30-day free saving period

This release supersedes the seven-day free-account description in the earlier audit implementation notes.

## Free account

- A new account can save at most 30 distinct daily Step 10 inventories during the first 30 days after its server-recorded creation time. Editing an already saved date does not use another slot.
- Existing eligible free accounts receive the remainder of that 30-day window from their original creation date. The window does not restart.
- Saved Step 10 reading, analytics and exports remain available after expiry. An optional subscription adds ongoing saving, Step 4 workbooks and live AI. No automatic charge or paid conversion.
- No Stripe prices, customers, subscriptions or database migrations are changed by extending this application-enforced free period.

## Languages

English, Spanish and Farsi are joined by French (`fr`), Brazilian Portuguese (`pt-BR`), Arabic (`ar`), German (`de`), Eastern Armenian (`hy`), Italian (`it`) and Greek (`el`). Arabic and Farsi use right-to-left layout. Public URL prefixes are lowercase, including `/pt-br/`, while HTML language and hreflang use `pt-BR`.

Public headers and member headers show an expandable “Available in 10 languages” notice listing every language by its native name.

The shared catalogue covers public copy, Step 4 and Step 10 prompts, learning material, sample text, account messages, report labels and approved feedback excerpts. Translated feedback remains identified as a translation from English. Display names, founder anonymity, prices and product claims keep their original meaning. Saved user writing is never automatically translated or sent to AI by changing the interface language. Language switching also preserves in-progress Step 4/Step 10 writing and AI drafts/history; the next explicit AI request uses the newly selected language. The 50-per-member daily and shared monthly limits still span all languages.

New dictionaries load on demand so visitors do not download all seven languages. Server-rendered public language pages provide their own dictionary for matching client hydration. Accounts persist the selected language, both AI modes explicitly request that language, and email-code templates use it. Public learning, about, comparison and Step 10 app-intent pages have translated URLs, canonical links, hreflang and sitemap entries.

Stripe Checkout uses `en`, `es`, `fr`, `pt-BR`, `de`, `it` or `el` when available. Stripe does not list Farsi, Arabic or Armenian as hosted Checkout locales; those selections use Stripe's `auto` locale. Subscription amounts remain $4.99/month and $25/year, in USD.

## Translation quality

These additions are AI-generated translations, not certified or native-speaker-reviewed translations. Native-speaker feedback can refine recovery terminology without changing the product's scope or claims.

## Verification

Run `node --run test:localization`, `test:free-accounts`, `test:password-auth`, `test:inventory-guide`, `test:billing`, `test:step10` and `test:analytics`, TypeScript checking and the production build. Browser QA covers the language selector, mobile layouts, Arabic direction, Armenian/Greek glyphs, translated public routes and report output. This checklist records intended verification; completion is recorded in the release pull request.


## Browser checks completed before release

The development-only fixture in `scripts/fixtures/language-qa-sandbox.tsx` mocks every API call and uses synthetic account and journal text. It is not an application route. Browser checks verified both AI modes across all ten languages, preserving typed drafts, previous messages and the selected guided topic. Captured request bodies used the newly selected language and retained the original conversation text. A mocked usage-limit response stayed localized after switching languages. Step 10 and Step 4 unsaved member drafts also survived all ten language switches. The member header's expanded language notice listed all ten native names.

Armenian calendar labels have a small local fallback for browsers that lack Armenian ICU data, so month and weekday names do not silently revert to English. Tests exercise that fallback explicitly.
