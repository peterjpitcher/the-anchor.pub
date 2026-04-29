# Final Report: FAQ Component Background Fix

## What changed

### Root cause
The `FAQAccordionWithSchema` component had no default background and used raw string interpolation for className merging. Four pages passed `className="bg-white"` (literal Tailwind white #fff), making cream-coloured text invisible (~1.1:1 contrast ratio, WCAG 1.4.3 failure).

### Component fix (`components/FAQAccordionWithSchema.tsx`)
1. **Added `cn()` import** from `@/lib/utils` — enables proper Tailwind class merging
2. **Changed section className** from `` `section-spacing ${className}` `` to `cn('section-spacing bg-anchor-bg-card', className)` — provides safe dark default, allows callers to override via `cn()` merge
3. **Added `aria-hidden`** to collapsed answer panels — accessibility improvement
4. **Removed redundant `max-h-0`** class — inline style already controls maxHeight

### Caller fixes (4 files)
Removed `className="bg-white"` from:
- `app/quiz-night/page.tsx:623`
- `app/karaoke/page.tsx:548`
- `app/live-music/page.tsx:556`
- `app/cash-bingo/page.tsx:547`

### Cleanup
- **Deleted `components/FAQAccordion.tsx`** — dead code, zero imports across entire codebase

## Verification
- TypeScript: clean (pre-existing test file errors only, unrelated)
- Build: passes cleanly across all 100+ pages
- Tests: 3/3 pass
- No stale imports of deleted component

## What remains out of scope
- Accordion animation overhaul (hardcoded 500px maxHeight — works for current content)
- Test expansion for schema rendering, accessibility, background safety
- Optional cleanup: remove redundant `className="bg-anchor-bg"` from 11 seasonal pages (now matches default)
