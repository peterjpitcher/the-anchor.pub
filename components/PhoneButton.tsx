'use client'

import Link from 'next/link'
import { Button } from '@/components/ui'
import { trackPhoneCallClick } from '@/lib/gtm-events'

interface PhoneButtonProps {
  phone: string
  source: string
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children?: React.ReactNode
}

export function PhoneButton({ 
  phone, 
  source, 
  variant = 'secondary',
  size = 'lg',
  className = '',
  children
}: PhoneButtonProps) {
  // Convert UK phone number to international format for tel: links
  const formattedPhone = phone.replace(/\s/g, '').replace(/^01753/, '+441753')
  
  return (
    <Link 
      href={`tel:${formattedPhone}`}
      onClick={() => trackPhoneCallClick({ phone, source })}
    >
      <Button 
        variant={variant}
        size={size}
        className={className}
      >
        {children || `Call ${phone}`}
      </Button>
    </Link>
  )
}
