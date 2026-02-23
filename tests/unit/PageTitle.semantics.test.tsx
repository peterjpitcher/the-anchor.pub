import { render, screen } from '@testing-library/react'
import { PageTitle } from '@/components/ui/typography/PageTitle'

describe('PageTitle semantics', () => {
  it('defaults to h2 to avoid duplicate h1 headings under hero sections', () => {
    render(<PageTitle>Section heading</PageTitle>)
    expect(screen.getByText('Section heading').tagName).toBe('H2')
  })

  it('supports explicit semantic level overrides', () => {
    render(
      <>
        <PageTitle as="h1">Page heading</PageTitle>
        <PageTitle as="h3">Sub section</PageTitle>
      </>
    )

    expect(screen.getByText('Page heading').tagName).toBe('H1')
    expect(screen.getByText('Sub section').tagName).toBe('H3')
  })
})
