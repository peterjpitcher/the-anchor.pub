'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@/components/ui/overlays/Modal'
import { BookTableButton } from '@/components/BookTableButton'
import { pushToDataLayer } from '@/lib/gtm-events'

export interface MenuItem {
  name: string
  description: string
  priceLabel: string
  imageSrc?: string
  imageAlt?: string
}

export interface MenuItemLightboxProps {
  item: MenuItem | null
  onClose: () => void
}

/**
 * Lightbox for a single Sunday roast menu item.
 *
 * - Shows name, optional photo, full description, and price.
 * - No roast pre-selection — CTA is a generic Book a Table link.
 * - Tracks `view_item` when opened.
 * - Built on the workspace Modal primitive (focus trap, Escape, backdrop).
 */
export function MenuItemLightbox({ item, onClose }: MenuItemLightboxProps) {
  const lastTrackedNameRef = useRef<string | null>(null)
  const open = item !== null

  useEffect(() => {
    if (!open || !item) {
      lastTrackedNameRef.current = null
      return
    }

    if (lastTrackedNameRef.current === item.name) return
    lastTrackedNameRef.current = item.name

    pushToDataLayer({
      event: 'view_item',
      item_category: 'menu_item',
      item_name: item.name,
    })
  }, [open, item])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item?.name}
      size="lg"
      backdrop="blur"
      id={item ? `menu_item_${item.name}` : undefined}
    >
      {item ? (
        <>
          <ModalHeader>
            <ModalTitle id="modal-title" className="text-2xl">
              {item.name}
            </ModalTitle>
            <p className="mt-1 text-base font-semibold text-anchor-gold-bright">
              {item.priceLabel}
            </p>
          </ModalHeader>
          <ModalBody>
            {item.imageSrc ? (
              <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-md bg-anchor-bg-raised">
                <Image
                  src={item.imageSrc}
                  alt={item.imageAlt || item.name}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 600px, 90vw"
                />
              </div>
            ) : null}
            <p className="text-base text-anchor-cream-text/90 leading-relaxed">
              {item.description}
            </p>
          </ModalBody>
          <ModalFooter>
            <BookTableButton
              source="sunday_lunch_menu_lightbox"
              context="sunday_roast"
              customHref="/book-table"
              variant="primary"
              size="md"
            >
              Book a table
            </BookTableButton>
          </ModalFooter>
        </>
      ) : null}
    </Modal>
  )
}

export default MenuItemLightbox
