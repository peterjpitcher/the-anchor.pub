**Findings**
`BUG-001`  
File: [app/api/event-bookings/route.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/api/event-bookings/route.ts#L128), [app/api/event-bookings/route.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/api/event-bookings/route.ts#L145), [app/api/event-waitlist/route.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/api/event-waitlist/route.ts#L103), [app/api/event-waitlist/route.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/api/event-waitlist/route.ts#L120)  
Severity: High  
Category: Security / Integration  
Description: Both proxies call `checkSpamProtection(..., { skipTurnstile: true })` but never forward `body.turnstile_token` to upstream as `x-turnstile-token`. Given your stated contract, local verification is intentionally skipped and upstream verification never receives the token.  
Impact: Legitimate event bookings and waitlist joins can still fail upstream after the user solves Turnstile, recreating the silent-failure pattern you already saw on other proxies.  
Suggested fix: Mirror the table/private-booking pattern here: read and trim `body.turnstile_token`, add `'x-turnstile-token': token` to the upstream headers, and consider returning 400/403 locally when `skipTurnstile` is set but no token is present.

`BUG-002`  
File: [app/api/enquiry/open-mic/route.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/api/enquiry/open-mic/route.ts#L27), [app/api/enquiry/open-mic/route.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/api/enquiry/open-mic/route.ts#L43)  
Severity: Medium  
Category: Security / Integration  
Description: This proxy also opts out of local Turnstile verification with `skipTurnstile: true`, but it never forwards an `x-turnstile-token` header. I also verified the current form does not submit any `turnstile_token` at all: [OpenMicPerformerInterestForm.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/open-mic/OpenMicPerformerInterestForm.tsx#L40), [OpenMicPerformerInterestForm.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/open-mic/OpenMicPerformerInterestForm.tsx#L94).  
Impact: Inference: this endpoint is either bypassing the new CAPTCHA requirement entirely, or it will hard-fail once the management API enforces Turnstile on performer-interest submissions.  
Suggested fix: Decide ownership explicitly. Either add Turnstile to the open-mic form and forward the token header, or remove `skipTurnstile` and verify locally if this endpoint is intentionally website-only.

`BUG-003`  
File: [lib/spam-protection.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/spam-protection.ts#L106), [app/api/enquiry/open-mic/route.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/api/enquiry/open-mic/route.ts#L8)  
Severity: Medium  
Category: Anti-spam / Logic  
Description: The spam middleware only treats `website` and `honeypot_field` as honeypots. The open-mic flow uses a hidden field named `honeypot`, and the route schema explicitly accepts it instead of blocking on it.  
Impact: Bots filling the open-mic honeypot are not absorbed locally and can reach the management API.  
Suggested fix: Treat `body.honeypot` as a honeypot signal in `checkSpamProtection`, and strip all anti-spam-only fields before forwarding proxied payloads upstream.

`BUG-004`  
File: [app/api/public/private-booking/route.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/api/public/private-booking/route.ts#L138), [app/api/public/private-booking/route.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/api/public/private-booking/route.ts#L149)  
Severity: Medium  
Category: Partial Failure / Runtime  
Description: The proxy does `await res.json()` unconditionally. Any empty response, CDN HTML error, or non-JSON upstream failure throws and lands in the outer catch, which rewrites the original status/body to a generic 500 `PROXY_ERROR`.  
Impact: Users lose the real upstream failure reason and status, and troubleshooting becomes much harder during partial upstream outages.  
Suggested fix: Read `await res.text()`, parse with `safeJsonParse`, and normalize success/error responses the same way the other proxy routes do.

`BUG-005`  
File: [lib/spam-protection.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/spam-protection.ts#L9), [app/api/customers/lookup/route.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/api/customers/lookup/route.ts#L49)  
Severity: Medium  
Category: Rate Limiting / Availability  
Description: Both rate limiters key off `x-forwarded-for` only and fall back to the literal string `'unknown'` when it is absent. In any environment where that header is missing or stripped, all users share one bucket.  
Impact: After a few requests, unrelated users can start receiving 429s from spam protection or degraded `known:false` responses from customer lookup.  
Suggested fix: Fall back to `x-real-ip`, and if no trustworthy IP exists either skip strict limiting or use a separate low-confidence bucket with explicit logging.

`BUG-006`  
File: [app/api/table-bookings/route.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/api/table-bookings/route.ts#L235)  
Severity: Medium-Low  
Category: Data Integrity / Compatibility  
Description: The legacy normalization branch reads `customer.first_name`, `customer.last_name`, and `customer.email`, but only copies them into `notes`; it never forwards them as structured `first_name`, `last_name`, or `email` even though the upstream payload type supports those fields.  
Impact: Any caller still using the compatibility shape loses structured identity/email data upstream, which can weaken customer matching, confirmations, and admin workflows.  
Suggested fix: Populate the structured fields from `legacy.customer` in the returned `ManagementTableBookingPayload`, not just the notes blob.

**Assumptions**
I assumed the management API now enforces Turnstile on all proxy-backed submission endpoints because the reviewed routes consistently use `skipTurnstile: true`. If `performer-interest` is intentionally exempt, `BUG-002` is a security-gap finding rather than a hard-failure finding.

No direct defect stood out in [lib/turnstile.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/turnstile.ts); the higher-risk issues are in how the routes bypass or fail to forward Turnstile verification.

**Verification**
Static review only. I did not run Jest or call the upstream API.