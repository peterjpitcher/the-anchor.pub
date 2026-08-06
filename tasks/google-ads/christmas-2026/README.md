# Christmas 2026 Google Ads campaign, build guide

Target account: **132-325-8633** (peter@orangejelly.co.uk). Built 29 July 2026, revised after the
localised seasonal forecast.

All ad copy is validated against Google's character limits and swept against `docs/SSOT.md`:
no prices, no cask or real ale, no wedding positioning, no review count, no shared-party-night language,
capacity as 10 to 150 (private hire), party minimum 6 guests, window 10 Nov to 20 Dec 2026.

## Files

| File | What it is |
|---|---|
| `keywords.csv` | 25 keywords, 5 ad groups, exact and phrase only. Every one has measured GKP volume |
| `responsive-search-ads.csv` | One RSA per ad group, 8 to 10 headlines and 4 descriptions each |
| `negative-keywords.csv` | 80 campaign negatives, geography built from the real GSC query export |

Forecast backing these: **32 conversions, £31 CPA, £1.76 CPC, 569 clicks, about £1,000** across
1 Nov to 20 Dec at £20/day, targeting the 13 local towns. See `tasks/keyword-plan-christmas-2026.md` §4.

---

## Phase 0. Before you build anything

**Do not skip this. Maximize conversions has nothing to optimise toward without it, and the whole plan
depends on measuring cost per enquiry.**

1. Sign into account **132-325-8633**. Confirm it is in **Expert Mode**, not the Smart Campaign flow.
   If you see "search themes" anywhere, you are in the wrong mode.
2. Billing set up with a valid payment method.
3. Link GA4 to Google Ads: **Admin > Data manager > Linked products > Google Ads**.
4. Import `christmas_enquiry` from GA4 as a conversion action:
   **Goals > Conversions > Summary > New conversion action > Import > GA4**.
   The event already fires from `lib/gtm-events.ts:561`, so the site side is done.
5. Set `christmas_enquiry` as the **Primary** conversion action. Everything else Secondary, or smart
   bidding will chase the wrong thing.
6. In GTM (`GTM-WWFQTQS`), add the Google Ads conversion linker and conversion tag using the **new**
   account's conversion ID. The old account's ID will not work.
7. Verify with Google Tag Assistant that the conversion fires on the enquiry confirmation step.

## Phase 1. Create the campaign shell

**Campaigns > New campaign > Create a campaign without a goal's guidance > Search.**

| Setting | Value | Why |
|---|---|---|
| Campaign name | `Christmas 2026 \| Search` | Must match the CSVs exactly or the import creates a second campaign |
| Networks | Search only. **Uncheck Search partners AND Display Network** | Both default ON. Both waste budget on a campaign this small |
| Locations | The 13 towns listed below | Matches the forecast |
| Location option | **"Presence: people in or regularly in your targeted locations"** | The default is "presence or interest", which is what produced the Wilmslow and Waterloo junk in the GSC export |
| Languages | English | |
| Bid strategy | **Maximize clicks, max CPC £2.50** | No conversion history yet. Switch to Maximize conversions at 15 to 30 recorded conversions |
| Budget | **£20/day** | £40/day buys 41% more conversions for 42% worse CPA. The curve flattens above ~£60 |
| Start / end | Start early September, end 20 December 2026 | Office party decisions are made September to October |
| Ad schedule | Optional: trim 11pm to 7am | |

**The 13 locations:** Egham, Feltham, Hounslow, Maidenhead, Richmond, Shepperton, Slough,
Staines-upon-Thames, Stanwell, Sunbury-on-Thames, Twickenham, Walton-on-Thames, Windsor.

## Phase 2. Import the structure

In **Google Ads Editor**, download account 132-325-8633, then
**Account > Import > From file**, in this order:

1. `keywords.csv` (creates the ad groups)
2. `responsive-search-ads.csv`
3. `negative-keywords.csv`

Review each import, then **Post**.

## Phase 3. Assets

- **Call extension:** 01753 682707. A lot of pub enquiries come by phone
- **Location extension:** link the verified Business Profile (`fid=17928230944823812473`). Not the duplicate
- **Sitelinks** (25 char limit): `Christmas Menu`, `Plan A Party`, `Private Hire`, `Find Us`
- **Callouts** (25 char limit): `Free Parking`, `Outside The ULEZ`, `No Room Hire Charge`,
  `7 Mins From T5`, `Rated 4.6/5`, `Groups 10 To 150`

## Phase 4. Pre-launch checklist

- [ ] `christmas_enquiry` recorded as Primary conversion, verified firing
- [ ] Search partners OFF, Display Network OFF
- [ ] Location option set to **Presence**
- [ ] Budget £20/day, bid strategy Maximize clicks with £2.50 cap
- [ ] All 80 negatives applied
- [ ] Landing page is `/christmas-parties`, except Function Room Hire which points at `/private-hire`
- [ ] Ads route group traffic to the **enquiry** path, not the deposit path

## Phase 5. After launch

- **Week 1: check the Search Terms report daily** and add negatives. This is the single highest-value
  ongoing task and no upfront negative list survives contact with reality.
- **Watch Richmond.** In the £40/day forecast it took 414 of 837 clicks and £985 of £2,000. If it exceeds
  roughly 30% of spend, apply a location bid adjustment or remove it.
- **At 15 to 30 conversions, switch to Maximize conversions.** Not before.
- **Do not raise the budget above £20/day** without re-forecasting. Diminishing returns are steep.

---

## Expectation setting

32 enquiries at a 40% close is roughly **13 bookings**, about 40% fill of your 12 peak Friday and
Saturday sessions.

Paid search alone does **not** reach the 30 bookings needed for 55% fill. Meta and direct B2B outreach
to local offices remain necessary, not optional.

## Judgement calls you may want to reverse

- **`ideas` is negatived.** `christmas buffet ideas` has real volume (GKP 5,000 bucket, Low competition)
  but it is informational. Serve it with content, not ad spend.
- **`christmas party night` is negatived.** 5,000 volume at Low competition and it looks like the best
  term in the set, but in the UK trade it usually means a *shared* party night with a disco, which
  `docs/SSOT.md` records as discontinued. Targeting it buys a mismatch.
- **`hotel` is negatived** to avoid airport-hotel comparison traffic.
- **Town-modifier keywords are excluded entirely.** GKP returned no data for 34 of 38 local-modifier
  terms. Radius and location targeting deliver the local relevance instead of keyword text.
