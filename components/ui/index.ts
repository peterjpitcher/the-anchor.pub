// Central export file for all UI components
// This provides a single import point for consuming components

// Primitive components
export * from './primitives/Button'
export * from './primitives/Input'
export * from './primitives/Badge'

// Feedback components
export * from './feedback/Alert'

// Layout components
export * from './layout/Card'
export { Container } from './layout/Container'
export { Section, PageSection, HeroSection } from './layout/Section'
export * from './layout/Grid'
export { FullWidthSection } from './FullWidthSection'

// Navigation components
export * from './navigation/Tabs'
export * from './navigation/Breadcrumb'
export * from './navigation/NavBar'

// Form components
export { Form, FormSection, FormField } from './forms/Form'
export { Select } from './forms/Select'
export * from './forms/Checkbox'
export * from './forms/Radio'
export * from './forms/DatePicker'
export * from './forms/Switch'

// Overlay components
export * from './overlays/Modal'
export * from './overlays/Toast'
export * from './overlays/Tooltip'
export * from './overlays/Popover'

// Feedback components (Loading)
export * from './feedback/Loading'

// Accessibility components
export { LiveRegion, announceToScreenReader, useLiveRegion } from './LiveRegion'

// Utility components
export { IconText } from './IconText'
export { JourneyTime, JourneyTimes } from './JourneyTime'
export { ContactLink } from './ContactLink'
export { EventMetadata } from './EventMetadata'
export { PriceDisplay } from './PriceDisplay'
export { OpeningStatus } from './OpeningStatus'
export { Price, PriceRange } from './Price'
export { Icon, type IconName } from './Icon'
export * from './Icon' // Export all icon components
export { ErrorDisplay, EventsErrorDisplay, BookingErrorDisplay, FlightErrorDisplay } from './ErrorDisplay'
export { LoadingState, CardSkeleton, EventCardSkeleton, TableRowSkeleton } from './LoadingState'

// Re-export component types
export type * from './types'

// Legacy exports for backward compatibility
// Section Components
export { CTASection } from '../CTASection'
export { SectionHeader } from '../SectionHeader'

// Card Components
export { FeatureCard, FeatureGrid } from '../FeatureCard'
export { InfoBox, InfoBoxGrid } from '../InfoBox'
export { DirectionsCard, DirectionsGrid } from '../DirectionsCard'

// List Components
export { AmenityList } from '../AmenityList'
export { QuickInfoGrid } from '../QuickInfoGrid'

// Alert/Notification Components
export { AlertBox } from '../AlertBox'
