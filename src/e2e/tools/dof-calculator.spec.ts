import { test, expect } from '@playwright/test'

function sidebar(page: import('@playwright/test').Page) {
  return page.locator('[class*="sidebar"]').first()
}

test.describe('DOF Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dof-calculator')
  })

  test('changing focal length updates results', async ({ page }) => {
    const panel = sidebar(page)

    // Get initial near focus value
    const nearFocus = panel.locator('[class*="resultValue"]').first()
    const initial = await nearFocus.textContent()

    // Change focal length (first select)
    const selects = panel.locator('select')
    await selects.first().selectOption({ index: 5 })

    const updated = await nearFocus.textContent()
    expect(updated).not.toBe(initial)
  })

  test('changing aperture updates depth of field', async ({ page }) => {
    const panel = sidebar(page)

    // Get initial total DoF value (third result card)
    const totalDoF = panel.locator('[class*="resultValue"]').nth(2)
    const initial = await totalDoF.textContent()

    // Change aperture (second select)
    const selects = panel.locator('select')
    await selects.nth(1).selectOption({ index: 0 }) // widest aperture

    const updated = await totalDoF.textContent()
    expect(updated).not.toBe(initial)
  })

  test('scene preset buttons toggle active state', async ({ page }) => {
    // Scene preset buttons live in the canvas topbar, not the sidebar
    const topbar = page.locator('[class*="canvasTopbar"]').first()

    // Click "Landscape" preset
    const landscapeBtn = topbar.locator('button[aria-pressed]', { hasText: 'Landscape' }).first()
    await landscapeBtn.click()
    await expect(landscapeBtn).toHaveAttribute('aria-pressed', 'true')

    // Click "Macro" preset
    const macroBtn = topbar.locator('button[aria-pressed]', { hasText: 'Macro' }).first()
    await macroBtn.click()
    await expect(macroBtn).toHaveAttribute('aria-pressed', 'true')
    await expect(landscapeBtn).toHaveAttribute('aria-pressed', 'false')
  })

  test('results display four metrics', async ({ page }) => {
    const panel = sidebar(page)
    const labels = panel.locator('[class*="resultLabel"]')
    expect(await labels.count()).toBe(4)
  })

  test('canvas is visible with non-zero dimensions', async ({ page }) => {
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()
    const box = await canvas.boundingBox()
    expect(box!.width).toBeGreaterThan(0)
    expect(box!.height).toBeGreaterThan(0)
  })

  test('URL state persistence', async ({ page }) => {
    const panel = sidebar(page)

    // Change focal length and aperture (avoid defaults: fl default=50 idx≈7, f default=2.8 idx=2)
    const selects = panel.locator('select')
    await selects.first().selectOption({ index: 3 })
    await selects.nth(1).selectOption({ index: 3 }) // f/4, not the default f/2.8

    await page.waitForTimeout(300)

    const url = page.url()
    expect(url).toContain('fl=')
    expect(url).toContain('f=')

    // Reload and verify
    const resultBefore = await panel.locator('[class*="resultValue"]').first().textContent()
    await page.goto(url)
    await page.waitForTimeout(300)
    const resultAfter = await sidebar(page).locator('[class*="resultValue"]').first().textContent()
    expect(resultAfter).toBe(resultBefore)
  })
})
