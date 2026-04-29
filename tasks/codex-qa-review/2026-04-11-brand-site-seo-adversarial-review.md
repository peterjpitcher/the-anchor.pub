# Adversarial Review: Brand Site Event Page SEO Optimisation Spec

**Date:** 2026-04-11
**Mode:** Spec Compliance (Mode C — pre-implementation)
**Engines:** Claude + Codex (4 reviewers)
**Scope:** `docs/superpowers/specs/2026-04-11-event-page-seo-optimisation-design.md` vs brand site codebase
**Spec:** Event page SEO optimisation design

## Executive Summary

The spec direction is sound — the 3 bug fixes, keyword consumption, and new content sections are all well-reasoned. However, Codex found **4 high-severity spec defects** that would cause implementation failures: wrong category URL routes, unimplementable cache strategy, missing cancelled-event SEO rules, and redirect integrity risks from synthetic fallback data. Additionally, the spec incorrectly claims breadcrumb JSON-LD is missing (it already exists via the Breadcrumbs component) and proposes a new file for it unnecessarily.

## What Appears Solid

- Event interface updates (8 new fields) — correct, low-risk, API already returns them
- eventStatus bug fix — confirmed hardcoded, mapping is correct
- Past event noindex for one-off events — correct approach
- Image alt text fix — confirmed generic, fallback chain is good
- Keywords meta tag addition — correct, low-cost
- OG title using metaTitle — correct
- Social proof, cancellation policy, accessibility sections — well-placed, correct rendering approach
- LiteYouTube concept — confirmed raw iframes, significant CWV win
- Related events concept — `getUpcomingEventsByCategory()` helper already exists
- Venue schema enrichment — correct, should reuse existing constants

## Spec Defects Requiring Revision

### SD-1: Category URLs don't exist (High)
**Engines:** Codex (Spec Trace + Assumption Breaker)

The spec references `/whats-on/[category]` for redirects and internal links, but this route **does not exist**. The site uses top-level category pages: `/quiz-night`, `/cash-bingo`, `/music-bingo`, `/karaoke`, `/live-music`, `/open-mic`. The only `/whats-on/` sub-route is `/whats-on/drag-shows`.

**Fix:** Use the actual category page URLs for redirects and internal links. Map category slugs to their top-level routes.

### SD-2: Cache strategy not implementable as written (High)
**Engines:** Codex (Spec Trace + Assumption Breaker)

The spec proposes dynamic `revalidate` values based on event date distance, but:
- Current caching lives in the API client (`revalidate: 300` on fetch), not the page route
- Next.js route-level `revalidate` cannot be computed dynamically per-request after the fetch
- The page has no `revalidate` export currently

**Fix:** Keep the existing API-level 300s revalidation. For stale past events, the 301 redirect makes caching moot. For recently past events, 300s is fine (content is static). Remove the lifecycle-based cache table from the spec — it adds complexity with minimal SEO benefit beyond what the redirect strategy already provides.

### SD-3: Cancelled event SEO not addressed (High)
**Engines:** Codex (Spec Trace)

The spec fixes eventStatus schema mapping for cancelled events but doesn't address:
- Should cancelled events be noindexed?
- Should they be removed from the sitemap?
- Should they redirect?
- Current sitemap includes cancelled events with status filter `'scheduled,rescheduled,postponed,sold_out,cancelled'`

**Fix:** Add cancelled event rules: keep indexed for 7 days (people search "is [event] cancelled"), then noindex. Remove from sitemap after 7 days. Don't redirect — the cancellation notice itself has SEO value.

### SD-4: Redirect integrity risk from fallback data (High)
**Engines:** Codex (Security + Assumption Breaker)

The API client silently returns **synthetic fallback events** when the real API is down. If the stale-event redirect lookup uses `getEvents()` during an outage, it could:
- 301 redirect to a fake event URL
- Show fake related events
- Permanent redirects are cached by browsers and CDNs — wrong ones are very hard to undo

**Fix:** The redirect lookup must explicitly detect and reject fallback/synthetic data. Add a check: if the API response contains fallback markers (or if the event has a synthetic ID), skip the redirect and fall back to `noindex, follow` on the current page. Never 301 based on fallback data.

### SD-5: Breadcrumb JSON-LD already exists (Medium)
**Engines:** Codex (Repo Reality Mapper)

The spec says "visual breadcrumbs exist but no schema" and proposes creating `lib/structured-data/breadcrumb-schema.ts`. In reality, the `Breadcrumbs` component already injects `BreadcrumbList` JSON-LD. The existing schema just needs a category breadcrumb added to the trail.

**Fix:** Remove the new file from the file map. Instead, modify the breadcrumb data passed to `HeroWrapper` to include the category level. The existing `Breadcrumbs` component handles JSON-LD automatically.

### SD-6: Sitemap not updated for lifecycle (Medium)
**Engines:** Codex (Spec Trace)

The spec adds noindex/redirects for past events but doesn't update `sitemap.ts`. Currently the sitemap includes ALL events from `2000-01-01`. Stale past events that are noindexed or redirected should be removed from the sitemap.

**Fix:** Add sitemap updates to the migration strategy: exclude events older than 30 days, exclude cancelled events older than 7 days.

### SD-7: offers.availability not fixed alongside eventStatus (Medium)
**Engines:** Codex (Spec Trace)

The spec fixes eventStatus but doesn't address `offers.availability`, which is only derived from `remainingAttendeeCapacity === 0`. For cancelled/postponed events, availability should be set regardless of capacity.

**Fix:** Map event status to offers.availability: cancelled → `Discontinued`, postponed → `PreOrder`, sold_out → `SoldOut`.

## Security Observations (Advisory)

- **SEC-1 (Low):** XSS risk is minimal — React text nodes escape by default. JSON-LD uses a safe stringify that escapes `<`. No `dangerouslySetInnerHTML` for event content fields.
- **SEC-2 (Medium):** Current YouTube embed uses substring matching (`url.includes('youtube.com')`), not proper URL parsing. The LiteYouTube component should use `new URL()` + hostname allowlist + 11-char video ID regex.
- **SEC-3 (Medium):** Existing bug: API failure triggers permanent redirect to `/whats-on`. A transient outage can poison CDN caches with wrong 301s. This is pre-existing but the spec shouldn't add more 301 paths without addressing it.
- **SEC-4 (Low):** `previous_event_summary` and `attendance_note` render as first-party assertions. Consider adding subtle "Reported by venue" label.

## Recommended Fix Order

1. **SD-1:** Fix category URLs (blocks redirects and internal links)
2. **SD-4:** Add fallback data rejection for redirect safety
3. **SD-3:** Add cancelled event SEO rules
4. **SD-5:** Remove breadcrumb file, use existing component
5. **SD-6:** Update sitemap for lifecycle
6. **SD-7:** Fix offers.availability alongside eventStatus
7. **SD-2:** Simplify cache strategy (remove lifecycle-based table)
