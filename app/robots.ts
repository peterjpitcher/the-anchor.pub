import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          // Allow static assets so crawlers can render pages correctly.
          '/_next/data/',
          '/_next/static/media/',
          '/*?dpl=*',
          '/_serverless/',
          '/_partials/',
          '/_api/',
          '/_scripts/',
          '/subscribe',
          '/leave-a-review',
          '/subscribe-for-digital-flyers',
          '/p5-demo',
          // Internal / debug routes (keep out of crawl + index)
          '/components',
          '/debug-hours',
          '/demo-header',
          '/gtm-debug',
          '/test-gtm',
          '/test-hours',
          '/test-navigation-tracking',
          '/test-reviews',
          '/test-simple',
          '/test-tracking'
        ]
      }
    ],
    sitemap: ['https://www.the-anchor.pub/sitemap.xml'],
  }
}
