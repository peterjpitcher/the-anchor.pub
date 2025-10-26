import type { Metadata } from 'next'
import './globals.css'
import { WebVitals } from './web-vitals'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { Weather } from '@/components/Weather'
import { HeaderStatusSectionDirect } from '@/components/HeaderStatusSectionDirect'
import { FloatingActions } from '@/components/FloatingActions'
import { DynamicSchema } from '@/components/DynamicSchema'
import { AnalyticsProvider } from '@/components/AnalyticsProvider'
import { GoogleTagManager, GoogleTagManagerNoscript } from '@/components/GoogleTagManager'
import { GTMProvider, GTMNoscript } from '@/components/GTMProvider'
import { CanonicalLink } from '@/components/CanonicalLink'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import CookieBanner from '@/components/CookieBanner'
import { ChristmasGlobalLightbox } from '@/components/ChristmasGlobalLightbox'
import { EventCountdownBanner } from '@/components/EventCountdownBanner'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
// Critical CSS for above-the-fold content
const criticalCSS = `
/* Critical CSS for above-the-fold content */
:root {
  --anchor-green: #005131;
  --anchor-gold: #a57626;
  --anchor-cream: #faf8f3;
  --anchor-charcoal: #1a1a1a;
  --anchor-gold-light: #d4a574;
  --anchor-green-dark: #003d25;
  --anchor-warm-white: #ffffff;
  --anchor-sage: #7a8b7f;
  --anchor-sand: #f5e6d3;
  --font-outfit: 'Outfit', 'Helvetica Neue', 'Arial', sans-serif;
  --font-merriweather: 'Merriweather', 'Georgia', serif;
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html {
  scroll-behavior: smooth;
  scroll-padding-top: 80px;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
  background: var(--anchor-warm-white);
}

body {
  color: var(--anchor-charcoal);
  font-family: var(--font-outfit), system-ui, -apple-system, sans-serif;
  font-weight: 400;
  line-height: 1.7;
}

/* Critical hero section styles */
.relative { position: relative; }
.absolute { position: absolute; }
.inset-0 { inset: 0; }
.z-10 { z-index: 10; }
.min-h-\[90vh\] { min-height: 90vh; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.text-center { text-align: center; }
.object-cover { object-fit: cover; }

/* Critical text styles */
.text-white { color: white; }
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }

@media (min-width: 768px) {
  .md\:text-6xl { font-size: 3.75rem; line-height: 1; }
}

@media (min-width: 1024px) {
  .lg\:text-7xl { font-size: 4.5rem; line-height: 1; }
}

/* Prevent layout shift */
.min-h-\[44px\] { min-height: 44px; }
.h-\[44px\] { height: 44px; }
.w-\[280px\] { width: 280px; }
.h-\[300px\] { height: 300px; }

/* Reduce motion */
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`

export const metadata: Metadata = {
  metadataBase: new URL('https://www.the-anchor.pub'),
  title: {
    default: 'Traditional Bar Near Me | The Anchor - Heathrow Pub & Dining | Surrey Bar Near Heathrow',
    template: '%s | The Anchor - Heathrow Pub & Dining'
  },
  description: 'The Anchor in Stanwell Moor, Surrey\'s best kept secret near Heathrow Airport. Traditional British venue with drag shows, quiz nights & more. Dog-friendly beer garden under the flight path.',
  keywords: ['bar near me', 'bar near Heathrow', 'Stanwell Moor bar', 'drag shows near me', 'quiz night', 'dog friendly bar', 'beer garden', 'TW19 bar'],
  authors: [{ name: 'The Anchor' }],
  creator: 'The Anchor',
  publisher: 'The Anchor',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'The Anchor - Heathrow Pub & Dining\'s Premier Entertainment Venue',
    description: 'Traditional British venue near Heathrow with drag shows, live entertainment & great food. Dog-friendly beer garden.',
    url: 'https://www.the-anchor.pub',
    siteName: 'The Anchor',
    images: [
      {
        url: DEFAULT_PAGE_HEADER_IMAGE,
        width: 1200,
        height: 630,
        alt: 'The Anchor in Stanwell Moor',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Anchor - Near Heathrow Airport',
    description: 'Traditional venue with modern entertainment. Drag shows, quiz nights, great food & more.',
    images: [DEFAULT_PAGE_HEADER_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || ''

  return (
    <html lang="en">
      <head>
        <GoogleTagManager gtmId={gtmId} />
        
        {/* Resource hints for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://management.orangejelly.co.uk" />
        <link rel="preconnect" href="https://openweathermap.org" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        {/* Favicons and manifest */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#005131" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Canonical URL */}
        <CanonicalLink />
        
        {/* Inline critical CSS to prevent render blocking */}
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        
        {/* Next.js handles font and image prioritisation automatically */}
        <DynamicSchema />
      </head>
      <body className="font-sans antialiased">
        <GTMNoscript gtmId={gtmId} />
        <GTMProvider gtmId={gtmId}>
          <AnalyticsProvider>
            <WebVitals />
            {/* Skip Navigation Links for Accessibility */}
            <a 
              href="#main-content" 
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-anchor-gold focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-anchor-gold"
            >
              Skip to main content
            </a>
            <ErrorBoundary>
              <header role="banner">
                <Navigation 
                  statusComponent={<HeaderStatusSectionDirect />}
                  showWeather={false}
                />
              </header>
            </ErrorBoundary>
            <main id="main-content" role="main">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main>
            <ErrorBoundary>
              <footer role="contentinfo">
                <Footer />
              </footer>
            </ErrorBoundary>
            <FloatingActions />
            <CookieBanner />
            <ChristmasGlobalLightbox />
            <EventCountdownBanner />
          </AnalyticsProvider>
        </GTMProvider>
      </body>
    </html>
  )
}
