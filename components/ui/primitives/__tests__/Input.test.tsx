import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input, Textarea } from '../Input'

describe('Input', () => {
  it('renders input element', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<Input label="Email" placeholder="Enter email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('renders the canonical control styling', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-line-strong')
    expect(input).toHaveClass('bg-surface')
    expect(input).toHaveClass('rounded-sm')
  })

  it('applies the invalid border when invalid', () => {
    render(<Input invalid />)
    expect(screen.getByRole('textbox')).toHaveClass('border-anchor-danger')
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('treats the legacy variant and size props as no-ops', () => {
    const { rerender } = render(<Input variant="error" size="sm" />)
    // Deprecated visual props no longer change the rendered style.
    expect(screen.getByRole('textbox')).toHaveClass('border-line-strong')
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid')

    rerender(<Input size="lg" />)
    expect(screen.getByRole('textbox')).toHaveClass('border-line-strong')
  })

  it('shows error message via the legacy error string alias', () => {
    render(<Input label="Username" error="Username is required" />)
    expect(screen.getByText('Username is required')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Username is required')).toHaveClass('text-anchor-danger')
  })

  it('shows hint text (and supports the helperText alias)', () => {
    const { rerender } = render(<Input label="Password" hint="Must be 8 characters" />)
    expect(screen.getByText('Must be 8 characters')).toBeInTheDocument()

    rerender(<Input label="Password" helperText="Legacy helper" />)
    expect(screen.getByText('Legacy helper')).toBeInTheDocument()
  })

  it('renders with left icon', () => {
    const icon = <span data-testid="search-icon">🔍</span>
    render(<Input leftIcon={icon} />)
    expect(screen.getByTestId('search-icon')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveClass('pl-10')
  })

  it('renders with right icon', () => {
    const icon = <span data-testid="currency">USD</span>
    render(<Input rightIcon={icon} />)
    expect(screen.getByTestId('currency')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveClass('pr-10')
  })

  it('handles user input', async () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'Hello')
    
    expect(handleChange).toHaveBeenCalledTimes(5)
    expect(input).toHaveValue('Hello')
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<Input ref={ref} />)
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement))
  })

  it('generates id from label when not provided', () => {
    render(<Input label="Email Address" />)
    const input = screen.getByLabelText('Email Address')
    expect(input).toHaveAttribute('id', 'email-address')
  })

  it('uses provided id over generated one', () => {
    render(<Input label="Email" id="custom-email" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('id', 'custom-email')
  })

  it('links the hint with aria-describedby', () => {
    render(<Input label="Email" error="Invalid email" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('aria-describedby', 'email-hint')
  })

  it('disables input when disabled prop is true', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('marks native date and time controls for iOS sizing rules', () => {
    const { rerender } = render(<Input label="Date" type="date" />)
    expect(screen.getByLabelText('Date')).toHaveAttribute('data-native-date-time', 'true')
    expect(screen.getByLabelText('Date')).toHaveClass('appearance-none')

    rerender(<Input label="Preferred Time" type="time" />)
    expect(screen.getByLabelText('Preferred Time')).toHaveAttribute('data-native-date-time', 'true')
    expect(screen.getByLabelText('Preferred Time')).toHaveClass('text-left')
  })

  it('does not mark ordinary text controls as native date and time controls', () => {
    render(<Input label="Name" />)
    expect(screen.getByLabelText('Name')).not.toHaveAttribute('data-native-date-time')
  })
})

describe('Textarea', () => {
  it('renders textarea element', () => {
    render(<Textarea placeholder="Enter message" />)
    expect(screen.getByPlaceholderText('Enter message')).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<Textarea label="Message" />)
    expect(screen.getByLabelText('Message')).toBeInTheDocument()
  })

  it('has default rows', () => {
    render(<Textarea />)
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '4')
  })

  it('accepts custom rows', () => {
    render(<Textarea rows={10} />)
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '10')
  })

  it('shows error message', () => {
    render(<Textarea label="Comments" error="Comments are required" />)
    expect(screen.getByText('Comments are required')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('shows helper text', () => {
    render(<Textarea helperText="Max 500 characters" />)
    expect(screen.getByText('Max 500 characters')).toBeInTheDocument()
  })

  it('has resize class', () => {
    render(<Textarea />)
    expect(screen.getByRole('textbox')).toHaveClass('resize-y')
  })

  it('handles user input', async () => {
    const handleChange = jest.fn()
    render(<Textarea onChange={handleChange} />)
    
    const textarea = screen.getByRole('textbox')
    await userEvent.type(textarea, 'Hello World')
    
    expect(handleChange).toHaveBeenCalled()
    expect(textarea).toHaveValue('Hello World')
  })
})
