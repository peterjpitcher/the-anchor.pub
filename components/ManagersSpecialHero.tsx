'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui'
import { getCurrentPromotionClient } from '@/lib/managers-special-utils-client'
import { useSearchParams } from 'next/navigation'

export function ManagersSpecialHero() {
  const [currentPromotion, setCurrentPromotion] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const preview = searchParams?.get('preview') ?? undefined
  const token = searchParams?.get('token') ?? undefined
  const date = searchParams?.get('date') ?? undefined
  
  useEffect(() => {
    // Get current promotion from API
    getCurrentPromotionClient({ preview, token, date })
      .then(promo => {
        if (promo) {
          setCurrentPromotion(promo)
        } else {
          setCurrentPromotion(null)
        }
      })
      .catch(err => {
        console.error('Failed to fetch manager\'s special:', err)
        setCurrentPromotion(null)
      })
      .finally(() => setLoading(false))
  }, [preview, token, date])

  if (loading || !currentPromotion) return null

  // The API returns the promotion directly with active: true flag
  const { spirit, promotion } = currentPromotion
  const imagePath = currentPromotion.image || spirit?.image || null
  
  // Ensure spirit and promotion exist
  if (!spirit || !promotion) {
    return null
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-anchor-green to-emerald-800">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`
        }}></div>
      </div>
      
      <div className="relative z-10 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-12 gap-8 items-center">
              {/* Left side - Product Image (33% width) */}
              {(imagePath || spirit?.image) && (
                <div className="md:col-span-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/20 max-w-sm mx-auto md:mx-0">
                    <Image 
                      src={imagePath || spirit?.image || ''} 
                      alt={spirit?.name || 'Manager\'s Special'}
                      width={300}
                      height={450}
                      className="w-full h-auto rounded-lg shadow-lg"
                      unoptimized
                    />
                  </div>
                </div>
              )}
              
              {/* Right side - Text content & Pricing (67% width) */}
              <div className={`${(imagePath || spirit?.image) ? 'md:col-span-8' : 'md:col-span-12'} text-white`}>
                <div className="mb-4">
                  <span className="inline-block px-4 py-2 bg-red-600 text-white font-bold rounded-full text-sm uppercase tracking-wide">
                    {promotion?.headline || 'Manager\'s Special'}
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                  {spirit?.discount || ''} {spirit?.name || 'Featured Spirit'}
                </h2>
                <p className="text-xl mb-6 text-emerald-100">
                  {spirit?.category || ''} {spirit?.category && spirit?.abv ? '•' : ''} {spirit?.abv || ''} {spirit?.abv && spirit?.origin ? '•' : ''} {spirit?.origin || ''}
                </p>
                <p className="text-lg mb-8 text-emerald-50">
                  {spirit?.description || ''}
                </p>
                
                {/* Pricing Info */}
                {spirit?.specialPrice && (
                  <div className="mb-8">
                    <div className="inline-block bg-white/10 backdrop-blur-sm rounded-lg px-8 py-4 border border-white/20">
                      <span className="text-sm text-emerald-100 block mb-1">Special Price (25ml Single)</span>
                      <div className="flex items-baseline gap-3">
                        <span className="text-gray-300 line-through text-lg">{spirit?.originalPrice || ''}</span>
                        <span className="text-3xl font-bold text-white">{spirit?.specialPrice || ''}</span>
                        <span className="text-amber-400 font-bold text-lg">{spirit?.discount || '25% OFF'}</span>
                      </div>
                      <p className="text-xs text-emerald-100 mt-2">Doubles available at bar prices</p>
                    </div>
                  </div>
                )}
                
                {/* CTA Button */}
                <div className="flex flex-wrap gap-4 items-center">
                  <Button 
                    size="lg"
                    className="bg-anchor-gold-dark text-anchor-charcoal hover:bg-anchor-gold"
                    asChild
                  >
                    <Link href="/drinks/managers-special">
                      View Full Details & Tasting Notes
                    </Link>
                  </Button>
                  <div className="text-white">
                    <span className="text-sm">Valid until</span>
                    <span className="block text-lg font-bold">
                      {currentPromotion?.endDate 
                        ? new Date(currentPromotion.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                        : 'While stocks last'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
