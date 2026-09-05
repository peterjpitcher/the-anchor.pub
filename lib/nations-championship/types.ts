import { z } from 'zod'

const instant = z.string().datetime({ offset: true })
const windowSchema = z.object({ startAt: instant, endAt: instant }).refine(
  value => Date.parse(value.startAt) < Date.parse(value.endAt), 'Invalid service interval'
)
export const screeningHoursSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  state: z.enum(['open', 'closed', 'unknown']),
  regularOpensAt: instant.nullable(),
  bar: windowSchema.nullable(),
  kitchen: z.array(windowSchema),
  kitchenState: z.enum(['known', 'unknown']),
  hasSpecialHours: z.boolean(),
  fingerprint: z.string(),
})
export const screeningFixtureSchema = z.object({
  id: z.string().uuid(),
  importKey: z.string(),
  sport: z.enum(['football', 'rugby_union']),
  round: z.string(),
  roundNumber: z.number().int().nullable(),
  finalPosition: z.number().int().nullable(),
  teamA: z.string().min(1).max(100),
  teamB: z.string().min(1).max(100),
  teamsConfirmed: z.boolean(),
  kickOffAt: instant,
  plannedEndAt: instant.nullable(),
  matchState: z.enum(['scheduled', 'in_progress', 'finished', 'cancelled']),
  bookingApproved: z.boolean().default(false),
  screeningDecision: z.enum(['unconfirmed', 'confirmed', 'not_showing']),
  broadcastDecision: z.enum(['unconfirmed', 'confirmed', 'not_linear']),
  linearChannel: z.string().nullable(),
  screenLabel: z.string().nullable(),
  commentary: z.enum(['unconfirmed', 'on', 'off']),
  coverage: z.enum(['full', 'from_opening', 'until_closing', 'from_opening_until_closing']),
  sourceUrl: z.string().url().nullable(),
  sourceCheckedAt: instant.nullable(),
  broadcastCheckedAt: instant.nullable(),
  screeningConfirmedAt: instant.nullable(),
  contentRevision: z.number().int().nonnegative(),
  bookingUrl: z.string().url().nullable(),
  hours: screeningHoursSchema,
  screening: z.object({
    status: z.enum(['awaiting_channel', 'awaiting_decision', 'hours_unknown', 'opening_conflict', 'confirmed_full', 'confirmed_partial', 'not_showing', 'finished', 'cancelled']),
    screeningStartAt: instant.nullable(),
    screeningEndAt: instant.nullable(),
    openingLabel: z.string(),
    kitchenLabel: z.string(),
    foodPromotion: z.object({
      kind: z.enum(['during_screening', 'before_match', 'none', 'unknown']),
      serviceWindows: z.array(windowSchema),
      overlapWindows: z.array(windowSchema),
      message: z.string().nullable(),
    }),
    canBookForScreening: z.boolean(),
    canGenerateTeamPromotion: z.boolean(),
    hoursFingerprint: z.string(),
  }),
})
export const screeningFeedSchema = z.object({
  schemaVersion: z.literal(2),
  tournament: z.object({ id: z.string().uuid(), name: z.string(), slug: z.string(), status: z.string() }),
  fixtures: z.array(screeningFixtureSchema),
  meta: z.object({ fetchedAt: instant, contentUpdatedAt: instant.nullable() }),
})
export type ScreeningFeed = z.infer<typeof screeningFeedSchema>
export type ScreeningFixture = z.infer<typeof screeningFixtureSchema>
export type ScreeningDayHours = z.infer<typeof screeningHoursSchema>
export type ServiceWindow = z.infer<typeof windowSchema>

/** Do not trust a stale serialized CTA flag after the screening has ended. */
export function isBookableScreening(fixture: ScreeningFixture, now = new Date()): boolean {
  const start = Date.parse(fixture.screening.screeningStartAt ?? '')
  const end = Date.parse(fixture.screening.screeningEndAt ?? '')
  const bar = fixture.hours.bar
  const approved = fixture.bookingApproved && fixture.screeningDecision !== 'not_showing'
  const plannedEnd = Date.parse(fixture.plannedEndAt ?? '')
  // Same two-hour planning duration as lib/api/bookings.ts, never a final-whistle promise.
  const bookingEnd = fixture.plannedEndAt === null
    ? Date.parse(fixture.kickOffAt) + 120 * 60_000 : plannedEnd
  const expectedEnd = approved && bar ? Math.min(bookingEnd, Date.parse(bar.endAt)) : plannedEnd
  const technicalDetailsConfirmed = fixture.screeningDecision === 'confirmed' &&
    Boolean(fixture.linearChannel?.trim() && fixture.screenLabel?.trim())
  return fixture.screening.canBookForScreening &&
    ['confirmed_full', 'confirmed_partial'].includes(fixture.screening.status) &&
    (approved || technicalDetailsConfirmed) && fixture.broadcastDecision === 'confirmed' &&
    !['cancelled', 'finished'].includes(fixture.matchState) &&
    fixture.hours.state === 'open' && Boolean(bar) &&
    Boolean(fixture.broadcastCheckedAt && fixture.screeningConfirmedAt) &&
    fixture.screening.hoursFingerprint === fixture.hours.fingerprint &&
    Number.isFinite(start) && start >= Date.parse(fixture.kickOffAt) &&
    start >= Date.parse(bar!.startAt) && end <= Date.parse(bar!.endAt) &&
    end === expectedEnd && end > start && end > now.getTime()
}
