# Baseline Metrics — 7 July 2026 (frozen for future comparison)

**Data status: no first-party performance data exists this run.** No GSC, GA4, CrUX or rank-tracking access. This file records what CAN be baselined honestly; do not backfill numbers into it later.

## Crawl-surface baseline (Known — collect-site-evidence crawl, 7 Jul 2026)
- Pages fetched: 240 (0 fetch errors)
- Sitemap URLs: 189 · Discovered off-sitemap: 51
- Source: evidence/url-inventory.csv, evidence/audit-summary.md

## Tracking-readiness baseline (Known — codebase @ 19e88215 + live checks, 7 Jul 2026)
| Pipe | State on 7 Jul 2026 |
|------|---------------------|
| GTM-WWFQTQS on all templates | Live (verified on 6 priority templates) |
| Consent Mode defaults (denied-first) | Live; v2 keys ad_user_data/ad_personalization missing |
| Commercial event wiring in code (5 events) | Complete |
| GTM→GA4 forwarding + key events | Unverified (no container/property access) |
| Server-side GA4 MP (/api/analytics) | Likely no-op (env vars unconfirmed since June) |
| Meta Pixel | Dead — env var absent at build (bundle-proven) |
| Microsoft Clarity | Live (nh4v91dr6w), consent-gated |
| CheersAI conversions webhook | Wired; secret unverified |
| GSC property | Unverified this run |

## Traffic / rankings / conversions / CWV
- All: **unavailable** — no source. Confidence on any demand claim elsewhere in this audit: Low.
- First trustworthy baseline = first 4–8 weeks of GA4 + GSC data after tickets T1–T3 (tracking-health-check.md) land. Freeze that as "Baseline v1" and compare all overhaul outcomes against it, not against anything earlier.
