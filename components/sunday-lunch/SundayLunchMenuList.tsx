'use client'

import { useState } from 'react'
import { MenuItemLightbox, type MenuItem } from '@/components/sunday-lunch/MenuItemLightbox'

export interface SundayLunchMenuItem {
  name: string
  description: string
  priceLabel: string
  imageSrc?: string
  imageAlt?: string
}

export interface SundayLunchMenuListProps {
  items: ReadonlyArray<SundayLunchMenuItem>
  /**
   * Fallback image used for every item that doesn't supply its own
   * `imageSrc`. Lets us roll out per-roast photos incrementally.
   */
  fallbackImageSrc?: string
}

/**
 * Renders the Sunday roast menu rows as keyboard-accessible buttons that
 * open the {@link MenuItemLightbox}. Stays a Server-Component-friendly
 * island: only the open/close state and click handler live on the client,
 * the actual menu data is passed in from the server page.
 *
 * Wave 2C: lightbox wiring — each row fires `view_item` via the lightbox
 * and offers a generic Book a Table CTA in the footer.
 */
export function SundayLunchMenuList({
  items,
  fallbackImageSrc,
}: SundayLunchMenuListProps) {
  const [selected, setSelected] = useState<MenuItem | null>(null)

  return (
    <>
      <div className="mt-8 mx-auto max-w-3xl space-y-4">
        {items.map((item) => {
          const lightboxItem: MenuItem = {
            name: item.name,
            description: item.description,
            priceLabel: item.priceLabel,
            imageSrc: item.imageSrc ?? fallbackImageSrc,
            imageAlt: item.imageAlt ?? `${item.name} — Sunday roast at The Anchor`,
          }

          return (
            <button
              key={item.name}
              type="button"
              onClick={() => setSelected(lightboxItem)}
              aria-label={`View details for ${item.name}`}
              className="w-full text-left flex justify-between items-start gap-4 py-4 border-b border-anchor-gold/10 last:border-b-0 rounded-md hover:bg-anchor-bg-raised/50 focus:outline-none focus:ring-2 focus:ring-anchor-gold focus:ring-offset-2 focus:ring-offset-anchor-bg transition-colors motion-reduce:transition-none px-2 -mx-2"
            >
              <div>
                <h3 className="font-semibold text-anchor-cream-text">{item.name}</h3>
                <p className="text-sm text-anchor-cream-text/65 mt-1">{item.description}</p>
              </div>
              <span className="text-anchor-gold-vivid font-semibold whitespace-nowrap">
                {item.priceLabel}
              </span>
            </button>
          )
        })}
      </div>

      <MenuItemLightbox item={selected} onClose={() => setSelected(null)} />
    </>
  )
}

export default SundayLunchMenuList
