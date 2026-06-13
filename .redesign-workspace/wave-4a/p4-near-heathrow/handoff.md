# Handoff — PR 4.6 Near Heathrow template (`/near-heathrow`)

Branch context: `codex/redesign-build`. **Uncommitted. No build run.**

## Sections built (spec §7.6, in order)
1. **InteriorHero** — crumb "Near Heathrow", kicker "Stanwell Moor Village", keyword H1 kept
   (see decision below), SSOT-checked lead. Badges (sand): "7 mins from T5" · "20 free spaces" ·
   "Outside ULEZ". Actions: `Book a table` (BookTableButton primary lg) + `Get directions`
   (outline lg, MapPin icon → Google Maps URL).
2. **AmenityStrip** — default SSOT-confirmed amenities.
3. **Why stop** (cream `bg-canvas`) — feature split. Left: left-aligned SectionHeading
   (kicker "Why stop with us", title "A better stop than the terminal", lead) + `WhyStopList`
   (5 gold check points). Right: `JourneyTimesCard` (`Card variant="dark" accent`). Mobile: list
   then card (single column, card after list via natural source order).
4. **Beer garden feature** (white `bg-surface`, flipped) — text left, image right on lg.
   SectionHeading (kicker "The beer garden", title "Planes overhead every 90 seconds",
   SSOT §9 lead). Sand badges "64 seats" · "Heated areas" · "Plane spotting". `Book a table`
   primary. **Mobile: image first** (`order-1`/`order-2` reset to image-on-top).
5. **CtaBand** — "Flying soon? Pull in first." + `Book a table` primary + `See the menu`
   outline → `/food-menu`.

Retained for SEO between sections 4 and 5: `OrganicSearchClusterLinks`, `FAQAccordionWithSchema`
(unchanged copy, so FAQPage schema still matches), `InternalLinkingSection`.

## New page-local components
- `app/near-heathrow/_components/JourneyTimesCard.tsx` — dark journey-times card.
- `app/near-heathrow/_components/WhyStopList.tsx` — 5-point gold check list.

## SSOT facts used (verified against docs/SSOT.md)
- Journey times by car (§2): Terminal 5 — **7 minutes**; Terminals 2 and 3 — **11 minutes**;
  Terminal 4 — **12 minutes**. ✓
- Bus routes (§2): **441, 442, 555** from Heathrow Central Bus Station. ✓ (old page had 442 only)
- Beer garden (§9): **64 seats**, every ~90 seconds, 500–800 ft, heated areas, service during
  kitchen hours. ✓
- M25 Junction 14 — 2 minutes (§2); Outside ULEZ (§2); 20 free spaces (§8); closest proper pub
  to T5 (§12). ✓
- "under the flight path" wording used (permitted per SSOT §1/§8/§9 and spec O1). ✓

## H1 decision
**Kept the existing keyword H1 "Pubs Near Heathrow Airport, The Anchor"** rather than the
prototype's "The closest proper pub to Heathrow". Reason: the keyword-led H1 is stronger for the
page's primary search intent (A4 + spec §7.6 explicitly permits keeping the current H1 if more
keyword-focused). The "closest proper pub to Heathrow" claim is still used in the hero lead and
the why-stop list, so the SSOT §12 claim is present without sacrificing the keyword H1.

## Metadata / JSON-LD / GTM preserved
- `generateMetadata()` unchanged (title, description, OG, Twitter, `canonical: '/near-heathrow'`).
- JSON-LD preserved: `BreadcrumbJsonLd`, `SpeakableSchema`, `parkingFacilitySchema` (both
  original `<script>` placements kept).
- GTM: all CTAs use `BookTableButton` with source attribution
  (`near_heathrow_hero`, `near_heathrow_garden`, `near_heathrow_cta`).
- Internal links to terminal subpages now flow through `OrganicSearchClusterLinks` /
  `InternalLinkingSection` (terminal-2/3/4/5 pages are Phase 5, not touched here).

## Voice / constraints
British English, sentence case, **no em dashes**, no unverified claims, heritage not referenced.
Phase-0 Tailwind names only.

## Verify
- `npx tsc --noEmit` → **clean (0 errors project-wide)**.
- Old-token audit on `page.tsx` + `_components/*` → **0 hits** (dark-theme tokens
  `anchor-green-card` / `anchor-gold-bright` / `border-line-gold` / `anchor-sage` are the correct
  Phase-0 dark-card tokens per §4.3, not retired classes).
- No commit, no build, `docs/architecture/*` untouched.

## Notes for reviewer
- Removed the long keyword-stuffed prose body, the bespoke per-terminal cards, the food/workspace
  CTA blocks and the empty-emoji icon spans from the old page. The terminal directions previously
  on this page are owned by the Phase-5 terminal subpages; cross-links are preserved via the
  cluster/internal-linking components.
- `page.tsx.backup` (legacy, pre-existing) left untouched.
