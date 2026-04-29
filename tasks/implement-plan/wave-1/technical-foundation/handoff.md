# Technical Foundation — Wave 1 Handoff

**Completed:** 2026-04-21

## Files Modified

| File | Change |
|------|--------|
| `app/robots.ts` | No change needed — already had `allow: ['/', '/_next/static/']` and `/cdn-cgi/` in disallow |
| `app/sitemap.ts` | Updated `STATIC_LAST_MODIFIED` from `2026-03-20` to `2026-04-21` |
| `config/redirects/wix-redirects.json` | Fixed 2 redirect chains: `/post/euro-2024-stanwell-moor-staines` and `/post/autumn-internationals-2024-fixtures-key-matches` now point directly to `/live-sport` instead of intermediate blog posts |
| `config/redirects/blog-redirects.json` | Removed 39 duplicate source entries that also existed in `wix-redirects.json` (159 entries remain, down from 198) |

## Directories Deleted

All 10 test/debug route directories were already deleted from the filesystem prior to this session (showing as `D` in git status):

- `app/test-simple/`
- `app/test-tracking/`
- `app/test-reviews/`
- `app/test-gtm/`
- `app/test-navigation-tracking/`
- `app/test-hours/`
- `app/gtm-debug/`
- `app/debug-hours/`
- `app/demo-header/`
- `app/components/` (confirmed NOT the shared components dir — does not exist as a filesystem directory)

These deletions need to be staged: `git add -A app/test-simple app/test-tracking app/test-reviews app/test-gtm app/test-navigation-tracking app/test-hours app/gtm-debug app/debug-hours app/demo-header app/components`

## Verification

- `app/sitemap-page/page.tsx` — no links to deleted test pages (confirmed clean)
- `scripts/audit-hero.js` — no references to deleted test pages (confirmed clean)
- Redirect chains eliminated: both sport blog posts now resolve in 1 hop to `/live-sport`
- Duplicate redirect sources removed: wix-redirects loads first and wins, blog-redirects no longer has conflicts

## Issues / Notes

- Task 1 (robots.ts) was already correctly configured — no code change required.
- The `app/components/` directory listed in git status refers to a route page (`page.tsx` + `head.tsx`), not the shared components directory at `components/` (project root level). The route version was already deleted.
