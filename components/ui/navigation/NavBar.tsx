'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, ReactNode, HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Button } from '../primitives/Button'
import type { BaseComponentProps, WithChildren } from '../types'
import { trackNavigationClick } from '@/lib/gtm-events'

// Navigation link type
export interface NavItem {
  label: string
  href: string
  external?: boolean
  icon?: ReactNode
  badge?: string | number
}

// NavBar variants
const navBarVariants = cva(
  'transition-all duration-300 shadow-md',
  {
    variants: {
      variant: {
        default: 'bg-anchor-green text-white',
        light: 'bg-white text-gray-900',
        transparent: 'bg-transparent'
      },
      size: {
        sm: 'h-16',
        md: 'h-20',
        lg: 'h-24'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
)

export interface NavBarProps 
  extends BaseComponentProps,
    Omit<HTMLAttributes<HTMLElement>, 'className'>,
    VariantProps<typeof navBarVariants> {
  logo?: {
    src: string
    alt: string
    width?: number
    height?: number
  }
  items?: NavItem[]
  actions?: ReactNode
  sticky?: boolean
  showMenuButton?: boolean
  mobileBreakpoint?: 'sm' | 'md' | 'lg'
}

export const NavBar = ({
  className,
  variant,
  size,
  logo,
  items = [],
  actions,
  sticky = true,
  showMenuButton = true,
  mobileBreakpoint = 'lg',
  testId,
  ...props
}: NavBarProps) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Scroll handling
  useEffect(() => {
    if (!sticky) return

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sticky])

  // Close mobile menu on Escape
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
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const navClasses = cn(
    navBarVariants({ variant, size }),
    sticky && 'fixed top-0 left-0 right-0 z-50',
    isScrolled && sticky && 'shadow-lg',
    className
  )

  const breakpointHideClass = {
    sm: 'sm:hidden',
    md: 'md:hidden',
    lg: 'lg:hidden'
  }[mobileBreakpoint]

  const breakpointShowClass = {
    sm: 'hidden sm:flex',
    md: 'hidden md:flex',
    lg: 'hidden lg:flex'
  }[mobileBreakpoint]

  return (
    <nav
      className={navClasses}
      role="navigation"
      aria-label="Main navigation"
      data-testid={testId}
      {...props}
    >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            {logo && (
              <Link href="/" className="flex items-center">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width || 150}
                  height={logo.height || 60}
                  className="h-12 w-auto"
                  priority
                />
              </Link>
            )}

            {/* Desktop Navigation */}
            <ul className={cn(breakpointShowClass, 'items-center gap-6')}>
              {items.map((item) => (
                <NavItem key={item.href} item={item} variant={variant || 'default'} isMobile={false} />
              ))}
            </ul>

            {/* Actions */}
            <div className={cn(breakpointShowClass, 'items-center gap-4')}>
              {actions}
            </div>

            {/* Mobile Menu Button */}
            {showMenuButton && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={cn(breakpointHideClass, 'p-2')}
                aria-expanded={isMobileMenuOpen}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <MobileMenu 
          isOpen={isMobileMenuOpen}
          items={items}
          actions={actions}
          variant={variant || 'default'}
          onClose={() => setIsMobileMenuOpen(false)}
        />
    </nav>
  )
}

// Individual navigation item
interface NavItemProps {
  item: NavItem
  variant?: 'default' | 'light' | 'transparent'
  onClick?: () => void
  isMobile?: boolean
}

const NavItem = ({ item, variant = 'default', onClick, isMobile = false }: NavItemProps) => {
  const linkClasses = cn(
    'font-medium transition-colours flex items-center gap-2',
    variant === 'default' && 'text-white hover:text-anchor-gold',
    variant === 'light' && 'text-gray-700 hover:text-anchor-green',
    variant === 'transparent' && 'text-current hover:opacity-80'
  )

  const content = (
    <>
      {item.icon}
      {item.label}
      {item.badge && (
        <span className="ml-1 px-2 py-0.5 text-sm sm:text-xs bg-anchor-gold text-white rounded-full">
          {item.badge}
        </span>
      )}
    </>
  )

  if (item.external) {
    return (
      <li>
        <a
          href={item.href}
          className={linkClasses}
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
            onClick?.()
          }}
        >
          {content}
        </a>
      </li>
    )
  }

  return (
    <li>
      <Link 
        href={item.href} 
        className={linkClasses} 
        onClick={() => {
          trackNavigationClick({
            label: item.label,
            url: item.href,
            level: 'main',
            deviceType: isMobile ? 'mobile' : 'desktop',
            isExternal: false,
            location: isMobile ? 'mobile_menu' : 'header'
          })
          onClick?.()
        }}
      >
        {content}
      </Link>
    </li>
  )
}

// Mobile menu component
interface MobileMenuProps {
  isOpen: boolean
  items: NavItem[]
  actions?: ReactNode
  variant?: 'default' | 'light' | 'transparent'
  onClose: () => void
}

const MobileMenu = ({ isOpen, items, actions, variant = 'default', onClose }: MobileMenuProps) => {
  if (!isOpen) return null

  const menuClasses = cn(
    'absolute top-full left-0 right-0 shadow-lg',
    variant === 'default' && 'bg-anchor-green-dark',
    variant === 'light' && 'bg-white',
    variant === 'transparent' && 'bg-white/95 backdrop-blur'
  )

  return (
    <div 
      className={menuClasses}
      role="dialog"
      aria-label="Mobile navigation menu"
      aria-modal="true"
    >
      <div className="container mx-auto px-4 py-6">
        <ul className="space-y-4">
          {items.map((item) => (
            <NavItem 
              key={item.href} 
              item={item} 
              variant={variant} 
              onClick={onClose}
              isMobile={true}
            />
          ))}
        </ul>
        {actions && (
          <div className="mt-6 pt-6 border-t border-white/20">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

NavBar.displayName = 'NavBar'
