# Pre-Approved Small Fixes — low-risk, isolated, verifiable

_Per workspace CLAUDE.md, small low-risk fixes are pre-approved when implementation permission exists. These are isolated code changes (no content rewriting — copy rewrites route to `editorial-team` per house rule). Each is buildable + verifiable. **Editorial copy corrections are NOT in this list** — they are briefs for `editorial-team`._

| ID | Fix | File(s) | Risk | Verify |
|---|---|---|---|---|
| SEO-007 | Restore `£` symbol in `formatMenuPrice` (prices render as `Roasted Turkey16`, `Dishes from 4.`) | `lib/menu-page-data.ts` (~172-190) | Low | Build + fetch /sunday-roast, /food-menu, /book-table; assert `£` present |
| SEO-008 | Re-point `/corporate-events` hero "Book Your Event" CTA from the 20-cover table wizard to the enquiry route | `app/corporate-events/*` | Low | Build; inspect rendered CTA href |
| SEO-010 | Replace banned `info@`/`events@`/`parking@` enquiry emails with `manager@the-anchor.pub` | components/pages with mailto CTAs | Low | grep repo for banned emails → 0 in customer-facing paths |
| SEO-012 | Add a real contact affordance (tel/email button) to the event `SALES_CLOSED` panel | event booking component | Low | Build; render closed-sale state |
| SEO-013 | Add above-the-fold CTA (`actions` prop) to `/restaurants-near-heathrow` hero | `app/restaurants-near-heathrow/*` | Low | Build; assert hero CTA present |
| SEO-021 | Correct the shared internal-link component's "5 minutes from all terminals" to SSOT "7–12 minutes" | shared internal-link/component | Low | grep "5 minutes from all" → 0 |
| SEO-023 | Title template: stop double-appending the brand, cap ≤60 chars, give homepage a branded title | `app/layout.tsx` (~66-67) | Low-Med* | Build; fetch 6 pages; assert one brand mention, ≤60 chars |
| SEO-026 | Fix `/menus` 404 "View Menu" link on `/live-sport/world-cup` → `/food-menu` | world-cup page | Low | grep `/menus` link → 0; build |
| SEO-031 | robots.txt path `/leave-a-review` → `/leave-review`; note the 3-hop redirect chain for follow-up | `app/robots.ts` | Low | Fetch /robots.txt; assert correct path |
| SEO-033 | Delete the dead `generateEventSchema` helper that hardcodes quiz £3 / bingo £10 | schema helper file | Low | grep confirms no importers; build |
| SEO-044 | "Recognized" → "Recognised" (British English) in the enquiry form | private-hire enquiry form | Trivial | grep; build |
| SEO-045 | Revert `/book-table` launch-fortnight `revalidate=1h` (stale TODO past 22 May 2026) to intended value | `app/book-table/*` | Low | Inspect; build |

\* SEO-023 changes every page's `<title>`. Semantically low-risk (removes a duplicated suffix, caps length) but sitewide blast radius — implement with a full production build + spot-fetch verification, and it appears in the Risk Register as a reviewed change.

**Not implemented inline (correctly-scoped elsewhere):**
- Any change that rewrites customer copy (christmas-parties prices, wakes facts, blog banned-claim removal, meta description prose) → `content-production/editorial-team-briefs.md`.
- The placeholder-token bug (SEO-015) — the *fix* is code (render the live price, not the literal string) but the correct data source needs confirming; kept as a dev ticket, not a blind inline edit.
- Anything needing owner access (Vercel env, Cloudflare, GSC, GBP, directories).
