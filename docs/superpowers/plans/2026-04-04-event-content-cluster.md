# Event Content Cluster — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 15-article content cluster targeting private event keywords, with scheduled publishing support to drip-feed one post per day.

**Architecture:** Three workstreams: (1) code change to enable scheduled publishing via ISR + `publishDate` filtering, (2) extract SSOT to markdown for editorial consumption, (3) produce 15 blog posts through the editorial-team pipeline with staggered publish dates. All blog posts are markdown files in `content/blog/`.

**Tech Stack:** Next.js 14 App Router, TypeScript, Markdown blog content, editorial-team skill for content production

**Key References:**
- SSOT: `/SSOT.json` (verified brand facts — non-negotiable constraints for all content)
- Editorial-team skill: `/Users/peterpitcher/Cursor/.claude/skills/editorial-team/SKILL.md`
- Blog system: `lib/markdown.ts` (`getAllBlogPosts()`, `getBlogPost()`)
- Blog index: `app/blog/page.tsx`
- Blog detail: `app/blog/[slug]/page.tsx`
- Blog content: `content/blog/{slug}/index.md`
- Existing frontmatter fields: title, slug, description, date, author, keywords, tags, featured, hero, images, imageAlts, heroAlt, ogImage, ogImageAlt, noindex, oldUrl

**Keyword Data Source:** Google Keyword Planner export 2026-04-04 (validated search volumes)

---

## Workstream 1: Scheduled Publishing

### Task 1: Add publishDate Filtering to Blog System

The blog system currently shows all posts immediately. We need to filter by a `publishDate` frontmatter field so future-dated posts are hidden until their publish date.

**Files:**
- Modify: `lib/markdown.ts`
- Modify: `app/blog/page.tsx`
- Modify: `app/blog/[slug]/page.tsx`
- Modify: `app/blog/tag/[tag]/page.tsx`

- [ ] **Step 1: Read the current blog system files**

Read `lib/markdown.ts`, `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, and `app/blog/tag/[tag]/page.tsx` to understand the current implementation.

- [ ] **Step 2: Add publishDate to BlogPost interface**

In `lib/markdown.ts`, add `publishDate` as an optional field to the `BlogPost` interface (or equivalent type). This field is a date string in ISO format (e.g., `2026-04-10`).

```typescript
// Add to the interface:
publishDate?: string  // Optional: when to make the post publicly visible. If omitted, post is visible immediately.
```

- [ ] **Step 3: Add date filtering to getAllBlogPosts()**

In `lib/markdown.ts`, modify `getAllBlogPosts()` to filter out posts where `publishDate` is in the future. The filter should:

```typescript
const now = new Date()
// After fetching and parsing all posts, add this filter:
.filter(post => {
  // If publishDate is set and is in the future, hide the post
  if (post.publishDate) {
    return new Date(post.publishDate) <= now
  }
  // If no publishDate, show immediately (backwards compatible)
  return true
})
```

This must be applied BEFORE the sort, so future posts are excluded from listings, pagination counts, tag pages, and the sitemap.

- [ ] **Step 4: Add ISR revalidation to blog index page**

In `app/blog/page.tsx`, add (or update if it exists):

```typescript
export const revalidate = 3600  // Revalidate every hour
```

This means the blog listing page regenerates every hour. A post scheduled for today will appear within an hour of its publish date.

- [ ] **Step 5: Add ISR revalidation to blog detail page**

In `app/blog/[slug]/page.tsx`, add:

```typescript
export const revalidate = 3600
```

Also, in the page component or `generateMetadata`, add a check: if the post has a future `publishDate`, return a 404 via `notFound()` from `next/navigation`. This prevents direct URL access to unpublished posts:

```typescript
import { notFound } from 'next/navigation'

// Inside the page function, after fetching the post:
if (post.publishDate && new Date(post.publishDate) > new Date()) {
  notFound()
}
```

- [ ] **Step 6: Add ISR revalidation to tag pages**

In `app/blog/tag/[tag]/page.tsx`, add:

```typescript
export const revalidate = 3600
```

The tag pages call `getAllBlogPosts()` which now filters by publishDate, so they'll automatically exclude future posts.

- [ ] **Step 7: Update sitemap to respect publishDate**

In `app/sitemap.ts`, verify that the blog section uses `getAllBlogPosts()` to generate URLs. If it does, future posts will automatically be excluded (since we added the filter in Step 3). If it uses a different function to fetch blog slugs, apply the same publishDate filter there.

- [ ] **Step 8: Verify with a test**

Create a temporary test post with a future publishDate to verify it's hidden:

```bash
mkdir -p content/blog/test-scheduled-post
```

Create `content/blog/test-scheduled-post/index.md`:
```yaml
---
title: "Test Scheduled Post"
slug: test-scheduled-post
date: 2026-04-04
publishDate: 2099-01-01
description: "This post should not appear in listings."
author: "Test"
tags: [test]
---

This is a test post that should not be visible.
```

Run `npm run build` and verify:
- The post does NOT appear in the blog listing
- Navigating to `/blog/test-scheduled-post` returns a 404

Then delete the test post.

- [ ] **Step 9: Verify build and commit**

```bash
rm -rf content/blog/test-scheduled-post
npm run build
git add lib/markdown.ts app/blog/page.tsx app/blog/[slug]/page.tsx app/blog/tag/[tag]/page.tsx app/sitemap.ts
git commit -m "feat: add publishDate support for scheduled blog post publishing

Posts with a future publishDate are hidden from listings, tag pages,
sitemap, and return 404 on direct access. Blog pages use ISR (1 hour
revalidation) so scheduled posts appear within an hour of their date.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Workstream 2: SSOT Markdown Extraction

### Task 2: Create SSOT Markdown for Editorial Consumption

The editorial-team skill consumes SSOT documents as governing constraints. The SSOT exists as `/SSOT.json` but the skill works best with a readable markdown summary focused on content-relevant facts.

**Files:**
- Create: `docs/ssot-editorial.md`

- [ ] **Step 1: Read the full SSOT.json**

Read `/SSOT.json` completely, focusing on sections relevant to content production: identity, contact, location, heathrow_proximity, brand_guidelines, venue, beer_garden, food, sunday_roast, events, private_hire, do_not_use.

- [ ] **Step 2: Create the editorial SSOT markdown**

Create `docs/ssot-editorial.md` — a flat, readable markdown file containing ONLY verified facts that content writers need. Structure it as:

```markdown
# The Anchor — Editorial Source of Truth

This document contains verified facts about The Anchor. All content must use ONLY these facts. Do not invent, embellish, or assume anything not stated here.

## Identity
- Name: The Anchor (never "The Anchor Pub" in customer-facing copy)
- Type: Independent British village pub and restaurant
- Location: Horton Road, Stanwell Moor, Surrey, TW19 6AQ
- Founded: 1751
- Motto: Eat, Drink, Enjoy
- Tagline: Where Everyone's Welcome
- Pub group: Greene King Tenants network

## Voice & Tone
- Friendly, cheeky, inclusive
- Use "we" language
- British English

## Contact
- Phone: 01753 682707
- Email: manager@the-anchor.pub
- WhatsApp: wa.me/441753682707

## Location & Access
[Extract from SSOT: terminal times, M25 junction, bus routes, ULEZ, etc.]

## Venue
[Extract: capacity, spaces, parking, amenities, what they DON'T have]

## Private Hire
[Extract: capacity 10-50, dining room 26 seated, minimum spend model,
catering packages with exact prices, event types, AV equipment, etc.]

## Food & Drink
[Extract: kitchen hours, menu categories, Sunday roast details, pricing]

## Events
[Extract: quiz night, cash bingo, music bingo, live music details]

## Do Not Use / Do Not Claim
[Extract the full do_not_use section — critical for avoiding false claims]
```

Include every factual detail from the SSOT that a content writer might need. Err on the side of including too much rather than too little.

- [ ] **Step 3: Commit**

```bash
git add docs/ssot-editorial.md
git commit -m "docs: create editorial SSOT markdown from SSOT.json

Readable markdown version of verified brand facts for the editorial-team
content production pipeline. All blog posts reference this as governing
constraints — claims not in this document should not appear in content.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Workstream 3: Blog Post Production

### Content Production Rules

Every blog post in this workstream MUST be produced using the **editorial-team skill** (`/Users/peterpitcher/Cursor/.claude/skills/editorial-team/SKILL.md`). This means running the full 12-stage pipeline:

1. Strategic intent
2. Research and insight
3. Content architecture
4. Drafting (with E-E-A-T signals)
5. Fact-check and verification (against SSOT)
6. Editorial QA
7. AI humanisation
8. SEO optimisation
9. GEO optimisation
10. Final polish
11. Publish to codebase
12. Post-publish QA

**SSOT constraint:** Provide `docs/ssot-editorial.md` as the SSOT document. Any factual claim about The Anchor that is not in the SSOT must be flagged, not invented.

**CTA requirement:** Every post must include at least one strong call-to-action linking to the relevant private hire landing page or the booking calculator. CTAs should be woven into the content naturally, not just bolted on at the end.

**Publish dates:** Posts are staggered one per day starting from 2026-04-08. Each post's frontmatter includes a `publishDate` field.

**Frontmatter template:**
```yaml
---
title: "[Title — under 60 chars for SEO]"
slug: [slug]
date: 2026-04-04
publishDate: [staggered date]
description: "[150-160 chars meta description]"
author: "The Anchor"
keywords: [array of target keywords from data]
tags: [relevant tags]
---
```

**Internal linking:** Every post should include 2-4 internal links to relevant pages:
- `/private-hire` — main private hire hub
- `/private-hire/[type]` — specific event type page
- `/function-room-hire` — function room page
- `/book-table` — table booking
- `/food-menu` — menu page
- Other relevant blog posts in the cluster

---

### Task 3: Pillar Post — Private Party Venues Near Heathrow

**Target keywords:** private party venue near me (500/month), party venue near me (5,000/month), pub venue hire near me (500/month), pub with private room near me (500/month), celebration venue near heathrow
**publishDate:** 2026-04-08

**Create:** `content/blog/private-party-venues-near-heathrow/index.md`

**Content brief:**
- The definitive guide to hosting a private party near Heathrow
- Cover what The Anchor offers: dining room (26 seated), beer garden, full venue hire
- SSOT-verified: capacity 10-50 guests, minimum spend model (£500-1,500), no room hire charge
- Cover event types: birthdays, leaving dos, baby showers, christenings, retirement, gender reveals, work celebrations
- Comparison section: pub vs hotel vs restaurant for private events
- Practical: free parking (20 spaces), outside ULEZ, 7 mins from T5
- Link to each specific private hire sub-page
- This is the hub post — all other articles link back to this one
- **CTA:** Link to `/private-hire` calculator and phone number

**Minimum 2,000 words. Use editorial-team pipeline.**

- [ ] Step 1: Produce content using editorial-team skill with SSOT constraints
- [ ] Step 2: Verify factual claims against `docs/ssot-editorial.md`
- [ ] Step 3: Commit

---

### Task 4: 30th Birthday Party Ideas & Venues

**Target keywords:** 30th birthday party ideas (5,000/month, +900% trend), 30th birthday party venue (500/month), 30th birthday venue (500/month)
**publishDate:** 2026-04-09

**Create:** `content/blog/30th-birthday-party-ideas-venues/index.md`

**Content brief:**
- Ideas-first content (captures the 5,000/month informational query)
- Party theme ideas, activity ideas, food & drink ideas
- Transition naturally from ideas to "where to host it"
- Position The Anchor as ideal venue: private dining room, beer garden, buffet packages from £9.95/head
- SSOT-verified details only: capacity, pricing, facilities
- Address the "near me" intent — mention Heathrow, Staines, Stanwell Moor, Surrey
- **CTA:** "Get an instant quote" linking to `/private-hire/milestone-birthdays` calculator

**Minimum 2,000 words. Use editorial-team pipeline.**

- [ ] Step 1: Produce content using editorial-team skill with SSOT constraints
- [ ] Step 2: Verify factual claims against `docs/ssot-editorial.md`
- [ ] Step 3: Commit

---

### Task 5: 40th Birthday Party Ideas & Venues

**Target keywords:** 40th birthday party ideas (5,000/month, +900% trend), 40th birthday party venue (50/month)
**publishDate:** 2026-04-10

**Create:** `content/blog/40th-birthday-party-ideas-venues/index.md`

**Content brief:**
- Same structure as 30th but tailored to 40th milestone
- More sophisticated party ideas (wine tasting theme, cocktail evening, garden party)
- Emphasis on private, intimate celebrations vs big nightclub parties
- Position The Anchor: "grown-up celebration without the formality of a hotel"
- SSOT-verified pricing and facilities
- **CTA:** Link to `/private-hire/milestone-birthdays`

**Minimum 1,800 words. Use editorial-team pipeline.**

- [ ] Step 1: Produce content using editorial-team skill with SSOT constraints
- [ ] Step 2: Verify factual claims against `docs/ssot-editorial.md`
- [ ] Step 3: Commit

---

### Task 6: 50th Birthday Party Ideas & Venues

**Target keywords:** 50th birthday party ideas (5,000/month), 50th birthday party venue (500/month, +900% trend), 50th birthday (5,000/month)
**publishDate:** 2026-04-11

**Create:** `content/blog/50th-birthday-party-ideas-venues/index.md`

**Content brief:**
- Highest combined volume opportunity (5,000 ideas + 500 venue, both strong trends)
- Ideas for 50th: afternoon celebration, evening party, surprise party, combined with Sunday lunch
- Practical planning: how far ahead to book, guest numbers, dietary needs for mixed-age groups
- Position The Anchor: accessibility (step-free), free parking for older guests, intimate setting
- SSOT-verified: no accessible toilet (be honest), step-free bar/dining/garden/car park
- **CTA:** Link to `/private-hire/milestone-birthdays`

**Minimum 2,000 words. Use editorial-team pipeline.**

- [ ] Step 1: Produce content using editorial-team skill with SSOT constraints
- [ ] Step 2: Verify factual claims against `docs/ssot-editorial.md`
- [ ] Step 3: Commit

---

### Task 7: 60th Birthday Party Ideas & Venues

**Target keywords:** 60th birthday party ideas (500/month), 60th birthday party venue (50/month)
**publishDate:** 2026-04-12

**Create:** `content/blog/60th-birthday-party-ideas-venues/index.md`

**Content brief:**
- Emphasis on relaxed, dignified celebrations
- Afternoon tea option, Sunday lunch booking, evening buffet
- Strong accessibility focus (step-free access, nearby parking)
- Family-friendly: grandchildren welcome (until 8pm per licensing)
- SSOT-verified facilities and limitations
- **CTA:** Link to `/private-hire/milestone-birthdays`

**Minimum 1,500 words. Use editorial-team pipeline.**

- [ ] Step 1: Produce content using editorial-team skill with SSOT constraints
- [ ] Step 2: Verify factual claims against `docs/ssot-editorial.md`
- [ ] Step 3: Commit

---

### Task 8: Gender Reveal Party Ideas & Venues

**Target keywords:** gender reveal party ideas (500/month), gender reveal venue near me (500/month, +900% trend, LOW competition), gender reveal party venue (50/month)
**publishDate:** 2026-04-13

**Create:** `content/blog/gender-reveal-party-ideas-venues/index.md`

**Content brief:**
- Best opportunity in the dataset: 500/month venue term with +900% trend and LOW competition
- Ideas: smoke cannons (beer garden), balloon pop, cake reveal, confetti
- Position The Anchor's beer garden as ideal reveal venue (outdoor space, photo backdrop, under the flight path)
- SSOT-verified: beer garden details, what The Anchor provides vs bring your own
- Weather contingency (indoor options)
- **CTA:** Link to `/private-hire/gender-reveal`

**Minimum 1,800 words. Use editorial-team pipeline.**

- [ ] Step 1: Produce content using editorial-team skill with SSOT constraints
- [ ] Step 2: Verify factual claims against `docs/ssot-editorial.md`
- [ ] Step 3: Commit

---

### Task 9: Christening Party Ideas & Venues

**Target keywords:** christening party ideas (500/month, +900% trend), christening venue near me (50/month), christening reception venue (50/month), baptism reception venue (50/month), naming ceremony venue (50/month)
**publishDate:** 2026-04-14

**Create:** `content/blog/christening-party-ideas-venues/index.md`

**Content brief:**
- Captures the exploding "christening party ideas" term (+900%)
- Ideas: decorations, games, photo displays, cake, party favours
- Also cover naming ceremonies (non-religious alternative, 50/month)
- Position The Anchor: family-friendly (high chairs, baby changing, kids menu £8, enclosed garden)
- Nearby churches from SSOT/local-seo-data
- SSOT-verified: children welcome until 8pm, family facilities
- **CTA:** Link to `/private-hire/christenings`

**Minimum 1,800 words. Use editorial-team pipeline.**

- [ ] Step 1: Produce content using editorial-team skill with SSOT constraints
- [ ] Step 2: Verify factual claims against `docs/ssot-editorial.md`
- [ ] Step 3: Commit

---

### Task 10: Leaving Party Ideas Your Colleagues Will Love

**Target keywords:** leaving party ideas (500/month), leaving do ideas for work (50/month), leaving do venue, leaving party venue
**publishDate:** 2026-04-15

**Create:** `content/blog/leaving-party-ideas/index.md`

**Content brief:**
- Ideas-first: speeches, gifts, photo slideshows, pub quiz theme, funny awards
- Both daytime (long lunch) and evening options
- Position The Anchor: AV equipment (projector/screen for slideshows), buffet from £9.95/head, bar tab option
- Corporate-friendly: VAT receipts, corporate card payments
- SSOT-verified: AV equipment, catering packages, free parking
- **CTA:** Link to `/private-hire/retirement-parties` (covers leaving dos too)

**Minimum 1,800 words. Use editorial-team pipeline.**

- [ ] Step 1: Produce content using editorial-team skill with SSOT constraints
- [ ] Step 2: Verify factual claims against `docs/ssot-editorial.md`
- [ ] Step 3: Commit

---

### Task 11: Retirement Party Ideas & Celebration Venues

**Target keywords:** retirement party ideas (500/month), retirement party venue (50/month), retirement celebration venue (50/month)
**publishDate:** 2026-04-16

**Create:** `content/blog/retirement-party-ideas-venues/index.md`

**Content brief:**
- Ideas: speeches, memory books, themed decades party, afternoon celebration
- Daytime vs evening options (retirees may prefer daytime)
- Position The Anchor: accessible (step-free), free parking close to entrance, intimate setting
- AV for slideshow/presentation, dedicated events coordinator
- SSOT-verified pricing and facilities
- **CTA:** Link to `/private-hire/retirement-parties`

**Minimum 1,500 words. Use editorial-team pipeline.**

- [ ] Step 1: Produce content using editorial-team skill with SSOT constraints
- [ ] Step 2: Verify factual claims against `docs/ssot-editorial.md`
- [ ] Step 3: Commit

---

### Task 12: How to Plan a Surprise Birthday Party

**Target keywords:** how to plan a surprise birthday party (50/month), surprise birthday party venue (50/month), surprise birthday party ideas (50/month)
**publishDate:** 2026-04-17

**Create:** `content/blog/how-to-plan-surprise-birthday-party/index.md`

**Content brief:**
- Step-by-step planning guide (how-to format for featured snippets)
- Steps: choose a date, pick a venue, manage the guest list secretly, plan the reveal moment, food & drink, decorations
- Position The Anchor: "we coordinate with you to keep the surprise" — dedicated events coordinator, private entrance, can set up before guest of honour arrives
- SSOT-verified: events coordinator, private dining room, capacity
- **CTA:** Link to `/private-hire/milestone-birthdays` and phone number for coordination

**Minimum 1,500 words. Use editorial-team pipeline.**

- [ ] Step 1: Produce content using editorial-team skill with SSOT constraints
- [ ] Step 2: Verify factual claims against `docs/ssot-editorial.md`
- [ ] Step 3: Commit

---

### Task 13: Function Room Hire Near Heathrow & Staines

**Target keywords:** function room hire near me (5,000/month, LOW competition), function room hire staines (50/month), pub with function room surrey (50/month), venue hire staines (50/month), venue hire near heathrow (50/month)
**publishDate:** 2026-04-18

**Create:** `content/blog/function-room-hire-near-heathrow-staines/index.md`

**Content brief:**
- Second biggest opportunity: "function room hire near me" is 5,000/month with LOW competition
- Comprehensive guide to function room options in the Heathrow/Staines area
- Position The Anchor prominently: dining room (26 seated, standing room), beer garden, no room hire charge (minimum spend model)
- Cover what's included: AV, WiFi, dedicated coordinator, parking
- Pricing transparency: minimum spend £500-1,500 depending on day/size
- Compare pub function rooms vs hotel conference rooms vs community halls
- **CTA:** Link to `/function-room-hire` and calculator

**Minimum 2,000 words. Use editorial-team pipeline.**

- [ ] Step 1: Produce content using editorial-team skill with SSOT constraints
- [ ] Step 2: Verify factual claims against `docs/ssot-editorial.md`
- [ ] Step 3: Commit

---

### Task 14: Pub with Private Room Near Heathrow

**Target keywords:** pub with private room near me (500/month, LOW competition), private party venue near me (500/month), private hire pub near heathrow, private room hire near heathrow
**publishDate:** 2026-04-19

**Create:** `content/blog/pub-with-private-room-near-heathrow/index.md`

**Content brief:**
- Targets the high-volume, low-competition "pub with private room near me" query
- What to look for in a pub private room: capacity, AV, catering, parking, accessibility
- Position The Anchor: intimate dining room, French doors to beer garden, no room hire charge
- Cover what events work best in a private pub room
- Practical: how to book, what to expect, pricing guide
- **CTA:** Link to `/private-hire` and phone number

**Minimum 1,500 words. Use editorial-team pipeline.**

- [ ] Step 1: Produce content using editorial-team skill with SSOT constraints
- [ ] Step 2: Verify factual claims against `docs/ssot-editorial.md`
- [ ] Step 3: Commit

---

### Task 15: How to Plan a Christening Reception

**Target keywords:** how to plan a christening reception (variant of "how to plan a christening" 50/month, £10 CPC = very high intent), christening reception venue (50/month)
**publishDate:** 2026-04-20

**Create:** `content/blog/how-to-plan-christening-reception/index.md`

**Content brief:**
- Highest CPC keyword in the dataset (£2.10-£10.02) — extremely high commercial intent
- Step-by-step planning guide (how-to format)
- Steps: choose a date, coordinate with church/venue, guest list, catering, cake, decorations, photography
- Timing: when to book (2-4 weeks ahead), coordination with morning service
- Position The Anchor: close to local churches, family-friendly, buffet and afternoon tea options
- SSOT-verified: family facilities (high chairs, baby changing, buggy space, kids menu £8)
- **CTA:** Link to `/private-hire/christenings`

**Minimum 1,500 words. Use editorial-team pipeline.**

- [ ] Step 1: Produce content using editorial-team skill with SSOT constraints
- [ ] Step 2: Verify factual claims against `docs/ssot-editorial.md`
- [ ] Step 3: Commit

---

### Task 16: How Much Does Private Room Hire Cost?

**Target keywords:** how much does private room hire cost (no reported volume but high-intent informational), private room hire cost, function room hire cost
**publishDate:** 2026-04-21

**Create:** `content/blog/private-room-hire-cost-near-heathrow/index.md`

**Content brief:**
- Pricing transparency post — captures cost queries and builds trust
- Explain the minimum spend model vs room hire charge model
- The Anchor's approach: SSOT-verified £500-1,500 minimum spend, no separate room hire charge
- Breakdown: what goes into the cost (catering from £9.95/head, drinks packages, AV included)
- Comparison: pub private room vs hotel conference room costs
- When is a pub private room better value? (smaller groups, casual celebrations, budget-conscious)
- **CTA:** "Get an instant estimate" linking to `/private-hire` calculator

**Minimum 1,500 words. Use editorial-team pipeline.**

- [ ] Step 1: Produce content using editorial-team skill with SSOT constraints
- [ ] Step 2: Verify factual claims against `docs/ssot-editorial.md`
- [ ] Step 3: Commit

---

### Task 17: Pub vs Hotel — Where to Host Your Celebration

**Target keywords:** pub vs hotel for private events (no reported volume but decision-stage content), celebration venue (50/month), party venue surrey (50/month)
**publishDate:** 2026-04-22

**Create:** `content/blog/pub-vs-hotel-celebration-venue/index.md`

**Content brief:**
- Comparison/decision content — captures people weighing their options
- Structured comparison: atmosphere, cost, flexibility, parking, food quality, formality, minimum spend
- When a pub wins: casual celebrations, budget-friendly, character, dog-friendly, free parking
- When a hotel wins: large conferences, overnight stays, formal occasions
- Position The Anchor as the best of both: quality food, private room, professional service, but with pub warmth
- SSOT-verified details for The Anchor, general hotel observations for comparison
- **CTA:** Link to `/private-hire` and `/function-room-hire`

**Minimum 1,500 words. Use editorial-team pipeline.**

- [ ] Step 1: Produce content using editorial-team skill with SSOT constraints
- [ ] Step 2: Verify factual claims against `docs/ssot-editorial.md`
- [ ] Step 3: Commit

---

## Task 18: Final Build Verification

- [ ] **Step 1: Full build**

```bash
npm run build
```

Expected: Clean build with all new blog posts generated. Future-dated posts should NOT appear in the blog listing.

- [ ] **Step 2: Lint**

```bash
npm run lint:next
```

Expected: No new warnings.

- [ ] **Step 3: Verify scheduled publishing works**

Check that posts with future `publishDate` values don't appear on `/blog` page and return 404 on direct access.

- [ ] **Step 4: Verify post with past/current publishDate IS visible**

Check that at least one post with a `publishDate` of today or earlier appears correctly.

---

## Summary

| Workstream | Tasks | Deliverables |
|-----------|-------|-------------|
| 1: Scheduled Publishing | Task 1 | Code change to `lib/markdown.ts` + ISR on blog pages |
| 2: SSOT Extraction | Task 2 | `docs/ssot-editorial.md` |
| 3: Blog Production | Tasks 3-17 | 15 blog posts with staggered publishDates |
| 4: Verification | Task 18 | Build + lint + publish date verification |

### Publish Schedule

| Date | Post | Primary Keyword | Monthly Volume |
|------|------|----------------|----------------|
| Apr 8 | Private Party Venues Near Heathrow (pillar) | private party venue near me | 500 |
| Apr 9 | 30th Birthday Party Ideas & Venues | 30th birthday party ideas | 5,000 |
| Apr 10 | 40th Birthday Party Ideas & Venues | 40th birthday party ideas | 5,000 |
| Apr 11 | 50th Birthday Party Ideas & Venues | 50th birthday party ideas | 5,000 |
| Apr 12 | 60th Birthday Party Ideas & Venues | 60th birthday party ideas | 500 |
| Apr 13 | Gender Reveal Party Ideas & Venues | gender reveal venue near me | 500 |
| Apr 14 | Christening Party Ideas & Venues | christening party ideas | 500 |
| Apr 15 | Leaving Party Ideas | leaving party ideas | 500 |
| Apr 16 | Retirement Party Ideas | retirement party ideas | 500 |
| Apr 17 | How to Plan a Surprise Birthday Party | surprise birthday party | 50+50 |
| Apr 18 | Function Room Hire Near Heathrow | function room hire near me | 5,000 |
| Apr 19 | Pub with Private Room Near Heathrow | pub with private room near me | 500 |
| Apr 20 | How to Plan a Christening Reception | how to plan a christening | 50 (£10 CPC) |
| Apr 21 | Private Room Hire Cost Guide | private room hire cost | High intent |
| Apr 22 | Pub vs Hotel for Celebrations | celebration venue | 50 |

### Total Addressable Search Volume

| Tier | Keywords | Combined Monthly Volume |
|------|----------|----------------------|
| Tier 1 (5,000/month primaries) | 30th/40th/50th ideas, function room hire near me, party venue near me | 25,000+ |
| Tier 2 (500/month primaries) | 60th ideas, gender reveal, christening, leaving, retirement, pub private room, private party venue | 5,000+ |
| Tier 3 (50-100/month primaries) | Surprise birthday, christening planning, pricing, comparison | 300+ |
| **Total addressable** | | **30,000+/month** |
