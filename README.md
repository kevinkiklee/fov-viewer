# FOV Viewer

A browser-based tool that helps photographers visualize and compare field of view across different focal lengths and sensor sizes. Built for learning — understand how focal length and crop factor affect framing.

**[Live Demo](https://kevinkiklee.github.io/fov-viewer/)**

![FOV Viewer Screenshot](docs/screenshot.png)

## Features

| Feature | Description |
|---------|-------------|
| **Up to 3 lenses** | Add color-coded overlay rectangles showing what each focal length captures. Remove any lens with the X button. |
| **Focal length control** | Logarithmic slider from 14–800mm with snap-to-preset. Quick-select buttons for 11 common focal lengths. |
| **Sensor presets** | 6 sensor sizes per lens — Medium Format (0.79x), Full Frame (1.0x), APS-C Nikon/Sony (1.5x), APS-C Canon (1.6x), Micro Four Thirds (2.0x), 1" Sensor (2.7x). Shows equivalent focal length automatically. |
| **Draggable overlays** | Click and drag FOV rectangles to reposition. Works with mouse and touch. Hit "Center" to reset. |
| **Orientation toggle** | Switch between landscape and portrait to see how FOV changes when you rotate the camera. |
| **5 sample scenes** | Landscape, portrait, bird/wildlife, city street, and milky way — each suited to different focal lengths. |
| **Shareable links** | All settings encoded in URL query params. Change a control and the URL updates in real time. |
| **Copy to clipboard** | Export the canvas (image + overlays) as PNG. Falls back to file download if clipboard API is unavailable. |
| **Dark / light theme** | Dark default. Toggle with sun/moon button. Preference saved to localStorage. |
| **Responsive** | Sidebar on desktop, stacked on mobile. Touch-draggable overlays. |

## Tech Stack

- React 19 + TypeScript
- Vite
- Vitest + Testing Library
- Canvas API for rendering
- CSS custom properties for theming
- Zero runtime dependencies beyond React

## Development

```bash
npm install
npm run dev
```

Dev server runs at `http://localhost:5173/fov-viewer/`.

## Testing

```bash
npm test          # single run
npm run test:watch # watch mode
```

## Build

```bash
npm run build
```

Static output goes to `dist/`.

## Deployment

Push to `main` — GitHub Actions automatically builds and deploys to GitHub Pages.

To set up:
1. Create a GitHub repo called `fov-viewer`
2. Push this code to `main`
3. Go to Settings > Pages > Source: "GitHub Actions"

## URL Parameters

All state is encoded in the URL for sharing:

| Param | Description | Example |
|-------|-------------|---------|
| `a` | Lens A focal length (mm) | `a=20` |
| `b` | Lens B focal length (mm) | `b=85` |
| `c` | Lens C focal length (mm) | `c=200` |
| `sa` | Lens A sensor | `sa=ff` |
| `sb` | Lens B sensor | `sb=apsc_n` |
| `sc` | Lens C sensor | `sc=m43` |
| `img` | Image index (0-4) | `img=0` |
| `theme` | `dark` or `light` | `theme=dark` |

Sensor codes: `mf`, `ff`, `apsc_n`, `apsc_c`, `m43`, `1in`

## License

MIT
