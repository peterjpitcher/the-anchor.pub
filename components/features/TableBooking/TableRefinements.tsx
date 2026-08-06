'use client'

import { PhoneLink } from '@/components/PhoneLink'
import { CONTACT } from '@/lib/constants'
import { HIGH_CHAIR_HOUSE_CAP } from '@/lib/table-booking/journey'

/**
 * "Anything that changes the table?" Every question whose answer changes which
 * TABLES qualify lives here, on screen 1, directly above the times it filters
 * (spec D2). Nothing in this group may ever appear after a time is chosen: that
 * ordering is the whole point of the redesign.
 */

/**
 * Owner-approved copy, verbatim (spec §4.5). The facts in it were checked
 * against the production `tables` rows on 2026-07-29. Do not reword it: if the
 * physical facts change, the copy and the table flags change together. It never
 * calls the pub "accessible", because with no accessible toilet that would be
 * false.
 */
export const STEP_FREE_TABLE_EXPLANATION =
  'You will get a table with step-free access and standard-height seating. That rules out two of our ten tables: the Small Bay, which has a step, and the High 4, which is bar stools. The garden is step free. We do not have an accessible toilet. If you would like to talk it through first, call us on 01753 682707.'

// The number is rendered as a tel: link so a guest on a phone can just tap it.
// Split from the constant above rather than retyped, so the paragraph's text is
// provably the approved copy and cannot drift from it.
const PHONE_NUMBER_IN_COPY = '01753 682707'
const [STEP_FREE_COPY_BEFORE_PHONE, STEP_FREE_COPY_AFTER_PHONE] =
  STEP_FREE_TABLE_EXPLANATION.split(PHONE_NUMBER_IN_COPY)

export type TableRefinementsProps = {
  drinksOnly: boolean
  onDrinksOnlyChange: (value: boolean) => void
  isOutsideSeating: boolean
  onOutsideSeatingChange: (value: boolean) => void
  requiresAccessibleTable: boolean
  onRequiresAccessibleTableChange: (value: boolean) => void
  highChairCount: number
  onHighChairCountChange: (value: number) => void
}

/**
 * Nothing here is ever disabled, including while a re-read is in flight. The
 * request machinery is already latest-wins, so a second change during the first
 * one is safe; locking the controls instead would mean a guest who ticked the
 * wrong box has to wait for the network before they can untick it, and a
 * request that never settles would lock them out for good.
 */
export function TableRefinements({
  drinksOnly,
  onDrinksOnlyChange,
  isOutsideSeating,
  onOutsideSeatingChange,
  requiresAccessibleTable,
  onRequiresAccessibleTableChange,
  highChairCount,
  onHighChairCountChange
}: TableRefinementsProps) {
  const chairChoices = Array.from({ length: HIGH_CHAIR_HOUSE_CAP + 1 }, (_, value) => value)

  return (
    <fieldset className="space-y-3 rounded-lg border border-line bg-surface-subtle p-4">
      <legend className="px-1 text-sm font-semibold text-ink-strong">
        Anything that changes the table?
      </legend>

      {/*
        This box does NOT reveal extra times. The availability route always builds
        the grid from the DRINKS answer, for everyone, because the pub is open for
        drinks whenever it is open at all. Kitchen-closed times are already on
        screen either way, captioned "Drinks only" per slot. Ticking it changes
        what the booking IS: bar seating, a shorter turn, and out of kitchen
        pacing. The copy claimed it revealed kitchen-closed times until 2026-08-06,
        which was never true.
      */}
      <label className="flex min-h-11 items-start gap-3 py-1 text-sm">
        <input
          type="checkbox"
          checked={drinksOnly}
          onChange={(event) => onDrinksOnlyChange(event.target.checked)}
          className="mt-0.5 h-5 w-5 accent-anchor-green"
        />
        <span>
          <span className="font-medium text-ink-strong">Just drinks, no food</span>
          <span className="block text-ink-muted">
            We will seat you in the bar, and your table will not be held for food.
          </span>
        </span>
      </label>

      {/*
        An outside booking holds a GARDEN table and nothing else. It is skipped by
        inside-table allocation entirely, and a database constraint forbids pinning
        one to an inside table, so there is no wet-weather table held in reserve.
        Every one of the outside bookings on record has zero inside-table
        assignments. The copy said "and a table inside if it does not" until
        2026-08-06, which promised something the system has never done. Do not put
        that promise back unless outside bookings start holding an inside table too.
      */}
      <label className="flex min-h-11 items-start gap-3 py-1 text-sm">
        <input
          type="checkbox"
          checked={isOutsideSeating}
          onChange={(event) => onOutsideSeatingChange(event.target.checked)}
          className="mt-0.5 h-5 w-5 accent-anchor-green"
        />
        <span>
          <span className="font-medium text-ink-strong">Outside table, weather permitting</span>
          <span className="block text-ink-muted">
            We will reserve you a table in the garden. If the weather turns we will find you a
            spot inside if we can, so it is worth ringing us on the day.
          </span>
        </span>
      </label>

      <label className="flex min-h-11 items-start gap-3 py-1 text-sm">
        <input
          type="checkbox"
          checked={requiresAccessibleTable}
          onChange={(event) => {
            // Deliberately NOT tracked. A step-free seating request infers a
            // mobility impairment, which is special-category data under UK GDPR
            // Article 9, and analytics-cookie consent is not Article 9 explicit
            // consent. See the rules at the top of lib/gtm-events.ts.
            onRequiresAccessibleTableChange(event.target.checked)
          }}
          className="mt-0.5 h-5 w-5 accent-anchor-green"
        />
        <span className="font-medium text-ink-strong">Step-free, standard-height table</span>
      </label>

      {requiresAccessibleTable ? (
        <p
          className="rounded-sm border border-line bg-surface px-3 py-3 text-sm text-ink"
          data-testid="step-free-explanation"
        >
          {STEP_FREE_COPY_BEFORE_PHONE}
          <PhoneLink
            phone={CONTACT.phone}
            source="table_booking_step_free_table"
            showIcon={false}
            className="font-semibold underline"
          >
            {PHONE_NUMBER_IN_COPY}
          </PhoneLink>
          {STEP_FREE_COPY_AFTER_PHONE}
        </p>
      ) : null}

      <div className="pt-1">
        <p className="text-sm font-medium text-ink-strong" id="high-chair-label">
          High chairs
        </p>
        <p className="mt-0.5 text-sm text-ink-muted">
          For babies and toddlers. We have a limited number, reserved first come first served.
        </p>
        <div
          role="radiogroup"
          aria-labelledby="high-chair-label"
          className="mt-2 flex gap-2"
        >
          {chairChoices.map((value) => {
            const isSelected = highChairCount === value
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={
                  value === 0
                    ? 'No high chairs'
                    : `${value} high chair${value === 1 ? '' : 's'}`
                }
                onClick={() => onHighChairCountChange(value)}
                className={`min-h-12 flex-1 rounded-pill border-[1.5px] px-4 py-3 text-base font-semibold transition-colors ${
                  isSelected
                    ? 'border-anchor-green bg-anchor-green text-white'
                    : 'border-line-strong bg-surface text-ink hover:border-anchor-gold'
                }`}
              >
                {value}
              </button>
            )
          })}
        </div>
      </div>
    </fieldset>
  )
}
