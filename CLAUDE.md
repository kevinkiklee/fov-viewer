# CLAUDE.md

## Project Overview

FOV Viewer is a static React app for comparing camera focal lengths and visualizing field of view. Deployed to GitHub Pages. Educational focus for photography learners.

## Tech Stack

- React 19 + TypeScript + Vite
- Vitest + jsdom + @testing-library/react + @testing-library/jest-dom
- ESLint with typescript-eslint
- No component library — custom CSS with CSS custom properties
- Canvas API for image rendering (overlay rectangles)
- Zero runtime dependencies beyond React

## Commands

- `npm run dev` — start dev server at `http://localhost:5173/fov-viewer/`
- `npm run build` — type-check + production build to `dist/`
- `npm test` — run Vitest tests
- `npm run test:watch` — run tests in watch mode
- `npm run lint` — run ESLint
- `./scripts/setup.sh` — automated local setup (checks prereqs, installs deps, runs lint/test)

## Architecture

- **State**: single `useReducer` in `App.tsx` with `lenses[]` array (up to 3), synced bidirectionally with URL query params via `useQuerySync`
- **Rendering**: `<canvas>` element draws images + overlay rectangles. Supports landscape/portrait orientation toggle.
- **Theming**: CSS custom properties on `[data-theme]` attribute. Dark default, persisted to localStorage.
- **FOV math**: `src/utils/fov.ts` — standard rectilinear projection formula based on 36x24mm full-frame sensor.
- **Slider**: Logarithmic scale for focal length slider with snap-to-preset behavior. 8mm only available for crop sensors; 14mm minimum for full frame/medium format.
- **Draggable overlays**: FOV rectangles can be dragged on the canvas (mouse and touch). Center button resets positions.

## Key Files

- `src/App.tsx` — root component, state reducer, wires everything together
- `src/types.ts` — shared types, DEFAULT_STATE, LENS_COLORS, MAX_LENSES, Orientation
- `src/components/Canvas.tsx` — main rendering logic (overlay mode, cover-fit image drawing, draggable rects)
- `src/components/LensPanel.tsx` — log-scale focal length slider with snap, presets, sensor select
- `src/components/Sidebar.tsx` — sidebar layout wrapper
- `src/components/SceneStrip.tsx` — scene thumbnail selector
- `src/components/ActionBar.tsx` — copy image/link, reset buttons
- `src/components/ThemeToggle.tsx` — dark/light theme toggle
- `src/components/Toast.tsx` — notification popup
- `src/utils/fov.ts` — FOV calculations (tests in `fov.test.ts`)
- `src/utils/export.ts` — clipboard/download helpers (tests in `export.test.ts`)
- `src/hooks/useQuerySync.ts` — URL query param sync (tests in `useQuerySync.test.ts`)
- `src/data/sensors.ts` — 6 sensor presets: MF, FF, APS-C (Nikon/Sony), APS-C (Canon), M4/3, 1" (tests in `sensors.test.ts`)
- `src/data/focalLengths.ts` — 12 focal length presets, 8mm–800mm (tests in `focalLengths.test.ts`)
- `src/data/scenes.ts` — 5 sample scenes (person, portrait, bird, city, milky way)
- `src/reducer.test.ts` — App reducer state transition tests
- `src/integration.test.ts` — cross-module integration tests
- `src/test-setup.ts` — Vitest setup (jest-dom matchers)

## Image Assets

- All scene images in `src/assets/` are 1600px wide, JPEG 80% quality
- Sourced from Unsplash (free license)
- No external image fetching at runtime — all bundled

## Security

- CSP meta tag restricts scripts/styles to same-origin
- `no-referrer` policy prevents URL state leaking via Referer header
- `npm audit --omit=dev` runs in CI before deploy
- No `eval`, `innerHTML`, or `dangerouslySetInnerHTML` anywhere

## Conventions

- BEM-style CSS class names (e.g. `.lens-panel__header`)
- Named exports for all components
- Types in `src/types.ts`
- No external UI libraries — keep it dependency-free
- GitHub Pages base path: `/fov-viewer/` (set in `vite.config.ts`)
- Vitest configured with jsdom environment in `vite.config.ts`
- Test files live next to source files (`*.test.ts`) except cross-cutting tests at `src/` root
- CI pipeline: `npm ci` → `npm audit` → `npm run lint` → `npm test` → `npm run build` → deploy

## Layout

- Desktop (>=1024px): sidebar (280px) + canvas area (flex). Sidebar scrolls independently.
- Mobile (<1024px): stacked — canvas on top, sidebar below. Portrait orientation default.
- Single breakpoint at 1024px. App locked to viewport height (`height: 100vh`).
