---
generated: true
last_updated: 2026-05-21T00:00:00Z
source: session-setup
project: the-anchor-pub
---

# Routes

## Pages (page.tsx)

All pages are Server Components by default. Only two layouts exist: root (`app/layout.tsx`) and private-hire (`app/private-hire/layout.tsx`).

### Core

| URL | File | Notes |
|-----|------|-------|
| `/` | `app/page.tsx` | Homepage |
| `/about` | `app/about/page.tsx` | About the pub |
| `/find-us` | `app/find-us/page.tsx` | Location and directions |
| `/accessibility` | `app/accessibility/page.tsx` | Accessibility statement |
| `/privacy-policy` | `app/privacy-policy/page.tsx` | Privacy policy |
| `/leave-review` | `app/leave-review/page.tsx` | Review links |
| `/*` (catch-all) | `app/[...unmatched]/page.tsx` | 404 handler |

### Food & Drink

| URL | File | Notes |
|-----|------|-------|
| `/food-menu` | `app/food-menu/page.tsx` | Main food menu |
| `/food-menu/vegan` | `app/food-menu/vegan/page.tsx` | Vegan menu |
| `/food-menu/vegetarian` | `app/food-menu/vegetarian/page.tsx` | Vegetarian menu |
| `/food-menu/gluten-free` | `app/food-menu/gluten-free/page.tsx` | Gluten-free menu |
| `/sunday-lunch` | `app/sunday-lunch/page.tsx` | Sunday roast page |
| `/drinks` | `app/drinks/page.tsx` | Drinks menu |
| `/drinks/[slug]` | `app/drinks/[slug]/page.tsx` | Dynamic drink redirect |
| `/drinks/baby-guinness` | `app/drinks/baby-guinness/page.tsx` | Baby Guinness page |
| `/drinks/managers-special` | `app/drinks/managers-special/page.tsx` | Weekly special |
| `/fish-and-chips-heathrow` | `app/fish-and-chips-heathrow/page.tsx` | SEO landing page |

### Booking

| URL | File | Notes |
|-----|------|-------|
| `/book-table` | `app/book-table/page.tsx` | Table booking wizard |
| `/book-event` | `app/book-event/page.tsx` | Event booking |
| `/booking-confirmation` | `app/booking-confirmation/page.tsx` | Post-booking confirmation |

### Events

| URL | File | Notes |
|-----|------|-------|
| `/events` | `app/events/page.tsx` | Events listing |
| `/events/[id]` | `app/events/[id]/page.tsx` | Dynamic event detail |
| `/cash-bingo` | `app/cash-bingo/page.tsx` | Cash Bingo landing |
| `/music-bingo` | `app/music-bingo/page.tsx` | Music Bingo landing |
| `/quiz-night` | `app/quiz-night/page.tsx` | Quiz Night landing |
| `/live-football` | `app/live-football/page.tsx` | Live football |
| `/live-sport` | `app/live-sport/page.tsx` | Live sport |
| `/mothers-day` | `app/mothers-day/page.tsx` | Mother's Day |
| `/fathers-day` | `app/fathers-day/page.tsx` | Father's Day |
| `/valentines-day` | `app/valentines-day/page.tsx` | Valentine's Day |
| `/easter` | `app/easter/page.tsx` | Easter |
| `/new-years-eve` | `app/new-years-eve/page.tsx` | NYE |
| `/bonfire-night` | `app/bonfire-night/page.tsx` | Bonfire Night |
| `/boxing-day` | `app/boxing-day/page.tsx` | Boxing Day |
| `/christmas-parties` | `app/christmas-parties/page.tsx` | Christmas parties |
| `/corporate-christmas-parties` | `app/corporate-christmas-parties/page.tsx` | Corporate Christmas |
| `/bank-holiday-weekends` | `app/bank-holiday-weekends/page.tsx` | Bank holidays |
| `/world-cup-2026` | `app/world-cup-2026/page.tsx` | World Cup 2026 |

### Private Hire (nested layout)

| URL | File | Notes |
|-----|------|-------|
| `/private-hire` | `app/private-hire/page.tsx` | Main private hire |
| `/private-hire/milestone-birthdays` | `app/private-hire/milestone-birthdays/page.tsx` | |
| `/private-hire/wakes` | `app/private-hire/wakes/page.tsx` | |
| `/private-hire/retirement-parties` | `app/private-hire/retirement-parties/page.tsx` | |
| `/private-hire/christenings` | `app/private-hire/christenings/page.tsx` | |
| `/private-hire/engagement-parties` | `app/private-hire/engagement-parties/page.tsx` | |
| `/private-hire/baby-showers` | `app/private-hire/baby-showers/page.tsx` | |
| `/private-hire/gender-reveal` | `app/private-hire/gender-reveal/page.tsx` | |
| `/private-hire/near/[slug]` | `app/private-hire/near/[slug]/page.tsx` | Local landmark pages |
| `/function-room-hire` | `app/function-room-hire/page.tsx` | Function room |
| `/corporate-events` | `app/corporate-events/page.tsx` | Corporate events |
| `/private-party-venue` | `app/private-party-venue/page.tsx` | Party venue SEO |

### SEO Landing Pages (Local Area)

| URL | File | Notes |
|-----|------|-------|
| `/ashford-pub` | `app/ashford-pub/page.tsx` | |
| `/bedfont-pub` | `app/bedfont-pub/page.tsx` | |
| `/colnbrook-pub` | `app/colnbrook-pub/page.tsx` | |
| `/egham-pub` | `app/egham-pub/page.tsx` | |
| `/feltham-pub` | `app/feltham-pub/page.tsx` | |
| `/longford-pub` | `app/longford-pub/page.tsx` | |
| `/staines-pub` | `app/staines-pub/page.tsx` | |
| `/near-heathrow` | `app/near-heathrow/page.tsx` | |

### SEO Landing Pages (Heathrow / Travel)

| URL | File | Notes |
|-----|------|-------|
| `/heathrow-parking` | `app/heathrow-parking/page.tsx` | Parking booking |
| `/coach-parking-heathrow` | `app/coach-parking-heathrow/page.tsx` | |
| `/luggage-storage-heathrow` | `app/luggage-storage-heathrow/page.tsx` | |
| `/pre-flight-meal` | `app/pre-flight-meal/page.tsx` | |
| `/plane-spotting-heathrow` | `app/plane-spotting-heathrow/page.tsx` | |
| `/heathrow-family-dining` | `app/heathrow-family-dining/page.tsx` | |
| `/heathrow-hotels-pub` | `app/heathrow-hotels-pub/page.tsx` | |
| `/heathrow-layover-dining` | `app/heathrow-layover-dining/page.tsx` | |
| `/pub-near-sofitel-heathrow` | `app/pub-near-sofitel-heathrow/page.tsx` | |
| `/pub-near-novotel-heathrow` | `app/pub-near-novotel-heathrow/page.tsx` | |
| `/pub-near-crowne-plaza-heathrow` | `app/pub-near-crowne-plaza-heathrow/page.tsx` | |
| `/pub-near-hilton-heathrow` | `app/pub-near-hilton-heathrow/page.tsx` | |
| `/pub-garden-heathrow` | `app/pub-garden-heathrow/page.tsx` | |
| `/m25-junction-14-pub` | `app/m25-junction-14-pub/page.tsx` | |
| `/free-parking` | `app/free-parking/page.tsx` | |
| `/dog-friendly-pub-heathrow` | `app/dog-friendly-pub-heathrow/page.tsx` | |
| `/family-friendly-pub-heathrow` | `app/family-friendly-pub-heathrow/page.tsx` | |
| `/pool-darts-pub` | `app/pool-darts-pub/page.tsx` | |

### Blog

| URL | File | Notes |
|-----|------|-------|
| `/blog` | `app/blog/page.tsx` | Blog listing (paginated) |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | Blog post |
| `/blog/tag/[tag]` | `app/blog/tag/[tag]/page.tsx` | Tag archive |
| `/blog/tags` | `app/blog/tags/page.tsx` | All tags |

### Other

| URL | File | Notes |
|-----|------|-------|
| `/beer-garden` | `app/beer-garden/page.tsx` | Beer garden page |
| `/join-our-team` | `app/join-our-team/page.tsx` | Recruitment hub |
| `/join-our-team/bar-staff` | `app/join-our-team/bar-staff/page.tsx` | |
| `/join-our-team/kitchen-team` | `app/join-our-team/kitchen-team/page.tsx` | |
| `/gallery` | `app/gallery/page.tsx` | Photo gallery |
| `/whats-on` | `app/whats-on/page.tsx` | What's on |

---

## API Routes (route.ts)

All API routes are proxy endpoints to the management API or handle form submissions. No user auth -- routes authenticate server-to-server via `ANCHOR_API_KEY`.

### Table Bookings

| Path | Method | Auth | Purpose |
|------|--------|------|---------|
| `/api/table-bookings` | POST | API key | Create table booking |
| `/api/table-bookings/availability` | GET | API key | Get available slots |
| `/api/table-bookings/[reference]` | GET | API key | Look up booking |
| `/api/table-bookings/[reference]` | DELETE | API key | Cancel booking |
| `/api/table-bookings/create` | POST | re-export | Alias for /api/table-bookings POST |
| `/api/table-bookings/paypal/create-order` | POST | API key | Create PayPal order for deposit |
| `/api/table-bookings/paypal/capture-order` | POST | API key | Capture PayPal payment |

### Booking (Generic)

| Path | Method | Auth | Purpose |
|------|--------|------|---------|
| `/api/booking/agent` | GET, POST | API key | Booking agent interactions |
| `/api/booking/payment-return` | GET | None | PayPal payment return handler |
| `/api/bookings/initiate` | POST | None | Initiate booking flow |

### Events

| Path | Method | Auth | Purpose |
|------|--------|------|---------|
| `/api/events` | GET | API key | List events |
| `/api/events/[id]` | GET | API key | Event detail |
| `/api/events/[id]/availability` | GET | API key | Event availability |
| `/api/event-bookings` | POST | API key | Create event booking |
| `/api/event-categories` | GET | API key | List categories |
| `/api/event-waitlist` | POST | API key | Join event waitlist |
| `/api/calendar/upcoming` | GET | API key | Upcoming calendar events |
| `/api/calendar/event/[id]` | GET | API key | Calendar event detail |

### Business

| Path | Method | Auth | Purpose |
|------|--------|------|---------|
| `/api/business/hours` | GET | API key | Opening hours (no-cache) |
| `/api/managers-special` | GET | Token | Manager's special data |
| `/api/managers-special-image` | GET | None | Special offer image |
| `/api/reviews` | GET | API key | Google reviews |
| `/api/reviews/status` | GET | API key | Review status |

### Parking

| Path | Method | Auth | Purpose |
|------|--------|------|---------|
| `/api/parking/availability` | GET | API key | Parking slot availability |
| `/api/parking/rates` | GET | API key | Parking rates |
| `/api/parking/bookings` | POST | API key | Create parking booking |
| `/api/parking/bookings/[id]` | GET | API key | Look up parking booking |
| `/api/parking/payment/create-order` | POST | API key | PayPal order for parking |
| `/api/parking/payment/capture` | POST | API key | Capture parking payment |

### Enquiries & Email

| Path | Method | Auth | Purpose |
|------|--------|------|---------|
| `/api/enquiry/christmas` | POST | Graph OAuth | Christmas party enquiry email |
| `/api/enquiry/recruitment` | POST | Graph OAuth | Recruitment enquiry email |
| `/api/careers` | POST | Graph OAuth | Job application submission |
| `/api/private-booking-enquiry` | POST | API key | Private hire enquiry |
| `/api/public/private-booking` | POST | API key | Public private booking |
| `/api/public/private-booking/config` | GET | API key | Booking config |

### Other

| Path | Method | Auth | Purpose |
|------|--------|------|---------|
| `/api/health` | GET | None | Health check |
| `/api/analytics` | POST | None | Analytics event proxy |
| `/api/web-vitals` | POST | None | Web Vitals reporting |
| `/api/customers/lookup` | GET | API key | Customer lookup |
| `/api/tracking/booking-conversion` | POST | Secret | Booking conversion forwarding |
| `/content/blog/[...path]` | GET | None | Blog content serving |

### Caching Strategy

Middleware applies caching headers to all API routes:
- `/api/business/hours`: `no-store, max-age=0` (always fresh for status bar)
- All other `/api/*`: `public, s-maxage=60, stale-while-revalidate=300`
