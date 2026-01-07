'use client'

import { useMemo, memo, useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { MenuData, MenuCategory, MenuSection, MenuItem } from '@/lib/menu-parser'
import { SpecialOfferNotifications } from './SpecialOfferNotifications'
import { HeroBadge } from './HeroBadge'
import Link from 'next/link'
import { logError } from '@/lib/error-handling'
import { ALLERGEN_TYPES } from '@/hooks/useAllergenFilter'
import { cn } from '@/lib/utils'
import { Container } from '@/components/ui'

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
  accentColor?: string
}

export function MenuRenderer({ menuData, accentColor = 'anchor-gold' }: MenuRendererProps) {
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(menuSchema) }}
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
            <p className="text-gray-700 mt-2">
              Please order at the bar when you're ready
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
          <section key={category.id} id={category.id} className={`section-spacing ${categoryIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`} itemScope itemType="https://schema.org/MenuSection">
          <Container>
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-anchor-green mb-8 text-center" itemProp="name">
                {category.emoji && <span className="mr-2">{category.emoji}</span>}
                {category.title}
              </h2>
              
              {category.description && (
                <p className="text-center text-lg text-gray-700 mb-8" itemProp="description">
                  {category.description}
                </p>
              )}

              {/* Special Offer Notifications for this section */}
              <SpecialOfferNotifications targetSection={category.id} />

              {category.sections.map((section, sectionIndex) => (
                <div
                  key={sectionIndex}
                  className={cn(
                    'mb-8',
                    section.highlight && 'relative rounded-3xl px-6 py-12 shadow-lg overflow-visible',
                    section.highlight && category.id === 'cocktails' && 'border border-amber-200 bg-amber-50/90',
                    section.highlight && category.id === 'spirits' && 'border-4 border-anchor-green bg-gradient-to-br from-anchor-green to-anchor-green-dark shadow-xl'
                  )}
                >
                  {section.highlight && category.id === 'cocktails' && (
                    <div className="pointer-events-none absolute -top-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-amber-300 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-lg">
                      🍹 Limited Time Offer
                    </div>
                  )}

                  {section.highlight && category.id === 'spirits' && (
                    <div className="pointer-events-none absolute -top-4 left-1/2 z-10 -translate-x-1/2 rounded-full border-2 border-white bg-gradient-to-r from-anchor-green to-anchor-green-dark px-6 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-lg">
                      🎯 Manager's Special
                    </div>
                  )}
                  {section.title && (
                    <h3 className={`text-2xl font-bold mb-6 text-center ${section.highlight && category.id === 'spirits' ? 'text-white' : section.highlight && category.id === 'cocktails' ? 'text-anchor-gold' : 'text-anchor-green'}`}>
                      {section.title}
                    </h3>
                  )}
                  
                  {section.description && (
                    <p className={`text-center mb-6 ${section.highlight && category.id === 'spirits' ? 'text-lg text-white font-medium' : section.highlight && category.id === 'cocktails' ? 'text-lg text-gray-800 font-medium' : 'text-gray-700'}`}>
                      {section.description}
                    </p>
                  )}

                  {/* Grid Style */}
                  {section.style === 'grid' && (
                    <div className={`grid gap-6 ${section.highlight && category.id === 'cocktails' ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2'}`} role="list">
                      {section.items.map((item, itemIndex) => (
                        <MenuItemCard 
                          key={itemIndex} 
                          item={item}
                          itemId={`${category.id}-${sectionIndex}-${itemIndex}`}
                          isFocused={focusedItem === `${category.id}-${sectionIndex}-${itemIndex}`}
                          onFocus={setFocusedItem}
                          isHighlighted={section.highlight && category.id === 'cocktails'}
                        />
                      ))}
                    </div>
                  )}

                  {/* List Style */}
                  {section.style === 'list' && (
                    <div className="bg-white rounded-2xl p-8 shadow-md">
                      <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto" role="list">
                        {section.items.map((item, itemIndex) => (
                          <MenuItemList 
                            key={itemIndex} 
                            item={item}
                            itemId={`${category.id}-${sectionIndex}-${itemIndex}`}
                            isFocused={focusedItem === `${category.id}-${sectionIndex}-${itemIndex}`}
                            onFocus={setFocusedItem}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </section>
      ))}
      </div>

      {/* Responsible Drinking Message */}
      {menuData.responsibleDrinking && (
        <section className="section-spacing bg-amber-50">
          <Container>
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-anchor-green mb-4">
                {menuData.responsibleDrinking.title}
              </h3>
              <p className="text-gray-700">
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

const MenuItemCard = memo(function MenuItemCard({ item, itemId, isFocused, onFocus, isHighlighted }: MenuItemProps) {
  const isManagersSpecial = item.special === true
  const [specialImagePath, setSpecialImagePath] = useState<string | null>(null)
  const { displayPrice, schemaPrice, gfAvailable } = normalizePrice(item.price)
  const priceLabel = displayPrice ? `, ${displayPrice}` : ''
  
  useEffect(() => {
    if (isManagersSpecial) {
      fetch('/api/managers-special-image')
        .then(res => res.json())
        .then(data => {
          if (data.found && data.image) {
            setSpecialImagePath(data.image)
          }
        })
        .catch(err => console.error('Failed to fetch manager\'s special image:', err))
    }
  }, [isManagersSpecial])
  
  const cardContent = (
    <div 
      className={`rounded-2xl shadow-md transition-all ${isFocused ? 'ring-2 ring-anchor-gold' : ''} ${
        isManagersSpecial
          ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-500 p-6 hover:shadow-xl hover:scale-105'
          : isHighlighted 
          ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 p-6 hover:shadow-xl hover:scale-105' 
          : 'bg-white p-8'
      }`}
      itemScope 
      itemType="https://schema.org/MenuItem"
      role="listitem"
      // Removed tabIndex to improve keyboard navigation
      data-menu-item
      data-item-id={itemId}
      aria-label={`${item.name}${priceLabel}${item.vegetarian ? ', vegetarian' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className={`font-bold ${isHighlighted ? 'text-lg' : 'text-xl'} text-anchor-green flex items-center flex-wrap`} itemProp="name">
          <span>{item.name}</span>
          {isHighlighted && (
            <HeroBadge text="NEW" variant="new" position="inline" />
          )}
          {item.vegetarian && (
            <span className="text-anchor-gold text-sm font-bold bg-green-100 px-2 py-1 rounded ml-2">(V)</span>
          )}
        </h3>
        {displayPrice && (
          <span className={`font-bold whitespace-nowrap ml-4 ${isHighlighted ? 'text-2xl text-amber-600' : 'text-xl text-anchor-gold'}`} itemProp="offers" itemScope itemType="https://schema.org/Offer">
            <span itemProp="price" content={schemaPrice}>{displayPrice}</span>
            <meta itemProp="priceCurrency" content="GBP" />
          </span>
        )}
      </div>
      {item.description && (
        <p className={`${isHighlighted ? 'text-gray-800 text-sm leading-relaxed' : 'text-gray-700'}`} itemProp="description">{item.description}</p>
      )}
      {gfAvailable && (
        <div className="mt-3">
          <span className="inline-flex items-center rounded-full bg-anchor-green/10 px-2 py-1 text-xs font-semibold text-anchor-green">
            GF option available
          </span>
        </div>
      )}
      <AllergenInfo item={item} />
      {item.vegetarian && (
        <meta itemProp="suitableForDiet" content="https://schema.org/VegetarianDiet" />
      )}
    </div>
  )

  // Wrap in container with absolute badge for desktop
  if (isHighlighted) {
    return (
      <div className="relative">
        <HeroBadge text="NEW" variant="new" position="absolute" />
        {cardContent}
      </div>
    )
  }
  
  if (isManagersSpecial) {
    return (
      <Link href="/drinks/managers-special" className="relative md:col-span-2 block group">
        <HeroBadge text="25% OFF" variant="special" position="absolute" />
        <div 
          className={`rounded-2xl shadow-md transition-all ${isFocused ? 'ring-2 ring-anchor-gold' : ''} ${
            'bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-500 p-6 group-hover:shadow-xl group-hover:scale-105 cursor-pointer'
          }`}
          itemScope 
          itemType="https://schema.org/MenuItem"
          role="listitem"
          data-menu-item
          data-item-id={itemId}
          aria-label={`${item.name}${priceLabel}${item.vegetarian ? ', vegetarian' : ''}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left side - Image (25% width on desktop) */}
            {specialImagePath && (
              <div className="md:col-span-3">
                <div className="bg-white rounded-lg p-2 shadow-md">
                  <Image 
                    src={specialImagePath} 
                    alt={item.name}
                    width={200}
                    height={200}
                    className="w-full h-auto rounded"
                    unoptimized
                    onError={(e) => {
                      logError('menu-image-load', new Error('Failed to load menu image'), {
                        src: e.currentTarget.src,
                        itemName: item.name
                      })
                      // Hide the image container on error
                      e.currentTarget.parentElement?.parentElement?.remove()
                    }}
                  />
                </div>
              </div>
            )}
            
            {/* Right side - Content (75% width on desktop) */}
            <div className={specialImagePath ? "md:col-span-9" : "md:col-span-12"}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-xl text-anchor-green" itemProp="name">
                  {item.name}
                </h3>
              </div>
              {displayPrice && (
                <div className="font-bold text-lg text-green-700 mb-3" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                  <span itemProp="price" content={schemaPrice}>{displayPrice}</span>
                  <meta itemProp="priceCurrency" content="GBP" />
                </div>
              )}
              {gfAvailable && (
                <div className="mb-3">
                  <span className="inline-flex items-center rounded-full bg-anchor-green/10 px-2 py-1 text-xs font-semibold text-anchor-green">
                    GF option available
                  </span>
                </div>
              )}
              {item.description && (
                <p className="text-gray-700 mb-4" itemProp="description">{item.description}</p>
              )}
              <AllergenInfo item={item} />
              <div className="text-sm font-semibold text-green-700 group-hover:text-green-800 flex items-center mt-3">
                View Full Details & Tasting Notes
                <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return cardContent
})

// Helper component to display allergen information
const AllergenInfo = memo(function AllergenInfo({ item }: { item: MenuItem }) {
  if (!item.allergens || item.allergens.length === 0) {
    return null
  }

  return (
    <div className="mt-2 text-sm text-gray-600">
      <span className="font-medium">Contains: </span>
      {item.allergens.map((allergen, index) => {
        const allergenInfo = ALLERGEN_TYPES[allergen as keyof typeof ALLERGEN_TYPES]
        return (
          <span key={allergen}>
            {index > 0 && ', '}
            {allergenInfo ? (
              <span className="inline-flex items-center">
                {allergenInfo.icon} {allergenInfo.label}
              </span>
            ) : (
              allergen
            )}
          </span>
        )
      })}
    </div>
  )
})

const MenuItemList = memo(function MenuItemList({ item, itemId, isFocused, onFocus }: MenuItemProps) {
  const { displayPrice, schemaPrice, gfAvailable } = normalizePrice(item.price)
  const priceLabel = displayPrice ? `, ${displayPrice}` : ''

  return (
    <div 
      className={`flex justify-between p-2 rounded transition-all ${isFocused ? 'bg-amber-50' : ''}`}
      itemScope 
      itemType="https://schema.org/MenuItem"
      role="listitem"
      // Removed tabIndex to improve keyboard navigation
      data-menu-item
      data-item-id={itemId}
      aria-label={`${item.name}${priceLabel}${item.vegetarian ? ', vegetarian' : ''}`}
    >
      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span itemProp="name">
            {item.name}
            {item.vegetarian && <span className="text-sm text-green-600 ml-1">(V)</span>}
          </span>
          {displayPrice && (
            <span className="text-anchor-gold font-semibold ml-4" itemProp="offers" itemScope itemType="https://schema.org/Offer">
              <span itemProp="price" content={schemaPrice}>{displayPrice}</span>
              <meta itemProp="priceCurrency" content="GBP" />
            </span>
          )}
        </div>
        {gfAvailable && (
          <div className="mt-1">
            <span className="inline-flex items-center rounded-full bg-anchor-green/10 px-2 py-0.5 text-[11px] font-semibold text-anchor-green">
              GF option available
            </span>
          </div>
        )}
        {item.allergens && item.allergens.length > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            <span>Contains: {item.allergens.join(', ')}</span>
          </div>
        )}
      </div>
      {item.vegetarian && (
        <meta itemProp="suitableForDiet" content="https://schema.org/VegetarianDiet" />
      )}
    </div>
  )
})
