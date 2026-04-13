import { getDefaultHeaderImage, getPageHeaderImage } from '@/lib/page-header-images'

describe('page-header-images', () => {
  it('resolves exact route image metadata', () => {
    const image = getPageHeaderImage('/find-us')

    expect(image).not.toBeNull()
    expect(image?.resolution).toBe('exact')
    expect(image?.resolvedFromRoute).toBe('/find-us')
    expect(image?.resolvedFromFolder).toBe('find-us')
  })

  it('resolves alias route image metadata', () => {
    const image = getPageHeaderImage('/heathrow-parking')

    expect(image).not.toBeNull()
    expect(image?.resolution).toBe('alias')
    expect(image?.resolvedFromRoute).toBe('/heathrow-parking')
    expect(image?.resolvedFromFolder).toBe('parking-near-heathrow')
  })

  it('resolves parent inheritance metadata', () => {
    const image = getPageHeaderImage('/private-hire/wakes')

    expect(image).not.toBeNull()
    expect(image?.resolution).toBe('inherited')
    expect(image?.resolvedFromRoute).toBe('/private-hire')
    expect(image?.resolvedFromFolder).toBe('private-hire')
  })

  it('returns null for unknown routes with no direct/alias/parent image', () => {
    const image = getPageHeaderImage('/__hero-audit-nonexistent-route__')
    expect(image).toBeNull()
  })

  it('returns explicit default metadata', () => {
    const image = getDefaultHeaderImage('/sample-route')

    expect(image.resolution).toBe('default')
    expect(image.requestedRoute).toBe('/sample-route')
    expect(image.resolvedFromRoute).toBe('/')
    expect(image.resolvedFromFolder).toBe('home')
  })
})
