# FOV Viewer — Local Development Guide

A client-side React app that helps photographers visualize and compare field of view across different focal lengths and sensor sizes.

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | 20+ | `node -v` |
| npm | 9+ | `npm -v` |
| Git | any | `git --version` |

## Quick Start

```bash
git clone <repo-url> && cd fov-viewer

# Automated setup (installs deps, runs lint, tests, type-check):
./scripts/setup.sh

# Start dev server:
npm run dev
# Open http://localhost:5173/fov-viewer/
```

## Manual Setup

```bash
npm ci                # Install dependencies (lockfile-exact)
npm run dev           # Start Vite dev server with HMR
```

> **Note:** The app is served under `/fov-viewer/` base path, matching GitHub Pages deployment. Navigate to `http://localhost:5173/fov-viewer/` — not just `localhost:5173`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) then build for production (`dist/`) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run all Vitest tests once |
| `npm run test:watch` | Run tests in watch mode |

## Project Structure

```
fov-viewer/
├── index.html                  # Entry HTML (CSP + referrer policy)
├── vite.config.ts              # Vite config (base path, React plugin, Vitest)
├── tsconfig.json               # TypeScript project references
├── package.json
├── scripts/
│   └── setup.sh                # Automated local setup script
├── docs/
│   └── SETUP.md                # This file
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI: audit → lint → test → build → deploy
├── src/
│   ├── main.tsx                # React entry point
│   ├── App.tsx                 # Root component, state reducer
│   ├── App.css                 # All component styles (BEM)
│   ├── theme.css               # CSS custom properties (dark/light)
│   ├── types.ts                # Shared types, DEFAULT_STATE, constants
│   ├── components/
│   │   ├── Canvas.tsx          # Canvas rendering: cover-fit images, FOV overlays, drag
│   │   ├── LensPanel.tsx       # Focal length log-slider, presets, sensor select
│   │   ├── Sidebar.tsx         # Desktop sidebar layout wrapper
│   │   ├── SceneStrip.tsx      # Scene thumbnail selector
│   │   ├── ActionBar.tsx       # Copy image, copy link, reset buttons
│   │   ├── ThemeToggle.tsx     # Dark/light theme toggle
│   │   └── Toast.tsx           # Brief notification popup
│   ├── hooks/
│   │   └── useQuerySync.ts     # Bidirectional state ↔ URL query param sync
│   ├── utils/
│   │   ├── fov.ts              # FOV math (angles, frame width, crop ratio)
│   │   └── export.ts           # Canvas → clipboard/PNG export
│   ├── data/
│   │   ├── sensors.ts          # 6 sensor presets (MF → 1" sensor)
│   │   ├── focalLengths.ts     # 12 focal length presets (8mm–800mm)
│   │   └── scenes.ts           # 5 scene image definitions
│   └── assets/                 # Scene images (1600px wide, JPEG 80%)
│       ├── person.jpg
│       ├── portrait.jpg
│       ├── bird2.jpg
│       ├── city.jpg
│       └── milkyway.jpg
└── Test files (co-located):
    ├── src/utils/fov.test.ts
    ├── src/utils/export.test.ts
    ├── src/data/sensors.test.ts
    ├── src/data/focalLengths.test.ts
    ├── src/hooks/useQuerySync.test.ts
    ├── src/reducer.test.ts
    └── src/integration.test.ts
```

## Architecture

### State Management

Single `useReducer` in `App.tsx`. State shape:

```ts
interface AppState {
  lenses: LensConfig[]      // Up to 3 lenses, each with focalLength + sensorId
  imageIndex: number         // Active scene (0–4)
  orientation: Orientation   // 'landscape' | 'portrait'
  theme: 'dark' | 'light'
  activeLens: number         // Index of selected lens
  // ...
}
```

State is synced bidirectionally with URL query params (`?a=35&sa=ff&b=85&sb=apsc_n&img=0&theme=dark`) via `useQuerySync`.

### Canvas Rendering

- Uses `<canvas>` with `drawImageCover()` for aspect-ratio-preserving image fill
- FOV overlay rectangles sized against a fixed reference FOV (14mm full frame)
- Rectangles are draggable (mouse + touch) with position clamping
- Supports landscape (3:2) and portrait (2:3) orientations

### Focal Length Slider

- Logarithmic scale so wide-angle presets (14–85mm) get more slider space
- Snaps to nearest preset within a threshold
- Tick marks at each preset position
- 8mm preset only shows for crop sensors; 14mm minimum for full frame/medium format

### Theming

CSS custom properties on `[data-theme="dark"|"light"]`. Dark by default. Persisted to `localStorage`.

## Testing

```bash
npm test               # Run once
npm run test:watch     # Watch mode
```

**7 test files, 85+ tests** covering:

| File | Scope |
|------|-------|
| `fov.test.ts` | FOV math: angles, frame width, crop ratio, equiv focal length |
| `sensors.test.ts` | Sensor presets, getSensor fallback |
| `focalLengths.test.ts` | Preset ordering, bounds, labels |
| `export.test.ts` | Clipboard/download helpers |
| `useQuerySync.test.ts` | URL parse/serialize round-trips |
| `reducer.test.ts` | All reducer actions, immutability, composition |
| `integration.test.ts` | Cross-module: FOV + sensors + serialization |

## CI/CD Pipeline

On push to `main`, `.github/workflows/deploy.yml` runs:

1. `npm ci` — install exact dependencies
2. `npm audit --omit=dev` — check for vulnerabilities
3. `npm run lint` — ESLint
4. `npm test` — Vitest
5. `npm run build` — TypeScript + Vite production build
6. Deploy `dist/` to GitHub Pages

To test a production build locally:

```bash
npm run build && npm run preview
```

## Security

- **CSP meta tag** in `index.html` — restricts scripts/styles to same-origin, images to self/data/blob
- **Referrer policy** — `no-referrer` prevents URL state leaking via Referer header
- **No external requests** — all images bundled, no CDN/API calls at runtime
- **No `eval`/`innerHTML`** — all rendering via React or Canvas API
- **Dependency audit** — `npm audit` runs in CI before every deploy

## Image Assets

Scene images in `src/assets/` are optimized:
- 1600px wide, JPEG 80% quality
- Sourced from Unsplash (free license)
- ~300–550 KB each (~2.1 MB total)

When adding/replacing images, resize to 1600px wide:

```bash
sips --resampleWidth 1600 -s formatOptions 80 src/assets/new-image.jpg --out src/assets/new-image.jpg
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank page at `localhost:5173` | Navigate to `localhost:5173/fov-viewer/` (note the base path) |
| `npm ci` fails | Delete `node_modules` and retry, or ensure Node 20+ |
| Tests fail to run | Run `npm ci` to ensure vitest is installed |
| Build fails on types | Run `npx tsc --noEmit` to see TypeScript errors |
| Images look blurry | Ensure source images are at least 1600px wide |
| Canvas blank after orientation change | Click the center button (⊞) to reset overlay positions |
