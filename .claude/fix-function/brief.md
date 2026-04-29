# Fix-Function Brief: FAQ Component Background Issue

## Target
- `components/FAQAccordion.tsx` (base component, ~85 lines)
- `components/FAQAccordionWithSchema.tsx` (schema-enhanced variant, ~126 lines)
- ~75 page files that consume FAQAccordionWithSchema
- `app/globals.css` (section-spacing class)
- `components/ui/layout/Section.tsx` (reference for theming pattern)

## Known Problem
The FAQ section on /quiz-night (and other pages) renders with a white (#fff) background, breaking the site's dark pub theme. The root cause: the FAQ components have no default background and rely on callers to pass it via `className`. Four pages pass `className="bg-white"` which is literal Tailwind white.

## Theming Pattern (Source of Truth)
The `Section` component uses CVA variants:
- `background="white"` maps to `bg-anchor-bg-card` (dark themed card bg)
- `background="gray"` maps to `bg-anchor-bg` (dark themed base bg)

The FAQ components bypass this entirely — they use raw `<section className={`section-spacing ${className}`}>`.

## Caller Background Classes Found
- `className="bg-white"` — 4 pages: quiz-night, live-music, karaoke, cash-bingo **[BUG]**
- `className="bg-anchor-bg"` — 9 pages: seasonal event pages **[correct]**
- `className="bg-anchor-bg-card"` — 1 page: food-menu/vegetarian **[correct]**
- No className — ~61 pages **[inherits parent, usually correct]**

## Business Rules
- Site uses a dark pub theme throughout — no literal white backgrounds anywhere
- FAQ sections should visually blend with surrounding content
- The `card-dark` class is used on individual FAQ items inside both components
- Schema markup (JSON-LD FAQPage) must be preserved in FAQAccordionWithSchema

## Priority
Visual consistency across all 75+ pages. The fix must be at the component level so future pages get the correct background by default.
