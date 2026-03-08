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
      relative overflow-hidden rounded-2xl p-8 text-center
      ${featured
        ? 'bg-anchor-gold/10 border-2 border-anchor-gold/50 shadow-xl'
        : 'card-dark rounded-none border-2 border-anchor-gold/15 hover:border-anchor-gold/30'
      }
      transition-all duration-300 hover:scale-105
      ${className}
    `}>
      {featured && (
        <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
          BEST VALUE
        </div>
      )}
      
      <h3 className="text-2xl font-bold mb-2 text-anchor-cream-text">{title}</h3>
      {volume && (
        <p className="text-sm text-anchor-cream-text/55 mb-4">{volume}</p>
      )}

      <div className="mb-4">
        <div className="text-4xl font-bold text-anchor-gold-vivid mb-1">{currentPrice}</div>
        <div className="text-lg text-anchor-cream-text/55 line-through">{originalPrice}</div>
      </div>

      {savings && (
        <div className="inline-block bg-anchor-gold/20 text-anchor-gold-vivid text-sm font-semibold px-3 py-1 rounded-full">
          Save {savings}
        </div>
      )}
    </div>
  )
}