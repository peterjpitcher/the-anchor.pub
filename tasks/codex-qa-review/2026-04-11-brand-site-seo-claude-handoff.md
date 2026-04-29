# Claude Hand-Off Brief: Brand Site Event Page SEO Optimisation

**Generated:** 2026-04-11
**Review mode:** Spec Compliance (Mode C — pre-implementation)
**Overall risk assessment:** High (4 spec defects would cause implementation failures if not fixed)

## DO NOT REWRITE

- Event interface updates (8 new fields)
- eventStatus schema bug fix (mapping table correct)
- Image alt text fix (fallback chain correct)
- Keywords meta tag addition
- OG title using metaTitle
- Social proof, cancellation policy, accessibility sections (concept and placement)
- LiteYouTube concept (confirmed CWV improvement needed)
- Related events concept (existing helper available)
- Venue schema enrichment concept
- Three-stage lifecycle concept (active → recent → stale)

## SPEC REVISION REQUIRED

- [ ] **SPEC-REV-1:** Fix category URLs — replace all references to `/whats-on/[category]` with actual top-level category routes (`/quiz-night`, `/cash-bingo`, `/music-bingo`, `/karaoke`, `/live-music`, `/open-mic`). Build a category-to-URL mapping helper. For events with unknown categories, fall back to `/whats-on`.

- [ ] **SPEC-REV-2:** Add redirect safety — the stale-event redirect lookup must reject synthetic/fallback API data. If the API is down or returns fallback events, skip the redirect and render the current page with `noindex, follow`. Never issue a 301 based on fallback data. Note: the existing API-failure-to-permanent-redirect pattern (`permanentRedirect('/whats-on')`) is a pre-existing risk that should also be revisited (change to temporary redirect or soft 404).

- [ ] **SPEC-REV-3:** Add cancelled event SEO rules — keep indexed for 7 days (people search "is X cancelled"), then noindex. Remove from sitemap after 7 days. Don't redirect — the cancellation notice has SEO value. Set `offers.availability` to `Discontinued` for cancelled events.

- [ ] **SPEC-REV-4:** Remove breadcrumb new file — `lib/structured-data/breadcrumb-schema.ts` should NOT be created. The existing `Breadcrumbs` component already renders JSON-LD. Instead, add a category breadcrumb to the data passed to `HeroWrapper`:
  ```typescript
  breadcrumbs={[
    { name: "What's On", href: '/whats-on' },
    ...(event.category ? [{ name: event.category.name, href: getCategoryUrl(event.category.slug) }] : []),
    { name: event.name }
  ]}
  ```

- [ ] **SPEC-REV-5:** Add sitemap lifecycle sync — update `app/sitemap.ts` to exclude events older than `PAST_EVENT_REDIRECT_DAYS` (30 days) and cancelled events older than 7 days. This prevents sitemap from pointing to noindexed or redirected pages.

- [ ] **SPEC-REV-6:** Fix offers.availability mapping — add to the eventStatus fix section: cancelled → `Discontinued`, postponed → `PreOrder`, sold_out → `SoldOut`, scheduled → derive from capacity as before.

- [ ] **SPEC-REV-7:** Simplify cache strategy — remove the lifecycle-based revalidation table. Keep existing API-level 300s revalidation (already in place). The redirect and noindex strategies handle stale content without needing route-level cache changes. Remove `app/events/[id]/page.tsx` from cache-related file changes.

- [ ] **SPEC-REV-8:** Fix file map — remove `lib/structured-data/breadcrumb-schema.ts` (not needed). Change `app/events/[id]/opengraph-image.tsx` note to clarify that OG image alt is set in `generateMetadata`, not the image route. Add `app/sitemap.ts` to modified files list.

- [ ] **SPEC-REV-9:** Add no-category fallbacks — when `event.category` is null/undefined: skip category breadcrumb, skip category-based redirect (use noindex instead), skip category link in Related Events, backfill related events from any category.

- [ ] **SPEC-REV-10:** Add LiteYouTube safety — specify: use `new URL()` for parsing, allowlist YouTube hostnames (`youtube.com`, `www.youtube.com`, `youtu.be`), validate video ID is exactly 11 alphanumeric/hyphen/underscore chars, fall back to `hqdefault.jpg` thumbnail when `maxresdefault.jpg` 404s.

## ASSUMPTIONS TO RESOLVE

- [ ] **ASM-1:** The existing `permanentRedirect('/whats-on')` on API failure is a pre-existing bug — should this be changed to a temporary redirect or soft 404 as part of this work, or left for a separate fix?

## REPO CONVENTIONS TO PRESERVE

- Server components for data fetching (event page is server component)
- `anchorAPI` singleton for all API calls with `revalidate: 300`
- `HeroWrapper` + `Breadcrumbs` pattern for page headers with JSON-LD
- `EventSchema` component for JSON-LD rendering via `dangerouslySetInnerHTML` with `jsonLdSafeStringify`
- Separate server components for isolated data fetching (e.g. `UpcomingEvents` pattern) — use for RelatedEvents
- React text nodes for all user-facing content (no dangerouslySetInnerHTML)
- Existing venue constants in `lib/constants.ts` and `lib/schema-with-reviews.ts`

## REVISION PROMPT

You are revising the Event Page SEO Optimisation spec based on an adversarial review.

Apply these changes in order:

1. Replace all `/whats-on/[category]` references with actual top-level category routes
2. Add redirect safety: reject fallback data, never 301 on synthetic events
3. Add cancelled event SEO rules (7-day index, then noindex, sitemap removal)
4. Remove breadcrumb new file, use existing Breadcrumbs component with category level
5. Add sitemap lifecycle sync to exclude stale/cancelled events
6. Add offers.availability mapping alongside eventStatus fix
7. Simplify cache strategy — remove lifecycle table, keep API-level 300s
8. Fix file map (remove breadcrumb file, add sitemap.ts)
9. Add no-category fallbacks throughout
10. Add LiteYouTube safety requirements

After applying changes, confirm:
- [ ] All 10 spec revisions applied
- [ ] No sound decisions were overwritten
- [ ] Category URL mapping is correct against actual site routes
