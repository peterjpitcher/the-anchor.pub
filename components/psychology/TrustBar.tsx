import { cn } from '@/lib/utils'

type TrustBarVariant = 'food' | 'events' | 'private-hire'

interface TrustBarProps {
  variant?: TrustBarVariant
  className?: string
}

const SIGNALS: Record<TrustBarVariant, Array<{ icon: string; text: string }>> = {
  food: [
    { icon: '', text: 'BII Sustainability Champion' },
    { icon: '', text: 'Free parking for 20 cars' },
    { icon: '', text: '7 min from Heathrow T5' },
  ],
  events: [
    { icon: '', text: 'Hosted by Nikki Manfadge' },
    { icon: '', text: 'Free parking' },
    { icon: '', text: 'Bar open all night' },
  ],
  'private-hire': [
    { icon: '', text: 'Space for up to 200 guests' },
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
