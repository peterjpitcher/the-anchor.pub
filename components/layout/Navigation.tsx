'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useMemo, useCallback, useRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { NavigationItem } from '@/lib/types'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { Button } from '@/components/ui/primitives/Button'
import { Icon, type IconName } from '@/components/ui/Icon'
import {
  trackModalClose,
  trackModalEngage,
  trackModalOpen,
  trackNavigationClick,
  type ModalCloseReason
} from '@/lib/gtm-events'
import { nowInLondon, parseLondonDate } from '@/lib/time-london'

interface HeaderCtaButton {
  label: string
  href: string
  icon?: string
  external?: boolean
  variant?: 'primary' | 'outline'
  className?: string
}

interface ScheduledCtaButton extends HeaderCtaButton {
  startsOn: string
  endsOn: string
  leadDays?: number
}

interface NavigationProps {
  /** Black wordmark logo (defaults to the redesign black-on-transparent mark). */
  logo?: {
    src: string
    alt: string
    width?: number
    height?: number
  }
  items?: NavigationItem[]
  /** Scheduled promo CTAs — mechanism unchanged, rendering restyled to gold pills (§6.3). */
  promoCtaButtons?: ScheduledCtaButton[]
  /** Live business-hours status, rendered into the desktop utility strip (StatusBar nav variant). */
  statusComponent?: ReactNode
  className?: string
  /**
   * Legacy props retained for call-site compatibility. They are intentionally ignored
   * by the redesigned header (theme, sticky, breakpoint and the old CTA slots are now
   * fixed by the design system) — kept only so existing usages keep type-checking.
   */
  ctaButton?: HeaderCtaButton
  secondaryCtaButton?: HeaderCtaButton | null
  tertiaryCtaButton?: HeaderCtaButton | null
  theme?: unknown
  sticky?: boolean
  showStatus?: boolean
  mobileBreakpoint?: 'sm' | 'md' | 'lg'
}

const PHONE_DISPLAY = '01753 682707'
const PHONE_TEL = 'tel:01753682707'
const PARKING_HREF = '/heathrow-parking'
const BOOK_TABLE_HREF = '/book-table'

/**
 * Primary navigation — the exact 4-item model from redesign spec §5.2.
 * Order is priority order: Food · Private Hire · What's On · Find Us.
 * Sub-item descriptions are copied verbatim from the spec / shell.jsx NAV.
 */
const defaultItems: NavigationItem[] = [
  {
    label: 'Food',
    href: '/food-menu',
    items: [
      { label: 'Full Food Menu', href: '/food-menu', description: 'Pub classics, prices and dietary filters' },
      { label: 'Sunday Roast', href: '/sunday-roast', description: 'Carved fresh to order, every Sunday' },
      { label: 'Stone-Baked Pizza', href: '/pizza-menu', description: 'Hand-stretched pizzas from the live menu' },
      { label: 'Fish & Chips', href: '/fish-and-chips-heathrow', description: 'A proper chippy tea near Heathrow' },
      { label: 'Vegetarian & Vegan', href: '/food-menu/vegan', description: 'Plant-based dishes and vegan options' },
      { label: 'Gluten-free options', href: '/food-menu/gluten-free', description: 'Gluten-free choices and allergen guidance' },
      { label: 'Drinks Menu', href: '/drinks', description: 'Draught pints, cocktails, wine and soft drinks' }
    ]
  },
  {
    label: 'Private Hire',
    href: '/private-hire',
    items: [
      { label: 'Check Availability', href: '/private-hire#enquiry', description: 'Tell us your date, guest count and plans' },
      { label: 'Function Room Hire', href: '/function-room-hire', description: 'Room hire details, layouts and capacity' },
      { label: 'Private Parties', href: '/private-party-venue', description: 'Birthdays and relaxed celebrations' },
      { label: 'Wakes & Memorials', href: '/private-hire/wakes', description: 'Respectful gatherings with simple catering' },
      { label: 'Christenings', href: '/private-hire/christenings', description: 'Post-service meals and family receptions' },
      { label: 'Corporate Events', href: '/corporate-events', description: 'Team meals, away days and work socials' },
      { label: 'Christmas Parties', href: '/christmas-parties', description: 'Festive private hire and group bookings' }
    ]
  },
  {
    label: "What's On",
    href: '/whats-on',
    items: [
      { label: 'Upcoming Events', href: '/whats-on#upcoming-events', description: 'The next hosted events and weekly nights' },
      { label: 'Quiz Night', href: '/quiz-night', description: 'Pub quiz nights, teams and prizes' },
      { label: 'Music Bingo', href: '/music-bingo', description: 'Hosted music bingo with food and prizes' },
      { label: 'Cash Bingo', href: '/cash-bingo', description: 'Classic bingo sessions with cash prizes' },
      { label: 'Karaoke', href: '/karaoke', description: 'Singalong nights and party groups' },
      { label: 'Live Music', href: '/live-music', description: 'Bands, acoustic sessions and pub nights' }
    ]
  },
  {
    label: 'Find Us',
    href: '/find-us',
    items: [
      { label: 'Find Us', href: '/find-us', description: 'Address, map, phone number and travel info' },
      { label: 'Near Heathrow', href: '/near-heathrow', description: 'Why we work well for airport stops' },
      { label: 'From Terminal 5', href: '/near-heathrow/terminal-5', description: 'Seven minutes from Terminal 5' },
      { label: 'Plane Spotting', href: '/plane-spotting-heathrow', description: 'Watch aircraft from the beer garden' },
      // /free-parking 301-redirects to /heathrow-parking; link straight there to avoid the hop.
      { label: 'Free Customer Parking', href: '/heathrow-parking', description: 'Free on-site parking for our guests' },
      { label: 'Book Heathrow Parking', href: '/heathrow-parking', description: 'Reserve airport parking with us' }
    ]
  }
]

const defaultLogo = {
  src: '/images/branding/the-anchor-pub-logo-black-transparent.png',
  alt: 'The Anchor logo',
  width: 168,
  height: 42
}

const toMenuId = (label: string) =>
  `nav-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`

export function Navigation({
  logo = defaultLogo,
  items = defaultItems,
  promoCtaButtons = [],
  statusComponent,
  className
}: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openMobileSections, setOpenMobileSections] = useState<Record<string, boolean>>({})
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [activePromoCtaButtons, setActivePromoCtaButtons] = useState<HeaderCtaButton[]>([])

  const focusTrapRef = useFocusTrap(isMobileMenuOpen)
  const mobileMenuPreviouslyOpen = useRef(false)
  const mobileMenuEngaged = useRef(false)
  const mobileMenuCloseReason = useRef<ModalCloseReason | null>(null)
  const mobileMenuId = 'mobile_nav_menu'

  // --- Promo CTA scheduling — mechanism preserved verbatim from the previous header. ---
  useEffect(() => {
    if (promoCtaButtons.length === 0) {
      setActivePromoCtaButtons([])
      return
    }

    const now = nowInLondon()
    const MS_IN_DAY = 24 * 60 * 60 * 1000
    const DEFAULT_LEAD_DAYS = 56 // 8 weeks

    const activeButtons = promoCtaButtons
      .filter((promo) => {
        const leadDays = promo.leadDays ?? DEFAULT_LEAD_DAYS
        const start = parseLondonDate(promo.startsOn)
        const showFrom = new Date(start.getTime() - leadDays * MS_IN_DAY)

        const end = parseLondonDate(promo.endsOn)
        const endExclusive = new Date(end.getTime() + MS_IN_DAY)

        return now >= showFrom && now < endExclusive
      })
      .map(({ startsOn, endsOn, leadDays, ...button }) => button)

    setActivePromoCtaButtons(activeButtons)
  }, [promoCtaButtons])

  // --- Mobile menu open/close GTM lifecycle (unchanged behaviour). ---
  const recordMobileMenuEngagement = useCallback((element: string) => {
    if (mobileMenuEngaged.current) return
    mobileMenuEngaged.current = true
    trackModalEngage({
      id: mobileMenuId,
      title: 'Mobile navigation menu',
      interaction: 'click',
      element
    })
  }, [mobileMenuId])

  const closeMobileMenu = useCallback((reason: ModalCloseReason) => {
    mobileMenuCloseReason.current = reason
    setIsMobileMenuOpen(false)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen && !mobileMenuPreviouslyOpen.current) {
      mobileMenuPreviouslyOpen.current = true
      mobileMenuEngaged.current = false
      mobileMenuCloseReason.current = null
      trackModalOpen({ id: mobileMenuId, title: 'Mobile navigation menu' })
      return
    }

    if (!isMobileMenuOpen && mobileMenuPreviouslyOpen.current) {
      mobileMenuPreviouslyOpen.current = false
      trackModalClose({
        id: mobileMenuId,
        title: 'Mobile navigation menu',
        reason: mobileMenuCloseReason.current ?? 'programmatic'
      })
      mobileMenuCloseReason.current = null
    }
  }, [isMobileMenuOpen, mobileMenuId])

  // Close mobile menu on Escape.
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu('escape_key')
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [closeMobileMenu, isMobileMenuOpen])

  // Lock body scroll whilst the drawer is open; reset accordions on close.
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setOpenMobileSections({})
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const toggleMobileSection = useCallback((label: string) => {
    setOpenMobileSections((prev) => ({ ...prev, [label]: !prev[label] }))
  }, [])

  const navItems = useMemo(() => items, [items])

  // ----------------------------------------------------------------------------------
  // Desktop primary nav — dropdown per top-level item.
  // ----------------------------------------------------------------------------------
  const renderDesktopItem = (item: NavigationItem) => {
    const hasChildren = Boolean(item.items && item.items.length > 0)
    const dropdownId = toMenuId(item.label)

    const triggerClass = cn(
      'inline-flex items-center gap-1 py-2 font-sans text-sm font-semibold text-ink transition-colors hover:text-accent-text focus:outline-none focus-visible:ring-2 focus-visible:ring-anchor-gold-dark focus-visible:ring-offset-2 rounded'
    )

    const trackTopLevel = () =>
      trackNavigationClick({
        label: item.label,
        url: item.href,
        level: 'main',
        deviceType: 'desktop',
        isExternal: false,
        location: 'header'
      })

    if (!hasChildren) {
      return (
        <Link key={item.href} href={item.href} className={triggerClass} onClick={trackTopLevel}>
          {item.label}
        </Link>
      )
    }

    return (
      <div
        key={item.href}
        className="relative"
        onMouseEnter={() => setOpenDropdown(item.label)}
        onMouseLeave={() => setOpenDropdown(null)}
        onFocus={() => setOpenDropdown(item.label)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setOpenDropdown(null)
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpenDropdown(null)
        }}
      >
        <Link
          href={item.href}
          className={triggerClass}
          aria-haspopup="menu"
          aria-expanded={openDropdown === item.label}
          aria-controls={dropdownId}
          onClick={trackTopLevel}
        >
          {item.label}
          <svg
            className={cn('h-4 w-4 transition-transform', openDropdown === item.label && 'rotate-180')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Link>

        <div
          id={dropdownId}
          role="menu"
          aria-label={item.label}
          className={cn(
            'absolute left-0 top-full z-[70] mt-2 min-w-[460px] rounded-md border border-line bg-surface p-3 shadow-lg transition-all duration-150',
            'grid grid-cols-2 gap-1',
            openDropdown === item.label
              ? 'visible translate-y-0 opacity-100'
              : 'pointer-events-none invisible -translate-y-2 opacity-0'
          )}
        >
          {item.items!.map((subItem) => (
            <Link
              key={`${subItem.href}-${subItem.label}`}
              href={subItem.href}
              role="menuitem"
              className="block rounded-sm px-3 py-2 transition-colors hover:bg-surface-sunk focus:outline-none focus-visible:bg-surface-sunk focus-visible:ring-2 focus-visible:ring-anchor-gold-dark"
              onClick={() => {
                trackNavigationClick({
                  label: subItem.label,
                  url: subItem.href,
                  level: 'dropdown',
                  deviceType: 'desktop',
                  isExternal: false,
                  location: 'header'
                })
                setOpenDropdown(null)
              }}
            >
              <span className="block font-sans text-sm font-semibold text-ink-strong">{subItem.label}</span>
              {subItem.description && (
                <span className="mt-0.5 block font-sans text-xs leading-snug text-ink-muted">
                  {subItem.description}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    )
  }

  // ----------------------------------------------------------------------------------
  // Promo CTAs — gold pill style (§6.3). `block` variant fills width in the drawer.
  // ----------------------------------------------------------------------------------
  const renderPromoCta = (button: HeaderCtaButton, context: 'strip' | 'drawer') => {
    const isDrawer = context === 'drawer'
    const className = cn(
      'inline-flex items-center justify-center gap-1.5 rounded-pill bg-anchor-gold px-4 py-1.5 font-sans text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-anchor-gold-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-anchor-gold-dark focus-visible:ring-offset-2',
      isDrawer && 'w-full min-h-[44px] py-2.5'
    )

    const onClick = () => {
      trackNavigationClick({
        label: button.label,
        url: button.href,
        level: 'main',
        deviceType: isDrawer ? 'mobile' : 'desktop',
        isExternal: Boolean(button.external),
        location: isDrawer ? 'mobile_menu' : 'header'
      })
      if (isDrawer) {
        recordMobileMenuEngagement('promo_cta')
        closeMobileMenu('cta')
      }
    }

    const content = (
      <>
        {button.icon && <Icon name={button.icon as IconName} className="h-[15px] w-[15px]" />}
        <span>{button.label}</span>
      </>
    )

    if (button.external) {
      return (
        <a
          key={`${button.href}-${button.label}-${context}`}
          href={button.href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          onClick={onClick}
        >
          {content}
        </a>
      )
    }

    return (
      <Link
        key={`${button.href}-${button.label}-${context}`}
        href={button.href}
        className={className}
        onClick={onClick}
      >
        {content}
      </Link>
    )
  }

  // Quick-link (utility strip) — Book parking + phone.
  const quickLinkClass =
    'inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-ink transition-colors hover:text-accent-text focus:outline-none focus-visible:ring-2 focus-visible:ring-anchor-gold-dark rounded'

  return (
    <>
      {/* ============================ Utility strip (desktop) ============================ */}
      <div className="hidden border-b border-line bg-surface lg:block">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-2">
          <div className="min-w-0">{statusComponent}</div>

          <div className="flex items-center gap-4">
            {activePromoCtaButtons.map((button) => renderPromoCta(button, 'strip'))}

            <Link
              href={PARKING_HREF}
              className={quickLinkClass}
              onClick={() =>
                trackNavigationClick({
                  label: 'Book parking',
                  url: PARKING_HREF,
                  level: 'main',
                  deviceType: 'desktop',
                  isExternal: false,
                  location: 'header'
                })
              }
            >
              <Icon name="parking" className="h-[15px] w-[15px] text-accent-text" />
              Book parking
            </Link>

            <a
              href={PHONE_TEL}
              className={quickLinkClass}
              onClick={() =>
                trackNavigationClick({
                  label: PHONE_DISPLAY,
                  url: PHONE_TEL,
                  level: 'main',
                  deviceType: 'desktop',
                  isExternal: true,
                  location: 'header'
                })
              }
            >
              <Icon name="phone" className="h-[15px] w-[15px] text-accent-text" />
              {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </div>

      {/* ================================ Main header bar ================================ */}
      <nav
        className={cn(
          'sticky top-0 z-[60] border-b border-line bg-[rgba(250,248,243,0.9)] backdrop-blur-md',
          className
        )}
        role="navigation"
        aria-label="Main navigation"
        itemScope
        itemType="https://schema.org/SiteNavigationElement"
      >
        <div className="container mx-auto flex h-[76px] items-center justify-between gap-6 px-4">
          {/* Logo */}
          <Link href="/" aria-label="The Anchor, home" className="flex flex-shrink-0 items-center">
            <Image
              src={logo.src}
              alt={logo.alt}
              width={logo.width ?? 168}
              height={logo.height ?? 42}
              priority
              className="h-[42px] w-auto"
              sizes="168px"
            />
          </Link>

          {/* Primary nav (desktop) */}
          <div className="hidden flex-1 items-center justify-center gap-6 lg:flex">
            {navItems.map((item) => renderDesktopItem(item))}
          </div>

          {/* Right cluster */}
          <div className="flex flex-shrink-0 items-center gap-3">
            <Button asChild variant="primary" size="sm" className="hidden lg:inline-flex">
              <Link
                href={BOOK_TABLE_HREF}
                onClick={() =>
                  trackNavigationClick({
                    label: 'Book a table',
                    url: BOOK_TABLE_HREF,
                    level: 'main',
                    deviceType: 'desktop',
                    isExternal: false,
                    location: 'header'
                  })
                }
              >
                Book a table
              </Link>
            </Button>

            {/* Burger */}
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-anchor-gold-dark lg:hidden"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-drawer"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => {
                if (isMobileMenuOpen) {
                  closeMobileMenu('close_button')
                } else {
                  setIsMobileMenuOpen(true)
                }
              }}
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6 text-ink-strong" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <span className="flex flex-col items-center justify-center gap-[5px]" aria-hidden="true">
                  <span className="block h-0.5 w-6 bg-ink-strong" />
                  <span className="block h-0.5 w-6 bg-ink-strong" />
                  <span className="block h-0.5 w-6 bg-ink-strong" />
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ================================ Mobile drawer ================================ */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-[55] bg-black/40 lg:hidden"
            onClick={() => closeMobileMenu('backdrop_click')}
          />

          <div
            id="mobile-nav-drawer"
            ref={focusTrapRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
            className="fixed inset-x-0 bottom-0 top-[76px] z-[60] overflow-y-auto overscroll-contain border-t border-line bg-surface lg:hidden"
          >
            <div className="container mx-auto space-y-1 px-4 py-4">
              {navItems.map((item) => {
                const hasChildren = Boolean(item.items && item.items.length > 0)
                const sectionId = `${toMenuId(item.label)}-mobile`
                const isOpen = openMobileSections[item.label]

                if (!hasChildren) {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block min-h-[44px] py-3 font-sans text-base font-semibold text-ink-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-anchor-gold-dark"
                      onClick={() => {
                        trackNavigationClick({
                          label: item.label,
                          url: item.href,
                          level: 'main',
                          deviceType: 'mobile',
                          isExternal: false,
                          location: 'mobile_menu'
                        })
                        recordMobileMenuEngagement('nav_link')
                        closeMobileMenu('cta')
                      }}
                    >
                      {item.label}
                    </Link>
                  )
                }

                return (
                  <div key={item.href} className="border-b border-line">
                    <button
                      type="button"
                      className="flex min-h-[44px] w-full items-center justify-between py-3 text-left font-sans text-base font-semibold text-ink-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-anchor-gold-dark"
                      aria-expanded={Boolean(isOpen)}
                      aria-controls={sectionId}
                      onClick={() => toggleMobileSection(item.label)}
                    >
                      <span>{item.label}</span>
                      <svg
                        className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div id={sectionId} className={cn('space-y-1 pb-2 pl-3', isOpen ? 'block' : 'hidden')}>
                      {item.items!.map((subItem) => (
                        <Link
                          key={`${subItem.href}-${subItem.label}`}
                          href={subItem.href}
                          className="block min-h-[44px] py-2.5 font-sans text-sm font-medium text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-anchor-gold-dark"
                          onClick={() => {
                            trackNavigationClick({
                              label: subItem.label,
                              url: subItem.href,
                              level: 'dropdown',
                              deviceType: 'mobile',
                              isExternal: false,
                              location: 'mobile_menu'
                            })
                            recordMobileMenuEngagement('nav_link')
                            closeMobileMenu('cta')
                          }}
                        >
                          <span className="block">{subItem.label}</span>
                          {subItem.description && (
                            <span className="mt-0.5 block text-xs leading-snug text-ink-muted">
                              {subItem.description}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}

              {/* Book parking link */}
              <Link
                href={PARKING_HREF}
                className="flex min-h-[44px] items-center gap-1.5 border-b border-line py-3 font-sans text-base font-semibold text-ink-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-anchor-gold-dark"
                onClick={() => {
                  trackNavigationClick({
                    label: 'Book parking',
                    url: PARKING_HREF,
                    level: 'main',
                    deviceType: 'mobile',
                    isExternal: false,
                    location: 'mobile_menu'
                  })
                  recordMobileMenuEngagement('nav_link')
                  closeMobileMenu('cta')
                }}
              >
                <Icon name="parking" className="h-[18px] w-[18px] text-accent-text" />
                Book parking
              </Link>

              {/* CTA block */}
              <div className="space-y-3 pt-4">
                {activePromoCtaButtons.map((button) => renderPromoCta(button, 'drawer'))}
                <Button asChild variant="primary" size="md" fullWidth>
                  <Link
                    href={BOOK_TABLE_HREF}
                    onClick={() => {
                      trackNavigationClick({
                        label: 'Book a table',
                        url: BOOK_TABLE_HREF,
                        level: 'main',
                        deviceType: 'mobile',
                        isExternal: false,
                        location: 'mobile_menu'
                      })
                      recordMobileMenuEngagement('book_table')
                      closeMobileMenu('cta')
                    }}
                  >
                    Book a table
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
