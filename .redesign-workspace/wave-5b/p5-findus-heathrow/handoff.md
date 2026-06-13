# Phase 5, PR 5.5 — Find Us / Heathrow-audience family sweep — Handoff

Branch: `codex/redesign-build` (working tree, **uncommitted, no build run** per brief).

## Scope: all 18 owned pages re-skinned to light theme

`find-us` · `near-heathrow/terminal-2|3|4|5` · `plane-spotting-heathrow` · `dog-friendly-pub-heathrow` · `family-friendly-pub-heathrow` · `heathrow-family-dining` · `heathrow-hotels-pub` · `heathrow-layover-dining` · `luggage-storage-heathrow` · `pre-flight-meal` · `restaurants-near-heathrow` · `pub-garden-heathrow` · `beer-garden` · `pool-darts-pub` · `m25-junction-14-pub`

No page-local `_components` dirs exist; none created.

## Conversion applied per page (Phase-5 recipe §8)

- Heroes already `InteriorHero` — left untouched (only added `AmenityStrip` directly under each hero).
- Legacy dark `Section` / raw `<section className="section-spacing* bg-anchor-green-*">` → `<section className="py-section-y">` + `bg-canvas`/`bg-surface` (+ `bg-surface-sunk` for inset panels) + existing container.
- `.card-dark` / inline `bg-anchor-green-raised|card` panels → light `<Card accent>` (+`hover` on linked/feature cards); `CardBody` for padding.
- Shared dark components replaced at call-site with light primitives (they are not owned and stay dark): `FeatureGrid`→light `<Card>` grids, `InfoBoxGrid`→`<Card>` grids, `AlertBox`→`<Card accent>`, `PageTitle`→`<h2 className="font-display text-h2 text-ink-strong">`, `CTASection` (the dark green block from `@/components/ui` re-export of `components/CTASection.tsx`)→`<CtaBand>`.
- Dark text → `text-ink`/`text-ink-strong`/`text-ink-muted`; small gold text/links → `text-accent-text` (hover → `hover:text-anchor-green`, since no `text-link-hover` token exists in Tailwind config — verified).
- Loose `font-bold text-2xl/3xl/xl` headings → `font-display text-h2/h3/h4` (display face is single-weight; never bold).
- Journey/terminal info, the home "Experience real pub culture" promo, find-us "Book your visit" band, and CtaBand address/postcode cards kept as deliberate **dark surfaces** using `theme-dark` + `bg-anchor-green-card`/`border-line-gold`/`text-anchor-cream-text` (per spec these dark-surface tokens are correct, not legacy).
- Closing CTAs → `<CtaBand>` (multi-button CTAs use `children`; phone CTAs preserved as `PhoneButton`, map links as `DirectionsButton`/`Button asChild`).
- Accessibility: data tables (heathrow-layover, restaurants) given `<th scope="col">`/`<th scope="row">`.

### find-us specifics (§7.1 Find Us block)
- Built the Find Us block explicitly (did NOT use the dark shared `FindUsSection`): `<Card accent>` address card (with `PhoneLink`/`WhatsAppLink`/`EmailLink` + `DirectionsLink`, wrapped in `SpeakableContent selector="contact-info"` to preserve speakable schema) + the existing **map embed** via `GoogleMapEmbed` (kept) + full-width `<Card accent>` "Opening hours & flight path" containing `<WeekHours/>` inside `SpeakableContent selector="opening-hours"`.
- `WeekHours` sits inside the app-level `BusinessHoursProvider` (wraps the whole app in `app/layout.tsx:252`), so the live-hours context resolves correctly. Also swapped the two legacy `BusinessHours` instances on find-us / hotels / m25 to `WeekHours` (light, same provider).
- Section id `visit-us` preserved on the Find Us block.

## Metadata / JSON-LD / links — preserved (A4 + §12)
- `git diff` shows **0** changed lines touching `metadata`, `canonical`, `openGraph`, `alternates`, `application/ld+json`, `@context`/`@type`, or schema generators on all spot-checked pages. H1s (hero titles), body copy, and internal links unchanged. British English; no em dashes introduced. No SSOT facts altered (e.g. "Sunday roast From £16" on hotels/restaurants left as existing copy per A4 re-skin-only — see flag below).

## Verification
1. `npx tsc --noEmit` → **clean** for all 18 owned files and the whole project (no sibling errors).
2. Legacy-class / old-component audit on the 18 files → **0** hits for `card-dark|card-warm|section-spacing|inner-frame|btn-friendly|anchor-gold-light|anchor-gold-vivid|warm-white|font-merriweather|<CTASection|<FeatureGrid|<InfoBoxGrid|<AlertBox|<PageTitle`.
3. Remaining `anchor-cream-text`/`bg-anchor-green-card` occurrences are all inside intentional `theme-dark` dark surfaces (CtaBand text, dark journey/promo/address cards, find-us Book band).
4. No build run, nothing staged/committed (per brief).

## Shared components flagged (NOT owned; still dark — slated for Phase-6 cleanup)
- `components/FeatureCard.tsx` (`FeatureGrid`/`FeatureCard`), `components/InfoBox.tsx` (`InfoBoxGrid`), `components/AlertBox.tsx`, `components/CTASection.tsx`, `components/FindUsSection.tsx`, `components/ui/layout/Section.tsx`, `components/HeroBadge.tsx`, `components/BusinessHours.tsx`, `components/ui/typography/PageTitle.tsx`, and the SEO/plane-spotting helpers (`InternalLinkingSection`, `OrganicSearchClusterLinks`, `HeathrowFoodBestFor`, `PlaneSpottingScheduleNote`, `PlaneSpottingBookingPrompt`, `GoogleReviews`) still render dark/cream. They are left in place (out of scope) and remain visible on these pages — they should be re-skinned or retired in their owning PRs/Phase 6. `HeroBadge` (beer-garden, terminals) renders a dark Google-rating chip on a now-light section.

## Notes / minor
- Section background alternation (cream/white) is mostly applied but a few consecutive same-tint sections remain on the large terminal/restaurants pages — cosmetic only, cards/headings still separate them.
- A4-preserved copy that conflicts with SSOT (flag for a copy pass, not changed here): heathrow-hotels-pub & restaurants-near-heathrow say "Sunday Roast … From £16" (SSOT §10 wants "From £19"); heathrow-family-dining JSON-LD asserts `Baby Changing`/`Wheelchair Accessible` true and beer-garden/find-us mention accessible-toilet/ramp nuances — all left verbatim per "re-skin, don't re-write".
