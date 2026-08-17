# 2026 Event Brochures: changes needed before publishing

Checked against the live management database (`venue_spaces`, `catering_packages`) on 17 August 2026, and against `docs/SSOT.md`.

**Headline:** the catering is near perfect. Every buffet, kids, drinks and afternoon tea price and minimum matches the database exactly. The problems are all on the venue hire page, plus one banned phrase, two changed minimums, and the file sizes.

All nine brochures share the same page 2, 3, 11 and 14, so these fixes apply to the whole set unless stated.

---

## 1. Page 3, Venue Hire: capacities are wrong

The database is the source of truth. Three of the four cards need changing.

| Card | Currently says | Must say |
|---|---|---|
| The Main Area | Seats 50 inside, 64 outside · Standing 300 | **Seats 29 · Standing 150** |
| The Terrace and Garden | Seats 64 · Standing 150 | **Seats 64 · Standing 250** |
| The Entire Pub | *(no capacity line)* | **Seats 119 · Standing 300** |
| The Dining Room | Seats 26 · Standing 50 | Correct, no change |

All four hourly rates are correct: £25, £25, £40, £200 per hour, with the 1 hour and 4 hour minimums as printed.

**Why this happened:** the `venue_spaces` table has free-text descriptions that contradict its own capacity columns. The Main Area description says "50 guests seated", the actual column says 29. The Entire Pub description says "80 seated", the column says 119. Whoever built the brochure read the descriptions. Those two rows need correcting at source or this will happen again.

## 2. Page 3, The Entire Pub: remove "wedding receptions"

Current text reads: "For the big ones: milestone birthdays, wedding receptions, wakes with a lot of people to look after."

We will take wedding bookings, but we are not marketing for them yet, so the word should not appear in print.

**Replace with:** "For the big ones: milestone birthdays, big anniversaries, wakes with a lot of people to look after."

## 3. Page 2, Welcome: the "300" statistic is wrong

The four stats read: 4 spaces · 24 packages · **300 standing guests in the main area at most** · 1751.

300 is the whole-venue figure, not the main area. The main area holds 150.

**Replace with:** "300 · Standing guests with the whole place to yourselves"

The other three stats are correct. I counted the packages listed on page 14 and it is exactly 24.

## 4. Pages 11 and 14: two minimums have changed

Both changed in the database on 17 August 2026.

| Package | Printed | Now |
|---|---|---|
| Welcome Drinks | min 30 | **min 10** |
| Bar Tab | min 30 | **min 10** |

Page 14 shows both minimums in "The Whole List". Page 11 does not print them, so page 11 needs no change unless you want to add them.

## 5. Page 11: the £5 orange juice line is now correct

**Resolved, no brochure change needed.** "Welcome Orange Juice" has been added to the management database at £5.00 per head, minimum 20 guests, as the non-alcoholic alternative to the Welcome Prosecco. Owner instruction, 17 August 2026. The brochure figure was right all along, the database was simply missing the product.

One follow-up for the owner, not the designer: the older "Welcome Prosecco / Orange Juice" package at £9.00 still describes itself as covering "prosecco for adults or orange juice for children/non-drinkers". That reads oddly now a juice-only option exists at £5. Worth renaming it to "Welcome Prosecco" and narrowing the description.

## 6. VAT: a decision for you

Every price in all nine brochures is shown excluding VAT.

That is normal and fine for the **Corporate** brochure. For the seven consumer ones (Baby Shower, Birthdays, Christenings, Gender Reveal, Engagement, Retirement, Celebrations of Life) and the General one, prices shown to consumers are expected to include VAT. Showing £16.00 + VAT when the customer will actually pay £19.20 is the kind of thing that draws complaints.

**Recommendation:** show VAT-inclusive prices on the eight consumer brochures, keep ex-VAT on Corporate, and say which is which in the footer line.

This is the single biggest re-export decision, because it changes every number on pages 6 to 14.

## 7. File sizes: too big to publish

Each brochure is around 13MB, 119MB for the set. The embedded photos are at 374 to 515 ppi, far beyond what any screen or home printer uses.

**Export at 150 ppi.** That should bring each one under 2MB with no visible quality loss. At current size they are a painful download on mobile and too heavy to sit in the website repository.

## 8. Worth checking

- **Cover photography.** The Baby Shower cover is stock imagery, not The Anchor. The interior shots on page 3 are genuinely ours. Worth checking the other eight covers, given the preference for real photos everywhere else.
- **Page 13 reviews.** Quoted as real Google reviews from guests who booked. Please confirm each one is genuine and quoted accurately. Fake or embellished reviews are now a direct legal risk, and we removed fourteen invented testimonials from the site in August for exactly this reason.

---

## Confirmed correct, do not change

- All four venue hire rates and minimum hours.
- Every buffet, hot food, afternoon tea, kids and drinks price.
- Every catering minimum except Welcome Drinks and Bar Tab: Pizza 10, Burger 20, BBQ 20, Afternoon Tea 20, Prosecco Afternoon Tea 20, Kids food 20, Kids Squash 20, Tea and Coffee 20, Welcome Prosecco 20, Goujon Tray 25, Sandwich 30, Finger 30, Premium 30, Fish and Chip Van 30, Curry 30, Tex-Mex 30, Mediterranean 30, Petits Fours 30, Pimm's 40.
- The £250 refundable security deposit.
- Nikki Manfadge as a paid private-event drag host. Owner-confirmed 17 August 2026.
- Room hire being charged on the Celebrations of Life brochure. Wakes are charged for like any other booking.
- Bring your own food, free, no minimum, organiser signs a waiver.
- The "prices were correct when this brochure was printed" disclaimer.

## Summary by page

| Page | Change |
|---|---|
| 2 | Fix the "300 in the main area" statistic |
| 3 | Fix Main Area and Terrace capacities, add Entire Pub capacity, remove "wedding receptions" |
| 11 | Nothing. The £5 orange juice is now a real product. |
| 14 | Welcome Drinks and Bar Tab minimums to 10 |
| All | Decide on VAT-inclusive pricing, re-export at 150 ppi |

That is four edits across two pages, plus the VAT decision and the re-export.
