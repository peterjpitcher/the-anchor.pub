# Component Standardisation Plan — The Anchor Website

**Created:** 2026-05-14  
**Purpose:** Track components that need standardising for consistency across all pages.  
**Status:** Living document — tick items off as they're completed.

---

## 1. HeroBadge component (NEW)

**Problem:** The hero badge/pill pattern is copy-pasted verbatim across 10+ pages:
```
className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm"
```

**Action:** Create `components/ui/HeroBadge.tsx` — a simple styled span.

**Pages affected:** milestone-birthdays, drinks, engagement-parties, wakes, retirement-parties, christenings, baby-showers, gender-reveal, function-room-hire, corporate-events, and others using this inline pattern.

- [ ] Create HeroBadge component
- [ ] Replace all inline badge markup across pages

---

## 2. PhoneButton tracking gaps

**Problem:** 17+ raw `<a href="tel:">` links bypass GTM tracking. These appear as inline text ("call us on 01753 682707") where the full PhoneButton component doesn't fit stylistically.

**Options:**
- A. Replace all with `<PhoneButton variant="link">` styled as inline text
- B. Create a lightweight `<PhoneLink>` component that fires the tracking event but renders as plain text
- C. Add a `data-phone-track` attribute and handle via GTM

**Pages with raw tel: links:**
- [ ] drinks/page.tsx
- [ ] private-hire/wakes/page.tsx (×2)
- [ ] private-hire/page.tsx
- [ ] function-room-hire/page.tsx
- [ ] karaoke/page.tsx
- [ ] our-pub/page.tsx
- [ ] corporate-events/page.tsx
- [ ] food-menu/page.tsx (×2)
- [ ] quiz-night/page.tsx
- [ ] book-table/page.tsx
- [ ] about/page.tsx
- [ ] heathrow-parking pages (×3)

---

## 3. Testimonial/review display

**Problem:** Three different approaches for showing Google reviews:
1. `GoogleReviews` component (restaurants-near-heathrow, beer-garden, pubs-in-stanwell)
2. Ad-hoc testimonial cards (private-hire/page.tsx, christmas-parties/client-components.tsx)
3. Inline quotes (book-table/page.tsx, our-pub/page.tsx)

**Action:** Standardise on a single `TestimonialSection` component that pulls from the curated reviews now stored in SSOT.md §12. Support variants:
- Full section with heading (for dedicated review areas)
- Compact card strip (for inline social proof)
- Single pull-quote (for hero sections or CTAs)

- [ ] Design TestimonialSection component with variants
- [ ] Migrate existing ad-hoc testimonials to use it
- [ ] Add to more pages where social proof would help

---

## 4. Section spacing tokens

**Problem:** Sections use inconsistent vertical spacing:
- `py-16 md:py-24` (most common on newer pages)
- `py-12 md:py-20` (some pages)
- `py-8` (tight sections)
- `section-spacing` utility class (rarely used)

**Action:** Define and enforce standard spacing tokens:
- `section-spacing` → standard sections (py-16 md:py-24)
- `section-spacing-sm` → compact sections (py-8 md:py-12)
- `section-spacing-lg` → hero-adjacent sections (py-20 md:py-32)

- [ ] Define spacing tokens in globals.css
- [ ] Audit and replace inline py-* values across all pages
- [ ] Document in a component guide

---

## 5. enableSmartCtas consistency on HeroWrapper

**Problem:** ~15 pages have `enableSmartCtas` on their HeroWrapper, but ~30 similar pages (mostly location and service pages) don't. This means some pages get dynamic, context-aware CTAs and others get static ones.

**Action:** Audit which pages should have smart CTAs and apply consistently.

- [ ] Add `enableSmartCtas` to all location/hotel pages
- [ ] Add to service pages (food-menu, sunday-lunch, book-table)
- [ ] Document which page types should/shouldn't use it

---

## 6. CTASection consistency

**Problem:** CTASection is well-adopted (~25 pages) but some pages that should have a final CTA don't:
- near-heathrow/terminal-2, terminal-3, terminal-4, terminal-5
- reviews page

**Also:** Button variants within CTASection aren't consistent — some use `primary`/`secondary`, others use `primary`/`white`. Phone buttons sometimes use `isPhone` prop, sometimes don't.

- [ ] Add CTASection to terminal subpages
- [ ] Add CTASection to reviews page
- [ ] Standardise button variant pairing across all CTASections

---

## 7. Map/find-us component (NEW)

**Problem:** No standardised map or location embed exists. Pages reference location via text-only directions. A reusable component would improve UX on location-focused pages.

**Action:** Create `components/features/FindUsSection.tsx` with:
- Google Maps embed (static image or iframe)
- Address, phone, parking info
- Link to Google Maps directions

- [ ] Design FindUsSection component
- [ ] Add to relevant pages (contact, about, location pages)

---

## 8. BusinessHours usage

**Problem:** Only 3–4 pages use the `BusinessHours` component. Most pages that mention hours use static text or fetch from the API directly.

**Action:** Ensure all pages showing opening times use the `BusinessHours` component (which pulls live data from the management API) rather than hardcoded text that can go stale.

- [ ] Audit all pages with static hours text
- [ ] Replace with BusinessHours component where appropriate

---

## 9. AlertBox patterns

**Currently good.** AlertBox is used consistently on ~15+ Heathrow/hotel pages for distance/travel callouts. No action needed now, but if new alert types are needed, extend the existing component rather than creating ad-hoc variants.

---

## 10. InternalLinkingSection + OrganicSearchClusterLinks

**Currently good.** Both are well-adopted (40+ and 30+ pages respectively). Consistent props and placement. No standardisation work needed — just maintain the pattern when adding new pages.

---

## Priority order

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| 1 | PhoneButton tracking gaps (#2) | Medium | High — lost analytics data |
| 2 | Testimonial standardisation (#3) | Medium | High — brand consistency |
| 3 | HeroBadge component (#1) | Low | Medium — DRY cleanup |
| 4 | CTASection gaps (#6) | Low | Medium — missed conversions |
| 5 | Section spacing tokens (#4) | Medium | Medium — visual consistency |
| 6 | enableSmartCtas consistency (#5) | Low | Low — incremental UX |
| 7 | FindUsSection component (#7) | Medium | Medium — new feature |
| 8 | BusinessHours expansion (#8) | Low | Low — data freshness |
