# World Cup Page Optimisation Spec

**Page:** `/live-sport/world-cup` (`app/live-sport/world-cup/page.tsx`)
**Date:** 10 May 2026 (revised after Codex adversarial review)
**Goal:** Maximise organic traffic that converts to pub bookings for World Cup 2026 matches

---

## Keyword Strategy

### Primary targets (what this page should rank for)
| Keyword | Volume | Intent | Why |
|---------|--------|--------|-----|
| world cup pub near heathrow | 50/mo (will spike) | Local/transactional | CI: 71 (HIGH) — advertisers value this. Hero H1 already targets it |
| watch world cup near me | 50/mo (will spike) | Local/transactional | Direct conversion intent |
| world cup screening near me | 50/mo (will spike) | Local/transactional | Competitor terminology gap |

### Content authority terms (on page for UX + topical signals, won't rank #1)
| Keyword | Volume | Role |
|---------|--------|------|
| world cup 2026 fixtures | 5,000/mo | Fixtures content serves users who arrive via other queries |
| world cup 2026 kick off times | 5,000/mo | UK times are the core utility of the fixtures table |
| england world cup kick off times | 5,000/mo | England section content |
| world cup 2026 times uk | 500/mo | Supporting the fixtures content |
| world cup fixtures uk time | 500/mo | Supporting the fixtures content |

### DO NOT target on this page (parent page or unwinnable)
- "football pub near me" / "pub showing football near me" / "live sport pub near me" — parent `/live-sport` page's job
- "world cup 2026" / "world cup 2026 schedule" / "world cup 2026 groups" — BBC/Sky/FIFA own these

---

## Section Order Change

Current order:
1. Hero (H1: "Watch FIFA World Cup 2026 Near Heathrow")
2. Intro copy + PageTitle H2
3. Three info cards (What We're Showing, Booking Rules, Matchday Setup)
4. CTA buttons
5. England fixtures
6. Full fixtures table
7. Matchday Essentials feature grid
8. Food & Drink + Getting Here
9. Local area "near me" section
10. FAQ
11. Final CTA

**New order:**
1. Hero (H1 unchanged: "Watch FIFA World Cup 2026 Near Heathrow")
2. **H2: "World Cup 2026 Fixtures and UK Kick-Off Times"** + brief intro line
3. **"How this fixtures list works"** alert box
4. **Full fixtures table** (WorldCup2026Fixtures component)
5. England fixtures highlight section
6. Three info cards (What We're Showing, Booking Rules, Matchday Setup) — with content updates below
7. CTA buttons
8. Food & Drink + Getting Here
9. Local area section (rewritten)
10. FAQ (updated)
11. Final CTA

**Removed entirely:**
- Matchday Essentials feature grid (duplicates info cards: "Sound On" and "4 Screens" appear in both)
- Intro copy section with PageTitle H2 (keyword-stuffed paragraph removed; the HeroWrapper already renders the H1 via `HeroSection.tsx:189`)

**Heading hierarchy after reorder:**
- H1: "Watch FIFA World Cup 2026 Near Heathrow" (HeroWrapper — unchanged)
- H2: "World Cup 2026 Fixtures and UK Kick-Off Times" (new first content section)
- H2: "England World Cup Fixtures at The Anchor" (existing, moved down)
- H2: "What We're Showing" / "Booking Rules" / "Matchday Setup" (existing info card headings)
- H2: remaining sections (Food & Drink, Getting Here, FAQ, etc.)

---

## Metadata Changes

### Title tag
**Current:** `World Cup Pub Near Heathrow | Watch FIFA 2026 Live`
**New:** `World Cup 2026 Fixtures & UK Kick-Off Times | The Anchor Near Heathrow`

**Why:** Leads with what the page delivers (fixtures + UK times), includes the brand, retains "Near Heathrow". "World Cup Pub Near Heathrow" stays in the hero H1 for the commercial signal.

### Meta description
**Current:** `Watch FIFA World Cup 2026 at The Anchor, a sports pub near Heathrow T5. UK kick-off times, fixtures, 4 screens, sound on, free parking. Book a table.`
**New:** `World Cup 2026 fixtures with UK kick-off times, showing status and table bookings. Watch at The Anchor near Heathrow T5 — 4 screens, sound on, free parking.`

**Why:** Leads with content utility. Adds "showing status" (unique feature). Drops "FIFA" (users search "World Cup").

### Open Graph title
**New:** `World Cup 2026 Fixtures & UK Kick-Off Times | The Anchor Near Heathrow`

### Open Graph description
**New:** `World Cup 2026 fixtures with UK kick-off times and showing status. Watch at The Anchor near Heathrow T5 — 4 screens, sound on, free parking. Book a table.`

---

## Content Changes

### 1. New intro line (replaces the keyword-stuffed paragraph)

Below the "World Cup 2026 Fixtures and UK Kick-Off Times" H2, a single line:

> Complete World Cup 2026 match schedule with UK kick-off times, showing status at The Anchor, and table booking links. Fixtures sourced from FIFA.

"Fixtures sourced from FIFA" — states the data source without overpromising real-time updates (page uses 24h ISR).

### 2. Info card updates

**"What We're Showing" card — add first bullet:**
- "Matches we show are on BBC and ITV (no subscription needed)"
- Frames it as what the pub shows (factual — SSOT confirms terrestrial only), not a broadcast rights claim about "all matches"
- Source: SSOT line 180 — "Live sport on terrestrial channels (BBC, ITV, Channel 4) only since January 2025"

**"What We're Showing" card — update hours line:**
- Verify against SSOT before implementation. Recent commits suggest Fri/Sat changed to 10pm close.

**"Booking Rules" card — fix deposit claim:**
- Current: "No deposits and no minimum spend"
- New: "No deposits for groups under 10. Groups of 10+ pay a £10 per person deposit, deducted from your bill."
- Source: CLAUDE.md business rule — "Groups of 10+ on any day, any booking type — £10 per person, deducted from the bill"

### 3. England fixtures section — add context line

Above the England fixtures list, add:
> England are in Group L alongside Croatia, Ghana and Panama.

Render conditionally — only show if England fixtures exist in the match data. If the draw data changes, the line disappears gracefully rather than showing stale info.

### 4. Local area section — rewrite

**Current:** Keyword-stuffed paragraph listing "World Cup pub near me", "football pub near me", etc.

**New copy:**
> The Anchor is in Stanwell Moor, just off the M25 and {HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5. Free parking for up to {PARKING.capacity} cars makes us easy to reach from Staines, Ashford, Feltham, Egham, Colnbrook, and Windsor.

Uses existing constants (`PARKING.capacity`, `HEATHROW_TIMES.terminal5`) — no hardcoded values or placeholders.

### 5. Add "screening" terminology

Work "screening" into copy naturally in these places:
- Fixtures section subtitle: "World Cup 2026 screenings, showing status, and table booking links."
- England section subtitle: "England fixtures, screenings and table bookings near Heathrow."
- FAQ answer for "Which World Cup 2026 matches are you showing?" — include "screening" naturally

### 6. FAQ updates

**Add new FAQ:**
- Q: "Is the World Cup 2026 free to watch?" A: "Yes. World Cup 2026 matches are on BBC and ITV in the UK. We show them on our 4 screens with sound on — no subscription needed."
- Q: "Are you extending opening hours for the World Cup?" A: "Selected knockout matches have extended hours until midnight. Check the fixtures list for specific matches. For all other games, standard opening hours apply."

**Update existing FAQ:**
- "Which World Cup 2026 matches are you showing?" — add "screening" and mention BBC/ITV

---

## Schema / Structured Data Changes

### 1. Add BreadcrumbList JSON-LD
Import the `<BreadcrumbJsonLd>` component used on the parent `/live-sport` page.

Add: `Home > Live Sport > World Cup 2026`

### 2. Fix Event schema
- Add `@id` field: `"@id": "https://www.the-anchor.pub/live-sport/world-cup#event"`
- Remove `performer` field entirely — FIFA organises the tournament but is not a performer at the pub. The `organizer` field already correctly names The Anchor.

### 3. FAQPage schema
Already valid via `FAQAccordionWithSchema`. Will automatically pick up new/updated FAQ items.

---

## Internal Linking Changes

### 1. Add link from `/live-sport` parent page TO this page
The parent page mentions "World Cup" in text/metadata but has zero `<Link>` elements pointing to `/live-sport/world-cup`. Add a prominent link/card.

### 2. Add link from homepage during tournament window
The homepage should feature a World Cup CTA linking to this page. Verify whether the hero/smart CTAs already handle this.

### 3. Verify blog posts link here
The Anchor already ranks for "sports bar near heathrow" via blog posts. Ensure those posts link to `/live-sport/world-cup`.

---

## What NOT to change

- **URL** — `/live-sport/world-cup` is correct. Hierarchical, reusable, not dated.
- **Canonical** — `/live-sport/world-cup` with relative format is correct.
- **ISR revalidation** — 24h is fine for fixture data (new live API coming separately).
- **FIFA API data fetch** — working correctly with try/catch resilience (being replaced by new API separately).
- **Event schema core fields** — dates, location, offers are all correct.
- **Booking CTA pattern** — Book Table / Call / WhatsApp / Directions covers all paths.
- **Hero H1** — "Watch FIFA World Cup 2026 Near Heathrow" is correct and confirmed as the sole `<h1>` via `HeroSection.tsx:189`.

---

## Off-page actions (not code changes)

1. **Submit to FANZO** — they rank for "pub showing world cup near me"
2. **Submit to watchWC.com** — free venue submission, ranks for "where to watch world cup"
3. **Submit to DesignMyNight** — strong for "where to watch world cup 2026 UK"
4. **Contact footballgroundguide.com** — they have a "best pubs to watch World Cup 2026 UK" article
5. **Update Google Business Profile** — add "World Cup 2026" to description, create Google Posts for match days
6. **Request indexing** — submit URL via Google Search Console URL Inspection tool

---

## Priority order

| # | Change | Effort | Impact |
|---|--------|--------|--------|
| 1 | Section reorder (fixtures first after hero) | Medium | High — matches user intent |
| 2 | Metadata update (title + description) | Small | High — SERP click-through |
| 3 | Add BreadcrumbList JSON-LD | Small | Medium — structured data |
| 4 | Add BBC/ITV terrestrial line to info card | Small | Medium — differentiator |
| 5 | Fix deposit claim in Booking Rules card | Small | Medium — factual accuracy |
| 6 | Rewrite local area section (remove keyword stuffing) | Small | Medium — removes penalty risk |
| 7 | Add "screening" terminology | Small | Medium — competitor alignment |
| 8 | England Group L context line (conditional) | Small | Low-Medium |
| 9 | FAQ additions (free to air, extended hours) | Small | Low-Medium |
| 10 | Fix Event schema (@id, remove performer) | Small | Low |
| 11 | Remove Matchday Essentials duplication | Small | Low — cleaner page |
| 12 | Internal link from /live-sport parent | Small | Medium — crawl signals |
| 13 | Internal link from homepage (verify first) | Small | Medium — authority flow |
