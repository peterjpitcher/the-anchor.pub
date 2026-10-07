# Allergens and dietary labels (P02), 7 October 2026

Branch `fix/allergens-and-dietary-labels`. Website only. Source: the 7 October 2026 site review, package P02, findings C3-001, C3-002, C3-003, C3-004, C3-007, C3-013, C3-014, C3-047, C1-003, C4-037, B1-013, B2-003, B2-007, with the checkers' corrections and the owner's decisions (facts 22, 23, 24 and 30).

## What changed

- [x] **Allergen filter on `/food-menu`.** Once any allergen is chosen, a dish with no allergen data leaves the main list and is shown in its own group, headed "We don't hold allergen details for these dishes". An empty allergen list means unknown, not safe (SSOT sections 5 and 16). The sorting lives in `classifyMenuItemForAllergens` in `lib/menu-allergens.ts`.
- [x] **The per-dish "no data" line** is now the SSOT's required sentence, "See menu or contact us for allergen information", from one constant (`ALLERGEN_UNKNOWN_WORDING`). It was "Ask our bar team about allergens before you order." on the menu pages and the SSOT sentence on the Christmas menu.
- [x] **Two FAQ answers on `/food-menu`** no longer send people to "filters" for NGCI options. There is no NGCI filter. The NGCI block is pasted under the menu introduction, because dish descriptions say "NGCI gravy" before anything explains it.
- [x] **`/food-menu/gluten-free`** counts and names only the dishes the kitchen flags as NGCI. Pizzas are said separately ("Our stone-baked pizzas can be made on an NGCI base on request.") and are not listed, counted or named. "With allergen details" is gone from the description, the hero, the section lead and the Menu structured data. Garlic bread is no longer treated as changeable unless its own menu text says so.
- [x] **Dietary labels trust the kitchen's flags.** The name matching is removed. What is left can only take a label away: vegan goes if milk, eggs, fish, crustaceans or molluscs is listed; vegetarian goes if fish, crustaceans or molluscs is listed. "Vegan option" is shown only if the kitchen flags it, and the management app has no such flag today.
- [x] **`/food-menu/vegan`** gains a "Sundays" block for the Sunday roast mains flagged vegan (the Wellington), and now lists the Garden Veg Burger.
- [x] **`/sunday-roast`**: both Wellington lines use the SSOT section 16 wording.
- [x] **Book a Table**: the dietary answer is rebuilt from SSOT sections 5 and 16 with NGCI spelt out, and the NGCI block sits under the sample dishes whenever one of them mentions NGCI.
- [x] **Pizza page**: "allergens are listed on each pizza" shows only when every pizza has allergen data; the vegan-option line shows only when a pizza carries that flag; the NGCI base answer carries the one-kitchen sentence.
- [x] **Private hire**: one constant, `PRIVATE_HIRE_DIETARY_WORDING` in `lib/approved-wording.ts`, used on the wakes page (three places), in `app/private-hire/near/[slug]/page.tsx` (nine places) and on `/corporate-events` (one place). It names no diet and makes no promise.
- [x] **Other pages**: `/heathrow-layover-dining`, `/restaurants-near-heathrow`, the fish and chips notice (in `SSOT.json`) and `lib/tag-seo-content.ts`.
- [x] **Blog**: five posts, all checked live (HTTP 200) on 7 October 2026 before editing.
- [x] **Kids mac and cheese** removed from the four places it was typed.
- [x] **Guard tests** added (three files, listed below).

## Assumptions

1. A dish flagged vegan or `dairy_free` with an empty allergen list still goes in the "no details" group when Milk is chosen. The rule is about the allergen list, and nothing else stands in for it. Chips, Chunky Chips and Sweet Potato Fries are affected today.
2. The pizzas are not listed by name on the NGCI page at all. The brief says to name only flagged dishes; a link to the pizza menu does the rest.
3. The private hire sentence does not name vegetarian, vegan or NGCI options. The SSOT section 11 is silent on private hire dietary options and the owner's ruling is "we never promise, we do our best".
4. "Vegan option" needs a kitchen flag that does not exist yet, so no dish shows it. Before this change no dish showed it either (no pizza carries a vegetarian flag).
5. A meat word in a dish name no longer removes a vegetarian label. Meat is not an allergen, so no listed allergen can contradict the flag. A wrong vegetarian flag is a record to fix in the management app.
6. `/corporate-events` was not in the findings list. Its two dietary promises are the same kind as the private hire ones, so the same sentence was used there.
7. The Kids Mac & Cheese fixture in `tests/unit/menu-price-labels.test.ts` is left alone: it is test data for price labels, not copy.

## Not changed, on purpose

- The brochure PDFs and the management app (out of scope).
- The six blog folders that redirect (none of this package's lines is in them).
- `components/features/AllergenFilterBar.tsx`: not mounted on any page.
- Older blog posts that say "special dietary requirements catered for" (`mothers-day-at-the-anchor-march-19th`, `easter-weekend-fun-at-the-anchor-pub`, `valentines-special`): not in this package's findings.
- `content/copy-decks/`: drafts, not served.

## Tests added

- `tests/unit/allergen-filter-unknown-dishes.test.tsx`: with Milk chosen, a dish with an empty allergen list is not in the main filtered list and is in the "no details" group.
- `tests/unit/dietary-flags-and-ngci-page.test.tsx`: labels follow the kitchen's flags; the NGCI page, its FAQ structured data and its search description name and count only flagged dishes.
- `tests/allergen-wording-guard.test.ts`: fails on "nut-free", "gluten free is possible", "accommodate most" and "cater for allergies" in `app/`, `components/`, `content/` and `lib/`, lets an honest denial through, and checks `lib/approved-wording.ts` against SSOT section 16 word for word.

## Results (7 October 2026, Node 20.19.5)

- `npm run lint:next`: "No ESLint warnings or errors"
- `npx tsc --noEmit`: exit 0, no output
- `npm test`: "Test Suites: 268 passed, 268 total", "Tests: 1 skipped, 3389 passed, 3390 total"
- `npm run test:utc`: "Test Suites: 268 passed, 268 total", "Tests: 1 skipped, 3389 passed, 3390 total"
- `npm run build`: "Compiled successfully", "Generating static pages (277/277)"
- Production build on port 3510, driven in a headless browser against the live menu:
  - Milk chosen: 20 dishes in the main list, 17 in the "no details" group (it was 37 in one list).
  - Gluten chosen: 5 dishes in the main list, the same 17 in the "no details" group (it was 22 in one list).
  - `/food-menu/gluten-free` names Chunky Chips and Sweet Potato Fries only.
  - `/food-menu/vegan` lists the Garden Veg Burger and, under Sundays, the Wellington.
  - `/sunday-roast` shows the Wellington as "Vegan" and carries the section 16 wording twice.

## Records to correct in the management app (not done here)

- Allergens missing: every pizza, both garlic breads, Chips, Chunky Chips, Sweet Potato Fries, the six burger add-ons, every Sunday roast main and both Sunday sides.
- Salt & Chilli Squid & Chips, Sticky Toffee Pudding, Chocolate Fudge Cake and Chocolate Fudge Brownie list no gluten, so they pass the Gluten filter.
- Kids Mac & Cheese is still active on the kids menu.
- Garden Stack, Margherita, Veggie Classic, Garlic Bread and Garlic Bread + Mozzarella carry no vegetarian flag.
