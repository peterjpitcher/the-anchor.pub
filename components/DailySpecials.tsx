'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { usePathname } from 'next/navigation'
import { PhoneButton } from '@/components/PhoneButton'

interface DailySpecialsProps {
  isOpen: boolean
}

export function DailySpecials({ isOpen }: DailySpecialsProps) {
  const [currentDay, setCurrentDay] = useState<number>(0)
  const pathname = usePathname()
  
  useEffect(() => {
    setCurrentDay(new Date().getDay())
  }, [])

  // Don't show specials if closed
  if (!isOpen) return null

  // Saturday = 6 — remind customers to book Sunday roast
  const showSundayBooking = currentDay === 6

  if (!showSundayBooking) return null

  return (
    <section className="section-spacing bg-red-600 text-white">
      <div className="container mx-auto px-4">
        {showSundayBooking && (
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-yellow-400 text-red-900 font-bold text-lg md:text-xl px-6 py-3 rounded-full inline-block mb-4">
              BOOK YOUR SUNDAY ROAST
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Last Chance to Book Tomorrow's Roast!
            </h2>
            <p className="text-xl mb-6 text-white/90">
              Bookings required by 1pm today
            </p>
            <p className="text-lg mb-8">
              Don't miss out on our famous Sunday roasts
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PhoneButton 
                phone="01753682707" 
                source="daily_specials_saturday"
                variant="primary"
                size="lg"
              >
                Call Now to Book
              </PhoneButton>
              <Link href="/sunday-lunch">
                <Button variant="outline" size="lg" className="!text-anchor-gold !border-anchor-gold hover:!bg-anchor-gold hover:!text-anchor-green">
                  View Sunday Menu
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
