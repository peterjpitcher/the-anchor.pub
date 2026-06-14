import type { Metadata } from 'next'
import { DM_Serif_Display, Outfit, Clicker_Script } from 'next/font/google'
import dynamic from 'next/dynamic'
import Script from 'next/script'
import './globals.css'
import { WebVitals } from './web-vitals'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { HeaderStatusSectionDirect } from '@/components/layout/HeaderStatusSectionDirect'
import { StickyCtas } from '@/components/layout/StickyCtas'
import { AnalyticsProvider } from '@/components/tracking/AnalyticsProvider'
import { GTMProvider } from '@/components/tracking/GTMProvider'
import { MetaPixelProvider } from '@/components/tracking/MetaPixelProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import CookieBanner from '@/components/CookieBanner'
import { LaunchAnnouncement } from '@/components/announcements/LaunchAnnouncement'
import { DynamicSchema } from '@/components/seo/DynamicSchema'
import { BusinessHoursProvider } from '@/components/providers/BusinessHoursProvider'
import { DeferredRender } from '@/components/DeferredRender'
import { DEFAULT_OG_IMAGE } from '@/lib/image-fallbacks'
import {
  PRIVATE_HIRE_2026_PROMO_ENABLED,
  PRIVATE_HIRE_2026_PROMO_ENDS_AT_MS
} from '@/lib/promos/privateHire2026'
import { Suspense } from 'react'


const EventCountdownBanner = dynamic(() => import('@/components/EventCountdownBanner').then(mod => mod.EventCountdownBanner), {
  ssr: false
})

const ChristmasLightbox = dynamic(() => import('@/components/features/christmas/ChristmasLightbox').then(mod => mod.ChristmasLightbox), {
  ssr: false
})

const PrivateHire2026PromoGate = dynamic(
  () => import('@/components/promos/PrivateHire2026PromoGate').then(mod => mod.PrivateHire2026PromoGate),
  { ssr: false }
)

const display = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const body = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-body',
  display: 'swap',
})

const script = Clicker_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-script',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.the-anchor.pub'),
  title: {
    default: 'The Anchor Pub | Stanwell Moor | Near Heathrow',
    template: '%s | The Anchor Stanwell Moor'
  },
  description: 'The Anchor, Stanwell Moor. Traditional pub around 7 mins from Heathrow T5, traffic dependent. Sunday roasts, quiz nights, listed karaoke nights, beer garden & free parking.',
  authors: [{ name: 'The Anchor' }],
  creator: 'The Anchor',
  publisher: 'The Anchor',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'The Anchor | Pub Near Heathrow Airport | Stanwell Moor',
    description: 'Traditional British venue near Heathrow with hosted events, live entertainment & great food. Dog-friendly beer garden.',
    url: 'https://www.the-anchor.pub',
    siteName: 'The Anchor',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
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
    description: 'Traditional venue with modern entertainment. Quiz nights, hosted events, great food & more.',
    images: [DEFAULT_OG_IMAGE],
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
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-WWFQTQS'
  const now = new Date()
  const privateHirePromoActive =
    PRIVATE_HIRE_2026_PROMO_ENABLED && now.getTime() < PRIVATE_HIRE_2026_PROMO_ENDS_AT_MS
  const promoCtaButtons = [
    {
      label: "Valentine's Day",
      href: '/valentines-day',
      external: false,
      variant: 'outline' as const,
      startsOn: '2026-02-14',
      endsOn: '2026-02-14'
    },
    {
      label: "Mother's Day",
      href: '/mothers-day',
      external: false,
      variant: 'outline' as const,
      startsOn: '2026-03-15',
      endsOn: '2026-03-15'
    },
    {
      label: 'World Cup 2026',
      href: '/live-sport/world-cup',
      external: false,
      variant: 'outline' as const,
      startsOn: '2026-06-11',
      endsOn: '2026-07-19'
    }
  ]

  const tertiaryCtaButton = (() => {
    // Six Nations ends March 15th 2026
    if (now < new Date('2026-03-16')) { // Using 16th to include the full day of 15th
      return {
        label: 'Six Nations 2026',
        href: '/live-sport/six-nations',
        external: false,
        variant: 'outline' as const
      }
    }
    // Show Christmas from August 1st 2026
    if (now >= new Date('2026-08-01')) {
      return {
        label: 'Christmas 2026',
        href: '/christmas-parties',
        external: false,
        variant: 'outline' as const
      }
    }
    return null
  })()

  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${script.variable}`}>
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
        <meta name="theme-color" content="#005131" />
        <meta name="format-detection" content="telephone=no" />

        {/* Next.js handles font and image prioritisation automatically */}

        {/* Google Consent Mode defaults, MUST fire before GTM script loads */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
(function(){
  try{
    var c=document.cookie.match(/anchor-cookie-consent=([^;]+)/);
    if(c){
      var p=JSON.parse(decodeURIComponent(c[1]));
      gtag('consent','default',{
        'analytics_storage':p.analytics?'granted':'denied',
        'ad_storage':p.marketing?'granted':'denied',
        'personalization_storage':p.preferences?'granted':'denied',
        'functionality_storage':'granted',
        'security_storage':'granted'
      });
      return;
    }
  }catch(e){}
  gtag('consent','default',{
    'analytics_storage':'denied',
    'ad_storage':'denied',
    'personalization_storage':'denied',
    'functionality_storage':'granted',
    'security_storage':'granted',
    'wait_for_update':500
  });
})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        {/* Global structured data (JSON-LD), placed in body to avoid Next.js head deduplication */}
        <DynamicSchema />
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`,
          }}
        />
        {/* End Google Tag Manager */}
        <GTMProvider gtmId={gtmId}>
          <AnalyticsProvider>
            <BusinessHoursProvider>
              <WebVitals />
              <MetaPixelProvider />
              {/* Skip Navigation Links for Accessibility */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-anchor-gold-dark focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-anchor-gold-dark"
              >
                Skip to main content
              </a>
              <ErrorBoundary>
                <header role="banner">
                  <Navigation
                    statusComponent={<HeaderStatusSectionDirect />}
                    promoCtaButtons={promoCtaButtons}
                    tertiaryCtaButton={tertiaryCtaButton}
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
                  <LaunchAnnouncement variant="slim" />
                  <Footer />
                </footer>
              </ErrorBoundary>
              <StickyCtas />
              <CookieBanner />
              <Suspense fallback={null}>
                <DeferredRender>
                  <EventCountdownBanner />
                  <ChristmasLightbox />
                </DeferredRender>
                {privateHirePromoActive ? (
                  <DeferredRender timeoutMs={800}>
                    <PrivateHire2026PromoGate />
                  </DeferredRender>
                ) : null}
              </Suspense>
            </BusinessHoursProvider>
          </AnalyticsProvider>
        </GTMProvider>
      </body>
    </html>
  )
}
