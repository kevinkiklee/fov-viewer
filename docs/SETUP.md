# PhotoTools — Local Development Guide

A Next.js 16 App Router hub with free photography calculators, simulators, and references.

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | 20+ | `node -v` |
| npm | 9+ | `npm -v` |
| Git | any | `git --version` |

## Quick Start

```bash
git clone https://github.com/kevinkiklee/phototools.io.git
cd phototools.io
npm install
npm run dev
# Open http://localhost:3000
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server with Turbopack |
| `npm run build` | Production build via `next build` |
| `npm run start` | Serve production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run all Vitest tests once |
| `npm run test:watch` | Run tests in watch mode |

## Project Structure

```
phototools.io/
├── app/
│   ├── layout.tsx                  # Root layout (Nav, Footer, ThemeProvider)
│   ├── page.tsx                    # Homepage — tool hub grid
│   ├── globals.css                 # Global styles + design tokens
│   ├── tools/
│   │   ├── fov-simulator/page.tsx     # Each tool has its own route
│   │   ├── dof-calculator/page.tsx
│   │   ├── exposure-simulator/page.tsx
│   │   └── ...                     # 14 tool routes total
│   └── learn/
│       └── glossary/page.tsx       # Photography glossary
├── components/
│   ├── layout/                     # Nav (mega-menu), Footer, ThemeProvider, ThemeToggle
│   ├── shared/                     # LearnPanel, InfoTooltip, ShareModal, ToolActions, FileDropZone, DraftBanner
│   └── tools/                      # One directory per tool + shared/
│       ├── fov-simulator/
│       ├── dof-calculator/
│       ├── shared/                 # Components shared across tools
│       └── ...
├── lib/
│   ├── math/                       # Pure calculation modules (with co-located tests)
│   │   ├── fov.ts / fov.test.ts
│   │   ├── dof.ts / dof.test.ts
│   │   ├── exposure.ts / exposure.test.ts
│   │   ├── diffraction.ts / diffraction.test.ts
│   │   ├── startrail.ts / startrail.test.ts
│   │   ├── color.ts / color.test.ts
│   │   └── histogram.ts / histogram.test.ts
│   ├── data/                       # Static data + registry (with tests)
│   │   ├── tools.ts                # Tool registry (slug, name, status, category)
│   │   ├── education/              # Per-tool educational content + challenge definitions
│   │   ├── sensors.ts              # Sensor presets
│   │   ├── focalLengths.ts         # Focal length presets
│   │   ├── scenes.ts               # Sample scene definitions
│   │   └── glossary.ts             # Photography glossary terms
│   ├── utils/
│   │   └── export.ts               # Canvas export helpers
│   └── types.ts                    # Shared TypeScript types
├── public/                         # Static assets (images, icons, manifest, sitemap)
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI: audit → lint → test → build → deploy
└── package.json
```

## Architecture

### Tool Registry

All tools are defined in `lib/data/tools.ts`. Each tool has a `slug`, `name`, `description`, `status` (`live` or `draft`), and `category`. In development, all tools are visible. In production, only `live` tools appear in the homepage, nav mega-menu, and footer. Draft tools are still accessible by direct URL in production (with a draft banner).

### Pure Math Modules

Calculation logic lives in `lib/math/` as pure functions with no React dependencies. Each module has co-located tests. This makes the math easy to test independently and reuse across components.

### Components

- `components/layout/` — site-wide layout (Nav, Footer, theme)
- `components/shared/` — reusable across tools (LearnPanel, ControlPanel, ToolActions, etc.)
- `components/tools/` — tool-specific UI, one directory per tool

### Styling

CSS Modules for component scoping. Design tokens (colors, spacing, typography) defined as CSS custom properties. Dark/light theme via `[data-theme]` attribute.

## How to Add a New Tool

1. **Math module** (if needed): create `lib/math/yourtool.ts` with pure calculation functions and `lib/math/yourtool.test.ts` with tests.
2. **Component**: create `components/tools/your-tool/YourTool.tsx` (with `'use client'` if interactive) and `YourTool.module.css`.
3. **Route**: create `app/your-tool/page.tsx` with a co-located `_components/` directory for tool-specific UI.
4. **Registry**: add the tool to the `TOOLS` array in `lib/data/tools.ts` with `status: 'draft'`. Change to `'live'` when ready.
5. **Test**: run `npm test` to verify. Run `npm run build` to confirm the build passes.

## CI/CD Pipeline

On push to `main`, `.github/workflows/deploy.yml` runs:

1. `npm ci` — install exact dependencies
2. `npm audit --omit=dev` — check for vulnerabilities
3. `npm run lint` — ESLint
4. `npm test` — Vitest (170 tests)
5. `npm run build` — Next.js production build

Vercel auto-deploys from `main` to production at `phototools.io`.

## Testing

```bash
npm test               # Run once
npm run test:watch     # Watch mode
```

**14 test files, 170 tests** covering:

| Area | Files |
|------|-------|
| Math modules | `fov`, `dof`, `exposure`, `diffraction`, `startrail`, `color`, `histogram` |
| Data modules | `tools`, `sensors`, `focalLengths`, `scenes`, `glossary` |
| Integration | Cross-module tests |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank page at `localhost:3000` | Check the dev server is running (`npm run dev`) |
| `npm ci` fails | Delete `node_modules` and retry, or ensure Node 20+ |
| Tests fail to run | Run `npm ci` to ensure vitest is installed |
| Build fails on types | Run `npx tsc --noEmit` to see TypeScript errors |
