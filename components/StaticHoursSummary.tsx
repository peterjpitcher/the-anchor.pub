import {
  STATIC_BAR_HOURS_SUMMARY,
  STATIC_HOURS_REVIEW_NOTE,
  STATIC_KITCHEN_HOURS_SUMMARY
} from '@/lib/business-hours-fallback'
import { cn } from '@/lib/utils'

interface StaticHoursSummaryProps {
  className?: string
  compact?: boolean
}

export function StaticHoursSummary({ className, compact = false }: StaticHoursSummaryProps) {
  return (
    <div className={cn('rounded-lg border border-anchor-gold-dark/20 bg-anchor-green-card p-4 text-left', className)}>
      <p className="text-sm font-semibold text-anchor-gold-bright">
        Opening hours
      </p>
      <div className={cn('mt-2 space-y-1 text-anchor-cream-text/75', compact ? 'text-xs' : 'text-sm')}>
        <p>{STATIC_BAR_HOURS_SUMMARY}</p>
        <p>{STATIC_KITCHEN_HOURS_SUMMARY}</p>
        <p className="text-anchor-cream-text/55">{STATIC_HOURS_REVIEW_NOTE}</p>
      </div>
    </div>
  )
}
