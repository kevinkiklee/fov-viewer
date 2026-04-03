# Shared ToolShell Component

## Overview

Replace all per-tool layout duplication with a single `<ToolShell>` component. Every tool uses the same template: 280px left sidebar (controls + results) | flex-1 main content | collapsible LearnPanel right panel. Tools that currently lack a sidebar get one — their controls move from inline to sidebar.

## The Component

### `<ToolShell>`

**File:** `components/shared/ToolShell.tsx` + `ToolShell.module.css`

**Props:**
```typescript
interface ToolShellProps {
  slug: string                    // Tool slug for metadata + LearnPanel
  sidebar: ReactNode              // Sidebar content (controls, results)
  topbar?: ReactNode              // Optional topbar above main content (presets, scene strip)
  bottombar?: ReactNode           // Optional bar below main content (DoF diagram)
  children: ReactNode             // Main content area (canvas, table, visualization)
  mainClassName?: string          // Optional extra class for main area
}
```

**Layout (desktop >= 1024px):**
```
┌─────────────────────────────────────────────────────────┐
│ Nav (44px)                                               │
├──────────┬──────────────────────────────┬────────────────┤
│ Sidebar  │ Topbar (optional)            │ LearnPanel     │
│ 280px    ├──────────────────────────────┤ 260px          │
│          │ Main Content (flex 1)        │ (collapsible)  │
│ scroll-y │                              │                │
│          ├──────────────────────────────┤                │
│          │ Bottombar (optional)         │                │
├──────────┴──────────────────────────────┴────────────────┤
│ Footer                                                    │
└─────────────────────────────────────────────────────────┘
```

**Layout (mobile < 1024px):**
```
┌───────────────────────┐
│ Nav (44px)            │
├───────────────────────┤
│ Topbar (optional)     │
├───────────────────────┤
│ Main Content          │
├───────────────────────┤
│ Bottombar (optional)  │
├───────────────────────┤
│ Sidebar (full width)  │
├───────────────────────┤
│ LearnPanel (full w)   │
├───────────────────────┤
│ Footer                │
└───────────────────────┘
```

**CSS module provides:**
- `.shell` — flex row, height 100%, overflow hidden
- `.sidebar` — 280px, border-right, overflow-y auto, padding 16px, flex column gap 14px
- `.center` — flex 1, flex column, min-width 0
- `.topbar` — flex row, centered, border-bottom, 10px 16px padding, gap 8px
- `.main` — flex 1, overflow-y auto, padding 24px (for canvas tools) or 16px (configurable)
- `.bottombar` — border-top, padding
- Mobile breakpoint at 1023px: flex-direction column, sidebar full-width order 2, main order 1

**The component handles:**
- DraftBanner (if tool status is 'draft')
- Tool title + description rendered in sidebar header
- ToolActions (share/copy/embed) rendered in sidebar
- LearnPanel rendered at right edge
- Mobile reflow

**What it does NOT handle:**
- Canvas rendering, form state, tool-specific logic — that stays in the tool
- ToolPageShell is replaced by ToolShell (ToolPageShell is deleted)

### Shared Form Components

**File:** `components/tools/shared/FormField.tsx` + updated `Calculator.module.css`

**`<FormField>`** — wraps label + control element:
```typescript
interface FormFieldProps {
  label: string
  value?: string | number    // Rendered inline in label if provided
  locked?: boolean           // Shows "(locked)" indicator
  children: ReactNode        // The actual <select>, <input>, <input type="range">
  className?: string
}
```

Renders:
```html
<div class="field">
  <label class="fieldLabel">
    {label}{value && `: ${value}`}{locked && ' (locked)'}
  </label>
  {children}
</div>
```

**`<ResultCard>`** — label + value display:
```typescript
interface ResultCardProps {
  label: string
  value?: string | number
  size?: 'lg' | 'sm'        // lg = 20px (default), sm = 14px
  children?: ReactNode       // For custom content (badges, notes)
  className?: string
}
```

**`<PresetStrip>`** — row of toggle buttons:
```typescript
interface PresetStripProps {
  label?: string              // e.g. "Scene:"
  options: { key: string; label: string }[]
  activeKey: string
  onChange: (key: string) => void
}
```

### Shared CSS

**File:** `components/tools/shared/Controls.module.css`

Extracted from the duplicated patterns. Contains:
- `.select`, `.input` — form element base styles
- `.slider` — range input styles
- `.panel` — bg-surface container with border-radius 10px
- `.panelTitle` — uppercase label
- `.resultGrid` — 2-column grid for result cards
- Mobile overrides (44px touch targets, 16px font)

All sidebar+canvas tools import this instead of duplicating.

## Tools to Convert (sidebar-less → sidebar)

These 9 tools currently render controls inline in their main content area. Each needs its controls moved to a sidebar, with the main area showing only the visualization/output.

### 1. EV Chart
- **Sidebar:** Lighting condition selector dropdown
- **Main:** The EV table (full width, scrollable)
- **Below table:** ISO details section (when a cell is selected)

### 2. Histogram Explainer
- **Sidebar:** FileDropZone for image upload, view mode tabs (Luminance/RGB/Channels), clipping annotations, explanation text
- **Main:** Histogram canvas visualization (full size)

### 3. EXIF Viewer
- **Sidebar:** FileDropZone for image upload
- **Main:** EXIF data tables (sections: Camera, Lens, Settings, Image, Date, GPS, Software)

### 4. White Balance
- **Sidebar:** Temperature slider (2000-10000K) with labels, preset buttons, RGB/Hex result cards
- **Main:** Color preview (full size, colored rectangle with temperature label)

### 5. ND Filter Calculator
- **Sidebar:** Base shutter speed select, ND filter select, result cards (resulting speed, stops)
- **Main:** Quick reference table (full width)

### 6. Shutter Speed Guide
- **Sidebar:** Focal length, sensor, stabilization, subject motion selects, result card (recommended speed), explanation text
- **Main:** Empty or a visual speed scale (can show a simple visualization)

### 7. Hyperfocal Table
- **Sidebar:** Sensor selector
- **Main:** Hyperfocal distance table (full width)

### 8. Sensor Size
- **Sidebar:** Sensor checkboxes, mode toggle (Overlay/Side-by-Side/Pixel Density), resolution input (pixel density mode), comparison data table
- **Main:** Canvas visualization

### 9. Glossary
- **Sidebar:** Search input, alphabet navigation buttons
- **Main:** Term list (scrollable)

## Tools to Migrate (already have sidebar — adopt ToolShell)

These 6 tools already have the sidebar+canvas pattern but duplicate the layout CSS. They switch to using `<ToolShell>` and delete their layout CSS.

1. **FOV Simulator** — sidebar=Sidebar component, topbar=SceneStrip, main=Canvas
2. **Exposure Simulator** — sidebar=ControlsPanel, topbar=scene thumbnails, main=ExposurePreview canvas
3. **DoF Calculator** — sidebar=SettingsPanel+ResultsPanel, topbar=scene presets, main=DoFCanvas, bottombar=DoFDiagram
4. **Diffraction Limit** — sidebar=ControlsPanel, topbar=detail presets, main=DiffractionCanvas
5. **Star Trail Calculator** — sidebar=ControlsPanel, topbar=latitude presets, main=StarTrailCanvas
6. **Color Harmony** — sidebar=controls, topbar=palette swatches, main=ColorWheel

## What Gets Deleted

- `components/shared/ToolPageShell.tsx` + `.module.css` — replaced by ToolShell
- Layout CSS from each sidebar+canvas tool's module (`.app`, `.appBody`, `.sidebar`, `.canvasArea`, `.canvasMain`, `.canvasTopbar`, `.mobileControls`, mobile breakpoint) — all provided by ToolShell
- `components/tools/shared/Calculator.module.css` layout classes (`.layout`, `.controls`) — replaced by ToolShell sidebar

## Out of Scope

- Changing any tool's functionality or calculations
- Adding new visualizations to tools that don't have them (Shutter Speed Guide main area can be minimal)
- Changing the LearnPanel component itself
- Changing the Nav or Footer
