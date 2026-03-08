import { cn } from '@/lib/utils'

interface OpeningStatusProps {
  isOpen: boolean
  opensAt?: string
  closesAt?: string
  className?: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'simple' | 'detailed' | 'inline'
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
}

/**
 * OpeningStatus component for displaying business open/closed status
 * Shows current status with optional opening/closing times
 */
export function OpeningStatus({
  isOpen,
  opensAt,
  closesAt,
  className,
  showIcon = true,
  size = 'md',
  variant = 'simple'
}: OpeningStatusProps) {
  const statusIcon = isOpen ? '' : ''
  const statusText = isOpen ? 'Open' : 'Closed'
  const statusColor = isOpen ? 'text-anchor-gold-vivid' : 'text-red-500'

  if (variant === 'simple') {
    return (
      <span className={cn('inline-flex items-center gap-1 font-semibold', sizeClasses[size], statusColor, className)}>
        {showIcon && <span aria-hidden="true">{statusIcon}</span>}
        <span>{statusText}</span>
      </span>
    )
  }

  if (variant === 'inline') {
    let message = statusText
    if (isOpen && closesAt) {
      message = `Open • Closes ${closesAt}`
    } else if (!isOpen && opensAt) {
      message = `Closed • Opens ${opensAt}`
    }

    return (
      <span className={cn('inline-flex items-center gap-1', sizeClasses[size], className)}>
        {showIcon && <span aria-hidden="true" className={statusColor}>{statusIcon}</span>}
        <span className={cn(statusColor, 'font-medium')}>{message}</span>
      </span>
    )
  }

  // variant === 'detailed'
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showIcon && (
        <span aria-hidden="true" className={cn('text-2xl', statusColor)}>
          {statusIcon}
        </span>
      )}
      <div>
        <p className={cn('font-semibold', sizeClasses[size], statusColor)}>
          {statusText}
        </p>
        {isOpen && closesAt && (
          <p className={cn('text-anchor-cream-text/70', size === 'lg' ? 'text-sm' : 'text-xs')}>
            Closes at {closesAt}
          </p>
        )}
        {!isOpen && opensAt && (
          <p className={cn('text-anchor-cream-text/70', size === 'lg' ? 'text-sm' : 'text-xs')}>
            Opens at {opensAt}
          </p>
        )}
      </div>
    </div>
  )
}