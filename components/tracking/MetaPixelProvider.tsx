'use client'

import { useEffect } from 'react'

import { ensureMetaPixel } from '@/lib/meta-pixel'

export function MetaPixelProvider() {
  useEffect(() => {
    ensureMetaPixel()

    const onConsentUpdate = () => {
      ensureMetaPixel()
    }

    window.addEventListener('cookieConsentUpdate', onConsentUpdate)
    return () => window.removeEventListener('cookieConsentUpdate', onConsentUpdate)
  }, [])

  return null
}
