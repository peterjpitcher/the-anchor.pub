# Handoff — Phase 4, PR 4.2: Food template (`/food-menu`)

## Files changed (uncommitted, working tree)
- `app/food-menu/page.tsx` — rebuilt body to §7.2 layout.
- `app/food-menu/_components/FoodMenuSection.tsx` — NEW (client) live-menu renderer + dietary chips.
- `app/food-menu/_components/SundayRoastFeature.tsx` — NEW (server) roast feature split.

## Sections built (spec §7.2 order)
1. **InteriorHero** — crumb "Food", kicker "Eat, Drink, Enjoy", title "Proper pub food, minutes from Heathrow", lead, badges "Mains £11 to £16" · "Pizzas from £12" · "Dog friendly". Actions: `Book a table` (primary lg → /book-table via BookTableButton) + `What's on` (outline lg → /whats-on). No kitchen-closed days hardcoded.
2. **AmenityStrip** — shared component, defaults (SSOT-confirmed).
3. **Menu** — cream (`bg-canvas py-section-y`). SectionHeading kicker "The menu" / script "Carved, baked, poured" / title "Today at The Anchor" / lead with allergen line. `FoodMenuSection`: chips `All / Vegetarian / Vegan / Gluten-free` (44px pills, `border-[1.5px]`, green-on-select white text, gold hover border, `aria-pressed`); each menu group = `font-display text-h3` heading + `<Card accent>` rows (name Outfit-500 left + optional gold `· Vegan/Veg/GF` flag, muted `text-sm` description, `font-display` gold price right `whitespace-nowrap`). Narrow container `max-w-[920px]`. Rows never stack price on mobile (`flex justify-between`).
4. **Sunday roast feature** — white (`bg-surface py-section-y`). Image left / text right, mobile image-above-text (grid `lg:grid-cols-2`, image first in DOM). Left-aligned SectionHeading kicker "Sundays · no pre-order" / title "Proper Sunday roasts" / walk-in lead (no pre-order, no Saturday cut-off, no prepayment). Roast list in accent Card. Actions: `Book a roast` (primary → /book-table) + `<Badge variant="success" dot>Served 1pm – 6pm</Badge>` (en-dash).
5. **CtaBand** — "Hungry? Grab a table." + Book a table (primary) + Find us (outline → /find-us).

(FAQ accordion + OrganicSearchClusterLinks retained between roast and CtaBand.)

## Where menu data comes from
Live data only. `getFoodMenuPageData()` (lib/menu-page-data.ts) → `menuData.menuData` (`MenuData`: categories → sections → items) passed to `FoodMenuSection`. No prototype fixtures. Filtering is client-side on the live `MenuItem` dietary flags (`vegetarian`, `vegan`/`veganOptionAvailable`, `glutenFree`/`glutenFreeAvailable`). Fish/Sunday data still fetched for FAQ copy.

## SSOT facts used
- Roast line-up hardcoded in `SundayRoastFeature.tsx` exactly per SSOT §4: Beef Topside £22 · Pork Leg £20 · Turkey w/ Stuffing Ball £19 · Beef & Ale Pie £21 · Chicken & Wild Mushroom Pie £21 · Beetroot & Butternut Squash Wellington £20 (flag **Vegan**) · Kids Roast £14. Wellington flagged Vegan, never vegetarian.
- Walk-in copy (1pm–6pm, no pre-order/Saturday cut-off/prepayment) per SSOT §4.
- Hero badges "Mains £11 to £16" / "Pizzas from £12" per SSOT §5 + §10 fact corrections.

## Preserved
- Metadata + `generateMetadata` (live price phrase), OG/Twitter images. Canonical changed `/food-menu` → `'./'` per brief + project canonical rule.
- All JSON-LD: WebPage, Menu (built from live `menuData.menuData.categories`), Restaurant (+ kitchen `openingHoursSpecification` from API), FAQPage, ItemList. `BreadcrumbJsonLd`, `SpeakableSchema` kept.
- GTM: `MenuPageTracker`, `ScrollDepthTracker`. `revalidate = 3600`.

## Verify results
- `npx tsc --noEmit` → **0 errors** (whole project; none in food-menu/_components).
- `eslint` on the 3 files → clean (no warnings).
- Old-token audit → 0 deprecated tokens (only `bg-anchor-green` on selected chip, which is the correct fixed-palette token per spec "selected = green bg").
- Em-dashes in files → 0 (range uses en-dash `&ndash;`; comments use colons/hyphens).
- No prototype fixtures shipped; roast lineup matches SSOT §4; no hardcoded kitchen days; metadata/JSON-LD preserved.

## Notes for orchestrator
- Did NOT commit, did NOT run `npm run build` (per brief).
- Did not touch shared components, other pages, or `docs/architecture/*`.
- Removed now-unused imports/helpers from the old body (StaticHoursSummary, FilteredMenuRenderer, DietaryMenuNav, pizza/dietary preview blocks, etc.). The old `/pizza-menu`, `/sunday-roast`, dietary sub-pages still exist as their own routes; the food family sweep (§8) will reskin those separately.
