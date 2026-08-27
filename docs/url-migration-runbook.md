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

- [ ] **Baseline captured.** Clicks, impressions, CTR, position, organic landing sessions, booking starts, completed bookings, and phone or WhatsApp actions, for every URL being retired and for its destination. Without this the review at 28 days has nothing to compare against, and the decision to retire cannot be validated or reversed on evidence.
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

## The revert rule

Decision 6, agreed 26 August 2026:

> Revert if **completed table bookings originating from Google** fall more than **25%** over the 28 days after deploy, measured against **the same 28 days last year**.

Bookings only. Rankings, impressions and sessions are reported but never trigger a revert, because they can all rise while bookings fall.

Twenty-five percent is deliberately a wide band: booking volumes here are small enough that a ten percent swing is weather. Year-on-year rather than month-on-month, because late September is not August.

**A git revert is only the code half of a rollback.** It restores the routes; it does not undo what Google has already processed. Reverting after several weeks means the restored pages start from a worse position than they left. Decide inside the 28 days, not after.

---

## What was retired, 26 August 2026

| Set | Count | Destination |
|---|---:|---|
| `/pub-near-*-heathrow` | 11 | `/heathrow-hotels-pub` |
| Past event pages | 18 | Their category hub (`/quiz-night`, `/cash-bingo`, `/karaoke`, `/whats-on`) |

The event retirements are listed in `RETIRED_THIN_EVENT_SLUGS` in `lib/event-seo-strategy.ts`, with a matching 301 for each in `config/redirects/additional-redirects.json`. A test fails if the two disagree.

## Outstanding owner action

`public/sitemap-priority.xml` was deleted. It is still submitted in Search Console and needs removing there, or it will report as a fetch error indefinitely.
