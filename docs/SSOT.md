# The Anchor, Single Source of Truth

| | |
|---|---|
| **Version** | 2.0, restructured 10 September 2026 |
| **Owner** | Peter Pitcher, licensee |
| **Last full review** | 10 September 2026 |
| **Next full review** | 10 December 2026, then every quarter |
| **To change a fact** | Update the source that owns it first (§15 says which), then this document, then everything that mirrors it. Record the change in §18. |

> **Read before writing customer-facing content.** This document is the canonical reference for every fact about The Anchor that appears on the website, in JSON-LD schemas, in blog posts, in social copy, in marketing emails, or in any other customer-facing surface. If a claim you want to make is not in this document, **stop and ask**, do not guess, do not infer, do not fall back on training data.
>
> If this document and existing page copy disagree, the SSOT wins, and the page is wrong. If this document and the system that owns a fact disagree (the management app for hours, prices, capacities and events), the owning system wins and this document is stale: fix it. §15 lists who owns what.

> **PRICING POLICY:** All food and drink prices (roast, menu, drinks, catering/buffet) are **LIVE from the management database, POS, menu API, or latest approved private-hire source**. This document holds stable rules and item structure only. **Never hardcode or quote a price from here or anywhere else; always pull live.** Non-food figures such as deposits, quiz/bingo entry and fixed prizes may remain only where confirmed. There is no ULEZ saving figure to quote (§14).
>
> **PRICE DISPLAY:** Menu item prices are displayed **without currency symbols** (e.g. "16", not "£16"): a deliberate menu-psychology choice, owner-confirmed 2026-07-19. Do not "fix" bare menu prices by adding £. JSON-LD `Offer.price` values are always bare numeric strings regardless of display. Aggregate copy lines (e.g. "Food £5 to £16", "from £16") keep the £ symbol; the rule applies to per-item menu prices only.

> **Strategy data lives elsewhere.** Marketing strategy (target audiences, psychographic segments, competitive landscape) is not a brand fact and lives in `docs/brand-strategy.md`, not here and not in `SSOT.json`. Do not quote competitor names or audience labels in customer-facing copy.

Last menu refresh: **2026-04-29** (Sunday roast line-up rebuilt; wellington reaffirmed as vegan; cauliflower cheese retired). Walk-in launch shipped **2026-05-17**. Christmas 2026 offer confirmed by the owner **2026-07-21** (see §7).

### How this document is laid out

- **Quick card**, below: the handful of facts most copy needs.
- **§1** how we sound. Read it before writing anything.
- **§2 to §13** the facts, one area per section.
- **§14** what we never say, and what to say instead.
- **§15** who owns each fact, and how to keep this document true.
- **§16** approved wording you can paste as it stands.
- **§17** claims that need evidence behind them.
- **§18** what changed, and when.
- Engineering detail (how the API behaves, why a database row is kept) lives in `docs/SSOT-engineering-notes.md`, not here.

**The section numbers are stable on purpose.** Around 140 references across the site's pages, components, tests and docs cite this document as "SSOT §7" and so on. New material goes at the end; nothing is renumbered.

---

## Quick card

The facts most copy needs. Each is detailed, with its source, further down.

| | |
|---|---|
| Name | The Anchor. "The Anchor Pub" only in page titles, alt text and schema names (§1). |
| Phone | 01753 682707, also on WhatsApp (§2). |
| Email | manager@the-anchor.pub, the only correct address (§2). |
| Address | Horton Road, Stanwell Moor, Surrey, TW19 6AQ (§2). |
| Established | 1751 (§1). |
| Opening hours | Always from the management app's live hours, never typed in (§3). |
| Sunday roast | Sundays 1pm to 6pm, last seating 5:30pm, walk-ins welcome, nothing to pre-order (§4). |
| Group deposit | 15 or more guests: £10 per person, deducted from the bill. More than 20 is private hire (§7). |
| Private hire deposit | £250, instead of the group deposit, never both. Held separately and refunded after the event, not taken off the bill (§11). |
| Christmas 2026 | Sittings 10 November to 20 December, from 4 guests, 24 hours' notice, £10 per person deposit. 2 and 3 courses need choices 7 days ahead; inside that it's 1 course (§7). |
| Over Christmas | Drinks only 12pm to 3pm on 25 December. Closed 26 December and 1 January. Kitchen's last day is 20 December, back on 12 January (§7). |
| Parking | 20 free spaces, no time limit while visiting, nothing to register (§8). |
| Getting in | Step free from the car park. One step between the bar and the garden, ramp on request. No accessible toilet (§8, §16). |
| Dogs | Welcome throughout, on a lead (§8). |
| Never say | 1866, gluten-free, red wine gravy, beef dripping, Sky or TNT Sports, breakfast, delivery, mulled wine, "Doors open", a runway designator, a ULEZ saving figure (§14). |

---

## 1. Identity & Voice

### The facts

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
- **Marketing description:** The closest traditional British pub to Heathrow Airport. Famous Sunday roasts, beer garden under the flight path, and FREE parking for all guests. (Evidence status in §17.)
- **Perspective:** First-person plural, "we" and "our". Address the reader as "you".
- **Language:** British English spelling and idiom.

### The voice in one line

**We sound like a friendly local telling you about their favourite pub.** Warm, a bit excited, easy to read, and never showing off.

If the copy could belong to any pub chain, it is wrong. Rewrite it.

### What we stand for

Copy should make people **feel invited, not just informed**.

- **Belonging.** "Where Everyone's Welcome" is a promise, not a strapline. Every piece of copy should read like a friend saying "come along, you'll love it".
- **The village first.** We are Stanwell Moor's pub. The airport is why people find us, not why we exist.
- **Pride.** A village pub that has stood here since 1751, before Heathrow existed. We are proud of that and it is fine to show it.
- **Simple joy.** A proper roast. A full beer garden. Planes thundering overhead. A quiz that gets far too competitive. Small pleasures, done properly.

### Rule 1: Plain simple English

This is the rule that matters most. Short words, short sentences, one idea at a time.

**Testable standards:**

- Aim for an average sentence under 15 words. Review any sentence over 25: it is almost always two.
- One idea per sentence. If it needs an "and" plus a "but", it is two sentences.
- **Use contractions.** "We're", "you'll", "don't", "it's", "there's". Not "we are", "you will", "do not". This is the single fastest way to sound human.
- Use the short word every time.
- If a sentence needs reading twice, cut it in half.
- Say the location fact **once per page**, in your own words. Do not paste "seven minutes from Heathrow Terminal 5 with free parking" into every intro. It reads like a machine.

**Word swaps:**

| Don't write | Write |
|---|---|
| patrons *(always)*, guests *(when you mean the reader)* | you |
| venue, establishment, facility | the pub |
| complimentary | free |
| approximately, around *(for a confirmed number)* | the number itself |
| in close proximity to | near |
| we are able to | we can |
| please note that | *(delete it)* |
| at this moment in time | now |
| dining experience, guest experience | dinner, a meal, your visit |
| our team will be happy to assist | ask the bar team |
| offering, provision, curated, bespoke | *(never)* |

"Guests" stays where it is a count or a policy term: "a minimum of 4 guests", "groups of 15 or more guests". Those rules have to be exact, and "you" cannot carry a number.

### Rule 2: Upbeat, with a limit

**Lead with what the reader needs.** For an invitation, that is why it is worth coming, then the details. For an allergen, an access question or a booking rule, it is the answer, straight away. Never make someone read three lines of excitement to find out whether they can get in.

- Energy comes from **verbs and specifics**, not punctuation. One exclamation mark per page, maximum. Usually none.
- "We love", "we can't wait", "our favourite" are encouraged.
- **Never open a description with a command.** Banned openers: *Delight in, Indulge in, Savour, Treat yourself to, Experience, Discover, Enjoy.* Say what the thing is and why it's good.
- **Banned flourish words:** quintessentially, sophisticated, elegant, effervescent, utterly, iconic, premium, artisan, indulgent, luxurious, elevates, sensation, pinnacle.
- **Banned filler:** great atmosphere, something for everyone, hidden gem, look no further, nestled, boasts, a must-visit.

**Before and after, from our own pages:**

> ❌ "Indulge in a comforting roast beef dinner that is rich and full of flavour."
> ✅ "28-day topside, carved when you order it. Yorkshire pudding, triple-cooked potatoes, our own gravy."

> ❌ "Quintessentially British elegance in a glass. Premium gin infused with delicate elderflower creates a sophisticated summer sipper."
> ✅ "Gin and elderflower, long and cold. The one everyone orders in the garden."

> ❌ "We serve Sunday roasts from 1pm to 6pm."
> ✅ "Sunday is what we live for. Roasts carved fresh from 1pm, walk in whenever suits you."

> ❌ "The beer garden is located near Heathrow Airport."
> ✅ "Pint in hand, planes roaring over the garden, seven minutes from Terminal 5. There's nowhere else like it."

### Rule 3: Community first

We're the village's pub. Write like it.

- **Name real things.** The notice board. The charity quiz. The team that always comes second. The reservoirs walk. The village hall. Not "the local community" in the abstract.
- **Credit people.** A charity night says who it's for. An event says who hosts it. A win says who won.
- **"We" means the team and the regulars**, not the business.
- **Locals first, travellers second.** A page can serve both, but the village voice comes first. "Your local" beats "a convenient stop near the airport".
- If a piece of copy could have been written by someone who has never been to Stanwell Moor, rewrite it.

### Rule 4: Inclusive by default

- Write as if you're inviting someone who has **never set foot in a pub**. No assumed knowledge. No in-jokes that need a regular to get.
- **Everyone goes in the same sentence**, not a special paragraph at the bottom. The vegan roast sits in the roast list. The kids menu is a menu, not a concession.
- **Drinking is never the price of entry.** Soft drinks, food, and just sitting there all count.
- Write for who actually walks in: families, women on their own, the growing Indian community, dog owners, airport staff coming off shift, older regulars, people with a buggy, people who don't drink.
- **Accessibility copy always states the route, never a single adjective.** "Step free" alone is not a fact, it's half a fact. See §8, and paste §16.
- **A welcome is not a promise that every need can be met.** The warmth is in helping someone decide, which includes telling them plainly what we don't have.

**How to say no.** We have real nos: no accessible toilet, no baby changing, no Sky Sports, no delivery, no gluten-free. Never hide them and never apologise for them. Use this shape every time:

> **What we don't have + what we do have or can do + how to check.**

The live example to copy:

> "We currently don't have an accessible toilet. If you'd like to visit and want to check what will work best for you, give us a call on 01753 682707 and we'll help."

### Rule 5: Excitement never invents facts

Every claim comes from this SSOT. §14 banned claims still apply. Prices, hours, capacities and event details stay live from their real sources. The energy is in the delivery, never in exaggeration.

Never hedge a confirmed number. It's "20 free spaces", not "around 20".

**Buttons say what happens next** ("Book a table", "Book your places", "See the menu"), and they match how the booking really works. Never promise a table on a night with shared seating.

### Punctuation

- Do not use em dashes in customer-facing copy. Use commas, short sentences, or brackets.
- Exclamation marks earn their place: one per page at most, never stacked.

### Register dial

- **High energy:** homepage hero, event pages, blog posts, social copy, marketing emails.
- **Medium:** menu descriptions, area and feature pages, FAQs.
- **Calm and exact:** opening hours, booking flow, deposits, allergen information, accessibility, confirmations, anything operational or legal. Accuracy beats energy here, always. No jokes.

**The test for all three:** read it aloud. If you wouldn't say it to someone standing at the bar, rewrite it.

### The 60-second check before publishing

1. Does the first sentence give the reader what they came for?
2. Is any sentence over 25 words?
3. Have I used contractions?
4. Could this copy belong to any pub chain? If yes, rewrite.
5. Is every fact in this SSOT?
6. Any banned word from Rules 1 and 2?
7. Is every "no" followed by a next step?
8. Exclamation marks: one, or none?
9. Does every button say what happens next, and match the real booking?

### Scope

This voice applies to **all new customer-facing copy from 10 September 2026**. Existing pages aren't being rewritten all at once; bring copy onto this voice as pages are touched. Menu and event descriptions written in the management app follow these rules too: they publish straight to the website, so they are customer-facing copy.

The checkable half of this section and of §14 is enforced in the management app by `src/lib/copy/house-style.ts`. `npx tsx scripts/audit-house-style.ts` in that repo runs it over the menus, the events and every marketing email.

## 2. Contact & Location

- **Phone:** 01753 682707.
- **Email:** manager@the-anchor.pub. **This is the only correct email.**
- **WhatsApp:** wa.me/441753682707.
- **Address:** Horton Road, Stanwell Moor, Surrey, TW19 6AQ.
- **Coordinates:** 51.462509, -0.502067.
- **Google Maps:** https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ.
- **M25:** 2 minutes from Junction 14.
- **Bus:** Routes 441, 442, 555 from Heathrow Central Bus Station.
- **ULEZ:** Outside the ULEZ zone. Never quote a saving figure: whether a driver pays the charge depends on their vehicle and their route, so no figure is true for everyone (owner decision, 10 September 2026; §14).
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

**The SSOT always adheres to the management app's business hours.** (Owner-confirmed, 8 September 2026.) Where this document names an opening time or a closure, it is transcribing what the management app holds, never asserting it independently. If the two ever disagree, the management app is right and this document is stale: fix this document. That includes the Christmas Day, Boxing Day and New Year's Day entries in §7.

> Special-hours overrides come from the management API (`/business/hours`) and **always win**. `kitchen: null` for a date means the kitchen is closed for that date, treat as deliberate, not as missing data. **When a date has an override, use its kitchen value exactly as it stands, null included; fall back to the regular week only when the date has no override at all.** Neither `||` nor `??` does this on its own: both fall back on null, which is the very value that means closed. The rule for code, with the cases to test, is in `docs/SSOT-engineering-notes.md`.
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
| Beetroot & Butternut Squash Wellington | (live, DB) | No | **Fully vegan.** Default plate is vegan |
| Kids Roasted Beef, Kids Roasted Pork, Kids Roasted Turkey | (live, DB) | Yes | Smaller, child-sized portions of the three sliced roasts |
| Broccoli Cheese, Gourmet Broccoli Cheese | (live, DB) | n/a | Sides |

Mirrored from the live menu on 11 September 2026. The dish **names** customers see come from the menu API ("Roasted Beef", "Roasted Pork", "Roasted Turkey"): "28-day topside" and the like are descriptions, not names, so never type a dish name that is not on the menu.

**The pie roasts are off the Sunday menu** (owner-confirmed, 11 September 2026). "Beef & Ale Pie Roast" and "Chicken & Wild Mushroom Pie Roast" are switched off in both `menu_dishes`, which feeds /sunday-roast, and `sunday_lunch_menu_items`. The weekday pies stay on the main menu (§5). Never list a pie as a Sunday roast option.

**Price range to quote in copy:** Do NOT quote a hardcoded range. Prices are live from the management DB (menu API). Pull live.

### Accompaniments

Triple-cooked, herb-and-garlic crusted roast potatoes. Seasonal vegetables, including buttered cabbage with the meat roasts. Yorkshire pudding with the three sliced roasts and the kids roasts. Our signature gravy.

> **We do not use beef dripping.** Never claim that we do. Never describe the potatoes as "beef-dripping potatoes". The correct phrase is "triple-cooked, herb-and-garlic crusted".

### Gravy rules

- **Signature gravy**, a secret recipe we've refined ourselves over the years. Default for all meat dishes. **Contains meat stock; not vegan.**
- **Regular gravy**, fully vegan. Default with the wellington. Available on request with any dish.
- **Wellington upgrade path**, wellington customers can upgrade for free to the signature gravy on request. The upgrade makes the dish non-vegan; flag this when offering.

> Do **not** describe our gravy as "red wine gravy". The signature gravy is a secret recipe; the alternative is the regular vegan gravy.

### Wellington wording

The wellington is **fully vegan**. In customer-facing copy, schemas, and JSON-LD always use "vegan", never "vegetarian". The wellington is a dish in its own right, not an afterthought.

**The plate as it comes is vegan.** Buttered cabbage and a Yorkshire pudding can be added on request, for someone who orders the Wellington because they fancy it rather than because they are vegan; either one makes the plate no longer vegan, so say so when offering. **The kitchen makes no unbuttered cabbage**, so cabbage is never part of the vegan plate. (Owner-confirmed, 9 September 2026.) Paste §16 rather than rewording this.

### Retired items (do not list)

- Roasted Chicken (adult)
- Slow-Cooked Lamb Shank, lamb is no longer served anywhere, on any menu.
- Crispy Pork Belly
- Cauliflower Cheese side

Their database rows are deactivated rather than deleted, so old bookings still resolve; the detail is in `docs/SSOT-engineering-notes.md`. A deactivated row is not a menu item: never list one.

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

**Retired (do not list):** Chicken, Ham Hock & Leek Pie, no longer served (owner-confirmed, 10 September 2026). It was switched off in the management app the same day, at the owner's request.

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

Chicken goujons and chips · Fish fingers and chips · Sausage, mash and gravy · Cheeseburger and chips · Chicken burger and chips · Veg burger and chips · Mac and cheese · Fish finger wrap and chips · Chicken goujon wrap and chips · On Sundays, a kids roast of beef, pork or turkey. (Mirrored from the management app on 11 September 2026.)

## 6. Drinks

The full drinks inventory must come from POS/API before publishing. The website and SSOT do not own a master drinks list.

**Notable rules:**
- **No Sky Sports / TNT Sports.** Live sport on terrestrial channels (BBC, ITV, Channel 4) only since January 2025.
- **No guest ales.** Bottled ales only.
- **Discontinued (do not list):** Stanwell Moor Brew (DISCONTINUED 2026-03-22). Pravha (DISCONTINUED, no longer stocked).
- **Promotions:** The £2 double-up is running on our optics, the house spirits: a double is £2 more than a single (owner-confirmed, 10 September 2026; the optics scope mirrored from the management app's drinks prices on 11 September 2026). Promote any other offer only when current POS or promotion data confirms it. Monthly Manager's Special uses the current live Manager's Special source.
- **Shandies:** Available for all draught lagers.
- **Drink pricing:** Never show drink pricing unless it comes from an approved live source. Cocktail pricing may be shown only from the current approved cocktail menu/API.
- **No food deals:** Remove stale food-deal claims unless the live management system confirms a current offer.

## 7. Booking & Deposits

### General deposit policy

Applies to non-Christmas bookings. Christmas has its own deposit rule, see the Christmas 2026 block below.

- **14 guests or fewer:** No deposit. No card details required at booking.
- **15 or more guests:** £10 per person, fully deducted from the bill on the day. Any day, any table booking type. It never applies to a private hire, which takes its own £250 deposit instead (§11). (Owner-confirmed, 10 September 2026.)
- **More than 20 guests:** This is **not a table booking**, it is private hire. Direct the enquiry to manager@the-anchor.pub, 01753 682707, or WhatsApp 01753 682707. See §11.
- **Standard copy:** "Groups of 15 or more: a £10 per person deposit, fully deducted from your bill."

The threshold was 10 guests until 9 August 2026; §18 records why it moved.

### Christmas 2026 (owner-confirmed 21 July 2026)

- **Service window:** **10 November to 20 December 2026**. The 20th is **inclusive**, a 20 December sitting is bookable. The previously published 1 November to 23 December window is superseded, see §14.
- **Minimum party size:** **4 guests, on every Christmas dinner booking, regardless of the day.** (Owner-confirmed, 6 September 2026. Lowered from 6 to open up the quieter dates in the window. An earlier reading of the same conversation had this as 4 midweek and 6 at the weekend and was corrected the same day; there is no day-dependent Christmas minimum.) The same 4 applies to the private-hire Christmas set menu (owner-confirmed, 10 September 2026). The **Sunday roast has no minimum party size at all** and is a separate offer: never copy this figure onto it.
- **Minimum notice:** **24 hours.** No same-day Christmas bookings.
- **Deposit:** **£10 per person on every Christmas booking, regardless of party size.** Taken at booking, deducted from the bill. **Refundable in full if the booking is cancelled up to and including seven days before the booking date; fewer than seven days before it is not refunded.** Owner-confirmed 5 September 2026: this supersedes the earlier blanket "non-refundable" wording, which contradicted the live management setting. Boundary clarified from the existing management refund implementation on 5 September 2026: the whole London calendar day seven days before is included; no payment rule was changed.
- **Pre-book and pre-order, by course:**

| Tier | Pre-book | Pre-order |
|---|---|---|
| 1 course | Required | **Not** required |
| 2 course | Required | Required |
| 3 course | Required | Required |

- **Pre-order deadline:** **7 days before the booking date** for the 2 and 3 course tiers. (Owner-confirmed, 11 August 2026.) State this plainly rather than hedging with "confirmed with your booking".
- **Booked inside the deadline: 1 course only.** From noon, 7 days before the booking date, the 2 and 3 course tiers can't be booked, so a later booking is the 1 course tier for every guest, with no pre-order. (Owner decision, 10 September 2026.) The management app enforces it everywhere: the online form stops offering 2 and 3 courses at that moment and the booking function refuses them, a booking staff take after it is recorded as 1 course, and nobody is texted for a pre-order once the form has locked. The website's enquiry forms apply the same deadline (`lib/christmas-course-deadline.ts`).
- **Days available:** Tuesday to Saturday sittings, plus **Sunday sittings from 1pm to 6pm**. **Mondays are not available** for Christmas bookings, the kitchen is closed. (Owner-confirmed, 11 August 2026.)
- **There is no Christmas market in 2026.** (Owner-confirmed, 6 September 2026.) A market ran in earlier years, so archived copy and old imagery still describe one. Treat every such reference as historical, never as an offer. `/blog/christmas-market`, `/blog/christmas-fair-at-the-anchor`, `/blog/piano-christmas-performance` and `/blog/this-december-at-the-anchor` were retired on 10 September 2026 (owner-approved) and redirect to `/christmas-parties`; do not revive them.
- **Christmas Day itself is outside the offer.** **On 25 December we open for drinks only, 12pm to 3pm. There is no food service at all on Christmas Day.** (Owner-confirmed, 6 September 2026.) This is a licensed exception to the rule in §3 that opening hours only ever come from the API, in the same way as the New Year's Eve closing time, because the offer window ends on 20 December and the page would otherwise say nothing. **Never advertise Christmas dinner, a Christmas lunch, a festive menu or any food on 25 December.**
- **Boxing Day and New Year's Day: CLOSED.** **We do not open on 26 December or 1 January.** (Owner-confirmed, 8 September 2026.) Never advertise Boxing Day food, a Boxing Day roast, a New Year's Day lunch or any opening on either date. If a page must answer the question, say plainly that we are closed and point at the dates we are open; do not dress a closure up as an offer.
- **The rest of the festive run is confirmed.** (Owner-confirmed, 9 September 2026.) We are open throughout December apart from 26 December, and closed on 1 January. **The kitchen serves up to and including Sunday 20 December, then closes until Tuesday 12 January**; the bar stays open. Mondays keep their usual 4pm opening. New Year's Eve itself keeps its existing licensed closing-time exception. The management app holds every one of these dates: take them from there, and use §16 for the wording.
- **All three dates are already set in the management app**, verified directly against the database on 8 September 2026: 25 December opens 12:00 and closes 15:00 with `is_kitchen_closed` true; 26 December and 1 January are both `is_closed` true. The management app is the source of truth and these entries are it. This section records what it holds so customer-facing copy has a reference; it never overrides it.
- **`GET /business/hours` only returns special hours for the next 90 days.** A check run before a date enters that window shows no row and an empty `planning.nextClosure`, which looks exactly like "nobody entered it". It is not. On 8 September 2026 the horizon reached only 7 December, so all three festive rows were invisible while being correctly set. Christmas Day enters the window on 26 September, Boxing Day on 27 September and New Year's Day on 3 October. **Query the database before concluding a closure is missing.**
- **Group size band:** **21 to 29 seated guests is handled as a private booking, not a table booking.** (Owner-confirmed, 6 September 2026. The reason is the no-show exposure at that size, which is too large to carry on a table booking.) It sits between the sit-down maximum of 20 and the 30-guest buffet minimum, so route it to the manager rather than leaving the organiser with no route. Present it as how we look after a group that size, never as a refusal.
- **Drinks-only Christmas party:** **no minimum spend.** (Owner-confirmed, 6 September 2026.) Arranged as a private booking so we can confirm no other services are needed. Never invent a package, a per-head price or a bar-tab minimum for it.
- **Christmas entertainment:** a **Christmas quiz** runs and may be promoted. (Owner-confirmed, 11 August 2026.) For 2026 it is Tinsel & Trivia Quiz Night on Wednesday 2 December, which its event record describes as our normal quiz with a festive nod, so never call it a fully themed Christmas quiz. The other festive nights for the rest of 2026 are Tinsel & Tipples Christmas Tasting Night (Friday 20 November), Sleigh My Name: Festive Music Bingo (Friday 11 December) and Christmas Jackpot Cash Bingo (Wednesday 16 December). (Dates and descriptions mirrored from the management app on 11 September 2026.) A **DJ can be arranged on request**, but it is never included by default, so offer it as something a group can ask for rather than as part of a package. There is **no Christmas karaoke**, **no live band**, no dance floor and no shared party night. (Owner-confirmed, 11 August 2026.)

- **There is no kids 2 course or 3 course.** No child portion and no child price exists for those tiers. Children may order the adult 2-course or 3-course tier, at the adult price. State this plainly wherever the tiers are listed.
- **Included, adults:** a glass of prosecco on the **2 and 3 course tiers only**, swappable for
  orange juice. **The 1 course tier does NOT include a drink for adults.** (Owner-corrected,
  15 August 2026; see §18.)
- **Included, children:** a Fruit Shoot or a small soft drink (Coca-Cola, Diet Coke or lemonade) with the 1 course.
- **Trimmings:** pigs in blankets, stuffing, brussels sprouts, **Yorkshire pudding, roast potatoes, mashed potato and peas**. (Yorkshire pudding, roast potatoes, mash and peas owner-confirmed, 13 August 2026.)
- **The Vegetable Wellington is the exception.** It is **vegan**, so it takes **no Yorkshire pudding and no pigs in blankets**, matching the Sunday roast rule where the Wellington and the pies carry no Yorkshire. Describe it as vegan Christmas trimmings and vegan gravy. Never apply the full trimmings list to it.
- **Menu dishes ARE published.** (Owner-confirmed, 13 August 2026.) The dish list lives on the Christmas booking period in the management database and reaches the website through `/table-bookings/periods`, which is the same source the booking form builds a pre-order from. Publish the dishes the API returns and nothing else: the old "menu released closer to the time" wording is retired, and inventing or padding the list is still forbidden. If the API returns no menu, say nothing rather than guessing.
- **Prices:** live from the management database via the menu API. **Never hardcode a Christmas price in website page code.** Christmas set-menu tier prices quoted in prose may carry the £ symbol; per-item menu prices stay symbol-free per the price display policy at the top of this document.
- **Weekday / weekend definition:** weekday means Tuesday to Thursday. Weekend means Friday to Saturday.
- **Festive buffets stay:** Festive Sandwich & Salad, Festive Hot Finger, Festive Premium Grazing. **Minimum 30 guests, everywhere, no exceptions.** That minimum is for the festive buffets only: the year-round buffets carry their own minimums, several below 30 (§11).
- **The old Festive Menu catering packages are switched off.** The two rows (a weekday and a weekend price, minimum 6) are inactive in the management app, and no private-hire catering package holds the 1, 2 and 3 course Christmas menu. The tiers and their prices live on the Christmas menu and the Christmas booking period. (Mirrored from the management app on 11 September 2026.) Switching the old rows back on as they stand would bring back the retired two-price split (§14) and a minimum of 6, where the minimum is 4. **For the sit-down Christmas meal, `/christmas-parties` refers only to the latest offer, the 1, 2 and 3 course Christmas menu, and never to the old packages.** (Owner-confirmed, 11 September 2026.) The festive buffets above are separate and stay.

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
- Heated beer garden *(verified NO, owner-confirmed 10 September 2026; the smoking area's heater is separate, §9)*
- Covered seating in the beer garden *(verified NO, owner-confirmed 10 September 2026)*

### Accessibility

- Step-free: bar (yes), dining area (yes), car park (yes). Getting in from the
  car park is step free.
- Beer garden: step free from the car park, but there is **one large step
  between the garden and the bar**. That step is the only one inside the venue.
- **We have exactly one ramp, and it is not a permanent fixture.** Staff put it
  out on request, for that step between the garden and the bar. Owner-confirmed
  5 September 2026. Never describe the pub as having "ramp access" as though a
  ramp is always in place, and never imply there is more than one.
- Accessible toilet: **NO**.
- Assistance dogs: always welcome.
- Encourage guests to call ahead to plan their visit.

**Writing rule.** "The garden is step free" on its own is incomplete and has
already shipped in that form. It is true from the car park and false from the
bar, and the guest reading it is usually the one person for whom that
difference decides the visit. State the route: step free from the car park, one
step from the bar, ramp on request.

### Family facilities

- High chairs: yes.
- Baby changing: **NO**.
- Bottle warming: on request.
- Buggy space: yes.
- Breastfeeding: welcome.
- Children: welcome at all hours, no age cut-off.

### Dog policy

- Welcome throughout the entire venue, any time the pub is open, event nights included. (Owner-confirmed, 10 September 2026.)
- Water bowls and dog biscuits provided.
- Poo bags provided. There are no dog bins. (Owner-confirmed, 10 September 2026.)
- Must be kept on a lead at all times.
- Not allowed on furniture.
- No size limit.
- Stanwell Moor reservoirs nearby for walks. Staines Moor and the King George VI Reservoir are each about a 30-minute walk, one way. (Owner-confirmed, 10 September 2026.)
- **Not offered, so never claim:** dog events of any kind, dog treats beyond biscuits (no dog ice cream, pupcakes or dental chews), and dog-specific staff training, partnerships or sponsorships. (Owner-confirmed, 10 September 2026.)

### Payment

- Cash, credit card, debit card, American Express, contactless.
- Currency: GBP. Price range: ££.

## 9. Beer Garden

- **Seats:** 64.
- **Flight path:** Directly under Heathrow's southern runway approach path.
- **Never publish a runway designator.** Do not write 27R, 27L, 09L or 09R in page copy, FAQs or JSON-LD (§18 records the incident). The designator adds nothing a visitor needs, and it is the sort of claim an enthusiast will notice and correct in public. Say "under Heathrow's southern runway approach path", and use the weekly alternation for timing.
- **Aircraft frequency:** Approximately every 90 seconds during peak times.
- **Aircraft altitude:** 500 – 800 feet overhead.
- **Common aircraft:** A380, Boeing 777, 787 Dreamliner, A350, A330, Boeing 747.
- **Operations alternate weekly:** One week, planes land overhead until 3pm; the next, from 3pm onwards.
- **Wind direction: never mention it.** Do not say which wind, or which runway operation (westerly or easterly), brings aircraft over the garden or anywhere else. (Owner decision, 10 September 2026: not known, so not claimed.) The weekly 3pm alternation above is the only timing we give.
- **Features:** Dog friendly, full food and drink service during kitchen hours, free high-speed WiFi.
- **Not heated.** The garden is not heated (owner-confirmed 10 September 2026). Never describe the garden, or any seating in it, as heated (§14). Indoor heating is true and fine to mention.
- **Not covered.** No part of the garden is covered (owner-confirmed 10 September 2026). Never write "covered seating", "a covered section", "sheltered areas" or "covered patio" about it (§14). If it rains, say we will do our best to find guests a spot inside; never promise one.
- **Smoking area.** The covered smoking area does have a heater, but the owner says the area is "not nice yet" (10 September 2026). A plain mention that there is a sheltered smoking area is fine. Do not mention its heater, or offer it as extra seating, until the owner says it is ready. It does not make the garden heated or covered.

## 10. Events

> **"Doors" is banned wording for events.** (Owner-confirmed, 16 August 2026.) The
> times below are when the room is set and players should arrive, **not** when the
> pub opens. The Anchor is open from **12pm Tuesday to Sunday and 4pm on Mondays**,
> so "doors 6:30pm" tells a customer the pub is shut until 6:30pm, which is wrong
> and costs the earlier food trade. Write **"arrive from 6:30pm"** instead, and
> never label an event time "Doors" or "Doors open" in customer-facing copy.

> **Events finish by 10pm.** (Owner-confirmed, 11 September 2026: "all events run
> until 10pm except for things like the Halloween party and New Year's Eve".) That
> covers quiz nights, both bingos, karaoke and tasting nights; the quiz and cash
> bingo finish earlier, at about 9:30pm (below). Only special nights such as the
> Halloween party and New Year's Eve (both below) run later. Never write a later
> finish for any other event, whether 10:30pm, 11pm, 11:30pm or "until late".
> Where an event record ends later on an ordinary night, the record needs
> correcting in the management app: do not repeat its time in copy.

### Quiz Night

- Monthly, on a Wednesday, plus the occasional themed quiz on another night. The rest of 2026 is fixed: Wednesday 16 September, Friday 25 September (an Only Fools and Horses charity quiz for Macmillan Cancer Support), Wednesday 7 October, Wednesday 4 November and Wednesday 2 December. (Dates mirrored from the management app on 11 September 2026; owner-confirmed 11 September 2026 that they will not move.) Take any later date from the event records.
- Arrive from 6:30pm · Start usually 7pm · **Aims to finish 9:30pm** (owner-confirmed 17 August 2026, and matches `end_time` 21:30 on every scheduled quiz in the management DB). The older "~9:45pm" is retired: anything still saying 9:45pm is wrong.
- £3 per person. Team size max 6.
- Solo players and pairs are found a team to join on the night. (Owner-confirmed 11 September 2026.)
- **Seating: team tables.** Each team has its own table, so book one table per team. Never describe quiz seating as communal, or say a team may share its table with another team. (Owner-confirmed 11 September 2026.)
- Format: 4 rounds × 10 questions + interactive quick-fire round + comfort break.
- Capacity 60, mirrored from the management app on 6 September 2026 (owner-confirmed the same day, corrected from 80). Every scheduled quiz record carries 60. Anything still saying 80 is wrong. **This is a mirror, not a source: page code must read capacity from the API, never from this line.**
- Prizes: the winning team gets a **£25 bar voucher**, not a bar tab (owner-confirmed 11 September 2026), and second from last gets a bottle of house wine. Every round has a closest-answer question for a free drink, and there are spot prizes. (Mirrored from the management app on 11 September 2026.)
- **Phones away during the question rounds:** 5 points off for using one. The interactive round is played on phones. (Mirrored from the management app on 11 September 2026. Three records say one phone per player; the 25 September charity quiz says one phone per team.)
- Host: Peter Pitcher, the owner, hosts quiz night himself. (Owner-confirmed 11 September 2026.) The older Question One Quiz Masters line is retired: anything still naming them is wrong.

### Cash Bingo

- Wednesdays, on set dates rather than every month. The rest of 2026 is fixed: 30 September, 18 November and 16 December, with no cash bingo in October. (Dates mirrored from the management app on 11 September 2026; owner-confirmed 11 September 2026 that they will not move.) Take any later date from the event records.
- **Arrive by 6:30pm · First game 7pm · Finishes about 9:30pm.** (Owner-confirmed 17 August 2026: "I want people in for 6:30pm so they have time to get a drink, order some food, get their books and get comfortable for a 7pm start.") This supersedes the older "arrive from 6pm, book sales from 6pm" line. Books are bought on arrival, so do not publish a separate book-sales start time.
- **The pub itself is open from 12pm.** Say so rather than implying the venue opens at the arrival time. See the banned-"Doors" note above.
- £10 per book (**cash only**). £1 daubers cash only.
- **18+ to play. Supervised under-18s are welcome to attend but may not play.** Publish both halves together, never one without the other.
- 10 games. Capacity 60, mirrored from the management app on 6 September 2026. Every scheduled cash bingo record carries 60. **Mirror only: page code reads capacity from the API.**
- Host: Peter Pitcher, the owner, runs cash bingo himself. (Owner-confirmed 11 September 2026.)
- **Jackpot:** half of all book sales go into the final cash jackpot, so the prize grows with the room. (Owner-confirmed 11 September 2026.) It is the last game, and it takes £5 from every £10 book. (Mirrored from the management app on 11 September 2026.) Other prizes vary by event.
- **Snowball (game 9):** a full house within a set number of calls. If nobody wins it, it grows by £20 and two calls at the next cash bingo night. To win it you must have played at one of the previous three cash bingo nights. Current values belong in event records only. (Mirrored from the management app on 11 September 2026.)

### Music Bingo

- Once a month on a Friday for the rest of 2026: 16 October, 13 November and 11 December. The 11 September night was cancelled in the management app on the day. (Dates mirrored from the management app on 11 September 2026; owner-confirmed 11 September 2026 that they will not move.) Take any later date from the event records.
- Arrive from 6:30pm · **Start 7pm** unless the event record says otherwise. (Start
  time corrected from 8pm, owner-confirmed 16 August 2026. Anything still saying
  8pm is wrong.)
- **Runs until 10pm**, under the finish rule at the top of this section (owner-confirmed 11 September 2026). Anything saying 10:30pm or 11pm is wrong.
- **£5 per person** unless the event record says otherwise. (Owner-confirmed 17 August 2026, and every scheduled Music Bingo in the management DB is priced at 5. Corrected from £3: anything still saying £3 is wrong.) Two games with interactive music games and quizzes too; song clips replace bingo numbers.
- Capacity 60, mirrored from the management app on 6 September 2026 (owner-confirmed the same day, corrected from 90). Every scheduled Music Bingo record carries 60. Anything still saying 90 is wrong. **Mirror only: page code reads capacity from the API.** Host: Nikki Manfadge.
- **Music Bingo does not reliably sell out, and no page may claim it does.** (Owner-confirmed 6 September 2026.) The `/music-bingo` page asserted it five times, including in its meta description, against live records showing every seat free on most upcoming dates. Motivate booking with communal seating and group seating instead. Honest live remaining counts are permitted; a fixed scarcity claim is not.
- Private nights available on request.

### Live Music, DISCONTINUED

- **Live music is discontinued in full.** (Owner-confirmed, 11 August 2026.) No live bands, no acoustic sets, no tribute acts, no solo performers. This is not a seasonal pause, the format has stopped.
- Do not list, promote, schedule or link to live music. Do not target live music keywords. Do not describe The Anchor as a live music venue or a music pub.
- The `/live-music` route is retired and redirects to `/whats-on`. The `live-music-pubs-near-heathrow` blog post is retired and redirects to `/whats-on`.
- Previously published details (local bands, acoustic sets, tribute acts, free entry, 8:30pm start, capacity 150) are **superseded and must not be restored**.

### Karaoke

- **Not a regular feature in 2026.** Karaoke happens occasionally, nothing more. Only promote it when a specific event record lists it. Never imply a weekly, monthly or Friday slot. (Owner-confirmed, 11 August 2026.)
- **Host: Peter Pitcher, the owner.** (Owner-confirmed, 11 September 2026.) The older "no fixed host" line is retired.
- **Not hosted by Nikki Manfadge.** Nikki hosts Music Bingo. (Owner-confirmed, 11 August 2026.)
- Free entry.
- **Ticketed with communal seating, and no reserved tables.** (Owner-confirmed 17 August 2026, and `booking_mode` is `communal` on the listed night.) Book a free place per person so we know how many seats to lay out. Never promise a guest "a table waiting for you" on karaoke: that claim is retired.
- **All ages are welcome at all times, with under-18s accompanied by a supervising adult.** (Owner-confirmed 17 August 2026.) The older "strictly 18+ after 9pm" rule is retired and must not be republished.
- Capacity 60, mirrored from the management app on 6 September 2026 (corrected from 50). Taken from the record for the listed night, which §8 makes the only true source. Not separately owner-stated, so confirm at the next review. **Mirror only: page code reads capacity from the API.**
- Do not publish a recurring EventSeries schema for karaoke. Individual nights get their own Event schema when listed.

### DJ

- **A DJ is booked in from time to time**, and is **confirmed for Halloween and New Year's Eve**. (Owner-confirmed, 11 August 2026.)
- **A DJ can be arranged for a Christmas booking on request.** It is not included by default and is not part of a package, so never advertise it as included. Offer it as something a group can ask for. (Owner-confirmed, 11 August 2026.)
- Outside those cases, only promote a DJ when a specific event record lists one. Never imply a resident DJ or a regular DJ night.

### New Year's Eve

- **We stay open until 1am on New Year's Eve.** (Owner-confirmed, 16 August 2026, and reconfirmed 11 September 2026.) New Year's Eve and Halloween are the nights where a closing time may be stated in copy, and `/new-years-eve` does so throughout, including in its page title. Each is a licensed exception to the rule in §3 that opening hours only ever come from the API, so do not strip either as a hardcoded hours claim. Halloween's times are under Party nights below.
- A DJ and a midnight countdown are confirmed for the night, see the DJ entry above.

### Curry Club, DISCONTINUED

- **Curry Club has stopped.** (Owner-confirmed, 11 September 2026.) This is not a pause: there are no curry nights and no rotating curry specials. The management app holds no Curry Club category, event record or menu special (checked 11 September 2026).
- Do not list, promote, schedule or link to Curry Club or a curry night, and do not target curry club or curry night keywords.
- `/blog/curry-club-the-anchor` is retired and redirects to `/food-menu` (owner-approved, 11 September 2026).
- Previously published details (monthly, rotating curry-night specials, a chef with decades of Indian cooking experience) are **superseded and must not be restored**.
- The Chicken Katsu Curry on the menu and the Indian-Inspired Curry Buffet (§11) are not Curry Club, and are unaffected.

### Nikki's Games Night

Discontinued unless reintroduced in event listings. Do not promote Nikki hosted/games nights as a recurring **public** format.

**Nikki as a private-event host is a live, bookable offer** (owner-confirmed 17 August 2026). Nikki Manfadge can host private bookings as a drag host, priced per booking. This is separate from the public events programme, where Nikki hosts Music Bingo only. Private-hire pages and the 2026 event brochures may offer Nikki as a paid add-on; the public events pages still must not list Nikki-hosted nights as a recurring fixture.

### Tasting Nights

- Occasional (no fixed frequency).
- Expert-led sessions across whisky, gin, rum, wine and beer.
- **Ticketed and paid.** £45 a person unless the event record says otherwise, with £5 off tickets bought in advance. (Owner-confirmed, 9 September 2026.) The record is `prepaid`, which is what makes the advance discount apply.
- Capacity 25, mirrored from the management app on 6 September 2026 (owner-confirmed the same day). **Mirror only: page code reads capacity from the API.**

### Party nights

- Standalone party nights such as the Halloween party. Not a recurring format, and only promoted when an event record lists one.
- Halloween, Saturday 31 October 2026: the pub is open 12pm to midnight. Full menu 12pm to 6pm, no food 6pm to 9pm, then pizza only 9pm to midnight, to eat in or take away. The party runs 8pm to midnight, free entry, with DJ Jermaine. (Mirrored from the management app on 11 September 2026.)
- Capacity 150, mirrored from the management app on 6 September 2026 (owner-confirmed the same day). **Mirror only: page code reads capacity from the API.** This is the party-night figure. Do not apply it to quiz, bingo, music bingo or karaoke, which are all 60, and do not confuse it with the retired live-music capacity of 150 in the discontinued-formats note below.

> **Capacities always come from the management app, never from this document and never from page code.** (Owner instruction, 6 September 2026.) The figures recorded per format below are mirrors with a pull date, kept so a human can spot a contradiction. They are consistent within each category as at 6 September 2026: quiz night, cash bingo, music bingo and karaoke all 60, party nights 150, tasting nights 25. If records within one category ever disagree, that is a data fault: raise it with the owner rather than picking one.

> **Payment method comes from the event record's `payment_mode`, not from this document.** (Recorded 7 September 2026 after a page audit flagged cash-only claims on quiz and music bingo as unsourced. They are sourced, just not from here.) Verified across the upcoming events on 7 September 2026: quiz night, cash bingo and music bingo records all carry `payment_mode: cash_only`; karaoke and party nights carry `free`. The 20 November 2026 tasting night moved from `free` to `prepaid` on 9 September 2026, when it was priced. The cash-only line under §Cash Bingo below is about the £10 books and the £1 daubers specifically, which is why it reads as a Cash Bingo rule; it was never meant to imply the other formats take cards. Read the record.

> Event details are managed per event in the management app, which owns them (§15). The summaries above are mirrors kept for reference.

### Retired entertainment formats

- **Open mic is discontinued.** Do not list, promote, or link to open mic nights. The retired `/open-mic` route redirects to `/whats-on`.
- **Live music is discontinued.** (Owner-confirmed, 11 Aug 2026.) Do not list, promote, schedule or link to live music, live bands, acoustic sets, tribute acts or solo performers. Do not target live music keywords or call The Anchor a live music venue or music pub. `/live-music` and `/blog/live-music-pubs-near-heathrow` are retired and redirect to `/whats-on`. Karaoke and a DJ still happen occasionally, but only promote either when a specific event record lists it.
- **Drag cabaret is discontinued.** Do not list, promote, or link to drag cabaret nights, and do not target drag cabaret or drag show keywords. **Music Bingo is the only drag night.** (Owner-confirmed, 9 Aug 2026.) The retired `/whats-on/drag-shows` route and the `/blog/drag-cabaret-nikki` post (retired 10 September 2026, owner-approved) redirect to `/whats-on`, and past "Drag Cabaret & Karaoke" event pages stay live but out of search. Music Bingo copy may still refer to its drag host.
- **Curry Club is discontinued.** (Owner-confirmed, 11 Sep 2026.) Do not list, promote, schedule or link to Curry Club or a curry night. `/blog/curry-club-the-anchor` is retired and redirects to `/food-menu`. See the Curry Club entry above.

### Nations Championship screenings, owner decision 5 September 2026

We show Nations Championship games broadcast on terrestrial TV during our existing opening hours. Bookings must not wait for the exact channel, screen allocation or commentary arrangement. Early games are shown from opening. If a game runs beyond our usual closing time and people are still in watching, we will stay open until it finishes (owner-confirmed 5 September 2026). This is conditional continuation for viewers already in the pub, not a guaranteed late opening or permission for arrivals after usual closing. Regular opening times, kitchen service and bookable arrival hours remain unchanged. A missing match finish time uses the existing two-hour booking window for booking planning only, never as a claim about the actual final whistle. Kitchen promotion follows the live service intervals.

### Online event booking, owner decision 6 September 2026

Offer standing tickets only once all seated places are sold out, with clear notice that no table seat is included. Do not ask customers to choose seated or standing tickets. Online event bookings allow up to 6 tickets; the single-quantity form uses a 1 to 6 picker; larger groups should call 01753 682707.

## 11. Private Hire

- **Capacity:** 10+ – 150 guests. (Full venue exclusive hire: 119 seated or 300 standing; 60 seated at Christmas, 200 standing.) Values from the management DB `venue_spaces`: dining room 26 seated / 50 standing, main area 29 / 150, garden 64 / 250, whole venue 119 / 300.
- **Dining room:** 26 seated or up to 50 standing. French doors open onto the beer garden.
- **Spaces:** four can be hired: the dining room, the garden, the main area and the whole pub. The dining room and the garden are the ones we want booked; the main area is priced to discourage it (see below). (Mirrored from the management app on 11 September 2026.)
- **Room hire charge:** Charged by the hour, per space, from the management DB `venue_spaces.rate_per_hour`. Rates are published (see the table below). No setup fees. Do not publish minimum-spend wording. **Wakes are charged for like any other booking** (owner-confirmed 17 August 2026); the older "no room hire charge for wakes" line is retired.
- **Deposit:** £250, a refundable booking and damage deposit. It **replaces** the £10 per person group deposit in §7: a private hire never pays both (owner-confirmed, 10 September 2026). It is held separately from the bill, never taken off it, and refunded after the event less any documented deductions. The signed contract says exactly this, so copy must never call it "deducted from the final bill" (§14). Approved wording is in §16.
- **Pricing rule:** Do not mention food pricing unless it comes through the live API, management database, or latest approved private-hire PDF.

### Venue hire rates (live, DB `venue_spaces`)

| Space | Seated | Standing | Rate | Minimum |
|---|---|---|---|---|
| The Dining Room | 26 | 50 | (live, DB) per hour | 1 hour |
| Outdoor Terrace / Garden | 64 | 250 | (live, DB) per hour | 1 hour |
| The Main Area | 29 | 150 | (live, DB) per hour | 1 hour |
| Entire Pub (exclusive) | 119 | 300 | (live, DB) per hour | 4 hours |

Capacities here are the structured `capacity_seated` / `capacity_standing` columns, which are canonical. **Do not take a capacity from the `description` free text on the same row.** Both mismatched descriptions (Main Area and Entire Pub) were corrected on 17 August 2026, but the rule stands: the columns win.

> **The Main Area rate is deliberately prohibitive.** It went from £40 to £100 per hour on 17 August 2026 because the owner does **not** want the main bar rented out; the price is set to discourage it, not to reflect cost. Do not "correct" it downwards, do not flag it as an error against the garden at £25 per hour for a larger capacity, and do not promote main-area hire as good value. If someone asks, the garden and dining room are the spaces we actually want booked.

### 2026 event brochures

Nine PDFs, one per occasion, in `public/downloads/`. Registry: `lib/brochures.ts`. Verified figure by figure against `venue_spaces` and `catering_packages` on 17 August 2026.

- **Prices inside are frozen at print time and exclude VAT.** The download CTA never repeats a price, so the live cost estimator stays the number customers act on. If catering prices or minimums change, the PDFs need re-exporting.
- **Google reviews on page 13 are genuine**, supplied by the owner from Google (confirmed 17 August 2026). Do not re-flag them as unverified.
- Occasions covered: general, anniversaries, birthdays, baby shower, christenings, gender reveal, engagement, retirement, celebration of life, corporate. The Anniversaries brochure was added 17 August 2026 and verified the same way.
- **No dedicated brochure** for summer garden parties or Christmas parties. Both carry the **general** brochure instead. On `/christmas-parties` it is headed "Planning something outside Christmas?" on purpose: the general brochure does not carry the festive menus, deposit rules or service window, so it must never be presented as the Christmas offer.

### Catering, Buffet (verified against the management DB, 17 August 2026)

| Package | Price | Minimum |
|---|---|---|
| Sandwich Buffet | (live, DB) | 30 guests |
| Finger Buffet | (live, DB) | 30 guests |
| Premium Buffet | (live, DB) | 30 guests |
| Burger Buffet | (live, DB) | 20 guests |
| Indoor BBQ | (live, DB) | 20 guests |
| Pizza Buffet | menu priced | 10 guests |
| Fish & Chip Van | (live, DB) | 30 guests |
| Indian-Inspired Curry Buffet | (live, DB) | 30 guests |
| Tex-Mex Hot Buffet | (live, DB) | 30 guests |
| Mediterranean Hot Buffet | (live, DB) | 30 guests |
| Afternoon Tea | (live, DB) | 20 guests |
| Prosecco Afternoon Tea | (live, DB) | 20 guests |
| Chicken Goujon Sharing Tray | (live, DB) (serves ~10) | 25 guests |
| Petits Fours | (live, DB) | 30 guests |

### Festive buffets (seasonal, minimum 30 guests)

| Package | Price | Minimum |
|---|---|---|
| Festive Sandwich & Salad | (live, DB) | 30 guests |
| Festive Hot Finger | (live, DB) | 30 guests |
| Festive Premium Grazing | (live, DB) | 30 guests |

**The 30-guest minimum is a festive-buffet rule, not a universal one.** Year-round packages carry their own minimums, listed above, and several are below 30, as the live `catering_packages` table shows (checked 17 August 2026). Never apply the festive minimum to a year-round buffet. The one figure that must never drop is the **festive** buffet minimum of 30.

### Drinks Packages

| Package | Price | Minimum |
|---|---|---|
| Welcome Drinks | quoted per booking | 10 |
| Bar Tab | variable, prepaid limit set by the organiser | 10 |
| Welcome Prosecco | (live, DB) | 20 |
| Welcome Orange Juice | (live, DB) | 20 |
| Unlimited Tea and Coffee | (live, DB) | 20 |
| Kids Unlimited Squash | (live, DB) | 20 |
| Pimm's Jar | (live, DB) | 40 |
| Bring Your Own Food | free, organiser signs an outside-food waiver | none |

**Welcome Orange Juice** is the non-alcoholic partner to the **Welcome Prosecco**, with the same 20-guest minimum. The older combined package was renamed Welcome Prosecco and now covers prosecco only. (Mirrored from the management app on 11 September 2026.)

### Kids Catering

Minimum 20 children on each.

- Kids Burger and Chips: (live, DB).
- Kids Chicken Nuggets and Chips: (live, DB).
- Kids Mini Pizza and Chips: (live, DB).

### Equipment & services

Equipment and services: TVs and sound system (no projector) · Dedicated events coordinator · Free WiFi · Free parking for all attendees.

### Event types offered

Wakes / memorials · Christenings · Engagement parties · Baby showers · Gender reveals · Retirement parties · Milestone birthdays · Summer garden parties · Corporate events · Christmas parties · Private parties. (Canonical list: `SSOT.json` `private_hire.event_types`. On weddings, see §14: bookings are accepted, but we do not market or optimise for them yet.)

> **Pre-order language is allowed** for private events, and for the **2-course and 3-course** Christmas tiers only. The **1-course** Christmas tier is pre-book **without** pre-order, so blanket "Christmas is pre-order only" copy is wrong, see §7. The 2026-05-17 walk-in change applies only to the **Sunday roast service**, it does not affect private-hire pre-ordering.

> **Groups above 20 are private hire, not a table booking.** Route them to manager@the-anchor.pub, 01753 682707, or WhatsApp 01753 682707.

### Wakes, speciality

- Private entrance area.
- **Room hire is charged**, at the standard hourly rate for the space. Owner-confirmed 17 August 2026. Never publish "no room hire charge for wakes".
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

The evidence behind each rating, and how often to recheck it, is in §17.

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
- **"Best" or "premier" claims** without substantiation. Say "highly rated" instead, and see §17 for what can be claimed.

### Sunday roast
- **Roasted Chicken (adult), Slow-Cooked Lamb Shank, Crispy Pork Belly, Cauliflower Cheese side**, all retired 2026-04-29. Lamb is no longer served anywhere.
- **Wellington as "vegetarian"**, it is **fully vegan**. Always say "vegan".
- **"Beef-dripping" potatoes**, we do not use beef dripping. Potatoes are triple-cooked and herb-and-garlic crusted.
- **"Red wine gravy"**, never describe our gravy as red wine gravy. Use "signature gravy" (default, contains meat stock) or "regular gravy" (vegan, available on request and default with the wellington).
- **Sunday roast pre-order / Saturday 1pm cutoff / per-roast prepayment**, all retired with the 2026-05-17 walk-in launch. Don't reintroduce.
- **Beef as "not on the menu"**, that older guidance is reversed; beef is now the headline roast.
- **Pie roasts on a Sunday**, "Beef & Ale Pie Roast" and "Chicken & Wild Mushroom Pie Roast", retired 11 September 2026 (owner-confirmed). The weekday pies are still on the main menu.

### Christmas (retired 2026-07-21)

Remove every trace of these from copy, schema, JSON-LD and data shapes:

- **Shared Christmas party nights**, discontinued. The Christmas menu (1, 2 and 3 courses) is a sit-down meal for your own group, not a party night; do not conflate the two.
- **The old Festive Menu catering packages** (a weekday and a weekend price, minimum 6), switched off in the management app (§7, mirrored 11 September 2026). The sit-down Christmas offer is the 1, 2 and 3 course Christmas menu; never list or describe the old packages.
- **All the Trimmings Board**, discontinued.
- **XL Board**, discontinued.
- **Per-person Christmas add-ons**, discontinued: pigs in blankets, stuffing balls, cauliflower cheese pot, extra roast potatoes, extra Yorkshire puddings. (Pigs in blankets and stuffing remain as **trimmings included in the meal**, they are no longer paid add-ons.)
- **Bundle A (prosecco plus coffee and mince pie)**, discontinued.
- **Standalone drinks bundles**, discontinued.
- **"1 November to 23 December 2026"**, superseded. The window is 10 November to 20 December 2026 inclusive.
- **Weekday / weekend two-price festive menu split as the whole story**, superseded by the three-tier structure (1, 2 and 3 course) in §7.
- **"All Christmas meals are pre-order only"**, wrong. 1 course is pre-book without pre-order.
- **Christmas bookings under 4 guests, or with less than 24 hours notice**, not accepted, never imply otherwise.
- **A kids 2-course or 3-course price**, does not exist. Never invent one.
- **"Menu released closer to the time"**, retired 13 August 2026. The dishes are published, from the Christmas booking period (§7). Publish what that returns, never invent or pad the list, and if it returns nothing, say nothing.
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

### Events
- **Curry Club, or a curry night**, discontinued (owner-confirmed 11 September 2026, §10). Never list, promote or link to either. The Chicken Katsu Curry on the menu and the curry buffet in §11 are unaffected.

### Operations
- **A ULEZ saving figure**, in any form: "£12.50 a day", "save £12.50", "saves each driver £12.50". Retired 10 September 2026 (owner decision). Whether someone pays the charge depends on their vehicle and their route, so no figure is true for everyone. Say "we're outside the ULEZ zone" and stop. The tests fail on any ULEZ sentence that carries a £ figure.
- **The private-hire deposit "deducted from the final bill"**, wrong. The £250 is a booking and damage deposit, held separately and refunded after the event (§11). The signed contract says so, and a page saying otherwise contradicts it.
- **`info@theanchorpub.co.uk`**, legacy email. Use `manager@the-anchor.pub`.
- **EV charging "coming soon"**, not happening; remove all "coming soon" references.
- **Dog secure fencing**, unverified, do not claim.
- **Special doggy Sunday dinners**, unverified, do not claim.
- **Baby changing facilities**, verified **NO**, we do not have them.
- **Accessible toilet**, verified **NO**, we do not have one.
- **Air conditioning / climate control**, verified **NO**, we do not have it. Never describe any space as "climate controlled", "air conditioned", or offering "year-round comfort". We have **heating** only, so describe warmth in the cooler months, not cooling. (Beer-cellar cooling/refrigeration is a separate back-of-house system and is fine to mention in sustainability contexts.)
- **Heated beer garden**, verified **NO** (owner-confirmed 10 September 2026). The garden is not heated. Never write "heated areas", "heated spots", patio heaters or "heated in winter" about the garden or any seating in it. The heating is indoors, and saying so is fine. The smoking area's heater is not to be mentioned yet (§9).
- **Covered beer garden seating**, verified **NO** (owner-confirmed 10 September 2026). No part of the garden is covered. Never write "covered seating", "a covered section", "sheltered areas" or "covered patio areas" about it. The smoking area is covered, and saying there is a sheltered smoking area is fine (§9).
- **Wedding receptions**, updated 17 August 2026. We **will take** wedding reception bookings, so do not refuse or deny the offer if a customer asks. We do **not** market or optimise for them yet: no wedding landing page, no wedding keywords, no "wedding venue" positioning in page copy, meta, schema or `SSOT.json`. Treat it as a quiet yes on enquiry, not a promoted product. Revisit if the owner decides to push it.

## 15. Maintaining This Document

### Who owns each fact

Every fact has one owner. Update the owner first; everything else follows it. **Never change live operational data to match a stale line here: fix the line.**

| Fact | Owned by | What this document does |
|---|---|---|
| Opening hours, special hours, kitchen hours, closures | The management app's business hours and special hours | Mirrors them, never overrides them (§3) |
| Prices: food, drink, catering, Christmas | The management database, through the menu API | Never holds a live price (pricing policy above) |
| Capacities | The management app (`venue_spaces`, each event record) | Mirrors them with a pull date (§8, §10, §11) |
| Menu dishes and their descriptions | The management database: `menu_dishes` feeds the website, `sunday_lunch_menu_items` feeds the booking system | Holds the rules about dishes (vegan, Yorkshire, gravy, potatoes), not the list |
| Event dates, times, prices and payment mode | The event record in the management app | Holds the standing rules for each format (§10) |
| Voice, naming, banned claims, approved wording | This document | Canonical |
| Facilities, access and amenities | This document, owner-confirmed | Canonical; `SSOT.json` mirrors it |
| Claims that need evidence (ratings, "closest", heritage) | §17 | Canonical, each with a review date |

Two consequences worth stating, because both have caused real faults:

- **Menu descriptions are customer-facing copy.** They publish straight from the management database to the website without passing any page code, so the rules in §1, §4 and §14 apply to them as much as to a page. A Yorkshire pudding sat on the vegan Wellington's description for months because nothing checked it.
- **The two menu tables drift independently.** `menu_dishes` and `sunday_lunch_menu_items` hold separate copies of the Sunday roast, and a fix to one does not reach the other. Change both, then check both.

### The update rule

For a fact the management app owns, change it in the app, then bring this document into line. For a fact this document owns, change it here first; page copy, JSON-LD, schemas, blog posts and emails follow.

**Mirror file:** `/SSOT.json` carries a structured subset of stable facts for programmatic lookup. Opening hours, kitchen hours, drinks stock, prices, current review counts and ranks must come from live sources. When this Markdown file changes, the JSON should be reconciled. If the two ever disagree, this Markdown is canonical. `npx jest tests/ssot-drift-guard.test.ts` fails when they contradict on key facts: run it after every change.

**Word doc render:** `docs/SSOT-Review-The-Anchor.docx` can be regenerated for non-technical reviewers via `node docs/generate-ssot-docx.mjs` (the script reads `/SSOT.json`, so update the JSON first if the docx is what an external reviewer is reading).

**Process docs (separate concern):** `docs/ssot-review-spec.json` is a spec for the SSOT *review process*, not a brand-fact source. Don't edit it as part of routine fact updates.

### Before anything is published: two passes

Run these separately. Mixing them is how a warm sentence with a wrong fact gets through.

**The fact pass.** Is every fact in this document, or read live from its owner? Do dates, times and prices match the owning record? Are inclusions, exceptions and conditions stated, not softened? Does the page contradict itself anywhere? Are access and dietary claims taken from §8, §4 and §5, not reworded from memory?

**The voice pass.** The 60-second check in §1. Plus: no unfinished sentences, no internal system language ("the dates people search for", "pulled from the API"), and the location fact said once.

### Keeping it true

- **Every quarter:** read the live site's raw page text against §16, not an AI summary of it. A summarising tool once reported the drinks menu selling mulled wine and calling the pub a "premier drinks destination"; neither was on the page. Twenty minutes, four times a year.
- **Every change:** record it in §18, with the date and who confirmed it.
- **Every mirror** (a capacity, a rating, a count) carries the date it was pulled. A number that can change without anyone editing this document is a mirror.

## 16. Approved Wording

Paste these as they stand. Each one is built from the facts in this document, and each has already been checked against its section. If the facts change, change the block here, then everywhere it was pasted.

### Getting in and around

> Getting in from the car park is step free, and so are the bar and the dining area. The beer garden is step free straight from the car park. From inside, there's one step between the bar and the garden, and we'll put our ramp out for it if you ask. We don't have an accessible toilet. If you'd like to check what will work best for you, give us a call on 01753 682707 and we'll help.

Short form, for a feature list or a garden page:

> Step free from the car park. One step from the bar, with a ramp on request.

### Parking

> We've 20 free spaces right outside. There's no time limit while you're with us, and nothing to register.

### Dogs

> Dogs are welcome throughout the pub, on a lead. We'll have water bowls and biscuits waiting.

### Families

> High chairs, buggy space and bottle warming on request are all here, and breastfeeding is welcome. We don't have baby changing facilities.

### Sunday roast

> Roasts are carved fresh every Sunday from 1pm to 6pm. There's nothing to order in advance, so walk in whenever suits you. Last seating is 5:30pm.

### The Wellington

> Fully vegan as it comes. Ask if you'd like buttered cabbage or a Yorkshire pudding added, both of which make the plate no longer vegan.

### Gravy

> Our signature gravy is a recipe we've refined over the years, and it contains meat stock. Our regular gravy is fully vegan: it comes with the Wellington, and you can have it with any dish.

### Allergens, when the data is missing

> See menu or contact us for allergen information

### NGCI

> NGCI means No Gluten Containing Ingredients. These dishes are made without gluten-containing ingredients, but everything is prepared in one kitchen, so we can't guarantee there's no cross-contamination.

### Group deposit

> Groups of 15 or more: a £10 per person deposit, fully deducted from your bill.

### Private hire deposit

> A £250 booking and damage deposit secures your date. It's held separately from your bill and refunded after the event, less any documented deductions.

Never pair it with the group deposit: a private hire pays the £250 only.

### Christmas 2026

> Christmas sittings run from 10 November to 20 December 2026, for four guests or more, with 24 hours' notice. There's a £10 per person deposit, which comes off your bill.

> Two and three courses need everyone's choices 7 days before your booking. Booking later than that? It's the 1 course menu, with nothing to pre-order.

### Over Christmas and New Year

> On Christmas Day we're open for drinks only, 12pm to 3pm, with no food. We're closed on Boxing Day and on New Year's Day. Our kitchen's last day of the year is Sunday 20 December, and it's back on Tuesday 12 January. The bar stays open throughout, apart from those two days.

### Sport

> We show live sport on BBC, ITV and Channel 4. We don't have Sky Sports or TNT Sports.

### Takeaway and breakfast

> We don't do breakfast or delivery, but you can phone a takeaway order through to collect.

### Event arrival times

> Arrive from 6:30pm for a 7pm start.

Use it for quiz night, both bingos and the tasting night. Karaoke on 18 September is arrive from 7pm for an 8pm start, and the Halloween party starts at 8pm. (Mirrored from the management app on 11 September 2026.) Take any other night's times from its event record.

Never "doors 6:30pm": the pub is open long before then, and "doors" tells people it isn't (§10).

## 17. Claims Register

Claims that are objective, and so need evidence rather than enthusiasm. "We love a Sunday roast" needs none; "the best Sunday roast near Heathrow" needs proof we do not hold. Keep them apart.

| Claim | Evidence on file | How to use it | Review |
|---|---|---|---|
| Established 1751 | British History Online; Spelthorne local list, reference LL/072 | "A village pub since 1751", or the heritage safe wording in §1 | Stable |
| Closest traditional pub to Heathrow, to Terminal 5 | None recorded in this document | In use in §1 and §2. Journey times (§2) carry the same message and can be checked | Each quarter |
| Journey times to the terminals | §2 table, by terminal | Use the terminal-specific figure, or the 7 to 12 minute range. Never apply the Terminal 5 time to every terminal | Each quarter |
| Google rating 4.6 | Google Business Profile, figure not dated here | Show the rating while it is current. Never a review count (§12) | Monthly |
| Highly rated near Heathrow | The ratings in §12 | As written. A "highest-rated" claim needs current evidence | Each quarter |
| 5-star food hygiene, since 2019 | Food Standards Agency rating (§12) | "5-star food hygiene rating" | Each quarter |
| Outside the ULEZ | Location | "We're outside the ULEZ zone." | Stable |
| ULEZ saving figure | Retired 10 September 2026 (owner decision). The charge depends on the vehicle and the route | Never quote one (§14). The claim is "We're outside the ULEZ zone." | Stable |
| Famous Sunday roasts | Enthusiasm, not a factual claim | Fine as warmth. Never "best" or "premier" (§14) | Stable |

## 18. Changelog

Newest first. The rule each entry changed now lives in its section; this is the record of how it got there.

- **11 September 2026.** The pie roasts are off the Sunday menu (owner-confirmed; §4, §14). They had gone back on the day before. Three pages and four posts that listed pies among the Sunday roasts, and `/llms.txt`, no longer do. The weekday pies stay. The pricing note at the top no longer lists a ULEZ saving among the figures that may be quoted; the figure was retired on 10 September.
- **11 September 2026, the owner's answers to the open questions.** The quiz winners get a £25 bar voucher, not a bar tab, and second from last still gets the wine; the closest-answer drink in every round and the spot prizes are mirrored from the quiz records (§10). Every event finishes by 10pm, except special nights such as the Halloween party and New Year's Eve, which stays open until 1am (reconfirmed); the `/music-bingo` schema had said 11pm (§10). Quiz seating is team tables, one table per team, where the quiz page had said a long table might be shared with another team (§10). Peter Pitcher hosts karaoke, so the "no fixed host" line is retired (§10). Curry Club has stopped: it is recorded as discontinued (§10, §14), and `/blog/curry-club-the-anchor`, which still said the nights sell out, now redirects to `/food-menu` (owner-approved). The old Festive Menu catering packages are switched off in the management app, and `/christmas-parties` refers only to the 1, 2 and 3 course Christmas menu (§7, §14); `SSOT.json` now flags its three Christmas Dinner entries as not being catering-package rows. All owner-confirmed, except what is marked as mirrored.

- **11 September 2026.** Brought into line with the management app at the owner's request, with the owner's answers of the same day. Peter Pitcher, the owner, hosts quiz night and runs cash bingo himself, so the Question One Quiz Masters line is retired; solo quiz players and pairs are found a team on the night; half of all cash bingo book sales go into the final cash jackpot (all owner-confirmed, §10). The rest of 2026's quiz, cash bingo and Music Bingo dates are set and will not move (owner-confirmed), and §10 now lists them. Cash bingo is not monthly, with none in October, and its Snowball rolls over to the next cash bingo night, not the next month. Mirrored from the app the same day: those dates (the 11 September Music Bingo was cancelled), the festive nights listed beside the owner-confirmed Christmas quiz, which is Tinsel & Trivia on 2 December (§7), the Halloween hours and party, which join New Year's Eve as a night whose closing time copy may state (§10), the quiz phone rule, the scope of the arrival wording (§16), the kids menu (§5), the optics scope of the £2 double-up (§6), the four spaces that can be hired and the renamed Welcome Prosecco (§11). `SSOT.json` also gained the Sunday roast menu names and the three kids roasts, the six current pizzas, and price, payment and capacity mirrors for tasting and party nights.

- **10 September 2026.** A Christmas booking made inside the 2 and 3 course deadline (noon, 7 days before) takes the 1 course tier only (owner decision, §7). The online form and the booking function already refused late 2 and 3 course bookings. Staff bookings, which record no courses, were read as "every guest owes a main", and the reminder cron runs at noon, the minute the form locks, so it texted guests a link to a form that refused them. Late staff bookings are now recorded as 1 course, nobody is texted once the form has locked (the manager is told instead), and both Christmas enquiry forms stop offering 2 and 3 courses for a date inside the week.
- **10 September 2026.** A private hire pays the £250 deposit instead of the £10 per person group deposit, never both (owner-confirmed; §7, §11). The £250 is a booking and damage deposit, held separately and refunded after the event, as the signed contract says, but `/private-hire/anniversary-parties` and `/private-hire/engagement-parties` told customers it was deducted from the final bill, in five places, and one of them added the group deposit on top. The catering card on nine private-hire pages, and the deposit answer on every landmark private-hire page, gave the group deposit instead. All now use the §16 wording, and `tests/retired-claims-wording.test.ts` fails on either mistake.
- **10 September 2026.** The ULEZ saving figure is retired (owner decision). "£12.50 a day" was on eight pages (two of them through a shared value strip), six blog posts and `/llms.txt`, but whether a driver pays depends on their vehicle and route. Each now says only that we're outside the ULEZ zone, `SSOT.json` no longer holds a figure, and `tests/retired-claims-wording.test.ts` fails on any ULEZ sentence with a £ figure (§2, §14, §17).
- **10 September 2026.** Three more posts that still sold a Christmas market were retired (owner-approved): `christmas-fair-at-the-anchor`, `piano-christmas-performance` (which also promoted live piano, §10) and `this-december-at-the-anchor`, all redirected to `/christmas-parties`. The 2023 New Year post was rewritten from SSOT facts; it had listed weekly quizzes, Fish & Chip Fridays, a lunch club and live entertainment. Wind direction is no longer mentioned (§9): the owner does not know which wind brings aircraft over the garden, and §9 had said westerly operations cover about half the year, which pages then turned into "westerly winds bring aircraft overhead".
- **10 September 2026.** The £2 double-up on spirits is still running (owner-confirmed), so §6 now says so and `/blog/double-up-offer` stays. Eight dated offer and event posts from 2019 to 2025 were retired with redirects to the live pages that cover them, on the owner's instruction: their offers had ended or their events had passed, and several still quoted old prices, such as Carlsberg at £4.75 and a £19.99 Valentine's meal for two.
- **10 September 2026.** The Chicken, Ham Hock & Leek Pie is no longer served (owner-confirmed). It is off §5, `SSOT.json`, `content/menu/food.json` and the one post that named it, and was switched off in the management app the same day. The owner confirmed in the same answer that the Beef & Ale and Chicken & Wild Mushroom pies are still Sunday dishes (§4). /sunday-roast had not listed them, because their Sunday dishes were switched off in `menu_dishes` although `sunday_lunch_menu_items` had them on; they were switched back on. Both app changes were made at the owner's request and are in `audit_logs`.
- **10 September 2026.** Two posts retired and one corrected against §10 (owner-approved). `/blog/drag-cabaret-nikki` promoted drag cabaret, which is discontinued; it now redirects to `/whats-on`. `/blog/christmas-market` still invited stall enquiries for a market that is not running; it now redirects to `/christmas-parties`. Every older rule that landed on either post now goes straight to the new destination. `/blog/monthly-cash-bingo` said first Thursdays, doors at 6pm, games from 8pm, three games and a guaranteed £50 jackpot; it now carries the §10 format.
- **10 September 2026.** Dog facts confirmed by the owner (§8): dogs are welcome everywhere, any time the pub is open, event nights included; poo bags are provided, but there are no dog bins; Staines Moor and the King George VI Reservoir are each about a 30-minute walk, one way. There are no dog events, no treats beyond biscuits, and no dog-specific staff training or partnerships. The dog-friendly blog post had invented a weekly dog social, a village dog show, pupcakes and more, and was rewritten from these facts.
- **10 September 2026.** The private-hire Christmas set menu has the same 4-guest minimum as a Christmas dinner table booking (owner-confirmed). `SSOT.json` still gave its three Christmas Dinner tiers a minimum of 6, and seven statements of 6 had survived the 6 September change on `/christmas-parties` and in three posts, in forms a search for "6 guests" misses: "6-guest minimum", "6 to 20", "at least 6" and a table cell. All now say 4, and the tests fail on any form of the retired figure.
- **10 September 2026.** The beer garden is neither heated nor covered (owner-confirmed). §9 had listed "heated areas" as a garden feature, and from there the claim had reached the `/beer-garden` search description, the `/drinks` page and eight blog posts. Two older posts also gave the smoking area heating, and one listed "entertainment in heated areas". Covered or sheltered garden seating was claimed on `/plane-spotting-heathrow`, `/pub-garden-heathrow`, `/summer-garden-parties` and `/pubs-in-stanwell`, in two posts and in the blog authoring guide. All removed or reworded, and `tests/ssot-drift-guard.test.ts` now fails if either claim comes back. The covered smoking area does have a heater, which stays unmentioned until the owner says the area is ready (§9).
- **10 September 2026: version 2.0.** Restructured without renumbering: quick card; §1 replaced with a testable voice standard (the voice it replaces had applied to new copy from 14 August 2026); §15 gained a table of who owns each fact; §16, §17 and this changelog added; engineering detail moved to `docs/SSOT-engineering-notes.md`. Two contradictions inside the document removed. §14 banned naming Christmas dishes while §7 required publishing them; §14 now bans the retired "menu released closer to the time" line instead. §11 called a festive-buffet rule wrong in words that matched §7's correct one; §11 now scopes it. §3's advice to use `??` for kitchen hours was unsafe, because `??` falls through on the very null that means "closed"; the corrected rule is in §3 and the engineering notes.
- **9 September 2026.** The festive run confirmed by the owner: open throughout December except 26 December and 1 January, the kitchen's last day is 20 December and it returns on 12 January, Mondays keep their 4pm opening. 27 December had no override in the management app and resolved to a Sunday roast; it now carries one. The Wellington's plate confirmed: vegan by default, buttered cabbage and a Yorkshire pudding added only on request, and the kitchen makes no unbuttered cabbage. Its description in both menu tables had listed a Yorkshire pudding and buttery cabbage on a dish called fully vegan, and it now lists neither; the website's dish also gained the missing `vegan` flag. The tasting night priced at £45, £5 less in advance; it had been stored as free.
- **27 August 2026.** Runway designators removed. Ten places across `/beer-garden` and `/plane-spotting-heathrow`, including structured data, had asserted "27R", which contradicted the southern-runway line: Heathrow's southern runway is not 27R.
- **15 August 2026.** The adult drink on the Christmas menu corrected to the 2 and 3 course tiers only. An earlier version applied it to every tier, which reached the live christmas-parties page and two marketing emails before it was caught.
- **9 August 2026.** Group deposit threshold raised from 10 guests to 15. A party of ten is an ordinary family Sunday, and putting a payment screen in front of them was the most likely reason the pub took only two bookings of ten or more in ninety days. The per-person rate was unchanged, and the Christmas rule was unaffected.
