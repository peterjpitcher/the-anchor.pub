# SEO Revenue Optimisation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve organic search visibility and CTR for the three revenue priorities: food bookings, private event hire, and hosted event bookings.

**Architecture:** This is a content and on-page SEO optimisation — no new APIs, no schema changes, no database work. All changes are to Next.js page files (metadata, H1s, content sections), blog markdown files, and sitemap entries. Dynamic pricing already works via the management API.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Markdown blog content

**Key Patterns:**
- `HeroWrapper title` = visual hero text (NOT the semantic H1)
- `PageTitle as="h1"` = the actual semantic H1 for SEO (`@/components/ui/typography/PageTitle`)
- `BreadcrumbJsonLd` from `@/components/seo/BreadcrumbJsonLd`
- `FAQAccordionWithSchema` from `@/components/FAQAccordionWithSchema` (generates FAQ schema automatically)
- `PrivateBookingSection` from `@/components/PrivateBookingSection` (dynamic pricing calculator)
- Blog posts live in `content/blog/{slug}/index.md` with YAML frontmatter
- Sitemap entries in `app/sitemap.ts` — static routes array

**Reference Files:**
- Full audit: `docs/seo-audit-2026-04-04.md`
- GSC data: `~/Library/Mobile Documents/com~apple~CloudDocs/Downloads/https___www.the-anchor.pub_-Performance-on-Search-2026-04-04/`

---

## Plan Structure

| Phase | Focus | Tasks | Est. Effort |
|-------|-------|-------|-------------|
| A | Quick Wins (all priorities) | 1-6 | Low — metadata + H1 text changes only |
| B | Food Bookings | 7-12 | Medium — content expansion + 2 new blog posts |
| C | Private Hire | 13-18 | Medium — content expansion + 2 new blog posts |
| D | Events & Live Music | 19-23 | Medium — content updates + 1 new blog post |

---

## Phase A: Quick Wins (All Priorities)

These are text-only changes to metadata and H1 tags. No structural changes, no new components. Maximum SEO impact for minimum effort.

### Task 1: Fix Private Hire Sub-Page H1 Tags

Every private hire sub-page uses a creative H1 that omits the primary keyword. Google weights H1 heavily. This is the single highest-impact fix on the site.

**Files:**
- Modify: `app/private-hire/wakes/page.tsx`
- Modify: `app/private-hire/christenings/page.tsx`
- Modify: `app/private-hire/baby-showers/page.tsx`
- Modify: `app/private-hire/gender-reveal/page.tsx`
- Modify: `app/private-hire/milestone-birthdays/page.tsx`
- Modify: `app/private-hire/engagement-parties/page.tsx`
- Modify: `app/private-hire/retirement-parties/page.tsx`

- [ ] **Step 1: Fix wakes H1**

In `app/private-hire/wakes/page.tsx`, find the PageTitle component and change its text. Keep the `seo` props:

```tsx
// BEFORE:
<PageTitle className="text-center mb-6" seo={{ structured: true, speakable: true }}>
    Compassionate & Professional Service
</PageTitle>

// AFTER:
<PageTitle className="text-center mb-6" as="h1" seo={{ structured: true, speakable: true }}>
    Wake Venue & Funeral Receptions Near Heathrow
</PageTitle>
```

- [ ] **Step 2: Fix christenings H1**

In `app/private-hire/christenings/page.tsx`, find the PageTitle and update:

```tsx
// BEFORE:
<PageTitle ...>
    The Perfect Post-Church Celebration
</PageTitle>

// AFTER:
<PageTitle ... as="h1">
    Christening & Naming Ceremony Venue Near Heathrow
</PageTitle>
```

- [ ] **Step 3: Fix baby showers H1**

In `app/private-hire/baby-showers/page.tsx`:

```tsx
// BEFORE:
<PageTitle ...>
    The Perfect Daytime Celebration
</PageTitle>

// AFTER:
<PageTitle ... as="h1">
    Baby Shower Venue Near Ashford Hospital & Heathrow
</PageTitle>
```

- [ ] **Step 4: Fix gender reveal H1**

In `app/private-hire/gender-reveal/page.tsx`:

```tsx
// BEFORE:
<PageTitle ...>
    Boy or Girl? The Big Moment Awaits.
</PageTitle>

// AFTER:
<PageTitle ... as="h1">
    Gender Reveal Party Venue Near Heathrow
</PageTitle>
```

- [ ] **Step 5: Fix milestone birthdays H1**

In `app/private-hire/milestone-birthdays/page.tsx`:

```tsx
// BEFORE:
<PageTitle ...>
    Your Big Night Out
</PageTitle>

// AFTER:
<PageTitle ... as="h1">
    Milestone Birthday Party Venue — 21st, 30th, 40th, 50th
</PageTitle>
```

- [ ] **Step 6: Fix engagement parties H1**

In `app/private-hire/engagement-parties/page.tsx`:

```tsx
// BEFORE:
<PageTitle ...>
    She Said Yes! Now Let's Party.
</PageTitle>

// AFTER:
<PageTitle ... as="h1">
    Engagement Party Venue Near Heathrow & Staines
</PageTitle>
```

- [ ] **Step 7: Fix retirement parties H1**

In `app/private-hire/retirement-parties/page.tsx`:

```tsx
// BEFORE:
<PageTitle ...>
    Celebrate the Next Chapter
</PageTitle>

// AFTER:
<PageTitle ... as="h1">
    Retirement Party & Leaving Do Venue Near Heathrow
</PageTitle>
```

- [ ] **Step 8: Verify build**

Run: `npm run build`
Expected: Clean build, no errors.

- [ ] **Step 9: Commit**

```bash
git add app/private-hire/wakes/page.tsx app/private-hire/christenings/page.tsx app/private-hire/baby-showers/page.tsx app/private-hire/gender-reveal/page.tsx app/private-hire/milestone-birthdays/page.tsx app/private-hire/engagement-parties/page.tsx app/private-hire/retirement-parties/page.tsx
git commit -m "fix(seo): replace creative H1s with keyword-rich H1s on all private hire sub-pages

Seven pages had H1 tags like 'She Said Yes!' and 'Boy or Girl?' that contained
zero target keywords. Replaced with keyword-rich H1s matching GSC query data.
This is the highest-impact SEO fix identified in the April 2026 audit."
```

---

### Task 2: Rebrand Sunday Lunch to Sunday Roast

GSC data shows "sunday roast" has 3x the search volume of "sunday lunch". The page title already says "Sunday Roast" but the H1 and on-page references still say "Sunday Lunch".

**Files:**
- Modify: `app/sunday-lunch/page.tsx`

- [ ] **Step 1: Add PageTitle H1 to Sunday Lunch page**

The sunday-lunch page currently has NO PageTitle component (no semantic H1). Add one after the HeroWrapper. First, add the import if not present:

```tsx
import { PageTitle } from '@/components/ui/typography/PageTitle'
```

Then after the HeroWrapper closing tag, add:

```tsx
<Container className="py-8">
    <PageTitle as="h1" className="text-center mb-6" seo={{ structured: true, speakable: true }}>
        Traditional Sunday Roast Near Heathrow — From £19.99
    </PageTitle>
</Container>
```

- [ ] **Step 2: Update HeroWrapper title**

Change the HeroWrapper title prop from "Sunday Lunch" to "Sunday Roast":

```tsx
// BEFORE:
title="Sunday Lunch at The Anchor"

// AFTER:
title="Sunday Roast at The Anchor"
```

- [ ] **Step 3: Update on-page section headers**

Search the file for remaining "Sunday Lunch" references in SectionHeader components and update to "Sunday Roast" where customer-facing. Keep the URL slug as `/sunday-lunch` (redirect would cause more harm than good).

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Clean build, no errors.

- [ ] **Step 5: Commit**

```bash
git add app/sunday-lunch/page.tsx
git commit -m "feat(seo): rebrand Sunday Lunch page to Sunday Roast

GSC data shows 'sunday roast' has 3x search volume vs 'sunday lunch'.
Added semantic H1, updated HeroWrapper title and section headers.
URL slug kept as /sunday-lunch to preserve existing backlinks."
```

---

### Task 3: Fix What's On Meta for CTR at Position 3.4

The /whats-on page ranks at position 3.4 but has only 0.5% CTR. The title doesn't create urgency.

**Files:**
- Modify: `app/whats-on/page.tsx`

- [ ] **Step 1: Rewrite metadata**

```tsx
// BEFORE:
export const metadata: Metadata = {
  title: "What's On at The Anchor (Near Heathrow T5) | Music Bingo, Quiz & Bingo",
  description: "See what's on at The Anchor in Stanwell Moor near Heathrow Terminal 5 and Staines: quiz nights, Music Bingo hosted by Nikki Manfadge, cash bingo, live sport, and one-off events. Free parking on site.",

// AFTER:
export const metadata: Metadata = {
  title: "What's On This Week | Live Events Near Heathrow T5 | The Anchor",
  description: "Quiz nights, Music Bingo, cash bingo & live music at The Anchor, Stanwell Moor. Free entry events from £3. Free parking, 7 mins from Heathrow T5. See this week's lineup.",
```

Also update the OpenGraph title to match:

```tsx
  openGraph: {
    title: "What's On This Week at The Anchor Near Heathrow",
```

- [ ] **Step 2: Verify build**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add app/whats-on/page.tsx
git commit -m "fix(seo): rewrite whats-on title and meta for CTR improvement

Page ranks at position 3.4 but only 0.5% CTR. Added urgency ('This Week'),
price anchor ('from £3'), and clearer value prop to meta description."
```

---

### Task 4: Fix Food Menu Meta Description

Position 5.2 but only 2.9% CTR. Meta description needs price anchors and urgency.

**Files:**
- Modify: `app/food-menu/page.tsx`

- [ ] **Step 1: Rewrite meta description**

Find the metadata export and update the description:

```tsx
// BEFORE:
description: 'Pub classics, stone-baked pizza, pies & fish and chips at The Anchor near Heathrow. Kitchen open Tuesday-Sunday. Free parking, 7 mins from T5. View menu online.',

// AFTER:
description: 'Pub food from £8.95 at The Anchor near Heathrow. Stone-baked pizza, beer-battered fish & chips, gourmet burgers & pies. Kitchen open Tue-Sun. Free parking, 7 mins from T5. Book a table online.',
```

- [ ] **Step 2: Commit**

```bash
git add app/food-menu/page.tsx
git commit -m "fix(seo): add price anchor and booking CTA to food-menu meta description"
```

---

### Task 5: Add BreadcrumbJsonLd to Karaoke and Open Mic

These two pages are missing breadcrumb schema — an oversight compared to all other event pages.

**Files:**
- Modify: `app/karaoke/page.tsx`
- Modify: `app/open-mic/page.tsx`

- [ ] **Step 1: Add BreadcrumbJsonLd to karaoke page**

Add import at top of `app/karaoke/page.tsx`:

```tsx
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
```

Add component inside the return, after the opening fragment `<>`:

```tsx
<BreadcrumbJsonLd items={[
    { name: 'Home', url: '/' },
    { name: "What's On", url: '/whats-on' },
    { name: 'Karaoke', url: '/karaoke' }
]} />
```

- [ ] **Step 2: Add BreadcrumbJsonLd to open mic page**

Same pattern in `app/open-mic/page.tsx`:

```tsx
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
```

```tsx
<BreadcrumbJsonLd items={[
    { name: 'Home', url: '/' },
    { name: "What's On", url: '/whats-on' },
    { name: 'Open Mic', url: '/open-mic' }
]} />
```

- [ ] **Step 3: Verify build**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add app/karaoke/page.tsx app/open-mic/page.tsx
git commit -m "fix(seo): add missing BreadcrumbJsonLd to karaoke and open-mic pages"
```

---

### Task 6: Add Semantic H1 to Live Sport Page

The live sport page has no PageTitle component — missing semantic H1 entirely.

**Files:**
- Modify: `app/live-sport/page.tsx`

- [ ] **Step 1: Add PageTitle import and H1**

Add import:

```tsx
import { PageTitle } from '@/components/ui/typography/PageTitle'
```

After the HeroWrapper, add:

```tsx
<Container className="py-8">
    <PageTitle as="h1" className="text-center mb-6" seo={{ structured: true }}>
        Watch Live Sport Near Heathrow — Big Screens & Great Atmosphere
    </PageTitle>
</Container>
```

- [ ] **Step 2: Verify build and commit**

```bash
npm run build
git add app/live-sport/page.tsx
git commit -m "fix(seo): add missing semantic H1 to live-sport page"
```

---

## Phase B: Food Bookings

### Task 7: Expand Book Table Page

Currently ~800 words, zero clicks, position 10.8. Needs pre-booking content to improve relevance and rankings.

**Files:**
- Modify: `app/book-table/page.tsx`

- [ ] **Step 1: Read the current page fully**

Read `app/book-table/page.tsx` end to end to understand current structure before making changes.

- [ ] **Step 2: Add PageTitle H1 if missing**

Ensure the page has a semantic H1:

```tsx
<PageTitle as="h1" className="text-center mb-6" seo={{ structured: true }}>
    Book a Table at The Anchor — Pub Dining Near Heathrow
</PageTitle>
```

- [ ] **Step 3: Add "What to Expect" content section**

After the booking form, add a content section with menu highlights, trust signals, and internal links. Add a section like:

```tsx
<Section>
    <Container>
        <SectionHeader title="What to Expect When You Visit" />
        <Grid cols={3} gap="md">
            <Card>
                <CardBody>
                    <h3 className="text-lg font-semibold mb-2">Pub Classics & Pizza</h3>
                    <p className="text-anchor-text-secondary">Stone-baked pizza, beer-battered fish & chips, gourmet burgers, and hearty pies. Kitchen open Tuesday to Sunday.</p>
                    <Link href="/food-menu" className="text-anchor-gold hover:underline mt-2 inline-block">View Full Menu</Link>
                </CardBody>
            </Card>
            <Card>
                <CardBody>
                    <h3 className="text-lg font-semibold mb-2">Sunday Roast</h3>
                    <p className="text-anchor-text-secondary">Traditional roasts from £19.99 with all the trimmings. Pre-order by Saturday 1pm. Chicken, lamb, pork belly & vegetarian options.</p>
                    <Link href="/sunday-lunch" className="text-anchor-gold hover:underline mt-2 inline-block">Sunday Roast Info</Link>
                </CardBody>
            </Card>
            <Card>
                <CardBody>
                    <h3 className="text-lg font-semibold mb-2">Free Parking & Easy Access</h3>
                    <p className="text-anchor-text-secondary">20 free parking spaces on site. Just 7 minutes from Heathrow Terminal 5 via the M25 (Junction 14). Dog-friendly with a large beer garden.</p>
                    <Link href="/find-us" className="text-anchor-gold hover:underline mt-2 inline-block">Get Directions</Link>
                </CardBody>
            </Card>
        </Grid>
    </Container>
</Section>
```

- [ ] **Step 4: Add FAQ section**

Add a FAQ section below the "What to Expect" section targeting booking-intent queries:

```tsx
<FAQAccordionWithSchema
    faqs={[
        { question: "Do I need to book a table in advance?", answer: "Walk-ins are welcome, but we recommend booking for groups of 4 or more, especially on Friday and Saturday evenings and for Sunday roast." },
        { question: "Is there a deposit required?", answer: "Only for Sunday roast (£10 per person) and large groups of 8+. Regular table bookings are free with instant confirmation." },
        { question: "Can I book for a special occasion?", answer: "Absolutely. Let us know in the booking notes and we can arrange reserved seating, decorations, or a birthday cake. For larger celebrations (10+ guests), see our private hire options." },
        { question: "Do you cater for dietary requirements?", answer: "Yes. Our menu includes vegetarian, vegan, and gluten-free options. Let us know any allergies when booking and our kitchen team will accommodate you." },
        { question: "How far is The Anchor from Heathrow Airport?", answer: "Just 7 minutes by car from Terminal 5 via the M25 (Junction 14). We offer free parking for all diners — perfect for pre-flight meals or Heathrow layover dining." },
        { question: "What are your kitchen hours?", answer: "Kitchen is open Tuesday to Sunday. Monday is drinks only (kitchen closed). Check our food menu page for exact service times." },
        { question: "Is The Anchor dog-friendly?", answer: "Yes, well-behaved dogs are welcome throughout the pub and in our large beer garden. We have water bowls available." },
        { question: "Can I book a table for a Heathrow layover meal?", answer: "Yes — many of our guests are Heathrow travellers. Book ahead to guarantee your table, and we can have food ready quickly if you're on a tight schedule." }
    ]}
/>
```

- [ ] **Step 5: Update meta description**

```tsx
description: 'Book a table at The Anchor near Heathrow with instant confirmation. Pub classics from £8.95, Sunday roasts from £19.99. Free parking, dog-friendly, 7 mins from T5. Walk-ins welcome.',
```

- [ ] **Step 6: Verify build and commit**

```bash
npm run build
git add app/book-table/page.tsx
git commit -m "feat(seo): expand book-table page with menu highlights, FAQ, and improved meta

Page had ~800 words and zero clicks. Added 'What to Expect' section with
menu highlights and internal links, 8-question FAQ targeting booking queries,
and updated meta description with price anchors."
```

---

### Task 8: Expand Burger Menu Content

Currently ~1,000 words vs ~2,000 for pizza. Position 20.8 with only 32 impressions.

**Files:**
- Modify: `app/burger-menu/page.tsx`

- [ ] **Step 1: Read the current page fully**

Read `app/burger-menu/page.tsx` end to end.

- [ ] **Step 2: Add "The Anchor Burger Story" section**

After the existing feature grid, add a content section about sourcing and preparation:

```tsx
<Section>
    <Container>
        <SectionHeader title="How We Make Our Burgers" subtitle="100% British beef, smashed to order" />
        <div className="prose prose-invert max-w-3xl mx-auto">
            <p>Every burger at The Anchor starts with 100% British chuck steak, coarsely ground and hand-formed in our kitchen. We use the smash technique — pressing each patty flat on a screaming-hot griddle — to create that signature crispy, caramelised crust you won't find at chain restaurants.</p>
            <p>Our brioche buns are lightly toasted, our toppings are fresh, and chips are included with every burger. Whether you're after a classic cheeseburger or something with a bit more punch, this is proper pub grub done right.</p>
            <p>Vegetarian? Our plant-based burger uses the same smash technique and comes loaded with all the trimmings. Ask your server about vegan and gluten-free options.</p>
        </div>
    </Container>
</Section>
```

- [ ] **Step 3: Expand FAQ section**

Add more FAQs to the existing FAQAccordionWithSchema. Include questions targeting search intent:

```tsx
{ question: "Are your burgers good for Heathrow travellers?", answer: "Absolutely. We're just 7 minutes from Terminal 5 with free parking. Many guests stop in for a burger before or after a flight — much better than airport food." },
{ question: "Can I get a burger as takeaway?", answer: "Yes, call us on 01753 682707 to place a takeaway order. Collection from the bar." },
{ question: "What makes a smash burger different?", answer: "A smash burger is pressed flat on a very hot griddle, creating a thin, crispy, caramelised patty. It's juicier and more flavourful than a thick pub burger because of the increased surface area in contact with the heat." }
```

- [ ] **Step 4: Verify build and commit**

```bash
npm run build
git add app/burger-menu/page.tsx
git commit -m "feat(seo): expand burger-menu with sourcing story and additional FAQs

Content expanded from ~1,000 to ~1,800 words. Added 'How We Make Our Burgers'
section and 3 additional FAQs targeting Heathrow traveller and takeaway queries."
```

---

### Task 9: Add Schema to Family Dining Page

Weakest schema implementation of all food pages — only breadcrumbs. Needs LocalBusiness + AggregateRating.

**Files:**
- Modify: `app/heathrow-family-dining/page.tsx`

- [ ] **Step 1: Read the current page fully**

Read `app/heathrow-family-dining/page.tsx` end to end.

- [ ] **Step 2: Add comprehensive schema**

Add a JSON-LD script with Restaurant + family amenities schema after the opening fragment:

```tsx
<script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify({
        "@context": "https://schema.org",
        "@type": "Restaurant",
        "name": "The Anchor — Family Dining Near Heathrow",
        "description": "Family-friendly pub restaurant near Heathrow Airport with kids menu, high chairs, large beer garden, and free parking.",
        "url": "https://www.the-anchor.pub/heathrow-family-dining",
        "telephone": "+441753682707",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "The Anchor, Horton Road",
            "addressLocality": "Stanwell Moor",
            "addressRegion": "Surrey",
            "postalCode": "TW19 6AQ",
            "addressCountry": "GB"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 51.462509,
            "longitude": -0.502067
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.6",
            "bestRating": "5",
            "reviewCount": "238"
        },
        "amenityFeature": [
            { "@type": "LocationFeatureSpecification", "name": "High Chairs", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Children's Menu", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Baby Changing Facilities", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Beer Garden", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Free Parking", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Dog Friendly", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Wheelchair Accessible", "value": true }
        ],
        "servesCuisine": ["British", "Pub Food", "Pizza"],
        "acceptsReservations": true,
        "priceRange": "££"
    }) }}
/>
```

Import `jsonLdSafeStringify` from `@/lib/jsonld` if not already imported.

- [ ] **Step 3: Fix H1**

Add or update the PageTitle to include target keyword:

```tsx
<PageTitle as="h1" className="text-center mb-6" seo={{ structured: true }}>
    Family-Friendly Pub & Restaurant Near Heathrow Airport
</PageTitle>
```

- [ ] **Step 4: Verify build and commit**

```bash
npm run build
git add app/heathrow-family-dining/page.tsx
git commit -m "feat(seo): add Restaurant schema with family amenities to family-dining page

Added comprehensive JSON-LD with AggregateRating, 7 amenity features,
geo coordinates, and cuisine types. Fixed H1 to include target keyword."
```

---

### Task 10: Expand Vegetarian/Vegan Pages

72 impressions for "vegetarian pub food" at position 43.5 — the pages exist but are very thin.

**Files:**
- Modify: `app/food-menu/vegetarian/page.tsx`
- Modify: `app/food-menu/vegan/page.tsx`

- [ ] **Step 1: Read both pages**

Read `app/food-menu/vegetarian/page.tsx` and `app/food-menu/vegan/page.tsx` to understand current content.

- [ ] **Step 2: Expand vegetarian page**

Add introductory content, a "Why Vegetarians Love The Anchor" section, and expand the FAQ. The page should reach ~1,500 words. Add a proper H1:

```tsx
<PageTitle as="h1" className="text-center mb-6" seo={{ structured: true }}>
    Vegetarian Pub Food Near Heathrow
</PageTitle>
```

Add content sections covering: vegetarian pizza options, vegetarian Sunday roast, beer garden dining, and how the kitchen handles vegetarian orders separately.

- [ ] **Step 3: Expand vegan page**

Same approach — add H1, content sections, and expanded FAQ:

```tsx
<PageTitle as="h1" className="text-center mb-6" seo={{ structured: true }}>
    Vegan Pub Food & Plant-Based Menu Near Heathrow
</PageTitle>
```

- [ ] **Step 4: Verify build and commit**

```bash
npm run build
git add app/food-menu/vegetarian/page.tsx app/food-menu/vegan/page.tsx
git commit -m "feat(seo): expand vegetarian and vegan menu pages with keyword-rich content

Both pages were very thin. Added proper H1s, introductory content, feature
sections, and expanded FAQs. Targeting 'vegetarian pub food heathrow' (72 impressions)."
```

---

### Task 11: Create Blog Post — "Best Sunday Roast Near Heathrow (2026 Guide)"

A blog post already exists (`best-sunday-roast-near-heathrow`) — read it first. If it's already comprehensive, update it instead of creating a duplicate. If it's thin or outdated, expand it significantly.

**Files:**
- Modify or expand: `content/blog/best-sunday-roast-near-heathrow/index.md`

- [ ] **Step 1: Read the existing blog post**

Read `content/blog/best-sunday-roast-near-heathrow/index.md` to assess current state.

- [ ] **Step 2: Update/expand the post**

Ensure the post:
- Has "2026" in the title (freshness signal)
- Mentions The Anchor's sunday roast prominently with pricing (from £19.99)
- Links to `/sunday-lunch` with strong anchor text
- Includes a comparison table of venues (if not already present)
- Covers: booking requirements, parking, family-friendliness, vegetarian options
- Targets: "best sunday roast near heathrow", "sunday roast heathrow airport", "roast dinner near heathrow"
- Is at least 1,500 words

- [ ] **Step 3: Commit**

```bash
git add content/blog/best-sunday-roast-near-heathrow/
git commit -m "feat(seo): update Best Sunday Roast Near Heathrow blog post for 2026

Expanded content targeting 200+ monthly impressions for sunday roast queries.
Links to /sunday-lunch landing page for conversion."
```

---

### Task 12: Create Blog Post — "Where to Eat Near Heathrow Airport: A Local's Guide (2026)"

160+ monthly impressions for "restaurants near heathrow" cluster, currently position 18-24.

**Files:**
- Create: `content/blog/where-to-eat-near-heathrow-2026/index.md`
- Modify: `app/sitemap.ts` (if blog posts aren't auto-discovered)

- [ ] **Step 1: Check if a similar post exists**

Search `content/blog/` for "best-places-to-eat" or "where-to-eat" or "restaurants-near" posts. Read any matches. If one exists, expand it instead of creating a new one.

- [ ] **Step 2: Create the blog post**

Create `content/blog/where-to-eat-near-heathrow-2026/index.md` with:

Frontmatter:
```yaml
---
title: "Where to Eat Near Heathrow Airport: A Local's Guide (2026)"
slug: where-to-eat-near-heathrow-2026
date: 2026-04-07
description: "Looking for restaurants near Heathrow? A local's guide to the best pubs, restaurants and dining spots within 15 minutes of the airport. From pub classics to Sunday roasts."
tags: [food, heathrow, guide]
featured_image: /images/food/the-anchor-food-menu.jpg
---
```

Content should:
- Position The Anchor as the top recommendation with genuine reasons
- Cover 5-6 other nearby options for authenticity (avoid being purely self-promotional)
- Include a comparison table: distance from airport, parking, price range, cuisine type
- Link prominently to `/food-menu`, `/sunday-lunch`, `/book-table`
- Target: "restaurants near heathrow", "where to eat near heathrow airport", "places to eat near heathrow", "food near heathrow"
- Minimum 2,000 words

- [ ] **Step 3: Commit**

```bash
git add content/blog/where-to-eat-near-heathrow-2026/
git commit -m "feat(seo): create 'Where to Eat Near Heathrow' guide targeting restaurant queries

New blog post targeting 160+ monthly impressions for 'restaurants near heathrow'
cluster. Links to /food-menu and /book-table for conversion."
```

---

## Phase C: Private Hire

### Task 13: Expand Wakes Page Content

Currently ~1,200 words. 80+ monthly impressions for wake queries, position 14-55. Highest-value private hire opportunity.

**Files:**
- Modify: `app/private-hire/wakes/page.tsx`

- [ ] **Step 1: Read the full current page**

Read `app/private-hire/wakes/page.tsx` in its entirety.

- [ ] **Step 2: Add pricing indication section**

After the existing content, add a section that references the dynamic pricing without hardcoding values. Use the PrivateBookingSection component (already imported):

```tsx
<Section>
    <Container>
        <SectionHeader
            title="Wake Reception Packages"
            subtitle="Flexible catering for any gathering size"
        />
        <div className="prose prose-invert max-w-3xl mx-auto mb-8">
            <p>We offer a range of buffet and tea & coffee packages to suit your needs and budget. Use our calculator below to get an instant indication of costs for your gathering, or call us to discuss your requirements.</p>
            <p>All packages include use of our private dining room, dedicated staff, free parking, and setup/cleardown. We can also arrange flowers, photos, and order of service display.</p>
        </div>
    </Container>
</Section>
```

Ensure the `PrivateBookingSection` is rendered with `eventType="Wake / Memorial"`.

- [ ] **Step 3: Add detailed facilities section**

Add content covering:
- Private dining room capacity (20-60 guests)
- Accessibility for elderly guests (ground floor, nearby parking, accessible toilets)
- Timing flexibility (available any day, including same-week bookings)
- What's included (staff, setup, teardown, parking)
- Dietary accommodation for large mixed groups

- [ ] **Step 4: Expand FAQ to 8+ questions**

Add more FAQs targeting high-intent queries:

```tsx
{ question: "How quickly can you arrange a wake?", answer: "We understand that funeral arrangements often happen at short notice. We can accommodate wake bookings within 24-48 hours. Call us on 01753 682707 to discuss." },
{ question: "How much does a wake reception cost?", answer: "Our buffet packages start from a competitive per-head rate. Use our pricing calculator on this page for an instant estimate, or call us for a bespoke quote. There are no hidden charges — the price includes room hire, staff, and parking." },
{ question: "Can we bring our own flowers or photos?", answer: "Absolutely. Many families bring order of service cards, photos, and flower arrangements. We'll set up a display table and ensure everything is arranged respectfully before your guests arrive." },
{ question: "Is there parking for funeral cars?", answer: "Yes, we have 20 free parking spaces including space for funeral cars and larger vehicles. We're just 5 minutes from South West Middlesex Crematorium." },
{ question: "Do you cater for large groups?", answer: "Yes, we can accommodate up to 60 seated guests in our private dining room, or up to 100 standing across the venue. For larger gatherings, we can arrange a tailored setup." }
```

- [ ] **Step 5: Add BreadcrumbJsonLd if missing**

Check if BreadcrumbJsonLd is present. If not, add:

```tsx
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

<BreadcrumbJsonLd items={[
    { name: 'Home', url: '/' },
    { name: 'Private Hire', url: '/private-hire' },
    { name: 'Wakes', url: '/private-hire/wakes' }
]} />
```

- [ ] **Step 6: Verify build and commit**

```bash
npm run build
git add app/private-hire/wakes/page.tsx
git commit -m "feat(seo): expand wakes page with pricing section, facilities detail, and 5 new FAQs

Page expanded from ~1,200 to ~2,200 words. Added catering packages section,
accessibility detail, breadcrumb schema, and FAQs targeting cost/timing queries.
Targeting 80+ monthly impressions for wake venue queries."
```

---

### Task 14: Expand Christenings Page Content

**Files:**
- Modify: `app/private-hire/christenings/page.tsx`

- [ ] **Step 1: Read the full page**

- [ ] **Step 2: Add content sections**

Expand with:
- "Planning Your Christening Reception" section with step-by-step timeline
- Menu options detail (afternoon tea, buffet, Sunday roast booking)
- Photo opportunities (beer garden backdrop, garden setting)
- Children's entertainment and facilities
- Cross-links to `/private-hire/baby-showers` and `/private-hire/gender-reveal`

- [ ] **Step 3: Expand FAQ to 8+ questions**

Add questions about: cake policy, decoration rules, timing (post-morning service), high chairs/kids menu, accessibility for grandparents, photography, parking for guests travelling from church.

- [ ] **Step 4: Add BreadcrumbJsonLd if missing**

- [ ] **Step 5: Verify build and commit**

```bash
npm run build
git add app/private-hire/christenings/page.tsx
git commit -m "feat(seo): expand christenings page with planning guide, facilities, and FAQs"
```

---

### Task 15: Expand Baby Showers and Gender Reveal Pages

Both ~1,200 words. Same pattern as above.

**Files:**
- Modify: `app/private-hire/baby-showers/page.tsx`
- Modify: `app/private-hire/gender-reveal/page.tsx`

- [ ] **Step 1: Read both pages fully**

- [ ] **Step 2: Expand baby showers**

Add:
- Afternoon tea package details (reference pricing calculator)
- Mocktail menu highlights
- Games and activities section (expand from FAQ mention)
- Photo area/backdrop description
- Cross-links to `/private-hire/christenings` and `/private-hire/gender-reveal`
- BreadcrumbJsonLd if missing

- [ ] **Step 3: Expand gender reveal**

Add:
- Venue layout for reveal moment (garden vs indoor options)
- Weather contingency details
- Photo/video setup guidance
- "What we provide" vs "what to bring" checklist
- Cross-links to `/private-hire/baby-showers`
- BreadcrumbJsonLd if missing

- [ ] **Step 4: Verify build and commit**

```bash
npm run build
git add app/private-hire/baby-showers/page.tsx app/private-hire/gender-reveal/page.tsx
git commit -m "feat(seo): expand baby-showers and gender-reveal pages with detailed content"
```

---

### Task 16: Add Pricing Indicators to All Private Hire Sub-Pages

The user doesn't want hardcoded prices, but currently most sub-pages say nothing about cost. Add soft pricing language that references the calculator.

**Files:**
- Modify: `app/private-hire/milestone-birthdays/page.tsx`
- Modify: `app/private-hire/engagement-parties/page.tsx`
- Modify: `app/private-hire/retirement-parties/page.tsx`

- [ ] **Step 1: Read each page and identify where to add pricing context**

- [ ] **Step 2: Add pricing context to each page**

For each page, add a sentence near the PrivateBookingSection that says something like:

```tsx
<div className="text-center mb-6">
    <p className="text-anchor-text-secondary">Use our calculator below for an instant estimate — or call us for a bespoke quote.</p>
</div>
```

And in the FAQ, add a cost question for each:

```tsx
{ question: "How much does a [event type] at The Anchor cost?", answer: "It depends on your guest count, catering choices, and any extras like DJ or decorations. Use our pricing calculator on this page for an instant estimate, or call us on 01753 682707 for a personalised quote. There are no hidden charges." }
```

- [ ] **Step 3: Verify build and commit**

```bash
npm run build
git add app/private-hire/milestone-birthdays/page.tsx app/private-hire/engagement-parties/page.tsx app/private-hire/retirement-parties/page.tsx
git commit -m "feat(seo): add pricing context and cost FAQs to private hire sub-pages"
```

---

### Task 17: Create Blog Post — "Wake Venues Near Heathrow: What to Expect"

80+ combined monthly impressions for wake-related queries. High-intent, high-conversion.

**Files:**
- Create: `content/blog/wake-venues-near-heathrow/index.md`

- [ ] **Step 1: Check for existing wake blog post**

Read `content/blog/wake-venue-near-heathrow/index.md` if it exists (the blog audit found one post). If it exists, expand it instead.

- [ ] **Step 2: Create or expand the post**

Content should cover:
- What to expect when planning a wake (practical guide for bereaved families)
- Choosing a venue: pub vs hotel vs community hall (comparison table)
- The Anchor's wake facilities (with link to `/private-hire/wakes`)
- Catering options for wakes (buffet, afternoon tea, sit-down)
- Practical details: parking, timing, accessibility
- How to book at short notice
- Target: "wake venue near heathrow", "funeral reception venue", "where to hold a wake", "wake catering"
- Minimum 1,500 words
- Tone: respectful, practical, compassionate

- [ ] **Step 3: Commit**

```bash
git add content/blog/wake-venues-near-heathrow/
git commit -m "feat(seo): create/expand wake venues guide targeting funeral reception queries"
```

---

### Task 18: Create Blog Post — "Wedding Reception Venue Near Heathrow: The Anchor Guide"

100+ monthly impressions for wedding reception queries at position 4-17.

**Files:**
- Create: `content/blog/wedding-reception-venue-near-heathrow/index.md`

- [ ] **Step 1: Check for existing wedding content**

Search `content/blog/` for wedding-related posts.

- [ ] **Step 2: Create the post**

Frontmatter:
```yaml
---
title: "Wedding Reception Venue Near Heathrow & Staines: The Anchor Guide (2026)"
slug: wedding-reception-venue-near-heathrow
date: 2026-04-07
description: "Planning a wedding reception near Heathrow or Staines? The Anchor offers flexible spaces for 10-100 guests, custom catering, free parking, and a beautiful beer garden."
tags: [private-hire, weddings, guide]
featured_image: /images/private-hire/the-anchor-private-hire.jpg
---
```

Content should cover:
- Why couples choose pub wedding receptions (cost, atmosphere, flexibility)
- The Anchor's spaces and capacity
- Catering options (link to pricing calculator on `/private-hire/weddings`)
- Beer garden for photos and drinks receptions
- Nearby churches and registry offices
- Guest logistics (parking, hotels, transport from Heathrow)
- Target: "wedding reception venue heathrow", "pub wedding reception staines", "affordable wedding venue surrey"
- Minimum 2,000 words

- [ ] **Step 3: Commit**

```bash
git add content/blog/wedding-reception-venue-near-heathrow/
git commit -m "feat(seo): create wedding reception venue guide targeting wedding queries

New blog post targeting 100+ monthly impressions for wedding venue queries.
Links to /private-hire/weddings for conversion."
```

---

## Phase D: Events & Live Music

### Task 19: Enhance Live Music Page with "Live at The Anchor" Branding

A `/live-music` page already exists. It needs to be updated to lead with "Live at The Anchor" branding and expanded content.

**Files:**
- Modify: `app/live-music/page.tsx`

- [ ] **Step 1: Read the full current page**

Read `app/live-music/page.tsx` end to end.

- [ ] **Step 2: Update metadata for better keyword targeting**

```tsx
export const metadata: Metadata = {
    title: 'Live Music Near Heathrow | Live at The Anchor | Bands & Open Mic',
    description: 'Live at The Anchor — new bands, acoustic sessions & open mic nights monthly in Stanwell Moor near Heathrow. Free entry, free parking, 7 mins from T5. See upcoming gigs.',
```

- [ ] **Step 3: Update H1/PageTitle**

```tsx
<PageTitle as="h1" className="text-center mb-6" seo={{ structured: true, speakable: true }}>
    Live at The Anchor — Live Music Near Heathrow
</PageTitle>
```

- [ ] **Step 4: Add "Live at The Anchor" content section**

Add a section explaining the programme:

```tsx
<Section>
    <Container>
        <SectionHeader title="Live at The Anchor" subtitle="New bands, singer-songwriters & open mic nights — every month" />
        <div className="prose prose-invert max-w-3xl mx-auto">
            <p><strong>Live at The Anchor</strong> is our monthly live music programme showcasing local and touring musicians in an intimate pub setting. From acoustic singer-songwriters to full bands, every gig is free entry with a brilliant atmosphere.</p>
            <p>We also host regular open mic nights where anyone can sign up to perform — whether you're a seasoned musician or trying the stage for the first time.</p>
        </div>
    </Container>
</Section>
```

- [ ] **Step 5: Expand FAQ to target "live music near heathrow"**

Add FAQs:
```tsx
{ question: "Is there live music near Heathrow Airport?", answer: "Yes — Live at The Anchor hosts bands and open mic nights monthly, just 7 minutes from Heathrow Terminal 5. Free entry, free parking." },
{ question: "How can I perform at The Anchor?", answer: "Sign up for our open mic nights or contact us about performing as part of the Live at The Anchor programme. See our open mic page for details." },
{ question: "Do you charge for live music events?", answer: "No — all Live at The Anchor gigs are free entry. Just turn up, grab a drink, and enjoy the music." }
```

- [ ] **Step 6: Verify build and commit**

```bash
npm run build
git add app/live-music/page.tsx
git commit -m "feat(seo): rebrand live-music page as 'Live at The Anchor' with expanded content

Updated metadata, H1, and content to lead with 'Live at The Anchor' branding.
Added programme description and FAQs targeting 'live music near heathrow' (107 impressions)."
```

---

### Task 20: Expand Live Sport Page

196 impressions, zero clicks, position 11.3. Only 3 FAQs currently.

**Files:**
- Modify: `app/live-sport/page.tsx`

- [ ] **Step 1: Read the full page**

- [ ] **Step 2: Expand FAQ section from 3 to 8+ questions**

Add FAQs targeting sport-watcher intent:

```tsx
{ question: "Do you show Six Nations rugby?", answer: "Yes — every Six Nations match is shown live on our big screens with full audio. Book early for England and Wales matches as we fill up quickly." },
{ question: "Can I watch Formula 1 at The Anchor?", answer: "Yes, we show all F1 qualifying sessions and races live on our big screens." },
{ question: "Do you have Sky Sports or TNT?", answer: "No — we show terrestrial channels only (BBC, ITV, Channel 4). This covers Six Nations, F1, international football (Euros, World Cup), cricket, golf, and horse racing." },
{ question: "Can I request a specific match or event?", answer: "If it's on a terrestrial channel, yes. Let us know in advance and we'll make sure it's on with full audio." },
{ question: "Is there food available during live sport?", answer: "Yes — our full kitchen menu is available including stone-baked pizza, burgers, fish & chips, and pub classics. Book a table to guarantee your spot for big matches." }
```

- [ ] **Step 3: Add upcoming fixtures section header**

Add a section for specific sports seasons currently running. This can be static content updated seasonally:

```tsx
<Section>
    <Container>
        <SectionHeader title="What We're Showing" subtitle="Current sport seasons on our big screens" />
        {/* Content about current sporting calendar - update seasonally */}
    </Container>
</Section>
```

- [ ] **Step 4: Verify build and commit**

```bash
npm run build
git add app/live-sport/page.tsx
git commit -m "feat(seo): expand live-sport page with 5 new FAQs and seasonal content section

Page had zero clicks despite 196 impressions. Added sport-specific FAQs
and content section. H1 was added in Task 6."
```

---

### Task 21: Create Blog Post — "Live Music Pubs Near Heathrow: Where to Find Live Gigs"

107 monthly impressions for "live music pubs heathrow" with no dedicated content.

**Files:**
- Create: `content/blog/live-music-pubs-near-heathrow/index.md`

- [ ] **Step 1: Check for existing live music blog content**

Search `content/blog/` for live-music related posts.

- [ ] **Step 2: Create the post**

Frontmatter:
```yaml
---
title: "Live Music Pubs Near Heathrow: Where to Find Live Gigs (2026)"
slug: live-music-pubs-near-heathrow
date: 2026-04-07
description: "Looking for live music near Heathrow? From pub gigs to open mic nights, here's where to find live music within 15 minutes of the airport."
tags: [entertainment, live-music, heathrow, guide]
featured_image: /images/events/live-music/live-at-the-anchor.jpg
---
```

Content should:
- Position "Live at The Anchor" as the primary recommendation
- Cover 3-4 other nearby venues for authenticity
- Include what types of music each venue features
- Mention free entry, parking, and food availability
- Link prominently to `/live-music` and `/open-mic`
- Target: "live music pubs heathrow", "live music near heathrow airport", "pub gigs near me", "live bands heathrow"
- Minimum 1,500 words

- [ ] **Step 3: Commit**

```bash
git add content/blog/live-music-pubs-near-heathrow/
git commit -m "feat(seo): create live music pubs guide targeting 107 monthly impressions

New blog post for 'live music pubs heathrow' cluster.
Links to /live-music for conversion."
```

---

### Task 22: Update Sitemap for New Blog Posts

Ensure all new blog posts are discoverable.

**Files:**
- Check: `app/sitemap.ts`

- [ ] **Step 1: Verify blog auto-discovery**

Read `app/sitemap.ts` and check if blog posts are dynamically discovered from `content/blog/`. If they are (which the earlier audit suggests), no changes needed. If any manual entries are required, add them.

- [ ] **Step 2: Verify new posts appear**

Run: `npm run build` and check the generated sitemap output includes the new blog slugs.

- [ ] **Step 3: Commit if changes needed**

```bash
# Only if sitemap.ts needed changes
git add app/sitemap.ts
git commit -m "chore: add new blog posts to sitemap"
```

---

### Task 23: Final Verification

- [ ] **Step 1: Full build**

```bash
npm run build
```

Expected: Clean build, zero errors.

- [ ] **Step 2: Lint**

```bash
npm run lint
```

Expected: Zero warnings.

- [ ] **Step 3: Type check**

```bash
npx tsc --noEmit
```

Expected: Clean compilation.

- [ ] **Step 4: Run tests**

```bash
npm test
```

Expected: All existing tests pass.

- [ ] **Step 5: Spot-check key pages in dev**

```bash
npm run dev
```

Manually verify in browser:
- `/sunday-lunch` — H1 says "Sunday Roast", not "Sunday Lunch"
- `/private-hire/wakes` — H1 says "Wake Venue & Funeral Receptions Near Heathrow"
- `/whats-on` — Title in browser tab shows "What's On This Week"
- `/book-table` — New content sections visible below booking form
- `/live-music` — "Live at The Anchor" branding visible
- `/karaoke` — Breadcrumb schema in page source (view source, search for "BreadcrumbList")

- [ ] **Step 6: Final commit if any cleanup needed**

---

## Summary

| Phase | Tasks | Pages Modified | New Blog Posts | Key Metric Target |
|-------|-------|----------------|----------------|-------------------|
| A: Quick Wins | 1-6 | 12 pages | 0 | +15-25% impressions from H1 fixes |
| B: Food | 7-12 | 5 pages | 2 posts | Top 3 for "sunday roast heathrow" |
| C: Private Hire | 13-18 | 6 pages | 2 posts | Top 10 for "wake venue" queries |
| D: Events | 19-23 | 2 pages | 1 post | Capture "live music heathrow" (107 impressions) |
| **Total** | **23 tasks** | **25 pages** | **5 blog posts** | |

### Expected Impact (3-month horizon)
- **Food bookings:** +50-100% clicks from sunday roast rebrand + restaurant guide blog
- **Private hire:** +200-300% clicks from H1 fixes + content expansion (currently near-zero baseline)
- **Events:** +300-500% clicks on /whats-on from CTR improvement at position 3.4
- **Sitewide:** +30-50% organic clicks from H1 fixes alone (10+ pages corrected)
