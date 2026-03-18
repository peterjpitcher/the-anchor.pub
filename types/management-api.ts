/**
 * Single source of truth for management API (management.orangejelly.co.uk) response shapes.
 * Update this file whenever the management API contract changes.
 *
 * Endpoint reference: see docs/api-integration.md
 *
 * These are re-exports — definitions live in their respective domain files under lib/api/.
 * This file exists so that callers have one place to import from, and future API changes
 * can be tracked by reviewing the diff here alongside the relevant domain file.
 */

/** Shared envelope types used across all endpoints */
export type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
} from '@/lib/api/shared'

/** GET /business/hours */
export type {
  KitchenOpen,
  KitchenClosed,
  KitchenStatus,
  BusinessHours,
  Amenity,
  AmenitiesResponse,
} from '@/lib/api/hours'

/** GET /events, GET /events/:id */
export type {
  Event,
  EventsResponse,
  EventAvailability,
  EventCategory,
  EventCategoriesResponse,
} from '@/lib/api/events'

/**
 * GET /menus
 * GET /menus/dietary/:type
 * GET /menus/sunday-lunch
 */
export type {
  MenuItem,
  MenuSection,
  MenuSchema,
  MenuSectionItem,
  MenuSectionData,
  MenuResponse,
  DietaryMenuItem,
  DietaryMenuSection,
  DietaryMenuResponse,
  SundayLunchMenuItem,
  SundayLunchMenuResponse,
} from '@/lib/api/menu'

/** GET /table-bookings/availability, POST /table-bookings */
export type {
  TableAvailabilitySlot,
  TableAvailabilityResponse,
  TableBookingRequest,
  TableBookingResponse,
} from '@/lib/api/bookings'

/**
 * GET /parking/availability
 * GET /parking/rates
 * POST /parking/bookings
 * POST /parking/bookings/:id/capture
 * GET /parking/bookings/:id
 */
export type {
  ParkingCustomerDetails,
  ParkingVehicleDetails,
  ParkingBookingRequest,
  ParkingPricingBreakdownItem,
  ParkingBookingResponse,
  ParkingBookingDetails,
  ParkingCreateOrderRequest,
  ParkingCreateOrderResponse,
  ParkingCaptureResponse,
  ParkingAvailabilitySlot,
  ParkingRateCard,
} from '@/lib/api/parking'

/**
 * GET /public/private-booking/config
 * POST /public/private-booking
 */
export type {
  PrivateBookingConfig,
  ItemType,
  DiscountType,
  PrivateBookingItem,
  PrivateBookingRequest,
  PrivateBookingResponse,
} from '@/lib/api/private-bookings'
