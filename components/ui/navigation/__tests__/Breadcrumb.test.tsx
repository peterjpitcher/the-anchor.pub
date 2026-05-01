import { render, screen } from '@testing-library/react'
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbSeparator, 
  BreadcrumbPage 
} from '../Breadcrumb'

describe('Breadcrumb', () => {
  const defaultItems = [
    { label: 'Products', href: '/products' },
    { label: 'Electronics', href: '/products/electronics' },
    { label: 'Laptops', current: true }
  ]

  it('renders breadcrumb items correctly', () => {
    render(<Breadcrumb items={defaultItems} />)
    
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Electronics')).toBeInTheDocument()
    expect(screen.getByText('Laptops')).toBeInTheDocument()
  })

  it('renders links for non-current items', () => {
    render(<Breadcrumb items={defaultItems} />)
    
    const homeLink = screen.getByText('Home')
    const productsLink = screen.getByText('Products')
    const laptopsText = screen.getByText('Laptops')

    expect(homeLink.closest('a')).toHaveAttribute('href', '/')
    expect(productsLink.closest('a')).toHaveAttribute('href', '/products')
    expect(laptopsText.closest('a')).not.toBeInTheDocument()
  })

  it('marks last item as current by default', () => {
    const items = [
      { label: 'Products', href: '/products' },
      { label: 'Electronics', href: '/electronics' }
    ]
    
    render(<Breadcrumb items={items} />)
    
    const electronics = screen.getByText('Electronics')
    expect(electronics).toHaveAttribute('aria-current', 'page')
    expect(electronics).toHaveClass('text-anchor-gold-vivid', 'font-semibold')
  })

  it('respects explicit current item', () => {
    const items = [
      { label: 'Products', href: '/products' },
      { label: 'Electronics', href: '/electronics', current: true },
      { label: 'Laptops', href: '/laptops' }
    ]
    
    render(<Breadcrumb items={items} />)
    
    const electronics = screen.getByText('Electronics')
    const laptops = screen.getByText('Laptops')

    expect(electronics).toHaveAttribute('aria-current', 'page')
    expect(laptops).not.toHaveAttribute('aria-current')
  })

  it('hides home link when showHome is false', () => {
    render(<Breadcrumb items={defaultItems} showHome={false} />)
    
    expect(screen.queryByText('Home')).not.toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
  })

  it('uses custom home label', () => {
    render(<Breadcrumb items={defaultItems} homeLabel="Dashboard" />)
    
    expect(screen.queryByText('Home')).not.toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('uses custom separator', () => {
    render(<Breadcrumb items={defaultItems} separator=">" />)
    
    const separators = screen.getAllByText('>')
    expect(separators.length).toBeGreaterThan(0)
  })

  it('has accessible navigation markup', () => {
    render(<Breadcrumb items={defaultItems} />)
    
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(nav).toBeInTheDocument()

    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()

    const listItems = screen.getAllByRole('listitem')
    expect(listItems.length).toBe(4) // Home + 3 items
  })
})

describe('Breadcrumb composition API', () => {
  it('renders with composition components', () => {
    render(
      <nav aria-label="Breadcrumb">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">Products</BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>Current Page</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </nav>
    )

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Current Page')).toBeInTheDocument()
  })

  it('BreadcrumbLink renders as Next Link', () => {
    render(<BreadcrumbLink href="/test">Test Link</BreadcrumbLink>)
    
    const link = screen.getByText('Test Link')
    expect(link.closest('a')).toHaveAttribute('href', '/test')
    expect(link).toHaveClass('text-anchor-cream-text/60', 'hover:text-anchor-gold')
  })

  it('BreadcrumbPage has current page styling', () => {
    render(<BreadcrumbPage>Current</BreadcrumbPage>)
    
    const page = screen.getByText('Current')
    expect(page).toHaveAttribute('aria-current', 'page')
    expect(page).toHaveClass('text-anchor-gold-vivid', 'font-semibold')
  })

  it('BreadcrumbSeparator renders default separator', () => {
    render(<BreadcrumbSeparator />)
    expect(screen.getByText('/')).toBeInTheDocument()
  })

  it('BreadcrumbSeparator accepts custom separator', () => {
    render(<BreadcrumbSeparator>→</BreadcrumbSeparator>)
    expect(screen.getByText('→')).toBeInTheDocument()
  })

  it('applies custom classNames', () => {
    render(
      <>
        <BreadcrumbList className="custom-list">List</BreadcrumbList>
        <BreadcrumbItem className="custom-item">Item</BreadcrumbItem>
        <BreadcrumbLink href="/" className="custom-link">Link</BreadcrumbLink>
        <BreadcrumbPage className="custom-page">Page</BreadcrumbPage>
      </>
    )

    expect(screen.getByText('List')).toHaveClass('custom-list')
    expect(screen.getByText('Item')).toHaveClass('custom-item')
    expect(screen.getByText('Link')).toHaveClass('custom-link')
    expect(screen.getByText('Page')).toHaveClass('custom-page')
  })
})
