# API connection remediation

Scope: parking pricing and sibling runtime fallback behaviour between the website and management API. Complexity: 3 (five production files, no schema or new integration). Two independently deployable commits: (1) runtime API failure handling and proxy tests; (2) parking price presentation, progression guard and UI regressions. Root coordinates packaging; no dependency on migrations or another app deployment.

Critical path: lib/api/client.ts, parking rate proxy, Heathrow parking page and the ParkingBookingWizard imported by that page. Supporting: parking rate types, events fallback helpers and events API proxy. Peripheral: regression tests and build configuration.

The live parking proxy returned 5/hour, 15/day, 75/week and 265/month during the read-only review. The actual client with a simulated network failure instead resolved a stale rate card (2.5/12/55/180). The page separately substituted hardcoded prices and price offers when no rates existed, while the wizard allowed continuing with availability alone. Event runtime fallbacks also manufacture a scheduled event with capacity instead of exposing an outage. Build-time event reads now return an empty list; legacy helper exports remain for compatibility.

No writes to production, messages, booking submissions or payment calls are permitted. The legacy reference lookup and cancellation endpoints are intentionally unsupported and have no UI consumers; leave them unchanged. Other seasonal empty menu and category fallbacks do not assert bookable capacity or parking prices.

Focused pass 1 found that Next caches successful parking rate reads, hiding a later outage. Explicit no-cache pricing now returns HTTP 503 immediately when the local management fixture fails. The rendered page changes from the test rate (18/day) to the contact fallback with no price. Focused pass 2 found no further in-scope defects.
