# PhotoTools Project Context

PhotoTools is a high-performance, educational photography application providing free calculators, simulators, and references. It is built as a Next.js 16 App Router application with a focus on SEO-driven traffic and advertisement compatibility.

## Core Design Philosophy

- **No Page Scroll**: This is a **hard constraint**. The application MUST fit within 100vh. The page never scrolls; only individual panels (controls, results, sidebars) scroll internally via `overflow-y: auto`.
- **Vanilla CSS Only**: No external UI libraries (MUI, Shadcn, etc.) or Tailwind CSS. Use CSS Modules and existing design tokens (CSS custom properties).
- **Reference Implementation**: The FOV Simulator (`src/app/fov-simulator/`) is the gold-standard. All new tools must mirror its layout, spacing, and interactive patterns.
- **SEO & Ads**: Layouts must be clean, semantic, and have predictable content regions for ad placement without layout shifts (CLS).

## Architecture & Core Systems

### 1. Tool Registry (`src/lib/data/tools.ts`)
Central source of truth for all tools.
- **Status**: Each tool has `dev` and `prod` status fields: `'live'`, `'draft'`, or `'disabled'`.
- **Visibility**: `live` tools are fully visible. `draft` tools are hidden from menus but accessible via direct URL with a `DraftBanner`. `disabled` tools are completely hidden.

### 2. Pure Math Modules (`src/lib/math/`)
Core photography logic is isolated into pure TypeScript modules (FOV, DOF, exposure, shaders, etc.).
- **TDD Requirement**: Every math module MUST have a co-located `*.test.ts` file with 100% coverage.
- **UI Integration**: Components should be thin wrappers around these math functions.

### 3. Education System (`src/lib/data/education/`)
Every tool features a `LearnPanel` (right sidebar) defined in `content.ts` and `content2.ts`:
- **Beginner/Deeper Explanations**: Multi-level educational content.
- **Key Factors & Pro Tips**: Bulleted lists and practical advice (amber callouts).
- **Interactive Challenges**: 3-5 multiple-choice questions with persistence to `localStorage`.
- **Tooltips**: Use `InfoTooltip` on control labels for quick definitions.

### 4. Layout
Each tool manages its own layout (Controls | Main Visualizer | LearnPanel). Consistent header actions (Share, Export, Info) via `ToolActions` component.

## Engineering Standards

- **Tech Stack**: Next.js 16 (App Router, Turbopack), React 19, TypeScript 6, Vitest, CSS Modules, Canvas/WebGL2/GLSL.
- **Code Quality**:
  - **200-line file limit**: Keep all `.ts`/`.tsx` files under 200 lines. Break into smaller modules if exceeded.
  - **Named exports**: Use for all components.
  - **Shared components first**: Check `src/components/shared/` before building tool-specific UI.
- **Testing**: Co-locate test files next to source files (`*.test.ts` or `*.test.tsx`). The project has ~235 tests across 18 files.
- **Privacy Sandbox**: Deprecated. Do not discuss, recommend, or implement any Privacy Sandbox APIs.

## Directory Mapping (all code in `src/`)

- `src/app/`: Routes (Home at `/`, Tools at `/[slug]`, Glossary at `/learn/glossary`).
- `src/app/[slug]/_components/`: Tool-specific UI components (co-located).
- `src/components/layout/`: Global Nav (mega-menu), Footer, Theme providers.
- `src/components/shared/`: Reusable tool UI components (Shell, LearnPanel, Tooltips, etc.).
- `src/lib/math/`: Pure calculation logic + tests.
- `src/lib/data/`: Static data (Sensors, Focal Lengths, Tool Registry, Education, Glossary).
- `public/`: Images, icons, manifest, sitemap, robots.txt.

## Build & Run Commands

- `npm run dev`: Start dev server with Turbopack.
- `npm run build`: Production build.
- `npm test`: Run all Vitest tests.
- `npm run lint`: Run ESLint.

## Deployment & CI

- **GitHub Actions**: Runs `npm ci` → `npm audit` → `npm run lint` → `npm test` → `npm run build`.
- **Vercel**: Auto-deploys from the `main` branch to `www.phototools.io`. The apex `phototools.io` redirects to `www`.
