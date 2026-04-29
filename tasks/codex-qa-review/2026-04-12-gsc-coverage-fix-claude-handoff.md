# Claude Hand-Off Brief: GSC Coverage Fix Spec

**Generated:** 2026-04-12
**Review mode:** Spec Compliance (Mode C) — 5 Codex reviewers
**Overall risk assessment:** High (1 critical rendering fix needed, 2 spec defects would cause harm if implemented as written)

## DO NOT REWRITE

These areas of the spec are sound and should be preserved:

- **Issue 1 diagnosis** — `/*?dpl=*` blocking CSS is correct and confirmed against live production
- **Issue 2 intent** — deleting test pages is the right call, no production dependencies found
- **Issue 5** — adding `/cdn-cgi/` disallow is correct and recommended by Cloudflare
- **Issue 7** — no code change needed, sitemap fix already deployed
- **Issue 9** — middleware handles non-www correctly, no code change needed
- **"No Action Required" section** — all assessments are accurate
- **Expected Outcomes table** — directionally correct

## SPEC REVISION REQUIRED

- [x] **SPEC-1:** Rewrite Issue 1 fix syntax. The spec shows `{ allow: '/_next/static/' }` as a separate entry. The actual fix is: change `allow: '/'` to `allow: ['/', '/_next/static/']` in the existing rules object. Note that precedence is determined by Google's path specificity rules, not by line order in robots.txt.

- [x] **SPEC-2:** Remove Issue 3 entirely. Do NOT add `*/opengraph-image` to robots.txt. It would break social media preview images on Twitter/X, Facebook, and LinkedIn. The existing `X-Robots-Tag` header on the OG route is sufficient and correct. The claim that social crawlers ignore robots.txt is false.

- [x] **SPEC-3:** Remove Issue 4 entirely. `drinks-1920w` does not exist in the codebase. The reference is external/legacy and cannot be fixed with a code change.

- [x] **SPEC-4:** Rewrite Issue 8 (blog tag noindex). Do NOT use a blanket `<3 posts` threshold. Some single-post tags (food, parking, entertainment) are curated SEO landing pages with bespoke copy in `lib/tag-seo-content.ts`. Also, `generateMetadata()` doesn't have access to post count — the spec's code snippet references `getPostsByTag(tag)` which doesn't exist. Recommendation: defer this to a manual tag-by-tag review.

- [x] **SPEC-5:** Downgrade Issue 6 (booking URL disallow) from "optional fix" to "do not implement." GSC already shows canonical resolution working. Adding robots.txt blocks would prevent Google from verifying canonicals on recrawl. The real fix is normalising the internal links that generate parameterised URLs.

- [x] **SPEC-6:** Fix the verification workflow. Replace "request re-indexing in GSC" with: deploy → verify live `/robots.txt` → use GSC robots.txt report "Request a recrawl" → wait for natural page recrawl (days to weeks).

- [x] **SPEC-7:** Expand Issue 2 scope. The spec lists 10 page.tsx files. Each directory also has head.tsx (20 files total). Additionally, update `app/sitemap-page/page.tsx` (links to test pages) and `scripts/audit-hero.js` (references test pages). Optionally clean up the 10 test page disallow entries in `app/robots.ts`.

## IMPLEMENTATION CHANGES REQUIRED

- [x] **IMPL-1:** `app/robots.ts` — Change `allow: '/'` to `allow: ['/', '/_next/static/']`. Add `'/cdn-cgi/'` to the disallow array. Do NOT add `*/opengraph-image` or `/book-table?*`.

- [x] **IMPL-2:** Delete 10 directories (20 files): `app/test-simple/`, `app/test-tracking/`, `app/test-reviews/`, `app/test-gtm/`, `app/test-navigation-tracking/`, `app/test-hours/`, `app/gtm-debug/`, `app/debug-hours/`, `app/demo-header/`, `app/components/`

- [x] **IMPL-3:** `app/sitemap-page/page.tsx` — Remove links to deleted test/debug pages.

- [x] **IMPL-4:** `scripts/audit-hero.js` — Remove or update references to test pages.

- [x] **IMPL-5:** `app/robots.ts` — Optionally remove the 10 test page disallow entries (they become harmless no-ops but add clutter).

## ASSUMPTIONS TO RESOLVE

- [ ] **ASSUMPTION-1:** Live CSS `X-Robots-Tag` header value. The Integration reviewer reports live CSS returns `X-Robots-Tag: all`, not `noindex, nofollow` as configured in `next.config.js`. If true, the safety net assumption is wrong. → **Verify:** `curl -I https://www.the-anchor.pub/_next/static/css/<any-hash>.css`

- [ ] **ASSUMPTION-2:** Cloudflare robots.txt modification. Does Cloudflare prepend or modify the robots.txt output? → **Verify:** Compare output of `curl https://www.the-anchor.pub/robots.txt` with the app/robots.ts source.

- [ ] **ASSUMPTION-3:** Blog tag curation status. Which of the 8 single-post tags are curated SEO pages vs auto-generated? → **Action:** Review `lib/tag-seo-content.ts` and decide per-tag whether to noindex.

## REPO CONVENTIONS TO PRESERVE

- robots.ts uses `MetadataRoute.Robots` return type — maintain this pattern
- Redirect configs are JSON files in `config/redirects/` — don't inline redirects
- Test pages use the old Next.js `head.tsx` convention — when deleting, remove the whole directory
- `app/sitemap-page/page.tsx` is an internal HTML sitemap page — keep it updated when routes change

## RE-REVIEW REQUIRED AFTER FIXES

- [ ] **CR-1:** After robots.ts change, verify live `/robots.txt` output includes `Allow: /_next/static/`
- [ ] **CR-2:** After deployment, use GSC URL Inspection "Test Live URL" on homepage — check CSS is no longer blocked in "Page resources"
- [ ] **ASSUMPTION-1:** Verify live CSS X-Robots-Tag header after deployment
- [ ] **ID-1:** After test page deletion, verify `npm run build` succeeds and `app/sitemap-page/` renders without broken links

## REVISION PROMPT

You are revising the GSC Coverage Fix Spec (`docs/gsc-coverage-fix-spec.md`) based on an adversarial review by 5 Codex specialist agents.

Apply these changes in order:

1. **Issue 1:** Rewrite the fix to change `allow: '/'` to `allow: ['/', '/_next/static/']`. Remove the claim about line ordering. Note that Google uses path specificity, not position.

2. **Issue 3:** DELETE ENTIRELY. The OG image disallow would break social media previews. Social crawlers (Twitter, Facebook, LinkedIn) DO respect robots.txt. The existing X-Robots-Tag header is correct and sufficient.

3. **Issue 4:** DELETE ENTIRELY. `drinks-1920w` is not referenced anywhere in the codebase. Reclassify as external/legacy with no code fix.

4. **Issue 2:** Expand to note 20 files (page.tsx + head.tsx per directory). Add `app/sitemap-page/page.tsx` and `scripts/audit-hero.js` to the files-to-modify list.

5. **Issue 6:** Change recommendation to "Do not implement." Canonical resolution is already working. Robots.txt blocking would be counterproductive.

6. **Issue 8:** Change recommendation to "Defer — requires manual tag review." Remove the <3 threshold code snippet. Note that some single-post tags are curated SEO pages.

7. **Verification section:** Replace "request re-indexing" with the correct workflow: deploy → verify live robots.txt → GSC robots.txt report recrawl → wait for natural page recrawl.

8. **Files to Modify table:** Remove Issue 3 and Issue 4 entries. Add `app/sitemap-page/page.tsx` and `scripts/audit-hero.js`.

After applying changes, confirm:
- [ ] All spec revisions applied
- [ ] Issues 3 and 4 fully removed
- [ ] No recommendation to block opengraph-image in robots.txt
- [ ] No recommendation to block /book-table?* in robots.txt
- [ ] Correct robots.ts syntax using allow array
- [ ] Test page deletion scope includes head.tsx and downstream references
