import { test, expect } from '@playwright/test'

// Visual smoke for long-word locales. Asserts no horizontal overflow,
// no clipped text, and main content fits the viewport on desktop.

const LONG_WORD_LOCALES = ['fi', 'de'] as const
const PAGES = ['/', '/frame-studio'] as const

test.describe('Visual smoke for long-word locales', () => {
  for (const locale of LONG_WORD_LOCALES) {
    for (const path of PAGES) {
      test(`${locale}${path} — no overflow or clipping`, async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 })
        await page.goto(`/${locale}${path}`)
        await page.waitForLoadState('networkidle')

        // Elements with horizontal overflow (excluding those with overflow:visible)
        const horizontalOverflow = await page.evaluate(() => {
          const all = Array.from(document.querySelectorAll('*'))
          return all.filter((el) => {
            const cs = getComputedStyle(el)
            return el.scrollWidth > el.clientWidth + 1 && cs.overflow !== 'visible'
          }).length
        })
        expect(horizontalOverflow, `${locale}${path} should not have many horizontally overflowing elements`).toBeLessThan(3)

        // Body should not exceed viewport width
        const bodyOverflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth + 1)
        expect(bodyOverflow, `${locale}${path} body should not horizontally overflow viewport`).toBe(false)

        // No h1/h2 heading should be visually clipped
        const headingClipped = await page.evaluate(() => {
          const headings = Array.from(document.querySelectorAll('h1, h2'))
          return headings.filter((h) => {
            const cs = getComputedStyle(h)
            return cs.textOverflow === 'ellipsis' && (h as HTMLElement).offsetWidth < h.scrollWidth
          }).length
        })
        expect(headingClipped, `${locale}${path} should not clip h1/h2 headings`).toBe(0)
      })
    }
  }
})
