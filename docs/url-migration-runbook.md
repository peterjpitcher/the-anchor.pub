# URL migration runbook

**Owner:** Peter Pitcher (Search Console, CDN, management API, content freshness)
**Written:** 26 August 2026, covering the 29 URLs retired by the site growth programme
**Applies to:** any future page retirement or URL change

---

## Why this exists

The site growth programme retired 29 URLs: 11 hotel proximity pages and 18 past event pages. The code half of that is easy and already done. The half that gets forgotten is everything outside the repository, and forgetting it is how a good migration still loses traffic.

One thing to be clear about, because it was overstated in the original spec: **removing a URL from a sitemap does not deindex it**, and a 301 does not instantly transfer anything. Migrations are judged over months, not days.

---

## Before the deploy

- [x] **Baseline captured** (exports pulled 1 September 2026, analysed 5 September 2026, see below). Clicks, impressions, CTR, position, organic landing sessions, booking starts, completed bookings, and phone or WhatsApp actions, for every URL being retired and for its destination. Without this the review at 28 days has nothing to compare against, and the decision to retire cannot be validated or reversed on evidence. **Check how far back Search Console actually goes before relying on it.** This property starts on 1 May 2026, which ruled out the year-on-year comparison the original revert rule was built on.
- [ ] **Redirect map reviewed.** Every source has exactly one destination, and that destination is the closest equivalent page, not a generic index. `npm run audit:redirects` enforces this.
- [ ] **Internal links updated.** No page should link to a URL that redirects. A redirect is for outside traffic and old bookmarks, not for our own navigation.
- [ ] **Sitemap updated.** Retired URLs removed. `npm run audit:rendered` fails if a sitemap URL does not return 200.
- [ ] **Check nothing external points at the old URL.** Paid campaigns, Google Business Profile, printed material, QR codes, social bios, email footers. A QR code on a physical poster cannot be edited after printing, so it needs its redirect kept indefinitely.

## At the deploy

- [ ] **Test on production, not just locally.** Cloudflare sits in front of Vercel and has its own caching and TLS rules. A redirect that works on localhost can behave differently at the edge.
- [ ] **Follow each redirect end to end.** Assert the final URL equals the intended destination, in one hop, ending 200. Not merely that it reaches a 200: a 301 to a generic index passes that test and still loses the topical match. That exact mistake hid 172 broken redirects on this site.
- [ ] **Purge the CDN** for the affected paths if anything looks stale.

## After the deploy

- [ ] **Keep the 301s for at least a year.** Google's site move guidance is explicit about this. Removing a redirect early strands whatever equity had not yet transferred.
- [ ] **Watch both old and new URLs in Search Console.** The old URL should fade; the new one should absorb. If the old one keeps getting impressions after several weeks, the redirect is not being honoured somewhere.
- [ ] **Review at 28, 56 and 84 days.**

## Pre-change baseline, exports pulled 1 September 2026, analysed 5 September 2026

Search Console, Web search, 1 May to 24 Aug 2026, 116 days. Raw exports in `docs/evidence/gsc-baseline-2026-09-01/`.

| Set | URLs with data | Clicks | Impressions | CTR |
|---|---:|---:|---:|---:|
| 11 retired `/pub-near-*-heathrow` pages | 11 | **22** | 1,181 | 1.86% |
| 18 retired event pages | 3 | **0** | 3 | 0% |
| Destination hubs | 4 | **55** | 5,484 | 1.00% |

### The verdict on the retirements

**The event retirements were unarguable.** Eighteen pages produced three impressions and zero clicks in almost four months. Fifteen of the eighteen never appeared in search at all.

**The hotel retirements were right, but the case is more nuanced than "they earned nothing".**

Twenty-two clicks across eleven pages in 116 days is about 1.3 clicks a week for the whole set. Meanwhile `/heathrow-hotels-pub` alone took 29 clicks and 4,098 impressions over the same period, so the hub already outperformed all eleven pages put together.

The queries tell the real story. The hotel pages' biggest impression earners were not hotel searches at all:

| Query on the retired hotel pages | Impressions | Average position |
|---|---:|---:|
| dog-friendly pubs in heathrow | 39 | 80.9 |
| pubs with beer gardens in heathrow | 37 | 80.7 |
| historic british pub chain heathrow airport | 28 | 71.7 |
| oldest pubs in heathrow airport | 27 | 87.0 |

Those are generic pub-near-Heathrow queries, ranking in the seventies and eighties, which is the signature of AI Mode fan-out rather than real listings. They are the hub's queries, being served by eleven thin pages competing with it. Genuinely hotel-specific searches did rank well (`pubs near radisson blu heathrow` at position 7, `crowne plaza pub` at 7, `places to eat near radisson blu heathrow` at 6) but carried one to five impressions each in four months.

**The honest caveat: the hotel pages were growing, not dying.**

| 28 days ending | Hotel clicks | Hotel impressions | Hub clicks | Hub impressions | Combined clicks |
|---|---:|---:|---:|---:|---:|
| 24 Aug 2026 | 8 | 455 | 17 | 1,490 | **25** |
| 27 Jul 2026 | 6 | 334 | 13 | 1,512 | 19 |
| 29 Jun 2026 | 6 | 265 | 15 | 1,262 | 21 |
| 1 Jun 2026 | 2 | 99 | 10 | 1,095 | 12 |

Impressions roughly quadrupled over four months. Clicks did not follow, which is what you would expect if the growth is fan-out impressions at position 80 rather than real visibility. Still, this was not a set of dead pages, and the review should be read with that in mind.

### What the 28-day review compares against

| Measure | Pre-change, 28 Jul to 24 Aug 2026 |
|---|---:|
| Clicks, retired hotel pages plus destination hubs | **25** |
| Impressions, same | **1,945** |
| Non-cancelled website bookings (management database) | **58** |

After 24 September, the hubs alone should be at or above 25 clicks and 1,945 impressions for the consolidation to have held. The whole set was rising by roughly a quarter per block before the change, so flat is a stall, not a success.

Only the booking number triggers a revert. The search figures are diagnosis.

---

## The revert rule

Decision 6, agreed 26 August 2026, **revised 5 September 2026** once Search Console was found to hold no data before 1 May 2026.

### Why the original rule was replaced

The original rule compared completed bookings from Google against the same 28 days last year. That comparison cannot be made, and even if it could it would never fire:

| Window | Website bookings |
|---|---:|
| 28 Aug to 24 Sep **2025** | 24 |
| 31 Jul to 27 Aug **2026**, the 28 days before deploy | 75 |

Bookings could halve and still clear last year by a wide margin. Three further reasons it fails:

- **The `completed` status barely existed in 2025.** Two of 76 website bookings were ever marked completed, against 206 of 331 in 2026. The metric named in the original rule cannot be counted for the comparison period.
- **The source taxonomy changed.** `website` became `brand_site` in February 2026, with a gap in January 2026 where nothing was recorded at all.
- **Nothing records "from Google".** The database stores the booking channel, not the referrer. GA4 attribution only started working on 27 August 2026, so it has no pre-period either.

### The rule now

> Revert if **non-cancelled website table bookings** created in the 28 days after deploy fall more than **25%** below the 28 days immediately before deploy.

| | |
|---|---:|
| Baseline, 31 Jul to 27 Aug 2026 | **58** |
| Review window, 28 Aug to 24 Sep 2026 | to be measured |
| Revert triggers at | **43 or fewer** |

Non-cancelled means every status except `cancelled`, so confirmed, completed, no_show and visited_waiting_for_review all count. Counted on `created_at`, not `booking_date`, because the question is whether the site kept producing bookings, not when people came in to eat.

```sql
SELECT count(*) AS web_not_cancelled
FROM table_bookings
WHERE source IN ('website', 'website_wizard', 'brand_site')
  AND status::text <> 'cancelled'
  AND created_at >= '2026-08-28' AND created_at < '2026-09-25';
```

**Month-on-month is safe here.** The original objection was that late September is not August. Last year says September ran ahead of August rather than behind it, so a flat month-on-month comparison should over-detect a fall rather than hide one.

**The metric is wider than Google alone**, because it includes direct and social visitors who book on the site. That makes it less sensitive, not biased.

This is read straight from the management database and needs no owner action.

**A git revert is only the code half of a rollback.** It restores the routes; it does not undo what Google has already processed. Reverting after several weeks means the restored pages start from a worse position than they left. Decide inside the 28 days, not after.

---

## What Search Console can and cannot supply

The property holds **no data before 1 May 2026**. That is a hard floor, not a rolling window, so it does not recover with time.

| Question | Answerable? |
|---|---|
| Did the retired URLs earn anything before retirement? | Yes, from 1 May to 24 Aug 2026, about 16 weeks |
| Did the destination hubs absorb it? | Yes, from 28 Aug 2026 onward |
| Year-on-year anything | **No.** Nothing before 1 May 2026 exists |

Search Console is therefore a diagnostic tool for this migration, telling us which pages moved and in which direction. It is not the rollback trigger. The rollback trigger is the booking count above.

## What was retired, 26 August 2026

| Set | Count | Destination |
|---|---:|---|
| `/pub-near-*-heathrow` | 11 | `/heathrow-hotels-pub` |
| Past event pages | 18 | Their category hub (`/quiz-night`, `/cash-bingo`, `/karaoke`, `/whats-on`) |

The event retirements are listed in `RETIRED_THIN_EVENT_SLUGS` in `lib/event-seo-strategy.ts`, with a matching 301 for each in `config/redirects/additional-redirects.json`. A test fails if the two disagree.

## Outstanding owner action

- ~~`public/sitemap-priority.xml` needs removing from the Search Console sitemaps list.~~ **Void, checked 5 September 2026.** The file was deleted from the repository, but it had never been submitted in Search Console, so there was nothing to remove and no fetch error to worry about.
- ~~Export the retired URLs and their destinations from Search Console for 1 May to 24 Aug 2026.~~ **Done 1 September 2026**, analysed above, raw files kept in `docs/evidence/gsc-baseline-2026-09-01/`.
- On or after 27 September 2026: repeat the destination-hub export for 28 Aug to 24 Sep 2026, same regex filter, for the 28-day review.
- Worth one check: if an older Search Console property exists for this site, for example a URL prefix property rather than a domain property, it may hold history from before 1 May 2026. Switch property in the dropdown and look at the earliest date available.
