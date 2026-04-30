# Adversarial Review — /book-table Slot Window + Mobile + Timezone + API Handover

**Date:** 2026-04-30
**Mode:** B (Code Review)
**Scope:** 7 commits `0fc4a1a..716fcf2` on `main` implementing the spec at `tasks/book-table-slot-window/spec.md`
**Pack:** `tasks/codex-qa-review/2026-04-30-book-table-slot-window-review-pack.md` (164 KB)
**Reviewers:** Assumption Breaker (lead), Integration & Architecture, Workflow & Failure-Path, Security & Data Risk

---

## Executive Summary

The slot-window helper, the wizard refactor, the London timezone fixes, the mobile optimisations, and the idempotency-key fingerprinting all match the spec. Codex flagged five blocking findings inside this PR's scope — all addressed in repair commit `716fcf2`. Codex also raised six findings against external SEO commits (`b319ee6`, `7f6a99d`) that landed alongside our PR — those are NOT in scope and were left untouched. Three advisory findings remain for follow-up.

## What Appears Solid

- `pickSlotWindow` helper centralises the windowing logic with deterministic earlier-tie-breaking; preserves object identity; covered by 15 unit tests including BST/GMT boundary anchors.
- `londonIsoDate` now centralises London date formatting; `londonNowParts` routes through it; covered by 4 boundary tests.
- The wizard's `slotWindowAnchorTime` correctly drives `visibleSlots` independently of `requestedTime` (which still mutates on slot selection) — the grid does not jump under the customer's pointer.
- Strict submit-time `purpose` derivation (`deriveSubmitPurpose`) is unchanged and continues to block submission when no matching slot exists.
- Idempotency-key fingerprinting matches the spec byte-for-byte: stable JSON-stringify of trimmed payload fields, excluding `_t`/`turnstile_token`/`website`. Cached via `useRef`. Cleared on `handleFindTable` and `resetJourney` (now also on confirmed booking — see CODEX-AB-003 fix).
- Party-size threading via explicit `targetPartySize` parameter eliminates the stale-closure bug.
- Mobile tap-target and keyboard-hint changes match spec §11; scrollIntoView fires only on step transitions, not on initial mount.

## Critical Risks (all addressed)

### CODEX-AB-001 — `addDays()` BST boundary risk *(addressed in 716fcf2)*
**Original:** `addDays()` used `Date.UTC(...)` then formatted via `londonIsoDate` — Codex flagged this as fragile around BST/GMT transitions.
**Analysis:** UK is always UTC+0 or UTC+1, so UTC midnight always lands in the same UK calendar day; the original code was actually correct.
**Fix nonetheless (defence in depth):** rewrote `addDays` to use pure UTC arithmetic via `getUTCFullYear/Month/Date`. No London-format roundtrip. Result is now timezone-neutral and trivially correct.

### CODEX-AB-002 / WF-003 — Default Preferred Time wraps past midnight *(addressed in 716fcf2)*
**Original:** `getDefaultTimeValue()` returned `'00:00'` when London now + 1 hour rounded crossed midnight, while `today` stayed today. Customer at 23:00 London saw Date=today, Time=00:00 — confusing and submission-rejecting.
**Fix:** clamp to `'23:30'` when `next >= 1440`. The customer can change either field; we don't auto-advance the date because that would also need to coordinate the date input default in lockstep.

### CODEX-AB-003 — Submit-intent key not cleared on confirmed booking *(addressed in 716fcf2)*
**Original:** the cached idempotency key persisted past a successful booking until `resetJourney()` ran. Codex flagged a theoretical scenario where the same payload could be submitted again pre-reset.
**Fix:** `clearSubmitIntentIdempotencyKey()` is now called in the `state === 'confirmed'` branch of `handleConfirmBooking` (defence-in-depth alongside the existing `resetJourney` clear). Not cleared on `pending_payment` (still in flight) or `blocked` (could retry).

### CODEX-ARCH-002 — Anchor mutated by Preferred Time input *(addressed in 716fcf2)*
**Original:** `handleRequestedTimeChange()` set `slotWindowAnchorTime` on every keystroke, violating spec §5.2 ("only on successful search"). Functionally harmless because step 2 is gated on a successful search anyway, but a real spec violation that could regress later.
**Fix:** removed `setSlotWindowAnchorTime(value)` from `handleRequestedTimeChange`. The anchor is now set ONLY in `runAvailabilitySearch` (success path) and `resetJourney` (initial value).

### CODEX-WF-004 — Review-step Back during in-flight submit *(addressed in 716fcf2)*
**Original:** the review-step Back button stayed enabled while the Confirm POST was in flight. The Confirm button correctly disabled via `loading={loading}`, but Back did not. Could allow the customer to navigate away mid-submission and trigger UI race conditions.
**Fix:** added `disabled={loading}` to the review-step Back button.

## Out of scope (different commits)

These were flagged by codex against the SEO commits (`b319ee6`, `7f6a99d`) that landed alongside our PR. They are not in this PR's scope:

| Finding | File | Note |
|---|---|---|
| AB-004, AB-005 | `app/events/[id]/page.tsx:240` | Draft-event redirect behaviour from external SEO commit. |
| AB-007 | `tasks/gsc-indexing-fix/REVIEW-PACK.md` | Docs claim about `next.config.js` not in pack. |
| ARCH-001, ARCH-003 | `app/events/[id]/page.tsx` | Same external commit. |
| WF-001 | `app/events/[id]/page.tsx:240` | Same. |
| ARCH-005 | n/a | "PR mixes unrelated work" — true; the user's external SEO commits landed during, not part of this PR's intent. |

## Advisory (follow-up; not addressed)

### CODEX-AB-006 / ARCH-004 — `pickSlotWindow` assumes sorted slots
The helper picks an array index based on minute distance and slices neighbours. If the API ever returns unsorted slots, the window would be incoherent. The availability route at `app/api/table-bookings/availability/route.ts` already sorts (verified), so this is currently safe. **Recommended follow-up:** add a defensive sort or an assertion in `pickSlotWindow` to make the contract explicit.

### CODEX-WF-002 — Stale `loadNearestAlternatives` race
Same finding from the prior PR's review. If a customer changes search inputs while an alternatives request is in flight, the stale response can repopulate `alternativeSlots`. Real but rare. **Recommended follow-up:** add a request-ID or `AbortController` to `loadNearestAlternatives`.

### CODEX-SEC-001 — Server-side payload binding for idempotency keys
Codex noted that the wizard's fingerprint is client-only. The management API documentation confirms it dedupes by Idempotency-Key + payload hash, so a malicious client cannot reuse one key across different payloads to corrupt a booking. **Verdict:** verified safe, no action needed; flagged for awareness if the management API ever changes.

## Methodology

- Pack built deterministically from `git diff c28d298 HEAD` excluding test files and docs at a 200 KB cap; final pack 164 KB.
- Four reviewers ran via `~/.claude/skills/codex-qa-review/scripts/run-codex-review.sh` against `codex-cli 0.125.0` with `--output-schema` enforcement.
- Per-reviewer JSON outputs preserved at `tasks/codex-qa-review/{assumption-breaker,integration-architecture,workflow-failure-path,security-data-risk}-findings.json`.
- All blocking findings in this PR's scope addressed in commit `716fcf2`. Out-of-scope findings filed for the affected commit owners. Advisory findings flagged below for follow-up PRs.
