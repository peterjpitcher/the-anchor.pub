import { cn } from '@/lib/utils'

type PsychBadgeVariant = 'free' | 'authority' | 'price' | 'prize'

interface PsychBadgeProps {
  variant: PsychBadgeVariant
  label?: string
  className?: string
}

const DEFAULTS: Record<PsychBadgeVariant, { label: string; className: string; icon: string }> = {
  free: {
    label: 'Free entry',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: '',
  },
  authority: {
    label: 'Award winning',
    className: 'bg-anchor-gold-dark/10 text-accent-text border-anchor-gold-dark/30',
    icon: '',
  },
  price: {
    label: 'Great value',
    className: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: '',
  },
  prize: {
    label: 'Prizes every round',
    className: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    icon: '',
  },
}

export function PsychBadge({ variant, label, className }: PsychBadgeProps) {
  const defaults = DEFAULTS[variant]
  const displayLabel = label ?? defaults.label

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        defaults.className,
        className
      )}
    >
      <span aria-hidden="true">{defaults.icon}</span>
      {displayLabel}
    </span>
  )
}
