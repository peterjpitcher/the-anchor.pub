'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { BookTableButton } from '@/components/BookTableButton'
import { Button } from '@/components/ui'
import Link from 'next/link'
import { trackContextCtaClick, trackCtaClick, trackStickyCtaShown } from '@/lib/gtm-events'
import { cn } from '@/lib/utils'
import { useKitchenStatus } from '@/hooks/useKitchenStatus'
import { StatusIndicator } from '@/components/ui/StatusIndicator'
import { formatTime12Hour } from '@/lib/time-utils'

type StickyContext = 'food' | 'sunday_roast' | 'pizza_menu' | 'heathrow_layover'

interface FoodStickyCtaBarProps {
  ctaContext: StickyContext
  whatsapp?: {
    href: string
    label?: string
    id?: string
  }
  label?: string
  variant?: 'primary' | 'secondary'
  bookingUrl?: string
}

type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown'

interface SecondaryCta {
  label: string
  analyticsLabel: 'view_roast_menu' | 'pizza_menu' | 'view_hours'
  action: 'scroll' | 'link'
  targetId?: string
  href?: string
}

const DEFAULT_SECONDARY: SecondaryCta = {
  label: 'View Kitchen Hours',
  analyticsLabel: 'view_hours',
  action: 'scroll',
  targetId: 'kitchen-hours'
}

function resolveDeviceType(width: number): DeviceType {
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

function getLondonNow(): Date {
  const now = new Date()
  const londonString = now.toLocaleString('en-GB', { timeZone: 'Europe/London' })
  return new Date(londonString)
}

function buildSecondaryCta(): SecondaryCta {
  const now = getLondonNow()
  const day = now.getDay() // 0 Sunday, 2 Tuesday
  const minutes = now.getHours() * 60 + now.getMinutes()

  if (day === 0 && minutes < 17 * 60) {
    return {
      label: 'View Roast Menu',
      analyticsLabel: 'view_roast_menu',
      action: 'link',
      href: '/sunday-roast'
    }
  }

  if (day === 2 && minutes >= 16 * 60 && minutes <= 21 * 60 + 30) {
    return {
      label: 'Pizza Tonight',
      analyticsLabel: 'pizza_menu',
      action: 'scroll',
      targetId: 'pizza'
    }
  }

  return DEFAULT_SECONDARY
}

export function FoodStickyCtaBar({
  ctaContext,
  whatsapp,
  label = 'Book a Table',
  variant = 'primary',
  bookingUrl
}: FoodStickyCtaBarProps) {
  const [deviceType, setDeviceType] = useState<DeviceType>('unknown')
  const [shouldRender, setShouldRender] = useState(false)
  const [guardVisible, setGuardVisible] = useState(false)
  const [secondaryCta, setSecondaryCta] = useState<SecondaryCta>(DEFAULT_SECONDARY)
  const visibleSinceRef = useRef<number | null>(null)
  const { kitchen, loading: kitchenLoading } = useKitchenStatus()

  const whatsappHref = useMemo(() => {
    if (!whatsapp?.href) return undefined
    try {
      const url = new URL(whatsapp.href, 'https://www.the-anchor.pub')
      url.searchParams.set('utm_source', 'website')
      url.searchParams.set('utm_medium', 'sticky_cta')
      url.searchParams.set('utm_campaign', 'food-growth')
      return url.toString()
    } catch {
      return whatsapp?.href
    }
  }, [whatsapp?.href])

  const showKitchenStatusCard = ctaContext === 'food' && secondaryCta.analyticsLabel === 'view_hours'
  const showSecondaryButton = ctaContext === 'food' && secondaryCta.analyticsLabel !== 'view_hours'

  const kitchenStatusInfo = useMemo<{
    indicator: 'open' | 'closed' | 'warning'
    message: string
    pulse: boolean
  } | null>(() => {
    if (!showKitchenStatusCard) {
      return null
    }

    if (kitchenLoading) {
      return {
        indicator: 'warning',
        message: 'Checking kitchen hours…',
        pulse: false
      }
    }

    if (!kitchen) {
      return {
        indicator: 'warning',
        message: 'Kitchen hours unavailable',
        pulse: false
      }
    }

    if (kitchen.status === 'open') {
      const closesAt = kitchen.closesAt ? formatTime12Hour(kitchen.closesAt) : null
      return {
        indicator: 'open',
        message: closesAt ? `Kitchen open until ${closesAt}` : 'Kitchen open',
        pulse: true
      }
    }

    if (kitchen.status === 'closed') {
      const opensAt = kitchen.opensAt ? formatTime12Hour(kitchen.opensAt) : null
      return {
        indicator: 'closed',
        message: opensAt ? `Kitchen opens at ${opensAt}` : kitchen.message ?? 'Kitchen closed today',
        pulse: false
      }
    }

    return {
      indicator: 'warning',
      message: kitchen.message ?? 'No kitchen service today',
      pulse: false
    }
  }, [kitchen, kitchenLoading, showKitchenStatusCard])

  // Detect device and respond to resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const type = resolveDeviceType(width)
      setDeviceType(type)
      setShouldRender(type === 'mobile')
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Evaluate secondary CTA for food context
  useEffect(() => {
    if (ctaContext !== 'food') return

    const updateCta = () => {
      setSecondaryCta(buildSecondaryCta())
    }

    updateCta()
    const intervalId = window.setInterval(updateCta, 60_000)
    return () => window.clearInterval(intervalId)
  }, [ctaContext])

  // Observe guard elements to hide sticky CTA when a full-width CTA is visible
  useEffect(() => {
    if (typeof window === 'undefined') return

    const guards = Array.from(
      document.querySelectorAll<HTMLElement>('[data-sticky-cta-guard="true"]')
    )

    if (guards.length === 0) {
      setGuardVisible(false)
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        const isAnyGuardVisible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.75)
        setGuardVisible(isAnyGuardVisible)
      },
      { threshold: [0.25, 0.5, 0.75, 1] }
    )

    guards.forEach(guard => observer.observe(guard))

    return () => observer.disconnect()
  }, [])

  const isVisible = shouldRender && !guardVisible

  // Track visibility duration
  useEffect(() => {
    if (!isVisible) {
      if (visibleSinceRef.current !== null) {
        const elapsedMs = Date.now() - visibleSinceRef.current
        const seconds = Math.round(elapsedMs / 1000)
        if (seconds > 0) {
          trackStickyCtaShown({
            secondsVisible: seconds,
            context: ctaContext,
            deviceType,
            location: 'sticky_bar'
          })
        }
        visibleSinceRef.current = null
      }
      return
    }

    if (visibleSinceRef.current === null) {
      visibleSinceRef.current = Date.now()
    }
  }, [ctaContext, deviceType, isVisible])

  // Ensure we flush on unmount
  useEffect(() => {
    return () => {
      if (visibleSinceRef.current !== null) {
        const elapsedMs = Date.now() - visibleSinceRef.current
        const seconds = Math.round(elapsedMs / 1000)
        if (seconds > 0) {
          trackStickyCtaShown({
            secondsVisible: seconds,
            context: ctaContext,
            deviceType,
            location: 'sticky_bar'
          })
        }
        visibleSinceRef.current = null
      }
    }
  }, [ctaContext, deviceType])

  const handleSecondaryClick = () => {
    if (ctaContext !== 'food') {
      return
    }

    trackContextCtaClick({
      label: secondaryCta.label,
      destination: secondaryCta.action === 'link'
        ? secondaryCta.href ?? '#'
        : secondaryCta.targetId ?? '',
      context: secondaryCta.analyticsLabel,
      location: 'sticky_bar',
      mode: secondaryCta.action
    })

    if (secondaryCta.action === 'link' && secondaryCta.href) {
      window.location.href = secondaryCta.href
      return
    }

    if (secondaryCta.action === 'scroll' && secondaryCta.targetId) {
      const target = document.getElementById(secondaryCta.targetId)
      if (!target) return
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      })
      if (history.replaceState) {
        history.replaceState(null, '', `#${secondaryCta.targetId}`)
      }
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-anchor-gold-dark/15 bg-anchor-green-card/95 shadow-xl backdrop-blur supports-[backdrop-filter]:backdrop-blur" data-testid="food-sticky-cta-bar">
      <div className="mx-auto max-w-5xl px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
        <div className="flex flex-col gap-3">
          <div className="text-left">
            <span className="block text-sm font-semibold text-anchor-cream-text">
              Ready to book?
            </span>
            <span className="block text-xs text-anchor-cream-text/55">
              Reserve your table in under 60 seconds.
            </span>
          </div>

          {showKitchenStatusCard && kitchenStatusInfo && (
            <div className="flex items-center gap-2 rounded-lg border border-anchor-gold-dark/20 bg-anchor-green-raised px-3 py-2">
              <StatusIndicator
                status={kitchenStatusInfo.indicator}
                size="sm"
                showPulse={kitchenStatusInfo.pulse}
              />
              <span className="text-sm font-medium text-anchor-gold-bright">
                {kitchenStatusInfo.message}
              </span>
            </div>
          )}

          <BookTableButton
            source={`sticky_${ctaContext}`}
            context={ctaContext}
            variant={variant}
            size="md"
            className="w-full"
            customHref={bookingUrl}
          >
            {label}
          </BookTableButton>

          {ctaContext === 'food' ? (
            showSecondaryButton ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full border-anchor-green text-anchor-green hover:bg-anchor-green hover:text-white"
                onClick={handleSecondaryClick}
              >
                {secondaryCta.label}
              </Button>
            ) : null
          ) : (
            whatsapp &&
            whatsappHref && (
              <Button
                asChild
                variant="outline"
                size="sm"
                fullWidth
                className={cn(
                  'w-full border-anchor-green text-anchor-green hover:bg-anchor-green hover:text-white'
                )}
                onClick={() =>
                  trackCtaClick({
                    id: whatsapp.id ?? `whatsapp_${ctaContext}`,
                    label: whatsapp.label ?? 'WhatsApp',
                    location: `sticky_${ctaContext}`,
                    destination: 'whatsapp',
                    context: ctaContext,
                    mode: 'whatsapp',
                    variant: 'outline'
                  })
                }
              >
                <Link href={whatsappHref} aria-label={whatsapp.label ?? 'WhatsApp Us'}>
                  {whatsapp.label ?? 'WhatsApp Us'}
                </Link>
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
