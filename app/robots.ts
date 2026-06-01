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
      },
      {
        // AI scraper / model-training crawlers — full opt-out. These were
        // previously injected by Cloudflare's managed robots.txt; that feature
        // is now disabled, so the policy lives here in version control where it
        // is testable (see tests/seo-indexing.test.ts). NOTE: Cloudflare's
        // declarative `Content-Signal: ai-train=no` line is not reproducible via
        // Next's typed robots API — these explicit Disallows are the enforceable
        // equivalent for the major bots.
        userAgent: [
          'Amazonbot',
          'Applebot-Extended',
          'Bytespider',
          'CCBot',
          'ClaudeBot',
          'CloudflareBrowserRenderingCrawler',
          'Google-Extended',
          'GPTBot',
          'meta-externalagent'
        ],
        disallow: '/'
      }
    ],
    sitemap: ['https://www.the-anchor.pub/sitemap.xml'],
  }
}
