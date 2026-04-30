import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { lookupRedirect, getRedirectStatus, resolveRedirectUrl } from '@/lib/middleware-redirects'

export function middleware(request: NextRequest) {
    // Handle domain redirects (non-www to www) and force HTTPS for production hostname
    const host = request.headers.get('host') || ''
    const url = request.nextUrl.clone()
    const protocol = request.headers.get('x-forwarded-proto') ?? url.protocol.replace(':', '')
    const isPrimaryHost = host === 'www.the-anchor.pub'
    const isApexHost = host === 'the-anchor.pub'
    const isKnownProdHost = isPrimaryHost || isApexHost

    let shouldRedirect = false

    // Force HTTPS + canonical host on known production domains
    if (isKnownProdHost) {
        if (protocol === 'http') {
            url.protocol = 'https'
            shouldRedirect = true
        }

        if (isApexHost) {
            url.host = 'www.the-anchor.pub'
            shouldRedirect = true
        }
    }

    // Normalise trailing slash (except for root)
    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
        url.pathname = url.pathname.slice(0, -1)
        shouldRedirect = true
    }

    // Normalise blog pagination (?page=1 -> /blog)
    if (url.pathname === '/blog' && url.searchParams.get('page') === '1') {
        url.searchParams.delete('page')
        shouldRedirect = true
    }

    // Flatten apex/host + concrete redirect chains into a single 301. Without this
    // the apex variants of consolidated tag redirects produced two hops (apex -> www,
    // then www -> destination) which GSC reported as "Redirect error". See
    // tasks/gsc-indexing-fix/FINAL-SPEC.md §P0.1.
    const matchedRedirect = lookupRedirect(url.pathname)
    if (matchedRedirect) {
        const canonicalUrl = new URL(request.url)
        canonicalUrl.protocol = url.protocol
        canonicalUrl.host = url.host
        canonicalUrl.pathname = url.pathname
        canonicalUrl.search = url.search

        return new NextResponse(null, {
            status: getRedirectStatus(matchedRedirect),
            headers: {
                Location: resolveRedirectUrl(canonicalUrl, matchedRedirect).toString(),
            },
        })
    }

    if (shouldRedirect) {
        url.search = url.searchParams.toString()
        return NextResponse.redirect(url, 301)
    }

    const response = NextResponse.next()

    // Add performance and security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

    const pathname = request.nextUrl.pathname

    // Add cache headers for static assets
    if (pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|ico|svg)$/i)) {
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    }

    if (pathname.match(/\.(js|css|woff|woff2|ttf|otf)$/i)) {
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    }

    // Stale-while-revalidate for API routes
    if (pathname.startsWith('/api/')) {
        // Business hours powers the StatusBar and must always be live.
        if (pathname === '/api/business/hours') {
            response.headers.set('Cache-Control', 'no-store, max-age=0')
            response.headers.set('CDN-Cache-Control', 'no-store')
            response.headers.set('Pragma', 'no-cache')
            response.headers.set('Expires', '0')
        } else {
            response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
