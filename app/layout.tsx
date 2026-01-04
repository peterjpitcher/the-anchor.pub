import type { Metadata } from 'next'
import { Outfit, Merriweather } from 'next/font/google'
import dynamic from 'next/dynamic'
import './globals.css'
import { WebVitals } from './web-vitals'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { HeaderStatusSectionDirect } from '@/components/layout/HeaderStatusSectionDirect'
import { FloatingActions } from '@/components/layout/FloatingActions'
import { AnalyticsProvider } from '@/components/tracking/AnalyticsProvider'
import { GTMProvider, GTMNoscript } from '@/components/tracking/GTMProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import CookieBanner from '@/components/CookieBanner'
import { DynamicSchema } from '@/components/seo/DynamicSchema'
import { BusinessHoursProvider } from '@/components/providers/BusinessHoursProvider'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { Suspense } from 'react'


const EventCountdownBanner = dynamic(() => import('@/components/EventCountdownBanner').then(mod => mod.EventCountdownBanner), {
  ssr: false
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const merriweather = Merriweather({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-merriweather',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.the-anchor.pub'),
  title: {
    default: 'Traditional Bar Near Me | The Anchor - Heathrow Pub & Dining | Surrey Bar Near Heathrow',
    template: '%s | The Anchor - Heathrow Pub & Dining'
  },
  description: 'The Anchor in Stanwell Moor, Surrey\'s best kept secret near Heathrow Airport. Traditional British venue with drag shows, quiz nights & more. Dog-friendly beer garden under the flight path.',
  keywords: ['bar near me', 'bar near Heathrow', 'Stanwell Moor bar', 'drag shows near me', 'quiz night', 'dog friendly bar', 'beer garden', 'pub garden', 'live music', 'TW19 bar'],
  authors: [{ name: 'The Anchor' }],
  creator: 'The Anchor',
  publisher: 'The Anchor',
  alternates: {
    canonical: './',
  },
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
        {/* Resource hints for performance */}
        <link rel="preconnect" href="https://management.orangejelly.co.uk" />
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

        {/* Next.js handles font and image prioritisation automatically */}
        <DynamicSchema />
      </head>
      <body className={`font-sans antialiased ${outfit.variable} ${merriweather.variable}`}>
        <GTMNoscript gtmId={gtmId} />
        <GTMProvider gtmId={gtmId}>
          <AnalyticsProvider>
            <BusinessHoursProvider>
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
              <Suspense fallback={null}>
                <EventCountdownBanner />
              </Suspense>
            </BusinessHoursProvider>
          </AnalyticsProvider>
        </GTMProvider>
      </body>
    </html>
  )
}
