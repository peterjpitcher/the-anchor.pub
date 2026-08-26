# Site growth: the plan

**Date:** 26 August 2026
**Status:** live change register. This document supersedes `site-growth-spec-2026-08-17.md` and `site-growth-implementation-spec-2026-08-17.md`, which are now background evidence only.
**Baseline:** `main` at `53897b7d`
**Target:** `feat/site-growth-phase-0` at `6eb94344`, 14 commits, 110 files, +3,755 / −1,047
**Driven by:** [developer review, 26 Aug](./site-growth-spec-developer-review-2026-08-26.md), 27 confirmed issues and 6 optional improvements

---

## Where this actually stands

The review's core judgement is right: **the 17 August specification is not safe to use as a delivery document**. Fourteen of its items are already built, its counts are stale, and three of its findings contradict each other.

The review is also right about the two things that matter most, and both were my errors:

| Review finding | Verdict |
|---|---|
| **F22:** `npm run lint` fails on the branch | **Correct.** I verified with `npx eslint`, not `npm run lint`. The project script also runs hero, menu-page and page-width audits. The page-width audit failed on four `max-w-3xl` caps in the themed quiz page I wrote. **Fixed 26 Aug**, full pipeline now green. |
| **F02:** the redirect audit tested the wrong condition | **Correct**, and I had already proved it myself in `6eb94344`. "Ends on 200" never meant "reaches the intended page". |
| **F03:** paid competition used as organic difficulty | **Correct.** Every "winnable" and "uncontested" judgement in the keyword plan rests on advertiser counts. Corrected in the source documents. |
| **F01:** hotel destination contradicts itself | **Correct** as a document defect. The code is unambiguous and right; the prose was not. |

Two review claims do not hold:

- **F22 states Jest passes 1,721 tests.** It is 1,272 across 105 suites. Likely a transposition. Nothing turns on it.
- **F07 asks whether the uncommitted themed-quiz edit is part of this programme.** It is: it is the owner correcting a factual claim I got wrong, covered in W1 below.

### Current pipeline state, verified 26 August

```
npm run lint     PASS   (eslint + hero + menu-page + page-width audits)
npx tsc --noEmit PASS
npx jest tests/  PASS   1,272 passed, 1 skipped, 105 suites
```

---

## What is already built

These fourteen commits are on the branch. They need **review, not rework**.

| Commit | What it did | Review findings that touch it |
|---|---|---|
| `07d59052` | The three strategy documents | F07, F23 |
| `7efe331f` | `/halloween` rebuilt for the 2026 event | F16, F25 |
| `a425fc09` | 11 hotel pages retired into `/heathrow-hotels-pub` | F01, F04, F14 |
| `041981b1` | `CATEGORY_ROUTES` fixed, 44 events had been routing to `/whats-on` | none |
| `217258d9` | 18 past event pages retired to category hubs | F05, F06 |
| `8fb54f9d` | Future `lastmod` dates removed from the sitemap | F27 |
| `f25896f2` | 88 doubled-brand titles fixed | F09, F10 |
| `3410bd83` | Blog posts related by topic, not publication date | F24 |
| `8deb6fb6` | Contextual links added to orphaned pages | F24 |
| `a6cefb90` | 60 over-length meta descriptions rewritten | F11 |
| `0968ea9b` | `BreadcrumbList` added to 38 event pages | F18 |
| `b0323e6f` | `/quiz-night/themed` built | F16, F22, F25 |
| `89af58c0` | `/heathrow-parking` retargeted, unsupportable claims removed | F17 |
| `6eb94344` | 172 old Wix URLs stopped landing on the blog index | F02 |

**Measured outcome, all 198 sitemap URLs, rendered:**

| | Baseline | Now |
|---|---:|---:|
| Doubled brand in title | 88 | 0 |
| Duplicate title clusters | 6 | 0 |
| Descriptions outside 70–165 chars | 75 | 0 |
| Pages with `BreadcrumbList` | 103/226 | 141/198 |
| JSON-LD parse errors | 0 | 0 |

---

## The plan

Ordered by risk, not by effort. **Nothing ships until W1 to W4 are done.**

### W1. Make the branch honest before anything else · P0 · half a day

| Task | Detail |
|---|---|
| **W1.1** ✅ Fix the page-width audit failure | Done 26 Aug. Four `max-w-3xl` caps removed from `app/quiz-night/themed/page.tsx`. Page width is set once by `.container`; no page may re-cap it. |
| **W1.2** | **Commit the owner's themed-quiz correction.** I wrote "Stanwell Moor Village Hall team". The correct partner is the **Stanwell Moor Community Wellbeing Garden**. The database has already been corrected; the page was corrected by hand and is uncommitted. |
| **W1.3** | **Stop the themed hub hardcoding facts that live in the database.** W1.2 happened because the page duplicates the partner and charity names as string literals. When the database changed, the page did not. Read them from the event record, or mark them `verifiedAt` with an owner (see W7). |
| **W1.4** | **Separate the unrelated analytics work.** `lib/gtm-events.ts`, `docs/analytics/custom-dimensions.md` and `tests/unit/table-booking-tracking.test.ts` are uncommitted in the tree and are **not** part of this programme. Commit them separately or stash them. Do not fold them into a URL-migration release. |

**Gate:** `npm run lint && npx tsc --noEmit && npx jest tests/` all pass, and `git status` is clean apart from deliberate work.

---

### W2. Rebuild the redirect audit around the right question · P0 · 1 day

**F02.** The old test asked "does this reach a 200?". It must ask "does this reach the page it is supposed to reach?".

`tests/unit/post-redirect-precedence.test.ts` already guards the `/post/` case. Generalise it:

1. Build an expected source-to-destination map from `config/redirects/*.json`, resolving precedence exactly as production does: **pattern rules in `next.config.js` `redirects()` run before every concrete rule in middleware.**
2. For every rule assert: the winning rule, the status code, the exact final URL, hop count (must be 1), query handling, and that the final page is indexable.
3. Fail on duplicate sources with differing destinations.
4. Fail on any concrete rule shadowed by a pattern, which is the exact defect that hid 172 URLs.

---

### W3. Define safe behaviour when the management API fails · P0 · 1 day

**F15.** This is the most dangerous gap in the programme and nothing on the branch addresses it.

Today a general event API error can produce a **permanent redirect to `/whats-on`**, and a sitemap regeneration during an outage can drop every event. A timeout is not a retirement, but the site currently tells Google it is.

| Condition | Required response |
|---|---|
| API returns 404 | `notFound()`. Confirmed absence. |
| API times out or returns 5xx | Temporary error, or serve cached stale data. **Never a 301.** |
| Slug is in the retirement manifest | 301 to the mapped hub. The only permitted permanent redirect. |
| Sitemap refresh fails | Preserve the last good event sitemap. Never emit a sitemap with zero events. |

---

### W4. Build the baseline sheet before any further deploy · P0 · half a day, owner-led

**F13.** Without this, none of the 29 retirements can be judged and no rollback decision can be principled.

Capture per page: clicks, impressions, CTR, position, organic landing sessions, booking starts, completed bookings, parking revenue, phone and WhatsApp actions.

Cover: the 11 retired `/pub-near-*` URLs, the 18 retired event URLs, `/heathrow-hotels-pub`, `/halloween`, `/heathrow-parking`, `/food-menu`, `/sunday-roast`, all 17 `/private-hire/near/*`.

Reviews at **28, 56 and 84 days**.

> **Note:** for the 14 commits already made, use historical pre-change GSC data. The window is still open.

---

### W5. Resolve the contradictions in the source documents · P1 · done, verify

Applied 26 August:

- `site-growth-spec-2026-08-17.md` and `site-growth-implementation-spec-2026-08-17.md` carry **SUPERSEDED** banners pointing here.
- The "redirects are healthy" claim is struck through with the correction, including the fact that **my stated cause was also wrong**: it was Next's `redirects()` running before middleware, not `wix-redirects.json` matching first.
- The keyword plan reframes GKP competition as **paid** competition throughout, and replaces "no demand" with "no reportable volume".
- **F01 is resolved by fiat:** the only approved hotel mapping is the 11 `/pub-near-*` URLs to `/heathrow-hotels-pub`. `/heathrow-hotels-pub` stays live. Every contradicting paragraph is inside a superseded document.

---

### W6. Event retirement stays a fixed manifest · P1 · half a day

**F05 and F06.** The two documents describe different rules, and neither is implementable from the current list API, which omits `long_description`.

The branch already does the right thing: a **fixed manifest** of 18 reviewed slugs in `RETIRED_THIN_EVENT_SLUGS`.

**This plan adopts the fixed manifest and closes the question.** An automatic quality floor needs the management API to expose a word count, content hash and last-updated value on the list endpoint. That is a cross-repo change with a cost, and there is no evidence yet that thin past events accumulate fast enough to need automation. Revisit only if the manifest needs a third amendment.

Work: document the manifest as the single source of truth, and add a comment in `lib/event-seo-strategy.ts` stating that automation is deliberately out of scope and why.

---

### W7. Governance for facts that change · P1 · 1 day

**F25, and W1.2 is the proof it is needed.** I published a wrong charity partner because the page hardcoded a fact that lived in the database.

Every changeable claim gets a source, a check date and an approver: drive times, terminal routes, airline lists, taxi fares, parking prices, charity partners, service timings, family-access claims.

Add `verifiedAt`, `source` and `owner` to volatile content, and a CI warning when a check is overdue (**O04**).

---

### W8. Seasonal and themed page lifecycle · P1 · 1 day

**F16.** `/halloween` and `/quiz-night/themed` are both specified only for known 2026 dates. Neither defines sold out, cancelled, postponed, past, no next date, or the 2027 rollover.

Adopted model, pending the owner confirming intent ownership:

- The **evergreen occasion page** is the stable acquisition URL. The **dated event page** is the booking URL. Distinct titles, canonicals, cross-links.
- Define post-event copy and the cancelled and sold-out states.
- Name a rollover owner and deadline.
- Hide unconfirmed sections rather than showing fallback claims.

---

### W9. Complete the test gate · P1 · 2 days

**F20, F21, F22.** The pipeline covers lint, types, Jest and build. It does not cover the failure modes this programme actually creates.

| Add | Why |
|---|---|
| Production-build crawl asserting status, canonical, robots, title, description, headings, schema, internal links, redirect destinations | Unit tests pass while metadata and redirects are wrong. This is how 88 doubled titles survived. |
| Playwright smoke tests for booking CTAs and retired URLs | No browser coverage exists today |
| axe checks on changed templates, keyboard tests for FAQ and link modules, 320px and 200% zoom checks | **F20**, no accessibility criteria exist at all |
| Assert every JSON-LD block uses `jsonLdSafeStringify` | **F21**, CMS values flow into `dangerouslySetInnerHTML` |

---

### W10. Hold the "near me" retargets at two pages · P1 · gated on the 28-day review

**F12.** `/food-menu` and `/sunday-roast` were retargeted from Heathrow-qualified to near-me terms on UK-wide volumes of 500,000 and 50,000. A single pub can address a small geographic share of that.

Both changes are already committed. **The pattern does not extend to any further page until the 28-day review shows it worked.** If qualified traffic falls, the Heathrow qualifier goes back into the title.

---

### W11. Migration runbook · P1 · half a day

**F14.** Applies to the 29 URLs already retired.

Keep the 301s for **at least one year**. Update internal links. Remove retired URLs from the sitemap (done). Test on production, not just locally. Check the CDN. Monitor old and new URLs. Confirm no paid campaign, QR code or printed material points at a retired URL.

**Owner action:** the deleted `public/sitemap-priority.xml` is still submitted in Search Console and must be removed there.

---

### W12. Close the schema gaps · P2 · 1 day

**F26:** add explicit decisions for Easter and Mother's Day event `offers`. Either a truthful price and currency where a fixed package exists, or remove the offer block. No zero prices.

**F18:** decide whether `/whats-on` should emit per-event `Event` markup at all. Google's event experience supports single-event pages, so 16 `Event` objects on a listing page may earn nothing. Removing them also addresses **F19** properly, which merging into one `@graph` would not: the payload is the entity data, not the script tags.

**F27:** `lastmod` must be omitted when the source date is missing or invalid, not just when it is in the future.

---

### W13. Deferred, with reasons · P2/P3

| Item | Decision |
|---|---|
| 51 pages without `BreadcrumbList` | Needs a prop change across 98 pages using `InteriorHero`. Own changeset. **F18** wants route-family definitions first. |
| 42 blog titles over 75 chars | Ratcheted in test so the count cannot grow. **F10** is right that a hard cap is not a platform rule; treat as editorial. |
| Merging JSON-LD into one `@graph` | **Dropped.** F19 is correct that it does not solve the stated problem. Superseded by the W12 decision on listing-page Event objects. |
| Funeral venue differentiation | Real work, no deadline. After W1 to W4. |
| Publishing cadence | Ongoing, not a code change. |

---

## Sequence

```
W1 ──> W2 ──> W3 ──┐
                   ├──> deploy the branch ──> 28 / 56 / 84-day reviews
W4 ────────────────┘                              │
                                                  v
W6, W7, W8, W9 ──> W10 (gated on the 28-day review) ──> W12
```

**W5 and W11 are documentation and process; do them alongside.**

Per **O02**, ship the destination page first, then redirects and sitemap changes, then metadata and content. Keep an observation window between high-risk steps. The Halloween deadline has now passed as a fast-track justification, so there is no reason to bundle.

---

## What I would not do

- **Do not rework the 14 commits.** The review asks for correctness of *process*, not reversal of the work. Every measured outcome above is real and verified against rendered pages.
- **Do not add an automatic event quality floor** until the API can support it (W6).
- **Do not merge JSON-LD into a graph** and call the performance problem solved (F19).
- **Do not extend the near-me retargeting** until the 28-day review reports (W10).
- **Do not treat 60 characters or 70–165 characters as build-breaking rules.** Doubled brands, missing and duplicated metadata are errors. Length is an editorial warning.
