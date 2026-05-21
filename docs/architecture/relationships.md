---
generated: true
last_updated: 2026-05-21T00:00:00Z
source: session-setup
project: the-anchor-pub
---

# System Relationships

## Paired System Overview

```
                  +-----------------------------------+
                  |  OJ-AnchorManagementTools         |
                  |  (Staff admin tool)               |
                  |  management.orangejelly.co.uk     |
                  |                                   |
                  |  Supabase (PostgreSQL)             |
                  |  ├── table_bookings               |
                  |  ├── events                       |
                  |  ├── special_hours                 |
                  |  ├── business_hours                |
                  |  ├── parking_bookings              |
                  |  └── ...                           |
                  +-----------------------------------+
                              ^
                              | REST API
                              | Bearer: ANCHOR_API_KEY
                              |
                  +-----------------------------------+
                  |  OJ-The-Anchor.pub (this repo)    |
                  |  (Customer website)               |
                  |  www.the-anchor.pub               |
                  |                                   |
                  |  app/api/*  (proxy layer)          |
                  |  lib/api/*  (API client)           |
                  |  app/*      (pages)                |
                  +-----------------------------------+
                              ^
                              |
                        Customers
```

## External Service Map

```
                    +-------------------+
                    |   This Website    |
                    +-------------------+
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
  Management API    Microsoft Graph    PayPal API
  (hours, bookings,  (email sending)   (deposit payments)
   events, parking)
          |
          v
    AviationStack      Cloudflare        Google
    (flight data)      (Turnstile,       (GTM, reviews)
                        DNS, TLS)
                                          Meta
                                         (Pixel)

                                        Clarity
                                       (heatmaps)
```

## Key Data Flows

### 1. Table Booking

```
Customer fills form
  -> POST /api/table-bookings
    -> Validates input
    -> If group >= 10: PayPal deposit flow
      -> POST /api/table-bookings/paypal/create-order
      -> Customer pays via PayPal SDK
      -> POST /api/table-bookings/paypal/capture-order
    -> Proxies to Management API
    -> Returns booking reference
  -> Redirect to /booking-confirmation
```

### 2. Business Hours Display

```
StatusBar component mounts
  -> GET /api/business/hours (no-cache)
    -> Proxies to Management API
    -> Returns regular hours + special_hours overrides
  -> BusinessHoursProvider context wraps app
  -> lib/hours-utils.ts resolves effective hours
```

### 3. Event Booking

```
Customer views /events/[id]
  -> GET /api/events/[id] (cached 60s)
  -> GET /api/events/[id]/availability
Customer books
  -> POST /api/event-bookings
    -> Proxies to Management API
```

### 4. Parking Booking

```
Customer views /heathrow-parking
  -> GET /api/parking/availability
  -> GET /api/parking/rates
Customer books
  -> POST /api/parking/payment/create-order (PayPal)
  -> Customer approves payment
  -> POST /api/parking/payment/capture
  -> POST /api/parking/bookings
```

### 5. Email Enquiries

```
Customer submits form (Christmas, recruitment, private hire)
  -> POST /api/enquiry/christmas (or /recruitment, /careers)
    -> Acquires OAuth2 token from Microsoft
    -> Sends email via Graph API
    -> Also proxies to Management API for record-keeping
```

### 6. Blog Content

```
Markdown files in content/blog/*.md
  -> lib/markdown.ts parses with remark
  -> app/blog/[slug]/page.tsx renders
  -> app/sitemap.ts includes in sitemap
  -> Blog tag pages auto-generated from post frontmatter
```

## Component Architecture

```
app/layout.tsx (root)
  ├── Navigation
  ├── HeaderStatusSectionDirect (live hours)
  ├── BusinessHoursProvider (context)
  ├── GTMProvider
  ├── MetaPixelProvider
  ├── AnalyticsProvider
  ├── CookieBanner
  ├── FloatingActions
  ├── ErrorBoundary
  ├── DynamicSchema (JSON-LD)
  ├── {children} -- page content
  └── Footer
```

## Environment Variable Dependencies

### Server-only (API routes)

| Var | Used By |
|-----|---------|
| `ANCHOR_API_KEY` | All management API proxy routes |
| `ANCHOR_API_BASE_URL` | API client base URL override |
| `MICROSOFT_TENANT_ID` | Graph OAuth token requests |
| `MICROSOFT_CLIENT_ID` | Graph OAuth token requests |
| `MICROSOFT_CLIENT_SECRET` | Graph OAuth token requests |
| `MICROSOFT_USER_EMAIL` | Graph email sender address |
| `CHRISTMAS_ENQUIRY_TO` | Christmas enquiry recipient |
| `RECRUITMENT_APPLICATION_TO` | Job application recipient |
| `TURNSTILE_SECRET_KEY` | Server-side Turnstile validation |
| `MS_PREVIEW_TOKEN` | Manager's special preview auth |
| `CHEERSAI_BOOKING_CONVERSIONS_SECRET` | Booking conversion forwarding |
| `CHEERSAI_BOOKING_CONVERSIONS_URL` | Booking conversion endpoint |
| `CHEERSAI_FEED_API_KEY` | Tournament fixture feed |
| `API_DEBUG_LOGS` | Verbose analytics logging |

### Public (client-side, NEXT_PUBLIC_*)

| Var | Used By |
|-----|---------|
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel tracking |
| `NEXT_PUBLIC_AVIATIONSTACK_API_KEY` | Flight data widget |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Microsoft Clarity |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | PayPal checkout SDK |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile widget |
