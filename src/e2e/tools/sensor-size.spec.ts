import { test, expect } from '@playwright/test'

test.describe('Sensor Size Comparison', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sensor-size-comparison')
  })

  // Scope to desktop sidebar to avoid mobile duplicates
  function sidebar(page: import('@playwright/test').Page) {
    return page.locator('[class*="sidebar"]').first()
  }

  test('sensor checkbox toggles', async ({ page }) => {
    const canvas = page.locator('canvas[aria-label^="Sensor size comparison"]')
    await expect(canvas).toBeVisible()

    // Wait for sidebar content to be interactive
    const panel = sidebar(page)
    const ffLabel = panel.locator('label').filter({ hasText: 'Full Frame' }).first()
    await expect(ffLabel).toBeVisible()

    const before = await canvas.screenshot()

    // Click the "Full Frame" label to uncheck (input is hidden, label toggles it)
    await ffLabel.click()
    await page.waitForTimeout(400)

    const afterUncheck = await canvas.screenshot()
    expect(Buffer.compare(before, afterUncheck)).not.toBe(0)

    // Re-check by clicking label again
    await ffLabel.click()
    await page.waitForTimeout(400)

    const afterRecheck = await canvas.screenshot()
    expect(Buffer.compare(afterUncheck, afterRecheck)).not.toBe(0)
  })

  test('mode toggle changes rendering', async ({ page }) => {
    const canvas = page.locator('canvas[aria-label^="Sensor size comparison"]')

    // Default is Overlay
    await expect(canvas).toHaveAttribute('aria-label', /overlay/)

    // Switch to Side by Side
    await sidebar(page).getByRole('button', { name: 'Side by Side' }).click()
    await expect(canvas).toHaveAttribute('aria-label', /side-by-side/)

    // Switch to Pixel Density
    await sidebar(page).getByRole('button', { name: 'Pixel Density' }).click()
    await expect(canvas).toHaveAttribute('aria-label', /pixel-density/)
  })

  test('custom sensor — add', async ({ page }) => {
    const panel = sidebar(page)

    // Fill in custom sensor form (scoped to sidebar)
    await panel.getByPlaceholder('Name').fill('Custom Test')
    await panel.getByPlaceholder('W (mm)').fill('30')
    await panel.getByPlaceholder('H (mm)').fill('20')
    await panel.getByPlaceholder('Megapixels (optional)').fill('24')

    // Click add
    await panel.getByRole('button', { name: 'Add Sensor' }).click()

    // Custom sensor should appear in the list
    await expect(panel.getByText('Custom Test')).toBeVisible()

    // Should be visible on canvas
    const canvas = page.locator('canvas[aria-label^="Sensor size comparison"]')
    await expect(canvas).toBeVisible()
  })

  test('custom sensor — edit', async ({ page }) => {
    const panel = sidebar(page)

    // First add a custom sensor
    await panel.getByPlaceholder('Name').fill('Edit Me')
    await panel.getByPlaceholder('W (mm)').fill('30')
    await panel.getByPlaceholder('H (mm)').fill('20')
    await panel.getByRole('button', { name: 'Add Sensor' }).click()
    await expect(panel.getByText('Edit Me')).toBeVisible()

    // Click edit button (✎)
    await panel.getByRole('button', { name: '✎' }).click()

    // Edit form should appear — scope to editForm to avoid add form duplicates
    const editForm = panel.locator('[class*="editForm"]')
    await expect(editForm).toBeVisible()
    await editForm.getByPlaceholder('W (mm)').fill('40')

    // Click save
    await editForm.getByRole('button', { name: 'Save' }).click()

    // Sensor should still be in the list
    await expect(panel.getByText('Edit Me')).toBeVisible()
  })

  test('custom sensor — delete', async ({ page }) => {
    const panel = sidebar(page)

    // First add a custom sensor
    await panel.getByPlaceholder('Name').fill('Delete Me')
    await panel.getByPlaceholder('W (mm)').fill('30')
    await panel.getByPlaceholder('H (mm)').fill('20')
    await panel.getByRole('button', { name: 'Add Sensor' }).click()
    await expect(panel.getByText('Delete Me')).toBeVisible()

    // Click remove button (✕)
    await panel.getByRole('button', { name: '✕' }).click()

    // Sensor should be gone
    await expect(panel.getByText('Delete Me')).not.toBeVisible()
  })

  test('URL state persistence', async ({ page }) => {
    // Switch to Side by Side mode
    await sidebar(page).getByRole('button', { name: 'Side by Side' }).click()
    await page.waitForTimeout(300)

    // URL should reflect mode
    const url = page.url()
    expect(url).toContain('mode=side-by-side')

    // Navigate directly to that URL
    await page.goto(url)

    // Mode should be restored
    const canvas = page.locator('canvas[aria-label^="Sensor size comparison"]')
    await expect(canvas).toHaveAttribute('aria-label', /side-by-side/)
  })

  test('localStorage persistence for custom sensors', async ({ page }) => {
    const panel = sidebar(page)

    // Add a custom sensor
    await panel.getByPlaceholder('Name').fill('Persist Me')
    await panel.getByPlaceholder('W (mm)').fill('25')
    await panel.getByPlaceholder('H (mm)').fill('18')
    await panel.getByRole('button', { name: 'Add Sensor' }).click()
    await expect(panel.getByText('Persist Me')).toBeVisible()

    // Verify localStorage was written
    const stored = await page.evaluate(() =>
      localStorage.getItem('phototools:custom-sensors')
    )
    expect(stored).toContain('Persist Me')

    // Reload the page
    await page.reload()

    // Custom sensor should still be present
    await expect(sidebar(page).getByText('Persist Me')).toBeVisible()
  })
})
