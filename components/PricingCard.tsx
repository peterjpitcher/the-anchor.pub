import React from 'react'

interface PricingCardProps {
  title: string
  currentPrice: string
  originalPrice: string
  savings?: string
  volume?: string
  featured?: boolean
  className?: string
}

export function PricingCard({
  title,
  currentPrice,
  originalPrice,
  savings,
  volume,
  featured = false,
  className = ''
}: PricingCardProps) {
  return (
    <div className={`
      relative overflow-hidden rounded-md p-8 text-center
      ${featured
        ? 'bg-surface border-2 border-line-gold shadow-md'
        : 'bg-surface border border-line shadow-sm hover:border-line-gold'
      }
      transition-all duration-300 hover:scale-105
      ${className}
    `}>
      {featured && (
        <div className="absolute top-0 right-0 bg-anchor-gold text-white text-xs font-bold px-3 py-1 rounded-bl-md">
          BEST VALUE
        </div>
      )}

      <h3 className="text-2xl font-bold mb-2 text-ink-strong">{title}</h3>
      {volume && (
        <p className="text-sm text-ink-muted mb-4">{volume}</p>
      )}

      <div className="mb-4">
        <div className="text-4xl font-bold text-accent-text mb-1">{currentPrice}</div>
        <div className="text-lg text-ink-muted line-through">{originalPrice}</div>
      </div>

      {savings && (
        <div className="inline-block bg-tile text-tile-ink text-sm font-semibold px-3 py-1 rounded-pill">
          Save {savings}
        </div>
      )}
    </div>
  )
}