# Phase 2: TestimonialSection — Research

**Researched:** 2026-05-14
**Domain:** React component authoring — multi-variant testimonial/review display
**Confidence:** HIGH

## Summary

Phase 2 builds a single `TestimonialSection` component with three named variants (`full`, `compact`, `pull-quote`) and then replaces all ad-hoc testimonial markup across the site with it.

A full `components/reviews/` directory already exists with `ReviewSection`, `GoogleReviews`, `ReviewCard`, `ReviewsCarousel`, and `ReviewsBadge`. These components fetch live reviews from `/api/reviews` via a client-side `useEffect`. The reviews API currently returns **static mock data** — Google Places integration was removed. This means the "live" data path (`GoogleReviews`) is a `'use client'` component that fetches at runtime but only ever returns hardcoded mocks.

The ad-hoc testimonial markup that Phase 2 must replace is entirely **static, hardcoded content** embedded inline in page JSX. It does not use `GoogleReviews` at all — it is hand-rolled `<p>` and `<blockquote>` tags with star entities (`&#9733;`) and italic quotes. This matters for architectural decisions: `TestimonialSection` with static props is a Server Component; the existing `GoogleReviews` dynamic-fetch path remains a separate concern (v2 scope).

**Primary recommendation:** Build `TestimonialSection` as a Server Component accepting static `reviews` prop data. Reuse the existing `Card`, `Section`, and `Grid` primitives. Build three CVA variants. Replace the 8+ pages of hand-rolled markup with `<TestimonialSection variant="full|compact|pull-quote" reviews={[...]} />`.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| COMP-02 | TestimonialSection full-section variant: heading + subheading + grid of review cards | Section + Grid + Card primitives; static prop data pattern |
| COMP-03 | TestimonialSection compact card-strip variant: horizontal scrollable strip | Existing ReviewsCarousel provides reference pattern; use overflow-x-auto |
| COMP-04 | TestimonialSection single pull-quote variant: one prominent review | book-table/page.tsx already has a solo pull-quote pattern to model from |
| COMP-06 | Replace ALL ad-hoc testimonial markup with TestimonialSection | 8 files confirmed with inline hand-rolled markup; 4 files use existing review components (acceptable) |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| class-variance-authority (CVA) | Already in project | Variant-driven class composition | Used by Badge, Card, Button, Section — project standard |
| Next.js App Router | 14 (project) | Server Component default | No interactivity needed for static testimonial display |
| Tailwind CSS | Already in project | Styling | Project standard; design tokens via `anchor-*` prefix |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `cn()` from `@/lib/utils` | In project | Class merging | Always use instead of template literals for conditional classes |
| `components/ui/layout/Card` | In project | Review card wrapper | Provides `bg-anchor-bg-card rounded-none border border-anchor-gold/20` |
| `components/ui/layout/Section` | In project | Section wrapper | Provides background/spacing variants |
| `components/ui/layout/Grid` | In project | Card grid layout | Use for full-section grid |

### No New Installs Required
All dependencies are already in the project. No `npm install` needed for this phase.

---

## Architecture Patterns

### Recommended Component Location
```
components/
└── TestimonialSection/
    ├── index.tsx          # Main component + CVA variants
    ├── TestimonialCard.tsx # Sub-component for individual review cards
    └── types.ts           # Testimonial data interface
```

Or alternatively (simpler, matching HeroBadge precedent):
```
components/
└── TestimonialSection.tsx  # Single file, all variants inline
```

Phase 1 used a single-file pattern for `HeroBadge.tsx`. Follow that precedent for simplicity unless the component complexity warrants splitting.

### Data Shape

The existing `GoogleReview` type (from `@/lib/google/types`) is designed for live API data. For static testimonials, define a lighter `Testimonial` interface:

```typescript
export interface Testimonial {
  quote: string           // The review text (no quotes — component adds them)
  author: string          // Display name, e.g. "Rachel" or "Rachel T."
  source?: string         // e.g. "Google Review", "TripAdvisor"
  rating?: number         // 1–5, default 5 if omitted
}
```

This matches the data shape already in use across all ad-hoc testimonial blocks.

### CVA Variant Pattern (matching Badge/Card)

```typescript
// Source: existing Badge.tsx and Card.tsx in components/ui/primitives/
const testimonialSectionVariants = cva('', {
  variants: {
    variant: {
      full: '',       // Heading + subheading + card grid
      compact: '',    // Horizontal scrolling strip of condensed cards
      'pull-quote': '' // Single prominent quote, centred
    },
    background: {
      dark: 'bg-anchor-bg text-anchor-cream-text',
      card: 'bg-anchor-bg-card',
    }
  },
  defaultVariants: {
    variant: 'full',
    background: 'dark'
  }
})
```

### Pattern 1: Full-Section Variant (COMP-02)
**What:** `section-spacing` wrapper + heading + subheading + `grid md:grid-cols-2 lg:grid-cols-3 gap-6` of review cards
**When to use:** Dedicated testimonials section on a page, standalone block
**Model:** `app/private-hire/page.tsx` lines 547–588 (existing hand-rolled version)

```tsx
// Existing pattern in private-hire/page.tsx (to be replaced):
<section className="section-spacing bg-anchor-bg-card border-b border-anchor-gold/15">
  <Container>
    <SectionHeader title="What Our Guests Say" subtitle="From Google Reviews" />
    <div className="grid md:grid-cols-2 gap-6">
      {/* 4x hand-rolled <div> cards with &#9733; stars and <p className="italic"> */}
    </div>
  </Container>
</section>
```

### Pattern 2: Compact Card-Strip Variant (COMP-03)
**What:** Horizontal scroll row of condensed cards — narrower height, no grid
**When to use:** Mid-page trust signal, not a primary testimonials section
**Model:** Condensed from `ReviewsCarousel` (which already handles horizontal display)

### Pattern 3: Pull-Quote Variant (COMP-04)
**What:** Single prominent quote, centred, large italic text, attribution below
**When to use:** One strong review as a mid-page break
**Model:** `app/book-table/page.tsx` — already has an inline pull-quote block using:

```tsx
<Section spacing="md" container containerSize="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
  <div className="max-w-2xl mx-auto text-center">
    <p className="text-2xl text-anchor-cream-text/80 italic leading-relaxed">
      &ldquo;...quote...&rdquo;
    </p>
    <p className="mt-4 text-sm text-anchor-cream-text/50">Author, Google Review, rated 5/5</p>
  </div>
</Section>
```

### Server Component Decision
`TestimonialSection` MUST be a Server Component (no `'use client'`). All current ad-hoc testimonials are static hardcoded strings — no runtime fetch. The existing `GoogleReviews` component (`'use client'`) is a separate concern and is NOT replaced by this phase.

### Anti-Patterns to Avoid
- **Don't use `GoogleReviews` as the underlying engine:** It is a client component doing runtime fetches. TestimonialSection accepts static props.
- **Don't create a new `ReviewCard` sub-component if the existing one suffices:** The existing `components/reviews/ReviewCard.tsx` expects a `GoogleReview` type. For static data, either adapt it or build a simpler `TestimonialCard` sub-component.
- **Don't add star entity strings inline:** Render stars from a `rating` number prop via a loop — matches the existing `ReviewCard` pattern.
- **Don't hardcode `section-spacing` class on the component:** Accept a `className` prop and let call sites control spacing — matches `HeroBadge` and `PhoneLink` patterns.

---

## Pages to Replace (COMP-06 Audit)

The following pages contain inline hand-rolled testimonial/review markup that Phase 2 MUST replace:

| File | Variant Needed | Current Pattern | Notes |
|------|---------------|-----------------|-------|
| `app/private-hire/page.tsx` | `full` | 4-card grid, `&#9733;` + `<p italic>`, "From Google Reviews" | Largest block |
| `app/private-hire/baby-showers/page.tsx` | `compact` or `full` | 2 italic quotes, no star ratings shown | Inline in section |
| `app/private-hire/christenings/page.tsx` | `compact` or `full` | 2 italic quotes | Inline in section |
| `app/private-hire/wakes/page.tsx` | `compact` or `full` | 3 italic quotes | Inline in section |
| `app/private-hire/gender-reveal/page.tsx` | `compact` or `full` | 2 italic quotes | Inline in section |
| `app/christmas-parties/client-components.tsx` | `full` | `TESTIMONIALS` array, `Card` primitive, `<p italic>` | Already uses Card primitive; is a Client Component (interactive page) |
| `app/book-table/page.tsx` | `pull-quote` | Single centred quote with attribution | Perfect pull-quote candidate |
| `app/near-heathrow/page.tsx` | `pull-quote` | Single `<p italic>` in a centred section | Pull-quote candidate |

**Pages already using review components (no replacement needed):**
- `app/restaurants-near-heathrow/page.tsx` — uses `<GoogleReviews>` (dynamic, acceptable)
- `app/heathrow-parking/page.tsx` — uses `<ReviewSection>` (dynamic, acceptable)
- `app/beer-garden/page.tsx` — uses `<GoogleReviews>` (dynamic, acceptable)
- `app/pubs-in-stanwell/page.tsx` — uses `<GoogleReviews>` (dynamic, acceptable)

**Note on `reviews/page.tsx`:** The dedicated reviews page currently has a star entity and a `<blockquote>` — read the full page to confirm if it uses `ReviewSection` already or has additional hand-rolled content requiring replacement.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Card wrapper | Custom div with manual border/bg | `Card` primitive from `components/ui/layout/Card.tsx` | Consistent `rounded-none`, `border-anchor-gold/20`, padding variants |
| Section wrapper | Custom `<section>` with bg class | `Section` primitive from `components/ui/layout/Section.tsx` | CVA backgrounds + spacing + container in one |
| Class merging | Template literals / ternaries | `cn()` from `@/lib/utils` | Project standard |
| Variant selection | `if/else` logic | CVA `cva()` | Project standard; all other primitives use it |
| Star rendering | Hardcoded `&#9733;&#9733;&#9733;&#9733;&#9733;` | Loop over rating number | Flexible, avoids entity strings in JSX |

---

## Common Pitfalls

### Pitfall 1: Using `'use client'` unnecessarily
**What goes wrong:** TestimonialSection becomes a client component, adding JS bundle weight for purely static content.
**Why it happens:** Developer follows `GoogleReviews` as the model, which is already `'use client'`.
**How to avoid:** TestimonialSection accepts `reviews` as a prop (static data from the page). No hooks needed. No `'use client'`.
**Warning signs:** `useEffect`, `useState`, or `useRef` appearing in the component.

### Pitfall 2: christmas-parties page is a Client Component
**What goes wrong:** Importing a Server Component directly inside `client-components.tsx` causes a Next.js error.
**Why it happens:** `christmas-parties/client-components.tsx` has `'use client'` at the top. Server Components cannot be imported into client components.
**How to avoid:** `TestimonialSection` as a Server Component CAN be used in client component files as long as it's passed as a `children` prop or imported at a client-component boundary correctly. OR: since `TestimonialSection` has no server-only APIs, making it compatible with both (no `'use server'`, no server-only imports) means it can run in either context. Verify during planning.
**Warning signs:** Build error "You cannot import a component that contains ..."

### Pitfall 3: Star rendering with raw entity strings
**What goes wrong:** `&#9733;&#9733;&#9733;&#9733;&#9733;` is not accessible — screen readers may announce it oddly.
**Why it happens:** Copy-paste from existing ad-hoc markup.
**How to avoid:** Render stars from a number with `aria-label`:
```tsx
<div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
  {[...Array(5)].map((_, i) => (
    <span key={i} aria-hidden="true" className={i < rating ? "text-yellow-400" : "text-anchor-cream-text/30"}>★</span>
  ))}
</div>
```

### Pitfall 4: Replacing christmas-parties inline quotes without breaking interactivity
**What goes wrong:** The christmas-parties `TESTIMONIALS` array is inside a client component with a carousel/interactive state. Extracting it to TestimonialSection may require rethinking the layout.
**Why it happens:** The existing `TESTIMONIALS.map` renders inside the page's interactive render tree.
**How to avoid:** TestimonialSection `full` variant can render a static grid; the interactive carousel is v2 scope (COMP-08). Accept the simplification.

---

## Code Examples

### Calling the component (full variant)
```tsx
// In a page (Server Component):
import { TestimonialSection } from '@/components/TestimonialSection'

<TestimonialSection
  variant="full"
  title="What Our Guests Say"
  subtitle="From Google Reviews"
  reviews={[
    { quote: "Hired the function room for my 50th...", author: "Dave", source: "Google Review", rating: 5 },
    { quote: "We had our baby's Baptism party...", author: "Rachel", source: "TripAdvisor", rating: 5 },
  ]}
/>
```

### Calling the component (pull-quote variant)
```tsx
<TestimonialSection
  variant="pull-quote"
  reviews={[{
    quote: "Lovely pub, great food, friendly staff. We stopped in on our way to Heathrow and wished we'd found it sooner.",
    author: "Anonymous",
    source: "Google Review",
    rating: 5
  }]}
/>
```

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest (jest.config.js present) |
| Config file | `/jest.config.js` |
| Quick run command | `npm test -- --testPathPattern=TestimonialSection` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COMP-02 | Full variant renders heading, subheading, and review cards | unit | `npm test -- --testPathPattern=TestimonialSection` | Wave 0 |
| COMP-03 | Compact variant renders horizontal strip | unit | `npm test -- --testPathPattern=TestimonialSection` | Wave 0 |
| COMP-04 | Pull-quote variant renders single prominent quote | unit | `npm test -- --testPathPattern=TestimonialSection` | Wave 0 |
| COMP-06 | No raw `&#9733;` + italic `<p>` blocks remain in listed pages | manual grep | `grep -r "&#9733;" app --include="*.tsx"` | N/A |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=TestimonialSection`
- **Per wave merge:** `npm test`
- **Phase gate:** `npm run build && npm run lint && npm test` before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/TestimonialSection.test.tsx` — covers COMP-02, COMP-03, COMP-04
- [ ] No new jest config needed — existing `jest.config.js` covers all test files

---

## Sources

### Primary (HIGH confidence)
- Direct codebase audit — `components/reviews/*.tsx`, `components/ui/primitives/Badge.tsx`, `components/ui/layout/Card.tsx`, `components/ui/layout/Section.tsx`
- Direct page audit — all 8 files with hand-rolled testimonial markup confirmed by grep + manual read

### Secondary (MEDIUM confidence)
- Phase 1 PLAN structure (01-01-PLAN.md) — used to align component authoring conventions

---

## Metadata

**Confidence breakdown:**
- Pages to replace (COMP-06): HIGH — comprehensive grep audit confirmed all 8 files
- Component structure (COMP-02/03/04): HIGH — directly modelled from existing patterns in codebase
- Data source: HIGH — API route confirmed as static mock, no external dependency
- Client/Server boundary risk: MEDIUM — christmas-parties client component interaction needs verification during planning

**Research date:** 2026-05-14
**Valid until:** 2026-06-14 (stable stack, no external API dependency)
