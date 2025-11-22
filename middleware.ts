import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle domain redirects (non-www to www) and force HTTPS for production hostname
  const host = request.headers.get('host') || ''
  const url = request.nextUrl.clone()
  const protocol = request.headers.get('x-forwarded-proto')
  const isPrimaryHost = host === 'www.the-anchor.pub'
  const isApexHost = host === 'the-anchor.pub'

  // Force HTTPS on known production domains
  if ((isPrimaryHost || isApexHost) && protocol === 'http') {
    url.protocol = 'https'
    url.host = 'www.the-anchor.pub'
    return NextResponse.redirect(url, 301)
  }
  
  // Redirect apex domain to canonical www version
  if (isApexHost) {
    url.host = 'www.the-anchor.pub'
    url.protocol = 'https'
    return NextResponse.redirect(url, 301)
  }

  let shouldRedirect = false

  // Normalise blog pagination (?page=1 -> /blog)
  if (url.pathname === '/blog' && url.searchParams.get('page') === '1') {
    url.searchParams.delete('page')
    shouldRedirect = true
  }

  // If we removed all params the URL might end with '?', so ensure it is clean
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
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
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
