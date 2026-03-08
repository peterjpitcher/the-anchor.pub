'use client'

import { cn } from '@/lib/utils'
import { CONTACT_INFO } from '@/lib/error-handling'
import { EmailLink } from '@/components/EmailLink'

interface ContactLinkProps {
  type?: 'phone' | 'email' | 'address'
  className?: string
  showIcon?: boolean
  children?: React.ReactNode
  phoneNumber?: string
  email?: string
  address?: string
}

const icons = {
  phone: '',
  email: '',
  address: ''
}

/**
 * ContactLink component for rendering accessible contact information
 * Uses semantic HTML and proper ARIA labels
 */
export function ContactLink({
  type = 'phone',
  className,
  showIcon = false,
  children,
  phoneNumber = CONTACT_INFO.phone,
  email = 'manager@the-anchor.pub',
  address = 'The Anchor, Horton Road, Stanwell Moor, TW19 6AQ'
}: ContactLinkProps) {
  if (type === 'phone') {
    return (
      <a
        href={phoneNumber === CONTACT_INFO.phone ? CONTACT_INFO.phoneLink : `tel:${phoneNumber.replace(/\s/g, '')}`}
        className={cn(
          'inline-flex items-center gap-1 text-anchor-gold hover:text-anchor-gold-light transition-colors',
          className
        )}
      >
        {showIcon && <span aria-hidden="true">{icons.phone}</span>}
        {children || phoneNumber}
      </a>
    )
  }

  if (type === 'email') {
    return (
      <EmailLink
        email={email}
        source="contact_link_component"
        className={cn(
          'inline-flex items-center gap-1 text-anchor-gold hover:text-anchor-gold-light transition-colors',
          className
        )}
        showIcon={showIcon}
      >
        {children || email}
      </EmailLink>
    )
  }

  if (type === 'address') {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    
    return (
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'inline-flex items-center gap-1 text-anchor-gold hover:text-anchor-gold-light transition-colors',
          className
        )}
      >
        {showIcon && <span aria-hidden="true">{icons.address}</span>}
        {children || address}
        <span className="sr-only">(opens in new tab)</span>
      </a>
    )
  }

  return null
}