# CLAUDE.md

## Project Overview

PhotoTools is an educational photography application — free calculators, simulators, and references plus a glossary. Built as a Next.js 16 App Router hub with a tool registry system. Deployed to Vercel at `www.phototools.io`.

**Business model**: SEO-driven traffic + advertisement revenue. All decisions should consider SEO impact (shareable URLs, metadata, semantic HTML, page titles) and ad placement compatibility (clean layout with predictable content regions, no layout shift).

## Tech Stack

- Next.js 16 (App Router, Turbopack dev)
- React 19 + TypeScript 6
- next-intl 4.x (i18n — single-locale English, ready for multi-locale)
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
- `npm test` — run Vitest tests (353 tests across 25 files)
- `npm run test:watch` — run tests in watch mode
- `npm run test:e2e` — run Playwright e2e tests (requires a build first)
- `npm run test:e2e:ui` — run Playwright tests with interactive UI
- `npm run lint` — run ESLint

## Architecture

All source code lives under `src/`, with `@/` aliased to `src/` in tsconfig.json and vitest.config.ts.

- **App Router**: all routes under `src/app/`. Homepage (`src/app/page.tsx`) is the tool hub. Each tool lives at `src/app/[slug]/page.tsx` with co-located `_components/` for tool-specific UI. Glossary at `src/app/learn/glossary/page.tsx`. Additional pages: `/about`, `/contact`, `/privacy`, `/terms`. API route: `src/app/api/contact/route.ts`.
- **Tool Co-location**: Each tool's components live in `src/app/[slug]/_components/` alongside its `page.tsx`. The `_` prefix makes it a private folder (not a route segment). Page files import from `./_components/...` using relative paths.
- **Shared Components**: `src/components/` contains only shared/reusable code: `layout/` (Nav, Footer, ThemeProvider, ThemeToggle) and `shared/` (LearnPanel, ChallengeCard, ControlPanel, FocalLengthField, ToolIcon, InfoTooltip, ShareModal, ToolActions, FileDropZone, PhotoUploadPanel, ScenePicker, DraftBanner, JsonLd, DoFDiagram, DoFCanvas, AnimatedGrid, ModeToggle, AdUnit, AdScripts, MobileAdBanner).
- **Tool Registry**: `src/lib/data/tools.ts` defines all tools with slug, name, description, `dev`/`prod` status fields (`'live'`/`'draft'`/`'disabled'`), and category. `getLiveTools()` returns live tools. `getVisibleTools()` returns live + draft. `getToolBySlug()` looks up by slug. `getAllTools()` returns all tools regardless of status.
- **Education System**: `src/lib/data/education/` contains per-tool education skeletons (non-translatable data: IDs, difficulty levels, correct answers, option values). All translatable education text lives in `src/lib/i18n/messages/en/education/*.json`. `LearnPanel` and `ChallengeCard` render by combining skeleton data with translations.
- **Pure Math Modules**: `src/lib/math/` contains pure functions for FOV, DOF, exposure (including shader math for CoC, motion blur, noise), diffraction, star trails, color, histogram, compression, frame, and grid calculations. Each has co-located `.test.ts` files. TDD approach — math is tested independently from UI.
- **Data**: `src/lib/data/` centralizes all pure data. Shared data files (with tests): tool registry, education skeletons, sensors, focal lengths, scenes, glossary, camera settings (apertures/shutter speeds/ISOs), ND filters, white balance presets. Per-tool data files: `frameStudio.ts`, `exposureScenes.ts`, `fovSimulator.ts`, `colorSchemeGenerator.ts`, `exifViewer.ts`, `starTrailCalculator.ts`, `dofCalculator.ts`, `hyperfocalSimulator.ts`, `perspectiveCompression.ts`.

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
    shared/               LearnPanel, ChallengeCard, ControlPanel, FocalLengthField, AdUnit, MobileAdBanner, etc.
    i18n/
      request.ts          Message loader — merges all JSON files at request time
      messages/en/        i18n translation files (next-intl)
  lib/
    math/                 Pure calculation modules (fov, dof, exposure, compression, frame, grid, color, etc.)
    data/                 All pure data: shared (tools, sensors, glossary, camera, etc.) + per-tool (fovSimulator, frameStudio, etc.)
    data/education/       Per-tool education skeletons, types, barrel export
    ads.ts                Ad configuration and feature flags
    utils/                Query sync, export helpers
    types.ts              Shared TypeScript types
    og.tsx + og-layout.tsx  OpenGraph image generation
  e2e/                    Playwright e2e test specs
public/                   Images, icons, manifest, sitemap, robots.txt
```

## Internationalization (i18n)

Uses **next-intl** with a single-locale (English) setup, ready for multi-locale expansion.

### How it works

All translatable strings live in JSON files under `src/lib/i18n/messages/en/`. The message loader (`src/lib/i18n/request.ts`) imports every JSON file and merges them into namespaces. The root layout's `NextIntlClientProvider` makes the merged messages available to all components.

**Namespaces** (top-level key in each JSON file → how components access strings):

| Namespace | JSON location | Access pattern |
|-----------|--------------|----------------|
| `common` | `messages/en/common.json` | `useTranslations('common')` → `t('nav.tools')` |
| `home` | `messages/en/home.json` | `useTranslations('home')` → `t('hero.title')` |
| `tools` | `messages/en/tools.json` | `useTranslations('tools')` → `t('fov-simulator.name')` |
| `glossary` | `messages/en/glossary.json` | `useTranslations('glossary')` → `t('entries.aperture.term')` |
| `metadata` | `messages/en/metadata.json` | `getTranslations('metadata')` (server) |
| `about`, `contact`, `privacy`, `terms` | `messages/en/<name>.json` | `useTranslations('<name>')` |
| `education.<tool-slug>` | `messages/en/education/<tool-slug>.json` | `useTranslations('education.<tool-slug>')` → `t('beginner')` |
| `toolUI.<tool-slug>` | `messages/en/tools/<tool-slug>.json` | `useTranslations('toolUI.<tool-slug>')` → `t('labelName')` |

Education files are merged into a single `education` namespace; tool UI files are merged into a single `toolUI` namespace. Both use `<tool-slug>` as a sub-key.

### Adding new strings

**To an existing tool** — add keys to the tool's JSON file and use them in the component:
1. Add key to `src/lib/i18n/messages/en/tools/<tool-slug>.json` under the `toolUI.<tool-slug>` object
2. In component: `const t = useTranslations('toolUI.<tool-slug>')` → `t('newKey')`

**To a new tool** — 3 files must be created and registered:
1. Create `src/lib/i18n/messages/en/tools/<tool-slug>.json` with `{ "toolUI": { "<tool-slug>": { ... } } }`
2. Create `src/lib/i18n/messages/en/education/<tool-slug>.json` with `{ "education": { "<tool-slug>": { ... } } }`
3. **Register both files in `src/lib/i18n/request.ts`**: add an import to the `Promise.all` array, add the variable to the `toolUIMessages` and/or `educationMessages` reducer array. **If you skip this step, the strings will not load and you'll get `MISSING_MESSAGE` errors at runtime.**

**To shared UI** (nav, footer, actions, etc.) — add keys to `messages/en/common.json` under the appropriate sub-object.

**Server components / metadata** — use `const t = await getTranslations('namespace')` (async).

**Rich text** — `t.rich('key', { link: (chunks) => <a href="...">{chunks}</a> })` for inline markup.

### What NOT to put in i18n

- **Canvas/WebGL data** — sensors, scenes, focal lengths, ND filters, WB presets keep English text directly in `src/lib/data/` files because `useTranslations` isn't available in draw functions. When adding locales, pass resolved names into drawing functions.
- **Education skeletons** (`src/lib/data/education/`) store only non-translatable data (IDs, difficulty, correctOption, optionValues). All text is in the education JSON files.
- **Glossary** (`src/lib/data/glossary.ts`) stores entry IDs and optional relatedTool slugs. Terms and definitions are in `messages/en/glossary.json`.

## Data Management

All pure data (constants, presets, lookup tables, configuration arrays) lives in `src/lib/data/`. UI plumbing (`PARAM_SCHEMA`, `DEFAULT_STATE`, component-specific config) stays co-located in `_components/`.

- **Shared data** — data used by 2+ tools gets its own file (e.g. `camera.ts` exports `APERTURES` used by star-trail and hyperfocal tools).
- **Per-tool data** — tool-specific constants get a file named after the tool (e.g. `fovSimulator.ts`, `frameStudio.ts`).
- **i18n for data** — user-facing prose goes to i18n JSON files (`src/lib/i18n/messages/en/`), not data files. Data files consumed by canvas/WebGL keep English text directly (sensors, scenes, etc.) since `useTranslations` isn't available in draw functions.
- **When adding a new tool**: extract all constants, presets, and lookup tables into `src/lib/data/<toolSlug>.ts`. Only leave UI wiring in `_components/`.

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

Education skeletons in `src/lib/data/education/content*.ts` define non-translatable structure (IDs, difficulty, correct answers). All user-facing text is in `src/lib/i18n/messages/en/education/*.json`. To add education content for a new tool, add a `ToolEducationSkeleton` entry and a corresponding JSON file.

## Design

- **No page scroll (desktop only).** On desktop, the application must fit within the viewport (100vh). The page never scrolls — only individual panels (controls, canvas, LearnPanel) scroll internally via `overflow-y: auto`. On mobile, pages are allowed to scroll naturally.
- **FOV Simulator is the reference implementation.** All tools should match its look and feel: dark surface panels, compact controls, same spacing/typography tokens, and consistent use of `var(--accent)` for interactive elements.
- **Three-column layout**: Tool pages render content (left/center) + LearnPanel (right sidebar, collapsible). Each tool manages its own layout and includes LearnPanel directly.
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
- **200-line file limit**: Keep all `.ts`/`.tsx` files under 200 lines (test files exempt). If a file grows beyond this, break it into smaller focused modules (e.g. extract hooks, sub-components, helpers, constants, or types into separate files).
- **Test files** co-located next to source files (`*.test.ts`)
- **25 test files, 353 tests** covering math, data, education, ads, and component integration
- **Privacy Sandbox is deprecated** — do not discuss, recommend, or implement any Privacy Sandbox APIs (Topics, Attribution Reporting, Protected Audience, etc.)

## E2E Testing (Playwright)

Playwright integration tests live in `src/e2e/` and run against a production build (`npm run build` + `npm run start`). Config: `playwright.config.ts`.

### Structure

```
src/e2e/
  smoke/all-pages.spec.ts   Parameterized smoke tests for all pages (200 status, no console errors, content rendering, no desktop scroll)
  tools/fov-simulator.spec.ts   FOV Simulator interaction tests
  tools/color-scheme.spec.ts    Color Scheme Generator interaction tests
  tools/sensor-size.spec.ts     Sensor Size Comparison interaction tests
  fixtures/test-image.jpg       Minimal JPEG fixture for upload tests
```

### Running

1. Build first: `npm run build`
2. Run tests: `npm run test:e2e` (or `npx playwright test`)
3. If port 3000 is in use: `lsof -ti:3000 | xargs kill -9` then retry
4. Run a single spec: `npx playwright test src/e2e/tools/fov-simulator.spec.ts`
5. Debug mode: `npx playwright test --debug`
6. View last report: `npx playwright show-report`

### Common Pitfalls When Writing/Fixing Tests

- **Duplicate DOM elements**: Every tool page renders controls twice — once in the desktop sidebar (`<aside>`) and once in a mobile controls section. Always scope selectors to avoid matching both. Use `page.locator('aside').first()` or `page.locator('[class*="sidebar"]').first()`.
- **LearnPanel challenge buttons**: The LearnPanel sidebar contains challenge questions with answer buttons (e.g. "24mm", "Complementary") that share text with tool control buttons. Use `sidebar.locator('button:text-is("...")')` scoped to the controls panel, not the full page.
- **CSS Modules hashed classes**: Class names are hashed at build time. Never match exact class names. Use `[class*="partialName"]` attribute selectors (e.g. `[class*="paletteBarSwatch"]`, `[class*="editForm"]`, `[class*="copyGroup"]`).
- **Hidden file inputs**: File upload uses a hidden `<input type="file">` inside `FileDropZone`. Use `page.locator('input[type="file"]').setInputFiles(...)` directly.
- **Ref-based state (no re-render)**: Some components use refs instead of state (e.g. `PhotoPicker`'s `imageLoaded`). When a ref controls visibility, the DOM won't update after async operations. Fix with `page.evaluate()` to force styles, then `click({ force: true })`.
- **Canvas/WebGL tools**: These render to `<canvas>`, not DOM elements. Use screenshot comparison (`canvas.screenshot()` + `Buffer.compare`) to verify visual changes.
- **ESM module context**: Test files use ESM. Use `import { fileURLToPath } from 'url'` and `path.dirname(fileURLToPath(import.meta.url))` instead of `__dirname`.
- **Console error filtering**: Smoke tests assert no console errors, but filter benign ones: favicon 404, cookieyes, adsense, adsbygoogle, `_vercel/speed-insights`. Add new benign patterns to the filter in `src/e2e/smoke/all-pages.spec.ts` as needed.
- **i18n translated text**: UI labels come from `next-intl` message files (`src/lib/i18n/messages/en/`). If a placeholder or label changes, check the translation JSON, not just the component source.
- **Select elements use value, not label**: For `<select>` dropdowns (e.g. sensor picker), use `selectOption('value_id')` not `selectOption({ label: '...' })`.

### CI

Playwright runs in GitHub Actions after `npm run build`. See `.github/workflows/deploy.yml`. CI installs Chromium + Firefox, runs all tests, and uploads `playwright-report/` as an artifact on failure.

## Logs

- **Dev logs**: `.next/dev/logs/next-development.log` — written automatically by Turbopack when `npm run dev` is running. Read this file when asked to "check the dev logs".
- **Prod logs**: Use `vercel logs <url>` or check the Vercel dashboard. Use `vercel logs --follow` for live tailing.

## Deployment

- Vercel auto-deploys from `main` branch
- GitHub Actions CI: `npm ci` → `npm audit` → `npm run lint` → `npm test` → `npm run build`
- Custom domain: `www.phototools.io` (apex `phototools.io` redirects to www)
- NEVER push to remote or deploy without explicit user instruction
