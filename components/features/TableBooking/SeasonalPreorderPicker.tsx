'use client'

import type { BookingPeriodMenuItem } from '@/lib/api/bookings'

/**
 * One menu choice per guest, for a period that requires a pre-order.
 *
 * Shape borrowed from the retired Sunday-lunch pre-order rather than invented:
 * a row per guest, each row choosing from the published courses. That shape was
 * deliberately kept when Sunday pre-ordering was retired, precisely so this
 * could reuse it.
 *
 * Prices are printed from the menu row and never totalled here. What the guest
 * pays now is the DEPOSIT, which AMS prices; the meal itself is settled on the
 * day. A total on this screen would be a second, unreconciled money figure.
 */

export type PreorderChoice = {
  /** Index of the guest in the party, 0-based. */
  guestIndex: number
  itemId: string
}

function formatPounds(amount: number): string {
  return `£${amount.toFixed(2).replace(/\.00$/, '')}`
}

export function SeasonalPreorderPicker({
  partySize,
  menu,
  choices,
  onChange
}: {
  partySize: number
  menu: BookingPeriodMenuItem[]
  choices: PreorderChoice[]
  onChange(choices: PreorderChoice[]): void
}) {
  // Grouped by course so the guest reads a menu, not a flat list.
  const courses = menu.reduce<Map<string, BookingPeriodMenuItem[]>>((acc, item) => {
    const list = acc.get(item.course) ?? []
    list.push(item)
    acc.set(item.course, list)
    return acc
  }, new Map())

  function choiceFor(guestIndex: number): string {
    return choices.find((choice) => choice.guestIndex === guestIndex)?.itemId ?? ''
  }

  function setChoice(guestIndex: number, itemId: string) {
    const next = choices.filter((choice) => choice.guestIndex !== guestIndex)
    if (itemId) next.push({ guestIndex, itemId })
    next.sort((a, b) => a.guestIndex - b.guestIndex)
    onChange(next)
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-display text-h5 text-ink-strong">Choose a dish for each guest</h4>
        <p className="mt-1 text-sm text-ink-muted">
          We need everyone&apos;s choice up front so the kitchen can prepare on the day.
        </p>
      </div>

      {Array.from({ length: partySize }, (_, guestIndex) => {
        const selectId = `preorder-guest-${guestIndex}`
        return (
          <div key={guestIndex} className="rounded-md border border-line bg-surface p-3">
            <label htmlFor={selectId} className="block text-sm font-semibold text-ink-strong">
              Guest {guestIndex + 1}
            </label>
            <select
              id={selectId}
              value={choiceFor(guestIndex)}
              onChange={(event) => setChoice(guestIndex, event.target.value)}
              className="mt-2 min-h-[44px] w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink"
            >
              <option value="">Please choose...</option>
              {Array.from(courses.entries()).map(([course, items]) => (
                <optgroup key={course} label={course}>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                      {typeof item.price_gbp === 'number' ? ` (${formatPounds(item.price_gbp)})` : ''}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        )
      })}
    </div>
  )
}
