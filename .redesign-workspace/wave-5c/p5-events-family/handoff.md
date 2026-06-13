# Phase 5 PR 5.7 — Events / What's On family sweep (handoff)

Branch `codex/redesign-build`. Re-skin only; nothing staged/committed; no build run.

## Pages re-skinned (12 routes)
1. `app/quiz-night/page.tsx`
2. `app/music-bingo/page.tsx`
3. `app/cash-bingo/page.tsx`
4. `app/karaoke/page.tsx`
5. `app/live-music/page.tsx`
6. `app/events/[id]/page.tsx`
7. `app/live-sport/page.tsx`
8. `app/live-sport/boxing/page.tsx`
9. `app/live-sport/f1/page.tsx`
10. `app/live-sport/six-nations/page.tsx`
11. `app/live-sport/world-cup/page.tsx`
12. `app/live-sport/world-cup/sweepstake/page.tsx`

Heroes were already `InteriorHero` (Phase 2) — left as-is. Only bodies converted.

## Body-conversion applied (per recipe)
- Legacy dark `<Section spacing background>` → `<section className="py-section-y bg-canvas|bg-surface|bg-surface-sunk">` (gray→`bg-surface-sunk`, white→`bg-surface`, deep/raised bands→`bg-canvas`/`bg-surface`), alternating cream/white.
- `.section-spacing*` → `py-section-y`.
- `card-dark rounded-none border border-anchor-gold-dark/15` → `<Card accent>` (and `h-full` variant). Ad-hoc `bg-anchor-green-card`/`-raised` panels/rings → light `border border-line bg-surface`/`bg-surface-sunk`.
- Dark shared components replaced inline with light primitives: `FeatureGrid`/`FeatureCard` → `<Grid>`+`<Card accent>`; `AlertBox` → `<Alert>` (children, not `content` prop); `CTASection` → `<CtaBand>`. (Shared components NOT edited — only their usages.)
- Dark text → `text-ink`/`text-ink-strong`/`text-ink-muted`; small gold → `text-accent-text`; `prose prose-invert` → `prose`.
- Inline pills (TENTATIVE, prize tags) → `<Badge>` (outline / success / sand).
- Display headings de-bolded: `text-3xl/4xl font-bold` → `text-h2/h3`; `text-2xl font-bold` → `text-h4`; DM-Serif headings never bold. Interactive/label `font-bold` softened to `font-semibold`.
- Closing CTAs (gradient green boxes / `CTASection`) → `<CtaBand>`, preserving GTM `source` and button labels. (`live-music` had no closing CTA — none invented; A4.)

## events/[id] specifics
- Body kept as the existing FeaturedEvent-style two-column layout (poster + booking sidebar + details/location/FAQ/videos). Converted the dark `bg-anchor-green-deep/card/raised` surfaces to light Cards/`bg-canvas` sections; mobile details disclosure → light `bg-surface-sunk`.
- Booking labels unchanged: still via `getEventBookingCopy` + `EventBookingButton` (URL normalisation/GTM) and `ManagementEventBookingForm`; block/disabled copy via `getEventBookingBlockReason`. Mother's Day conditional flow preserved.
- Closing CTA → `<CtaBand>` keeping the mothersDay / bookingBlockReason / EventBookingButton conditional + PhoneButton.
- Event JSON-LD emission unchanged (`EventSchema`, `EventPageTracker`, metadata/canonical/noindex logic untouched).

## sweepstake specifics
- Restyle only — grid/stat/draw-list/prize/how-it-works/rules layout untouched. Surfaces → light Cards; the "Payout note" green panel kept dark via `theme-dark`; the step-number green badge kept (cream-on-green). Draw data (O4) reused verbatim — no figures introduced. `CTASection` → `CtaBand`.

## Intentional dark remnants (correct, inside `.theme-dark`)
- quiz-night / music-bingo "House Rules" cards: `<Card variant="dark" accent className="theme-dark">` with `text-anchor-cream-text`.
- Event-card green header bands (quiz/music/cash/karaoke/live-music) wrapped in `theme-dark`.
- sweepstake "Payout note" panel `theme-dark`; green step badges.

## Shared components reused
`components/CtaBand`, `components/ui` primitives (Card/CardBody/Badge/Button/Alert/Grid/GridItem/SectionHeading/Container), `EventBookingButton`, `getEventBookingCopy`, `FAQAccordionWithSchema`. No shared component edited.

## Legacy-class removal
0 occurrences across the 12 files of: `card-dark`, `card-warm`, `section-spacing*`, `<Section>`, `CTASection`, `AlertBox`, `FeatureGrid/FeatureCard/InfoBoxGrid`, `prose-invert`. Remaining `bg-anchor-green-*`/`text-anchor-cream/gold-*` tokens are only inside the intentional `theme-dark` bands listed above.
Removed now-unused imports: `Section` (5 files), `CTASection`/`AlertBox`/`FeatureGrid`/`FeatureCard`/`InfoBoxGrid` (live-sport family), `BusinessHours` (live-sport hub, was already dead), `BookTableButton` (boxing/f1), `CtaBand` (live-music — not used).

## Verification
- `npx tsc --noEmit` → clean (whole project, no errors).
- `npx next lint` on all 12 files → "No ESLint warnings or errors" (confirms no unused imports).
- `git diff` grep for metadata/canonical/JSON-LD/schema/title/description content → no content changes. All `href` values identical (only className colour tokens changed). InteriorHero H1 `title`s untouched.
- Diffstat: 12 files, 926 insertions / 1091 deletions.

## Flags for reviewer
- None blocking. The `text-anchor-green`/`border-anchor-green` directions-link buttons on music/cash/live-music were left as-is (valid light-theme brand tokens, render correctly on light bg).
- Nothing staged or committed; build not run (per brief).
