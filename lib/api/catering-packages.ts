import { getPrivateBookingConfig, type PrivateBookingConfig } from './private-bookings'

export interface CateringPackage {
  id: string
  name: string
  category: 'food' | 'drink' | 'addon'
  costPerHead: number
  pricingModel?: string
  minimumGuests: number
  summary?: string
  includes?: string
  served?: string
  goodToKnow?: string
  guestDescription?: string
  dietaryNotes?: string
  servingStyle?: string
}

export interface VenueSpace {
  id: string
  name: string
  description?: string
  capacitySeated?: number
  capacityStanding?: number
  ratePerHour: number
  setupFee: number
  minimumHours: number
}

function mapPackage(p: PrivateBookingConfig['packages'][number]): CateringPackage {
  return {
    id: p.id,
    name: p.name,
    category: p.category ?? 'food',
    costPerHead: p.cost_per_head,
    pricingModel: (p as Record<string, unknown>).pricing_model as string | undefined,
    minimumGuests: p.minimum_guests,
    summary: p.summary,
    includes: p.includes,
    served: p.served,
    goodToKnow: p.good_to_know,
    guestDescription: p.guest_description,
    dietaryNotes: p.dietary_notes,
    servingStyle: (p as Record<string, unknown>).serving_style as string | undefined,
  }
}

function mapSpace(s: PrivateBookingConfig['spaces'][number]): VenueSpace {
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    capacitySeated: s.capacity_seated,
    capacityStanding: s.capacity_standing,
    ratePerHour: s.rate_per_hour,
    setupFee: s.setup_fee,
    minimumHours: s.minimum_hours,
  }
}

export interface CateringData {
  foodPackages: CateringPackage[]
  drinkPackages: CateringPackage[]
  addonPackages: CateringPackage[]
  spaces: VenueSpace[]
}

/**
 * Fetch and categorise catering packages and venue spaces from the management API.
 * Intended for use in server components.
 */
export async function getCateringData(): Promise<CateringData> {
  const response = await getPrivateBookingConfig()

  const emptyResult: CateringData = {
    foodPackages: [],
    drinkPackages: [],
    addonPackages: [],
    spaces: [],
  }

  if (!response.success || !response.data) {
    return emptyResult
  }

  const { packages, spaces } = response.data
  const mapped = packages.map(mapPackage)

  return {
    foodPackages: mapped.filter((p) => p.category === 'food'),
    drinkPackages: mapped.filter((p) => p.category === 'drink'),
    addonPackages: mapped.filter((p) => p.category === 'addon'),
    spaces: spaces.map(mapSpace),
  }
}

/** Format a package price for display */
export function formatPackagePrice(pkg: CateringPackage): string {
  if (pkg.pricingModel === 'free') return 'Free'
  if (pkg.pricingModel === 'variable') return 'Flexible'
  if (pkg.pricingModel === 'menu_priced') return 'Menu prices'
  if (pkg.costPerHead === 0) return 'POA'

  const price = pkg.costPerHead % 1 === 0
    ? `£${pkg.costPerHead}`
    : `£${pkg.costPerHead.toFixed(2)}`

  if (pkg.pricingModel === 'per_tray') return `${price} per tray`
  return `${price}pp`
}
