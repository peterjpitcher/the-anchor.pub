'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { PhoneLink } from '@/components/PhoneLink'
import { DirectionsLink } from '@/components/DirectionsButton'
import { WhatsAppLink } from '@/components/WhatsAppLink'
import { trackTableBookingClick } from '@/lib/gtm-events'
import { cn } from '@/lib/utils'

export function FloatingActions() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const menuRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const menuId = 'floating-actions-menu'
  const hideOnMobileEventPage = pathname?.startsWith('/events/')
  const hideForCustomCta =
    pathname?.startsWith('/private-hire') ||
    pathname === '/function-room-hire' ||
    pathname === '/corporate-events' ||
    pathname === '/private-party-venue'

  useEffect(() => {
    if (!isOpen) return

    const focusTarget = menuRef.current?.querySelector<HTMLElement>(
      'a, button, [tabindex]:not([tabindex="-1"])'
    )
    focusTarget?.focus()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <>
      {/* Backdrop */}
      {isOpen && !hideForCustomCta && (
        <div
          className={cn('fixed inset-0 bg-black/20 z-40 md:hidden', hideOnMobileEventPage && 'hidden lg:block')}
          onClick={() => setIsOpen(false)}
          role="presentation"
          aria-hidden="true"
        />
      )}

      {/* Floating Action Button, z-[70] to sit above FoodStickyCtaBar (z-[60]) */}
      <div
        className={cn('fixed bottom-6 right-6 z-[70]', hideForCustomCta && 'hidden', hideOnMobileEventPage && 'hidden lg:block')}
        data-testid="floating-actions"
      >
        {/* Action Menu */}
        <div
          className={`absolute bottom-16 right-0 transition-all duration-300 ${
            isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-4'
          }`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="floating-action-button"
          id={menuId}
          ref={menuRef}
        >
          <div className="card-dark min-w-[200px] max-w-[calc(100vw-3rem)] rounded-none shadow-2xl p-3 space-y-2 border border-anchor-gold-dark/20">
            <a
              href="/book-table"
              onClick={() => {
                trackTableBookingClick('floating_actions')
                setIsOpen(false)
              }}
              className="flex items-center gap-3 p-3 hover:bg-anchor-green-raised rounded-lg transition-colours w-full justify-start text-left"
              role="menuitem"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="font-medium">Book a Table</span>
              </span>
            </a>

            <PhoneLink
              phone="01753682707"
              source="floating_actions"
              className="flex items-center gap-3 p-3 hover:bg-anchor-green-raised rounded-lg transition-colours"
              showIcon={false}
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              <span className="font-medium">Call Us</span>
            </PhoneLink>

            <WhatsAppLink
              phone="01753682707"
              source="floating_actions"
              className="flex items-center gap-3 p-3 hover:bg-anchor-green-raised rounded-lg transition-colors w-full"
              showIcon={false}
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              <span className="font-medium">WhatsApp</span>
            </WhatsAppLink>
            <DirectionsLink
              href="https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ"
              source="floating_actions"
              className="flex items-center gap-3 p-3 hover:bg-anchor-green-raised rounded-lg transition-colours w-full"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              <span className="font-medium">Get Directions</span>
            </DirectionsLink>

            <a
              href="/food-menu"
              className="flex items-center gap-3 p-3 hover:bg-anchor-green-raised rounded-lg transition-colours"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              <span className="font-medium">View Menu</span>
            </a>
          </div>
        </div>

        {/* Main FAB Button */}
        <button
          id="floating-action-button"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-anchor-gold-dark hover:bg-anchor-gold text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
          aria-label={isOpen ? 'Close contact options' : 'Contact options'}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-controls={menuId}
          ref={buttonRef}
        >
          {isOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
              />
            </svg>
          )}
        </button>
      </div>

    </>
  )
}
