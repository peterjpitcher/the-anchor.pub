'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { trackDirectionsClick } from '@/lib/gtm-events'

interface DirectionsButtonProps {
  href: string
  source: string
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg'
  destination?: string
  mapPlatform?: 'google_maps' | 'apple_maps' | 'waze'
  fromLocation?: string
  asLink?: boolean
  onClick?: () => void
  role?: string
}

export function DirectionsButton({ 
  href, 
  source, 
  children, 
  className,
  variant = 'primary',
  size = 'md',
  destination = 'The Anchor Stanwell Moor',
  mapPlatform,
  fromLocation,
  asLink = false,
  onClick,
  role
}: DirectionsButtonProps) {
  // Determine map platform from URL if not provided
  const platform = mapPlatform || (() => {
    if (href.includes('maps.google.com') || href.includes('google.com/maps')) return 'google_maps'
    if (href.includes('maps.apple.com')) return 'apple_maps'
    if (href.includes('waze.com')) return 'waze'
    return 'google_maps' // default
  })()

  const handleClick = () => {
    trackDirectionsClick(source, { destination, mapPlatform: platform, fromLocation })
    if (onClick) {
      onClick()
    }
  }

  if (asLink) {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={className}
        role={role}
      >
        {children}
      </Link>
    )
  }

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      role={role}
    >
      <Button 
        variant={variant === 'link' ? 'ghost' : variant}
        size={size}
        className={className}
      >
        {children}
      </Button>
    </Link>
  )
}

// Wrapper component for inline text links
export function DirectionsLink({ 
  href, 
  source, 
  children, 
  className = 'text-anchor-gold hover:text-anchor-gold-light',
  destination = 'The Anchor Stanwell Moor',
  mapPlatform,
  fromLocation,
  onClick,
  role
}: Omit<DirectionsButtonProps, 'variant' | 'size' | 'asLink'>) {
  return (
    <DirectionsButton
      href={href}
      source={source}
      destination={destination}
      mapPlatform={mapPlatform}
      fromLocation={fromLocation}
      className={className}
      asLink={true}
      onClick={onClick}
      role={role}
    >
      {children}
    </DirectionsButton>
  )
}
