---
generated: true
last_updated: 2026-05-21T00:00:00Z
source: session-setup
project: the-anchor-pub
---

# Server Actions

## Status: None

This project has **zero server actions** (`'use server'` directives).

All mutations (bookings, enquiries, form submissions) are handled through:

1. **API route handlers** (`app/api/*/route.ts`) -- Next.js Route Handlers that proxy requests to the management API
2. **Client-side form submissions** -- Forms POST to the API routes above
3. **PayPal SDK callbacks** -- Payment flows use the PayPal React SDK with API route proxies

## Why No Server Actions

This is a static marketing site with no database. The management app (`OJ-AnchorManagementTools`) owns all data. The website's API routes act as a proxy layer that:

- Hides the `ANCHOR_API_KEY` from client-side code
- Handles CORS
- Adds response caching
- Transforms request/response formats as needed

## Mutation Flow

```
Client Component (form submit)
      |
      v
  fetch('/api/table-bookings', { method: 'POST', body: ... })
      |
      v
  API Route Handler (app/api/table-bookings/route.ts)
      |
      v  (Authorization: Bearer ANCHOR_API_KEY)
  Management API (management.orangejelly.co.uk/api/...)
      |
      v
  Supabase DB (in management app)
```
