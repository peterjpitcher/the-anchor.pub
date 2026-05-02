'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useBusinessHoursContext } from '@/components/providers/BusinessHoursProvider'
import { resolveHeroContext, resolveHeroCtas } from '@/lib/hero-context'
import type { HeroCtaAction } from '@/lib/hero-context'
import type { Event } from '@/lib/api'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { Button } from '@/components/ui'
import { trackCtaClick } from '@/lib/gtm-events'

interface SmartCTAsProps {
  route: string
  heroEvents?: Event[]
}

function renderAction(action: HeroCtaAction, variant: 'primary' | 'secondary') {
  const size = 'lg' as const

  switch (action.kind) {
    case 'booking':
      return (
        <BookTableButton
          source={action.source}
          variant={variant}
          size={size === 'lg' ? 'md' : size}
          className="w-full sm:min-w-[180px]"
        >
          {action.label}
        </BookTableButton>
      )

    case 'phone':
      return (
        <PhoneButton
          phone={action.phone}
          source={action.source}
          variant={variant === 'primary' ? 'primary' : 'secondary'}
          size={size}
          className="w-full sm:min-w-[180px]"
        >
          {action.label}
        </PhoneButton>
      )

    case 'event-link':
      return (
        <Link
          href={action.href}
          onClick={() => trackCtaClick({
            id: `smart_cta_${variant}`,
            label: action.label,
            location: action.source,
            destination: action.href,
            context: 'smart_hero'
          })}
        >
          <Button variant={variant} size={size} className="w-full sm:min-w-[180px]">
            {action.label}
          </Button>
        </Link>
      )

    case 'link':
      return (
        <Link
          href={action.href}
          onClick={() => trackCtaClick({
            id: `smart_cta_${variant}`,
            label: action.label,
            location: action.source,
            destination: action.href,
            context: 'smart_hero'
          })}
        >
          <Button variant={variant} size={size} className="w-full sm:min-w-[180px]">
            {action.label}
          </Button>
        </Link>
      )
  }
}

export function SmartCTAs({ route, heroEvents }: SmartCTAsProps) {
  const hoursCtx = useBusinessHoursContext()
  const hours = hoursCtx?.hours ?? null

  const now = useMemo(() => new Date(), [])

  const ctx = useMemo(
    () => resolveHeroContext(hours, heroEvents ?? null, now),
    [hours, heroEvents, now]
  )

  const { primary, secondary } = useMemo(
    () => resolveHeroCtas(ctx, route, now),
    [ctx, route, now]
  )

  return (
    <div className="flex min-w-0 flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center">
      <div className="min-w-0 w-full sm:w-auto">
        {renderAction(primary, 'primary')}
      </div>
      <div className="min-w-0 w-full sm:w-auto">
        {renderAction(secondary, 'secondary')}
      </div>
    </div>
  )
}
