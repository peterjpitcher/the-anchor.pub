# Owner answers, round three, 15 October 2026

Branch `fix/owner-answers-round-three`. Website only. Source: the owner's answers in chat on 15 October 2026. One commit per item.

## 1. The car park floodlights do not work

Owner: "the floodlights don't work right now".

- [x] `docs/SSOT.md`: §8 guest parking now says CCTV only and records that the floodlights are not working as of 15 October 2026; §8 airport parking says the same; §14 Operations lists "a floodlit or lit car park" as a claim not to make while it stands; §18 has the dated entry, which says the claim comes back only when the owner says they are fixed.
- [x] `SSOT.json`: "Floodlit" is out of `heathrow_parking.features`, the guest parking description says CCTV only, and `venue.parking.floodlights` records the fact.
- [x] Pages: `/heathrow-parking` (a feature card, the FAQ, the metadata description, two body paragraphs and the `Floodlighting` amenity in its structured data), `/heathrow-parking/[terminal]` (badge and FAQ), `/our-pub`, `/restaurants-near-heathrow` (card and FAQ), `/book-table`, `/find-us` ("Well-lit with CCTV coverage" is now "Covered by CCTV"), the parking tag intro in `lib/tag-seo-content.ts`, the `Well Lit` amenity in the ParkingFacility data in `lib/schema.ts`, and the booking wizard's "prefer a well-lit spot" placeholder.
- [x] "CCTV and floodlit" now says "CCTV". The main parking page's "CCTV monitored" badge is unchanged, as the owner asked.
- [x] Blog: all 15 posts that mentioned floodlights answered 200 on a plain GET to the live site first (none redirects), so all 15 were edited. Each one's `updated` date moved to 15 October 2026.
- [x] Guard: `tests/ssot-drift-guard.test.ts` fails if "floodlit", "floodlights" or "floodlighting" appears in any page, post, component, `lib` file or `/llms.txt` while §8 says the floodlights are not working, and on "well lit" about us. Checked by putting the word back into one post: the test failed and named the file.
- [x] The management app has no floodlight wording (searched `src`, `supabase` and `docs`).

## 2. Kick Bomb

Owner: "don't list kickbomb anywhere".

- [x] Removed from "Shots & Bombs" in `content/menu/drinks.json`. It was the only place it was listed: no page, post, test or SSOT entry named it. Kick Energy, an energy drink, is a different product and stays.
- [x] The drift guard fails if it comes back in the drinks list or anywhere on the site.
- [ ] The October change notes (`tasks/changes/2026-10-08-main-copy.md`) still mention it as history. They are not served and were left.

## 3. Wakes: a dedicated space, not a dedicated entrance

Owner: "We have the dining room, not a dedicated entrance but a dedicated space."

- [x] `docs/SSOT.md` §11 "Private entrance area" is replaced by the dining room as a dedicated space, with the owner's words and a ban on the entrance wording; §18 has the dated entry. `SSOT.json` `private_hire.wakes_speciality` follows.
- [x] Pages: the wakes page (lead, badge, dining room card), the crematorium wake template (badge, intro, reason card, narrative, the FAQ that feeds FAQPage structured data, and two lines that said "the private area"), the private hire FAQ and its wakes link, the search map note and `/llms.txt`.
- [x] "Set apart from the main bar" and "come and go with dignity" went with the entrance claim, because nothing on record supports them.
- [x] `lib/local-seo-data.ts` held no entrance claim. Its Staines Cemetery line already says the dining room can be hired as a private space, so it is unchanged.
- [x] The drift guard fails if a private, own or dedicated entrance comes back.

## 4. Job adverts dated 7 October 2026

- [x] `recruitmentDatePosted` is now `2026-10-07`, the day the owner confirmed both jobs.
- [x] `validThrough` was derived from the posted date: it sat exactly one year after it, and the comment beside it says to move the two together. It moved from `2027-05-12` to `2027-10-07`, still one year on.
- [x] `config/date-register.json` follows: the date, the find text, and the reminder now says September 2027. `npm run audit:freshness` passes, and the register tests check the new warning window (quiet until 6 September 2027, due from 7 September).

## 5. The `@typescript-eslint` update

| | Critical | High | Moderate | Low | Total |
|---|---|---|---|---|---|
| Before | 1 | 39 | 9 | 0 | 49 |
| After | 1 | 34 | 9 | 0 | 44 |

- [x] `npm audit fix` (no `--force`) moved the eight `@typescript-eslint` packages from 8.40.0 to 8.71.2. Underneath: `eslint-visitor-keys` 4.2.1 to 5.0.1, and, nested under `typescript-estree` only, `minimatch` 10.2.6, `brace-expansion` 5.0.12 and `balanced-match` 4.0.4. Nothing else moved. `package.json` is unchanged.
- [x] `npm run lint` passes on Node 22 with no new findings, so no code needed changing. Checked again after a clean `npm ci` from the new lock file.
- [x] What is left needs a major version of `next`, `jest`, `jest-environment-jsdom`, `tailwindcss`, `gray-matter` or `@tailwindcss/typography`, according to npm.

## 6. The flaky floating layers test

- [x] Which test: "the event card › is not on the first screen". It is the only one that has failed: CI run 37808608736 on 8 October (London zone), and 5 of 60 loaded local runs.
- [x] Why: `renderCard()` waited until `fetch` had been called, not until the card was drawn. The fetch answer landed while `waitFor` had React's act environment switched off, so React drew the card on its own scheduler timer. Whether that timer fired before the test's next line depended on how busy the machine was. That test is the only one that looks for the card before doing anything else in act; the others scroll first, and the scroll's act drew the pending card for them. It was not about the time zone: CI caught it under London.
- [x] Fix: `renderCard()` waits for the card's text (`findByText`), the condition the tests depend on. No retries, no longer timeouts.
- [x] Proof: 30 copies of the file run at once, to load all 14 cores: 5 failures in 60 runs before, 0 in 90 after. Then five full `npm run test:utc` runs in a row, below.

## Gates

Run on the final tree, Node 22.20.0 (the version CI uses).

- `npm run test:utc`, five full runs in a row: each 320 suites, 5819 passed, 1 skipped, no failure.
- `npm test` (London): 320 suites, 5819 passed, 1 skipped.
- `npx tsc --noEmit`: clean.
- `npm run lint` (ESLint and the nine audits): no warnings or errors, every audit passed.
- `npm run build`: completed, 232 static pages. The built pages contain no "floodl", "kick bomb" or "private entrance", and both job pages carry `2026-10-07`.

## Assumptions

1. The 15 edited posts' `updated` date moves to 15 October 2026, the day the words changed.
2. One retirement party post tells readers to look for venues that are "well-lit". That is advice about venues in general, not a claim about our car park, and stays. The guard lets that one sentence through by its wording.
3. Two surprise party posts tell readers to look for a venue with a separate entrance. The same reasoning applies.
4. "Dedicated Dining Room" is the badge wording for wakes. It says only what the owner said.
5. `validThrough` counts as derived from the posted date, so it moved with it.
6. The booking wizard placeholder still says "Leaving keys with reception", which sits oddly beside "you keep your keys". It was left, because only the floodlight part was in scope.
