# Handoff — PR 4.4 Private Hire template (spec §7.4)

Branch: `codex/redesign-build`. Uncommitted, no build run (per brief).

## Files changed
- `app/private-hire/page.tsx` — rebuilt body to the §7.4 design-system layout.
- `app/private-hire/_components/OccasionCard.tsx` — NEW. Linked light accent card (sand icon tile) for the Occasions grid.
- `app/private-hire/_components/CateringPackagesCard.tsx` — NEW. Dark accent card holding the REAL SSOT §11 catering packages.

## Sections built (in §7.4 order)
1. **InteriorHero** — crumb "Private Hire", kicker "Private hire", title "Host your event at The Anchor", SSOT-correct lead, badges "10 to 50 guests" / "Free parking" / "Custom catering". Actions: `Get an event quote` primary lg → `/private-hire#enquiry` + phone outline lg (PhoneButton, phone icon, "01753 682707"). (Replaced the previous SEO-style hero copy to match the spec.)
2. **AmenityStrip** — default SSOT-confirmed items.
3. **Occasions** (cream `bg-canvas`) — SectionHeading kicker "Occasions" / script "However you celebrate" / title "Every kind of get-together". 4-up `OccasionCard` (`briefcase`/`party-popper`/`cake`/`flower`) → `/corporate-events`, `/christmas-parties`, `/private-party-venue`, `/private-hire/wakes`. 1-col mobile.
4. **Why choose us** (white `bg-surface`) — feature split. Left: left-aligned SectionHeading kicker "Why choose us" / title "A pub that feels like yours for the day"; 5 gold check-marked points (bold lead-ins, SSOT-correct); `Start your enquiry` primary → `#enquiry`. Right: `CateringPackagesCard` (`Card variant="dark" accent`). 1-col mobile, card below.
5. **CtaBand** — "Let's plan your event" + `Get a quote` primary → `#enquiry` + phone outline.
6. **Existing enquiry form** (`#enquiry`) — `PrivateBookingSection` kept verbatim (logic/fields/endpoint untouched). It is a shared component not owned here; only its title/subtitle text were left in sentence case. It renders its own form via `StickyEstimatorDrawer` — no inputs are inlined on this page, so no §4.4 Input restyle was applicable. NOTE for reviewer: if a literal `<input>` enquiry form is expected here, it does not exist in the current page; the enquiry is an estimator drawer.

Preserved below the §7.4 spine (carry internal links the brief says to keep): testimonials, "Private hire near local venues" landmark grid, `InternalLinkingSection`, `OrganicSearchClusterLinks`, Accessibility block — all restyled to semantic tokens.

## SSOT §11 catering packages used (REAL, not prototype)
Sandwich Buffet £9.95pp · Finger Buffet £10.50pp · Burger Buffet £10.95pp · Premium Buffet £13.95pp · Pizza Buffet (Menu priced) · Indoor BBQ £17.99pp · Chicken Goujon Sharing Tray £35 (serves ~10, min 25). Card footnote: "Minimum 30 guests on buffet packages unless stated. Groups of 10 or more: a £10 per person deposit, fully deducted from your bill." (deposit = SSOT §7). No prototype names ("Bowl food / Pizza party / Whole venue") shipped.

## Metadata / JSON-LD / SEO preserved
- `generateMetadata` unchanged (title, description, OG, Twitter, `canonical: '/private-hire'`).
- WebPage + EventVenue JSON-LD and `BreadcrumbJsonLd` unchanged.
- GTM: phone CTAs via `PhoneButton` (tracked), no analytics removed.
- "10 to 50 guests" used (not 80). British English, sentence case, no em dashes, 1751.

## Verification
- `npx tsc --noEmit` → exit 0, 0 errors total (no sibling-page errors).
- Old-token audit (`section-spacing|card-dark|card-warm|anchor-bg*|font-serif|…`) on `app/private-hire/**` → 0 hits.
- Em-dash scan on touched files → 0 hits.
- No commit, no build run.

## Assumptions logged
- HIRE_WHY copy from `pages2.jsx` was not present in the repo; wrote 5 SSOT-verified check points (small groups from 10, free parking ~20 spaces, flexible catering, personal/direct planning + BYO decorations, 7 mins from T5 / near Staines / off M25).
- Occasion card descriptions written fresh (SSOT-safe); icons per spec.
- Removed now-unused imports (Image, HeroBadge, PageTitle, CateringPackagesTable, VenueSpacesTable, StaticHoursSummary, getCateringData in page body) since the new layout uses the static SSOT card. `getCateringData`/`getLowestFoodPrice` retained in `generateMetadata` only.
