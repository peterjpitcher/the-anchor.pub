# Handoff — Phase 2.3: Deep-green footer restyle

**Branch:** `codex/redesign-build`
**File owned:** `components/layout/Footer.tsx` (only)
**Spec:** redesign-spec.md §5.3 + §15 O1 ("under the flight path" PERMITTED per SSOT)
**Plan:** redesign-implementation-plan.md §G PR 2.3 + A3 (keep full live link inventory)

## What changed

Full restyle of the footer to the deep-green design-system treatment while keeping
every live link. No links dropped.

- Container: `theme-dark bg-anchor-green-deep`, film-grain overlay at 5%
  (`bg-[var(--grain)]`, `opacity-[0.05]`), `padding-top: var(--space-8)`,
  `padding-bottom: calc(var(--space-5) + 76px)` to clear the upcoming 76px sticky CTA bar.
- Desktop grid: brand column `1.5fr` + 5 link columns
  (`xl:grid-cols-[1.5fr_repeat(5,1fr)]`), `gap: var(--space-6)`; 2 columns on `lg`/`md`.
- Brand column: white wordmark (`h-12 w-auto`, the-anchor-pub-logo-white-transparent.png);
  script tagline "Where everyone's welcome" (`font-script`, `text-[1.9rem]`,
  `text-anchor-gold-bright`); about paragraph (`text-sm text-anchor-sage`, `max-w-[34ch]`)
  with the approved O1 copy.
- Link headings: `font-sans text-xs uppercase tracking-[0.18em] text-anchor-gold-bright`.
- Links: `text-sm text-anchor-cream-text/[0.82]` hover `text-anchor-gold-bright`.
- Mobile `<details>` accordion pattern retained (Book/Eat … More, Get in Touch, For Everyone).
- Base bar: top hairline `border-line-gold`; left © line; right Facebook/Instagram/phone
  as 38px circles (`border-line-gold`, Lucide 18px icons). Real social URLs + phone preserved,
  GTM tracking preserved (`trackSocialClick`, `trackPhoneCallClick`, `trackNavigationClick`).
- Sixth group "Trust & Policies" exceeds the 5-column grid → moved into the base bar as
  a flex-wrap legal link row (per spec instruction). All links kept.

## Link inventory — before vs after (no links lost)

| Group | Before | After | Location |
|---|---|---|---|
| Book & Eat | 7 | 7 | grid |
| Private Hire | 8 | 8 | grid |
| Hosted Events | 7 | 7 | grid |
| Heathrow & Plane Spotting | 8 | 8 | grid |
| More | 7 | 7 | grid |
| Trust & Policies | 5 (3 trustLinks + Accessibility + Privacy Policy) | 5 | base bar |
| **Total nav links** | **42** | **42** | — |

Also preserved (unchanged): Get in Touch (Phone, WhatsApp, Email, Address, 3 socials),
For Everyone (5 features), Hiring CTA, "Serving … Surrey areas" line.

Link count after >= before: **YES** (42 == 42, plus all contact/feature/CTA items kept).

## Social URLs preserved (verbatim)

- Facebook: `https://www.facebook.com/theanchorpubsm/`
- Instagram: `https://www.instagram.com/theanchor.pub/`
- Leave a Review (google, Get in Touch): `/leave-review`
- Phone: `01753 682707` (tel:+441753682707)

## Verification (verbatim)

1. `npx tsc --noEmit` → `TSC: CLEAN` (full project, exit 0)
2. `npm run lint` → `✔ No ESLint warnings or errors` (+ hero/menu audits passed)
3. `npm run build` → `BUILD EXIT CODE: 0`, 322/322 static pages generated, 0 errors
   (Note: an initial build hit a stale `.next` MODULE_NOT_FOUND; resolved by `rm -rf .next`
   then a clean rebuild — unrelated to Footer changes.)
4. Old-token audit (`anchor-gold-dark`, `gray-N`, `text-white`, `cream-text/70|80`) → **0 matches**

## Notes / assumptions

- `as any` cast on `SocialLinkComponent platform` retained from the original (SocialLink type
  includes `tiktok`; the component's `SocialPlatform` does not). Project ESLint
  (`next/core-web-vitals`) does not enable `@typescript-eslint/no-explicit-any`, so this is clean.
- Base-bar social icons use Lucide (`lucide-react@0.541.0`, already a dependency) rather than the
  text `SocialLinkComponent`, per spec (38px circles, 18px icons). GTM tracking re-wired manually.
- British English throughout. No new dependencies. Only `components/layout/Footer.tsx` staged.
