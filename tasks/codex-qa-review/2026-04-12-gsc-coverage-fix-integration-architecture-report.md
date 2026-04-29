**Key Findings**
- The spec is wrong about `robots.ts` ordering: `MetadataRoute.Robots` does not support interleaving `Allow` and `Disallow` directives. Next.js serializes all `Allow` lines first, then all `Disallow` lines.
- The proposed `Allow: /_next/static/` can still work for Google, but because it is more specific than `/*?dpl=*`, not because it appears “before” it.
- The spec also conflates crawl control and index control. For the affected CSS URLs, `robots.txt` decides whether Google can fetch the file at all; only after a fetch can `X-Robots-Tag` matter.
- As of April 12, 2026, production HTML on `www.the-anchor.pub` still contains `?dpl=` asset URLs. Vercel is not stripping them out of production HTML.
- Deleting the test/debug routes is code-safe, but it will require cleanup in [`app/sitemap-page/page.tsx`](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/sitemap-page/page.tsx:169) and [`app/robots.ts`](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/robots.ts:25).

## 1. `robots.ts` Allow/Disallow Precedence

**Verdict:** The spec’s mechanism is misstated, but the proposed allow rule is still directionally valid for Google.

Local Next.js 14.2.35 defines `MetadataRoute.Robots` with separate `allow?: string | string[]` and `disallow?: string | string[]` fields, not an ordered mixed list: [`metadata-interface.d.ts`](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/node_modules/next/dist/lib/metadata/types/metadata-interface.d.ts:457). The serializer always emits:

1. `User-Agent`
2. all `Allow` lines
3. all `Disallow` lines
4. `Crawl-delay`

That is explicit in [`resolve-route-data.js`](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/node_modules/next/dist/build/webpack/loaders/metadata/resolve-route-data.js:24).

So “add `Allow` before `Disallow`” is not a real API concept. If you add `allow: ['/', '/_next/static/']`, the generated block would be:

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

Current production already proves line order is not the deciding factor: it already has `Allow: /` above `Disallow: /*?dpl=*`, and those `?dpl=` URLs are still blocked. The reason is specificity, not position.

For Google, the matching rule is the most specific rule by path length; ties go to the least restrictive rule. That means `Allow: /_next/static/` should beat `Disallow: /*?dpl=*` for `/_next/static/css/...?...`, while `Disallow: /_next/static/media/` would still beat the broader allow for media assets.

One additional architectural nuance: deployed `robots.txt` is not only the Next.js output. Cloudflare prepends its own managed block before the site’s generated block, so the exact production file is downstream-modified.

## 2. `robots.txt` vs `X-Robots-Tag` for a CSS URL

**Verdict:** The spec conflates two different layers. For the exact problematic CSS URL, `robots.txt` is the gatekeeper.

For `/ _next/static/css/abc123.css?dpl=dpl_XYZ`, the flow is:

1. Googlebot fetches `https://www.the-anchor.pub/robots.txt`.
2. It evaluates the `User-Agent: *` rules from [`app/robots.ts`](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/robots.ts:3).
3. Today, `Allow: /` and `Disallow: /*?dpl=*` both match, but the query-string rule is more specific, so crawling is denied.
4. Because crawling is denied, Google never requests the CSS URL.
5. Because it never requests the CSS URL, it never sees any `X-Robots-Tag` header on that response.

If you add `Allow: /_next/static/`, Google should be allowed to fetch that CSS URL. Only then could an `X-Robots-Tag` influence indexability.

There is a second problem for the spec: the live asset response does **not** currently show the configured `X-Robots-Tag: noindex, nofollow` from [`next.config.js`](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/next.config.js:39). On April 12, 2026, live CSS and JS asset responses returned `X-Robots-Tag: all`. So the spec’s claimed “allow crawl, then rely on X-Robots-Tag noindex” safety net is not supported by current production behavior.

## 3. Vercel `?dpl=` Parameter Interaction

**Verdict:** `?dpl=` is not being stripped from production HTML. The fix is not unnecessary.

Observed on April 12, 2026:

- `https://www.the-anchor.pub/` production HTML contains CSS and JS URLs with `?dpl=...`.
- `https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots` also ships production asset URLs with `?dpl=...` and a `data-dpl-id` on the document.

So this is not preview-only behavior.

What the edge/CDN does seem to do is tolerate the parameter when serving the asset. Requesting the same CSS file with and without `?dpl=` both returned `200 OK` and the same `x-matched-path`. That means the platform can resolve the asset either way, but it does **not** remove the parameter from the HTML that crawlers discover.

Architectural implication: the robots change still matters. Even if the CDN can serve the file without caring about `?dpl=`, Google evaluates `robots.txt` against the URL it discovered in HTML. If that discovered URL is blocked, the fetch never happens.

Side note: [`app/[...unmatched]/page.tsx`](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/%5B...unmatched%5D/page.tsx:13) comments that `?dpl=` is for “Vercel preview deploy URLs”, which is too narrow given the current production asset HTML.

## 4. Test Page Deletion Impact

**Verdict:** Deletion is safe from a code dependency standpoint, but not from a link-cleanup standpoint.

I checked the named routes plus `app/components` and found no imports of those route modules from production code. The only external references are:

- [`app/robots.ts`](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/robots.ts:25), which disallows them
- [`app/sitemap-page/page.tsx`](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/sitemap-page/page.tsx:169), which links to them

That means deleting these routes will not break components, utilities, or app logic elsewhere.

The pages do import shared production code such as `HeroWrapper`, `StatusBar`, `useBusinessHours`, reviews components, GTM helpers, `BookTableButton`, and `WhatsAppLink`, but those imports flow one-way. Removing the routes does not endanger the shared modules; those are used elsewhere.

Practical implication: if these directories are deleted, `app/sitemap-page/page.tsx` must be updated in the same change or it will contain dead internal links. Removing the corresponding disallow entries in `app/robots.ts` is optional cleanup, not a functional requirement.

## 5. Redirect Volume

**Verdict:** 675 redirects is below the published limits and not an immediate architectural problem.

Local counts from the current config are:

- `wix`: 158
- `blog`: 198
- `tag`: 139
- `legacy`: 6
- `drinks`: 76
- `additional`: 98
- Total loaded by [`next.config.js`](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/next.config.js:4): **675**

Current docs are inconsistent:

- Next.js docs (updated April 8, 2026) still say that on Vercel there is a limit of **1,024 redirects**.
- Vercel’s current routing docs say **“Number of redirects in the array: 2,048.”**

Either way, 675 is comfortably below the cap. Even against the more conservative 1,024 figure, this is not “approaching the limit” yet.

Architecturally, the real watch-out is future growth:
- Vercel also has route-count limits that include headers/redirects/rewrites.
- This app already adds custom headers and framework-generated routes on top of the 675 redirects.

So I would treat 1,024 as the conservative planning threshold, but I would not re-architect redirects at 675.

## Sources
- Local code: [`app/robots.ts`](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/robots.ts:3), [`next.config.js`](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/next.config.js:39), [`middleware.ts`](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/middleware.ts:4), [`app/sitemap-page/page.tsx`](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/sitemap-page/page.tsx:169), [`app/[...unmatched]/page.tsx`](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/%5B...unmatched%5D/page.tsx:13)
- Next.js local type/serializer: [`metadata-interface.d.ts`](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/node_modules/next/dist/lib/metadata/types/metadata-interface.d.ts:457), [`resolve-route-data.js`](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/node_modules/next/dist/build/webpack/loaders/metadata/resolve-route-data.js:24)
- Next.js robots docs: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
- Google robots precedence: https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec
- Google noindex vs robots.txt: https://developers.google.com/search/docs/crawling-indexing/block-indexing
- Next.js redirect guide: https://nextjs.org/docs/app/guides/redirecting
- Vercel redirect limits: https://vercel.com/docs/routing/redirects/configuration-redirects
- Runtime observations: https://www.the-anchor.pub/robots.txt and live production asset URLs under `https://www.the-anchor.pub/_next/static/...`