/**
 * Stands in for the browser's page reload, which jsdom cannot perform.
 *
 * `setConsentStatus()` in lib/cookies.ts reloads the page when a cookie category is
 * switched off. A suite that withdraws consent calls this once at the top. Without it
 * jsdom logs "Not implemented: navigation" every time.
 *
 * Only `reload` is replaced. Everything else about the address is passed through to the
 * real one, so the cookie clean-up still reads the true host and a test that moves the
 * page with `history.pushState` still sees where it is.
 */
export function standInForPageReload(): jest.Mock {
  const realLocation = window.location
  const reload = jest.fn()

  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: new Proxy({} as Location, {
        get: (_target, property) => {
          if (property === 'reload') return reload
          const value = Reflect.get(realLocation, property)
          // jsdom's own methods refuse to run on anything but the real object.
          return typeof value === 'function' ? value.bind(realLocation) : value
        },
        set: (_target, property, value) => Reflect.set(realLocation, property, value)
      })
    })
  })

  afterAll(() => {
    Object.defineProperty(window, 'location', { configurable: true, enumerable: true, value: realLocation })
  })

  return reload
}
