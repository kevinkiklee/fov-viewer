# Photo Tools

15 free photography calculators, simulators, and references — no ads, no sign-up, runs entirely in the browser.

**[Live Demo](https://photo-tools.iser.io/)**

## Tools

| Tool | Description |
|------|-------------|
| **FOV Viewer** | Compare field of view across focal lengths and sensor sizes |
| **Exposure Triangle Simulator** | See how aperture, shutter speed, and ISO interact |
| **Depth of Field Calculator** | Calculate near focus, far focus, and total depth of field |
| **Hyperfocal Distance Table** | Quick-reference hyperfocal distances for any lens and aperture |
| **Shutter Speed Guide** | Find the minimum safe shutter speed for sharp handheld shots |
| **ND Filter Calculator** | Calculate exposure time with any ND filter |
| **Diffraction Limit Calculator** | Find the sharpest aperture for your sensor |
| **Star Trail Calculator** | Calculate max exposure for sharp stars or plan star trail shots |
| **White Balance Visualizer** | See how color temperature affects your photos |
| **Color Harmony Picker** | Build color palettes for photography shoots |
| **EV Chart** | Interactive exposure value reference chart |
| **Sensor Size Comparison** | Compare camera sensor sizes visually |
| **EXIF Viewer** | View photo metadata without uploading — 100% client-side |
| **Histogram Explainer** | Understand your photo's histogram with annotations |
| **Glossary** | Photography terms and definitions |

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React 19 + TypeScript
- Vitest + Testing Library
- CSS Modules + custom properties
- Canvas API
- Vercel

## Development

```bash
npm install
npm run dev
```

Dev server runs at `http://localhost:3000`.

## Testing

```bash
npm test            # single run (149 tests)
npm run test:watch  # watch mode
```

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Deployment

Push to `main` triggers:
1. GitHub Actions CI (audit, lint, test, build)
2. Vercel auto-deploy to production

Live at [photo-tools.iser.io](https://photo-tools.iser.io/).

## License

MIT
