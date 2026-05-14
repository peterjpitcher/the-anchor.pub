# Phase 1: Tracking & HeroBadge - Context

**Gathered:** 2026-05-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Close phone analytics gaps by migrating all raw `tel:` links to tracked PhoneLink/PhoneButton components, and extract duplicated hero badge markup into a single reusable HeroBadge component built on the Badge primitive. No new pages, no content rewrites, no API changes.

</domain>

<decisions>
## Implementation Decisions

### HeroBadge component design
- **D-01:** Rebuild HeroBadge to wrap the existing Badge primitive (`components/ui/primitives/Badge.tsx`) with CVA. Do not keep the current inline `variantStyles` approach.
- **D-02:** All pages show the same set of badges — no per-page configuration. One HeroBadge component, one badge set, everywhere.
- **D-03:** Badge content (rating numbers, review counts) pulled from `SSOT.json` at build time. Update SSOT.json when ratings change — all pages update automatically.

### PhoneLink adjustments
- **D-04:** Add a real phone icon to the `showIcon` prop (currently renders empty string). Use a phone emoji or SVG icon.
- **D-05:** `showIcon` defaults to `true` (on by default). Pages opt out with `showIcon={false}` where the icon doesn't fit.
- **D-06:** During migration, match the component to context: PhoneLink for inline text links, PhoneButton for CTA/button contexts.

### GTM tracking sources
- **D-07:** Source naming convention is `page_location` format — e.g. `home_hero`, `contact_footer`, `beer-garden_cta`. Tells analytics both which page and where on the page the call was initiated.

### Phone number centralisation
- **D-08:** All phone numbers site-wide (clickable links AND JSON-LD schema data) pull from a single `PHONE_NUMBER` constant in `lib/constants.ts`. No hardcoded phone strings anywhere.

### Claude's Discretion
- Phone icon implementation (emoji vs SVG)
- Exact Badge primitive variant/size mapping for HeroBadge
- Migration ordering (which pages first)
- Error handling for missing SSOT.json data

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Component standardisation spec
- `docs/component-standardisation.md` — Full audit spec defining which components need standardisation, priority order, and current state

### Existing components to modify/extend
- `components/PhoneLink.tsx` — Current PhoneLink implementation (needs showIcon fix)
- `components/PhoneButton.tsx` — Current PhoneButton implementation (no changes needed, reference for migration)
- `components/HeroBadge.tsx` — Current HeroBadge implementation (to be rebuilt on Badge primitive)
- `components/ui/primitives/Badge.tsx` — CVA-based Badge primitive (HeroBadge must wrap this)

### Tracking infrastructure
- `lib/gtm-events.ts` — GTM event dispatcher with `trackPhoneCallClick()` function
- `components/tracking/` — Tracking component directory (AnalyticsProvider, GoogleTagManager, etc.)

### Data sources
- `SSOT.json` — Single source of truth for badge content (ratings, review counts)
- `lib/constants.ts` — Where PHONE_NUMBER constant should live

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Badge` primitive (`components/ui/primitives/Badge.tsx`): Full CVA setup with variant/size/dot props, forwardRef pattern
- `PhoneLink` (`components/PhoneLink.tsx`): Already has GTM tracking via `trackPhoneCallClick()`, just needs showIcon fix
- `PhoneButton` (`components/PhoneButton.tsx`): Button variant with GTM tracking, uses Button component
- `trackPhoneCallClick()` in `lib/gtm-events.ts`: Existing tracking function ready to use
- `cn()` utility: Tailwind class merging utility already in use

### Established Patterns
- CVA for component variants (Badge primitive is the reference pattern)
- `'use client'` only for interactive components (PhoneLink, PhoneButton are client components for tracking)
- Server Components by default for page content
- SSOT.json for centralised brand data

### Integration Points
- 20+ page files in `app/` have inline badge markup to replace with HeroBadge
- 17+ raw `tel:` href links across the site to replace with PhoneLink/PhoneButton
- JSON-LD schema markup on multiple pages references the phone number
- `lib/constants.ts` needs a PHONE_NUMBER constant added

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for component extraction and migration.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-tracking-herobadge*
*Context gathered: 2026-05-14*
