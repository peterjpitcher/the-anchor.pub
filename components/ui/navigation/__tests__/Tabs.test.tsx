import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../Tabs'

describe('Tabs', () => {
  const TestTabs = () => (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3" disabled>Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Content 1</TabsContent>
      <TabsContent value="tab2">Content 2</TabsContent>
      <TabsContent value="tab3">Content 3</TabsContent>
    </Tabs>
  )

  it('renders tabs correctly', () => {
    render(<TestTabs />)
    
    expect(screen.getByText('Tab 1')).toBeInTheDocument()
    expect(screen.getByText('Tab 2')).toBeInTheDocument()
    expect(screen.getByText('Tab 3')).toBeInTheDocument()
    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument()
  })

  it('switches tabs on click', async () => {
    render(<TestTabs />)
    
    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument()

    await userEvent.click(screen.getByText('Tab 2'))

    expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
    expect(screen.getByText('Content 2')).toBeInTheDocument()
  })

  it('handles disabled tabs', async () => {
    render(<TestTabs />)
    
    const disabledTab = screen.getByText('Tab 3')
    expect(disabledTab).toBeDisabled()

    await userEvent.click(disabledTab)
    expect(screen.queryByText('Content 3')).not.toBeInTheDocument()
  })

  it('applies active state correctly', () => {
    render(<TestTabs />)
    
    const tab1 = screen.getByText('Tab 1')
    const tab2 = screen.getByText('Tab 2')

    expect(tab1).toHaveAttribute('aria-selected', 'true')
    expect(tab1).toHaveAttribute('data-state', 'active')
    expect(tab2).toHaveAttribute('aria-selected', 'false')
    expect(tab2).toHaveAttribute('data-state', 'inactive')
  })

  it('handles controlled tabs', async () => {
    const handleChange = jest.fn()
    
    const ControlledTabs = () => {
      const [value, setValue] = React.useState('tab1')
      
      return (
        <Tabs 
          value={value} 
          onValueChange={(newValue) => {
            setValue(newValue)
            handleChange(newValue)
          }}
        >
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )
    }

    render(<ControlledTabs />)
    
    await userEvent.click(screen.getByText('Tab 2'))
    expect(handleChange).toHaveBeenCalledWith('tab2')
  })

  it('applies variant styles correctly', () => {
    const { rerender } = render(
      <Tabs variant="line">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    )

    expect(screen.getByRole('tablist')).toHaveClass('border-b')

    rerender(
      <Tabs variant="enclosed">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    )

    expect(screen.getByRole('tablist')).toHaveClass('bg-anchor-green-card')

    rerender(
      <Tabs variant="pills">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    )

    expect(screen.getByRole('tablist')).toHaveClass('gap-2')
  })

  it('supports vertical orientation', () => {
    render(
      <Tabs orientation="vertical">
        <TabsList orientation="vertical">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    )

    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical')
    expect(screen.getByRole('tablist')).toHaveClass('flex-col')
  })

  it('handles size prop', () => {
    render(
      <Tabs size="sm">
        <TabsList>
          <TabsTrigger value="tab1">Small Tab</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    )

    expect(screen.getByText('Small Tab')).toHaveClass('text-sm')
  })

  it('provides accessible markup', () => {
    render(<TestTabs />)

    const tablist = screen.getByRole('tablist')
    const tabs = screen.getAllByRole('tab')
    const tabpanels = screen.getAllByRole('tabpanel')

    expect(tablist).toBeInTheDocument()
    expect(tabs).toHaveLength(3)
    expect(tabpanels).toHaveLength(1) // Only active panel is rendered

    expect(tabs[0]).toHaveAttribute('aria-controls', 'tabpanel-tab1')
    expect(tabpanels[0]).toHaveAttribute('id', 'tabpanel-tab1')
  })
})
