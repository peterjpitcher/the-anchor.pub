import { canUseCookieCategory } from './cookies'

const DEFAULT_META_PIXEL_ID = '757659911002159'

type FbqCommand = 'init' | 'track' | 'trackCustom' | 'consent'

type Fbq = {
  (...args: unknown[]): void
  callMethod?: (...args: unknown[]) => void
  queue?: unknown[][]
  loaded?: boolean
  version?: string
  push?: Fbq
}

declare global {
  interface Window {
    fbq?: Fbq
    _fbq?: Fbq
    __anchorMetaPixelInitialized?: boolean
    __anchorMetaPixelPurchaseEvents?: Set<string>
  }
}

export interface MetaBookingPurchase {
  eventId: string
  value?: number | null
  currency?: string
  bookingType: 'table' | 'event' | string
  bookingSource?: string
  contentName?: string
}

export function getMetaPixelId() {
  return process.env.NEXT_PUBLIC_META_PIXEL_ID || DEFAULT_META_PIXEL_ID
}

export function ensureMetaPixel() {
  if (typeof window === 'undefined') return false
  if (!canUseCookieCategory('marketing')) return false

  const pixelId = getMetaPixelId().trim()
  if (!pixelId) return false

  const fbq = installFbq()
  if (!window.__anchorMetaPixelInitialized) {
    fbq('init', pixelId)
    fbq('track', 'PageView')
    window.__anchorMetaPixelInitialized = true
  }

  return true
}

export function trackMetaBookingPurchase(data: MetaBookingPurchase) {
  if (!data.eventId.trim()) return false
  if (!ensureMetaPixel()) return false

  const eventId = data.eventId.trim()
  window.__anchorMetaPixelPurchaseEvents = window.__anchorMetaPixelPurchaseEvents ?? new Set<string>()
  if (window.__anchorMetaPixelPurchaseEvents.has(eventId)) return false
  window.__anchorMetaPixelPurchaseEvents.add(eventId)

  window.fbq?.(
    'track',
    'Purchase',
    {
      value: normaliseValue(data.value),
      currency: data.currency || 'GBP',
      content_category: 'booking',
      content_name: data.contentName || 'Booking',
      booking_type: data.bookingType,
      booking_source: data.bookingSource
    },
    { eventID: eventId }
  )

  return true
}

function normaliseValue(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0
}

function installFbq(): Fbq {
  if (window.fbq) return window.fbq

  const fbq = ((...args: unknown[]) => {
    if (fbq.callMethod) {
      fbq.callMethod(...args)
      return
    }
    fbq.queue = fbq.queue ?? []
    fbq.queue.push(args)
  }) as Fbq

  fbq.push = fbq
  fbq.loaded = true
  fbq.version = '2.0'
  fbq.queue = []

  window.fbq = fbq
  window._fbq = fbq

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  const firstScript = document.getElementsByTagName('script')[0]
  firstScript?.parentNode?.insertBefore(script, firstScript)

  return fbq
}

export {}
