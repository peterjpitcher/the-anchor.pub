# /christmas-parties: why there is no traffic, and what to do about it

**Date:** 6 September 2026
**Status:** Diagnosis complete. Two fixes implemented 6 September 2026 (A1 the 20 December bug, A4 the SSOT prosecco claim), local only, not committed. Everything else in section 5 is unstarted. Owner decisions are in section 12.
**Data:** four Google Search Console exports supplied by the owner, 5 September 2026.
**Method:** eight independent discovery agents, every candidate finding attacked by three adversarial verifiers on separate lenses (evidence, causality, materiality). 95 candidate findings, 71 survived, 24 killed. The killed findings are listed in section 9 so they are not re-proposed.
**For review by:** a second developer. Section 10 is written for you specifically.

---

## 1. The answer in one paragraph

The page is not broken and its rankings are not the problem. The traffic is missing because **the demand does not exist at the volume the impression counts suggest**, and because **the page turns itself off**. Roughly 63% to 72% of all Christmas impressions are Google AI fan-out, templated `[topic] in [place]` queries that have produced **exactly zero clicks in sixteen months**. Strip those out and real human demand reaching this page is around 200 to 400 impressions per 28 days, not 2,557. Against that, the season needs roughly 87 group bookings to reach a realistic occupancy, and organic search has never delivered more than 46 clicks in a Christmas quarter. Organic cannot fill this season and no amount of SEO work before 20 December will change that. What *can* be fixed, cheaply and now, is a set of self-inflicted defects: the page will declare itself closed on 20 December while the kitchen is still serving, it has spent seven months of every year as a content-free stub, the two highest-converting Christmas URLs the site has ever had were noindexed in March, and the seasonal signpost in the header is invisible on mobile.

---

## 2. Corrections to the working assumptions

These are stated first because several were in the brief this investigation started from, and one of them was reported to the owner on 5 September. A second developer should not carry them forward.

| Assumption | Verdict | Evidence |
|---|---|---|
| "Impressions rose 4x while clicks collapsed from 46 to near zero" | **Wrong.** This compares an on-season quarter (Oct to Dec 2025) with off-season months. No Oct to Dec 2026 data exists yet; the series ends 2026-09-03. | On matched calendar windows clicks went **up**: 7 Aug to 3 Sep, 3 clicks in 2025 vs **5** in 2026. 4 May to 3 Sep, 7 vs **9**. `export_(3)/Chart.csv`. |
| "Desktop ranks 15 positions worse than mobile" | **Wrong.** | `export_(3)/Devices.csv` sums to 4 clicks / 15,565 impressions, identical to `Queries.csv`, not to `Pages.csv` (69 / 20,151). The device tab covers only the non-anonymised subset, which is 94% fan-out. It is a statistic about machine queries. |
| "The 0.25% CTR points at the SERP snippet" | **Wrong.** | Title is 58 characters, 555px at 20px Arial against a ~600px budget. Description is 150 characters. Neither truncates. The same site furniture earns 8.18% CTR on human-shaped "near me" queries. |
| "Commercially important content is hidden behind client JS" | **Wrong.** | Every price, every dish and all 29 FAQ answers are plain text in the 292,287-byte server HTML. The Googlebot-UA response is byte-identical to the iPhone-UA response. |
| "The 19 July consolidation lost more than it gained" | **Wrong.** | Same calendar window year on year: 5 clicks in 2025, 5 in 2026, while weighted position improved from 37.70 to 20.67. The three merged URLs had produced almost nothing. Do not unpick the redirects. |
| "The page has never ranked commercially" | **Wrong, but it does not matter.** | It holds positions 4.66 to 9.72 on six commercial Staines Christmas queries in the last 28 days. Those positions earn zero clicks, which is the actual finding. |
| "The Turnstile change on 16 August could gate content from Googlebot" | **Wrong.** | `bfbf1175` touches only the enquiry route and two form components. The widget gates a submit button, not page rendering. |
| "The August 2025 silent enquiry outage may have regressed" | **No, it is intact.** | Retries, idempotency key, fail-closed 500 and the ACTION NEEDED fallback email are all present on `main`, and the 29 tests in `tests/api/christmas-enquiry.test.ts` pass. |
| "GA4 (not set) session_id defect" | **Fixed.** | `lib/tracking/ga4-identity.ts` reads both GA4 cookies; `dispatcher.ts:244-251` attaches them; `app/api/analytics/route.ts:168` sets `session_id`. |
| "AI fan-out is ~93% of impressions" (12 Aug diagnosis) | **Directionally right, the number was loose.** | The defensible measure is the ` in ` template: 123 of 323 queries, 7,642 of 12,147 impressions (**62.9%**), **0 clicks in 16 months**. A head-term-plus-place test gives 72% over 16 months and 88% over 28 days. The 93% figure counted in-catchment commercial terms as machine. |

---

## 3. Root causes, ranked by how much of the problem each explains

### Cause 1: Most of the "traffic" was never people. Explains roughly 60% to 70% of the apparent problem.

Templated `[topic] in [place]` queries account for 7,642 of 12,147 impressions over 16 months and produced **zero clicks**. Not "roughly zero": exactly zero, with no exceptions. The place list includes London micro-districts (Portsoken, Gospel Oak, Lisson Grove, Clerkenwell, Fitzrovia, Belgravia) and Surrey villages 30 or more miles away (Elstead, Hindhead, Banstead, Woodstock, Burley). None of these place names appears anywhere in the codebase; `lib/christmas-parties-schema.ts:104-115` declares a ten-entry local `areaServed` list covering Stanwell Moor to Heathrow. The expansion is Google-side.

Three independent proofs this is not a page defect:
- **Wrong seasonality.** July 2026 alone is 32.5% of the entire 16-month impression total. Nobody books a Christmas party in July.
- **Position does not help.** 17 queries ranking at average position 10 or better over the last 28 days produced **689 impressions and 0 clicks**. 99.3% of those impressions come from 13 template queries. `christmas party in staines` sits at position 4.66 with 96 impressions and zero clicks. A genuine SERP does not behave like that.
- **The clean segment behaves normally.** Human-shaped "near me" queries earn 8.18% CTR from the same site furniture.

**Consequence:** every blended CTR, average position and impression count on this page is a measurement artefact. Reporting must be rebuilt before any optimisation is judged.

### Cause 2: The prize is small and organic cannot reach it. Explains why the remaining ~30% will not be solved by SEO.

The season runs 10 November to 20 December 2026 inclusive: **41 days, of which 36 are bookable** (5 Mondays removed, kitchen closed). That is 18 Tuesday-to-Thursday dates, 12 Friday and Saturday dates, and 6 Sundays. At the SSOT's 60 seated covers the theoretical ceiling is 2,160 covers.

A realistic occupancy scenario (Fri/Sat 80%, Tue-Thu 30%, Sun 40%) is roughly **870 covers**, about **87 bookings** at an average party of 10. At a 3% visit-to-booking rate that needs about 2,900 visits to the page; at 1% it needs 8,700. Both the occupancy split and the party size are assumptions made for this document, not owner-supplied figures.

Organic has delivered **40 clicks in 16 months** to this page and **46 clicks in its best-ever Christmas quarter** across all Christmas URLs. At a generous 3% close rate that is 1.4 bookings. At an implausible 10% it is 4.6.

**Organic's entire realistic contribution to Christmas 2026 is 1 to 5 bookings, about 2% to 6% of the season.**

The honest ceiling if every genuinely human query moved to position 3 is roughly 55 to 68 extra clicks per month during the four-month season and near zero outside it: about **220 incremental clicks a year** (Sistrix 2020 CTR curve). That does not justify a content programme.

### Cause 3: The page turns itself off, twice over. Explains the ranking decay, and is fully fixable.

Two mechanisms, both deliberate, both costing more than they save.

**3a. The page will declare itself closed on its own last trading day.** Verified in code:
- `lib/christmas-season.ts:155-158` computes `CHRISTMAS_LAST_BOOKABLE_DATE` as 2026-12-20 minus 1 day = **2026-12-19**.
- `isChristmasBookingOpen()` (line 186-188) therefore returns false from 2026-12-20.
- `app/christmas-parties/page.tsx:336` and `client-components.tsx:583` both compute `seasonEnded = season.state === 'ended' || !season.isBookable`.
- On 2026-12-20 `state` is still `'active'` but `isBookable` is false, so `seasonEnded` is true and `client-components.tsx:659-661` renders `ChristmasSeasonEndedView` instead of the page.

`SSOT.json` `christmas_2026.service_window.note` reads: "The 20th is inclusive. A 20 December sitting is bookable." The page will tell organisers the offer has finished while the kitchen is serving it. `page.tsx:348` also drops the Menu JSON-LD and `generateMetadata` swaps the title and description.

The root error is that one flag carries two different ideas: "you can no longer place a *new* booking with 24 hours notice" and "this page has nothing to say".

**3b. The URL is a stub for seven months a year.** After 20 December the page stays `ChristmasSeasonEndedView` until a human edits `SSOT.json` for 2027. Weighted average position by month from `export_(3)/Chart.csv`:

| | Oct 25 | Nov 25 | Dec 25 | Jan 26 | Apr 26 | Jul 26 | Sep 26 |
|---|---|---|---|---|---|---|---|
| Position | **9.34** | **9.42** | 13.13 | 35.01 | 44.03 | 22.37 | 17.97 |
| Clicks | 19 | 15 | 12 | 0 | 0 | 0 | 0 |

The estate has **proved it can rank at 9.3**. It loses about 25 positions each January and spends eight months clawing back to 18 to 24, which is where it sits nine weeks before the window opens. Thirteen positions of already-earned ranking are thrown away and re-earned annually, and the months spent as a stub are exactly the months Google uses to decide what the URL is about.

Compounding this, `app/page.tsx:40,208`, `app/food-menu/page.tsx:43,245`, `app/beer-garden/page.tsx:35,62` and `components/features/christmas/ChristmasCrossLink.tsx:15,38` all gate their contextual links on a 120-day lead window, so for seven months the hub has only navigation and footer links.

### Cause 4: The URLs that actually converted were switched off. Explains a real, recoverable loss.

`export_(3)/Pages.csv`, 16 months:

| URL | Clicks | Impressions | CTR | Position | Status today |
|---|---|---|---|---|---|
| `/christmas-parties` | 40 | 15,718 | 0.25% | 25.98 | indexed |
| `/blog/christmas-events` | 12 | 1,648 | **0.73%** | 18.04 | **noindex, not in sitemap** |
| `/blog/christmas-market` | 4 | 439 | **0.91%** | 15.60 | **noindex, not in sitemap** |
| `/blog/tag/christmas` | 4 | 85 | **4.71%** | 20.34 | 301 into a noindexed tag page |
| `/blog/tag/christmas-market` | 2 | 33 | **6.06%** | 10.39 | 308 to a generic tag index |

Verified live on 6 September 2026: both blog posts return HTTP 200 with `<meta name="robots" content="noindex, follow">`, and the live `sitemap.xml` (200 URLs) contains neither. The cause is `content/blog/christmas-events/index.md:29` and `content/blog/christmas-market/index.md:29`, both `noindex: true`, added in commit `a14c8d34` (2026-03-20, "noindex 22 dead-weight blog posts").

**The four highest-CTR Christmas URLs the site has ever had were classified as dead weight and switched off six months before the season they earn in.** Between them they carried 22 of the 69 Christmas clicks at three to twenty-four times the hub's CTR. Nothing replaced them: the four posts published on 10 August 2026 have produced **693 impressions and zero clicks**.

`/blog/tag/christmas` 301s into `/blog/tag/seasonal`, which itself serves `noindex, follow`. A permanent redirect into a noindexed destination discards the signal rather than consolidating it.

Note before acting: `/blog/christmas-events` currently describes the 2025 festive schedule, so reinstating it is a content rewrite against `docs/SSOT.md`, not a one-line frontmatter change.

### Cause 5: The one prominent seasonal signpost is invisible to most of the audience. Small but free to fix.

`components/layout/Navigation.tsx:432` wraps the header promo strip in `hidden border-b border-line bg-[var(--header-strip-surface)] lg:block`, so it is `display: none` below 1024px. It is also rendered from a `useEffect` (line 155-180), so it is absent from the server HTML entirely and contributes nothing to the crawlable link graph. `lib/header-promos.ts:66-69` schedules it with `leadDays: 101`, from 1 August 2026.

The single most prominent sitewide link to the season's most commercial page reaches neither mobile visitors nor crawlers.

---

## 4. Defects worth fixing regardless of the traffic question

These are correctness and accuracy problems found during discovery. Several are customer-facing. Items marked *needs a business rule* are blocked on a rule the owner holds; those rules have been put to the owner in chat and are not restated here.

| # | Defect | Evidence | Severity |
|---|---|---|---|
| D1 | **SSOT self-contradiction on prosecco.** `SSOT.json:1262` and `:811` say prosecco is included "on all three Christmas tiers". `docs/SSOT.md:272` says **2 and 3 course only**, and records that the wrong version already reached the live page and two marketing emails. `docs/SSOT.md` is canonical, so `SSOT.json` is the file that is wrong. | verified in repo | High |
| D2 | **The ads pack repeats the retracted claim and the wrong end date.** `christmas-ads-campaign-pack.md:132` advertises "prosecco included" unqualified. Lines 31 and 162 state "last bookable date is 19 Dec" against the SSOT's 20 December inclusive. Line 83 promises "Choose your courses online and book in minutes", which the site cannot do. | verified in repo | High |
| D3 | **No Christmas booking can be completed on the site.** The hero button labelled "Book lunch or dinner" (`christmas-hero-ctas.tsx:63-71`) dispatches a CustomEvent that opens an enquiry drawer posting to `/api/enquiry/christmas` (`client-components.tsx:1946`). It is a lead form, not a booking. | verified in repo | High |
| D4 | **Menu JSON-LD publishes a £25 price ceiling.** The served `Menu` block prices only the 1-course tiers (£23/£24/£25 adult, £18/£19/£20 child) plus a £7.95 extra course. The visible page advertises 2 course from £33.95 and 3 course from £36.95. Machine readers get a wrong maximum. | verified in served HTML | Medium |
| D5 | **No scroll-depth tracking on the site's longest page.** `ScrollDepthTracker` is mounted on eight lower-value pages (`/drinks:151`, `/food-menu:300`, `/karaoke:169`, `/quiz-night:163`, `/whats-on:117`, blog, cash-bingo, music-bingo) and on neither Christmas file. | verified, grep returns 0 | Medium |
| D6 | **Primary styling points at the unmeasurable paths.** `christmas-hero-ctas.tsx:33,57` set `variant="outline"` on the two trackable enquiry buttons and `:88,108` set `variant="primary"` on the `tel:` and `mailto:` anchors. The design pushes traffic into the two channels that cannot be attributed. | verified in repo | Medium |
| D7 | **The 21 to 29 guest gap.** `SSOT.json` sets the buffet minimum at 30 "no exceptions" and routes "more than 20 guests" to private hire. `client-components.tsx:2192-2194` tells that enquirer to phone. The commonest office-party size has no self-service route. *Needs a business rule.* | verified in repo | Medium |
| D8 | **Drinks-only party has no price anywhere.** `client-components.tsx:328-331` offers it as one of three styles; the live page states no price, package or minimum spend for it. No figure has been invented here. *Needs a business rule.* | verified in served HTML | Medium |
| D9 | **Consent-gated tracking with no ground truth.** `lib/tracking/dispatcher.ts:164-166` suppresses the dataLayer push when analytics consent is absent, and `lib/cookies.ts:86-90` defaults to off. Nothing counts how many visitors that is. On a season measured in tens of enquiries this is the difference between "working" and "broken". | verified in repo | Medium |
| D10 | **GTM container has no Christmas triggers.** The live container `GTM-WWFQTQS` fires GA4 tags on exactly three triggers (`gtm.init`, `gtm.js`, `purchase`). No Christmas dataLayer event reaches GA4 through GTM; only the Measurement Protocol path works. | fetched and parsed | Medium |
| D11 | **Turnstile can silently disable the submit button.** Both Christmas forms disable submit until a token is minted and nothing records when that fails, so a blocked organiser is invisible. Failed submissions also fire no analytics event, so a broken path looks identical to no demand. | verified in repo | Medium |
| D12 | **Sitemap `lastmod` is a hand-typed constant** (`2026-08-15`) on a page that revalidates hourly from live menu data. | `app/sitemap.ts:250` | Low |
| D13 | **Brand rule violation in schema.** The `Organization` `alternateName` list contains "The Anchor Pub" forms, against the "never The Anchor Pub" rule. Document declares `lang="en"` while all JSON-LD declares `en-GB`. | verified in served HTML | Low |
| D14 | **Page is 30,093 CSS pixels tall at 375px**, 37 screens. Prices are 5.4 screens down, FAQs 28.6 screens down. 5,694 words, 18 H2s, 69 H3s. Only social proof is three Google reviews 18.5 screens down, two of them from December 2022 and December 2023. | measured in browser | Low for SEO, real for conversion |
| D15 | **25% of the HTML is duplicated RSC payload.** 74,063 of 292,287 bytes are inline `self.__next_f.push(...)` repeating props already rendered as HTML, because the whole body sits in one 2,682-line `'use client'` component. The Meta pixel is 187,472 of 460,023 encoded script bytes (40.7%). | measured | Low for SEO, real for speed |

**Not defects, confirmed clean:** robots, canonical, Googlebot parity, all eleven consolidation redirects (single 301, destination equals the rule's target, every destination 200), the enquiry retry and fallback path, the Turnstile split-brain (now single-source), and the GA4 `session_id` fix.

---

## 5. What to do: this season (now to 20 December 2026)

Ordered by expected effect divided by effort. Nothing here has been implemented.

### Developer work, this week

| # | Action | Why | Effort | Files | Acceptance |
|---|---|---|---|---|---|
| A1 | **Split `seasonEnded` into two flags.** Keep the full offer, menu, prices and Menu JSON-LD rendered through the last service date (20 Dec inclusive); swap only the enquiry CTA when new bookings can no longer be taken. | Stops the page declaring itself closed on its own last trading day. | S | `lib/christmas-season.ts`, `app/christmas-parties/page.tsx:336,348`, `client-components.tsx:583,659` | Unit test asserting that on 2026-12-20 the full page renders with Menu JSON-LD present and the CTA reads as closed-for-new-bookings. Both TZ suites green. |
| A2 | **Give the page an evergreen off-season body.** Replace `ChristmasSeasonEndedView` with a substantive page (what the offer is, the venue, capacity, parking, last season's dates as history) rather than a two-paragraph closure notice. | Stops the annual 25-position reset. This is the single highest-value SEO action available, and it pays out in 2027. | M | `client-components.tsx:1523` | Fetch with a mocked date of 15 March 2027 returns a page with an H1, the venue detail and at least one internal link, not a stub. |
| A3 | **Render the header promo server-side and show it on mobile.** | The only prominent sitewide seasonal signpost currently reaches neither mobile users nor crawlers. | S | `components/layout/Navigation.tsx:432,155-180` | Promo link present in `curl` output and visible at 375px in a browser screenshot. |
| A4 | **Fix `SSOT.json` prosecco to match `docs/SSOT.md:272`** (2 and 3 course only), and extend `tests/ssot-drift-guard.test.ts` to cover tier inclusions. | A retracted claim is live in the structured source of truth and has already reached customers once. | XS | `SSOT.json:811,1262`, `tests/ssot-drift-guard.test.ts` | `npx jest tests/ssot-drift-guard.test.ts` fails before the fix and passes after. |
| A5 | **Correct the ads pack** before it is launched: both "19 Dec" references to 20 Dec, pause date to 14 December, rewrite RSA description 3 to "2 and 3 courses include a glass of prosecco, swappable for orange juice", and remove "book in minutes" since no online booking exists. | Prevents publishing a false claim and burning budget on a promise the site cannot keep. | XS | `tasks/seo-powerhouse/2026-08-12-christmas-parties/christmas-ads-campaign-pack.md` | Grep returns zero "19 Dec" and zero unqualified "prosecco included". |
| A6 | **Relabel the "Book lunch or dinner" CTA** to "Send a Christmas dinner enquiry". Copy change only; wiring it to the real `/book-table` flow is a larger piece and is not proposed here. | The button promises something the site cannot deliver. | XS | `christmas-hero-ctas.tsx:63-71` | Live label matches the behaviour. |
| A7 | **Mount `ScrollDepthTracker`** on `/christmas-parties`, matching the eight existing pages. | Without it there is no way to tell whether visitors reach the price table 5.4 screens down. | XS | `app/christmas-parties/page.tsx` | Event visible in the dataLayer on scroll. |
| A8 | **Swap CTA variants**: enquiry buttons to `primary`, `tel:`/`mailto:` to `secondary` or equal weight. | The design currently steers traffic into the two channels that cannot be attributed. | XS | `christmas-hero-ctas.tsx:33,57,88,108` | Screenshot at 375px showing the enquiry CTA as the visually dominant control. |
| A9 | **Record a server-side count of enquiry submissions** independent of consent, and fire an analytics event on submission *failure* as well as success. | A count is not personal data and needs no consent. Today a broken enquiry path is indistinguishable from no demand, which is exactly how the August 2025 outage stayed hidden for sixteen days. | S | `app/api/enquiry/christmas/route.ts`, `client-components.tsx` | Submit a failing request in a test and assert both the server count and the failure event. |
| A10 | **Repoint `/blog/tag/christmas`** at `/christmas-parties` rather than at the noindexed `/blog/tag/seasonal`. Same for `/blog/tag/festive-menu`. | A 301 into a noindexed page discards the signal instead of consolidating it. | XS | `config/redirects/tag-redirects.json:107-111` | `curl -I` shows 301 to an indexable 200. |
| A11 | **Add the 2 and 3 course price points to the Menu JSON-LD** from live management data, or an `AggregateOffer` with `lowPrice` 23.00 and `highPrice` 36.95 GBP. Never hardcode. | Machine readers currently see a £25 ceiling against a £36.95 reality. | S | `lib/christmas-parties-schema.ts` | Rich Results Test passes and the served block contains 36.95. |

**Deliberately not proposed:** unpicking any consolidation redirect, rewriting the title or meta description, adding an Event entity, or building new Christmas pages. Section 8 explains why.

### Owner work, this week (higher expected value than everything above combined)

1. **Launch the corrected ads pack.** Its own pacing table says 1 September to 31 October is where the money works, and that window opened a week ago. Break-even is trivially low against the SSOT prices.
2. **Publish a Google Business Profile Christmas post and offer.** The homepage took 9 of 13 Christmas query-dimension clicks at 11.39% CTR; the local surfaces are where Christmas intent actually lands.
3. **Send the Christmas email and SMS to the owned list.** Roughly 225 email-eligible and 466 SMS-reachable past guests. This is the only channel with reach in the hundreds.
4. **Collect Christmas reviews this season.** The approved review set contains two Christmas reviews, the most recent from December 2023. Nothing has been collected in two seasons.

---

## 6. What to do: Christmas 2027 (start in January, not August)

1. **A2 above is the whole strategy.** Keep `/christmas-parties` substantive all year on a permanent URL. Never year-stamp it. The estate has demonstrated position 9.3; the only reason it does not hold it is that the page goes dark.
2. **Keep at least one evergreen contextual internal link** from the homepage and `/private-hire` year round, worded for the off-season ("Christmas at The Anchor", not "book now"). Remove the 120-day gate from the link, not from the CTA.
3. **Settle the informational cluster once.** Today Google prefers `/blog/work-christmas-party-ideas-near-heathrow` over the hub by 3.7 positions and neither converts. The recommendation is to let the post own work-Christmas intent with an enquiry form embedded in it, and cut the hub's work-party H2 block back to a pointer.
4. **Judge the 2026 season on 1 October to 20 December against the same 2025 window**, on the non-template query segment only. Do not judge it on pre-season data or blended totals.

---

## 7. Measurement: rebuild it before optimising anything

**Baseline today (6 September 2026), stated so the second developer can check the claim later:**
- `/christmas-parties`, last 28 days: 3 clicks, 1,786 impressions, position 22.62.
- Non-template human impressions, last 28 days: roughly 192 to 258, depending on the strictness of the test.
- Christmas 2025 season (Oct to Dec), all Christmas URLs: 46 clicks at 1.185% CTR, weighted position 11.05.

**Reporting changes required:**
- Segment every Christmas report on "query does not contain ` in `". Report the machine class separately as noise, never blended.
- Stop citing the Devices and Countries tabs from query-dimension exports. Pull device splits with device as the primary dimension and no query filter.
- Filter by Search Appearance for AI Mode over the coming weeks to confirm the fan-out reading directly.

**Success measure for the 2026 season is enquiries and covers, not clicks or CTR.** The 87-booking figure used in section 3 is an assumption made for this document; scoring the season needs the owner's own target, which has been requested in chat.

---

## 8. Do not do these

| Tempting action | Why not |
|---|---|
| Rewrite the title or meta description | Neither truncates and the same snippet earns 8.18% on human queries. Zero expected effect. One cheap exception if wanted: "Pub" is absent from the title while 53 queries containing "pub" carry 2,260 impressions including the largest human-shaped query. Swapping "Venue" for "Pub" costs no pixel budget. |
| Unpick the July or August consolidation redirects | All eleven verified clean and position improved 17 places after the July one. Signal transfer takes months. |
| Build new Christmas pages to chase the impression base | 63% to 72% of that base structurally cannot click. You would be building for a robot. |
| Chase `christmas party venues heathrow`, Surrey terms or the London micro-district terms | Five directories and four hotel brands hold the nine slots above The Anchor on the Heathrow term. Not winnable organically at any horizon on this link profile. |
| Add an Event entity to the structured data | It would be wrong, not a missed opportunity. There is no single Christmas event. |
| Rely on the FAQPage entity for a rich result | Google restricted FAQ rich results to authoritative government and health sites in 2023. The 10,666-byte entity is valid and will not render. |
| Add year-stamped URLs (`/christmas-parties-2027`) | Restarts authority from zero by design. The exact opposite of the fix in A2. |
| Commission a content programme against this page | The honest ceiling is about 220 incremental clicks a year concentrated in four months. |
| Treat the 2,706-impression July spike as a problem | Diagnosed in July as a re-evaluation burst. It is fan-out volume. |

---

## 9. Findings killed in adversarial review

Listed so they are not resurrected without new evidence. Each was refuted by two or three independent verifiers.

- "The Anchor already ranks top-3 organic and appears in the local pack on pub-shaped Christmas queries" (3 refutes). **All live-SERP position claims in this investigation are unverified.** The SERP lens could not be corroborated and its findings were largely killed. Treat any assertion about live rankings as untested.
- "The Anchor is excluded from the local pack and can never enter it" (2 refutes). Also unverified, and it contradicts the item above.
- "Google's AI Overview names The Anchor first using content from a 301'd URL" (3 refutes).
- "A third of Christmas clicks came from Christmas Day queries" (2 refutes, 3 noise).
- "The mobile lightbox at 35 seconds triggers intrusive-interstitial treatment" (author self-refuted on the data).
- "Zero Christmas bookings have been taken" (3 refutes, 3 noise). Availability read-outs do not prove this; private hire is a separate system.
- "GA4 Measurement Protocol silently no-ops because the env vars were never set" (3 refutes, 2 noise). Unproven either way from inside the repo; only the Vercel dashboard settles it.
- "The 21 July rebuild removed numbers from the meta description at the moment CTR fell" (3 refutes, 3 noise).
- "The hero image on /blog/christmas-events is a 404" (3 refutes, 3 noise).
- "The word 'xmas' being absent is a cause" (2 noise). Almost all xmas volume is templated fan-out. It is a copy gap, not a cause.

One live claim checked directly and downgraded: the "two live blog posts publish contradictory Christmas Day hours" finding is real in content terms, but both carrying pages (`/blog/christmas-2021`, `/blog/christmas-events`) are `noindex`, so the exposure is low unless they are re-indexed. If Cause 4 is actioned, fix the hours copy first.

---

## 10. For the second developer: the strongest arguments against this diagnosis

Attack these first. They are stated as fairly as possible, not as straw men.

1. **The fan-out classification is the load-bearing claim and it is contestable.** One verifier demonstrated that the original 93% figure double-counted in-catchment commercial terms (`christmas party in staines`, `christmas party pub staines`) as machine-generated. The defensible floor is 44.7%; the ` in ` token test gives 62.9%; the head-plus-place test gives 72%. **If the true machine share is nearer 45% than 70%, real demand is roughly double what this document assumes, and the "organic cannot fill the season" conclusion weakens.** The cleanest way to settle it is GSC's Search Appearance filter for AI Mode over the next few weeks. Until then, treat the range, not a point estimate.

2. **The click-attribution sample is tiny and mostly invisible.** GSC's query dimension shows 4 of the 69 clicks on Christmas pages. The other 65 sit below the anonymisation threshold, on 4,586 impressions at 1.417% CTR, which is **55 times** the visible segment's rate. Every conclusion drawn from `Queries.csv` is drawn from a sample missing 94% of the clicks. The genuinely productive traffic is the traffic we cannot see.

3. **"Organic cannot fill the season" rests on an occupancy target nobody has set.** The 87-booking figure comes from an assumed 80/30/40 occupancy split and an assumed average party of 10. On a real target of 20 bookings, organic's 1 to 5 becomes a materially larger share and the recommendation to deprioritise SEO looks wrong.

4. **Cause 3 explains the off-season decay but not the on-season silence.** The page went dark in January and lost 25 positions, which is well evidenced. But it was live and substantive through August and September 2026 and still earned only 5 clicks in 28 days. The stub mechanism cannot be the whole story for the current period.

5. **Cause 4 may be self-cancelling.** The two noindexed posts earned their clicks in the 2025 season on 2025 content. Reinstating them means rewriting them for 2026 against the SSOT, which is real content work, and their historical CTR may not survive the rewrite. It also reverses a shipped SEO decision (`a14c8d34`) whose provenance is unclear from the commit alone.

6. **Position 4.66 with zero clicks has an alternative explanation.** This document reads it as proof of AI fan-out. It could also be a genuine SERP where a local pack, an AI Overview and paid slots push the first organic result below the fold. That would make it a SERP-features problem, not a synthetic-query problem, with a different remedy. The two could not be distinguished from GSC exports alone.

7. **Nothing here was verified against the management app.** How many Christmas 2026 enquiries and bookings have actually arrived is the ground truth, and it lives in AMS, not this repo. Without it, "the page does not convert" and "the page gets no visitors" are indistinguishable.

---

## 11. Provenance

Every claim in sections 3, 4 and 5 was verified directly against the repository at `main`, against the live site on 6 September 2026, or against the supplied CSVs, after the agent findings were produced. Claims that could not be verified are marked as such in sections 9 and 10. The four GSC filters are 16-month and 28-day cuts of "query contains christmas" and "page contains christmas". The owner described two of them as three months; they are 28 days, 7 August to 3 September 2026.

---

## 12. Owner decisions, 6 September 2026

Recorded as made. These supersede the assumptions used above where they conflict.

| Ref | Decision |
|---|---|
| Christmas Day | **Open for drinks only, 12pm to 3pm. No food.** The site is currently silent on this. It is a new SSOT fact and needs adding to `docs/SSOT.md` and `SSOT.json`, then to the page. |
| 21 to 29 seated guests | **Handled as a private booking**, because the no-show exposure at that size is too large to take as a table booking. The current routing is therefore correct; only the wording needs to explain it as a service rather than a refusal. |
| Drinks-only Christmas party | **No minimum spend.** Arranged as a private booking so the pub can confirm no other services are needed. The form option stays; the page must state this. |
| Minimum party size | **Drops from 6 to 4 on Tuesday to Thursday.** Friday and Saturday stay at 6. This is an offer change spanning the SSOT, the page copy, the enquiry form validation and the booking rules in the management app. |
| `/blog/christmas-events` and `/blog/christmas-market` | **Bring both back into the index**, after rewriting them to 2026 facts from `docs/SSOT.md`. |
| Ads pack | **Not launched.** Corrections in A5 must land before it goes live. |
| GA4 env vars | **Set in Vercel production.** The Measurement Protocol path is live, so the finding in section 4 (D10) is about GTM only. |

### Season target, set 6 September 2026

The owner asked for a target to be set. This is it, and it is a planning figure open to challenge, not a forecast.

**700 covers, roughly 88 bookings, roughly £23,000 of food revenue**, against a theoretical ceiling of 2,160 covers.

Built as: Friday and Saturday (12 dates) at 60% of 60 seated = 432 covers; Tuesday to Thursday (18 dates) at 10 covers a night = 180; Sunday (6 dates) at 15 = 90. Bookings assume an average party of 8. Food revenue assumes a blended £33 a head across the 1, 2 and 3 course tiers in `docs/SSOT.md`, and excludes drinks.

**Priority order:** fill the 12 Friday and Saturday dates first, they are 62% of the target. The 18 midweek dates are what the drop to a 4-guest minimum is for.

**Weekly checkpoint from 15 September:** covers booked, split by day type. If Friday and Saturday are not at 50% by 1 November, the remaining budget should go to paid rather than to anything on this page.

### What this unblocks, as a separate changeset

Not started, and not covered by the two fixes shipped on 6 September:
1. Christmas Day drinks hours into the SSOT and onto the page.
2. Minimum party size 4 on Tuesday to Thursday, across both repositories.
3. Drinks-only and 21-to-29-guest wording on the page.
4. Rewrite and re-index the two blog posts.
