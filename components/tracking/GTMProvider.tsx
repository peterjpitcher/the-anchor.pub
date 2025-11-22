'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { initializeConsentMode, getConsentStatus, hasUserConsented } from '@/lib/cookies'

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

    // Initialize dataLayer and gtag
    window.dataLayer = window.dataLayer || []
    window.gtag = window.gtag || function() {
      window.dataLayer!.push(arguments)
    }
    
    // Initialize Google consent mode before GTM loads
    initializeConsentMode()
    
    // Push initial GTM event
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    })

    // Listen for consent updates
    const handleConsentUpdate = () => {
      const consent = getConsentStatus()
      if (consent) {
        window.gtag!('consent', 'update', {
          'analytics_storage': consent.analytics ? 'granted' : 'denied',
          'ad_storage': consent.marketing ? 'granted' : 'denied',
          'personalization_storage': consent.preferences ? 'granted' : 'denied'
        })
      }
    }
    
    window.addEventListener('cookieConsentUpdate', handleConsentUpdate)
    return () => window.removeEventListener('cookieConsentUpdate', handleConsentUpdate)
  }, [gtmId])

  if (!gtmId) return <>{children}</>

  return (
    <>
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `,
        }}
      />
      {children}
    </>
  )
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
