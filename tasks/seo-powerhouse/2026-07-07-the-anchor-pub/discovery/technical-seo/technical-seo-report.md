# Technical SEO Audit — The Anchor (www.the-anchor.pub)

- **Run**: Full Overhaul, 7 July 2026 (without-data track — no GSC/GA4/CrUX; crawl evidence + codebase + live fetches only)
- **Evidence base**: `evidence/` crawl of 240 pages (0 fetch errors), live sitemap (189 URLs), live header/redirect probes, codebase @ main `19e88215`
- **Headline**: The technical foundation is in good shape — the June 2026 work has held. No critical crawl/index blockers on commercial pages. The real findings are: two 301'd blog posts whose consolidation target is `noindex` (equity dead-ends), a systemic oversized-OG-image default, 146 empty-price Offer blocks on /drinks plus 32 SSOT-violating hardcoded cocktail prices, and a cluster of small link/schema hygiene items — almost all fixable at template/system level.

---

## Critical Issues

**None actively preventing crawl, indexing, or ranking of commercial pages.** The two highest-priority items below (F1, F14) are equity-protection and measurement-capability issues, not blockers.

Standing Tier-1 note (owned by Analytics, recorded here as a dependency): CWV field/lab data is unobtainable (`evidence/cwv-data-access.md` — CrUX API returned 403, no `CRUX_API_KEY`/`PAGESPEED_API_KEY`), and no GSC access this run. Every performance claim in this report is therefore code-level/inferred, never field-verified.

---

## Crawlability & Indexation

| Check | Status | Details | Impact | Fix |
|-------|--------|---------|--------|-----|
| robots.txt | PASS | Live 200, 343 bytes, matches `app/robots.ts` — 11 disallows (all utility paths), sitemap referenced, no UA-specific rules → **all AI search/user/training bots allowed** (June item verified) | — | None |
| robots path drift | MINOR | `app/robots.ts:19` disallows `/leave-a-review` but the real route is `/leave-review` (301 → Google reviews). Rule protects a path that no longer exists | Crawl-waste only | Update rule to `/leave-review` (F12) |
| XML sitemap | PASS | Live sitemap fetched: 189 URLs, **verified zero redirecting, noindex, or 404 URLs in it**. Crawl coverage: 0 sitemap URLs uncrawlable. The `technical-signals.csv` "in_sitemap=yes for redirecting URLs" rows are a collector artefact (membership evaluated against the redirect's *final* URL) — confirmed not a live defect | — | None |
| Sitemap gaps | MINOR | `/live-sport/world-cup/sweepstake` is 200, `index,follow`, self-canonical, but absent from `app/sitemap.ts` (F9). All other 44 "crawled-not-in-sitemap" pages are correctly excluded (25 noindex tag pages, 6 param variants canonicalised to clean URLs, 5 blog pagination pages, 2 404s, 2 redirects, PDF, cdn-cgi artefact) | Low | Add to staticRoutes + lifecycle plan |
| Sitemap lastModified | MINOR | `app/sitemap.ts:116` — `RECENTLY_UPDATED = new Date()` gives /sunday-roast, /easter-sunday, /private-hire/anniversary-parties a perpetually-fresh lastModified on every hourly regeneration. Google learns to distrust inaccurate lastModified | Low | Use real content-change dates (F13) |
| Canonicals | PASS | All 13 "canonical points elsewhere" pages are legitimate: `book-table`/`join-our-team` param variants and `blog?page=N` canonicalise to their clean URLs. 3 "missing canonical" = the 2 404s + /leave-review (redirect) — non-issues. `metadataBase` only in `app/layout.tsx:64`, no root-layout canonical (past bug not regressed) | — | None |
| Blog pagination | ACCEPTABLE | `app/blog/page.tsx:24` canonicalises `?page=N` → `/blog`. Against Google's self-canonical-pagination guidance, but all posts are in the sitemap and crawl paths exist; consolidation is deliberate | Low | Leave; revisit only with GSC evidence |
| noindex audit | PASS with 1 defect | 27 noindex pages = 25 `/blog/tag/*` (deliberate, June) + 2 rows that are actually 301s whose **target** is noindex — see F1. Nothing commercial caught | High (F1) | F1 |
| Redirects | PASS | Live probes: apex→www single 301 hop; `/post/*` → blog 301; `/event-details/*` → /whats-on 301; menu PDF → /food-menu 301 (all June items verified). No chains on internal targets except /leave-review's onward hops on google.com (outside our control) | — | None |
| Hard 404s | 2 found | `/menus` (linked from `app/live-sport/world-cup/page.tsx:151`, "View Menu" — F3) and `/cdn-cgi/l/email-protection` (Cloudflare artefact — F2) | Low each | F3, F2 |
| Soft 404s | 2 candidates, both false positives | `/blog/fish-chips-guide` is a real 1,923-word post (but title/H1 = "Best Fish and Chips Near Heathrow \| The Anchor Pub Guide" — banned "The Anchor Pub" phrase + double brand suffix + cannibalisation risk vs `/fish-and-chips-heathrow` → handed to Content). `/leave-review` is a deliberate 301 to Google reviews | Low | Content owns title; F12 for crawl hygiene |
| Render dependency | PASS | Server-rendered Next.js; render-diff found 0 JS-dependent pages (Playwright absent, but raw HTML is the served HTML for this stack) | — | None |
| Crawl traps | PASS | No faceted nav; `book-table?source=…` params are canonicalised and not in sitemap | — | None |

### F1 — Consolidated blog post receives two 301s but is `noindex` (equity dead-end)
**What**: `content/blog/eating-near-heathrow-prices-compared/index.md` has `noindex: true` in frontmatter (line 19). Yet `/blog/best-places-to-eat-near-heathrow` and `/blog/best-pub-food-near-heathrow` both 301 to it (verified live), and **20 internal links across 9+ pages still point at the two old URLs** (`broken-internal-links.csv`). Any accumulated signal from the two merged posts terminates at a page Google is told not to index.
**Root cause**: June consolidation merged two posts into one price-comparison article, then noindexed the merge target so it wouldn't compete with `/restaurants-near-heathrow` (the frontmatter copy says exactly this). The 301s were left pointing at the noindexed page instead of the commercial page.
**Fix (pick one, recommend a)**: (a) re-point both 301s in `config/redirects/` to `/restaurants-near-heathrow` — consistent with the June intent, sends legacy equity to a priority commercial page; or (b) remove `noindex: true` and add the post back to the sitemap. Also update the ~20 internal links to the final destination.
**Impact**: Commercial priority #1 (food near Heathrow cluster). Demand unquantified (no GSC) — mechanism confidence High, impact confidence Medium.

---

## Site Architecture & Internal Linking

- **Orphans: 0** (`internal-link-issues.md`) — every page has ≥1 inbound link. Click depth is shallow; the mega-nav/footer reaches everything.
- **Boilerplate weight**: median **131 outbound internal links per page** (mean 133, max 238; 31,875 links across 240 pages). 25 targets are linked from ≥80% of all pages. This is a deliberate mega-footer pattern; with no ranking data I do not recommend restructuring, but note two side-effects: (1) anchor-text concentration — 10+ targets have a single anchor at 96–100% share (`internal-link-issues.md`); (2) per-page link equity is heavily diluted before body links get a say. Directional observation only — revisit with GSC data.
- **Links to redirected URLs (F4)**: ~60 non-boilerplate rows in `broken-internal-links.csv` point at 301'd URLs — old blog slugs (`best-places-to-eat…` ×10, `best-pub-food…` ×10, `plane-spotting-heathrow-guide` ×9, `pub-jobs-heathrow` ×6) and old tag slugs (`/blog/tag/christenings`, `work-events`, `comparison`, `pricing`, etc. — the June tag-alias 301 map is not applied when rendering tag chips/related links on posts). Fix at two levels: apply the tag-alias map in the tag-link render path (template fix), and batch-update in-body markdown links to final URLs (content sweep).
- **Breadcrumbs**: `BreadcrumbJsonLd` in use (127 BreadcrumbList blocks) — present on interior pages. PASS.
- **`/leave-review` (F12)**: 236 boilerplate links (one per page, 100% "Leave a Review" anchor) to a URL that 301s off-site to Google. Fine for UX; to stop crawlers chasing it, align the robots.txt rule (currently misspelt as `/leave-a-review`).

---

## Performance & Core Web Vitals

| Metric | Current | Target | Issue | Recommendation |
|--------|---------|--------|-------|----------------|
| LCP / INP / CLS (field) | **unavailable** | ≤2.5s / ≤200ms / ≤0.1 @ p75 | `cwv.csv`: CrUX 403 (no API key), no GSC | Set `CRUX_API_KEY` + `PAGESPEED_API_KEY` (Analytics owner, F14) — no CWV verdict is possible or invented this run |
| TTFB / delivery | Good (inferred) | <600ms | Live probes: brotli encoding, Cloudflare + Vercel CDN, `max-age=31536000, immutable` on static assets, ISR/edge cache headers present | None |
| Fonts / JS | Not measured | — | `swcMinify`, `removeConsole` in prod, AVIF/WebP formats configured (`next.config.js:221`) | Verify with lab data once keys exist |

**Oversized images (F5)** — the crawl flags **163 pages with an image >200KB**. Root cause found in code, not in the page `<img>` pipeline:

- In-page images go through `next/image` (AVIF/WebP, `deviceSizes` configured; no raw `<img>` tags found in `components/` or `app/`; hero uses `priority` — `components/hero/InteriorHero.tsx:56`). PASS.
- The flags trace to **raw `og:image` URLs**: `lib/image-fallbacks.ts:2` sets `DEFAULT_OG_IMAGE = '/images/page-headers/home/page-headers-homepage.jpg'` — a **290KB source JPG used as og:image on 120 pages** (`page-metadata.csv`). Next most common: `corporate-events.jpg` 226KB ×29 pages, `heathrow-airport-view.jpg` 322KB ×8+. That accounts for ~157 of the 163 flags (attribution inferred from og:image counts × file sizes; per-image HEAD list not retained in evidence).
- **Impact**: no LCP effect (og images don't render on-page) — this is social-share/AI-fetch weight plus a missed-differentiation problem (120 pages share the homepage share-card). 44 source files in `public/images/` exceed 200KB; they are safe as `next/image` sources but should never be referenced raw.
- **Fix (system)**: generate compressed 1200×630 og variants (one-off script into `public/images/og/`), point `DEFAULT_OG_IMAGE` and `lib/page-header-images.ts` og fields at them. Per-page og differentiation → Content.

---

## Mobile Usability

Next.js default viewport meta; responsive Tailwind layout; no horizontal-scroll or fixed-width signals in the crawl; 0 JS-dependent pages so content parity is guaranteed. No mobile-specific defects observable without rendered/field data — mark **no known issues, unverified at field level** (Data status: inferred).

---

## Structured Data

Overall: 236/240 pages carry JSON-LD; median 3 top-level blocks and 9.1KB per page (sane); 0 self-serving AggregateRating (June fix held). The validator's headline "430 missing-required" collapses to a handful of systemic causes — most are one template each, and 124 of them are validator artefacts on @id reference stubs:

| Page/Template | Current Schema | Defect | Fix type |
|-----------|---------------|----------------|------------------------|
| `/drinks` (F6) | Menu with 178 MenuItems | **146 items emit `"price": ""`** — `app/drinks/page.tsx:85-89` builds Offers from `content/menu/drinks.json`, where 146 items have empty `price` (June price-strip left blanks) and **32 cocktail items still carry hardcoded prices (e.g. Pink Paloma 6.50) — SSOT violation** ("prices live from DB, never hardcode"). Also the site's heaviest JSON-LD payload: 60KB inline | Template/system: omit `offers` when price is blank; decision for owner/dev: source drink prices from the management DB like food, or drop per-item Offers entirely (Menu rich results give no SERP benefit in this market) |
| Blog post template (F7) | BlogPosting + Blog + FAQ | `app/blog/[slug]/page.tsx:290` inlines the **entire stripped post text as `articleBody`** → 24–27KB JSON-LD per post. `articleBody` is not required by Google; the visible HTML is the content signal | Template/system: remove `articleBody` (or truncate to description) |
| Blog post template (F8) | reference stubs | `about: {"@type":"LocalBusiness","@id":…}` (62×) and `blogPost: {"@type":"BlogPosting","@id":"…#blogposting"}` (62×) are @id references — the validator counts them as missing address/headline (artefact, not defect). Real defect: the main BlogPosting's `@id` is the post URL (line 286) while the Blog block references `…#blogposting` (line 332) — **dangling @id, the reference resolves to nothing** | Template/system: align the two @ids; drop `@type` from pure references |
| ParkingFacility/owner (F8) | Restaurant stub | 7 blocks (`/`, `/beer-garden`, `/find-us`, `/fish-and-chips-heathrow`, `/near-heathrow` ×2) embed `owner: {"@type":"Restaurant","name","telephone"}` without address — schema.json path `[n].owner` | Template/system: replace stub with `{"@id": "https://www.the-anchor.pub/#business"}` |
| FAQPage ×128 / HowTo ×18 (F10) | retired rich results | Valid markup, no SERP enhancement any more. FAQ content is genuinely visible (`FAQAccordionWithSchema`) so keeping is legitimate for AI-answer extraction; do not expect rich results | No change required; do not add more expecting SERP gain |
| `lib/schema-utils.ts:137-200` (F11) | dead code | `generateEventSchema` hardcodes quiz £3 / bingo £10 + prize claims. **No imports anywhere** — currently inert, but it is a hardcoded-price booby-trap one import away from an SSOT violation | Delete the function |
| Entity identity | Organization/Restaurant | `@id`s stable (`#organization`, `#business`); NAP in schema (Horton Road, Stanwell Moor, TW19 6AQ, +441753682707) matches SSOT; sameAs includes TripAdvisor (`lib/schema-with-reviews.ts:68`) | Verify full sameAs set (June open item) — Authority owner |

Schema generation is **partially decentralised** — 15+ pages define their own inline Restaurant/BarOrPub blocks (`app/*-pub/page.tsx` etc.) alongside `lib/schema.ts`. Not currently producing contradictions, but every schema fix above should move logic into the shared lib rather than patch pages — flagged to the Web Developer Analyst as the implementation pattern.

---

## Security & Trust

PASS across the board (verified live + `config/security-headers.json`): full HTTPS, HSTS `max-age=63072000; includeSubDomains; preload`, CSP (allows required third parties only), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, Referrer-Policy, Permissions-Policy. Brotli compression live. `poweredByHeader` off. No mixed content observed in crawl. No action.

---

## Image SEO

- 0 images missing alt text across the crawl (PASS — June work held).
- AVIF/WebP via `next/image` everywhere; no raw `<img>` in components (PASS).
- Descriptive file naming in `public/images/` (e.g. `the-anchor-sunday-roast-hero.jpg`) (PASS).
- og:image weight/differentiation — see F5 above.
- OG dimensions: blog template declares 1200×630; the raw page-header JPGs used as og:image on static pages are not 1200×630-cropped — fold into F5.

## F2 — Cloudflare email obfuscation creates 244 links to a 404 on every page

`/cdn-cgi/l/email-protection` receives 244 links from 236 pages (`broken-internal-links.csv`) with anchors like "Email Us"/"Enquire Now" — Cloudflare's Email Address Obfuscation rewrites the site's `mailto:` links (`components/EmailLink.tsx`) into JS-decoded `/cdn-cgi/` links. Mitigations already in place: `/cdn-cgi/` is robots-disallowed, so Googlebot won't fetch the 404. Remaining harm: every page carries dead-end links in raw HTML, and **non-JS agents (including AI crawlers reading raw HTML) see `[email protected]` instead of manager@the-anchor.pub** — the email is already public in the SSOT and schema, so obfuscation protects nothing. **Fix (system, no deploy)**: Cloudflare dashboard → Scrape Shield → Email Address Obfuscation → Off. Validation: re-crawl shows 0 `/cdn-cgi/l/email-protection` links.

---

## Local SEO

- **On-site NAP**: consistent across schema, SSOT, and visible copy (Horton Road, Stanwell Moor, TW19 6AQ; +44 1753 682707) — Known, PASS.
- **LocalBusiness/Restaurant schema**: full address, geo, openingHoursSpecification present on core templates (from live DB hours) — PASS apart from the owner-stub artefact (F8).
- **areaServed**: AdministrativeArea blocks present on 473 nested entities across location pages — present; accuracy of the claimed areas is a Content/SSOT check.
- **GBP / Apple Maps / Bing Places / citations / reviews cadence**: **unavailable this run** (no GBP access) — do not treat as passing; Authority/Analytics owners to verify.
- **Doorway-risk (F15)**: the 12 `pub-near-*-heathrow` hotel pages have near-identical word counts (1,492–1,520 — a template fingerprint) and the 13 `*-pub` area pages cluster at 1,194–1,733 words. June's "R2 thin-hotel-page disposition" is still open. This is the pattern Google's spam policy calls doorway pages if the copy is swapped-placename filler. Technical evidence stops at the fingerprint; content uniqueness assessment → Content agent. Do not add more location pages until resolved.
- **Local conversion actions**: click-to-call, booking CTA, directions present in templates (BookTableButton, PhoneButton, find-us map allowed in CSP `frame-src maps.google.com`) — PASS (code-level).

---

## AI Search & Entity Readiness

- **Bot access**: robots.txt has no UA-specific rules → OAI-SearchBot, ChatGPT-User, GPTBot, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Applebot all allowed (June "unblock AI crawlers" verified live). Cloudflare: no evidence of bot-fight-mode blocks in crawl (0 fetch errors, but crawler ≠ AI UA — unverifiable precisely; low risk).
- **llms.txt**: present, 200 (June work). `/llms-full.txt` 404 — optional, not required.
- **Server-rendered**: 0 JS-dependent pages — answers survive in raw HTML. PASS.
- **Weakness**: the obfuscated email (F2) corrupts the contact fact in raw HTML for AI readers; fixing F2 fixes this.
- Deeper answer-block/citation strategy → `ai-seo` scope (Content).

---

## Content Lifecycle

- **Expired events**: sitemap excludes events >30 days past and cancelled >7 days (`app/sitemap.ts:291-308`) — PASS. 6 event URLs currently listed.
- **Seasonal URLs**: permanent, reused (`/christmas-parties`, `/easter-sunday` — no dated URLs) — PASS. `/blog/christmas-party-venues-heathrow-2026` is a dated URL in the sitemap — flag for next-year re-use decision (Content).
- **World Cup content (F9)**: `/live-sport/world-cup/sweepstake` (indexable, not in sitemap) + `/downloads/the-anchor-world-cup-sweep-draw-results.pdf` (X-Robots noindex — good) are temporal. The tournament ends this month: diarise disposition (redirect sweepstake to `/live-sport` after the final, keep `/live-sport/world-cup` as evergreen hub).
- **Thin content**: 1 page <300 words (`/leave-review`, 20 words — a redirect, not a content page). No genuine thin-content pages. PASS.
- **Freshness signals**: see sitemap lastModified note (F13).

---

## Prioritised Fix List

| Priority | ID | Issue | Impact | Effort | Dependency |
|----------|----|-------|--------|--------|------------|
| 1 | F1 | 301s terminate at noindexed merge target + 20 stale internal links | Protects food-near-Heathrow equity (commercial #1) | Small | Owner choice: re-point to /restaurants-near-heathrow (recommended) vs un-noindex |
| 1 | F3 | `/menus` 404 linked from world-cup page (`app/live-sport/world-cup/page.tsx:151` → `/food-menu`) | Removes a hard 404 from a live campaign page | Small | None |
| 2 | F14 | No CWV data possible (no CrUX/PSI keys, no GSC) | Unblocks all future performance verdicts | Small | Owner: create API keys, link GSC |
| 2 | F5 | og:image = raw 226–322KB source JPGs; 120 pages share the homepage image | Share-card quality + AI fetch weight, differentiation | Medium | One-off image generation script + `lib/image-fallbacks.ts` |
| 2 | F6 | /drinks: 146 empty-price Offers + 32 hardcoded cocktail prices in `content/menu/drinks.json` (SSOT) | Schema validity + brand price rule | Medium | Owner decision: DB-source drinks prices vs drop Offers |
| 2 | F2 | Cloudflare email obfuscation → 244 links to 404, corrupted email for AI/raw-HTML readers | Link hygiene + entity contact fact | Small | Cloudflare dashboard access (no deploy) |
| 2 | F4 | ~60 internal links to 301'd blog/tag URLs; tag-alias map not applied at render | Crawl efficiency, direct equity flow | Small–Medium | Template fix (tag links) + content link sweep |
| 3 | F7 | `articleBody` duplicates full post text → 24–27KB JSON-LD per post | Page weight across 62 posts | Small | None |
| 3 | F8 | Dangling `#blogposting` @id; Restaurant owner-stubs without address | Entity-graph correctness | Small | None |
| 3 | F9 | Sweepstake page not in sitemap + World Cup lifecycle plan | Coverage + stale-content prevention | Small | None |
| 3 | F12 | robots rule `/leave-a-review` vs actual `/leave-review` | Crawl hygiene | Small | None |
| 3 | F13 | Rolling `new Date()` lastModified for 3 sitemap entries | lastModified trust | Small | None |
| 3 | F11 | Dead `generateEventSchema` with hardcoded £3/£10 prices | Removes SSOT booby-trap | Small | None |
| 4 | F15 | 12 hotel pages template-fingerprint near-duplicates (doorway risk) | Spam-policy risk containment | Large | Content agent uniqueness pass (June R2 open item) |
| 4 | F10 | 128 FAQPage + 18 HowTo blocks — retired rich results | Expectation-setting only | Small | None (keep; no SERP gain expected) |

**June 2026 regression check — all verified holding**: AI crawlers unblocked ✓ · `/blog/tag/*` noindex (25 pages, none in sitemap) ✓ · legacy `/post/*` + `/event-details/*` 301s ✓ · menu-PDF → /food-menu 301 ✓ · apex→www single hop ✓ · no self-serving review schema ✓ · llms.txt live ✓ · sitemap clean of redirects/noindex ✓ · 0 missing alt text ✓.

---

```json
{ "findings": [
  { "finding": "Two 301'd blog posts (/blog/best-places-to-eat-near-heathrow, /blog/best-pub-food-near-heathrow) redirect to /blog/eating-near-heathrow-prices-compared which is noindex:true — legacy equity dead-ends at a non-indexable page; 20 internal links still point at the old URLs", "evidence": "content/blog/eating-near-heathrow-prices-compared/index.md:19 (noindex: true); live probe 301 → /blog/eating-near-heathrow-prices-compared; evidence/broken-internal-links.csv (20 rows); evidence/technical-signals.csv robots_meta='noindex, follow'", "source": "collect-site-evidence.py + codebase + live fetch", "dataStatus": "Known", "severity": "High", "confidence": "High", "impactArea": "SEO", "owner": "Technical", "effort": "Small", "dependencies": "Owner decision: re-point 301s to /restaurants-near-heathrow (recommended, matches June intent) or remove noindex", "fixType": "One-off page fix", "recommendedAction": "Re-point both redirects in config/redirects/ to /restaurants-near-heathrow and update the ~20 internal links to final destinations", "validationStep": "Live probe both URLs → 301 to /restaurants-near-heathrow; re-crawl shows 0 internal links to old slugs", "riskRollback": "Low — redirect config change, revert JSON entry" },
  { "finding": "Hard 404 /menus linked with anchor 'View Menu' from the World Cup live-sport page", "evidence": "app/live-sport/world-cup/page.tsx:151 (<Link href=\"/menus\">); evidence/broken-internal-links.csv target_status=404; live probe 404", "source": "collect-site-evidence.py + codebase + live fetch", "dataStatus": "Known", "severity": "Medium", "confidence": "High", "impactArea": "crawl/indexing", "owner": "Technical", "effort": "Small", "dependencies": "None", "fixType": "One-off page fix", "recommendedAction": "Change href to /food-menu", "validationStep": "Re-crawl: 0 links to /menus", "riskRollback": "None" },
  { "finding": "CWV measurement impossible: no CRUX_API_KEY/PAGESPEED_API_KEY (CrUX API 403), no GSC access — no field or lab performance data exists for any template", "evidence": "evidence/cwv-data-access.md (HTTP 403, keyless); evidence/cwv.csv source=unavailable", "source": "collect-cwv.py output", "dataStatus": "Known", "severity": "High", "confidence": "High", "impactArea": "SEO", "owner": "Analytics", "effort": "Small", "dependencies": "Owner: Google Cloud API key + GSC property access", "fixType": "Analytics/governance fix", "recommendedAction": "Set CRUX_API_KEY and PAGESPEED_API_KEY, link GSC exports into future runs; until then no CWV verdicts are possible", "validationStep": "collect-cwv.py returns field/lab rows", "riskRollback": "None" },
  { "finding": "163 pages flagged with >200KB images, root-caused to raw og:image source files: DEFAULT_OG_IMAGE is a 290KB JPG reused on 120 pages; corporate-events.jpg 226KB on 29; heathrow-airport-view.jpg 322KB — in-page images correctly use next/image AVIF/WebP", "evidence": "lib/image-fallbacks.ts:2; evidence/page-metadata.csv og_image counts (120/29/8); ls -la public/images/page-headers/* (290042/225838/322067 bytes); evidence/audit-summary.md (163 pages)", "source": "collect-site-evidence.py + codebase", "dataStatus": "inferred", "severity": "Medium", "confidence": "Medium", "impactArea": "SEO", "owner": "Technical", "effort": "Medium", "dependencies": "None (per-page og differentiation → Content)", "fixType": "Template/system fix", "recommendedAction": "Generate compressed 1200×630 og variants into public/images/og/ and point DEFAULT_OG_IMAGE + page-header og fields at them", "validationStep": "HEAD og:image URLs ≤200KB; re-crawl oversized count drops to ~6", "riskRollback": "Keep originals; revert constant" },
  { "finding": "/drinks Menu schema emits 146 Offers with empty price (invalid) and content/menu/drinks.json still hardcodes 32 cocktail prices, violating the SSOT prices-live-from-DB rule; /drinks carries the site's largest JSON-LD payload at 60KB", "evidence": "app/drinks/page.tsx:85-89; content/menu/drinks.json (146 empty / 32 hardcoded price fields, counted); evidence/schema-issues.csv (147 Offer + 145 MenuItem missing price on /drinks); evidence/schema.json /drinks 61300 bytes", "source": "validate-schema.py + codebase", "dataStatus": "Known", "severity": "Medium", "confidence": "High", "impactArea": "SEO", "owner": "Technical", "effort": "Medium", "dependencies": "Owner decision: source drinks prices from management DB (like food) or drop per-item Offers", "fixType": "Template/system fix", "recommendedAction": "Omit offers when price is blank; remove the 32 hardcoded prices per SSOT (fetch live or drop); slim the Menu block", "validationStep": "validate-schema.py: 0 missing-price Offers on /drinks; drinks.json contains no price literals", "riskRollback": "Schema-only change; revert file" },
  { "finding": "Cloudflare Email Address Obfuscation rewrites mailto: links into 244 links to /cdn-cgi/l/email-protection (404) on 236 pages, and replaces the email with '[email protected]' in raw HTML read by AI crawlers", "evidence": "evidence/broken-internal-links.csv (244 rows, target 404); components/EmailLink.tsx (mailto source); robots disallow /cdn-cgi/ limits Googlebot harm", "source": "collect-site-evidence.py + codebase", "dataStatus": "Known", "severity": "Medium", "confidence": "High", "impactArea": "AI visibility", "owner": "Technical", "effort": "Small", "dependencies": "Cloudflare dashboard access (Scrape Shield)", "fixType": "Template/system fix", "recommendedAction": "Turn off Email Address Obfuscation — the address is public in SSOT and schema; obfuscation protects nothing and corrupts the contact fact", "validationStep": "Re-crawl: 0 /cdn-cgi/l/email-protection links; raw HTML shows manager@the-anchor.pub", "riskRollback": "Toggle back on in Cloudflare" },
  { "finding": "~60 internal links point at 301'd URLs: old blog slugs (best-places ×10, best-pub-food ×10, plane-spotting-heathrow-guide ×9, pub-jobs-heathrow ×6) and old tag slugs — the June tag-alias 301 map is not applied when rendering tag links on posts", "evidence": "evidence/broken-internal-links.csv redirect rows; config/redirects/tag-redirects.json exists but tag chips still emit old slugs", "source": "collect-site-evidence.py + codebase", "dataStatus": "Known", "severity": "Medium", "confidence": "High", "impactArea": "crawl/indexing", "owner": "Technical", "effort": "Medium", "dependencies": "Content sweep for in-body markdown links", "fixType": "Template/system fix", "recommendedAction": "Apply the tag-alias map in the tag-link render path; batch-update in-body links to final URLs", "validationStep": "Re-crawl: redirect-target internal links drop to ~0 (excl. deliberate /leave-review)", "riskRollback": "None" },
  { "finding": "Blog template inlines the full stripped post text as articleBody, producing 24-27KB JSON-LD per post across 62 posts", "evidence": "app/blog/[slug]/page.tsx:290; evidence/schema.json per-page sizes (top blog posts 24.3-26.7KB)", "source": "validate-schema.py + codebase", "dataStatus": "Known", "severity": "Low", "confidence": "High", "impactArea": "SEO", "owner": "Technical", "effort": "Small", "dependencies": "None", "fixType": "Template/system fix", "recommendedAction": "Remove articleBody (not required by Google) or cap at the description", "validationStep": "Blog JSON-LD ≤5KB/page", "riskRollback": "Revert one line" },
  { "finding": "Entity-graph nits: Blog block references @id '#blogposting' that no block declares (BlogPosting @id is the bare post URL); 7 ParkingFacility 'owner' stubs typed Restaurant without address trigger validator missing-required", "evidence": "app/blog/[slug]/page.tsx:286 vs :332; evidence/schema.json owner stubs on /, /find-us, /near-heathrow, /beer-garden, /fish-and-chips-heathrow", "source": "validate-schema.py + codebase", "dataStatus": "Known", "severity": "Low", "confidence": "High", "impactArea": "SEO", "owner": "Technical", "effort": "Small", "dependencies": "None", "fixType": "Template/system fix", "recommendedAction": "Align the BlogPosting @id with the reference; replace owner stubs with {'@id': '#business'} references", "validationStep": "validate-schema.py: LocalBusiness/Restaurant missing-address rows → 0 (excl. artefacts)", "riskRollback": "Schema-only" },
  { "finding": "/live-sport/world-cup/sweepstake is indexable and self-canonical but absent from app/sitemap.ts; World Cup assets need an end-of-tournament disposition plan", "evidence": "evidence/technical-signals.csv (index,follow, in_sitemap=no); app/sitemap.ts staticRoutes has no sweepstake entry", "source": "collect-site-evidence.py + codebase", "dataStatus": "Known", "severity": "Low", "confidence": "High", "impactArea": "crawl/indexing", "owner": "Technical", "effort": "Small", "dependencies": "Owner: post-final content decision", "fixType": "One-off page fix", "recommendedAction": "Add to sitemap while live; after the final, 301 sweepstake to /live-sport/world-cup and keep the hub evergreen", "validationStep": "URL in sitemap.xml; post-tournament 301 live", "riskRollback": "Remove sitemap entry" },
  { "finding": "robots.txt disallows /leave-a-review but the live route is /leave-review (236 boilerplate links to an off-site 301 chain ending at Google)", "evidence": "app/robots.ts:19; evidence/technical-signals.csv /leave-review chain 301→g.page→google.com; internal-link-issues.md (473 anchor rows)", "source": "collect-site-evidence.py + codebase", "dataStatus": "Known", "severity": "Low", "confidence": "High", "impactArea": "crawl/indexing", "owner": "Technical", "effort": "Small", "dependencies": "None", "fixType": "Template/system fix", "recommendedAction": "Change the disallow rule to /leave-review (keep the route for UX)", "validationStep": "robots.txt shows /leave-review; GSC crawl stats stop fetching it", "riskRollback": "Revert rule" },
  { "finding": "Sitemap lastModified uses rolling new Date() for /sunday-roast, /easter-sunday, /private-hire/anniversary-parties — perpetually 'fresh' on every hourly regeneration, eroding lastModified trust", "evidence": "app/sitemap.ts:116,142,148,181", "source": "codebase", "dataStatus": "Known", "severity": "Low", "confidence": "High", "impactArea": "crawl/indexing", "owner": "Technical", "effort": "Small", "dependencies": "None", "fixType": "Template/system fix", "recommendedAction": "Replace RECENTLY_UPDATED with real content-change dates", "validationStep": "sitemap.xml lastmod stable across regenerations", "riskRollback": "Revert constant" },
  { "finding": "Dead function generateEventSchema hardcodes quiz £3 / bingo £10 prices — currently unimported but one import away from an SSOT prices-from-DB violation", "evidence": "lib/schema-utils.ts:137-200; grep shows no call sites", "source": "codebase", "dataStatus": "Known", "severity": "Low", "confidence": "High", "impactArea": "SEO", "owner": "Technical", "effort": "Small", "dependencies": "None", "fixType": "Template/system fix", "recommendedAction": "Delete the dead function", "validationStep": "Build passes; no hardcoded event prices in lib/", "riskRollback": "Git revert" },
  { "finding": "12 pub-near-*-heathrow hotel pages have near-identical template word counts (1492-1520 words) — doorway-page risk pattern; June 'R2 thin-hotel-page disposition' still open", "evidence": "evidence/url-inventory.csv word counts; project memory June 2026 open item", "source": "collect-site-evidence.py + prior-run memory", "dataStatus": "inferred", "severity": "Medium", "confidence": "Medium", "impactArea": "SEO", "owner": "Content", "effort": "Large", "dependencies": "Content uniqueness pass; no ranking data available to gauge current performance", "fixType": "Content process fix", "recommendedAction": "Uniqueness/consolidation decision per page before adding any further location pages", "validationStep": "Content diff shows substantive unique sections per page or consolidation shipped", "riskRollback": "Content-level; keep 301s if consolidating" },
  { "finding": "128 FAQPage + 18 HowTo blocks target retired rich results — valid markup, zero SERP enhancement expected", "evidence": "evidence/schema-issues.csv deprecated_or_retired; evidence/schema-validation-summary.md (146 retired)", "source": "validate-schema.py", "dataStatus": "Known", "severity": "Low", "confidence": "High", "impactArea": "SEO", "owner": "Technical", "effort": "Small", "dependencies": "None", "fixType": "Content process fix", "recommendedAction": "Keep (FAQ content is visible and aids AI answerability) but stop expecting rich results; don't add more for SERP purposes", "validationStep": "N/A — expectation-setting", "riskRollback": "N/A" },
  { "finding": "Boilerplate mega-nav/footer yields median 131 outbound internal links per page and 25 targets linked from >=80% of pages with 96-100% single-anchor concentration — equity dilution risk, directional only", "evidence": "evidence/internal-link-issues.md; internal-link-summary.csv (median outbound 131)", "source": "analyze-internal-links.py", "dataStatus": "Known", "severity": "Low", "confidence": "Low", "impactArea": "SEO", "owner": "Technical", "effort": "Large", "dependencies": "GSC data needed before restructuring", "fixType": "Template/system fix", "recommendedAction": "No change now; revisit nav/footer scope with GSC impression data", "validationStep": "N/A this run", "riskRollback": "N/A" },
  { "finding": "Soft-404 flags are false positives, but /blog/fish-chips-guide title/H1 use banned phrase 'The Anchor Pub' plus double brand suffix and cannibalise /fish-and-chips-heathrow", "evidence": "evidence/page-metadata.csv title 'Best Fish and Chips Near Heathrow | The Anchor Pub Guide | Blog | The Anchor Sta…'; SSOT banned-claims list", "source": "collect-site-evidence.py + SSOT", "dataStatus": "Known", "severity": "Medium", "confidence": "High", "impactArea": "SEO", "owner": "Content", "effort": "Small", "dependencies": "Content/editorial pass; consider consolidation into /fish-and-chips-heathrow", "fixType": "One-off page fix", "recommendedAction": "Retitle without banned phrase; decide merge vs differentiate against /fish-and-chips-heathrow", "validationStep": "Title contains 'The Anchor' only; drift-guard clean", "riskRollback": "Content revert" }
] }
```
