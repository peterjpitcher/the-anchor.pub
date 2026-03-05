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
        icon: '🕐',
        message: "Kitchen's having a rest today",
        linkText: 'book for another day',
        colorClass: 'text-gray-600 bg-gray-50 border-gray-200',
      }
    case 'opens-later':
      return {
        icon: '🍽️',
        message: `Kitchen opens at ${status.opensAt}`,
        linkText: 'reserve your table now',
        colorClass: 'text-anchor-green bg-anchor-green/5 border-anchor-green/20',
      }
    case 'open':
      return {
        icon: '✅',
        message: `Kitchen open until ${status.closesAt}`,
        colorClass: 'text-green-700 bg-green-50 border-green-200',
      }
    case 'closing-soon':
      return {
        icon: '⏰',
        message: `Kitchen closes at ${status.closesAt}`,
        linkText: "don't leave it too late",
        colorClass: 'text-amber-700 bg-amber-50 border-amber-200',
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
          <span className="text-gray-400" aria-hidden="true">—</span>
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
