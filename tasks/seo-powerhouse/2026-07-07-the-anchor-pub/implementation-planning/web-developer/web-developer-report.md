# Web Developer Analyst — Implementation Tickets

_7 July 2026. Feasibility + code-level detail for the scored backlog. Files verified against the live codebase this session. Estimates are relative effort, not hours._

## Legend
Effort: XS (one line) · S (one file) · M (few files) · L (multi-file/coordinated). Risk mirrors the scored backlog.

## DONE this session (branch `chore/seo-powerhouse-safe-fixes-2026-07-07`)
SEO-021, SEO-026, SEO-031, SEO-044 — see `implementation/implemented-small-fixes.md`.

## Tier-1 dev tickets (highest commercial value)

### T-SEO-007 — Restore the £ symbol on menu display prices (money pages) [M, risk 1]
- **Symptom (live-verified):** `/sunday-roast` shows "Roasted Turkey16"; `/food-menu` & `/book-table` meta descriptions show "Dishes from 4." (currency lost).
- **Root cause:** `lib/menu-page-data.ts:172 formatMenuPrice()` returns a bare number; `components/features/MenuDisplay.tsx:239/280` has its own `formatMenuPrice` for `displayPrice`. Neither prepends `£`.
- **Fix:** Add `£` in the **display** formatter(s) only. Keep `normalizeMenuPrice()` (schema, `MenuDisplay.tsx:49/240/281`) bare. Confirm there is one shared formatter or update both (`lib/menu-page-data.ts` + `MenuDisplay.tsx`).
- **Do NOT** let `£` reach any JSON-LD `Offer.price`. Consumers to check: `app/sunday-roast/page.tsx:111`, `app/food-menu/page.tsx` `priceFromLabel`, `app/pizza-menu`, `app/fish-and-chips-heathrow`. `/drinks` (`app/drinks/page.tsx:86`) already strips `£` for schema — safe, but re-verify after change.
- **Acceptance:** every visible menu price and every `priceFrom`/meta-description price shows `£`; validate `/sunday-roast`, `/food-menu` JSON-LD `Offer.price` stays numeric (no `£`) in Rich Results Test; invalid/zero prices still render empty (no lone `£`).

### T-SEO-008 — Route the /corporate-events hero CTA to enquiry, not the table wizard [S, risk 1]
- **Root cause:** `app/corporate-events/page.tsx:53-63` hero primary action is `<BookTableButton context="corporate_event">` → 20-cover restaurant table flow.
- **Fix:** Replace the hero primary with an enquiry CTA (link to the private-hire/corporate enquiry form or `mailto:manager@the-anchor.pub` consistent with the page's lower CTA at :461), keep "Discuss Your Event" phone as secondary.
- **Acceptance:** hero primary lands on an enquiry surface sized for corporate groups, not `/book-table`.

### T-SEO-015 — Stop price-scrub placeholders rendering as literal customer text [M, risk 1]
- **Symptom:** "live price" ×9 on `/christmas-parties`; "buffets priced from the live approved source" in the engagement-parties meta description.
- **Root cause:** June price-scrub replaced numbers with placeholder strings that now render. This is a **code/data** bug (the render should pull the live value or omit the price), then an editorial pass.
- **Fix:** Wire the affected price fields to the live menu/private-hire source or remove the price line; never render the placeholder token. Pair with T-SEO-016.
- **Acceptance:** no literal "live price"/"approved source" tokens in rendered HTML or metadata across the site (add to the drift-guard test).

## Tier-2 dev tickets

### T-SEO-023 — Fix the title system (de-double brand, cap ≤60 chars, brand the homepage) [L, risk 2]
- **Root cause:** `app/layout.tsx:64-67` `template: '%s | The Anchor Stanwell Moor'` appends the brand to page titles that already contain "The Anchor" → 211/240 titles >60 chars, 102 double-branded; homepage `default` is fine but page-level titles carry the brand twice.
- **Fix (coordinated):** either (a) change the template to `%s` and standardise page titles to include one brand mention, or (b) keep the template and strip the brand from page-level `title` metadata. Requires an editorial pass over page titles (route wording to `editorial-team`). NOTE: "The Anchor Pub" **is SSOT-permitted in titles** (SSOT line 20) — the defect is length/doubling, not a banned phrase.
- **Acceptance:** ≤60 chars on the 15 priority pages, exactly one brand mention per title, homepage title branded.

### T-SEO-025 — Repoint legacy blog 301s + apply tag-alias at render [M, risk 2]
- **Root cause:** `/blog/best-places-to-eat-near-heathrow` & `/blog/best-pub-food-near-heathrow` 301 → `/blog/eating-near-heathrow-prices-compared` which is `noindex:true` (equity dead-ends). ~35-60 internal links point at redirected URLs because a tag-alias map isn't applied at render.
- **Fix:** repoint those 301s to `/restaurants-near-heathrow`; apply the tag-alias map where blog/tag links render so internal links hit final URLs.
- **Acceptance:** legacy slugs 301 to an indexable page; `broken-internal-links.csv` re-crawl shows the redirected-internal-link count drop toward 0.

### T-SEO-027 — /drinks schema: remove 146 empty-price Offers + de-hardcode drinks.json [M, risk 2]
- **Root cause:** Menu schema emits 146 `Offer`s with empty `price` (invalid); `content/menu/drinks.json` hardcodes 32 cocktail prices (SSOT violation); ~60KB JSON-LD.
- **Fix:** omit `Offer` when no live price; pull drink prices from the live source or drop them; trim payload. Route structured-data shape to `schema-markup`.

### T-SEO-028 — Schema-estate repair (template-level) [L, risk 2]
- 430 blocks missing required fields (Restaurant missing `address` etc.); 128 FAQPage + 18 HowTo target retired rich results; blog `articleBody` inlines 24-27KB per post; dangling `@id` refs. Fix at the shared schema builders, not per page. Hand design to `schema-markup`.

### T-SEO-030 — Right-size og:images [M, risk 1]
- `lib/image-fallbacks.ts` `DEFAULT_OG_IMAGE` is a 290KB raw JPG shared by ~120 pages; other og:images are 226-322KB source files. Generate right-sized (≤~150KB, correct 1200×630) og assets. (Heroes already go through next/image — not the cause.)

### T-SEO-032 — Sitemap reconciliation [M, risk 1]
- 44 crawled indexable pages absent from `app/sitemap.ts` (incl. `/live-sport/world-cup/sweepstake`); replace rolling `new Date()` `lastModified` with real content dates. Verify no noindex pages get added.

### T-SEO-033 — Delete dead `generateEventSchema` [XS, risk 1]
- `lib/schema-utils.ts:138` — zero importers (confirmed); hardcodes quiz £3 / bingo £10. Safe delete (not done inline only to avoid churn in a shared file mid-audit; do it in the next schema PR).

## Tier-2/3 dev + owner
### T-SEO-006 — Swap ~13 raw `mailto:` + 14 raw `tel:` links to tracked `EmailLink`/`PhoneButton` [M, risk 1]
Call sites incl. `app/coach-parking-heathrow`, `app/summer-garden-parties`, `app/heathrow-layover-dining`, corporate-events hero phone. Blocks accurate contact-conversion measurement.

### T-SEO-005 — Consent Mode v2 + stop hard-gating events pre-dataLayer [M, risk 2]
Add `ad_user_data`/`ad_personalization` defaults; move from hard-gate to consent-mode modelling so non-consenting conversions aren't fully dropped.

### T-SEO-045 — Revert `/book-table` launch `revalidate=1h` [XS, risk 1]
Stale TODO past 22 May 2026; restore the intended revalidate value.

## Blocked on data / owner (no dev action yet)
- **SEO-034/035/036** cannibalisation merges & hotel-page disposition — **blocked on SEO-002 (GSC)**; interim retargeting (title/H1) is safe, merges are not.
- **SEO-001/002/003/004** measurement — Vercel env + Google console (owner).
- **SEO-029** Cloudflare Scrape Shield (owner).
