'use client'

import { useMemo, memo, useRef, useState } from 'react'
import { MenuData, MenuCategory, MenuSection, MenuItem } from '@/lib/menu-parser'
import { SpecialOfferNotifications } from './SpecialOfferNotifications'
import { ItemBadge } from './HeroBadge'
import Link from 'next/link'
import { ALLERGEN_TYPES } from '@/hooks/useAllergenFilter'
import { cn } from '@/lib/utils'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { Container } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'

function extractSchemaPrice(price?: string): string {
  if (!price) return ''
  const match = price.match(/(\d+[.,]?\d*)/)
  return match ? match[1].replace(',', '') : ''
}

function normalizePrice(price?: string): {
  displayPrice: string
  schemaPrice: string
  gfAvailable: boolean
} {
  if (!price) {
    return {
      displayPrice: '',
      schemaPrice: '',
      gfAvailable: false
    }
  }

  const gfRegex = /\(.*?gf available.*?\)/i
  const gfAvailable = gfRegex.test(price)
  const cleanedPrice = price.replace(gfRegex, '').replace(/\s+/g, ' ').trim()
  const displayPrice = cleanedPrice.replace(/\u00A3/g, '').trim()
  const schemaPrice = extractSchemaPrice(cleanedPrice)

  return {
    displayPrice,
    schemaPrice,
    gfAvailable
  }
}

interface MenuRendererProps {
  menuData: MenuData
  eyebrow?: string
  showBookingCtas?: boolean
}

export function MenuRenderer({ menuData, eyebrow = menuData.title || 'Menu', showBookingCtas = false }: MenuRendererProps) {
  const [focusedItem, setFocusedItem] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Memoize schema generation to prevent re-creation on every render
  const menuSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": "https://www.the-anchor.pub/#menu",
    "name": "The Anchor Menu",
    "description": "Food and drink menu at The Anchor",
    "hasMenuSection": menuData.categories.map(category => ({
      "@type": "MenuSection",
      "name": category.title,
      "description": category.description,
      "hasMenuItem": category.sections.flatMap(section =>
        section.items.map(item => ({
          "@type": "MenuItem",
          "name": item.name,
          "description": item.description,
          "offers": {
            "@type": "Offer",
            "price": extractSchemaPrice(item.price),
            "priceCurrency": "GBP"
          },
          "suitableForDiet": item.vegetarian ? "https://schema.org/VegetarianDiet" : undefined
        }))
      )
    }))
  }), [menuData])

  // Keyboard navigation handler
  const handleKeyboardNavigation = (e: React.KeyboardEvent) => {
    const menuItems = menuRef.current?.querySelectorAll('[data-menu-item]')
    if (!menuItems || menuItems.length === 0) return

    const currentIndex = Array.from(menuItems).findIndex(
      item => item.getAttribute('data-item-id') === focusedItem
    )

    let nextIndex = currentIndex

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0
        break
      case 'ArrowUp':
        e.preventDefault()
        nextIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1
        break
      case 'Home':
        e.preventDefault()
        nextIndex = 0
        break
      case 'End':
        e.preventDefault()
        nextIndex = menuItems.length - 1
        break
      default:
        return
    }

    const nextItem = menuItems[nextIndex] as HTMLElement
    nextItem.focus()
    setFocusedItem(nextItem.getAttribute('data-item-id'))
  }

  return (
    <>
      {/* Schema.org Menu markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify(menuSchema) }}
      />
      {/* Kitchen Hours */}
      {menuData.kitchenHours && (
        <section className="section-spacing bg-anchor-gold/10" id="kitchen-hours">
          <Container className="text-center">
            <p className="text-lg text-anchor-green font-semibold">
              Kitchen Hours: {Object.entries(menuData.kitchenHours).map(([day, hours], index) => (
                <span key={day}>
                  {index > 0 && ' | '}
                  {day} {hours}
                </span>
              ))}
            </p>
            <p className="text-anchor-cream-text/70 mt-2">
              Please order at the bar when you&apos;re ready
            </p>
          </Container>
        </section>
      )}


      {/* Menu Categories */}
      <div
        ref={menuRef}
        itemScope
        itemType="https://schema.org/Menu"
        onKeyDown={handleKeyboardNavigation}
        role="region"
        aria-label="Restaurant menu"
      >
        {menuData.categories.map((category, categoryIndex) => (
          <section
            key={category.id}
            id={category.id}
            className={cn('scroll-mt-24 py-10 md:py-12', categoryIndex % 2 === 0 ? 'bg-anchor-bg-raised' : 'bg-anchor-bg')}
            itemScope
            itemType="https://schema.org/MenuSection"
          >
          <Container>
            <div className="max-w-6xl mx-auto">
              <div className="mb-8 max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-anchor-gold-vivid">
                  {eyebrow}
                </p>
                <h2 className="mt-2 text-3xl md:text-4xl font-bold text-anchor-cream-text" itemProp="name">
                  {category.title}
                </h2>

                {category.description && (
                  <p className="mt-4 text-lg leading-relaxed text-anchor-cream-text/70" itemProp="description">
                    {category.description}
                  </p>
                )}
              </div>

              {/* Special Offer Notifications for this section */}
              <SpecialOfferNotifications targetSection={category.id} />

              {category.sections.map((section, sectionIndex) => (
                <div
                  key={section.title ?? sectionIndex}
                  className={cn(
                    'mb-10',
                    section.highlight && 'relative rounded-3xl px-6 py-12 shadow-lg overflow-visible',
                    section.highlight && category.id === 'cocktails' && 'border border-amber-500/30 bg-amber-900/10',
                    section.highlight && category.id === 'spirits' && 'border-4 border-anchor-green bg-gradient-to-br from-anchor-green to-anchor-green-dark shadow-xl'
                  )}
                >
                  {section.highlight && category.id === 'cocktails' && (
                    <div className="pointer-events-none absolute -top-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-amber-300 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-lg">
                      Limited Time Offer
                    </div>
                  )}

                  {section.highlight && category.id === 'spirits' && (
                    <div className="pointer-events-none absolute -top-4 left-1/2 z-10 -translate-x-1/2 rounded-full border-2 border-white bg-gradient-to-r from-anchor-green to-anchor-green-dark px-6 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-lg">
                      Manager&apos;s Special
                    </div>
                  )}

                  <div className="mb-4 border-l-2 border-anchor-gold/50 pl-4">
                    {section.title && (
                      <h3 className="text-base font-semibold uppercase tracking-widest text-anchor-gold/70">
                        {section.title}
                      </h3>
                    )}

                    {section.description && (
                      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-anchor-cream-text/60">
                        {section.description}
                      </p>
                    )}
                  </div>

                  {/* Compact two-column layout for add-on sections */}
                  {section.style === 'list' && section.title?.toLowerCase().includes('add') ? (
                    <div className="grid min-w-0 grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2" role="list">
                      {section.items.map((item) => {
                        const { displayPrice } = normalizePrice(item.price)
                        return (
                          <div key={item.name} className="flex min-w-0 items-baseline justify-between gap-2 py-1" role="listitem">
                            <span className="min-w-0 break-words text-sm text-anchor-cream-text/70">{item.name}</span>
                            <span className="shrink-0 whitespace-nowrap text-sm text-anchor-cream-text/50">
                              {item.vegan && <span className="text-[10px] font-bold text-emerald-400/80 mr-1">VE</span>}
                              {item.vegetarian && !item.vegan && <span className="text-[10px] font-bold text-emerald-400/80 mr-1">V</span>}
                              £{displayPrice}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                  /* Unified row list */
                  <div
                    role="list"
                    className={cn(
                      section.style === 'grid' && 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3'
                    )}
                  >
                    {section.items.map((item, itemIndex) => {
                      const itemId = `${category.id}-${sectionIndex}-${itemIndex}`

                      if (item.special) {
                        const { displayPrice, schemaPrice } = normalizePrice(item.price)
                        return (
                          <Link key={item.name} href="/drinks/managers-special" className="relative block group">
                            <ItemBadge text="25% OFF" variant="special" position="absolute" />
                            <div
                              className="h-full bg-anchor-green/10 border-2 border-anchor-green/40 rounded-lg p-5 group-hover:shadow-xl group-hover:scale-[1.01] transition-all cursor-pointer"
                              itemScope
                              itemType="https://schema.org/MenuItem"
                              role="listitem"
                              data-menu-item
                              data-item-id={itemId}
                              aria-label={item.name}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <span className="font-bold text-anchor-gold-vivid" itemProp="name">{item.name}</span>
                                  {item.description && (
                                    <p className="text-sm text-anchor-cream-text/70 mt-1" itemProp="description">{item.description}</p>
                                  )}
                                  <span className="mt-2 inline-flex text-sm font-semibold text-anchor-gold group-hover:text-anchor-gold-light items-center gap-1">
                                    View details →
                                  </span>
                                </div>
                                {displayPrice && (
                                  <span
                                    className="font-bold text-anchor-gold text-sm whitespace-nowrap"
                                    itemProp="offers"
                                    itemScope
                                    itemType="https://schema.org/Offer"
                                  >
                                    <span itemProp="price" content={schemaPrice}>£{displayPrice}</span>
                                    <meta itemProp="priceCurrency" content="GBP" />
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        )
                      }

                      return section.style === 'grid' ? (
                        <MenuItemCard
                          key={item.name}
                          item={item}
                          itemId={itemId}
                          isFocused={focusedItem === itemId}
                          onFocus={setFocusedItem}
                          isHighlighted={!!(section.highlight && category.id === 'cocktails')}
                        />
                      ) : (
                        <MenuItemRow
                          key={item.name}
                          item={item}
                          itemId={itemId}
                          isFocused={focusedItem === itemId}
                          onFocus={setFocusedItem}
                          isHighlighted={!!(section.highlight && category.id === 'cocktails')}
                        />
                      )
                    })}
                  </div>
                  )}
                </div>
              ))}
              {showBookingCtas && (
                <div className="mt-2 flex justify-start">
                  <BookTableButton
                    source={`menu_section_${category.id}`}
                    context="food"
                    variant="primary"
                    size="md"
                    trackingLabel={`Book from ${category.title}`}
                  >
                    Book a Table
                  </BookTableButton>
                </div>
              )}
            </div>
          </Container>
        </section>
      ))}
      </div>

      {/* Responsible Drinking Message */}
      {menuData.responsibleDrinking && (
        <section className="section-spacing bg-anchor-bg-raised">
          <Container>
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-anchor-cream-text mb-4">
                {menuData.responsibleDrinking.title}
              </h3>
              <p className="text-anchor-cream-text/70">
                {menuData.responsibleDrinking.message}
              </p>
            </div>
          </Container>
        </section>
      )}
    </>
  )
}

interface MenuItemProps {
  item: MenuItem
  itemId: string
  isFocused: boolean
  onFocus: (id: string) => void
  isHighlighted?: boolean
}

const MenuItemRow = memo(function MenuItemRow({ item, itemId, isFocused, onFocus, isHighlighted }: MenuItemProps) {
  const { displayPrice, schemaPrice, gfAvailable } = normalizePrice(item.price)
  const priceLabel = displayPrice ? `, £${displayPrice}` : ''

  return (
    <div
      className={cn(
        'py-3 border-b border-anchor-gold/10 last:border-0',
        isFocused && 'bg-anchor-gold/5'
      )}
      itemScope
      itemType="https://schema.org/MenuItem"
      role="listitem"
      data-menu-item
      data-item-id={itemId}
      aria-label={`${item.name}${priceLabel}${item.vegan ? ', vegan' : item.vegetarian ? ', vegetarian' : ''}${item.glutenFree ? ', gluten-free' : ''}`}
      tabIndex={0}
      onFocus={() => onFocus(itemId)}
    >
      <p className="text-anchor-cream-text leading-snug">
        <span className="font-semibold" itemProp="name">{item.name}</span>
        {isHighlighted && (
          <ItemBadge text="NEW" variant="new" position="inline" />
        )}
        {item.featured && (
          <span className="text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded leading-none ml-1.5">
            Guest favourite
          </span>
        )}
        {item.vegan && (
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded leading-none ml-1.5">VE</span>
        )}
        {item.vegetarian && !item.vegan && (
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded leading-none ml-1.5">V</span>
        )}
        {item.veganOptionAvailable && (
          <span className="text-[11px] font-semibold text-emerald-400/80 bg-emerald-400/10 px-1.5 py-0.5 rounded leading-none ml-1.5">VEO</span>
        )}
        {item.glutenFree && (
          <span className="text-[11px] font-semibold text-anchor-green/80 bg-anchor-green/10 px-1.5 py-0.5 rounded leading-none ml-1.5">GF</span>
        )}
        {(gfAvailable || item.glutenFreeAvailable) && !item.glutenFree && (
          <span className="text-[11px] font-semibold text-anchor-green/80 bg-anchor-green/10 px-1.5 py-0.5 rounded leading-none ml-1.5">GF opt</span>
        )}
        {item.description && (
          <span className="text-anchor-cream-text/60 font-normal" itemProp="description">, {item.description}</span>
        )}
        {displayPrice && (
          <span
            className="text-anchor-cream-text/50 font-normal ml-1"
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
          >
            {' · '}
            <span itemProp="price" content={schemaPrice}>£{displayPrice}</span>
            <meta itemProp="priceCurrency" content="GBP" />
          </span>
        )}
      </p>
      <AllergenInfo item={item} />
      {item.vegan && (
        <meta itemProp="suitableForDiet" content="https://schema.org/VeganDiet" />
      )}
      {item.vegetarian && (
        <meta itemProp="suitableForDiet" content="https://schema.org/VegetarianDiet" />
      )}
      {item.glutenFree && (
        <meta itemProp="suitableForDiet" content="https://schema.org/GlutenFreeDiet" />
      )}
    </div>
  )
})

const MenuItemCard = memo(function MenuItemCard({ item, itemId, isFocused, onFocus, isHighlighted }: MenuItemProps) {
  const { displayPrice, schemaPrice, gfAvailable } = normalizePrice(item.price)
  const priceLabel = displayPrice ? `, £${displayPrice}` : ''

  return (
    <div
      className={cn(
        'h-full rounded-lg border border-anchor-gold/10 bg-anchor-bg-card p-4 transition hover:border-anchor-gold/30 hover:bg-anchor-bg-card/80',
        isFocused && 'border-anchor-gold/40 bg-anchor-gold/5'
      )}
      itemScope
      itemType="https://schema.org/MenuItem"
      role="listitem"
      data-menu-item
      data-item-id={itemId}
      aria-label={`${item.name}${priceLabel}${item.vegan ? ', vegan' : item.vegetarian ? ', vegetarian' : ''}${item.glutenFree ? ', gluten-free' : ''}`}
      tabIndex={0}
      onFocus={() => onFocus(itemId)}
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-base font-semibold leading-snug text-anchor-cream-text" itemProp="name">
          {item.name}
        </h4>
        {displayPrice && (
          <span
            className="shrink-0 text-sm font-semibold text-anchor-gold-vivid"
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
          >
            <span itemProp="price" content={schemaPrice}>£{displayPrice}</span>
            <meta itemProp="priceCurrency" content="GBP" />
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {isHighlighted && <ItemBadge text="NEW" variant="new" position="inline" />}
        {item.featured && (
          <span className="text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded leading-none">
            Guest favourite
          </span>
        )}
        {item.vegan && (
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded leading-none">VE</span>
        )}
        {item.vegetarian && !item.vegan && (
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded leading-none">V</span>
        )}
        {item.veganOptionAvailable && (
          <span className="text-[11px] font-semibold text-emerald-400/80 bg-emerald-400/10 px-1.5 py-0.5 rounded leading-none">VEO</span>
        )}
        {item.glutenFree && (
          <span className="text-[11px] font-semibold text-anchor-green/80 bg-anchor-green/10 px-1.5 py-0.5 rounded leading-none">GF</span>
        )}
        {(gfAvailable || item.glutenFreeAvailable) && !item.glutenFree && (
          <span className="text-[11px] font-semibold text-anchor-green/80 bg-anchor-green/10 px-1.5 py-0.5 rounded leading-none">GF opt</span>
        )}
      </div>

      {item.description && (
        <p className="mt-3 text-sm leading-relaxed text-anchor-cream-text/60" itemProp="description">
          {item.description}
        </p>
      )}
      <AllergenInfo item={item} />
      {item.vegan && (
        <meta itemProp="suitableForDiet" content="https://schema.org/VeganDiet" />
      )}
      {item.vegetarian && (
        <meta itemProp="suitableForDiet" content="https://schema.org/VegetarianDiet" />
      )}
      {item.glutenFree && (
        <meta itemProp="suitableForDiet" content="https://schema.org/GlutenFreeDiet" />
      )}
    </div>
  )
})

// Helper component to display allergen information
const AllergenInfo = memo(function AllergenInfo({ item }: { item: MenuItem }) {
  if (!item.allergens || item.allergens.length === 0) return null

  const labels = item.allergens.map(allergen => {
    const info = ALLERGEN_TYPES[allergen as keyof typeof ALLERGEN_TYPES]
    return info ? info.label : allergen
  })

  return (
    <p className="text-[11px] text-anchor-cream-text/40 mt-0.5 leading-snug">
      Contains: {labels.join(', ')}
    </p>
  )
})
