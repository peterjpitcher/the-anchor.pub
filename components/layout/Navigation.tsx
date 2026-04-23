'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useMemo, useCallback, useRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { NavigationItem } from '@/lib/types'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { BookTableButton } from '@/components/BookTableButton'
import { trackModalClose, trackModalEngage, trackModalOpen, trackNavigationClick, type ModalCloseReason } from '@/lib/gtm-events'
import { nowInLondon, parseLondonDate } from '@/lib/time-london'


interface HeaderCtaButton {
  label: string
  href: string
  icon?: string
  external?: boolean
  variant?: 'primary' | 'secondary'
  className?: string
}

interface ScheduledCtaButton extends HeaderCtaButton {
  startsOn: string
  endsOn: string
  leadDays?: number
}

interface NavigationProps {
  logo?: {
    src: string
    alt: string
    width?: number
    height?: number
  }
  items?: NavigationItem[]
  ctaButton?: HeaderCtaButton
  secondaryCtaButton?: HeaderCtaButton | null
  tertiaryCtaButton?: HeaderCtaButton | null
  promoCtaButtons?: ScheduledCtaButton[]
  theme?: {
    background?: string
    text?: string
    hoverText?: string
    ctaBackground?: string
    ctaText?: string
    ctaHoverBackground?: string
  }
  sticky?: boolean
  className?: string
  showStatus?: boolean
  statusComponent?: ReactNode
  mobileBreakpoint?: 'sm' | 'md' | 'lg'
}

const defaultTheme = {
  background: 'bg-anchor-green',
  text: 'text-white',
  hoverText: 'hover:text-anchor-gold',
  ctaBackground: 'bg-anchor-gold',
  ctaText: 'text-white',
  ctaHoverBackground: 'hover:bg-anchor-gold-light'
}

const defaultItems: NavigationItem[] = [
  {
    label: "What's On",
    href: '/whats-on',
    items: [
      { label: 'Upcoming Events', href: '/whats-on#upcoming-events' },
      { label: "Mother's Day Lunch", href: '/mothers-day' },
      { label: 'Music Bingo (Nikki)', href: '/music-bingo' },
      { label: 'Quiz Night', href: '/quiz-night' },
      { label: 'Cash Bingo', href: '/cash-bingo' },
      { label: 'Karaoke', href: '/karaoke' },
      { label: 'Live Music', href: '/live-music' },
      { label: 'Open Mic', href: '/open-mic' },
      { label: 'Live Sport Pub', href: '/live-sport' },
      { label: 'Six Nations 2026', href: '/live-sport/six-nations' },
      { label: 'World Cup 2026', href: '/live-sport/world-cup' }
    ]
  },
  {
    label: 'Menus',
    href: '/food-menu',
    items: [
      { label: 'Food Menu', href: '/food-menu' },
      { label: 'Vegetarian Menu', href: '/food-menu/vegetarian' },
      { label: 'Vegan Menu', href: '/food-menu/vegan' },
      { label: 'Gluten-Free Menu', href: '/food-menu/gluten-free' },
      { label: 'Sunday Lunch', href: '/sunday-lunch' }
    ]
  },
  {
    label: 'Drinks',
    href: '/drinks',
    items: [
      { label: 'Drinks Menu', href: '/drinks' },
      { label: "Manager's Special", href: '/drinks/managers-special' }
    ]
  },
  {
    label: 'Events & Hire',
    href: '/private-hire',
    items: [
      { label: 'Private Hire & Events', href: '/private-hire' },
      { label: 'Get a Quote / Enquire', href: '/private-hire#enquiry' },
      { label: 'Private Parties', href: '/private-party-venue' },
      { label: 'Milestone Birthdays', href: '/private-hire/milestone-birthdays' },
      { label: 'Engagement Parties', href: '/private-hire/engagement-parties' },
      { label: 'Gender Reveal Parties', href: '/private-hire/gender-reveal' },
      { label: 'Baby Showers', href: '/private-hire/baby-showers' },
      { label: 'Christenings', href: '/private-hire/christenings' },
      { label: 'Wakes & Memorials', href: '/private-hire/wakes' },
      { label: 'Retirement Parties', href: '/private-hire/retirement-parties' },
      { label: 'Corporate Events', href: '/corporate-events' },
      { label: 'Corporate Christmas Parties', href: '/corporate-christmas-parties' },
      { label: 'Christmas Parties', href: '/christmas-parties' },
      { label: 'Function Room Hire', href: '/function-room-hire' }
    ]
  },
  {
    label: 'Visit Us',
    href: '/find-us',
    items: [
      { label: 'Find Us', href: '/find-us' },
      { label: 'Our Pub', href: '/our-pub' },
      { label: 'Beer Garden', href: '/beer-garden' },
      { label: 'Dog-Friendly Pub', href: '/dog-friendly-pub-heathrow' },
      { label: 'Near Heathrow Overview', href: '/near-heathrow' },
      { label: 'Layover Dining', href: '/heathrow-layover-dining' },
      { label: 'Terminal 2', href: '/near-heathrow/terminal-2' },
      { label: 'Terminal 3', href: '/near-heathrow/terminal-3' },
      { label: 'Terminal 4', href: '/near-heathrow/terminal-4' },
      { label: 'Terminal 5', href: '/near-heathrow/terminal-5' },
      { label: 'Heathrow Hotels', href: '/heathrow-hotels-pub' },
      { label: 'M25 Junction 14', href: '/m25-junction-14-pub' },
      { label: 'Restaurants Near Heathrow', href: '/restaurants-near-heathrow' },
      { label: 'Plane Spotting Guide', href: '/plane-spotting-heathrow' }
    ]
  },
  { label: 'Our Story', href: '/about' },
  { label: 'Blog', href: '/blog' }
]

const defaultLogo = {
  src: '/images/branding/the-anchor-pub-logo-white-transparent.png',
  alt: 'The Anchor logo - traditional anchor symbol with elegant typography',
  width: 150,
  height: 60
}

const quickTasks = [
  { label: 'Book a Table', href: '/book-table', icon: '' },
  { label: 'Food Menu', href: '/food-menu', icon: '' },
  { label: "What's On", href: '/whats-on', icon: '' },
  { label: 'Find Us', href: '/find-us', icon: '' }
]

const toMenuId = (label: string) =>
  `nav-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`

export function Navigation({
  logo = defaultLogo,
  items = defaultItems,
  ctaButton = {
    label: 'Book a Table',
    href: '/book-table',
    external: false,
    variant: 'primary'
  },
  secondaryCtaButton = {
    label: 'Book Parking',
    href: '/heathrow-parking',
    external: false,
    variant: 'secondary'
  },
  tertiaryCtaButton = {
    label: 'Christmas 2026',
    href: '/christmas-parties',
    external: false,
    variant: 'secondary'
  },
  promoCtaButtons = [],
  theme = defaultTheme,
  sticky = true,
  className,
  showStatus = true,
  statusComponent,
  mobileBreakpoint = 'md'
}: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openMobileSections, setOpenMobileSections] = useState<Record<string, boolean>>({})
  const [activePromoCtaButtons, setActivePromoCtaButtons] = useState<HeaderCtaButton[]>([])
  const focusTrapRef = useFocusTrap(isMobileMenuOpen)
  const mobileMenuPreviouslyOpen = useRef(false)
  const mobileMenuEngaged = useRef(false)
  const mobileMenuCloseReason = useRef<ModalCloseReason | null>(null)
  const mobileMenuId = 'mobile_nav_menu'



  const mergedTheme = { ...defaultTheme, ...theme }
  const desktopFlexClass = {
    sm: 'hidden sm:flex',
    md: 'hidden md:flex',
    lg: 'hidden lg:flex'
  }[mobileBreakpoint]
  const mobileBlockClass = {
    sm: 'block sm:hidden',
    md: 'block md:hidden',
    lg: 'block lg:hidden'
  }[mobileBreakpoint]
  const mobileHiddenClass = {
    sm: 'sm:hidden',
    md: 'md:hidden',
    lg: 'lg:hidden'
  }[mobileBreakpoint]
  const showUtilityRow = Boolean(
    ctaButton ||
    secondaryCtaButton ||
    tertiaryCtaButton ||
    promoCtaButtons.length > 0
  )

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

  useEffect(() => {
    if (!sticky) return

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sticky])

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

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu('escape_key')
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [closeMobileMenu, isMobileMenuOpen])

  // Prevent body scroll when mobile menu is open
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

  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const toggleMobileSection = useCallback((label: string) => {
    setOpenMobileSections((prev) => ({
      ...prev,
      [label]: !prev[label]
    }))
  }, [])



  const renderLink = (item: NavigationItem, isMobile = false) => {
    const linkClass = cn(
      'font-medium transition-colours',
      mergedTheme.text,
      mergedTheme.hoverText,
      isMobile
        ? 'block text-lg py-3 min-h-[44px] flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50'
        : 'text-xs xl:text-sm uppercase tracking-wide'
    )

    // Handle dropdown items for desktop
    if (!isMobile && item.items && item.items.length > 0) {
      const dropdownId = toMenuId(item.label)

      return (
        <div
          key={item.href}
          className="relative group"
          onMouseEnter={() => setOpenDropdown(item.label)}
          onMouseLeave={() => setOpenDropdown(null)}
          onFocus={() => setOpenDropdown(item.label)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setOpenDropdown(null)
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setOpenDropdown(null)
            }
          }}
        >
          <Link
            href={item.href}
            className={cn(linkClass, 'flex items-center gap-1')}
            aria-haspopup="menu"
            aria-expanded={openDropdown === item.label}
            aria-controls={dropdownId}
            onClick={() => trackNavigationClick({
              label: item.label,
              url: item.href,
              level: 'main',
              deviceType: 'desktop',
              isExternal: false,
              location: 'header'
            })}
          >
            {item.label}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Link>
          <div className={cn(
            'absolute left-0 mt-2 w-[90vw] sm:w-56 max-w-xs rounded-md shadow-lg bg-anchor-green-dark ring-1 ring-black ring-opacity-5 transition-all duration-200 text-left',
            openDropdown === item.label ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
          )} id={dropdownId} role="menu">
            <div className="py-1">
              {item.items.map((subItem) => (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  className="block px-4 py-2 text-sm text-white hover:bg-anchor-gold hover:text-white transition-colors"
                  role="menuitem"
                  onClick={() => trackNavigationClick({
                    label: subItem.label,
                    url: subItem.href,
                    level: 'dropdown',
                    deviceType: 'desktop',
                    isExternal: false,
                    location: 'header'
                  })}
                >
                  {subItem.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )
    }

    // Handle mobile dropdown items
    if (isMobile && item.items && item.items.length > 0) {
      const sectionId = `${toMenuId(item.label)}-mobile`
      const isOpen = openMobileSections[item.label]

      return (
        <div key={item.href} className="border-b border-anchor-green-light/30 pb-2">
          <button
            type="button"
            className={cn(
              'flex w-full items-center justify-between rounded-md py-3 text-left text-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
              mergedTheme.text,
              mergedTheme.hoverText
            )}
            aria-expanded={isOpen}
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
          <div id={sectionId} className={cn('mt-1 space-y-2 pl-4', isOpen ? 'block' : 'hidden')}>
            <Link
              href={item.href}
              className={cn(linkClass, 'text-base py-2')}
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
              All {item.label}
            </Link>
            {item.items.map((subItem) => (
              <Link
                key={subItem.href}
                href={subItem.href}
                className={cn(linkClass, 'text-base py-2')}
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
                {subItem.label}
              </Link>
            ))}
          </div>
        </div>
      )
    }

    // Regular link (no dropdown)
    if (item.external) {
      return (
        <a
          key={item.href}
          href={item.href}
          className={linkClass}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            trackNavigationClick({
              label: item.label,
              url: item.href,
              level: 'main',
              deviceType: isMobile ? 'mobile' : 'desktop',
              isExternal: true,
              location: isMobile ? 'mobile_menu' : 'header'
            })
            if (isMobile) {
              recordMobileMenuEngagement('nav_link')
              closeMobileMenu('cta')
            }
          }}
        >
          {item.label}
        </a>
      )
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={linkClass}
        onClick={() => {
          trackNavigationClick({
            label: item.label,
            url: item.href,
            level: 'main',
            deviceType: isMobile ? 'mobile' : 'desktop',
            isExternal: false,
            location: isMobile ? 'mobile_menu' : 'header'
          })
          if (isMobile) {
            recordMobileMenuEngagement('nav_link')
            closeMobileMenu('cta')
          }
        }}
      >
        {item.label}
      </Link>
    )
  }

  const renderSingleCTA = (button: HeaderCtaButton, isMobile: boolean, key: string) => {
    if (!button) return null

    if (button.href.includes('ordertab.menu/theanchor/bookings')) {
      return (
        <BookTableButton
          key={key}
          source={isMobile ? 'header_mobile' : 'header_desktop'}
          variant="primary"
          size={isMobile ? 'md' : 'sm'}
          className={cn(isMobile && 'block w-full')}
          onClickAfterTracking={() => {
            if (isMobile) {
              recordMobileMenuEngagement('book_table')
              closeMobileMenu('cta')
            }
          }}
        >
          <span className="whitespace-nowrap">{button.icon ? `${button.icon} ` : ''}{button.label}</span>
        </BookTableButton>
      )
    }

    const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all rounded-full px-4 py-1.5 text-sm xl:px-6 xl:py-2 xl:text-base'
    const variantClasses = button.variant === 'secondary'
      ? 'bg-white text-anchor-green hover:bg-white/90 border border-white'
      : cn(mergedTheme.ctaBackground, mergedTheme.ctaText, mergedTheme.ctaHoverBackground)

    const ctaClass = cn(
      baseClasses,
      variantClasses,
      button.className,
      isMobile && 'block w-full text-center py-3 text-base px-6'
    )

    if (button.external) {
      return (
        <a
          key={key}
          href={button.href}
          className={ctaClass}
          target="_blank"
          rel="noopener noreferrer"
	          onClick={() => {
	            trackNavigationClick({
	              label: button.label,
	              url: button.href,
	              level: 'main',
	              deviceType: isMobile ? 'mobile' : 'desktop',
	              isExternal: true,
	              location: isMobile ? 'mobile_menu' : 'header'
	            })
	            if (isMobile) {
	              recordMobileMenuEngagement('header_cta')
	              closeMobileMenu('cta')
	            }
	          }}
	        >
	          <span className="whitespace-nowrap">{button.icon ? `${button.icon} ` : ''}{button.label}</span>
	        </a>
      )
    }

    return (
      <Link
        key={key}
        href={button.href}
        className={ctaClass}
	        onClick={() => {
	          trackNavigationClick({
	            label: button.label,
	            url: button.href,
	            level: 'main',
	            deviceType: isMobile ? 'mobile' : 'desktop',
	            isExternal: false,
	            location: isMobile ? 'mobile_menu' : 'header'
	          })
	          if (isMobile) {
	            recordMobileMenuEngagement('header_cta')
	            closeMobileMenu('cta')
	          }
	        }}
	      >
	        <span className="whitespace-nowrap">{button.icon ? `${button.icon} ` : ''}{button.label}</span>
	      </Link>
    )
  }

  const renderLogo = (size: 'sm' | 'lg' = 'lg') => (
    <Link href="/" className="flex items-center flex-shrink-0">
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        className={cn(size === 'sm' ? 'h-12 w-auto' : 'h-16 w-auto')}
        priority
        sizes={size === 'sm' ? '120px' : '150px'}
      />
    </Link>
  )

  const renderPrimaryCTA = (isMobile = false, extraClass?: string) => {
    if (!ctaButton) return null
    const button = extraClass
      ? { ...ctaButton, className: cn(ctaButton.className, extraClass) }
      : ctaButton
    return renderSingleCTA(button, isMobile, `${ctaButton.href}-${isMobile ? 'mobile' : 'desktop'}`)
  }

  const renderSecondaryCTA = (isMobile = false, extraClass?: string) => {
    if (!secondaryCtaButton) return null
    const button = extraClass
      ? { ...secondaryCtaButton, className: cn(secondaryCtaButton.className, extraClass) }
      : secondaryCtaButton
    return renderSingleCTA(button, isMobile, `${secondaryCtaButton.href}-${isMobile ? 'mobile' : 'desktop'}`)
  }

  const renderTertiaryCTA = (isMobile = false, extraClass?: string) => {
    if (!tertiaryCtaButton) return null
    const button = extraClass
      ? { ...tertiaryCtaButton, className: cn(tertiaryCtaButton.className, extraClass) }
      : tertiaryCtaButton
    return renderSingleCTA(button, isMobile, `${tertiaryCtaButton.href}-${isMobile ? 'mobile' : 'desktop'}`)
  }

  const renderPromoCTAs = (isMobile = false, extraClass?: string) => {
    if (activePromoCtaButtons.length === 0) return null

    return activePromoCtaButtons.map((button) => {
      const mergedButton = extraClass
        ? { ...button, className: cn(button.className, extraClass) }
        : button

      return renderSingleCTA(
        mergedButton,
        isMobile,
        `${button.href}-${button.label}-${isMobile ? 'mobile' : 'desktop'}`
      )
    })
  }



  return (
    <nav
      className={cn(
        'transition-all duration-300 shadow-md',
        sticky && 'sticky top-0 z-50',
        mergedTheme.background,
        className
      )}
      role="navigation"
      aria-label="Main navigation"
      itemScope
      itemType="https://schema.org/SiteNavigationElement"
    >
      <div className="container mx-auto px-4">
        {/* Desktop utility row */}
        {showUtilityRow && (
          <div
            className={cn(
              desktopFlexClass,
              'flex-wrap items-center justify-between gap-4 border-b border-white/10 py-2 text-sm',
              mergedTheme.text
            )}
          >
            {renderLogo('sm')}
            <div className="flex flex-wrap items-center justify-end gap-3">
              {renderPrimaryCTA(false, 'px-4 py-1 text-sm')}
              {renderSecondaryCTA(false, 'px-4 py-1 text-sm')}
              {renderPromoCTAs(false, 'px-4 py-1 text-sm')}
              {renderTertiaryCTA(false, 'px-4 py-1 text-sm')}
            </div>
          </div>
        )}

        {/* Desktop primary row */}
        <div
          className={cn(
            desktopFlexClass,
            'items-center justify-between gap-6 py-2'
          )}
        >
          <div className="flex items-center gap-4 flex-shrink-0">
            {!showUtilityRow && renderLogo('lg')}
            {showStatus && statusComponent && (
              <div className={cn(!showUtilityRow && "pl-6 border-l border-white/10")}>
                {statusComponent}
              </div>
            )}
          </div>

          <div className="relative z-40 ml-auto flex flex-1 flex-wrap items-center justify-end gap-4 text-right xl:gap-6">
            {items.map(item => renderLink(item))}
          </div>

          {(!showUtilityRow && (ctaButton || secondaryCtaButton || tertiaryCtaButton)) && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {renderPrimaryCTA()}
              {renderSecondaryCTA(false)}
              {renderPromoCTAs(false)}
              {renderTertiaryCTA(false)}
            </div>
          )}
        </div>

        {/* Mobile Layout */}
        <div className={cn(mobileBlockClass, 'pt-[8px]')}>
          <div className="relative flex items-center h-12">
            <Link href="/" className="mx-auto flex-shrink-0">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                className="h-12 w-auto"
                priority
                sizes="150px"
              />
            </Link>

            <button
              onClick={() => {
                if (isMobileMenuOpen) {
                  closeMobileMenu('close_button')
                  return
                }
                setIsMobileMenuOpen(true)
              }}
              className={cn('absolute right-0 top-1/2 -translate-y-1/2 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center', mergedTheme.text)}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {showStatus && (
            <div className="mt-1 w-full space-y-2 pb-2">
              {statusComponent}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          ref={focusTrapRef}
          className={cn(
            mobileHiddenClass,
            'bg-anchor-green-dark border-t border-anchor-green-light shadow-lg'
          )}
          role="dialog"
          aria-label="Mobile navigation menu"
          aria-modal="true"
        >
          <div className="container mx-auto px-4 py-6 space-y-6">
            {(ctaButton || secondaryCtaButton || tertiaryCtaButton) && (
              <div className="space-y-3">
                {renderPrimaryCTA(true)}
                {renderSecondaryCTA(true)}
                {renderPromoCTAs(true)}
                {renderTertiaryCTA(true)}
              </div>
            )}
            <div className="rounded-xl border border-white/10 bg-anchor-green/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                Top tasks
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {quickTasks.map((task) => (
                  <Link
                    key={task.href}
                    href={task.href}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-colors"
	                    onClick={() => {
	                      trackNavigationClick({
	                        label: task.label,
	                        url: task.href,
	                        level: 'main',
	                        deviceType: 'mobile',
	                        isExternal: false,
	                        location: 'mobile_menu'
	                      })
	                      recordMobileMenuEngagement('quick_task')
	                      closeMobileMenu('cta')
	                    }}
	                  >
                    <span aria-hidden="true">{task.icon}</span>
                    <span>{task.label}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              {items.map(item => renderLink(item, true))}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
