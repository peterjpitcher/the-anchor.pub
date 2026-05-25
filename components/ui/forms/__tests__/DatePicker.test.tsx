import { render, screen } from '@testing-library/react'
import { DatePicker, TimePicker } from '../DatePicker'

describe('DatePicker', () => {
  it('marks native date controls for iOS sizing rules', () => {
    render(<DatePicker label="Preferred date" />)

    const input = screen.getByLabelText('Preferred date')
    expect(input).toHaveAttribute('type', 'date')
    expect(input).toHaveAttribute('data-native-date-time', 'true')
    expect(input).toHaveClass('min-w-0')
    expect(input).toHaveClass('max-w-full')
  })

  it('marks native date time controls for iOS sizing rules', () => {
    render(<DatePicker label="Arrival" showTime />)

    const input = screen.getByLabelText('Arrival')
    expect(input).toHaveAttribute('type', 'datetime-local')
    expect(input).toHaveAttribute('data-native-date-time', 'true')
    expect(input).toHaveClass('appearance-none')
  })
})

describe('TimePicker', () => {
  it('marks native time controls for iOS sizing rules', () => {
    render(<TimePicker label="Start time" />)

    const input = screen.getByLabelText('Start time')
    expect(input).toHaveAttribute('type', 'time')
    expect(input).toHaveAttribute('data-native-date-time', 'true')
    expect(input).toHaveClass('min-w-0')
  })
})
