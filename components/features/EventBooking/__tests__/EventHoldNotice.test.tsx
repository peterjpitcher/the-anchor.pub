import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { EventHoldNotice } from '../EventHoldNotice'

// Review BK-100: website ticket buyers are told how long their seats are held, a screen reader
// hears at 5 minutes and 1 minute left, and a lapsed hold offers to hold them again.

const HOLD_UNTIL = '2026-07-03T18:42:00Z' // 7:42pm in London (summer time)
const HOLD_MS = Date.parse(HOLD_UNTIL)

function renderNotice(startMs: number, props: Partial<React.ComponentProps<typeof EventHoldNotice>> = {}) {
  let clock = startMs
  const onHoldAgain = jest.fn()
  const utils = render(
    <EventHoldNotice
      holdExpiresAt={HOLD_UNTIL}
      ticketLabel="seats"
      onHoldAgain={onHoldAgain}
      now={() => clock}
      {...props}
    />
  )
  return {
    ...utils,
    onHoldAgain,
    advanceTo(ms: number) {
      clock = ms
      act(() => {
        jest.advanceTimersByTime(5_000)
      })
    },
  }
}

describe('EventHoldNotice', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('says when the hold ends, on the London clock', () => {
    renderNotice(HOLD_MS - 15 * 60_000)
    expect(screen.getByText("We're holding your seats until 7:42pm. Pay before then to confirm your booking.")).toBeInTheDocument()
  })

  it('shows the total to pay when the booking system gave one', () => {
    renderNotice(HOLD_MS - 15 * 60_000, { amountDue: 30 })
    expect(screen.getByText('Total to pay: £30.')).toBeInTheDocument()
  })

  it('shows pence when the total has them, and nothing for a zero amount', () => {
    const { rerender, onHoldAgain } = renderNotice(HOLD_MS - 15 * 60_000, { amountDue: 22.5 })
    expect(screen.getByText('Total to pay: £22.50.')).toBeInTheDocument()
    rerender(<EventHoldNotice holdExpiresAt={HOLD_UNTIL} ticketLabel="seats" amountDue={0} onHoldAgain={onHoldAgain} now={() => HOLD_MS - 60_000 * 10} />)
    expect(screen.queryByText(/Total to pay/)).not.toBeInTheDocument()
  })

  it('tells a screen reader at 5 minutes and at 1 minute left, once each', () => {
    const notice = renderNotice(HOLD_MS - 6 * 60_000)
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('')

    notice.advanceTo(HOLD_MS - 5 * 60_000 + 1_000)
    expect(status).toHaveTextContent('5 minutes left to pay before your seats are released.')

    notice.advanceTo(HOLD_MS - 59_000)
    expect(status).toHaveTextContent('1 minute left to pay before your seats are released.')
  })

  it('offers to hold them again once the hold has ended', () => {
    const notice = renderNotice(HOLD_MS - 10_000)
    notice.advanceTo(HOLD_MS + 1_000)

    // Shown, and said once to a screen reader.
    expect(screen.getAllByText('Your hold has ended, so your seats have gone back on sale.')).toHaveLength(2)
    expect(screen.getByRole('status')).toHaveTextContent('Your hold has ended')
    fireEvent.click(screen.getByRole('button', { name: 'Hold them again' }))
    expect(notice.onHoldAgain).toHaveBeenCalledTimes(1)
  })

  it('falls back to plain wording when no deadline came back', () => {
    renderNotice(HOLD_MS, { holdExpiresAt: null })
    expect(screen.getByText('Your seats are on hold. Pay now to confirm your booking.')).toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/undefined|NaN|Invalid Date/)
  })
})
