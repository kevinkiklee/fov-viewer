# Contributing to PhotoTools

Thanks for your interest in contributing! This is an open-source project and we welcome pull requests.

## Getting Started

```bash
git clone https://github.com/kevinkiklee/phototools.io.git
cd phototools.io
npm install
npm run dev
```

Dev server runs at `http://localhost:3000`.

## Development Workflow

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Run tests: `npm test`
4. Run lint: `npm run lint`
5. Run build to verify: `npm run build`
6. Open a pull request

## Project Structure

```
app/                    Routes (homepage, tool pages, learn/glossary)
components/
  layout/               Nav (mega-menu), Footer, ThemeProvider, ThemeToggle
  shared/               LearnPanel, InfoTooltip, ShareModal, ToolActions, FileDropZone, DraftBanner
  tools/                One directory per tool + shared/
lib/
  math/                 Pure calculation modules with co-located tests
  data/                 Tool registry, education content, sensors, focal lengths, scenes, glossary
  data/education/       Per-tool educational content, challenge definitions
  utils/                Export helpers
  types.ts              Shared TypeScript types
public/                 Static assets (images, icons, manifest)
```

## Adding a New Tool

1. **Math module** (if the tool needs calculations): create `lib/math/yourtool.ts` with pure functions and `lib/math/yourtool.test.ts` with tests.
2. **Component**: create `components/tools/your-tool/YourTool.tsx` (add `'use client'` at the top if it uses state, effects, or event handlers) and `YourTool.module.css` for styles.
3. **Route**: create `app/your-tool/page.tsx` with a co-located `_components/` directory for tool-specific UI.
4. **Registry**: add an entry to the `TOOLS` array in `lib/data/tools.ts`:
   ```ts
   { slug: 'your-tool', name: 'Your Tool', description: '...', status: 'draft', category: 'calculator' }
   ```
   Set `status: 'live'` when the tool is ready for production. In development, all tools are visible regardless of status.
5. **Education content**: add a `ToolEducation` entry in `lib/data/education/` with beginner/deeper explanations, tips, tooltips, and challenges. Include `LearnPanel` in the tool's layout.
6. **Verify**: run `npm test && npm run build`.

## Adding a Glossary Term

Add the term to the `GLOSSARY` array in `lib/data/glossary.ts`. Terms are sorted alphabetically in the UI. Each entry needs a `term`, `definition`, and optionally a `category`.

## Code Style

- **CSS Modules** for component styles (`Component.module.css`), not global CSS
- **Design tokens** via CSS custom properties for colors, spacing, typography
- **`'use client'`** directive on interactive components; everything else is a server component by default
- **Named exports** for all components
- **No external UI libraries** — custom CSS only
- **Pure math**: calculation logic in `lib/math/` with no React dependencies
- **TDD**: write tests for math modules before or alongside implementation
- **No emojis in code**

## Reporting Issues

Open an issue at https://github.com/kevinkiklee/phototools.io/issues with:
- What you expected to happen
- What actually happened
- Browser and device info
- Screenshot if relevant
