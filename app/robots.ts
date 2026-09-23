import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/_next/static/'],
        disallow: [
          // Infrastructure only. Never disallow a URL whose correct search
          // treatment depends on Google actually fetching it: a robots.txt
          // block stops the crawl, so the noindex tag or the 301 is never
          // seen and the bare URL can still be indexed from internal links.
          // That is exactly what happened to /leave-review, which is linked
          // sitewide from the footer.
          '/api/',
          // Allow static assets so crawlers can render pages correctly.
          '/_next/data/',
          '/_serverless/',
          '/_partials/',
          '/_api/',
          '/_scripts/',
          '/cdn-cgi/'
        ]
      }
    ],
    sitemap: ['https://www.the-anchor.pub/sitemap.xml'],
  }
}
