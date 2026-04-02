# Contributing to FOV Viewer

Thanks for your interest in contributing! This is an open-source project and we welcome pull requests.

## Getting Started

```bash
git clone https://github.com/kevinkiklee/fov-viewer.git
cd fov-viewer
npm install
npm run dev
```

Dev server runs at `http://localhost:5173/fov-viewer/`.

## Development Workflow

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Run tests: `npm test`
4. Run lint: `npm run lint`
5. Run build to verify: `npm run build`
6. Open a pull request

## Project Structure

```
src/
├── App.tsx                 # Root component, state reducer
├── App.css                 # All styles (CSS custom properties for theming)
├── types.ts                # Shared types and constants
├── components/
│   ├── Canvas.tsx           # Image + overlay rendering, drag logic
│   ├── LensPanel.tsx        # Focal length slider, presets, sensor select
│   ├── Sidebar.tsx          # Desktop sidebar wrapper
│   ├── SceneStrip.tsx       # Image thumbnail selector
│   ├── ActionBar.tsx        # Copy image / Copy link / Reset buttons
│   ├── ThemeToggle.tsx      # Dark/light toggle
│   └── Toast.tsx            # Brief notification popup
├── hooks/
│   └── useQuerySync.ts      # Bidirectional state <-> URL query params
├── utils/
│   ├── fov.ts               # FOV math (angles, crop ratios, equivalents)
│   └── export.ts            # Canvas -> clipboard/PNG
├── data/
│   ├── sensors.ts           # Sensor presets
│   ├── focalLengths.ts      # Focal length presets
│   └── scenes.ts            # Sample image references
└── assets/                  # Sample photos (JPG)
```

## Architecture Notes

- **State**: Single `useReducer` in App.tsx with dynamic `lenses[]` array (1-3 items)
- **Rendering**: `<canvas>` element draws the image and colored overlay rectangles
- **FOV reference**: 14mm full frame = edge of the photo. Wider lenses extend beyond
- **Dragging**: Mouse and touch events on canvas, with per-lens offset tracking
- **URL sync**: All state serialized to query params via `history.replaceState`
- **Theming**: CSS custom properties on `[data-theme]` attribute

## Adding a New Sample Scene

1. Add a landscape-oriented JPG (4000px+ wide) to `src/assets/`
2. Import it in `src/data/scenes.ts` and add to the `SCENES` array
3. Update the image index cap in `src/hooks/useQuerySync.ts`

## Adding a New Sensor Preset

1. Add the entry to `SENSORS` array in `src/data/sensors.ts`
2. The ID must be unique and URL-safe (used in query params)

## Code Style

- No component library — custom CSS only
- BEM-style CSS class names (e.g. `.lens-panel__header`)
- Named exports for all components
- Types in `src/types.ts`
- No emojis in code

## Reporting Issues

Open an issue at https://github.com/kevinkiklee/fov-viewer/issues with:
- What you expected to happen
- What actually happened
- Browser and device info
- Screenshot if relevant
