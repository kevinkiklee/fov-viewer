# CLAUDE.md

## Project Overview

Photo Tools is a suite of 15 free photography calculators, simulators, and references (14 tools + FOV Viewer) plus a glossary. Built as a Next.js 16 App Router hub with a tool registry system. Deployed to Vercel at `photo-tools.iser.io`.

## Tech Stack

- Next.js 16 (App Router, Turbopack dev)
- React 19 + TypeScript
- Vitest + jsdom + @testing-library/react + @testing-library/jest-dom
- ESLint with typescript-eslint
- CSS Modules + CSS custom properties (design tokens)
- Canvas API for image rendering (FOV Viewer overlays)
- WebGL2 + GLSL shaders (Exposure Simulator image preview)
- Vercel (deployment)

## Commands

- `npm run dev` — start dev server with Turbopack at `http://localhost:3000`
- `npm run build` — production build via `next build`
- `npm run start` — serve production build locally
- `npm test` — run Vitest tests (165 tests across 13 files)
- `npm run test:watch` — run tests in watch mode
- `npm run lint` — run ESLint

## Architecture

- **App Router**: all routes under `app/`. Homepage (`app/page.tsx`) is the tool hub. Each tool lives at `app/tools/[slug]/page.tsx`. Glossary at `app/learn/glossary/page.tsx`.
- **Tool Registry**: `lib/data/tools.ts` defines all 15 tools with slug, name, description, status (`live`/`draft`), and category. `getLiveTools()` returns only published tools; `getToolBySlug()` looks up by slug.
- **Pure Math Modules**: `lib/math/` contains pure functions for FOV, DOF, exposure (including shader math for CoC, motion blur, noise), diffraction, star trails, color, and histogram calculations. Each has co-located `.test.ts` files. TDD approach — math is tested independently from UI.
- **Components**: organized into `components/layout/` (Nav, Footer, ThemeProvider, ThemeToggle), `components/shared/` (ToolPageShell, FileDropZone, DraftBanner, Toast), and `components/tools/` (one directory per tool + `shared/` for cross-tool components).
- **Data**: `lib/data/` contains tool registry, sensors, focal lengths, scenes, and glossary terms — each with tests.

## Key Directories

```
app/                    Routes (homepage, tools, learn/glossary)
components/
  layout/               Nav, Footer, ThemeProvider, ThemeToggle
  shared/               ToolPageShell, FileDropZone, DraftBanner, Toast
  tools/                One directory per tool + shared/
lib/
  math/                 Pure calculation modules (fov, dof, exposure, etc.)
  data/                 Tool registry, sensors, focal lengths, scenes, glossary
  utils/                Export helpers
  types.ts              Shared TypeScript types
public/                 Images, icons, manifest, sitemap, robots.txt
```

## Tool Visibility

Tools have a `status` field in `lib/data/tools.ts`: `'live'` (visible on homepage) or `'draft'` (hidden, accessible only by direct URL with a draft banner). To publish a tool, change its status to `'live'`.

## Design

- **FOV Viewer is the reference implementation.** All tools should match its look and feel: dark surface panels, compact controls, same spacing/typography tokens, and consistent use of `var(--accent)` for interactive elements.
- **Full-height tools** (FOV Viewer, Exposure Simulator) bypass `ToolPageShell` and render directly at `app/tools/[slug]/page.tsx`. They use a sidebar (280px) + canvas/preview layout with mobile breakpoint at 1024px.

## Conventions

- **CSS Modules** for component styles (e.g. `Component.module.css`), design tokens via CSS custom properties
- **`'use client'`** directive on interactive components; server components by default
- **TDD for math**: all `lib/math/` modules have thorough unit tests
- **Named exports** for all components
- **No external UI libraries** — custom CSS only
- **Test files** co-located next to source files (`*.test.ts`)
- **13 test files, 165 tests** covering math, data, and integration

## Deployment

- Vercel auto-deploys from `main` branch
- GitHub Actions CI: `npm ci` → `npm audit` → `npm run lint` → `npm test` → `npm run build`
- Custom domain: `photo-tools.iser.io`
- NEVER push to remote or deploy without explicit user instruction
