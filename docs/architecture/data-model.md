---
generated: true
last_updated: 2026-05-21T00:00:00Z
source: session-setup
project: the-anchor-pub
---

# Data Model

## No Local Database

This project has **no database**. It is a static marketing and booking website.

All persistent data lives in the paired management app (`OJ-AnchorManagementTools`) which uses Supabase (PostgreSQL).

## Data Sources

### Management API (primary)

Base URL: `https://management.orangejelly.co.uk/api`

The website consumes data via API proxy routes. Key data entities:

| Entity | Read | Write | Key Route |
|--------|------|-------|-----------|
| Table bookings | Yes | Yes | `/api/table-bookings/*` |
| Business hours | Yes | No | `/api/business/hours` |
| Events | Yes | No | `/api/events/*` |
| Event bookings | No | Yes | `/api/event-bookings` |
| Event waitlist | No | Yes | `/api/event-waitlist` |
| Parking availability | Yes | No | `/api/parking/availability` |
| Parking bookings | Yes | Yes | `/api/parking/bookings/*` |
| Parking rates | Yes | No | `/api/parking/rates` |
| Reviews | Yes | No | `/api/reviews/*` |
| Customers | Yes | No | `/api/customers/lookup` |
| Manager's special | Yes | No | `/api/managers-special` |
| Private bookings | Yes | Yes | `/api/public/private-booking/*` |
| Event categories | Yes | No | `/api/event-categories` |
| Careers/vacancies | No | Yes | `/api/careers` |

### Static Content

| Content Type | Source | Location |
|-------------|--------|----------|
| Blog posts | Markdown files | `content/blog/*.md` |
| SSOT (brand facts) | Markdown + JSON | `docs/SSOT.md`, `SSOT.json` |
| Redirect rules | JSON config | `config/redirects/*.json` |
| Local SEO data | TypeScript | `lib/local-seo-data.ts` |
| Menu page data | TypeScript | `lib/menu-page-data.ts` |

### External APIs

| Service | Data | Client |
|---------|------|--------|
| AviationStack | Heathrow flight data | `lib/flights.ts` |
| Microsoft Graph | Email sending | `lib/microsoft-graph-mail.ts` |
| PayPal | Payment orders | API proxy routes |

## API Client Architecture

The API client is modularised in `lib/api/`:

| File | Purpose |
|------|---------|
| `lib/api/client.ts` | Base HTTP client with auth headers |
| `lib/api/index.ts` | Re-exports all API modules |
| `lib/api/bookings.ts` | Table booking operations |
| `lib/api/events.ts` | Event listing and detail |
| `lib/api/hours.ts` | Business hours |
| `lib/api/menu.ts` | Food/drink menus |
| `lib/api/parking.ts` | Parking operations |
| `lib/api/private-bookings.ts` | Private hire bookings |
| `lib/api/catering-packages.ts` | Catering package data |
| `lib/api/shared.ts` | Shared types and utilities |
| `lib/api.ts` | Legacy API client (older monolithic version) |

## Business Hours Resolution

Hours data flows through a specific resolution chain:

```
Management API (/business/hours)
      |
      v
  lib/hours-utils.ts
  ├── getEffectiveDayHours()  -- merges special_hours with regular hours
  ├── isKitchenClosed()       -- checks kitchen === null OR is_kitchen_closed
  └── Uses ?? (not ||) for null-safe resolution
      |
      v
  lib/table-booking-service-windows.ts
  └── resolveServiceRanges()  -- converts hours to bookable time slots
```

**Critical:** `kitchen: null` in special hours means "kitchen is closed" -- this is a deliberate signal, not missing data. Always use `??` not `||` when resolving kitchen hours.
