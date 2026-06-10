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
import { trustLinks } from '@/lib/internal-linking-data'

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
  description: 'Your local pub in Stanwell Moor, serving the community with great food, drinks, and entertainment since 1751.',
  logo: '/images/branding/the-anchor-pub-logo-white-transparent.png'
}

const defaultSections: FooterSection[] = [
  {
    title: 'Book & Eat',
    titleClass: 'text-anchor-gold-dark',
    items: [
      { label: 'Book a Table', href: '/book-table' },
      { label: 'Food Menu', href: '/food-menu' },
      { label: 'Sunday Roast', href: '/sunday-roast' },
      { label: 'Stone-Baked Pizza', href: '/pizza-menu' },
      { label: 'Fish & Chips', href: '/fish-and-chips-heathrow' },
      { label: 'Drinks Menu', href: '/drinks' },
      { label: 'Find Us', href: '/find-us' }
    ]
  },
  {
    title: 'Private Hire',
    titleClass: 'text-anchor-gold-dark',
    items: [
      { label: 'Check Availability', href: '/private-hire#enquiry' },
      { label: 'Private Hire Overview', href: '/private-hire' },
      { label: 'Function Room Hire', href: '/function-room-hire' },
      { label: 'Private Parties', href: '/private-party-venue' },
      { label: 'Wakes & Memorials', href: '/private-hire/wakes' },
      { label: 'Christenings', href: '/private-hire/christenings' },
      { label: 'Corporate Events', href: '/corporate-events' },
      { label: 'Christmas Parties', href: '/christmas-parties' }
    ]
  },
  {
    title: 'Hosted Events',
    titleClass: 'text-anchor-gold-dark',
    items: [
      { label: "What's On", href: '/whats-on' },
      { label: 'Quiz Night', href: '/quiz-night' },
      { label: 'Music Bingo', href: '/music-bingo' },
      { label: 'Cash Bingo', href: '/cash-bingo' },
      { label: 'Karaoke', href: '/karaoke' },
      { label: 'Live Music', href: '/live-music' },
      { label: 'Live Sport Pub', href: '/live-sport' }
    ]
  },
  {
    title: 'Heathrow & Plane Spotting',
    titleClass: 'text-anchor-gold-dark',
    items: [
      { label: 'Near Heathrow', href: '/near-heathrow' },
      { label: 'Terminal 5', href: '/near-heathrow/terminal-5' },
      { label: 'Restaurants Near Heathrow', href: '/restaurants-near-heathrow' },
      { label: 'Plane Spotting Pub', href: '/plane-spotting-heathrow' },
      { label: 'Beer Garden', href: '/beer-garden' },
      { label: 'Pre-Flight Meal', href: '/pre-flight-meal' },
      { label: 'Layover Dining', href: '/heathrow-layover-dining' },
      { label: 'Heathrow Parking', href: '/heathrow-parking' }
    ]
  },
  {
    title: 'More',
    titleClass: 'text-anchor-gold-dark',
    items: [
      { label: 'About The Anchor', href: '/about' },
      { label: 'The Anchor Facts', href: '/about/the-anchor-facts' },
      { label: 'Our Pub', href: '/our-pub' },
      { label: 'Our History', href: '/history' },
      { label: 'Blog', href: '/blog' },
      { label: 'Join Our Team', href: '/join-our-team' },
      { label: 'Sitemap', href: '/sitemap-page' }
    ]
  },
  {
    title: 'Trust & Policies',
    titleClass: 'text-anchor-gold-dark',
    items: [
      ...trustLinks.map((link) => ({ label: link.label, href: link.href })),
      { label: 'Accessibility', href: '/accessibility' },
      { label: 'Privacy Policy', href: '/privacy-policy' }
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
  'Step-Free Access',
  'Dog Friendly',
  'Family Welcome',
  'LGBTQ+ Friendly',
  'Free Parking'
]

const defaultTheme = {
  background: 'bg-anchor-green-deep',
  text: 'text-anchor-cream-text/70',
  headingText: 'text-anchor-gold-bright',
  linkHover: 'hover:text-anchor-cream-text',
  borderColor: 'border-anchor-gold-dark/20'
}

export function Footer({
  businessInfo = defaultBusinessInfo,
  sections = defaultSections,
  contact = defaultContact,
  features = defaultFeatures,
  copyright = {
    text: 'The Anchor, Stanwell Moor. All rights reserved.',
    year: new Date().getFullYear(),
    subtext: 'Proud to be part of the Greene King Tenants network • A village pub since 1751'
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
        <div className="md:hidden">
          <div className="mb-6">
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
          <div className="space-y-4">
            {sections.map((section, index) => (
              <details
                key={index}
                className="rounded-lg border border-gray-700/60 bg-white/5"
              >
                <summary className={cn('cursor-pointer px-4 py-3 text-base font-semibold', section.titleClass || mergedTheme.headingText)}>
                  {section.title}
                </summary>
                <ul className={cn('space-y-2 px-4 pb-4 text-sm', section.itemClass || mergedTheme.text)}>
                  {section.items.map(item => renderLink(item))}
                </ul>
              </details>
            ))}
            {contact && (
              <details className="rounded-lg border border-gray-700/60 bg-white/5">
                <summary className={cn('cursor-pointer px-4 py-3 text-base font-semibold', mergedTheme.headingText)}>
                  Get in Touch
                </summary>
                <ul className={cn('space-y-2 px-4 pb-4 text-sm', mergedTheme.text)}>
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
                      <DirectionsLink
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
                            className={cn(mergedTheme.linkHover, 'hover:text-anchor-gold-dark')}
                            ariaLabel={`Visit our ${social.label || social.platform} page`}
                          >
                            {social.label || social.platform}
                          </SocialLinkComponent>
                        ))}
                      </div>
                    </li>
                  )}
                </ul>
              </details>
            )}
            {features && features.length > 0 && (
              <details className="rounded-lg border border-gray-700/60 bg-white/5">
                <summary className={cn('cursor-pointer px-4 py-3 text-base font-semibold', mergedTheme.headingText)}>
                  For Everyone
                </summary>
                <ul className={cn('space-y-2 px-4 pb-4 text-sm', mergedTheme.text)}>
                  {features.map(feature => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
          <div className="mt-6">
            <Link
              href="/join-our-team"
              className="block w-full rounded-lg border border-anchor-gold-dark/40 bg-anchor-gold-dark/10 px-4 py-3 text-center text-base font-semibold text-anchor-gold-bright hover:bg-anchor-gold-dark/20 transition-colors"
              onClick={() => trackNavigationClick({
                label: 'Join Our Team',
                url: '/join-our-team',
                level: 'main',
                deviceType: 'mobile',
                isExternal: false,
                location: 'footer'
              })}
            >
              We&apos;re Hiring: Join Our Team
            </Link>
          </div>
        </div>

        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 mb-8">
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
                    <DirectionsLink
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
                          className={cn(mergedTheme.linkHover, 'hover:text-anchor-gold-dark')}
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

          {/* Hiring CTA */}
          <div className="col-span-full mt-4">
            <Link
              href="/join-our-team"
              className="inline-flex items-center gap-2 rounded-lg border border-anchor-gold-dark/40 bg-anchor-gold-dark/10 px-5 py-2.5 text-sm font-semibold text-anchor-gold-bright hover:bg-anchor-gold-dark/20 transition-colors"
              onClick={() => trackNavigationClick({
                label: 'Join Our Team',
                url: '/join-our-team',
                level: 'main',
                deviceType: 'desktop',
                isExternal: false,
                location: 'footer'
              })}
            >
              We&apos;re Hiring: Join Our Team
            </Link>
          </div>
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
