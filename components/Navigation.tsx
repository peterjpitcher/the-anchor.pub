'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { NavigationItem, BusinessInfo } from '@/lib/types'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { BookTableButton } from '@/components/BookTableButton'
import { trackNavigationClick, trackTableBookingClick } from '@/lib/gtm-events'

interface HeaderCtaButton {
  label: string
  href: string
  icon?: string
  external?: boolean
  variant?: 'primary' | 'secondary'
  className?: string
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
  showWeather?: boolean
  weatherComponent?: ReactNode
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
      { label: 'Quiz Night', href: '/quiz-night' },
      { label: 'Cash Bingo', href: '/cash-bingo' },
      { label: 'Drag Shows', href: '/whats-on/drag-shows' }
    ]
  },
  {
    label: 'Menus',
    href: '/food-menu',
    items: [
      { label: 'Food Menu', href: '/food-menu' },
      { label: 'Sunday Lunch', href: '/sunday-lunch' },
      { label: 'Pizza Tuesday Deal', href: '/pizza-tuesday' }
    ]
  },
  { label: 'Drinks', href: '/drinks' },
  {
    label: 'Events & Hire',
    href: '/book-event',
    items: [
      { label: 'Book an Event', href: '/book-event' },
      { label: 'Private Parties', href: '/private-party-venue' },
      { label: 'Corporate Events', href: '/corporate-events' },
      { label: 'Christmas Parties', href: '/christmas-parties' },
      { label: 'Function Room Hire', href: '/function-room-hire' }
    ]
  },
  {
    label: 'Visit Us',
    href: '/find-us',
    items: [
      { label: 'Find Us', href: '/find-us' },
      { label: 'Near Heathrow Overview', href: '/near-heathrow' },
      { label: 'Layover Dining', href: '/heathrow-layover-dining' },
      { label: 'Terminal 2', href: '/near-heathrow/terminal-2' },
      { label: 'Terminal 3', href: '/near-heathrow/terminal-3' },
      { label: 'Terminal 4', href: '/near-heathrow/terminal-4' },
      { label: 'Terminal 5', href: '/near-heathrow/terminal-5' },
      { label: 'Heathrow Hotels', href: '/heathrow-hotels-pub' },
      { label: 'M25 Junction 14', href: '/m25-junction-14-pub' },
      { label: 'Plane Spotting Guide', href: '/plane-spotting-heathrow' }
    ]
  },
  { label: 'Blog', href: '/blog' }
]

const defaultLogo = {
  src: '/images/branding/the-anchor-pub-logo-white-transparent.png',
  alt: 'The Anchor logo - traditional anchor symbol with elegant typography',
  width: 150,
  height: 60
}

export function Navigation({
  logo = defaultLogo,
  items = defaultItems,
  ctaButton = {
    label: 'Book a Table',
    href: '/book-table',
    icon: '📅',
    external: false,
    variant: 'primary'
  },
  secondaryCtaButton = {
    label: 'Book Parking',
    href: '/heathrow-parking',
    icon: '🚙',
    external: false,
    variant: 'secondary'
  },
  theme = defaultTheme,
  sticky = true,
  className,
  showStatus = true,
  statusComponent,
  showWeather = true,
  weatherComponent,
  mobileBreakpoint = 'md'
}: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const focusTrapRef = useFocusTrap(isMobileMenuOpen)

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
    (showWeather && weatherComponent)
  )

  useEffect(() => {
    if (!sticky) return

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sticky])

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobileMenuOpen])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const [openDropdown, setOpenDropdown] = useState<string | null>(null)



  const renderLink = (item: NavigationItem, isMobile = false) => {
    const linkClass = cn(
      'font-medium transition-colours',
      'text-sm xl:text-base', // Responsive text sizing
      mergedTheme.text,
      mergedTheme.hoverText,
      isMobile && 'block text-lg py-3 min-h-[44px] flex items-center'
    )

    // Handle dropdown items for desktop
    if (!isMobile && item.items && item.items.length > 0) {
      return (
        <div 
          key={item.href} 
          className="relative group"
          onMouseEnter={() => setOpenDropdown(item.label)}
          onMouseLeave={() => setOpenDropdown(null)}
        >
          <Link
            href={item.href}
            className={cn(linkClass, 'flex items-center gap-1')}
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
            'absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-anchor-green-dark ring-1 ring-black ring-opacity-5 transition-all duration-200',
            openDropdown === item.label ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
          )}>
            <div className="py-1">
              {item.items.map((subItem) => (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  className="block px-4 py-2 text-sm text-white hover:bg-anchor-gold hover:text-white transition-colors"
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
      return (
        <div key={item.href}>
          <Link
            href={item.href}
            className={cn(linkClass, 'border-b border-anchor-green-light')}
            onClick={() => {
              trackNavigationClick({
                label: item.label,
                url: item.href,
                level: 'main',
                deviceType: 'mobile',
                isExternal: false,
                location: 'mobile_menu'
              })
              setIsMobileMenuOpen(false)
            }}
          >
            {item.label}
          </Link>
          <div className="pl-4">
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
                  setIsMobileMenuOpen(false)
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
            if (isMobile) setIsMobileMenuOpen(false)
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
          if (isMobile) setIsMobileMenuOpen(false)
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
              setIsMobileMenuOpen(false)
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
            if (isMobile) setIsMobileMenuOpen(false)
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
          if (isMobile) setIsMobileMenuOpen(false)
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

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-anchor-gold focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-anchor-gold-light"
      >
        Skip to main content
      </a>
      
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
                {showWeather && weatherComponent && (
                  <div className="hidden xl:block">
                    {weatherComponent}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Desktop primary row */}
          <div
            className={cn(
              desktopFlexClass,
              'items-center justify-between gap-6 py-4'
            )}
          >
            <div className="flex items-center gap-4 flex-shrink-0">
              {!showUtilityRow && renderLogo('lg')}
              {showStatus && (
                <div className="max-w-md">
                  {statusComponent}
                </div>
              )}
              {showWeather && weatherComponent && (
                <div className="block xl:hidden">
                  {weatherComponent}
                </div>
              )}
            </div>

            <div className="relative z-40 ml-auto flex flex-1 flex-wrap items-center justify-end gap-4 text-right xl:gap-6">
              {items.map(item => renderLink(item))}
            </div>

            {(!showUtilityRow && (ctaButton || secondaryCtaButton)) && (
              <div className="flex items-center gap-3 flex-shrink-0">
                {renderPrimaryCTA()}
                {renderSecondaryCTA(false)}
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
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={cn('absolute right-0 top-1/2 -translate-y-1/2 p-2', mergedTheme.text)}
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

            {(showStatus || (showWeather && weatherComponent)) && (
              <div className="mt-1 w-full space-y-2 pb-2">
                {showStatus && statusComponent}
                {showWeather && weatherComponent && (
                  <div className={cn('text-sm', mergedTheme.text)}>
                    {weatherComponent}
                  </div>
                )}
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
            {(ctaButton || secondaryCtaButton) && (
              <div className="space-y-3">
                {renderPrimaryCTA(true)}
                {renderSecondaryCTA(true)}
              </div>
            )}
            {items.map(item => renderLink(item, true))}
          </div>
        </div>
      )}
      </nav>

    </>
  )
}
