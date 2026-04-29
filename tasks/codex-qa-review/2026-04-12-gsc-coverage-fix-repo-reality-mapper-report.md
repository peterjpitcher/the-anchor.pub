**1. [app/robots.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/robots.ts:1)**
```text
 1	import { MetadataRoute } from 'next'
 2	
 3	export default function robots(): MetadataRoute.Robots {
 4	  return {
 5	    rules: [
 6	      {
 7	        userAgent: '*',
 8	        allow: '/',
 9	        disallow: [
10	          '/api/',
11	          // Allow static assets so crawlers can render pages correctly.
12	          '/_next/data/',
13	          '/_next/static/media/',
14	          '/*?dpl=*',
15	          '/_serverless/',
16	          '/_partials/',
17	          '/_api/',
18	          '/_scripts/',
19	          '/subscribe',
20	          '/leave-a-review',
21	          '/subscribe-for-digital-flyers',
22	          '/p5-demo',
23	          // Internal / debug routes (keep out of crawl + index)
24	          '/components',
25	          '/debug-hours',
26	          '/demo-header',
27	          '/gtm-debug',
28	          '/test-gtm',
29	          '/test-hours',
30	          '/test-navigation-tracking',
31	          '/test-reviews',
32	          '/test-simple',
33	          '/test-tracking'
34	        ]
35	      }
36	    ],
37	    sitemap: ['https://www.the-anchor.pub/sitemap.xml'],
38	  }
39	}
```
Literal checks:
- `/*?dpl=*` is present at line `14`.
- There is no literal `allow: '/_next/static/'` entry.
- The only `_next` entries are `/_next/data/` at line `12` and `/_next/static/media/` at line `13`.

**2. [next.config.js](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/next.config.js:4)**
Redirect JSON files loaded:
```text
 4	const blogRedirects = require('./config/redirects/blog-redirects.json')
 5	const tagRedirects = require('./config/redirects/tag-redirects.json')
 6	const wixRedirects = require('./config/redirects/wix-redirects.json')
 7	const legacyRedirects = require('./config/redirects/legacy-redirects.json')
 8	const drinksRedirects = require('./config/redirects/drinks-redirects.json')
 9	const additionalRedirects = require('./config/redirects/additional-redirects.json')

33	const nextConfig = {
34	  async redirects() {
35	    return [...wixRedirects, ...blogRedirects, ...tagRedirects, ...legacyRedirects, ...drinksRedirects, ...additionalRedirects].map(
36	      normaliseRedirect
37	    )
38	  },
```
`headers()` production gate:
```text
68	    const baseHeaders = [
69	      {
70	        source: '/:path*',
71	        headers: securityHeaders,
72	      },
73	    ]
74	
75	    // In development, avoid long-lived caching for Next.js build assets.
76	    // A cached 404 for a stale chunk can leave the site unstyled until cache is cleared.
77	    if (process.env.NODE_ENV !== 'production') {
78	      return baseHeaders
79	    }
80	
81	    return [
82	      ...baseHeaders,
```
`X-Robots-Tag` blocks in `headers()`:
```text
 95	        source: '/favicon.ico'
102	            key: 'X-Robots-Tag',
103	            value: 'noindex, nofollow',

108	        source: '/manifest.json'
115	            key: 'X-Robots-Tag',
116	            value: 'noindex, nofollow',

130	        source: '/_next/static/:path*'
137	            key: 'X-Robots-Tag',
138	            value: 'noindex, nofollow',

143	        source: '/(.*).js'
150	            key: 'X-Robots-Tag',
151	            value: 'noindex, nofollow',

156	        source: '/(.*).css'
163	            key: 'X-Robots-Tag',
164	            value: 'noindex, nofollow',

169	        source: '/(.*).woff2'
176	            key: 'X-Robots-Tag',
177	            value: 'noindex, nofollow',

191	        source: '/_next/image(.*)'
198	            key: 'X-Robots-Tag',
199	            value: 'noindex, nofollow',

204	        source: '/fonts/(.*)'
211	            key: 'X-Robots-Tag',
212	            value: 'noindex, nofollow',
```
Literal count from the file load list: `6` redirect JSON files.

**3. Test/debug pages from the spec**
Raw existence check:
```text
DIR_EXISTS app/test-simple
app/test-simple/head.tsx
app/test-simple/page.tsx
DIR_EXISTS app/test-tracking
app/test-tracking/head.tsx
app/test-tracking/page.tsx
DIR_EXISTS app/test-reviews
app/test-reviews/head.tsx
app/test-reviews/page.tsx
DIR_EXISTS app/test-gtm
app/test-gtm/head.tsx
app/test-gtm/page.tsx
DIR_EXISTS app/test-navigation-tracking
app/test-navigation-tracking/head.tsx
app/test-navigation-tracking/page.tsx
DIR_EXISTS app/test-hours
app/test-hours/head.tsx
app/test-hours/page.tsx
DIR_EXISTS app/gtm-debug
app/gtm-debug/head.tsx
app/gtm-debug/page.tsx
DIR_EXISTS app/debug-hours
app/debug-hours/head.tsx
app/debug-hours/page.tsx
DIR_EXISTS app/demo-header
app/demo-header/head.tsx
app/demo-header/page.tsx
DIR_EXISTS app/components
app/components/head.tsx
app/components/page.tsx
```

**4. [app/blog/tag/[tag]/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/blog/tag/[tag]/page.tsx:36)**
`rg -n 'robots|noindex' 'app/blog/tag/[tag]/page.tsx'` returned no matches.

`generateMetadata()`:
```text
36	export async function generateMetadata({ params }: { params: { tag: string } }): Promise<Metadata> {
37	  const tag = normalizeTagSlug(params.tag)
38	  const seoContent = getTagSEOContent(tag)
39	  
40	  return {
41	    title: seoContent.metaTitle,
42	    description: seoContent.metaDescription,
43	    alternates: {
44	      canonical: `/blog/tag/${tag}`,
45	    },
46	    openGraph: {
47	      title: seoContent.metaTitle,
48	      description: seoContent.metaDescription,
49	      images: [{ url: BLOG_FALLBACK_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub blog - news and events near Heathrow' }],
50	    },
51	    twitter: getTwitterMetadata({
52	      title: seoContent.metaTitle,
53	      description: seoContent.metaDescription,
54	      images: [BLOG_FALLBACK_IMAGE]
55	    }),
56	  }
57	}
```
Count-based handling in the page:
```text
59	export default async function TagPage({ params }: { params: { tag: string } }) {
60	  const tag = normalizeTagSlug(params.tag)
61	  const allPosts = await getAllBlogPosts()
62	  const taggedPosts = allPosts.filter(post => 
63	    post.tags.map(t => normalizeTagSlug(t)).includes(tag)
64	  )
65	  
66	  if (taggedPosts.length === 0) {
67	    permanentRedirect('/blog/tags')
68	  }
```

**5. [app/events/[id]/opengraph-image.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/events/[id]/opengraph-image.tsx:1)**
The file exists. Header-setting lines:
```text
 6	export const runtime = 'nodejs'
 7	
 8	export const size = {
 9	  width: 1200,
10	  height: 630
11	}
12	
13	export const contentType = 'image/png'
...
144	    {
145	      ...size,
146	      headers: {
147	        'X-Robots-Tag': 'noindex, nofollow, noimageindex'
148	      }
149	    }
```

**6. Search for `drinks-1920w` across the repo**
Content search result:
```text
/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/docs/gsc-coverage-fix-spec.md:119:**URL:** `/images/page-headers/drinks/optimized/drinks-1920w`
/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/docs/gsc-coverage-fix-spec.md:128:- `grep -r "drinks-1920w" .` to find the reference
```
Filename search result: `rg --files /Users/peterpitcher/Cursor/OJ-The-Anchor.pub | rg 'drinks-1920w'` returned no matches.

Path check:
```text
find: public/images/page-headers/drinks/optimized: No such file or directory
```

**7. [middleware.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/middleware.ts:4)**
```text
 4	export function middleware(request: NextRequest) {
 5	    // Handle domain redirects (non-www to www) and force HTTPS for production hostname
 6	    const host = request.headers.get('host') || ''
 7	    const url = request.nextUrl.clone()
 8	    const protocol = request.headers.get('x-forwarded-proto') ?? url.protocol.replace(':', '')
 9	    const isPrimaryHost = host === 'www.the-anchor.pub'
10	    const isApexHost = host === 'the-anchor.pub'
11	    const isKnownProdHost = isPrimaryHost || isApexHost
12	
13	    let shouldRedirect = false
14	
15	    // Force HTTPS + canonical host on known production domains
16	    if (isKnownProdHost) {
17	        if (protocol === 'http') {
18	            url.protocol = 'https'
19	            shouldRedirect = true
20	        }
21	
22	        if (isApexHost) {
23	            url.host = 'www.the-anchor.pub'
24	            shouldRedirect = true
25	        }
26	    }
```

**8. `config/redirects/`**
Files present:
```text
config/redirects/additional-redirects.json
config/redirects/blog-redirects.json
config/redirects/drinks-redirects.json
config/redirects/legacy-redirects.json
config/redirects/tag-redirects.json
config/redirects/wix-redirects.json
```
Raw size/count output (`file`, `bytes`, `jq length`):
```text
config/redirects/additional-redirects.json	9900	98
config/redirects/blog-redirects.json	30080	198
config/redirects/drinks-redirects.json	7730	76
config/redirects/legacy-redirects.json	619	6
config/redirects/tag-redirects.json	15378	139
config/redirects/wix-redirects.json	20589	158
```