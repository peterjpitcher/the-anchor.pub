# Editorial + Compliance Implementation Log — 7 July 2026

Branch: `chore/seo-powerhouse-safe-fixes-2026-07-07` (uncommitted). All verified: `tsc --noEmit` exit 0, `eslint` exit 0, no em dashes introduced (SSOT rule).

## Email compliance (owner-confirmed: all enquiries → manager@the-anchor.pub)
9 non-`manager@` addresses replaced across 5 code files + 3 blog posts:
- `app/coach-parking-heathrow/page.tsx` (info@), `app/summer-garden-parties/page.tsx` (info@), `app/heathrow-layover-dining/page.tsx` (events@), `app/parking/bookings/[id]/page.tsx` (parking@ ×2), `components/features/ParkingBookingWizard/index.tsx` (parking@ ×2).
- `content/blog/christmas-party-food-ideas`, `christmas-party-ideas-for-work`, `office-christmas-party-planning-guide` (info@).
- Verified: 0 non-`manager@` customer-facing emails remain.

## EB-1 · /christmas-parties (app/christmas-parties/client-components.tsx)
- Removed the banned minimum-spend line ("counts towards the £45–£52 spend target").
- Removed all literal "live price" placeholder tokens that were rendering to customers (drinks bundle, 3 buffet-tier `price` fields + their Badge now reads "Festive buffet", 6 add-on platter list items).
- Removed remaining hardcoded prices (trimmings £11.95/£21.95/£3.95pp…, wine £39, beer £27, dessert bites £24/£45, tea £4.49, welcome drink £6.99, kids squash £2.50, cheeseboard +£3/£7.95). Items kept; the page's existing "priced from the current approved source / call 01753 682707 for a quote" framing now applies consistently. SSOT: all food/drink prices live from DB.
- Fixed Terminal 2 distance "fifteen minutes" → "eleven" (SSOT §2), 3 places.
- **Left intentionally** (SSOT-permitted): £12.50 ULEZ saving, £10pp deposit, taxi "£18–22" estimate.

## EB-2 · /private-hire/wakes (app/private-hire/wakes/page.tsx)
- Capacity reconciled to SSOT (dining room 26 seated, standing room for more): meta "Up to 50 guests" → "Seats up to 26, standing room for more"; schema `maximumAttendeeCapacity` 50 → 26; "20-60 guests"/"20 to 60 seated" → "up to 26, with standing room for more"; body "up to 50 guests" → "a larger group".
- Crematorium distance "five minutes from South West Middlesex Crematorium" → "ten minutes" (SSOT; matches `lib/local-seo-data.ts` which already said 10 mins). Room-hire "included, no hidden charges" already SSOT-correct — unchanged.

## Blog fixes (3 Christmas posts)
- Wrong phone numbers corrected to the only SSOT number 01753 682707: `christmas-party-food-ideas` (was 01753 686 574), `christmas-party-ideas-for-work` (was 01932 221 618).
- Removed The Anchor's own hardcoded prices in `christmas-party-food-ideas` (trimmings £11.95/£21.95 → descriptive; "Buffet: £10-17 per person" heading → "Buffet options"). Left illustrative market/competitor figures (not The Anchor's own prices).

## Resolved with owner answers (7 Jul, second pass)
- **Christmas deposit** — owner confirmed £10pp applies to **all** Christmas menu bookings regardless of party size. This is an exception to the SSOT general "1–9 no deposit" rule, so recorded in the SSOT: `docs/SSOT.md` §7 (new "Christmas menu exception" bullet). Page copy clarified on both deposit lines ("applies to every Christmas menu booking, whatever your group size"). SSOT drift-guard: 20/20 pass.
- **Wakes standing capacity** — pulled from the management DB (`venue_spaces`, project `tfcasgxopxegwrabvwat`): **The Dining Room = 26 seated / 50 standing**. The original "50" was actually the standing figure; the wrong bit was "20-60 seated". Corrected page to "26 seated, or up to 50 standing" (meta, 2 prose lines, schema `maximumAttendeeCapacity` = 50). Recorded in SSOT: `docs/SSOT.md` capacity table (new "Dining room (standing) | 50" row) + dining-room line, and `SSOT.json` (`venue.capacity.dining_room_standing: 50`, `dining_room_note`). md↔json consistent; drift-guard green.

## Capacity reconciled to the management DB (owner: "use the DB values throughout the site")
Source of truth = `venue_spaces` (project `tfcasgxopxegwrabvwat`): Dining Room 26/50, Main Area 29/150, Garden 64/250, Entire Pub 119/300 (seated/standing).
- **SSOT updated** to the full DB roll-up: `docs/SSOT.md` capacity table (whole venue 119/300, main area 29/150, garden 64/250) + §8 line; `SSOT.json` `venue.capacity` (added `maximum` 300, `maximum_seated` 119, `main_area_*`, `beer_garden_standing` 250). Kept "10+ to 150 guests" (drift-guard-required; = Main Area).
- **Live page contradictions fixed:** wakes FAQ ("up to 60 seated" → 26/50); coach-parking ("up to 25 people" → 26, ×2); ashford ("intimate gatherings to 200", "20 to 250 people" → 10+–150); windsor ("20 to 250 guests" → 10+–150, ×2); TrustBar ("up to 200 guests" → 10+–150); anniversary + engagement dining-room lines ("26 seated with standing room for more" → "26 seated, or up to 50 standing", ×2 each); blog `function-room-hire-heathrow-pricing` ("Dining Room seats 20–80 / Exclusive 80–200" → 26/50 and 119/300, em-dashes fixed).
- **Left as correct:** `/private-hire/near/[slug]` ("seats 26 … up to 150 across the venue") already DB-consistent; all "10+ to 150 guests" headlines kept.
- Gates: SSOT drift-guard 20/20, `SSOT.json` valid, tsc 0.

## Still flagged (not this pass)
- **Non-live editorial drafts** `content/copy-decks/christmas-parties-2026-seo-rewrite.md` + `corporate-christmas-parties-2026-seo-rewrite.md` still say "dining room for up to 25" (should be 26); they are reference decks, not rendered routes, so left untouched — worth correcting if reused.
- Wider EB-4/EB-5 (price sweep on other app pages + blog banned-claim purge across the non-Christmas blogs) remain in `editorial-team-briefs.md`.
- DB note: `venue_spaces` rows for "Entire Pub" and "The Main Area" have internal mismatches between their numeric columns and description text (e.g. Entire Pub 119 vs 80 seated). Only the Dining Room (26/50, internally consistent) was used. Worth the owner tidying the other rows.
