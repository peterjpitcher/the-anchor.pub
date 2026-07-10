import { christmasPartiesSchema } from '@/lib/christmas-parties-schema'
import { jsonLdSafeStringify } from '@/lib/jsonld'

const BUSINESS_ID = 'https://www.the-anchor.pub/#business'
const WEBSITE_ID = 'https://www.the-anchor.pub/#website'
const PAGE_URL = 'https://www.the-anchor.pub/christmas-parties'

type Node = Record<string, unknown>

function walk(value: unknown, visit: (key: string, node: unknown) => void): void {
  if (Array.isArray(value)) {
    value.forEach((entry) => walk(entry, visit))
    return
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      visit(key, child)
      walk(child, visit)
    }
  }
}

function collectKeys(value: unknown): string[] {
  const keys: string[] = []
  walk(value, (key) => keys.push(key))
  return keys
}

function collectStrings(value: unknown): string[] {
  const strings: string[] = []
  walk(value, (_key, node) => {
    if (typeof node === 'string') strings.push(node)
  })
  return strings
}

function graphNodes(): Node[] {
  return christmasPartiesSchema['@graph'] as Node[]
}

function nodeOfType(type: string): Node {
  const node = graphNodes().find((entry) => entry['@type'] === type)
  if (!node) throw new Error(`No ${type} node found in @graph`)
  return node
}

describe('christmasPartiesSchema', () => {
  it('should model the page as WebPage and Service rather than a long-running Event', () => {
    const types = graphNodes().map((node) => node['@type'])
    expect(types).toEqual(expect.arrayContaining(['WebPage', 'Service']))
    expect(collectStrings(christmasPartiesSchema)).not.toContain('Event')
    expect(types).not.toContain('Event')
  })

  it('should never publish a hardcoded price, because SSOT holds Christmas pricing as LIVE_FROM_DB', () => {
    const keys = collectKeys(christmasPartiesSchema)
    expect(keys).not.toContain('price')
    expect(keys).not.toContain('priceCurrency')
    expect(keys).not.toContain('priceSpecification')
    expect(keys).not.toContain('addOn')

    for (const value of collectStrings(christmasPartiesSchema)) {
      expect(value).not.toMatch(/£/)
      expect(value).not.toMatch(/\b\d+\.\d{2}\b/)
    }
  })

  it('should reference the shared business and website nodes instead of redefining them', () => {
    expect(nodeOfType('Service').provider).toEqual({ '@id': BUSINESS_ID })
    expect(nodeOfType('WebPage').about).toEqual({ '@id': BUSINESS_ID })
    expect(nodeOfType('WebPage').isPartOf).toEqual({ '@id': WEBSITE_ID })
  })

  it('should bound every offer to the owner-confirmed 2026 service window', () => {
    const catalog = nodeOfType('Service').hasOfferCatalog as Node
    const offers = catalog.itemListElement as Node[]

    expect(offers.length).toBeGreaterThan(0)
    for (const offer of offers) {
      expect(offer['@type']).toBe('Offer')
      expect(offer.availabilityStarts).toBe('2026-11-01')
      expect(offer.availabilityEnds).toBe('2026-12-23')
      expect(offer.url).toBe(PAGE_URL)
    }
  })

  it('should state that sit-down festive meals are pre-order only', () => {
    const catalog = nodeOfType('Service').hasOfferCatalog as Node
    const offers = catalog.itemListElement as Node[]
    const sitDown = offers
      .map((offer) => offer.itemOffered as Node)
      .find((item) => /lunch or dinner/i.test(String(item.name)))

    expect(sitDown).toBeDefined()
    expect(String(sitDown?.description)).toMatch(/pre-order only/i)
  })

  it('should serialise to valid JSON-LD with angle brackets escaped', () => {
    const serialised = jsonLdSafeStringify(christmasPartiesSchema)
    expect(serialised).not.toContain('<')
    expect(() => JSON.parse(serialised)).not.toThrow()
    expect(JSON.parse(serialised)['@context']).toBe('https://schema.org')
  })
})
