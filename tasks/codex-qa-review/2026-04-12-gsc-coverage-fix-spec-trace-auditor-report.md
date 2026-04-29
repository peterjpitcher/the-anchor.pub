**Requirements Traceability Matrix**

Audited against installed `next@14.2.13`.

| Issue | Spec Requirement | Code Mapping | Missing / Deviation / Ambiguity | Classification |
|---|---|---|---|---|
| 1. CSS blocked by `?dpl=*` | Modify [app/robots.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/robots.ts:3) to allow `/_next/static/` while keeping `/*?dpl=*` blocked. | Current file has one `MetadataRoute.Robots` rule with `allow: '/'` and a `disallow` array containing `/*?dpl=*` at [app/robots.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/robots.ts:7). The installed route type allows `allow?: string | string[]` and `disallow?: string | string[]` in the same rule at [metadata-interface.d.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/node_modules/next/dist/lib/metadata/types/metadata-interface.d.ts:457). The serializer emits all `Allow:` lines, then all `Disallow:` lines at [resolve-route-data.js](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/node_modules/next/dist/build/webpack/loaders/metadata/resolve-route-data.js:24). | The intent is valid, but the spec patch shape is misleading. In this codebase you cannot literally insert `{ allow: '/_next/static/' }` “before” the disallow entry unless you either change `allow` from a string to an array or create another full rule group with `userAgent`. Also, Google resolves conflicts by most specific match, not source order. | **PARTIALLY TRACEABLE** |
| 2. Delete test pages | Delete all 10 route directories under `app/`. | All 10 directories exist. Each contains exactly `page.tsx` and `head.tsx`; there are no `layout.tsx`, `loading.tsx`, or other files. Current robots disallows for these routes are already present in [app/robots.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/robots.ts:23). | The spec’s per-file list is incomplete because it mentions only `page.tsx`, but the directory-level requirement is accurate and sufficient. | **FULLY TRACEABLE** |
| 3. OG image robots.txt | Add `disallow: '*/opengraph-image'` to [app/robots.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/robots.ts:3). | The only `opengraph-image` route is [app/events/[id]/opengraph-image.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/events/[id]/opengraph-image.tsx:17), which already sets `X-Robots-Tag: noindex, nofollow, noimageindex` at [app/events/[id]/opengraph-image.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/events/[id]/opengraph-image.tsx:145). `MetadataRoute.Robots` will serialize any string verbatim. | Next.js will emit `Disallow: */opengraph-image` exactly, but Google’s robots syntax requires path values to start with `/`. So the proposed pattern is wrong as written. For the current codebase, `/events/*/opengraph-image` is the clean rooted rule. | **SPEC DEFECT** |
| 5. `cdn-cgi` | Add `disallow: '/cdn-cgi/'` to [app/robots.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/robots.ts:3). | Same rule object and type support as Issue 1. `disallow` accepts strings/arrays and the serializer will emit `Disallow: /cdn-cgi/` verbatim. | No structural ambiguity. This maps directly to the existing `disallow` array. | **FULLY TRACEABLE** |
| 8. Blog tag `noindex` | Add conditional `noindex` in [app/blog/tag/[tag]/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/blog/tag/[tag]/page.tsx:36) based on post count. | `generateMetadata` only derives SEO from the tag slug at [app/blog/tag/[tag]/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/blog/tag/[tag]/page.tsx:36). The page component separately calls `getAllBlogPosts()` and filters posts at [app/blog/tag/[tag]/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/blog/tag/[tag]/page.tsx:59). `getAllBlogPosts()` is a plain filesystem read at [lib/markdown.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/markdown.ts:116), and there is no shared cache wrapper for this page. | The behavior is implementable, but not as cleanly as the spec implies. `generateMetadata` can only know the count by re-reading posts or by introducing a shared helper/cache. The spec snippet references `getPostsByTag(tag)`, which does not exist. | **PARTIALLY TRACEABLE** |

**Generated `robots.txt` Excerpts**

Using Next’s installed serializer in `resolve-route-data.js`, the current route renders as:

```txt
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /_next/data/
Disallow: /_next/static/media/
Disallow: /*?dpl=*
...
Sitemap: https://www.the-anchor.pub/sitemap.xml
```

If Issue 1 is implemented correctly by changing `allow` to an array, Next emits:

```txt
User-Agent: *
Allow: /
Allow: /_next/static/
Disallow: /api/
Disallow: /_next/data/
Disallow: /_next/static/media/
Disallow: /*?dpl=*
...
```

If Issue 3 and 5 are inserted literally, Next emits them verbatim:

```txt
Disallow: */opengraph-image
Disallow: /cdn-cgi/
```

That confirms two things:
- `MetadataRoute.Robots` does support multiple `Allow` entries alongside `Disallow`.
- Next does not validate wildcard/path correctness; it just prints the strings you give it.

**External Reference**

Google’s robots spec says path values must start with `/`, supports `*` and `$`, and resolves conflicts by the most specific rule, using the least restrictive rule on ties:  
https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec