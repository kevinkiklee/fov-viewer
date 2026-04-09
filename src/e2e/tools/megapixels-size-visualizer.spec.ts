import { test, expect } from '@playwright/test'

const URL = '/en/megapixel-visualizer'

test.describe('Megapixel Size Visualizer', () => {
  test('page renders without errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto(URL)
    await expect(page.locator('h1')).toBeAttached()
    await expect(page.locator('h2').first()).toBeVisible()

    const critical = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('cookieyes') &&
      !e.includes('adsbygoogle') &&
      !e.includes('_vercel/speed-insights'),
    )
    expect(critical).toEqual([])
  })

  test('default mode is overlay and canvas is present', async ({ page }) => {
    await page.goto(URL)
    const canvas = page.locator('canvas[role="img"]').first()
    await expect(canvas).toBeVisible()
  })

  test('toggling an MP updates the URL', async ({ page }) => {
    await page.goto(URL)
    const checkbox = page.locator('[data-testid="mp-toggle-mp_45"]')
    await expect(checkbox).toBeChecked()
    await checkbox.uncheck()
    await expect(page).toHaveURL(/show=/)
  })

  test('adding a custom MP persists it in the checkbox list', async ({ page }) => {
    await page.goto(URL)
    await page.locator('[data-testid="custom-mp-name"]').first().fill('MyCam')
    await page.locator('[data-testid="custom-mp-value"]').first().fill('75')
    await page.locator('[data-testid="custom-mp-add"]').first().click()
    await expect(page.getByText(/MyCam/).first()).toBeVisible()
  })
})
