'use client'

import { useEffect } from 'react'
import { canUseCookieCategory, getConsentStatus } from '@/lib/cookies'

interface GTMProviderProps {
  gtmId: string
  children: React.ReactNode
}

declare global {
  interface Window {
    __gtmLoaded?: boolean
  }
}

/**
 * Whether Google Tag Manager may be loaded for this visitor.
 *
 * Analytics cookies accepted, and nothing less. Owner decision of 7 October
 * 2026: Google Analytics and Microsoft Clarity are off until a visitor presses
 * Accept.
 *
 * Why the whole container waits rather than just those two tags: the published
 * container (GTM-WWFQTQS, version 8, read on 7 October 2026) fires its Google
 * tag and its Clarity tag with no consent condition. Loaded before a choice, or
 * after Reject, both ran and sent the page address to Google and Microsoft on
 * every page. The container is not in this repository, so the one rule this
 * site can enforce by itself is whether the container loads at all.
 *
 * Why analytics and not "analytics or marketing": a visitor who switches
 * marketing on and analytics off would get the container, and with it Google
 * Analytics and Clarity, which is exactly what they refused. The cost is that
 * Meta's pixel and LinkedIn's tag, which live in the same container, also wait
 * for analytics. Once the container itself requires analytics consent on the
 * Google tag and no longer carries a Clarity tag, this can become
 * "analytics or marketing". The privacy notice (section 5) says what this
 * function does; change one, change the other.
 */
export function mayLoadTagManager(): boolean {
  return canUseCookieCategory('analytics')
}

/**
 * Adds Google's standard Tag Manager snippet to the page, once.
 *
 * Called after the consent state has been pushed to the dataLayer, so the
 * container reads the visitor's choice before it runs any tag. A visitor who
 * accepts part way through a page gets the container at that moment and the
 * page they are on is counted; nothing about the pages before it is sent.
 */
function loadTagManager(gtmId: string) {
  if (window.__gtmLoaded) return
  window.__gtmLoaded = true

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`
  document.head.appendChild(script)
}

export function GTMProvider({ gtmId, children }: GTMProviderProps) {
  useEffect(() => {
    if (!gtmId) return

    // A returning visitor who accepted on an earlier visit: the consent default
    // set inline in <head> (app/layout.tsx) already carries their choice.
    if (mayLoadTagManager()) loadTagManager(gtmId)

    const handleConsentUpdate = () => {
      const consent = getConsentStatus()
      if (!consent) return

      if (window.gtag) {
        // The update must carry the same key set as the default in
        // app/layout.tsx. Google treats any key omitted from an update as
        // unchanged, so a missing ad_user_data here would silently leave the
        // visitor's advertising choice stuck at the denied default.
        window.gtag('consent', 'update', {
          'analytics_storage': consent.analytics ? 'granted' : 'denied',
          'ad_storage': consent.marketing ? 'granted' : 'denied',
          'ad_user_data': consent.marketing ? 'granted' : 'denied',
          'ad_personalization': consent.marketing ? 'granted' : 'denied'
        })
      }

      // After the update above, so the container starts with the choice in
      // hand. Switching analytics off needs nothing here: lib/cookies.ts
      // reloads the page, and the page that loads next never adds the script.
      if (mayLoadTagManager()) loadTagManager(gtmId)
    }

    // No "already wired" flag on window. There used to be one, and under
    // React's development double run it stopped the listener being added back
    // after the first clean-up, so a consent change did nothing in `next dev`.
    // The clean-up below is what keeps this to one listener.
    window.addEventListener('cookieConsentUpdate', handleConsentUpdate)
    return () => window.removeEventListener('cookieConsentUpdate', handleConsentUpdate)
  }, [gtmId])

  return <>{children}</>
}
