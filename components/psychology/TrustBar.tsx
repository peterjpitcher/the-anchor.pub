import { cn } from '@/lib/utils'
import { PARKING, HEATHROW_TIMES } from '@/lib/constants'
import { PRIVATE_HIRE_CAPACITY } from '@/lib/private-hire-capacity'

type TrustBarVariant = 'food' | 'events' | 'private-hire'

interface TrustBarProps {
  variant?: TrustBarVariant
  className?: string
}

const SIGNALS: Record<TrustBarVariant, Array<{ icon: string; text: string }>> = {
  food: [
    { icon: '', text: 'BII Sustainability Champion' },
    { icon: '', text: `Free parking for ${PARKING.capacity} cars` },
    { icon: '', text: `${HEATHROW_TIMES.terminal5} min from Heathrow T5` },
  ],
  events: [
    { icon: '', text: 'Hosted by Nikki Manfadge' },
    { icon: '', text: 'Free parking' },
    { icon: '', text: 'Bar open all night' },
  ],
  'private-hire': [
    { icon: '', text: `Space for ${PRIVATE_HIRE_CAPACITY.recommendedRange}` },
    { icon: '', text: 'BII Sustainability Champion' },
    { icon: '', text: 'Free parking for all guests' },
  ],
}

export function TrustBar({ variant = 'food', className }: TrustBarProps) {
  const signals = SIGNALS[variant]

  return (
    <div
      role="complementary"
      aria-label="Trust signals"
      className={cn(
        'flex flex-wrap justify-center gap-x-6 gap-y-2 py-3 px-4',
        'bg-surface-sunk border-y border-line',
        className
      )}
    >
      {signals.map(({ icon, text }, index) => (
        <span
          key={index}
          className="flex items-center gap-1.5 text-sm font-medium text-accent-text"
        >
          <span aria-hidden="true">{icon}</span>
          {text}
        </span>
      ))}
    </div>
  )
}
