# The Anchor Pub Website — Component Standardisation

## What This Is

The Anchor is a customer-facing marketing and booking website for a pub in Stanwell Moor, near Heathrow Airport. Built with Next.js 14 App Router, TypeScript, and Tailwind CSS. The site has grown organically across 50+ pages and accumulated inconsistent component usage, duplicated markup patterns, and tracking gaps.

## Core Value

Every page delivers a consistent, professional brand experience with full analytics coverage — no copy-pasted markup, no untracked interactions, no stale data.

## Current Milestone: v1.0 Component Standardisation

**Goal:** Standardise duplicated UI patterns, close analytics tracking gaps, and ensure consistent component usage across all pages.

**Target features:**
- PhoneLink component for tracked inline telephone links
- TestimonialSection with full/compact/quote variants
- HeroBadge extracted from 10+ pages of duplicated markup
- CTASection coverage on all conversion-relevant pages
- Section spacing design tokens
- Smart CTA consistency across location/service pages
- FindUsSection for map/location display
- BusinessHours component replacing static hours text

## Requirements

### Validated

- ✓ AlertBox — consistent usage across 15+ Heathrow/hotel pages
- ✓ InternalLinkingSection — well-adopted across 40+ pages
- ✓ OrganicSearchClusterLinks — consistent across 30+ pages
- ✓ PhoneButton — works well as a standalone button component
- ✓ CTASection — adopted on ~25 pages with correct patterns
- ✓ HeroWrapper — functional with enableSmartCtas support
- ✓ BusinessHours — component exists and works, just under-deployed

### Active

- [ ] Tracked inline phone links across all pages
- [ ] Standardised testimonial/review display with variants
- [ ] Extracted HeroBadge component replacing duplicated markup
- [ ] CTASection on all terminal and review pages
- [ ] Section spacing design tokens enforced site-wide
- [ ] Smart CTAs enabled on all appropriate pages
- [ ] Reusable FindUsSection component
- [ ] BusinessHours component replacing all static hours text

### Out of Scope

- New page creation — this milestone is about standardising existing pages
- Content rewrites — only touching markup/components, not copy
- Database or API changes — this is a frontend-only effort
- Booking flow changes — managed by the management app

## Context

- 50+ pages across location, service, private-hire, and informational categories
- Another developer is working on a separate larger feature in a parallel worktree
- The spec at `docs/component-standardisation.md` was written after a full audit
- Items 9 (AlertBox) and 10 (InternalLinkingSection + OrganicSearchClusterLinks) are already consistent — no work needed

## Constraints

- **No content changes**: Only component/markup standardisation
- **Existing patterns**: Must match existing component API conventions (CVA variants, GTM tracking patterns)
- **No breaking changes**: All pages must continue to render correctly after each phase
- **SSOT compliance**: Any customer-facing text must align with docs/SSOT.md

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Priority order from spec | Analytics gaps (PhoneButton) have highest business impact | — Pending |
| Brownfield component extraction | Extract from existing patterns rather than designing from scratch | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-14 after project initialisation*
