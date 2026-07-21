# Christmas 2026 - Cross-Repo Build Plan

Date: 2026-07-21
Repos: `/Users/peterpitcher/Cursor/OJ-The-Anchor.pub` (website), `/Users/peterpitcher/Cursor/OJ-AnchorManagementTools` (management app)
Source: seven read-only scout reports (menu model, menu API, booking/deposit, pre-order, Christmas page, live-menu pattern, SSOT delta)

---

## 0. The offer we are building for (owner-confirmed 2026-07-21)

- Service window **10 November to 20 December 2026** (replaces 1 Nov to 23 Dec).
- Every Christmas dinner booking: **6 or more guests**, **at least 24 hours notice**.
- **1 course:** pre-book only, no pre-order.
- **2 and 3 course:** pre-book **and** pre-order.
- **£10 per person deposit on every Christmas booking**, taken at booking, any party size.
- 1-course adult: turkey 23, pork 24, beef 25 (provenance: adult Sunday roast + 7).
- 1-course kids: turkey 18, pork 19, beef 20 (provenance: kids Sunday roast + 4).
- Adult includes a glass of prosecco, swappable for orange juice, on 1, 2 and 3 course.
- Kids include a fruit shoot or a small draught soft drink (coca cola, diet coke, lemonade), on 1, 2 and 3 course.
- Trimmings: pigs in blankets, stuffing, brussels sprouts.
- **Discontinued everywhere:** shared party nights, All the Trimmings Board, XL board, per-person add-ons (pigs in blankets, stuffing balls, cauliflower cheese pot, extra roast potatoes, extra Yorkies), Bundle A (prosecco + coffee and mince pie), separate drinks bundles.
- Full dish list **not finalised**. 2- and 3-course prices **not confirmed**.

---

## 1. Architecture verdict

**The prior is confirmed: Christmas prices live in the management database and reach the website through the menu API. Nothing is hardcoded on the site.** Three independent lines of evidence support it, and one part of the prior needs a correction.

**Confirmed, because:**

1. The data layer already supports it with no schema change. `menu_menus.code` is a unique text column and a `christmas` row is legal (`supabase/migrations/20251123120000_squashed.sql:16368`). `menu_dish_menu_assignments` already carries `available_from` and `available_until` DATE columns (`squashed.sql:16467-16468`), editable by staff in `DishMenusTab.tsx:156-167`, so the 10 Nov to 20 Dec window is expressible as data. The flattened view `menu_dishes_with_costs` is fully generic and already exposes `menu_code`, `category_code`, `available_from`, `available_until` (`supabase/migrations/20260527000001_menu_dishes_with_allergen_fields.sql:4-39`).
2. The website already has a proven live-menu pipeline: `anchorAPI.getMenu()` into `lib/menu-page-data.ts` (`buildMenuData` / `buildMenuPageData`) into page render plus JSON-LD from `priceValue`. `app/sunday-roast/page.tsx` is a working end-to-end template including an unavailable state and a null-JSON-LD guard.
3. The SSOT pricing policy (`docs/SSOT.md:3`) bans *sourcing or quoting* prices from anywhere but the live DB, not displaying them. `tests/ssot-drift-guard.test.ts:169-181` enforces `LIVE_FROM_DB` sentinels on every Christmas price key. Serving live prices is the only compliant path; writing 23/24/25 into SSOT.json, JSX or JSON-LD fails the guard and breaches the policy.

**One correction to the prior.** A new `christmas` menu is **not** automatically exposed by any existing endpoint. Every public menu route hardcodes its menu code: `/api/menu` filters `code = 'website_food'` at `src/app/api/menu/route.ts:12` and `:37`; specials at `specials/route.ts:18`; dietary at `dietary/[type]/route.ts:29,56`; Sunday lunch at `src/lib/table-bookings/sunday-preorder.ts:177`. There is no `?menu=` parameter and no `/api/menu/[code]` route. **A roughly 10-line generalisation of `/api/menu` is required and is on the critical path.**

**Recommended shape:**

- `/api/menu` accepts optional `?menu=<code>` against an allowlist (`website_food`, `sunday_lunch`, `christmas`, `drinks`), defaulting to `website_food`. Backwards compatible with every current caller. Preferred over a bespoke `/api/menu/christmas` route, which would be a 120-line copy-paste that does not scale.
- Website adds `anchorAPI.getMenu(menuCode)` and `getChristmasMenuPageData()` in `lib/menu-page-data.ts`, mirroring `fetchSundayLunchPageData`.
- The **derivation rules stay provenance only**. Do not compute Christmas prices from live roast prices on the site: that creates a second source of truth, and a roast price change would silently move Christmas prices the booking system does not charge. Store absolute Christmas prices in the management DB.
- Booking rules (6 guests, 24 hours, £10pp deposit, pre-order by course) are **SSOT facts, not menu data**. They render regardless of API state.

**Second architectural decision: the booking engine.** The 6-guest minimum, the 24-hour notice, the type-aware deposit and per-guest pre-order have **no existing model**. `table_booking_type` is `('regular','sunday_lunch')` only (`squashed.sql:8573`), there is no minimum-party mechanism above 1 anywhere, there is no minimum-notice rule anywhere, and the Sunday pre-order runtime was retired in May 2026 (commit `6b2ac376`, 3,604 deletions). Recommendation: **split the programme in two and ship the menu and content half first**, because it is safe, reversible and independent of payments.

- **Phase A (safe):** SSOT, website copy, discontinued-item removal, live Christmas menu page, management-side menu container. No payment code, no deposit logic.
- **Phase B (payments and production data):** `christmas` booking type, 6-guest gate, 24-hour gate, type-aware deposit, per-guest pre-order rebuild. Every item requires explicit owner approval.

Until Phase B lands, Christmas dinner bookings continue to be taken through the existing enquiry flow (`app/api/enquiry/christmas/route.ts` posting to management `external/create-booking`), which is unchanged and safe.

---

## 2. Work items in dependency order

### WAVE 0 - Facts and guards (website repo, safe)

Nothing else can land cleanly until the SSOT states the new offer, because every content change is validated against it.

| # | File | Change |
|---|---|---|
| 0.1 | `docs/SSOT.md:197-199` | Replace the three Christmas lines with the new block: deposit restated, plus a new `### Christmas 2026 (owner-confirmed 2026-07-21)` section covering service window, 6-guest minimum, 24-hour notice, deposit, pre-order by course, adult and kids inclusions, trimmings, price sourcing (`LIVE_FROM_DB`, derivation as provenance only), and "dish list not finalised". |
| 0.2 | `docs/SSOT.md:408` | Qualify the pre-order allowance: private events, and 2-course and 3-course Christmas only. 1-course is pre-book without pre-order. |
| 0.3 | `docs/SSOT.md` section 14 (after line 452) | Add a `### Christmas (retired 2026-07-21)` banned-claims block naming every discontinued item, the retired weekday/weekend price split, the superseded 1 Nov to 23 Dec window, and sub-6-guest or same-day Christmas bookings. |
| 0.4 | `docs/SSOT.md:15` | Stamp line: add "Christmas 2026 offer confirmed 2026-07-21". |
| 0.5 | `SSOT.json:863` | `christmas_2026_service_window` becomes `"2026-11-10 to 2026-12-20; reconfirm before publishing a later season"`. |
| 0.6 | `SSOT.json:862` | `christmas_sit_down_meals` becomes: minimum 6 guests, 24 hours notice, 1-course pre-book only with no pre-order, 2-course and 3-course pre-book and pre-order. |
| 0.7 | `SSOT.json:860-861` | Replace `christmas_menus_weekday_gbp` and `christmas_menus_weekend_gbp` with `christmas_one_course_gbp`, `christmas_two_course_gbp`, `christmas_three_course_gbp`, all `"LIVE_FROM_DB"`. Keep `christmas_menus_from_gbp` (859). |
| 0.8 | `SSOT.json:906-918` | Replace the two `Festive Menu (weekday)` and `(weekend)` catalogue entries with three course entries (`Christmas Dinner (1 course)`, `(2 course)`, `(3 course)`), each `price_per_head_gbp: "LIVE_FROM_DB"`, `min_guests: 6`, `style: "sit-down"`. |
| 0.9 | `SSOT.json` (new top-level) | Add a `christmas_2026` object: window start and end, `min_party_size: 6`, `min_notice_hours: 24`, `deposit_per_person_gbp: 10`, `deposit_taken_at_booking: true`, `deposit_refundable: false`, `pre_order_required_by_course {one:false,two:true,three:true}`, adult and kids inclusions, trimmings array, `menu_status`, `price_source: "LIVE_FROM_DB"`, `price_derivation_note` (provenance only), `two_and_three_course_prices: "NOT_YET_CONFIRMED"`. |
| 0.10 | `SSOT.json:748-761` `discontinued_offers` | Add entries for Shared Christmas Party Nights, All the Trimmings Board, XL Board, Christmas per-person add-ons, Bundle A and drinks bundles. This array is in the guard's `SKIP_TOP` set, so naming the items here is safe. |
| 0.11 | `SSOT.json:1203-1221` `do_not_use` | Add `christmas_discontinued_formats` and `christmas_window_1nov_23dec`. Also guard-skipped. |
| 0.12 | `SSOT.json:6-7` | Bump `version` to `1.0.3`, `generated` to `2026-07-21`. |
| 0.13 | `tests/ssot-drift-guard.test.ts:160-165` | Line 161 asserts `'1-course is pre-book only with no pre-order'`. Line 162 asserts `'2026-11-10 to 2026-12-20'`. Line 163 asserts the new markdown pre-order sentence. Line 164 asserts `'10 November to 20 December 2026'`. |
| 0.14 | `tests/ssot-drift-guard.test.ts:173-174` | Replace the weekday and weekend key names in the `LIVE_FROM_DB` loop with the three course key names, or the loop fails on `undefined`. |
| 0.15 | `tests/ssot-drift-guard.test.ts` (new assertions) | Pin the three new rules: `min_party_size === 6`, `min_notice_hours === 24`, `deposit_per_person_gbp === 10`. Nothing currently asserts these. |

Gate: `npx jest tests/ssot-drift-guard.test.ts` green.

**Deferred to owner (0.16):** `SSOT.json:864` `christmas_buffets: "Available for 26+ guests"` contradicts `min_guests: 30` at lines 922, 927 and 932. Pre-existing drift, not caused by this change. Buffets are **not** on the discontinued list, so leave the entries in place and ask the owner which figure is right.

### WAVE 1 - Management app: menu container (safe code, one production data step flagged)

The detached-HEAD warning applies. See section 6 before committing anything in this repo.

| # | File | Change |
|---|---|---|
| 1.1 | new `supabase/migrations/<ts>_christmas_menu_container.sql` | **DRAFT ONLY at this stage.** Insert `menu_menus ('christmas','Christmas Menu', ...)`, insert `menu_categories` for the course tiers (for example `christmas_one_course`, `christmas_two_course`, `christmas_three_course`), and map them in `menu_category_menus`. No dish rows, no prices. Additive only, touches no existing menu. |
| 1.2 | `src/app/api/menu/route.ts:12,37` | Generalise: read optional `?menu=` from the query string, validate against an allowlist (`website_food`, `sunday_lunch`, `christmas`, `drinks`), default `website_food`, and substitute the resolved code at both hardcoded literals. Keep `withApiAuth(handler, ['read:menu'], request)` and the `createApiResponse` envelope unchanged. |
| 1.3 | `src/lib/api/schema.ts:311-338` (`menuToSchema`) | Accept a menu name rather than hardcoding "The Anchor Menu", so Christmas JSON-LD is not mislabelled. Also guard `item.price.toString()` at line 325 against null (an existing latent crash). |
| 1.4 | `src/app/(authenticated)/menu-management/dishes/page.tsx:512` | Extend the hardcoded label map so `christmas` renders a friendly label instead of the raw code. Cosmetic but staff-facing. |
| 1.5 | New test | Cover `/api/menu?menu=christmas` (allowlisted code resolves), `?menu=bogus` (rejected or falls back), and no param (still `website_food`). |

Note: once the `christmas` menu row exists, it appears automatically in the dish drawer's menu dropdown and the dishes-page filter with no further code change. Staff can then build the menu themselves.

### WAVE 2 - Website: live Christmas menu data layer (safe)

| # | File | Change |
|---|---|---|
| 2.1 | `lib/api/client.ts:1001-1005` | `getMenu(menuCode = 'website_food')` hitting `/menu?menu=${menuCode}`, keeping `revalidate: 0`. Add `getChristmasMenu()` as a thin wrapper. All existing callers are unaffected by the default. |
| 2.2 | `lib/api/client.ts:1302-1329` (`getFallbackResponse`) | Add an **empty** Christmas fallback so the production build does not break. During `NEXT_PHASE=phase-production-build` external fetches are skipped and there is currently no `/menu` fallback at all, so the page must render sensibly with zero sections. |
| 2.3 | `lib/menu-page-data.ts` | Add a `ChristmasMenuPageData` type and `fetchChristmasMenuPageData`, plus `export const getChristmasMenuPageData = cache(...)`. Reuse `mapApiItem` so `price` (symbol-free), `priceValue`, `priceLabel`, allergens and dietary flags stay consistent. **Never throw**: return `unavailableReason`, mirroring `fetchSundayLunchPageData` at L453-461. |
| 2.4 | `lib/menu-page-data.ts` (beside L369-385) | Add a Christmas staleness gate modelled on `rejectStaleSundayMenu`. The retired pattern must match the discontinued **product** wording, not bare ingredient words: `shared party night`, `all the trimmings`, `xl board`, `stuffing ball`, `cauliflower cheese pot`, `extra roast potato`, `extra yorkie`, `bundle a`, `drinks bundle`. Pigs in blankets and stuffing are legitimate trimmings inside a dish and must not trip the gate. |
| 2.5 | new `lib/christmas-season.ts` | Season-state helper. Parse the window from `SSOT.json` `christmas_2026` (parse, do not restate). Compare against **Europe/London today** using the in-repo precedent `getLondonIsoDate` (`lib/api/client.ts:387-406`). Return `'pre_release'`, `'active'` or `'ended'`. Key on "can you still book a date inside the window" (bookings open months ahead, plus 24 hours notice), not "is today inside the window". Must not depend on the API being up. |
| 2.6 | Tests | Unit tests for the staleness gate, the season helper across all three states, and the unavailable path returning `unavailableReason` rather than throwing. |

**Do not copy** `app/food-menu/_components/SundayRoastFeature.tsx:11-15` (`formatDisplayPrice`). It prepends `£` to per-item prices in breach of `docs/SSOT.md:5`. It is a live violation; log it as separate debt, do not propagate it. Also do not copy the regex-a-number-back-out approach used in `app/pizza-menu/page.tsx:23` and similar; use `priceValue`.

### WAVE 3 - Website: `/christmas-parties` rebuild (safe)

Order matters: remove discontinued items before adding the new menu section, so the page never briefly shows both.

**3.1 Dates, every hardcoded 1 Nov and 23 Dec claim.** Consolidate to a single parsed source; the constants are currently duplicated in three places with no shared import.

| File | Line | Now |
|---|---|---|
| `app/christmas-parties/page.tsx` | 45 | Hero lead "Bookings run 1 November to 23 December" |
| `app/christmas-parties/client-components.tsx` | 78, 79 | `CHRISTMAS_BOOKING_START` and `CHRISTMAS_BOOKING_END` |
| `app/christmas-parties/client-components.tsx` | 155 | FAQ "1 November to 23 December 2026" |
| `app/api/enquiry/christmas/route.ts` | 9, 10 | Duplicate constants |
| `tests/unit/christmas-parties-schema.test.ts` | 82 | Asserts the old ISO window string |

`lib/christmas-parties-schema.ts:23-39` already derives the window from `SSOT.json` and needs no edit. It picks up the new dates automatically once 0.5 lands.

**3.2 Remove discontinued items.**

- Shared party nights: `client-components.tsx:109` (`PARTY_FORMAT_OPTIONS`), FAQs at `:198-199` and `:226-227`, card copy at `:464` and `:534`; `app/api/enquiry/christmas/route.ts:14` (`VALID_PARTY_FORMATS`) and `:76` (label map).
- Trimmings-board image `client-components.tsx:724` (`/images/page-headers/christmas-parties/2026/trimmings-board.jpg`) and the generic add-on residue at `:843-844`, `:862-864`, `:873`, `:904`.
- Dead plumbing: the `extras: string[]` context field (`:34, 42, 1362, 1580-1585`) is never populated by any UI. Remove it rather than carry it into the API payload.
- Also fix while here: `xmasHoneypot` (`:1306`) and `lbHoneypot` (`:1630`) setters are never called and no honeypot input is rendered, so spam protection on both forms is inert.
- **Buffets are NOT discontinued.** Leave section 9 (`:823-924`), the `festive_buffet` option, the 26-guest branch at `:1539` and `route.ts:285`, and `lib/christmas-parties-schema.ts:13,111` intact. Only reconcile the 26-versus-30 figure after 0.16.

**3.3 Correct the pre-order claims.** Blanket "pre-order only" is now wrong for 1 course. Every site listed here is a course-conditional rewrite: `client-components.tsx:492, 495, 522, 668, 713, 719, 748-749, 969, 1243, 1263, 1458, 1929`, FAQs at `:223, 231`; `app/api/enquiry/christmas/route.ts:69` (`enquiryLabel` hardcodes "(pre-order only)"), `:117` and `:153` (email body "Pre-order required: Yes" unconditionally); `lib/christmas-parties-schema.ts:66`.

**3.4 Add the new booking rules to the page and the enquiry API.**

- **24-hour notice: net new, exists nowhere.** Date inputs at `client-components.tsx:1558-1559` and `:1907-1908` use only `min={CHRISTMAS_BOOKING_START}`, so today is selectable. The API validates only the window (`route.ts:293`). Add a client-side floor of London-tomorrow and a matching server-side check.
- **6-guest minimum:** already correct for the meal path; keep. Add explicit copy.
- **Course structure (1/2/3), prosecco or orange juice, and the kids drink inclusion: net new.** No file models them today. Add as content, and if the enquiry form is to carry them, as structured fields.
- `route.ts:323-333`: the management payload currently drops `mode`, `service` and `partyFormat` as structured fields, surviving only as free text in `notes`. If course tier is captured, send it structurally or it is lost too.

**3.5 The live-priced menu section.** Replace section 6 in place, `client-components.tsx:646-707`, "Christmas menu options at a glance". It already holds the price table (placeholder strings at `:655, 659, 663`), its footnote at `:668` is already the booking-rules paragraph, it sits directly above the pre-order process section, and its CTAs at `:671-704` already open both journeys so no new tracking IDs are needed.

Plumbing: `app/christmas-parties/page.tsx:31` is a synchronous server component passing only `structuredData`. Make it `async`, call `getChristmasMenuPageData()`, add `export const revalidate = 3600`, and add a prop to `ChristmasPartiesPageClientProps` (`client-components.tsx:46-48`). `app/sunday-roast/page.tsx:124-126` is the working reference.

Three render states, all rendering the page and never 404ing (the URL is indexed and internally linked via `lib/internal-linking-data.ts` and `app/sitemap.ts`):

1. **Pre-release (today's reality):** show the structure, that is 1/2/3 course, adult prosecco or orange juice, kids fruit shoot or small draught soft drink, trimmings, plus the confirmed 1-course prices **from the DB**, with "full dish list released closer to the time". No `Menu` JSON-LD without dishes.
2. **In season:** full live render, `Menu` and `Offer` JSON-LD emitted.
3. **After 20 December:** switch to evergreen private-hire copy and drop the dated offers.

**API-unavailable behaviour:** copy the section-level fallback from `app/sunday-roast/page.tsx:222-242` (an accent Card headed "menu temporarily unavailable" with a `PhoneLink`), **not** the whole-page bail at `app/food-menu/page.tsx:152-158`. Booking rules, deposit, window and enquiry CTA stay valuable without the dish list. Branch the metadata description on menu availability as `generateMetadata` does at `app/sunday-roast/page.tsx:36-38`.

**JSON-LD:** build a `buildMenuJsonLd`-style pure function that **returns `null` when there are no items** (`app/sunday-roast/page.tsx:95`). `Offer.price` must be `priceValue.toFixed(2)`, a bare numeric string, never the display label. Per-item display prices stay symbol-free per `docs/SSOT.md:5`.

**3.6 Course tiers with unconfirmed prices.** The type must allow a tier to be absent and render "confirmed on enquiry" rather than a zero or empty price. `formatMenuPrice` returns `''` for values at or below zero (`lib/menu-page-data.ts:181`), so the component must check for the empty string as `SundayRoastFeature.tsx:28` does. **Do not publish a 2-course or 3-course figure, a "from" figure, or a JSON-LD offer for those tiers until the owner confirms them and they are loaded into the DB.**

### WAVE 4 - Website: test updates (safe, but two are hard blockers)

| File | Lines | Action |
|---|---|---|
| `tests/unit/christmas-parties-schema.test.ts` | 57-66 | **Hard blocker.** Asserts no `price`, `priceCurrency` or `priceSpecification` key and no `£` or decimal figure anywhere in the schema. Must be relaxed if Christmas `Offer`s are emitted. Needs the owner decision at 5.2. |
| `tests/ssot-drift-guard.test.ts` | 168-181 | **Hard blocker**, handled at 0.14. |
| `tests/unit/christmas-parties-schema.test.ts` | 76-84, 88-93 | Window string and `/pre-order only/i` assertions both change. |
| `tests/unit/christmas-parties-booking-journeys.test.ts` | 16-20, 23-29, 32-37 | Asserts the exact string "All sit-down Christmas lunches and dinners are pre-order only.", the hero meta "Sit-down festive meals by pre-order", and the min/max date wiring. |
| `tests/unit/christmas-parties-responsive.test.ts` | 15-16, 31-35 | Asserts the exact class strings of the `FESTIVE_PRICING` section and the literal "3. Send your pre-order". |
| `tests/api/christmas-enquiry.test.ts` | 69-86, 108-130 | Asserts notes contain "Sit-down Christmas lunch (pre-order only)". |
| `tests/seo-indexing.test.ts` | 459-462 | Blog internal link; check the linked post is not shared-party-night content. |
| `tests/unit/hero-template-regressions.test.ts` | 16-21 | Should survive; re-run to confirm. |

Also out of guard scope and therefore invisible to CI: `CUSTOMER_DIRS` at `tests/ssot-drift-guard.test.ts:206` is `['app','components','content/blog','lib']`, so `content/copy-decks/christmas-parties-2026-seo-rewrite.md` is **not scanned**. It carries stale shared-party-night pricing at lines 81, 106 and 374, plus discontinued-item copy at 22, 64, 81-82, 106, 156, 180, 197, 201, 373-374, 403-404, 426. `content/blog/christmas-party-food-ideas/index.md:65, 133` is scanned and does mention the discontinued items. Both need a manual pass.

### WAVE 5 - Management: booking engine (PAYMENTS, approval gated, see section 3)

Do not start until Phase A has shipped and the owner has approved each item individually.

| # | Change | Files |
|---|---|---|
| 5.1 | Own migration, ahead of anything referencing it: `ALTER TYPE public.table_booking_type ADD VALUE 'christmas'`. Postgres cannot add an enum value in a transaction that then uses it. **One-way: enum values cannot be removed.** | new migration |
| 5.2 | Regenerate `src/types/database.generated.ts`. **It is already stale**: `deposit_amount_locked`, `event_ticket_types` and `booking_items` are all missing. Requires connecting to production. | `src/types/database.generated.ts` |
| 5.3 | Read the **live** `pg_get_functiondef` for `create_table_booking_v05` before writing anything. `20260730000002_fix_drinks_kitchen_pacing.sql` patched the body by string replacement, so the live body may differ from any migration file. | n/a |
| 5.4 | RPC: add `p_booking_type` (or `p_christmas boolean`). A signature change means repeating the exact `DROP FUNCTION` / `CREATE OR REPLACE` / `REVOKE` / `GRANT` block. Keep `booking_purpose='food'` so kitchen gating and pacing at `:290-324` and `:520-576` keep working unchanged. | new migration |
| 5.5 | RPC: 6-guest minimum, a new blocked reason such as `below_min_party`. Nothing exists to extend; there is no minimum above 1 anywhere. | RPC plus `src/app/api/table-bookings/route.ts:54`, `src/app/api/foh/bookings/route.ts:35` |
| 5.6 | RPC: 24-hour notice gate, a new blocked reason. Keep the `LEAST(v_booking_start, v_now + INTERVAL '24 hours')` hold at `:605` so a booking made at 24h plus one minute does not get a hold expiring after service starts. | RPC |
| 5.7 | RPC: type-aware deposit at `:597`, becoming `v_deposit_required := (v_booking_type = 'christmas' OR p_party_size >= 10) AND NOT COALESCE(p_deposit_waived,false)`. Line `:626` already computes `party_size * 10`, so the amount needs no change. **Also start writing `table_bookings.deposit_amount` in the INSERT at `:627-676`**, see the trap in section 4. | RPC |
| 5.8 | TS: `src/lib/table-bookings/deposit.ts`, `requiresDeposit()` and `computeDepositAmount()` take a booking type. **All 11 call sites must move together** or TS and SQL silently disagree. | `deposit.ts` plus `api/table-bookings/route.ts:480,489,538`, `api/foh/bookings/route.ts:20-22,87,1138,1311,1527`, `api/external/.../paypal/create-order/route.ts:78`, `.../capture-order/route.ts:89`, `app/g/[token]/table-payment/page.tsx:287`, `lib/table-bookings/ui.ts:71,202,208,249`, `lib/table-bookings/staff-deposit-transitions.ts:9-11,144-146`, `FohCreateBookingModal.tsx:124,511,631`, `useFohCreateBooking.ts:183,415-436`, `BookingDetailClient.tsx:433` |
| 5.9 | UI labels: `src/lib/table-bookings/ui.ts:249` hardcodes "Deposit required (10+ covers)" and `:202` is `requiredByPartySize`. Both are wrong for a 6-guest Christmas booking. | `ui.ts` |
| 5.10 | Website blocked-reason mapping: `blocked_reason` at `src/app/api/table-bookings/route.ts:97-108` is a **closed literal union** and will not accept new reasons without editing. Mirror in `mapTableBookingBlockedReason` (`src/lib/table-bookings/bookings.ts`) and on the website. | both repos |
| 5.11 | Service window: add a `system_settings` key rather than hardcoding 10 Nov to 20 Dec in the RPC. The RPC already reads `system_settings` at `:290-300` and `:585`, so the pattern is established, and the window changes annually. | RPC plus settings |
| 5.12 | Config debt: `sites.deposit_amount` and `sites.min_group_size_deposit` (default 7, contradicting the live rule of 10) are read only by the settings screen and by no booking or payment path. Either wire them up as the single source of truth or delete them. A settings screen that appears to control deposits but does not is a live footgun. | `20260701000000_site_settings_columns.sql:14-15`, `src/app/actions/site-settings.ts:76` |

### WAVE 6 - Management: pre-order rebuild for 2 and 3 course (approval gated)

This is a **rebuild, not a config change**. The Sunday pre-order runtime was deleted in May 2026 and `src/lib/table-bookings/sunday-preorder.ts:699-720` now actively refuses to persist pre-orders for non-legacy bookings.

Missing pieces, in dependency order:

1. **Per-guest identity.** `table_booking_items` is quantity-per-dish. `guest_name` exists but **no code anywhere writes it**. Recommendation: mirror the live event pattern exactly, that is `booking_items` with `attendee_names text[] not null default '{}'` (`supabase/migrations/20260721000000_event_ticket_types_tables.sql:27-38`), and reuse `src/lib/events/attendee-names.ts` `normalizeAttendeeNames`. That code is live, tested, and solves the same problem.
2. **Drink inclusion model.** Prosecco versus orange juice, and fruit shoot versus soft drink, have no home. `item_type` is `main|side|extra`, constrained to `main|side`. Either a second zero-priced line per guest, or a new option-group table. Neither exists.
3. **Adult versus kids distinction.** `high_chair_count` is the only child-related field on `table_bookings`. The event side solves this with ticket types; table bookings have no equivalent, so the 23/24/25 versus 18/19/20 split has nowhere to live.
4. **Guest capture surface.** `/g/[token]/sunday-preorder` is a 14-line stub. The `guest_tokens.action_type` CHECK (`20260420000016:22-32`) has no Christmas value.
5. **Kitchen prep sheet.** The 612-line generator was deleted; the route returns 410. Pre-orders for 2 and 3 course are useless to the kitchen without it.
6. **Reminder cadence.** The 48h and 26h SMS cron, its templates and the GitHub workflow were deleted.
7. **Website transport.** `CreateTableBookingSchema` (`src/app/api/table-bookings/route.ts:46-71`) has no field for menu choices, and there is no website proxy route for one.

Reusable as-is: `table_booking_items` plus the `menu_dish_id` FK, the incremental save algorithm at `sunday-preorder.ts:538-676` (which deliberately avoids a delete-then-insert race), guest-token infrastructure, the BOH PATCH route, and the booking-detail items table.

---

## 3. Safe work versus approval-gated work

### Safe to execute now (code, copy, schema drafting, tests)

- All of Wave 0 (SSOT markdown and JSON, drift-guard test edits).
- Wave 1 items 1.2 to 1.5 (API generalisation, schema helper, label map, tests). Item 1.1 is a **draft migration file only**.
- All of Wave 2 (website data layer, season helper, staleness gate, tests).
- All of Wave 3 (page rebuild, copy, discontinued-item removal, JSON-LD).
- All of Wave 4 (test updates), plus the copy-deck and blog manual pass.
- Drafting, but not applying, every Wave 5 and Wave 6 migration.

### Requires explicit owner approval before execution

**Production data mutations:**

1. **Applying the `christmas` menu container migration (1.1)** to the live database. Additive and low risk, but it is production DDL and data.
2. **Creating Christmas dish rows with prices.** Blocked on the 2-course and 3-course prices, and on the allergen question in section 5.
3. **Deactivating the festive `catering_packages` rows** seeded by `20260405120000_standardise_catering_options.sql:193-226` and `20260512000005_fill_catering_package_fields.sql:103-115`. These are the nearest surviving artefacts of the party-night set menus. **This is a production data change, not a code change**, and they are private-hire packages rather than table-booking products, so confirm they are in scope before touching them.
4. **Any backfill or state correction on existing `table_bookings` rows.** There is precedent (`20260509000014_add_deposit_amount_locked.sql:42` nulled `deposit_amount` for sub-10 parties). Do not repeat that pattern without sign-off.
5. **Regenerating `src/types/database.generated.ts`**, which requires connecting to the production project.

**Payments:**

6. **Any change to `create_table_booking_v05`, `confirm_table_payment_v05` or `record_table_cash_deposit_v05`.** These decide whether a customer is charged and how much. They are `SECURITY DEFINER`, and `create_table_booking_v05` is currently executable by `anon` (the grant block in `20260728000000_highchair_outside.sql` after `:790` flags this as a regression of the `20260711000000` hardening).
7. **Any change to `src/lib/table-bookings/deposit.ts`.** Every payment surface reads it: PayPal order creation, pre-capture amount verification, the guest payment page, the staff UI. A wrong value charges the wrong amount or blocks capture outright.
8. **`ALTER TYPE public.table_booking_type ADD VALUE 'christmas'`.** One-way, enum values cannot be removed.
9. **Publishing any 2-course or 3-course price**, in the DB or on the site.

---

## 4. Risks to existing bookings, existing menus and the Sunday roast flow

**High, the £0 deposit trap.** `getCanonicalDeposit` (`deposit.ts:67-87`) reads locked, then stored, then computed. The RPC **never writes `table_bookings.deposit_amount`** (INSERT column list at `20260728000000_highchair_outside.sql:627-676`), so there is no stored amount to fall back on. If the SQL is made Christmas-aware but the TS helper is not, a 6-guest Christmas booking computes **£0**: `create-order/route.ts:87-92` rejects with "No deposit required for this booking", and `capture-order/route.ts:89` derives an expected amount of 0 that never matches PayPal, producing a 409 and a `payment.capture_amount_mismatch` audit event. Mitigation: write `deposit_amount` in the RPC (smaller and safer than relying on recomputation) **and** update all 11 TS call sites in the same changeset. Never ship 5.7 without 5.8.

**High, RPC drift.** `20260730000002_fix_drinks_kitchen_pacing.sql` patches the live function body by string replacement. The migration files are not a reliable picture of what is running. Writing a new body from a stale migration file would silently revert the pacing fix. Mitigation: read live `pg_get_functiondef` first (5.3).

**Medium, Sunday roast flow.** `loadSundayLunchMenuItems` (`sunday-preorder.ts:172-314`) resolves by `menu_menus.code = 'sunday_lunch'`, so a new `christmas` menu cannot collide with it. But note two things. First, that read path selects only `dish_id, category_id, sort_order` from assignments (`:184-190`) and **ignores `available_from` and `available_until` entirely**, so if Christmas were ever served through this pattern it would not switch off on 20 Dec. Second, `resolveItemType()` (`:118-127`) derives type from the **category code string** (contains "extra" means extra, contains "side" means side, otherwise main), so Christmas category codes must avoid those substrings if they ever flow through it. Christmas should go through `/api/menu`, which does filter dates (`route.ts:77-78`).

**Medium, end-date off-by-one.** `new Date('2026-12-20') < now` parses as midnight UTC, so an item with `available_until = 2026-12-20` disappears throughout 20 December. To keep 20 Dec bookable, either set `available_until = 2026-12-21` or fix the comparison in the read paths. Owner decision required, see section 5.

**Medium, production build.** During `NEXT_PHASE=phase-production-build` external fetches are skipped (`lib/api/client.ts:575-589`) and there is no fallback for `/menu`. A Christmas page that assumes non-empty sections will break the build output. Covered by 2.2 and the pre-release render state.

**Medium, auto-cancellation of Christmas holds.** `src/app/api/cron/table-booking-deposit-timeout/route.ts` cancels `pending_payment` bookings past `hold_expires_at`. A Christmas booking taken 25 hours out and unpaid would be auto-cancelled roughly an hour before service. Probably desired, but the owner should confirm.

**Low, the existing `/api/menu` contract.** Generalising with a defaulted `?menu=` parameter is backwards compatible: every current caller passes nothing and continues to get `website_food`. Cover with a test (1.5).

**Low, existing Christmas enquiries.** `app/api/enquiry/christmas/route.ts` normalises legacy payloads at `:45-55` (`dinner` becomes `meal`, `buffet` becomes `party`). Keep that normalisation when editing, or in-flight forms and cached pages break.

**Pre-existing defects found in passing (park or fix explicitly, do not silently inherit):**

- `lib/api/client.ts:1239` calls `/api/table-bookings/menu/sunday-lunch`, which **exists in neither repo**. Browser-side calls 404 and fall back to an empty menu. Harmless today only because every caller is a server component.
- `SundayLunchMenuResponse` (`lib/api/menu.ts:111-116`) declares `menu_date` and `cutoff_time`; the API returns neither.
- `SundayRoastFeature.tsx:11-15` prepends `£` to per-item prices against `docs/SSOT.md:5`, and it renders on both `/sunday-roast` and `/food-menu`.
- `getPriceFrom` (`lib/menu-page-data.ts:281`) produces "from 16" with no `£`, surfaced as aggregate copy at `app/food-menu/page.tsx:118` and `:184`, which breaches the same policy in the opposite direction.
- `components/features/MenuDisplay.tsx` is dead code, nothing imports it.

---

## 5. Factual gaps only the owner can fill

1. **2-course and 3-course prices.** Blocks the price table, the "from" figure, the JSON-LD offers for those tiers, and any DB dish rows for them. Recommendation: ship the page with 1-course prices live and the other two tiers reading "confirmed on enquiry".
2. **Do the 1-course prices stay `LIVE_FROM_DB` or become literals in SSOT?** This decision determines whether `tests/ssot-drift-guard.test.ts:168-181` and `tests/unit/christmas-parties-schema.test.ts:57-66` need relaxing. Recommendation: **keep them `LIVE_FROM_DB`**. It satisfies the pricing policy, matches how Sunday roast already works, and means a price change never needs a code deploy. Relax only the schema test, so priced `Offer`s can be emitted from live data.
3. **Does the "Christmas party" (non-dinner) journey survive?** The whole dual-journey architecture, that is hero CTAs, mode toggle, party-format select and sticky CTA wiring, hinges on this. Removing shared party nights takes one option out of the select; collapsing to a single Christmas dinner journey is a much larger rebuild. Recommendation: **keep both journeys**, since private hire and buffets are not on the discontinued list.
4. **Is 20 December inclusive?** Drives `available_until = 2026-12-21` versus a code fix to the date comparison. Recommendation: **inclusive**, so guests can book a 20 December sitting, implemented via the code fix so the data reads honestly.
5. **`christmas_buffets`: 26 or more guests, or 30 or more?** `SSOT.json:864` says 26, the three package entries at 922, 927 and 932 say 30. Pre-existing contradiction.
6. **Are the festive `catering_packages` rows the discontinued "party nights"?** If yes, deactivating them is a production data change (see section 3, item 3).
7. **Allergen model for Christmas dishes.** `menu_dishes.allergen_flags` and `dietary_flags` are **computed**, not hand-entered: `menu_refresh_dish_calculations()` aggregates them from `menu_ingredients` up through recipes. To get correct allergens on a turkey, pork or beef Christmas dinner, the dishes must be built from ingredient rows, not just a name and a price. The owner needs to decide whether staff will do that work, or whether the page carries an "ask us about allergens" line for Christmas.
8. **Confirm the auto-cancel behaviour** for unpaid Christmas deposits taken more than 24 hours out (see section 4).
9. **Kids drink wording.** The offer says "fruit shoot or small draught soft drink (coca cola, diet coke, lemonade)". Confirm the exact customer-facing wording and brand capitalisation before it goes into the SSOT.

---

## 6. Uncommitted files in the management repo

`OJ-AnchorManagementTools` is in **detached HEAD** (`git branch --show-current` returns empty). Any commit made there would be orphaned. It also has uncommitted work:

```
 M tasks/lessons.md
?? scripts/import-indeed-applicants-2026-07-19.ts
?? scripts/import-indeed-applicants-2026-07-20.ts
?? scripts/reject-recruitment-candidate.ts
?? scripts/repair-indeed-import-cv-text-2026-07-19.ts
?? tasks/recruitment-timezone-audit-spec-review.md
?? tasks/recruitment-timezone-audit-spec.md
```

None touch menus, bookings or payments, so there is no content collision with this work. Procedure before any Christmas work in that repo:

1. Run `git status` and confirm the seven files above are still the only changes.
2. Run `git checkout -b feat/christmas-2026-menu` **from the current detached HEAD**, so the checked-out commit is preserved and nothing is orphaned.
3. Do **not** run `git stash`, `git checkout -- .`, `git clean` or `git reset --hard`. The four untracked scripts are one-off recruitment imports and are not recoverable from anywhere.
4. Commit only explicitly named paths (`git add <path>`), never `git add -A` or `git add .`, so the recruitment files are never swept in.
5. If a branch switch is unavoidable, untracked files follow the working tree and are safe. Only `tasks/lessons.md` (modified) needs care, so leave it uncommitted.

The website repo (`OJ-The-Anchor.pub`) is clean on `main`. Branch as `feat/christmas-2026-offer` before Wave 0.

---

## 7. Suggested commit gates

| Gate | Contents | Verification |
|---|---|---|
| G1 | Wave 0 | `npx jest tests/ssot-drift-guard.test.ts` |
| G2 | Wave 1 (code only, migration drafted not applied) | management lint, typecheck, new API test |
| G3 | Wave 2 | website `npm run lint`, `npx tsc --noEmit`, new unit tests |
| G4 | Wave 3 and Wave 4 | full website pipeline: lint, typecheck, `npm test`, `npm run build` |
| G5 | Migration application plus dish rows | **owner approval**, then `npx supabase db push --dry-run` first |
| G6 | Wave 5 | **owner approval per item**, staging verification of a real deposit capture |
| G7 | Wave 6 | **owner approval**, separate programme |

G1 to G4 are safe and can proceed now. G5 onwards must not start without sign-off.
