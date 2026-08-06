import { render, screen } from '@testing-library/react'
import { TableRefinements } from '@/components/features/TableBooking/TableRefinements'

/**
 * Two sentences on this fieldset each claimed something the system does not do.
 * Both were corrected on 2026-08-06, and both are the kind of friendly-sounding
 * copy someone could reasonably write again, so they are pinned here.
 *
 *   1. "Just drinks" claimed ticking it would "show times when the kitchen is
 *      closed too". The availability route always builds the grid from the
 *      DRINKS answer, for everyone, so kitchen-closed times are already on
 *      screen either way. Ticking the box adds no times at all.
 *
 *   2. "Outside table" promised "a table inside if it does not" hold. An outside
 *      booking holds a garden reservation and nothing else. It is skipped by
 *      inside-table allocation and a database constraint forbids pinning one to
 *      an inside table.
 */

function renderRefinements() {
  return render(
    <TableRefinements
      drinksOnly={false}
      onDrinksOnlyChange={() => {}}
      isOutsideSeating={false}
      onOutsideSeatingChange={() => {}}
      requiresAccessibleTable={false}
      onRequiresAccessibleTableChange={() => {}}
      highChairCount={0}
      onHighChairCountChange={() => {}}
    />
  )
}

describe('TableRefinements copy', () => {
  it('does not claim that "just drinks" reveals kitchen-closed times', () => {
    renderRefinements()

    expect(screen.queryByText(/times when the kitchen is closed/i)).not.toBeInTheDocument()
    expect(
      screen.getByText(/We will seat you in the bar, and your table will not be held for food\./i)
    ).toBeInTheDocument()
  })

  it('does not promise an inside table to outside bookings', () => {
    renderRefinements()

    expect(screen.queryByText(/a table inside if it does not/i)).not.toBeInTheDocument()
    expect(screen.getByText(/reserve you a table in the garden/i)).toBeInTheDocument()
    // The honest version still has to tell the guest what to do about rain.
    expect(screen.getByText(/worth ringing us on the day/i)).toBeInTheDocument()
  })

  it('mentions no cancellation or late fee anywhere in the options', () => {
    const { container } = renderRefinements()

    expect(container.textContent).not.toMatch(/fee/i)
  })
})
