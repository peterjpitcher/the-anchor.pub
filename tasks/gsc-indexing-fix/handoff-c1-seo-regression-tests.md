# SEO Regression Test Author — Handoff

## Output
- `tests/seo-indexing.test.ts` (new file)

## Test cases included
1. `robots.txt` does not disallow the deployment-tag query parameter (`/*?dpl=*`)
2. `robots.txt` allow rules include `/` AND `/_next/static/`
3. Sitemap URLs are not redirect sources (catches the `/drinks/baby-guinness`-style contradiction)
4. Sitemap does not include any blog post with `noindex: true` in frontmatter
5. No redirect's destination equals its own source (no self-loops)
6. No redirect destination is also a redirect source (no two-step chains — this is a hard fail)

## Test run output
```
PASS tests/seo-indexing.test.ts
  robots.txt
    ✓ does not disallow the deployment-tag query parameter (`/*?dpl=*`) (1 ms)
    ✓ allows root and static assets so crawlers can render pages
  sitemap-vs-redirects
    ✓ does not list any URL that is also a redirect source (14 ms)
  sitemap-vs-noindex
    ✓ does not include any blog post that has noindex: true in its frontmatter (10 ms)
  redirect-loops
    ✓ has no redirect whose destination matches its own source
    ✓ has no two-step redirect chains (a redirect destination is not also a redirect source)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Time:        0.256 s
```

- `npx tsc --noEmit` — clean (no errors)
- `npx next lint --file tests/seo-indexing.test.ts` — no warnings or errors

## Manual regression verification
Temporarily added `'/*?dpl=*'` to the `disallow` array in `app/robots.ts`. Re-ran `npm test -- seo-indexing` and Test 1 failed with the exact diff expected:

```
expect(received).toEqual(expected) // deep equality
- Array []
+ Array [
+   "/*?dpl=*",
+ ]
```

Reverted `app/robots.ts` immediately after. `git status` confirms only `tests/seo-indexing.test.ts` is untracked; no production code is changed.

## Issues encountered
1. **Initial test failed to load** — `app/sitemap.ts` imports `lib/markdown.ts`, which imports `remark` (a pure-ESM package). Jest's CommonJS transformer choked on it.
2. **Resolution** — added a `jest.mock('@/lib/markdown', ...)` factory that walks `content/blog/*` directly with `gray-matter`. This keeps the test grounded in real frontmatter (so it actually validates `noindex` posts and tag lists) while skipping the markdown-to-HTML pipeline that pulls in `remark`.

## Notes
### Mocking strategy
- `@/lib/api` mocked to return `{ events: [] }` for `getEvents` — the events sitemap is dynamic and depends on the management API, which is correctly out of scope for an indexing-contract test.
- `@/lib/markdown.getAllBlogPosts` re-implemented inline using `fs` + `gray-matter` so the test reads real `content/blog/*/index.md` frontmatter without invoking `remark`.
- All six redirect JSON files imported directly and concatenated. Total of 646 redirects validated on every run (98 + 159 + 75 + 6 + 150 + 158).

### Patterned source handling
Redirect sources containing `:slug` or `:path*` (e.g. `/event-details/:slug`) are filtered out via `isConcretePath()` before comparing against the sitemap or checking for chain destinations. Without this filter, a wildcard rule could match anything and would produce false positives.

### What the tests do NOT cover (deliberate scope)
- Whether canonical URLs in page metadata point to the sitemap-listed path (separate concern).
- Whether `noindex: true` blog posts are also excluded from tag pages (the existing `getPostsByTag` already filters `!post.noindex`).
- Whether dynamic event URLs in the sitemap are valid 200 responses (would require a network probe).

These were out of scope per the brief — the five listed failure modes are the ones that have actually shipped in production.
