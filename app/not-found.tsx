import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for could not be found.',
}

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold text-anchor-dark-text mb-4">Page Not Found</h1>
      <p className="text-lg text-anchor-body-text mb-8 max-w-md">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-anchor-gold-dark text-white rounded-lg hover:bg-anchor-gold-dark/90 transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/food-menu"
          className="inline-flex items-center px-6 py-3 border border-anchor-gold-dark text-anchor-gold-dark rounded-lg hover:bg-anchor-gold-dark/10 transition-colors"
        >
          Food Menu
        </Link>
        <Link
          href="/book-table"
          className="inline-flex items-center px-6 py-3 border border-anchor-gold-dark text-anchor-gold-dark rounded-lg hover:bg-anchor-gold-dark/10 transition-colors"
        >
          Book a Table
        </Link>
        <Link
          href="/whats-on"
          className="inline-flex items-center px-6 py-3 border border-anchor-gold-dark text-anchor-gold-dark rounded-lg hover:bg-anchor-gold-dark/10 transition-colors"
        >
          What's On
        </Link>
        <Link
          href="/find-us"
          className="inline-flex items-center px-6 py-3 border border-anchor-gold-dark text-anchor-gold-dark rounded-lg hover:bg-anchor-gold-dark/10 transition-colors"
        >
          Find Us
        </Link>
      </div>
    </div>
  )
}
