# SEO Improvements Design Spec

## Goal

Make FOV Viewer discoverable through search engines for photographers searching focal length comparisons, FOV calculators, crop factor info, and lens education content. Target three query types: comparison ("24mm vs 50mm"), tool ("focal length calculator"), and learning ("how does crop factor work").

## Constraint

Static GitHub Pages SPA — no server-side rendering, no backend. All solutions must work with client-side React + static files.

## Architecture

The core challenge: React renders into an empty `<div id="root">`, so crawlers see a blank page. The strategy is three-layered:

1. **Crawlable static HTML** inside `#root` that React replaces on mount
2. **Static content pages** (learn articles, comparison landing pages) as standalone HTML files in `public/`
3. **Technical SEO signals** (structured data, meta tags, robots, sitemap, performance)

---

## Tier 1: Core SEO (highest impact)

### 1.1 Static HTML in `#root`

Add semantic HTML inside `<div id="root">` in `index.html`. React's `createRoot().render()` replaces this content on mount, so users see the normal app. Crawlers see:

- `<h1>` — "Camera Field of View & Focal Length Comparison Tool"
- `<p>` — keyword-rich description covering focal lengths (14mm–800mm), sensor sizes (full frame, APS-C, Micro Four Thirds, medium format), crop factor, and use cases
- `<noscript>` — fallback message for no-JS crawlers
- Structured data (`WebApplication` JSON-LD) in `<script type="application/ld+json">`

### 1.2 Technical SEO Files

**`public/robots.txt`:**
```
User-agent: *
Allow: /
Sitemap: https://fov-viewer.iser.io/sitemap.xml
```

**`public/sitemap.xml`:**
Static sitemap listing:
- Main tool page: `https://fov-viewer.iser.io/`
- All comparison pages (10 pages)
- All learn articles (13 pages)
- Updated `<lastmod>` on each deploy (manual, update when content changes)

**Canonical URL:**
Add `<link rel="canonical" href="https://fov-viewer.iser.io/">` to `index.html` `<head>`.

### 1.3 Enhanced Meta Tags

Update `<title>`:
```
FOV Viewer — Camera Field of View & Focal Length Comparison Tool
```

Update `<meta name="description">`:
```
Free tool to visualize and compare camera field of view across focal lengths (14mm to 800mm) and sensor sizes (full frame, APS-C, Micro Four Thirds). See what 24mm vs 85mm actually looks like. Understand crop factor and equivalent focal lengths.
```

Add `<meta name="keywords">`:
```
focal length comparison, field of view calculator, crop factor calculator, camera FOV, 24mm vs 50mm, 35mm vs 85mm, full frame vs APS-C, lens comparison tool, photography tool, focal length visualizer
```

### 1.4 FAQ Section with Structured Data

Add a `<section>` with FAQ items inside `#root` using `<details>`/`<summary>` HTML elements. Crawlable, replaced by React on mount.

FAQ items:
- "What is field of view in photography?"
- "How does crop factor affect field of view?"
- "What is the difference between full frame and APS-C?"
- "What focal length is best for portraits?"
- "What focal length is best for landscape photography?"
- "How do I compare two focal lengths?"
- "What does 50mm look like on a crop sensor?"

Add `FAQPage` JSON-LD structured data for these questions. Google can display these as expandable rich results.

### 1.5 Performance Preloads

Add to `<head>`:
- `<link rel="preconnect" href="https://www.googletagmanager.com">` — GA connection
- `<link rel="preload">` for the default scene image (the landscape/boat image) — improves LCP
- `<link rel="dns-prefetch" href="https://www.google-analytics.com">`

### 1.6 Semantic HTML in React Components

Update React component output:
- Wrap app in `<main>`
- Use `<header>` for the app title bar
- Use `<aside>` for the sidebar
- Use `<section>` for the canvas area
- Add `aria-label` on the canvas element describing current comparison (e.g., "Field of view comparison: 20mm vs 35mm on full frame sensor")
- Add `role` attributes where appropriate

### 1.7 Dynamic Title and Meta from URL Params

When URL contains lens configuration params (`?a=50&sa=ff&b=85`):
- Update `document.title` to: "50mm vs 85mm (Full Frame) — FOV Viewer"
- Update `<meta name="description">` via DOM to describe the specific comparison
- This makes every shared link a unique "page" if Google indexes it

---

## Tier 2: Content Pages (multiplier)

### 2.1 Comparison Landing Pages

Pre-generate 10 static HTML pages in `public/compare/`:

| File | Title | Params link |
|------|-------|-------------|
| `24mm-vs-35mm.html` | 24mm vs 35mm — Field of View Comparison | `?a=24&b=35` |
| `35mm-vs-50mm.html` | 35mm vs 50mm — Field of View Comparison | `?a=35&b=50` |
| `35mm-vs-40mm.html` | 35mm vs 40mm — Field of View Comparison | `?a=35&b=40` |
| `40mm-vs-50mm.html` | 40mm vs 50mm — Field of View Comparison | `?a=40&b=50` |
| `50mm-vs-85mm.html` | 50mm vs 85mm — Field of View Comparison | `?a=50&b=85` |
| `24mm-vs-50mm.html` | 24mm vs 50mm — Field of View Comparison | `?a=24&b=50` |
| `85mm-vs-135mm.html` | 85mm vs 135mm — Field of View Comparison | `?a=85&b=135` |
| `85mm-vs-200mm.html` | 85mm vs 200mm — Field of View Comparison | `?a=85&b=200` |
| `full-frame-vs-apsc.html` | Full Frame vs APS-C at 50mm — FOV Comparison | `?a=50&sa=ff&b=50&sb=apsc_n` |
| `full-frame-vs-m43.html` | Full Frame vs Micro Four Thirds at 50mm | `?a=50&sa=ff&b=50&sb=m43` |

Each page contains:
- Unique `<title>` and `<meta description>` targeting the comparison query
- `<h1>` with the comparison
- 2-3 paragraphs of original educational content about when you'd choose each focal length
- A prominent "Try it in the tool" CTA link with the correct query params
- `<link rel="canonical">` pointing to itself
- Breadcrumb navigation: Home > Compare > [this comparison]
- Internal links to related comparisons and relevant learn articles
- Shared header/footer with navigation to main tool and other pages
- `BreadcrumbList` JSON-LD structured data

### 2.2 Educational Content Pages

13 static HTML pages in `public/learn/`:

| File | Title |
|------|-------|
| `crop-factor-explained.html` | Crop Factor Explained — How Sensor Size Affects Field of View |
| `focal-length-guide.html` | Focal Length Guide — What Every Focal Length Looks Like |
| `full-frame-vs-apsc.html` | Full Frame vs APS-C — Practical Differences for Photographers |
| `how-to-choose-a-focal-length.html` | How to Choose a Focal Length — Beginner's Guide |
| `best-focal-lengths-landscape.html` | Best Focal Lengths for Landscape Photography |
| `best-focal-lengths-portrait.html` | Best Focal Lengths for Portrait Photography |
| `best-focal-lengths-street.html` | Best Focal Lengths for Street Photography |
| `best-focal-lengths-wildlife.html` | Best Focal Lengths for Wildlife Photography |
| `best-focal-lengths-astrophotography.html` | Best Focal Lengths for Astrophotography |
| `understanding-lens-compression.html` | Understanding Lens Compression — How Focal Length Changes Perspective |
| `equivalent-focal-lengths.html` | Equivalent Focal Lengths Across Sensor Sizes — Conversion Table |
| `wide-angle-vs-telephoto.html` | Wide Angle vs Telephoto — How Focal Length Changes Perspective |
| `prime-vs-zoom-lenses.html` | Prime vs Zoom Lenses — Focal Length Trade-offs |

Each page contains:
- Unique `<title>` and `<meta description>` targeting the learning query
- `<h1>`, `<h2>` structure with keyword-rich headings
- 800-1500 words of original educational content (longer = better for SEO on informational queries)
- Professional editorial tone — written as if by a working photographer, not a marketing bot. Cite specific real-world scenarios, name real lens models where relevant, use precise technical language. No filler phrases ("in this article we will explore..."), no listicle fluff. Every sentence should teach something.
- **Factual accuracy is critical.** All FOV math, crop factor numbers, sensor dimensions, and optical principles must be physically correct. Double-check: crop factors (FF=1.0, APS-C Nikon/Sony=1.5, APS-C Canon=1.6, M4/3=2.0, 1"=2.7, MF 44x33=0.79), the rectilinear FOV formula, and lens compression (which is a function of distance, not focal length — a common misconception to address correctly).
- **Illustrations and visuals in every article:**
  - Embedded FOV Viewer tool comparisons via `<iframe>` with `?embed=1` and relevant presets (e.g., crop factor article embeds `?a=50&sa=ff&b=50&sb=apsc_n&embed=1`)
  - Diagrams created as inline SVGs: sensor size comparison chart, FOV angle diagrams, crop factor multiplication visual, focal length vs perspective diagram
  - Comparison image pairs using the app's existing scene photos cropped to illustrate the point (e.g., "here's what 24mm vs 85mm looks like on the same scene")
  - Tables for reference data (equivalent focal lengths across sensors, FOV angles at common focal lengths)
- "Try it yourself" CTA links opening the tool with relevant presets
- Internal links to related articles and comparison pages
- Breadcrumb navigation: Home > Learn > [this article]
- `BreadcrumbList` JSON-LD structured data
- `Article` JSON-LD structured data with author, datePublished

### 2.3 Structured Data Expansion

In addition to per-page schemas above:
- `FAQPage` schema on the main tool page (from Section 1.4)
- `BreadcrumbList` schema on all comparison and learn pages
- `Article` schema on all learn pages
- `WebApplication` schema on the main tool page
- `HowTo` schema on the "How to Choose a Focal Length" page

---

## Tier 3: Signals and Growth

### 3.1 Image SEO

- Rename scene image files to descriptive names:
  - `person.jpg` → `landscape-boat-lake.jpg`
  - `portrait.jpg` → `portrait-woman.jpg`
  - `bird2.jpg` → `wildlife-condor.jpg`
  - `city.jpg` → `city-street.jpg`
  - `milkyway.jpg` → `milky-way-night-sky.jpg`
- Update `src/data/scenes.ts` with new filenames
- Set `aria-label` on canvas dynamically: "Field of view comparison: [lens A config] vs [lens B config], [scene name] scene"

### 3.2 Dynamic OG Tags for Shared Configs

When URL has lens params, update OG meta tags via DOM:
- `og:title` → "50mm vs 85mm (Full Frame) — FOV Viewer"
- `og:description` → "See the field of view difference between 50mm and 85mm on a full frame sensor"
- `og:url` → current URL with params

Note: Many social platforms don't execute JS for OG tags, so this mainly helps Google and platforms that do. The static fallback OG tags remain for platforms that don't.

### 3.3 Embeddable Widget / Share Snippets

Add a "Share / Embed" option in the ActionBar that generates:
- **Direct link** — current URL with params (already exists as "Copy Link")
- **Markdown snippet** — `[50mm vs 85mm FOV Comparison](https://fov-viewer.iser.io/?a=50&b=85)` for Reddit/forums
- **BBCode snippet** — `[url=...]50mm vs 85mm FOV Comparison[/url]` for photography forums
- **HTML embed** — `<iframe src="https://fov-viewer.iser.io/?a=50&b=85&embed=1" width="800" height="600"></iframe>`

When `?embed=1` is in the URL, hide the sidebar and show only the canvas with a small "Powered by FOV Viewer" attribution link. This enables blog embeds that link back.

### 3.4 PWA Manifest

Add `public/manifest.json`:
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

Add `<link rel="manifest" href="/manifest.json">` to `index.html`.
Generate icon PNGs from the existing camera emoji favicon (192x192 and 512x512).

### 3.5 Hreflang Tag

Add to `<head>`:
```html
<link rel="alternate" hreflang="en" href="https://fov-viewer.iser.io/" />
<link rel="alternate" hreflang="x-default" href="https://fov-viewer.iser.io/" />
```

### 3.6 Improved 404 Page

Replace the current JS-redirect `404.html` with a proper page containing:
- "Page not found" message
- Links to: main tool, popular comparisons, learn articles
- Same header/footer as content pages
- Retains the JS redirect for SPA route handling, but wrapped in meaningful HTML

### 3.7 Navigation and Internal Linking

Add a shared HTML structure for content pages:
- Header with: FOV Viewer logo/link, "Tool", "Compare", "Learn" navigation
- Footer with: links to all sections, GitHub repo link, copyright
- This creates a site-wide internal link structure that distributes page authority

The compare and learn index pages (`/compare/index.html`, `/learn/index.html`) list all available pages in their section.

---

## File Structure

```
public/
  robots.txt
  sitemap.xml
  manifest.json
  icon-192.png
  icon-512.png
  og-image.jpg (existing)
  CNAME (existing)
  404.html (updated)
  compare/
    index.html
    24mm-vs-35mm.html
    35mm-vs-50mm.html
    35mm-vs-40mm.html
    40mm-vs-50mm.html
    50mm-vs-85mm.html
    24mm-vs-50mm.html
    85mm-vs-135mm.html
    85mm-vs-200mm.html
    full-frame-vs-apsc.html
    full-frame-vs-m43.html
  learn/
    index.html
    crop-factor-explained.html
    focal-length-guide.html
    full-frame-vs-apsc.html
    how-to-choose-a-focal-length.html
    best-focal-lengths-landscape.html
    best-focal-lengths-portrait.html
    best-focal-lengths-street.html
    best-focal-lengths-wildlife.html
    best-focal-lengths-astrophotography.html
    understanding-lens-compression.html
    equivalent-focal-lengths.html
    wide-angle-vs-telephoto.html
    prime-vs-zoom-lenses.html
index.html (updated)
src/
  assets/ (renamed image files)
  components/
    Canvas.tsx (semantic HTML, aria-label)
    ActionBar.tsx (embed/share snippets)
    EmbedMode.tsx (new — minimal canvas-only view)
  App.tsx (semantic HTML wrappers, dynamic title/meta)
  data/
    scenes.ts (updated filenames)
```

## Content Pages Shared Template

All compare and learn pages share a consistent HTML template:
- Same `<head>` structure (charset, viewport, GA tag, page-specific title/meta/canonical/structured data)
- Header nav: Home | Compare | Learn
- Main content area
- Footer: links, GitHub, copyright
- Minimal inline CSS for typography and layout (no build step — these are standalone HTML)
- Mobile-responsive via simple CSS

## What This Does NOT Include

- Server-side rendering or framework migration
- RSS feed
- Paid SEO tools or services
- Backlink outreach strategy (though the embed widget enables organic backlinks)
- Google Search Console setup (manual step for the user — submit sitemap at https://search.google.com/search-console after deploy)
