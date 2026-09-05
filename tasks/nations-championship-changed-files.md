# Nations Championship changed-file manifest

Status: local only. Paths below are relative to the named isolated worktree. Original checkouts and unrelated edits are preserved.

## Management

Worktree: `/Users/peterpitcher/Cursor/.worktrees/nations-management`

- `src/app/api/business/screening-hours/route.ts`
- `src/app/api/table-bookings/route.ts`
- `src/lib/business-hours/screening-contract.ts`
- `src/lib/business-hours/screening-hours.ts`
- `src/lib/table-bookings/booking-idempotency.test.ts`
- `src/lib/table-bookings/booking-idempotency.ts`
- `tests/api/business/screening-hours.test.ts`
- `tests/api/tableBookingStructuredPersistence.test.ts`
- `tests/lib/business-hours/screening-hours.test.ts`
- `vitest.screening.config.ts`

## Cheers

Worktree: `/Users/peterpitcher/Cursor/.worktrees/nations-cheers`

- `docs/imports/nations-championship-2026.csv`
- `src/app/actions/tournament.ts`
- `src/app/api/feed/[tournamentId]/route.ts`
- `src/features/tournament/components/CreateTournamentModal.tsx`
- `src/features/tournament/components/FixtureModal.test.tsx`
- `src/features/tournament/components/FixtureModal.tsx`
- `src/features/tournament/components/FixtureRow.tsx`
- `src/features/tournament/components/FixtureTable.tsx`
- `src/features/tournament/components/ImportFixturesModal.tsx`
- `src/features/tournament/components/TournamentSettingsModal.tsx`
- `src/lib/management-app/screening-hours.test.ts`
- `src/lib/management-app/screening-hours.ts`
- `src/lib/publishing/handler.integration.test.ts`
- `src/lib/publishing/handler.test.ts`
- `src/lib/publishing/handler.ts`
- `src/lib/publishing/preflight.ts`
- `src/lib/tournament/content-freshness.test.ts`
- `src/lib/tournament/content-freshness.ts`
- `src/lib/tournament/generate.ts`
- `src/lib/tournament/placeholder.ts`
- `src/lib/tournament/queries.ts`
- `src/lib/tournament/rugby-content.test.ts`
- `src/lib/tournament/rugby-regeneration.test.ts`
- `src/lib/tournament/screening-mutation.ts`
- `src/lib/tournament/screening-service.ts`
- `src/lib/tournament/screening.test.ts`
- `src/lib/tournament/screening.ts`
- `src/lib/tournament/validation.ts`
- `src/types/tournament.ts`
- `supabase/functions/_shared/nations-content-contract.ts`
- `supabase/functions/publish-queue/tournament-freshness.ts`
- `supabase/functions/publish-queue/worker.ts`
- `supabase/migrations/20260905071016_nations_championship_screenings.sql`
- `supabase/migrations/20260905072213_tournament_screening_revision_guard.sql`
- `tasks/PLAN-nations-championship.md`
- `tasks/SPEC-nations-championship.md`
- `tests/app/tournament-import.test.ts`
- `tests/app/tournament-screening-actions.test.ts`
- `tests/feed-route.test.ts`
- `tests/publish-queue.test.ts`
- `tests/supabase/publish-queue/tournament-freshness.test.ts`

## Website

Worktree: `/Users/peterpitcher/Cursor/.worktrees/nations-website`

- `.env.example`
- `app/api/nations-championship/calendar/[fixtureId]/route.ts`
- `app/api/nations-championship/route.ts`
- `app/api/table-bookings/route.ts`
- `app/book-table/page.tsx`
- `app/live-sport/nations-championship/page.tsx`
- `app/live-sport/page.tsx`
- `app/live-sport/six-nations/page.tsx`
- `app/page.tsx`
- `app/sitemap-page/page.tsx`
- `app/sitemap.ts`
- `app/staines-pub/page.tsx`
- `app/whats-on/page.tsx`
- `components/features/TableBooking/ManagementTableBookingForm.tsx`
- `components/features/nations-championship/FixtureCard.tsx`
- `components/features/nations-championship/NationsChampionshipFixtures.tsx`
- `components/features/nations-championship/TournamentLink.tsx`
- `components/layout/StickyCtas.tsx`
- `content/nations-championship.ts`
- `lib/gtm-events.ts`
- `lib/nations-championship/booking-context-shared.ts`
- `lib/nations-championship/booking-context.ts`
- `lib/nations-championship/calendar.ts`
- `lib/nations-championship/config.ts`
- `lib/nations-championship/feed.ts`
- `lib/nations-championship/tracking.ts`
- `lib/nations-championship/types.ts`
- `lib/table-booking-idempotency.ts`
- `lib/table-booking/submission.ts`
- `scripts/nations-smoke-server.cjs`
- `scripts/nations-smoke.cjs`
- `tasks/nations-championship-changed-files.md`
- `tasks/nations-championship-migration-packet.md`
- `tasks/nations-championship-operations.md`
- `tasks/nations-championship-release-approval.md`
- `tasks/nations-championship-release-evidence.md`
- `tasks/plan-2026-09-05-nations-championship.md`
- `tasks/spec-2026-09-05-nations-championship.md`
- `tests/api/nations-booking.test.ts`
- `tests/api/nations-championship.test.ts`
- `tests/fixtures/nations-championship.ts`
- `tests/lib/nations-championship-calendar.test.ts`
- `tests/lib/nations-championship-feed.test.ts`
- `tests/lib/nations-screening-eligibility.test.ts`
- `tests/unit/ManagementTableBookingForm.fourStep.test.tsx`
- `tests/unit/ManagementTableBookingForm.twoScreen.test.tsx`
- `tests/unit/NationsChampionshipFixtures.test.tsx`
- `tests/unit/nations-booking-context.test.ts`
- `tests/unit/nations-tracking.test.ts`
- `tests/unit/slot-selection.test.ts`
- `tests/unit/table-booking-idempotency.test.ts`
- `tests/unit/table-booking-tracking.test.ts`

## Deliberately left unchanged

- Management: existing `/api/business/hours`, weekly-hours resolver and stored opening/kitchen data; deposit/payment policies and unrelated invoices/design-system work.
- Cheers: existing football tournament data and provider credentials; old football feed contract remains supported. No live fixture rows or queued posts were modified.
- Website: existing World Cup reader/key, menu facts/prices, SSOT hours and ordinary booking/deposit rules. Existing form and POST files changed only to carry fixture context and recover attempts.
- All original checkouts, unrelated branches, dependency manifests/lockfiles and production configuration remain untouched by this implementation. New configuration is documented in the website example only.

Two Cheers migrations are committed but unapplied. There is no Management migration. The release packet names the exact files and hashes.
