import { render, screen } from '@testing-library/react'
import { SeasonalPreorderPicker, emptyPreorderChoice, preorderGuestsMissingMain, resizePreorderChoices } from '@/components/features/TableBooking/SeasonalPreorderPicker'

const main = { id: 'main', course: 'main', name: 'Fixture main', description: null, price_gbp: null, allergens: null }

describe('Christmas per-guest course policy', () => {
  it('requires no menu choices for six one-course guests', () => {
    const choices = Array.from({ length: 6 }, (_, index) => ({ ...emptyPreorderChoice(index), courseCount: 1 as const }))
    expect(preorderGuestsMissingMain(choices, 6, true)).toEqual([])
    render(<SeasonalPreorderPicker partySize={6} choices={choices} menu={[main]} courseAware onChange={() => {}} />)
    expect(screen.queryAllByText('Fixture main')).toHaveLength(0)
    expect(screen.getAllByLabelText('Number of courses')).toHaveLength(6)
  })
  it('requires exactly two or three choices, including a main, for the chosen seats', () => {
    const choices = [
      { ...emptyPreorderChoice(0), courseCount: 1 as const },
      { ...emptyPreorderChoice(1), courseCount: 2 as const, mainId: 'main' },
      { ...emptyPreorderChoice(2), courseCount: 3 as const, mainId: 'main', starterId: 'starter' }
    ]
    expect(preorderGuestsMissingMain(choices, 3, true)).toEqual([2, 3])
    choices[1].starterId = 'starter'
    choices[2].dessertId = 'dessert'
    expect(preorderGuestsMissingMain(choices, 3, true)).toEqual([])
  })
  it('new seats need an explicit course choice and old clients still need a main', () => {
    const choices = [{ ...emptyPreorderChoice(0), courseCount: 1 as const }]
    expect(preorderGuestsMissingMain(resizePreorderChoices(choices, 2), 2, true)).toEqual([2])
    expect(preorderGuestsMissingMain(choices, 1)).toEqual([1])
  })
  it('disables two and three courses once the server says the deadline passed', () => {
    render(<SeasonalPreorderPicker partySize={1} choices={[]} menu={[main]} courseAware multipleCoursesAvailable={false} onChange={() => {}} />)
    expect(screen.getByRole('option', { name: '2 courses' })).toBeDisabled()
    expect(screen.getByRole('option', { name: '3 courses' })).toBeDisabled()
    expect(screen.getByRole('option', { name: '1 course, no pre-order' })).not.toBeDisabled()
  })
})
