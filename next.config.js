process.env.BROWSERSLIST_IGNORE_OLD_DATA = '1'

/** @type {import('next').NextConfig} */
const blogRedirects = require('./config/redirects/blog-redirects.json')
const tagRedirects = require('./config/redirects/tag-redirects.json')
const wixRedirects = require('./config/redirects/wix-redirects.json')
const legacyRedirects = require('./config/redirects/legacy-redirects.json')
const drinksRedirects = require('./config/redirects/drinks-redirects.json')
const additionalRedirects = require('./config/redirects/additional-redirects.json')

function normaliseRedirect(redirect) {
  if (!redirect || typeof redirect !== 'object') return redirect

  // Prefer explicit status codes and remove Next/Vercel's `permanent` boolean where both exist.
  if (typeof redirect.statusCode === 'number') {
    const { permanent: _permanent, ...rest } = redirect
    return rest
  }

  if (redirect.permanent === true) {
    const { permanent: _permanent, ...rest } = redirect
    return { ...rest, statusCode: 301 }
  }

  if (redirect.permanent === false) {
    const { permanent: _permanent, ...rest } = redirect
    return { ...rest, statusCode: 302 }
  }

  return redirect
}

const nextConfig = {
  async redirects() {
    return [...wixRedirects, ...blogRedirects, ...tagRedirects, ...legacyRedirects, ...drinksRedirects, ...additionalRedirects].map(
      normaliseRedirect
    )
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
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      // NOTE: No Content-Security-Policy header is set here.
      // A restrictive CSP blocks Next.js App Router inline hydration scripts,
      // GTM, and other required third-party resources, breaking the entire site.
      // PayPal Smart Buttons do not require a CSP to function — iframes and
      // external scripts are permitted by default when no CSP is present.
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
      // CORS headers for API routes
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://www.the-anchor.pub' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, X-API-Key, Idempotency-Key, X-Request-ID' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
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
        // robots.txt cache policy
        // Code intent: 5-minute browser + 5-minute shared-cache TTL so a hot
        // robots.txt fix propagates within minutes.
        // Live reality: Cloudflare's "Browser Cache TTL" rule extends the
        // browser max-age to 4 hours (max-age=14400). Shared-cache (s-maxage)
        // is preserved at 300s, so CDN refresh remains fast, and a hot fix
        // can be propagated immediately by purging the URL in Cloudflare.
        // See tasks/gsc-indexing-fix/FINAL-SPEC.md §P1 robots.txt cache header.
        source: '/robots.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300, must-revalidate',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300, must-revalidate',
          },
        ],
      },
      {
        // Static assets only need long-lived caching. Crawlability is required
        // (Googlebot fetches CSS/JS to render pages); X-Robots-Tag is
        // intentionally NOT set here because Cloudflare overrides it to "all"
        // on production. Indexing risk for hashed JS/CSS is negligible — they
        // contain no useful query content. See FINAL-SPEC.md §P1 X-Robots-Tag.
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
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
        ],
      },
      {
        source: '/(.*).css',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
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
        ],
      },
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
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
  trailingSlash: false,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
    // Remove unnecessary React properties
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },
  experimental: {
    // Track web vitals
    webVitalsAttribution: ['CLS', 'LCP', 'FCP', 'FID', 'TTFB'],
    // Optimize for edge runtime
    serverComponentsExternalPackages: ['sharp'],
    outputFileTracingIncludes: {
      '/content/blog/[...path]': ['./content/blog/**/*'],
      '/sitemap.xml': ['./content/blog/**/*'],
      '/blog': ['./content/blog/**/*'],
      '/blog/[slug]': ['./content/blog/**/*'],
      '/blog/tag/[tag]': ['./content/blog/**/*'],
      '/blog/tags': ['./content/blog/**/*']
    }
  },
}

module.exports = nextConfig
