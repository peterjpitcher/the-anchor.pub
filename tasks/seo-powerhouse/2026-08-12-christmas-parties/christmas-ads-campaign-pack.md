# Christmas 2026 Ads Campaign Pack

**Date:** 15 August 2026 · **Owner implements in own accounts; nothing here spends by itself.**
**Landing page:** https://www.the-anchor.pub/christmas-parties (menu, prices and instant booking live as of 14 Aug 2026)
**Season budget envelope:** ~£450 total (Google ~£300, Meta ~£150), scale only if bookings arrive.
**Every claim below is SSOT-backed** (docs/SSOT.md, verified 15 Aug 2026). Keywords come from the site's own GSC queries, not guesswork.

---

## 1. Google Search (the workhorse)

### Campaign settings

| Setting | Value |
|---|---|
| Campaign name | `GOOG_Search_Local_Christmas-2026` |
| Type | Search only. **Untick** Display Network and Search Partners |
| Location | Radius **8 miles around TW19 6AQ** (Stanwell Moor). Setting: **"Presence: people in or regularly in"**, never "interest" |
| Language | English |
| Bidding | Maximise clicks with a **max CPC limit of £1.20**. Revisit only if 30+ conversions accrue (unlikely in one season; do not switch to tCPA on thin data) |
| Ad schedule | 08:00 to 22:00, all days |
| Final URL suffix | `utm_source=google&utm_medium=cpc&utm_campaign=christmas-2026&utm_content={_adgroup}` |

### Budget pacing (Google ≈ £300)

| Period | Daily | Why |
|---|---|---|
| Now to 31 Aug | £2 | Trickle: gather Quality Score data while demand sleeps |
| 1 Sep to 31 Oct | £5 | The office-organiser decision window. This is where the money works |
| 1 Nov to 10 Dec | £3 | Late small-group bookings |
| 11 Dec onward | **Pause** | Last bookable date is 19 Dec; clicks after ~10 Dec rarely convert to group bookings |

### Ad groups and keywords (phrase match throughout)

**AG1 · Christmas party venue** (`utm_content=venue`)
- "christmas party venue staines" · "christmas party venues staines"
- "christmas party pub staines" · "christmas parties staines"
- "christmas party venue heathrow" · "christmas party venues heathrow"
- "christmas party pub heathrow" · "christmas parties heathrow"
- "christmas party venue near me" · "christmas party venues ashford"

**AG2 · Christmas dinner and lunch** (`utm_content=dinner`)
- "christmas dinner staines" · "christmas lunch staines"
- "christmas dinner near heathrow" · "christmas lunch near heathrow"
- "christmas dinner near me" · "christmas lunch near me"
- "festive menu staines" · "christmas menu near me"

**AG3 · Work and office Christmas do** (`utm_content=work`)
- "work christmas party staines" · "office christmas party staines"
- "work christmas party heathrow" · "office christmas party near heathrow"
- "work christmas do near me" · "small office christmas party venue"

### Campaign-level negative keywords

```
london, hotel, jobs, job, hiring, recipes, recipe, ideas, diy, free,
"party night", "party nights", dj, disco, karaoke, band, tribute,
"christmas day", "christmas eve", "boxing day", "new year",
crackers, decorations, gifts, hamper, jumper, market, markets
```

Why the unusual ones: the pub deliberately has **no shared party nights, no DJ by default, no karaoke, no live band** (SSOT), so party-night searchers get a page that honestly doesn't match and the click is wasted. Service **ends 20 December**, so Christmas Day/Eve searches must be blocked. `market/markets` blocks the Christmas-market intent GSC shows reaching the blog.

### Responsive Search Ads (both RSAs in every ad group, all headlines 30 chars or fewer, verified)

**RSA A, venue-led**

Headlines:
1. Christmas Party Venue Staines
2. Christmas Parties Nr Heathrow
3. Book Christmas Dinner 2026
4. Village Pub, Not a Hotel
5. Your Own Table, Your Night
6. Free Parking On Site
7. 10 Nov to 20 Dec 2026
8. 8 Mins From Staines
9. 7 Mins From Heathrow T5
10. Book Online In Minutes
11. Festive Buffets For 30+
12. A Pub Christmas Since 1751

Descriptions:
1. Christmas dinner 10 Nov to 20 Dec. Choose your courses online and book in minutes.
2. A proper village pub near Heathrow T5. Your own table, free parking, no hotel ballroom.
3. 1, 2 or 3 courses per guest with a glass of prosecco. £10pp deposit comes off your bill.
4. Festive buffets for 30+ guests. Private space for work dos. 8 mins from Staines.

**RSA B, menu-led** (swap headlines 1 to 3 for: `Festive Menu From £23pp` · `Christmas Menu Out Now` · `Turkey, Beef, Pork or Vegan`; keep the rest)

⚠ **Price maintenance:** "From £23pp" mirrors the live 1-course price served from the management DB. If that price ever changes, this headline must be edited the same day. If you'd rather never think about it, drop that headline; the rest of the ad stands.

Pinning: none. Let Google rotate.

### Assets (extensions)

| Asset | Content |
|---|---|
| Sitelinks | **Christmas Menu** → /christmas-parties#christmas-menu · **Book a Table** → /book-table · **Festive Buffets** → /christmas-parties · **Find Us & Parking** → /find-us |
| Callouts | Free Parking · Prosecco Included · Dog Friendly · Groups of 6+ · Outside ULEZ |
| Structured snippet | Amenities: Free parking, Beer garden, Private areas, Step-free access |
| Call asset | 01753 682707 (schedule to bar hours) |
| Location asset | Link the Google Business Profile |

### Conversions (do this BEFORE enabling the campaign)

The site already fires the events; they need marking and importing:

1. In **GA4**: mark as key events → `form_complete` (the Christmas enquiry form), `purchase` (paid/confirmed bookings), `phone_call_click`.
2. In **Google Ads**: Tools → Conversions → Import → GA4. Import all three. Set `form_complete` and `purchase` as **Primary**, `phone_call_click` as Secondary.
3. Sanity-check with one test enquiry after linking; the event appears in GA4 Realtime.

GTM container sits under peter@orangejelly.co.uk (per July setup).

---

## 2. Meta (Facebook + Instagram), the support act

Pixel + CAPI verified working July 2026. Budget ≈ £150.

### Campaign 1 · `META_Traffic_Local_Christmas-2026` (prospecting)

| Setting | Value |
|---|---|
| Objective | Traffic (link clicks). Too few conversions this season for a Sales objective to learn |
| Start | 1 September, £4/day to 31 October, then £2/day to 30 November |
| Audience | 25 to 60, radius 8 miles around Stanwell Moor. **No interest stacking**, broad local |
| Placements | Facebook Feed, Instagram Feed, Stories/Reels. Advantage+ placements off |
| Creative | The three new photos: wide laid table (hero), plated Christmas dinner, candlelit party table. Square crops exist already |
| URL | /christmas-parties + `utm_source=facebook&utm_medium=paid_social&utm_campaign=christmas-2026-prospecting` |

Primary text variants (pick 2 or 3, rotate):
1. "Your work Christmas do, without the hotel ballroom. Christmas dinner at The Anchor runs 10 November to 20 December: your own table, courses chosen per guest, prosecco included, free parking. Menu and booking online."
2. "The Christmas menu is out. Turkey, beef, pork or a vegan wellington, 1 to 3 courses per guest, in a village pub 7 minutes from Heathrow T5. Groups of 6+, book online in minutes."
3. "Eight minutes from Staines, free parking, and a Christmas dinner people actually talk about. Dates 10 Nov to 20 Dec go quickly, Fridays first."

Headline: `Christmas at The Anchor` · CTA button: **Book now**

### Campaign 2 · `META_Retargeting_Christmas-2026`

| Setting | Value |
|---|---|
| Start | 15 September, £2/day |
| Audience | Website visitors 30 days AND christmas-parties page visitors 60 days. **Exclude**: `form_complete` and `purchase` events, 60 days |
| Frequency | Cap ~4/week if delivery allows |
| Message | Objection-handling: "Still weighing up the Christmas do? The full menu and prices are on the page, the £10pp deposit comes off your bill, and you book online in minutes. December Fridays go first." |

---

## 3. Free, alongside

- **GBP posts weekly** (owner, in hand): the proven channel; every organic Christmas click last season came via near-me/local pack.
- **Staines / Stanwell Moor / Ashford community Facebook groups**: one plain post when the menu photography is ready to show off. Zero cost, converts well for pubs.

## 4. Launch checklist

- [ ] GA4 key events marked and imported to Google Ads (§1 conversions)
- [ ] Billing live on both accounts
- [ ] Campaigns built as above, **paused**, then reviewed once against this doc
- [ ] One test enquiry fires `form_complete` end to end
- [ ] Enable Google now (trickle), Meta on 1 September
- [ ] Weekly 10-minute check: spend pacing, search terms report (add negatives), any enquiry attributed
- [ ] **10 December: pause everything** (last bookable date 19 Dec)

## 5. What success looks like

At these budgets expect roughly 250 to 400 Google clicks over the season. The page converts enquiries from a fraction of those; **one** confirmed party of 15 at 2 courses (£500+ food revenue) pays for the entire season. Judge on enquiries and bookings in the management app, never on impressions.
