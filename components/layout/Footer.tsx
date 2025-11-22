'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { NavigationItem, SocialLink, ContactInfo, BusinessInfo } from '@/lib/types'
import { PhoneLink } from '@/components/PhoneLink'
import { EmailLink } from '@/components/EmailLink'
import { DirectionsLink } from '@/components/DirectionsButton'
import { WhatsAppLink } from '@/components/WhatsAppLink'
import { SocialLink as SocialLinkComponent } from '@/components/SocialLink'
import { trackNavigationClick } from '@/lib/gtm-events'

interface FooterSection {
  title: string
  items: (NavigationItem | string)[]
  titleClass?: string
  itemClass?: string
}

interface FooterProps {
  businessInfo?: BusinessInfo
  sections?: FooterSection[]
  contact?: ContactInfo & {
    social?: SocialLink[]
  }
  features?: string[]
  copyright?: {
    text?: string
    year?: number
    subtext?: string
  }
  theme?: {
    background?: string
    text?: string
    headingText?: string
    linkHover?: string
    borderColor?: string
  }
  className?: string
}

const defaultBusinessInfo: BusinessInfo = {
  name: 'The Anchor',
  description: 'Your local pub in Stanwell Moor, serving the community with great food, drinks, and entertainment since the 19th century.',
  logo: '/images/branding/the-anchor-pub-logo-white-transparent.png'
}

const defaultSections: FooterSection[] = [
  {
    title: 'Quick Links',
    titleClass: 'text-anchor-gold',
    items: [
      { label: "What's On", href: '/whats-on' },
      { label: 'Food Menu', href: '/food-menu' },
      { label: 'Sunday Roast', href: '/sunday-lunch' },
      { label: 'Drinks Menu', href: '/drinks' },
      { label: 'Book an Event', href: '/book-event' },
      { label: 'Sitemap', href: '/sitemap-page' }
    ]
  },
  {
    title: 'Private Events',
    titleClass: 'text-anchor-gold',
    items: [
      { label: 'Christmas Parties', href: '/christmas-parties' },
      { label: 'Corporate Events', href: '/corporate-events' },
      { label: 'Birthday Parties', href: '/private-party-venue' },
      { label: 'Function Room Hire', href: '/function-room-hire' }
    ]
  },
  {
    title: 'Special Features',
    titleClass: 'text-anchor-gold',
    items: [
      { label: 'Beer Garden & Plane Spotting', href: '/beer-garden' },
      { label: 'Plane Spotting Guide', href: '/plane-spotting-heathrow' },
      { label: 'Tuesday Pizza BOGOF', href: '/pizza-tuesday' },
      { label: 'Drag Shows', href: '/whats-on/drag-shows' },
      { label: 'Free Parking', href: '/find-us' }
    ]
  },
  {
    title: 'Near Heathrow',
    titleClass: 'text-anchor-gold',
    items: [
      { label: 'All Terminals', href: '/near-heathrow' },
      { label: 'Terminal 2', href: '/near-heathrow/terminal-2' },
      { label: 'Terminal 3', href: '/near-heathrow/terminal-3' },
      { label: 'Terminal 4', href: '/near-heathrow/terminal-4' },
      { label: 'Terminal 5', href: '/near-heathrow/terminal-5' },
      { label: 'Plane Spotting Pub', href: '/plane-spotting-heathrow' }
    ]
  },
  {
    title: 'Areas We Serve',
    titleClass: 'text-anchor-gold',
    items: [
      { label: 'Ashford', href: '/ashford-pub' },
      { label: 'Bedfont', href: '/bedfont-pub' },
      { label: 'Egham', href: '/egham-pub' },
      { label: 'Feltham', href: '/feltham-pub' },
      { label: 'Heathrow Hotels', href: '/heathrow-hotels-pub' },
      { label: 'M25 Junction 14', href: '/m25-junction-14-pub' },
      { label: 'Staines', href: '/staines-pub' },
      { label: 'Stanwell', href: '/stanwell-pub' },
      { label: 'Windsor', href: '/windsor-pub' }
    ]
  }
]

const defaultContact: ContactInfo & { social?: SocialLink[] } = {
  phone: '01753 682707',
  email: 'manager@the-anchor.pub',
  address: 'Horton Road, Stanwell Moor, Surrey, TW19 6AQ',
  social: [
    { platform: 'facebook', href: 'https://www.facebook.com/theanchorpubsm/', label: 'Facebook' },
    { platform: 'instagram', href: 'https://www.instagram.com/theanchor.pub/', label: 'Instagram' },
    { platform: 'google', href: '/leave-review', label: 'Leave a Review' }
  ]
}

const defaultFeatures = [
  '♿ Step-Free Access',
  '🐕 Dog Friendly',
  '👨‍👩‍👧‍👦 Family Welcome',
  '🏳️‍🌈 LGBTQ+ Friendly',
  '🚗 Free Parking'
]

const defaultTheme = {
  background: 'bg-anchor-charcoal',
  text: 'text-gray-200',
  headingText: 'text-anchor-gold-light',  // Use lighter gold for dark backgrounds
  linkHover: 'hover:text-white',
  borderColor: 'border-gray-700'
}

export function Footer({
  businessInfo = defaultBusinessInfo,
  sections = defaultSections,
  contact = defaultContact,
  features = defaultFeatures,
  copyright = {
    text: 'The Anchor, Stanwell Moor. All rights reserved.',
    year: new Date().getFullYear(),
    subtext: 'Proud to be your local independent pub • Part of the community since the 1800s'
  },
  theme = defaultTheme,
  className
}: FooterProps) {
  const mergedTheme = { ...defaultTheme, ...theme }

  const renderLink = (item: NavigationItem | string) => {
    if (typeof item === 'string') {
      return <li key={item}>{item}</li>
    }

    if (item.external) {
      return (
        <li key={item.href}>
          <a 
            href={item.href} 
            className={mergedTheme.linkHover}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackNavigationClick({
              label: item.label,
              url: item.href,
              level: 'main',
              deviceType: 'desktop',
              isExternal: true,
              location: 'footer'
            })}
          >
            {item.label}
          </a>
        </li>
      )
    }

    return (
      <li key={item.href}>
        <Link 
          href={item.href} 
          className={mergedTheme.linkHover}
          onClick={() => trackNavigationClick({
            label: item.label,
            url: item.href,
            level: 'main',
            deviceType: 'desktop',
            isExternal: false,
            location: 'footer'
          })}
        >
          {item.label}
        </Link>
      </li>
    )
  }

  return (
    <footer className={cn(mergedTheme.background, 'text-white py-12', className)}>
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 mb-8">
          {/* Business Info */}
          <div>
            {businessInfo.logo && (
              <Image
                src={businessInfo.logo}
                alt="The Anchor logo - white anchor symbol with traditional pub lettering on dark background"
                width={180}
                height={72}
                className="h-16 w-auto mb-4"
                sizes="180px"
              />
            )}
            <p className={cn(mergedTheme.text, 'leading-relaxed')}>
              {businessInfo.description}
            </p>
          </div>
          
          {/* Dynamic Sections */}
          {sections.map((section, index) => (
            <div key={index}>
              <h4 className={cn('font-bold text-lg mb-4', section.titleClass || mergedTheme.headingText)}>
                {section.title}
              </h4>
              <ul className={cn('space-y-2', section.itemClass || mergedTheme.text)}>
                {section.items.map(item => renderLink(item))}
              </ul>
            </div>
          ))}
          
          {/* Contact Info */}
          {contact && (
            <div>
              <h4 className={cn('font-bold text-lg mb-4', mergedTheme.headingText)}>
                Get in Touch
              </h4>
              <ul className={cn('space-y-2', mergedTheme.text)}>
                {contact.phone && (
                  <>
                    <li>
                      <PhoneLink 
                        phone={contact.phone} 
                        source="footer" 
                        className={mergedTheme.linkHover}
                      />
                    </li>
                    <li>
                      <WhatsAppLink
                        phone={contact.phone}
                        source="footer"
                        className={mergedTheme.linkHover}
                      >
                        WhatsApp Us
                      </WhatsAppLink>
                    </li>
                  </>
                )}
                {contact.email && (
                  <li>
                    <EmailLink
                      email={contact.email}
                      source="footer"
                      className={mergedTheme.linkHover}
                      showIcon={true}
                    />
                  </li>
                )}
                {contact.address && (
                  <li itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                    📍 <DirectionsLink
                      href="https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ"
                      source="footer_address"
                      className={mergedTheme.linkHover}
                    >
                      <span itemProp="streetAddress">Horton Road</span>, 
                      <span itemProp="addressLocality">Stanwell Moor</span>, 
                      <span itemProp="addressRegion">Surrey</span>, 
                      <span itemProp="postalCode">TW19 6AQ</span>
                    </DirectionsLink>
                  </li>
                )}
                {contact.social && contact.social.length > 0 && (
                  <li className="pt-2">
                    <div className="flex gap-4">
                      {contact.social.map(social => (
                        <SocialLinkComponent
                          key={social.platform}
                          platform={social.platform as any}
                          href={social.href}
                          source="footer"
                          className={cn(mergedTheme.linkHover, 'hover:text-anchor-gold')}
                          ariaLabel={`Visit our ${social.label || social.platform} page`}
                        >
                          {social.label || social.platform}
                        </SocialLinkComponent>
                      ))}
                    </div>
                  </li>
                )}
              </ul>
            </div>
          )}
          
          {/* Features */}
          {features && features.length > 0 && (
            <div>
              <h4 className={cn('font-bold text-lg mb-4', mergedTheme.headingText)}>
                For Everyone
              </h4>
              <ul className={cn('space-y-2', mergedTheme.text)}>
                {features.map(feature => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Copyright */}
        {copyright && (
          <div className={cn('border-t pt-8 text-center text-white', mergedTheme.borderColor)}>
            <p>
              &copy; {copyright.year} {copyright.text}
            </p>
            {copyright.subtext && (
              <p className="mt-2 text-sm text-white/80">
                {copyright.subtext}
              </p>
            )}
            <p className="mt-3 text-sm text-white/80">
              Serving Stanwell Moor, Staines, Ashford, Feltham, Bedfont, and surrounding Surrey areas
            </p>
          </div>
        )}
      </div>
    </footer>
  )
}
