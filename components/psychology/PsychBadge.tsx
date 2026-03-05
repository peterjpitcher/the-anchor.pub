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
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: '🎟️',
  },
  authority: {
    label: 'Award winning',
    className: 'bg-anchor-gold/10 text-anchor-gold border-anchor-gold/30',
    icon: '🏆',
  },
  price: {
    label: 'Great value',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: '💷',
  },
  prize: {
    label: 'Prizes every round',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: '🎉',
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
