import { render, screen } from '@testing-library/react'
import { OrangeJellyCreditLine } from '@/components/OrangeJellyCredit'
import { FALLBACK_CREDIT } from '@/lib/orange-jelly-credit'

describe('OrangeJellyCreditLine', () => {
  it('reads "Built and maintained by Orange Jelly" with only the name as the link', () => {
    const { container } = render(<OrangeJellyCreditLine credit={FALLBACK_CREDIT} />)

    expect(container.querySelector('p')).toHaveTextContent(/^Built and maintained by Orange Jelly$/)
    expect(screen.getByRole('link')).toHaveTextContent(/^Orange Jelly$/)
  })

  it('links to the credit href with no rel by default', () => {
    render(<OrangeJellyCreditLine credit={FALLBACK_CREDIT} />)

    const link = screen.getByRole('link', { name: 'Orange Jelly' })
    expect(link).toHaveAttribute('href', 'https://www.orangejelly.co.uk/')
    expect(link).not.toHaveAttribute('rel')
  })

  it('sets rel="nofollow" when the credit asks for it', () => {
    render(<OrangeJellyCreditLine credit={{ ...FALLBACK_CREDIT, rel: 'nofollow' }} />)

    expect(screen.getByRole('link', { name: 'Orange Jelly' })).toHaveAttribute('rel', 'nofollow')
  })

  it('shows only the link when the prefix is empty', () => {
    const { container } = render(<OrangeJellyCreditLine credit={{ ...FALLBACK_CREDIT, prefix: '' }} />)

    expect(container.querySelector('p')).toHaveTextContent(/^Orange Jelly$/)
  })

  it('applies the footer\'s classes to the line and the link', () => {
    const { container } = render(
      <OrangeJellyCreditLine credit={FALLBACK_CREDIT} className="line-class" linkClassName="link-class" />
    )

    expect(container.querySelector('p')).toHaveClass('line-class')
    expect(screen.getByRole('link')).toHaveClass('link-class')
  })
})
