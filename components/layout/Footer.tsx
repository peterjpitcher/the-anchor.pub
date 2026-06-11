'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Facebook, Instagram, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavigationItem, SocialLink, ContactInfo, BusinessInfo } from '@/lib/types'
import { PhoneLink } from '@/components/PhoneLink'
import { EmailLink } from '@/components/EmailLink'
import { DirectionsLink } from '@/components/DirectionsButton'
import { WhatsAppLink } from '@/components/WhatsAppLink'
import { SocialLink as SocialLinkComponent } from '@/components/SocialLink'
import { trackNavigationClick, trackSocialClick, trackPhoneCallClick } from '@/lib/gtm-events'
import { trustLinks } from '@/lib/internal-linking-data'

interface FooterSection {
  title: string
  items: (NavigationItem | string)[]
}

interface FooterProps {
  businessInfo?: BusinessInfo
  sections?: FooterSection[]
  legalSection?: FooterSection
  contact?: ContactInfo & {
    social?: SocialLink[]
  }
  features?: string[]
  copyright?: {
    year?: number
  }
  className?: string
}

const defaultBusinessInfo: BusinessInfo = {
  name: 'The Anchor',
  // O1: "under the flight path" is permitted per the canonical SSOT (§1/§8/§9).
  description:
    'A village pub in Stanwell Moor since 1751. Proper pub food, a beer garden under the Heathrow flight path and free customer parking, 7 minutes from Heathrow Terminal 5.',
  logo: '/images/branding/the-anchor-pub-logo-white-transparent.png'
}

// Five link groups live in the desktop grid (brand + 5 columns on xl).
const defaultSections: FooterSection[] = [
  {
    title: 'Book & Eat',
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
    items: [
      { label: 'About The Anchor', href: '/about' },
      { label: 'The Anchor Facts', href: '/about/the-anchor-facts' },
      { label: 'Our Pub', href: '/our-pub' },
      { label: 'Our History', href: '/history' },
      { label: 'Blog', href: '/blog' },
      { label: 'Join Our Team', href: '/join-our-team' },
      { label: 'Sitemap', href: '/sitemap-page' }
    ]
  }
]

// Sixth group (Trust & Policies) exceeds the 5-column grid, so it lives in the base bar (spec §5.3).
const defaultLegalSection: FooterSection = {
  title: 'Trust & Policies',
  items: [
    ...trustLinks.map((link) => ({ label: link.label, href: link.href })),
    { label: 'Accessibility', href: '/accessibility' },
    { label: 'Privacy Policy', href: '/privacy-policy' }
  ]
}

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

const headingClass = 'font-sans text-xs uppercase tracking-[0.18em] text-anchor-gold-bright mb-4'
const linkClass = 'text-sm text-anchor-cream-text/[0.82] hover:text-anchor-gold-bright transition-colors'

export function Footer({
  businessInfo = defaultBusinessInfo,
  sections = defaultSections,
  legalSection = defaultLegalSection,
  contact = defaultContact,
  features = defaultFeatures,
  copyright = { year: new Date().getFullYear() },
  className
}: FooterProps) {
  const renderLink = (item: NavigationItem | string, deviceType: 'mobile' | 'desktop' = 'desktop') => {
    if (typeof item === 'string') {
      return <li key={item}>{item}</li>
    }

    if (item.external) {
      return (
        <li key={item.href}>
          <a
            href={item.href}
            className={linkClass}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackNavigationClick({
              label: item.label,
              url: item.href,
              level: 'main',
              deviceType,
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
          className={linkClass}
          onClick={() => trackNavigationClick({
            label: item.label,
            url: item.href,
            level: 'main',
            deviceType,
            isExternal: false,
            location: 'footer'
          })}
        >
          {item.label}
        </Link>
      </li>
    )
  }

  const brandColumn = (
    <div className="max-w-[34ch]">
      {businessInfo.logo && (
        <Image
          src={businessInfo.logo}
          alt="The Anchor logo - white anchor symbol with traditional pub lettering on dark background"
          width={180}
          height={48}
          className="h-12 w-auto"
          sizes="180px"
        />
      )}
      <p className="font-script text-[1.9rem] leading-none text-anchor-gold-bright mt-4">
        Where everyone&apos;s welcome
      </p>
      <p className="text-sm text-anchor-sage leading-relaxed mt-4">
        {businessInfo.description}
      </p>
    </div>
  )

  const contactList = (deviceType: 'mobile' | 'desktop') => (
    <ul className="space-y-2">
      {contact?.phone && (
        <>
          <li>
            <PhoneLink phone={contact.phone} source="footer" className={linkClass} />
          </li>
          <li>
            <WhatsAppLink phone={contact.phone} source="footer" className={linkClass}>
              WhatsApp Us
            </WhatsAppLink>
          </li>
        </>
      )}
      {contact?.email && (
        <li>
          <EmailLink email={contact.email} source="footer" className={linkClass} showIcon={true} />
        </li>
      )}
      {contact?.address && (
        <li itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
          <DirectionsLink
            href="https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ"
            source="footer_address"
            className={linkClass}
          >
            <span itemProp="streetAddress">Horton Road</span>,{' '}
            <span itemProp="addressLocality">Stanwell Moor</span>,{' '}
            <span itemProp="addressRegion">Surrey</span>,{' '}
            <span itemProp="postalCode">TW19 6AQ</span>
          </DirectionsLink>
        </li>
      )}
      {contact?.social && contact.social.length > 0 && (
        <li className="pt-2">
          <div className="flex gap-4">
            {contact.social.map((social) => (
              <SocialLinkComponent
                key={social.platform}
                // SocialLink type includes 'tiktok'; the component's SocialPlatform does not.
                platform={social.platform as any}
                href={social.href}
                source="footer"
                className={linkClass}
                ariaLabel={`Visit our ${social.label || social.platform} page`}
              >
                {social.label || social.platform}
              </SocialLinkComponent>
            ))}
          </div>
        </li>
      )}
    </ul>
  )

  const featureList = (
    <ul className="space-y-2 text-sm text-anchor-cream-text/[0.82]">
      {features.map((feature) => (
        <li key={feature}>{feature}</li>
      ))}
    </ul>
  )

  const hiringCta = (deviceType: 'mobile' | 'desktop', block = false) => (
    <Link
      href="/join-our-team"
      className={cn(
        'rounded-md border border-line-gold bg-anchor-gold-bright/10 px-5 py-2.5 text-sm font-semibold text-anchor-gold-bright hover:bg-anchor-gold-bright/20 transition-colors',
        block ? 'block w-full text-center' : 'inline-flex items-center gap-2'
      )}
      onClick={() => trackNavigationClick({
        label: 'Join Our Team',
        url: '/join-our-team',
        level: 'main',
        deviceType,
        isExternal: false,
        location: 'footer'
      })}
    >
      We&apos;re Hiring: Join Our Team
    </Link>
  )

  return (
    <footer
      className={cn(
        'theme-dark relative overflow-hidden bg-anchor-green-deep text-anchor-cream-text',
        className
      )}
      style={{ paddingTop: 'var(--space-8)', paddingBottom: 'calc(var(--space-5) + 76px)' }}
    >
      {/* Film grain overlay (~5%) — dark surface only */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 opacity-[0.05] bg-[var(--grain)]" />

      <div className="container relative z-[1] mx-auto px-4">
        {/* Mobile: accordions */}
        <div className="md:hidden">
          <div className="mb-6">{brandColumn}</div>
          <div className="space-y-3">
            {sections.map((section) => (
              <details key={section.title} className="rounded-md border border-line-gold bg-white/5">
                <summary className={cn('cursor-pointer px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-anchor-gold-bright')}>
                  {section.title}
                </summary>
                <ul className="space-y-2 px-4 pb-4">
                  {section.items.map((item) => renderLink(item, 'mobile'))}
                </ul>
              </details>
            ))}
            {contact && (
              <details className="rounded-md border border-line-gold bg-white/5">
                <summary className="cursor-pointer px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-anchor-gold-bright">
                  Get in Touch
                </summary>
                <div className="px-4 pb-4">{contactList('mobile')}</div>
              </details>
            )}
            {features.length > 0 && (
              <details className="rounded-md border border-line-gold bg-white/5">
                <summary className="cursor-pointer px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-anchor-gold-bright">
                  For Everyone
                </summary>
                <div className="px-4 pb-4">{featureList}</div>
              </details>
            )}
          </div>
          <div className="mt-6">{hiringCta('mobile', true)}</div>
        </div>

        {/* Desktop: brand column (1.5fr) + link columns */}
        <div
          className="hidden md:grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-[1.5fr_repeat(5,1fr)]"
          style={{ gap: 'var(--space-6)' }}
        >
          <div className="md:col-span-2 xl:col-span-1">{brandColumn}</div>

          {sections.map((section) => (
            <div key={section.title}>
              <h4 className={headingClass}>{section.title}</h4>
              <ul className="space-y-2">
                {section.items.map((item) => renderLink(item))}
              </ul>
            </div>
          ))}
        </div>

        {/* Desktop: contact + features + hiring */}
        <div
          className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 mt-8 items-start"
          style={{ gap: 'var(--space-6)' }}
        >
          {contact && (
            <div>
              <h4 className={headingClass}>Get in Touch</h4>
              {contactList('desktop')}
            </div>
          )}
          {features.length > 0 && (
            <div>
              <h4 className={headingClass}>For Everyone</h4>
              {featureList}
            </div>
          )}
          <div className="flex items-start">{hiringCta('desktop')}</div>
        </div>

        {/* Base bar */}
        <div className="mt-10 border-t border-line-gold pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-anchor-cream-text/[0.82]">
              &copy; {copyright.year} The Anchor, Stanwell Moor Village &middot; Horton Road, Surrey TW19 6AQ
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/theanchorpubsm/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit our Facebook page"
                className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full border border-line-gold text-anchor-cream-text/[0.82] hover:text-anchor-gold-bright hover:border-anchor-gold-bright transition-colors"
                onClick={() => trackSocialClick({ platform: 'facebook', source: 'footer_base', url: 'https://www.facebook.com/theanchorpubsm/' })}
              >
                <Facebook size={18} aria-hidden="true" />
              </a>
              <a
                href="https://www.instagram.com/theanchor.pub/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit our Instagram page"
                className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full border border-line-gold text-anchor-cream-text/[0.82] hover:text-anchor-gold-bright hover:border-anchor-gold-bright transition-colors"
                onClick={() => trackSocialClick({ platform: 'instagram', source: 'footer_base', url: 'https://www.instagram.com/theanchor.pub/' })}
              >
                <Instagram size={18} aria-hidden="true" />
              </a>
              {contact?.phone && (
                <a
                  href={`tel:${contact.phone.replace(/\s/g, '').replace(/^01753/, '+441753')}`}
                  aria-label="Call The Anchor"
                  className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full border border-line-gold text-anchor-cream-text/[0.82] hover:text-anchor-gold-bright hover:border-anchor-gold-bright transition-colors"
                  onClick={() => trackPhoneCallClick({ phone: contact.phone, source: 'footer_base' })}
                >
                  <Phone size={18} aria-hidden="true" />
                </a>
              )}
            </div>
          </div>

          {/* Legal / trust links (sixth group, moved out of the grid) */}
          {legalSection && legalSection.items.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
              {legalSection.items.map((item) => renderLink(item))}
            </ul>
          )}

          <p className="mt-4 text-xs text-anchor-sage">
            Serving Stanwell Moor, Staines, Ashford, Feltham, Bedfont, and surrounding Surrey areas
          </p>
        </div>
      </div>
    </footer>
  )
}
