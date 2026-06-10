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
    className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    icon: '',
  },
  authority: {
    label: 'Award winning',
    className: 'bg-anchor-gold-dark/10 text-anchor-gold-dark border-anchor-gold-dark/30',
    icon: '',
  },
  price: {
    label: 'Great value',
    className: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    icon: '',
  },
  prize: {
    label: 'Prizes every round',
    className: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30',
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
