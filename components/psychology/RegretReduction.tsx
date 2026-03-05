import { cn } from '@/lib/utils'

type RegretVariant = 'booking' | 'enquiry'

interface RegretReductionProps {
  variant?: RegretVariant
  className?: string
}

const SIGNALS: Record<RegretVariant, Array<{ text: string }>> = {
  booking: [
    { text: 'Free to cancel' },
    { text: 'No card required' },
    { text: 'Confirmation in seconds' },
  ],
  enquiry: [
    { text: 'No commitment — just a conversation' },
    { text: "We'll get back to you within 24 hours" },
    { text: 'Free parking for all your guests' },
  ],
}

export function RegretReduction({ variant = 'booking', className }: RegretReductionProps) {
  const signals = SIGNALS[variant]

  return (
    <ul
      aria-label="Booking reassurances"
      className={cn(
        'flex flex-wrap gap-x-5 gap-y-1',
        className
      )}
    >
      {signals.map(({ text }, index) => (
        <li key={index} className="flex items-center gap-1 text-sm text-gray-600">
          <span className="font-semibold text-anchor-green" aria-hidden="true">&#10003;</span>
          {text}
        </li>
      ))}
    </ul>
  )
}
