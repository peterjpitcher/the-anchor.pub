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

export function MenuDisplay({ menuData, accentColor = 'anchor-gold' }: MenuDisplayProps) {
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
            "price": item.price.replace(/\u00A3/g, '').trim(),
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
        <Section spacing="sm" className="bg-anchor-gold/10">
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
            className={categoryIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
            itemScope 
            itemType="https://schema.org/MenuSection"
          >
            <Container size="lg">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-anchor-green mb-4" itemProp="name">
                  {category.emoji && <span className="mr-2">{category.emoji}</span>}
                  {category.title}
                </h2>
                
                {category.description && (
                  <p className="text-lg text-gray-700" itemProp="description">
                    {category.description}
                  </p>
                )}
              </div>

              {/* Special Offer Notifications for this section */}
              <SpecialOfferNotifications targetSection={category.id} />

              {category.sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-12 last:mb-0">
                  {section.title && (
                    <h3 className="text-2xl font-bold text-anchor-green mb-6 text-center">
                      {section.title}
                    </h3>
                  )}
                  
                  {section.description && (
                    <p className="text-center text-gray-700 mb-6">
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
                    <Card variant="elevated" className="max-w-4xl mx-auto">
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
        <Section className="bg-amber-50">
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
  return (
    <Card 
      variant={isFocused ? 'outlined' : 'elevated'}
      className={isFocused ? 'ring-2 ring-anchor-gold' : ''}
      itemScope 
      itemType="https://schema.org/MenuItem"
      role="listitem"
      // Removed tabIndex to improve keyboard navigation
      data-menu-item
      data-item-id={itemId}
      aria-label={`${item.name}, ${item.price}${item.vegetarian ? ', vegetarian' : ''}`}
    >
      <CardBody>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-xl text-anchor-green flex items-center gap-2" itemProp="name">
            {item.name}
            {item.vegetarian && (
              <Badge variant="success" size="sm">(V)</Badge>
            )}
          </h3>
	          <span className="text-xl font-bold text-anchor-gold whitespace-nowrap ml-4" itemProp="offers" itemScope itemType="https://schema.org/Offer">
	            <span itemProp="price" content={item.price.replace(/\u00A3/g, '').trim()}>
	              {item.price.replace(/\u00A3/g, '').trim()}
	            </span>
	            <meta itemProp="priceCurrency" content="GBP" />
	          </span>
        </div>
        {item.description && (
          <p className="text-gray-700" itemProp="description">{item.description}</p>
        )}
        {item.vegetarian && (
          <meta itemProp="suitableForDiet" content="https://schema.org/VegetarianDiet" />
        )}
      </CardBody>
    </Card>
  )
})

const MenuItemList = memo(function MenuItemList({ item, itemId, isFocused, onFocus }: MenuItemProps) {
  return (
    <div 
      className={`flex justify-between items-center p-2 rounded-lg transition-colours ${
        isFocused ? 'bg-amber-50' : 'hover:bg-gray-50'
      }`}
      itemScope 
      itemType="https://schema.org/MenuItem"
      role="listitem"
      // Removed tabIndex to improve keyboard navigation
      data-menu-item
      data-item-id={itemId}
      aria-label={`${item.name}, ${item.price}${item.vegetarian ? ', vegetarian' : ''}`}
	    >
      <span className="flex items-center gap-2" itemProp="name">
        {item.name}
        {item.vegetarian && <Badge variant="success" size="sm" dot>(V)</Badge>}
      </span>
	      <span className="text-anchor-gold font-semibold" itemProp="offers" itemScope itemType="https://schema.org/Offer">
	        <span itemProp="price" content={item.price.replace(/\u00A3/g, '').trim()}>
	          {item.price.replace(/\u00A3/g, '').trim()}
	        </span>
	        <meta itemProp="priceCurrency" content="GBP" />
	      </span>
      {item.vegetarian && (
        <meta itemProp="suitableForDiet" content="https://schema.org/VegetarianDiet" />
      )}
    </div>
  )
})
