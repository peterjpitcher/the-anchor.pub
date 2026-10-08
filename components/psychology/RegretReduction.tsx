import { cn } from '@/lib/utils'

type RegretVariant = 'booking' | 'table' | 'enquiry'

interface RegretReductionProps {
  variant?: RegretVariant
  className?: string
}

const LABELS: Record<RegretVariant, string> = {
  booking: 'Booking reassurances',
  table: 'Booking reassurances',
  enquiry: 'Enquiry reassurances',
}

const SIGNALS: Record<RegretVariant, Array<{ text: string }>> = {
  booking: [
    { text: 'Free to cancel' },
    { text: 'Free parking on site' },
    { text: 'Confirmation in seconds' },
  ],
  // Book a Table only. "Free to cancel" is true of a game night, where entry is
  // paid on the night, and false of a group deposit cancelled inside seven days.
  table: [
    { text: 'No deposit for tables of 14 or fewer' },
    { text: 'Free parking on site' },
    { text: 'Confirmation in seconds' },
  ],
  enquiry: [
    { text: 'No commitment, just a conversation' },
    { text: 'We reply as soon as we can' },
    { text: 'Free parking for all your guests' },
  ],
}

export function RegretReduction({ variant = 'booking', className }: RegretReductionProps) {
  const signals = SIGNALS[variant]

  return (
    <ul
      aria-label={LABELS[variant]}
      className={cn(
        'flex flex-wrap gap-x-5 gap-y-1',
        className
      )}
    >
      {signals.map(({ text }, index) => (
        <li key={index} className="flex items-center gap-1 text-sm text-ink-muted">
          <span className="font-semibold text-accent-text" aria-hidden="true">&#10003;</span>
          {text}
        </li>
      ))}
    </ul>
  )
}
