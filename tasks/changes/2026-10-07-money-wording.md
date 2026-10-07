# Money wording (P08), 7 October 2026

Branch `fix/money-wording`. Website copy only: no price is worked out or charged differently, and no payment code path changed. Source: the 7 October 2026 site review, package P08, findings C1-002, B1-001, B2-001, C3-006, C4-009, PY-012, PY-013, PY-014, C1-024, C1-025, C1-045, C2-051, C4-005, C4-006, C4-007 and PY-015, with the checkers' corrections and owner decisions 2, 3, 7, 8 and 17.

## What changed

- [x] **One home for the money sentences.** `lib/approved-wording.ts` gained seven constants, each matching a block in `docs/SSOT.md` section 16: the group deposit, the group deposit refund bands, the event ticket refund bands, the private hire deposit, room hire, the airport parking refund, and the Christmas party of more than 20.
- [x] **Parking refunds (decision 2).** One sentence, `PARKING_REFUND_WORDING`, in the parking FAQ, the terms on the parking page, the four terminal parking pages, `SSOT.json` and one blog post that still promised "a full refund". The terms keep their own line saying what the payment fee is. No fee amount or percentage is stated anywhere.
- [x] **Refund bands beside the pay buttons (decision 3).** The group deposit bands show in the deposit pay box, in the deposit note on the booking review step and in the deposit answer on `/book-table`. The ticket bands show in the event ticket pay box. A Christmas sitting does not get the group bands: it has its own refund rule, which the form already prints from the management app.
- [x] **Book a Table.** "Free to cancel" became "No deposit for tables of 14 or fewer", through a new `table` variant of the tick list. The game night pages keep "Free to cancel", which is true there.
- [x] **Group deposit wording (PY-014, C2-051).** The booking form's copy and the What's On line are now the approved sentence, from the constant.
- [x] **Wakes page (C1-002).** The three lines that said room hire was included, "Everything Included" and "no hidden charges" are gone. The page now says packages cover food, staff, setup and cleardown, room hire is charged by the hour, and the £250 deposit is held separately.
- [x] **Private hire deposit (C1-045).** The catering card (nine pages), the hub's cost answer, and the anniversary and engagement pages render the approved sentence from the constant.
- [x] **The same fault on other private hire pages**, found by the guard: "no hidden charges" on milestone birthdays and retirement parties, "no hidden fees" twice on `/corporate-events`, and "packages include use of a reserved area" on baby showers, christenings and gender reveal.
- [x] **Blog.** Five posts (30th, 40th, 60th, gender reveal, retirement) no longer say the room costs nothing extra; the wake guide no longer says a wake takes no deposit; the "No 'plus VAT' surprises" line is gone. Every post was checked live (HTTP 200) on 7 October 2026 before editing.
- [x] **Christmas (decisions 7 and 8).** The page no longer says the £10 deposit applies at any size: it applies to table bookings of 4 to 20, and a party of more than 20 pays the private hire deposit. The two-price lines now read "Tuesday to Thursday" and "Friday to Sunday". `/corporate-events` and the Christmas structured data say the same.
- [x] **Taxi fares and other car parks' prices (decision 17).** Removed from the four `/near-heathrow/terminal-N` pages, `/find-us`, `/heathrow-layover-dining`, `/heathrow-hotels-pub`, the four terminal parking pages, `/feltham-pub`, `/wraysbury-pub`, `/horton-pub`, `/windsor-pub`, `/pubs-in-stanwell`, `/heathrow-parking` and, found by the guard, `/new-years-eve`. Journey times stay.
- [x] **Our own parking price on the terminal parking pages (C4-006).** Removed from the title, heading, description, body and FAQ. The pages point to `/heathrow-parking`, which reads the price live.
- [x] **Unbacked payment claims on the parking page (PY-015).** The "Payment" comparison row (Apple Pay, Google Pay; "Card only" for Heathrow) and "download instant receipts" are gone.
- [x] **SSOT.** Section 7 gained the airport parking refund rule, the Sunday price and the Christmas party of more than 20. Section 16 gained five blocks. Section 18 has the changelog entry. `SSOT.json` matches.
- [x] **Guard test** `tests/money-wording-guard.test.ts`, and four existing tests updated.

## Assumptions

1. The refund sentences are new wording in SSOT section 16. Their bands are the section 7 table word for word (7 or more days, 3 to 6 days, fewer than 3 days); the surrounding words are mine and are for the owner to approve.
2. "The payment fee" is explained once, in the parking terms, as the card processing fee the payment provider charged on the original payment. That is what the old terms already said.
3. The terminal parking pages lose their typed price and link to the live one. Reading the rate live on those four pages would have made them call the management app on every visit, where today they are built once.
4. The Christmas page states the owner's Sunday rule in words. The live menu holds two prices but nothing tying a price to a day, so the page cannot read the rule from data. The rule is the higher price, so the page never understates what a Sunday costs.
5. "No deposit for tables of 14 or fewer" is used as instructed. A Christmas sitting takes a deposit at any size, and the form says so when a Christmas sitting is chosen.
6. Heathrow's column in the parking comparison keeps its transfer and distance rows and says "Priced by date. Check Heathrow's own site for yours." in the two price rows, so our own live prices stay in the table.
7. The deposit pay box keeps "(£10 per person)" and "This deposit is deducted from your final bill." Both are true of a Christmas deposit too, and "Groups of 15 or more" would be wrong for a Christmas table of six.
8. Bus fares (£2.50) are left. The decision names taxi fares and other venues' prices.

## Not changed, on purpose

- **How any price is worked out or charged**, and the payment code.
- **VAT (decision 1).** Private hire prices are still shown before VAT. The management app's public config sends net figures and no rate, so nothing here guesses one. The hand-over lists what the endpoint must add.
- **The blog guides' typed prices** (taxi fares and competitor prices in posts): a later batch. Only false refund, room hire and deposit lines were fixed in posts.
- `content/blog/how-to-plan-surprise-birthday-party` ("no deposit needed until you're ready to confirm"): finding B2-046, not in this package.
- `SSOT.json` `heathrow_parking.payment_methods` still lists Apple Pay and Google Pay, and `heathrow_parking.rates` still holds a copy of the prices (C4-055).
- The six blog folders that redirect.
- The Six Nations and World Cup pages hold their own copy of the group deposit sentence. It is word for word correct, and the access change on the other branch edits the lines beside it.

## Tests

- New: `tests/money-wording-guard.test.ts` (32 tests). It checks every constant against SSOT section 16, the bands against the section 7 table, `SSOT.json` against the constants, and fails on the retired lines ("room hire is included", "no hidden charges", "not paying for an empty room", "no separate hire fee", "no deposit for a wake", "plus VAT surprises", "a full refund" on parking, a typed taxi fare, another car park's price). Each rule has a list of retired lines that must fail and correct lines that must pass.
- Updated: `tests/unit/christmas-2026-offer-rules.test.tsx`, `tests/unit/christmas-parties-schema.test.ts`, `tests/unit/deposit-threshold-consistency.test.ts`, `components/psychology/__tests__/RegretReduction.test.tsx`.
