# Workflow & Failure-Path Review

1. **High: the proposed `Disallow: */opengraph-image` is unsafe and the rationale is wrong.**  
   In [docs/gsc-coverage-fix-spec.md](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/docs/gsc-coverage-fix-spec.md:99), the spec says social crawlers “typically ignore robots.txt.” That is false for X and overstated for Meta. This site’s event pages explicitly use the OG route as `og:image` at [event page](</Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/events/[id]/page.tsx:163>), and the image route already sends `X-Robots-Tag: noindex, nofollow, noimageindex` at [opengraph image](</Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/events/[id]/opengraph-image.tsx:146>). X’s docs say `Twitterbot` respects robots.txt and that if an image URL is blocked, no thumbnail is shown. Meta’s docs say `FacebookExternalHit` is governed by robots.txt, with limited bypass exceptions for security/integrity checks. I did not find a LinkedIn doc that explicitly says “LinkedInBot obeys robots.txt”, but LinkedIn Help says previews fail when the site blocks LinkedIn from pulling the image; that makes a robots disallow operationally risky by inference.  
   **Recommendation:** do not add a global disallow for `opengraph-image`. Keep the existing `X-Robots-Tag`. If crawl volume ever becomes material, use crawler-specific rules, not `User-agent: *`.

2. **High: the robots.txt recrawl workflow in the spec is incorrect.**  
   [docs/gsc-coverage-fix-spec.md](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/docs/gsc-coverage-fix-spec.md:46) and [same file](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/docs/gsc-coverage-fix-spec.md:303) imply “request re-indexing” after robots changes. Google’s URL Inspection tool is for page URLs, not for refreshing `robots.txt`. Google’s docs say it refreshes cached `robots.txt` roughly every 24 hours, and the faster path is the Search Console `robots.txt` report’s “Request a recrawl” action. After that, affected pages still need normal recrawl/reprocessing, which Google says can take from a few days to a few weeks.  
   **Recommendation:** change the workflow to: deploy `robots.txt` -> verify `/robots.txt` live -> request recrawl in the robots report -> use Live URL / URL Inspection only for the affected pages/resources.

3. **Medium-High: `Disallow: /book-table?*` probably will not block `/book-table`, but it is still the wrong control.**  
   The clean canonical page should remain crawlable; based on Google’s published robots matching examples, `/book-table?*` matches query-string variants, not bare `/book-table`. The bigger problem is that robots blocking is not a deindexing mechanism, and Google explicitly warns that blocked URLs can still appear in search and can stay in the crawl queue longer. That matters here because the site actively emits parameterized booking URLs today, including from the booking wizard at [BookingWizard](</Users/peterpitcher/Cursor/OJ-The-Anchor.pub/components/features/BookingWizard/index.tsx:104>) and multiple campaign pages.  
   **Recommendation:** keep query variants crawlable with canonical consolidation unless you can stop generating them or normalize them away at the source. The spec’s “won’t break social media links” claim is too narrow; the SEO side-effect is the real risk.

4. **Medium: the tag-page `<3 posts => noindex` threshold is fragile and slow to recover from.**  
   [docs/gsc-coverage-fix-spec.md](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/docs/gsc-coverage-fix-spec.md:229) assumes Google will quickly re-evaluate once a tag crosses the threshold. There is no fixed SLA for that; Google says recrawl/reindexing can take days to weeks. Locally, these pages are also ISR with `revalidate = 3600` at [tag page](</Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/blog/tag/[tag]/page.tsx:13>), so there is already an app-side lag before Google even sees the metadata flip. Also, these tag pages are not pure thin archives: they have bespoke SEO copy and structured data at [tag page](</Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/blog/tag/[tag]/page.tsx:38>) and [same file](</Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/blog/tag/[tag]/page.tsx:207>).  
   **Recommendation:** if you want a threshold, add hysteresis or a manual allowlist. A binary post-count cutoff is brittle.

5. **Medium: the `/cdn-cgi/` recommendation is directionally right, but the explanation should be corrected.**  
   [docs/gsc-coverage-fix-spec.md](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/docs/gsc-coverage-fix-spec.md:140) should say that `/cdn-cgi/` is Cloudflare-managed and does not hit Next.js. Cloudflare’s docs explicitly say the endpoint is served by Cloudflare, cannot be customized, and recommend `Disallow: /cdn-cgi/`. Google’s robots rules apply at the host/protocol/port level, so a Next-generated `/robots.txt` still governs crawler access to `/cdn-cgi/*` even though the requests themselves are intercepted upstream.  
   **Recommendation:** keep the disallow, but describe it as a crawler hint, not an application-layer fix.

6. **Low-Medium: explicit `410` for deleted test pages is not worth making the default recommendation.**  
   For Google, current documentation says all `4xx` codes except `429` are treated the same for indexing, and Google has also said `410 Gone` is effectively the same as `404 Not Found`. So for the test/debug pages in [docs/gsc-coverage-fix-spec.md](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/docs/gsc-coverage-fix-spec.md:75), deleting them or returning `notFound()` is sufficient. In Next App Router, first-class `410` handling is extra plumbing for little SEO gain.  
   **Recommendation:** keep 404 as the default. If fast suppression matters, use Search Console Removals alongside deletion; do not add custom 410 behavior just for Google.

**Open question**  
Issue 7 may be spec drift. The current event page code redirects fetch misses to `/whats-on` at [event page](</Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/events/[id]/page.tsx:225>), so the spec should re-check current production behavior before prescribing 404 vs 410 for missing events.

**Sources**
- Google: https://developers.google.com/search/docs/crawling-indexing/robots/submit-updated-robots-txt
- Google: https://developers.google.com/search/docs/advanced/crawling/ask-google-to-recrawl
- Google: https://developers.google.com/search/docs/crawling-indexing/block-indexing
- Google: https://developers.google.com/search/docs/advanced/crawling/http-network-errors
- Google: https://developers.google.com/crawling/docs/crawl-budget
- Google: https://developers.google.com/search/blog/2011/05/do-404s-hurt-my-site
- Meta: https://developers.facebook.com/docs/sharing/webmasters/web-crawlers
- X: https://developer.x.com/cards/getting-started
- LinkedIn: https://www.linkedin.com/help/lms/answer/a521928
- LinkedIn: https://www.linkedin.com/help/linkedin/answer/a525063
- LinkedIn: https://www.linkedin.com/help/linkedin/answer/a6233775
- Cloudflare: https://developers.cloudflare.com/fundamentals/reference/cdn-cgi-endpoint/