'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@/components/ui'
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
      size="md"
      backdrop="blur"
      id="private-hire-2026-promo"
      title="Private hire promo"
      description="Limited-time private hire offer for 2026 bookings."
      className="flex max-h-[85vh] flex-col overflow-hidden"
    >
      <ModalHeader className="border-b border-gray-100">
        <div className="pr-10">
          <ModalTitle id="private-hire-2026-promo-title" className="text-xl text-anchor-green">
            Book your 2026 party early — bubbles on us 🥂
          </ModalTitle>
        </div>
      </ModalHeader>

      <ModalBody className="flex-1 space-y-3 overflow-y-auto">
        <p id="private-hire-2026-promo-description" className="text-sm text-gray-600">
          Book your 2026 party with us and pay your deposit by{' '}
          <span className="font-semibold">{PRIVATE_HIRE_2026_PROMO_DEPOSIT_DEADLINE_COPY}</span> to receive{' '}
          <span className="font-semibold">4 FREE bottles of prosecco</span> to get the party started.
        </p>

        <div className="relative overflow-hidden rounded-xl bg-gray-100">
          <div className="relative aspect-[21/9]">
            <Image
              src={PRIVATE_HIRE_2026_PROMO_IMAGE_SRC}
              alt={PRIVATE_HIRE_2026_PROMO_IMAGE_ALT}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 90vw, 520px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" aria-hidden="true" />
          </div>
        </div>

        <div className="rounded-xl bg-anchor-cream/40 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-700">
            Offer ends in
          </p>
          <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {segments.map((segment) => (
              <div
                key={segment.label}
                className="rounded-lg bg-white/80 px-2 py-1.5 text-center"
              >
                <div className="font-mono text-base font-bold text-gray-900">
                  {segment.value}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                  {segment.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-900">Key terms</h3>
          <ul className="space-y-1 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="mt-0.5 text-anchor-gold" aria-hidden="true">✓</span>
              <span>Minimum 30 guests</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 text-anchor-gold" aria-hidden="true">✓</span>
              <span>New 2026 bookings only</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 text-anchor-gold" aria-hidden="true">✓</span>
              <span>Deposit paid by {PRIVATE_HIRE_2026_PROMO_DEPOSIT_DEADLINE_COPY} to qualify</span>
            </li>
          </ul>
        </div>

        <p className="text-xs text-gray-500">
          Subject to availability. No cash alternative.
        </p>
      </ModalBody>

      <ModalFooter className="flex flex-col gap-2">
        <Button asChild variant="primary" size="md" fullWidth onClick={handleCtaClick}>
          <Link href={PRIVATE_HIRE_2026_PROMO_CTA_HREF}>Check availability / Get a quote</Link>
        </Button>
        <Button asChild variant="outline" size="md" fullWidth onClick={handlePhoneClick}>
          <a href={PRIVATE_HIRE_2026_PROMO_PHONE_HREF}>Call {PRIVATE_HIRE_2026_PROMO_PHONE}</a>
        </Button>
      </ModalFooter>
    </Modal>
  )
}
