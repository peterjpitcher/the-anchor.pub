import {
  findEstimatorSpaceForTour,
  getEstimatorSpaceNames,
  getPrivateHireEnquiryHref,
  getVenueTourHref,
  getVenueTourSpaceIdForEstimatorName,
  isVenueTourSpaceId,
} from '@/components/private-hire/venue-tour/venue-tour-data'

describe('venue tour data', () => {
  it('builds shareable and enquiry URLs with the selected space', () => {
    expect(getVenueTourHref('beer-garden')).toBe(
      '/private-hire/venue-tour?space=beer-garden#venue-map'
    )
    expect(getPrivateHireEnquiryHref('dining-room')).toBe(
      '/private-hire?space=dining-room#enquiry'
    )
    expect(getVenueTourHref('dining-room', 'Corporate Event')).toBe(
      '/private-hire/venue-tour?space=dining-room&event=Corporate+Event#venue-map'
    )
    expect(getPrivateHireEnquiryHref('beer-garden', 'Birthday Party')).toBe(
      '/private-hire?space=beer-garden&event=Birthday+Party#enquiry'
    )
  })

  it('maps tour spaces to the live estimator names', () => {
    expect(getEstimatorSpaceNames('dining-room')).toContain('The Dining Room')
    expect(getVenueTourSpaceIdForEstimatorName('Outdoor Terrace/Garden')).toBe('beer-garden')
    expect(
      findEstimatorSpaceForTour(
        [{ id: 'live-garden', name: 'Outdoor Terrace/Garden' }],
        'beer-garden'
      )
    ).toEqual({ id: 'live-garden', name: 'Outdoor Terrace/Garden' })
  })

  it('rejects unknown space values from URLs and storage', () => {
    expect(isVenueTourSpaceId('dining-room')).toBe(true)
    expect(isVenueTourSpaceId('staff-area')).toBe(false)
  })
})
