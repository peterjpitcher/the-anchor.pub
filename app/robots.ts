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
