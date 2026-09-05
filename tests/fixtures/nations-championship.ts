import type { ScreeningFixture, ScreeningFeed } from '@/lib/nations-championship/types'

export function nationsFixture(overrides: Partial<ScreeningFixture> = {}): ScreeningFixture {
  return {
    id: '10000000-0000-4000-8000-000000000001', importKey: 'test-fixture', sport: 'rugby_union', round: 'league_round', roundNumber: 4, finalPosition: null,
    teamA: 'Italy', teamB: 'South Africa', teamsConfirmed: true, kickOffAt: '2026-11-07T11:40:00Z', plannedEndAt: '2026-11-07T13:40:00Z',
    matchState: 'scheduled', bookingApproved: false, screeningDecision: 'confirmed', broadcastDecision: 'confirmed', linearChannel: 'ITV1', screenLabel: 'Main screen', commentary: 'on', coverage: 'from_opening',
    sourceUrl: 'https://example.com/fixtures', sourceCheckedAt: '2026-09-05T07:00:00Z', broadcastCheckedAt: '2026-09-05T07:00:00Z', screeningConfirmedAt: '2026-09-05T07:00:00Z', contentRevision: 1,
    bookingUrl: 'https://www.the-anchor.pub/book-table?fixture_id=10000000-0000-4000-8000-000000000001',
    hours: { date: '2026-11-07', state: 'open', regularOpensAt: '2026-11-07T12:00:00Z', bar: { startAt: '2026-11-07T12:00:00Z', endAt: '2026-11-07T22:00:00Z' }, kitchen: [{ startAt: '2026-11-07T12:00:00Z', endAt: '2026-11-07T19:00:00Z' }], kitchenState: 'known', hasSpecialHours: false, fingerprint: 'test-hours' },
    screening: { status: 'confirmed_partial', screeningStartAt: '2026-11-07T12:00:00Z', screeningEndAt: '2026-11-07T13:40:00Z', openingLabel: 'Pub open noon to 10pm.', kitchenLabel: 'Kitchen serves noon to 7pm.',
      foodPromotion: { kind: 'during_screening', serviceWindows: [{ startAt: '2026-11-07T12:00:00Z', endAt: '2026-11-07T19:00:00Z' }], overlapWindows: [{ startAt: '2026-11-07T12:00:00Z', endAt: '2026-11-07T13:40:00Z' }], message: 'Food served noon to 7pm. Book a table for food and rugby.' },
      canBookForScreening: true, canGenerateTeamPromotion: true, hoursFingerprint: 'test-hours' },
    ...overrides,
  }
}
export function nationsFeed(fixtures = [nationsFixture()]): ScreeningFeed {
  return { schemaVersion: 2, tournament: { id: '20000000-0000-4000-8000-000000000001', name: 'Nations Championship 2026', slug: 'nations-championship-2026', status: 'active' }, fixtures, meta: { fetchedAt: '2026-09-05T07:00:00Z', contentUpdatedAt: '2026-09-05T07:00:00Z' } }
}

export function approvedNationsFixture(closingOnly = false): ScreeningFixture {
  const fixture = nationsFixture({ bookingApproved: true, screeningDecision: 'unconfirmed', plannedEndAt: null, linearChannel: null, screenLabel: null, commentary: 'unconfirmed' })
  if (closingOnly) {
    fixture.kickOffAt = '2026-11-07T20:10:00Z'
    fixture.coverage = 'until_closing'
    fixture.screening.screeningStartAt = fixture.kickOffAt
    fixture.screening.screeningEndAt = fixture.hours.bar!.endAt
  }
  return fixture
}
