import { cn } from '@/lib/utils'

interface PriceDisplayProps {
  price: string | number
  currency?: string
  originalPrice?: string | number
  showCurrency?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'sale' | 'free' | 'premium'
  className?: string
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
}

const variantClasses = {
  default: 'text-anchor-cream-text',
  sale: 'text-red-400',
  free: 'text-anchor-gold-bright',
  premium: 'text-anchor-gold-dark'
}

/**
 * PriceDisplay component for consistent price formatting
 * Handles free items, sale prices, and currency display
 */
export function PriceDisplay({
  price,
  currency = 'GBP',
  originalPrice,
  showCurrency = true,
  size = 'md',
  variant = 'default',
  className
}: PriceDisplayProps) {
  const formatPrice = (value: string | number): string => {
    const numPrice = typeof value === 'string' ? parseFloat(value) : value
    
    if (numPrice === 0) {
      return 'FREE'
    }

    const currencySymbols: Record<string, string> = {
      GBP: '',
      USD: '$',
      EUR: '€'
    }

    const symbol = showCurrency ? (currencySymbols[currency] || currency) : ''
    
    // Format with 2 decimal places if not a whole number
    const formattedPrice = numPrice % 1 === 0 
      ? numPrice.toString() 
      : numPrice.toFixed(2)

    return `${symbol}${formattedPrice}`
  }

  const priceText = formatPrice(price)
  const isFree = typeof price === 'string' ? parseFloat(price) === 0 : price === 0
  const actualVariant = isFree ? 'free' : variant

  return (
    <span className={cn('font-semibold', sizeClasses[size], className)}>
      {originalPrice && !isFree && (
        <>
          <span className="line-through text-anchor-cream-text/55 mr-2">
            {formatPrice(originalPrice)}
          </span>
          <span className={variantClasses.sale}>
            {priceText}
          </span>
        </>
      )}
      {(!originalPrice || isFree) && (
        <span className={variantClasses[actualVariant]}>
          {priceText}
        </span>
      )}
      {isFree && (
        <span className="sr-only">This event is free</span>
      )}
    </span>
  )
}
