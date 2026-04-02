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

## Architecture

- **State**: single `useReducer` in `App.tsx` with `lenses[]` array (up to 3), synced bidirectionally with URL query params via `useQuerySync`
- **Rendering**: `<canvas>` element draws images + overlay rectangles. Supports landscape/portrait orientation.
- **Theming**: CSS custom properties on `[data-theme]` attribute. Dark default, persisted to localStorage.
- **FOV math**: `src/utils/fov.ts` — standard rectilinear projection formula based on 36x24mm full-frame sensor.

## Key Files

- `src/App.tsx` — root component, state reducer, wires everything together
- `src/types.ts` — shared types, DEFAULT_STATE, LENS_COLORS, MAX_LENSES
- `src/components/Canvas.tsx` — main rendering logic (overlay mode)
- `src/components/LensPanel.tsx` — focal length slider, presets, sensor select
- `src/components/Sidebar.tsx` — sidebar layout wrapper
- `src/components/SceneStrip.tsx` — scene thumbnail selector
- `src/components/ActionBar.tsx` — copy image/link, reset buttons
- `src/components/ThemeToggle.tsx` — dark/light theme toggle
- `src/components/Toast.tsx` — notification popup
- `src/utils/fov.ts` — FOV calculations (tests in `fov.test.ts`)
- `src/utils/export.ts` — clipboard/download helpers (tests in `export.test.ts`)
- `src/hooks/useQuerySync.ts` — URL query param sync (tests in `useQuerySync.test.ts`)
- `src/data/sensors.ts` — 6 sensor presets (tests in `sensors.test.ts`)
- `src/data/focalLengths.ts` — 12 focal length presets (tests in `focalLengths.test.ts`)
- `src/data/scenes.ts` — 5 sample scene images
- `src/reducer.test.ts` — App reducer state transition tests
- `src/integration.test.ts` — cross-module integration tests
- `src/test-setup.ts` — Vitest setup (jest-dom matchers)

## Conventions

- BEM-style CSS class names (e.g. `.lens-panel__header`)
- Named exports for all components
- Types in `src/types.ts`
- No external UI libraries — keep it dependency-free
- GitHub Pages base path: `/fov-viewer/` (set in `vite.config.ts`)
- Vitest configured with jsdom environment in `vite.config.ts`
- Test files live next to source files (`*.test.ts`) except cross-cutting tests at `src/` root
