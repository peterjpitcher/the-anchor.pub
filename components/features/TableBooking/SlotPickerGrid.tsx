'use client'

import { busynessCaption, type AvailabilitySlot } from '@/lib/table-booking/availability'
import { formatTimeForDisplay } from '@/lib/table-booking/formatting'
import { highChairFlagLabel, type DisplaySlot, type GroupedSlots } from '@/lib/table-booking/slot-groups'

/**
 * Every time the availability route affirmed for this date, grouped Lunch and
 * Evening (spec D7). No seven-slot window and no "see more times": the whole
 * day is on screen, which is what made the approved prototype simple.
 *
 * A slot that no longer qualifies after a refinement is greyed out and disabled
 * rather than removed, so the guest can see their change took effect instead of
 * watching the grid silently shrink.
 */

function SlotButton({
  display,
  isSelected,
  onSelect
}: {
  display: DisplaySlot
  isSelected: boolean
  onSelect: (slot: AvailabilitySlot) => void
}) {
  const { slot, state, highChairsFree } = display
  const servesFood = slot.bookable_purpose === 'food_or_drinks'
  const serviceCaption = servesFood ? 'drinks and food' : 'drinks only'
  const loadCaption = busynessCaption(slot.busyness)
  const chairCaption = highChairsFree === undefined ? null : highChairFlagLabel(highChairsFree)
  const isUnavailable = state === 'unavailable'

  const ariaLabel = [
    formatTimeForDisplay(slot.time),
    serviceCaption,
    ...(chairCaption ? [chairCaption] : []),
    ...(loadCaption ? [loadCaption] : []),
    ...(isUnavailable ? ['not available with your options'] : [])
  ].join(', ')

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      disabled={isUnavailable}
      onClick={() => onSelect(slot)}
      className={`min-h-16 rounded-pill border-[1.5px] px-3 py-3 text-center transition-colors ${
        isUnavailable
          ? 'cursor-not-allowed border-line bg-surface-sunk text-ink-muted opacity-60'
          : isSelected
          ? 'border-anchor-green bg-anchor-green text-white'
          : servesFood
          ? 'border-line-strong bg-surface text-ink hover:border-anchor-gold'
          : // Drinks-only is the exception, so it is the one that is marked. The
            // tint and the glass are reinforcement; the caption below still says
            // it in words, so this does not depend on seeing colour.
            'border-anchor-gold/60 bg-anchor-gold/10 text-ink hover:border-anchor-gold'
      }`}
    >
      <span className="block text-base font-semibold">{formatTimeForDisplay(slot.time)}</span>
      <span
        className={`mt-1 block text-xs ${
          isUnavailable
            ? 'font-normal text-ink-muted'
            : isSelected
            ? 'font-normal text-white/80'
            : servesFood
            ? 'font-normal text-ink-muted'
            : 'font-semibold text-anchor-gold-dark'
        }`}
      >
        {servesFood ? (
          'Drinks & food'
        ) : (
          <>
            <span aria-hidden="true" className="mr-1">&#127864;</span>
            Drinks only
          </>
        )}
      </span>
      {chairCaption ? (
        <span
          className={`mt-1 block text-xs font-medium ${
            isSelected ? 'text-white' : 'text-anchor-gold-dark'
          }`}
        >
          {chairCaption}
        </span>
      ) : null}
      {!chairCaption && loadCaption ? (
        <span
          className={`mt-1 block text-xs font-medium ${
            isSelected
              ? 'text-white'
              : slot.busyness === 'busy'
              ? 'text-anchor-gold-dark'
              : 'text-ink-muted'
          }`}
        >
          {loadCaption}
        </span>
      ) : null}
    </button>
  )
}

function SlotGroup({
  heading,
  slots,
  selectedTime,
  onSelect
}: {
  heading: string
  slots: DisplaySlot[]
  selectedTime: string
  onSelect: (slot: AvailabilitySlot) => void
}) {
  if (slots.length === 0) return null

  return (
    <div>
      <h4 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">{heading}</h4>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {slots.map((display) => (
          <SlotButton
            key={display.slot.time}
            display={display}
            isSelected={selectedTime === display.slot.time}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

export function SlotPickerGrid({
  grouped,
  selectedTime,
  onSelect
}: {
  grouped: GroupedSlots
  selectedTime: string
  onSelect: (slot: AvailabilitySlot) => void
}) {
  // Only explain the split when there is one. On a day the kitchen is on all
  // evening this note would be noise, and a note that is always there stops
  // being read.
  const all = [...grouped.lunch, ...grouped.evening]
  const hasDrinksOnly = all.some((d) => d.slot.bookable_purpose !== 'food_or_drinks')
  const hasFood = all.some((d) => d.slot.bookable_purpose === 'food_or_drinks')

  return (
    <div className="space-y-4">
      {hasDrinksOnly && hasFood ? (
        <p className="rounded-lg border border-anchor-gold/40 bg-anchor-gold/10 px-3 py-2 text-sm text-ink">
          <span aria-hidden="true" className="mr-1">&#127864;</span>
          Times marked <span className="font-semibold">drinks only</span> are outside kitchen
          hours. You are very welcome, there is just no food at those times.
        </p>
      ) : null}
      <SlotGroup heading="Lunch" slots={grouped.lunch} selectedTime={selectedTime} onSelect={onSelect} />
      <SlotGroup heading="Evening" slots={grouped.evening} selectedTime={selectedTime} onSelect={onSelect} />
    </div>
  )
}
