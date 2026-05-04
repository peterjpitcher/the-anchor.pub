import {
  getOrganicSearchCluster,
  organicSearchClusters,
  type OrganicSearchClusterKey
} from '@/lib/seo/organic-search-map'

describe('organicSearchClusters', () => {
  it('maps priority search intents to stable primary routes', () => {
    expect(getOrganicSearchCluster('planeSpotting').primaryRoute).toBe('/blog/heathrow-plane-spotting-locations')
    expect(getOrganicSearchCluster('heathrowDining').primaryRoute).toBe('/restaurants-near-heathrow')
    expect(getOrganicSearchCluster('heathrowParking').primaryRoute).toBe('/heathrow-parking')
    expect(getOrganicSearchCluster('beerGarden').primaryRoute).toBe('/beer-garden')
  })

  it('keeps supporting links distinct from each cluster primary route', () => {
    Object.entries(organicSearchClusters).forEach(([key, cluster]) => {
      const duplicate = cluster.supportingRoutes.find((route) => route.href === cluster.primaryRoute)

      expect(duplicate).toBeUndefined()
      expect(cluster.key).toBe(key as OrganicSearchClusterKey)
      expect(cluster.primaryAnchor).toBeTruthy()
      expect(cluster.supportingRoutes.length).toBeGreaterThan(0)
    })
  })
})
