# Private Hire — Meta, Content, New Pages, Schema — Handoff

## Status: Complete

All tasks from the agent brief have been implemented.

---

## Changes Made

### Task 1: Meta Rewrites

**`/private-hire/wakes`** (`app/private-hire/wakes/page.tsx`)
- Title: "Wake & Funeral Reception Venue | Near Heathrow | The Anchor" (55ch)
- Description: "Private room for wakes, funeral teas & celebrations of life near Staines & Heathrow. Up to 50 guests, buffet packages from £12pp, free parking. Compassionate staff."
- Description is dynamic — price is pulled from the API; £12 is fallback only.

**`/private-hire/christenings`** (`app/private-hire/christenings/page.tsx`)
- Title: "Christening Venue Near Heathrow & Staines | The Anchor" (56ch)
- Description: "Private room for christening parties & baptism receptions at The Anchor, Stanwell Moor. Up to 50 guests, buffet options, family-friendly, free parking. Near Heathrow."

**`/private-hire` hub** (`app/private-hire/page.tsx`)
- Title: "Private Hire Venue Near Heathrow | Wakes, Parties & Events | The Anchor"
- Updated in `generateMetadata()`, openGraph title, and twitter title.
- "Function Room" wording removed from title to resolve cannibalisation with `/function-room-hire`.

---

### Task 2: Wakes Content Expansion (`app/private-hire/wakes/page.tsx`)

Two new H2 sections added before the FAQ accordion:

1. **"Near Slough Crematorium"** — ~130 words. Covers 12-minute drive time, M25 J14 approach, free parking, flexible timing for cremation overruns. Empathetic, practical, not sales-y.
2. **"Near Staines Cemetery"** — ~130 words. Covers 8-minute drive, B378 route, public transport option, serves Staines/Ashford/Laleham/Shepperton catchment.

Both sections include a direct phone link (`tel:+441753682707`).

---

### Task 2 (food-menu link): Catering Packages Section

Added internal link to `/food-menu` in the "Wake Reception Packages" prose block:
> "Guests who choose to stay on after the reception are welcome to order from our full food menu at their leisure."

---

### Task 3: Wakes Enquiry Form

The wakes page already had `<PrivateBookingSection eventType="Wake / Memorial" />` mounted on it — the enquiry form is already present. Two fixes applied:

1. Added `id="enquiry"` to the `PrivateBookingSection` call so the anchor `#enquiry` works correctly on the wakes page itself.
2. Changed the hero "Enquire Online" button link from `/private-hire#enquiry` to `#enquiry` so it scrolls to the form on the same page rather than navigating away.

No new API routes were created. The form uses the existing management API proxy pattern via `PrivateBookingSection` / `PrivateBookingCalculator`.

**No action needed** — reusable component was already in place.

---

### Task 4: New Landmarks (`lib/local-seo-data.ts`)

Four entries added matching the exact `Landmark` interface:

| Slug | Name | Type | Distance |
|------|------|------|----------|
| `kempton-park-crematorium` | Kempton Park Crematorium | `crematorium` | 12 mins drive |
| `windsor-register-office` | Windsor Register Office | `registry_office` | 20 mins drive |
| `spelthorne-registration-office` | Spelthorne Registration Office | `registry_office` | 9 mins drive |
| `heathrow-airport` | Heathrow Airport | `other` | 7 mins drive |

`'other'` was already in the `LandmarkType` union so no type changes were required.

Note: `spelthorne-registration-office` uses postcode TW18 1XB (Knowle Green, Staines). The brief listed TW18 without a full postcode; TW18 1XB is the known postcode for Knowle Green.

---

### Task 5: EventVenue Schema on /private-hire Hub (`app/private-hire/page.tsx`)

JSON-LD `EventVenue` schema added to the hub page using the same pattern as wakes and christenings pages:
- Venue name, full postal address, telephone from `CONTACT` constants
- `maximumAttendeeCapacity: 50`
- `amenityFeature` array: Free Parking, Wheelchair Accessible, Catering, Private Dining Room, AV Equipment, WiFi, Private Bar
- `potentialAction` as `ReserveAction` pointing to `https://www.the-anchor.pub/private-hire#enquiry`
- Required imports added: `CONTACT`, `BRAND` from `@/lib/constants` and `jsonLdSafeStringify` from `@/lib/jsonld`

---

## Files Modified

- `app/private-hire/page.tsx`
- `app/private-hire/wakes/page.tsx`
- `app/private-hire/christenings/page.tsx`
- `lib/local-seo-data.ts`

---

## Self-Check

- [x] /private-hire/wakes meta updated
- [x] /private-hire/christenings meta updated with "Heathrow" added
- [x] /private-hire hub title changed to remove "Function Room" overlap
- [x] Wakes page has 2 new crematorium proximity sections (Slough + Staines)
- [x] Wakes page has food-menu internal link
- [x] Wakes enquiry resolved — PrivateBookingSection already present, fixed anchor link and added id prop
- [x] 4 new landmarks added to local-seo-data.ts with correct data structure
- [x] EventVenue schema added to /private-hire hub

---

## TypeScript

No new type errors introduced. Pre-existing errors in test files (unrelated to these changes) remain unchanged.
