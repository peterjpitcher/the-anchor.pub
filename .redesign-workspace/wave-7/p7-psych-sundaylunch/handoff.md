# Phase 7 Group E — Light-theme psychology + sunday-lunch components

Branch: `codex/redesign-build`. Classes/markup only, no behaviour/logic/prop changes.

## Files converted

### components/psychology/
- **TrustBar.tsx** — strip surface `bg-anchor-green-raised border-y border-anchor-gold-dark/15` -> `bg-surface-sunk border-y border-line`; signal text `text-anchor-gold-bright` -> `text-accent-text`.
- **UrgencyKitchenStatus.tsx** — colourClass strings converted:
  - closed-today: `text-anchor-cream-text/70 bg-anchor-green-raised border-anchor-gold-dark/15` -> `text-ink-muted bg-surface-sunk border-line`
  - opens-later / open: `text-anchor-gold-bright bg-anchor-green/10 border-anchor-green/30` -> `text-accent-text bg-accent/10 border-accent/30`
  - closing-soon (amber warning, kept as warning): `text-amber-400 bg-amber-500/10 border-amber-500/30` -> `text-amber-700 bg-amber-50 border-amber-300` (legible amber on light)
  - separator span `text-anchor-cream-text/55` -> `text-ink-muted`
- **ValueProofStrip.tsx** — item text `text-anchor-cream-text/70` -> `text-ink-muted`. Gold-tinted panel (`border-anchor-gold-dark/30 bg-anchor-gold-dark/5`) left intact — deliberate gold accent panel, reads correctly on light.
- **PsychBadge.tsx** — already light, no change.
- **RegretReduction.tsx** — already light (`text-ink-muted`, `text-accent-text`), no change.

### components/sunday-lunch/
- **SundayLunchHowItWorks.tsx** — body `text-anchor-cream-text/80` -> `text-ink-muted`.
- **SundayLunchMenuList.tsx** — card `divide-anchor-gold-dark/15 border-anchor-gold-dark/15 bg-anchor-green-raised/40` -> `divide-line border-line bg-surface-sunk`; name `text-anchor-cream-text` -> `text-ink`; badge text & price `text-anchor-gold-bright` -> `text-accent-text`; description `text-anchor-cream-text/70` -> `text-ink-muted`. Badge border `border-anchor-gold-dark/30` kept (gold accent on light).
- **TimedBookingPrompt.tsx** — body copy `text-anchor-cream-text/85` -> `text-ink`; deposit note `text-anchor-cream-text/65` -> `text-ink-muted`. Renders inside shared `<Modal>` primitive (already light).
- **SectionViewTracker.tsx** — non-visual tracker, no change.

## Deliberate dark kept
None. All strips/prompts now render light. The only preserved non-semantic colours are: (a) the gold accent panel/borders in ValueProofStrip + the menu badge border (intentional gold accents that read on light), and (b) the closing-soon amber warning colour (semantic warning state, re-tuned for light bg).

## Verification (verbatim)

1. `npx tsc --noEmit` -> `TSC_EXIT:0` (clean)
2. `npm run lint` -> `✔ No ESLint warnings or errors`; `Hero audit passed for 123 page templates.`; `Menu page audit passed.`
3. `npm run build` -> succeeded (`BUILD_EXIT:` 0; full route table printed)
4. Residual-default-dark audit: `rg "bg-anchor-green-(deep|raised|card)|text-anchor-cream-text|card-dark" components/psychology components/sunday-lunch` -> EXIT:1 (0 matches)
5. `npx jest components/psychology components/sunday-lunch` -> `Test Suites: 7 passed, 7 total / Tests: 29 passed, 29 total` (no new failures)
