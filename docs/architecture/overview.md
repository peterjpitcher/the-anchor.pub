---
generated: true
last_updated: 2026-05-21T00:00:00Z
source: session-setup
project: the-anchor-pub
---

# Architecture Overview

## Project Summary

The Anchor Pub Website (`OJ-The-Anchor.pub`) is a customer-facing marketing and booking site for The Anchor, a pub in Stanwell Moor near Heathrow Airport.

**Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS 3, CVA (class-variance-authority)

**No database.** All persistent data lives in the paired management app (`OJ-AnchorManagementTools`) and is accessed via REST API proxy routes.

**Hosting:** Vercel | **DNS:** Cloudflare | **Canonical domain:** `https://www.the-anchor.pub`

## High-Level Architecture

```
Customer Browser
      |
      v
  Vercel (Next.js)
  ├── Static pages (SSR/ISR)  ~75+ marketing pages
  ├── API proxy routes         ~40 route handlers
  └── Middleware               Redirects, security headers, caching
      |
      v  (ANCHOR_API_KEY auth)
  Management API (management.orangejelly.co.uk)
  └── Supabase (PostgreSQL) — sole source of truth
```

## Key Counts

| Category | Count |
|----------|-------|
| Pages (page.tsx) | ~75 |
| API routes (route.ts) | ~40 |
| Layouts (layout.tsx) | 2 (root + private-hire) |
| Components (.tsx) | ~130 |
| Lib utilities (.ts) | ~70 |
| Server actions | 0 (all mutations go through API proxy routes) |
| Environment variables | ~20 |

## External Integrations

| Service | Purpose | Auth |
|---------|---------|------|
| Management API (Orange Jelly) | Bookings, hours, events, menus, parking | Bearer token (ANCHOR_API_KEY) |
| Microsoft Graph | Email sending (enquiries, recruitment) | OAuth2 client credentials |
| PayPal | Deposit payments for large group bookings and parking | Client SDK + API proxy |
| AviationStack | Heathrow flight data (parking feature) | API key |
| Google Tag Manager | Analytics tracking | Container ID |
| Meta Pixel | Booking conversion tracking | Pixel ID |
| Microsoft Clarity | Session recording/heatmaps | Project ID |
| Cloudflare Turnstile | Anti-spam on booking/recruitment forms | Site key + secret |
| CheersAI | Booking conversion forwarding, tournament feeds | Secret + URL |

## Auth Model

This is a **public website with no user authentication**. There is no login, no sessions, no RBAC.

Authentication exists only for:
1. **Server-to-server API proxy** -- API routes authenticate to the management API using `ANCHOR_API_KEY` as a Bearer token
2. **Microsoft Graph OAuth2** -- Client credentials flow for email sending
3. **Preview tokens** -- `MS_PREVIEW_TOKEN` for manager's special preview access

## Middleware

`middleware.ts` handles:
- Domain canonicalisation (apex to www, HTTP to HTTPS)
- Trailing slash removal
- Blog pagination normalisation (?page=1 to /blog)
- Redirect chain flattening (via `lib/middleware-redirects.ts`)
- Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- API route caching (stale-while-revalidate, except /api/business/hours which is no-cache)

## Content Architecture

Pages fall into several categories:
- **Core pages** -- Home, About, Find Us, Accessibility, Privacy
- **Food & Drink** -- Food menu (inc. dietary pages), Drinks, Sunday Lunch, Manager's Special
- **Booking** -- Book Table, Book Event, Booking Confirmation
- **Events** -- Dynamic event pages from API, Cash Bingo, Quiz Night, Music Bingo
- **Private Hire** -- Main page + sub-pages (birthdays, wakes, christenings, etc.) + near/[slug] landmark pages
- **SEO landing pages** -- Local area pubs (Feltham, Colnbrook, Egham, etc.), Heathrow-related pages
- **Blog** -- Markdown-based blog with tags
- **Parking** -- Heathrow parking booking flow
- **Recruitment** -- Join Our Team with role-specific pages

## Fonts

- **Outfit** (sans-serif) -- `--font-outfit`
- **Merriweather** (serif) -- `--font-merriweather`
