# Orphan Spot-Checker — Handoff

## Outputs
- `tasks/gsc-indexing-fix/REVIEW-PACK.md` (§14.6 appended after §14.5; §15+ unchanged)
- `tasks/gsc-indexing-fix/evidence/orphan-spot-check.json`

## Sampled URLs
- Stratum 1 (recent blog post): `https://www.the-anchor.pub/blog/christening-party-ideas-venues` (last_crawled 2026-04-16)
- Stratum 2 (older blog post): `https://www.the-anchor.pub/blog/this-december-at-the-anchor` (last_crawled 2025-12-26) — substituted; see note
- Stratum 3 (tag page): `https://www.the-anchor.pub/blog/tag/news` (last_crawled 2026-04-10)
- Stratum 4 (drink page): `https://www.the-anchor.pub/drinks/bells` (last_crawled 2026-03-03) — caveat below
- Stratum 5 (event page): `https://www.the-anchor.pub/events/music-bingo-2026-05-08` (last_crawled 2026-04-28)

### Substitutions
- **Older blog post**: cohort's first older `cohort=post` URL was `/post/introducing-new-dining-room-the-anchor?utm_source=...` — a `legacy_wix` redirect-source URL with UTM params (no live page; meaningless linking target). Substituted with the first clean `/blog/` not-indexed cohort URL older than 60 days.
- **Drink page**: all 4 `cohort=drink` URLs in the not-indexed cohort are `url_type=redirect_source`. Kept the first match but flagged the redirect-source caveat in §14.6.

## Aggregate result
- ORPHAN or WEAK: **2/5**
- ADEQUATE: **3/5**
- Recommendation: **investigate** alternative root causes (content quality, event-page lifecycle, legacy `/post/` redirects, sitemap issues) before approving the bulk linking sweep (R2.6). The 4+/5 owner-approved threshold for "proceed" was not met.

## Static vs rendered divergence (the headline finding)

Static grep (Method A) dramatically under-counts on every URL with rendered links:

| URL | Method A | Method B | Δ |
|---|---|---|---|
| `/blog/christening-party-ideas-venues` | 0 | 4 | +4 |
| `/blog/this-december-at-the-anchor` | 0 | 5 | +5 |
| `/blog/tag/news` | 1 | 14 | +13 |
| `/drinks/bells` | 0 | 0 | 0 |
| `/events/music-bingo-2026-05-08` | 0 | 0 | 0 |

The consultant's caveat ("rendered crawl is mandatory; static grep over-counts orphans") is empirically validated. The actual link graph is generated at build time from blog frontmatter tags, the tag index component, the related-posts component, and tag-page sibling rails — none of which a `grep` over `app/components/content` can see.

If the 3-URL pre-flight that prompted the orphan hypothesis was static-only, it would have classified all 3 as "orphans" while the rendered build would have shown them adequately linked.

## Issues encountered
- None. Build completed cleanly (exit 0, 275 HTML files generated). No source code touched.

## Notes for orchestrator (wave gate review)

1. **Don't approve R2.6 (bulk linking sweep) on the 3-URL pre-flight evidence.** Re-run Method B over the full 116-URL cohort before any bulk action; the spot check shows the orphan hypothesis is false for blog posts and tag pages.
2. **Update Workstreams E2/E3/E4 to mandate Method B (rendered-HTML scan).** Any link-graph work that uses static grep will mis-classify majority-cohort URLs.
3. **Re-scope linking work narrowly.** Only act on URLs that Method B confirms are truly 0/0 incoming, and even then check whether the URL should exist at all (e.g. `/drinks/bells` is a redirect source — the right action is to fix the redirect, not add internal links).
4. **Likely true root causes for the 116-cohort to investigate next:** thin/low-value content, date-stamped event pages aging out post-event, legacy `/post/` Wix redirect handling (already a P0 in §0.1), sitemap intermittent errors (already R2.7).

## Verification
- `git status` — only `tasks/gsc-indexing-fix/` paths modified (REVIEW-PACK.md edited, two new files added). No source code changes.
- `tasks/gsc-indexing-fix/evidence/orphan-spot-check.json` is valid JSON with the full per-URL record.
- §14.6 appended after §14.5; §15 and §17 unchanged (verified by line counts and section header scan).
