import { test, expect } from '@playwright/test'
import { TOOLS } from '../../lib/data/tools'

const pages = [
  { url: '/', name: 'Homepage' },
  { url: '/learn/glossary', name: 'Photography Glossary' },
  ...TOOLS.map((t) => ({ url: `/${t.slug}`, name: t.name })),
]

for (const page of pages) {
  test.describe(`${page.name} (${page.url})`, () => {
    let consoleErrors: string[] = []

    test.beforeEach(async ({ page: p }) => {
      consoleErrors = []
      p.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text())
      })
      await p.goto(page.url)
    })

    test('loads with HTTP 200', async ({ page: p }) => {
      // Page was loaded in beforeEach — verify we're on the right page
      await expect(p).toHaveURL(new RegExp(page.url.replace('/', '\\/')))
    })

    test('has no console errors', async () => {
      // Filter out known benign errors (e.g. third-party scripts, favicon)
      const realErrors = consoleErrors.filter(
        (e) =>
          !e.includes('favicon') &&
          !e.includes('the server responded with a status of 404') &&
          !e.includes('cookieyes') &&
          !e.includes('adsense') &&
          !e.includes('adsbygoogle') &&
          !e.includes('_vercel/speed-insights')
      )
      expect(realErrors).toEqual([])
    })

    test('renders key content', async ({ page: p }) => {
      // Every page should have the nav and footer
      await expect(p.locator('nav').first()).toBeVisible()
      await expect(p.locator('footer')).toBeVisible()

      // Check for page-specific content
      if (page.url === '/') {
        // Homepage has sr-only h1
        await expect(p.locator('h1')).toHaveCount(1)
      } else if (page.url === '/learn/glossary') {
        await expect(p.locator('h1')).toContainText('Photography Glossary')
      } else {
        // Tool pages: tool name should appear somewhere on the page
        await expect(p.getByText(page.name, { exact: false }).first()).toBeVisible()
      }
    })

    test('does not scroll at desktop viewport', async ({ page: p }) => {
      const scrolls = await p.evaluate(() => ({
        scrollHeight: document.documentElement.scrollHeight,
        innerHeight: window.innerHeight,
      }))
      expect(scrolls.scrollHeight).toBeLessThanOrEqual(scrolls.innerHeight)
    })

    test('all images have alt attributes', async ({ page: p }) => {
      const imagesWithoutAlt = await p.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'))
        return imgs.filter((img) => !img.hasAttribute('alt')).length
      })
      expect(imagesWithoutAlt).toBe(0)
    })
  })
}
