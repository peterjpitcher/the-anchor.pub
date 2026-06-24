# Review Pack — SEO Phase 2 (CODE ONLY)

Mode B code review. Next.js 14 App Router, TS, NO database. Data via management API + SSOT.json (imported at BUILD TIME by components/HeroBadge.tsx and lib/menu-page-data.ts).

## Hard rules
- No hardcoded food/drink prices in copy (live from DB). Non-food figures (deposits, parking, ULEZ) allowed.
- Banned claims: no real ale/CAMRA, no weddings, no Sky/TNT, no breakfast/delivery, no accessible-toilet/baby-changing positive claims. Wellington=vegan. No em dashes in customer copy.
- KNOWN/ACCEPTED (do not re-report): booking-cap 10-vs-20 mismatch is a flagged owner decision; tests/unit/ManagementTableBookingForm.test.tsx is pre-existing unrelated WIP.

## Review focus
1. lib/seasonal-utils.ts A11 resolver: empty-state, ordering, normalisation correctness.
2. components/seasonal/SeasonalDynamicDetails.tsx: must render null when no fields set; partial-field safety.
3. tests/ssot-drift-guard.test.ts: are assertions meaningful (not trivially passing)?
4. SSOT.json structural change: consumers (HeroBadge, menu-page-data, audit-menu-pages) must not read a removed key; valid JSON.
5. scripts/audit-hero.js HERO_PROVIDING_COMPONENTS: does the guard still FAIL a page that omits the hero?
6. app/easter-sunday/page.tsx: page fit, single h1, dynamic-field wiring.

=== DIFF: lib/seasonal-utils.ts ===
```diff
diff --git a/lib/seasonal-utils.ts b/lib/seasonal-utils.ts
index 5efeb035..9d5b0494 100644
--- a/lib/seasonal-utils.ts
+++ b/lib/seasonal-utils.ts
@@ -163,6 +163,121 @@ export function getSeasonalObjectPosition(season: SeasonalImage['season']): stri
   return `${focal.x}% ${focal.yMobile}%`
 }
 
+/* -------------------------------------------------------------------------- */
+/* A11 dynamic-field system (seasonal occasion pages)                         */
+/* -------------------------------------------------------------------------- */
+
+/**
+ * A11 dynamic fields for a seasonal occasion page.
+ *
+ * Every field is optional. The seasonal page templates render a complete,
+ * evergreen page when ALL of these are unset, the dynamic block simply does
+ * not appear. Set one or more for an annual update (e.g. confirm this year's
+ * Halloween theme, the NYE DJ, or a one-off special menu) without a code change
+ * to the page body.
+ *
+ * NEVER invent values for these. Only populate a field when the detail is
+ * confirmed by the owner or returned by the management API. An empty string is
+ * treated the same as unset, so a blank value is always safe.
+ */
+export interface SeasonalDynamicFields {
+  /** Human-readable occasion date, e.g. "Sunday 4 April 2027". */
+  occasionDate?: string
+  /** Food service window, e.g. "1pm to 6pm". */
+  foodServiceTimes?: string
+  /** Event start time, e.g. "8pm". */
+  eventStartTime?: string
+  /** Event end time, e.g. "1am". */
+  eventEndTime?: string
+  /** Booking status note, e.g. "Booking recommended" or "Now taking bookings". */
+  bookingStatus?: string
+  /** Ticket status note, e.g. "Free entry" or "Tickets on sale". */
+  ticketStatus?: string
+  /** Annual theme (Halloween fancy-dress theme changes yearly). */
+  annualTheme?: string
+  /** Performer, DJ or entertainment name. */
+  performer?: string
+  /** Special menu note (link to /food-menu in copy, never a hardcoded price). */
+  specialMenu?: string
+  /** Special offer note. */
+  specialOffer?: string
+  /** Pricing note. NEVER a hardcoded food/drink price, use "live on our menu". */
+  pricing?: string
+  /** Override the call-to-action label. */
+  ctaLabel?: string
+  /** Override the call-to-action destination (path or absolute URL). */
+  ctaDestination?: string
+}
+
+/** A single resolved dynamic detail, ready to render as a labelled row. */
+export interface SeasonalDetailRow {
+  label: string
+  value: string
+}
+
+/**
+ * Resolved A11 fields. `details` is the ordered list of labelled rows that have
+ * a confirmed value; `hasDetails` is a convenience flag for templates so they
+ * can decide whether to render the dynamic block at all. CTA overrides are
+ * surfaced separately because they change a button rather than add a row.
+ */
+export interface ResolvedSeasonalFields {
+  details: SeasonalDetailRow[]
+  hasDetails: boolean
+  ctaLabel?: string
+  ctaDestination?: string
+}
+
+function cleanField(value?: string): string | undefined {
+  if (typeof value !== 'string') return undefined
+  const trimmed = value.trim()
+  return trimmed.length > 0 ? trimmed : undefined
+}
+
+/**
+ * Normalises raw A11 fields into an ordered, render-ready structure.
+ *
+ * Blank / whitespace-only / undefined values are dropped, so a page given an
+ * empty object (or no object) resolves to `{ details: [], hasDetails: false }`
+ * and renders its evergreen base only. The field order here is the display
+ * order in the dynamic block.
+ */
+export function resolveSeasonalFields(fields: SeasonalDynamicFields = {}): ResolvedSeasonalFields {
+  const orderedRows: Array<[string, string | undefined]> = [
+    ['Date', cleanField(fields.occasionDate)],
+    ['Annual theme', cleanField(fields.annualTheme)],
+    ['Entertainment', cleanField(fields.performer)],
+    ['Event time', resolveEventTimeRange(fields)],
+    ['Food service', cleanField(fields.foodServiceTimes)],
+    ['Special menu', cleanField(fields.specialMenu)],
+    ['Special offer', cleanField(fields.specialOffer)],
+    ['Pricing', cleanField(fields.pricing)],
+    ['Booking', cleanField(fields.bookingStatus)],
+    ['Tickets', cleanField(fields.ticketStatus)]
+  ]
+
+  const details: SeasonalDetailRow[] = orderedRows
+    .filter((row): row is [string, string] => Boolean(row[1]))
+    .map(([label, value]) => ({ label, value }))
+
+  return {
+    details,
+    hasDetails: details.length > 0,
+    ctaLabel: cleanField(fields.ctaLabel),
+    ctaDestination: cleanField(fields.ctaDestination)
+  }
+}
+
+/** Combines start/end times into a single "8pm to 1am" / "from 8pm" string. */
+function resolveEventTimeRange(fields: SeasonalDynamicFields): string | undefined {
+  const start = cleanField(fields.eventStartTime)
+  const end = cleanField(fields.eventEndTime)
+  if (start && end) return `${start} to ${end}`
+  if (start) return `From ${start}`
+  if (end) return `Until ${end}`
+  return undefined
+}
+
 /**
  * Server-side only: Validates if seasonal image exists
  * Use this in development to verify all seasonal images are present
```
=== DIFF: scripts/audit-hero.js ===
```diff
```
=== DIFF: SSOT.json (capped 400 lines) ===
```diff
diff --git a/SSOT.json b/SSOT.json
index f8c3b3a7..45e8720e 100644
--- a/SSOT.json
+++ b/SSOT.json
@@ -3,8 +3,8 @@
   "$comment": "Structured mirror of The Anchor's Single Source of Truth. The canonical, human-edited source is docs/SSOT.md, if this JSON and the Markdown disagree, the Markdown wins and this file should be reconciled. AI agents, copywriters, and developers should read docs/SSOT.md before writing customer-facing content; use this JSON for programmatic lookups (menu, hours, drinks inventory).",
   "_canonical_source": "docs/SSOT.md",
   "meta": {
-    "version": "1.0.0",
-    "generated": "2026-03-22",
+    "version": "1.0.1",
+    "generated": "2026-06-14",
     "sources": [
       "lib/constants.ts",
       "lib/schema.ts",
@@ -30,20 +30,20 @@
   "identity": {
     "name": "The Anchor",
     "name_with_location": "The Anchor, Stanwell Moor",
-    "naming_rule": "Use 'The Anchor Pub' when describing what the business is (SEO value), but use 'The Anchor' for general mentions (e.g. 'we at The Anchor love serving our community').",
+    "naming_rule": "Use 'The Anchor' as the default customer-facing name. Use 'The Anchor Pub' only where SEO value warrants it (page titles, alt text, schema name fields). Never use 'The Anchor Pub' as the conversational default. See docs/SSOT.md section 1.",
     "motto": "Eat, Drink, Enjoy",
     "tagline": "Where Everyone's Welcome",
     "type": "Independent British village pub and restaurant",
     "pub_group": "Greene King Tenants network",
     "heritage_statement": "Part of the community since 1751",
-    "detailed_heritage": "A village pub since 1751. Stood before Heathrow existed; Heathrow grew from a grass airstrip in the 1940s.",
+    "detailed_heritage": "A village pub since 1751, with evidence of an Anchor Inn on the site by at least 1730. The present building appears to be mid-Victorian, standing on the site of the earlier pub. Stood here before Heathrow existed; Heathrow grew from a grass airstrip in the 1940s.",
     "founding_year": 1751,
     "founding_year_note": "RESOLVED 2026-03-22: Canonical year is 1751. Claims.json (1866), blog posts (1869), and footer ('since the 1800s') are all incorrect and should be updated.",
     "descriptions": {
       "default_seo": "Traditional British pub near Heathrow Airport",
       "schema_org": "Traditional British pub near Heathrow with quiz nights, hosted events, and famous Sunday roasts",
       "marketing": "The closest traditional British pub to Heathrow Airport. Famous Sunday roasts, beer garden under the flight path, and FREE parking for all guests.",
-      "footer": "Your local pub in Stanwell Moor, serving the community with great food, drinks, and entertainment since the 19th century.",
+      "footer": "Your local pub in Stanwell Moor, serving the community with great food, drinks, and entertainment since 1751.",
       "pwa": "Traditional British pub near Heathrow with quiz nights, hosted events & great food"
     }
   },
@@ -630,7 +630,7 @@
       "Lamb Shank (removed from both main menu and Sunday roast as of 2026-04-29)",
       "Speck Ham & Parmesan pizza"
     ],
-    "CORRECTION_2026_03_22": "Stacks (Beef, Chicken, Garden, Spicy Chicken) are back on the menu at £14 each, they were previously listed as removed. Updated in House Burgers section.",
+    "CORRECTION_2026_03_22": "Stacks (Beef, Chicken, Garden, Spicy Chicken) are back on the menu, they were previously listed as removed. Updated in House Burgers section. Prices are LIVE from the management DB, never quote a figure here.",
     "copy_corrections": {
       "mushy_peas_not_minted": "Always 'mushy peas', never 'minted peas'",
       "garden_veg_burger": "Always 'Garden Veg Burger', never 'Vegetable Burger'",
@@ -710,7 +710,7 @@
       "deposit_per_person_gbp_for_groups_of_10_or_more": "LIVE_FROM_DB",
       "deposit_deducted": true,
       "regular_menu_also_available": "Yes",
-      "max_online_party_size": 20,
+      "max_online_party_size": 10,
       "larger_groups": "Must call",
       "kitchen_dependency": "Blocked if kitchen is closed for that date"
     }
@@ -1108,11 +1108,11 @@
     ],
     "room_hire_charge": "None, minimum spend model applies",
     "minimum_spend_range_gbp": "500-1500 depending on day/size",
-    "catering_buffet_from_gbp": 12.0,
-    "catering_sitdown_from_gbp": 18.0,
-    "christmas_menus_from_gbp": 36.95,
-    "christmas_menus_weekday_gbp": 36.95,
-    "christmas_menus_weekend_gbp": 39.95,
+    "catering_buffet_from_gbp": "LIVE_FROM_DB",
+    "catering_sitdown_from_gbp": "LIVE_FROM_DB",
+    "christmas_menus_from_gbp": "LIVE_FROM_DB",
+    "christmas_menus_weekday_gbp": "LIVE_FROM_DB",
+    "christmas_menus_weekend_gbp": "LIVE_FROM_DB",
     "christmas_buffets": "Available for 26+ guests",
     "private_booking_deposit_gbp": 250,
     "catering_packages": {
@@ -1325,166 +1325,7 @@
     },
     "tripadvisor_rank": "#22 of 95 restaurants in Staines"
   },
-  "target_audiences": [
-    {
-      "id": "local-residents",
-      "name": "Local residents",
-      "description": "Stanwell Moor village and surrounding areas including growing Indian community",
-      "acorn_segments": [
-        "Settled Suburbia",
-        "Family Renters",
-        "Stable Seniors"
-      ]
-    },
-    {
-      "id": "travellers",
-      "name": "Heathrow travellers",
-      "description": "People travelling to/from Heathrow, domestic and international"
-    },
-    {
-      "id": "families",
-      "name": "Families",
-      "description": "Multi-generational groups seeking a welcoming pub and dining experience"
-    },
-    {
-      "id": "women",
-      "name": "Women",
-      "description": "Including women visiting alone, safety and welcome-led positioning"
-    },
-    {
-      "id": "dog-owners",
-      "name": "Dog owners",
-      "description": "People looking for dog-welcoming venues"
-    },
-    {
-      "id": "business-professionals",
-      "name": "Business professionals",
-      "description": "After-work crowd, meeting hosts, networking"
-    },
-    {
-      "id": "event-planners",
-      "name": "Event planners / private hire seekers",
-      "description": "Individuals or organisations hosting private events"
-    },
-    {
-      "id": "food-enthusiasts",
-      "name": "Food and drink enthusiasts",
-      "description": "People interested in quality pub food and broad drinks selection"
-    }
-  ],
-  "psychographic_segments": [
-    {
-      "name": "Social Explorers",
-      "source": "Yonder"
-    },
-    {
-      "name": "Trusty Traditionalists",
-      "source": "Yonder"
-    },
-    {
-      "name": "Ethical Enthusiasts",
-      "source": "Yonder"
-    },
-    {
-      "name": "Down-to-Earth Deal Seekers",
-      "source": "Yonder"
-    },
-    {
-      "name": "Cautious Homebodies",
-      "source": "Yonder"
-    }
-  ],
-  "competitive_landscape": {
-    "radius": "3-5 miles",
-    "note": "Excludes all venues inside Heathrow terminals, they are not direct competitors. Researched 2026-03-22.",
-    "total_licensed_premises": 164,
-    "named_competitors": [
-      {
-        "name": "Rising Sun",
-        "type": "Independent (Star Pubs & Bars)",
-        "location": "Stanwell village",
-        "distance": "0.7 miles",
-        "overlap": "Nearest pub, Sunday roast, garden, live music"
-      },
-      {
-        "name": "Sir John Gibson",
-        "type": "Craft Union (Stonegate)",
-        "location": "Stanwell village",
-        "distance": "0.8 miles",
-        "overlap": "Village local, sport (Sky/BT), pool"
-      },
-      {
-        "name": "The Green Man",
-        "type": "Greene King",
-        "location": "East Bedfont",
-        "distance": "2 miles",
-        "overlap": "Beer garden, free parking, Sunday roast, live music"
-      },
-      {
-        "name": "Three Magpies",
-        "type": "Greene King managed",
-        "location": "Bath Road (airport perimeter)",
-        "distance": "2.5 miles",
-        "overlap": "Closest pub on airport perimeter road"
-      },
-      {
-        "name": "Bell on the Green",
-        "type": "Independent",
-        "location": "East Bedfont",
-        "distance": "2.5 miles",
-        "overlap": "Beer garden, parking, function room, Indian-British food"
-      },
-      {
-        "name": "The Swan Hotel",
-        "type": "Fuller's",
-        "location": "Staines (riverside)",
-        "distance": "2.5 miles",
-        "overlap": "Premium Sunday roast, private hire, hotel"
-      },
-      {
-        "name": "The Bells",
-        "type": "Independent",
-        "location": "Staines town centre",
-        "distance": "2.5 miles",
-        "overlap": "Sunday roast, function room (The Stables)"
-      },
-      {
-        "name": "The George",
-        "type": "JD Wetherspoon",
-        "location": "Staines High Street",
-        "distance": "2.5 miles",
-        "overlap": "Budget food/drink, all-day service"
-      },
-      {
-        "name": "Five Bells",
-        "type": "Independent (family-owned)",
-        "location": "Horton, Berkshire",
-        "distance": "3 miles",
-        "overlap": "Food-led village pub near Heathrow, beer garden"
-      },
-      {
-        "name": "The Ostrich Inn",
-        "type": "Independent (freehold)",
-        "location": "Colnbrook",
-        "distance": "3.5 miles",
-        "overlap": "Grade II* heritage, restaurant, private dining, accommodation"
-      }
-    ],
-    "removed_competitors": [
-      {
-        "name": "Queen's Arms",
-        "reason": "Inside Heathrow Terminal 2, not a direct competitor"
-      },
-      {
-        "name": "Gordon Ramsay Plane Food",
-        "reason": "Inside Heathrow Terminal 5, not a direct competitor"
-      },
-      {
-        "name": "The Pheasant, Stanwell",
-        "reason": "No current listing found, likely closed or changed name"
-      }
-    ]
-  },
+  "_strategy_doc": "Strategy data (target_audiences, psychographic_segments, competitive_landscape) was moved to docs/brand-strategy.md on 2026-06-14 to keep this file to verifiable brand facts. See that doc for audience, segment, and competitor detail.",
   "seo_keywords": [
     "Cosy village pubs",
     "Family-friendly pub near me",
@@ -1591,7 +1432,7 @@
       }
     ],
     "dining_room_history": "Original conservatory built in 1995 for George and Alex Best's wedding reception. Replaced with new dining room extension, renovation started April 2024, ready for Euro 2024 (14 June). Features French doors to garden.",
-    "greene_king_partnership": "Renovation funding supported by Greene King. Stanwell Moor Brew developed in partnership."
+    "greene_king_partnership": "Renovation funding supported by Greene King."
   },
   "food_hygiene": {
     "rating": "5-star",
@@ -1619,7 +1460,7 @@
     "old_sunday_roast_options": "As of 2026-04-29: Do NOT list Roasted Chicken (adult), Slow-Cooked Lamb Shank, Crispy Pork Belly, Cauliflower Cheese side, or 'vegetarian wellington'. Current menu: Roast Beef Topside, Roast Pork Leg, Roast Turkey with Stuffing Ball, Beef & Ale Pie, Chicken & Wild Mushroom Pie, Beetroot & Butternut Squash Wellington (VEGAN), Kids Roast. Beef IS now a roast option, older 'do not use beef' guidance is reversed.",
     "wellington_vegetarian_phrasing": "Wellington is VEGAN, not vegetarian. Do NOT describe the wellington as 'vegetarian' in customer-facing copy or schemas.",
     "sunday_roast_pre_order_pre_pay": "Pre-order, Saturday-1pm cutoff and per-roast prepayment are RETIRED post-2026-05-17 walk-in launch. Do not reintroduce in copy, JSON-LD, or booking flows.",
-    "old_menu_items": "Lamb Shank (main) and Speck Ham & Parmesan pizza are removed. Do not list them. Stacks are back on the menu at £14 each.",
+    "old_menu_items": "Lamb Shank (main) and Speck Ham & Parmesan pizza are removed. Do not list them. Stacks are back on the menu (prices LIVE from the management DB, never quote a figure here).",
     "gluten_free_fish_and_chips": "Do NOT claim gluten-free fish and chips, gluten-free batter, gluten-free fried fish, grilled gluten-free fish, or a dedicated gluten-free fryer for fish and chips.",
     "info_email": "info@theanchorpub.co.uk is legacy, use manager@the-anchor.pub",
     "bogof_pizza": "DISCONTINUED. Remove all BOGOF pizza references from pages, schemas, and blog posts.",
```
=== NEW FILE: components/seasonal/SeasonalDynamicDetails.tsx ===
```tsx
import { Card, CardBody } from '@/components/ui'
import { resolveSeasonalFields, type SeasonalDynamicFields } from '@/lib/seasonal-utils'

export interface SeasonalDynamicDetailsProps {
  /**
   * The A11 dynamic fields for this year's occasion. Any unset/blank field is
   * ignored. When NO field is set the component renders nothing, so the page
   * falls back cleanly to its evergreen base with no empty box left behind.
   */
  fields?: SeasonalDynamicFields
  /** Heading for the block. */
  heading?: string
  /** Optional intro line above the detail rows. */
  intro?: string
}

/**
 * SeasonalDynamicDetails — the shared A11 "this year's details" block used by
 * every seasonal occasion page (Easter, Mother's Day, Father's Day, Valentine's
 * & Galentine's, Halloween, New Year's Eve).
 *
 * The page body is fully evergreen. This block is the single place that surfaces
 * the annual / API-driven detail (confirmed date, theme, DJ, special menu,
 * ticket status, and so on) so the owner can refresh a year's specifics by
 * passing a small object, no rebuild of the page copy required.
 *
 * Renders null when there is nothing confirmed to show. Never invent values:
 * only pass a field when it is confirmed by the owner or the management API.
 */
export function SeasonalDynamicDetails({
  fields,
  heading = "This year's details",
  intro
}: SeasonalDynamicDetailsProps) {
  const resolved = resolveSeasonalFields(fields)

  if (!resolved.hasDetails) {
    return null
  }

  return (
    <Card accent>
      <CardBody className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-h4 text-ink-strong">{heading}</h3>
          {intro ? <p className="text-sm text-ink-muted leading-relaxed">{intro}</p> : null}
        </div>
        <dl className="divide-y divide-line">
          {resolved.details.map((detail) => (
            <div
              key={detail.label}
              className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
            >
              <dt className="text-sm font-semibold uppercase tracking-wide text-accent-text">
                {detail.label}
              </dt>
              <dd className="text-sm text-ink-strong sm:text-right">{detail.value}</dd>
            </div>
          ))}
        </dl>
      </CardBody>
    </Card>
  )
}
```
=== NEW FILE: tests/ssot-drift-guard.test.ts ===
```ts
/**
 * SSOT drift-guard — fails loudly if docs/SSOT.md and SSOT.json ever
 * disagree on high-value, customer-facing brand facts, or if a banned
 * claim is reintroduced into a customer-facing JSON value.
 *
 * Background: docs/SSOT.md is the human-edited canonical source; SSOT.json
 * is its structured mirror (consumed at build time by components/HeroBadge.tsx
 * and lib/menu-page-data.ts, and by scripts/audit-menu-pages.js). The two
 * have drifted in the past (founding year, email, parking, party-size cap,
 * "19th century" footer, Stanwell Moor Brew). This test pins the facts that
 * matter so a future edit to one file without the other cannot ship silently.
 *
 * Parsing of the Markdown is deliberately pragmatic: we assert on stable
 * substrings, not a full Markdown parse, so cosmetic edits don't break it.
 */

import fs from 'fs'
import path from 'path'

const ssot = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'SSOT.json'), 'utf8'),
)
const md = fs.readFileSync(path.join(process.cwd(), 'docs', 'SSOT.md'), 'utf8')

// Normalise whitespace so multi-space / newline differences don't cause
// false negatives on substring checks.
const mdFlat = md.replace(/\s+/g, ' ')
// Same, but with Markdown emphasis markers stripped, so bold/italic around a
// value (e.g. "**Max online party size:** 10") doesn't break substring checks.
const mdPlain = mdFlat.replace(/[*_`]/g, '')
// CLAUDE.md is the agent-facing operational brief; the Monday-kitchen-closed
// policy lives there and in SSOT.json (docs/SSOT.md states it via the kitchen
// special-hours rule rather than the literal word "Monday").
const claudeMd = fs.readFileSync(path.join(process.cwd(), 'CLAUDE.md'), 'utf8')
// Positive customer-facing JSON string values only. We deliberately skip:
//  - internal guidance/governance blocks (do_not_use, resolved_inconsistencies,
//    RESOLVED notes, _comment-style keys, naming_rule, CORRECTION) which name
//    banned terms in order to ban them; and
//  - negation / discontinuation / history containers (does_NOT_have,
//    discontinued_*, removed_*, retired_*, live_sport_note, dining_room_history)
//    which legitimately name a banned thing to say it is NOT offered / is gone /
//    is historical. The audit confirms each of these is correct, not a breach
//    (e.g. the George Best 1995 wedding-reception line is building history, and
//    "TNT Sports" appears only under does_NOT_have).
// What remains is the genuinely promotional surface, where a banned term WOULD
// be a real reintroduction.
function customerFacingStrings(): string[] {
  const out: string[] = []
  const INTERNAL_KEY =
    /^(\$|_)|RESOLVED|do_not_use|resolved_inconsistencies|note$|_note$|naming_rule|CORRECTION|discontinued|removed|retired|does_NOT_have|dining_room_history|greene_king_partnership/i
  function walk(node: unknown, keyHint: string): void {
    if (typeof node === 'string') {
      out.push(node)
      return
    }
    if (Array.isArray(node)) {
      node.forEach((v) => walk(v, keyHint))
      return
    }
    if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        if (INTERNAL_KEY.test(k)) continue
        walk(v, k)
      }
    }
  }
  // Skip the top-level governance/guidance blocks entirely.
  const SKIP_TOP = new Set([
    'do_not_use',
    'resolved_inconsistencies',
    'discontinued_offers',
    // SEO/config metadata, not customer-facing copy: domains, schema IDs,
    // social/directory links (incl. the whatpub backlink), analytics IDs.
    // (seo_keywords is intentionally NOT skipped: a banned term like "real ale"
    // sneaking into the keyword set would be a genuine reintroduction.)
    'digital',
    'meta',
    '$schema',
    '$comment',
    '_canonical_source',
    '_pricing_policy',
    '_strategy_doc',
  ])
  for (const [k, v] of Object.entries(ssot)) {
    if (SKIP_TOP.has(k)) continue
    walk(v, k)
  }
  return out
}
const custStrings = customerFacingStrings()
const custBlob = custStrings.join('  ').toLowerCase()

describe('SSOT drift guard — contact & location', () => {
  it('phone number agrees across both files', () => {
    expect(ssot.contact.phone.display).toBe('01753 682707')
    expect(ssot.contact.phone.e164).toBe('+441753682707')
    expect(mdFlat).toContain('01753 682707')
  })

  it('email agrees and is the only correct address', () => {
    expect(ssot.contact.email.primary).toBe('manager@the-anchor.pub')
    expect(mdFlat).toContain('manager@the-anchor.pub')
  })

  it('postcode and street agree across both files', () => {
    expect(ssot.location.address.postcode).toBe('TW19 6AQ')
    expect(ssot.location.address.street).toBe('Horton Road')
    expect(ssot.location.address.town).toBe('Stanwell Moor')
    expect(mdFlat).toContain('TW19 6AQ')
    expect(mdFlat).toContain('Horton Road')
    expect(mdFlat).toContain('Stanwell Moor')
  })
})

describe('SSOT drift guard — heritage & reputation', () => {
  it('founding year is 1751 in JSON and stated in the MD', () => {
    expect(ssot.identity.founding_year).toBe(1751)
    expect(mdFlat).toContain('1751')
  })

  it('Google rating and review count agree across both files', () => {
    // These ship to every page at build time via components/HeroBadge.tsx,
    // so they must stay populated (4.6 / 238) and in sync with the MD.
    // Do NOT null these out: a null rating breaks the HeroBadge build-time read.
    expect(ssot.ratings.google.rating).toBe(4.6)
    expect(ssot.ratings.google.review_count).toBe(238)
    expect(mdFlat).toContain('4.6')
    expect(mdFlat).toContain('238')
  })
})

describe('SSOT drift guard — booking policy', () => {
  it('max online party size is 10 in JSON and stated in the MD', () => {
    expect(ssot.sunday_roast.booking_policy.max_online_party_size).toBe(10)
    // MD §4 and §7 should both say 10 (not 20). Use the emphasis-stripped
    // copy so bold markers around the value don't matter.
    expect(mdPlain).toContain('Max online party size: 10')
    expect(mdPlain).toContain('10 guests. Larger groups must call')
    // The old contradictory "20 guests" copy must be gone.
    expect(mdPlain).not.toContain('20 guests. Larger groups must call')
  })

  it('Monday-kitchen-closed policy is present (JSON + CLAUDE.md)', () => {
    // Monday kitchen is closed by default. Do NOT convert this to an
    // "API-only"/null policy: the management app relies on the explicit
    // Monday-closed default and HeroBadge/other build-time reads expect it.
    expect(String(ssot.food.kitchen_hours.monday).toUpperCase()).toContain(
      'CLOSED',
    )
    // The operational brief states the Monday default explicitly.
    expect(claudeMd.toLowerCase()).toContain('monday kitchen')
  })
})

describe('SSOT drift guard — pricing policy (no hardcoded food prices)', () => {
  it('Christmas and catering scalars are not hardcoded numbers', () => {
    const ph = ssot.private_hire
    for (const key of [
      'christmas_menus_from_gbp',
      'christmas_menus_weekday_gbp',
      'christmas_menus_weekend_gbp',
      'catering_buffet_from_gbp',
      'catering_sitdown_from_gbp',
    ]) {
      expect(typeof ph[key]).toBe('string')
      expect(ph[key]).toBe('LIVE_FROM_DB')
    }
  })

  it('no "£14" food price leaks via the Stacks correction strings', () => {
    // do_not_use is governance text; check the customer-facing corrections.
    expect(ssot.food.CORRECTION_2026_03_22).not.toContain('£14')
  })
})

describe('SSOT drift guard — banned strings absent from customer-facing JSON', () => {
  const banned: Array<[string, RegExp]> = [
    ['real ale positioning', /real ale/],
    ['CAMRA', /camra/],
    ['whatpub as a claim', /whatpub/],
    ['Sky Sports', /sky sports/],
    ['TNT Sports', /tnt/],
    ['wedding reception as an offer', /wedding reception/],
    ['Stanwell Moor Brew as a current product', /stanwell moor brew/],
  ]

  it.each(banned)('does not contain %s', (_label, re) => {
    expect(custBlob).not.toMatch(re)
  })
})
```
=== NEW FILE: app/easter-sunday/page.tsx ===
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { InteriorHero } from '@/components/hero'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { LaunchAnnouncement } from '@/components/announcements/LaunchAnnouncement'
import { InternalLinkingSection, commonLinkGroups } from '@/components/seo/InternalLinkingSection'
import { SeasonalDynamicDetails } from '@/components/seasonal/SeasonalDynamicDetails'
import { Badge, Button, Card, CardBody, Container } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { CONTACT, HEATHROW_TIMES, PARKING } from '@/lib/constants'
import { DEFAULT_PAGE_HEADER_IMAGE, DEFAULT_SUNDAY_LUNCH_IMAGE, DEFAULT_FOOD_IMAGE, DEFAULT_DRINKS_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import type { SeasonalDynamicFields } from '@/lib/seasonal-utils'

const WEBSITE_ORIGIN = 'https://www.the-anchor.pub'

// Evergreen Easter Sunday roast page (owner brief §1). Built on the A11 dynamic
// system: the body reads completely with no annual fields set. To refresh a
// year's specifics (confirmed date, a special menu, a one-off offer), populate
// EASTER_SUNDAY_DYNAMIC below, nothing else needs to change.
//
// Easter Sunday 2027 falls on 4 April 2027 (owner-confirmed rolling target).
const EASTER_SUNDAY_LABEL = 'Sunday 4 April 2027'
const EASTER_SUNDAY_DATE = '2027-04-04'
const EASTER_SUNDAY_SERVICE_WINDOW = '1pm to 6pm'
const EASTER_SUNDAY_LAST_BOOKING = '5:30pm'
const EASTER_BOOKING_URL = '/book-table'

// A11 dynamic fields. Empty by design, the page is evergreen. Fill in only
// what the owner or the management API confirms for a given year. Never invent.
const EASTER_SUNDAY_DYNAMIC: SeasonalDynamicFields = {}

export const metadata: Metadata = {
  title: 'Easter Sunday Roast in Stanwell Moor | The Anchor Stanwell Moor',
  description:
    'Easter Sunday roast at The Anchor in Stanwell Moor, near Heathrow Terminal 5. A family-friendly Sunday roast served 1pm to 6pm, cooked from scratch. Walk in or book ahead, free parking.',
  keywords:
    'easter sunday roast stanwell moor, easter sunday pub near heathrow, easter sunday lunch near heathrow, family-friendly easter sunday roast, easter roast near terminal 5',
  alternates: { canonical: './' },
  openGraph: {
    title: 'Easter Sunday Roast in Stanwell Moor | The Anchor',
    description:
      'Family-friendly Easter Sunday roast at The Anchor in Stanwell Moor, near Heathrow Terminal 5. Served 1pm to 6pm, cooked from scratch. Walk in or book ahead.',
    images: [DEFAULT_SUNDAY_LUNCH_IMAGE],
    type: 'website'
  },
  twitter: getTwitterMetadata({
    title: 'Easter Sunday Roast in Stanwell Moor | The Anchor',
    description:
      'Family-friendly Easter Sunday roast at The Anchor in Stanwell Moor, near Heathrow Terminal 5. Served 1pm to 6pm, cooked from scratch. Walk in or book ahead.',
    images: [DEFAULT_SUNDAY_LUNCH_IMAGE]
  })
}

export default function EasterSundayPage() {
  const addressLine = `${CONTACT.address.street}, ${CONTACT.address.town}, ${CONTACT.address.county}, ${CONTACT.address.postcode}`
  const mapQuery = `The Anchor, ${CONTACT.address.street}, ${CONTACT.address.postcode}`

  const faqs = [
    {
      question: 'Where can I find an Easter Sunday roast near me?',
      answer: `The Anchor in Stanwell Moor (TW19), about ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5 by car. We serve a family-friendly Easter Sunday roast cooked from scratch, with roast beef, pork, turkey, two pies or a vegan wellington. Walk in or book ahead, free parking on site.`
    },
    {
      question: 'What time is the Easter Sunday roast served?',
      answer: `We serve the Easter Sunday roast from 1pm to 6pm, with the last table booking at ${EASTER_SUNDAY_LAST_BOOKING}. There are no set sittings, so book a time that suits you, or simply walk in.`
    },
    {
      question: 'Do I need to book for Easter Sunday?',
      answer:
        'Walk-ins are welcome the whole way through, from 1pm to 6pm, with no pre-order needed. Booking is recommended for groups, as Easter Sunday is a busy one. Groups of 10 or more take a £10 per person deposit on booking, fully deducted from the bill on the day.'
    },
    {
      question: 'Is The Anchor family-friendly at Easter?',
      answer:
        'Yes. Children are very welcome, and the dog-friendly beer garden gives little ones room to run around while you finish your roast. It is a relaxed, family Easter Sunday, not a fussy one.'
    },
    {
      question: 'What is on the Easter Sunday menu?',
      answer:
        'Our Easter Sunday menu is our regular Sunday roast: roast beef, roast pork, roast turkey, a beef and ale pie, a chicken and wild mushroom pie, or a vegan wellington, all cooked from scratch. Current dishes and prices are live on our Sunday roast menu.'
    },
    {
      question: 'Is there parking?',
      answer: `Yes, we have ${PARKING.capacity} free parking spaces on site. No meters, no charges. We are about ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5 by car, and you will find us at ${addressLine}.`
    }
  ]

  const easterEventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${WEBSITE_ORIGIN}/easter-sunday#event`,
    name: 'Easter Sunday Roast at The Anchor',
    description:
      'Family-friendly Easter Sunday roast at The Anchor in Stanwell Moor (TW19), near Heathrow Terminal 5. Sunday roast from the current menu, cooked from scratch and served ' + EASTER_SUNDAY_SERVICE_WINDOW + '. Walk in or book ahead. Dog-friendly beer garden, free parking.',
    startDate: `${EASTER_SUNDAY_DATE}T13:00:00+01:00`,
    endDate: `${EASTER_SUNDAY_DATE}T18:00:00+01:00`,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'The Anchor',
      address: {
        '@type': 'PostalAddress',
        streetAddress: CONTACT.address.street,
        addressLocality: CONTACT.address.town,
        addressRegion: CONTACT.address.county,
        postalCode: CONTACT.address.postcode,
        addressCountry: CONTACT.address.country
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: CONTACT.coordinates.lat,
        longitude: CONTACT.coordinates.lng
      }
    },
    organizer: {
      '@type': 'Organization',
      name: 'The Anchor',
      url: WEBSITE_ORIGIN,
      telephone: CONTACT.phoneIntl,
      email: CONTACT.email
    },
    offers: {
      '@type': 'Offer',
      url: `${WEBSITE_ORIGIN}${EASTER_BOOKING_URL}`,
      availability: 'https://schema.org/InStock'
    },
    image: [
      `${WEBSITE_ORIGIN}${DEFAULT_SUNDAY_LUNCH_IMAGE}`,
      `${WEBSITE_ORIGIN}${DEFAULT_FOOD_IMAGE}`,
      `${WEBSITE_ORIGIN}${DEFAULT_DRINKS_IMAGE}`
    ],
    url: `${WEBSITE_ORIGIN}/easter-sunday`
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(easterEventSchema)
        }}
      />

      <InteriorHero
        image={DEFAULT_SUNDAY_LUNCH_IMAGE}
        crumb="Easter Sunday"
        kicker="Easter Sunday"
        title="Easter Sunday Roast at The Anchor"
        lead={`Gather the family for a proper Easter Sunday roast in the heart of Stanwell Moor. Cooked from scratch, served ${EASTER_SUNDAY_SERVICE_WINDOW}, near Heathrow Terminal 5. Walk in or book ahead, with free parking and a dog-friendly beer garden.`}
      />

      {/* Easter Sunday roast */}
      <section className="py-section-y bg-surface">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <LaunchAnnouncement variant="banner" />
            <h2 className="text-h3 text-ink-strong">
              A proper Easter Sunday roast
            </h2>
            <p className="text-ink-muted text-lg leading-relaxed">
              Easter Sunday is one of those days that deserves a proper table and someone else doing the cooking.
              Bring the family to The Anchor in Stanwell Moor for a traditional Sunday roast, the kind of relaxed
              lunch that marks the start of spring and gets everyone in one place.
            </p>
            <p className="text-ink-muted leading-relaxed">
              Choose from roast beef, roast pork, roast turkey, a beef and ale pie, a chicken and wild mushroom pie,
              or a vegan wellington, all cooked from scratch and served with triple-cooked roast potatoes, seasonal
              vegetables and our signature gravy. Yorkshire puddings come with the sliced roasts. Current dishes and
              prices are live on our{' '}
              <Link href="/sunday-roast" className="font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted">
                Sunday roast menu
              </Link>
              .
            </p>
            <p className="text-ink-muted leading-relaxed">
              We serve from <span className="font-semibold text-ink">1pm</span> to <span className="font-semibold text-ink">6pm</span>,
              with the last table booking at <span className="font-semibold text-ink">{EASTER_SUNDAY_LAST_BOOKING}</span>.
              There are no set sittings, so book a time that suits you and enjoy your meal at a comfortable pace.
            </p>

            <Card accent>
              <CardBody>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-accent-text">How Easter Sunday works</h3>
                <ul className="mt-3 space-y-2 text-sm text-ink-muted">
                  <li className="flex gap-2">
                    <span className="text-accent-text">&bull;</span>
                    <span>Walk-ins are welcome between <span className="font-semibold text-ink">1pm and 6pm</span>, no pre-order needed.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent-text">&bull;</span>
                    <span>Booking is recommended for groups, especially parties of six or more.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent-text">&bull;</span>
                    <span>Groups of 10 or more take a &pound;10 per person deposit on booking, fully deducted from the bill on the day.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent-text">&bull;</span>
                    <span>Vegetarian and vegan dishes are served with vegetarian gravy, just add a note when you book.</span>
                  </li>
                </ul>
              </CardBody>
            </Card>

            <SeasonalDynamicDetails
              fields={EASTER_SUNDAY_DYNAMIC}
              heading="This year's Easter Sunday"
              intro="The latest confirmed details for this year's Easter Sunday at The Anchor."
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <BookTableButton
                source="easter_sunday_section"
                context="easter_sunday"
                variant="primary"
                size="lg"
                fullWidth
                className="w-full sm:w-auto sm:min-w-[240px]"
                trackingLabel="Book your Easter Sunday table"
                eventName="Easter Sunday Roast"
                customHref={EASTER_BOOKING_URL}
              >
                Book your Easter Sunday table
              </BookTableButton>
              <Link href="/sunday-roast" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" fullWidth className="w-full sm:w-auto">
                  View Sunday roast menu
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Family Easter near Heathrow */}
      <section className="py-section-y bg-surface-sunk">
        <Container size="lg">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-h3 text-ink-strong">
              A family Easter Sunday near Heathrow Terminal 5
            </h2>
            <p className="text-ink-muted text-lg leading-relaxed">
              The Anchor is a proper village pub, not a chain or a hotel buffet. We are rooted in the Stanwell Moor
              community, about {HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5, with free parking right outside.
              That makes Easter Sunday easy: turn up, settle in, and let us do the work.
            </p>
            <p className="text-ink-muted leading-relaxed">
              Children are very welcome, dogs are welcome inside and in the garden, and there is space for everyone
              to relax. A plane passes overhead every 90 seconds or so, which, as it turns out, keeps the little ones
              (and a few of the grown-ups) entertained between courses.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="success">Family-friendly</Badge>
              <Badge variant="green">Walk-ins welcome</Badge>
              <Badge variant="green">Dog-friendly beer garden</Badge>
              <Badge variant="green">Free parking &bull; {PARKING.capacity} spaces</Badge>
              <Badge variant="green">Near Heathrow Terminal 5</Badge>
            </div>
          </div>
        </Container>
      </section>

      {/* Booking CTA */}
      <CtaBand
        title="Book your Easter Sunday table"
        copy={`A family Easter Sunday roast at The Anchor in Stanwell Moor, served ${EASTER_SUNDAY_SERVICE_WINDOW} (last table booking ${EASTER_SUNDAY_LAST_BOOKING}). Walk in or book ahead, booking is recommended as Easter Sunday gets busy.`}
        primary={
          <BookTableButton
            source="easter_sunday_cta"
            context="easter_sunday"
            variant="primary"
            size="lg"
            trackingLabel="Book your Easter Sunday table"
            eventName="Easter Sunday Roast"
            customHref={EASTER_BOOKING_URL}
          >
            Book your Easter Sunday table
          </BookTableButton>
        }
        secondary={
          <PhoneButton
            phone={CONTACT.phone}
            source="easter_sunday_cta"
            variant="outline"
            size="lg"
          >
            Call or WhatsApp us on {CONTACT.phone}
          </PhoneButton>
        }
      />

      {/* Where we are */}
      <section className="py-section-y bg-surface">
        <Container size="lg">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-start">
            <div className="space-y-4">
              <h2 className="text-h3 text-ink-strong">Where we are</h2>
              <p className="text-ink-muted leading-relaxed">
                The Anchor is in Stanwell Moor, Surrey (TW19 6AQ), close to Heathrow and easy to reach from{' '}
                <Link href="/staines-pub" className="font-semibold text-accent-text hover:text-anchor-gold underline decoration-dotted">
                  Staines-upon-Thames
                </Link>
                , with free parking on site.
              </p>
              <p className="text-ink-muted">
                Address: <span className="font-semibold text-ink-strong">{addressLine}</span>
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/find-us" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" fullWidth className="w-full sm:w-auto">
                    Directions &amp; parking
                  </Button>
                </Link>
                <PhoneButton
                  phone={CONTACT.phone}
                  source="easter_sunday_location"
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Call {CONTACT.phone}
                </PhoneButton>
              </div>
            </div>
            <GoogleMapEmbed query={mapQuery} height={360} />
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema title="Easter Sunday FAQs" faqs={faqs} />

      <InternalLinkingSection
        title="More to explore at The Anchor"
        links={[
          { href: EASTER_BOOKING_URL, title: 'Book your Easter Sunday table', description: 'Reserve online in minutes' },
          { href: '/sunday-roast', title: 'Sunday roast near Heathrow', description: 'Full menu, prices and walk-in info' },
          ...commonLinkGroups.dining,
          ...commonLinkGroups.location
        ]}
      />
    </>
  )
}
```
=== CONSUMER: components/HeroBadge.tsx ===
```tsx
import { Badge } from '@/components/ui/primitives/Badge'
import { cn } from '@/lib/utils'
import ssot from '@/SSOT.json'

// Pull badge content from SSOT.json at build time (per D-03)
const GOOGLE_RATING = ssot.ratings.google.rating
const GOOGLE_REVIEW_COUNT = ssot.ratings.google.review_count

interface HeroBadgeProps {
  className?: string
  badgeClassName?: string
  reviewBadgeClassName?: string
}

/**
 * HeroBadge — displays the standard set of trust badges (Google rating, review count).
 * All pages show the same badges (per D-02). Content comes from SSOT.json (per D-03).
 * Wraps the Badge primitive (per D-01).
 */
export function HeroBadge({ className, badgeClassName, reviewBadgeClassName }: HeroBadgeProps) {
  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-2', className)}>
      <Badge variant="green" className={badgeClassName}>
        {GOOGLE_RATING}/5 on Google
      </Badge>
      <Badge variant="outline" className={reviewBadgeClassName || badgeClassName}>
        {GOOGLE_REVIEW_COUNT} reviews
      </Badge>
    </div>
  )
}

// --- Item badge (legacy HeroBadge API) ---
// Used by ManagersSpecial.tsx and MenuRenderer.tsx for menu item badges (NEW, Featured, etc.)
// Routes through the Badge primitive instead of inline styles.

const itemBadgeVariantMap: Record<string, 'danger' | 'gold' | 'success' | 'green'> = {
  new: 'danger',
  featured: 'gold',
  special: 'success',
  limited: 'green'
}

interface ItemBadgeProps {
  text?: string
  variant?: 'new' | 'featured' | 'special' | 'limited'
  position?: 'absolute' | 'inline'
  className?: string
}

/**
 * ItemBadge — badge overlay for menu items (NEW, 25% OFF, etc.)
 * Backward-compatible replacement for the old HeroBadge item-badge API.
 */
export function ItemBadge({
  text = 'NEW',
  variant = 'new',
  position = 'absolute',
  className = ''
}: ItemBadgeProps) {
  if (position === 'absolute') {
    return (
      <Badge
        variant={itemBadgeVariantMap[variant] || 'danger'}
        className={cn(
          'absolute -top-2 -left-2 z-10 transform -rotate-12 shadow-md uppercase hidden md:inline-flex',
          className
        )}
      >
        {text}
      </Badge>
    )
  }

  // Inline version for mobile
  return (
    <Badge
      variant={itemBadgeVariantMap[variant] || 'danger'}
      className={cn('ml-3 uppercase md:hidden', className)}
    >
      {text}
    </Badge>
  )
}

// Preserve HeroItem export for backward compatibility with ManagersSpecial and MenuRenderer.
// HeroItem wraps children with an ItemBadge overlay.
interface HeroItemProps {
  children: React.ReactNode
  badgeText?: string
  badgeVariant?: 'new' | 'featured' | 'special' | 'limited'
  showBadge?: boolean
  className?: string
}

export function HeroItem({
  children,
  badgeText = 'NEW',
  badgeVariant = 'new',
  showBadge = false,
  className = ''
}: HeroItemProps) {
  if (!showBadge) {
    return <>{children}</>
  }

  return (
    <div className={cn('relative', className)}>
      <ItemBadge text={badgeText} variant={badgeVariant} position="absolute" />
      {children}
    </div>
  )
}
```
=== CONSUMER: lib/menu-page-data.ts (SSOT reads) ===
```ts
11:import ssot from '@/SSOT.json'
15:    copy_corrections?: {
19:  do_not_use?: {
25:const SSOT = ssot as SsotData
30:  SSOT.food?.copy_corrections?.gluten_free_fish_and_chips
31:  || SSOT.do_not_use?.gluten_free_fish_and_chips
```
