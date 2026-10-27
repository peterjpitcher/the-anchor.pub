'use client'

import type { BookingPeriodMenuItem } from '@/lib/api/bookings'

/**
 * What each guest is eating, for a period that requires a pre-order.
 *
 * One panel per seat, and within a seat one choice per course. That shape is
 * forced by the offer rather than chosen: at Christmas every guest has a main
 * and decides for themselves whether to add a starter, a dessert, or both, so
 * guests at the same table can have different numbers of courses. A single
 * "pick a dish" dropdown cannot express that, and would let someone book a
 * soup as their entire dinner.
 *
 * Prices are printed from the menu row and never totalled here. What the guest
 * pays now is the DEPOSIT, which AMS prices; the meal is settled on the day. A
 * total on this screen would be a second, unreconciled money figure.
 */

export type PreorderChoice = {
  /** Index of the guest in the party, 0-based. Position is the seat. */
  guestIndex: number
  courseCount?: 1 | 2 | 3 | null
  starterId: string | null
  mainId: string | null
  dessertId: string | null
  /** Extras on top of the meal, paid on the day. */
  addonIds: string[]
  /** Optional, for every guest, 1 course included: so the kitchen knows who is who. */
  guestName?: string
  /** Optional, for every guest: a dietary need tied to this guest rather than the whole table. */
  dietaryNote?: string
}

/** The longest name and note the management app keeps for a seat. */
export const PREORDER_GUEST_NAME_MAX = 100
export const PREORDER_DIETARY_NOTE_MAX = 200

/**
 * What a guest is shown for a dish with no allergens recorded. The exact words come from
 * docs/SSOT.md, "Allergen wording": missing data means unknown, never "no allergens".
 */
export const ALLERGEN_FALLBACK = 'See menu or contact us for allergen information'

/**
 * A dish's allergens as one line, or null when the menu records none. The management app sends
 * them as text; an array is accepted too, so an older or newer shape still reads.
 */
export function formatAllergens(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() || null
  if (Array.isArray(value)) {
    const items = value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    return items.length > 0 ? items.map((item) => item.trim()).join(', ') : null
  }
  return null
}

/** The courses a seat picks exactly one of, in menu order. */
const SINGLE_CHOICE_COURSES = [
  { course: 'starter', label: 'Starter', optional: true },
  { course: 'main', label: 'Main', optional: false },
  { course: 'dessert', label: 'Dessert', optional: true }
] as const

type SingleChoiceCourse = (typeof SINGLE_CHOICE_COURSES)[number]['course']

const CHOICE_KEY: Record<SingleChoiceCourse, 'starterId' | 'mainId' | 'dessertId'> = {
  starter: 'starterId',
  main: 'mainId',
  dessert: 'dessertId'
}

export function emptyPreorderChoice(guestIndex: number): PreorderChoice {
  return { guestIndex, starterId: null, mainId: null, dessertId: null, addonIds: [] }
}

/** One row per seat, sized to the party. Existing answers survive a size change. */
export function resizePreorderChoices(choices: PreorderChoice[], partySize: number): PreorderChoice[] {
  return Array.from({ length: Math.max(0, partySize) }, (_, index) => {
    return choices.find((choice) => choice.guestIndex === index) ?? emptyPreorderChoice(index)
  })
}

/** Every seat has a main. Starters, desserts and add-ons are genuinely optional. */
export function isPreorderComplete(choices: PreorderChoice[], partySize: number): boolean {
  if (partySize <= 0) return false
  const sized = resizePreorderChoices(choices, partySize)
  return sized.every((choice) => Boolean(choice.mainId))
}

/** Seats still missing a main, 1-based, for a message the guest can act on. */
export function preorderGuestsMissingMain(choices: PreorderChoice[], partySize: number, courseAware = false): number[] {
  return resizePreorderChoices(choices, partySize)
    .filter((choice) => {
      if (!courseAware) return !choice.mainId
      if (!choice.courseCount) return true
      if (choice.courseCount === 1) return false
      const selected = [choice.starterId, choice.mainId, choice.dessertId].filter(Boolean).length
      return !choice.mainId || selected !== choice.courseCount
    })
    .map((choice) => choice.guestIndex + 1)
}

function formatPounds(amount: number): string {
  return `£${amount.toFixed(2).replace(/\.00$/, '')}`
}

function itemsForCourse(menu: BookingPeriodMenuItem[], course: string): BookingPeriodMenuItem[] {
  return menu.filter((item) => (item.course || '').trim().toLowerCase() === course)
}

export function SeasonalPreorderPicker({
  partySize,
  menu,
  choices,
  preorderCutoffDays,
  courseAware = false,
  multipleCoursesAvailable = true,
  onChange
}: {
  partySize: number
  menu: BookingPeriodMenuItem[]
  choices: PreorderChoice[]
  preorderCutoffDays?: number | null
  courseAware?: boolean
  multipleCoursesAvailable?: boolean
  onChange(choices: PreorderChoice[]): void
}) {
  const sized = resizePreorderChoices(choices, partySize)
  const addons = itemsForCourse(menu, 'addon')

  function update(guestIndex: number, patch: Partial<PreorderChoice>) {
    onChange(sized.map((choice) => (choice.guestIndex === guestIndex ? { ...choice, ...patch } : choice)))
  }

  function dishAllergens(itemId: string | null): string | null {
    if (!itemId) return null
    const item = menu.find((entry) => entry.id === itemId)
    return item ? formatAllergens(item.allergens) ?? ALLERGEN_FALLBACK : null
  }

  function toggleAddon(guestIndex: number, itemId: string, ticked: boolean) {
    const current = sized.find((choice) => choice.guestIndex === guestIndex)?.addonIds ?? []
    const next = ticked
      ? Array.from(new Set([...current, itemId]))
      : current.filter((id) => id !== itemId)
    update(guestIndex, { addonIds: next })
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-display text-h5 text-ink-strong">Choose what everyone is eating</h4>
        <p className="mt-1 text-sm text-ink-muted">
          {courseAware
            ? `Choose each guest's number of courses. One course needs no pre-order. Two or three courses need menu choices by noon ${preorderCutoffDays ?? 7} days before your booking.`
            : `Every guest has a main. Add a starter, a dessert, or both. The kitchen needs these ${preorderCutoffDays ?? 7} days before your booking.`}
          {courseAware && !multipleCoursesAvailable ? ' The pre-order deadline has passed for this date. Choose one course or contact the team.' : ''}
          {" You can add each guest's name and any dietary needs too, so the kitchen knows who's who."}
        </p>
      </div>

      {sized.map((choice) => {
        const guestNumber = choice.guestIndex + 1
        return (
          <fieldset key={choice.guestIndex} className="rounded-md border border-line bg-surface p-3">
            <legend className="px-1 text-sm font-semibold text-ink-strong">Guest {guestNumber}</legend>

            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor={`preorder-guest-${choice.guestIndex}-name`} className="block text-sm text-ink-strong">
                    Name <span className="text-ink-muted">(optional)</span>
                  </label>
                  <input
                    id={`preorder-guest-${choice.guestIndex}-name`}
                    type="text"
                    autoComplete="off"
                    maxLength={PREORDER_GUEST_NAME_MAX}
                    value={choice.guestName ?? ''}
                    onChange={(event) => update(choice.guestIndex, { guestName: event.target.value })}
                    className="mt-1 min-h-[44px] w-full rounded-md border border-line-field bg-surface px-3 py-2 text-sm text-ink"
                  />
                </div>
                <div>
                  <label htmlFor={`preorder-guest-${choice.guestIndex}-dietary`} className="block text-sm text-ink-strong">
                    Dietary needs <span className="text-ink-muted">(optional)</span>
                  </label>
                  <input
                    id={`preorder-guest-${choice.guestIndex}-dietary`}
                    type="text"
                    autoComplete="off"
                    maxLength={PREORDER_DIETARY_NOTE_MAX}
                    placeholder="For example, no dairy"
                    value={choice.dietaryNote ?? ''}
                    onChange={(event) => update(choice.guestIndex, { dietaryNote: event.target.value })}
                    className="mt-1 min-h-[44px] w-full rounded-md border border-line-field bg-surface px-3 py-2 text-sm text-ink"
                  />
                </div>
              </div>
              {courseAware ? (
                <div>
                  <label htmlFor={`course-count-${choice.guestIndex}`} className="block text-sm text-ink-strong">Number of courses</label>
                  <select id={`course-count-${choice.guestIndex}`} value={choice.courseCount ?? ''}
                    className="mt-1 min-h-[44px] w-full rounded-md border border-line-field bg-surface px-3 py-2 text-sm text-ink"
                    onChange={(event) => update(choice.guestIndex, {
                      courseCount: event.target.value ? Number(event.target.value) as 1 | 2 | 3 : null,
                      starterId: null, mainId: null, dessertId: null, addonIds: []
                    })}>
                    <option value="">Please choose...</option>
                    <option value="1">1 course, no pre-order</option>
                    <option value="2" disabled={!multipleCoursesAvailable}>2 courses</option>
                    <option value="3" disabled={!multipleCoursesAvailable}>3 courses</option>
                  </select>
                </div>
              ) : null}
              {(!courseAware || (choice.courseCount ?? 0) > 1) && SINGLE_CHOICE_COURSES.map(({ course, label, optional }) => {
                const items = itemsForCourse(menu, course)
                if (items.length === 0) return null

                const selectId = `preorder-guest-${choice.guestIndex}-${course}`
                return (
                  <div key={course}>
                    <label htmlFor={selectId} className="block text-sm text-ink-strong">
                      {label}
                      {optional ? <span className="text-ink-muted"> (optional)</span> : null}
                    </label>
                    <select
                      id={selectId}
                      value={choice[CHOICE_KEY[course]] ?? ''}
                      onChange={(event) => update(choice.guestIndex, { [CHOICE_KEY[course]]: event.target.value || null })}
                      aria-describedby={choice[CHOICE_KEY[course]] ? `${selectId}-allergens` : undefined}
                      className="mt-1 min-h-[44px] w-full rounded-md border border-line-field bg-surface px-3 py-2 text-sm text-ink"
                    >
                      <option value="">{optional ? 'No ' + label.toLowerCase() : 'Please choose...'}</option>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                          {typeof item.price_gbp === 'number' ? ` (${formatPounds(item.price_gbp)})` : ''}
                        </option>
                      ))}
                    </select>
                    {/* The chosen dish's allergens, beside the choice, so a guest can check before booking. */}
                    {choice[CHOICE_KEY[course]] ? (
                      <p id={`${selectId}-allergens`} className="mt-1 text-xs text-ink-muted">
                        Allergens: {dishAllergens(choice[CHOICE_KEY[course]])}
                      </p>
                    ) : null}
                  </div>
                )
              })}

              {addons.length > 0 && (!courseAware || (choice.courseCount ?? 0) > 1) && (
                <div>
                  <span className="block text-sm text-ink-strong">Extras (optional)</span>
                  {/* Priced here because an add-on is a real charge the guest has
                      not paid: it goes on the bill on the day, unlike the courses,
                      which the tier price already covers. */}
                  <p className="mt-1 text-xs text-ink-muted">Added to your bill at the pub on the day, not now.</p>
                  {addons.map((item) => {
                    const inputId = `preorder-guest-${choice.guestIndex}-addon-${item.id}`
                    return (
                      <label key={item.id} htmlFor={inputId} className="mt-2 flex items-start gap-2 text-sm text-ink">
                        <input
                          id={inputId}
                          type="checkbox"
                          checked={choice.addonIds.includes(item.id)}
                          onChange={(event) => toggleAddon(choice.guestIndex, item.id, event.target.checked)}
                          className="mt-1 h-4 w-4"
                        />
                        <span>
                          {item.name}
                          {typeof item.price_gbp === 'number' ? ` (${formatPounds(item.price_gbp)})` : ''}
                          <span className="block text-xs text-ink-muted">
                            Allergens: {formatAllergens(item.allergens) ?? ALLERGEN_FALLBACK}
                          </span>
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          </fieldset>
        )
      })}
    </div>
  )
}
