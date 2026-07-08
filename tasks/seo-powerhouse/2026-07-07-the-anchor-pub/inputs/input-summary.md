# Input Summary — SEO Powerhouse Full Overhaul, 7 July 2026

## Target
- Live site: https://www.the-anchor.pub (canonical, www, Cloudflare + Vercel)
- Codebase: /Users/peterpitcher/Cursor/OJ-The-Anchor.pub (Next.js 14 App Router, no database — marketing/booking site backed by the management API)
- Sitemap: 189 URLs (live sitemap.xml, checked 7 Jul 2026). Prior June build produced ~319 static pages.

## Mode
Full Overhaul — 9 agents, 9 stages.

## Business context (from project memory + SSOT)
- The Anchor, Stanwell Moor, near Heathrow Airport. Contact manager@the-anchor.pub / 01753 682707.
- Commercial priorities (owner-stated, June 2026): 1) Sunday roast / food, 2) private hire, 3) events. Plane-spotting/Heathrow traffic dominates but converts — posture is "protect plane-spotting, grow commercial".
- Conversion actions: table bookings (book-table wizard → management API), private-hire enquiries, event bookings (recent event-booking work incl. SALES_CLOSED handling), phone calls.
- Brand constraints (banned claims): no real-ale positioning, no Sky/TNT sport, no weddings, no breakfast/delivery, "The Anchor" not "The Anchor Pub". SSOT: docs/SSOT.md + SSOT.json (drift-guard test). All food/drink prices LIVE from DB — never hardcode.

## Prior work this run builds on (all merged & deployed 14 Jun 2026, db58eb73)
- March 2026 overhaul; June GSC remediation; 13–14 June full overhaul + phase 2 (WP0–WP8: prices→DB, schema truth, GA4 Measurement Protocol tracking, AI crawlers unblocked, 301s of legacy/PDF/seasonal stubs, blog-tag noindex, 4 priority-page metadata, hotel-page template, seasonal A11 system, private-hire occasion + landmark pages).
- Known open items from June (verify status in this run): GA4 env vars in Vercel; verified sameAs URLs; editorial body copy for near-heathrow / restaurants-near-heathrow / private-hire; 6 seasonal evergreen rewrites; R2 thin-hotel-page disposition; 2 content files with hardcoded prices; "/restaurants-near-heathrow 9 draught beers" claim check.

## Data availability
- GSC Performance export: NOT available this run.
- GSC Page Indexing / Coverage export: NOT available this run (June drilldown workspace deleted).
- GA4 export: NOT available.
- CrUX/PageSpeed API keys: not set (CRUX_API_KEY, PAGESPEED_API_KEY).
- Google service account (fetch-search-data.py): not set (GOOGLE_APPLICATION_CREDENTIALS).
- ⇒ Without-data track: crawl evidence + codebase + prior-run memory + web-visible signals. Confidence marked lower on demand/ranking claims; no invented metrics.
- Prior June baseline snapshots: deleted with .seo-workspace — no Stage-9 delta possible vs June; this run freezes a new crawl-evidence baseline.

## Implementation permission
Default posture per skill: small low-risk fixes pre-approved; high-risk search changes batched into one approval request for the owner. Session is autonomous — approval requests are written up, not blocking.

## Known problems / user goal
User asked for a "full site review" — no specific complaint. Treat as: verify the June work landed and is performing-ready, find drift/regressions, and identify the next tier of commercial wins.
