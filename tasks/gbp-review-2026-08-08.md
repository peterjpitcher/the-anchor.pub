# Google Business Profile review, The Anchor

**Date:** 8 August 2026
**Profile:** The Anchor, Horton Rd, Stanwell Moor, Staines TW19 6AQ
**Place ID:** `ChIJDcbcERJxdkgReaFjdQ7fzfg` | **CID:** `17928230944823812473`
**Method:** public Google Maps listing read live and compared against `docs/SSOT.md`, `SSOT.json`, and the live `/api/business/hours` feed. No dashboard access, so a few items are marked "verify in dashboard".

---

## Verdict

The profile is in good shape and is clearly being managed. Rating is 4.6 from 284 reviews, the owner replies to reviews, photos are current (latest 4 days ago), the booking and menu links are wired up, and the name, address, phone, website, hours and coordinates all match the SSOT exactly. There is no NAP inconsistency to fix.

The gains left are about **completeness and freshness**, not corrections. The three that move the needle are kitchen hours, a business description, and review volume.

---

## What is already correct (do not touch)

| Item | Status |
|---|---|
| Business name "The Anchor" | Correct, matches SSOT, no keyword stuffing (stays policy-compliant) |
| Address / post town | Correct (Royal Mail post town "Staines" is right for TW19 6AQ) |
| Phone 01753 682707 | Correct |
| Website `https://www.the-anchor.pub/` | Correct |
| Booking link "Find a table" to `/book-table` | Correct and present |
| Menu link | Present, and "Sunday Roast" / "Sunday Lunch" show as popular items |
| Opening hours (Sun 12-10, Mon-Fri 4-10, Sat 12-10) | Match the live management API and site schema exactly |
| Delivery attribute | Correctly marked "No delivery" (SSOT compliant) |
| Wheelchair-accessible toilet | Correctly marked "No" (honest, SSOT compliant) |
| Owner verification | Verified, listed as "The Anchor (owner)" |
| Photo cadence | Latest upload 4 days ago |
| Review responses | Owner is replying, personalised, good tone |
| Site schema `sameAs` | Already links the GBP CID, which is the correct entity signal |

---

## Priority 1: Add kitchen hours under "More hours". DONE 8 Aug 2026

Submitted and pending Google review. Path for next time: Edit profile, **Hours** tab, scroll past "Special hours", **Add more hours**, **+ Kitchen**.

The kitchen runs on a completely different clock to the bar, which is why this mattered:

| Day | Bar (on GBP) | Kitchen (actual) |
|---|---|---|
| Monday | 4pm - 10pm | **Closed all day** |
| Tuesday | 4pm - 10pm | 4pm - 9pm |
| Wednesday | 4pm - 10pm | 4pm - 9pm |
| Thursday | 4pm - 10pm | 4pm - 9pm |
| Friday | 4pm - 10pm | 4pm - 9pm |
| Saturday | 12pm - 10pm | 12pm - 7pm |
| Sunday | 12pm - 10pm | 1pm - 6pm (roast) |

Right now Google believes food is available whenever the pub is open. That means the profile can surface for "food near me" or "Sunday roast near me" at times the kitchen cannot serve, and a Monday food visitor gets a wasted trip. Wasted trips are how 4.6 ratings become 4.4 ratings.

**Action:** GBP dashboard, Edit profile, Hours, "Add more hours", choose **Kitchen**, and enter the grid above with Monday left blank.

---

## Priority 2: Amend the business description. DONE 8 Aug 2026

Applied and pending Google review. The live description now ends:

> ... Sunday roasts are served from 1pm to 6pm with walk-ins welcome, no pre-order needed. 5-star food hygiene rating. Serving the community since 1751.

727 of 750 characters used. Background below.


**Correction to the first version of this report.** A description does exist. It was not visible on the public Maps listing, which is why I first recorded it as missing. Dashboard access on 8 August confirmed it is live and it is good.

Two changes to make:

1. **Remove "Rated 4.6/5 on Google with a 5-star food hygiene rating."** Quoting your own Google rating back to Google inside a Google-owned field is a rejection risk, and the number goes stale by itself. Keep the food hygiene rating, drop the Google rating.
2. **Add the Sunday roast walk-in policy.** It is the single highest-intent thing people search for here and the description does not mention that walk-ins are welcome.

Everything else in the current description checks out against the SSOT, including "stone-baked pizzas" (`docs/SSOT.md` line 153, still live).

**Suggested replacement for the final sentence:**

> Sunday roasts are served from 1pm to 6pm with walk-ins welcome, no pre-order needed. 5-star food hygiene rating. Serving the community since 1751.

**Full alternative draft (738 characters, all claims SSOT-verified), if you would rather replace the lot:**

> The Anchor is a traditional British pub in Stanwell Moor, part of the community since 1751 and the closest village pub to Heathrow Airport, seven minutes from Terminal 5 and two minutes from M25 Junction 14. We serve famous Sunday roasts with walk-ins welcome from 1pm to 6pm, plus a full weekday menu, bottled ales, wine, spirits and cocktails. Our beer garden sits directly under the Heathrow approach path, with aircraft passing 500 to 800 feet overhead roughly every 90 seconds. There are 20 free parking spaces on site with no time limit, free WiFi throughout, and we are dog friendly in every part of the pub. We host quiz nights, cash bingo, music bingo, karaoke and live music, and we take private hire for 10 to 150 guests.

Rules to keep it compliant: no links, no prices, no promotional offers, no all-caps.

---

## Priority 3: Close the review volume gap

The Anchor has the best rating in its local set but not the most reviews. Google's local pack weighs review count as well as rating.

| Pub | Rating | Reviews |
|---|---|---|
| **The Anchor** | **4.6** | **284** |
| The Retreat | 4.2 | 931 |
| The Bells | 4.4 | 667 |
| The Rising Sun | 4.3 | 334 |
| The Five Bells | 4.2 | 80 |

The Anchor wins on quality and loses on volume. Getting from 284 towards 400 while holding 4.6 would make it the strongest profile in the area on both axes.

**Actions:**
- Use the GBP short review link on receipts, table talkers and the post-booking confirmation email from the management app.
- Ask at the point of highest satisfaction, which the review text says is the Sunday roast, so ask on Sunday afternoons.
- Never incentivise. Google removes gated or paid reviews and it puts the profile at risk.

---

## Priority 4: Fill the attribute gaps

Attributes are how Google matches the profile to filtered and voice searches ("pub with high chairs near me", "vegan food near Heathrow"). Every true attribute left unticked is a query the profile cannot answer.

**Correction to the first version of this report. There is nothing to add.** Every attribute group was opened and audited in the dashboard on 8 August. Every attribute Google offers under the **Pub** primary category is already set, and the ones set to No are correctly No (happy-hour drinks, happy-hour food, rooftop seating, gender-neutral toilets, drive-through, delivery, no-contact delivery, free multi-storey car park, cheques, cash-only).

My original list of additions was drawn from Google's general restaurant attribute catalogue. The Pub category does not expose those fields. Verified group by group:

| Group | Options Google actually offers under "Pub" | Verdict |
|---|---|---|
| Accessibility | 6 wheelchair and hearing options | All set |
| Amenities | Gender-neutral toilets, toilet, Wi-Fi | All set. **No "high chairs", no "bar on site"** |
| Children | "Good for kids" only | Set. **No "high chairs", no "kids' menu"** |
| Crowd | LGBTQ+ friendly, transgender safe space | Both set. **No "family-friendly"** |
| Dining options | Outside food allowed, seating, table service | All set. **No lunch, dinner, dessert or catering** |
| Highlights | Bar games, karaoke, live music, live performances, quiz night, rooftop seating, watching sport | All set |
| Offerings | Alcohol, arcade games, beer, cocktails, dancing, food, food at bar, free water refills, happy-hour drinks, happy-hour food, private dining room, spirits, wine | All set. **No vegetarian, vegan, coffee, kids' menu or dessert** |
| Parking | On-site, free street, free lot, free multi-storey | All set. ("Plenty of parking" on the public listing is Google-inferred, not editable) |
| Payments | Cash-only, cheques, credit, debit, NFC, VISA, Amex, Mastercard | All set |
| Pets | Dogs allowed | Set |
| Planning | Reservations required, accepts reservations | Both set |
| Service options | Outdoor seating, delivery, no-contact delivery, takeaway, dine-in, on-site services, drive-through | All set |

Also not owner-editable, despite appearing on the public listing: **Popular for** ("Solo dining") and **Atmosphere** ("Casual", "Cosy"). Google infers both from reviews and user behaviour.

### Why the food attributes are missing, and what to do instead

The attribute set is driven entirely by the **primary category**. "Pub" gives a pub-shaped list (bar games, karaoke, quiz night, arcade games, dancing). A **Restaurant** primary category would unlock the food attributes: vegetarian options, vegan options, kids' menu, dessert, coffee, high chairs, lunch, dinner, catering.

**Do not swap the primary category for this.** "Pub" is almost certainly the right primary for the searches that matter ("pub near me", "pub near Heathrow", "pub Stanwell Moor"), and primary category is the single strongest ranking signal on the profile. Trading it for a handful of attributes would be a bad deal.

It does mean the food signals have to come from elsewhere on the profile:

- **Products** (currently empty). This is the main workaround. Sunday roast, vegan Wellington, kids' menu, Christmas menu, each with a photo and a link.
- **The menu link**, already pointing at `/food-menu` and returning 200.
- **Posts**, where "vegan Wellington" and "kids' menu" can appear as words Google reads.
- **Reviews**, which is where "Popular for" and "Atmosphere" come from. Reviewers mentioning the roast, the vegan option and bringing kids is what moves those.

**Three flagged attributes, all resolved by the owner on 8 August 2026:**

| Attribute | Outcome |
|---|---|
| **Arcade games** | **Keep.** The pub has a fruit machine. Recorded in the SSOT so this is not re-flagged. |
| **Dancing** | **Keep.** There is space for guests to dance. Recorded in the SSOT. |
| **"No table service"** | **Changed to Yes and saved 8 August 2026, pending Google review.** Food is brought to tables. This was the one genuine error, and it matters: table service is one of the few food-related signals the Pub primary category exposes. |

---

## Priority 4b: Clear the service area

**Found on 8 August via dashboard access. Not visible on the public listing.**

The profile has a service area set: Ashford, Feltham, Longford, Egham, Englefield Green, Staines-upon-Thames, Colnbrook and Stanwell Moor. (Google itself removed Hounslow West at some point.)

A service area tells Google you travel to the customer. The Anchor is a storefront: customers come to you, and the profile correctly carries the attribute "No delivery". So the service area does two unhelpful things at once. It does not widen the radius you rank in, which is set by your physical location and prominence, and it contradicts your own delivery attribute.

**Action:** Edit profile, Location, Service area, remove all entries.

If the goal was to rank in Ashford, Feltham and Staines, the levers that actually work are review volume from customers in those towns, locally relevant content on the site, and local citations. Not this field.

---

## Priority 4c: Add the two missing social profiles

The profile lists Facebook and Instagram. The SSOT also has X/Twitter (`https://twitter.com/TheAnchor_Pub`) and LinkedIn (`https://linkedin.com/company/102814641`), and both are already in the site's schema `sameAs`. Adding them to GBP keeps the entity signals consistent across both.

**Action:** Edit profile, Contact, Social profiles.

---

## Priority 5: Fix outdated information inside a top review

One of the three reviews Google currently displays (jasmine claypool, 9 months ago) tells readers that Sunday dinner is "served until 5 p.m." and that you "typically have to order on the Saturday night". Both were retired at the 17 May 2026 walk-in launch. The current position is walk-ins welcome 1pm to 6pm with no pre-order and no Saturday cutoff.

Reviews cannot be edited or removed for being out of date, but the owner reply can. Google displays the reply directly underneath, and AI answer engines read both.

**Action:** edit the existing owner reply to append a correction, for example:

> A quick update for anyone reading this now: our Sunday roast no longer needs pre-ordering. Walk-ins are welcome from 1pm to 6pm every Sunday.

Worth a scan of the other 281 reviews and replies for the same stale pre-order and Saturday-cutoff language.

---

## Priority 6: Seed the Q&A section

No questions are showing on the public profile. Google explicitly permits an owner to post a question and answer it themselves, and Q&A answers are pulled into AI Overviews.

Suggested seeds, all SSOT-verified:

1. Do I need to book for Sunday roast? *No. Walk-ins are welcome from 1pm to 6pm every Sunday. You can book a table online if you would prefer to be sure of a table.*
2. Is the kitchen open on Mondays? *The bar is open from 4pm on Mondays but the kitchen is closed. Food is served Tuesday to Sunday.*
3. Is there parking? *Yes, 20 free spaces on site, no charge and no time limit while you are with us. The car park is floodlit with CCTV.*
4. How far is it from Heathrow? *Seven minutes from Terminal 5 and two minutes from M25 Junction 14. We are also outside the ULEZ zone.*
5. Are dogs allowed? *Yes, throughout the whole pub including the beer garden. We provide water bowls and dog biscuits. Dogs on leads please.*
6. Do you have an accessible toilet? *No, we do not have an accessible toilet. The bar, dining area and car park are all step-free, and there is a ramp available on request for the beer garden. Please call us on 01753 682707 and we will help plan your visit.*
7. Can you take large groups? *Yes, private hire runs from 10 to 150 guests. Groups of 10 or more take a £10 per person deposit, which comes off the final bill.*

Answering the accessible toilet question honestly is the right call. It prevents a bad visit and Google rewards profiles that answer real questions.

---

## Priority 7: Post weekly, not monthly

There is one live post, published 1 August 2026 about Christmas. Posts do not directly move rankings, but they occupy the panel, they feed the "from the owner" slot, and they are one of the few places you control the words on your own listing.

The events calendar is a ready-made content engine: quiz night, cash bingo, music bingo, karaoke, live music, curry club, games night, tasting nights. One post per week, each with a Book or Learn more button, is achievable without writing anything new.

Keep the Christmas post running until 20 December 2026, then retire it.

---

## Priority 8: Tag the outbound links so you can measure GBP

The website link currently points at `https://www.the-anchor.pub/` with no UTM parameters, so every visit from the profile lands in GA4 as direct or organic and the profile gets no credit.

**Set:**
- Website: `https://www.the-anchor.pub/?utm_source=google&utm_medium=organic&utm_campaign=gbp`
- Booking: `https://www.the-anchor.pub/book-table?utm_source=google&utm_medium=organic&utm_campaign=gbp_booking`

Note the trade-off: UTMs are visible in the link preview on some surfaces, and they add no ranking value. They are purely so you can prove what the profile is worth. Worth doing.

---

## Priority 9: Review the category list

Current: **Pub** (primary), plus Beer garden, British restaurant, Events Venue, Family restaurant, Modern British restaurant, Restaurant.

Primary category **Pub** is correct and should not change. It is the strongest single ranking signal on the profile.

One to reconsider: **Modern British restaurant** contradicts the SSOT positioning of "traditional British village pub". It is unlikely to be doing harm, but it is off-brand and it competes with a set of gastropub-style venues The Anchor does not want to be compared with. Worth swapping for a category that reflects actual revenue, for example a function or event space category, given private hire runs 10 to 150 guests.

---

## Friday lunch: resolved, and it is a live booking bug

**Owner confirmed 8 August 2026: food is served from 16:00 on Fridays.**

So the Google Business Profile and the website are both correct, and the **management app is wrong**. Friday's `schedule_config` carries a bookable lunch service from 12:00 to 14:30, on a day the pub does not open until 16:00. Customers can currently reserve a Friday lunch table that cannot be honoured.

This is not a GBP fix. It sits in `OJ-AnchorManagementTools` and has been raised as a separate task. Worth checking the other days for the same fault, since it looks like a copy of Saturday's config, and worth a validation guard so a slot cannot start before the day's opening time.

---

## Priority 10: Two dashboard tools sitting unused

The merchant panel has **Edit products** and **Edit services** buttons, neither of which is populated.

**Products** is the more useful of the two. Each product is a card with an image, a name, a price band and a link, and they surface in the profile's own carousel. Good candidates: Sunday Roast, Christmas lunch and dinner, private hire and function room, festive buffets, quiz night. It is the only place on the profile where you get to pair a photo with a price and a booking link.

**Special hours** is also empty. The August bank holiday (Monday 31 August 2026) is the next one that matters, because Monday is normally a kitchen-closed day. Christmas and New Year need entering before the Christmas offer goes live on 10 November.

---

## Summary checklist

- [x] Add Kitchen hours under "More hours" (Mon blank, Tue-Fri 16:00-21:00, Sat 12:00-19:00, Sun 13:00-18:00). Done 8 Aug 2026, pending Google review
- [ ] Clear the service area
- [x] Description amended. Done 8 Aug 2026, pending Google review. Dropped "Rated 4.6/5 on Google", added "Sunday roasts are served from 1pm to 6pm with walk-ins welcome, no pre-order needed." 727/750 characters
- [x] Attributes audited 8 Aug 2026. Nothing to add: every attribute the Pub category offers is already set. Food attributes are not available under this primary category and the primary should not be changed to unlock them
- [x] "Has table service" flipped to Yes. Done 8 Aug 2026, pending Google review
- [x] "Arcade games" (fruit machine) and "Dancing" confirmed accurate by the owner and recorded in the SSOT
- [ ] Add X/Twitter and LinkedIn to social profiles
- [ ] Update the owner reply on the jasmine claypool review, and scan the rest for stale pre-order language
- [ ] Start a review request routine, target 400 reviews at 4.6
- [ ] Post and answer the seven Q&A entries
- [ ] Move to a weekly post cadence driven by the events calendar
- [ ] Populate Products (Sunday roast, Christmas, private hire, festive buffets, quiz night)
- [ ] Enter special hours for the 31 August bank holiday, then Christmas and New Year
- [ ] Add UTM parameters to the website and booking links
- [ ] Review the "Modern British restaurant" category
- [x] Friday resolved: food from 16:00 confirmed. GBP and website are correct; the phantom Friday lunch booking slot in the management app is raised as a separate task
