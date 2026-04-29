# Claude Hand-Off Brief: Heathrow Parking Availability Fix & Wizard Priority

**Generated:** 2026-04-20
**Review mode:** A (Adversarial)
**Overall risk:** High (data-fix underspecified; root cause unconfirmed)

## DO NOT REWRITE

- The FORBIDDEN trace path analysis (pub proxy → management withApiAuth → permission check → 403)
- The wizard section move approach (move existing section with `id="book-parking"`)
- The narrow permission scope decision (`parking:availability` not `*`)
- The "What Is NOT Changing" boundary — preserve this scope discipline

## SPEC REVISION REQUIRED

- [ ] **AB-001**: Add a pre-fix verification step: query the live `api_keys` table to confirm the pub key is active, unexpired, and specifically lacks `parking:availability`
- [ ] **AB-003/ARCH-001**: Add a full permission audit step: trace every API call the `ParkingBookingWizard` makes (rates, availability, booking creation, payment) and verify each required permission exists on the pub key
- [ ] **AB-004/ARCH-002/SEC-001/SEC-002**: Replace the placeholder SQL with: (a) preflight SELECT showing current permissions, (b) idempotent JSONB append using `WHERE` on key name/environment, (c) expected row count assertion (exactly 1), (d) rollback SQL
- [ ] **AB-002**: Clarify key identification — use key name, hash fingerprint, or environment column, never the raw secret value
- [ ] **ARCH-003**: Add deployed-site verification: call the pub's public `/api/parking/availability` endpoint (not the management API directly) as the primary success check
- [ ] **ARCH-004**: Check terminal pages for wizard usage and add to regression scope if present
- [ ] **AB-005**: Document cache behaviour — note TTL and whether a purge is needed after the data fix
- [ ] **SEC-003**: Verification steps must use `$ANCHOR_API_KEY` env var, never expose the raw key in commands, logs, or artefacts

## ASSUMPTIONS TO RESOLVE

- [ ] Is the pub API key active and unexpired? (query `api_keys` table)
- [ ] What permissions does the key currently have? (inspect `permissions` JSONB)
- [ ] Do rates/bookings/payment endpoints require separate permissions? (check `withApiAuth` calls)
- [ ] Do terminal pages (`/heathrow-parking/[terminal]`) use the `ParkingBookingWizard`?
- [ ] Are 4xx responses cached by Vercel/CDN?

## REPO CONVENTIONS TO PRESERVE

- Supabase admin client for system operations (not anon key)
- JSONB `permissions` array pattern in `api_keys` table
- `withApiAuth` permission string format (e.g. `parking:availability`, not `parking.availability`)
- Server-side proxy pattern: pub website never exposes management API key client-side

## RE-REVIEW REQUIRED AFTER FIXES

- [ ] AB-001: Re-review after live key query confirms root cause
- [ ] AB-003/ARCH-001: Re-review after full permission audit added to spec

## REVISION PROMPT

```
Update the spec at docs/superpowers/specs/2026-04-20-heathrow-parking-availability-fix-and-wizard-priority.md to address the codex QA findings:

1. Add a "Pre-Fix Verification" section before "Proposed Changes" that requires querying the live api_keys table to confirm root cause
2. Add a "Full Permission Audit" subsection listing every ParkingBookingWizard API call and its required management permission
3. Replace the placeholder data-fix SQL with idempotent, production-safe SQL including preflight SELECT, append-if-missing UPDATE, row count assertion, and rollback
4. Add key identification guidance (use name/fingerprint, never raw secret)
5. Update verification plan to test the deployed pub site's /api/parking/availability (not just management API directly)
6. Check terminal pages for wizard usage and document findings
7. Add cache behaviour note
8. Update verification steps to reference env vars, not raw keys
```
