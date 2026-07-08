# Backlink & Citation Inventory — The Anchor (verified web-visible signals)

**Date:** 7 July 2026 · **Method:** direct page fetches + web search only. **No backlink tool export exists this run** — this file is NOT a backlink profile; it is the verified inventory of citations, links and mentions found by hand. No counts, no DR/DA figures. Every row states how it was verified.

## 1. Verified citation / listing inventory

| Source | URL | Links to site? | NAP status | Verified how (7 Jul 2026) | Action |
|---|---|---|---|---|---|
| FSA Food Hygiene | ratings.food.gov.uk/business/1110171/the-anchor-stanwell-moor | n/a (gov listing) | "The Anchor Public House, Horton Road, Stanwell Moor, Staines-upon-Thames TW19 6AQ"; inspection 29 Oct 2025 | Direct fetch 200, body parsed | None — healthy |
| CAMRA | camra.org.uk/pubs/anchor-stanwell-moor-159519 | **Yes** (the-anchor.pub found) | Horton Rd + 01753 present | Direct fetch 200 | None — healthy |
| WhatPub (CAMRA) | whatpub.com/pubs/NSY/13578/anchor-stanwell-moor | **Yes** (1 match) | Address "Horton Road, Stanwell, Stanwell Moor TW19 6AQ"; phone not detected in standard format (page JS-heavy — inferred) | Direct fetch 200 | Submit update adding 01753 682707 |
| Pubs Galore | pubsgalore.co.uk/pubs/27755/ | **Yes** (2 matches) | Phone 01753682707 correct; "Horton Road, Stanwell Moor, Staines Upon Thames, Surrey" | Direct fetch 200 | None — healthy |
| Barrel & Stone (pizza supplier) | barrelandstone.co.uk/pub/the-anchor-stanwell-moor-village/ | **Yes** | Brand profile page | Direct fetch 200, the-anchor.pub link confirmed | None — existing supplier link win |
| inapub | inapub.co.uk/venues/the-anchor/stanwell-moor-staines/tw196aq/59705 | **No** | Phone correct; title claims "Sky TV" (banned claim, SSOT §14), 5 Sky mentions | Direct fetch 200 | **Claim listing: remove Sky claims, add website link** |
| TripAdvisor | tripadvisor.co.uk/…-d9717898-…The_Anchor-Staines… | n/a | Filed under Staines (platform geo taxonomy) | Fetch 403 (bot wall); listing live per search ("2026 Reviews") | Keep reviews flowing; do not fight the locality |
| OpenTable | opentable.co.uk/r/the-anchor-stanwell-moor | n/a | Same slug live on opentable.com per search | Fetch 403 (bot wall) | None |
| Yelp | yelp.com/biz/the-anchor-staines-upon-thames | unverified | "Horton Road, Staines-upon-Thames, Surrey"; updated Mar 2026 per snippet | Fetch 403; snippet only (inferred) | Check listing when claiming rounds are done |
| beerintheevening | beerintheevening.com/pubs/s/25/25823/Anchor/Stanwell_Moor | unverified | County shown as "Middlesex" per snippet | Fetch failed (522 timeout); snippet only | Low priority — retry later |
| Facebook | facebook.com/theanchorpubsm/ | owned profile | Page name "The Anchor - Heathrow Pub & Dining"; one post geo-tagged "Slough" (snippet) | Fetch 400 (bot wall); live per search | Check page location setting |
| Instagram | instagram.com/theanchor.pub/ | owned profile | — | Direct fetch 200 | None |
| Lnk.bio | lnk.bio/7uRk (@theanchor.pub) | owned | — | Search result only (inferred) | None |
| remotegoat | remotegoat.com/venue/19697/the-anchor | unverified | Legacy venue listing | Search result only (inferred) | Ignore |
| Greene King Pub Partners | greenekingpubs.co.uk/anchor-stanwell-moor | dead | "Pub to Let" title still in SERPs; page is 404 | Direct fetch 404 | Monitor; chase Greene King only if it persists |

## 2. Zero-mention checks (gap evidence, all direct fetches 7 Jul 2026)

| Page checked | Result |
|---|---|
| spotterswiki.com/index.php/London_Heathrow_Airport | 200, **0 Anchor mentions** |
| flyertalk.com …/beer-gardens-plane-spotting-around-heathrow.html | 200, **0 Anchor mentions** |
| en.wikipedia.org/wiki/Myrtle_Avenue,_Hounslow | 200, 0 mentions (not an outreach target — do not edit Wikipedia for promotion) |
| heathrow.com spectator-areas page | 200, 0 mentions (fan-zone tips page itself 404s) |
| sleepinginairports.net LHR layover guide | 200, **0 Anchor mentions** |
| bestsundayroast.co.uk/middlesex/staines | 200, **0 Anchor mentions** |
| barguide.london T5 roundup | 200, 0 real mentions (only an ad-config string); Three Magpies listed |
| smra.uk (Residents Association) + stanwellmoor.org (Community Watch) | 200, **0 Anchor mentions/links** (homepage-level check) |
| charliepauly.com/heathrow-plane-spotting/ | **404** — guide moved or removed; only CSS-class 'anchor' matches |
| greeneking.co.uk/pubs?search=TW19 6AQ | 404 — no brand-site page for tenanted Anchor |

## 3. sameAs verification detail (June open item)

Live homepage JSON-LD (evidence/schema.json, crawl 7 Jul 2026) carries identical six-URL sameAs arrays in the Organization (`#organization`) and Restaurant/BarOrPub (`#business`) blocks; source of truth in code: `lib/schema.ts:22` and `lib/schema-with-reviews.ts:64`. All six verified real (see table in authority-report.md). No dead or wrong-business URLs. `lib/schema-with-reviews.ts` contains **no** AggregateRating — no self-serving review schema (grep, 7 Jul 2026).

## 4. What could NOT be assessed (data unavailable)

- Referring-domain totals, anchor-text distribution, link velocity, followed/nofollow split — requires a backlink export (none this run). Recommendation filed: pull one Ahrefs/Semrush export before the next cycle and normalise via `scripts/import-search-data.py --backlinks`.
- TripAdvisor/Yelp/OpenTable page contents (bot walls) — review counts quoted anywhere are search-snippet third-party estimates, dated 7 Jul 2026.
- GBP internals (categories, attributes, Q&A, insights) — needs owner access.
