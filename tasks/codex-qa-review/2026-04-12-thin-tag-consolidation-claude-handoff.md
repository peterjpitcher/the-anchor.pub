# Claude Hand-Off Brief: Thin Tag Page Consolidation

**Generated:** 2026-04-12
**Review mode:** Spec Compliance (Mode C)
**Overall risk assessment:** HIGH (one critical data issue blocks correctness)

## DO NOT REWRITE
- The 6 surviving `tagSEOContent` entries (food-and-drink, guides, private-hire, travel, heathrow, birthdays) — content is good
- The consolidation map (which thin tags → which parents) — mapping is correct
- The redirect JSON format (`permanent: true`) — matches existing patterns
- `app/sitemap.ts` — already handles redirect filtering correctly
- `next.config.js` — no changes needed

## SPEC REVISION REQUIRED

- [ ] **SPEC-1:** Add `guide` → `guides` tag standardisation as a new Change 0 (prerequisite). 16 blog posts use `guide` (singular) which is a separate tag from `guides` (plural). List all 16 post slugs. Also add a `guide` → `guides` redirect to `tag-redirects.json`.
- [ ] **SPEC-2:** Update Change 2 table — add the 3 missing posts: `retirement-party-ideas-venues` (work-events, already has private-hire ✓), `leaving-party-ideas` (work-events, already has private-hire ✓), `cheap-heathrow-parking-alternatives` (savings, already has guides ✓). Mark all three as "no frontmatter change needed".
- [ ] **SPEC-3:** In Change 2, change `private-room-hire-cost-near-heathrow` action from "Add `guides`" to "Change `guide` → `guides`" (covered by SPEC-1 bulk rename). Same for `pub-vs-hotel-celebration-venue`.
- [ ] **SPEC-4:** In Change 4, list the 10 entries to remove by key name, not by location reference. The comment block also contains the 6 keepers.
- [ ] **SPEC-5:** Add Change 5: Filter redirected tags from `/blog/tags` page tag cloud. Import `tagRedirects` and build an exclusion set (same pattern as `app/sitemap.ts` lines 211-215).

## IMPLEMENTATION CHANGES REQUIRED

- [ ] **IMPL-1:** Rename `guide` → `guides` in 16 blog post frontmatter files (bulk find-replace in `content/blog/*/index.md`)
- [ ] **IMPL-2:** Add `{ "source": "/blog/tag/guide", "destination": "/blog/tag/guides", "permanent": true }` to `config/redirects/tag-redirects.json`
- [ ] **IMPL-3:** Add 10 thin-tag redirects to `config/redirects/tag-redirects.json` (as listed in spec)
- [ ] **IMPL-4:** Remove 10 dead entries from `lib/tag-seo-content.ts`: christenings, work-events, savings, function-room, gender-reveal, things-to-do, plane-spotting, pricing, comparison, wakes
- [ ] **IMPL-5:** Refactor `app/blog/tags/page.tsx`: replace hardcoded `tagInfo` with `getTagSEOContent()`, filter out redirect source tags from grid
- [ ] **IMPL-6 (optional):** Filter `generateStaticParams` in `app/blog/tag/[tag]/page.tsx` to skip redirect source tags (reduces build waste)

## ASSUMPTIONS TO RESOLVE

None — all assumptions verified against codebase.

## REPO CONVENTIONS TO PRESERVE

- Redirect format: `{ "source": "...", "destination": "...", "permanent": true }` — do NOT use `statusCode: 301` directly
- Blog frontmatter tags are YAML arrays with `  - tagname` format (2-space indent)
- Tag normalisation happens in `normalizeTagSlug()` within the tag page (lowercases, trims, decodes URI) but does NOT handle singular/plural

## RE-REVIEW REQUIRED AFTER FIXES

- [ ] CR-1: After `guide` → `guides` rename, verify `/blog/tag/guides` shows 43 posts (27 existing + 16 renamed)
- [ ] ID-1: After `/blog/tags` filtering, verify redirected tags no longer appear in tag cloud

## REVISION PROMPT

You are revising the thin tag consolidation spec and implementation based on an adversarial review.

Apply these changes in order:

1. **Spec revision:** Update `docs/superpowers/specs/2026-04-12-thin-tag-page-consolidation-design.md` with SPEC-1 through SPEC-5
2. **guide→guides rename:** Change `  - guide` to `  - guides` in these 16 files:
   - content/blog/30th-birthday-party-ideas-venues/index.md
   - content/blog/40th-birthday-party-ideas-venues/index.md
   - content/blog/50th-birthday-party-ideas-venues/index.md
   - content/blog/60th-birthday-party-ideas-venues/index.md
   - content/blog/christening-party-ideas-venues/index.md
   - content/blog/function-room-hire-near-heathrow-staines/index.md
   - content/blog/gender-reveal-party-ideas-venues/index.md
   - content/blog/how-to-plan-christening-reception/index.md
   - content/blog/how-to-plan-surprise-birthday-party/index.md
   - content/blog/leaving-party-ideas/index.md
   - content/blog/private-party-venues-near-heathrow/index.md
   - content/blog/private-room-hire-cost-near-heathrow/index.md
   - content/blog/pub-vs-hotel-celebration-venue/index.md
   - content/blog/pub-with-private-room-near-heathrow/index.md
   - content/blog/retirement-party-ideas-venues/index.md
   - content/blog/wake-venue-near-heathrow/index.md
3. **Add guide→guides redirect** to config/redirects/tag-redirects.json
4. **Add 10 thin-tag redirects** to config/redirects/tag-redirects.json
5. **Remove 10 dead tagSEOContent entries** from lib/tag-seo-content.ts
6. **Refactor /blog/tags page** to use getTagSEOContent() and filter redirected tags
7. Preserve: the 6 surviving tag content entries, redirect JSON format, sitemap filtering

After applying changes, confirm:
- [ ] All 16 blog posts updated from guide → guides
- [ ] 11 new redirects in tag-redirects.json (1 guide→guides + 10 thin tags)
- [ ] 10 dead entries removed from tagSEOContent
- [ ] /blog/tags page uses getTagSEOContent() and hides redirected tags
- [ ] npm run build passes
- [ ] npm test passes
