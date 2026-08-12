# Homepage copy, as built: 12 monthly sets

Date: 12 August 2026
Status: **implemented and committed** on `feat/dark-season`, not pushed.

Generated directly from `lib/monthly-copy.ts`, so what you read here is exactly
what the site renders. Christmas figures below are the live values resolved from
`lib/christmas-season.ts` at the time of writing; they are interpolated at build
time, never typed, so they follow the window when it moves year to year.

To change any line, edit `lib/monthly-copy.ts`. Nothing else needs touching.

## What never changes

- **The H1**, `Eat, Drink, Enjoy.` The brand motto, SSOT section 1.
- **The wordmark, review row and live status pill.**
- **August**, which keeps today's copy verbatim as the evergreen baseline.

## Skin windows, for context

The copy changes monthly. The visual skin changes on its own windows, set by the
owner on 12 August 2026, and the two are deliberately independent.

| Window | Effect |
|---|---|
| 1 Sep to 31 Mar | Dark surfaces site-wide, green header |
| 1 Nov to 31 Dec | Icicle lights and hero frost, full strength |
| 1 Apr to 31 Aug | No skin |

## The twelve

### January  ·  skin: dark

- **Script line:** Start the year somewhere warm
- **Lead:** January is for long lunches, quiet pints and a proper roast on a Sunday. Pub classics, stone-baked pizzas and free parking, 7 minutes from Heathrow Terminal 5.
- **Primary button:** Book a table  →  the booking flow
- **Secondary button:** See the Sunday roast  →  /sunday-roast
- **Badges:** Sunday roasts · Free parking · Dog friendly · 7 mins from T5
- **Closing band:** **Beat the January quiet**  Walk in whenever you like. Booking just means the table is waiting for you.

### February  ·  skin: dark

- **Script line:** Pull up a chair
- **Lead:** Dark evenings, warm rooms and somewhere to properly sit down. Roasts carved fresh every Sunday, stone-baked pizzas and pub classics, 7 minutes from Heathrow Terminal 5.
- **Primary button:** Book a table  →  the booking flow
- **Secondary button:** View food menu  →  /food-menu
- **Badges:** Sunday roasts · Free parking · Dog friendly · 7 mins from T5
- **Closing band:** **Got a date in mind?**  Sundays fill up quickly in February. Tell us when and we will hold a table.

### March  ·  skin: dark

- **Script line:** Lighter evenings ahead
- **Lead:** The evenings are stretching out again and the garden is waking up. Sunday roasts, stone-baked pizzas and free parking, 7 minutes from Heathrow Terminal 5.
- **Primary button:** Book a table  →  the booking flow
- **Secondary button:** See the Sunday roast  →  /sunday-roast
- **Badges:** Sunday roasts · Free parking · Dog friendly · Beer garden
- **Closing band:** **Planning something for March?**  Sunday tables, birthdays and small get-togethers. Just tell us the date.

### April  ·  skin: off

- **Script line:** Spring's in the garden
- **Lead:** Longer days, planes overhead and a pint outside again. Roasts carved fresh every Sunday, stone-baked pizzas and free parking, 7 minutes from Heathrow Terminal 5.
- **Primary button:** Book a table  →  the booking flow
- **Secondary button:** Visit the beer garden  →  /beer-garden
- **Badges:** Beer garden · Free parking · Dog friendly · 7 mins from T5
- **Closing band:** **Ready to visit?**  Walk-ins are always welcome, but booking guarantees your spot.

### May  ·  skin: off

- **Script line:** Garden weather at last
- **Lead:** A beer garden under the flight path, a pint in the sun and the planes coming in low. Stone-baked pizzas, pub classics and free parking, 7 minutes from Heathrow Terminal 5.
- **Primary button:** Book a table  →  the booking flow
- **Secondary button:** Visit the beer garden  →  /beer-garden
- **Badges:** Beer garden · Free parking · Dog friendly · Plane spotting
- **Closing band:** **Bringing a few people?**  Garden tables, birthdays and long afternoons. Tell us roughly how many and we will sort it.

### June  ·  skin: off

- **Script line:** Long afternoons out the back
- **Lead:** Summer in a proper village pub: the garden open, the planes overhead and no rush to leave. Stone-baked pizzas, pub classics and free parking, 7 minutes from Heathrow Terminal 5.
- **Primary button:** Book a table  →  the booking flow
- **Secondary button:** Visit the beer garden  →  /beer-garden
- **Badges:** Beer garden · Free parking · Dog friendly · Plane spotting
- **Closing band:** **Ready to visit?**  Walk-ins are always welcome, but booking guarantees your spot.

### July  ·  skin: off

- **Script line:** Pints, planes and no rush
- **Lead:** The garden is the whole point in July. Cold drinks, stone-baked pizzas and Terminal 5 arrivals passing right over your head, 7 minutes from the airport with free parking.
- **Primary button:** Book a table  →  the booking flow
- **Secondary button:** View food menu  →  /food-menu
- **Badges:** Beer garden · Free parking · Dog friendly · Plane spotting
- **Closing band:** **Got a group coming?**  Summer afternoons in the garden. Tell us the date and how many.

### August  ·  skin: off

- **Script line:** Where everyone's welcome
- **Lead:** A proper village pub in Stanwell Moor, 7 minutes from Heathrow Terminal 5. Pub classics, stone-baked pizzas, a beer garden under the flight path and free customer parking.
- **Primary button:** Book a table  →  the booking flow
- **Secondary button:** View food menu  →  /food-menu
- **Badges:** Free parking · Dog friendly · Beer garden · 7 mins from T5
- **Closing band:** **Ready to visit?**  Walk-ins are always welcome, but booking guarantees your spot.

### September  ·  skin: dark

- **Script line:** Cosy season starts here
- **Lead:** Darker evenings, warmer welcomes. Pub classics, stone-baked pizzas and roasts carved fresh every Sunday, 7 minutes from Heathrow Terminal 5.
- **Primary button:** Book a table  →  the booking flow
- **Secondary button:** See the Sunday roast  →  /sunday-roast
- **Badges:** Sunday roasts · Free parking · Dog friendly · 7 mins from T5
- **Closing band:** **Ready to visit?**  Walk-ins are always welcome, but booking guarantees your spot.

### October  ·  skin: dark

- **Script line:** Pull the evenings in
- **Lead:** The clocks go back and the roasts get better. Beef topside carved fresh every Sunday from 1pm, stone-baked pizzas and free parking, 7 minutes from Heathrow Terminal 5.
- **Primary button:** Book a table  →  the booking flow
- **Secondary button:** See the Sunday roast  →  /sunday-roast
- **Badges:** Sunday roasts · Free parking · Dog friendly · 7 mins from T5
- **Closing band:** **Thinking about Christmas?**  Festive bookings are open for groups from 6 guests up. Get your date in early.

### November  ·  skin: dark + lights and frost

- **Script line:** Party season is open
- **Lead:** Festive service runs 10 November to 20 December 2026. Christmas bookings take groups from 6 guests up, in a proper village pub 7 minutes from Heathrow Terminal 5.
- **Primary button:** Christmas enquiry  →  /christmas-parties
- **Secondary button:** View food menu  →  /food-menu
- **Badges:** Groups from 6 · Free parking · Dog friendly · 7 mins from T5
- **Closing band:** **Planning the Christmas do?**  Groups from 6 guests up, £10 per person deposit that comes off your bill. Tell us your date and we will hold it.

### December  ·  skin: dark + lights and frost

- **Script line:** Christmas is on at The Anchor
- **Lead:** Festive service runs 10 November to 20 December 2026, then we see the year out together. Christmas dinner, groups from 6 guests up and a village pub 7 minutes from Heathrow Terminal 5.
- **Primary button:** Book a table  →  the booking flow
- **Secondary button:** Christmas enquiry  →  /christmas-parties
- **Badges:** Festive menu · Groups from 6 · Free parking · Dog friendly
- **Closing band:** **Christmas is on at The Anchor**  The doors stay open right through to New Year.

## Notes on two lines you may query

**December's primary button says "Book a table", not "Book your festive table."**
The decorated window runs to 31 December but festive service ends on the 20th,
so a festive-specific button would be untrue for the last eleven days of the
month. The band still says the doors stay open to New Year, which is true all
month.

**November's primary button goes to `/christmas-parties`, not the booking flow.**
That month the real ask is the enquiry, not a table.

## Claims deliberately absent

Checked against `docs/SSOT.md` section 14 and locked by 28 tests in
`tests/unit/monthly-copy.test.ts`, which assert what we may NOT say rather than
the wording, so every line above stays free to change:

- No mulled wine. Banned outright, owner-confirmed 5 August 2026.
- No air conditioning, climate control or "year-round comfort". We have heating.
- No "best" or "premier".
- No Sunday roast pre-order or Saturday cutoff.
- No shared Christmas party nights, no gluten-free claim, no weddings, no Sky or TNT.
- No Halloween in October or New Year specifics in December, because those depend
  on event listings being confirmed rather than on the calendar.
- No mention of Christmas anywhere before October.
- No em dashes.
