# SPEC: Join Our Team Recruitment Pages

## Review Status

Reviewed and updated on 2026-05-11 against the current codebase and current external requirements:

- Google Search Central JobPosting structured data guidance
- GOV.UK National Minimum Wage and National Living Wage rates from April 2026
- GOV.UK holiday pay guidance for irregular-hours and part-year workers
- Microsoft Graph `sendMail` and attachment limits

Key corrections from the draft:

- The current National Living Wage for workers aged 21 and over is **£12.71/hr from 1 April 2026**, not £12.21/hr.
- A 12.07% rolled-up holiday pay equivalent is only safe to publish if these are legally treated as irregular-hours or part-year roles and the contract uses rolled-up holiday pay.
- Simple Microsoft Graph file attachments stay under 3 MB. CVs up to **20 MB** use a Graph upload session (create draft message, upload attachment, then send).
- Google JobPosting schema should live on a single-job leaf page, not on a multi-role listing page.
- Existing recruitment redirects currently point to `/` or the old blog post and should be updated to the new recruitment page.

---

## Goal

Create an always-live recruitment hub at `/join-our-team` where candidates can learn about working at The Anchor and apply online.

For Google for Jobs, create one detail page per active role:

- `/join-our-team/bar-staff`
- `/join-our-team/kitchen-team`

The hub stays live as an employer-brand and application page. JobPosting JSON-LD is rendered only on active single-role pages and must be removed or expired when a role is no longer open.

## Success Criteria

- [ ] `/join-our-team` is live with correct metadata, canonical, content, and application form.
- [ ] `/join-our-team/bar-staff` and `/join-our-team/kitchen-team` render one active role each.
- [ ] Each active role page has one matching JobPosting JSON-LD object and passes Google Rich Results Test after deploy.
- [ ] Application form emails submissions to `manager@the-anchor.pub` through Microsoft Graph.
- [ ] Optional CV attachment supports `.pdf`, `.doc`, and `.docx`, up to 20 MB, sent via Graph upload session.
- [ ] Form uses the existing spam protection flow: honeypot, `_t`, rate limiting, phone checks, and Turnstile.
- [ ] Footer Quick Links include "Join Our Team".
- [ ] Existing `/join-the-team` and old pub-jobs recruitment URLs redirect to `/join-our-team`.
- [ ] Privacy policy covers recruitment data and CV handling.
- [ ] XML sitemap and human sitemap include the hub and active role pages.
- [ ] Existing stale pub-jobs blog post is removed from indexation or redirected.
- [ ] Relevant tests cover API validation, attachment handling, spam payload conversion, and form validation.
- [ ] `npm run build`, `npm run lint`, `npm run test`, and `npx tsc --noEmit` pass.

## Complexity: 4 (Medium-High)

This is still a small feature, but the correct version touches routing, structured data, email attachments, privacy copy, redirects, sitemap output, analytics, and tests.

Estimated touched files:

- `lib/careers.ts`
- `lib/microsoft-graph-mail.ts`
- `app/join-our-team/page.tsx`
- `app/join-our-team/[role]/page.tsx`
- `components/features/CareersForm.tsx`
- `app/api/careers/route.ts`
- `app/api/careers/route.test.ts`
- `components/features/__tests__/CareersForm.test.tsx`
- `components/layout/Footer.tsx`
- `app/sitemap.ts`
- `app/sitemap-page/page.tsx`
- `app/privacy-policy/page.tsx`
- `app/about/page.tsx`
- `app/our-pub/page.tsx` or existing about-style contextual page, optional but recommended
- `config/redirects/additional-redirects.json`
- `config/redirects/wix-redirects.json`
- `config/redirects/blog-redirects.json`
- Optional: `content/blog/pub-jobs-heathrow/index.md` if not redirecting it

---

## Confirmed Repo Facts

- Next.js App Router pages live in `app/`.
- `/about` exists at `app/about/page.tsx`; `/our-pub` also exists and is a strong contextual link source.
- Footer Quick Links are defined in `components/layout/Footer.tsx`.
- XML sitemap routes are listed in `app/sitemap.ts`.
- The human sitemap is `app/sitemap-page/page.tsx`.
- Microsoft Graph email code exists in `app/api/enquiry/christmas/route.ts`.
- Spam protection is centralised in `lib/spam-protection.ts`.
- Turnstile UI exists at `components/security/TurnstileField.tsx`.
- `JsonLd` exists at `components/JsonLd.tsx`.
- Global LocalBusiness schema uses `@id: "https://www.the-anchor.pub/#business"`.
- Correct logo path for schema is `https://www.the-anchor.pub/images/branding/the-anchor-pub-logo-black-transparent.png`.
- There is an old recruitment blog post at `content/blog/pub-jobs-heathrow/index.md` with stale Sunday Runner content.
- Existing redirect sources include `/join-the-team`, `/post/pub-jobs-near-heathrow`, `/post/bar-staff-wanted`, and old pub-jobs blog URLs.

---

## Pay And Legal Copy Rules

The previous draft used £12.21/hr, which was the April 2025 to March 2026 rate. As of 2026-05-11, the current UK National Living Wage for workers aged 21 and over is £12.71/hr.

Before implementation, confirm the actual pay policy with the manager:

1. Does The Anchor pay **£12.71/hr base** for these roles, or a higher rate?
2. Is the same rate paid to 18-20 applicants, or is pay age-banded?
3. Are these roles contracted as irregular-hours or part-year roles where rolled-up holiday pay is used?
4. If yes, is the published equivalent **£14.24/hr including 12.07% holiday pay** approved for recruitment copy?

Use this safe default until confirmed:

- Page copy: "Pay from £12.71/hr, plus holiday entitlement."
- Schema `baseSalary`: only include the actual base hourly rate that is visible on the role page.
- Do not publish "£14.24/hr including holiday pay" unless rolled-up holiday pay is confirmed.

If rolled-up holiday pay is confirmed, use:

- Base hourly pay: £12.71
- Holiday pay uplift: 12.07%, £1.53/hr
- Equivalent hourly rate: £14.24/hr
- 10 hour/week example: £142.40/week, about £617/month, about £7,405/year

---

## Content Rules

- Read `docs/SSOT.md` before writing customer-facing copy.
- Use "The Anchor" in body copy. Use "The Anchor Pub" only where SEO value warrants it, such as a meta title or schema name field.
- British English throughout.
- No em dashes in customer-facing text.
- Do not invent benefits, team size, tips, free meals, staff discounts, or progression claims.
- Do not imply the role is open if it is not actually open.
- Do not publish JobPosting schema for speculative CV collection only.
- Do not use discriminatory language. Prefer "You need reliable transport for late finishes" over "must live within 20 minutes".
- Do not mention services The Anchor does not offer.

---

## Task 1: Create Shared Careers Data

Create `lib/careers.ts`.

Purpose: keep role copy, salary, schema, and form options in one place so visible content and structured data cannot drift.

Recommended shape:

```typescript
export type CareerRoleSlug = 'bar-staff' | 'kitchen-team'

export type CareerRole = {
  slug: CareerRoleSlug
  active: boolean
  title: string
  schemaTitle: string
  roleOptionLabel: string
  metaTitle: string
  metaDescription: string
  summary: string
  pay: {
    baseHourly: number
    holidayPayRolledUp: boolean
    rolledUpEquivalentHourly?: number
    publicCopy: string
  }
  hours: string
  workHoursSchema: string
  requirements: string[]
  responsibilities: string[]
  training: string[]
  schemaDescriptionHtml: string
  validThrough: string
}
```

Constants:

```typescript
export const CAREERS_POSTED_DATE = '2026-05-11'
export const CAREERS_VALID_THROUGH = '2026-08-11'
export const CAREERS_CV_MAX_BYTES = 20 * 1024 * 1024
export const CAREERS_FORM_ROLES = ['bar-staff', 'kitchen-team', 'either'] as const
```

Helpers:

- `getActiveCareerRoles()`
- `getCareerRole(slug)`
- `buildJobPostingSchema(role)`
- `formatCareerPay(role)`

Schema helper rules:

- Include `baseSalary` only if the actual base pay is confirmed and visible on the page.
- Use `unitText: "HOUR"`.
- Use `employmentType: "PART_TIME"`.
- Do not include `jobLocationType` for on-site roles.
- Do not include `applicantLocationRequirements` unless a remote role is ever added.
- Use a stable `identifier` value per role, for example `the-anchor-bar-staff-2026-05-11`.
- Use `datePosted` and `validThrough` constants. Do not generate them dynamically on each request.

---

## Task 2: Create Careers Hub Page

Create `app/join-our-team/page.tsx`.

Server Component. The form is a client component.

Metadata:

```typescript
export const metadata: Metadata = {
  title: 'Bar & Kitchen Jobs in Surrey | The Anchor Pub Near Heathrow',
  description: 'Bar staff and kitchen jobs at The Anchor, Stanwell Moor. Independent village pub 7 mins from Heathrow T5. Part-time roles, free parking. Apply online.',
  alternates: { canonical: '/join-our-team' },
  openGraph: {
    title: 'Join Our Team | Jobs at The Anchor',
    description: 'Bar and kitchen roles at The Anchor, Stanwell Moor. Part-time pub jobs near Heathrow. Apply online.',
    url: '/join-our-team',
    siteName: 'The Anchor',
    locale: 'en_GB',
    type: 'website',
  },
}
```

If holiday-pay wording is confirmed, the meta description can include:

`Pay from £14.24/hr including rolled-up holiday pay.`

Page structure:

1. Hero
   - H1: "Join Our Team at The Anchor"
   - Intro: independent village pub in Stanwell Moor, near Heathrow.
   - CTA links: "Apply Now" to `#apply`, and "See Current Roles" to `#roles`.

2. Why Work Here
   - Independent village pub, not a corporate chain.
   - Beer garden under the Heathrow flight path.
   - Friendly local community in Stanwell Moor.
   - Free staff parking.
   - Training included where required, using only confirmed training facts from SSOT.
   - Events variety: quiz nights, live music, karaoke, bingo.

3. Current Roles
   - Role cards for active roles only.
   - Each card links to the single-role page.
   - Include visible pay copy matching schema assumptions.

4. What We Are Looking For
   - Minimum 1 year relevant experience.
   - Right to work in the UK.
   - Reliability and punctuality.
   - Ability to work weekends and evenings.
   - Reliable transport to and from TW19 6AQ, including late finishes.
   - Students welcome only if available for at least 12 months.

5. This May Not Suit You If
   - You need temporary or short-term work.
   - You cannot reliably get to or from TW19 6AQ.
   - You are not confident working independently during quieter periods.

6. Apply Now
   - Render `<CareersForm />`.

7. Location & Getting Here
   - Horton Road, Stanwell Moor, Surrey, TW19 6AQ.
   - 7 minutes from Heathrow T5, 2 minutes from M25 J14.
   - Accessible from Staines, Ashford, Feltham, Hounslow, Slough, Colnbrook, Egham, Windsor, and west London.
   - Bus routes 441, 442, 555 from Heathrow Central Bus Station.
   - Free staff parking.
   - Link to `/find-us`.

Internal links from the hub:

- `/about`
- `/our-pub`
- `/find-us`
- `/food-menu`
- `/drinks`
- `/beer-garden`
- `/whats-on`
- `/sunday-lunch`

Do not render JobPosting schema on the hub page.

---

## Task 3: Create Single-Role Pages

Create `app/join-our-team/[role]/page.tsx`.

Use `generateStaticParams()` from active roles:

```typescript
export function generateStaticParams() {
  return getActiveCareerRoles().map((role) => ({ role: role.slug }))
}
```

Use `generateMetadata()` per role:

- Bar canonical: `/join-our-team/bar-staff`
- Kitchen canonical: `/join-our-team/kitchen-team`

Role page structure:

1. Hero with one job title.
2. Role overview.
3. Pay and hours.
4. Responsibilities.
5. Requirements.
6. Training and working environment.
7. Application form with `defaultRole={role.slug}`.
8. Location and transport.

Schema:

- Render exactly one JobPosting JSON-LD object with `<JsonLd data={buildJobPostingSchema(role)} />`.
- Every schema value must be visible on the same page.
- The role page must be the most detailed page for that job.
- Do not mark up the hub as a list of jobs.

Required JobPosting fields:

- `@context`
- `@type`
- `title`
- `description`
- `datePosted`
- `hiringOrganization`
- `jobLocation`

Recommended fields to include:

- `identifier`
- `validThrough`
- `employmentType`
- `baseSalary`, only if actual pay is confirmed and visible
- `workHours`
- `directApply`
- `experienceRequirements`
- `qualifications`
- `responsibilities`

Example schema structure:

```typescript
{
  '@context': 'https://schema.org',
  '@type': 'JobPosting',
  title: role.schemaTitle,
  description: role.schemaDescriptionHtml,
  identifier: {
    '@type': 'PropertyValue',
    name: 'The Anchor',
    value: `the-anchor-${role.slug}-2026-05-11`,
  },
  datePosted: CAREERS_POSTED_DATE,
  validThrough: role.validThrough,
  employmentType: 'PART_TIME',
  hiringOrganization: {
    '@type': 'Restaurant',
    '@id': 'https://www.the-anchor.pub/#business',
    name: 'The Anchor',
    sameAs: 'https://www.the-anchor.pub',
    logo: 'https://www.the-anchor.pub/images/branding/the-anchor-pub-logo-black-transparent.png',
  },
  jobLocation: {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Horton Road',
      addressLocality: 'Stanwell Moor',
      addressRegion: 'Surrey',
      postalCode: 'TW19 6AQ',
      addressCountry: 'GB',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 51.462509,
      longitude: -0.502067,
    },
  },
  workHours: role.workHoursSchema,
  directApply: true,
  experienceRequirements: {
    '@type': 'OccupationalExperienceRequirements',
    monthsOfExperience: 12,
  },
  qualifications: role.requirements.join(' '),
  responsibilities: role.responsibilities.join(' '),
}
```

Add `baseSalary` only when confirmed:

```typescript
baseSalary: {
  '@type': 'MonetaryAmount',
  currency: 'GBP',
  value: {
    '@type': 'QuantitativeValue',
    value: 12.71,
    unitText: 'HOUR',
  },
}
```

Do not include:

- `jobLocationType: "TELECOMMUTE"`
- `jobLocationType: "TELECOMMUTE_NOT_AVAILABLE"`
- Salary values that are not visible on the page
- Expired roles

---

## Task 4: Create Careers Form

Create `components/features/CareersForm.tsx`.

Client Component.

Props:

```typescript
type CareersFormProps = {
  defaultRole?: 'bar-staff' | 'kitchen-team' | 'either'
}
```

Fields:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| Name | text input | Yes | Non-empty |
| Email | email input | Yes | Valid email format |
| Phone | tel input | Yes | Non-empty |
| Role interest | select | Yes | Bar Staff / Kitchen Team / Either |
| Experience | textarea | Yes | Min 20 chars |
| CV upload | file input | No | `.pdf`, `.doc`, `.docx`, max 20 MB |
| GDPR consent | checkbox | Yes | Must be checked |
| Turnstile token | hidden/token | Yes in production | From `TurnstileField` |
| `_t` | hidden/derived | Yes | Seconds since form load |
| Honeypot | hidden text input `website` | No | Must be empty |

Behaviour:

- Disable submit while in flight.
- Show loading state on submit button.
- Client-side validate file type and size before submitting.
- On success, show a success message and reset the form.
- On error, show an accessible inline error banner.
- Reset Turnstile after every submit attempt.
- Track `trackFormStart` once when the user first edits the form.
- Track `trackFormComplete` after a successful response.
- Do not send name, email, phone, CV filename, or experience text to analytics.

Submission:

- `POST /api/careers`
- Use `FormData`, not JSON.
- Include `turnstile_token`, `_t`, and `website`.

GDPR checkbox label:

`I consent to The Anchor processing my personal data for recruitment purposes. See our Privacy Policy.`

Link "Privacy Policy" to `/privacy-policy`.

Styling:

- Use existing UI primitives from `components/ui/forms` and `components/ui/primitives/Button`.
- Use design tokens and existing card/form patterns.
- No hardcoded hex colours.
- Keep the file input accessible with visible help text for allowed types and size.

---

## Task 5: Create Microsoft Graph Mail Helper

Create `lib/microsoft-graph-mail.ts`.

This avoids duplicating the Christmas enquiry Graph token and send logic.

Exports:

```typescript
export type GraphMailAttachment = {
  name: string
  contentType: string
  contentBytes: string
  size: number
}

export async function getMicrosoftGraphToken(): Promise<string>

export async function sendMicrosoftGraphEmail(options: {
  to: string
  fromUser: string
  subject: string
  htmlContent: string
  textContent?: string
  replyTo?: string
  attachments?: GraphMailAttachment[]
}): Promise<void>
```

### Attachment handling — two paths by size

The helper must support attachments up to 20 MB. Microsoft Graph has two attachment mechanisms:

**Small attachments (under 3 MB):** Use inline `@odata.type: "#microsoft.graph.fileAttachment"` in the `sendMail` payload. This is the simple path.

**Large attachments (3 MB and above, up to 20 MB):** Use a Graph upload session:

1. **Create a draft message** — `POST /v1.0/users/{fromUser}/messages` with the email body, recipients, and `saveToSentItems: true`. Returns `{ id: draftId }`.
2. **Create an upload session** — `POST /v1.0/users/{fromUser}/messages/{draftId}/attachments/createUploadSession` with `AttachmentItem` metadata (`attachmentType: "file"`, `name`, `size`, `contentType`). Returns `{ uploadUrl }`.
3. **Upload the file** — `PUT {uploadUrl}` with the raw bytes in the body and `Content-Range: bytes 0-{size-1}/{size}` header. For files under 20 MB, upload in a single PUT (no chunking needed).
4. **Send the draft** — `POST /v1.0/users/{fromUser}/messages/{draftId}/send`.

The helper decides which path to use based on `attachment.size`:

```typescript
const GRAPH_SIMPLE_ATTACHMENT_LIMIT = 3 * 1024 * 1024

if (totalAttachmentBytes < GRAPH_SIMPLE_ATTACHMENT_LIMIT) {
  // Use simple sendMail with inline attachments
} else {
  // Use draft → upload session → send flow
}
```

Graph payload rules:

- Simple path endpoint: `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(fromUser)}/sendMail`
- Draft path endpoints: `/messages`, `/messages/{id}/attachments/createUploadSession`, `/messages/{id}/send`
- Include `saveToSentItems: true`.
- Return success only when Graph returns a 2xx response on the final send.
- Clean up: if the upload session or send fails, attempt to delete the draft message to avoid orphaned drafts.

After creating the helper, either:

- migrate `app/api/enquiry/christmas/route.ts` to use it, or
- leave Christmas route unchanged and use the helper only for careers.

Preferred: migrate Christmas route if the diff stays small, because it reduces future drift.

---

## Task 6: Create Careers API Route

Create `app/api/careers/route.ts`.

Use Node runtime:

```typescript
export const runtime = 'nodejs'
```

Request flow:

1. Parse `await request.formData()`.
2. Extract text fields into a plain object.
3. Convert `_t` to a number before calling `checkSpamProtection`.
4. Call `checkSpamProtection(request, bodyRecord)` without `skipTurnstile`.
5. Validate required fields.
6. Validate role against the allowlist.
7. Validate consent.
8. Validate optional CV file:
   - Empty file means no attachment.
   - Extension must be `.pdf`, `.doc`, or `.docx`.
   - MIME type must be one of the expected document MIME types when provided.
   - Size must be <= 20 MB.
   - Sanitise filename before passing to Graph.
   - Pass `size` to the Graph mail helper so it can choose simple vs upload session path.
9. Build escaped HTML and text email bodies.
10. Send email via `sendMicrosoftGraphEmail`.
11. Return `{ success: true }`.

Do not:

- store CVs on disk
- forward applications to the management API
- log CV contents
- log full applicant experience text
- trust a user-submitted role label for email display without allowlist mapping

Email:

- To: `manager@the-anchor.pub`
- From user: `process.env.MICROSOFT_USER_EMAIL`
- Subject: `Job Application: [Role] - [Name]`
- Reply-to: applicant email
- Attachment: optional CV

Environment variables:

- `MICROSOFT_TENANT_ID`
- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET`
- `MICROSOFT_USER_EMAIL`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- Turnstile secret already used by `lib/turnstile.ts`

Validation errors:

- Return 400 with a concise message.
- Return 500 with a generic service configuration message if Graph env vars are missing.
- Reuse spam protection responses as-is.

---

## Task 7: Add Navigation And Internal Links

### Footer

Edit `components/layout/Footer.tsx`.

Add to Quick Links after Sitemap:

```typescript
{ label: 'Join Our Team', href: '/join-our-team' }
```

### About Page

Edit `app/about/page.tsx`.

Add a small "We're hiring" callout near the bottom before the final CTA:

`Interested in joining our team? We are looking for experienced bar staff and kitchen team members. Find out more.`

Link "Find out more" to `/join-our-team`.

### Our Pub Page

Optional but recommended: add a natural line in `app/our-pub/page.tsx` near the bar or kitchen content:

`Interested in working behind this bar or in the kitchen? See current roles.`

Link to `/join-our-team`.

### Careers Hub Internal Links

The careers hub should link naturally to:

- `/about`
- `/our-pub`
- `/find-us`
- `/food-menu`
- `/drinks`
- `/beer-garden`
- `/whats-on`
- `/sunday-lunch`

---

## Task 8: Add Sitemap Entries

### XML Sitemap

Edit `app/sitemap.ts`.

Add the hub and active role pages near Footer / legal or Main Pages:

```typescript
{ path: '/join-our-team', lastModified: new Date('2026-05-11') },
{ path: '/join-our-team/bar-staff', lastModified: new Date('2026-05-11') },
{ path: '/join-our-team/kitchen-team', lastModified: new Date('2026-05-11') },
```

Only include role pages while their jobs are active and their JobPosting schema is present.

If `/blog/pub-jobs-heathrow` is redirected, add `pub-jobs-heathrow` to `excludedBlogSlugs`.

### Human Sitemap

Edit `app/sitemap-page/page.tsx`.

Add "Join Our Team" under Main Pages or Guest Services:

```typescript
{ label: 'Join Our Team', href: '/join-our-team' }
```

Do not list inactive role pages.

---

## Task 9: Update Redirects And Old Recruitment Content

Recommended approach: make `/join-our-team` the canonical recruitment destination and redirect stale recruitment URLs to it.

Update redirects:

- `config/redirects/additional-redirects.json`
  - `/join-the-team` currently goes to `/`; change to `/join-our-team`.
- `config/redirects/wix-redirects.json`
  - `/join-the-team` currently goes to `/`; change to `/join-our-team`.
  - `/post/pub-jobs-near-heathrow` should go to `/join-our-team`.
  - `/post/bar-staff-wanted` should go to `/join-our-team`.
- `config/redirects/blog-redirects.json`
  - `/blog/pub-jobs-near-heathrow-bar-staff-and-sunday-runner` should go to `/join-our-team`.
  - `/post/pub-jobs-near-heathrow-bar-staff-and-sunday-runner` should go to `/join-our-team`.
  - Add `/blog/pub-jobs-heathrow` to `/join-our-team` if retiring the old blog post.

Because middleware preloads concrete redirects, these redirects will be applied before the page renders.

If the old blog post is not redirected:

- Rewrite `content/blog/pub-jobs-heathrow/index.md`.
- Remove the outdated Sunday Runner role.
- Remove "current opening" claims that may no longer be true.
- Add a clear top CTA to `/join-our-team`.
- Keep it out of JobPosting schema.

Recommended: redirect it instead. This avoids stale recruitment copy and search cannibalisation.

---

## Task 10: Update Privacy Policy

Edit `app/privacy-policy/page.tsx`.

Add a recruitment section after "Information You Provide" or as a new numbered section before cookie policy.

Required content:

- When someone applies through the Join Our Team page, The Anchor collects name, email address, phone number, role interest, experience summary, and optionally CV.
- The data is used only to assess suitability and contact the applicant about recruitment.
- Applications are emailed to the manager.
- CVs are not stored on the website server.
- If an application is unsuccessful, personal data is deleted within 6 months unless the applicant asks The Anchor to keep it for future opportunities.
- Legal basis: legitimate interests for recruitment, plus consent for processing the submitted application data.

Keep the copy factual, not marketing-led.

---

## Task 11: Analytics

Use existing generic form tracking unless a dedicated careers event is needed.

Recommended:

- On first field interaction:
  - `trackFormStart({ formName: 'careers_application', source: window.location.pathname, role: selectedRole })`
- On success:
  - `trackFormComplete({ formName: 'careers_application', source: window.location.pathname, role: selectedRole, has_cv: Boolean(cvFile) })`

Do not send:

- name
- email
- phone
- CV filename
- free-text experience

No new tracking endpoint is required.

---

## Task 12: Tests

### API tests

Create `app/api/careers/route.test.ts`.

Cover:

- Rejects missing required fields.
- Rejects invalid email.
- Rejects invalid role value.
- Rejects missing consent.
- Rejects invalid file extension.
- Rejects file over 20 MB.
- Converts `_t` from FormData string to number before spam check.
- Calls `checkSpamProtection` without `skipTurnstile`.
- Sends Graph payload without attachment when no CV is present.
- Sends Graph payload with simple inline attachment for small CVs (under 3 MB).
- Uses Graph upload session flow for large CVs (3 MB and above).
- Does not call any management API.

Mock:

- `checkSpamProtection`
- `sendMicrosoftGraphEmail`
- env vars

### Form tests

Create `components/features/__tests__/CareersForm.test.tsx`.

Cover:

- Required fields prevent submit.
- Invalid CV type shows client-side error.
- Oversized CV shows client-side error.
- Successful submit posts `FormData` to `/api/careers`.
- Submit button is disabled while loading.
- Success state resets the form.
- GDPR checkbox is required.

### Schema checks

Unit-test `buildJobPostingSchema(role)` in `lib/__tests__/careers.test.ts`:

- Uses `#business`.
- Uses the correct logo path.
- Does not include `jobLocationType`.
- Includes salary only when `baseHourly` is confirmed.
- Includes one role per schema object.
- Schema description contains the same core facts visible on the role page.

---

## Verification Checklist

Run locally:

- [ ] `npm run test`
- [ ] `npm run lint`
- [ ] `npx tsc --noEmit`
- [ ] `npm run build`

Manual checks:

- [ ] `/join-our-team` renders and has the correct H1.
- [ ] `/join-our-team/bar-staff` renders one job only.
- [ ] `/join-our-team/kitchen-team` renders one job only.
- [ ] Hub page does not include JobPosting schema.
- [ ] Each active role page includes exactly one JobPosting schema.
- [ ] Visible pay copy matches `baseSalary`.
- [ ] `validThrough` is in the future for active roles.
- [ ] Form submits successfully and email arrives at `manager@the-anchor.pub`.
- [ ] Reply-to is the applicant email.
- [ ] Small PDF CV arrives as an attachment.
- [ ] Invalid or oversized CVs are rejected before Graph send.
- [ ] Honeypot spam returns fake success.
- [ ] Missing or failed Turnstile token blocks submission.
- [ ] Footer link works.
- [ ] `/join-the-team` redirects to `/join-our-team`.
- [ ] Old pub-jobs URLs redirect to `/join-our-team`.
- [ ] XML sitemap contains hub and active role pages.
- [ ] Human sitemap contains the hub.
- [ ] Privacy policy contains recruitment data section.
- [ ] About page contains contextual hiring link.
- [ ] Mobile layout is usable and the form is keyboard accessible.
- [ ] After deploy, role pages pass Google Rich Results Test.
- [ ] After deploy, inspect the role URLs in Google Search Console.

---

## Maintenance Rules

- Review roles at least monthly while JobPosting schema is live.
- If a role is filled:
  - remove JobPosting schema for that role,
  - remove the role page from XML sitemap,
  - either 404 the role page or change it to a no-schema evergreen information page,
  - update the hub role cards and form options.
- If a role remains open beyond `validThrough`:
  - confirm it is still open,
  - update `datePosted` and `validThrough`,
  - request recrawl in Search Console.
- Recheck pay copy every April when National Minimum Wage rates change.
- CV max size is 20 MB, handled via Graph upload session for files >= 3 MB.

---

## Out of Scope

- Google Indexing API integration.
- Job board cross-posting.
- Google Business Profile job posts.
- Applicant tracking system.
- Database storage for applications.
- Automated role toggling admin UI.
- New staff photography or imagery.
