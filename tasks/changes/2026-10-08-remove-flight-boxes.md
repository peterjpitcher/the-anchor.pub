# The flight boxes on the terminal pages, 8 October 2026

Branch `fix/remove-flight-boxes-p19`. Website only. Source: work package P19 of the 7 October 2026 site review (findings LS-013, PC-016, PL-007) and owner decision 14: remove the flight boxes.

## Why

The two flight boxes on the four Heathrow terminal pages asked their provider for data over an unencrypted address. A browser on the live site refuses that, so the boxes cannot have shown a flight for some time. With no data, one box said "All flights running on schedule", which nobody had checked. A failed request was retried in a tight loop. The provider's key was published in the site's JavaScript.

## What was removed

- [x] **The boxes.** The "Live Terminal N Flight Information" band and the delay box at the top of "Terminal N Travel Tips", on `/near-heathrow/terminal-2`, `-3`, `-4` and `-5`. The band was a section of its own between two others, so the page closes up with nothing left behind: the band before it is the lighter background and the Travel Tips band after it is the darker one, so the two still alternate.
- [x] **The code.** `components/FlightStatus.tsx` (both boxes), `lib/flights.ts` (the provider client) and `hooks/useErrorHandler.ts`, which only the flight boxes used and whose unstable callback was the cause of the retry loop. `components/ErrorBoundary.tsx` has a hook of the same name of its own and is untouched.
- [x] **The key.** `NEXT_PUBLIC_AVIATIONSTACK_API_KEY` is read nowhere. Removed from `.env.example`, `.env.local.example` and the four files under `docs/architecture/`.
- [x] **The security header.** `http://api.aviationstack.com` is out of `connect-src` in `config/security-headers.json`. It was the only unencrypted address in the policy.
- [x] **The tracking helper.** `trackFlightStatusCheck` in `lib/gtm-events.ts` was never called. Removed.
- [x] **The privacy notice.** The Aviationstack line is out of the list of companies in section 5, and out of the third-party host test in `tests/unit/privacy-policy-inventory.test.tsx`. That test reads the hosts from the security header, so it would fail if the host came back without a line in the notice. The words changed, so the fingerprint in `lib/legal-pages.ts` moved. The date was already 8 October 2026.

## What was left alone

- The pages' own copy about flights ("Use our free WiFi to track their flight", check-in times, airline lists). None of it depends on the boxes. Typed airline lists belong to decision 17 and another package.
- `CLAUDE.md` still lists the key under Environment variables. Builders do not edit that file.

## Assumptions

- "Remove" means the code and the claim, not a replacement. No server route was built to keep flight data.
- The privacy notice date stays at 8 October 2026 because this goes out with the same day's rewrite. If it goes live on a later day, the date moves to that day.
