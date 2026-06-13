# Phase 7 Group D — Light-theme the `components/ui/*` primitive library

Branch: `codex/redesign-build`
Scope: convert hardcoded-default-dark UI primitives (overlays, forms, navigation, feedback, display) to light using Phase-0 semantic tokens. No behaviour/prop/API change — classes/markup only. `aria-*`, focus management, portals, positioning logic all intact.

## Per-primitive disposition

| Primitive | Result | Notes |
|---|---|---|
| overlays/Modal.tsx | converted | shell `bg-anchor-green-card` → `bg-surface text-ink border-line shadow-lg`, `rounded-md`; close btn, title (`text-ink-strong`), description (`text-ink-muted`), footer border (`border-line`); focus ring → `ring-accent-text` |
| overlays/Toast.tsx | converted (semantic status kept) | default/info → `bg-surface text-ink`; success → `text-anchor-success`; error → `text-anchor-danger`; warning → `text-accent-text`; success/error icons recoloured to success/danger; close btn → ink-muted |
| overlays/Tooltip.tsx | converted | default + light variants → `bg-surface text-ink border-line`; error/warning/success kept as solid semantic fills (`anchor-danger`/`anchor-gold`/`anchor-success`) for contrast |
| overlays/Popover.tsx | converted | surface → `bg-surface text-ink border-line shadow-lg rounded-md`; arrow border colours → `border-*-surface`; header/footer dividers → `border-line` |
| overlays/StickyDrawer.tsx | converted | panel → `bg-surface text-ink border-line`; header divider/title/desc/close → light tokens; floating `StickyDrawerTrigger` → gold CTA (`bg-anchor-gold text-ink-on-gold`, `shadow-gold`, ring-offset-canvas) |
| forms/Checkbox.tsx | converted | input `border-line text-accent-text` gold accent; labels → `text-ink`; helper → `text-ink-muted`; errors/required → `text-anchor-danger` |
| forms/Radio.tsx | converted | same as Checkbox; CardRadio checked → `border-accent-text bg-accent-text/10`, labels/desc/helper to ink tokens, tick icon `text-accent-text` |
| forms/Switch.tsx | converted | track on → `bg-accent-text`, off → `bg-surface-sunk border-line`; thumb white kept; labels/helper/errors → light |
| forms/Form.tsx | converted | labels → `text-ink`; helper → `text-ink-muted`; errors/required → `text-anchor-danger`; section legend → `text-ink-strong` |
| forms/FormField.tsx | converted | same label/helper/error/legend pattern |
| navigation/NavBar.tsx | converted (green `default` variant kept) | `default` stays brand green band (fixed surface — intentional); `light` variant → `bg-surface text-ink border-line`; mobile menu light/transparent → `bg-surface`; item hover → `accent-text`; actions divider adaptive |
| navigation/Tabs.tsx | converted | list `line`→`border-line`, `enclosed`→`bg-surface-sunk border-line`; triggers → `text-ink-muted`, active line/enclosed→ink/accent, pills active → `bg-anchor-gold text-ink-on-gold`; focus ring → accent |
| navigation/Breadcrumb.tsx | converted | links → `text-ink-muted hover:text-accent-text`; current page → `text-ink-strong`; separators → `text-ink-muted/70` |
| feedback/Loading.tsx | converted | spinner `secondary`→`text-ink`; skeleton → `bg-surface-sunk`; overlay scrim → `bg-canvas/80`; SkeletonCard → light card; spinner `primary` left `text-anchor-gold-dark` (== accent value) |
| LoadingState.tsx | converted | skeleton/dots → `bg-surface-sunk`/`bg-ink-muted`; spinner border → `border-line border-t-accent-text`; card skeletons → light card |
| ErrorDisplay.tsx | converted | red tints → `anchor-danger`; retry button → gold CTA; contact/details text → ink tokens; technical `pre` → `bg-surface-sunk border-line` |
| PriceDisplay.tsx | converted | default → `text-ink-strong`; sale → `text-anchor-danger`; free/premium → `text-accent-text`; strike → `text-ink-muted` |
| Price.tsx | converted | default → `text-ink-strong`; sale → `text-anchor-danger`; crossed/range sep → `text-ink-muted` |
| OpeningStatus.tsx | converted | open → `text-anchor-success`, closed → `text-anchor-danger`; detail text → `text-ink-muted` |
| JourneyTime.tsx | converted | non-highlight rows → `bg-surface-sunk border-line`; highlight → `bg-anchor-gold/10`; durations → `text-accent-text`; labels → ink tokens |

### Variant-gated dark preserved (untouched, per brief)
- `components/ui/layout/Card.tsx` (`variant="dark"`)
- `components/ui/layout/Section.tsx` (`dark` background variant)
- `components/ui/GreenSection.tsx` (deliberate green section)
- NavBar `default` green band, NavBar/Tabs `default` mobile menu green path — fixed brand surfaces, intentionally green.

### Dead-flagged
None. All 20 owned primitives have importers (counts 1–55).

## Tests updated (asserted old dark classes → updated to new light styling)
- overlays/__tests__/Toast.test.tsx: success toast → `bg-surface`, `text-anchor-success`
- navigation/__tests__/Breadcrumb.test.tsx: current/page → `text-ink-strong`; link → `text-ink-muted`, `hover:text-accent-text`
- navigation/__tests__/Tabs.test.tsx: enclosed tablist → `bg-surface-sunk`
- feedback/__tests__/Loading.test.tsx: spinner secondary → `text-ink`; skeleton → `bg-surface-sunk`; SkeletonCard → `.rounded-md.border`
(Spinner `primary` assertion `text-anchor-gold-dark` left as-is — class unchanged.)

## Verification (verbatim)
1. `npx tsc --noEmit` → clean (no output).
2. `npm run lint` → "✔ No ESLint warnings or errors"; hero audit passed (123 templates); menu page audit passed.
3. `npm run build` → succeeded (BUILD_RC clean; full route table emitted).
4. Residual-default-dark audit on edited source files → `(none)`. No hardcoded `bg-anchor-green-(deep|raised|card)` / `text-anchor-cream-text` / raw red/amber/gray remains as a DEFAULT. Variant-gated dark intentionally retained: NavBar `default`/mobile green band, Toast/Tooltip solid semantic status fills.
5. Tests:
   - `npx jest components/ui` → Test Suites: 13 passed, 13 total; Tests: 172 passed, 172 total.
   - Full suite → Test Suites: 1 failed, 79 passed, 80 total; Tests: 31 failed, 1 skipped, 681 passed. Only failing suite: `tests/unit/ManagementTableBookingForm.test.tsx` — matches the pre-existing baseline. No NEW failures.
