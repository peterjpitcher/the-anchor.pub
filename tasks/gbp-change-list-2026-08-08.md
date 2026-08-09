# GBP change list for approval

**Date:** 8 August 2026
**Profile:** The Anchor, CID 17928230944823812473
Companion to [gbp-review-2026-08-08.md](gbp-review-2026-08-08.md).

Everything below is ready to apply. All URLs verified as returning 200 on 8 August 2026. All claims checked against `docs/SSOT.md`.

---

## Status as of 8 August 2026, end of session

| Change | Status |
|---|---|
| Kitchen hours, all 7 days | **Live and verified** on the public panel |
| Description amended | **Live** |
| "Has table service" set to Yes | Pending Google review |
| Service area cleared | Done by owner |
| H. "Modern British restaurant" removed | Pending Google review |
| D. Website UTM | Pending Google review |
| F. 31 August special hours (16:00 to 22:00) | Pending Google review |
| G. Repo cleanup, dead X/LinkedIn links | **Done**, SSOT valid, 34/34 drift-guard tests pass |
| B. Review reply | **Blocked**, see below |
| C. Q&A, 7 entries | Not started |
| E. Posts, weekly | Not started |
| A. Products, 7 entries | **Blocked on photos** |

### B is blocked by a Google UI fault, not by a decision

The merchant Reviews panel loads its list in a virtualised scroller that stops advancing after the third review, on both "Newest" and "Most relevant" sorts. The target review sits below that point and cannot be reached by scrolling, clicking or keyboard navigation.

**Workaround for the owner:** open the public listing, find the review by jasmine claypool in the displayed top three, and use Edit on the existing owner reply. The replacement wording is in section B below. It takes under a minute from the customer-facing side, where the list renders normally.

## Dropped, no longer applicable

- **X/Twitter and LinkedIn.** The owner confirms these accounts do not exist. See section G for the cleanup this triggers in the repo.
- **Special hours for 31 August.** The owner confirms no special hours. Normal Monday applies: bar 16:00 to 22:00, kitchen closed. See section F for the one thing still worth doing.

---

## A. Products, 7 entries

**Path:** merchant panel, **Edit products**.

Products are the workaround for the Pub category not exposing food attributes. This is the only place "vegan", "kids' menu" and "Sunday roast" can appear as words Google reads on the profile itself.

**Prices: leave every price field blank.** `docs/SSOT.md` requires prices to come live from the management DB, and a price typed into GBP would go stale silently with nobody watching it. The link does the work instead.

**Photos: each product needs one, and I do not have them.** Square or 4:3, 720px minimum. This is the one part of the list that needs you.

| # | Product name | Link | Description |
|---|---|---|---|
| 1 | Sunday Roast | `/sunday-roast` | Traditional Sunday roast served 1pm to 6pm. Walk-ins welcome, no pre-order needed. Beef topside, pork leg, turkey with stuffing, pies, and a fully vegan Wellington. |
| 2 | Vegan Wellington | `/sunday-roast` | Beetroot and butternut squash Wellington, fully vegan, served with vegan gravy as standard. Available every Sunday. |
| 3 | Kids' Menu | `/food-menu` | Smaller portions for younger guests, including a kids' roast on Sundays. High chairs available. |
| 4 | Christmas Lunch and Dinner | `/christmas-parties` | Sit-down Christmas lunch and dinner, 10 November to 20 December, for groups of 6 or more. One, two or three courses. |
| 5 | Festive Buffets | `/christmas-parties` | Festive buffet catering for groups of 30 or more. |
| 6 | Private Hire and Function Room | `/private-hire` | Function room for 10 to 150 guests. Birthdays, corporate events, celebrations and wakes. Free parking for every guest. |
| 7 | Quiz Night | `/quiz-night` | Pub quiz with teams and prizes on the night. Free to enter, no need to book. |

---

## B. One review reply to correct

**Review:** jasmine claypool, Local Guide, posted roughly November 2025. Currently one of the three reviews Google displays on the profile.

**What it says:** Sunday dinner is "served until 5 p.m." and you "typically have to order on the Saturday night".

**Why it matters:** both were retired at the 17 May 2026 walk-in launch. The review cannot be edited or removed, but the owner reply sits directly beneath it and Google, AI Overviews and Gemini all read both. Right now the reply thanks them without correcting the facts, so the profile is actively publishing an out-of-date booking policy.

**Note:** Google replaces the reply rather than appending, so this is a full rewrite of the existing one.

**Proposed replacement reply:**

> Thank you so much, Jasmine. We're delighted you stumbled across us and enjoyed your Sunday dinner, and it means a lot to hear such kind words from visitors travelling so far from home.
>
> One update for anyone reading this now: our Sunday roast no longer needs pre-ordering. Walk-ins are welcome from 1pm to 6pm every Sunday, and there is no Saturday cut-off any more.

**Also worth doing:** a scan of the other 281 reviews and replies for the same stale pre-order or Saturday cut-off language. I can do this if you want it.

---

## C. Q&A, 7 entries

**Path:** the profile's "Questions and answers" section on Google Search, signed in as the owner.

Google explicitly permits an owner to post a question and answer it themselves. Q&A answers are pulled into AI Overviews, which makes this one of the cheapest wins on the list.

| # | Question | Answer |
|---|---|---|
| 1 | Do I need to book for Sunday roast? | No. Walk-ins are welcome from 1pm to 6pm every Sunday. You can book a table online if you would rather be sure of one. |
| 2 | Is the kitchen open on Mondays? | The bar is open from 4pm on Mondays but the kitchen is closed. Food is served Tuesday to Sunday. |
| 3 | Is there parking? | Yes, 20 free spaces on site, no charge and no time limit while you are with us. The car park is floodlit with CCTV. |
| 4 | How far is it from Heathrow? | Seven minutes from Terminal 5 and two minutes from M25 Junction 14. We are also outside the ULEZ zone. |
| 5 | Are dogs allowed? | Yes, throughout the whole pub including the beer garden. We provide water bowls and dog biscuits. Dogs on leads, please. |
| 6 | Do you have an accessible toilet? | No, we do not have an accessible toilet. The bar, dining area and car park are all step-free, and there is a ramp available on request for the beer garden. Please call us on 01753 682707 and we will help you plan your visit. |
| 7 | Can you take large groups? | Yes. Private hire runs from 10 to 150 guests. Groups of 10 or more take a £10 per person deposit, which comes off the final bill. |

Answering number 6 honestly is deliberate. It prevents a bad visit, and Google rewards profiles that answer real questions rather than dodging them.

---

## D. UTM tags on the two outbound links

**Path:** Edit profile, Contact (website) and the booking link.

Every visit from the profile currently lands in GA4 as direct or organic, so the profile gets no credit for the traffic or bookings it drives.

| Field | Change to |
|---|---|
| Website | `https://www.the-anchor.pub/?utm_source=google&utm_medium=organic&utm_campaign=gbp` |
| Booking link | `https://www.the-anchor.pub/book-table?utm_source=google&utm_medium=organic&utm_campaign=gbp_booking` |

Trade-off, stated plainly: UTMs add no ranking value and are visible in the link preview on some surfaces. This is purely so you can prove what the profile is worth.

---

## E. Posts, move to weekly

One post is live (Christmas, 1 August). Keep it until 20 December, then retire it.

The events calendar is a ready-made content engine and needs no new writing. First three suggested:

| When | Post | Link | Button |
|---|---|---|---|
| Now | Country music bingo, Friday 14 August | `/events/cowboys-queens-country-music-bingo-2026-08-14` | Learn more |
| Now | Pub quiz, Wednesday 19 August | `/events/pub-quiz-quiz-night-2026-08-19` | Learn more |
| Now | Sunday roast, walk-ins welcome 1pm to 6pm | `/sunday-roast` | Book |

Then one per week off `/whats-on`.

---

## F. Bank holiday hours, confirm rather than change

You have no special hours for Monday 31 August, so normal Monday applies: bar 16:00 to 22:00, kitchen closed.

Google still shows a "Hours might differ" warning on bank holidays until the merchant confirms them. Confirming 31 August as **the same as usual** removes that warning without changing anything. Path: Edit profile, Hours, Special hours, confirm the public holiday.

Same job needs doing for Christmas and New Year before the Christmas offer opens on 10 November, and those genuinely will differ.

---

## G. Repo cleanup triggered by the dead social accounts

The owner confirms X/Twitter and LinkedIn do not exist. Two places still publish links to them:

| File | Line | Issue |
|---|---|---|
| `SSOT.json` | 136 to 137 | `digital.social_media` lists `twitter` and `linkedin` URLs for accounts that do not exist |
| `content/blog/new-dining-room/index.md` | 173, 175 | A published blog post gives readers both links |

The live site schema `sameAs` is already clean; it lists only Facebook, Instagram, the Google Maps CID, Tripadvisor, OpenTable and the Food Standards Agency rating. So this is contained, but the blog post is customer-facing and currently sends readers to dead ends.

**Proposed:** remove both entries from `SSOT.json`, and remove the two lines from the blog post.

---

## H. Category, one removal

Remove **"Modern British restaurant"**. It contradicts the SSOT positioning of a traditional British village pub, and it invites comparison with a gastropub set The Anchor is not competing with. "British restaurant" and "Restaurant" already cover the food side.

**Do not touch the primary category.** "Pub" is the strongest single ranking signal on the profile.

---

## I. Reviews, the standing job

284 reviews at 4.6. The Retreat has 931 at 4.2, The Bells 667 at 4.4, The Rising Sun 334 at 4.3. Best rating in the area, second-lowest volume of the big three. Volume is a local pack factor.

- Put the GBP short review link on receipts, table talkers and the post-booking confirmation email from the management app.
- Ask on Sunday afternoons, when the review text shows satisfaction peaks.
- Never incentivise. Google removes gated or paid reviews and it puts the profile at risk.

Target: 400 reviews while holding 4.6.
