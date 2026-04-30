# Cache Headers Engineer — Handoff

## Outputs
- tasks/gsc-indexing-fix/evidence/robots-headers-www.the-anchor.pub-baseline.txt
- tasks/gsc-indexing-fix/evidence/robots-headers-the-anchor.pub-baseline.txt
- tasks/gsc-indexing-fix/evidence/robots-body-www.the-anchor.pub-baseline.txt
- tasks/gsc-indexing-fix/evidence/robots-body-the-anchor.pub-baseline.txt
- tasks/gsc-indexing-fix/evidence/sitemap-headers-www.the-anchor.pub-baseline.txt
- tasks/gsc-indexing-fix/evidence/sitemap-headers-the-anchor.pub-baseline.txt
- next.config.js (modified)

## Baseline header summary
- Live robots.txt Cache-Control (www): `public, max-age=86400`
- Live robots.txt Cache-Control (apex): `public, max-age=14400, must-revalidate` (HTTP/2 307 redirect to www)
- Live robots.txt CF-Cache-Status (www): `HIT` (age: 44985 s = ~12.5 h old; x-vercel-cache: HIT)
- Live robots.txt body still contains "/*?dpl=*"? **Yes** (www body has `Disallow: /*?dpl=*`; apex body is the redirect HTML and contains no dpl line, as expected)
- Live sitemap.xml Cache-Control (www): `public, max-age=0, must-revalidate`
- Live sitemap.xml CF-Cache-Status (www): `DYNAMIC` (x-vercel-cache: MISS)

## Code change
- next.config.js: changed `/robots.txt` Cache-Control from `public, max-age=86400` to `public, max-age=300, s-maxage=300, must-revalidate`.
- next.config.js: added new `/sitemap.xml` entry with the same Cache-Control (`public, max-age=300, s-maxage=300, must-revalidate`), placed immediately after the robots entry.
- Build status: **pass** (`npm run build` exit code 0; both `/robots.txt` and `/sitemap.xml` routes present in build output).

## Issues encountered
- None.

## Notes for downstream
- The Cache Headers fix becomes effective only after PR 1 deploys AND the owner runs the Cloudflare cache purge (R2.2). The post-deploy verification (A4) is not part of this agent's scope.
- The www `cf-cache-status: HIT` with age ~12.5 h confirms Cloudflare is currently caching `robots.txt` per the old 86400 s TTL — the planned manual Cloudflare purge (A3) is required immediately after deploy or the old body will continue to be served until that age expires.
- The apex domain (`the-anchor.pub`) returns a 307 redirect to www for both `/robots.txt` and `/sitemap.xml`; the new cache headers attach only to the www response (which is what crawlers ultimately fetch).
- Live sitemap.xml is already effectively uncached (`max-age=0`); the new 300 s value tightens to a still-short TTL while making behaviour consistent with robots.txt.
