# CLAUDE.md

## Project Overview

PhotoTools is an educational photography application — free calculators, simulators, and references plus a glossary. Built as a Next.js 16 App Router hub with a tool registry system. Deployed to Vercel at `www.phototools.io`.

**Business model**: SEO-driven traffic + advertisement revenue. All decisions should consider SEO impact (shareable URLs, metadata, semantic HTML, page titles) and ad placement compatibility (clean layout with predictable content regions, no layout shift).

## Tech Stack

- Next.js 16 (App Router, Turbopack dev)
- React 19 + TypeScript 6
- Vitest + jsdom + @testing-library/react + @testing-library/jest-dom
- ESLint with typescript-eslint
- CSS Modules + CSS custom properties (design tokens)
- Canvas API for image rendering (FOV Simulator overlays)
- WebGL2 + GLSL shaders (Exposure Simulator, White Balance Visualizer, Perspective Compression Simulator)
- Vercel (deployment)

## Commands

- `npm run dev` — start dev server with Turbopack at `http://localhost:3000`
- `npm run build` — production build via `next build`
- `npm run start` — serve production build locally
- `npm test` — run Vitest tests (351 tests across 24 files)
- `npm run test:watch` — run tests in watch mode
- `npm run lint` — run ESLint

## Architecture

All source code lives under `src/`, with `@/` aliased to `src/` in tsconfig.json and vitest.config.ts.

- **App Router**: all routes under `src/app/`. Homepage (`src/app/page.tsx`) is the tool hub. Each tool lives at `src/app/[slug]/page.tsx` with co-located `_components/` for tool-specific UI. Glossary at `src/app/learn/glossary/page.tsx`. Additional pages: `/about`, `/contact`, `/privacy`, `/terms`. API route: `src/app/api/contact/route.ts`.
- **Tool Co-location**: Each tool's components live in `src/app/[slug]/_components/` alongside its `page.tsx`. The `_` prefix makes it a private folder (not a route segment). Page files import from `./_components/...` using relative paths.
- **Shared Components**: `src/components/` contains only shared/reusable code: `layout/` (Nav, Footer, ThemeProvider, ThemeToggle) and `shared/` (ToolPageShell, LearnPanel, ControlPanel, ToolIcon, InfoTooltip, ShareModal, ToolActions, FileDropZone, PhotoUploadPanel, ScenePicker, DraftBanner, Breadcrumbs, JsonLd, DoFDiagram, DoFCanvas, AnimatedGrid, ModeToggle, AdUnit, AdScripts, MobileAdBanner).
- **Tool Registry**: `src/lib/data/tools.ts` defines all tools with slug, name, description, `dev`/`prod` status fields (`'live'`/`'draft'`/`'disabled'`), and category. `getLiveTools()` returns live tools. `getVisibleTools()` returns live + draft. `getToolBySlug()` looks up by slug. `getAllTools()` returns all tools regardless of status.
- **Education System**: `src/lib/data/education/` contains per-tool educational content (beginner/deeper explanations, key factors, pro tips, tooltips, challenges). `LearnPanel` renders as a right sidebar on every tool page.
- **Pure Math Modules**: `src/lib/math/` contains pure functions for FOV, DOF, exposure (including shader math for CoC, motion blur, noise), diffraction, star trails, color, histogram, compression, frame, and grid calculations. Each has co-located `.test.ts` files. TDD approach — math is tested independently from UI.
- **Data**: `src/lib/data/` contains tool registry, education content, sensors (with dimensions/colors), focal lengths, scenes, glossary, camera settings (apertures/shutter speeds/ISOs), ND filters, and white balance presets — each with tests.

## Key Directories

```
src/
  app/                    Routes (homepage, tools, learn/glossary, info pages)
    [slug]/               Each tool at top-level URL (e.g. /fov-simulator)
      page.tsx            Route entry point
      _components/        Tool-specific UI components (co-located)
    api/contact/          Contact form API route
  components/
    layout/               Nav (mega-menu), Footer, ThemeProvider, ThemeToggle
    shared/               ToolPageShell, LearnPanel, ControlPanel, AdUnit, MobileAdBanner, etc.
  lib/
    math/                 Pure calculation modules (fov, dof, exposure, compression, frame, grid, etc.)
    data/                 Tool registry, education content, sensors, focal lengths, scenes, glossary, camera, ndFilters, whiteBalance
    data/education/       Per-tool educational content, challenge definitions, types
    ads.ts                Ad configuration and feature flags
    utils/                Query sync, export helpers
    types.ts              Shared TypeScript types
public/                   Images, icons, manifest, sitemap, robots.txt
```

## Tool Visibility

Each tool in `src/lib/data/tools.ts` has separate `dev` and `prod` status fields with three states: `'live'`, `'draft'`, or `'disabled'`.

- **`live`** — fully accessible, appears in nav, homepage, and footer.
- **`draft`** — appears in nav/homepage as "Coming Soon" (disabled); still reachable by direct URL with a draft banner.
- **`disabled`** — hidden from all menus, not shown anywhere.
- **Development** (`npm run dev`): uses the `dev` status field.
- **Production** (`npm run build`): uses the `prod` status field.
- To publish a tool, set its `prod` status to `'live'`.

## Educational Layer

Each tool has a **LearnPanel** (right sidebar) with:
- **Beginner explanation** — 2-3 sentence intro for newcomers
- **Deeper explanation** — physics/optics/math behind the concept (plain string or array of `{ heading, text }` sections)
- **Key factors** — what controls the effect
- **Pro tips** — practical real-world advice (amber callout)
- **Challenges** — 3-5 progressive multiple-choice questions with pass/fail feedback, try-again on wrong answers, reset all progress, persisted to localStorage
- **Tooltips** — hover info icons on control labels (via `InfoTooltip` component)

Content is defined as structured data in `src/lib/data/education/content.ts`, `content2.ts`, and `frame-studio.ts`. Types in `types.ts`, barrel export via `index.ts`. To add education content for a new tool, add a `ToolEducation` entry matching the tool's slug.

## Design

- **No page scroll (desktop only).** On desktop, the application must fit within the viewport (100vh). The page never scrolls — only individual panels (controls, canvas, LearnPanel) scroll internally via `overflow-y: auto`. On mobile, pages are allowed to scroll naturally.
- **FOV Simulator is the reference implementation.** All tools should match its look and feel: dark surface panels, compact controls, same spacing/typography tokens, and consistent use of `var(--accent)` for interactive elements.
- **Three-column layout**: ToolPageShell renders tool content (left/center) + LearnPanel (right sidebar, collapsible). Full-height tools (FOV Simulator, Color Harmony, Exposure Simulator, Sensor Size Comparison) manage their own layout but include LearnPanel directly.
- **Tool icons**: Each tool has an inline SVG icon (`components/shared/ToolIcon.tsx`) displayed on homepage cards, nav mega-menu items, and tool page headers. Icons are mapped by slug.
- **Nav mega-menu**: Tools dropdown groups tools by category (Visualizers, Calculators, Reference, File Tools) with icon + name + description per item.

## Advertising

GoogleAdSense integration managed via `src/lib/ads.ts` (configuration and feature flags). Components: `AdUnit` (individual ad slots), `MobileAdBanner` (responsive mobile banner), `AdScripts` (script injection in layout). Environment variables: `NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_COOKIEYES_ID`. Ad units are hidden until real slot IDs are configured.

## Security Headers

`next.config.ts` defines CSP, HSTS, and other security headers. `unsafe-eval` is included in CSP `script-src` only in development (React requires it for dev tooling). Never add `unsafe-eval` in production.

## Share & Embed

`components/shared/ShareModal.tsx` generates share/embed links with current query parameters via `window.location.search`. The FOV Simulator has its own ShareModal (`fov-simulator/_components/ShareModal.tsx`) using `stateToQueryString()`.

## Conventions

- **CSS Modules** for component styles (e.g. `Component.module.css`), design tokens via CSS custom properties
- **`'use client'`** directive on interactive components; server components by default
- **TDD for math**: all `lib/math/` modules have thorough unit tests
- **Named exports** for all components
- **Shared components first**: Before building tool-specific UI, check `src/components/shared/` for existing components. When two or more tools need similar UI (e.g. file upload, scene selector, share modal), extract a shared component. Familiarize yourself with what each shared component does so you reuse them consistently.
- **DRY**: Avoid duplicating logic, styles, constants, or markup. Extract shared utilities, components, and data modules. When adding a feature, check if similar patterns already exist in the codebase and reuse them.
- **200-line file limit**: Keep all `.ts`/`.tsx` files under 200 lines. If a file grows beyond this, break it into smaller focused modules (e.g. extract hooks, sub-components, helpers, constants, or types into separate files).
- **Test files** co-located next to source files (`*.test.ts`)
- **24 test files, 351 tests** covering math, data, education, ads, and component integration
- **Privacy Sandbox is deprecated** — do not discuss, recommend, or implement any Privacy Sandbox APIs (Topics, Attribution Reporting, Protected Audience, etc.)

## Deployment

- Vercel auto-deploys from `main` branch
- GitHub Actions CI: `npm ci` → `npm audit` → `npm run lint` → `npm test` → `npm run build`
- Custom domain: `www.phototools.io` (apex `phototools.io` redirects to www)
- NEVER push to remote or deploy without explicit user instruction
