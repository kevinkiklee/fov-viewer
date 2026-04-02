# FOV Viewer

A browser-based tool that helps photographers visualize and compare field of view across different focal lengths and sensor sizes. Built for learning — understand how focal length and crop factor affect framing.

![FOV Viewer Screenshot](docs/screenshot.png)

## Features

### Compare Up to 3 Lenses
Start with one lens and add up to two more. Each lens gets its own color-coded overlay rectangle drawn on the image, showing exactly what that focal length would capture. Remove lenses you don't need with the X button.

### Focal Length Control
Continuous logarithmic slider from 14mm to 800mm with snap-to-preset behavior. Quick-select buttons for common focal lengths: 14mm, 20mm, 24mm, 35mm, 50mm, 85mm, 135mm, 200mm, 400mm, 600mm, 800mm.

### Sensor / Crop Factor Presets
Choose from 6 sensor sizes per lens — Medium Format (0.79x), Full Frame (1.0x), APS-C Nikon/Sony (1.5x), APS-C Canon (1.6x), Micro Four Thirds (2.0x), and 1" Sensor (2.7x). Equivalent focal length is displayed automatically when using a crop sensor.

### Draggable Overlays
Click and drag any FOV rectangle to reposition it on the image. Works on both desktop (mouse) and mobile (touch). Rectangles are constrained to stay within the photo boundaries. Hit "Center" to reset all positions.

### Landscape / Portrait Orientation
Toggle between landscape and portrait orientation to see how FOV changes when you rotate the camera.

### 5 Sample Scenes
Curated photos for different shooting scenarios — landscape, portrait, bird/wildlife, city street, and milky way/night sky. Each scene demonstrates different reasons you might choose one focal length over another.

### Shareable Links
Every setting is encoded in the URL query parameters. Change any control and the URL updates in real time. Copy the link to share your exact comparison with someone else.

### Copy to Clipboard
Export the current canvas view (image + overlay rectangles) as a PNG to your clipboard with one click. Falls back to file download if clipboard API isn't available.

### Dark / Light Theme
Dark theme by default (easier on the eyes for photo work). Toggle with the sun/moon button. Preference is saved to localStorage.

### Responsive Design
Full sidebar layout on desktop, stacked layout on mobile with full-width image canvas. Touch-draggable overlays on mobile.

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
