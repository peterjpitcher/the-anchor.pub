# PageSpeed Insights Fixes — Design Spec

**Date:** 5 April 2026
**Source:** PageSpeed Insights report for https://www.the-anchor.pub (mobile, 5 April 2026)
**Goal:** Address all actionable findings from the PSI report that are within our codebase control.

---

## Issues to Fix

### 1. "Learn more" link text (SEO — Lighthouse flags non-descriptive link text)

**File:** `components/CookieBanner.tsx` (lines 78 and 121)
**Current:** Two `<Link>` elements with text "Learn more" pointing to `/privacy-policy`
**Fix:** Change text to "Read our privacy policy" on both instances
**Impact:** Resolves "Links do not have descriptive text" SEO audit (2 links found)

### 2. Hero image LCP — 8.9s on mobile

**File:** `components/hero/HeroSectionServer.tsx` (line 119)
**Current:** Hero background image uses `quality={82}` and `sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1920px"`
**Fix:**
- Reduce `quality` from 82 to 75 (still visually indistinguishable on a photo background with overlay)
- Reduce mobile sizes to 480px: `sizes="(max-width: 640px) 480px, (max-width: 1024px) 1024px, 1920px"`
**Impact:** Should reduce hero image from ~200KB to ~100-120KB, significantly improving mobile LCP

### 3. CLS 0.193 — Hero section shifts during load

**File:** `components/hero/HeroSectionServer.tsx` and `components/hero/HeroSection.tsx`
**Current:** Hero uses `min-h-[70vh] sm:min-h-[80vh] md:min-h-[90vh]` which allows the section to grow beyond minimum as content loads progressively
**Root cause:** Two layout shifts totalling 0.193, both on the hero `<section>` element. Dynamic content (seasonal greeting, logo, status bar, tags, CTAs) renders progressively, causing the hero to reflow.
**Fix:** Change `min-h-` to fixed `h-` on the hero size variant so the container doesn't resize:
- `hero: 'h-[70vh] sm:h-[80vh] md:h-[90vh]'`
- Keep `min-h-` for other size variants (large, medium, small) that may need to grow for content
- Add `overflow-hidden` to prevent content overflow if it exceeds the fixed height
**Risk:** If hero content is taller than the viewport fraction on some devices, it will be clipped. Test on mobile.

### 4. Oversized event images

**Files:** Event card components that render event poster images
**Current:** Images served at 640x640 and 256x256 but displayed at 200x200 and 78x78
**Fix:** Find the event card image components and add explicit `width` and `height` props matching display size, or reduce the `sizes` attribute to match actual display dimensions
**Impact:** Saves ~160KB of image data on homepage

### 5. Cookie banner "Accept" button touch target (Accessibility)

**File:** `components/CookieBanner.tsx` (line 102-110)
**Current:** Mobile button uses `size="xs"` with `className="px-2 py-1 text-xs"` — likely below 48x48px minimum
**Fix:** Change mobile button from `size="xs"` to `size="sm"` and remove the restrictive `className="px-2 py-1 text-xs"` override. This ensures the button meets the 48x48px tap target minimum.
**Impact:** Resolves "Touch targets do not have sufficient size or spacing" for the Accept button

### 6. Colour contrast (Accessibility)

**Investigation needed:** PSI flagged insufficient contrast but the specific elements need identifying from the rendered page. Likely candidates:
- Cookie banner text on dark background
- Hero overlay text
- Any gold-on-white or light-grey-on-white text
**Fix:** Identify failing elements and increase contrast (darken text or lighten/darken backgrounds)

---

## Out of Scope

| Issue | Why |
|-------|-----|
| `Content-Signal: search=yes,ai-train=no` in robots.txt | Injected by Cloudflare, not in codebase. Fix in Cloudflare dashboard. |
| Facebook Pixel / LinkedIn Ads / Clarity script weight | Third-party tracking scripts. Can't optimise without removing. |
| LinkedIn deprecated `AttributionReporting` API | Third-party script issue. |
| Render-blocking CSS | Next.js CSS extraction is standard behaviour. Minimal gain from changing. |

---

## Manual Actions (Not Code)

- **Cloudflare:** Remove or move `Content-Signal` directive from robots.txt injection. Check Cloudflare Dashboard → Rules → Transform Rules or Page Rules.
- **Event images:** When uploading event posters to Supabase storage, resize to max 400x400px before upload (operational, not code).

---

## Success Criteria

- PSI SEO audit: "Links do not have descriptive text" — resolved (0 links found)
- PSI SEO audit: "robots.txt is not valid" — resolved (after Cloudflare fix)
- Mobile LCP: Reduced from 8.9s toward 4-5s range
- CLS: Reduced from 0.193 toward <0.1
- Accessibility: Touch targets audit passes
- Accessibility: Contrast ratio audit passes or improves
