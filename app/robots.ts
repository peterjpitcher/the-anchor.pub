import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/_next/static/'],
        disallow: [
          '/api/',
          // Allow static assets so crawlers can render pages correctly.
          '/_next/data/',
          '/*?dpl=*',
          '/_serverless/',
          '/_partials/',
          '/_api/',
          '/_scripts/',
          '/cdn-cgi/',
          '/subscribe',
          '/leave-a-review',
          '/subscribe-for-digital-flyers',
          '/p5-demo'
        ]
      }
    ],
    sitemap: ['https://www.the-anchor.pub/sitemap.xml'],
  }
}
