# SEO Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make FOV Viewer discoverable through search engines by adding crawlable static HTML, technical SEO files, structured data, content pages (comparisons + educational articles), embed mode, and performance signals.

**Architecture:** Three-layered approach on static GitHub Pages: (1) crawlable HTML inside `#root` that React replaces on mount, (2) standalone static HTML content pages in `public/` with a shared template, (3) technical SEO signals (structured data, meta tags, robots, sitemap, PWA manifest). No SSR or framework migration.

**Tech Stack:** React 19 + TypeScript + Vite, static HTML files, JSON-LD structured data, inline SVG diagrams, CSS custom properties.

---

## File Structure

```
index.html                          — UPDATE: enhanced meta, static HTML in #root, structured data, preloads, hreflang, manifest link
public/
  robots.txt                        — CREATE: crawler directives
  sitemap.xml                       — CREATE: all pages listed
  manifest.json                     — CREATE: PWA manifest
  icon-192.png                      — CREATE: PWA icon
  icon-512.png                      — CREATE: PWA icon
  404.html                          — UPDATE: proper 404 with navigation
  content-styles.css                — CREATE: shared CSS for all content pages
  compare/
    index.html                      — CREATE: comparison landing index
    24mm-vs-35mm.html               — CREATE
    35mm-vs-50mm.html               — CREATE
    35mm-vs-40mm.html               — CREATE
    40mm-vs-50mm.html               — CREATE
    50mm-vs-85mm.html               — CREATE
    24mm-vs-50mm.html               — CREATE
    85mm-vs-135mm.html              — CREATE
    85mm-vs-200mm.html              — CREATE
    full-frame-vs-apsc.html         — CREATE
    full-frame-vs-m43.html          — CREATE
  learn/
    index.html                      — CREATE: learn articles index
    crop-factor-explained.html      — CREATE
    focal-length-guide.html         — CREATE
    full-frame-vs-apsc.html         — CREATE
    how-to-choose-a-focal-length.html — CREATE
    best-focal-lengths-landscape.html — CREATE
    best-focal-lengths-portrait.html  — CREATE
    best-focal-lengths-street.html    — CREATE
    best-focal-lengths-wildlife.html  — CREATE
    best-focal-lengths-astrophotography.html — CREATE
    understanding-lens-compression.html — CREATE
    equivalent-focal-lengths.html     — CREATE
    wide-angle-vs-telephoto.html      — CREATE
    prime-vs-zoom-lenses.html         — CREATE
src/
  assets/
    landscape-boat-lake.jpg         — RENAME from person.jpg
    portrait-woman.jpg              — RENAME from portrait.jpg
    wildlife-condor.jpg             — RENAME from bird2.jpg
    city-street.jpg                 — RENAME from city.jpg
    milky-way-night-sky.jpg         — RENAME from milkyway.jpg
  data/scenes.ts                    — UPDATE: new filenames
  components/Canvas.tsx             — UPDATE: dynamic aria-label
  components/ActionBar.tsx          — UPDATE: share/embed snippets
  components/ShareModal.tsx         — CREATE: modal for embed/share options
  components/EmbedMode.tsx          — CREATE: canvas-only view for iframes
  hooks/useDynamicMeta.ts           — CREATE: dynamic title/description/OG from state
  App.tsx                           — UPDATE: semantic HTML, embed mode detection, dynamic meta
```

---

### Task 1: Technical SEO Files (robots.txt, sitemap.xml, canonical, hreflang)

**Files:**
- Create: `public/robots.txt`
- Create: `public/sitemap.xml`
- Modify: `index.html`

- [ ] **Step 1: Create `public/robots.txt`**

```
User-agent: *
Allow: /
Sitemap: https://fov-viewer.iser.io/sitemap.xml
```

- [ ] **Step 2: Create `public/sitemap.xml`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://fov-viewer.iser.io/</loc><lastmod>2026-04-02</lastmod><priority>1.0</priority></url>
  <url><loc>https://fov-viewer.iser.io/compare/</loc><lastmod>2026-04-02</lastmod><priority>0.8</priority></url>
  <url><loc>https://fov-viewer.iser.io/compare/24mm-vs-35mm.html</loc><lastmod>2026-04-02</lastmod><priority>0.7</priority></url>
  <url><loc>https://fov-viewer.iser.io/compare/35mm-vs-50mm.html</loc><lastmod>2026-04-02</lastmod><priority>0.7</priority></url>
  <url><loc>https://fov-viewer.iser.io/compare/35mm-vs-40mm.html</loc><lastmod>2026-04-02</lastmod><priority>0.7</priority></url>
  <url><loc>https://fov-viewer.iser.io/compare/40mm-vs-50mm.html</loc><lastmod>2026-04-02</lastmod><priority>0.7</priority></url>
  <url><loc>https://fov-viewer.iser.io/compare/50mm-vs-85mm.html</loc><lastmod>2026-04-02</lastmod><priority>0.7</priority></url>
  <url><loc>https://fov-viewer.iser.io/compare/24mm-vs-50mm.html</loc><lastmod>2026-04-02</lastmod><priority>0.7</priority></url>
  <url><loc>https://fov-viewer.iser.io/compare/85mm-vs-135mm.html</loc><lastmod>2026-04-02</lastmod><priority>0.7</priority></url>
  <url><loc>https://fov-viewer.iser.io/compare/85mm-vs-200mm.html</loc><lastmod>2026-04-02</lastmod><priority>0.7</priority></url>
  <url><loc>https://fov-viewer.iser.io/compare/full-frame-vs-apsc.html</loc><lastmod>2026-04-02</lastmod><priority>0.7</priority></url>
  <url><loc>https://fov-viewer.iser.io/compare/full-frame-vs-m43.html</loc><lastmod>2026-04-02</lastmod><priority>0.7</priority></url>
  <url><loc>https://fov-viewer.iser.io/learn/</loc><lastmod>2026-04-02</lastmod><priority>0.8</priority></url>
  <url><loc>https://fov-viewer.iser.io/learn/crop-factor-explained.html</loc><lastmod>2026-04-02</lastmod><priority>0.7</priority></url>
  <url><loc>https://fov-viewer.iser.io/learn/focal-length-guide.html</loc><lastmod>2026-04-02</lastmod><priority>0.7</priority></url>
  <url><loc>https://fov-viewer.iser.io/learn/full-frame-vs-apsc.html</loc><lastmod>2026-04-02</lastmod><priority>0.7</priority></url>
  <url><loc>https://fov-viewer.iser.io/learn/how-to-choose-a-focal-length.html</loc><lastmod>2026-04-02</lastmod><priority>0.7</priority></url>
  <url><loc>https://fov-viewer.iser.io/learn/best-focal-lengths-landscape.html</loc><lastmod>2026-04-02</lastmod><priority>0.7</priority></url>
  <url><loc>https://fov-viewer.iser.io/learn/best-focal-lengths-portrait.html</loc><lastmod>2026-04-02</lastmod><priority>0.7</priority></url>
  <url><loc>https://fov-viewer.iser.io/learn/best-focal-lengths-street.html</loc><lastmod>2026-04-02</lastmod><priority>0.7</priority></url>
  <url><loc>https://fov-viewer.iser.io/learn/best-focal-lengths-wildlife.html</loc><lastmod>2026-04-02</lastmod><priority>0.7</priority></url>
  <url><loc>https://fov-viewer.iser.io/learn/best-focal-lengths-astrophotography.html</loc><lastmod>2026-04-02</lastmod><priority>0.7</priority></url>
  <url><loc>https://fov-viewer.iser.io/learn/understanding-lens-compression.html</loc><lastmod>2026-04-02</lastmod><priority>0.7</priority></url>
  <url><loc>https://fov-viewer.iser.io/learn/equivalent-focal-lengths.html</loc><lastmod>2026-04-02</lastmod><priority>0.7</priority></url>
  <url><loc>https://fov-viewer.iser.io/learn/wide-angle-vs-telephoto.html</loc><lastmod>2026-04-02</lastmod><priority>0.7</priority></url>
  <url><loc>https://fov-viewer.iser.io/learn/prime-vs-zoom-lenses.html</loc><lastmod>2026-04-02</lastmod><priority>0.7</priority></url>
</urlset>
```

- [ ] **Step 3: Add canonical URL, hreflang, and performance preloads to `index.html`**

Add these lines inside `<head>`, after the existing viewport meta tag:

```html
    <link rel="canonical" href="https://fov-viewer.iser.io/" />
    <link rel="alternate" hreflang="en" href="https://fov-viewer.iser.io/" />
    <link rel="alternate" hreflang="x-default" href="https://fov-viewer.iser.io/" />
    <link rel="preconnect" href="https://www.googletagmanager.com" />
    <link rel="dns-prefetch" href="https://www.google-analytics.com" />
```

- [ ] **Step 4: Verify files are served correctly**

Run: `npm run build && ls dist/robots.txt dist/sitemap.xml`
Expected: Both files exist in `dist/`

- [ ] **Step 5: Commit**

```bash
git add public/robots.txt public/sitemap.xml index.html
git commit -m "feat(seo): add robots.txt, sitemap.xml, canonical URL, hreflang, preloads"
```

---

### Task 2: Enhanced Meta Tags and Static HTML in #root

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Update `<title>` and meta tags in `index.html`**

Replace the existing title and meta description:

```html
    <title>FOV Viewer — Camera Field of View & Focal Length Comparison Tool</title>
```

Replace the existing `<meta name="description">`:
```html
    <meta name="description" content="Free tool to visualize and compare camera field of view across focal lengths (14mm to 800mm) and sensor sizes (full frame, APS-C, Micro Four Thirds). See what 24mm vs 85mm actually looks like. Understand crop factor and equivalent focal lengths." />
```

Add after the description meta:
```html
    <meta name="keywords" content="focal length comparison, field of view calculator, crop factor calculator, camera FOV, 24mm vs 50mm, 35mm vs 85mm, full frame vs APS-C, lens comparison tool, photography tool, focal length visualizer" />
```

Update OG and Twitter title tags to match the new title:
```html
    <meta property="og:title" content="FOV Viewer — Camera Field of View & Focal Length Comparison Tool" />
    <meta property="og:description" content="Free tool to visualize and compare camera field of view across focal lengths (14mm to 800mm) and sensor sizes (full frame, APS-C, Micro Four Thirds). See what 24mm vs 85mm actually looks like." />
    <meta name="twitter:title" content="FOV Viewer — Camera Field of View & Focal Length Comparison Tool" />
    <meta name="twitter:description" content="Free tool to visualize and compare camera field of view across focal lengths and sensor sizes." />
```

- [ ] **Step 2: Add static HTML inside `<div id="root">`**

Replace `<div id="root"></div>` with:

```html
    <div id="root">
      <h1>Camera Field of View &amp; Focal Length Comparison Tool</h1>
      <p>Visualize how different focal lengths change your field of view. Compare lenses from 14mm ultra-wide to 800mm super-telephoto across sensor sizes including full frame (36&times;24mm), APS-C (Nikon/Sony 1.5&times; crop, Canon 1.6&times; crop), Micro Four Thirds (2.0&times; crop), medium format (0.79&times; crop), and 1-inch sensors (2.7&times; crop). Understand how crop factor affects equivalent focal length and see exactly what each combination looks like on real-world scenes.</p>

      <section>
        <h2>Frequently Asked Questions</h2>
        <details><summary>What is field of view in photography?</summary><p>Field of view (FOV) is the angular extent of the scene captured by a camera lens, measured in degrees. A wider field of view (e.g., 14mm lens on full frame = 114&deg; horizontal) captures more of the scene, while a narrower field of view (e.g., 200mm = 10.3&deg;) isolates a small portion. FOV depends on two factors: focal length and sensor size.</p></details>
        <details><summary>How does crop factor affect field of view?</summary><p>Crop factor describes how much smaller a sensor is relative to a 36&times;24mm full-frame sensor. A smaller sensor captures a smaller portion of the image circle projected by the lens, effectively narrowing the field of view. Multiply the focal length by the crop factor to get the full-frame equivalent: a 50mm lens on APS-C (1.5&times;) gives the same FOV as 75mm on full frame. The actual focal length doesn&rsquo;t change &mdash; only the field of view does.</p></details>
        <details><summary>What is the difference between full frame and APS-C?</summary><p>Full frame sensors measure 36&times;24mm (crop factor 1.0&times;). APS-C sensors are smaller: 23.5&times;15.6mm for Nikon/Sony (1.5&times; crop) and 22.2&times;14.8mm for Canon (1.6&times; crop). The same lens produces a narrower field of view on APS-C. A 35mm lens on APS-C gives roughly the same FOV as a 50mm lens on full frame.</p></details>
        <details><summary>What focal length is best for portraits?</summary><p>85mm on full frame is the classic portrait focal length, offering a natural perspective with flattering compression and comfortable working distance (about 2&ndash;3 meters for a head-and-shoulders shot). 50mm works well for environmental portraits, and 135mm provides even more compression for tight headshots. On APS-C, divide by the crop factor: a 56mm lens gives the 85mm-equivalent FOV.</p></details>
        <details><summary>What focal length is best for landscape photography?</summary><p>Wide-angle lenses between 14mm and 35mm (full frame) are most common for landscapes. 24mm is versatile &mdash; wide enough to capture expansive scenes without extreme distortion. 14&ndash;20mm creates dramatic wide perspectives. 35mm works for landscapes where you want to include foreground interest without exaggerating the distance between near and far elements.</p></details>
        <details><summary>How do I compare two focal lengths?</summary><p>Use this tool: select two lenses (e.g., 35mm and 85mm), choose your sensor size, and see their fields of view overlaid on the same scene. The colored rectangles show exactly how much of the scene each focal length captures. You can drag the overlays to compare different portions of the frame.</p></details>
        <details><summary>What does 50mm look like on a crop sensor?</summary><p>A 50mm lens on an APS-C sensor (1.5&times; crop) gives the same field of view as a 75mm lens on full frame. On Micro Four Thirds (2.0&times; crop), 50mm gives a 100mm-equivalent FOV. The lens itself doesn&rsquo;t change &mdash; the sensor crops into the center of the image circle, narrowing what you see.</p></details>
      </section>

      <noscript>
        <p>FOV Viewer requires JavaScript to run. Please enable JavaScript in your browser to use the focal length comparison tool.</p>
      </noscript>
    </div>
```

- [ ] **Step 3: Add WebApplication and FAQPage JSON-LD structured data**

Add before the closing `</head>` tag (before the GA script):

```html
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "FOV Viewer",
      "description": "Free tool to visualize and compare camera field of view across focal lengths and sensor sizes",
      "url": "https://fov-viewer.iser.io/",
      "applicationCategory": "PhotographyApplication",
      "operatingSystem": "Any",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
      "browserRequirements": "Requires JavaScript"
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is field of view in photography?",
          "acceptedAnswer": { "@type": "Answer", "text": "Field of view (FOV) is the angular extent of the scene captured by a camera lens, measured in degrees. A wider field of view (e.g., 14mm lens on full frame = 114 degrees horizontal) captures more of the scene, while a narrower field of view (e.g., 200mm = 10.3 degrees) isolates a small portion. FOV depends on two factors: focal length and sensor size." }
        },
        {
          "@type": "Question",
          "name": "How does crop factor affect field of view?",
          "acceptedAnswer": { "@type": "Answer", "text": "Crop factor describes how much smaller a sensor is relative to a 36x24mm full-frame sensor. A smaller sensor captures a smaller portion of the image circle projected by the lens, effectively narrowing the field of view. Multiply the focal length by the crop factor to get the full-frame equivalent: a 50mm lens on APS-C (1.5x) gives the same FOV as 75mm on full frame." }
        },
        {
          "@type": "Question",
          "name": "What is the difference between full frame and APS-C?",
          "acceptedAnswer": { "@type": "Answer", "text": "Full frame sensors measure 36x24mm (crop factor 1.0x). APS-C sensors are smaller: 23.5x15.6mm for Nikon/Sony (1.5x crop) and 22.2x14.8mm for Canon (1.6x crop). The same lens produces a narrower field of view on APS-C. A 35mm lens on APS-C gives roughly the same FOV as a 50mm lens on full frame." }
        },
        {
          "@type": "Question",
          "name": "What focal length is best for portraits?",
          "acceptedAnswer": { "@type": "Answer", "text": "85mm on full frame is the classic portrait focal length, offering a natural perspective with flattering compression and comfortable working distance. 50mm works well for environmental portraits, and 135mm provides even more compression for tight headshots. On APS-C, divide by the crop factor: a 56mm lens gives the 85mm-equivalent FOV." }
        },
        {
          "@type": "Question",
          "name": "What focal length is best for landscape photography?",
          "acceptedAnswer": { "@type": "Answer", "text": "Wide-angle lenses between 14mm and 35mm (full frame) are most common for landscapes. 24mm is versatile — wide enough to capture expansive scenes without extreme distortion. 14-20mm creates dramatic wide perspectives. 35mm works for landscapes where you want to include foreground interest without exaggerating distances." }
        },
        {
          "@type": "Question",
          "name": "How do I compare two focal lengths?",
          "acceptedAnswer": { "@type": "Answer", "text": "Use this tool: select two lenses, choose your sensor size, and see their fields of view overlaid on the same scene. The colored rectangles show exactly how much of the scene each focal length captures. You can drag the overlays to compare different portions of the frame." }
        },
        {
          "@type": "Question",
          "name": "What does 50mm look like on a crop sensor?",
          "acceptedAnswer": { "@type": "Answer", "text": "A 50mm lens on an APS-C sensor (1.5x crop) gives the same field of view as a 75mm lens on full frame. On Micro Four Thirds (2.0x crop), 50mm gives a 100mm-equivalent FOV. The lens itself doesn't change — the sensor crops into the center of the image circle, narrowing what you see." }
        }
      ]
    }
    </script>
```

- [ ] **Step 4: Verify the build succeeds and static HTML is present**

Run: `npm run build && grep -c 'Frequently Asked Questions' dist/index.html`
Expected: Output `1` (the static HTML is in the built file)

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat(seo): add enhanced meta tags, static crawlable HTML, FAQ structured data"
```

---

### Task 3: PWA Manifest and Icons

**Files:**
- Create: `public/manifest.json`
- Create: `public/icon-192.png`
- Create: `public/icon-512.png`
- Modify: `index.html`

- [ ] **Step 1: Create `public/manifest.json`**

```json
{
  "name": "FOV Viewer — Focal Length Comparison Tool",
  "short_name": "FOV Viewer",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#3b82f6",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 2: Generate PNG icons**

Use a canvas-based approach or an online tool to create simple camera emoji icons at 192x192 and 512x512. Place them in `public/`. A simple approach: create a small Node script that writes a PNG with a camera icon, or use ImageMagick if available:

```bash
# Check if ImageMagick is available
which convert || echo "ImageMagick not available — create icons manually"
```

If not available, create minimal placeholder PNGs using a canvas script or download camera icon PNGs. The icons should be a simple camera icon on a `#1a1a2e` background with `#3b82f6` accent.

- [ ] **Step 3: Add manifest link to `index.html`**

Add inside `<head>`, after the favicon link:

```html
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#3b82f6" />
```

- [ ] **Step 4: Verify manifest is served**

Run: `npm run build && ls dist/manifest.json dist/icon-192.png dist/icon-512.png`
Expected: All three files exist

- [ ] **Step 5: Commit**

```bash
git add public/manifest.json public/icon-192.png public/icon-512.png index.html
git commit -m "feat(seo): add PWA manifest and app icons"
```

---

### Task 4: Image SEO — Rename Asset Files

**Files:**
- Rename: `src/assets/person.jpg` → `src/assets/landscape-boat-lake.jpg`
- Rename: `src/assets/portrait.jpg` → `src/assets/portrait-woman.jpg`
- Rename: `src/assets/bird2.jpg` → `src/assets/wildlife-condor.jpg`
- Rename: `src/assets/city.jpg` → `src/assets/city-street.jpg`
- Rename: `src/assets/milkyway.jpg` → `src/assets/milky-way-night-sky.jpg`
- Modify: `src/data/scenes.ts`

- [ ] **Step 1: Rename image files**

```bash
cd src/assets
git mv person.jpg landscape-boat-lake.jpg
git mv portrait.jpg portrait-woman.jpg
git mv bird2.jpg wildlife-condor.jpg
git mv city.jpg city-street.jpg
git mv milkyway.jpg milky-way-night-sky.jpg
cd ../..
```

- [ ] **Step 2: Update `src/data/scenes.ts`**

Replace the entire file:

```typescript
import landscape from '../assets/landscape-boat-lake.jpg'
import portrait from '../assets/portrait-woman.jpg'
import bird from '../assets/wildlife-condor.jpg'
import city from '../assets/city-street.jpg'
import milkyway from '../assets/milky-way-night-sky.jpg'

export interface Scene {
  id: string
  name: string
  src: string
}

export const SCENES: Scene[] = [
  { id: 'landscape', name: 'Landscape', src: landscape },
  { id: 'portrait', name: 'Portrait', src: portrait },
  { id: 'wildlife', name: 'Wildlife', src: bird },
  { id: 'city', name: 'City Street', src: city },
  { id: 'milkyway', name: 'Milky Way', src: milkyway },
]
```

- [ ] **Step 3: Run tests to verify nothing breaks**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 4: Run build to verify imports resolve**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 5: Commit**

```bash
git add src/assets/ src/data/scenes.ts
git commit -m "feat(seo): rename image assets with descriptive filenames"
```

---

### Task 5: Semantic HTML in React Components

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Canvas.tsx`

- [ ] **Step 1: Update `src/App.tsx` — wrap sections in semantic HTML**

Replace the return statement's outer structure. Change `<div className="app">` to:

```tsx
    <div className="app">
      <Sidebar>
        <header className="sidebar__header">
```

Change `<div className="sidebar__header">` to `<header className="sidebar__header">` and its closing `</div>` to `</header>`.

Change `<div className="canvas-area">` to `<main className="canvas-area">` and its closing `</div>` to `</main>`.

Change `<div className="canvas-topbar">` to `<nav className="canvas-topbar">` and its closing `</div>` to `</nav>`.

Change `<div className="canvas-main">` to `<section className="canvas-main">` and its closing `</div>` to `</section>`.

The Sidebar component already uses `<aside>` — no change needed there.

- [ ] **Step 2: Update `src/components/Canvas.tsx` — add dynamic aria-label**

In the `Canvas` component, add an `aria-label` prop to the `<canvas>` element. The label should describe the current comparison.

Add this computed label before the return statement (after the `handleTouchEnd` callback):

```typescript
  const ariaLabel = lenses.map((lens, i) => {
    const sensor = getSensor(lens.sensorId)
    return `${lens.focalLength}mm ${sensor.name}`
  }).join(' vs ')
```

Add the aria-label to the canvas element:

```tsx
    <canvas
      ref={canvasRef}
      className="fov-canvas"
      aria-label={`Field of view comparison: ${ariaLabel}`}
      role="img"
      onMouseDown={handleMouseDown}
```

Note: `getSensor` is already imported in Canvas.tsx.

- [ ] **Step 3: Run lint and tests**

Run: `npm run lint && npm test`
Expected: No errors, all tests pass

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/components/Canvas.tsx
git commit -m "feat(seo): add semantic HTML elements and canvas aria-label"
```

---

### Task 6: Dynamic Title and Meta from URL Params

**Files:**
- Create: `src/hooks/useDynamicMeta.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/hooks/useDynamicMeta.ts`**

```typescript
import { useEffect } from 'react'
import type { LensConfig } from '../types'
import { getSensor } from '../data/sensors'

const BASE_TITLE = 'FOV Viewer — Camera Field of View & Focal Length Comparison Tool'

function buildTitle(lenses: LensConfig[]): string {
  if (lenses.length === 0) return BASE_TITLE
  const parts = lenses.map((l) => `${l.focalLength}mm`)
  const sensorNames = [...new Set(lenses.map((l) => getSensor(l.sensorId).name))]
  const sensorSuffix = sensorNames.length === 1 ? ` (${sensorNames[0]})` : ''
  return `${parts.join(' vs ')}${sensorSuffix} — FOV Viewer`
}

function buildDescription(lenses: LensConfig[]): string {
  if (lenses.length === 0) {
    return 'Free tool to visualize and compare camera field of view across focal lengths (14mm to 800mm) and sensor sizes (full frame, APS-C, Micro Four Thirds).'
  }
  const parts = lenses.map((l) => {
    const sensor = getSensor(l.sensorId)
    return `${l.focalLength}mm on ${sensor.name}`
  })
  return `See the field of view difference between ${parts.join(' and ')}. Compare focal lengths visually with FOV Viewer.`
}

export function useDynamicMeta(lenses: LensConfig[]): void {
  useEffect(() => {
    const hasParams = new URLSearchParams(window.location.search).has('a')
    if (!hasParams) return // Don't override defaults if no query params

    document.title = buildTitle(lenses)

    const descMeta = document.querySelector('meta[name="description"]')
    if (descMeta) descMeta.setAttribute('content', buildDescription(lenses))

    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', buildTitle(lenses))

    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) ogDesc.setAttribute('content', buildDescription(lenses))

    const ogUrl = document.querySelector('meta[property="og:url"]')
    if (ogUrl) ogUrl.setAttribute('content', window.location.href)

    return () => {
      document.title = BASE_TITLE
    }
  }, [lenses])
}
```

- [ ] **Step 2: Wire up in `src/App.tsx`**

Add import at top of App.tsx:

```typescript
import { useDynamicMeta } from './hooks/useDynamicMeta'
```

Add inside the `App` component, after the `useQuerySync(state)` call:

```typescript
  useDynamicMeta(state.lenses)
```

- [ ] **Step 3: Write test for `useDynamicMeta`**

Create `src/hooks/useDynamicMeta.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useDynamicMeta } from './useDynamicMeta'
import type { LensConfig } from '../types'

describe('useDynamicMeta', () => {
  const originalTitle = document.title

  beforeEach(() => {
    document.title = 'FOV Viewer — Camera Field of View & Focal Length Comparison Tool'
    // Add meta tags for testing
    const desc = document.createElement('meta')
    desc.setAttribute('name', 'description')
    desc.setAttribute('content', 'original')
    document.head.appendChild(desc)

    const ogTitle = document.createElement('meta')
    ogTitle.setAttribute('property', 'og:title')
    ogTitle.setAttribute('content', 'original')
    document.head.appendChild(ogTitle)
  })

  afterEach(() => {
    document.title = originalTitle
    document.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[property="og:url"]').forEach((el) => el.remove())
  })

  it('updates title when URL has query params', () => {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, search: '?a=50&sa=ff&b=85&sb=ff', href: 'http://localhost/?a=50&sa=ff&b=85&sb=ff' },
      writable: true,
    })

    const lenses: LensConfig[] = [
      { focalLength: 50, sensorId: 'ff' },
      { focalLength: 85, sensorId: 'ff' },
    ]
    renderHook(() => useDynamicMeta(lenses))
    expect(document.title).toBe('50mm vs 85mm (Full Frame) — FOV Viewer')
  })

  it('does not update title without query params', () => {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, search: '', href: 'http://localhost/' },
      writable: true,
    })

    const lenses: LensConfig[] = [{ focalLength: 50, sensorId: 'ff' }]
    renderHook(() => useDynamicMeta(lenses))
    expect(document.title).toBe('FOV Viewer — Camera Field of View & Focal Length Comparison Tool')
  })
})
```

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useDynamicMeta.ts src/hooks/useDynamicMeta.test.ts src/App.tsx
git commit -m "feat(seo): add dynamic title and meta tags from URL params"
```

---

### Task 7: Embed Mode

**Files:**
- Create: `src/components/EmbedMode.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Create `src/components/EmbedMode.tsx`**

```tsx
import { useReducer, useRef } from 'react'
import type { AppState, LensConfig, Orientation } from '../types'
import { DEFAULT_STATE } from '../types'
import { parseQueryParams } from '../hooks/useQuerySync'
import { Canvas } from './Canvas'

type Action =
  | { type: 'SET_LENS'; payload: { index: number; updates: Partial<LensConfig> } }
  | { type: 'SET_IMAGE'; payload: number }
  | { type: 'SET_ORIENTATION'; payload: Orientation }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LENS': {
      const { index, updates } = action.payload
      const lenses = state.lenses.map((l, i) => i === index ? { ...l, ...updates } : l)
      return { ...state, lenses }
    }
    case 'SET_IMAGE':
      return { ...state, imageIndex: action.payload }
    case 'SET_ORIENTATION':
      return { ...state, orientation: action.payload }
    default:
      return state
  }
}

export function EmbedMode() {
  const [state] = useReducer(reducer, undefined, () => ({
    ...DEFAULT_STATE,
    ...parseQueryParams(),
  }))
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  return (
    <div className="embed-mode">
      <div className="embed-mode__canvas">
        <Canvas
          lenses={state.lenses}
          imageIndex={state.imageIndex}
          orientation={state.orientation}
          canvasRef={canvasRef}
        />
      </div>
      <a
        className="embed-mode__attribution"
        href="https://fov-viewer.iser.io/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Powered by FOV Viewer
      </a>
    </div>
  )
}
```

- [ ] **Step 2: Add embed mode CSS to `src/App.css`**

Add at the end of the file:

```css
/* Embed mode */
.embed-mode {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

.embed-mode__canvas {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.embed-mode__attribution {
  padding: 4px 8px;
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
  text-decoration: none;
  opacity: 0.7;
}

.embed-mode__attribution:hover {
  opacity: 1;
  text-decoration: underline;
}
```

- [ ] **Step 3: Update `src/App.tsx` to detect embed mode**

Add at the top of the `App` component function (before the useReducer):

```typescript
  const isEmbed = new URLSearchParams(window.location.search).has('embed')
  if (isEmbed) return <EmbedMode />
```

Add the import at the top:

```typescript
import { EmbedMode } from './components/EmbedMode'
```

Note: This must be before any hooks. Since we're returning early, restructure: move the embed check before the component and render conditionally, OR make it a wrapper. The cleanest approach is to check in `main.tsx` or use a conditional at the top level. Actually, since hooks must be called unconditionally, wrap it differently:

Better approach — update `src/main.tsx` to conditionally render:

Read `src/main.tsx` first to see its current content, then add:

```typescript
import { EmbedMode } from './components/EmbedMode'

const isEmbed = new URLSearchParams(window.location.search).has('embed')
const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    {isEmbed ? <EmbedMode /> : <App />}
  </React.StrictMode>
)
```

- [ ] **Step 4: Run build and test**

Run: `npm run lint && npm test && npm run build`
Expected: All pass

- [ ] **Step 5: Commit**

```bash
git add src/components/EmbedMode.tsx src/App.css src/main.tsx
git commit -m "feat(seo): add embed mode for iframe embedding"
```

---

### Task 8: Share/Embed Modal in ActionBar

**Files:**
- Create: `src/components/ShareModal.tsx`
- Modify: `src/components/ActionBar.tsx`
- Modify: `src/App.css`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/components/ShareModal.tsx`**

```tsx
import { useState, useCallback } from 'react'
import type { LensConfig } from '../types'
import { getSensor } from '../data/sensors'
import { stateToQueryString } from '../hooks/useQuerySync'
import type { AppState } from '../types'

interface ShareModalProps {
  state: AppState
  onClose: () => void
  onToast: (msg: string) => void
}

function buildLabel(lenses: LensConfig[]): string {
  const parts = lenses.map((l) => {
    const sensor = getSensor(l.sensorId)
    return `${l.focalLength}mm ${sensor.name}`
  })
  return parts.join(' vs ') + ' FOV Comparison'
}

export function ShareModal({ state, onClose, onToast }: ShareModalProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const qs = stateToQueryString(state)
  const baseUrl = 'https://fov-viewer.iser.io/'
  const toolUrl = `${baseUrl}?${qs}`
  const embedUrl = `${baseUrl}?${qs}&embed=1`
  const label = buildLabel(state.lenses)

  const snippets = {
    link: toolUrl,
    markdown: `[${label}](${toolUrl})`,
    bbcode: `[url=${toolUrl}]${label}[/url]`,
    iframe: `<iframe src="${embedUrl}" width="800" height="600" style="border:none;" title="${label}"></iframe>`,
  }

  const copy = useCallback((key: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      onToast('Copied!')
      setTimeout(() => setCopied(null), 2000)
    })
  }, [onToast])

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal__header">
          <h3>Share &amp; Embed</h3>
          <button className="share-modal__close" onClick={onClose}>&times;</button>
        </div>

        <div className="share-modal__section">
          <label>Direct Link</label>
          <div className="share-modal__row">
            <input type="text" readOnly value={snippets.link} />
            <button onClick={() => copy('link', snippets.link)}>
              {copied === 'link' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="share-modal__section">
          <label>Markdown (Reddit, GitHub)</label>
          <div className="share-modal__row">
            <input type="text" readOnly value={snippets.markdown} />
            <button onClick={() => copy('markdown', snippets.markdown)}>
              {copied === 'markdown' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="share-modal__section">
          <label>BBCode (Forums)</label>
          <div className="share-modal__row">
            <input type="text" readOnly value={snippets.bbcode} />
            <button onClick={() => copy('bbcode', snippets.bbcode)}>
              {copied === 'bbcode' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="share-modal__section">
          <label>HTML Embed</label>
          <div className="share-modal__row">
            <input type="text" readOnly value={snippets.iframe} />
            <button onClick={() => copy('iframe', snippets.iframe)}>
              {copied === 'iframe' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add ShareModal CSS to `src/App.css`**

Add at the end:

```css
/* Share modal */
.share-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.share-modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  max-width: 520px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.share-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.share-modal__header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--text);
}

.share-modal__close {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0 4px;
}

.share-modal__section {
  margin-bottom: 12px;
}

.share-modal__section label {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.share-modal__row {
  display: flex;
  gap: 6px;
}

.share-modal__row input {
  flex: 1;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 6px 8px;
  color: var(--text);
  font-size: 12px;
  font-family: monospace;
}

.share-modal__row button {
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
}
```

- [ ] **Step 3: Update `src/components/ActionBar.tsx`**

Replace the file:

```tsx
interface ActionBarProps {
  onCopyImage: () => void
  onCopyLink: () => void
  onReset: () => void
  onShare: () => void
}

export function ActionBar({ onCopyImage, onCopyLink, onReset, onShare }: ActionBarProps) {
  return (
    <div className="action-bar">
      <button className="action-bar__btn action-bar__btn--primary" onClick={onCopyImage}>
        Copy image
      </button>
      <button className="action-bar__btn" onClick={onCopyLink}>
        Copy link
      </button>
      <button className="action-bar__btn" onClick={onShare}>
        Share / Embed
      </button>
      <button className="action-bar__btn" onClick={onReset}>
        Reset
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Update `src/App.tsx` to wire ShareModal**

Add import:

```typescript
import { ShareModal } from './components/ShareModal'
```

Add state for the modal (after the `collapsed` state):

```typescript
  const [showShare, setShowShare] = useState(false)
```

Update the ActionBar usage:

```tsx
        <ActionBar
          onCopyImage={handleCopyImage}
          onCopyLink={handleCopyLink}
          onReset={() => dispatch({ type: 'RESET' })}
          onShare={() => setShowShare(true)}
        />
```

Add the ShareModal before the Toast (still inside the app div):

```tsx
      {showShare && (
        <ShareModal
          state={state}
          onClose={() => setShowShare(false)}
          onToast={(msg) => { setToast(msg); setShowShare(false) }}
        />
      )}
```

- [ ] **Step 5: Run lint, tests, and build**

Run: `npm run lint && npm test && npm run build`
Expected: All pass

- [ ] **Step 6: Commit**

```bash
git add src/components/ShareModal.tsx src/components/ActionBar.tsx src/App.tsx src/App.css
git commit -m "feat(seo): add share/embed modal with markdown, BBCode, and iframe snippets"
```

---

### Task 9: Content Pages Shared CSS

**Files:**
- Create: `public/content-styles.css`

- [ ] **Step 1: Create `public/content-styles.css`**

This is the shared stylesheet for all static HTML content pages (compare and learn). It must be self-contained (no build step).

```css
:root {
  --bg: #1a1a2e;
  --bg-secondary: #16213e;
  --text: #e0e0e0;
  --text-muted: #8a8a9a;
  --accent: #3b82f6;
  --border: #2a2a4a;
  --max-width: 800px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}

/* Header */
.site-header {
  border-bottom: 1px solid var(--border);
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.site-header__logo {
  font-weight: 700;
  font-size: 16px;
  color: var(--text);
  text-decoration: none;
}

.site-header__nav {
  display: flex;
  gap: 20px;
}

.site-header__nav a {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 14px;
}

.site-header__nav a:hover,
.site-header__nav a.active {
  color: var(--accent);
}

/* Breadcrumb */
.breadcrumb {
  max-width: var(--max-width);
  margin: 16px auto 0;
  padding: 0 24px;
  font-size: 13px;
  color: var(--text-muted);
}

.breadcrumb a {
  color: var(--text-muted);
  text-decoration: none;
}

.breadcrumb a:hover {
  color: var(--accent);
}

.breadcrumb span {
  margin: 0 6px;
}

/* Main content */
.content {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 32px 24px 64px;
}

.content h1 {
  font-size: 32px;
  line-height: 1.2;
  margin-bottom: 8px;
}

.content .subtitle {
  color: var(--text-muted);
  font-size: 16px;
  margin-bottom: 32px;
}

.content h2 {
  font-size: 22px;
  margin-top: 40px;
  margin-bottom: 12px;
  color: var(--text);
}

.content h3 {
  font-size: 18px;
  margin-top: 28px;
  margin-bottom: 8px;
}

.content p {
  margin-bottom: 16px;
  font-size: 16px;
}

.content ul, .content ol {
  margin-bottom: 16px;
  padding-left: 24px;
}

.content li {
  margin-bottom: 6px;
  font-size: 16px;
}

.content strong {
  color: #fff;
}

/* Tables */
.content table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 14px;
}

.content th {
  background: var(--bg-secondary);
  padding: 10px 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid var(--border);
}

.content td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
}

.content tr:hover td {
  background: rgba(59, 130, 246, 0.05);
}

/* CTA button */
.cta {
  display: inline-block;
  background: var(--accent);
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  margin: 16px 0;
}

.cta:hover {
  opacity: 0.9;
}

/* Embedded tool iframe */
.tool-embed {
  width: 100%;
  height: 450px;
  border: 1px solid var(--border);
  border-radius: 8px;
  margin: 20px 0;
}

/* SVG diagrams */
.diagram {
  width: 100%;
  max-width: 600px;
  margin: 20px auto;
  display: block;
}

/* Figure */
.content figure {
  margin: 24px 0;
}

.content figcaption {
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
  margin-top: 8px;
}

/* Index page cards */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  text-decoration: none;
  color: var(--text);
  transition: border-color 0.2s;
}

.card:hover {
  border-color: var(--accent);
}

.card h3 {
  font-size: 16px;
  margin: 0 0 6px;
}

.card p {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

/* Footer */
.site-footer {
  border-top: 1px solid var(--border);
  padding: 24px;
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
  max-width: 1200px;
  margin: 0 auto;
}

.site-footer a {
  color: var(--text-muted);
  text-decoration: none;
  margin: 0 8px;
}

.site-footer a:hover {
  color: var(--accent);
}

/* Responsive */
@media (max-width: 600px) {
  .content h1 { font-size: 24px; }
  .content h2 { font-size: 18px; }
  .tool-embed { height: 300px; }
  .site-header { padding: 12px 16px; }
  .content { padding: 20px 16px 48px; }
}
```

- [ ] **Step 2: Commit**

```bash
git add public/content-styles.css
git commit -m "feat(seo): add shared CSS for content pages"
```

---

### Task 10: Improved 404 Page

**Files:**
- Modify: `public/404.html`

- [ ] **Step 1: Replace `public/404.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found — FOV Viewer</title>
  <meta name="robots" content="noindex">
  <link rel="stylesheet" href="/content-styles.css">
</head>
<body>
  <header class="site-header">
    <a href="/" class="site-header__logo">FOV Viewer</a>
    <nav class="site-header__nav">
      <a href="/">Tool</a>
      <a href="/compare/">Compare</a>
      <a href="/learn/">Learn</a>
    </nav>
  </header>

  <div class="content" style="text-align: center; padding-top: 80px;">
    <h1>Page Not Found</h1>
    <p>The page you're looking for doesn't exist or has been moved.</p>

    <h2 style="margin-top: 48px;">Popular Comparisons</h2>
    <p>
      <a href="/compare/24mm-vs-35mm.html">24mm vs 35mm</a> &middot;
      <a href="/compare/35mm-vs-50mm.html">35mm vs 50mm</a> &middot;
      <a href="/compare/50mm-vs-85mm.html">50mm vs 85mm</a> &middot;
      <a href="/compare/85mm-vs-200mm.html">85mm vs 200mm</a>
    </p>

    <h2 style="margin-top: 32px;">Learn</h2>
    <p>
      <a href="/learn/crop-factor-explained.html">Crop Factor Explained</a> &middot;
      <a href="/learn/focal-length-guide.html">Focal Length Guide</a> &middot;
      <a href="/learn/best-focal-lengths-portrait.html">Best Portrait Lenses</a>
    </p>

    <p style="margin-top: 48px;">
      <a class="cta" href="/">Open FOV Viewer Tool</a>
    </p>
  </div>

  <footer class="site-footer">
    <a href="/">Tool</a>
    <a href="/compare/">Compare</a>
    <a href="/learn/">Learn</a>
    <a href="https://github.com/kevinkiklee/fov-viewer" target="_blank" rel="noopener">GitHub</a>
  </footer>

  <script>
    // SPA fallback: if the path looks like it should be handled by the app
    var path = window.location.pathname;
    if (path === '/' || path.startsWith('/?')) {
      window.location.replace('/' + window.location.search);
    }
  </script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add public/404.html
git commit -m "feat(seo): improve 404 page with navigation and popular links"
```

---

### Task 11: Compare Index Page

**Files:**
- Create: `public/compare/index.html`

- [ ] **Step 1: Create `public/compare/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Focal Length Comparisons — FOV Viewer</title>
  <meta name="description" content="Compare popular focal length combinations side by side. See how 24mm vs 35mm, 50mm vs 85mm, and other lens pairings look on real scenes.">
  <link rel="canonical" href="https://fov-viewer.iser.io/compare/">
  <link rel="stylesheet" href="/content-styles.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://fov-viewer.iser.io/" },
      { "@type": "ListItem", "position": 2, "name": "Compare" }
    ]
  }
  </script>
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-GSRBYSNCEJ"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-GSRBYSNCEJ');</script>
</head>
<body>
  <header class="site-header">
    <a href="/" class="site-header__logo">FOV Viewer</a>
    <nav class="site-header__nav">
      <a href="/">Tool</a>
      <a href="/compare/" class="active">Compare</a>
      <a href="/learn/">Learn</a>
    </nav>
  </header>

  <nav class="breadcrumb">
    <a href="/">Home</a> <span>&rsaquo;</span> Compare
  </nav>

  <div class="content">
    <h1>Focal Length Comparisons</h1>
    <p class="subtitle">See how different focal lengths look side by side on real scenes.</p>

    <h2>Focal Length Pairs</h2>
    <div class="card-grid">
      <a class="card" href="24mm-vs-35mm.html">
        <h3>24mm vs 35mm</h3>
        <p>Wide-angle comparison — landscape and street photography staples.</p>
      </a>
      <a class="card" href="35mm-vs-40mm.html">
        <h3>35mm vs 40mm</h3>
        <p>A subtle but meaningful difference for everyday shooting.</p>
      </a>
      <a class="card" href="35mm-vs-50mm.html">
        <h3>35mm vs 50mm</h3>
        <p>The classic debate — wide normal vs standard normal.</p>
      </a>
      <a class="card" href="40mm-vs-50mm.html">
        <h3>40mm vs 50mm</h3>
        <p>Two normal lenses with more difference than you might expect.</p>
      </a>
      <a class="card" href="24mm-vs-50mm.html">
        <h3>24mm vs 50mm</h3>
        <p>Wide angle vs normal — how much more does 24mm capture?</p>
      </a>
      <a class="card" href="50mm-vs-85mm.html">
        <h3>50mm vs 85mm</h3>
        <p>Normal vs portrait — two of the most popular prime lenses.</p>
      </a>
      <a class="card" href="85mm-vs-135mm.html">
        <h3>85mm vs 135mm</h3>
        <p>Short tele vs medium tele — portrait and event shooting.</p>
      </a>
      <a class="card" href="85mm-vs-200mm.html">
        <h3>85mm vs 200mm</h3>
        <p>Portrait to telephoto — how much reach does 200mm add?</p>
      </a>
    </div>

    <h2>Sensor Size Comparisons</h2>
    <div class="card-grid">
      <a class="card" href="full-frame-vs-apsc.html">
        <h3>Full Frame vs APS-C</h3>
        <p>See how the 1.5&times; crop factor changes the field of view at 50mm.</p>
      </a>
      <a class="card" href="full-frame-vs-m43.html">
        <h3>Full Frame vs Micro Four Thirds</h3>
        <p>The 2.0&times; crop factor doubles the effective focal length.</p>
      </a>
    </div>
  </div>

  <footer class="site-footer">
    <a href="/">Tool</a>
    <a href="/compare/">Compare</a>
    <a href="/learn/">Learn</a>
    <a href="https://github.com/kevinkiklee/fov-viewer" target="_blank" rel="noopener">GitHub</a>
  </footer>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add public/compare/index.html
git commit -m "feat(seo): add comparison index page"
```

---

### Task 12: Comparison Landing Pages (All 10)

**Files:**
- Create: `public/compare/24mm-vs-35mm.html`
- Create: `public/compare/35mm-vs-50mm.html`
- Create: `public/compare/35mm-vs-40mm.html`
- Create: `public/compare/40mm-vs-50mm.html`
- Create: `public/compare/50mm-vs-85mm.html`
- Create: `public/compare/24mm-vs-50mm.html`
- Create: `public/compare/85mm-vs-135mm.html`
- Create: `public/compare/85mm-vs-200mm.html`
- Create: `public/compare/full-frame-vs-apsc.html`
- Create: `public/compare/full-frame-vs-m43.html`

Each comparison page follows this template structure. Below is the complete content for each page. Every page must have:
1. Unique title, description, canonical, BreadcrumbList JSON-LD
2. GA tag
3. Shared header/nav and footer
4. `<h1>` with the comparison
5. 2-3 paragraphs of original educational content (factually accurate)
6. Embedded tool iframe with `?embed=1` and correct params
7. "Try it yourself" CTA link
8. Related comparisons and learn article links

**Important factual reference for FOV calculations (rectilinear, full frame 36x24mm):**
- 14mm: 114.2° horizontal
- 20mm: 94.5° horizontal
- 24mm: 84.1° horizontal
- 35mm: 63.4° horizontal
- 40mm: 56.8° horizontal
- 50mm: 46.8° horizontal
- 85mm: 28.6° horizontal
- 135mm: 18.2° horizontal
- 200mm: 12.4° horizontal
- 400mm: 6.2° horizontal
- 600mm: 4.1° horizontal
- 800mm: 3.1° horizontal

- [ ] **Step 1: Create `public/compare/24mm-vs-35mm.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>24mm vs 35mm — Field of View Comparison | FOV Viewer</title>
  <meta name="description" content="Compare 24mm and 35mm field of view side by side. 24mm captures 84° while 35mm captures 63° on full frame. See the difference on real scenes.">
  <link rel="canonical" href="https://fov-viewer.iser.io/compare/24mm-vs-35mm.html">
  <link rel="stylesheet" href="/content-styles.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://fov-viewer.iser.io/" },
      { "@type": "ListItem", "position": 2, "name": "Compare", "item": "https://fov-viewer.iser.io/compare/" },
      { "@type": "ListItem", "position": 3, "name": "24mm vs 35mm" }
    ]
  }
  </script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-GSRBYSNCEJ"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-GSRBYSNCEJ');</script>
</head>
<body>
  <header class="site-header">
    <a href="/" class="site-header__logo">FOV Viewer</a>
    <nav class="site-header__nav">
      <a href="/">Tool</a>
      <a href="/compare/" class="active">Compare</a>
      <a href="/learn/">Learn</a>
    </nav>
  </header>

  <nav class="breadcrumb">
    <a href="/">Home</a> <span>&rsaquo;</span> <a href="/compare/">Compare</a> <span>&rsaquo;</span> 24mm vs 35mm
  </nav>

  <div class="content">
    <h1>24mm vs 35mm — Field of View Comparison</h1>
    <p class="subtitle">Two of the most popular wide-angle focal lengths for landscape, architecture, and street photography.</p>

    <p>On a full-frame sensor, 24mm delivers approximately 84° of horizontal field of view, while 35mm narrows to about 63°. That 21-degree difference is significant in practice: 24mm pulls in noticeably more of the periphery, making it the stronger choice when you need to capture the full breadth of a scene — interiors, sweeping landscapes, tight urban spaces.</p>

    <p>35mm, by contrast, renders perspective closer to what the human eye perceives as natural. Straight lines near the frame edges show less stretching than at 24mm, and subjects in the mid-ground hold more realistic proportions. This makes 35mm a favorite for street photography and environmental portraits, where context matters but extreme distortion does not.</p>

    <p>The practical trade-off comes down to inclusion versus naturalism. If you find yourself frequently cropping 24mm shots to remove distracting edge elements, 35mm may be the better default. If you routinely wish you could fit more into the frame, 24mm gives you that margin. Many photographers carry both as a two-prime travel kit — 24mm for establishing shots and 35mm for everything in between.</p>

    <iframe class="tool-embed" src="/?a=24&sa=ff&b=35&sb=ff&embed=1" title="24mm vs 35mm field of view comparison" loading="lazy"></iframe>

    <a class="cta" href="/?a=24&sa=ff&b=35&sb=ff">Try it yourself in the tool &rarr;</a>

    <h2>Key Specifications</h2>
    <table>
      <thead><tr><th></th><th>24mm</th><th>35mm</th></tr></thead>
      <tbody>
        <tr><td>Horizontal FOV (FF)</td><td>84.1°</td><td>63.4°</td></tr>
        <tr><td>APS-C equivalent</td><td>36mm</td><td>52.5mm</td></tr>
        <tr><td>Common use</td><td>Landscape, architecture, interiors</td><td>Street, travel, environmental portrait</td></tr>
      </tbody>
    </table>

    <h2>Related Comparisons</h2>
    <p>
      <a href="35mm-vs-50mm.html">35mm vs 50mm</a> &middot;
      <a href="24mm-vs-50mm.html">24mm vs 50mm</a>
    </p>

    <h2>Learn More</h2>
    <p>
      <a href="/learn/focal-length-guide.html">Focal Length Guide</a> &middot;
      <a href="/learn/best-focal-lengths-landscape.html">Best Lenses for Landscape</a> &middot;
      <a href="/learn/best-focal-lengths-street.html">Best Lenses for Street</a>
    </p>
  </div>

  <footer class="site-footer">
    <a href="/">Tool</a>
    <a href="/compare/">Compare</a>
    <a href="/learn/">Learn</a>
    <a href="https://github.com/kevinkiklee/fov-viewer" target="_blank" rel="noopener">GitHub</a>
  </footer>
</body>
</html>
```

- [ ] **Step 2: Create the remaining 9 comparison pages**

Each follows the same template as above. The content must be unique, factually accurate, and written in the same professional editorial tone. Here are the specifics for each:

**`public/compare/35mm-vs-50mm.html`**
- Title: "35mm vs 50mm — Field of View Comparison | FOV Viewer"
- FOV: 35mm = 63.4° H, 50mm = 46.8° H
- Content: The classic wide-normal vs standard-normal debate. 35mm includes more environmental context — useful for documentary and street work. 50mm isolates subjects more naturally, producing a perspective often described as closest to human vision (though this is debated — it depends on how you define "human vision"). 50mm is faster and cheaper in most lens lineups. The 16.6° difference is about one "step" in the traditional focal length progression.
- Iframe params: `?a=35&sa=ff&b=50&sb=ff&embed=1`
- Related: 24mm vs 35mm, 40mm vs 50mm, 50mm vs 85mm

**`public/compare/35mm-vs-40mm.html`**
- Title: "35mm vs 40mm — Field of View Comparison | FOV Viewer"
- FOV: 35mm = 63.4° H, 40mm = 56.8° H
- Content: A 6.6° difference — subtle but perceptible. 40mm sits in an underappreciated sweet spot: tighter framing than 35mm with less barrel distortion near edges, but still wide enough for environmental shots. The Voigtlander 40mm f/1.2 and Ricoh GR III (40mm-equivalent on APS-C) have devoted followings. In practice, the choice often comes down to lens availability rather than optical philosophy.
- Iframe params: `?a=35&sa=ff&b=40&sb=ff&embed=1`
- Related: 35mm vs 50mm, 40mm vs 50mm

**`public/compare/40mm-vs-50mm.html`**
- Title: "40mm vs 50mm — Field of View Comparison | FOV Viewer"
- FOV: 40mm = 56.8° H, 50mm = 46.8° H
- Content: 10° of difference — wider than most expect. 40mm captures roughly 21% more width. Some photographers prefer 40mm as a "corrected 50" that gives just enough extra breathing room at the edges without feeling wide. Pancake lenses at 40mm (Canon EF 40mm f/2.8 STM, Pentax DA 40mm) offer an extremely compact normal-ish option. 50mm remains king of depth-of-field isolation at comparable apertures.
- Iframe params: `?a=40&sa=ff&b=50&sb=ff&embed=1`
- Related: 35mm vs 40mm, 50mm vs 85mm

**`public/compare/50mm-vs-85mm.html`**
- Title: "50mm vs 85mm — Field of View Comparison | FOV Viewer"
- FOV: 50mm = 46.8° H, 85mm = 28.6° H
- Content: Two of the most popular prime lenses made. 50mm is the standard normal — affordable, versatile, and fast (f/1.8 models exist for every mount). 85mm is the portrait workhorse — the longer working distance (about 2-3m for a head-and-shoulders) keeps facial proportions flattering, and the narrower FOV simplifies backgrounds. The 18° difference is dramatic when framing a person: 50mm at the same distance as 85mm includes nearly twice the width. Most portrait photographers eventually settle on one or the other, and some carry both.
- Iframe params: `?a=50&sa=ff&b=85&sb=ff&embed=1`
- Related: 35mm vs 50mm, 85mm vs 135mm

**`public/compare/24mm-vs-50mm.html`**
- Title: "24mm vs 50mm — Field of View Comparison | FOV Viewer"
- FOV: 24mm = 84.1° H, 50mm = 46.8° H
- Content: A 37° gap — nearly double the viewing angle. 24mm captures the full environment; 50mm isolates a subject within it. This pair illustrates why zoom lenses in the 24-70mm range are considered versatile: they span from wide environmental shots to tight normal framing. When choosing between two primes, this combination covers the widest usable range without overlap. On APS-C, the equivalents are roughly 36mm and 75mm.
- Iframe params: `?a=24&sa=ff&b=50&sb=ff&embed=1`
- Related: 24mm vs 35mm, 50mm vs 85mm

**`public/compare/85mm-vs-135mm.html`**
- Title: "85mm vs 135mm — Field of View Comparison | FOV Viewer"
- FOV: 85mm = 28.6° H, 135mm = 18.2° H
- Content: Both are portrait focal lengths, but they produce different images. At the same subject distance, 135mm frames tighter — just the face rather than head-and-shoulders. The background compresses more visibly at 135mm, which can either simplify distracting backgrounds or flatten the sense of depth. Working distance increases: where 85mm puts you about 2m from your subject for a head shot, 135mm pushes that to roughly 3.5m. This matters in small studios but is an advantage at events where staying further back is less intrusive.
- Iframe params: `?a=85&sa=ff&b=135&sb=ff&embed=1`
- Related: 50mm vs 85mm, 85mm vs 200mm

**`public/compare/85mm-vs-200mm.html`**
- Title: "85mm vs 200mm — Field of View Comparison | FOV Viewer"
- FOV: 85mm = 28.6° H, 200mm = 12.4° H
- Content: A 16° difference — 200mm captures less than half the width of 85mm. This pairing illustrates the transition from portrait to telephoto. 85mm is handheld-friendly at most shutter speeds; 200mm typically benefits from image stabilization or a monopod, especially at apertures wider than f/4. At 200mm, background elements appear significantly larger relative to the subject — an effect often called "compression" but more accurately described as a consequence of the greater subject distance required for equivalent framing. This reach makes 200mm useful for outdoor portraits, sports sidelines, and distant wildlife.
- Iframe params: `?a=85&sa=ff&b=200&sb=ff&embed=1`
- Related: 85mm vs 135mm, 50mm vs 85mm

**`public/compare/full-frame-vs-apsc.html`**
- Title: "Full Frame vs APS-C at 50mm — Field of View Comparison | FOV Viewer"
- FOV: 50mm FF = 46.8° H, 50mm APS-C (1.5x) = 31.4° H
- Content: The same 50mm lens produces drastically different fields of view on different sensor sizes. On full frame (36×24mm), 50mm gives a 46.8° horizontal FOV — the classic "normal" perspective. On APS-C (23.5×15.6mm, 1.5× crop), that same lens gives 31.4° — equivalent to a 75mm lens on full frame. The lens itself is physically unchanged; the smaller sensor simply captures less of the image circle. This is why crop-sensor cameras are popular for wildlife and sports: they give "free reach" with every lens.
- Iframe params: `?a=50&sa=ff&b=50&sb=apsc_n&embed=1`
- Related: full-frame-vs-m43, 50mm vs 85mm

**`public/compare/full-frame-vs-m43.html`**
- Title: "Full Frame vs Micro Four Thirds at 50mm — Field of View Comparison | FOV Viewer"
- FOV: 50mm FF = 46.8° H, 50mm M4/3 (2.0x) = 24.0° H
- Content: The 2.0× crop factor of Micro Four Thirds (17.3×13mm sensor) turns a 50mm lens into a 100mm full-frame equivalent. That is a dramatic change: 46.8° shrinks to 24.0° — roughly the field of view of a short telephoto on full frame. This is why M4/3 systems like Olympus OM-D and Panasonic Lumix are popular with wildlife and travel photographers who want telephoto reach in a compact body. A 300mm M4/3 lens gives 600mm-equivalent framing. The trade-off: narrower FOV also means wider lenses are harder to achieve. A 12mm M4/3 lens gives only 24mm-equivalent coverage.
- Iframe params: `?a=50&sa=ff&b=50&sb=m43&embed=1`
- Related: full-frame-vs-apsc

- [ ] **Step 3: Verify all pages load**

Run: `npm run build && ls dist/compare/*.html | wc -l`
Expected: `11` (index + 10 comparison pages)

- [ ] **Step 4: Commit**

```bash
git add public/compare/
git commit -m "feat(seo): add 10 comparison landing pages with educational content"
```

---

### Task 13: Learn Index Page

**Files:**
- Create: `public/learn/index.html`

- [ ] **Step 1: Create `public/learn/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Photography Focal Length Guides — FOV Viewer</title>
  <meta name="description" content="Learn about focal lengths, crop factor, lens compression, and how to choose the right lens. Practical guides for landscape, portrait, street, wildlife, and astrophotography.">
  <link rel="canonical" href="https://fov-viewer.iser.io/learn/">
  <link rel="stylesheet" href="/content-styles.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://fov-viewer.iser.io/" },
      { "@type": "ListItem", "position": 2, "name": "Learn" }
    ]
  }
  </script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-GSRBYSNCEJ"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-GSRBYSNCEJ');</script>
</head>
<body>
  <header class="site-header">
    <a href="/" class="site-header__logo">FOV Viewer</a>
    <nav class="site-header__nav">
      <a href="/">Tool</a>
      <a href="/compare/">Compare</a>
      <a href="/learn/" class="active">Learn</a>
    </nav>
  </header>

  <nav class="breadcrumb">
    <a href="/">Home</a> <span>&rsaquo;</span> Learn
  </nav>

  <div class="content">
    <h1>Photography Focal Length Guides</h1>
    <p class="subtitle">Understand how focal length, sensor size, and crop factor shape what your camera sees.</p>

    <h2>Fundamentals</h2>
    <div class="card-grid">
      <a class="card" href="crop-factor-explained.html">
        <h3>Crop Factor Explained</h3>
        <p>How sensor size affects field of view, and what "equivalent focal length" really means.</p>
      </a>
      <a class="card" href="focal-length-guide.html">
        <h3>Focal Length Guide</h3>
        <p>What every focal length from 14mm to 800mm looks like, and when to use each.</p>
      </a>
      <a class="card" href="equivalent-focal-lengths.html">
        <h3>Equivalent Focal Lengths</h3>
        <p>Conversion table across full frame, APS-C, Micro Four Thirds, medium format, and 1-inch sensors.</p>
      </a>
      <a class="card" href="full-frame-vs-apsc.html">
        <h3>Full Frame vs APS-C</h3>
        <p>Practical differences in field of view, depth of field, and lens selection.</p>
      </a>
      <a class="card" href="how-to-choose-a-focal-length.html">
        <h3>How to Choose a Focal Length</h3>
        <p>A decision framework for picking the right lens based on what you shoot.</p>
      </a>
    </div>

    <h2>Optical Concepts</h2>
    <div class="card-grid">
      <a class="card" href="understanding-lens-compression.html">
        <h3>Understanding Lens Compression</h3>
        <p>Why telephoto shots look "compressed" — and why it's really about distance, not focal length.</p>
      </a>
      <a class="card" href="wide-angle-vs-telephoto.html">
        <h3>Wide Angle vs Telephoto</h3>
        <p>How focal length changes perspective, distortion, and the spatial relationship between elements.</p>
      </a>
      <a class="card" href="prime-vs-zoom-lenses.html">
        <h3>Prime vs Zoom Lenses</h3>
        <p>Fixed focal length vs variable — trade-offs in sharpness, speed, size, and versatility.</p>
      </a>
    </div>

    <h2>Best Focal Lengths by Genre</h2>
    <div class="card-grid">
      <a class="card" href="best-focal-lengths-landscape.html">
        <h3>Landscape Photography</h3>
        <p>14mm to 35mm — wide angles that capture the full scene.</p>
      </a>
      <a class="card" href="best-focal-lengths-portrait.html">
        <h3>Portrait Photography</h3>
        <p>50mm to 135mm — flattering perspective and background separation.</p>
      </a>
      <a class="card" href="best-focal-lengths-street.html">
        <h3>Street Photography</h3>
        <p>28mm to 50mm — the eternal debate over the perfect street lens.</p>
      </a>
      <a class="card" href="best-focal-lengths-wildlife.html">
        <h3>Wildlife Photography</h3>
        <p>200mm to 600mm — reaching distant subjects without disturbing them.</p>
      </a>
      <a class="card" href="best-focal-lengths-astrophotography.html">
        <h3>Astrophotography</h3>
        <p>14mm to 24mm — wide fields for the Milky Way, and the 500 rule for star trails.</p>
      </a>
    </div>
  </div>

  <footer class="site-footer">
    <a href="/">Tool</a>
    <a href="/compare/">Compare</a>
    <a href="/learn/">Learn</a>
    <a href="https://github.com/kevinkiklee/fov-viewer" target="_blank" rel="noopener">GitHub</a>
  </footer>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add public/learn/index.html
git commit -m "feat(seo): add learn articles index page"
```

---

### Task 14: Learn Article — Crop Factor Explained

**Files:**
- Create: `public/learn/crop-factor-explained.html`

This is the first and most detailed learn article. It serves as the template for all subsequent learn articles. Every learn article must include:
1. Correct `<head>` with title, description, canonical, BreadcrumbList + Article JSON-LD, GA tag
2. Shared header/nav and footer
3. Breadcrumb
4. 800-1500 words of original, factually accurate content
5. At least one embedded tool iframe
6. At least one inline SVG diagram or data table
7. "Try it yourself" CTA
8. Related links to other articles and comparison pages

- [ ] **Step 1: Create the full article page**

Write `public/learn/crop-factor-explained.html` with complete content about crop factor. The article must cover:

- What crop factor is (ratio of sensor diagonal to 36×24mm diagonal)
- Exact crop factors: MF 44×33mm = 0.79×, FF 36×24mm = 1.0×, APS-C Nikon/Sony 23.5×15.6mm = 1.5×, APS-C Canon 22.2×14.8mm = 1.6×, M4/3 17.3×13mm = 2.0×, 1" 13.2×8.8mm = 2.7×
- How crop factor affects FOV (multiply focal length by crop factor for FF-equivalent FOV)
- What crop factor does NOT change: actual focal length, optical characteristics, aperture light-gathering
- Common misconception: crop factor does NOT affect depth of field in terms of total light or f-number — but it does change the equivalent FOV, which changes framing distance, which in turn affects apparent depth of field at the same framing
- Include an inline SVG showing relative sensor sizes
- Include a table of equivalent focal lengths across all sensor sizes
- Include an embedded iframe comparing 50mm on FF vs 50mm on APS-C

The article must be factually accurate. Key facts to verify:
- FOV formula: `2 * atan(sensorDimension / (2 * focalLength))` in radians, convert to degrees
- Crop factor = diag(36×24) / diag(sensor) = 43.27mm / sensor_diagonal
- 50mm on 1.5× APS-C = 75mm equivalent FOV (NOT 75mm focal length)

- [ ] **Step 2: Commit**

```bash
git add public/learn/crop-factor-explained.html
git commit -m "feat(seo): add crop factor explained article"
```

---

### Task 15: Learn Article — Focal Length Guide

**Files:**
- Create: `public/learn/focal-length-guide.html`

- [ ] **Step 1: Create the article**

Content must cover what each focal length range looks like in practice on a full-frame sensor:
- Ultra-wide (14-20mm): dramatic perspective, strong distortion, landscape/architecture
- Wide (24-35mm): versatile wide angle, street/travel/environmental
- Normal (40-50mm): closest to human vision, everyday shooting
- Short telephoto (85-135mm): portraits, event photography, compression begins
- Telephoto (200mm): sports sidelines, outdoor portraits, wildlife
- Super-telephoto (400-800mm): wildlife, birding, astronomy

For each range: horizontal FOV in degrees, typical use cases, practical considerations (handholding, IS, tripod). Include a comprehensive FOV table from 14mm to 800mm.

Include an embedded iframe showing the widest (14mm) vs narrowest (800mm) for dramatic effect.

Include an inline SVG showing the angular coverage of each focal length range as nested rectangles or angle arcs.

- [ ] **Step 2: Commit**

```bash
git add public/learn/focal-length-guide.html
git commit -m "feat(seo): add focal length guide article"
```

---

### Task 16: Learn Article — Full Frame vs APS-C

**Files:**
- Create: `public/learn/full-frame-vs-apsc.html`

- [ ] **Step 1: Create the article**

Content: practical differences between FF and APS-C for photographers choosing a system. Cover:
- Sensor dimensions (36×24mm vs 23.5×15.6mm Nikon/Sony, 22.2×14.8mm Canon)
- FOV difference at common focal lengths (table: 24mm, 35mm, 50mm, 85mm on each)
- Depth of field considerations (same framing = different distance = different DoF)
- Low light / high ISO (larger sensor = more light per pixel at same resolution)
- Lens selection differences (FF lenses on crop body, dedicated crop lenses)
- Size and cost trade-offs
- When APS-C is actually advantageous (reach for wildlife/sports)

Iframe: `?a=50&sa=ff&b=50&sb=apsc_n&embed=1`

- [ ] **Step 2: Commit**

```bash
git add public/learn/full-frame-vs-apsc.html
git commit -m "feat(seo): add full frame vs APS-C article"
```

---

### Task 17: Learn Article — How to Choose a Focal Length

**Files:**
- Create: `public/learn/how-to-choose-a-focal-length.html`

- [ ] **Step 1: Create the article**

This article gets `HowTo` JSON-LD in addition to Article and BreadcrumbList. Content provides a decision framework:
1. What do you shoot most? (genre → focal length range)
2. What sensor do you use? (crop factor adjustment)
3. Do you prefer primes or zooms? (trade-offs)
4. What's your budget? (50mm f/1.8 is cheapest fast prime on every system)
5. Start with one versatile lens, add specialized ones later

Include a decision flowchart as inline SVG. Include a table mapping genres to recommended focal lengths on both FF and APS-C.

- [ ] **Step 2: Commit**

```bash
git add public/learn/how-to-choose-a-focal-length.html
git commit -m "feat(seo): add how to choose a focal length article"
```

---

### Task 18: Learn Article — Best Focal Lengths for Landscape

**Files:**
- Create: `public/learn/best-focal-lengths-landscape.html`

- [ ] **Step 1: Create the article**

Cover 14mm, 20mm, 24mm, 35mm for landscapes. Discuss:
- Ultra-wide (14-20mm): dramatic foreground-to-background scale, useful when foreground interest is close. Risk of "empty center" if no strong leading element.
- 24mm: the versatile landscape standard. Wide enough without extreme distortion.
- 35mm: tighter compositions, works when the subject is a specific feature rather than the whole panorama.
- Filters and focal length (ultra-wide = large/expensive filters, 24mm works with standard 77mm filter systems)
- Focus stacking and hyperfocal distance considerations
- APS-C equivalents for each

Iframe: `?a=14&sa=ff&b=35&sb=ff&embed=1`

- [ ] **Step 2: Commit**

```bash
git add public/learn/best-focal-lengths-landscape.html
git commit -m "feat(seo): add best focal lengths for landscape article"
```

---

### Task 19: Learn Article — Best Focal Lengths for Portrait

**Files:**
- Create: `public/learn/best-focal-lengths-portrait.html`

- [ ] **Step 1: Create the article**

Cover 35mm, 50mm, 85mm, 105mm, 135mm for portraits. Discuss:
- 35mm: environmental portraits, shows context, some perspective distortion on close headshots
- 50mm: the affordable portrait prime, natural perspective, works at medium distance
- 85mm: the gold standard. Working distance ~2-3m for head-and-shoulders. Flattering perspective.
- 105mm: popular macro-portrait dual purpose (Nikon 105mm f/2.8 VR, Sony 90mm f/2.8)
- 135mm: tight headshots, strong background compression, needs more room
- Aperture matters: f/1.4 vs f/1.8 vs f/2.8 — depth of field and background blur
- APS-C equivalents and recommended lenses

Iframe: `?a=50&sa=ff&b=85&sb=ff&embed=1`

- [ ] **Step 2: Commit**

```bash
git add public/learn/best-focal-lengths-portrait.html
git commit -m "feat(seo): add best focal lengths for portrait article"
```

---

### Task 20: Learn Article — Best Focal Lengths for Street

**Files:**
- Create: `public/learn/best-focal-lengths-street.html`

- [ ] **Step 1: Create the article**

Cover 28mm, 35mm, 40mm, 50mm for street photography. Discuss:
- 28mm: classic Leica/Ricoh GR focal length. Wide enough to shoot from the hip. Includes lots of context.
- 35mm: Henri Cartier-Bresson's choice. Balances context and subject prominence.
- 40mm: the "pancake" focal length. Compact lenses, slightly tighter framing. Ricoh GR III (APS-C, 40mm equiv).
- 50mm: isolates subjects more, requires more deliberate composition, less "in the scene" feeling
- Zone focusing and depth of field at each focal length
- Stealth factor: smaller lens = less intimidating

Iframe: `?a=28&sa=ff&b=50&sb=ff&embed=1` (note: 28mm is not a preset but can be set via params)

- [ ] **Step 2: Commit**

```bash
git add public/learn/best-focal-lengths-street.html
git commit -m "feat(seo): add best focal lengths for street article"
```

---

### Task 21: Learn Article — Best Focal Lengths for Wildlife

**Files:**
- Create: `public/learn/best-focal-lengths-wildlife.html`

- [ ] **Step 1: Create the article**

Cover 200mm, 400mm, 600mm, 800mm for wildlife. Discuss:
- 200mm: entry-level wildlife, works for larger or closer animals (deer, zoo)
- 400mm: the versatile wildlife lens. f/2.8 versions are professional standards (heavy, expensive). f/5.6 or f/6.3 versions are more accessible.
- 600mm: serious birding and small wildlife. Tripod/gimbal recommended.
- 800mm: extreme reach for shy subjects. Often achieved via teleconverters (400mm + 2× TC).
- Crop sensor advantage: APS-C at 400mm = 600mm equivalent. M4/3 at 300mm = 600mm equivalent. This is why the Olympus 300mm f/4 (600mm equiv) is popular with birders.
- Teleconverters: 1.4× and 2× — trade-offs (reach vs aperture vs sharpness)
- Minimum focus distance matters for wildlife

Iframe: `?a=200&sa=ff&b=600&sb=ff&embed=1`

- [ ] **Step 2: Commit**

```bash
git add public/learn/best-focal-lengths-wildlife.html
git commit -m "feat(seo): add best focal lengths for wildlife article"
```

---

### Task 22: Learn Article — Best Focal Lengths for Astrophotography

**Files:**
- Create: `public/learn/best-focal-lengths-astrophotography.html`

- [ ] **Step 1: Create the article**

Cover 14mm, 20mm, 24mm for Milky Way and night sky. Discuss:
- 14mm: maximum sky coverage, captures the full Milky Way arc. Strong coma in corners on budget lenses.
- 20mm: good balance of sky coverage and star size. Popular choices: Sigma 20mm f/1.4, Nikon Z 20mm f/1.8.
- 24mm: tighter compositions of specific Milky Way regions or conjunctions.
- The 500 rule (and NPF rule): max exposure time = 500 / (focal_length × crop_factor). At 20mm on FF: 25 seconds. At 20mm on APS-C: 16.7 seconds. These are approximate — pixel density and viewing size affect visible trailing.
- Aperture is critical: f/1.4 vs f/2.8 = 4× more light = the difference between a 10-second and 40-second exposure at the same ISO
- Sensor size matters for noise: larger pixels = less noise at high ISO
- Coma and sagittal astigmatism: how they affect star shapes at wide apertures

Iframe: `?a=14&sa=ff&b=24&sb=ff&embed=1`

- [ ] **Step 2: Commit**

```bash
git add public/learn/best-focal-lengths-astrophotography.html
git commit -m "feat(seo): add best focal lengths for astrophotography article"
```

---

### Task 23: Learn Article — Understanding Lens Compression

**Files:**
- Create: `public/learn/understanding-lens-compression.html`

- [ ] **Step 1: Create the article**

**This article must get the science right.** The key fact: what photographers call "compression" is a function of camera-to-subject distance, NOT focal length directly. A 200mm lens and a 50mm lens at the same position produce identical perspective — the 200mm just crops tighter. The "compression" effect happens because telephoto lenses are typically used from farther away, which reduces the apparent size difference between near and far objects.

Cover:
- What compression looks like: background appears larger relative to subject
- Why it happens: greater distance → smaller angular difference between foreground and background
- The proof: crop a 24mm image to match 200mm framing from the same position — perspective is identical
- Why this matters: if you want to change perspective, you move your feet. If you want to change framing, you change focal length.
- Practical applications: using compression intentionally (telephoto for stacking buildings, wide angle for emphasizing scale)

Include an SVG diagram showing two viewing positions and how the angular relationships change.

Iframe: `?a=24&sa=ff&b=200&sb=ff&embed=1`

- [ ] **Step 2: Commit**

```bash
git add public/learn/understanding-lens-compression.html
git commit -m "feat(seo): add understanding lens compression article"
```

---

### Task 24: Learn Article — Equivalent Focal Lengths

**Files:**
- Create: `public/learn/equivalent-focal-lengths.html`

- [ ] **Step 1: Create the article**

This is a reference-heavy article. Include a comprehensive conversion table:

| Focal Length | MF (0.79×) | FF (1.0×) | APS-C N/S (1.5×) | APS-C Canon (1.6×) | M4/3 (2.0×) | 1" (2.7×) |
|---|---|---|---|---|---|---|
| 8mm | 6mm | 8mm | 12mm | 13mm | 16mm | 22mm |
| 14mm | 11mm | 14mm | 21mm | 22mm | 28mm | 38mm |
| 20mm | 16mm | 20mm | 30mm | 32mm | 40mm | 54mm |
| 24mm | 19mm | 24mm | 36mm | 38mm | 48mm | 65mm |
| 35mm | 28mm | 35mm | 53mm | 56mm | 70mm | 95mm |
| 40mm | 32mm | 40mm | 60mm | 64mm | 80mm | 108mm |
| 50mm | 40mm | 50mm | 75mm | 80mm | 100mm | 135mm |
| 85mm | 67mm | 85mm | 128mm | 136mm | 170mm | 230mm |
| 135mm | 107mm | 135mm | 203mm | 216mm | 270mm | 365mm |
| 200mm | 158mm | 200mm | 300mm | 320mm | 400mm | 540mm |
| 400mm | 316mm | 400mm | 600mm | 640mm | 800mm | 1080mm |
| 600mm | 474mm | 600mm | 900mm | 960mm | 1200mm | 1620mm |

Note: table values = focal_length × crop_factor, rounded to nearest mm. These represent the FF-equivalent field of view, NOT the actual focal length.

Explain:
- How to read the table (find your lens, find your sensor, read the equivalent)
- What "equivalent" means (same FOV, not same lens behavior)
- What does NOT change: minimum focus distance, aperture light-gathering, optical aberrations

Iframe: `?a=50&sa=ff&b=50&sb=m43&embed=1`

- [ ] **Step 2: Commit**

```bash
git add public/learn/equivalent-focal-lengths.html
git commit -m "feat(seo): add equivalent focal lengths article with conversion table"
```

---

### Task 25: Learn Article — Wide Angle vs Telephoto

**Files:**
- Create: `public/learn/wide-angle-vs-telephoto.html`

- [ ] **Step 1: Create the article**

Cover the fundamental differences in how wide and telephoto lenses render scenes:
- Wide angle (14-35mm): exaggerates distance between near/far, makes near objects appear larger, stretches edges, expands apparent space
- Telephoto (85-800mm): flattens depth, makes distant objects appear closer together, isolates subjects
- Perspective distortion vs barrel/pincushion distortion (different things — perspective is geometry, barrel is lens design)
- When to use each: wide for "being in the scene," tele for "observing the scene"
- The relationship between focal length and working distance

Include comparative iframe showing 24mm vs 200mm.

- [ ] **Step 2: Commit**

```bash
git add public/learn/wide-angle-vs-telephoto.html
git commit -m "feat(seo): add wide angle vs telephoto article"
```

---

### Task 26: Learn Article — Prime vs Zoom Lenses

**Files:**
- Create: `public/learn/prime-vs-zoom-lenses.html`

- [ ] **Step 1: Create the article**

Cover trade-offs:
- Primes: typically sharper (fewer optical elements), faster maximum aperture (f/1.4, f/1.8), lighter, cheaper, forces compositional discipline
- Zooms: versatility (one lens covers a range), convenience (no lens changes), modern zooms are optically excellent, heavier, slower maximum aperture (f/2.8-f/4 typical for pro zooms)
- The "holy trinity" zoom concept: 14-24mm, 24-70mm, 70-200mm
- When primes win: low light, shallow DoF, size/weight constraints, specific focal lengths you know you need
- When zooms win: events, travel, situations where you can't move or predict framing
- Cost comparison at equivalent quality levels

No iframe needed for this article — it's conceptual.

- [ ] **Step 2: Commit**

```bash
git add public/learn/prime-vs-zoom-lenses.html
git commit -m "feat(seo): add prime vs zoom lenses article"
```

---

### Task 27: CSP Update for Embed Iframes

**Files:**
- Modify: `index.html`

The content pages embed iframes pointing to the main app. The current CSP (`default-src 'self'`) may block this. We need to add `frame-ancestors` to allow the content pages to embed the app.

- [ ] **Step 1: Update CSP in `index.html`**

Add `frame-src 'self'` to the CSP meta tag, and add `frame-ancestors 'self' https://fov-viewer.iser.io` to allow embedding from the same origin and from external sites:

Update the CSP line to:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com; frame-ancestors 'self' https://fov-viewer.iser.io *" />
```

Note: `frame-ancestors *` allows anyone to embed (needed for the blog embed feature). If you want to restrict, use specific domains.

Note: `frame-ancestors` in a `<meta>` tag is NOT supported by browsers — it only works in HTTP headers. Since we're on GitHub Pages and can't set headers, remove the `frame-ancestors` directive. Instead, ensure there's no `X-Frame-Options` header (GitHub Pages doesn't set one by default). The `frame-src 'self'` is what matters for the app loading iframes of itself.

Actually, since both the iframe source and the parent are on the same origin (`fov-viewer.iser.io`), no CSP changes are needed for same-origin iframes. For external embedders, GitHub Pages doesn't send `X-Frame-Options` by default, so external embedding will work.

Skip this change — no CSP modification needed.

- [ ] **Step 2: Verify iframe works**

Run: `npm run dev` and open a comparison page — verify the iframe loads.

- [ ] **Step 3: Commit (if any changes)**

No commit needed if no changes.

---

### Task 28: Final Build Verification and Deploy

**Files:** None modified — this is a verification task.

- [ ] **Step 1: Run full CI pipeline locally**

```bash
npm run lint && npm test && npm run build
```

Expected: All pass.

- [ ] **Step 2: Verify all content pages are in the build**

```bash
ls dist/robots.txt dist/sitemap.xml dist/manifest.json dist/content-styles.css
ls dist/compare/*.html | wc -l
ls dist/learn/*.html | wc -l
ls dist/404.html
```

Expected:
- robots.txt, sitemap.xml, manifest.json, content-styles.css all exist
- 11 compare HTML files (index + 10 comparisons)
- 14 learn HTML files (index + 13 articles)
- 404.html exists

- [ ] **Step 3: Spot-check a content page**

```bash
grep -c 'BreadcrumbList' dist/compare/50mm-vs-85mm.html
grep -c 'application/ld+json' dist/learn/crop-factor-explained.html
```

Expected: Both return at least `1`

- [ ] **Step 4: Commit and push**

```bash
git push
```

- [ ] **Step 5: After deploy, remind user to submit sitemap to Google Search Console**

Post-deploy action: Go to https://search.google.com/search-console, add the property `fov-viewer.iser.io` if not already added, and submit `https://fov-viewer.iser.io/sitemap.xml`.

---

## Implementation Notes

**Content quality:** Every learn article must be 800-1500 words of original, factually accurate content. Write as a working photographer teaching other photographers — not as marketing copy. Every sentence should teach something. No filler phrases like "in this article we will explore."

**Factual accuracy checklist for every article:**
- Crop factors: MF=0.79, FF=1.0, APS-C N/S=1.5, APS-C Canon=1.6, M4/3=2.0, 1"=2.7
- FOV formula: `2 × atan(sensorDim / (2 × focalLength × cropFactor))` in radians → degrees
- Sensor dimensions: FF=36×24, APS-C N/S=23.5×15.6, APS-C Canon=22.2×14.8, M4/3=17.3×13, 1"=13.2×8.8, MF=44×33
- Lens compression is a function of DISTANCE, not focal length
- "Equivalent focal length" affects FOV only — not actual focal length, not aperture light-gathering, not minimum focus distance

**SVG diagrams:** Create inline SVGs directly in the HTML. No external SVG files. Keep them simple and clear — sensor size rectangles, FOV angle arcs, decision flowcharts.

**Inline CSS note:** Content pages use `/content-styles.css` (served from `public/`). They do NOT use the Vite-built CSS. This is intentional — content pages are standalone HTML with no build step.
