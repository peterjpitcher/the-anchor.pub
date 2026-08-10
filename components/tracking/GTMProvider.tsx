'use client'

import { useEffect } from 'react'
import { getConsentStatus } from '@/lib/cookies'

interface GTMProviderProps {
  gtmId: string
  children: React.ReactNode
}

declare global {
  interface Window {
    __gtmInitialized?: boolean
  }
}

export function GTMProvider({ gtmId, children }: GTMProviderProps) {
  useEffect(() => {
    if (!gtmId) return
    if (window.__gtmInitialized) return
    window.__gtmInitialized = true

    // Consent defaults are set inline in <head> before GTM loads.
    // This listener handles consent updates when users interact with the banner.
    const handleConsentUpdate = () => {
      const consent = getConsentStatus()
      if (consent && window.gtag) {
        // The update must carry the same key set as the default in
        // app/layout.tsx. Google treats any key omitted from an update as
        // unchanged, so a missing ad_user_data here would silently leave the
        // visitor's advertising choice stuck at the denied default.
        window.gtag('consent', 'update', {
          'analytics_storage': consent.analytics ? 'granted' : 'denied',
          'ad_storage': consent.marketing ? 'granted' : 'denied',
          'ad_user_data': consent.marketing ? 'granted' : 'denied',
          'ad_personalization': consent.marketing ? 'granted' : 'denied',
          'personalization_storage': consent.preferences ? 'granted' : 'denied'
        })
      }
    }

    window.addEventListener('cookieConsentUpdate', handleConsentUpdate)
    return () => window.removeEventListener('cookieConsentUpdate', handleConsentUpdate)
  }, [gtmId])

  if (!gtmId) return <>{children}</>

  return <>{children}</>
}

// Separate noscript component for body
export function GTMNoscript({ gtmId }: { gtmId: string }) {
  if (!gtmId) return null

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}
