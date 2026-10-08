# Manager's Special retired, four landmark pages removed, one parking line, 8 October 2026

Branch `fix/retire-managers-special-and-near-pages`. Website only. Source: the owner's decisions and facts of 7 October 2026 (fact 32, decision 15 and the paid parking follow-up).

## 1. The Manager's Special is retired (fact 32)

- [x] The page `/drinks/managers-special` is removed.
- [x] The two API routes behind it are removed: `/api/managers-special` and `/api/managers-special-image`.
- [x] The code and data are removed: five `lib/managers-special*` files, `types/managers-special.ts`, `content/managers-special-promotions.json`, `content/managers-special-legacy.json`, the two scripts that checked the monthly list, and the picture folders in `public/images/managers-special`.
- [x] The "Manager's Special" section is out of the drinks menu data (`content/menu/drinks.json`), so `/drinks` no longer has to hide it.
- [x] Links are gone from the sitemap, the sitemap page and the shared "dining" link set, which now links to the drinks menu.
- [x] The two posts that only sold the offer are retired: `monthly-managers-special` and `25-off-kraken-rum-this-june-manager-s-special`.
- [x] The preview token line is out of `.env.local.example`.

**Where the data came from.** Nothing came from the management app. The monthly list was a JSON file in this repository and the pictures were files in `public/`. The management app export holds no Manager's Special table, route or setting, so there is nothing to switch off there. The one leftover outside this repository is the `MS_PREVIEW_TOKEN` environment variable in Vercel, if it was ever set: it is now unused.

**SSOT.** Section 6, section 14 and `SSOT.json` are updated on the branch `docs/ssot-corrections-and-facts`, so that two branches do not edit the same lines.

## 2. Four "private hire near" pages removed (decision 15, finding C1-006)

| Page | Why it was wrong |
|---|---|
| `/private-hire/near/kempton-park-crematorium` | No such crematorium exists |
| `/private-hire/near/spelthorne-registration-office` | No such office exists |
| `/private-hire/near/staines-registration-office` | Staines registers births and deaths only and holds no ceremonies |
| `/private-hire/near/windsor-register-office` | The Windsor and Maidenhead register office is in Maidenhead |

- [x] The four entries are out of `lib/local-seo-data.ts`. The sitemap, the sitemap page and the lists on `/private-hire` and `/private-hire/wakes` are all built from that file, so the links went with them.
- [x] `/private-hire` no longer says "registry offices" in that list's description.
- [x] The christening ideas post no longer lists Staines Registration Office for naming ceremonies (two lines).

## 3. Redirects

All permanent (301). All are concrete rules in `config/redirects/*.json`, which `middleware.ts` serves through `lib/middleware-redirects.ts`. None is in `next.config.js` (patterns only) or `vercel.json`.

| Old address | Goes to | Why |
|---|---|---|
| `/drinks/managers-special` | `/drinks` | The drinks menu is the page it sat under |
| `/blog/monthly-managers-special` | `/drinks` | Same subject |
| `/blog/25-off-kraken-rum-this-june-manager-s-special` | `/drinks` | Same subject |
| `/private-hire/near/kempton-park-crematorium` | `/private-hire/wakes` | The page was about wakes |
| `/private-hire/near/spelthorne-registration-office` | `/private-hire` | No more specific live page |
| `/private-hire/near/staines-registration-office` | `/private-hire` | No more specific live page |
| `/private-hire/near/windsor-register-office` | `/private-hire` | No more specific live page |

Eighteen older rules that used to land on one of the retired addresses now go straight to `/drinks`, so there are no chains. Examples: `/managers-special`, `/special-offers`, `/blog/botanist-gin-july-2025`.

`tests/seo-indexing.test.ts` checks each old address end to end through the middleware on both hosts: one 301, and the destination equals the rule's target. It also checks that no `next.config.js` pattern or `vercel.json` rule catches the address first, that the files are gone, and that no page, component or post still links to a retired address.

## 4. Paid parking confirmation page

- [x] "Confirmation text sent to your mobile" is removed from `/heathrow-parking/confirmation/[bookingId]`. The site cannot tell whether a text went. A test now fails if it comes back.

## Left alone, on purpose

- `/private-hire/near/great-fosters-egham` still uses the registry office wording, which finding C1-006 also calls wrong for a hotel. It was not one of the four in decision 15.
- The architecture notes under `docs/architecture/` still describe the Manager's Special. They are a dated description of the site, not customer copy.

## Assumptions

1. "Completely" covers the two posts that existed only to sell the offer. Both answered 200 on the live site on 8 October 2026, so retiring them changes what is served.
2. `/drinks` is the closest live page for all three Manager's Special addresses.
3. The three register office pages go to `/private-hire`, because the site has no page about ceremonies or register offices.
4. The picture files in `public/images/managers-special` are assets of the retired page, so they went with it. They remain in git history.

## Checks

Run on 8 October 2026 under Node 20, on this branch.

- `npm run lint:next`: no warnings or errors.
- `npx tsc --noEmit`: clean.
- `npm test` (London): 281 suites passed, 4693 tests passed, 1 skipped.
- `npm run test:utc`: 281 suites passed, 4693 tests passed, 1 skipped.
- `npm run build`: completed. None of the retired routes is in the build output.
- `npm run audit:redirects`: 729 rules, no problems found.
- The production build was started locally and each old address requested once with redirects off: all seven answered 301 with the destination in the table above, `/managers-special` answered 301 to `/drinks`, and the two removed API routes answered 404.
