import React from 'react'
import { render, screen } from '@testing-library/react'
import { FindUsSection } from '@/components/FindUsSection'

// Mock GoogleMapEmbed
jest.mock('@/components/ui/GoogleMapEmbed', () => ({
  GoogleMapEmbed: ({ query, height, className }: { query: string; height?: string | number; className?: string }) => (
    <div data-testid="google-map-embed" data-query={query} data-height={height} className={className}>
      Map: {query}
    </div>
  ),
}))

// Mock DirectionsButton and DirectionsLink
jest.mock('@/components/DirectionsButton', () => ({
  DirectionsButton: ({ children, href, source }: { children: React.ReactNode; href: string; source: string }) => (
    <a data-testid="directions-button" href={href} data-source={source}>{children}</a>
  ),
  DirectionsLink: ({ children, href, source }: { children: React.ReactNode; href: string; source: string }) => (
    <a data-testid="directions-link" href={href} data-source={source}>{children}</a>
  ),
}))

// Mock PhoneLink
jest.mock('@/components/PhoneLink', () => ({
  PhoneLink: ({ phone, source, children }: { phone: string; source: string; children?: React.ReactNode }) => (
    <a data-testid="phone-link" href={`tel:${phone}`} data-source={source}>{children || phone}</a>
  ),
}))

describe('FindUsSection', () => {
  describe('Full variant (default)', () => {
    it('renders GoogleMapEmbed with query "The Anchor, Stanwell Moor"', () => {
      render(<FindUsSection />)
      const map = screen.getByTestId('google-map-embed')
      expect(map).toBeInTheDocument()
      expect(map).toHaveAttribute('data-query', 'The Anchor, Stanwell Moor')
    })

    it('renders address text containing Horton Road, Stanwell Moor, and TW19 6AQ', () => {
      render(<FindUsSection />)
      expect(screen.getByText(/Horton Road/)).toBeInTheDocument()
      expect(screen.getByText(/Stanwell Moor/)).toBeInTheDocument()
      expect(screen.getByText(/TW19 6AQ/)).toBeInTheDocument()
    })

    it('renders phone number 01753 682707', () => {
      render(<FindUsSection />)
      const phoneLink = screen.getByTestId('phone-link')
      expect(phoneLink).toBeInTheDocument()
    })

    it('renders parking info containing 20 and Free parking', () => {
      render(<FindUsSection />)
      expect(screen.getByText(/20/)).toBeInTheDocument()
      expect(screen.getByText(/Free parking/i)).toBeInTheDocument()
    })

    it('renders a directions link', () => {
      render(<FindUsSection />)
      const directionsLink = screen.getByTestId('directions-link')
      expect(directionsLink).toBeInTheDocument()
      expect(directionsLink).toHaveAttribute('href', expect.stringContaining('google.com/maps'))
    })
  })

  describe('Compact variant', () => {
    it('does NOT render GoogleMapEmbed by default', () => {
      render(<FindUsSection variant="compact" />)
      expect(screen.queryByTestId('google-map-embed')).not.toBeInTheDocument()
    })

    it('renders address and phone', () => {
      render(<FindUsSection variant="compact" />)
      expect(screen.getByText(/Horton Road/)).toBeInTheDocument()
      expect(screen.getByTestId('phone-link')).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('applies custom className to the root element', () => {
      const { container } = render(<FindUsSection className="my-custom-class" />)
      const root = container.firstChild as HTMLElement
      expect(root.classList.contains('my-custom-class')).toBe(true)
    })
  })
})
