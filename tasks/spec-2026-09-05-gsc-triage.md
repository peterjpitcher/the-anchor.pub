# GSC "Why pages aren't indexed" triage, 5 September 2026

**Version 2**, revised after an independent developer review and an 18-agent
adversarial verification pass. Version 1 contained four material errors, listed
in §7. Do not implement from version 1.

**Status:** discovery and verification complete, read only. No code changed,
nothing deployed, no content edited, no GSC setting touched.
**Property:** `sc-domain:the-anchor.pub`. GSC data last updated 28 August 2026.
**Headline:** 631 not indexed, 204 indexed (up from 186 on 17 August).

---

## 1. The verdict, one line per bucket

| Reason | Pages | Verdict | Work packages |
|---|---:|---|---|
| Page with redirect | 145 | **Ignore.** Intentional. | none |
| Excluded by 'noindex' tag | 99 | **Ignore, except one event.** | WP2 |
| Blocked by robots.txt | 77 | **Ignore.** | none |
| Not found (404) | 17 | **Fix the event URLs.** Rest is noise. | WP1 |
| Alternative page with proper canonical | 16 | **Ignore.** Working as designed. | none |
| Crawled, currently not indexed | 266 | **Ignore as a bucket.** Not a code defect. | none |
| Duplicate, Google chose different canonical | 2 | **Ignore.** | none |
| Duplicate without user-selected canonical | 1 | **Owner decision, deferred.** | none |
| Redirect error | 0 | Passed. | none |
| Discovered, currently not indexed | 8 | **Ignore.** Normal crawl queue. | none |

**Six work packages, of which two are customer facing.** Two of the six were
found outside GSC entirely, by testing the live site.

| ID | Package | Priority | Customer facing |
|---|---|---|---|
| WP1 | Seven bare `/events/bingo-2026-*` URLs return 404 | P1 | Yes |
| WP2 | A bookable event asserts a facility the pub does not have | P1 | Yes, safety relevant |
| WP3 | `/blog/tag/constructor` and `/blog/tag/__proto__` return HTTP 500 | P1 | Yes |
| WP4 | The sitemap has stopped regenerating | P1 | No, but SEO material |
| WP5 | Remove the stale `/sitemap-priority.xml` submission from GSC | P3 | No |
| WP6 | Truthful tests and documentation | P3 | No |

---

## 2. Why most of the 631 does not matter

The count is not a count of broken pages. Measured against the live site on
5 September 2026:

| Check | Result |
|---|---:|
| URLs in `sitemap.xml` | 200 |
| Returning HTTP 200 now | 200 |
| Carrying a self-referencing canonical | 200 |
| Carrying `noindex` | 0 |
| Redirecting | 0 |

**Stated precisely:** all 200 URLs in the submitted sitemap passed these checks.
That does not establish that the sitemap contains every page it should, and it
does not establish that Google has indexed every eligible page. The suppressed
event in WP2 is itself a page correctly absent from that sitemap.

The 631 is dominated by things that can never be indexed and were never meant to be:

- **202 stale build assets.** 143 under `/_next/` in "crawled, not indexed",
  52 in "blocked by robots.txt", and 7 returning 404 as
  `/_next/static/css/*.css?dpl=` hashes. 143 + 52 + 7 = 202. Every one is a
  build hash from a superseded deployment. Nothing to fix, and they churn forever.
- **23 `opengraph-image` routes.** They serve `image/png` for social sharing and
  must stay crawlable. Their absence from the index is expected, not enforced.
- **33 URLs carrying query strings.** 16 in "crawled, not indexed", 16 in
  "alternative page with proper canonical", 1 noindexed event. UTM tags from
  Facebook and Instagram, and `book-table?source=...` links from the site's own panels.
- **18 legacy Wix URLs** (`/post/*`, `/event-details/*`) from the pre-2025 site.
- **About 8 `l.the-anchor.pub` shortlinks**, a different subdomain caught by the
  domain property.

### The "Failed" badges are stale, and three buckets can never pass

Seven of the ten buckets show **Failed**, covering 622 URLs. One shows
**Not Started** (duplicate without user-selected canonical, 1 URL). Two show
**Passed** (redirect error, 0 URLs; discovered not indexed, 8 URLs).
622 + 1 + 8 = 631.

That validation run **started 9 August 2026 and failed 11 August 2026**, before
the August remediation shipped. It is a month-old artefact.

Validation can never pass on "Page with redirect", "Excluded by noindex" or
"Blocked by robots.txt", because those states are deliberate and permanent.
Google re-checks, finds the URL still redirects or still says noindex, and marks
the run failed. **Do not press "Validate Fix" on those three buckets.** Use
validation only on the scope actually corrected.

---

## 3. WP1: Seven bare bingo event URLs return 404

**Verified live, 5 September 2026.** The bare `/events/bingo-2026-MM-DD` family
has eight members. One already has a redirect. Seven return a hard 404:

| URL | Status today |
|---|---|
| `/events/bingo-2026-02-18` | 301 to `/cash-bingo` (rule already exists) |
| `/events/bingo-2026-03-18` | **404** |
| `/events/bingo-2026-04-29` | **404** |
| `/events/bingo-2026-05-20` | **404** |
| `/events/bingo-2026-07-29` | **404** |
| `/events/bingo-2026-09-02` | **404** |
| `/events/bingo-2026-09-30` | **404** (future event, 30 Sep) |
| `/events/bingo-2026-11-18` | **404** (future event, 18 Nov) |

Version 1 named only five of these. Fixing five would leave `03-18` and `04-29`
broken with the identical defect.

**Cause.** The events were renamed in the management app. The old website URLs
were left to 404. They are not self-healing: the management API no longer
resolves the old slug, so `getEvent` throws and the route calls `notFound()`.
The 404 is the intended behaviour of commit `5ce5ea25`, which deliberately
removed an older catch-all redirect to `/whats-on` because that was a soft-404
pattern. Do not restore a catch-all.

**Mechanism, verified.** Append entries to `config/redirects/additional-redirects.json`.
There is no generation step: `scripts/audit-redirects.js` only reads. The file
is a flat array of `{source, destination, permanent}` at 2-space indent
(146 entries, 15,841 bytes). `permanent: true` emits **301**. Query strings are
preserved. The apex host collapses to a single hop. Middleware runs before the
`/events/[id]` dynamic route, so the redirect wins.

**These rules are served by middleware only.** `next.config.js:66` filters
`redirects()` down to pattern rules, so concrete entries never reach the
framework layer. Do not look for them there.

**Do not add these slugs to `RETIRED_THIN_EVENT_SLUGS`.**
`tests/unit/retired-thin-events.test.ts:43` constrains those destinations to
`['/quiz-night','/cash-bingo','/karaoke','/music-bingo','/whats-on']`.

### Destination: the hub, not the dated page

Version 1 recommended pointing each old slug at its dated replacement, citing
the repo's "A before B" lifecycle policy. **That recommendation is withdrawn.**
The evidence against it:

- **The convention is hubs.** Of 27 existing redirect rules with a source under
  `/events/`, 26 point at a hub (`/cash-bingo` x10, `/quiz-night` x8,
  `/whats-on` x6, `/karaoke` x2). There is no event-to-event redirect anywhere.
- **The one shipped rule for this exact URL shape chose the hub.**
  `/events/bingo-2026-02-18` redirects to `/cash-bingo` even though
  `/events/cash-bingo-2026-02-18` is live at 200 and in the sitemap.
- **Dated CMS slugs are unstable.** This family has already been renamed twice.
  The July night is not at `cash-bingo-2026-07-29` at all, it is at
  `/events/bingo-near-me-bingo-2026-07-29`. A static redirect to a CMS slug
  degrades into 301-to-404 with no self-correction. `/cash-bingo` is a
  code-owned route at `app/cash-bingo/page.tsx` and cannot move.
- **Dated destinations expire.** 30 September is 25 days away and 18 November
  about 11 weeks. Both flip to "This event has ended / Booking unavailable"
  within weeks, so the redirect would need a review date it will not get.
- **The repo says so.** `lib/event-seo-strategy.ts:411`: the route into the next
  date is an on-page link, not a redirect.

**Therefore: seven new entries, all with destination `/cash-bingo`.** Leave the
existing `/events/bingo-2026-02-18` rule unchanged. This raises the redirect
audit from 695 to 702 rules.

**Constraint:** these four dated pages (`/events/cash-bingo-2026-11-18`,
`-09-30`, `-09-02`, `-05-20`) may be redirect *targets* in future but must never
become redirect *sources*.

**Known gap, not fixed here:** `app/sitemap.ts` does not filter redirect sources
out of the sitemap. If the management app ever publishes an event using one of
these seven slugs, the page becomes permanently unreachable and enters the
sitemap as a "Page with redirect". Past dates make this unlikely, not impossible.

---

## 4. WP2: A bookable event asserts a facility the pub does not have

`/events/pub-quiz-lovely-jubbly-only-fools-and-horses-quiz-night-2026-09-25`,
25 September 2026, returns 200 with `noindex, follow`.

**This is a customer safety issue before it is an SEO issue.** The page tells a
reader in two places that the pub has a facility it does not have. Someone with
mobility needs could travel here on that promise.

**The two visible assertions, verbatim from the live page:**

1. Body: "The pub is dog-friendly, and the ground floor has step-free access and
   an accessible toilet."
2. FAQ: "Is the venue accessible? Yes. The Anchor has step-free access
   throughout the ground floor and an accessible toilet. Call 01753 682707 if
   you have specific requirements."

**Owner-confirmed reality, 5 September 2026:** there is no accessible toilet.
Most of the pub is step free, but there is one large step into the building,
with a ramp for it.

### Exactly which fields, verified by running the real module against the live record

The phrase `accessible toilet` occurs in **six** fields of the event record:
`brief`, `accessibility_notes`, `longDescription`, `about`,
`accessibilityFeature[0]`, and `faq[4].acceptedAnswer.text`.

`hasBannedClaim()` reads only six fields (`name`, `description`,
`shortDescription`, `longDescription`, `about`, `highlights`), so **only
`longDescription` and `about` trigger the noindex.** They are byte-identical
2,174-character strings. Running `getBannedClaims()` from `origin/main` against
the live record returns exactly `["accessible toilet (SSOT: verified NO)"]`, and
removing those two fields flips the strategy to `index: true`.

**Control:** the sibling event `autumn-kick-off-quiz-night-2026-09-16`, same
category and carrying the same false `accessibility_notes` template, serves
`index, follow`. The trigger is this event's prose alone, not anything site-wide.

### Critical: the phrase must be deleted, not negated

`getBannedClaims()` does **not** call `isNegatedClaim()`; only
`getSafeAccessibilityNotes()` does. Verified by execution: rewriting the sentence
to the honest denial "…step-free access and **no** accessible toilet" still
returns `index: false`.

**So any replacement copy must avoid the character sequence "accessible toilet"
entirely, including in a truthful denial.** Version 1's proposed wording would
have left the page noindexed.

### Proposed replacement copy

Pending the owner answers in §8, subject to the ramp wording.

**Body** (`longDescription` and `about`, which are identical):
> The pub is dog-friendly. There is one large step at the entrance and we have a
> ramp for it, and the ground floor is step free once you are inside. Our
> toilets are not wheelchair suitable.

**FAQ** (`faq[4].acceptedAnswer.text`):
> Is the venue accessible? Partly. There is one large step at the entrance and we
> have a ramp for it, and the ground floor is step free once you are inside. Our
> toilets are not wheelchair suitable. Call 01753 682707 and we will help you
> plan your visit.

`brief`, `accessibility_notes` and `accessibilityFeature[0]` carry the same false
claim and must be corrected to match, even though they do not trigger the guard.
`accessibility_notes` is currently withheld from render by
`getSafeAccessibilityNotes()`, which is why it is not visible today, but it is
still false data.

Preserve slug, dates, capacity, prices and booking settings. Check for concurrent
edits before saving. Use the existing authorised edit path and confirm the audit record.

### Scope beyond this one event

**13 of 15 upcoming events carry the same false claim in `accessibility_notes`,**
from the event-category template in the management app. They render correctly
today only because the safety helper withholds that field. The template itself is
wrong and should be corrected at source. That is a separate content package, not
part of WP2.

### Acceptance

Do not write "the page indexes itself on the next crawl". Google decides whether
and when to index. The deliverable is: accurate public copy on every surface, no
`noindex` meta, a self-referencing canonical, and expected sitemap membership
after refresh. Record a Google indexing check separately, later.

---

## 5. WP3 and WP4: two defects found outside GSC

### WP3: `/blog/tag/constructor` and `/blog/tag/__proto__` return HTTP 500

Verified live:

```
/blog/tag/constructor   500
/blog/tag/__proto__     500
/blog/tag/CONSTRUCTOR   500
/blog/tag/toString      308 -> /blog/tags   (correct)
/blog/tag/guides        200                 (correct)
/blog/tag/zzz-not-a-tag 308 -> /blog/tags   (correct)
```

**Cause:** `getTagSEOContent` does an unguarded object-literal lookup, so
`tagSEOContent['constructor']` resolves to the inherited `Object` constructor and
`tagSEOContent['__proto__']` to `Object.prototype`. Both are truthy, so the
`|| generateFallbackSEOContent(tag)` fallback never fires, `metaTitle` is
`undefined`, and `getTwitterMetadata` dereferences `title.length`.

Only those two strings are affected: every other `Object.prototype` member stops
matching once lowercased, confirmed live.

**Fix:** guard the lookup with `Object.prototype.hasOwnProperty.call(...)` or use
a `Map` / null-prototype object. Add a regression test covering `constructor`,
`__proto__` and a case variant.

### WP4: the sitemap has stopped regenerating

Verified independently with five probes 25 seconds apart:

```
probe 1: age=4090 x-vercel-cache=STALE urls=200 events=38
probe 2: age=4115 STALE
probe 3: age=4141 STALE
probe 4: age=4166 STALE
probe 5: age=4191 STALE
```

Age climbs monotonically and never resets. The effective window is 300 seconds
(`next.config.js` pins `s-maxage=300`, and Next 14 lowers the route's
`revalidate` to the minimum of the segment config and any fetch's
`next.revalidate`). At age 4,191 seconds, roughly 70 minutes, it is 14 windows
overdue and not recovering.

Serving the last good copy is the correct fail-safe, and the content is currently
accurate, so nothing is broken for users today. But **no new or corrected event
can enter the sitemap while this persists**, which directly undermines WP2's
acceptance check.

**Likely cause, not proven:** `getSitemapEvents` raising
`EventFeedUnavailableError` from its 19 parallel page fetches on a 3,000 ms
timeout, so each regeneration attempt fails and the stale copy is re-served.
There is no alerting on this path.

**This cannot be diagnosed from outside.** It needs Vercel function logs for the
`/sitemap.xml` route. There is no `revalidatePath`, no `revalidateTag`, no
webhook and no purge route; Cloudflare holds nothing (`cf-cache-status: DYNAMIC`).
**A redeploy is the only lever that will unstick it.**

Related, and worth fixing while in there: no event URL in the sitemap carries a
`lastmod`, because the list payload omits `_meta`. Google therefore gets no
freshness signal for events.

---

## 6. WP5 and WP6: small, low risk

### WP5: remove the stale sitemap submission

`https://www.the-anchor.pub/sitemap-priority.xml` was submitted 24 July 2025,
last read 27 August 2026, still listed as **Success** with 12 discovered pages.
It returns **404 on every request** and no route for it exists in the repo.

Owner action in GSC. Capture the exact property and submitted URL before acting,
remove only that submission, and confirm `sitemap.xml` remains submitted.
Removing a sitemap submission does **not** remove already-discovered URLs from
Search, and no page-removal request should be made.

### WP6: truthful tests and documentation

**The version 1 claim that the blog tag test "proves nothing" was wrong.**
Mutation testing confirms `tests/seo-indexing.test.ts:593-609` has real value: it
awaits the actual `generateMetadata` from `app/blog/tag/[tag]/page.tsx` and
asserts `robots` equals `{ index: false, follow: true }`, and asserts sitemap
exclusion. Deleting `app/blog/tag/[tag]/page.tsx:65` turns all four tests red.
**Do not delete this block.**

Only one assertion is inert: line 599, `expect(isNoindexBlogTag(tag)).toBe(true)`,
whose helper has zero production consumers.

Changes:

1. Delete line 599 and the now-unused import at line 93.
2. Keep lines 601-602 and 604-606 verbatim.
3. Replace the hardcoded `['events','food-and-drink','news','sports']` with the
   generated tag set, so all 13 archives are asserted, not 4.
4. Decide the fate of `isNoindexBlogTag` and `NOINDEX_BLOG_TAGS` (owner decision
   D2 in §8): delete as dead code, or wire back into production.

**The tag route has five contracts, not one.** Any new test must respect them:

| Case | Behaviour |
|---|---|
| Valid archive (13 today) | 200, `noindex, follow`, lowercase self-canonical, absent from sitemap |
| Redirecting tag (150 sources) | Single 301 via middleware, before the route runs. No HTML to assert |
| Empty or unknown tag | `permanentRedirect('/blog/tags')`, a **308**. In Jest this throws `NEXT_REDIRECT` |
| Case and encoding variants | Normalised to lowercase, so `/blog/tag/GUIDES` is a 200 duplicate, not a redirect |
| `constructor` / `__proto__` | **HTTP 500 today.** See WP3 |

Derive the valid-tag list in the test from the corpus plus the redirect JSON.
Never hardcode it. Note that `updates` renders when `TagPage` is called directly
in Jest but 301s live, because middleware is a different layer: the test must not
conflate the two.

**Documentation corrections** in `tasks/gsc-indexing-fix/url-lifecycle-policy.md`:

- **Line 61** currently says an API 404 or fetch error 301s to `/whats-on`. False.
  The current behaviour is `notFound()`, HTTP 404, for **every** failure mode.
  `anchorAPI.getEvent` swallows all transient errors and throws a synthesised
  `{status: 404}` at `lib/api/client.ts:993`, so `rethrowIfTransient()` at
  `app/events/[id]/page.tsx:324` never fires and the error boundary is
  unreachable on this path. Document what ships, not what was intended.
- **Line 104** heading: "draft / missing events" should be "draft and retired events".
- **Lines 109-111**: test attribution is wrong. The missing-versus-broken
  distinction lives in `tests/unit/api-failure-semantics.test.ts`, at the pure
  function level only.
- **Lines 121-123**: drop the `redirectSourceTags` sitemap-filter mechanism.
  `app/sitemap.ts` has no such filter and emits no tag archives at all.
- **Lines 124-139**: replace selective tag exclusion with the unconditional rule.

The A-before-B replacement principle is still stated and still sound in general,
but §3 explains why it is overridden for WP1.

---

## 7. Corrections to version 1

Recorded so the errors are not repeated.

| # | Version 1 said | Truth |
|---|---|---|
| 1 | The event copy contains "gluten free" and should be changed to NGCI | **Wrong and dangerous.** The string "gluten" appears zero times in the event record. The single page match is the nav link `href="/food-menu/gluten-free"`. The SSOT protects that URL: "Do not change that URL, it holds the ranking." |
| 2 | "accessible toilet" appears 18 times | Raw-HTML inflation. 2 visible occurrences; 15 in `<script>`, 1 in JSON-LD |
| 3 | Fix by changing the wording to a denial | **Would not work.** `getBannedClaims()` does not negate-check. The phrase must be deleted outright |
| 4 | The blog tag test proves nothing; delete and rewrite | **Refuted by mutation testing.** It asserts real route metadata and sitemap exclusion. Only line 599 is inert |
| 5 | Four bingo URLs need redirects | **Seven.** The family has eight members; `03-18` and `04-29` were missed |
| 6 | Point each old slug at its dated replacement | **Withdrawn.** Hub destination, on durability and consistency grounds. See §3 |
| 7 | `/events/cash-bingo-2026-07-29` is the July replacement | It was never published. The July night is at `/events/bingo-near-me-bingo-2026-07-29` |
| 8 | 195 build assets | 202 (143 + 52 + 7) |
| 9 | About 54 real pages in the 266 | 65 |
| 10 | About 40 query-string URLs | 33 |
| 11 | "Every bucket shows Failed" | 7 of 10 Failed, 1 Not Started, 2 Passed |
| 12 | "The sitemap is the current site" | Overstated. It proves properties of its members, not completeness |
| 13 | "The page indexes itself on the next crawl" | Google decides. State eligibility, not outcome |

---

## 8. Owner decisions

Asked in chat, recorded here once answered. Nothing below is approved.

- **D1.** Redirect destination for the seven bingo URLs: hub `/cash-bingo`
  (recommended, see §3) or the dated replacement pages.
- **D2.** `isNoindexBlogTag` / `NOINDEX_BLOG_TAGS`: delete as dead code
  (recommended) or restore a per-tag policy.
- **D3.** Entrance ramp wording: always available, or on request.
- **D4.** Whether the SSOT beer-garden line ("steps from bar, but ramp available
  on request") is still accurate, and whether that is the same ramp.
- **D5.** Blanket `noindex` on all 13 blog tag archives: confirm as a deliberate
  content decision, or revisit.
- **D6.** The `/private-hire/near/*` cluster of 17 near-duplicate pages, open
  since June 2026: write per-landmark content, or prune. Deferred, no evidence
  gathered here.

---

## 9. Also true, deliberately not fixed

- **Page with redirect, 145.** Every redirect tested reaches a 200, all single
  hop except `http://the-anchor.pub/` (two hops: HTTP to HTTPS, then apex to
  www), which is the normal cost of an insecure apex request. No sitemap URL redirects.
- **Alternative page with proper canonical, 16.** All UTM and `?source=` variants
  canonicalising to the clean URL. This bucket filling is proof the strategy works.
- **Blocked by robots.txt, 77.** 52 stale build assets, 14 `/api/` routes,
  ~8 shortlinks, 1 Cloudflare URL, and `/demo-header` and `/test-simple`, which
  both return 404 and are absent from `origin/main`. The asset entries date from
  when Cloudflare's managed robots.txt overrode ours; the live file now matches
  `app/robots.ts` and allows `/_next/static/`.
- **Crawled, currently not indexed, 266** (265 unique rows). 200 are assets, OG
  images, query strings and legacy Wix paths. 65 are real pages: 23 old dated
  blog posts, 20 tag archives that are deliberately noindex, 11 past events,
  3 drinks pages, and 8 others. Google declining to index a thin 2021 seasonal
  recap is a content judgement, not a bug.
- **Past event pages read as live invitations.** `/events/cash-bingo-2026-09-02`
  still says the event "returns" in both body and JSON-LD description, beneath an
  "event has ended" banner. Cosmetic, worth a separate content pass, not blocking.
- **The management app has no authoring-time check for factual banned claims.**
  `src/lib/event-seo/prompts.ts` bans tone and style words only. The website's
  `hasBannedClaim()` is the only guard, and it fires silently *after* publication.
  That is why WP2 shipped. A validation rule at the authoring step would prevent
  recurrence, but it is a separate follow-up.
- **`getBannedClaims()` punishes honest disclosure.** Because it does not
  negate-check, a page that truthfully says "we have no accessible toilet" is
  deindexed. Worth fixing so the guard cannot penalise accuracy, but it is a
  design change, not part of these six packages.

---

## 10. How this was verified

- Every GSC reason bucket opened and its full URL list read at 500 rows per page.
- All 200 sitemap URLs fetched and checked for status, canonical, robots meta and
  `X-Robots-Tag`.
- Every event linked from `/whats-on` checked for `noindex`, start date, sitemap
  membership and all seven banned-claim patterns.
- `lib/event-seo-strategy.ts` from `origin/main` extracted and **executed against
  the live event record** to attribute the noindex to specific fields.
- Mutation testing on `tests/seo-indexing.test.ts` to establish whether its
  assertions fail when the behaviour regresses.
- `scripts/audit-redirects.js` executed on a pristine `origin/main` copy with the
  proposed entries injected.
- Redirect chain depth measured from 10 entry points; the full bingo URL family
  probed; the sitemap probed five times over 100 seconds.
- All source read from `origin/main`, never the working tree, which is 11 commits
  behind and holds an unrelated session's work.

**Claims checked and withdrawn:** `/whats-on` appeared to link to a 404 at
`/events/quiz-night`, but the match came from an image path, not an anchor. There
is no broken link. The version 1 errors are listed in §7.

**Not verified.** The 631/204 GSC headline and historical validation logs were
read from the console but not exported. No Vercel deployment or function logs
were inspected, so WP4's cause is a hypothesis. No booking flow was exercised end
to end. No test suite was run against a checkout rebased onto `origin/main`.
