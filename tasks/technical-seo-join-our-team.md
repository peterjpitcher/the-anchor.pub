# Technical SEO: Join Our Team Page

## Current Site Structure

**Navigation:** 5 top-level dropdowns: What's On, Menus, Drinks, Events & Hire, plus primary CTAs (Book a Table, Find Us). No "About Us" dropdown — the about/contact pages are standalone links (About at `/about`, Find Us at `/find-us`).

**Footer:** 8 sections: Quick Links, Private Events, Special Features, Travel & Services, Near Heathrow, Areas We Serve, Trust & Policies, Get in Touch.

**Sitemap:** Dynamic `app/sitemap.ts` with `staticRoutes` array, blog posts, events, tags, and private-hire landmark pages. Uses a `DATES` constant for `lastModified` grouping (`launch`, `seoOverhaul`, `apr2026`).

**Canonical pattern:** `metadataBase` in root layout set to `https://www.the-anchor.pub`. Individual pages use `alternates: { canonical: './' }` or explicit paths like `alternates: { canonical: '/about' }`.

**Robots:** `app/robots.ts` — allows `/` and `/_next/static/`, disallows `/api/`, `/subscribe`, `/leave-a-review`, and utility routes. No issue for the new page.

**Schema:** Global `DynamicSchema` component in `app/layout.tsx` renders LocalBusiness (type `["Restaurant", "BarOrPub"]`), Organization, and WebSite schemas. Per-page schemas use `<JsonLd>` component. Organization `@id` is `https://www.the-anchor.pub/#organization`.

---

## URL Recommendation

**Recommended:** `/join-our-team`

**Reasoning:**
- Matches the user-facing intent ("Join Our Team") and reads naturally in search results
- Consistent with the site's flat URL structure (most pages are single-segment: `/about`, `/find-us`, `/our-pub`)
- Keyword-rich enough for "pub jobs near Heathrow" type queries without being spammy
- Alternatives considered and rejected:
  - `/careers` — too corporate for a village pub
  - `/jobs` — too terse, lower SEO value
  - `/work-with-us` — acceptable but less common search term
  - `/pub-jobs-heathrow` — too keyword-stuffed, not user-friendly

---

## Schema Markup

Use Google's `JobPosting` structured data. Two separate `JobPosting` objects, one per role.

**IMPORTANT:** Salary data must NOT be fabricated. The schema below uses `TODO` placeholders. Confirm actual pay rates with the manager before publishing. Google requires `baseSalary` for full eligibility in the Jobs rich result, but the listings will still be valid without it.

```jsonc
// Bar Staff JobPosting
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "Bar Staff",
  "description": "Join our team at The Anchor in Stanwell Moor, a traditional village pub near Heathrow Airport. We are looking for experienced bar staff to serve drinks, provide excellent customer service, and help create a welcoming atmosphere for our guests. Duties include serving drinks, operating the till, maintaining bar cleanliness, and supporting events such as quiz nights and live music evenings.",
  "datePosted": "2026-05-11",
  "validThrough": "2026-08-11",  // TODO: set actual expiry or remove if open-ended
  "employmentType": ["FULL_TIME", "PART_TIME"],
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
  "jobLocationType": "TELECOMMUTE",  // REMOVE — this is on-site only. Do NOT include this property.
  "applicantLocationRequirements": {
    "@type": "Country",
    "name": "United Kingdom"
  },
  "experienceRequirements": {
    "@type": "OccupationalExperienceRequirements",
    "monthsOfExperience": 12
  },
  "qualifications": "Minimum 1 year bar experience. Must have the right to work in the UK.",
  "responsibilities": "Serving drinks, operating till systems, maintaining bar cleanliness, supporting pub events and entertainment nights.",
  "directApply": true
  // "baseSalary": {          // TODO: confirm with manager
  //   "@type": "MonetaryAmount",
  //   "currency": "GBP",
  //   "value": {
  //     "@type": "QuantitativeValue",
  //     "value": TODO,
  //     "unitText": "HOUR"
  //   }
  // }
}
```

```jsonc
// Kitchen Staff JobPosting
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "Kitchen Staff",
  "description": "Join the kitchen team at The Anchor in Stanwell Moor. We are looking for experienced kitchen staff to help prepare and serve our food menu, including our famous Sunday roasts. Duties include food preparation, cooking, maintaining kitchen hygiene standards, and working as part of the team during busy service periods.",
  "datePosted": "2026-05-11",
  "validThrough": "2026-08-11",  // TODO: set actual expiry or remove if open-ended
  "employmentType": ["FULL_TIME", "PART_TIME"],
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
  "applicantLocationRequirements": {
    "@type": "Country",
    "name": "United Kingdom"
  },
  "experienceRequirements": {
    "@type": "OccupationalExperienceRequirements",
    "monthsOfExperience": 12
  },
  "qualifications": "Minimum 1 year kitchen experience. Must have the right to work in the UK. Food hygiene certificate preferred.",
  "responsibilities": "Food preparation and cooking, maintaining 5-star food hygiene standards, working Sunday roast and weekday service, supporting kitchen cleanliness.",
  "directApply": true
  // "baseSalary": {          // TODO: confirm with manager
  //   "@type": "MonetaryAmount",
  //   "currency": "GBP",
  //   "value": {
  //     "@type": "QuantitativeValue",
  //     "value": TODO,
  //     "unitText": "HOUR"
  //   }
  // }
}
```

**Key schema notes:**
- `hiringOrganization` references the existing `@id` (`#business`) to link to the global LocalBusiness entity
- Do NOT include `jobLocationType: "TELECOMMUTE"` — these are on-site roles
- `directApply: true` because the form is on the page itself
- `validThrough` should be set to a real date (Google recommends max 1 year). If roles are open-ended, omit this property and update `datePosted` periodically
- Use the `<JsonLd>` component (already used on the about page) to render both schemas
- Both schemas go on the same page — Google supports multiple JobPosting objects per page

---

## Sitemap & Indexation

### Indexation
- **Indexable:** Yes — no `noindex` meta tag needed
- **Self-referencing canonical:** `alternates: { canonical: '/join-our-team' }`
- **Do NOT add to robots.txt disallow list**

### Sitemap Addition

Add to `staticRoutes` in `app/sitemap.ts`:

```typescript
// In the staticRoutes array, add under a new comment group:
// Careers
{ path: '/join-our-team', lastModified: new Date('2026-05-11') },
```

Use a literal date (the day the page goes live) rather than an existing `DATES` constant, since this is a one-off addition. Alternatively, add a new date group if more career-related pages are planned.

### Sitemap priority/changefreq
The sitemap.ts does not use `priority` or `changefreq` properties (consistent with Google's guidance that these are largely ignored). Do not add them.

---

## Navigation Integration

### Header Nav
- **Do NOT add to the main navigation dropdowns.** The top nav is reserved for customer-facing journeys (food, drinks, events, booking). A careers page is a secondary/utility page.
- Consider adding it to the footer only, like `/about`, `/accessibility`, and `/privacy-policy`.

### Footer
Add to the **"Quick Links"** section in `components/layout/Footer.tsx`, at the bottom of the existing items:

```typescript
{ label: 'Join Our Team', href: '/join-our-team' }
```

Also consider adding to the **"Trust & Policies"** section alongside Accessibility and Privacy Policy, as it is an informational/utility page.

### Internal Linking from Other Pages
- **About page** (`/about`): Add a "Join Our Team" link/CTA within the page content, e.g. in a "Meet the Team" or "Work With Us" section. This is the strongest contextual internal link.
- **Footer "Get in Touch"** section: Could add a text line "Looking for work? Join our team" below the contact details.
- No blog cross-link needed unless a specific "We're hiring" blog post is written.

---

## Form Technical Notes

### CV Upload
- **Accepted types:** `.pdf`, `.doc`, `.docx` only — no images, no executables
- **Max file size:** 5MB (standard for CV uploads, keeps Vercel serverless function within limits)
- **Input element:** `<input type="file" accept=".pdf,.doc,.docx" />`
- **Make CV optional** — offer a text area alternative ("Tell us about your experience") for candidates who don't have a CV ready

### Form Submission Architecture
The site has two established patterns for form submissions:
1. **Management API proxy** — used for table bookings (`app/api/table-bookings/route.ts`) and private hire enquiries (`app/api/public/private-booking/route.ts`). Proxies to `management.orangejelly.co.uk` with `ANCHOR_API_KEY`.
2. **Microsoft Graph email** — used for Christmas enquiries (`app/api/enquiry/christmas/route.ts`). Sends email via Microsoft Graph API, then optionally forwards to management API.

**Recommended approach for careers form:**
- Create `app/api/careers/route.ts` as a new API proxy route
- Use the Microsoft Graph email pattern: send the application as an email to `manager@the-anchor.pub`
- If CV is uploaded, encode as base64 attachment in the email (Microsoft Graph supports attachments up to 4MB inline, larger via upload session)
- Apply existing spam protection: import `checkSpamProtection` from `@/lib/spam-protection` (rate limiting + Turnstile + honeypot)
- Optionally forward structured data to the management API if/when it has a careers endpoint

### Spam Protection
Use the existing `lib/spam-protection.ts` module which provides:
- IP-based rate limiting (5 requests per 60 seconds)
- Cloudflare Turnstile verification
- Minimum form duration check (3 seconds)
- Phone country code allowlist

### Privacy / GDPR
- The existing privacy policy at `/privacy-policy` covers data collection for enquiries and bookings
- **Update required:** Add a paragraph to the privacy policy covering recruitment data: what is collected (name, email, phone, CV/experience), retention period, and purpose (recruitment only)
- Add a required checkbox on the form: "I consent to The Anchor processing my personal data for recruitment purposes. See our Privacy Policy."
- Link to the privacy policy from the consent checkbox
- **Data retention:** State that applications will be deleted after 6 months if unsuccessful (standard UK recruitment practice)
- CV files should NOT be stored permanently on the server — email delivery then discard

---

## Metadata Template

```typescript
export const metadata: Metadata = {
  title: 'Join Our Team | Bar & Kitchen Jobs',
  description: 'Join The Anchor in Stanwell Moor. We are hiring bar staff and kitchen staff. Apply online — experience required, full-time and part-time roles available near Heathrow.',
  alternates: { canonical: '/join-our-team' },
  openGraph: {
    title: 'Join Our Team | Jobs at The Anchor',
    description: 'Bar and kitchen roles available at The Anchor, Stanwell Moor. Apply online today.',
    url: '/join-our-team',
    siteName: 'The Anchor',
    locale: 'en_GB',
    type: 'website',
  },
}
```

---

## Checklist

### Page Setup
- [ ] Create `app/join-our-team/page.tsx` with metadata and self-referencing canonical
- [ ] Add route to `staticRoutes` in `app/sitemap.ts`
- [ ] Add `<JsonLd>` with both JobPosting schemas (confirm salary data first)
- [ ] Set `datePosted` to actual publish date
- [ ] Set `validThrough` to a reasonable expiry (or omit for open-ended)
- [ ] Confirm `hiringOrganization` references the existing `#business` entity

### Navigation
- [ ] Add "Join Our Team" link to Footer "Quick Links" section in `components/layout/Footer.tsx`
- [ ] Add contextual link from `/about` page
- [ ] Do NOT add to header nav (utility page, not primary customer journey)

### Form & API
- [ ] Create `app/api/careers/route.ts` using Microsoft Graph email pattern
- [ ] Implement file upload with `.pdf/.doc/.docx` restriction, 5MB max
- [ ] Apply `checkSpamProtection` (rate limiting + Turnstile)
- [ ] Add honeypot field
- [ ] Include GDPR consent checkbox with link to privacy policy

### Privacy
- [ ] Update privacy policy at `/privacy-policy` to cover recruitment data processing
- [ ] Define 6-month data retention policy for unsuccessful applications

### Schema
- [ ] Confirm salary/pay rates with manager before adding `baseSalary`
- [ ] Validate both JobPosting schemas with Google Rich Results Test after deploy
- [ ] Plan periodic review of `datePosted` if roles remain open long-term

### Content (requires SSOT check)
- [ ] Read `docs/SSOT.md` before writing any page copy
- [ ] Do not invent facts about the roles, benefits, or team
- [ ] Use "The Anchor" (not "The Anchor Pub") in customer-facing copy
