# Five owner answers, 8 October 2026

Branch `fix/owner-answers-8-october`. Website only. Source: the owner's yes to each of the five in chat on 8 October 2026. One commit per item.

## 1. The old parking status page and the unused booking reads are deleted (PY-009)

- [x] `app/parking/bookings/[id]/page.tsx`, the old status page, is removed. The live journey ends on `/heathrow-parking/confirmation/[bookingId]`.
- [x] `app/api/parking/bookings/[id]/route.ts`, a read nothing called, is removed.
- [x] The `GET` in `app/api/table-bookings/[reference]/route.ts` is removed, with the client's `getTableBooking()`, which could only ever answer 501.
- [x] `/parking/bookings/:id` redirects permanently to `/heathrow-parking` (`config/redirects/additional-redirects.json`). The address holds a booking id, so it is a pattern rule: `next.config.js` serves it before middleware. The test matches it with Next's own `path-to-regexp` and checks that neither middleware nor `vercel.json` catches it first.
- [x] Tests that only served the deleted code are removed or rewritten (`parking-booking-read-privacy`, `api-cache-policy`, `rate-limits-on-routes`, `table-bookings`). The exempt entry in `scripts/audit-hero.js` and the row in the table booking README went too.

**Kept on purpose.**

- `anchorAPI.getParkingBooking()` and `toPublicParkingBooking()`: the confirmation page uses them. A test now asserts the confirmation page is the only page or component that reads a parking booking.
- The `DELETE` in `app/api/table-bookings/[reference]/route.ts` and `cancelTableBooking()`. It is not a read, so it was outside the yes. Nothing on the site calls it either and it can only answer 501.
- `'/parking/bookings/'` in `lib/web-vitals-record.ts`. It masks a booking id in a recorded path and costs nothing to keep.

**Proof nothing live pointed at what was deleted.**

| Looked in | Result |
|---|---|
| `app`, `components`, `lib`, `content` for `parking/bookings` | The only link to the status page was its own "Refresh status" link. The only other hits are the POST route `api/parking/bookings` (kept) and the management endpoint the confirmation page reads. |
| Same folders for a fetch of `/api/parking/bookings/<id>` or `/api/table-bookings/<reference>` | None. The parking wizard goes to `/heathrow-parking/confirmation/<id>`. |
| `config/redirects/*.json`, `middleware.ts`, `next.config.js`, `vercel.json` | No rule sent anyone to either address. |
| Management app export (`mgmt-main`), every file type, for `the-anchor.pub/...parking...` | Only the public parking pages (`/heathrow-parking`, the terminal pages, two blog posts, coach parking). |
| Same export for `the-anchor.pub/api/...` or `.../table-booking...` | Only `/api/web-vitals`. |
| The export's parking texts, emails and PayPal addresses (`src/lib/parking/public-links.ts`) | Guests are sent to the management app's own `/parking/guest/[id]` page, and PayPal returns to its own `/api/parking/payment/return`. One of its tests asserts the old `/parking/bookings/<id>?cancelled=true` address is not used. |

## 2. Mother's Day, Easter Sunday and Father's Day stop promising the regular roast

Ruling: each is a special day whose menu is confirmed nearer the time (`docs/SSOT.md` sections 4 and 10).

- [x] Cut from all three pages: the roast and its dishes, the gravy and vegan wording, "1pm to 6pm", "last booking 5:30pm", "no set sittings", walk-ins and "no pre-order", the "Browse menus" cards and the links that offered the Sunday roast menu as the day's menu.
- [x] The same promises are out of each page's title, description, Open Graph and Twitter text and its FAQ. The FAQ structured data is built from the FAQ, so it follows. There was no Event data to fix.
- [x] Kept: the date, the booking buttons, the group deposit line, the location copy and the "confirmed nearer the time" notice. No new claim.
- [x] The three link descriptions in `lib/internal-linking-data.ts` lose "Sunday roast". The event button label in `lib/mothers-day-booking.ts` is "Book Mother's Day Lunch", the wording the page's own button already used.
- [x] `tests/unit/occasion-pages-roll-forward.test.tsx` fails any of the three pages that names a roast, a dish, a serving time or walk-ins.

Judgement calls:

- The Mother's Day photo strip is removed. Two of its three pictures were roasts, one captioned "Roasts cooked fresh to order".
- The Easter hero and share image is the general pub picture, as on the other two pages. It was the roast picture.
- The Easter weekend card no longer says "full kitchen service" and "Full menu" across Good Friday to Easter Sunday. It says the pub is open as normal, the regular evening menu runs Friday and Saturday, and Easter Sunday's menu is confirmed nearer the time.
- The walk-in launch banner (`LaunchAnnouncement`) is off the three pages. It has shown nothing since 17 May 2026 and was a walk-in announcement.
- "Lunch" stays in the existing button labels and headings. It is not a menu claim.

Not touched: `lib/tag-seo-content.ts` still describes an Easter menu, egg hunts and an "Easter Sunday roast" on the blog tag pages. That file belongs with the blog work.

## 3. "Receptions" is off the garden parties "Perfect for" list

- [x] `app/summer-garden-parties/page.tsx`: the list is Birthdays, Team Socials and Christenings, as three cards.
- [x] Every other use of the word on the private hire pages was read. Each names what the reception is (funeral, wake, christening, drinks, cocktail, standing) and stays. The one that did not was the register office template, removed under item 4.

## 4. The Great Fosters page stops talking about a register office

- [x] `lib/local-seo-data.ts`: the entry is type `other`, with the name, the address and a description that says only that Great Fosters is a hotel in Egham and that we are a village pub with free parking. "Day-after brunch" is gone.
- [x] "12 mins drive" is dropped: it is not in the SSOT and had no source. `distance` is optional for an `other` entry, and the page, its metadata, its structured data and the list on `/private-hire` read properly without one. A test asserts Great Fosters is the only entry without a figure.
- [x] The register office type and its template are deleted from `app/private-hire/near/[slug]/page.tsx`. Nothing used them once Great Fosters moved, and they carried "after your ceremony", "post-ceremony receptions" and "renewal celebrations".
- [x] The `/private-hire` list heading no longer says "ceremony venues".
- [x] The other twelve near entries were checked for the same copied wording. None has it.

Not touched: the other entries' drive times. Only the three wake venues' figures are in the SSOT (section 11); the rest have no source either.

## 5. The World Cup sweepstake page names nobody

- [x] The 13 winners' names are out of the page's data, cards, FAQ (and so its FAQ structured data), title and descriptions. Each prize is listed by its team.
- [x] The result sheet image and PDF are deleted from `public/`. They listed every entrant by name, not only the winners, and were the share image and the download. Both old addresses redirect to the page.
- [x] The page stays `noindex, follow` and out of the sitemap.
- [x] The whole repository was searched for the entrants' names after the change: none in any tracked file.

Not fixed here, because code cannot fix it:

- The names are still in this public repository's git history.
- Cloudflare sits in front of the site and may keep serving the two deleted files until they are purged there.

## Gates

Node 20.19.5.

| Gate | Result |
|---|---|
| `npm run lint:next` | No warnings or errors |
| `npx tsc --noEmit` | No errors |
| `npm test` (Europe/London) | 295 suites, 4955 passed, 1 skipped |
| `npm run test:utc` | 295 suites, 4955 passed, 1 skipped |
| `npm run build` | Passed |

Checked on the built site, served locally: the old parking status address answers 301 to `/heathrow-parking`; the two deleted sheet addresses answer 301 to the sweepstake page; the built pages for the three occasions, Great Fosters and the sweepstake hold none of the removed wording.

## Assumptions

- Nobody outside the two repositories holds an `/api` address for the deleted reads. A kept page address is covered by the redirect.
- The footballer named for the quickest goal is not an entrant, so that line stays.
- A page "near Great Fosters" may still say "near": Egham is an area the SSOT lists (section 13).
