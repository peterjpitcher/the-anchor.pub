'use client'

import { useMemo } from 'react'
import { useBusinessHoursContext } from '@/components/providers/BusinessHoursProvider'
import { resolveHeroContext } from '@/lib/hero-context'
import type { Event } from '@/lib/api'

interface ContextStripProps {
  heroEvents?: Event[]
}

export function ContextStrip({ heroEvents }: ContextStripProps) {
  const hoursCtx = useBusinessHoursContext()
  const hours = hoursCtx?.hours ?? null

  const ctx = useMemo(
    () => resolveHeroContext(hours, heroEvents ?? null, new Date()),
    [hours, heroEvents]
  )

  // Build slots
  const slots: Array<{ text: string; className: string }> = []

  // Slot 1: Status
  if (ctx.isOpen) {
    const barLabel = ctx.barClosesAt ? ` · Bar until ${ctx.barClosesAt}` : ''
    slots.push({
      text: `Open now${barLabel}`,
      className: 'text-anchor-gold-vivid font-semibold'
    })
  } else {
    // Bare "Closed" reads as "the pub is shut" and worried first-time visitors
    // (per UX feedback). Always pair it with the next opening time when we
    // know one — and use amber rather than red when the pub is opening within
    // the next ~24 hours, so it reads as informational rather than alarming.
    const nextLabel = ctx.nextOpensLabel
    const isOpeningSoon =
      !!nextLabel && (nextLabel.startsWith('today') || nextLabel.startsWith('tomorrow'))
    const openingSuffix = nextLabel ? ` · Opens ${nextLabel}` : ''
    slots.push({
      text: `Closed${openingSuffix}`,
      className: isOpeningSoon
        ? 'text-amber-300 font-semibold'
        : 'text-red-400 font-semibold'
    })
  }

  // Slot 2: Kitchen
  if (ctx.kitchenOpen && ctx.kitchenClosesAt) {
    slots.push({
      text: `Kitchen open until ${ctx.kitchenClosesAt}`,
      className: 'text-white/80'
    })
  } else if (!ctx.kitchenOpen && ctx.isOpen) {
    slots.push({
      text: 'Kitchen closed today',
      className: 'text-red-400'
    })
  }

  // Slot 3: Special note (wins) → today's event → next upcoming
  if (ctx.specialNote) {
    slots.push({ text: ctx.specialNote, className: 'text-anchor-gold-vivid' })
  } else if (ctx.todayActiveEvent) {
    const name = ctx.todayActiveEvent.name
    slots.push({ text: `${name} on now`, className: 'text-white/80' })
  } else if (ctx.nextUpcomingEvent) {
    const name = ctx.nextUpcomingEvent.name
    slots.push({ text: name, className: 'text-white/80' })
  }

  if (slots.length === 0) return null

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/40 backdrop-blur-sm px-4 py-2 sm:px-6 sm:py-3">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm sm:text-base">
        {slots.map((slot, i) => (
          <span key={i} className="flex items-center gap-3">
            {i > 0 && <span className="text-white/30 hidden sm:inline" aria-hidden>·</span>}
            <span className={slot.className}>{slot.text}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
