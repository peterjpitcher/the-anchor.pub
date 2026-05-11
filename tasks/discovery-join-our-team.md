# Discovery Report: Join Our Team Page (Final)

## Confirmed Decisions

| Decision | Answer |
|----------|--------|
| URL | `/join-our-team` |
| Navigation | Footer "Quick Links" only (no header) |
| Always live | Yes — page is permanently live to grow organic search |
| Pay rate | £12.21/hr + 12.07% holiday pay = £13.68/hr equivalent |
| Travel radius | Must live within ~20 minutes of TW19 6AQ |
| Students | Welcome, but must commit to minimum 12 months |
| Bar staff | Part-time, permanent, 4-16 hrs/week |
| Kitchen staff | Part-time, varying shifts, same pay rate |
| Food hygiene | Training provided (Level 2 certs included) |
| Schema salary | Include — £12.21/hr base, note holiday pay in description |

---

## Keyword Strategy (Validated with Google Keyword Planner Data)

### How keywords map to page elements

**Page title (most SEO weight):**
`Bar & Kitchen Jobs in Surrey | The Anchor Pub Near Heathrow`

Target keywords in title: `bar jobs surrey`, `kitchen jobs surrey`, `pub near heathrow`

**Meta description (click-through optimisation):**
`Bar staff and kitchen jobs at The Anchor, Stanwell Moor. Independent village pub 7 mins from Heathrow T5. £13.68/hr inc. holiday pay. Part-time, permanent roles. Apply online.`

Target keywords: `bar staff`, `kitchen jobs`, `Stanwell Moor`, `near Heathrow`, part-time

**H1:**
`Join Our Team at The Anchor`

**H2/H3 headings (secondary keyword targets):**
- H2: "Bar Staff Roles" — targets `bar staff jobs surrey`, `bar work surrey`, `bartender jobs surrey`
- H2: "Kitchen Team Roles" — targets `kitchen jobs surrey`, `chef jobs staines`, `catering jobs staines`
- H2: "Why Work at The Anchor" — targets `pub jobs surrey`, `hospitality jobs staines`
- H2: "Location & Getting Here" — targets `jobs near heathrow airport`, `bar jobs heathrow`

**Body text (semantic coverage — weave naturally, do not keyword-stuff):**
These terms should appear in the page copy where they fit naturally:

| Keyword | 50/mo | Where to use |
|---------|-------|-------------|
| jobs near heathrow airport | 500 | Location section — "just 7 minutes from Heathrow Airport" |
| bar jobs heathrow | 50 | Bar staff role description |
| bar jobs surrey | 50 | Page title |
| bar staff jobs surrey | 50 | Bar staff heading area |
| bar work surrey | 50 | Body text variant |
| bartender jobs surrey | 50 | Body text variant |
| kitchen jobs surrey | 50 | Page title |
| pub jobs surrey | 50 | Intro paragraph |
| hospitality jobs staines | 50 | Location section — mention Staines proximity |
| chef jobs staines | 50 | Kitchen role description |
| restaurant jobs staines | 50 | Body text — "pub and restaurant" |
| catering jobs staines | 50 | Body text variant |
| front of house jobs surrey | 50 | Bar staff description — "front of house" |
| hospitality jobs egham | 50 | Location section — mention Egham/Royal Holloway |
| bar jobs windsor | 50 | Location section — mention Windsor proximity |
| bar staff jobs windsor | 50 | Covered by location mentions |
| hospitality jobs windsor | 50 | Covered by location mentions |
| hospitality jobs hounslow | 50 | Location section |
| hospitality jobs slough | 50 | Location section |
| hospitality jobs surrey | 50 | Intro or about section |
| bar jobs west london | 50 | Location section — "west London" |
| kitchen jobs west london | 50 | Covered by location mentions |
| part time bar work surrey | 50 | Role details — "part-time" |
| pub jobs slough | 50 | Location section |
| pub jobs uxbridge | 50 | Location section |
| bar staff jobs hounslow | 50 | Location section |

**Location & travel section (geographic keyword cluster):**
This section naturally targets the nearby-area keywords by listing transport/commute info:

> The Anchor is in Stanwell Moor, Surrey, just 7 minutes from Heathrow Terminal 5 and 2 minutes from Junction 14 of the M25. We're easily accessible from Staines-upon-Thames, Ashford, Feltham, Hounslow, Slough, Colnbrook, Egham, Windsor, and west London. Bus routes 441, 442, and 555 run from Heathrow Central Bus Station. Free staff parking available.

This single paragraph covers: Stanwell Moor, Heathrow, Staines, Ashford, Feltham, Hounslow, Slough, Colnbrook, Egham, Windsor, west London — hitting nearly every geographic keyword variant.

### Keywords to NOT target (avoid wasting effort)

| Keyword | Reason |
|---------|--------|
| hospitality work surrey | Competition index 86 (HIGH) — only high-competition term |
| waiting staff jobs surrey | Declining -100% both 3-month and YoY |
| bar staff jobs heathrow | 0 volume, declining -100% YoY |
| pub jobs middlesex | 0 volume |
| All Stanwell Moor specifics | Zero measurable volume — include for Google for Jobs but don't optimise around them |

### Total addressable volume

~800-1,000 monthly searches across all relevant terms (accounting for overlap). Realistic organic click-through to the page: 10-30 visits/month from search, plus 50-100 Google for Jobs impressions/month.

The page's primary value is as a professional destination for job board referrals, social recruiting, walk-in follow-ups, and Google for Jobs visibility — not as a high-volume traffic driver. For a pub needing 1-3 hires, this is more than sufficient.

---

## Final Page Structure

### Metadata

```typescript
export const metadata: Metadata = {
  title: 'Bar & Kitchen Jobs in Surrey | The Anchor Pub Near Heathrow',
  description: 'Bar staff and kitchen jobs at The Anchor, Stanwell Moor. Independent village pub 7 mins from Heathrow T5. £13.68/hr inc. holiday pay. Part-time, permanent roles. Apply online.',
  alternates: { canonical: '/join-our-team' },
  openGraph: {
    title: 'Join Our Team | Jobs at The Anchor Pub',
    description: 'Bar and kitchen roles available at The Anchor, Stanwell Moor. Part-time, permanent. Apply online.',
    url: '/join-our-team',
    siteName: 'The Anchor',
    locale: 'en_GB',
    type: 'website',
  },
}
```

### Content Sections

```
H1: Join Our Team at The Anchor

H2: Why Work Here (~150 words)
  - Independent village pub, not a corporate chain
  - Beer garden under the Heathrow flight path
  - Friendly local community in Stanwell Moor
  - Free staff parking
  - Training included (Level 2 Food Hygiene, H&S, COSHH, Licensing)
  - Potential for additional hours and cross-training
  - Events variety (quiz nights, live music, karaoke, bingo)

H2: Bar Staff
  - Pay: £12.21/hr + 12.07% holiday pay (£13.68/hr equivalent)
  - Hours: 4-16 hours/week, part-time, permanent
  - Shifts: Friday 4pm-12am, Saturday 12pm-6pm or 6pm-12am, Sunday 12pm-5pm
    Occasional weekday shifts. Weekend availability required on rota (not every weekend).
    Shifts are 4-8 hours, confirmed up to 2 months ahead.
  - Requirements: Min 1yr pub/bar experience, confident serving solo
  - Duties: Draught/wine/spirits/mixed drinks, cash/card payments, bar cleanliness,
    stock rotation, cellar tasks, simple food service, occasional event support
  - Training: Level 2 certs in Food Hygiene, H&S, COSHH, Licensing
  - Growth: Additional hours after ~6 months, optional kitchen cross-training

H2: Kitchen Team
  - Pay: £12.21/hr + 12.07% holiday pay (£13.68/hr equivalent)
  - Hours: Part-time, varying shifts
  - Requirements: Min 1yr commercial kitchen experience
  - Duties: Pub classics, Sunday roasts, event menus
  - Training: Level 2 certs provided

H2: What We Are Looking For
  - Minimum 1 year relevant experience (non-negotiable)
  - Right to work in the UK
  - Commitment to at least 12 months (not temporary or short-term)
  - Students welcome if available for 12+ months
  - Reliability, punctuality, passion for hospitality
  - Ability to work weekends and evenings
  - Must live within ~20 minutes of TW19 6AQ
  - Reliable transport including after midnight finishes

H2: Who This Is NOT For
  - Looking for temporary or short-term work
  - Not able to reliably travel to/from TW19 6AQ (especially late finishes)
  - Not confident working independently during quieter periods

H2: Apply Now
  - Name (required)
  - Email (required)
  - Phone (required)
  - Which role? (dropdown: Bar Staff / Kitchen Team / Either)
  - Tell us about your experience (textarea, required)
  - CV upload (optional, PDF/DOC/DOCX, 5MB max)
  - GDPR consent checkbox

H2: Location & Getting Here
  - Horton Road, Stanwell Moor, Surrey, TW19 6AQ
  - 7 mins from Heathrow T5, 2 mins from M25 J14
  - Easy reach from Staines, Ashford, Feltham, Hounslow, Slough,
    Colnbrook, Egham, Windsor, and west London
  - Bus routes 441, 442, 555 from Heathrow Central
  - Free staff parking
  - Links to /find-us
```

### Pay Example (include on page)

> **Example:** If you work 10 hours a week, you would earn £136.80 per week (£12.21 base + £1.47 holiday pay per hour). That is £592 per month or £7,114 per year.

### Internal Linking

**Links TO the careers page:**
- Footer "Quick Links" in `components/layout/Footer.tsx`
- /about page: "We're hiring" line with link
- /our-pub page: mention the team

**Links FROM the careers page:**
- /about — learn more about The Anchor
- /find-us — how to get here (transport/parking detail)
- /food-menu — what kitchen staff will cook
- /drinks — what bar staff will serve
- /beer-garden — the working environment
- /whats-on — event variety
- /sunday-roast — key kitchen output

---

## Schema Markup

Two `JobPosting` JSON-LD objects. Now includes confirmed salary data.

### Bar Staff

```json
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "Bar Staff",
  "description": "Experienced bar staff wanted at The Anchor, an independent village pub in Stanwell Moor near Heathrow Airport. Part-time, permanent role, 4-16 hours per week. Pay is £12.21 per hour plus 12.07% holiday pay (equivalent to £13.68 per hour). Minimum 1 year pub or bar experience required. Duties include serving draught, wine, spirits and mixed drinks, taking payments, maintaining bar cleanliness, stock rotation, and supporting food service and events. Full training provided including Level 2 certificates in Food Hygiene, Health and Safety, COSHH, and Licensing. Free staff parking. Must live within 20 minutes of TW19 6AQ with reliable transport for late finishes.",
  "datePosted": "2026-05-11",
  "validThrough": "2026-08-11",
  "employmentType": "PART_TIME",
  "workHours": "4-16 hours per week, evenings and weekends on a rota basis",
  "hiringOrganization": {
    "@type": "Restaurant",
    "@id": "https://www.the-anchor.pub/#business",
    "name": "The Anchor",
    "sameAs": "https://www.the-anchor.pub",
    "logo": "https://www.the-anchor.pub/images/the-anchor-pub-logo-black-transparent.png"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Horton Road",
      "addressLocality": "Stanwell Moor",
      "addressRegion": "Surrey",
      "postalCode": "TW19 6AQ",
      "addressCountry": "GB"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 51.462509,
      "longitude": -0.502067
    }
  },
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "GBP",
    "value": {
      "@type": "QuantitativeValue",
      "value": 12.21,
      "unitText": "HOUR"
    }
  },
  "experienceRequirements": {
    "@type": "OccupationalExperienceRequirements",
    "monthsOfExperience": 12
  },
  "qualifications": "Minimum 1 year pub or bar experience. Must have the right to work in the UK. Must live within 20 minutes of TW19 6AQ with reliable transport for late finishes.",
  "responsibilities": "Serving draught, wine, spirits and mixed drinks. Taking cash and card payments. Maintaining a clean and welcoming bar area. Stock rotation and basic cellar tasks. Supporting food service and occasional events.",
  "directApply": true,
  "applicantLocationRequirements": {
    "@type": "Country",
    "name": "United Kingdom"
  }
}
```

### Kitchen Team

```json
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "Kitchen Staff",
  "description": "Experienced kitchen team member wanted at The Anchor, an independent village pub in Stanwell Moor near Heathrow Airport. Part-time role with varying shifts. Pay is £12.21 per hour plus 12.07% holiday pay (equivalent to £13.68 per hour). Minimum 1 year commercial kitchen experience required. You will prepare pub classics, Sunday roasts, and event menus. Full training provided including Level 2 certificates in Food Hygiene, Health and Safety, COSHH, and Licensing. Free staff parking. Must live within 20 minutes of TW19 6AQ.",
  "datePosted": "2026-05-11",
  "validThrough": "2026-08-11",
  "employmentType": "PART_TIME",
  "hiringOrganization": {
    "@type": "Restaurant",
    "@id": "https://www.the-anchor.pub/#business",
    "name": "The Anchor",
    "sameAs": "https://www.the-anchor.pub",
    "logo": "https://www.the-anchor.pub/images/the-anchor-pub-logo-black-transparent.png"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Horton Road",
      "addressLocality": "Stanwell Moor",
      "addressRegion": "Surrey",
      "postalCode": "TW19 6AQ",
      "addressCountry": "GB"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 51.462509,
      "longitude": -0.502067
    }
  },
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "GBP",
    "value": {
      "@type": "QuantitativeValue",
      "value": 12.21,
      "unitText": "HOUR"
    }
  },
  "experienceRequirements": {
    "@type": "OccupationalExperienceRequirements",
    "monthsOfExperience": 12
  },
  "qualifications": "Minimum 1 year commercial kitchen experience. Must have the right to work in the UK. Must live within 20 minutes of TW19 6AQ.",
  "responsibilities": "Food preparation and cooking. Preparing pub classics, Sunday roasts, and event menus. Maintaining kitchen hygiene standards. Working as part of the kitchen team during busy service periods.",
  "directApply": true,
  "applicantLocationRequirements": {
    "@type": "Country",
    "name": "United Kingdom"
  }
}
```

### Schema maintenance

- Update `validThrough` every 3 months (Google penalises stale listings)
- Update `datePosted` when the listing is refreshed
- Validate with Google Rich Results Test after deploy
- Consider using Google's Indexing API for near-immediate indexing

---

## Technical Implementation Plan

### Files to create/modify

| File | Action | Purpose |
|------|--------|---------|
| `app/join-our-team/page.tsx` | Create | Page component + metadata |
| `app/api/careers/route.ts` | Create | Form submission API (Microsoft Graph email) |
| `components/layout/Footer.tsx` | Edit | Add "Join Our Team" link to Quick Links |
| `app/sitemap.ts` | Edit | Add `/join-our-team` to staticRoutes |
| `app/about/page.tsx` | Edit | Add "We're hiring" line with link |
| `app/privacy-policy/page.tsx` | Edit | Add recruitment data section |

### Form submission

Use the Microsoft Graph email pattern (same as `app/api/enquiry/christmas/route.ts`):
- Send application as email to manager@the-anchor.pub
- CV as base64 email attachment (Graph supports up to 4MB inline)
- Apply `checkSpamProtection` (rate limiting + Turnstile + honeypot)

### Spam protection

Existing `lib/spam-protection.ts`:
- IP-based rate limiting (5 requests per 60 seconds)
- Cloudflare Turnstile verification
- Minimum form duration check (3 seconds)
- Phone country code allowlist

### Privacy / GDPR

Update `/privacy-policy` with:
- What is collected: name, email, phone, CV/experience text
- Purpose: recruitment only
- Retention: 6 months for unsuccessful applications
- CV files: emailed then discarded (no permanent server storage)
- Required consent checkbox on form

---

## Complexity Score: 3 (Medium)

| Factor | Assessment |
|--------|-----------|
| Files touched | 6 (new page, API route, footer, sitemap, about page, privacy policy) |
| External integrations | 1 (Microsoft Graph — already in use) |
| Schema changes | None (no database) |
| Breaking changes | None |

Single PR, follows established patterns throughout.
