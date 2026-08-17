# The Anchor, Single Source of Truth

> **PRICING POLICY:** All food and drink prices (roast, menu, drinks, catering/buffet) are **LIVE from the management database, POS, menu API, or latest approved private-hire source**. This document holds stable rules and item structure only. **Never hardcode or quote a price from here or anywhere else; always pull live.** Non-food figures such as deposits, ULEZ saving, quiz/bingo entry and fixed prizes may remain only where confirmed.
>
> **PRICE DISPLAY:** Menu item prices are displayed **without currency symbols** (e.g. "16", not "£16"): a deliberate menu-psychology choice, owner-confirmed 2026-07-19. Do not "fix" bare menu prices by adding £. JSON-LD `Offer.price` values are always bare numeric strings regardless of display. Aggregate copy lines (e.g. "Food £5 to £16", "from £16") keep the £ symbol; the rule applies to per-item menu prices only.

> **Read before writing customer-facing content.** This document is the canonical reference for every fact about The Anchor that appears on the website, in JSON-LD schemas, in blog posts, in social copy, in marketing emails, or in any other customer-facing surface. If a claim you want to make is not in this document, **stop and ask**, do not guess, do not infer, do not fall back on training data.
>
> If this document and existing page copy disagree, the SSOT wins. Update this document first when operational reality changes; the page copy and JSON-LD must follow.

This file is the human-edited source. `/SSOT.json` mirrors a subset of these facts in structured form for programmatic lookup. When the two diverge, this Markdown file is canonical and the JSON should be reconciled to match.

> **Strategy data lives elsewhere.** Marketing strategy (target audiences, psychographic segments, competitive landscape) is not a brand fact and lives in `docs/brand-strategy.md`, not here and not in `SSOT.json`. Do not quote competitor names or audience labels in customer-facing copy.

Last menu refresh: **2026-04-29** (Sunday roast line-up rebuilt; wellington reaffirmed as vegan; cauliflower cheese retired). Walk-in launch shipped **2026-05-17**. Christmas 2026 offer confirmed by the owner **2026-07-21** (see §7).

---

## 1. Identity & Voice

- **Name:** The Anchor.
- **Naming rule:** Use **"The Anchor"** as the default customer-facing name. Use "The Anchor Pub" only where SEO value warrants it (page titles, alt text, schema name fields). Never use "The Anchor Pub" as the conversational default.
- **Type:** Independent British village pub and restaurant.
- **Pub group:** Greene King Tenants network.
- **Motto:** Eat, Drink, Enjoy.
- **Tagline:** Where Everyone's Welcome.
- **Founded:** 1751 (the pub's established date). Evidence from British History Online and Spelthorne's local list suggests an Anchor Inn on the site by at least 1730, though the present building is mid-Victorian.
- **Heritage line:** A village pub since 1751. Stood here before Heathrow existed; Heathrow grew from a grass airstrip in the 1940s.
- **Local listing:** Locally listed by Spelthorne Borough Council as **The Anchor Public House**, building reference **LL/072**, listed **19 February 2004**. Described as a mid-Victorian pub on the site of an earlier pub dating from at least 1730.
- **Heritage safe wording:** "The Anchor has served Stanwell Moor since at least 1751, with evidence of an Anchor Inn on the site by 1730. The present building appears to be mid-Victorian, standing on the site of the earlier pub."
- **Marketing description:** The closest traditional British pub to Heathrow Airport. Famous Sunday roasts, beer garden under the flight path, and FREE parking for all guests.
- **Tone:** Warm, excited, cheeky, inclusive. We sound like people who genuinely love this pub and can't wait for you to visit. Never flat, never corporate.
- **Perspective:** First-person plural, "we" / "our".
- **Language:** British English spelling and idiom.
- **Punctuation:** Do not use em dashes in customer-facing copy. Prefer commas, short sentences, or parentheses where needed. Exclamation marks are allowed but earn their place: at most one per section, never stacked.
- **Audience note:** Responds to local demographic change including the growing Indian community.

### Emotional core (what we stand for)

Copy should make people **feel invited, not just informed**. The feelings we are selling:

- **Belonging.** "Where Everyone's Welcome" is a promise, not a strapline. Every piece of copy should read like a friend saying "come along, you'll love it".
- **Pride.** A village pub that has stood here since 1751, before Heathrow existed. We are proud of that and it is fine to show it.
- **Simple joy.** A proper roast, a full beer garden, planes thundering overhead, a quiz night that gets competitive. Small pleasures, done properly.

### Voice principles

1. **Lead with feeling, then facts.** Open with why something is brilliant, then give the details. Not the other way round.
2. **Enthusiasm is on-brand.** "We love", "we can't wait", "our favourite" are encouraged. If the copy could belong to any pub chain website, rewrite it.
3. **Cheeky, never snide.** Jokes point at ourselves, the weather, or the planes. Never at guests, staff, or other venues.
4. **Concrete beats generic.** Name the Yorkshire pudding, the flight path, the beer garden. Banned filler: "great atmosphere", "something for everyone", "hidden gem", "look no further".
5. **Inclusive by default.** Write as if inviting someone who has never set foot in a pub. No in-jokes that exclude newcomers, no assumed knowledge.
6. **Excitement never invents facts.** Every claim still comes from this SSOT. §14 banned claims still apply. Prices stay live from the management DB. Energy is in the delivery, never in exaggeration.

### Register dial

- **High energy:** homepage hero, event pages, blog posts, social copy, marketing emails.
- **Medium:** menu descriptions, area and feature pages, FAQs.
- **Calm and clear:** opening hours, booking flow, deposits, allergen information, confirmations, anything operational or legal. Accuracy beats excitement here, always.

### Examples (illustrative only, not published copy)

- Flat: "We serve Sunday roasts from 1pm to 6pm." On-brand: "Sunday is what we live for. Roasts carved fresh from 1pm, walk in whenever suits you."
- Flat: "The beer garden is located near Heathrow Airport." On-brand: "Pint in hand, planes roaring over the garden, seven minutes from Terminal 5. There's nowhere else like it."

### Scope

This voice applies to **all new customer-facing copy from 14 August 2026**. Existing pages are not being rewritten proactively; bring copy onto this voice as pages are touched.

## 2. Contact & Location

- **Phone:** 01753 682707.
- **Email:** manager@the-anchor.pub. **This is the only correct email.**
- **WhatsApp:** wa.me/441753682707.
- **Address:** Horton Road, Stanwell Moor, Surrey, TW19 6AQ.
- **Coordinates:** 51.462509, -0.502067.
- **Google Maps:** https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ.
- **M25:** 2 minutes from Junction 14.
- **Bus:** Routes 441, 442, 555 from Heathrow Central Bus Station.
- **ULEZ:** Outside the ULEZ zone (saves visitors approximately £12.50/day vs. London venues).
- **Location framing:** Stanwell Moor, near Heathrow Airport, the closest proper pub to Terminal 5, ~7 minutes by car.

### Heathrow proximity

| From | Time by car | Distance |
|---|---|---|
| Terminal 2 | 11 minutes | n/a |
| Terminal 3 | 11 minutes | 5.3 miles |
| Terminal 4 | 12 minutes | n/a |
| Terminal 5 | 7 minutes | 3.8 miles |
| Staines | 8 minutes | n/a |

General range to use in copy: **7–12 minutes** from any Heathrow terminal.

## 3. Opening Hours (regular)

Only ever use the API for opening hours in case they have to change. No hardcoded opening times.

> Special-hours overrides come from the management API (`/business/hours`) and **always win**. `kitchen: null` for a date means the kitchen is closed for that date, treat as deliberate, not as missing data. Use `??` (not `||`) when resolving special vs. regular kitchen data; `||` will silently fall through and has caused real bugs.
>
> Last orders are 15 minutes before the bar closes and 30 minutes before the kitchen closes. Do not claim late food on any event night unless the event record or live kitchen hours explicitly confirms it.

## 4. Sunday Roast, operational claims

Effective from the **17 May 2026 walk-in launch**. Menu refreshed **29 April 2026** (chicken, lamb, pork belly and cauliflower cheese retired; turkey, two pies and sliced beef/pork added; wellington reaffirmed as vegan).

- **Service window:** Sundays 1pm – 6pm. Kitchen 1pm – 6pm. Last bookable arrival 5:30pm.
- **Pre-order:** **Not required.** No Saturday cutoff. No per-roast prepayment.
- **Walk-ins:** Welcome the whole window. Last seating is 5:30pm.
- **Booking:** Strongly recommended for groups and peak slots, but not required.
- **Max online party size:** 20. Larger groups must call.
- **Deposit:** No Sunday-specific deposit. The standard large-group deposit (groups of 15+) applies on any day, any booking type, see §7.

### Current menu

| Dish | Price | Yorkshire pud? | Notes |
|---|---|---|---|
| Roast Beef Topside | (live, DB) | Yes | 28-day topside, slow-roasted, carved fresh per plate |
| Roast Pork Leg | (live, DB) | Yes | Sliced to order with Bramley apple sauce |
| Roast Turkey with Stuffing Ball | (live, DB) | Yes | Carved fresh; sage and onion stuffing ball |
| Beef & Ale Pie | (live, DB) | **No** | Slow-cooked British beef in ale gravy under golden short-crust pastry |
| Chicken & Wild Mushroom Pie | (live, DB) | **No** | Tender chicken and wild mushrooms in creamy sauce under golden short-crust pastry |
| Beetroot & Butternut Squash Wellington | (live, DB) | No | **Fully vegan.** Default plate is vegan |
| Kids Roast | (live, DB) | If pork or turkey | Smaller, child-sized portion. Choice of pork, turkey or wellington |

**Price range to quote in copy:** Do NOT quote a hardcoded range. Prices are live from the management DB (menu API). Pull live.

### Accompaniments

Triple-cooked, herb-and-garlic crusted roast potatoes. Seasonal vegetables. Yorkshire pudding with the three sliced roasts and the kids roast (no yorkshire with the pies). Our signature gravy.

> **We do not use beef dripping.** Never claim that we do. Never describe the potatoes as "beef-dripping potatoes". The correct phrase is "triple-cooked, herb-and-garlic crusted".

### Gravy rules

- **Signature gravy**, a secret recipe we've refined ourselves over the years. Default for all meat dishes. **Contains meat stock; not vegan.**
- **Regular gravy**, fully vegan. Default with the wellington. Available on request with any dish.
- **Wellington upgrade path**, wellington customers can upgrade for free to the signature gravy on request. The upgrade makes the dish non-vegan; flag this when offering.

> Do **not** describe our gravy as "red wine gravy". The signature gravy is a secret recipe; the alternative is the regular vegan gravy.

### Wellington wording

The wellington is **fully vegan**. In customer-facing copy, schemas, and JSON-LD always use "vegan", never "vegetarian". The wellington is a dish in its own right, not an afterthought.

### Retired items (do not list)

- Roasted Chicken (adult)
- Slow-Cooked Lamb Shank, lamb is no longer served anywhere, on any menu.
- Crispy Pork Belly
- Cauliflower Cheese side

The DB rows for these items are deactivated (`is_active = false`) rather than deleted because `table_booking_items` has foreign keys into `sunday_lunch_menu_items`. Historical bookings still need their menu rows to resolve.

### Reversed prior guidance

Older content marked beef as "not on the current menu", that guidance is **reversed**. Beef Topside is now the headline roast.

### Regular menu on Sundays

The regular weekday menu (burgers, pizzas, fish & chips, pies) is also available on Sundays without pre-order.

## 5. Food (weekday)

### Cuisines

British, Pizza, Pub Food, Sunday Roast.

### Menu highlights (verified prices)

| Dish | Price |
|---|---|
| Fish and Chips | (live, DB) |
| Half Fish and Chips | (live, DB) |
| Scampi and Chips | (live, DB) |
| Bangers and Mash | (live, DB) |
| Beef and Ale Pie *(weekday version)* | (live, DB) |
| Chicken & Wild Mushroom Pie *(weekday version)* | (live, DB) |
| Chicken, Ham Hock & Leek Pie | (live, DB) |
| Butternut Squash, Mixed Bean & Mature Cheddar Pie | (live, DB) (vegetarian) |
| Classic Beef Burger | (live, DB) (chips included) |
| Burger Stack (Beef / Chicken / Spicy Chicken / Garden) | (live, DB) |
| Lasagne | (live, DB) |
| Mac and Cheese | (live, DB) (vegetarian) |
| Stone-baked pizzas | (live, DB) (12-inch, hand-stretched, NGCI bases available) |
| Kids menu | from (live, DB) |
| Wraps | from (live, DB) |
| Chips | (live, DB) |
| Cheesy Chips | (live, DB) |

**Price range to quote in copy:** Do NOT quote a hardcoded range. Prices are live from the management DB (menu API). Pull live.

### Food deals

No current food deal should be promoted unless it comes from the live management system or another approved live source.

### Things we don't do (food)

- **No breakfast service.**
- **No delivery.** Takeaway by phone for collection only.
- **No gluten-free fish and chips.** Do not claim gluten-free batter, gluten-free fried fish, grilled gluten-free fish, or a dedicated gluten-free fryer for fish and chips. Guests avoiding gluten should use the NGCI menu/allergen guidance instead.
- **No "real ale" positioning.** We stock bottled ales only; no handpumps. Do not market as a "real ale pub".

### NGCI, never "gluten-free"

**"Gluten-free" is a regulated claim.** It legally means verified below 20 ppm, which needs controls a single shared kitchen cannot provide. We prepare everything in one kitchen and cannot guarantee zero cross-contamination, so we must not make that claim about any dish, base, gravy or menu.

**The correct term is NGCI (No Gluten Containing Ingredients).** Spell it out on first use on a page, then NGCI thereafter. Always pair it with the cross-contamination caveat.

- **Customer-facing copy, headings, dish descriptions and JSON-LD:** NGCI only. Never "gluten-free" as a bare claim.
- **Search-facing text is the one exception.** The `/food-menu/gluten-free` URL and the meta description keep the phrase "gluten free", because that is what guests actually search for. The visible on-page label is still NGCI. Do not change that URL, it holds the ranking.
- **Internal identifiers are not copy and do not change.** The `gluten_free` value in `menu_dishes.dietary_flags`, the `gluten-free` parameter on the management API's dietary-menu endpoint, and the `gluten_free` GTM filter value are all machine tokens. Renaming them breaks the website filter and the API contract.
- **Still true:** no NGCI fish and chips, no NGCI batter, no dedicated fryer. See the bullet above.

### Allergen wording

When allergen data is missing for a dish, **never render "no allergens"** or any wording that implies the dish is free from allergens. Missing data means unknown, not safe. The required fallback string is:

> **See menu or contact us for allergen information**

This applies to every surface: menu pages, the Christmas menu, JSON-LD, PDFs and printed copy.

### Kids menu (regular)

Sausage and mash · Fish fingers · Tomato pasta · Chicken goujons · Mini roasts (Sundays).

## 6. Drinks

The full drinks inventory must come from POS/API before publishing. The website and SSOT do not own a master drinks list.

**Notable rules:**
- **No Sky Sports / TNT Sports.** Live sport on terrestrial channels (BBC, ITV, Channel 4) only since January 2025.
- **No guest ales.** Bottled ales only.
- **Discontinued (do not list):** Stanwell Moor Brew (DISCONTINUED 2026-03-22). Pravha (DISCONTINUED, no longer stocked).
- **Promotions:** Double-up on optics only when current POS/promotion data confirms it. Monthly Manager's Special uses the current live Manager's Special source.
- **Shandies:** Available for all draught lagers.
- **Drink pricing:** Never show drink pricing unless it comes from an approved live source. Cocktail pricing may be shown only from the current approved cocktail menu/API.
- **No food deals:** Remove stale food-deal claims unless the live management system confirms a current offer.

## 7. Booking & Deposits

### General deposit policy

Applies to non-Christmas bookings. Christmas has its own deposit rule, see the Christmas 2026 block below.

- **14 guests or fewer:** No deposit. No card details required at booking.
- **15 or more guests:** £10 per person, fully deducted from the bill on the day. Any day, any booking type.
- **More than 20 guests:** This is **not a table booking**, it is private hire. Direct the enquiry to manager@the-anchor.pub, 01753 682707, or WhatsApp 01753 682707. See §11.
- **Standard copy:** "Groups of 15 or more: a £10 per person deposit, fully deducted from your bill."

**Changed 9 August 2026.** The threshold was 10 guests until this date. A party of ten is an ordinary family Sunday, and putting a payment screen in front of them was the most likely reason the pub took only two bookings of ten or more in ninety days. The per-person rate is unchanged, and the Christmas rule below is unaffected.

### Christmas 2026 (owner-confirmed 21 July 2026)

- **Service window:** **10 November to 20 December 2026**. The 20th is **inclusive**, a 20 December sitting is bookable. The previously published 1 November to 23 December window is superseded, see §14.
- **Minimum party size:** **6 guests.** Every Christmas dinner booking needs 6 or more guests.
- **Minimum notice:** **24 hours.** No same-day Christmas bookings.
- **Deposit:** **£10 per person on every Christmas booking, regardless of party size.** Taken at booking, non-refundable, deducted from the bill.
- **Pre-book and pre-order, by course:**

| Tier | Pre-book | Pre-order |
|---|---|---|
| 1 course | Required | **Not** required |
| 2 course | Required | Required |
| 3 course | Required | Required |

- **Pre-order deadline:** **7 days before the booking date** for the 2 and 3 course tiers. (Owner-confirmed, 11 August 2026.) State this plainly rather than hedging with "confirmed with your booking".
- **Days available:** Tuesday to Saturday sittings, plus **Sunday sittings from 1pm to 6pm**. **Mondays are not available** for Christmas bookings, the kitchen is closed. (Owner-confirmed, 11 August 2026.)
- **Christmas entertainment:** a **Christmas quiz** runs and may be promoted. A **DJ can be arranged on request**, but it is never included by default, so offer it as something a group can ask for rather than as part of a package. There is **no Christmas karaoke**, **no live band**, no dance floor and no shared party night. (Owner-confirmed, 11 August 2026.)

- **There is no kids 2 course or 3 course.** No child portion and no child price exists for those tiers. Children may order the adult 2-course or 3-course tier, at the adult price. State this plainly wherever the tiers are listed.
- **Included, adults:** a glass of prosecco on the **2 and 3 course tiers only**, swappable for
  orange juice. **The 1 course tier does NOT include a drink for adults.** (Owner-corrected,
  15 August 2026. This entry previously read "all three tiers", which had reached the live
  christmas-parties page as "whichever courses they choose" and two marketing emails before
  it was caught.)
- **Included, children:** a Fruit Shoot or a small soft drink (Coca-Cola, Diet Coke or lemonade) with the 1 course.
- **Trimmings:** pigs in blankets, stuffing, brussels sprouts, **Yorkshire pudding, roast potatoes, mashed potato and peas**. (Yorkshire pudding, roast potatoes, mash and peas owner-confirmed, 13 August 2026.)
- **The Vegetable Wellington is the exception.** It is **vegan**, so it takes **no Yorkshire pudding and no pigs in blankets**, matching the Sunday roast rule where the Wellington and the pies carry no Yorkshire. Describe it as vegan Christmas trimmings and vegan gravy. Never apply the full trimmings list to it.
- **Menu dishes ARE published.** (Owner-confirmed, 13 August 2026.) The dish list lives on the Christmas booking period in the management database and reaches the website through `/table-bookings/periods`, which is the same source the booking form builds a pre-order from. Publish the dishes the API returns and nothing else: the old "menu released closer to the time" wording is retired, and inventing or padding the list is still forbidden. If the API returns no menu, say nothing rather than guessing.
- **Prices:** live from the management database via the menu API. **Never hardcode a Christmas price in website page code.** Christmas set-menu tier prices quoted in prose may carry the £ symbol; per-item menu prices stay symbol-free per the price display policy at the top of this document.
- **Weekday / weekend definition:** weekday means Tuesday to Thursday. Weekend means Friday to Saturday.
- **Festive buffets stay:** Festive Sandwich & Salad, Festive Hot Finger, Festive Premium Grazing. **Minimum 30 guests, everywhere, no exceptions.**
- **The festive menu catering packages stay.** They are the real sit-down set menu. They are **not** the discontinued shared party nights, do not deactivate them.

#### Christmas 2026 price structure, provenance only

> These figures are the owner-confirmed structure, recorded so the management database can be seeded and audited. **They are not a publication source and not a fallback.** Every customer-facing Christmas price must be pulled live from the menu API. Do not copy these numbers into page code, JSON-LD, schemas or marketing copy.

- Adult 1 course: turkey £23, pork £24, beef £25 (the Sunday roast price plus £7).
- Kids 1 course: turkey £18, pork £19, beef £20 (the kids Sunday roast price plus £4).
- Adult 2 course: £33.95 weekday, £36.95 weekend.
- Adult 3 course: £36.95 weekday, £39.95 weekend.
- The "plus £7" and "plus £4" derivations are **provenance only**. Never compute a Christmas price from a live roast price at runtime, that would create a second source of truth the booking system does not charge against.

### Booking type → kitchen dependency

| Booking type | Requires kitchen open? |
|---|---|
| `sunday_lunch` | Yes |
| `food` | Yes |
| `drinks` | No |

When the kitchen is closed for a date, food and Sunday-lunch slots return empty. Drinks slots are unaffected.

### Max party size online

20 guests. Larger groups must call 01753 682707. (Canonical value: `SSOT.json` `sunday_roast.booking_policy.max_online_party_size`.)

## 8. Venue

### Capacity

> **Capacities are owner-confirmed as coming from the management app, and those are the only true numbers.** The table below mirrors them (and `SSOT.json` `venue.capacity`). Never invent or round a capacity in page copy: if a figure is not below, it is wrong. Owner-confirmed 15 August 2026.

| Space | Capacity |
|---|---|
| Whole venue, exclusive hire | 119 seated / 300 standing |
| Private hire | 10+ – 150 guests |
| Main area | 29 seated / 150 standing |
| Dining room (seated) | 26 |
| Dining room (standing) | 50 |
| Christmas (seated) | 60 |
| Christmas (standing) | 200 |
| Beer garden / terrace | 64 seated / 250 standing |

### Parking

- **20 free spaces** on site. (This is the correct number.)
- No fees, no time limit while visiting.
- **No number plate registration.** We do not ask guests to register a vehicle, and no page may say we do. Owner-confirmed 15 August 2026.
- **No free-parking time cap.** Never state a two or three hour limit for guests using the pub. Owner-confirmed 15 August 2026.
- **Leaving a car for longer** (for example while flying) is the separate **paid** airport parking product, not guest parking. Keep the two clearly distinct in copy.
- Level surface, close to entrance. CCTV and floodlit.
- Additional parking available nearby.

### Amenities

> The canonical amenities list (with full wording) is `SSOT.json` `venue.amenities`. The summary below is for quick human reference; reconcile to the JSON if they ever differ.

Free parking · Free WiFi (throughout pub and beer garden) · Beer garden (under Heathrow flight path) · Pool table · Darts · Fruit machine · Jukebox · Table service · Space to dance · Live sport on terrestrial TV · Luggage storage · Private event space / function room · Dog friendly · Board games · Community notice board.

**Table service:** food is brought to tables. Owner-confirmed 8 August 2026.

**Fruit machine and dancing:** the pub has a fruit machine, and there is space for guests to dance. Owner-confirmed 8 August 2026. Both are recorded here because the matching Google Business Profile attributes ("Has arcade games", "Has dancing") are set to Yes and were previously flagged as unsupported.

### Things The Anchor does NOT have

- Sky Sports
- TNT Sports
- Breakfast service
- Delivery service
- Guest ales
- Accessible toilet *(verified NO)*
- EV charging *(no "coming soon" claims)*
- Baby changing facilities *(verified NO)*
- Air conditioning / climate control *(verified NO, heating only)*

### Accessibility

- Step-free: bar (yes), dining area (yes), car park (yes).
- Beer garden: steps from bar, but ramp available on request.
- Accessible toilet: **NO**.
- Assistance dogs: always welcome.
- Encourage guests to call ahead to plan their visit.

### Family facilities

- High chairs: yes.
- Baby changing: **NO**.
- Bottle warming: on request.
- Buggy space: yes.
- Breastfeeding: welcome.
- Children: welcome at all hours, no age cut-off.

### Dog policy

- Welcome throughout the entire venue.
- Water bowls and dog biscuits provided.
- Must be kept on a lead at all times.
- Not allowed on furniture.
- No size limit.
- Stanwell Moor reservoirs nearby for walks.

### Payment

- Cash, credit card, debit card, American Express, contactless.
- Currency: GBP. Price range: ££.

## 9. Beer Garden

- **Seats:** 64.
- **Flight path:** Directly under Heathrow's southern runway approach path.
- **Aircraft frequency:** Approximately every 90 seconds during peak times.
- **Aircraft altitude:** 500 – 800 feet overhead.
- **Common aircraft:** A380, Boeing 777, 787 Dreamliner, A350, A330, Boeing 747.
- **Operations alternate weekly:** One week, planes land overhead until 3pm; the next, from 3pm onwards.
- **Westerly operations:** ~50% of the year.
- **Features:** Heated areas, dog friendly, full food and drink service during kitchen hours, free high-speed WiFi.

## 10. Events

> **"Doors" is banned wording for events.** (Owner-confirmed, 16 August 2026.) The
> times below are when the room is set and players should arrive, **not** when the
> pub opens. The Anchor is open from **12pm Tuesday to Sunday and 4pm on Mondays**,
> so "doors 6:30pm" tells a customer the pub is shut until 6:30pm, which is wrong
> and costs the earlier food trade. Write **"arrive from 6:30pm"** instead, and
> never label an event time "Doors" or "Doors open" in customer-facing copy.

### Quiz Night

- Monthly, dates vary, see listings.
- Arrive from 6:30pm · Start usually 7pm · End ~9:45pm.
- £3 per person. Team size max 6.
- Format: 4 rounds × 10 questions + interactive quick-fire round + comfort break.
- Capacity 80.
- Prizes: 1st place £25 bar tab; second from last gets a bottle of house wine.
- **Phone-free.** -5 points for phone use.
- Host: Question One Quiz Masters (Nikki Manfadge occasional).

### Cash Bingo

- Monthly (dates vary).
- Arrive from 6pm (book sales from 6pm) · Eyes-down 7pm.
- £10 per book (**cash only**). £1 daubers cash only.
- 10 games. Capacity 60.
- Prizes vary by event. Snowball increases by £20 and 2 calls each month it rolls over. Current jackpot values belong in event records only.

### Music Bingo

- Dates vary.
- Arrive from 6:30pm · **Start 7pm** unless the event record says otherwise. (Start
  time corrected from 8pm, owner-confirmed 16 August 2026. Anything still saying
  8pm is wrong.)
- £3 per person unless the event record says otherwise. Two games with interactive music games and quizzes too; song clips replace bingo numbers.
- Capacity 90. Host: Nikki Manfadge.
- Private nights available on request.

### Live Music, DISCONTINUED

- **Live music is discontinued in full.** (Owner-confirmed, 11 August 2026.) No live bands, no acoustic sets, no tribute acts, no solo performers. This is not a seasonal pause, the format has stopped.
- Do not list, promote, schedule or link to live music. Do not target live music keywords. Do not describe The Anchor as a live music venue or a music pub.
- The `/live-music` route is retired and redirects to `/whats-on`. The `live-music-pubs-near-heathrow` blog post is retired and redirects to `/whats-on`.
- Previously published details (local bands, acoustic sets, tribute acts, free entry, 8:30pm start, capacity 150) are **superseded and must not be restored**.

### Karaoke

- **Not a regular feature in 2026.** Karaoke happens occasionally, nothing more. Only promote it when a specific event record lists it. Never imply a weekly, monthly or Friday slot. (Owner-confirmed, 11 August 2026.)
- **Not hosted by Nikki Manfadge.** Nikki hosts Music Bingo. Karaoke has no fixed host. Take the host from the event record, or name nobody. (Owner-confirmed, 11 August 2026.)
- Free entry.
- Capacity 50.
- Do not publish a recurring EventSeries schema for karaoke. Individual nights get their own Event schema when listed.

### DJ

- **A DJ is booked in from time to time**, and is **confirmed for Halloween and New Year's Eve**. (Owner-confirmed, 11 August 2026.)
- **A DJ can be arranged for a Christmas booking on request.** It is not included by default and is not part of a package, so never advertise it as included. Offer it as something a group can ask for. (Owner-confirmed, 11 August 2026.)
- Outside those cases, only promote a DJ when a specific event record lists one. Never imply a resident DJ or a regular DJ night.

### New Year's Eve

- **We stay open until 1am on New Year's Eve.** (Owner-confirmed, 16 August 2026.) This is the one night where a closing time may be stated in copy, and `/new-years-eve` does so throughout, including in its page title. It is a licensed exception to the rule in §3 that opening hours only ever come from the API, so do not strip it as a hardcoded hours claim.
- A DJ and a midnight countdown are confirmed for the night, see the DJ entry above.

### Curry Club

- Monthly rotating curry-night specials.

### Nikki's Games Night

Discontinued unless reintroduced in event listings. Do not promote Nikki hosted/games nights as a recurring format. Nikki currently hosts Music Bingo only.

### Tasting Nights

- Occasional (no fixed frequency).
- Expert-led sessions across whisky, gin, rum, wine and beer.

> Event details are managed per-event in the management app and live canonically in `SSOT.json` under `events`. The summaries above are for reference; confirm current dates, times and prices against the management app / API.

### Retired entertainment formats

- **Open mic is discontinued.** Do not list, promote, or link to open mic nights. The retired `/open-mic` route redirects to `/whats-on`.
- **Live music is discontinued.** (Owner-confirmed, 11 Aug 2026.) Do not list, promote, schedule or link to live music, live bands, acoustic sets, tribute acts or solo performers. Do not target live music keywords or call The Anchor a live music venue or music pub. `/live-music` and `/blog/live-music-pubs-near-heathrow` are retired and redirect to `/whats-on`. Karaoke and a DJ still happen occasionally, but only promote either when a specific event record lists it.
- **Drag cabaret is discontinued.** Do not list, promote, or link to drag cabaret nights, and do not target drag cabaret or drag show keywords. **Music Bingo is the only drag night.** (Owner-confirmed, 9 Aug 2026.) The retired `/whats-on/drag-shows` route redirects to `/whats-on`, and past "Drag Cabaret & Karaoke" event pages stay live but out of search. Music Bingo copy may still refer to its drag host.

## 11. Private Hire

- **Capacity:** 10+ – 150 guests. (Full venue exclusive hire: 119 seated or 300 standing; 60 seated at Christmas, 200 standing.) Values from the management DB `venue_spaces`: dining room 26 seated / 50 standing, main area 29 / 150, garden 64 / 250, whole venue 119 / 300.
- **Dining room:** 26 seated or up to 50 standing. French doors open onto the beer garden.
- **Spaces available:** Beer garden, dining room.
- **Room hire charge:** Discuss on enquiry. Do not publish minimum-spend wording.
- **Deposit:** £250.
- **Pricing rule:** Do not mention food pricing unless it comes through the live API, management database, or latest approved private-hire PDF.

### Catering, Buffet (verified prices)

| Package | Price | Minimum |
|---|---|---|
| Sandwich Buffet | (live, DB) | 30 guests |
| Finger Buffet | (live, DB) | 30 guests |
| Burger Buffet | (live, DB) | 30 guests |
| Premium Buffet | (live, DB) | 30 guests |
| Pizza Buffet | menu priced | 30 guests |
| Indoor BBQ | (live, DB) | 30 guests |
| Chicken Goujon Sharing Tray | (live, DB) (serves ~10) | 25 guests |

### Festive buffets (seasonal, minimum 30 guests)

| Package | Price | Minimum |
|---|---|---|
| Festive Sandwich & Salad | (live, DB) | 30 guests |
| Festive Hot Finger | (live, DB) | 30 guests |
| Festive Premium Grazing | (live, DB) | 30 guests |

The 30-guest minimum applies everywhere. Any 25-guest or 26-guest figure still showing in the management database, in `SSOT.json` or in page copy is wrong and must be corrected to 30.

### Drinks Packages

| Package | Price | Minimum |
|---|---|---|
| Welcome Drinks | (live, DB) | 10 |
| Welcome Prosecco / Orange Juice | (live, DB) | 10 |
| Unlimited Tea and Coffee | (live, DB) | 10 |
| Kids Unlimited Squash | (live, DB) | 10 |
| Pimm's Jar | (live, DB) | 30 |
| Bar Tab | variable |, |
| Bring Your Own Food | free |, |

### Kids Catering

- Kids Burger and Chips: (live, DB).
- Kids Chicken Nuggets and Chips: (live, DB).
- Kids Mini Pizza and Chips: (live, DB).

### Equipment & services

Equipment and services: TVs and sound system (no projector) · Dedicated events coordinator · Free WiFi · Free parking for all attendees.

### Event types offered

Wakes / memorials · Christenings · Engagement parties · Baby showers · Gender reveals · Retirement parties · Milestone birthdays · Summer garden parties · Corporate events · Christmas parties · Private parties. (Canonical list: `SSOT.json` `private_hire.event_types`. Never "weddings" or "wedding receptions", see §14.)

> **Pre-order language is allowed** for private events, and for the **2-course and 3-course** Christmas tiers only. The **1-course** Christmas tier is pre-book **without** pre-order, so blanket "Christmas is pre-order only" copy is wrong, see §7. The 2026-05-17 walk-in change applies only to the **Sunday roast service**, it does not affect private-hire pre-ordering.

> **Groups above 20 are private hire, not a table booking.** Route them to manager@the-anchor.pub, 01753 682707, or WhatsApp 01753 682707.

### Wakes, speciality

- Private entrance area.
- No room hire charge.
- Short notice accepted (24–48 hours).

### Nearby venues for wakes

- South West Middlesex Crematorium, 10 minutes drive.
- Staines Cemetery, 8 minutes drive.
- Slough Crematorium, 15 minutes drive.

## 12. Ratings & Reputation

- **Google:** Show the 4.6 rating. Do not show or hardcode a review count; pull any count from an approved live source or omit it.
- **Claim:** Highly rated near Heathrow. Use stronger highest-rated claims only with current evidence.
- **TripAdvisor:** Volatile. Do not hardcode rank in evergreen copy.
- **Food Hygiene:** 5-star rating, maintained 7 years (since 2019). All staff Level 2 qualified.

## 13. Areas Served & Nearby Hotels

**Primary areas:** Stanwell Moor, Stanwell, Staines-upon-Thames.
**Secondary:** Ashford, Feltham, Sunbury, Egham, Windsor, Colnbrook.

**Nearby hotels (commonly referenced):** Sofitel, Travelodge, Hilton, Marriott, Renaissance, Crowne Plaza, Premier Inn, ibis.

## 14. Things We Don't Say, Banned Claims

These are verified incorrect or risky. **Never use them in any content** (page copy, schema, blog, social, email):

### Identity & history
- **1866 or 1869 as founding year**, correct year is 1751.
- **"Since the 1800s"**, too vague; use 1751.
- **"Community hub since 1995"**, this conflicts with the 1751 established date and weakens trust with Google. Only use 1995 if it refers specifically to the current ownership or operating chapter, and always clarify the distinction.
- **"Best" or "premier" claims** without substantiation.

### Sunday roast
- **Roasted Chicken (adult), Slow-Cooked Lamb Shank, Crispy Pork Belly, Cauliflower Cheese side**, all retired 2026-04-29. Lamb is no longer served anywhere.
- **Wellington as "vegetarian"**, it is **fully vegan**. Always say "vegan".
- **"Beef-dripping" potatoes**, we do not use beef dripping. Potatoes are triple-cooked and herb-and-garlic crusted.
- **"Red wine gravy"**, never describe our gravy as red wine gravy. Use "signature gravy" (default, contains meat stock) or "regular gravy" (vegan, available on request and default with the wellington).
- **Sunday roast pre-order / Saturday 1pm cutoff / per-roast prepayment**, all retired with the 2026-05-17 walk-in launch. Don't reintroduce.
- **Beef as "not on the menu"**, that older guidance is reversed; beef is now the headline roast.

### Christmas (retired 2026-07-21)

Remove every trace of these from copy, schema, JSON-LD and data shapes:

- **Shared Christmas party nights**, discontinued. The festive menu catering packages are a sit-down set menu, not a party night; do not conflate the two.
- **All the Trimmings Board**, discontinued.
- **XL Board**, discontinued.
- **Per-person Christmas add-ons**, discontinued: pigs in blankets, stuffing balls, cauliflower cheese pot, extra roast potatoes, extra Yorkshire puddings. (Pigs in blankets and stuffing remain as **trimmings included in the meal**, they are no longer paid add-ons.)
- **Bundle A (prosecco plus coffee and mince pie)**, discontinued.
- **Standalone drinks bundles**, discontinued.
- **"1 November to 23 December 2026"**, superseded. The window is 10 November to 20 December 2026 inclusive.
- **Weekday / weekend two-price festive menu split as the whole story**, superseded by the three-tier structure (1, 2 and 3 course) in §7.
- **"All Christmas meals are pre-order only"**, wrong. 1 course is pre-book without pre-order.
- **Christmas bookings under 6 guests, or with less than 24 hours notice**, not accepted, never imply otherwise.
- **A kids 2-course or 3-course price**, does not exist. Never invent one.
- **Named Christmas dishes**, the menu is not finalised. Only "menu released closer to the time" is permitted.
- **26-guest or 25-guest festive buffet minimums**, wrong. The minimum is 30.

### Allergens
- **"No allergens"** when allergen data is missing, never render this. Use "See menu or contact us for allergen information".
- **"Gluten-free"** as a claim about any dish, base, gravy or menu. It is a regulated term meaning below 20 ppm, which a single shared kitchen cannot guarantee. Use **NGCI (No Gluten Containing Ingredients)** with the cross-contamination caveat. The `/food-menu/gluten-free` URL and meta description keep the search phrase; the visible label does not. See §5.

### Drinks & sport
- **Mulled wine**, we do not sell it. Owner-confirmed 5 August 2026. Never list it on a drinks menu, a festive page, a blog post or in seasonal copy. "Winter warmers", "festive drinks" or "seasonal cocktails" are the safe alternatives. Dated recaps of past events may keep a historical mention; forward-looking copy may not.
- **BOGOF pizza**, discontinued.
- **Stanwell Moor Brew**, discontinued.
- **Pravha beer**, no longer stocked.
- **Champions League viewing**, we cannot show it (no Sky/TNT). Fix any old pizza-Tuesday content that implies otherwise.

### Operations
- **`info@theanchorpub.co.uk`**, legacy email. Use `manager@the-anchor.pub`.
- **EV charging "coming soon"**, not happening; remove all "coming soon" references.
- **Dog secure fencing**, unverified, do not claim.
- **Special doggy Sunday dinners**, unverified, do not claim.
- **Baby changing facilities**, verified **NO**, we do not have them.
- **Accessible toilet**, verified **NO**, we do not have one.
- **Air conditioning / climate control**, verified **NO**, we do not have it. Never describe any space as "climate controlled", "air conditioned", or offering "year-round comfort". We have **heating** only, so describe warmth in the cooler months, not cooling. (Beer-cellar cooling/refrigeration is a separate back-of-house system and is fine to mention in sustainability contexts.)
- **Wedding receptions**, we host smaller private events only, not wedding receptions.

## 15. Maintaining This Document

**The update rule:** When operational reality changes, update **this document first**. Page copy, JSON-LD, schemas, blog posts, and the management DB all follow.

**Mirror file:** `/SSOT.json` carries a structured subset of stable facts for programmatic lookup. Opening hours, kitchen hours, drinks stock, prices, current review counts and ranks must come from live sources. When this Markdown file changes, the JSON should be reconciled. If the two ever disagree, this Markdown is canonical.

**Word doc render:** `docs/SSOT-Review-The-Anchor.docx` can be regenerated for non-technical reviewers via `node docs/generate-ssot-docx.mjs` (the script reads `/SSOT.json`, so update the JSON first if the docx is what an external reviewer is reading).

**Process docs (separate concern):** `docs/ssot-review-spec.json` is a spec for the SSOT *review process*, not a brand-fact source. Don't edit it as part of routine fact updates.
