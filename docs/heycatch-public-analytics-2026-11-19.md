# Optional HeyCatch public-page analytics

The owner requested help completing HeyCatch setup after reviewing the privacy trade-offs. This implementation uses the supplied publishable project key and the latest stable npm tag checked November 19, 2026: `@heycatch/sdk` 0.8.5. The official installation guide and the package's actual exported configuration/types were reviewed before implementation. No new account, subscription, paid audit or outreach is created.

## Scope and collection

The SDK has a static import in `instrumentation-client.ts`, runs at the browser entry point, and initializes only on the canonical production HTTPS hosts after an explicit public-page opt-in. An exact allowlist covers 103 known marketing, learning, about, comparison and legal URLs. Unknown routes, the interactive demo, sign-in, signup, member pages and APIs are excluded. A capture-time gate also rejects private-route events during client navigation or back/forward restoration. Preview/localhost visits do not initialize the production analytics SDK.

The consent controls and disclosure are translated in all ten languages. The choice can be changed under Privacy → Analytics choices and synchronizes across tabs. GPC and Do Not Track close the gate even when a stored preference allows collection. Declining sends no event. Blocked storage defaults to no consent; an explicit choice can still apply to the current page.

`collectIp: false`, `respectDnt: true`, initial opt-out, sessionStorage persistence, disabled batching for native page navigation, and masked element text/attributes are set explicitly. The event allowlist further removes arbitrary/future SDK properties, account identities, email/name fields, person updates, input contents, element text/attributes, full referring URLs, query strings and fragments. It keeps anonymous UUID-shaped browser/session identifiers, approved public paths, screen dimensions, a small set of broad source categories, and HeyCatch's one-character campaign IDs. The SDK adds its own installation attribution and the no-stored-IP marker after the sanitizer. SDK session replay is disabled by the vendor. There are no server tracking hooks and no calls to setIdentity.

The collected surface is explicitly `landing` because only approved marketing pages participate, even though this repository also contains a private web app. This is an intentional restricted alternative to the guide's broad mixed-project installation. No signup, paid-activation, private-tool, onboarding or individual account journey is sent to HeyCatch. The existing first-party aggregate report retains its signup, checkout and activation counts.

## Short links and existing behavior

Single lowercase letters/digits redirect with HTTP 302 to the homepage with `utm_source=heycatch` and the matching `utm_campaign`. There are no existing single-character routes. Existing account, billing, AI, encryption, privacy-sharing and membership logic is unchanged. The first-party privacy paragraph now explicitly scopes its no-identifiers statement to its own aggregate reporting; a separate HeyCatch disclosure explains optional visitor identifiers and the exclusions.

## Verification and confirmation

`test:heycatch` exercises all allowlisted sitemap URLs; excluded paths; opt-in, decline and withdrawal; blocked storage; GPC/DNT; private-route transitions; safe URL/referrer/campaign handling; removal of account, journal, AI, form and unexpected properties; and idempotent initialization. Its Vite cache is isolated from preview. TypeScript, the ten-language suite, detailed first-party analytics suite and production build passed.

Managed preview served server-rendered pages but returned 404 for its internal virtual browser-entry module, so interactive local browser verification was unavailable after a clean restart. Application source was retained; no preview proxy, permission or hosting identity was altered. The release PR records live production checks separately.

The SDK must see a real, consented production visit for HeyCatch's dashboard to confirm installation. Automated/headless traffic can be discarded by HeyCatch and must not be spoofed to force the check. The owner must sign in to the existing HeyCatch account to use its Install → Website check. A published build or SDK initialization log alone is not reported as dashboard verification.
