# PageSpeed Insights Fixes — Design Spec (v2)

**Date:** 5 April 2026
**Source:** PageSpeed Insights report for https://www.the-anchor.pub (mobile, 5 April 2026)
**Revised:** After Codex QA Review (Spec Compliance Auditor, Performance Analyst, Standards Enforcer)
**Goal:** Address all actionable findings from the PSI report that are within our codebase control.
**Complexity:** S (2) — 6 files touched, no schema changes, no breaking changes

---

## Issues to Fix

### 1. "Learn more" link text (SEO)

**File:** `components/CookieBanner.tsx` (lines 78 and 121)
**Current:** Two `<Link>` elements with text "Learn more" pointing to `/privacy-policy`
**Fix:** Change text to "Read our privacy policy" on both instances (mobile line 78, desktop line 121)
**Impact:** Resolves "Links do not have descriptive text" SEO audit (2 links found)

### 2. Hero image LCP — 8.9s on mobile

**Files:**
- `components/hero/HeroSectionServer.tsx` (lines 118-119) — primary, used for homepage
- `components/hero/HeroSection.tsx` (lines 150-151) — client variant, update for consistency

**Current:** Hero background image uses `quality={82}`
**Fix:**
- Reduce `quality` from 82 to **65** (the dark gradient overlay makes compression artefacts invisible — validated by Performance Analyst)
- Apply to BOTH HeroSectionServer.tsx AND HeroSection.tsx for consistency
- Do NOT change the `sizes` attribute — Next.js rounds up to the nearest `deviceSize` (640px minimum), so reducing to 480px has no effect unless `next.config` is also changed. Leave sizes as-is.
**Impact:** ~25-35% image size reduction. Combined with Issue 7 (GTM deferral), meaningful LCP improvement.

**Note:** The spec previously claimed ~50% reduction at quality 75. The Performance Analyst corrected this — Next.js already transcodes to AVIF/WebP, so the starting point is already compressed. Quality 65 is needed for meaningful savings.

### 3. CLS 0.193 — Hero section shifts during load

**Files:**
- `components/layout/StatusBar.tsx` (line ~233) — loading state
- `hooks/useBusinessHours.ts` — async data fetch

**Root cause (revised after QA review):** The CLS is NOT caused by `min-h-` classes (changing to fixed `h-` would clip content on mobile and make things worse). The actual causes are:
1. **StatusBar async hydration** — the StatusBar client component fetches business hours data and changes height when it loads. The loading skeleton and loaded state have different heights.
2. **Font swap** — Outfit and Merriweather fonts use `display: swap`, causing text reflow when fonts load.

**Fix:**
- Ensure StatusBar loading skeleton has the **exact same height** as the loaded state. Match padding, line-height, and content structure so the swap is pixel-identical.
- Do NOT change `min-h-` to `h-` on the hero container. `overflow-hidden` is already present on the section element.

**Risk:** Low — we're only matching skeleton height to loaded height, no structural changes.

### 4. Oversized event images

**File:** `components/NextEventServer.tsx` (line 133) — the main next-event poster image
**Current:** Image uses `fill` with `sizes` that result in a 640x640 image being served for a ~200x200 display area
**Fix:** Tighten the `sizes` attribute on the poster image at line 133 to match actual display dimensions. For `fill` images, do NOT add explicit `width`/`height` — tighten `sizes` instead.
**Also check:** `components/FilteredUpcomingEventsClient.tsx` lines 250 and 342, `components/EventCountdownBanner.tsx` line 295 — these may already have correct sizes per Codex audit.
**Impact:** Saves ~100-160KB of image data on homepage

### 5. Cookie banner touch targets (Accessibility)

**File:** `components/CookieBanner.tsx`
**Current:** Mobile buttons use small sizes that fall below 48x48px minimum:
- Accept button (line ~102): `size="xs"` with `className="px-2 py-1 text-xs"`
- Reject button (line ~93): likely same sizing issue
- Settings icon button (line ~83): small icon button

**Fix:**
- Change Accept AND Reject mobile buttons: remove `size="xs"` and restrictive className overrides, use `size="sm"` with explicit `className="min-h-[48px] min-w-[48px]"` to guarantee 48px minimum
- Ensure settings icon button also meets 48px minimum tap target
- Verify desktop buttons don't need changes (they're typically larger already)

**Impact:** Resolves "Touch targets do not have sufficient size or spacing" audit

**Note:** The Button primitive's `sm` size is only `min-h-[44px]` (per `components/ui/primitives/Button.tsx:35`), which is 4px short of the 48px WCAG minimum. The explicit `min-h-[48px]` override is necessary.

### 7. GTM script blocking LCP (NEW — from QA review)

**File:** GTM script injection (likely in `app/layout.tsx` or a tracking component)
**Current:** Google Tag Manager is injected synchronously into `<head>`, parser-blocking the page and delaying LCP.
**Fix:** Move GTM to use Next.js `<Script strategy="afterInteractive">` so it loads after the page is interactive, not during initial parse.
**Impact:** This is the single biggest LCP improvement available — removes parser-blocking from the critical rendering path.

### 8. Dual priority images competing for bandwidth (NEW — from QA review)

**File:** `app/page.tsx` (homepage hero section, lines ~133-143)
**Current:** Both the hero background image AND the logo image have `priority={true}`, meaning the browser tries to fetch both simultaneously on mobile, competing for limited bandwidth.
**Fix:** Remove `priority` (or set `priority={false}`) from the logo image. Only the hero background should be priority — it's the LCP element.
**Impact:** Reduces bandwidth contention on mobile, allowing the LCP image to load faster.

---

## Deferred to Separate Ticket

### 6. Colour contrast (Accessibility)

**Reason for deferral:** PSI flagged insufficient contrast but no specific elements were identified. This requires a rendered-page accessibility audit (not source code review) to identify the exact failing elements and their contrast ratios. It fails Definition of Ready as currently scoped — no specific elements, no concrete fix, no testable acceptance criteria.

**Action:** Create a follow-up ticket for a dedicated accessibility contrast audit using axe-core or similar tool against the rendered page.

---

## Out of Scope

| Issue | Why |
|-------|-----|
| `Content-Signal: search=yes,ai-train=no` in robots.txt | Injected by Cloudflare, not in codebase. Fix in Cloudflare dashboard. |
| Facebook Pixel / LinkedIn Ads / Clarity script weight | Third-party tracking scripts. Can't optimise without removing. |
| LinkedIn deprecated `AttributionReporting` API | Third-party script issue. |
| Render-blocking CSS | Next.js CSS extraction is standard behaviour. Minimal gain from changing. |
| Font `display: swap` CLS contribution | Changing to `display: optional` could cause FOIT (flash of invisible text). Low-risk CLS contributor compared to StatusBar. Monitor after StatusBar fix. |

---

## Manual Actions (Not Code)

- **Cloudflare:** Remove or move `Content-Signal` directive from robots.txt injection. Check Cloudflare Dashboard → Rules → Transform Rules or Page Rules.
- **Event images:** When uploading event posters to Supabase storage, resize to max 400x400px before upload (operational, not code).

---

## Success Criteria

- PSI SEO audit: "Links do not have descriptive text" — resolved (0 links found)
- PSI SEO audit: "robots.txt is not valid" — resolved (after Cloudflare fix)
- Mobile LCP: Reduced from 8.9s — target 6-7s range (realistic with image + GTM fixes)
- CLS: Reduced from 0.193 — target <0.1 (StatusBar skeleton fix)
- Accessibility: Touch targets audit passes (all cookie banner buttons ≥48px)
- Colour contrast: Deferred to separate ticket with proper scoping

---

## QA Review Provenance

This spec was revised based on findings from:
- **Codex Spec Compliance Auditor** — identified incorrect CLS root cause, incomplete touch target fix, missing file paths for event images, redundant overflow-hidden suggestion
- **Claude Performance Analyst** — corrected image quality savings estimate, identified ineffective sizes change, flagged GTM as biggest LCP blocker, identified dual priority image issue
- **Claude Standards Enforcer** — flagged Issue 6 as failing Definition of Ready, identified missing complexity score and test plan

Reports saved in `tasks/codex-qa-review/2026-04-05-pagespeed-fixes-*.md`
