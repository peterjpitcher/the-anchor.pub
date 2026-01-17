process.env.BROWSERSLIST_IGNORE_OLD_DATA = '1'

/** @type {import('next').NextConfig} */
const blogRedirects = require('./config/redirects/blog-redirects.json')
const tagRedirects = require('./config/redirects/tag-redirects.json')
const wixRedirects = require('./config/redirects/wix-redirects.json')
const legacyRedirects = require('./config/redirects/legacy-redirects.json')
const drinksRedirects = require('./config/redirects/drinks-redirects.json')
const additionalRedirects = require('./config/redirects/additional-redirects.json')

const nextConfig = {
  async redirects() {
    return [...wixRedirects, ...blogRedirects, ...tagRedirects, ...legacyRedirects, ...drinksRedirects, ...additionalRedirects]
  },
  async headers() {
    const securityHeaders = [
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on',
      },
    ]

    const baseHeaders = [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]

    // In development, avoid long-lived caching for Next.js build assets.
    // A cached 404 for a stale chunk can leave the site unstyled until cache is cleared.
    if (process.env.NODE_ENV !== 'production') {
      return baseHeaders
    }

    return [
      ...baseHeaders,
      // Add cache headers for static files (production only)
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      {
        source: '/(.*).js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      {
        source: '/(.*).css',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      {
        source: '/(.*).woff2',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'the-anchor.pub' },
      { protocol: 'https', hostname: 'www.the-anchor.pub' },
      { protocol: 'https', hostname: 'management.orangejelly.co.uk' },
      { protocol: 'https', hostname: 'example.com' },
      { protocol: 'https', hostname: 'tfcasgxopxegwrabvwat.supabase.co' }
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],  // Common device sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false,
  },
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  swcMinify: true,
  compiler: {
    // removeConsole: process.env.NODE_ENV === 'production', // Temporarily disabled for debugging
    // Remove unnecessary React properties
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },
  experimental: {
    // Track web vitals
    webVitalsAttribution: ['CLS', 'LCP', 'FCP', 'FID', 'TTFB'],
    // Optimize for edge runtime
    serverComponentsExternalPackages: ['sharp'],
    outputFileTracingIncludes: {
      '/content/blog/[...path]': ['./content/blog/**/*']
    }
  },
}

module.exports = nextConfig
