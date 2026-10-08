export const PRIVATE_HIRE_CAPACITY = {
  recommendedRange: '10+ to 150 guests',
  largerEventsCopy: 'Larger events and full-venue hire available by enquiry.',
  summary: 'Private hire for 10+ to 150 guests; larger events and full-venue hire by enquiry.',
  spaces: {
    diningRoom: {
      name: 'Dining room',
      seated: 26,
      standing: 50
    },
    mainArea: {
      name: 'Main area',
      seated: 29,
      standing: 150
    },
    gardenTerrace: {
      name: 'Garden and terrace',
      seated: 64,
      standing: 250
    },
    entirePub: {
      name: 'Entire pub',
      seated: 119,
      standing: 300
    }
  }
} as const

// The summary already says "larger events and full-venue hire by enquiry", so
// largerEventsCopy is not appended: it used to print that sentence twice.
export const PRIVATE_HIRE_CAPACITY_SUMMARY = PRIVATE_HIRE_CAPACITY.summary
