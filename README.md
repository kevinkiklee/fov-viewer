# PhotoTools

Free photography calculators, simulators, and references. No sign-up, no uploads — everything runs in your browser.

**[www.phototools.io](https://www.phototools.io)**

---

## What is PhotoTools?

PhotoTools is a collection of interactive tools that help photographers understand and visualize core concepts — field of view, depth of field, exposure, color theory, white balance, and more. Each tool includes an educational Learn panel with beginner and in-depth explanations, key factors, pro tips, and interactive quiz challenges.

All image processing happens client-side. Photos you load into the EXIF Viewer, Histogram, Frame Studio, or any other tool never leave your device.

## Tools

### Visualizers

| Tool | Description |
|------|-------------|
| **[FOV Simulator](https://www.phototools.io/fov-simulator)** | Compare field of view across up to four lens/sensor combinations overlaid on real-world scenes. Plan lens purchases and understand how focal length and sensor size affect framing. |
| **[Color Scheme Generator](https://www.phototools.io/color-scheme-generator)** | Build harmonious color palettes using complementary, analogous, triadic, split-complementary, and tetradic relationships. Pick colors from uploaded photos or the color wheel. |
| **[Star Trail Calculator](https://www.phototools.io/star-trail-calculator)** | Calculate maximum exposure for pinpoint stars (500 Rule and NPF Rule). Plan star trail stacking sessions with frame count and duration estimates. Animated sky preview. |
| **[White Balance Visualizer](https://www.phototools.io/white-balance-visualizer)** | See how color temperature (1000K–12000K) shifts the look of scenes. Compare presets from Candle to Blue Sky, or upload your own photo for a live WebGL preview. |
| **[Sensor Size Comparison](https://www.phototools.io/sensor-size-comparison)** | Visually compare sensor sizes from medium format to smartphone. Overlay, side-by-side, and pixel density modes with resolution data and popular camera models. |

### File Tools

| Tool | Description |
|------|-------------|
| **[Frame Studio](https://www.phototools.io/frame-studio)** | Crop, frame, and compose photos with aspect ratio presets and composition grid overlays (rule of thirds, golden ratio, diagonal). |
| **[EXIF Viewer](https://www.phototools.io/exif-viewer)** | View EXIF metadata and histogram for any photo. Extracts camera, lens, exposure, GPS, and software info. Privacy warning when location data is detected. 100% client-side. |

### Reference

| Tool | Description |
|------|-------------|
| **[Glossary](https://www.phototools.io/learn/glossary)** | 50+ photography terms with clear definitions, linked to relevant tools for hands-on learning. |

### In Development

These tools are functional in the dev environment but not yet published to production:

- **Exposure Triangle Simulator** — Adjust aperture, shutter speed, and ISO to see real-time effects on exposure, depth of field blur, motion blur, and noise (WebGL).
- **Depth of Field Calculator** — Calculate near/far focus, hyperfocal distance, and total DoF with an interactive diagram.
- **Hyperfocal Distance Simulator** — Learn where to focus for maximum foreground-to-infinity sharpness.
- **Shutter Speed Visualizer** — Find the minimum safe shutter speed for handheld shooting based on focal length, crop factor, and stabilization.
- **Perspective Compression Simulator** — See how focal length affects background compression and apparent subject distance.
- **ND Filter Calculator** — Calculate resulting shutter speed after attaching any ND filter (1–10 stops).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, TypeScript 6, CSS Modules |
| Rendering | Canvas API, WebGL2 + GLSL shaders |
| i18n | next-intl |
| Unit tests | Vitest + Testing Library (353 tests) |
| E2E tests | Playwright (Chromium + Firefox) |
| Deployment | Vercel (auto-deploy from `main`) |
| Analytics | Vercel Speed Insights, Google Analytics |
| Ads/Consent | Google AdSense, CookieYes |

## Getting Started

```bash
git clone https://github.com/kevinkiklee/phototools.io.git
cd phototools.io
npm install
npm run dev
```

The dev server starts at `http://localhost:3000`. In development, all tools are visible regardless of production status — draft tools show a banner.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:e2e` | Run Playwright e2e tests (requires build) |

## Project Structure

```
src/
  app/                        App Router routes
    [slug]/                   Each tool at a top-level URL (e.g. /fov-simulator)
      page.tsx                Route entry point
      _components/            Tool-specific UI (co-located, private folder)
    api/contact/              Contact form API route (Resend)
    learn/glossary/           Photography glossary page
  components/
    layout/                   Nav (mega-menu), Footer, ThemeProvider, ThemeToggle
    shared/                   Reusable UI — LearnPanel, ControlPanel, ToolActions,
                              FileDropZone, ShareModal, AdUnit, MobileAdBanner, etc.
  lib/
    math/                     Pure calculation modules with co-located tests
                              (fov, dof, exposure, color, histogram, compression,
                              startrail, diffraction, frame, grid)
    data/                     Tool registry, education content, sensors, focal lengths,
                              scenes, glossary, camera settings, ND filters, white balance
    data/education/           Per-tool education skeletons and challenge definitions
    i18n/                     Message loader and translation JSON files (next-intl)
    utils/                    URL query sync, canvas export helpers
    types.ts                  Shared TypeScript types
    ads.ts                    Ad configuration and feature flags
  e2e/                        Playwright e2e test specs
public/                       Static assets (scene images, sample photos)
```

## Architecture Highlights

- **Tool registry** — All tools defined in `src/lib/data/tools.ts` with separate `dev`/`prod` status fields (`live`, `draft`, `disabled`). Helper functions: `getLiveTools()`, `getVisibleTools()`, `getAllTools()`.
- **Education system** — Each tool has a LearnPanel sidebar with structured content: beginner/deeper explanations, key factors, pro tips, and progressive quiz challenges persisted to localStorage.
- **Pure math layer** — All calculation logic lives in `src/lib/math/` as pure functions with thorough unit tests, decoupled from UI.
- **Privacy-first** — All image processing is client-side. No photos are uploaded to any server. EXIF Viewer warns users when GPS data is detected.
- **No desktop scroll** — On desktop, the application fits within the viewport (100vh). Individual panels scroll internally. Mobile pages scroll naturally.
- **URL state sync** — Tool parameters are synced to URL query strings for shareability and SEO.
- **Consent-first ads** — CookieYes consent banner loads before AdSense. Ads are blocked until the user grants consent.

## Deployment

Pushing to `main` triggers:

1. **GitHub Actions CI** — `npm ci` → `npm audit` → `npm run lint` → `npm test` → `npm run build` → Playwright e2e
2. **Vercel auto-deploy** — production deployment to [www.phototools.io](https://www.phototools.io)

## Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for the guide on adding new tools, and [docs/SETUP.md](docs/SETUP.md) for detailed setup instructions.

## License

MIT
