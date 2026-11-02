import { expect, test } from '@playwright/test'

const shopA = {
  id: 'shop-a',
  name: 'Shop A',
  address: 'A Street',
  city: 'Bengaluru',
  latitude: 12.98,
  longitude: 77.6,
  bwPrice: 2,
  colorPrice: 5,
  availability: 'available',
  ratingAverage: null,
  ratingCount: 0,
  distance: 0,
}

const shopB = { ...shopA, id: 'shop-b', name: 'Shop B', latitude: 13.0827, longitude: 80.2707 }
const quickPrintHub = { ...shopA, id: 'quick-print-hub', name: 'QuickPrint Hub Updated' }

const responseFor = (shops, radius = 5, mode = 'nearby') => ({
  status: 'success',
  count: shops.length,
  mode,
  ...(mode === 'nearby' ? { radius } : {}),
  shops,
})

const mockPlaces = async (page, places = []) => {
  await page.route('https://nominatim.openstreetmap.org/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(places),
  }))
}

const mockNearbyApi = async (page, handler) => {
  await page.route('**/api/shops/nearby*', (route) => handler(route))
}

const query = (route) => new URL(route.request().url()).searchParams

const waitForNearbyResult = async (page, name) => {
  await expect(page.getByRole('heading', { name: /result found|results found/ })).toBeVisible()
  await expect(page.getByRole('heading', { name })).toBeVisible()
}

test.beforeEach(async ({ page }) => {
  await mockPlaces(page)
  await mockNearbyApi(page, (route) => {
    const params = query(route)
    const mode = params.get('mode') || 'nearby'
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responseFor([quickPrintHub], Number(params.get('radius')) || 5, mode)),
    })
  })
})

test('nearby initial load waits for valid location and shows a registered shop', async ({ page }) => {
  const requests = []
  page.on('request', (request) => {
    if (request.url().includes('/api/shops/nearby')) requests.push(request.url())
  })

  await page.goto('/shops')
  await expect(page.getByText('Location permission needed')).toBeVisible()
  expect(requests).toHaveLength(0)
  await expect(page.getByPlaceholder('Enter area, town, city or PIN code')).toHaveCount(0)

  await page.getByRole('button', { name: 'Use Current Location' }).click()
  await expect(page.getByText('Location ready')).toBeVisible()
  await expect.poll(() => requests.length).toBeGreaterThan(0)
  expect(new URL(requests[0]).searchParams.get('latitude')).toBe('12.98')
  expect(new URL(requests[0]).searchParams.get('longitude')).toBe('77.6')
  await expect(page.locator('.shop-map')).toHaveAttribute('data-center-latitude', '12.98')
  await expect(page.locator('.shop-map')).toHaveAttribute('data-center-longitude', '77.6')
  await expect(page.locator('.shop-map').locator('..')).toHaveAttribute('data-user-latitude', '12.98')
  await expect(page.locator('.shop-map').locator('..')).toHaveAttribute('data-user-longitude', '77.6')
  await expect(page.getByText('Current location:')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'QuickPrint Hub Updated' })).toBeVisible()
})

test('refresh shows location loading, then searches again with valid results', async ({ page }) => {
  const requests = []
  page.on('request', (request) => {
    if (request.url().includes('/api/shops/nearby')) requests.push(request.url())
  })
  await mockNearbyApi(page, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 150))
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(responseFor([shopA])) })
  })

  await page.goto('/shops')
  await page.getByRole('button', { name: 'Use Current Location' }).click()
  await expect(page.getByRole('heading', { name: 'Shop A' })).toBeVisible()
  await page.evaluate(() => {
    const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation)
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (success, error, options) => setTimeout(() => originalGetCurrentPosition(success, error, options), 300),
      },
    })
  })
  await page.getByRole('button', { name: 'Refresh location' }).click()
  await expect.poll(() => requests.length).toBe(2)
  await expect(page.getByText('Location ready')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Shop A' })).toBeVisible()
})

test('location failure shows an error and makes no nearby request', async ({ page }) => {
  const requests = []
  page.on('request', (request) => {
    if (request.url().includes('/api/shops/nearby')) requests.push(request.url())
  })
  await page.goto('/shops')
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition: (_success, error) => error({ code: 2 }) },
    })
  })
  await page.getByRole('button', { name: 'Use Current Location' }).click()
  await expect(page.getByText('Unable to get your location. Please check GPS/location settings and try again.')).toBeVisible()
  await expect(page.getByText('0 results found')).toHaveCount(0)
  expect(requests).toHaveLength(0)
})

test('permission denied does not retry, shows a useful error and waits for GPS retry', async ({ page }) => {
  const requests = []
  page.on('request', (request) => {
    if (request.url().includes('/api/shops/nearby')) requests.push(request.url())
  })
  await page.goto('/shops')
  await page.evaluate(() => {
    window.__geolocationCalls = 0
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (_success, error) => {
          window.__geolocationCalls += 1
          error({ code: 1 })
        },
      },
    })
  })
  await page.getByRole('button', { name: 'Use Current Location' }).click()
  await expect(page.getByText('Location permission is blocked. Please enable location access in your browser/device settings.')).toBeVisible()
  const geolocationCalls = await page.evaluate(() => window.__geolocationCalls)
  expect(geolocationCalls).toBe(1)
  expect(requests).toHaveLength(0)
  await expect(page.getByRole('button', { name: 'Retry location' }).first()).toBeVisible()
})

test('location timeout retries with lower accuracy and the map stays centered on the detected coordinates', async ({ page }) => {
  const requests = []
  await mockNearbyApi(page, async (route) => {
    requests.push(query(route))
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(responseFor([shopA, shopB])) })
  })
  await page.goto('/shops')
  await page.evaluate(() => {
    window.__geolocationOptions = []
    window.__geolocationCalls = 0
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (success, error, options) => {
          window.__geolocationOptions.push(options)
          window.__geolocationCalls += 1
          if (window.__geolocationCalls === 1) error({ code: 3 })
          else success({ coords: { latitude: 12.98, longitude: 77.6, accuracy: 18 } })
        },
      },
    })
  })
  await page.getByRole('button', { name: 'Use Current Location' }).click()
  await expect(page.getByText('Location ready')).toBeVisible()
  await expect.poll(() => page.evaluate(() => window.__geolocationOptions.length)).toBe(2)
  expect(await page.evaluate(() => window.__geolocationOptions.map(({ enableHighAccuracy, maximumAge }) => ({ enableHighAccuracy, maximumAge })))).toEqual([
    { enableHighAccuracy: true, maximumAge: 0 },
    { enableHighAccuracy: false, maximumAge: 0 },
  ])
  await expect.poll(() => requests.length).toBeGreaterThan(0)
  expect(requests[0].get('latitude')).toBe('12.98')
  expect(requests[0].get('longitude')).toBe('77.6')
  await expect(page.locator('.shop-map')).toHaveAttribute('data-center-latitude', '12.98')
  await expect(page.locator('.shop-map')).toHaveAttribute('data-center-longitude', '77.6')

  await page.locator('.nearby-shop-card').filter({ hasText: 'Shop B' }).click()
  await expect(page.locator('.shop-map')).toHaveAttribute('data-center-latitude', '12.98')
  await expect(page.locator('.shop-map')).toHaveAttribute('data-center-longitude', '77.6')
})

test('external places outside the selected radius are filtered by distance', async ({ page }) => {
  await mockPlaces(page, [
    {
      place_id: 1,
      name: 'Nearby Copy Center',
      display_name: 'Nearby Copy Center, Bengaluru',
      lat: '12.98',
      lon: '77.605',
      address: { city: 'Bengaluru' },
      type: 'copy shop',
    },
    {
      place_id: 2,
      name: 'Distant Copy Center',
      display_name: 'Distant Copy Center, Bengaluru',
      lat: '12.98',
      lon: '77.7',
      address: { city: 'Bengaluru' },
      type: 'copy shop',
    },
  ])
  await page.goto('/shops')
  await page.getByRole('button', { name: 'Use Current Location' }).click()
  await expect(page.getByRole('heading', { name: 'Nearby Copy Center' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Distant Copy Center' })).toHaveCount(0)
})

test('refresh discards stale coordinates before the new nearby search', async ({ page, context }) => {
  const requests = []
  await mockNearbyApi(page, async (route) => {
    requests.push(query(route))
    const latitude = query(route).get('latitude')
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(responseFor(latitude === '12.98' ? [shopA] : [shopB])) })
  })
  await page.goto('/shops')
  await page.getByRole('button', { name: 'Use Current Location' }).click()
  await expect(page.getByRole('heading', { name: 'Shop A' })).toBeVisible()
  await context.setGeolocation({ latitude: 13.0827, longitude: 80.2707 })
  await page.getByRole('button', { name: 'Refresh location' }).click()
  await expect(page.getByRole('heading', { name: 'Shop B' })).toBeVisible()
  expect(requests.at(-1).get('latitude')).toBe('13.0827')
  expect(requests.at(-1).get('longitude')).toBe('80.2707')
  await expect(page.locator('.shop-map')).toHaveAttribute('data-center-latitude', '13.0827')
  await expect(page.locator('.shop-map')).toHaveAttribute('data-center-longitude', '80.2707')
  expect(await page.getByRole('heading', { name: 'Shop A' }).count()).toBe(0)
})

test('a delayed old response cannot overwrite the latest location result', async ({ page, context }) => {
  let requestCount = 0
  await mockNearbyApi(page, async (route) => {
    requestCount += 1
    if (requestCount === 1) {
      await new Promise((resolve) => setTimeout(resolve, 700))
      try {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(responseFor([shopA])) })
      } catch {
        return
      }
      return
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(responseFor([shopB])) })
  })
  await page.goto('/shops')
  await page.getByRole('button', { name: 'Use Current Location' }).click()
  await expect.poll(() => requestCount).toBe(1)
  await context.setGeolocation({ latitude: 13.0827, longitude: 80.2707 })
  await page.getByRole('button', { name: 'Refresh location' }).click()
  await expect(page.getByRole('heading', { name: 'Shop B' })).toBeVisible()
  await page.waitForTimeout(800)
  await expect(page.getByRole('heading', { name: 'Shop B' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Shop A' })).toHaveCount(0)
})

test('radius change searches with latest coordinates and only then shows zero results', async ({ page }) => {
  const requests = []
  await mockNearbyApi(page, async (route) => {
    requests.push(query(route))
    await new Promise((resolve) => setTimeout(resolve, 150))
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(responseFor([], Number(query(route).get('radius')))) })
  })
  await page.goto('/shops')
  await page.getByRole('button', { name: 'Use Current Location' }).click()
  await expect(page.getByText('Searching nearby shops...')).toBeVisible()
  await expect(page.getByText('No nearby print shops were found within 5 km. Try a wider radius.')).toBeVisible()
  await page.getByLabel('Search radius').selectOption('10')
  await expect(page.getByText('Searching nearby shops...')).toBeVisible()
  await expect.poll(() => requests.length).toBe(2)
  expect(requests.at(-1).get('radius')).toBe('10')
  expect(requests.at(-1).get('latitude')).toBe('12.98')
  expect(requests.at(-1).get('longitude')).toBe('77.6')
  await expect(page.getByText('No nearby print shops were found within 10 km. Try a wider radius.')).toBeVisible()
})

test('nearby API failure shows an API error instead of zero results', async ({ page }) => {
  await mockNearbyApi(page, (route) => route.fulfill({
    status: 503,
    contentType: 'application/json',
    body: JSON.stringify({ message: 'Service unavailable' }),
  }))
  await page.goto('/shops')
  await page.getByRole('button', { name: 'Use Current Location' }).click()
  await expect(page.getByText('Unable to load nearby shops. Please try again.')).toBeVisible()
  await expect(page.getByText('0 results found')).toHaveCount(0)
})

test('All Shops loads approved shops without requesting geolocation', async ({ page }) => {
  await page.goto('/shops')
  await page.evaluate(() => {
    window.__geolocationCalls = 0
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition: () => { window.__geolocationCalls += 1 } },
    })
  })
  await page.getByLabel('Search radius').selectOption('all')
  await waitForNearbyResult(page, 'QuickPrint Hub Updated')
  await expect(page.getByText('All approved registered shops')).toBeVisible()
  expect(await page.evaluate(() => window.__geolocationCalls)).toBe(0)
})

test('All Shops does not display a missing distance as zero kilometers', async ({ page }) => {
  await mockNearbyApi(page, (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(responseFor([{ ...quickPrintHub, distance: null }], 5, 'all')),
  }))
  await page.goto('/shops')
  await page.getByLabel('Search radius').selectOption('all')
  await waitForNearbyResult(page, 'QuickPrint Hub Updated')
  await expect(page.getByText('Distance unavailable')).toBeVisible()
  await expect(page.getByText('0.00 km away')).toHaveCount(0)
})

test('comparison marks missing distance unavailable instead of nearest at zero', async ({ page }) => {
  await mockNearbyApi(page, (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(responseFor([
      { ...quickPrintHub, distance: null },
      { ...quickPrintHub, id: 'second-shop', name: 'Second Shop', distance: null },
    ], 5, 'all')),
  }))
  await page.goto('/shops')
  await page.getByLabel('Search radius').selectOption('all')
  await waitForNearbyResult(page, 'QuickPrint Hub Updated')
  const compareCheckboxes = page.getByRole('checkbox', { name: 'Compare' })
  await compareCheckboxes.nth(0).check()
  await compareCheckboxes.nth(1).check()
  await page.getByRole('button', { name: 'Compare Selected' }).click()

  await expect(page.getByRole('cell', { name: 'Unavailable' })).toHaveCount(2)
  await expect(page.getByText('0.00 km', { exact: true })).toHaveCount(0)
  await expect(page.getByText(/nearest shop/)).toHaveCount(0)
})

test('valid coordinates with no approved shop show zero results after a successful response', async ({ page }) => {
  let responseCompleted = false
  await mockNearbyApi(page, async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(responseFor([])) })
    responseCompleted = true
  })
  await page.goto('/shops')
  await page.getByRole('button', { name: 'Use Current Location' }).click()
  await expect.poll(() => responseCompleted).toBe(true)
  await expect(page.getByText('No nearby print shops were found within 5 km. Try a wider radius.')).toBeVisible()
})