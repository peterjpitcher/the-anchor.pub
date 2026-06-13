# The Anchor, Single Source of Truth

> **PRICING POLICY:** All food & drink prices (roast, menu, drinks, catering/buffet) are **LIVE from the management database** (menu API). This document holds item names and structure only — **never hardcode or quote a price from here or anywhere else; always pull live**. Non-food figures (deposits, ULEZ saving, quiz/bingo entry, prizes, minimum spend) are not menu prices and remain.

> **Read before writing customer-facing content.** This document is the canonical reference for every fact about The Anchor that appears on the website, in JSON-LD schemas, in blog posts, in social copy, in marketing emails, or in any other customer-facing surface. If a claim you want to make is not in this document, **stop and ask**, do not guess, do not infer, do not fall back on training data.
>
> If this document and existing page copy disagree, the SSOT wins. Update this document first when operational reality changes; the page copy and JSON-LD must follow.

This file is the human-edited source. `/SSOT.json` mirrors a subset of these facts in structured form for programmatic lookup. When the two diverge, this Markdown file is canonical and the JSON should be reconciled to match.

Last menu refresh: **2026-04-29** (Sunday roast line-up rebuilt; wellington reaffirmed as vegan; cauliflower cheese retired). Walk-in launch shipped **2026-05-17**.

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
- **Tone:** Friendly, cheeky, inclusive.
- **Perspective:** First-person plural, "we" / "our".
- **Language:** British English spelling and idiom.
- **Punctuation:** Do not use em dashes in customer-facing copy. Prefer commas, short sentences, or parentheses where needed.
- **Audience note:** Responds to local demographic change including the growing Indian community.

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
| Terminal 2 | 11 minutes |, |
| Terminal 3 | 11 minutes | 5.3 miles |
| Terminal 4 | 12 minutes |, |
| Terminal 5 | 7 minutes | 3.8 miles |
| Staines | 8 minutes |, |

General range to use in copy: **7–12 minutes** from any Heathrow terminal.

## 3. Opening Hours (regular)

Only ever use the API for opening hours in case they have to change. No hard coded opening times.

> Special-hours overrides come from the management API (`/business/hours`) and **always win**. `kitchen: null` for a date means the kitchen is closed for that date, treat as deliberate, not as missing data. Use `??` (not `||`) when resolving special vs. regular kitchen data; `||` will silently fall through and has caused real bugs.

## 4. Sunday Roast, operational claims

Effective from the **17 May 2026 walk-in launch**. Menu refreshed **29 April 2026** (chicken, lamb, pork belly and cauliflower cheese retired; turkey, two pies and sliced beef/pork added; wellington reaffirmed as vegan).

- **Service window:** Sundays 1pm – 6pm. Kitchen 1pm – 6pm. Last bookable arrival 5:30pm.
- **Pre-order:** **Not required.** No Saturday cutoff. No per-roast prepayment.
- **Walk-ins:** Welcome the whole window. Last seating is 5:30pm.
- **Booking:** Strongly recommended for groups and peak slots, but not required.
- **Max online party size:** 10. Larger groups must call.
- **Deposit:** No Sunday-specific deposit. The standard large-group deposit (groups of 10+) applies on any day, any booking type, see §7.

### Current menu

| Dish | Price | Yorkshire pud? | Notes |
|---|---|---|---|
| Roast Beef Topside | (live — DB) | Yes | 28-day topside, slow-roasted, carved fresh per plate |
| Roast Pork Leg | (live — DB) | Yes | Sliced to order with Bramley apple sauce |
| Roast Turkey with Stuffing Ball | (live — DB) | Yes | Carved fresh; sage and onion stuffing ball |
| Beef & Ale Pie | (live — DB) | **No** | Slow-cooked British beef in ale gravy under golden short-crust pastry |
| Chicken & Wild Mushroom Pie | (live — DB) | **No** | Tender chicken and wild mushrooms in creamy sauce under golden short-crust pastry |
| Beetroot & Butternut Squash Wellington | (live — DB) | No | **Fully vegan.** Default plate is vegan |
| Kids Roast | (live — DB) | If pork or turkey | Smaller, child-sized portion. Choice of pork, turkey or wellington |

**Price range to quote in copy:** Do NOT quote a hardcoded range — prices are live from the management DB (menu API). Pull live.

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
| Fish and Chips | (live — DB) |
| Half Fish and Chips | (live — DB) |
| Scampi and Chips | (live — DB) |
| Bangers and Mash | (live — DB) |
| Beef and Ale Pie *(weekday version)* | (live — DB) |
| Chicken & Wild Mushroom Pie *(weekday version)* | (live — DB) |
| Chicken, Ham Hock & Leek Pie | (live — DB) |
| Butternut Squash, Mixed Bean & Mature Cheddar Pie | (live — DB) (vegetarian) |
| Classic Beef Burger | (live — DB) (chips included) |
| Burger Stack (Beef / Chicken / Spicy Chicken / Garden) | (live — DB) |
| Lasagne | (live — DB) |
| Mac and Cheese | (live — DB) (vegetarian) |
| Stone-baked pizzas | (live — DB) (12-inch, hand-stretched, gluten-free bases available) |
| Kids menu | from (live — DB) |
| Wraps | from (live — DB) |
| Chips | (live — DB) |
| Cheesy Chips | (live — DB) |

**Price range to quote in copy:** Do NOT quote a hardcoded range — prices are live from the management DB (menu API). Pull live.

### Friday over-65s offer

50% off fish & chips for over-65s on Fridays.

### Things we don't do (food)

- **No breakfast service.**
- **No delivery.** Takeaway by phone for collection only.
- **No gluten-free fish and chips.** Do not claim gluten-free batter, gluten-free fried fish, grilled gluten-free fish, or a dedicated gluten-free fryer for fish and chips. Guests who need gluten-free options should use the gluten-free menu/allergen guidance instead.
- **No "real ale" positioning.** We stock bottled ales only; no handpumps. Do not market as a "real ale pub".

### Kids menu (regular)

Sausage and mash · Fish fingers · Tomato pasta · Chicken goujons · Mini roasts (Sundays).

## 6. Drinks

The full drinks inventory lives in `/SSOT.json` under `drinks`. The website does not own a master drinks list. Use the JSON for any "what do you serve" lookups.

**Notable rules:**
- **No Sky Sports / TNT Sports.** Live sport on terrestrial channels (BBC, ITV, Channel 4) only since January 2025.
- **No guest ales.** Bottled ales only.
- **Discontinued (do not list):** Stanwell Moor Brew (DISCONTINUED 2026-03-22). Pravha (DISCONTINUED, no longer stocked).
- **Promotions:** Double-up on optics for (live — DB). Monthly Manager's Special (discounted featured premium spirit).
- **Shandies:** Available for all draught lagers.

## 7. Booking & Deposits

### General deposit policy

- **Threshold:** Groups of 10 or more, on any day, any booking type.
- **Amount:** £10 per person, fully deducted from the bill on the day.
- **Smaller groups (1–9):** No deposit. No card details required at booking.
- **Standard copy:** "Groups of 10 or more: a £10 per person deposit, fully deducted from your bill."

### Booking type → kitchen dependency

| Booking type | Requires kitchen open? |
|---|---|
| `sunday_lunch` | Yes |
| `food` | Yes |
| `drinks` | No |

When the kitchen is closed for a date, food and Sunday-lunch slots return empty. Drinks slots are unaffected.

### Max party size online

20 guests. Larger groups must call 01753 682707.

## 8. Venue

### Capacity

| Space | Capacity |
|---|---|
| Maximum (whole venue) | 250 |
| Private hire | 10 – 50 guests |
| Dining room (seated) | 26 |
| Christmas (seated) | 60 |
| Christmas (standing) | 200 |
| Beer garden | 64 seats |

### Parking

- **20 free spaces** on site. (This is the correct number.)
- No fees, no time limit while visiting.
- Level surface, close to entrance. CCTV and floodlit.
- Additional parking available nearby.

### Amenities

Free parking · Free WiFi (throughout pub and beer garden) · Beer garden (under Heathrow flight path) · Pool table · Darts · Jukebox · Live sport on terrestrial TV · Luggage storage · Private event space / function room · Dog friendly · Board games · Community notice board.

### Things The Anchor does NOT have

- Sky Sports
- TNT Sports
- Breakfast service
- Delivery service
- Guest ales
- Accessible toilet *(verified NO)*
- EV charging *(no "coming soon" claims)*
- Baby changing facilities *(verified NO)*

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

### Quiz Night

- First Wednesday of each month.
- Doors 6:30pm · Start 7pm · End ~9:45pm.
- £3 per person. Team size max 6.
- Format: 4 rounds × 10 questions + interactive quick-fire round + comfort break.
- Capacity 80.
- Prizes: 1st place £25 bar tab; second from last gets a bottle of house wine.
- **Phone-free.** -5 points for phone use.
- Host: Question One Quiz Masters.

### Cash Bingo

- Monthly (dates vary).
- Doors 6pm (book sales from 6pm) · Eyes-down 7pm.
- £10 per book (**cash only**). £1 daubers cash only.
- 10 games. Capacity 60.
- Prizes: drinks, chocolate, vouchers, £10 cash boosts. Snowball bonus: +£20 each month it rolls over. Jackpot pot grows to £300+ when the room sells out.

### Music Bingo

- Dates vary.
- Doors 6:30pm · Start ~7pm.
- £3 per person. Two games; song clips replace bingo numbers.
- Capacity 90. Host: Nikki Manfadge.
- Private nights available on request.

### Live Music

- Local bands, acoustic sets, tribute acts.
- Always free entry.
- Start ~8:30pm · End ~11:30pm.
- 18+ after 9pm.
- Capacity 150.
- Kitchen open until midnight on live music nights.

### Karaoke

- Fridays 8pm – 11pm.
- Free entry.
- Capacity 50. Catalogue 50,000+ songs.
- Host: Nikki Manfadge.

### Curry Club

- Monthly rotating curry-night specials.

### Retired entertainment formats

- **Open mic is discontinued.** Do not list, promote, or link to open mic nights. The retired `/open-mic` route redirects to `/live-music`.

## 11. Private Hire

- **Capacity:** 10 – 50 guests. (250 max venue-wide; 60 seated at Christmas, 200 standing.)
- **Dining room:** 26 seated, with standing room for more. French doors open onto the beer garden.
- **Spaces available:** Beer garden, dining room.
- **Room hire charge:** None. We use a minimum-spend model.
- **Minimum spend:** £500 – £1,500 depending on day and size.
- **Deposit:** £250.

### Catering, Buffet (verified prices)

| Package | Price | Minimum |
|---|---|---|
| Sandwich Buffet | (live — DB) | 30 guests |
| Finger Buffet | (live — DB) | 30 guests |
| Burger Buffet | (live — DB) | 30 guests |
| Premium Buffet | (live — DB) | 30 guests |
| Pizza Buffet | menu priced | 30 guests |
| Indoor BBQ | (live — DB) | 30 guests |
| Chicken Goujon Sharing Tray | (live — DB) (serves ~10) | 25 guests |

### Drinks Packages

| Package | Price | Minimum |
|---|---|---|
| Welcome Drinks | (live — DB) | 10 |
| Welcome Prosecco / Orange Juice | (live — DB) | 10 |
| Unlimited Tea and Coffee | (live — DB) | 10 |
| Kids Unlimited Squash | (live — DB) | 10 |
| Pimm's Jar | (live — DB) | 30 |
| Bar Tab | variable |, |
| Bring Your Own Food | free |, |

### Kids Catering

- Kids Burger and Chips: (live — DB).
- Kids Chicken Nuggets and Chips: (live — DB).
- Kids Mini Pizza and Chips: (live — DB).

### Equipment & services

AV equipment (projector, screen, sound system) · Dedicated events coordinator · Free WiFi · Free parking for all attendees.

### Event types offered

Wakes / memorials · Christenings · Baby showers · Gender reveals · Retirement parties · Milestone birthdays · Summer garden parties · Corporate events · Christmas parties · Private parties.

> **Pre-order language is allowed** for private events and Christmas parties. The 2026-05-17 walk-in change applies only to the **Sunday roast service**, it does not affect private-hire pre-ordering.

### Wakes, speciality

- Private entrance area.
- No room hire charge.
- Short notice accepted (24–48 hours).

### Nearby venues for wakes

- South West Middlesex Crematorium, 10 minutes drive.
- Staines Cemetery, 8 minutes drive.
- Slough Crematorium, 15 minutes drive.

## 12. Ratings & Reputation

- **Google:** 4.6 stars, 238 reviews.
- **Claim:** Highest-rated independent pub near Heathrow.
- **TripAdvisor:** #22 of 95 restaurants in Staines.
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

### Drinks & sport
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
- **Wedding receptions**, we host smaller private events only, not wedding receptions.

## 15. Maintaining This Document

**The update rule:** When operational reality changes, update **this document first**. Page copy, JSON-LD, schemas, blog posts, and the management DB all follow.

**Mirror file:** `/SSOT.json` carries a structured subset of these facts (menu, hours, drinks inventory, etc.) for programmatic lookup. When this Markdown file changes, the JSON should be reconciled. If the two ever disagree, this Markdown is canonical.

**Word doc render:** `docs/SSOT-Review-The-Anchor.docx` can be regenerated for non-technical reviewers via `node docs/generate-ssot-docx.mjs` (the script reads `/SSOT.json`, so update the JSON first if the docx is what an external reviewer is reading).

**Process docs (separate concern):** `docs/ssot-review-spec.json` is a spec for the SSOT *review process*, not a brand-fact source. Don't edit it as part of routine fact updates.
