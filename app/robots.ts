import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/_serverless/',
          '/_partials/',
          '/_api/',
          '/_scripts/',

          '/components',
          '/leave-review',
          '/subscribe',
          '/leave-a-review',
          '/subscribe-for-digital-flyers',
          '/test-gtm',
          '/test-hours',
          '/test-navigation-tracking',
          '/test-reviews',
          '/test-simple',
          '/test-tracking',
          '/gtm-debug',
          '/p5-demo'
        ]
      }
    ],
    sitemap: 'https://www.the-anchor.pub/sitemap.xml',
  }
}
