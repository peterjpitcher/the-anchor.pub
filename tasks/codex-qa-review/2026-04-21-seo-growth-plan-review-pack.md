# Review Pack: seo-growth-plan

**Generated:** 2026-04-21
**Mode:** C (A=Adversarial / B=Code / C=Spec Compliance)
**Project root:** `/Users/peterpitcher/Cursor/OJ-The-Anchor.pub`
**Base ref:** `main`
**HEAD:** `f4d7a89`
**Diff range:** `main...HEAD`

> This pack is the sole input for reviewers. Do NOT read files outside it unless a specific finding requires verification. If a file not in the pack is needed, mark the finding `Needs verification` and describe what would resolve it.

## Changed Files

_(none detected for this diff range)_

## User Concerns

Verify all file paths, component names, function signatures, and data structures referenced in the plan actually exist in the codebase. Challenge all click/CTR estimates. Check that proposed fixes (robots.ts, meta rewrites, CTA additions, local-seo-data.ts landmarks) are technically correct and won't break anything.

## Spec

Source: `/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/docs/superpowers/plans/2026-04-21-gsc-performance-enhancement-plan.md`

```markdown
# SEO Growth Plan — The Anchor, Stanwell Moor
## 21 April 2026 | v2.0 — SEO Powerhouse Consolidated

---

## Executive Summary

The site is growing fast (+60% clicks, +24% impressions in 28 days) but the growth is in the wrong channel. Plane spotting content drives ~430 clicks/month while the three commercial priorities — food bookings, private events, hosted events — are nearly invisible in search. **The strategic challenge is not traffic volume. It is traffic quality, intent alignment, and conversion.**

This plan operates on a three-layer model:

```
Layer 1 — Technical Foundation  (unblock rendering, fix indexing)
    ↓
Layer 2 — Intent Alignment     (CTR fixes, meta rewrites, schema, new pages)
    ↓
Layer 3 — Traffic Conversion    (CTAs, booking UX, conversion paths)
```

The original plan focused almost entirely on Layer 2. This version adds critical Layer 1 work (CSS rendering blocked by robots.txt) and a complete Layer 3 (7 conversion fixes identified by UX/CRO analysis).

---

## Current Position

| Priority | 28d Clicks | 28d Impressions | Key Gap |
|----------|-----------|----------------|---------|
| P1: Food table bookings | ~67 | ~2,500 | /book-table: 174 imp, 0.57% CTR, pos 10.56 |
| P2: Private event bookings | ~1 | ~1,494 | 77 queries, near-zero clicks, pages ranked 20-27 |
| P3: Hosted events | ~12 | ~1,300 | /whats-on at pos 4.45 with 0.73% CTR |
| Traffic engine (plane spotting) | ~430 | ~16,000 | No conversion path to bookings |

---

## Phase 0 — Critical Technical Fix (Deploy Immediately)

### 0.1 Fix CSS blocked by robots.txt
**Impact:** CRITICAL — Google cannot render ANY page properly
- `/*?dpl=*` in robots.txt blocks ~99 CSS files with Vercel `?dpl=` deployment params
- Affects rich result eligibility for every schema enhancement in this plan
- **Fix:** Change `allow` in `app/robots.ts` to `['/', '/_next/static/']` — specificity wins over the wildcard disallow
- **Also add:** `/cdn-cgi/` to disallow array (Cloudflare 404)
- **Full spec:** `docs/gsc-coverage-fix-spec.md`
- **Verify:** GSC robots.txt report → "Request a recrawl", then URL Inspection "Test Live URL" → check Page Resources

### 0.2 Commit deleted test pages + clean robots.ts
- 10 deleted test/debug directories are unstaged deletes (20 files)
- Also update `app/sitemap-page/page.tsx` and `scripts/audit-hero.js` to remove references
- Commit the modified `app/robots.ts` in the same changeset

**Why Phase 0 ships first:** Every schema, rich result, and rendering-dependent improvement in this plan is degraded while CSS is blocked. This is the foundation.

---

## Phase 1 — CTR Fixes: Meta Title & Description Rewrites

All rewrites from the SEO Copywriter specialist. Each was written against the current codebase metadata with specific character counts and rationale. Full details in `docs/seo-powerhouse/phase-3-deep-dive/copywriter/page-recommendations.md`.

### P3 — Hosted Events (highest CTR gap)

| Page | Current CTR | Position | Recommended Title | Expected Uplift |
|------|------------|----------|-------------------|----------------|
| `/whats-on` | 0.73% | 4.45 | "Quiz, Karaoke & Bingo Every Week \| The Anchor Pub" (55ch) | +40-50 clicks/mo |
| `/karaoke` | 0% | 9.31 | "Karaoke Fridays Near Heathrow \| Free Entry \| The Anchor" (54ch) | +5-10 clicks/mo |
| `/quiz-night` | 1.69% | 8.93 | "Pub Quiz Near Heathrow \| £3 Entry, Cash Prizes \| The Anchor" (55ch) | +5 clicks/mo |
| `/music-bingo` | 1.45% | 10.8 | "Music Bingo Near Heathrow \| Win Every Round \| The Anchor" (60ch) | +3-5 clicks/mo |

### P1 — Food Bookings

| Page | Current CTR | Position | Recommended Title | Expected Uplift |
|------|------------|----------|-------------------|----------------|
| `/book-table` | 0.57% | 10.56 | "Book a Table Near Heathrow \| Sunday Roast \| The Anchor" (57ch) | +8-12 clicks/mo |
| `/sunday-lunch` | 1.31% | 9.78 | "Sunday Roast Near Heathrow \| From £19 \| Book by Saturday" (58ch) | +5-8 clicks/mo |
| `/food-menu` | 2.38% | 6.83 | No title change — add "Book a Table" to description | +3-5 clicks/mo |

### P2 — Private Events

| Page | Current CTR | Position | Recommended Title |
|------|------------|----------|-------------------|
| `/private-hire/wakes` | 0.57% | 25.58 | "Wake & Funeral Reception Venue \| Near Heathrow \| The Anchor" (60ch) |
| `/private-hire/christenings` | — | — | "Christening Venue Near Heathrow & Staines \| The Anchor" (60ch) |

### Brand & Local

| Page | Current CTR | Position | Recommended Title |
|------|------------|----------|-------------------|
| `/stanwell-pub` | 0.17% | 4.07 | "The Anchor \| Stanwell Moor Pub \| Rated 4.6★ on Google" (55ch) |
| `/near-heathrow` | 0.78% | 12.76 | "Pub Near Heathrow Airport \| 7 Mins from T5 \| The Anchor" (57ch) |
| `/live-sport` | 0.50% | 8.62 | "Watch Live Sport Near Heathrow \| Big Screens \| The Anchor" (58ch) |
| `/` (homepage) | 0.46% | 7.5 | "The Anchor Pub \| Stanwell Moor \| Near Heathrow" (52ch) |

**Total estimated uplift from meta rewrites alone: +70-90 clicks/month.**

---

## Phase 2 — Conversion Path Fixes (Layer 3)

These are the UX/CRO findings. The site is generating impressions and some clicks, but the conversion paths are broken or missing. Full report in `docs/seo-powerhouse/phase-3-deep-dive/ux-cro/report.md`.

### 2.1 Blog template: Add food/booking CTAs (HIGH impact)
- **Problem:** ~430 clicks/month from plane spotting land on blog posts with only "Get Directions" and "More Stories" as CTAs. Zero commercial exit.
- **Fix:** Add contextual mid-content CTA block to blog template + replace footer CTAs with "View Food Menu / Book a Table / Get Directions"
- **CTA copy:** "Visiting Heathrow? The Anchor is 5 minutes away — grab lunch in our beer garden. Food from £8.95."
- **Note:** Content Strategist confirmed the `/plane-spotting-heathrow` landing page already has booking CTAs. The gap is in the blog template used by `/blog/heathrow-plane-spotting-locations` (262 clicks/28d).

### 2.2 /food-menu: Add "Book a Table" to footer CTA (HIGH impact, XS effort)
- **Problem:** Footer CTASection has "Call" and "View Drinks Menu" but no booking button. The highest-traffic food page (41 clicks/28d) sends users to drinks, not bookings.
- **Fix:** Add `BookTableButton` as third button in CTASection.
- **Also fix on:** `/food-menu/gluten-free` (same issue noted in original plan)

### 2.3 /book-table: Swap hero CTA priority (MEDIUM impact, XS effort)
- **Problem:** Hero `primaryCta` is a phone button. The booking form — the actual conversion goal — is below the fold.
- **Fix:** Make "Book Online Now" (anchor to `#booking-form`) the primary CTA; phone becomes secondary.

### 2.4 /private-hire/wakes: Embed enquiry form (MEDIUM impact, S effort)
- **Problem:** "Enquire Online" navigates to `/private-hire#enquiry` — a different page. Bereaved families lose context.
- **Fix:** Embed a lightweight enquiry form directly on the wakes page, or at minimum add an `#enquiry` section.

### 2.5 /quiz-night: Pre-fill booking date (MEDIUM impact, S effort)
- **Problem:** BookTableButton goes to generic form with no date. Users who want "next quiz night" land on a blank form.
- **Fix:** Pass next event date as `/book-table?date=YYYY-MM-DD&purpose=drinks`.

### 2.6 /whats-on: Add per-event booking links (MEDIUM impact, S effort)
- **Problem:** Events are listed but there's no "Reserve a table for this night" on individual cards.
- **Fix:** Add event-date booking links on cards. Sticky banner: "Coming to Quiz Night? Book Your Table."

### 2.7 /sunday-lunch: Add price to hero (LOW-MEDIUM impact, XS effort)
- **Problem:** "From £19" is in the Google snippet but not confirmed in the hero. Trust gap on landing.
- **Fix:** Add "From £19pp" as a hero badge.

---

## Phase 3 — Content & New Pages

### 3.1 Add 4 new landmarks to `lib/local-seo-data.ts` (S effort, HIGH impact)
The `/private-hire/near/[slug]` template auto-generates pages from this data file. The slough-crematorium page is the best performer in all of P2 (5.98% CTR). Adding entries creates new pages with zero template work.

| New Landmark | Location | Target Keywords |
|-------------|----------|----------------|
| `kempton-park-crematorium` | Hanworth TW13 | "wake venue near Kempton Park crematorium" |
| `windsor-register-office` | Windsor SL4 | "private hire near Windsor", "event venue Windsor" |
| `heathrow-airport` | TW6 | "private hire near Heathrow", "corporate venue" |
| `spelthorne-registration-office` | Staines TW18 | "private hire near Staines", "event venue Staines" |

### 3.2 Expand /private-hire/wakes content (S effort, HIGH impact)
- Currently at position 25 — needs to reach top 10
- Add 2 crematorium-proximity H2 sections (~240 words): "Near Slough Crematorium" and "Near Staines Cemetery"
- Update meta description to include Slough and Staines Cemetery
- Add internal link to `/food-menu` in catering packages section
- Tone: empathetic, dignified, practical — phone-first CTA

### 3.3 Fix /private-hire hub title cannibalisation (XS effort)
- `/private-hire` and `/function-room-hire` both target "function room hire heathrow" in their titles
- **Fix:** Change `/private-hire` title to "Private Hire Venue Near Heathrow | Wakes, Parties & Events | The Anchor" — positions as hub, removes keyword overlap

---

## Phase 4 — Schema & Structured Data

### 4.1 Add EventVenue schema to /private-hire hub
- Currently only BreadcrumbJsonLd — missing parent venue schema
- Add EventVenue with capacity, amenities, ReserveAction

### 4.2 Add Restaurant/Menu schema to dietary sub-pages
- `/food-menu/gluten-free`, `/vegan`, `/vegetarian` only have FAQPage schema
- Add Restaurant + Menu schema to match main `/food-menu`

### 4.3 Add EventSeries schema to /live-music
- Quiz night and bingo pages have EventSeries — live music does not
- Add recurring event series schema for regular live music nights

### 4.4 Strengthen homepage LocalBusiness schema
- Add `sameAs` links to Google Business Profile, Facebook, etc.
- Verify `aggregateRating` is present
- Helps with "the anchor pub" brand query (438 imp, pos 7.5, 0.46% CTR)

---

## Phase 5 — Indexing Cleanup

### 5.1 Fix 4 redirect chains (XS effort)
- Update sources in `config/redirects/wix-redirects.json` to point directly to `/live-sport`
- Affected: `/post/euro-2024-*` and `/post/autumn-internationals-*`

### 5.2 Clean 29 duplicate redirect entries (S effort)
- Remove dead entries from `blog-redirects.json` where wix-redirects already handles the path

### 5.3 Update STATIC_LAST_MODIFIED in sitemap.ts
- Currently hardcoded to 2026-03-20 — update to 2026-04-21

### 5.4 Review 8 single-post blog tags
- Cross-reference against `lib/tag-seo-content.ts` — curated SEO pages stay indexed, auto-generated thin tags get `noindex`

---

## Priority Execution Order

| # | Action | Phase | Effort | Impact | Priority |
|---|--------|-------|--------|--------|----------|
| 1 | Fix CSS robots.txt blocking | 0.1 | XS | **CRITICAL** | P0 — unblocks everything |

[spec truncated at line 200 — original has 267 lines]
```

## Diff (`main...HEAD`)

_(no diff output)_

## Changed File Contents

_(no files to include)_
## Related Files (grep hints)

_(no related files found by basename grep)_

## Workspace Conventions (`Cursor/CLAUDE.md`)

```markdown
# CLAUDE.md — Workspace Standards

Shared guidance for Claude Code across all projects. Project-level `CLAUDE.md` files take precedence over this one — always read them first.

## Default Stack

Next.js 15 App Router, React 19, TypeScript (strict), Tailwind CSS, Supabase (PostgreSQL + Auth + RLS), deployed on Vercel.

## Workspace Architecture

21 projects across three brands, plus shared tooling:

| Prefix | Brand | Examples |
|--------|-------|----------|
| `OJ-` | Orange Jelly | AnchorManagementTools, CheersAI2.0, Planner2.0, MusicBingo, CashBingo, QuizNight, The-Anchor.pub, DukesHeadLeatherhead.com, OrangeJelly.co.uk, WhatsAppVideoCreator |
| `GMI-` | GMI | MixerAI2.0 (canonical auth reference), TheCookbook, ThePantry |
| `BARONS-` | Barons | CareerHub, EventHub, BrunchLaunchAtTheStar, StPatricksDay, DigitalExperienceMockUp, WebsiteContent |
| (none) | Shared / test | Test, oj-planner-app |

## Core Principles

**How to think:**
- **Simplicity First** — make every change as simple as possible; minimal code impact
- **No Laziness** — find root causes; no temporary fixes; senior developer standards
- **Minimal Impact** — only touch what's necessary; avoid introducing bugs

**How to act:**
1. **Do ONLY what is asked** — no unsolicited improvements
2. **Ask ONE clarifying question maximum** — if unclear, proceed with safest minimal implementation
3. **Record EVERY assumption** — document in PR/commit messages
4. **One concern per changeset** — if a second concern emerges, park it
5. **Fail safely** — when in doubt, stop and request human approval

### Source of Truth Hierarchy

1. Project-level CLAUDE.md
2. Explicit task instructions
3. Existing code patterns in the project
4. This workspace CLAUDE.md
5. Industry best practices / framework defaults

## Ethics & Safety

AI MUST stop and request explicit approval before:
- Any operation that could DELETE user data or drop DB columns/tables
- Disabling authentication/authorisation or removing encryption
- Logging, sending, or storing PII in new locations
- Changes that could cause >1 minute downtime
- Using GPL/AGPL code in proprietary projects

## Communication

- When the user asks to "remove" or "clean up" something, clarify whether they mean a code change or a database/data cleanup before proceeding
- Ask ONE clarifying question maximum — if still unclear, proceed with the safest interpretation

## Debugging & Bug Fixes

- When fixing bugs, check the ENTIRE application for related issues, not just the reported area — ask: "Are there other places this same pattern exists?"
- When given a bug report: just fix it — don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user

## Code Changes

- Before suggesting new environment variables or database columns, check existing ones first — use `grep` to find existing env vars and inspect the current schema before proposing additions
- One logical change per commit; one concern per changeset

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- One task per subagent for focused execution

### 3. Task Tracking
- Write plan to `tasks/todo.md` with checkable items before starting
- Mark items complete as you go; document results when done

### 4. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules that prevent the same mistake; review lessons at session start

### 5. Verification Before Done
- Never mark a task complete without proving it works
- Run tests, check logs, demonstrate correctness
- Ask yourself: "Would a staff engineer approve this?"
- For non-trivial changes: pause and ask "is there a more elegant way?"

### 6. Codex Integration Hook
Uses OpenAI Codex CLI to audit, test and simulate — catches what Claude misses.

```
when: "running tests OR auditing OR simulating"
do:
  - run_skill(codex-review, target=current_task)
  - compare_outputs(claude_result, codex_result)
  - flag_discrepancies(threshold=medium)
  - merge_best_solution()
```

The full multi-specialist QA review skill lives in `~/.claude/skills/codex-qa-review/`. Trigger with "QA review", "codex review", "second opinion", or "check my work". Deploys four specialist agents (Bug Hunter, Security Auditor, Performance Analyst, Standards Enforcer) into a single prioritised report.

## Common Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run lint      # ESLint (zero warnings enforced)
npm test          # Run tests (Vitest unless noted otherwise)
npm run typecheck # TypeScript type checking (npx tsc --noEmit)
npx supabase db push   # Apply pending migrations (Supabase projects)
```

## Coding Standards

### TypeScript
- No `any` types unless absolutely justified with a comment
- Explicit return types on all exported functions
- Props interfaces must be named (not inline anonymous objects for complex props)
- Use `Promise<{ success?: boolean; error?: string }>` for server action return types

### Frontend / Styling
- Use design tokens only — no hardcoded hex colours in components
- Always consider responsive breakpoints (`sm:`, `md:`, `lg:`)
- No conflicting or redundant class combinations
- Design tokens should live in `globals.css` via `@theme inline` (Tailwind v4) or `tailwind.config.ts`
- **Never use dynamic Tailwind class construction** (e.g., `bg-${color}-500`) — always use static, complete class names due to Tailwind's purge behaviour

### Date Handling
- Always use the project's `dateUtils` (typically `src/lib/dateUtils.ts`) for display
- Never use raw `new Date()` or `.toISOString()` for user-facing dates
- Default timezone: Europe/London
- Key utilities: `getTodayIsoDate()`, `toLocalIsoDate()`, `formatDateInLondon()`

### Phone Numbers
- Always normalise to E.164 format (`+44...`) using `libphonenumber-js`

## Server Actions Pattern

All mutations use `'use server'` functions (typically in `src/app/actions/` or `src/actions/`):

```typescript
'use server';
export async function doSomething(params): Promise<{ success?: boolean; error?: string }> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  // ... permission check, business logic, audit log ...
  revalidatePath('/path');
  return { success: true };
}
```

## Database / Supabase

See `.claude/rules/supabase.md` for detailed patterns. Key rules:
- DB columns are `snake_case`; TypeScript types are `camelCase`
- Always wrap DB results with a conversion helper (e.g. `fromDb<T>()`)
- RLS is always on — use service role client only for system/cron operations
- Two client patterns: cookie-based auth client and service-role admin client

### Before Any Database Work
Before making changes to queries, migrations, server actions, or any code that touches the database, query the live schema for all tables involved:
```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name IN ('relevant_table') ORDER BY ordinal_position;
```
Also check for views referencing those tables — they will break silently if columns change:
```sql
SELECT table_name FROM information_schema.view_table_usage
WHERE table_name IN ('relevant_table');
```

### Migrations
- Always verify migrations don't conflict with existing timestamps
- Test the connection string works before pushing
- PostgreSQL views freeze their column lists — if underlying tables change, views must be recreated
- Never run destructive migrations (DROP COLUMN/TABLE) without explicit approval

## Git Conventions

See `.claude/rules/pr-and-git-standards.md` for full PR templates, branch naming, and reviewer checklists. Key rules:
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- Never force-push to `main`
- One logical change per commit
- Meaningful commit messages explaining "why" not just "what"

## Rules Reference

Core rules (always loaded from `.claude/rules/`):

| File | Read when… |
|------|-----------|
| `ui-patterns.md` | Building or modifying UI components, forms, buttons, navigation, or accessibility |
| `testing.md` | Adding, modifying, or debugging tests; setting up test infrastructure |
| `definition-of-ready.md` | Starting any new feature — check requirements are clear before coding |
| `definition-of-done.md` | Finishing any feature — verify all quality gates pass |
| `complexity-and-incremental-dev.md` | Scoping a task that touches 4+ files or involves schema changes |
| `pr-and-git-standards.md` | Creating branches, writing commit messages, or opening PRs |
| `verification-pipeline.md` | Before pushing — run the full lint → typecheck → test → build pipeline |
| `supabase.md` | Any database query, migration, RLS policy, or client usage |

Domain rules (auto-injected from `.claude/docs/` when you edit relevant files):

| File | Domain |
|------|--------|
| `auth-standard.md` | Auth, sessions, middleware, RBAC, CSRF, password reset, invites |
| `background-jobs.md` | Async job queues, Vercel Cron, retry logic |
| `api-key-auth.md` | External API key generation, validation, rotation |
| `file-export.md` | PDF, DOCX, CSV generation and download |
| `rate-limiting.md` | Upstash rate limiting, 429 responses |
| `qr-codes.md` | QR code generation (client + server) |
| `toast-notifications.md` | Sonner toast patterns |
| `email-notifications.md` | Resend email, templates, audit logging |
| `ai-llm.md` | LLM client, prompts, token tracking, vision |
| `payment-processing.md` | Stripe/PayPal two-phase payment flows |
| `data-tables.md` | TanStack React Table v8 patterns |

## Quality Gates

A feature is only complete when it passes the full Definition of Done checklist (`.claude/rules/definition-of-done.md`). At minimum: builds, lints, type-checks, tests pass, no hardcoded secrets, auth checks in place, code commented where complex.
```

## Project Conventions (`CLAUDE.md`)

```markdown
# CLAUDE.md — The Anchor Pub Website

Project-specific guidance. The workspace CLAUDE.md at `/Users/peterpitcher/Cursor/CLAUDE.md` covers general standards (TypeScript, Tailwind, Supabase, Git, testing, auth). Read this file for what's unique to this project.

---

## Stack

- **Next.js 14** App Router, TypeScript, Tailwind CSS, CVA
- **No database** — this is a marketing/booking website only; all data lives in the management app
- **Hosting:** Vercel | **DNS:** Cloudflare | **Analytics:** Google Tag Manager
- **Tests:** Jest (`npm test`) in `tests/`

---

## Relationship with OJ-AnchorManagementTools

These two applications form a paired system. Understanding their relationship is essential before making changes to anything involving bookings, hours, or availability.

### What each app does

| | The Anchor Website (`OJ-The-Anchor.pub`) | Management App (`OJ-AnchorManagementTools`) |
|---|---|---|
| **Purpose** | Customer-facing marketing site + booking flow | Staff/admin tool for managing the pub |
| **Users** | Public customers | Staff and managers |
| **Database** | None | Supabase (PostgreSQL) — sole source of truth |
| **Hosting** | Vercel (this repo) | Vercel (separate repo at `/Users/peterpitcher/Cursor/OJ-AnchorManagementTools`) |

### Data flow

```
Management App (Supabase DB)
        │
        │  REST API (ANCHOR_API_KEY auth)
        │  Base URL: management.orangejelly.co.uk
        ▼
  Website (this repo)
  Next.js API routes proxy the calls
  (protects API key, handles CORS, adds caching)
```

The website **never writes to any database directly**. All mutations (create booking, submit enquiry, etc.) go through the management API.

### Key API endpoints the website consumes

| Endpoint | Purpose |
|---|---|
| `GET /business/hours` | Regular opening hours + special hours overrides |
| `GET /table-bookings/availability` | Available booking slots for a given date/type |
| `POST /table-bookings` | Create a table booking |
| `GET /events` | Upcoming events |
| `GET /menus` | Food/drink menus |

### Special hours override pattern

The management app stores per-date overrides in a `special_hours` table. The website receives these via `/business/hours`. Critical fields:

- `kitchen: null` — kitchen is closed for that date
- `is_kitchen_closed: true` — explicit kitchen closure flag (defence-in-depth)
- `is_closed: true` — full venue closure
- `schedule_config: []` — custom booking schedule for the date

**Important:** `kitchen: null` must be treated as a deliberate "closed" signal — not as "data absent". Use `??` not `||` when resolving special vs regular kitchen data. Using `||` will cause `null` to fall through to regular hours. This has bitten us before (March 2026 bug).

### Booking type → kitchen dependency

| Booking type | Requires kitchen |
|---|---|
| `sunday_lunch` | Yes |
| `food` | Yes |
| `drinks` | No |

If `is_kitchen_closed` or `kitchen === null` for a date, food/sunday_lunch slots must return empty. Drinks slots are unaffected.

### Key files in this repo that touch the management API

| File | Role |
|---|---|
| `lib/api.ts` | Main API client — `anchorAPI.*` methods. Also contains `buildTableAvailabilityFromBusinessHours()` (fallback slot generator) |
| `lib/table-booking-service-windows.ts` | `resolveServiceRanges()` — converts business hours into bookable time slots |
| `lib/hours-utils.ts` | `getEffectiveDayHours()`, `isKitchenClosed()` — correct `??`-based utilities for hours logic |
| `app/api/*/route.ts` | API proxy routes — never expose `ANCHOR_API_KEY` client-side |

---

## Critical Business Rules

- **Brand:** Always "The Anchor" (not "The Anchor Pub") in customer-facing copy
- **Contact:** manager@the-anchor.pub | 01753 682707
- **Location:** Stanwell Moor, near Heathrow Airport
- **Monday kitchen:** Always closed unless a special hours record explicitly opens it
- **Sunday lunch:** Requires advance booking and prepayment; blocked if kitchen is closed for that date
- **No service:** No breakfast, delivery, Sky Sports, or guest ales
- **Verified copy:** `/docs/copy-assumptions.md` is the source of truth for operational claims used in page copy

---

## SEO & Domain

- **Canonical domain:** `https://www.the-anchor.pub` (with www — Cloudflare + Vercel)
- **Cloudflare TLS:** Must be "Full" or "Full (strict)" — never "Flexible" (causes redirect loops)

### Canonical URL pattern — DO NOT hardcode in root layout

```typescript
// app/layout.tsx — metadataBase only, NO alternates.canonical here
export const metadata: Metadata = {
  metadataBase: new URL('https://www.the-anchor.pub'),
}

// Individual pages — relative canonical
export const metadata: Metadata = {
  alternates: { canonical: './' },
}
```

Hardcoding `canonical` in the root layout makes every page claim to be the homepage. This was a past bug — don't repeat it.

---

## Architecture

```
app/                  Next.js App Router pages
  api/                Proxy routes to management API
  book-table/         Booking wizard flow
components/
  ui/                 Reusable primitives (Button, Input, Badge, etc.)
  features/           Business-domain components
  tracking/           GTM analytics components
lib/
  api.ts              Management API client + availability logic
  table-booking-service-windows.ts  Slot resolution
  hours-utils.ts      Business hours utilities
  gtm-events.ts       Analytics event helpers
  constants.ts        Business constants
public/               Static assets
docs/                 Documentation (api-integration.md, copy-assumptions.md, parking-api.md)
tests/                Jest test files
```

### Patterns

- **Default to Server Components.** Add `'use client'` only for interactivity.
- **API proxy pattern:** All calls to `management.orangejelly.co.uk` go through `app/api/*/route.ts`. Never call the management API directly from client components.
- **Hours single source of truth:** Use `lib/hours-utils.ts` utilities for any hours display logic. Do not re-implement hours parsing inline.
- **CVA for component variants** — use `cva()`, not ad-hoc Tailwind conditionals.

---

## Adding a New Page

```typescript
// app/new-route/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Title | The Anchor Stanwell Moor',
  description: 'Page description',
  alternates: { canonical: './' },
}

export default function Page() {
  return <>{/* content */}</>
}
```

Also add the route to `app/sitemap.ts`.

---

## Analytics

```typescript
'use client'
import { trackEventName } from '@/lib/gtm-events'

<Button onClick={() => trackEventName('source_location')}>Action</Button>
```

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `ANCHOR_API_KEY` | Auth key for management.orangejelly.co.uk |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager container ID |
| `NEXT_PUBLIC_AVIATIONSTACK_API_KEY` | Flight data (Heathrow parking feature) |
```

## Rule: `/Users/peterpitcher/Cursor/.claude/rules/definition-of-done.md`

```markdown
# Definition of Done (DoD)

A feature is ONLY complete when ALL applicable items pass. This extends the Quality Gates in the root CLAUDE.md.

## Code Quality

- [ ] Builds successfully — `npm run build` with zero errors
- [ ] Linting passes — `npm run lint` with zero warnings
- [ ] Type checks pass — `npx tsc --noEmit` clean (or project equivalent)
- [ ] No `any` types unless justified with a comment
- [ ] No hardcoded secrets or API keys
- [ ] No hardcoded hex colours — use design tokens
- [ ] Server action return types explicitly typed

## Testing

- [ ] All existing tests pass
- [ ] New tests written for business logic (happy path + at least 1 error case)
- [ ] Coverage meets project minimum (default: 80% on business logic)
- [ ] External services mocked — never hit real APIs in tests
- [ ] If no test suite exists yet, note this in the PR as tech debt

## Security

- [ ] Auth checks in place — server actions re-verify server-side
- [ ] Permission checks present — RBAC enforced on both UI and server
- [ ] Input validation complete — all user inputs sanitised (Zod or equivalent)
- [ ] No new PII logging, sending, or storing without approval
- [ ] RLS verified (Supabase projects) — queries respect row-level security

## Accessibility

- [ ] Interactive elements have visible focus styles
- [ ] Colour is not the sole indicator of state
- [ ] Modal dialogs trap focus and close on Escape
- [ ] Tables have proper `<thead>`, `<th scope>` markup
- [ ] Images have meaningful `alt` text
- [ ] Keyboard navigation works for all interactive elements

## Documentation

- [ ] Complex logic commented — future developers can understand "why"
- [ ] README updated if new setup, config, or env vars are needed
- [ ] Environment variables documented in `.env.example`
- [ ] Breaking changes noted in PR description

## Deployment

- [ ] Database migrations tested locally before pushing
- [ ] Rollback plan documented for schema changes
- [ ] No console.log or debug statements left in production code
- [ ] Verification pipeline passes (see `verification-pipeline.md`)
```

---

_End of pack._
