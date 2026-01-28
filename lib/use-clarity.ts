'use client'

import { useEffect } from 'react'
import Clarity from '@microsoft/clarity'
import { getConsentStatus } from '@/lib/cookies'

declare global {
  interface Window {
    __clarityInitialized?: boolean
  }
}

type ClarityConsentOptions = NonNullable<Parameters<typeof Clarity.consentV2>[0]>

function getClarityConsentOptions(): ClarityConsentOptions {
  const consent = getConsentStatus()

  return {
    ad_Storage: consent?.marketing ? 'granted' : 'denied',
    analytics_Storage: consent?.analytics ? 'granted' : 'denied'
  }
}

function ensureClarityInitialized(projectId: string) {
  if (window.__clarityInitialized) return
  Clarity.init(projectId)
  window.__clarityInitialized = true
}

export function useClarity() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID
    if (!projectId) return

    const syncConsent = () => {
      const consentOptions = getClarityConsentOptions()

      if (consentOptions.analytics_Storage === 'granted') {
        ensureClarityInitialized(projectId)
      }

      if (window.__clarityInitialized) {
        Clarity.consentV2(consentOptions)
      }
    }

    syncConsent()

    const handleConsentUpdate = () => {
      syncConsent()
    }

    window.addEventListener('cookieConsentUpdate', handleConsentUpdate)
    return () => window.removeEventListener('cookieConsentUpdate', handleConsentUpdate)
  }, [])
}
