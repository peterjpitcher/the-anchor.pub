# Implementation plan: GSC triage, 5 September 2026

Spec: [spec-2026-09-05-gsc-triage.md](./spec-2026-09-05-gsc-triage.md) (version 2).
Developer review that prompted the revision:
`OJ-AnchorManagementTools/tasks/seo-powerhouse/2026-09-05-gsc-spec-review/developer-review.md`.

**Nothing in this plan is approved.** Streams A to C are code changes that can be
built and tested without approval. Streams D and E need explicit owner approval
before anything happens, because they write to live content, live search settings
or production.

---

## 0. Baseline and working rules

**Do not implement in `/Users/peterpitcher/Cursor/OJ-The-Anchor.pub`.** That
checkout is 11 commits behind `origin/main`, has modified `tasks/todo.md`, and
holds another session's untracked Nations Championship files that also exist
upstream, so a pull will conflict.

Create an isolated worktree from current `origin/main` (`c3ba7d53`):

```bash
git -C /Users/peterpitcher/Cursor/OJ-The-Anchor.pub fetch origin && git -C /Users/peterpitcher/Cursor/OJ-The-Anchor.pub worktree add /Users/peterpitcher/Cursor/.worktrees/gsc-triage -b fix/gsc-triage-2026-09-05 origin/main
```

Rules for every stream:

- Read source with `git show origin/main:<path>` when in doubt. Never trust the
  stale main checkout.
- One logical change per commit, conventional commit messages.
- Run the gate (§6) before each commit. Commit at each stream's gate.
- `npm run typecheck` does not exist. Use `npx tsc --noEmit`.
- Never `POST` to `https://www.the-anchor.pub`. It creates real bookings and real
  SMS. `GET` is fine.
- Do not touch `tasks/todo.md` (another session owns it).

---

## Stream A: bingo event redirects (WP1)

**Blocked on owner decision D1.** Recommended answer: hub. Build it that way; if
D1 comes back "dated pages", only the `destination` values change.

**Files:** `config/redirects/additional-redirects.json` only.

- [ ] A1. Append seven objects to the **end** of the array, matching the existing
  shape exactly: keys in order `source`, `destination`, `permanent`; 2-space
  indent; trailing newline preserved. No other edit, no reordering, no
  regeneration step.

  | source | destination | permanent |
  |---|---|---|
  | `/events/bingo-2026-03-18` | `/cash-bingo` | `true` |
  | `/events/bingo-2026-04-29` | `/cash-bingo` | `true` |
  | `/events/bingo-2026-05-20` | `/cash-bingo` | `true` |
  | `/events/bingo-2026-07-29` | `/cash-bingo` | `true` |
  | `/events/bingo-2026-09-02` | `/cash-bingo` | `true` |
  | `/events/bingo-2026-09-30` | `/cash-bingo` | `true` |
  | `/events/bingo-2026-11-18` | `/cash-bingo` | `true` |

- [ ] A2. Leave the existing `/events/bingo-2026-02-18` rule untouched.
- [ ] A3. Do **not** add these slugs to `RETIRED_THIN_EVENT_SLUGS`.
  `tests/unit/retired-thin-events.test.ts:43` constrains those destinations.
- [ ] A4. Confirm the audit reports 702 rules and "No problems found"
  (695 before, plus seven).

**Acceptance:**

- [ ] A5. `TZ=Europe/London npx jest tests/unit/redirect-audit.test.ts tests/unit/retired-thin-events.test.ts` passes.
- [ ] A6. After deploy, each of the seven old URLs returns **301** with
  `Location: https://www.the-anchor.pub/cash-bingo`, in a **single hop**.
- [ ] A7. `?utm_source=facebook` is preserved verbatim through the redirect.
- [ ] A8. The apex host collapses to one hop, not two.
- [ ] A9. `/events/bingo-2026-02-18` still 301s to `/cash-bingo` (unchanged).
- [ ] A10. `/cash-bingo` returns 200, is `index, follow`, and lists current dates.

**Note in the PR:** these rules are served by **middleware only**;
`next.config.js:66` filters `redirects()` to pattern rules, so they never reach
the framework layer. Do not expect to see them there.

---

## Stream B: blog tag route (WP3 and the test half of WP6)

Single stream because both items touch tag files and would otherwise conflict.

**Files:** `lib/tag-seo-content.ts`, `tests/seo-indexing.test.ts`,
`lib/blog-tag-policy.ts`.

### B1. Fix the HTTP 500 (WP3, P1)

- [ ] B1a. `lib/tag-seo-content.ts:37` currently reads
  `return tagSEOContent[tag] || generateFallbackSEOContent(tag)`. An unguarded
  object-literal lookup resolves `constructor` to `Object` and `__proto__` to
  `Object.prototype`, both truthy, so the fallback never fires, `metaTitle` is
  `undefined`, and `getTwitterMetadata` throws on `title.length`.
  Guard it with `Object.prototype.hasOwnProperty.call(tagSEOContent, tag)`, or
  give `tagSEOContent` a null prototype.
- [ ] B1b. Check the other two call sites for the same exposure:
  `app/blog/tag/[tag]/page.tsx:176` and `app/blog/tags/page.tsx:69`.
- [ ] B1c. Regression test: `constructor`, `__proto__` and one case variant
  (`CONSTRUCTOR`) each return the fallback content rather than throwing.

### B2. Correct the tag tests (WP6)

**Do not delete the block at `tests/seo-indexing.test.ts:593-609.`** Mutation
testing proves it has real value: it awaits the real `generateMetadata` from
`app/blog/tag/[tag]/page.tsx` and asserts `robots` is
`{ index: false, follow: true }`, and asserts sitemap exclusion. Deleting
`app/blog/tag/[tag]/page.tsx:65` turns all four tests red.

- [ ] B2a. Delete only line 599, `expect(isNoindexBlogTag(tag)).toBe(true)`, and
  the now-unused import at line 93.
- [ ] B2b. Keep lines 601-602 and 604-606 verbatim.
- [ ] B2c. Replace the hardcoded
  `['events','food-and-drink','news','sports']` with the generated tag set from
  `generateBlogTagStaticParams()` (already imported at line 90), so all 13
  archives are covered, not 4. Derive the list; never hardcode it.
- [ ] B2d. Respect the five contracts. Do not assert "every archive renders":

  | Case | Expected |
  |---|---|
  | Valid archive (13 today) | 200, `noindex, follow`, lowercase self-canonical, absent from sitemap |
  | Redirecting tag (150 sources) | Single 301 at middleware, before the route. No HTML to assert |
  | Empty or unknown tag | `permanentRedirect('/blog/tags')`, a **308**; in Jest it throws `NEXT_REDIRECT` |
  | Case / encoding variant | Normalised to lowercase, so `/blog/tag/GUIDES` is a 200 duplicate |
  | `constructor` / `__proto__` | Fallback content, no throw (after B1) |

- [ ] B2e. `updates` renders when `TagPage` is called directly in Jest but 301s
  live, because middleware is a different layer. Do not conflate them.

### B3. Dead code (WP6, blocked on D2)

- [ ] B3a. If D2 is "delete": remove `isNoindexBlogTag` and `NOINDEX_BLOG_TAGS`
  from `lib/blog-tag-policy.ts`. **Keep `normalizeBlogTag`**, which is live at
  `app/blog/tag/[tag]/page.tsx:13`.
- [ ] B3b. If D2 is "restore a per-tag policy": do not delete; raise a separate
  design task instead. Do not implement a policy change under this plan.

**Acceptance:**

- [ ] B4. `TZ=Europe/London npx jest tests/seo-indexing.test.ts` passes.
- [ ] B5. Mutation check: temporarily delete `app/blog/tag/[tag]/page.tsx:65` and
  confirm the suite goes red for all 13 tags, then restore it.
- [ ] B6. After deploy: `/blog/tag/constructor`, `/blog/tag/__proto__` and
  `/blog/tag/CONSTRUCTOR` return **200 or 308, never 500**.
- [ ] B7. `/blog/tag/guides` still 200 `noindex, follow`; `/blog/tag/zzz-not-a-tag`
  still 308 to `/blog/tags`; `/blog/tag/six-nations` still 301 to `/blog/tag/sports`.

---

## Stream C: sitemap resilience and documentation

### C1. Investigate the frozen sitemap (WP4, P1)

The sitemap has not regenerated for over 70 minutes and is not recovering
(age 4,191s and climbing, permanently `STALE`, against a 300s window).

- [ ] C1a. **Owner or deployment-permissioned person only:** read the Vercel
  function logs for the `/sitemap.xml` route and confirm or refute the hypothesis
  that `getSitemapEvents` is raising `EventFeedUnavailableError` from its 19
  parallel page fetches on a 3,000 ms timeout.
- [ ] C1b. This cannot be diagnosed from outside. There is no `revalidatePath`,
  no `revalidateTag`, no webhook and no purge route. Cloudflare holds nothing
  (`cf-cache-status: DYNAMIC`).
- [ ] C1c. Only once the cause is known, decide the fix. Candidates, not yet
  chosen: raise the per-page timeout; reduce fan-out; emit a partial sitemap
  rather than failing wholesale; add an error log so the next freeze is visible.
- [ ] C1d. Add `lastmod` to event URLs. They currently have none because the list
  payload omits `_meta`, so Google gets no freshness signal for events.

**Do not merge a speculative fix before C1a.** Changing timeouts without reading
the logs is guessing.

### C2. Correct the lifecycle policy document (WP6)

**File:** `tasks/gsc-indexing-fix/url-lifecycle-policy.md`. Correct only the stale
statements. Do not rewrite the document.

- [ ] C2a. **Line 61.** Currently claims an API 404 or fetch error 301s to
  `/whats-on`. False. Current behaviour is `notFound()`, HTTP 404, for **every**
  failure mode: `anchorAPI.getEvent` swallows all transient errors and throws a
  synthesised `{status: 404}` at `lib/api/client.ts:993`, so `rethrowIfTransient()`
  at `app/events/[id]/page.tsx:324` never fires and the error boundary is
  unreachable on this path. Document what ships. Do not write "the error boundary
  renders", which would be a second false statement.
- [ ] C2b. **Line 104** heading: "draft / missing events" becomes "draft and
  retired events". Missing events are 404s now.
- [ ] C2c. **Lines 109-111.** Test attribution is wrong. The missing-versus-broken
  distinction lives in `tests/unit/api-failure-semantics.test.ts`, at the pure
  function level only. `tests/event-seo-strategy.test.ts` has no such coverage.
- [ ] C2d. **Lines 121-123.** Drop the `redirectSourceTags` sitemap-filter
  mechanism. `app/sitemap.ts` has no such filter and emits no tag archives at all.
- [ ] C2e. **Lines 124-139.** Replace selective tag exclusion with the
  unconditional rule, and record that `isNoindexBlogTag()` is dead production code.
- [ ] C2f. Record that A-before-B remains sound in general but is deliberately
  overridden for Stream A, with the reason (CMS slug instability).

- [ ] C3. Note in the PR, do not fix here: `app/events/[id]/page.tsx:330-332` is
  dead code. `getEvent` is typed `Promise<Event>` and never returns null, so the
  `if (!event) notFound()` branch is unreachable.

---

## Stream D: content corrections (needs approval, no code)

**Nothing here may be executed without explicit owner approval.** These are live
database writes.

### D1. The quiz event (WP2, P1, customer safety)

Record: `/events/pub-quiz-lovely-jubbly-only-fools-and-horses-quiz-night-2026-09-25`.
Resolve by stable ID, not slug.

- [ ] D1a. Capture a before-state snapshot of all six affected fields.
- [ ] D1b. Correct `longDescription` and `about` (byte-identical today) with the
  approved wording from spec §4.
- [ ] D1c. Correct `faq[4].acceptedAnswer.text`.
- [ ] D1d. Correct `brief`, `accessibility_notes` and `accessibilityFeature[0]`,
  which carry the same false claim without triggering the guard.
- [ ] D1e. **The replacement wording must not contain the character sequence
  "accessible toilet", even in a truthful denial.** `getBannedClaims()` does not
  negate-check; verified by execution. A denial keeps the page noindexed.
- [ ] D1f. Preserve slug, dates, capacity, prices and booking settings. Check for
  concurrent edits before saving. Use the authorised edit path and confirm the
  audit record.

**Acceptance:**

- [ ] D1g. `curl -s <event url> | grep -o '<meta name="robots"[^>]*>'` returns
  nothing, or `index, follow`.
- [ ] D1h. No visible surface asserts the facility: body, FAQ, metadata and
  Event JSON-LD `description`.
- [ ] D1i. Allow **0 to 10 minutes** for propagation, typically 5 to 10, and
  request each page twice. Two 300s stale-while-revalidate clocks sit in series
  (the event fetch's data cache, then the page's ISR entry).
- [ ] D1j. Do **not** verify via `GET /api/events/<slug>`. That route is itself
  cached, and cache-busting the URL still reads the same 300s data cache. There
  is no uncached read path on the website. Confirm the save inside the management app.
- [ ] D1k. Sitemap membership cannot be confirmed until WP4 is resolved. Note it
  as blocked rather than claiming it passed.
- [ ] D1l. Do not claim the page will be indexed. State eligibility; record a
  Google check separately, later.

### D2. The SSOT (prerequisite for D1)

Per the project rule, `docs/SSOT.md` is corrected first and copy follows.

- [ ] D2a. The Accessibility section (around line 359) says "Step-free: bar (yes),
  dining area (yes), car park (yes)" and does not mention the entrance. That reads
  as "you can get in step-free", which is not the case.
- [ ] D2b. Add the owner-confirmed fact (5 September 2026): one large step into
  the building, with a ramp.
- [ ] D2c. Resolve owner decisions D3 (ramp always available or on request) and
  D4 (whether the beer-garden ramp line is the same ramp) before writing.
- [ ] D2d. Run `npx jest tests/ssot-drift-guard.test.ts` afterwards.

### D3. The category template (separate, larger)

- [ ] D3a. **13 of 15 upcoming events** carry the same false accessibility claim
  in `accessibility_notes`, from the event-category template in the management
  app. They render safely today only because `getSafeAccessibilityNotes()`
  withholds the field, but the stored data is false.
- [ ] D3b. Correct the template at source. Scope and schedule separately from D1.

---

## Stream E: Search Console (needs approval, owner only)

- [ ] E1. Capture the property and the exact submitted URL
  (`https://www.the-anchor.pub/sitemap-priority.xml`) before acting.
- [ ] E2. Remove **only** that submission. It 404s and no route for it exists.
- [ ] E3. Confirm `https://www.the-anchor.pub/sitemap.xml` remains submitted.
- [ ] E4. Do **not** file a page-removal request. Removing a sitemap submission
  does not remove already-discovered URLs from Search.
- [ ] E5. Do **not** press "Validate Fix" on "Page with redirect", "Excluded by
  noindex" or "Blocked by robots.txt". Those states are permanent by design and
  validation will always fail. Validate only the corrected scope.

---

## 6. Quality gate (before every commit)

```bash
npm run lint && npx tsc --noEmit && npm test && npm run test:utc && npm run build
```

`npm run lint` includes `node scripts/audit-redirects.js`. CI's lint step runs
only `npm run lint:next`, so the redirect audit reaches CI through
`tests/unit/redirect-audit.test.ts`, not through lint. Both timezone runs must be
green: `npm test` pins `TZ=Europe/London`, `npm run test:utc` runs UTC.

Suites most affected: `tests/unit/redirect-audit.test.ts`,
`tests/unit/retired-thin-events.test.ts`, `tests/seo-indexing.test.ts`.
`tests/unit/post-redirect-precedence.test.ts` is `/post/*`-scoped and is not
affected by Stream A; keep it in the full run only.

---

## 7. Release

- [ ] R1. One PR per stream. Streams A, B and C are independent and can land
  separately.
- [ ] R2. Record assumptions in each PR body, including the D1 destination choice.
- [ ] R3. Per the paired-repository rule, state in each PR whether
  `OJ-AnchorManagementTools` needs a counterpart change. Stream A: confirm no
  event in the management app carries any of the seven source slugs, otherwise
  that page becomes permanently unreachable. Stream D is entirely management-app work.
- [ ] R4. **A merge to `main` is not a release.** Website production deployment is
  manual. Capture the commit SHA, the production deployment ID and the alias.
- [ ] R5. Re-run the live acceptance checks (A6-A10, B6-B7) against the production
  alias after deploy, not against a preview.
- [ ] R6. Rollback: keep the last known good deployment ID. Note that reverting a
  website commit does not undo a content edit, and does not recall 301s already
  cached by clients. For content, prefer a corrective revision over restoring
  known-false copy.

---

## 8. Ownership

| Role | Scope | Assigned |
|---|---|---|
| Website developer | Streams A, B, C | unassigned |
| Content editor | Stream D | unassigned |
| GSC operator | Stream E | unassigned |
| Deployment owner | R4, R5, and the C1a log read | unassigned |
| Release verifier | Cross-system sign-off | unassigned |

Owner decisions D1 to D6 are listed in spec §8 and asked in chat. D1 blocks
Stream A's destinations, D2 blocks B3, D3 and D4 block D2 in Stream D.

---

## 9. Closure

- [ ] Z1. Close code work on the acceptance evidence above, not on a GSC number.
- [ ] Z2. A fall in the 631 is not a success measure. Most exclusions are intentional.
- [ ] Z3. Book a GSC recheck once fresh crawl data exists, with a named date set
  at release. Measure the affected canonical URLs, not the site total.
- [ ] Z4. Reopen if a valuable URL starts returning an unexpected 404, a redirect
  destination breaks, a future event unexpectedly goes noindex, or the sitemap
  freezes again.
