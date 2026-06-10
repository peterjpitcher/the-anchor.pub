import { cn } from '@/lib/utils'

interface LoadingStateProps {
  variant?: 'spinner' | 'dots' | 'skeleton'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function LoadingState({ 
  variant = 'spinner', 
  size = 'md',
  className,
  text
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  if (variant === 'skeleton') {
    return (
      <div className={cn('animate-pulse', className)} role="status" aria-label="Loading content">
        <div className="h-4 bg-anchor-green-raised rounded w-full"></div>
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center gap-1', className)} role="status" aria-live="polite">
        <div className="w-2 h-2 bg-anchor-cream-text/70 rounded-full animate-bounce [animation-delay:-0.3s]" aria-hidden="true"></div>
        <div className="w-2 h-2 bg-anchor-cream-text/70 rounded-full animate-bounce [animation-delay:-0.15s]" aria-hidden="true"></div>
        <div className="w-2 h-2 bg-anchor-cream-text/70 rounded-full animate-bounce" aria-hidden="true"></div>
        {text && <span className="ml-2 text-sm text-anchor-cream-text/70">{text}</span>}
        {!text && <span className="sr-only">Loading...</span>}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-center', className)} role="status" aria-live="polite">
      <div className={cn(
        'animate-spin rounded-full border-2 border-anchor-green-raised border-t-anchor-cream-text/70',
        sizeClasses[size]
      )} aria-hidden="true"></div>
      {text && <span className="ml-2 text-sm text-anchor-cream-text/70">{text}</span>}
      {!text && <span className="sr-only">Loading...</span>}
    </div>
  )
}

// Skeleton loading states for different components
export function CardSkeleton() {
  return (
    <div className="bg-anchor-green-card rounded-none p-6 animate-pulse" aria-label="Loading card content">
      <div className="h-4 bg-anchor-green-raised rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-anchor-green-raised rounded w-full mb-2"></div>
      <div className="h-3 bg-anchor-green-raised rounded w-2/3"></div>
    </div>
  )
}

export function EventCardSkeleton() {
  return (
    <div className="bg-anchor-green-card rounded-none p-6 animate-pulse" aria-label="Loading event">
      <div className="flex items-start gap-4">
        <div className="w-20 h-20 bg-anchor-green-raised rounded-lg"></div>
        <div className="flex-1">
          <div className="h-5 bg-anchor-green-raised rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-anchor-green-raised rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-anchor-green-raised rounded w-2/3"></div>
        </div>
      </div>
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse" aria-label="Loading table row">
      <td className="px-4 py-3">
        <div className="h-4 bg-anchor-green-raised rounded w-24"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 bg-anchor-green-raised rounded w-32"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 bg-anchor-green-raised rounded w-20"></div>
      </td>
    </tr>
  )
}