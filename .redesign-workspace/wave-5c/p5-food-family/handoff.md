# Phase 5, PR 5.8 — Food & Drink family sweep (handoff)

Branch `codex/redesign-build`. Uncommitted, no build run (per brief).

## Pages re-skinned (9 routes + shared `_components`)

| Route | Notes |
|---|---|
| `app/food-menu/gluten-free/page.tsx` | Light recipe; dietary lists via new `DietaryItemList`; DietaryMenuNav kept; CtaBand close. |
| `app/food-menu/vegan/page.tsx` | Same pattern; VEO list uses `optionFlag`/`optionNote`. |
| `app/food-menu/vegetarian/page.tsx` | `MenuRenderer` → `FoodMenuSection showFilters={false}`. |
| `app/pizza-menu/page.tsx` | Inline dark cards → `FoodMenuSection showFilters={false}`; hero gains sand Badge "Pizzas from £12" (SSOT §5). |
| `app/sunday-lunch/page.tsx` | **Roast feature split added** (reuses `SundayRoastFeature`); `MenuRenderer` → `FoodMenuSection`; carvery table re-skinned light; CtaBand close. |
| `app/fish-and-chips-heathrow/page.tsx` | Item cards → light `Card accent hover`; allergen `AlertBox` → light Card. |
| `app/drinks/page.tsx` | Full rebuild light; `MenuRenderer`→`FoodMenuSection`; `FeatureGrid`/`InfoBoxGrid` replaced inline with light `Card accent` grids; AmenityStrip added; CtaBand close. |
| `app/drinks/baby-guinness/page.tsx` | Prose/cards → light primitives; green CTA → CtaBand. |
| `app/drinks/managers-special/page.tsx` | Both branches (fallback + live promotion); dark `PricingCard` replaced inline with light `Card accent`; `FullWidthSection` green CTA → CtaBand. |

## Shared `_components`
- `FoodMenuSection.tsx` — added optional `showFilters` (default `true`); removed unused `SectionHeading` import. `food-menu/page.tsx` (4.2) unaffected (defaults to filters on).
- `DietaryItemList.tsx` — NEW. Light accent-card list of pre-filtered dietary items (name + sand Badge + gold price). Used by gluten-free + vegan.
- `SundayRoastFeature.tsx` — reused unchanged on sunday-lunch (SSOT §4 line-up, Wellington VEGAN).

## Menu data source
All menus use the page's existing live data (`getFoodMenuPageData`, `getPizzaMenuPageData`, `getSundayLunchMenuPageData`, `parseMenuMarkdown('drinks')`, dietary getters). No prototype fixtures, no invented prices. `MenuPageItem` extends `MenuItem` so `FoodMenuSection` (`item.price`) renders correctly.

## Sunday roast handling
Roast feature split = `SundayRoastFeature` (SSOT §4 exactly: Beef Topside £22, Pork Leg £20, Turkey w/ Stuffing Ball £19, Beef & Ale Pie £21, Chicken & Wild Mushroom Pie £21, Vegan Wellington £20, Kids Roast £14; Wellington flagged **Vegan**). The live "Current Sunday Roast Menu" section is retained beneath it (API-driven). No hardcoded kitchen days anywhere.

## Metadata / SEO / JSON-LD
All H1s, body copy, titles, descriptions, canonicals (incl. `sunday-lunch` → `/sunday-roast`), internal links and JSON-LD preserved. JSON-LD diffs are formatting-only (e.g. drinks `amenityFeature` collapsed to single lines; content byte-identical). FAQ schema still emitted by `FAQAccordionWithSchema` default `renderSchema=true` (matches prior behaviour). British English; no em dashes introduced.

## Shared dark components left as self-contained dark bands (NOT owned, consistent with the 4.2 reference page)
- `FAQAccordionWithSchema` — still renders a dark band; replaced wholesale in Phase 6.
- `InternalLinkingSection` (drinks, fish-and-chips) and `OrganicSearchClusterLinks` (drinks, sunday-lunch) — shared SEO dark bands, untouched.
- `DietaryMenuNav` — self-themed green/gold nav, renders fine on light; placed on light sections.

## Verification
- `npx tsc --noEmit`: clean for all 10 owned files. One **sibling** error only: `app/events/[id]/page.tsx(761,9)` (events-family agent, mid-edit) — not in scope.
- Legacy-class/old-token audit (`section-spacing|card-dark|card-warm|inner-frame|btn-friendly|anchor-bg*|anchor-gold-light|...`) on owned files: **0 hits**.
- Residual dark-theme audit (`anchor-green-deep/raised/card`, `anchor-cream-text`, `anchor-gold-bright`, `CTASection`, legacy `<Section background=>`) on owned files: **0 hits**.
- Did NOT run `npm run build`; staged nothing; committed nothing.

## Flags / notes
- No "£16 roast" price found on any owned page (sunday-lunch uses live API prices + SSOT feature split). Nothing to correct.
- `docs/architecture/*` untouched.
- One-primary-per-view respected: each CtaBand/hero has a single `primary` Button; extra actions are `outline`.
