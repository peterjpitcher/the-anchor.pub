# PageSpeed Insights Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 7 PageSpeed Insights issues to improve mobile LCP, CLS, SEO audit score, and accessibility touch targets.

**Architecture:** Surgical edits to 7 existing files. No new files, no structural changes. Each task is independent and can be committed separately.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, next/image, next/script

**Spec:** `docs/superpowers/specs/2026-04-05-pagespeed-fixes-design.md` (v2, post-QA review)

---

## File Map

| File | Changes |
|------|---------|
| `components/CookieBanner.tsx` | Fix "Learn more" link text (2 instances), fix touch targets on 3 mobile buttons |
| `components/hero/HeroSectionServer.tsx` | Reduce image quality 82→65 |
| `components/hero/HeroSection.tsx` | Reduce image quality 82→65 (consistency) |
| `components/layout/StatusBar.tsx` | Match loading skeleton height to loaded state |
| `components/NextEventServer.tsx` | Tighten poster image `sizes` attribute |
| `app/layout.tsx` | Move GTM from `dangerouslySetInnerHTML` to `next/script` with `afterInteractive` |
| `app/page.tsx` | Remove `priority` from logo image |

---

### Task 1: Fix "Learn more" link text in CookieBanner

**Files:**
- Modify: `components/CookieBanner.tsx:78,121`

- [ ] **Step 1: Update mobile "Learn more" link (line 78)**

Change:
```tsx
                <Link href="/privacy-policy" className="underline">
                  Learn more
                </Link>
```
To:
```tsx
                <Link href="/privacy-policy" className="underline">
                  Read our privacy policy
                </Link>
```

- [ ] **Step 2: Update desktop "Learn more" link (line 121)**

Change:
```tsx
                <Link href="/privacy-policy" className="underline hover:text-anchor-gold">
                  Learn more
                </Link>
```
To:
```tsx
                <Link href="/privacy-policy" className="underline hover:text-anchor-gold">
                  Read our privacy policy
                </Link>
```

- [ ] **Step 3: Fix mobile touch targets — settings button (line ~83)**

Change the settings button from:
```tsx
                <button
                  onClick={() => setShowPreferences(true)}
                  className="p-1.5 text-gray-500 hover:text-gray-700"
                  aria-label="Cookie settings"
                >
```
To:
```tsx
                <button
                  onClick={() => setShowPreferences(true)}
                  className="p-2.5 min-h-[48px] min-w-[48px] flex items-center justify-center text-gray-500 hover:text-gray-700"
                  aria-label="Cookie settings"
                >
```

- [ ] **Step 4: Fix mobile touch target — Reject button (line ~93)**

Change:
```tsx
                <Button
                  onClick={handleRejectAll}
                  variant="ghost"
                  size="xs"
                  className="px-2 py-1 text-xs"
                  aria-label="Reject all cookies"
                >
                  Reject
                </Button>
```
To:
```tsx
                <Button
                  onClick={handleRejectAll}
                  variant="ghost"
                  size="sm"
                  className="min-h-[48px] text-xs"
                  aria-label="Reject all cookies"
                >
                  Reject
                </Button>
```

- [ ] **Step 5: Fix mobile touch target — Accept button (line ~102)**

Change:
```tsx
                <Button
                  onClick={handleAcceptAll}
                  variant="primary"
                  size="xs"
                  className="px-2 py-1 text-xs"
                  aria-label="Accept all cookies"
                >
                  Accept
                </Button>
```
To:
```tsx
                <Button
                  onClick={handleAcceptAll}
                  variant="primary"
                  size="sm"
                  className="min-h-[48px] text-xs"
                  aria-label="Accept all cookies"
                >
                  Accept
                </Button>
```

- [ ] **Step 6: Verify build**

Run: `npx tsc --noEmit 2>&1 | grep -v tests/`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add components/CookieBanner.tsx
git commit -m "fix: descriptive link text and 48px touch targets in cookie banner

Resolves PSI 'Links do not have descriptive text' (2 links) and
'Touch targets do not have sufficient size' (3 buttons).

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Reduce hero image quality for LCP improvement

**Files:**
- Modify: `components/hero/HeroSectionServer.tsx:119`
- Modify: `components/hero/HeroSection.tsx:151`

- [ ] **Step 1: Update HeroSectionServer.tsx quality**

In `components/hero/HeroSectionServer.tsx`, change line 119:
```tsx
            quality={82}
```
To:
```tsx
            quality={65}
```

- [ ] **Step 2: Update HeroSection.tsx quality for consistency**

In `components/hero/HeroSection.tsx`, change line 151:
```tsx
            quality={82}
```
To:
```tsx
            quality={65}
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit 2>&1 | grep -v tests/`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add components/hero/HeroSectionServer.tsx components/hero/HeroSection.tsx
git commit -m "perf: reduce hero image quality 82→65 for LCP improvement

Dark gradient overlay makes compression artefacts invisible at quality 65.
Estimated ~25-35% image size reduction on hero backgrounds.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Fix CLS by matching StatusBar skeleton height

**Files:**
- Modify: `components/layout/StatusBar.tsx:233-242`

- [ ] **Step 1: Read the loaded StatusBar output to understand its dimensions**

Read `components/layout/StatusBar.tsx` fully — find what the loaded state renders (after the loading check at line ~229). Note the exact padding, height, and structure of the loaded output so the skeleton can match it exactly.

- [ ] **Step 2: Update the loading skeleton to match loaded dimensions**

The current loading skeleton (lines 233-242) is:
```tsx
    return (
      <div className={cn(
        'inline-block rounded-full px-6 py-3 shadow-md min-h-[44px]',
        mergedTheme.background,
        mergedTheme.border,
        className
      )}>
        <LoadingState variant="skeleton" className="h-5 w-32" />
      </div>
    )
```

Update to match the loaded state's exact dimensions. The skeleton wrapper must have identical `px-`, `py-`, `min-h-`, `rounded-`, and content height so the swap is pixel-identical:
- Match the loaded state's padding and min-height exactly
- Set the skeleton content width to approximate the loaded text width
- Ensure the outer wrapper dimensions are identical between loading and loaded states

**Important:** Read the loaded state carefully before making changes — the fix depends on what the loaded state actually renders. The key is that `loading → loaded` swap causes zero height change.

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit 2>&1 | grep -v tests/`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add components/layout/StatusBar.tsx
git commit -m "fix: match StatusBar loading skeleton height to loaded state for CLS

The async StatusBar hydration was the primary CLS source (0.193) in the
hero section. Loading skeleton and loaded state now have identical
dimensions to prevent layout shift during data fetch.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Tighten event poster image sizes

**Files:**
- Modify: `components/NextEventServer.tsx:133`

- [ ] **Step 1: Update poster image sizes attribute**

The poster image at line 133 currently has:
```tsx
                <Image
                  src={eventImage}
                  alt={`${nextEvent.name} event promotional poster - ${nextEvent.category?.name || 'upcoming event'} at The Anchor`}
                  fill
                  className="object-contain drop-shadow-xl"
                  sizes="(max-width: 1024px) 60vw, 280px"
                />
```

The container constrains display to `max-w-[200px] sm:max-w-[220px] lg:max-w-full` within a `260px` column. So the image never displays larger than ~260px. Change `sizes` to match:
```tsx
                <Image
                  src={eventImage}
                  alt={`${nextEvent.name} event promotional poster - ${nextEvent.category?.name || 'upcoming event'} at The Anchor`}
                  fill
                  className="object-contain drop-shadow-xl"
                  sizes="(max-width: 640px) 200px, (max-width: 1024px) 220px, 260px"
                />
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit 2>&1 | grep -v tests/`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/NextEventServer.tsx
git commit -m "perf: tighten event poster image sizes to match display dimensions

Image was being served at 640x640 for a 200x200 display area.
New sizes attribute matches actual container constraints.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Move GTM to afterInteractive

**Files:**
- Modify: `app/layout.tsx:162-172`

- [ ] **Step 1: Add Script import**

At the top of `app/layout.tsx`, add the import if not already present:
```tsx
import Script from 'next/script'
```

- [ ] **Step 2: Replace the synchronous GTM script in `<head>`**

Remove the current GTM script block (lines 162-172):
```tsx
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`,
          }}
        />
        {/* End Google Tag Manager */}
```

Replace with (place just inside `<body>`, after the opening `<body>` tag):
```tsx
        {/* Google Tag Manager - loaded after page is interactive */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`,
          }}
        />
        {/* End Google Tag Manager */}
```

**Note:** The `<noscript>` GTM iframe (lines 193-202) stays in `<body>` unchanged — it's already non-blocking.

- [ ] **Step 3: Remove the now-empty `<head>` section if it contained only GTM**

If `<head>` only contained the GTM script, remove the empty `<head>` tags entirely. Next.js handles `<head>` via metadata. If `<head>` has other content, leave it with the remaining content.

- [ ] **Step 4: Verify build**

Run: `npx tsc --noEmit 2>&1 | grep -v tests/`
Expected: No errors

- [ ] **Step 5: Verify GTM still loads**

Run: `npm run dev` and check browser console for GTM loading. The dataLayer should still initialise, just after page is interactive rather than during parse.

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx
git commit -m "perf: move GTM to afterInteractive strategy for LCP improvement

GTM was injected synchronously into <head>, parser-blocking the page
and delaying LCP. Using next/script with strategy='afterInteractive'
loads it after the page is interactive, removing it from the critical
rendering path.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Remove priority from logo image

**Files:**
- Modify: `app/page.tsx:133-143`

- [ ] **Step 1: Find the logo Image component in the homepage hero**

In `app/page.tsx`, find the logo image (around lines 133-143):
```tsx
          <Image
            src="/images/branding/the-anchor-pub-logo-white-transparent.png"
            alt="The Anchor logo - elegant anchor symbol with traditional British pub typography in white"
            width={320}
            height={320}
            sizes="(max-width: 640px) 192px, (max-width: 768px) 256px, 320px"
            className="mx-auto w-48 sm:w-64 lg:w-80 h-auto drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
            quality={85}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzAwNTEzMSIvPjwvc3ZnPg=="
          />
```

This image does NOT have an explicit `priority` prop, so Next.js defaults to `priority={false}` and adds `loading="lazy"`. However, the hero background image (rendered by HeroSectionServer) has `priority={true}`.

**Check:** If the logo already has no `priority` prop, this task is already done. Verify and skip if so.

If it does have `priority={true}`, remove it or set `priority={false}`.

- [ ] **Step 2: Commit (only if changes were made)**

```bash
git add app/page.tsx
git commit -m "perf: remove priority from logo to reduce bandwidth contention with hero LCP

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Final build verification

- [ ] **Step 1: Run full build**

```bash
npm run build
```
Expected: Clean build, no errors.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```
Expected: No new warnings or errors.

- [ ] **Step 3: Push to GitHub**

```bash
git push origin main
```
