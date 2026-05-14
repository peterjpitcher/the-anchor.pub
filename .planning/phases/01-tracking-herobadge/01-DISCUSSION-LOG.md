# Phase 1: Tracking & HeroBadge - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-14
**Phase:** 01-tracking-herobadge
**Areas discussed:** HeroBadge component design, Badge content & configuration, PhoneLink adjustments, PhoneButton vs PhoneLink, GTM tracking sources, Migration edge cases

---

## HeroBadge Component Design

| Option | Description | Selected |
|--------|-------------|----------|
| Rebuild on Badge primitive | HeroBadge wraps the existing Badge primitive + CVA. Consistent design system, less code. | ✓ |
| Standalone with CVA | HeroBadge stays separate but gets upgraded to CVA. More flexibility but two badge components. | |
| You decide | Claude picks based on the codebase. | |

**User's choice:** Rebuild on Badge primitive
**Notes:** None — straightforward choice for design system consistency.

---

## Badge Content & Configuration

| Option | Description | Selected |
|--------|-------------|----------|
| Same badges everywhere | One standard set of badges on all pages. Update once, changes everywhere. | ✓ |
| Configurable per page | Each page chooses which badges to show via props. | |
| You decide | Claude picks based on current page usage. | |

**User's choice:** Same badges everywhere
**Notes:** None.

---

## Badge Content Source

| Option | Description | Selected |
|--------|-------------|----------|
| Pull from SSOT.json | Ratings come from single source of truth file. No code change to update ratings. | ✓ |
| Hardcoded in component | Ratings baked into code. Quick to build but needs code changes to update. | |
| You decide | Claude picks based on project patterns. | |

**User's choice:** Pull from SSOT.json
**Notes:** Follows existing SSOT pattern for brand data.

---

## PhoneLink Review

| Option | Description | Selected |
|--------|-------------|----------|
| Just migrate — PhoneLink is fine | Focus on audit-and-replace work. | |
| Review PhoneLink first | Check code before migrating — might need tweaks. | ✓ |
| You decide | Claude checks and adjusts if needed. | |

**User's choice:** Review PhoneLink first
**Notes:** Code review revealed showIcon prop renders empty string (dead code).

---

## PhoneLink showIcon

| Option | Description | Selected |
|--------|-------------|----------|
| Remove showIcon | Dead code, simplify the component. | |
| Add a phone icon | Make showIcon actually show a phone icon. | ✓ |
| You decide | Claude picks based on usage. | |

**User's choice:** Add a phone icon
**Notes:** None.

---

## Phone Icon Default

| Option | Description | Selected |
|--------|-------------|----------|
| Off by default | Icon only shows when explicitly enabled. Safest for migration. | |
| On by default | Every PhoneLink shows icon unless opted out. Consistent. | ✓ |

**User's choice:** On by default
**Notes:** Accepted that some pages may need visual tweaking.

---

## PhoneButton vs PhoneLink Migration

| Option | Description | Selected |
|--------|-------------|----------|
| Match context | tel: in button/CTA → PhoneButton, tel: in text → PhoneLink. Preserves visual intent. | ✓ |
| Everything to PhoneLink | Simpler migration, all become PhoneLink. | |
| You decide | Claude picks per location. | |

**User's choice:** Match context
**Notes:** None.

---

## GTM Tracking Sources

| Option | Description | Selected |
|--------|-------------|----------|
| Page + location | e.g. 'home_hero', 'contact_footer'. Full picture of page and section. | ✓ |
| Location only | e.g. 'hero', 'footer'. Simpler but no page context. | |
| Page only | e.g. 'home', 'contact'. No section context. | |
| You decide | Claude picks based on existing patterns. | |

**User's choice:** Page + location
**Notes:** Format: `page_location` using snake_case.

---

## Migration Scope (Schema/Structured Data)

| Option | Description | Selected |
|--------|-------------|----------|
| Visible links only | Only replace clickable tel: links. Leave JSON-LD as raw strings. | |
| Everything including schema | Replace ALL tel: references including structured data. | ✓ |
| You decide | Claude handles per case. | |

**User's choice:** Everything including schema
**Notes:** Clarified that JSON-LD can't use React components — phone number in schema will use shared constant instead.

---

## Phone Number Constant

| Option | Description | Selected |
|--------|-------------|----------|
| Single constant in constants.ts | One PHONE_NUMBER constant. PhoneLink, PhoneButton, and JSON-LD all reference it. | ✓ |
| SSOT.json as source | Pull from SSOT.json at build time. Same concept, follows SSOT pattern. | |
| You decide | Claude picks the pattern that fits. | |

**User's choice:** Single constant in constants.ts
**Notes:** None.

---

## Claude's Discretion

- Phone icon implementation (emoji vs SVG)
- Exact Badge primitive variant/size mapping for HeroBadge
- Migration ordering (which pages to update first)
- Error handling for missing SSOT.json data

## Deferred Ideas

None — discussion stayed within phase scope.
