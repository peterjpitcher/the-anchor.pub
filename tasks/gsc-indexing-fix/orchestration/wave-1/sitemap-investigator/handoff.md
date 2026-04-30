# Sitemap Investigator — Handoff

## Outputs
- `tasks/gsc-indexing-fix/evidence/sitemap-tests/headers-www-Mozilla.txt`
- `tasks/gsc-indexing-fix/evidence/sitemap-tests/headers-www-Googlebot.txt`
- `tasks/gsc-indexing-fix/evidence/sitemap-tests/headers-apex-Mozilla.txt`
- `tasks/gsc-indexing-fix/evidence/sitemap-tests/headers-apex-Googlebot.txt`
- `tasks/gsc-indexing-fix/evidence/sitemap-tests/headers-www-trail-Mozilla.txt`
- `tasks/gsc-indexing-fix/evidence/sitemap-tests/body-www-Mozilla.xml`
- `tasks/gsc-indexing-fix/evidence/sitemap-tests/body-www-Googlebot.xml`
- `tasks/gsc-indexing-fix/evidence/sitemap-tests/body-apex-Mozilla.xml`
- `tasks/gsc-indexing-fix/evidence/sitemap-tests/repeat-fetch-bytes.txt`
- `tasks/gsc-indexing-fix/evidence/sitemap-tests/url-inventory.txt` (extra — full list of 215 URLs)
- `tasks/gsc-indexing-fix/evidence/sitemap-tests/url-sample-fetch.txt` (extra — D3 sample HEAD results)
- `tasks/gsc-indexing-fix/evidence/sitemap-investigation-findings.md`

## Headline finding
The sitemap is healthy *right now* (200 on every fetch, valid XML, byte-stable, no redirect/404 URLs, all 20 sampled pages return 200), but `app/sitemap.ts` has `dynamic = 'force-dynamic'` overriding `revalidate = 3600`, so every Googlebot fetch triggers up to 20 sequential calls to `management.orangejelly.co.uk` with no edge cache between requests — the most likely source of intermittent "Temporary processing error" when that upstream API is slow.

## Recommended fix (if any)
Remove `export const dynamic = 'force-dynamic'` from `app/sitemap.ts` so the existing `export const revalidate = 60 * 60` takes effect and Vercel can edge-cache the rendered sitemap; defence-in-depth follow-up is to parallelise + add timeouts to the `anchorAPI.getEvents` paging loop. Full details + risk + verification steps in `sitemap-investigation-findings.md` §5.

## Issues encountered
- `xmllint` is installed locally but `curl`/`wget` are blocked in this sandbox; all live HTTP probing was done via Python `urllib` inside `mcp__plugin_context-mode_context-mode__ctx_execute`. XML validation was done with Python's `xml.etree.ElementTree` rather than `xmllint`. Result is equivalent; if a stricter (DTD/namespace-aware) validator is required, re-run with `xmllint --noout --schema https://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd` against the saved `body-www-Mozilla.xml`.
- The trailing-slash test was run twice — once following redirects (200) and once not (308). Both results are saved in `headers-www-trail-Mozilla.txt`.
- Headers files use `# HTTP/1.1` comment lines for clarity rather than the literal HEAD response format. The status code, all response headers, and timing metadata are present.
