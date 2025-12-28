import { Container, SectionHeader } from '@/components/ui'
import { PrivateBookingCalculator } from '@/components/PrivateBookingCalculator'

interface PrivateBookingSectionProps {
  id?: string
  title?: string
  subtitle?: string
  eventType?: string
}

export function PrivateBookingSection({
  id = 'enquiry',
  title = 'Instant Quote & Check Availability',
  subtitle = 'Get an immediate cost estimate for your gathering.',
  eventType
}: PrivateBookingSectionProps) {
  return (
    <section id={id} className="border-y py-12 bg-gray-50 border-gray-200">
      <Container size="md">
        <SectionHeader title={title} subtitle={subtitle} />
        <div className="max-w-3xl mx-auto">
          <PrivateBookingCalculator eventType={eventType} />
        </div>
      </Container>
    </section>
  )
}
