# Blog Template Heathrow Booking CTA — Handoff

## Files Modified

- `app/blog/[slug]/page.tsx` — sole modified file

## What Changed

### 1. Import added
`BookTableButton` imported from `@/components/BookTableButton`.

### 2. Condition logic (lines ~88–103 in final file)

```ts
const HEATHROW_CTA_TAGS = new Set([
  'heathrow', 'plane-spotting', 'parking', 'travel',
])
const HEATHROW_SLUG_KEYWORDS = ['heathrow', 'plane', 'parking', 'aviation', 'airport', 'layover']

function shouldShowHeathrowBookingCta(slug: string, tags: string[]): boolean {
  if (tags.some((tag) => HEATHROW_CTA_TAGS.has(tag))) return true
  return HEATHROW_SLUG_KEYWORDS.some((kw) => slug.includes(kw))
}
```

**Why dual check?** Several Heathrow posts (e.g. `plane-spotting-heathrow-guide`) use only generic tags (`community`, `guides`) but their slug clearly identifies them. A slug-only check would be too broad; a tag-only check would miss those posts.

`showHeathrowCta` is derived from this function and used in two JSX locations.

### 3. Mid-content booking CTA block (inserted between article and share section)
- Only renders when `showHeathrowCta === true`
- Two-column layout: headline + description on left, CTA buttons on right
- `BookTableButton` with `source="blog_heathrow_cta"`, `context="heathrow_visitor"`
- Link to `/food-menu`

### 4. Footer CTA section updated
- When `showHeathrowCta === true`: shows **Book a Table** (BookTableButton), **View Food Menu** (link), **Get Directions** (link)
- When `showHeathrowCta === false`: original **Get Directions** + **More Stories** unchanged

## Tags That Trigger the CTA

| Trigger type | Values |
|---|---|
| Tags | `heathrow`, `plane-spotting`, `parking`, `travel` |
| Slug keywords | `heathrow`, `plane`, `parking`, `aviation`, `airport`, `layover` |

## Posts where CTA WILL appear (sample)
- `heathrow-plane-spotting-locations` — tag `heathrow` + `plane-spotting`
- `plane-spotting-heathrow-guide` — slug contains `plane` + `heathrow`
- `cheap-heathrow-parking-alternatives` — tag `heathrow` + `parking`
- `heathrow-layover-guide` — tag `travel`, slug contains `heathrow` + `layover`
- `best-places-to-eat-near-heathrow` — slug contains `heathrow`
- `things-to-do-near-heathrow-between-flights` — tag `heathrow`

## Posts where CTA WILL NOT appear (sample)
- `tequila-and-tradition-...` — tags: `news`, `food-and-drink`; slug: no keywords
- `pet-ownership-benefits` — tags: `community`, `news`; slug: no keywords
- `30th-birthday-party-ideas-venues` — tags: none matching; slug: no keywords

## No prices hardcoded
No prices referenced. CTA copy is entirely text-based.
