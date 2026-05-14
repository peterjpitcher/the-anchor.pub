import { render, screen, within } from '@testing-library/react'
import { TestimonialSection, type Testimonial } from '@/components/TestimonialSection'

// Mock dependencies
jest.mock('@/components/ui/layout/Card', () => ({
  Card: ({ children, padding, className, ...props }: any) => (
    <div data-testid="card" data-padding={padding} className={className} {...props}>
      {children}
    </div>
  ),
}))

jest.mock('@/components/SectionHeader', () => ({
  SectionHeader: ({ title, subtitle, className }: any) => (
    <div data-testid="section-header" data-title={title} data-subtitle={subtitle} className={className}>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  ),
}))

const sampleReviews: Testimonial[] = [
  { quote: 'Amazing food and atmosphere', author: 'Dave', source: 'Google Review', rating: 5 },
  { quote: 'Best pub near Heathrow', author: 'Sarah T.', source: 'Google Review', rating: 4 },
  { quote: 'Lovely Sunday roast', author: 'Mark', rating: 5 },
]

describe('TestimonialSection', () => {
  describe('empty state', () => {
    it('should return null when reviews array is empty', () => {
      const { container } = render(<TestimonialSection reviews={[]} />)
      expect(container.innerHTML).toBe('')
    })
  })

  describe('full variant', () => {
    it('should render heading "What Our Guests Say" when no title prop provided', () => {
      render(<TestimonialSection reviews={sampleReviews} />)
      const header = screen.getByTestId('section-header')
      expect(header).toHaveAttribute('data-title', 'What Our Guests Say')
    })

    it('should render subtitle "From Google Reviews" when no subtitle prop provided', () => {
      render(<TestimonialSection reviews={sampleReviews} />)
      const header = screen.getByTestId('section-header')
      expect(header).toHaveAttribute('data-subtitle', 'From Google Reviews')
    })

    it('should render all review cards when given 3 reviews', () => {
      render(<TestimonialSection reviews={sampleReviews} />)
      const cards = screen.getAllByTestId('card')
      expect(cards).toHaveLength(3)
    })

    it('should render star ratings with aria-label "5 out of 5 stars"', () => {
      render(<TestimonialSection reviews={[sampleReviews[0]]} />)
      expect(screen.getByLabelText('5 out of 5 stars')).toBeInTheDocument()
    })

    it('should render author name and source text', () => {
      render(<TestimonialSection reviews={[sampleReviews[0]]} />)
      // Find the attribution paragraph within the card
      const card = screen.getByTestId('card')
      const attribution = within(card).getByText(/Dave/)
      expect(attribution).toBeInTheDocument()
      expect(attribution.textContent).toContain('Google Review')
    })

    it('should wrap quotes with curly double quotes', () => {
      render(<TestimonialSection reviews={[sampleReviews[0]]} />)
      const quoteText = screen.getByText(/Amazing food and atmosphere/)
      expect(quoteText.textContent).toContain('“')
      expect(quoteText.textContent).toContain('”')
    })
  })

  describe('compact variant', () => {
    it('should render horizontal scroll container with overflow-x-auto', () => {
      const { container } = render(
        <TestimonialSection variant="compact" reviews={sampleReviews} />
      )
      const scrollContainer = container.firstElementChild
      expect(scrollContainer?.className).toContain('overflow-x-auto')
    })

    it('should NOT render heading or subtitle', () => {
      render(<TestimonialSection variant="compact" reviews={sampleReviews} />)
      expect(screen.queryByTestId('section-header')).not.toBeInTheDocument()
    })

    it('should truncate quote text with line-clamp-3', () => {
      const { container } = render(
        <TestimonialSection variant="compact" reviews={[sampleReviews[0]]} />
      )
      const quoteElement = container.querySelector('.line-clamp-3')
      expect(quoteElement).toBeInTheDocument()
    })
  })

  describe('pull-quote variant', () => {
    it('should render a blockquote element', () => {
      render(<TestimonialSection variant="pull-quote" reviews={sampleReviews} />)
      expect(screen.getByRole('blockquote')).toBeInTheDocument()
    })

    it('should render only the first review when given multiple', () => {
      render(<TestimonialSection variant="pull-quote" reviews={sampleReviews} />)
      expect(screen.getByText(/Amazing food and atmosphere/)).toBeInTheDocument()
      expect(screen.queryByText(/Best pub near Heathrow/)).not.toBeInTheDocument()
    })

    it('should show "rated 5/5" in attribution text', () => {
      render(<TestimonialSection variant="pull-quote" reviews={sampleReviews} />)
      expect(screen.getByText(/rated 5\/5/)).toBeInTheDocument()
    })

    it('should NOT render star icons (rating shown in text)', () => {
      render(<TestimonialSection variant="pull-quote" reviews={sampleReviews} />)
      expect(screen.queryByLabelText(/out of 5 stars/)).not.toBeInTheDocument()
    })
  })

  describe('defaults and className', () => {
    it('should default rating to 5 when not provided', () => {
      const reviewNoRating: Testimonial[] = [
        { quote: 'Great place', author: 'Test User' },
      ]
      render(<TestimonialSection reviews={reviewNoRating} />)
      expect(screen.getByLabelText('5 out of 5 stars')).toBeInTheDocument()
    })

    it('should forward className prop to outermost element', () => {
      const { container } = render(
        <TestimonialSection reviews={sampleReviews} className="custom-class" />
      )
      expect(container.firstElementChild?.className).toContain('custom-class')
    })
  })
})
