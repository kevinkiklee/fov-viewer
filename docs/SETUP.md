# FOV Viewer — Local Development & Setup Guide

A focal-length comparison tool for photographers, built with React + TypeScript + Vite.

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | 20+ | `node -v` |
| npm | 9+ | `npm -v` |
| Git | any | `git --version` |

## Quick Start

```bash
# Clone the repo
git clone <repo-url> && cd fov-viewer

# Or run the automated setup script:
./scripts/setup.sh
```

## Manual Setup

```bash
# 1. Install dependencies
npm ci

# 2. Start dev server (http://localhost:5173/fov-viewer/)
npm run dev

# 3. Open in browser
open http://localhost:5173/fov-viewer/
```

> **Note:** The app is served under the `/fov-viewer/` base path (matching the GitHub Pages deployment).

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and build for production (`dist/`) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests once (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

## Project Structure

```
src/
├── main.tsx                 # Entry point
├── App.tsx / App.css        # Root component and styles
├── theme.css                # CSS custom properties (dark/light)
├── components/              # UI components
│   ├── Canvas.tsx           # Image + FOV overlay rendering
│   ├── LensPanel.tsx        # Lens config card (focal length, sensor)
│   ├── Sidebar.tsx          # Desktop sidebar wrapper
│   ├── SceneStrip.tsx       # Scene thumbnail selector
│   ├── ActionBar.tsx        # Copy image / Copy link buttons
│   ├── ThemeToggle.tsx      # Dark/light theme toggle
│   └── Toast.tsx            # Notification popup
├── hooks/
│   └── useQuerySync.ts      # State ↔ URL query param sync
├── utils/
│   ├── fov.ts               # FOV math (angles, frame width)
│   ├── fov.test.ts          # Unit tests for FOV calculations
│   └── export.ts            # Canvas → clipboard/PNG export
├── data/
│   ├── sensors.ts           # Sensor presets (crop factors)
│   ├── focalLengths.ts      # Focal length presets + labels
│   └── scenes.ts            # Scene image metadata
└── assets/                  # Sample images (landscape, portrait, etc.)
```

## Deployment

The app deploys automatically to **GitHub Pages** on push to `main` via `.github/workflows/deploy.yml`:

1. `npm ci` + `npm run build`
2. Uploads `dist/` as a GitHub Pages artifact
3. Deploys to `https://<user>.github.io/fov-viewer/`

To test a production build locally:

```bash
npm run build && npm run preview
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank page at `localhost:5173` | Navigate to `localhost:5173/fov-viewer/` (note the base path) |
| `npm ci` fails | Delete `node_modules` and retry, or ensure Node 20+ |
| Tests fail to run | Ensure `vitest` is installed: `npm ci` |
| Build fails on types | Run `npx tsc --noEmit` to see TypeScript errors |
