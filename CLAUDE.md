# CLAUDE.md

## Project Overview

PhotoTools is a suite of free photography calculators, simulators, and references plus a glossary. Built as a Next.js 16 App Router hub with a tool registry system. Deployed to Vercel at `phototools.io`.

## Tech Stack

- Next.js 16 (App Router, Turbopack dev)
- React 19 + TypeScript 6
- Vitest + jsdom + @testing-library/react + @testing-library/jest-dom
- ESLint with typescript-eslint
- CSS Modules + CSS custom properties (design tokens)
- Canvas API for image rendering (FOV Simulator overlays)
- WebGL2 + GLSL shaders (Exposure Simulator image preview)
- Vercel (deployment)

## Commands

- `npm run dev` — start dev server with Turbopack at `http://localhost:3000`
- `npm run build` — production build via `next build`
- `npm run start` — serve production build locally
- `npm test` — run Vitest tests (170 tests across 14 files)
- `npm run test:watch` — run tests in watch mode
- `npm run lint` — run ESLint

## Architecture

- **App Router**: all routes under `app/`. Homepage (`app/page.tsx`) is the tool hub. Each tool lives at `app/tools/[slug]/page.tsx`. Glossary at `app/learn/glossary/page.tsx`.
- **Tool Registry**: `lib/data/tools.ts` defines all tools with slug, name, description, status (`live`/`draft`), and category. `getLiveTools()` returns all tools in development, only `live` tools in production. `getToolBySlug()` looks up by slug.
- **Education System**: `lib/data/education/` contains per-tool educational content (beginner/deeper explanations, key factors, pro tips, tooltips, challenges). `LearnPanel` renders as a right sidebar on every tool page.
- **Pure Math Modules**: `lib/math/` contains pure functions for FOV, DOF, exposure (including shader math for CoC, motion blur, noise), diffraction, star trails, color, and histogram calculations. Each has co-located `.test.ts` files. TDD approach — math is tested independently from UI.
- **Components**: organized into `components/layout/` (Nav, Footer, ThemeProvider, ThemeToggle), `components/shared/` (ToolPageShell, LearnPanel, InfoTooltip, ShareModal, ToolActions, FileDropZone, DraftBanner, Toast), and `components/tools/` (one directory per tool + `shared/` for cross-tool components).
- **Data**: `lib/data/` contains tool registry, education content, sensors, focal lengths, scenes, and glossary terms — each with tests.

## Key Directories

```
app/                    Routes (homepage, tools, learn/glossary)
components/
  layout/               Nav (mega-menu), Footer, ThemeProvider, ThemeToggle
  shared/               ToolPageShell, LearnPanel, InfoTooltip, ShareModal, ToolActions, FileDropZone, DraftBanner, Toast
  tools/                One directory per tool + shared/
lib/
  math/                 Pure calculation modules (fov, dof, exposure, etc.)
  data/                 Tool registry, education content, sensors, focal lengths, scenes, glossary
  data/education/       Per-tool educational content, challenge definitions, types
  utils/                Export helpers
  types.ts              Shared TypeScript types
public/                 Images, icons, manifest, sitemap, robots.txt
```

## Tool Visibility

Tools have a `status` field in `lib/data/tools.ts`: `'live'` (visible in production) or `'draft'` (hidden in production, accessible only by direct URL with a draft banner).

- **Development** (`npm run dev`): all tools are visible regardless of status.
- **Production** (`npm run build`): only `'live'` tools appear in the homepage, nav mega-menu, and footer.
- To publish a tool, change its status to `'live'` in `lib/data/tools.ts`.

## Educational Layer

Each tool has a **LearnPanel** (right sidebar) with:
- **Beginner explanation** — 2-3 sentence intro for newcomers
- **Deeper explanation** — physics/optics/math behind the concept
- **Key factors** — what controls the effect
- **Pro tips** — practical real-world advice (amber callout)
- **Challenges** — 3-5 progressive multiple-choice questions with pass/fail feedback, persisted to localStorage
- **Tooltips** — hover info icons on control labels (via `InfoTooltip` component)

Content is defined as structured data in `lib/data/education/content.ts` and `content2.ts`. To add education content for a new tool, add a `ToolEducation` entry matching the tool's slug.

## Design

- **FOV Simulator is the reference implementation.** All tools should match its look and feel: dark surface panels, compact controls, same spacing/typography tokens, and consistent use of `var(--accent)` for interactive elements.
- **Three-column layout**: ToolPageShell renders tool content (left/center) + LearnPanel (right sidebar, collapsible). Full-height tools (FOV Simulator, Color Harmony) manage their own layout but include LearnPanel directly.
- **Nav mega-menu**: Tools dropdown groups tools by category (Visualizers, Calculators, Reference, File Tools) with name + description per item.

## Conventions

- **CSS Modules** for component styles (e.g. `Component.module.css`), design tokens via CSS custom properties
- **`'use client'`** directive on interactive components; server components by default
- **TDD for math**: all `lib/math/` modules have thorough unit tests
- **Named exports** for all components
- **No external UI libraries** — custom CSS only
- **Test files** co-located next to source files (`*.test.ts`)
- **14 test files, 170 tests** covering math, data, and integration

## Deployment

- Vercel auto-deploys from `main` branch
- GitHub Actions CI: `npm ci` → `npm audit` → `npm run lint` → `npm test` → `npm run build`
- Custom domain: `phototools.io`
- NEVER push to remote or deploy without explicit user instruction
