'use client'

import { useMemo, memo, useRef, useState } from 'react'
import { MenuData, MenuCategory, MenuSection, MenuItem } from '@/lib/menu-parser'
import { jsonLdSafeStringify } from '@/lib/jsonld'
import { SpecialOfferNotifications } from '../SpecialOfferNotifications'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/layout/Card'
import { Container, Section } from '@/components/ui/layout/Container'
import { Grid, GridItem } from '@/components/ui/layout/Grid'
import { Badge } from '@/components/ui/primitives/Badge'
import { Alert } from '@/components/ui/feedback/Alert'

interface MenuDisplayProps {
  menuData: MenuData
  accentColor?: string
}

function normalizeMenuPrice(price: string): string {
  return price.replace(/\u00A3/g, '').trim()
}

function formatMenuPrice(price: string): string {
  const displayPrice = normalizeMenuPrice(price)
  return /\d/.test(displayPrice) ? `(${displayPrice})` : displayPrice
}

export function MenuDisplay({ menuData, accentColor = 'anchor-gold-dark' }: MenuDisplayProps) {
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
            "price": normalizeMenuPrice(item.price),
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
        <Section spacing="sm" className="bg-anchor-gold-dark/10">
          <Container size="md" className="text-center">
            <Alert variant="info" icon={false} className="inline-block">
              <p className="text-lg font-semibold">
                Kitchen Hours: {Object.entries(menuData.kitchenHours).map(([day, hours], index) => (
                  <span key={day}>
                    {index > 0 && ' | '}
                    {day} {hours}
                  </span>
                ))}
              </p>
              <p className="text-sm mt-1">
                Please order at the bar when you're ready
              </p>
            </Alert>
          </Container>
        </Section>
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
          <Section
            key={category.id}
            id={category.id}
            className={categoryIndex % 2 === 0 ? 'bg-surface-sunk' : 'bg-canvas'}
            itemScope
            itemType="https://schema.org/MenuSection"
          >
            <Container size="lg">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl text-ink-strong mb-4" itemProp="name">
                  {category.emoji && <span className="mr-2">{category.emoji}</span>}
                  {category.title}
                </h2>

                {category.description && (
                  <p className="text-lg text-ink-muted" itemProp="description">
                    {category.description}
                  </p>
                )}
              </div>

              {/* Special Offer Notifications for this section */}
              <SpecialOfferNotifications targetSection={category.id} />

              {category.sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-12 last:mb-0">
                  {section.title && (
                    <h3 className="text-2xl text-ink-strong mb-6 text-center">
                      {section.title}
                    </h3>
                  )}

                  {section.description && (
                    <p className="text-center text-ink-muted mb-6">
                      {section.description}
                    </p>
                  )}

                  {/* Grid Style */}
                  {section.style === 'grid' && (
                    <Grid cols={2} gap="md" role="list">
                      {section.items.map((item, itemIndex) => (
                        <GridItem key={itemIndex}>
                          <MenuItemCard 
                            item={item}
                            itemId={`${category.id}-${sectionIndex}-${itemIndex}`}
                            isFocused={focusedItem === `${category.id}-${sectionIndex}-${itemIndex}`}
                            onFocus={setFocusedItem}
                          />
                        </GridItem>
                      ))}
                    </Grid>
                  )}

                  {/* List Style */}
                  {section.style === 'list' && (
                    <Card className="max-w-4xl mx-auto">
                      <CardBody>
                        <Grid cols={2} gap="sm" role="list" className="max-w-2xl mx-auto">
                          {section.items.map((item, itemIndex) => (
                            <GridItem key={itemIndex}>
                              <MenuItemList 
                                item={item}
                                itemId={`${category.id}-${sectionIndex}-${itemIndex}`}
                                isFocused={focusedItem === `${category.id}-${sectionIndex}-${itemIndex}`}
                                onFocus={setFocusedItem}
                              />
                            </GridItem>
                          ))}
                        </Grid>
                      </CardBody>
                    </Card>
                  )}
                </div>
              ))}
            </Container>
          </Section>
        ))}
      </div>

      {/* Responsible Drinking Message */}
      {menuData.responsibleDrinking && (
        <Section className="bg-surface-sunk">
          <Container size="md">
            <Alert variant="warning" className="text-center">
              <h3 className="text-xl font-bold mb-2">
                {menuData.responsibleDrinking.title}
              </h3>
              <p>{menuData.responsibleDrinking.message}</p>
            </Alert>
          </Container>
        </Section>
      )}
    </>
  )
}

interface MenuItemProps {
  item: MenuItem
  itemId: string
  isFocused: boolean
  onFocus: (id: string) => void
}

const MenuItemCard = memo(function MenuItemCard({ item, itemId, isFocused, onFocus }: MenuItemProps) {
  const displayPrice = formatMenuPrice(item.price)
  const schemaPrice = normalizeMenuPrice(item.price)

  return (
    <Card
      className={isFocused ? 'ring-2 ring-accent-text' : ''}
      itemScope
      itemType="https://schema.org/MenuItem"
      role="listitem"
      // Removed tabIndex to improve keyboard navigation
      data-menu-item
      data-item-id={itemId}
      aria-label={`${item.name}, ${schemaPrice}${item.vegetarian ? ', vegetarian' : ''}`}
    >
      <CardBody>
        <div className="mb-2">
          <h3 className="min-w-0 break-words text-xl text-ink-strong flex flex-wrap items-baseline gap-2">
            <span itemProp="name">{item.name}</span>
            <span className="shrink-0 text-xl font-semibold text-accent-text whitespace-nowrap" itemProp="offers" itemScope itemType="https://schema.org/Offer">
              <span itemProp="price" content={schemaPrice}>
                {displayPrice}
              </span>
              <meta itemProp="priceCurrency" content="GBP" />
            </span>
            {item.vegetarian && (
              <Badge variant="success">(V)</Badge>
            )}
          </h3>
        </div>
        {item.description && (
          <p className="text-ink-muted" itemProp="description">{item.description}</p>
        )}
        {item.vegetarian && (
          <meta itemProp="suitableForDiet" content="https://schema.org/VegetarianDiet" />
        )}
      </CardBody>
    </Card>
  )
})

const MenuItemList = memo(function MenuItemList({ item, itemId, isFocused, onFocus }: MenuItemProps) {
  const displayPrice = formatMenuPrice(item.price)
  const schemaPrice = normalizeMenuPrice(item.price)

  return (
    <div
      className={`p-2 rounded-lg transition-colours ${
        isFocused ? 'bg-accent/10' : 'hover:bg-surface-sunk'
      }`}
      itemScope 
      itemType="https://schema.org/MenuItem"
      role="listitem"
      // Removed tabIndex to improve keyboard navigation
      data-menu-item
      data-item-id={itemId}
      aria-label={`${item.name}, ${schemaPrice}${item.vegetarian ? ', vegetarian' : ''}`}
    >
      <span className="flex flex-wrap items-baseline gap-2">
        <span itemProp="name">{item.name}</span>
        <span className="text-accent-text font-semibold" itemProp="offers" itemScope itemType="https://schema.org/Offer">
          <span itemProp="price" content={schemaPrice}>
            {displayPrice}
          </span>
          <meta itemProp="priceCurrency" content="GBP" />
        </span>
        {item.vegetarian && <Badge variant="success" dot>(V)</Badge>}
      </span>
      {item.vegetarian && (
        <meta itemProp="suitableForDiet" content="https://schema.org/VegetarianDiet" />
      )}
    </div>
  )
})
