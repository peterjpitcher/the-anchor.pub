import Link from 'next/link'
import { cn } from '@/lib/utils'

export type KitchenStatusData =
  | null
  | { type: 'closed-today' }
  | { type: 'opens-later'; opensAt: string }
  | { type: 'open'; closesAt: string }
  | { type: 'closing-soon'; closesAt: string }

interface UrgencyKitchenStatusProps {
  status: KitchenStatusData
  className?: string
}

interface StatusConfig {
  icon: string
  message: string
  linkText?: string
  colorClass: string
}

function getConfig(status: NonNullable<KitchenStatusData>): StatusConfig {
  switch (status.type) {
    case 'closed-today':
      return {
        icon: '',
        message: "Kitchen's having a rest today",
        linkText: 'book for another day',
        colorClass: 'text-ink-muted bg-surface-sunk border-line',
      }
    case 'opens-later':
      return {
        icon: '',
        message: `Kitchen opens at ${status.opensAt}`,
        linkText: 'reserve your table now',
        colorClass: 'text-accent-text bg-accent/10 border-accent/30',
      }
    case 'open':
      return {
        icon: '',
        message: `Kitchen open until ${status.closesAt}`,
        colorClass: 'text-accent-text bg-accent/10 border-accent/30',
      }
    case 'closing-soon':
      return {
        icon: '',
        message: `Kitchen closes at ${status.closesAt}`,
        linkText: "don't leave it too late",
        colorClass: 'text-amber-700 bg-amber-50 border-amber-300',
      }
  }
}

export function UrgencyKitchenStatus({ status, className }: UrgencyKitchenStatusProps) {
  if (!status) return null

  const config = getConfig(status)

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
        config.colorClass,
        className
      )}
    >
      <span aria-hidden="true">{config.icon}</span>
      <span className="font-medium">{config.message}</span>
      {config.linkText && (
        <>
          <span className="text-ink-muted" aria-hidden="true">, </span>
          <Link
            href="/book-table"
            className="underline underline-offset-2 hover:no-underline font-medium"
          >
            {config.linkText}
          </Link>
        </>
      )}
    </div>
  )
}
