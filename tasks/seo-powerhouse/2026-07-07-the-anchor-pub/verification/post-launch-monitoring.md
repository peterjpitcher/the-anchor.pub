# Post-Launch Monitoring

## After the safe-fix branch merges
- Fetch `/robots.txt` → confirm `/leave-review` disallowed, `/leave-a-review` gone.
- Fetch `/live-sport/world-cup` → "View Menu" resolves 200 to `/food-menu`.
- Re-crawl → `broken-internal-links.csv` count for `/menus` = 0.

## After Group A (measurement) — the key unlock
- GA4 Realtime: fire a test table booking + private-hire enquiry; confirm both appear as **key events**.
- GA4 DebugView: confirm the Measurement Protocol events from `/api/analytics` arrive (not no-op).
- Confirm Meta Pixel fires in production (Pixel Helper).
- GSC: confirm property verified and Performance + Page-Indexing exports flowing.

## After Group B/C — re-measure at 6–8 weeks (Stage 9)
- Recollect `search-queries.csv` / `landing-pages.csv`; snapshot `post-change`; run `measure-delta.py` vs the baseline fingerprint.
- Re-run the crawl + `build-baseline.py --previous` for a drift report (lost canonicals, new noindex, schema removed, pages dropped).
- Re-run `validate-schema.py` → confirm missing-required count falls from 430; `Offer.price` valid on `/drinks` and menu pages.
- Rich Results Test on `/sunday-roast`, `/food-menu` → `Offer.price` numeric, `£` visible on-page.

## Standing guardrails
- Drift-guard test extended to fail on any hardcoded £-price string and on placeholder tokens ("live price", "approved source").
- Monthly: re-run `collect-site-evidence.py` + `analyze-internal-links.py`; alert on new 4xx internal links, new noindex on commercial pages, sitemap count drops.
