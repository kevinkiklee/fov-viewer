import { test, expect } from '@playwright/test'

function sidebar(page: import('@playwright/test').Page) {
  return page.locator('[class*="sidebar"]').first()
}

test.describe('Exposure Simulator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/exposure-simulator')
  })

  test('aperture slider updates display value', async ({ page }) => {
    const panel = sidebar(page)

    // Get the aperture slider (first range input)
    const apertureSlider = panel.locator('input[type="range"]').first()
    const initialValue = await apertureSlider.inputValue()

    // Move aperture slider to index 0 (f/1.4)
    await apertureSlider.fill('0')

    // The label should show f/1.4
    await expect(panel.getByText('f/1.4')).toBeVisible()
    expect(await apertureSlider.inputValue()).not.toBe(initialValue)
  })

  test('shutter speed slider updates display value', async ({ page }) => {
    const panel = sidebar(page)

    // Shutter speed is the second range input
    const shutterSlider = panel.locator('input[type="range"]').nth(1)

    // Move to index 0 (30s — slowest)
    await shutterSlider.fill('0')
    await expect(panel.getByText('30s')).toBeVisible()

    // Move to fastest (index 18 = 1/8000)
    await shutterSlider.fill('18')
    await expect(panel.getByText('1/8000')).toBeVisible()
  })

  test('ISO slider updates display value', async ({ page }) => {
    const panel = sidebar(page)

    // ISO is locked by default — unlock it first by locking aperture instead
    const apertureLockBtn = panel.locator('button[aria-pressed]', { hasText: 'Aperture' }).first()
    await apertureLockBtn.click()

    const isoSlider = panel.locator('input[type="range"]').nth(2)
    await expect(isoSlider).toBeEnabled()

    // Move to highest (index 8 = ISO 25600)
    await isoSlider.fill('8')
    await expect(panel.getByText('25600')).toBeVisible()

    // Move back to low (index 1 = ISO 200)
    await isoSlider.fill('1')
    await expect(panel.getByText('200', { exact: true })).toBeVisible()
  })

  test('exposure value updates when controls change', async ({ page }) => {
    const panel = sidebar(page)

    // Read initial EV
    const evValue = panel.locator('[class*="resultValue"]').first()
    const initial = await evValue.textContent()

    // Change shutter speed (not locked by default) to a very different value
    await panel.locator('input[type="range"]').nth(1).fill('0')
    await page.waitForTimeout(100)

    const updated = await evValue.textContent()
    expect(updated).not.toBe(initial)
  })

  test('lock buttons toggle correctly', async ({ page }) => {
    const panel = sidebar(page)

    // Default lock is ISO
    const isoLockBtn = panel.locator('button[aria-pressed]', { hasText: 'ISO' }).first()
    const apertureLockBtn = panel.locator('button[aria-pressed]', { hasText: 'Aperture' }).first()
    const shutterLockBtn = panel.locator('button[aria-pressed]', { hasText: 'Shutter' }).first()

    await expect(isoLockBtn).toHaveAttribute('aria-pressed', 'true')
    await expect(apertureLockBtn).toHaveAttribute('aria-pressed', 'false')

    // Lock aperture instead
    await apertureLockBtn.click()
    await expect(apertureLockBtn).toHaveAttribute('aria-pressed', 'true')
    await expect(isoLockBtn).toHaveAttribute('aria-pressed', 'false')
    await expect(shutterLockBtn).toHaveAttribute('aria-pressed', 'false')
  })

  test('locked slider is disabled', async ({ page }) => {
    const panel = sidebar(page)

    // Default lock is ISO — ISO slider should be disabled
    const isoSlider = panel.locator('input[type="range"]').nth(2)
    await expect(isoSlider).toBeDisabled()

    // Aperture and shutter sliders should be enabled
    await expect(panel.locator('input[type="range"]').first()).toBeEnabled()
    await expect(panel.locator('input[type="range"]').nth(1)).toBeEnabled()

    // Lock aperture — aperture slider should now be disabled
    const apertureLockBtn = panel.locator('button[aria-pressed]', { hasText: 'Aperture' }).first()
    await apertureLockBtn.click()

    await expect(panel.locator('input[type="range"]').first()).toBeDisabled()
    await expect(isoSlider).toBeEnabled()
  })

  test('effect indicators are displayed', async ({ page }) => {
    const panel = sidebar(page)

    // Should show Depth of Field, Motion, and Noise effect rows
    await expect(panel.getByText('Depth of Field')).toBeVisible()
    await expect(panel.getByText('Motion')).toBeVisible()
    await expect(panel.getByText('Noise')).toBeVisible()
  })

  test('effect labels change with settings', async ({ page }) => {
    const panel = sidebar(page)

    // Set aperture to wide open (f/1.4 — Very Shallow DOF)
    await panel.locator('input[type="range"]').first().fill('0')
    await expect(panel.getByText('Very Shallow')).toBeVisible()

    // Set aperture to narrow (f/22 — Very Deep DOF)
    await panel.locator('input[type="range"]').first().fill('8')
    await expect(panel.getByText('Very Deep')).toBeVisible()
  })

  test('canvas renders (WebGL preview)', async ({ page }) => {
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()
    const box = await canvas.boundingBox()
    expect(box!.width).toBeGreaterThan(0)
    expect(box!.height).toBeGreaterThan(0)
  })

  test('scene selector changes preview', async ({ page }) => {
    const canvas = page.locator('canvas').first()

    // Wait for initial render
    await page.waitForTimeout(500)
    const before = await canvas.screenshot()

    // Click a different scene thumbnail (second one)
    const sceneThumbs = page.locator('[class*="sceneThumb"]')
    const count = await sceneThumbs.count()
    if (count > 1) {
      await sceneThumbs.nth(1).click()
      await page.waitForTimeout(1000) // WebGL needs time to load new scene textures
      const after = await canvas.screenshot()
      expect(Buffer.compare(before, after)).not.toBe(0)
    }
  })

  test('URL state persistence', async ({ page }) => {
    const panel = sidebar(page)

    // Set aperture to f/2 (index 1), lock to shutter
    await panel.locator('input[type="range"]').first().fill('1')
    await panel.locator('button[aria-pressed]', { hasText: 'Shutter' }).first().click()
    await page.waitForTimeout(300)

    const url = page.url()
    expect(url).toContain('ai=1')
    expect(url).toContain('lock=shutter')

    // Navigate to the URL and verify state is restored
    await page.goto(url)
    await page.waitForTimeout(500)

    const restoredPanel = sidebar(page)
    const apertureSlider = restoredPanel.locator('input[type="range"]').first()
    await expect(apertureSlider).toHaveValue('1')

    const shutterLockBtn = restoredPanel.locator('button[aria-pressed]', { hasText: 'Shutter' }).first()
    await expect(shutterLockBtn).toHaveAttribute('aria-pressed', 'true')
  })
})
