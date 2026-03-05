import { render, screen, fireEvent } from '@testing-library/react'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { trackFaqItemOpened } from '@/lib/gtm-events'

jest.mock('@/lib/gtm-events', () => ({
  trackFaqItemOpened: jest.fn(),
}))

const mockFaqs = [
  { question: 'What time do you open?', answer: 'We open at 11am.' },
  { question: 'Do you take bookings?', answer: 'Yes.' },
]

describe('FAQAccordionWithSchema', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fires trackFaqItemOpened when a question is expanded', () => {
    render(<FAQAccordionWithSchema faqs={mockFaqs} renderSchema={false} />)
    fireEvent.click(screen.getByText('What time do you open?'))
    expect(trackFaqItemOpened).toHaveBeenCalledTimes(1)
    expect(trackFaqItemOpened).toHaveBeenCalledWith({
      questionText: 'What time do you open?',
      faqPagePath: expect.any(String),
    })
  })

  it('does not fire when a question is collapsed', () => {
    render(<FAQAccordionWithSchema faqs={mockFaqs} renderSchema={false} />)
    // Open it
    fireEvent.click(screen.getByText('What time do you open?'))
    jest.clearAllMocks()
    // Close it by clicking again
    fireEvent.click(screen.getByText('What time do you open?'))
    expect(trackFaqItemOpened).not.toHaveBeenCalled()
  })

  it('fires for a different question when switching', () => {
    render(<FAQAccordionWithSchema faqs={mockFaqs} renderSchema={false} />)
    fireEvent.click(screen.getByText('What time do you open?'))
    jest.clearAllMocks()
    fireEvent.click(screen.getByText('Do you take bookings?'))
    expect(trackFaqItemOpened).toHaveBeenCalledWith({
      questionText: 'Do you take bookings?',
      faqPagePath: expect.any(String),
    })
  })
})
