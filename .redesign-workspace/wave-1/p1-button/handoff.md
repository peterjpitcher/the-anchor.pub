# Phase 1.1 — Button — Handoff

**Branch:** `codex/redesign-build` · **Commit:** `c57cf3b4` · **Status:** complete, all checks green.

## What shipped

`components/ui/primitives/Button.tsx` rewritten to **exactly 3 variants × 3 sizes** per redesign-spec §4.1, keeping CVA, `forwardRef`, `asChild`, icon, loading and `fullWidth`.

- **Variants:** `primary` (`bg-anchor-gold-dark` + white, hover `bg-anchor-green` + `shadow-gold`) · `outline` (transparent, `border-accent text-accent`, hover `bg-accent text-canvas`) · `ghost` (`text-ink`, hover `bg-black/5`, dark theme `[.theme-dark_&]:hover:bg-white/10`).
- **Sizes:** `sm` (min-h 44px, px-6/24px, text-sm) · `md` (min-h 48px, px-8/32px, text-base) · `lg` (min-h 56px, px-12/48px, text-lg).
- **Shape/base:** `rounded-pill border-2 border-transparent`, Outfit 600 (`font-sans font-semibold`), inline-flex centred, `gap-2`, `whitespace-nowrap`, hover `-translate-y-0.5`, active `translate-y-0`, disabled `opacity-50` no transform.
- **Defaults:** `primary` / `md`.

## AA contrast (verified, computed)

- Primary `#8b6914` on `#ffffff` = **5.09:1** — passes AA for normal text.
- Prototype `#a57626` on white = **4.02:1** — fails AA, deliberately not shipped.

## Codemod counts (per mapping)

Scoped to **Button-family tags only**: `Button`, `BookTableButton`, `PhoneButton`, `EventBookingButton`, `DirectionsButton`, `ShareButton`, `MenuSectionCta`. Both JSX attributes and object-literal `CTAButton` config arrays were handled (the config-object form is not a JSX attribute, so it needed a separate pass).

| Mapping | JSX attrs | Config objects | Notes |
|---|---|---|---|
| `secondary → outline` | 183 | 34 | + wrapper defaults (PhoneButton, MenuSectionCta) |
| `danger → outline` | 3 | 0 | all on `Button` |
| `warning → outline` | **0** | 0 | see discrepancy below |
| `xs → sm` | 2 | 0 | |
| `xl → lg` | 2 | 0 | brief estimated 3; the 3rd `xl` is a `Section` spacing prop, not Button |

92 files changed by the JSX codemod + 30 by the config-object codemod (overlapping); 108 files staged total (excludes `docs/`).

## IMPORTANT discrepancy with the brief (verify #1)

The brief's `rg 'variant="(secondary|danger|warning)"|size="(xs|xl)"' app components → 0 hits` does **NOT** reach 0, and should not. Analysis proved the remaining **20 hits are all non-Button components** with their own independent variant/size APIs:

- `variant="warning"` × 19 → live on `components/ui/feedback/Alert.tsx` (CVA, has a real `warning` variant) and `components/AlertBox.tsx` (own `variantStyles` map). The brief's "~19 warning" estimate exactly matches these — the brief author assumed they were Button warnings, but **zero** Button warnings exist. Converting them to `outline` would break both components (AlertBox would crash on `variantStyles[undefined]`).
- `size="xl"` × 1 → `Section` (`components/ui/layout/Section.tsx`) spacing prop, in `components/ui/layout/__tests__/Container.test.tsx`.

These were intentionally left intact. The Button-family codemod is fully complete (no Button-family `secondary/danger/warning/xs/xl` remain anywhere — JSX or config-object).

`HeroWrapper` also carries its own `variant` union (`default|primary|success|warning|danger`) — also independent of Button, left untouched (Phase 2 territory).

## Verbatim verification

```
=== AUDIT 1 (Button-family scoped): remaining raw hits = 20, all Alert/AlertBox/Section (enumerated, none Button) ===
=== AUDIT 2 (old token/font): old-token hits: 0 ===
=== tsc --noEmit: 0 errors ===
=== next lint: ✔ No ESLint warnings or errors ===
=== jest Button + wrappers: 4 suites, 39 tests passed (Button 16/16, BookTableButton, EventBookingButton, Container) ===
```

Pre-existing failing suite `tests/unit/ManagementTableBookingForm.test.tsx` was not run / not touched per brief.

## Wrappers updated (variant/size unions only, no logic change)

- `PhoneButton.tsx` — union `'primary'|'outline'|'ghost'`, default `outline` (was `secondary`).
- `EventBookingButton.tsx` — union `'primary'|'outline'|'ghost'`, size `'sm'|'md'|'lg'`; 2 hardcoded disabled-state `secondary` → `outline`.
- `DirectionsButton.tsx` — union dropped `secondary`, kept `link` (→ ghost mapping intact).
- `MenuSectionCta.tsx` — union `'primary'|'outline'|'ghost'`, default `outline`.
- `BookTableButton.tsx` / `ShareButton.tsx` — flow `ButtonProps` automatically; no change needed.

## Type-leftover fixes (components passing removed values into Button)

`CTASection.tsx` (CTAButton union `'primary'|'outline'|'ghost'|'white'`, size dropped `xs`; `white→outline` mapping; removed dead danger/warning branches), `SmartCTAs.tsx` (role param `'primary'|'outline'`), `SixNationsFixtures.tsx` (active filter `secondary→primary`), `FoodStickyCtaBar.tsx`, `EventSecondaryActions.tsx`, `Navigation.tsx` (CTA union + dead `=== 'secondary'` comparison → `'outline'`).

## secondary → ghost judgement calls

**None made.** Every Button-family `secondary` was mapped to `outline` (the brief's default). No tertiary/low-emphasis cases were demoted to `ghost` — the codemod kept emphasis consistent and avoided guessing.

## One-primary-per-view sweep

Scanned for adjacent `variant="primary"` pairs (≤10 lines). 3 candidates found, all false positives: colnbrook/sunbury have the two primaries in separate sections (CTA partner already `outline`; second primary is a Directions button in a different block); valentines-day's first "primary" is a `<Badge>` (Phase 1.2), not a Button. **No violations introduced** — `secondary→outline` mapping inherently preserves single-primary layouts.

## Notes for Phase 1.2 / 1.3

- **Badge** still uses `variant="primary"` / `"warning"` / `"secondary"` widely — these are Badge props, untouched here. Phase 1.2 owns the Badge codemod (`default|primary→green`, `secondary→sand`, `warning→gold`, `error→danger`).
- `ghost` hover uses `[.theme-dark_&]:hover:bg-white/10` because the project's dark mode is **class-based (`.theme-dark` / `[data-theme="dark"]`) and `darkMode` is NOT configured in `tailwind.config.ts`** — the standard `dark:` variant would target `prefers-color-scheme`, not the theme class. Phase 2 shell work that relies on dark-mode variants should be aware of this (either add `darkMode: ['class', '.theme-dark']` or keep using the `[.theme-dark_&]:` arbitrary-variant pattern).
- Semantic colour opacity modifiers (`bg-ink/5` etc.) do **not** compile — the semantic tokens (`--text`, `--accent`, …) resolve to hex, not space-separated RGB channels, so Tailwind cannot apply `/opacity`. Use raw `black`/`white` with opacity, or define channel triplets in Phase 0 if opacity-on-semantic is needed later.
- `CTASection.tsx` EmailLink branch still hand-rolls button-like classes (`bg-anchor-green-card`, `bg-anchor-gold-dark`, etc.) — valid current tokens, out of scope here, but a candidate for the Phase 2/6 cleanup to route through `<Button>`/`buttonVariants`.
