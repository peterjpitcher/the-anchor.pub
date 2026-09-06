'use client'

import Link from 'next/link'
import { Button } from '@/components/ui'
import { trackPhoneCallClick } from '@/lib/gtm-events'

interface PhoneButtonProps {
  phone: string
  source: string
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children?: React.ReactNode
}

export function PhoneButton({
  phone,
  source,
  variant = 'outline',
  size = 'lg',
  className = '',
  children
}: PhoneButtonProps) {
  // Convert UK phone number to international format for tel: links
  const formattedPhone = phone.replace(/\s/g, '').replace(/^01753/, '+441753')
  
  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={className}
    >
      <Link
        href={`tel:${formattedPhone}`}
        onClick={() => trackPhoneCallClick({ phone, source })}
      >
        {children || `Call ${phone}`}
      </Link>
    </Button>
  )
}
