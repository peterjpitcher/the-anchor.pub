'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/primitives/Button'
import { Icon } from '@/components/ui/Icon'
import { Modal } from '@/components/ui'
import { trackTableBookingClick } from '@/lib/gtm-events'
import { cn } from '@/lib/utils'

// Dynamically import the booking form to reduce initial bundle size
const SundayLunchBooking = dynamic(() => import('./SundayLunchBooking'), {
  loading: () => (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-anchor-gold"></div>
    </div>
  )
})

interface SundayLunchBookingSectionProps {
  source: string
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children?: React.ReactNode
  className?: string
  fullWidth?: boolean
  isWhite?: boolean
}

export default function SundayLunchBookingSection({
  source,
  variant = 'primary',
  size = 'md',
  children = 'Book Your Sunday Roast',
  className = '',
  fullWidth = false,
  isWhite = false
}: SundayLunchBookingSectionProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = () => {
    trackTableBookingClick(`sunday_lunch_${source}_open`)
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleSuccess = () => {
    // Close modal after successful booking
    setTimeout(() => {
      setIsOpen(false)
    }, 3000)
  }

  return (
    <>
      <Button
        variant={isWhite ? 'secondary' : variant}
        size={size}
        onClick={handleOpen}
        className={cn(
          isWhite && 'bg-white text-anchor-green hover:bg-gray-100 border-white',
          className
        )}
        fullWidth={fullWidth}
      >
        <Icon name="calendar" className="mr-2" />
        {children}
      </Button>

      <Modal
        open={isOpen}
        onClose={handleClose}
        title="Book Your Sunday Roast"
        size="lg"
        id={`sunday_lunch_booking_${source}`}
      >
        <SundayLunchBooking onSuccess={handleSuccess} />
      </Modal>
    </>
  )
}
