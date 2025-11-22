import { render, screen } from '@testing-library/react'
import { StatusBar } from '@/components/layout/StatusBar'

// Mock the hooks
jest.mock('@/hooks/useBusinessHours', () => ({
  useBusinessHours: jest.fn()
}))

jest.mock('@/hooks/useKitchenStatus', () => ({
  useKitchenStatus: jest.fn(() => ({ kitchen: null }))
}))

import { useBusinessHours } from '@/hooks/useBusinessHours'

// Mock API responses for different scenarios
const testScenarios = [
  {
    name: '5 minutes before opening',
    time: '15:55:00',
    apiResponse: {
      currentStatus: { isOpen: false, kitchenOpen: false },
      today: { opens: '16:00:00', closes: '22:00:00' },
      regularHours: {}
    },
    expected: 'Bar: Opens at 4pm'
  },
  {
    name: 'Exactly at opening time',
    time: '16:00:00',
    apiResponse: {
      currentStatus: { isOpen: true, kitchenOpen: false },
      today: { opens: '16:00:00', closes: '22:00:00' },
      regularHours: {}
    },
    expected: 'Bar: Open until 10pm'
  },
  {
    name: 'Just after opening',
    time: '16:01:00',
    apiResponse: {
      currentStatus: { isOpen: true, kitchenOpen: false },
      today: { opens: '16:00:00', closes: '22:00:00' },
      regularHours: {}
    },
    expected: 'Bar: Open until 10pm'
  },
  {
    name: 'Just before closing',
    time: '21:59:00',
    apiResponse: {
      currentStatus: { isOpen: true, kitchenOpen: true },
      today: { closes: '22:00:00', kitchen: { closes: '21:00:00' } },
      regularHours: {}
    },
    expected: 'Bar: Open until 10pm'
  },
  {
    name: 'Exactly at closing',
    time: '22:00:00',
    apiResponse: {
      currentStatus: { isOpen: false, kitchenOpen: false },
      today: null,
      regularHours: { 
        wednesday: { opens: '16:00:00', closes: '22:00:00' },
        thursday: { opens: '16:00:00', closes: '22:00:00' }
      }
    },
    expected: 'Bar: Opens tomorrow at 4pm'
  },
  {
    name: 'Special hours override',
    time: '13:00:00',
    apiResponse: {
      currentStatus: { isOpen: false, kitchenOpen: false },
      today: { opens: '14:00:00', closes: '23:00:00', is_special: true },
      specialHours: [{ date: '2025-08-13', opens: '14:00:00' }],
      regularHours: {}
    },
    expected: 'Bar: Opens at 2pm'
  },
  {
    name: 'Kitchen closed while bar open',
    time: '17:00:00',
    apiResponse: {
      currentStatus: { isOpen: true, kitchenOpen: false },
      today: { 
        opens: '16:00:00', 
        closes: '22:00:00',
        kitchen: { opens: '18:00:00', closes: '21:00:00' }
      },
      regularHours: {}
    },
    expected: 'Bar: Open until 10pm',
    expectedKitchen: 'Kitchen: Opens at 6pm'
  },
  {
    name: 'No kitchen service day (null kitchen)',
    time: '17:00:00',
    apiResponse: {
      currentStatus: { isOpen: true, kitchenOpen: false },
      today: { 
        opens: '16:00:00', 
        closes: '22:00:00',
        kitchen: null,
        is_kitchen_closed: true
      },
      regularHours: {
        tuesday: { 
          opens: '16:00:00', 
          closes: '22:00:00',
          kitchen: { opens: '18:00:00', closes: '21:00:00' }
        }
      }
    },
    expected: 'Bar: Open until 10pm',
    expectedKitchen: 'Kitchen: Opens Tuesday at 6pm'
  },
  {
    name: 'Kitchen explicitly closed flag',
    time: '17:00:00',
    apiResponse: {
      currentStatus: { isOpen: true, kitchenOpen: false },
      today: { 
        opens: '16:00:00', 
        closes: '22:00:00',
        is_kitchen_closed: true
      },
      regularHours: {
        thursday: {
          opens: '16:00:00',
          closes: '22:00:00',
          kitchen: { opens: '18:00:00', closes: '21:00:00' },
          is_kitchen_closed: false
        },
        friday: {
          opens: '16:00:00',
          closes: '22:00:00',
          kitchen: { opens: '18:00:00', closes: '21:00:00' },
          is_kitchen_closed: false
        }
      }
    },
    expected: 'Bar: Open until 10pm',
    expectedKitchen: 'Kitchen: Opens tomorrow at 6pm'
  }
]

describe('StatusBar Boundary Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  testScenarios.forEach(scenario => {
    it(`should display correctly ${scenario.name}`, async () => {
      // Mock current time
      const mockDate = new Date(`2025-08-13T${scenario.time}`)
      jest.useFakeTimers()
      jest.setSystemTime(mockDate)
      
      // Mock the hook response
      const mockUseBusinessHours = useBusinessHours as jest.MockedFunction<typeof useBusinessHours>
      mockUseBusinessHours.mockReturnValue({
        hours: scenario.apiResponse as any,
        loading: false,
        error: null,
        isStale: false,
        refresh: async () => {}
      })
      
      render(<StatusBar showKitchen={!!scenario.expectedKitchen} />)
      
      // Check bar status
      expect(screen.getByText(scenario.expected)).toBeInTheDocument()
      
      // Check kitchen if applicable
      if (scenario.expectedKitchen) {
        expect(screen.getByText(scenario.expectedKitchen)).toBeInTheDocument()
      }
      
      jest.useRealTimers()
    })
  })

  it('should show stale data indicator when data is stale', () => {
    const mockUseBusinessHours = useBusinessHours as jest.MockedFunction<typeof useBusinessHours>
    mockUseBusinessHours.mockReturnValue({
      hours: {
        currentStatus: { isOpen: true, kitchenOpen: false },
        today: { opens: '16:00:00', closes: '22:00:00' },
        regularHours: {}
      } as any,
      loading: false,
      error: null,
      isStale: true,
      refresh: async () => {}
    })
    
    render(<StatusBar />)
    
    expect(screen.getByText('(updating...)')).toBeInTheDocument()
  })

  it('should handle null data gracefully', () => {
    const mockUseBusinessHours = useBusinessHours as jest.MockedFunction<typeof useBusinessHours>
    mockUseBusinessHours.mockReturnValue({
      hours: null,
      loading: false,
      error: null,
      isStale: false,
      refresh: async () => {}
    })
    
    const { container } = render(<StatusBar />)
    
    expect(container.firstChild).toBeNull()
  })

  it('should show loading state when loading and no cached data', () => {
    const mockUseBusinessHours = useBusinessHours as jest.MockedFunction<typeof useBusinessHours>
    mockUseBusinessHours.mockReturnValue({
      hours: null,
      loading: true,
      error: null,
      isStale: false,
      refresh: async () => {}
    })
    
    render(<StatusBar />)
    
    // Should show loading skeleton
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
