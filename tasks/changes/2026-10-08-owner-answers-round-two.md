# Owner answers, round two, 8 October 2026

Branch `fix/owner-answers-round-two`. Website only. Source: the owner's answers in chat on 8 October 2026. One commit per item.

## 1. Nine facts recorded in the SSOT

Each fact sits in the section that owns it, with one changelog block in section 18. `SSOT.json` mirrors a fact only where it already held that kind of fact.

| Fact | `docs/SSOT.md` | `SSOT.json` |
|---|---|---|
| CCTV footage is kept for 1 month | Section 8, Parking | `venue.parking.cctv_footage_kept` |
| We give VAT receipts and VAT invoices | Section 8, Payment | `venue.corporate_invoicing` (receipts added, note widened) |
| "You can book a table in the garden, but not a specific table." | Section 9 | `beer_garden.table_booking_note` |
| Billy and Peter co-own the tenancy. No surname for Billy is on record | Section 1, The facts | `identity.tenancy` |
| "We don't offer any food storage for any food brought in, to avoid risks of cross-contamination." | Section 11, beside celebration cakes | `private_hire.food_storage` |
| The new dining room was built in 2024; nobody knows when the conservatory was built | Section 8, new "The dining room" | The year 1995 removed from `venue.spaces_note` and `dining_room_history` |
| "We can't guarantee a Snowball" | Section 10, Cash Bingo, and section 14, Events | `events.cash_bingo.snowball_guarantee_note` |
| Terminal 5 is the only terminal the 442 goes to | Section 2 (the route and boarding point were already there) | `location.access.bus_terminals_note` |
| The "future roles" tick is covered by the same 12 months | Section 2, Jobs | Not mirrored: the JSON holds no jobs facts |

- [x] Section 16's celebration cake wording was checked against the food storage answer. It offers a welcome and a waiver and nothing else, so it is unchanged.
- [x] `docs/SSOT.md` itself never said "built in 1995" about the conservatory. `SSOT.json` did, twice; both are corrected. The banned claim "Community hub since 1995" in section 14 is a different thing and stays.
- [x] Cash bingo copy was read for a promised or projected Snowball: `/cash-bingo`, `lib/game-nights/cash-bingo.ts`, `lib/schema.ts`, the monthly cash bingo post and the three pages that mention it. Every one explains the rule or points at that night's own page. None names a future amount, so no page changed.
- [x] `tests/ssot-drift-guard.test.ts` pins all nine in both files, and fails if a year is put back on the conservatory. 96 cases pass.

## 2. Privacy policy

- [x] CCTV: "We keep the footage for 1 month", where the notice mentions CCTV, and a "CCTV footage: 1 month" line in section 7.
- [x] Opens: "The emails we send through Resend record whether they were opened." The Resend line in section 6 now reads "delivered, opened or bounced".
- [x] Future roles: section 3 says ticking the box is the same 12 months.
- [x] Stripe: the notice never named it. A test now keeps it out.
- [x] Company number and registered office: none added. Orange Jelly Limited's own notice (`www.orangejelly.co.uk/privacy`, read 8 October 2026) gives neither. It says the business is "based in Stanwell Moor", so section 1 now reads "Orange Jelly Limited, a small business based in Stanwell Moor". Nothing else was taken from it.
- [x] The words changed, so `PRIVACY_POLICY_WORDS_FINGERPRINT` in `lib/legal-pages.ts` moved. The date stays at 8 October 2026: that is the day this was written. If it goes live on a later day, move the date to that day.
- [x] Test: `tests/unit/privacy-policy-owner-answers.test.tsx`.

## 3. Job application form

- [x] Beside the tick: "I agree for The Anchor to keep my details for future suitable roles. We keep them for 12 months, then delete them." Tested from the form's source in the same file as item 2.

## 4. Seven thin posts retired, with permanent redirects

Done the way PR #222 did it: concrete rules in `config/redirects/blog-redirects.json`, served by `middleware.ts`; each folder deleted; older addresses repointed; `npm run sitemap:lastmod` run.

| Post | Goes to | Why that page |
|---|---|---|
| `buy-one-get-one-free-on-all-pizza-every-tuesday` | `/food-menu#pizza` | An ended pizza offer; the pizzas are on the menu |
| `pizza-deals-stanwell-heathrow-tuesdays` | `/food-menu#pizza` | The same ended offer |
| `national-burger-day` | `/food-menu#burgers` | A 2023 half price burger offer; the burgers are on the menu |
| `pravha-beer` | `/drinks` | A beer the stub said is no longer available; the drinks page is what we pour now |
| `stanwell-moor-brew` | `/drinks` | The same |
| `free-pint-offer-this-november` | `/drinks` | An ended free pint offer |
| `company-celebrations` | `/corporate-events` | The live page for company parties |

- [x] The two menu targets carry a section, as the retired `/food/pizza` and `/burger-menu` pages already do. The middleware keeps a section on a redirect target.
- [x] Fourteen older Wix and `/post/` addresses that landed on one of the seven now go straight to the new page: no chains.
- [x] Each of the seven answered 200 on the live site before the change (one plain GET each, redirects off). All seven were already marked noindex, so none was in the sitemap.
- [x] No page, component or other post linked to any of them.
- [x] Test: `tests/seo-indexing.test.ts` follows all 21 addresses through the middleware on both hosts: one 301, the destination equal to the rule's target with its section, no `next.config.js` pattern or `vercel.json` rule in the way, folder gone, nothing in the sitemap, no link left.
- [x] `npm run audit:redirects`: no problems found.

## 5. `/free-parking` goes to the free parking section

- [x] The rule in `config/redirects/additional-redirects.json` now targets `/find-us#parking` (the `id="parking"` section on `app/find-us/page.tsx`) instead of `/heathrow-parking`, the paid product.
- [x] `app/free-parking/page.tsx`, a legacy page file the middleware answers before, points at the same place so the two cannot disagree.
- [x] Test: the address is followed through the middleware on both hosts, with and without a query string. A query string is kept and sits before the section.

## 6. Unused endpoints removed

- [x] Already done: the `DELETE` in `app/api/table-bookings/[reference]/route.ts` and `cancelTableBooking()` went in PR #230. The file does not exist on main.
- [x] Removed now: `GET /api/calendar/upcoming`, `GET /api/reviews/status`, `GET /api/health` and `POST /api/events/[id]/availability`. Each answers 404.
- [x] Removed with them, because nothing else used them: `anchorAPI.checkEventAvailability()` and its wrapper in `lib/api/events.ts`, the `EventAvailability` type, `buildEventsCalendarIcs()` in `lib/event-calendar.ts`, and `lib/health-check.ts`.
- [x] Tests removed or trimmed: `tests/api/health.test.ts` and `tests/api/event-availability-fails-closed.test.ts` (both only served a deleted route), one case each in `operational-read-resilience` and `rate-limits-on-routes`, and three paths in `api-cache-policy`. `tests/api/table-bookings.test.ts` asserts the four files stay gone and the four neighbours the site uses stay.
- [x] `docs/architecture/routes.md` and `relationships.md` no longer list them.

**Proof nothing pointed at them.**

| Looked in | Result |
|---|---|
| `app`, `components`, `lib`, `hooks`, `content`, `scripts`, `public` for each address | No fetch, link or import. The only hits were the routes themselves. |
| `config/redirects/*.json`, `middleware.ts`, `next.config.js`, `vercel.json` | No rule names any of them. |
| `.github` workflows | None calls `/api/health` or any of the others. |
| Management app export (`mgmt-main`) for `the-anchor.pub/api`, `calendar/upcoming`, `reviews/status`, `/api/health` | No reference. |
| Add to calendar button | Uses `/api/calendar/event/[id]`, which stays. |
| The event booking form | Reads `/api/events/[id]`, which stays. It never posted to `/availability`. |

**Kept on purpose.** `/api/calendar/event/[id]`, `/api/reviews`, `/api/events`, `/api/events/[id]`, and `/api/careers` (the owner's September decision).

## 7. `npm audit fix`, without `--force`

| | Critical | High | Moderate | Low | Total |
|---|---|---|---|---|---|
| Before | 1 | 49 | 5 | 2 | 57 |
| After | 1 | 39 | 9 | 0 | 49 |

- [x] Only `package-lock.json` changed. `package.json` is untouched. 103 locked packages moved, each within its existing major version.
- [x] Backed out: the `@typescript-eslint` family, left at 8.40.0. Its fix pulled in `eslint-visitor-keys` 5 and `minimatch` 10 underneath it, both major versions. With that family the total would have been 44.
- [x] What is left needs a major version of `next`, `jest`, `jest-environment-jsdom`, `tailwindcss` or `@tailwindcss/typography`, which npm only does with `--force`.

## 8. `CLAUDE.md`, two lines

- [ ] Not changed on this branch. The two replacement lines were handed back to the lead session to apply.

## Gates

Run on the final tree, Node 20.19.5.

- `npm run lint:next`: no ESLint warnings or errors.
- `npx tsc --noEmit`: clean.
- `npm test` (London): 318 suites, 5733 passed, 1 skipped.
- `npm run test:utc`: 318 suites, 5733 passed, 1 skipped.
- `npm run build`: completed, 232 static pages. None of the four removed addresses and none of the seven retired posts is in the build output.

## Assumptions

1. The line in `SSOT.json` that says the conservatory was built for George and Alex Best's wedding reception stays, with its year removed. The owner withdrew the date, not the story.
2. The opens line in the privacy policy names Resend, not every email, because job application emails go through Microsoft 365.
3. "Based in Stanwell Moor" is the only thing taken from Orange Jelly Limited's own notice.
4. The free pint post goes to `/drinks`, the page for what is on the bar, because no page covers offers.
5. Nothing outside the code calls the four removed addresses: an uptime monitor on `/api/health`, or a calendar app subscribed to the upcoming events feed, would not show in the code.
6. A major version pulled in underneath a package counts as that package changing a major version, so the `@typescript-eslint` family was backed out.
