# Authority & Off-Page Analysis — The Anchor (www.the-anchor.pub)

**Agent:** Authority Specialist · **Date:** 7 July 2026 · **Mode:** Full Overhaul, without-data track
**Companion file:** `backlink-analysis.md` (verified citation/link inventory + sameAs verification detail)

---

## Data Access Statement

- **No backlink export exists this run.** No Ahrefs/Semrush/Moz data, no `backlinks.csv` in `evidence/`. Per the no-invented-data rule I report **no** DR/DA/AS figures, no backlink counts, no referring-domain counts. All authority reads below are **directional**, from web-visible signals gathered on 7 July 2026 via web search and direct page fetches.
- No GSC, GA4, or CrUX data (confirmed in `inputs/input-summary.md` and `evidence/cwv-data-access.md`).
- Google Business Profile could not be audited from the inside (no GBP access in this session); posture is read from public web signals only.
- Every claim below cites its source and fetch/search date. Anything from a search-result snippet is labelled `inferred`.

**Scope boundary:** AI-citation / answer-engine work is not authored here — routed to the content/technical agents and the `ai-seo` handoff.

---

## Current Authority Position

**Directional read (no tool data):** The Anchor's off-page position is that of a well-cited but under-linked local business. Core citations exist and are broadly consistent (CAMRA/WhatPub, Pubs Galore, TripAdvisor, OpenTable, Yelp, FSA, Barrel & Stone supplier page — see inventory in `backlink-analysis.md`). What is missing is exactly the layer that would defend and grow its two strongest commercial positions:

1. **Plane-spotting (the moat):** The Anchor's own pages dominate the plane-spotting-near-Heathrow content space (its blog/landing pages fill the visible results for those queries — WebSearch, 7 Jul 2026), but the third-party ecosystem barely knows it exists. Verified by direct fetch on 7 Jul 2026: **SpottersWiki's London Heathrow page — zero mentions**; **FlyerTalk's "Beer Gardens for Plane Spotting Around Heathrow" thread — zero mentions**; Wikipedia's Myrtle Avenue article — zero mentions; Heathrow.com spectator pages — zero mentions. The site is winning on content while earning almost none of the community citations the content deserves.
2. **Sunday roast / food (commercial priority #1):** absent from the niche directories that exist for exactly this — `bestsundayroast.co.uk/middlesex/staines` contains zero Anchor mentions (direct fetch, 7 Jul 2026). barguide.london's "best pubs near Heathrow Terminal 5" page lists Three Magpies but not The Anchor (direct fetch, 7 Jul 2026 — the only "Anchor" string on the page is an ad-config variable).

**Reputation signals are good where they exist:** Google rating 4.6 (SSOT §12; a 7 Jul 2026 search snippet showed 4.6 from 238 reviews — treat the count as inferred, do not hardcode it anywhere per SSOT). FSA listing verified live and correct (direct fetch: "The Anchor Public House, Horton Road, Stanwell Moor, Staines-upon-Thames TW19 6AQ", inspected 29 October 2025).

**One live misinformation problem:** the inapub.co.uk listing (verified live, 7 Jul 2026) titles the pub as "serving food with Sky TV" and mentions Sky TV/Sky Sports five times. That is a banned claim (SSOT §14 — no Sky/TNT since Jan 2025) sitting on a third-party page that ranks for brand queries, and the listing has no website link.

---

## sameAs Verification (June open item — CLOSED)

The June 2026 open item "verify the sameAs URLs on the live homepage schema are real and owned" is resolved. The live homepage JSON-LD (evidence/schema.json, crawled 7 Jul 2026) carries six sameAs URLs in both the Organization and Restaurant/BarOrPub blocks. All six correspond to the real business:

| sameAs URL | Verification (7 Jul 2026) | Verdict |
|---|---|---|
| facebook.com/theanchorpubsm/ | Direct fetch 400 (bot-blocked); page confirmed live via search: "The Anchor - Heathrow Pub & Dining" | Real, owned (inferred) |
| instagram.com/theanchor.pub/ | Direct fetch 200, profile content references the pub | Real, owned (Known) |
| google.com/maps?cid=17928230944823812473 | Fetch 200 (consent shell — cid unverifiable by bot); GBP existence corroborated by public 4.6-rating snippets | Real (inferred) |
| tripadvisor.co.uk/…-d9717898-…The_Anchor-Staines… | Direct fetch 403 (bot-blocked); listing confirmed live via search ("THE ANCHOR, Staines - 2026 Reviews") | Real (inferred) |
| opentable.co.uk/r/the-anchor-stanwell-moor | Direct fetch 403 (bot wall); same slug live on opentable.com per search | Real (inferred) |
| ratings.food.gov.uk/business/1110171/… | Direct fetch 200 — correct business, correct address | Real (Known) |

No fake, dead, or wrong-business sameAs URLs. No action needed beyond leaving them as they are.

---

## Backlink Profile Summary (directional — no tool data)

| Signal | The Anchor | Three Magpies (closest "nearest pub to Heathrow" competitor) | The Swan / Staines town pubs |
|---|---|---|---|
| Own domain | the-anchor.pub, deep content ecosystem (240 pages crawled) | three-magpies-pub.co.uk + Greene King managed brand page (greeneking.co.uk/pubs/middlesex/three-magpies) | Mixed; mostly brand-page or booking-platform presence |
| TripAdvisor | Listing live (count not verifiable this run) | 4.1, ~2,039 reviews, "#10 of 428 in Hounslow" (search snippet, Apr 2026 — third-party estimate) | Present |
| Google rating | 4.6 (SSOT; snippet corroborates) | not captured | not captured |
| Citations (CAMRA, Pubs Galore, FSA, Yelp, etc.) | Present, mostly consistent | Present | Present |
| Plane-spotting community citations | **None found** (SpottersWiki, FlyerTalk, Wikipedia, Heathrow.com all zero) | None found either | n/a |
| Local press | None found for the pub itself; SurreyLive actively covers Stanwell Moor (Heathrow expansion stories) | Occasional travel-press mentions | n/a |

**Read:** the visible authority gap vs Three Magpies is review volume and dual-domain presence (own site + Greene King managed-brand page), not citations. The Anchor's counterweight is a far stronger owned-content ecosystem and a better headline rating. Nobody — including competitors — has claimed the plane-spotting citation space. It is open, and The Anchor has the only genuine linkable asset for it.

## Authority Gap Analysis

| Keyword/topic area | Site position (directional) | Competitor position | Gap | Closable? | Priority |
|---|---|---|---|---|---|
| Plane spotting Heathrow | Own content dominates visible results; zero third-party citations | Nobody owns the citation layer | Citation layer unclaimed | Yes — asset already exists | **1** |
| Sunday roast near Heathrow/Staines | Own blog ranks; absent from roast/pub directories | Town-centre pubs in TripAdvisor category pages | Directory + review volume | Yes — submissions + review flow | **2** |
| Pub near Heathrow / layover | Own pages strong; travel-guide ecosystem (sleepinginairports, qeepl, ukride, aph, railair) does not cite the pub | Three Magpies gets the "nearest pub" framing in TripAdvisor forums | Editorial citations | Partially — outreach with layover asset | **3** |
| Private hire near Heathrow | No third-party presence found | Hotels dominate | Large but low-competition for pub-scale events | Slowly — community/press led | 4 |

---

## Link Profile Health

- **No red flags found.** No evidence of spam links, link schemes, or over-optimised anchors (caveat: without a backlink export this is a shallow read — `Data status: unavailable` for anchor-text distribution).
- **Positive:** supplier link already won — Barrel & Stone (pizza supplier) profile page links to the-anchor.pub (direct fetch, 7 Jul 2026). CAMRA (camra.org.uk) and Pubs Galore listings link to the site with correct phone.
- **Hygiene notes:** WhatPub listing links to the site but no phone in standard format was detectable (inferred — page is JS-heavy); inapub has correct phone but **no website link**; Yelp lists the pub under "Staines-upon-Thames" (their geo taxonomy, not fixable); one Facebook post geo-labels the pub "Slough" (search snippet). Core NAP (Horton Road, TW19 6AQ, 01753 682707) is consistent everywhere it appears. Full table in `backlink-analysis.md`.
- **Stale SERP artefact:** greenekingpubs.co.uk/anchor-stanwell-moor ("Pub to Let | Anchor (Stanwell Moor)") still surfaces in brand-adjacent searches but the page itself is now 404 (direct fetch, 7 Jul 2026). It should decay out of the index on its own; monitor only. If it persists past ~3 months, ask Greene King Pub Partners to 301 it or confirm removal.
- **Self-serving review schema:** none found — `lib/schema-with-reviews.ts` contains no AggregateRating (grep, 7 Jul 2026). Keep it that way.

---

## Authority Building Opportunities

### High-priority opportunities (all executable by an owner-operator)

1. **Claim the plane-spotting citation layer** (protects the moat)
   - **SpottersWiki (London Heathrow page):** the canonical spotting resource lists locations with facilities notes and does not mention the only pub with food, toilets, parking and a garden under the approach. Action: add/propose a facilities note for The Anchor, transparently (wiki etiquette: factual, no promo copy; or ask a spotter regular to contribute). Success: The Anchor appears on the SpottersWiki LHR page.
   - **FlyerTalk thread "Beer Gardens for Plane Spotting Around Heathrow":** genuine community participation only — never astroturf. If the owner or a regular posts, disclose affiliation. Success: an honest, disclosed mention in the thread. (Forum links are typically nofollow — the value is prominence and referrals, not PageRank.)
   - **Aviation guide sites** (charliepauly.com's Heathrow guide currently 404s at its old URL; NYCAviation LHR guide; airial.travel; evendo): Template B outreach offering the pub as the "comfort option" alongside Myrtle Avenue, citing the on-site guide `/blog/plane-spotting-heathrow-guide`.

2. **Get listed where Sunday roast decisions are made** (priority #1 revenue)
   - `bestsundayroast.co.uk/middlesex/staines`: zero Anchor presence, site invites reviews/listings. Action: submit the listing; invite 2–3 regulars to review honestly. Success: live listing page.
   - barguide.london T5 page: Template B outreach (they already list Three Magpies; The Anchor is the closest pub to T5 with free parking — SSOT-safe framing). Success: added to the T5 roundup.
   - TripAdvisor review velocity: the visible gap to Three Magpies is review volume. The site already has `/leave-review`; make the post-meal review ask routine (staff prompt + table talker QR to /leave-review). Never incentivised. Success: rising review count trend on TripAdvisor/Google (report directionally, never hardcode counts on-site — SSOT §12).

3. **Fix the inapub listing (misinformation + missing link).** Claim the venue listing at inapub.co.uk (licensee claim flow), remove all Sky TV/Sky Sports claims, add the website URL. Success: listing shows no Sky claims and links to the-anchor.pub.

4. **Layover/travel-guide outreach.** sleepinginairports.net's LHR layover page (verified, no Anchor mention), qeepl, ukride, aph.com, railair. Pitch: "the leave-the-airport option" — 7 min from T5, free parking, and the site's own layover guide (`/blog/heathrow-layover-guide`) as the reference. Success: 1–2 editorial citations from travel-guide domains.

### Content-based link opportunities (coordinate with Content Strategist)

- **The plane-spotting guide is the link magnet.** It already exists and already dominates its space; every outreach above should point at it, not at the homepage. No new content needed to start.
- **Heritage data point worth pitching:** "a village pub since 1751 — it stood here before Heathrow existed" (SSOT §1 heritage line, Spelthorne local listing LL/072). That is a genuinely journalist-friendly fact for any third-runway/expansion story about Stanwell Moor.
- Possible future asset (only if content team agrees): a plain-English "which week are planes overhead?" explainer of the alternating runway schedule — the kind of practical detail guides link to. (Demand claim is inferred from the topic ecosystem, no volume data.)

### Relationship and outreach targets

| Target | Type | Angle |
|---|---|---|
| SpottersWiki LHR page | Community resource | Facilities listing (transparent) |
| FlyerTalk U.K./Ireland forum | Community | Disclosed participation |
| SurreyLive / getsurrey (covers Stanwell Moor already) | Local press | Local voice on Heathrow expansion; 1751 heritage angle |
| smra.uk + stanwellmoor.org (both live, neither links — verified 7 Jul 2026) | Community/partner | The pub hosts village events; ask for a link from village sites (Template D) |
| bestsundayroast.co.uk | Niche directory | Listing submission |
| barguide.london | Roundup | Template B addition to T5 page |
| sleepinginairports / qeepl / ukride / aph / railair | Travel guides | Layover-guide citation |
| Barrel & Stone | Supplier | Already links — maintain; mention in their case-study/social if offered |
| Greene King | Operator network | Low priority: tenanted pubs get no brand page; only chase the stale "to let" URL if it persists |
| Hotel concierge/guest-info pages (Sofitel, Premier Inn, etc. — site already has 11 hotel landing pages) | Partnership | Offer a "nearest village pub" card/page for guest-services teams; success is being on hotel "nearby dining" pages. Slow, relationship-led. |

---

## Google Business Profile posture (public-signal read + owner actions)

Publicly visible: GBP exists, rating 4.6 (SSOT-consistent; count inferred from snippet only). Not verifiable from outside: categories, attributes, special-hours sync, posts, Q&A, photo recency. **Owner actions (needs GBP access):** confirm primary category (Pub) + secondary (Restaurant); confirm attributes match SSOT (dog friendly, beer garden, free parking; NO accessible-toilet attribute); keep special hours synced with the management app; respond to all reviews; add fresh garden/roast photos. Success: GBP audit checklist completed and consistent with SSOT §14 banned-claims list.

## Authority Building Plan

**Short term (1–3 months)** — all Small effort:
inapub fix · bestsundayroast submission · SpottersWiki contribution · village-site link asks (SMRA/Community Watch) · barguide outreach · GBP owner checklist · start the outreach tracker (`discovery/authority/outreach-tracker.md`, columns per playbook).

**Medium term (3–6 months):**
Travel-guide/layover outreach round (5 targets above) · aviation-guide outreach · TripAdvisor/Google review-velocity routine embedded in service · pitch SurreyLive the 1751/third-runway angle when expansion news next breaks (reactive PR — have the fact sheet ready; `/about/the-anchor-facts` already exists as the reference page).

**Long term (6–12 months):**
Hotel concierge relationships (11 hotel pages give the on-site hook) · sustained community sponsorship visibility (village events, quiz leagues) with link/mention follow-up · optional runway-schedule explainer asset · re-run this assessment WITH a backlink export (a one-off Ahrefs/Semrush trial or free-tier export) so the next cycle has a real baseline.

**Realism note:** this is an owner-operator, not a PR team. The whole short-term list is roughly a day of effort spread over a month. Authority compounds slowly; nothing here promises ranking movement, and no volume/traffic numbers are attached because none exist this run.

## Risk Assessment

- **Dependency risk — Low:** no evidence the site depends on a few big links (unverifiable without export; directional).
- **Algorithmic risk — Low:** no spam patterns observed; no self-serving review schema on-site (verified).
- **Reputation risk — Medium:** inapub's Sky TV claim actively misleads sports customers (conversion risk when they arrive expecting Sky); the stale "Pub to Let" SERP artefact could suggest the pub is closing. Both have defined actions above.
- **Competitor threat — Medium:** Three Magpies holds the "nearest pub to Heathrow" framing in TripAdvisor forums and out-reviews The Anchor there. Counter with review velocity and the plane-spotting citation layer rather than head-on "nearest pub" claims (SSOT bans unsubstantiated "best/premier" claims; "closest traditional pub to Heathrow" per SSOT marketing description is the permitted framing).
- **Tactic risk:** wiki/forum contributions must be transparent and factual — undisclosed promo would burn the community that constitutes the moat. All templates in `references/authority-playbooks.md`; track every attempt in the outreach tracker; at most one polite follow-up.

---

```json
{ "findings": [
  { "finding": "inapub.co.uk brand listing claims 'Sky TV'/'Sky Sports' (banned claim, SSOT §14 — no Sky since Jan 2025) and has no website link", "evidence": "https://www.inapub.co.uk/venues/the-anchor/stanwell-moor-staines/tw196aq/59705 — direct fetch 7 Jul 2026: status 200, 5 Sky TV/Sky Sports matches, 0 the-anchor.pub matches, phone 01753 682707 correct", "source": "Direct page fetch (ctx_execute), 7 Jul 2026", "dataStatus": "Known", "severity": "Medium", "confidence": "High", "impactArea": "local", "owner": "Authority", "effort": "Small", "dependencies": "Owner claims listing via inapub licensee flow", "fixType": "One-off page fix", "recommendedAction": "Claim the inapub venue listing, remove all Sky TV/Sky Sports claims, add website link to https://www.the-anchor.pub", "validationStep": "Re-fetch listing: 0 Sky mentions, website link present", "riskRollback": "None — external listing correction" },
  { "finding": "SpottersWiki London Heathrow page (canonical plane-spotting resource) has zero mention of The Anchor — the citation layer for the site's strongest traffic moat is unclaimed", "evidence": "https://www.spotterswiki.com/index.php/London_Heathrow_Airport — direct fetch 7 Jul 2026: status 200, 0 'Anchor' matches, no link to the-anchor.pub", "source": "Direct page fetch (ctx_execute), 7 Jul 2026", "dataStatus": "Known", "severity": "Medium", "confidence": "High", "impactArea": "SEO", "owner": "Authority", "effort": "Small", "dependencies": "Owner or spotter regular; transparent wiki contribution", "fixType": "One-off page fix", "recommendedAction": "Add a factual facilities note for The Anchor (food, toilets, parking, garden under approach) to the SpottersWiki LHR page, transparently and without promo copy", "validationStep": "SpottersWiki LHR page mentions The Anchor and the edit survives community review", "riskRollback": "Community may revert promotional edits — keep it factual; no site-side risk" },
  { "finding": "Absent from Sunday-roast and near-Heathrow pub directories/roundups aligned with commercial priority #1: bestsundayroast.co.uk Staines page and barguide.london T5 roundup both omit The Anchor (barguide lists Three Magpies)", "evidence": "https://www.bestsundayroast.co.uk/middlesex/staines — fetch 7 Jul 2026: 0 'Anchor' matches; https://barguide.london/.../heathrow-terminal-5-station/ — fetch 7 Jul 2026: only 'Anchor' match is an ad-config string, 'Magpies' x5", "source": "Direct page fetches (ctx_execute), 7 Jul 2026", "dataStatus": "Known", "severity": "Medium", "confidence": "High", "impactArea": "local", "owner": "Authority", "effort": "Small", "dependencies": "Listing submission + Template B outreach (references/authority-playbooks.md)", "fixType": "One-off page fix", "recommendedAction": "Submit bestsundayroast.co.uk listing; pitch barguide.london to add The Anchor to the T5 roundup (closest pub to T5 with free parking — SSOT-safe framing)", "validationStep": "Both third-party pages show a live Anchor listing/mention", "riskRollback": "None" },
  { "finding": "Travel-guide layover ecosystem does not cite The Anchor: sleepinginairports.net LHR layover page verified zero mention; qeepl/ukride/aph/railair unverified but no citations surfaced in search", "evidence": "https://www.sleepinginairports.net/layovers/things-to-do-on-layover-london-heathrow-airport.htm — fetch 7 Jul 2026: 0 'Anchor' matches; WebSearch 'Heathrow layover leave the airport pub food guide' 7 Jul 2026 shows only the-anchor.pub's own pages citing the pub", "source": "Direct fetch + WebSearch, 7 Jul 2026", "dataStatus": "Known", "severity": "Medium", "confidence": "Medium", "impactArea": "SEO", "owner": "Authority", "effort": "Medium", "dependencies": "Owner outreach time; /blog/heathrow-layover-guide as the pitch asset", "fixType": "Content process fix", "recommendedAction": "Template B outreach to 5 layover/travel-guide sites offering the 'leave-the-airport option' angle, linking the on-site layover guide", "validationStep": "1–2 editorial citations/links from travel-guide domains within 6 months (record in outreach-tracker.md)", "riskRollback": "None — outreach can be stopped anytime" },
  { "finding": "TripAdvisor review-volume gap vs Three Magpies (closest competitor for 'nearest pub to Heathrow'): ~2,039 reviews at 4.1 vs The Anchor's smaller base (count unverifiable this run); Google rating favours The Anchor at 4.6", "evidence": "Search snippets 7 Jul 2026: 'Three Magpies 4.1 of 5, #10 of 428, 2,039 reviews' (third-party estimate, TripAdvisor via search); The Anchor 4.6 Google per SSOT §12 + snippet; direct TripAdvisor fetches 403 (bot-blocked)", "source": "WebSearch snippets 7 Jul 2026 + SSOT §12 — third-party estimates, not Google metrics", "dataStatus": "inferred", "severity": "Medium", "confidence": "Medium", "impactArea": "conversion", "owner": "Authority", "effort": "Medium", "dependencies": "Staff routine; existing /leave-review page", "fixType": "Content process fix", "recommendedAction": "Embed a post-meal review ask (staff prompt + QR to /leave-review); never incentivised; never hardcode counts on-site (SSOT §12)", "validationStep": "Directional upward trend in TripAdvisor/Google review recency over 3 months", "riskRollback": "None — stop the prompt if it irritates guests" },
  { "finding": "Village community sites do not link to the pub: smra.uk (Residents Association) and stanwellmoor.org (Community Watch) homepages have zero Anchor mentions despite the pub hosting village events", "evidence": "https://smra.uk/ and https://stanwellmoor.org/ — fetches 7 Jul 2026: status 200, 0 'Anchor' matches, no link to the-anchor.pub (homepage-level check only)", "source": "Direct page fetches (ctx_execute), 7 Jul 2026", "dataStatus": "Known", "severity": "Low", "confidence": "Medium", "impactArea": "local", "owner": "Authority", "effort": "Small", "dependencies": "Existing community relationships; Template D", "fixType": "One-off page fix", "recommendedAction": "Ask SMRA and Community Watch to list/link The Anchor as the village pub and event venue (Template D partner reclamation)", "validationStep": "Followed link from at least one village site to the-anchor.pub", "riskRollback": "None" },
  { "finding": "FlyerTalk thread 'Beer Gardens for Plane Spotting Around Heathrow' — exact-topic high-authority community discussion with zero Anchor mentions", "evidence": "https://www.flyertalk.com/forum/u-k-ireland/1782645-beer-gardens-plane-spotting-around-heathrow.html — fetch 7 Jul 2026: status 200, 0 'Anchor' matches", "source": "Direct page fetch (ctx_execute), 7 Jul 2026", "dataStatus": "Known", "severity": "Low", "confidence": "High", "impactArea": "SEO", "owner": "Authority", "effort": "Small", "dependencies": "Disclosed, genuine forum participation only — no astroturfing", "fixType": "One-off page fix", "recommendedAction": "Owner or a regular posts an honest, disclosed recommendation in the thread; value is prominence/referrals (forum links usually nofollow)", "validationStep": "Disclosed mention live in thread", "riskRollback": "Community backlash if promotional — keep disclosure explicit" },
  { "finding": "Citation NAP variances (minor): WhatPub shows no detectable phone and street locality 'Stanwell'; Yelp files pub under 'Staines-upon-Thames'; beerintheevening uses 'Middlesex'; one Facebook post geo-tags 'Slough'; core NAP (Horton Road, TW19 6AQ, 01753 682707) consistent where present", "evidence": "whatpub.com/pubs/NSY/13578 fetch 7 Jul 2026 (0 phone-format matches, links to site); pubsgalore.co.uk/pubs/27755 (phone + link correct); Yelp/beerintheevening/Facebook via search snippets 7 Jul 2026 (beerintheevening fetch failed 522)", "source": "Direct fetches + WebSearch snippets, 7 Jul 2026 — detail table in backlink-analysis.md", "dataStatus": "inferred", "severity": "Low", "confidence": "Medium", "impactArea": "local", "owner": "Authority", "effort": "Small", "dependencies": "WhatPub 'submit updates' flow; Facebook page admin", "fixType": "One-off page fix", "recommendedAction": "Submit WhatPub update adding phone 01753 682707; check Facebook page location setting (Stanwell Moor, not Slough); leave platform-taxonomy localities (Yelp/TripAdvisor 'Staines') alone", "validationStep": "WhatPub shows phone; new FB posts geo-tag Stanwell Moor/Staines", "riskRollback": "None" },
  { "finding": "Stale Greene King 'Pub to Let | Anchor (Stanwell Moor)' page still appears in brand-adjacent search results although the page itself is 404 — could suggest to customers the pub is closing", "evidence": "WebSearch 7 Jul 2026 surfaced greenekingpubs.co.uk/anchor-stanwell-moor titled 'Pub to Let'; direct fetch 7 Jul 2026: status 404 'This page cannot be found'", "source": "WebSearch + direct fetch, 7 Jul 2026", "dataStatus": "Known", "severity": "Low", "confidence": "Medium", "impactArea": "conversion", "owner": "Authority", "effort": "Small", "dependencies": "None now; Greene King Pub Partners contact if it persists", "fixType": "One-off page fix", "recommendedAction": "Monitor only — 404 should decay from the index; if still surfacing after ~3 months, ask Greene King to 301 or confirm removal", "validationStep": "Brand search no longer surfaces the 'Pub to Let' result", "riskRollback": "None" },
  { "finding": "June open item CLOSED: all six homepage schema sameAs URLs verified as real profiles of this business (FSA + Instagram verified by direct fetch; Facebook/TripAdvisor/OpenTable/Google Maps confirmed live via search, direct fetches bot-blocked)", "evidence": "evidence/schema.json homepage entry (6 sameAs URLs, both Organization and Restaurant blocks); fetch results 7 Jul 2026: ratings.food.gov.uk 200 correct business, instagram 200, facebook 400/tripadvisor 403/opentable 403 (bot walls) with listings confirmed live via WebSearch", "source": "collect-site-evidence.py schema.json + direct fetches + WebSearch, 7 Jul 2026", "dataStatus": "Known", "severity": "Low", "confidence": "High", "impactArea": "SEO", "owner": "Authority", "effort": "Small", "dependencies": "None", "fixType": "One-off page fix", "recommendedAction": "No change — keep the six sameAs URLs as-is; record the June open item as verified", "validationStep": "Already validated this run", "riskRollback": "n/a" },
  { "finding": "No backlink baseline exists (no Ahrefs/Semrush export, no GSC links report) — authority work cannot be measured beyond directional web checks", "evidence": "No backlinks.csv in tasks/seo-powerhouse/2026-07-07-the-anchor-pub/evidence/ (directory listing 7 Jul 2026); inputs/input-summary.md confirms no tool data this run", "source": "Workspace inspection, 7 Jul 2026", "dataStatus": "Known", "severity": "Low", "confidence": "High", "impactArea": "SEO", "owner": "Analytics", "effort": "Small", "dependencies": "One-off Ahrefs/Semrush trial or free-tier export; scripts/import-search-data.py", "fixType": "Analytics/governance fix", "recommendedAction": "Before the next cycle, pull one referring-domains export and normalise via import-search-data.py --backlinks so authority work has a measurable baseline", "validationStep": "backlinks.csv present in next run's evidence directory", "riskRollback": "None" },
  { "finding": "Local digital-PR opportunity: SurreyLive/getsurrey actively covers Stanwell Moor (Heathrow expansion) but has no coverage of The Anchor; the 1751 'older than Heathrow' heritage fact (SSOT §1, Spelthorne listing LL/072) is a ready-made local-press angle", "evidence": "WebSearch 7 Jul 2026: getsurrey.co.uk Stanwell Moor expansion coverage present, no Anchor pub coverage found in brand searches; heritage facts from docs/SSOT.md §1", "source": "WebSearch 7 Jul 2026 + docs/SSOT.md", "dataStatus": "inferred", "severity": "Medium", "confidence": "Low", "impactArea": "SEO", "owner": "Authority", "effort": "Medium", "dependencies": "Owner availability for comment; /about/the-anchor-facts as the fact sheet; coordinate wording with Editorial (SSOT heritage safe wording)", "fixType": "Content process fix", "recommendedAction": "Prepare a 3-line press pitch (village pub since 1751, predates Heathrow, local voice on expansion) and send reactively when the next third-runway/Stanwell Moor story breaks", "validationStep": "One local-press mention or link within 6–12 months (tracked in outreach-tracker.md)", "riskRollback": "Press angle must follow SSOT heritage safe wording — no invented history" },
  { "finding": "Google Business Profile cannot be audited from outside this session — categories, attributes, special-hours sync, posts and review responses unverified (public signals look healthy: 4.6 rating consistent with SSOT)", "evidence": "No GBP access this run; public snippet 7 Jul 2026 shows 4.6 (238 reviews — inferred, snippet only); SSOT §12 mandates showing 4.6 and not hardcoding counts", "source": "WebSearch snippet + SSOT §12; GBP data unavailable", "dataStatus": "unavailable", "severity": "Medium", "confidence": "Low", "impactArea": "local", "owner": "Authority", "effort": "Small", "dependencies": "Owner GBP access", "fixType": "Analytics/governance fix", "recommendedAction": "Owner runs the GBP checklist: primary category Pub + secondary Restaurant, attributes matching SSOT (incl. NO accessible-toilet attribute), special hours synced with management app, respond to all reviews, fresh photos", "validationStep": "GBP checklist completed and consistent with SSOT §14 banned claims", "riskRollback": "None" }
] }
```
