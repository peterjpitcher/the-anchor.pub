'use client'

import { trackWhatsAppClick } from '@/lib/gtm-events'
import { cn } from '@/lib/utils'

interface WhatsAppLinkProps {
  phone: string
  source: string
  message?: string
  children: React.ReactNode
  className?: string
  showIcon?: boolean
  iconPosition?: 'left' | 'right'
  onClick?: () => void
  role?: string
}

export function WhatsAppLink({
  phone,
  source,
  message,
  children,
  className,
  showIcon = true,
  iconPosition = 'left',
  onClick,
  role
}: WhatsAppLinkProps) {
  // Clean the phone number - remove spaces and add country code if needed
  const cleanPhone = phone.replace(/\s/g, '').replace(/^0/, '44')
  
  // Build WhatsApp URL
  const whatsappUrl = message 
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${cleanPhone}`

  const handleClick = () => {
    // Track the click event
    trackWhatsAppClick(source)
    
    // Call any additional onClick handler
    if (onClick) {
      onClick()
    }
  }

  const icon = showIcon ? '' : null

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('inline-flex items-center gap-2', className)}
      onClick={handleClick}
      role={role}
    >
      {icon && iconPosition === 'left' && <span aria-hidden="true">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span aria-hidden="true">{icon}</span>}
    </a>
  )
}
