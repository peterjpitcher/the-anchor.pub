import { cn } from '@/lib/utils'

type ValueProofVariant = 'food' | 'private-hire'

interface ValueProofStripProps {
  variant?: ValueProofVariant
  className?: string
}

const ITEMS: Record<ValueProofVariant, Array<{ icon: string; text: string }>> = {
  food: [
    { icon: '', text: 'Skip the ULEZ charge (£12.50/day)' },
    { icon: '', text: 'Free on-site parking' },
    { icon: '', text: 'Free WiFi throughout' },
  ],
  'private-hire': [
    { icon: '', text: 'Free parking for all your guests' },
    { icon: '', text: 'Outside ULEZ, saves each driver £12.50' },
    { icon: '', text: 'Free WiFi throughout' },
  ],
}

export function ValueProofStrip({ variant = 'food', className }: ValueProofStripProps) {
  const items = ITEMS[variant]

  return (
    <ul
      aria-label="Why visit The Anchor"
      className={cn(
        'flex flex-col gap-1.5 rounded-xl border border-anchor-gold/30 bg-anchor-gold/5 px-4 py-3',
        'sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-1.5',
        className
      )}
    >
      {items.map(({ icon, text }, index) => (
        <li
          key={index}
          className="flex items-center gap-1.5 text-sm text-anchor-cream-text/70"
        >
          <span aria-hidden="true">{icon}</span>
          {text}
        </li>
      ))}
    </ul>
  )
}
