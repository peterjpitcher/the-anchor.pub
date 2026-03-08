'use client'

import { PhoneLink } from '@/components/PhoneLink'
import { WhatsAppLink } from '@/components/WhatsAppLink'
import { EmailLink } from '@/components/EmailLink'

interface PhoneLinksSectionProps {
  source: string
  className?: string
}

export function PhoneLinksSection({ source, className = '' }: PhoneLinksSectionProps) {
  return (
    <>
      <PhoneLink 
        phone="01753682707" 
        source={source} 
        className={`hover:text-anchor-gold transition-colors block ${className}`}
      />
      <WhatsAppLink
        phone="01753682707"
        source={source}
        className="hover:text-anchor-gold transition-colors block mt-1"
      >
        WhatsApp
      </WhatsAppLink>
      <span className="text-sm sm:text-xs">Call or message us</span>
    </>
  )
}

export function QuickEnquiryLinks() {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      <PhoneLink 
        phone="01753682707" 
        source="homepage_private_events" 
        className="text-anchor-gold hover:text-anchor-gold-light font-semibold"
      />
      <WhatsAppLink
        phone="01753682707"
        source="homepage_private_events"
        message="Hi, I'd like to enquire about hosting an event"
        className="text-anchor-gold hover:text-anchor-gold-light font-semibold"
      >
        WhatsApp
      </WhatsAppLink>
      <EmailLink
        email="manager@the-anchor.pub"
        source="homepage_private_events"
        subject="Event Enquiry"
        className="text-anchor-gold hover:text-anchor-gold-light font-semibold"
        showIcon={false}
      >
        Email Us
      </EmailLink>
    </div>
  )
}