# Performance Analyst Report: PageSpeed Fixes Design Spec

**Date:** 5 April 2026
**Spec reviewed:** `docs/superpowers/specs/2026-04-05-pagespeed-fixes-design.md`
**Analyst role:** Validate performance claims, identify gaps, assess feasibility of targets

---

## 1. Image quality reduction (82 to 75) -- claimed ~50% size reduction

**Verdict: Overstated. Expect 15-25%, not 50%.**

The spec claims reducing `quality` from 82 to 75 will cut the hero image from ~200KB to ~100-120KB. This is misleading for two reasons:

1. **The source image is 283KB on disk (1920x1072 JPEG).** Next.js Image optimisation already transcodes this through `/_next/image` into AVIF or WebP (both formats are configured in `next.config.js` via `formats: ['image/avif', 'image/webp']`). A 1920px AVIF at quality 82 is likely already well under 200KB when served. The "~200KB" figure in the spec may be measuring the raw JPEG, not the optimised output.

2. **Quality 82 to 75 for AVIF/WebP typically saves 15-25%, not 50%.** JPEG compression is not linear -- the biggest gains come from dropping from 95+ to 85. Moving from 82 to 75 is a modest step. For a photographic background behind a dark overlay, quality 65-70 would be visually indistinguishable and yield genuinely significant savings (~30-40% vs q82).

**Recommendation:** Drop to quality 65 instead of 75. The image sits behind a `bg-gradient-to-b from-black/55 via-black/30 to-black/65` overlay, making compression artefacts invisible. Test visually, but 65 is safe here.

---

## 2. Sizes attribute change (640px to 480px on mobile)

**Verdict: Minor impact, but correct direction. The real savings come from deviceSizes config.**

The spec proposes changing `sizes` from `(max-width: 640px) 640px` to `(max-width: 640px) 480px`. Analysis:

- **Next.js `deviceSizes` in `next.config.js` are `[640, 750, 828, 1080, 1200, 1920]`.** When the browser requests a 480px image, Next.js rounds UP to the nearest configured size, which is **640px** -- the exact same image that would be served with the current `sizes` attribute. The change has zero practical effect unless `imageSizes` contains a match, and `imageSizes` are `[16, 32, 48, 64, 96, 128, 256, 384]` -- none near 480.

- **To actually serve a smaller mobile image**, either add 480 to `deviceSizes` (e.g. `[480, 640, 750, ...]`) or change the sizes attribute to `384px` (which matches an `imageSizes` entry). However, 384px on a 2x display is only 192 CSS pixels -- too small for a full-bleed hero.

**Recommendation:** Keep `sizes` at 640px for mobile (it already maps to the smallest `deviceSize`). Instead, focus on quality reduction (see above) -- that is where the actual bytes are saved at this breakpoint. Alternatively, add `480` to `deviceSizes` in `next.config.js` if a 480px mobile image is genuinely desired.

---

## 3. CLS fix (min-h to h)

**Verdict: Partially correct. This fixes one source of shift, but not the primary one.**

The spec identifies the hero `<section>` using `min-h-[70vh]` as the CLS culprit and proposes switching to fixed `h-[70vh]`. Analysis:

### What `min-h` to `h` fixes
- Prevents the section from growing as content renders progressively. If the hero starts at 70vh and then grows to 75vh as tags/CTAs/StatusBar render, that pushes everything below it down -- causing CLS. Switching to `h-` with `overflow-hidden` caps the height and prevents this reflow. **This is a valid fix for content-driven CLS inside the hero.**

### What it does NOT fix

1. **StatusBar is a client component that fetches data.** The `StatusBar` component (`'use client'`) uses `useBusinessHours()` to fetch opening hours data asynchronously. It renders inside the hero's `lead` slot. When it loads, it transitions from a loading state to actual content, which can cause layout shift *within* the hero. With `min-h`, this grows the hero. With `h`, the internal shift still happens but doesn't push below-fold content. So `h` mitigates the impact on CLS score but doesn't eliminate internal reflow.

2. **The logo image in the eyebrow slot has explicit dimensions** (`width={320} height={320}` with responsive sizing via `className`). This is correctly handled and shouldn't cause CLS.

3. **Font loading (Outfit + Merriweather)** uses `display: 'swap'`, which can cause a flash of unstyled text. For hero text at 5xl+ size, a font swap can cause measurable CLS if the fallback font metrics differ significantly from the loaded fonts. This is NOT addressed in the spec.

**Recommendation:** The `min-h` to `h` change is worth doing but may not get CLS below 0.1 on its own. Additional measures:
- Add `size-adjust` or `ascent-override`/`descent-override` to the font declarations to reduce font-swap CLS (Next.js `next/font` does some of this automatically, but verify with real measurements).
- Consider wrapping the StatusBar in a fixed-height container so its loading-to-loaded transition doesn't shift surrounding content.

---

## 4. Missed performance improvements

### 4a. GTM script is render-blocking (HIGH IMPACT)

The GTM script in `app/layout.tsx` (lines 163-171) is injected synchronously into `<head>` via `dangerouslySetInnerHTML`. While the script itself sets `j.async=true` for the external gtm.js load, the inline `<script>` block in `<head>` is **parser-blocking** -- the browser must execute it before continuing to parse the rest of the document.

**Current:**
```html
<head>
  <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){...})(...);` }} />
</head>
```

**Recommendation:** Move the GTM script to the end of `<body>` (after all content), or use `next/script` with `strategy="afterInteractive"` or `strategy="lazyOnload"`. This alone could shave 200-500ms off LCP on mobile by unblocking the parser earlier. The `noscript` iframe is already correctly positioned.

### 4b. Two priority images compete for bandwidth (MEDIUM IMPACT)

The homepage hero loads TWO priority images simultaneously:
1. The hero background image (`priority={true}` in HeroSectionServer, line 117)
2. The logo PNG in the eyebrow slot (`priority` is not explicitly set but rendered in the initial viewport)

The logo is a 21KB PNG served at up to 320px. On a slow 3G connection (typical PSI mobile simulation), two concurrent high-priority image requests compete for the same bandwidth. The hero background (the LCP element) may be delayed by the logo download.

**Recommendation:** Remove `priority` from the logo image (or set `priority={false}` and `loading="eager"`) and let the browser's native prioritisation handle it. The hero background is the LCP element and should have sole `fetchpriority="high"`.

### 4c. Missing preconnect for Google Fonts (LOW IMPACT)

The layout uses `next/font/google` for Outfit and Merriweather. Next.js handles font preloading automatically, but there is no explicit `preconnect` to `https://fonts.gstatic.com`. Next.js should add this automatically when using `next/font/google` -- verify in the rendered HTML that `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` is present.

### 4d. Excessive redirect chains in config (NEGLIGIBLE)

`next.config.js` loads 6 redirect JSON files. These are applied at the edge and don't affect page rendering performance.

### 4e. Logo image is PNG, not WebP/AVIF (LOW IMPACT)

The logo (`the-anchor-pub-logo-white-transparent.png`, 21KB) is a PNG with transparency. Next.js Image optimisation will transcode it, but PNG-to-AVIF conversion for images with transparency can be lossy. Since it's only 21KB, the impact is negligible.

### 4f. Event images spec item (#4) is vague (MEDIUM IMPACT)

Spec item #4 about oversized event images says "Find the event card image components" without identifying specific files. The claimed 160KB savings is significant. This should be a concrete, file-specific fix like the other items.

---

## 5. Is the LCP target of 4-5s realistic?

**Verdict: Unlikely from these fixes alone. 6-7s is more realistic.**

Current LCP is 8.9s on mobile. Breaking down what contributes to that:

| Factor | Estimated impact of spec fixes |
|--------|-------------------------------|
| Quality 82 to 75 (should be 65) | -0.3 to -0.8s (depending on connection) |
| Sizes attribute change | ~0s (no actual effect, see section 2) |
| CLS fix | 0s (CLS is separate from LCP) |
| Event image fix | 0s (not on the critical path for hero LCP) |

**Total estimated LCP improvement from spec: 0.3-0.8s (to ~8.1-8.6s)**

To actually reach 4-5s, the following additional work is needed:

| Additional fix | Estimated LCP impact |
|----------------|---------------------|
| Move GTM to afterInteractive | -0.3 to -0.5s |
| Quality 65 instead of 75 | -0.3s additional vs 75 |
| Remove logo priority contention | -0.2 to -0.5s |
| Reduce hero source image dimensions (1920px is overkill for mobile; serve 828px) | -0.5 to -1.0s |
| Eliminate third-party scripts from critical path (FB Pixel, LinkedIn, Clarity) | -1.0 to -2.0s |

Third-party scripts are the elephant in the room. The spec correctly notes they are "out of scope," but they are likely the largest single contributor to the 8.9s LCP. PSI mobile simulation uses throttled CPU and network -- every third-party script that executes on the main thread delays the browser's ability to decode and paint the LCP image.

**Realistic LCP with code-only fixes (no third-party removal):** 6.5-7.5s
**Realistic LCP with GTM deferred + quality 65 + single priority image:** 5.5-6.5s
**To reach 4-5s:** Must defer or remove at least some third-party tracking scripts.

---

## Summary of Findings

| Spec Item | Claim Accurate? | Recommendation |
|-----------|----------------|----------------|
| #1 Link text | Yes | Straightforward, no issues |
| #2 Quality 82->75 | Overstated (15-25% savings, not 50%) | Use quality 65 instead |
| #2 Sizes 640->480 | **Ineffective** (rounds to same 640px deviceSize) | Keep at 640 or add 480 to deviceSizes |
| #3 CLS min-h->h | Partially correct | Also address font swap and StatusBar loading state |
| #4 Event images | Vague, needs specific file paths | Identify exact components before implementation |
| #5 Touch target | Yes | Straightforward fix |
| #6 Contrast | Needs investigation | Agreed |
| LCP 4-5s target | **Unrealistic** from these fixes alone | Need GTM deferral + aggressive quality + third-party management |

### Priority-ordered additional fixes not in the spec

1. **Move GTM script to afterInteractive** -- easy, high impact on LCP
2. **Drop hero quality to 65** -- trivial change, meaningful byte savings behind the overlay
3. **Eliminate dual priority images** -- set logo to `priority={false}`
4. **Add fixed-height container for StatusBar** -- reduces residual CLS
5. **Defer third-party scripts** -- largest LCP lever but noted as out of scope

---

*Report generated by Performance Analyst -- Codex QA Review*
