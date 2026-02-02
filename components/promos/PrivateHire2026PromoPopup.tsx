'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button, Modal, ModalBody } from '@/components/ui'
import { pushToDataLayer } from '@/lib/gtm-events'
import { useCountdown, type CountdownState } from '@/hooks/useCountdown'
import {
  PRIVATE_HIRE_2026_PROMO_CTA_HREF,
  PRIVATE_HIRE_2026_PROMO_DEPOSIT_DEADLINE_COPY,
  PRIVATE_HIRE_2026_PROMO_DISMISS_MS,
  PRIVATE_HIRE_2026_PROMO_DISMISS_STORAGE_KEY,
  PRIVATE_HIRE_2026_PROMO_ENDS_AT_MS,
  PRIVATE_HIRE_2026_PROMO_IMAGE_ALT,
  PRIVATE_HIRE_2026_PROMO_IMAGE_SRC,
  PRIVATE_HIRE_2026_PROMO_ID,
  PRIVATE_HIRE_2026_PROMO_PHONE,
  PRIVATE_HIRE_2026_PROMO_PHONE_HREF,
  PRIVATE_HIRE_2026_PROMO_DISABLED_STORAGE_KEY
} from '@/lib/promos/privateHire2026'

function formatCountdownForDisplay(countdown: CountdownState) {
  const pad = (value: number) => String(value).padStart(2, '0')

  return [
    { label: 'Days', value: String(countdown.days) },
    { label: 'Hours', value: pad(countdown.hours) },
    { label: 'Mins', value: pad(countdown.minutes) },
    { label: 'Secs', value: pad(countdown.seconds) }
  ]
}

function readNumberFromStorage(key: string) {
  if (typeof window === 'undefined') return null
  try {
    const stored = window.localStorage.getItem(key)
    if (!stored) return null
    const parsed = Number(stored)
    return Number.isNaN(parsed) ? null : parsed
  } catch {
    return null
  }
}

function writeNumberToStorage(key: string, value: number) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, String(value))
  } catch {
    // Ignore storage failures (private mode / quota). UX should still work.
  }
}

function readBooleanFromStorage(key: string) {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(key) === 'true'
  } catch {
    return false
  }
}

export function PrivateHire2026PromoPopup() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [evaluated, setEvaluated] = useState(false)

  const countdown = useCountdown(PRIVATE_HIRE_2026_PROMO_ENDS_AT_MS, open)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const now = Date.now()
    const isEnded = now >= PRIVATE_HIRE_2026_PROMO_ENDS_AT_MS
    const dismissedUntil = readNumberFromStorage(PRIVATE_HIRE_2026_PROMO_DISMISS_STORAGE_KEY)
    const isSuppressed = Boolean(dismissedUntil && now < dismissedUntil)
    const isDisabled = readBooleanFromStorage(PRIVATE_HIRE_2026_PROMO_DISABLED_STORAGE_KEY)

    if (isEnded || isDisabled || isSuppressed) {
      setOpen(false)
      setEvaluated(true)
      return
    }

    setOpen(true)
    setEvaluated(true)
  }, [pathname])

  useEffect(() => {
    if (!open) return

    pushToDataLayer({
      event: 'promo_popup_view',
      event_category: 'Promo',
      promo_id: PRIVATE_HIRE_2026_PROMO_ID
    })
  }, [open])

  useEffect(() => {
    if (!open) return
    if (!countdown.expired) return
    setOpen(false)
  }, [countdown.expired, open])

  const dismiss = () => {
    writeNumberToStorage(
      PRIVATE_HIRE_2026_PROMO_DISMISS_STORAGE_KEY,
      Date.now() + PRIVATE_HIRE_2026_PROMO_DISMISS_MS
    )

    pushToDataLayer({
      event: 'promo_popup_close',
      event_category: 'Promo',
      promo_id: PRIVATE_HIRE_2026_PROMO_ID
    })

    setOpen(false)
  }

  const handleCtaClick = () => {
    writeNumberToStorage(
      PRIVATE_HIRE_2026_PROMO_DISMISS_STORAGE_KEY,
      Date.now() + PRIVATE_HIRE_2026_PROMO_DISMISS_MS
    )

    pushToDataLayer({
      event: 'promo_popup_cta_click',
      event_category: 'Promo',
      promo_id: PRIVATE_HIRE_2026_PROMO_ID,
      destination: PRIVATE_HIRE_2026_PROMO_CTA_HREF
    })

    setOpen(false)
  }

  const handlePhoneClick = () => {
    writeNumberToStorage(
      PRIVATE_HIRE_2026_PROMO_DISMISS_STORAGE_KEY,
      Date.now() + PRIVATE_HIRE_2026_PROMO_DISMISS_MS
    )

    pushToDataLayer({
      event: 'promo_phone_click',
      event_category: 'Promo',
      promo_id: PRIVATE_HIRE_2026_PROMO_ID,
      phone: PRIVATE_HIRE_2026_PROMO_PHONE
    })

    setOpen(false)
  }

  if (!evaluated || !open) return null

  const segments = formatCountdownForDisplay(countdown)

  return (
    <Modal
      open={open}
      onClose={dismiss}
      id="private-hire-2026-promo"
      title="Private hire promo"
      description="Limited-time private hire offer for 2026 bookings."
      className="flex max-h-[85vh] flex-col overflow-hidden rounded-3xl border-0 shadow-2xl"
      showCloseButton={false}
    >
      <div className="relative isolate h-64 w-full shrink-0 sm:h-72">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-4 top-4 z-50 rounded-full bg-black/20 p-2 text-white/90 backdrop-blur-sm transition-all hover:bg-black/40 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 drop-shadow-sm">
            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
        </button>
        <Image
          src={PRIVATE_HIRE_2026_PROMO_IMAGE_SRC}
          alt={PRIVATE_HIRE_2026_PROMO_IMAGE_ALT}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 90vw, 520px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <h2 id="private-hire-2026-promo-title" className="text-2xl font-bold leading-tight text-white drop-shadow-sm sm:text-3xl">
            Book your 2026 party early
          </h2>
          <p className="mt-1 text-lg font-medium text-anchor-gold drop-shadow-sm">
            — and the bubbles are on us 🥂
          </p>
        </div>
      </div>

      <ModalBody className="flex-1 space-y-6 overflow-y-auto bg-white px-6 py-6 sm:px-8">
        <div className="rounded-2xl bg-anchor-green/5 p-4 ring-1 ring-inset ring-anchor-green/10">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-bold uppercase tracking-widest text-anchor-green">
              Offer ends in
            </p>
            <div className="flex gap-2">
              {segments.map((segment) => (
                <div
                  key={segment.label}
                  className="flex flex-col items-center rounded-lg bg-white px-2.5 py-1.5 text-center shadow-sm ring-1 ring-gray-900/5"
                >
                  <span className="font-mono text-lg font-bold leading-none text-anchor-green">
                    {segment.value}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
                    {segment.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p id="private-hire-2026-promo-description" className="text-base leading-relaxed text-gray-600">
            Secure your 2026 celebration now and pay your deposit by{' '}
            <strong className="font-semibold text-gray-900">{PRIVATE_HIRE_2026_PROMO_DEPOSIT_DEADLINE_COPY}</strong> to receive{' '}
            <strong className="font-semibold text-anchor-green">4 FREE bottles of prosecco</strong> to get the party started.
          </p>

          <div className="rounded-xl bg-gray-50 p-4">
            <ul className="space-y-2 text-sm font-medium text-gray-600">
              <li className="flex gap-2.5">
                <span className="shrink-0 text-anchor-gold">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                </span>
                <span>Minimum 30 guests required</span>
              </li>
              <li className="flex gap-2.5">
                <span className="shrink-0 text-anchor-gold">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                </span>
                <span>Valid for new 2026 bookings only</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Button asChild variant="primary" size="lg" className="w-full rounded-full shadow-lg shadow-anchor-green/20 hover:shadow-xl hover:shadow-anchor-green/30" onClick={handleCtaClick}>
            <Link href={PRIVATE_HIRE_2026_PROMO_CTA_HREF}>Check availability / Get a quote</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="w-full text-gray-500 hover:text-gray-900" onClick={handlePhoneClick}>
            <a href={PRIVATE_HIRE_2026_PROMO_PHONE_HREF}>Or call us on {PRIVATE_HIRE_2026_PROMO_PHONE}</a>
          </Button>
        </div>
      </ModalBody>
    </Modal>
  )
}
