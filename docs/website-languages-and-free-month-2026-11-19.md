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


## Desktop selector and free-month button follow-up

A live report exposed a wider desktop breakpoint above 1400 CSS pixels where the single-row navigation squeezed the native language select to zero width. Desktop headers now keep navigation on a separate row at every desktop width and reserve space for the selector. Browser checks covered all ten languages at 1497 and 2022 CSS pixels, plus a 337-pixel mobile check.

“Start my free month” is now the large primary button in the homepage hero, beside a secondary demo button, with the no-card/no-automatic-subscription explanation directly below. The pricing card also uses a full-width button for the free month instead of a text link. Both buttons keep the selected language and open the existing free signup flow.

## Ten color themes

Public and member headers now include a localized “Color theme” chooser with ten labeled swatches: original sage, ocean blue, lavender, soft rose, forest green, clear sky, warm amber, deep plum, terracotta and slate gray. The original palette is the default. Color tokens change the page backgrounds, journal cards and controls without changing answer-state or chart-legend colors.

The choice is stored only in this browser, applies before the page paints, follows public/member navigation, and synchronizes across tabs. It is separate from account access, AI request language and journal storage. Invalid or blocked browser storage falls back safely to sage; a blocked write still permits changing the active page. The chooser supports keyboard focus, Escape, outside-click dismissal, right-to-left layouts and smaller screens. Its copy and palette names are translated in all ten languages.

`test:themes` checks text/button contrast for all ten palettes, preference restoration before paint, invalid/blocked storage and translated labels. Browser checks covered every theme, persistence after reload and navigation to free signup, all ten chooser languages at 1497/337 CSS pixels, the wide 2022-pixel desktop selector, and synthetic member Step 4/Step 10 drafts plus AI history/drafts across all ten palettes. A combined Arabic language/theme switch retained Step 4 writing. The synthetic harness is kept only under `scripts/fixtures`; it is removed from application routes before release.
