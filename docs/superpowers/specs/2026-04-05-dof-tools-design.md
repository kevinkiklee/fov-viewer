# DOF Tools Suite — Design Spec

**Date:** 2026-04-05
**Status:** Approved
**Tools:** DOF Simulator, Focus Stacking Calculator, Equivalent Settings Calculator

---

## Overview

Three new photography tools for PhotoTools, centered around depth of field:

1. **Depth-of-Field Simulator** (`/dof-simulator`) — WebGL-powered real-time DOF visualization with per-pixel depth-mapped blur, bokeh shape simulation, A/B comparison, and educational depth overlays.
2. **Focus Stacking Calculator** (`/focus-stacking-calculator`) — Calculates optimal shot count and focus distances to achieve front-to-back sharpness across a depth range.
3. **Equivalent Settings Calculator** (`/equivalent-settings-calculator`) — Computes equivalent focal length, aperture, and distance across sensor formats to match DOF and framing.

All three tools ship with `dev: 'live'`, `prod: 'disabled'`. UI is consistent with existing tools (FOV Simulator as reference). The existing `/dof-calculator` route and its files will be renamed/migrated to `/dof-simulator`.

---

## Tool 1: Depth-of-Field Simulator

### Rendering Architecture

**WebGL2 + GLSL shaders** — consistent with Exposure Simulator and White Balance Visualizer.

**Pipeline:**
1. Load scene photo as texture + companion grayscale depth map as second texture
2. Fragment shader samples depth per-pixel, converts to world distance using scene's near/far range
3. Compute blur radius per-pixel using DOF formula: `blur = max(geometricBlur, airyDisk)` when diffraction is enabled
4. Multi-pass separable blur with variable radius per-pixel
5. Bokeh kernel shape applied during blur (disc, polygon aperture, catadioptric)
6. Subject proxy (depth-layered figure or focus target) composited with appropriate per-zone blur
7. In A/B mode: render twice with different uniforms, composite via wipe divider or side-by-side split

**Key formulas (from existing `calcDoF` + new blur formulas):**

```
Hyperfocal:       H = f² / (N × c) + f
Near focus:       Dn = s × (H - f) / (H + s - 2f)
Far focus:        Df = s × (H - f) / (H - s)
Background blur:  blur_mm = f/N × (s/(s-f) × ((d-f)/d) - 1)   [d = depth at pixel]
Blur in pixels:   blur_px = blur_mm / sensorWidth × viewportWidth
Airy disk:        airy = 2.44 × 0.00055 × N    [λ ≈ 550nm green light]
```

Where: f = focal length (mm), N = f-number, s = subject distance (mm), d = depth at pixel (mm), c = circle of confusion (mm).

**Depth map convention:** White (255) = closest to camera, Black (0) = farthest. Each scene defines `nearDistance` and `farDistance` in meters; shader linearly interpolates.

### Layout

**Three-column layout (Layout A pattern, wider sidebar):**

- **Left sidebar (~320px, scrollable):**
  - Camera panel: sensor dropdown, orientation toggle (portrait/landscape)
  - Lens panel: focal length (FocalLengthField — logarithmic slider + presets + editable), aperture (slider with 1/3-stop snaps + sweet spot indicator)
  - Distance panel: subject distance (logarithmic slider 0.3m–100m + editable value)
  - Framing panel: preset buttons (Face / Portrait / Medium / American / Full), lock mode toggle (Constant Focal Length / Constant Distance)
  - Bokeh panel (collapsed by default): shape dropdown (Disc, 5–9 blade polygon, Catadioptric), diffraction toggle
  - Results panel: total DOF, near/far focus, hyperfocal, CoC, background blur (mm + %), Subject Isolation Score (0–100)

- **Center (flex: 1):**
  - Toolbar: scene picker thumbnails, Figure/Target mode toggle, Single/A|B toggle (with Wipe/Split sub-toggle when A|B active), blur % readout
  - WebGL viewport: main simulation canvas with interactive depth ruler (hover shows distance + blur at cursor)
  - DOF diagram: horizontal distance bar with camera icon, draggable subject marker, green in-focus zone, scale labels
  - Blur profile graph: small SVG showing blur amount vs distance curve with sharp zone highlighted

- **Right: LearnPanel (collapsible)**

### Subject Modes (toggleable)

**Depth-Layered Figure:**
- Semi-transparent human form rendered as a WebGL overlay in the same shader pipeline (drawn as a textured quad with alpha, positioned based on field-of-view geometry)
- 5 depth zones with individually computed blur: nose (closest), face, eyes (at focus plane — sharp), ears, body (farthest behind)
- Color-coded zones: amber for behind-focus blur, cyan for in-front blur, green for in-focus
- Zone depths relative to subject distance: nose −50mm, face −20mm, eyes 0mm (focus), ears +70mm, body +100mm
- Height scales based on field of view at subject distance
- 5 size presets matching framing buttons

**Focus Target:**
- Camera-style focus reticle (concentric circles + crosshair) at subject distance
- Distance label below reticle
- "IN FOCUS" / "OUT OF FOCUS" indicator
- No human figure — scene photo is the subject
- Best for landscape and architecture scenes

### A/B Comparison

Two sub-modes, toggled by user:

**Wipe mode:**
- Single viewport split by draggable vertical divider (amber line with grip handle)
- Left side renders with A settings, right with B settings
- Settings labels in corners: "A: f/1.4 · 85mm" (amber) / "B: f/2.8 · 50mm" (cyan)
- Best for same-framing comparisons (aperture changes)

**Split mode:**
- Two separate viewports side by side with 6px gap
- Each renders the full scene independently with its own settings
- Results overlay in each viewport corner
- Best for different-framing comparisons (focal length changes)

**A/B state management:**
- When A/B is activated, sidebar shows an A/B toggle at the top to select which set of settings to edit
- Each set has its own focal length, aperture, distance, sensor, framing
- Scene, subject mode, and bokeh shape are shared between A and B

### Interactive Depth Ruler

- Hover anywhere in the viewport
- Tooltip follows cursor showing: distance from camera (meters), blur amount (mm), blur classification (sharp / slightly soft / very blurred)
- Reads from the depth map texture via `gl.readPixels` or a uniform lookup
- Disabled during A/B wipe mode (would be confusing at the boundary)

### Aperture Sweet Spot Indicator

- On the aperture slider, a green zone marking the diffraction-limited range
- Below the sweet spot: geometric blur dominates (wider aperture = more blur)
- Above the sweet spot: diffraction dominates (smaller aperture = softer due to Airy disk)
- Sweet spot calculated as: `optimalN = sqrt(f / (2.44 × λ) × (s/(s-f) × ((d-f)/d) - 1))`
- Visual: green tick or highlighted region on the slider track

### Subject Isolation Score

A 0–100 score quantifying how well the subject separates from the background:

```
isolationScore = clamp(backgroundBlur_mm / cocThreshold × 100, 0, 100)
```

Where `cocThreshold = 0.5mm` (the blur amount at which background separation becomes clearly visible to the eye). Displayed as a colored badge: red (0–30), amber (30–60), green (60–100).

### Bundled Scenes (6)

Each scene = photo JPEG + depth map PNG (same dimensions) + metadata object.

| # | Key | Name | Description | Depth range |
|---|-----|------|-------------|-------------|
| 1 | `park-portrait` | Park Portrait | Person-distance subject, trees behind | 2m – 50m |
| 2 | `street` | Urban Street | Buildings receding, sidewalk perspective | 3m – 200m |
| 3 | `landscape` | Landscape | Foreground rocks, distant mountains | 0.5m – infinity |
| 4 | `cafe` | Indoor Café | Shallow interior, close background | 1m – 15m |
| 5 | `architecture` | Architecture | Geometric building, angular depth planes | 5m – 100m |
| 6 | `macro` | Macro / Tabletop | Close-up flowers or small objects | 0.1m – 2m |

**Scene data structure:**
```typescript
interface DofScene {
  key: string
  name: string
  photo: string          // path to scene JPEG
  depthMap: string       // path to depth map PNG
  nearDistance: number    // meters (white in depth map)
  farDistance: number     // meters (black in depth map)
  defaultSubjectDistance: number  // meters
  thumbnail: string      // path to thumbnail for picker
}
```

**Depth maps are hand-authored.** For V1, source Creative Commons / royalty-free photos, create depth maps in Photoshop using gradient tools and manual painting. White = nearest, black = farthest.

### Bokeh Shapes

Rendered in the blur shader via kernel shape functions:

| Key | Name | Description |
|-----|------|-------------|
| `disc` | Circular (default) | Uniform disc — standard lens with rounded aperture |
| `blade5` | 5 Blades | Pentagonal aperture shape |
| `blade6` | 6 Blades | Hexagonal aperture shape |
| `blade7` | 7 Blades | Heptagonal — most common modern lens |
| `blade8` | 8 Blades | Octagonal aperture shape |
| `blade9` | 9 Blades | Near-circular, high-end lenses |
| `cata` | Catadioptric | Donut/ring shape — mirror lenses |

### Framing Presets

Based on standard cinematography framing, scaled by subject height:

| Preset | Height (mm) | Description |
|--------|-------------|-------------|
| Face | 320 | Close-up face shot |
| Portrait | 480 | Head and shoulders |
| Medium | 700 | Waist up |
| American | 1000 | Knees up |
| Full | 1700 | Full body |

When a framing preset is selected:
- **Constant focal length mode:** adjusts subject distance to achieve the framing
- **Constant distance mode:** adjusts focal length to achieve the framing

### Sensor Data

Expand existing `sensors.ts` with additional formats from dofsimulator.net data. Priority additions:

| Format | Width × Height (mm) | Crop factor |
|--------|---------------------|-------------|
| Medium Format (645D) | 44 × 33 | 0.79 |
| APS-H | 28.5 × 19 | 1.26 |
| APS-C (Canon) | 22.3 × 14.9 | 1.61 |
| 1" sensor | 12.8 × 9.6 | 2.71 |

Keep existing 9 sensors, add these 4 for a total of 13.

### Aperture Values

Expand to 1/3-stop increments for the slider (37 values):
```
1, 1.1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.5, 2.8, 3.2, 3.5, 4, 4.5, 5,
5.6, 6.3, 7.1, 8, 9, 10, 11, 13, 14, 16, 18, 20, 22, 25, 29, 32, 36,
40, 45, 51, 57, 64
```

Full-stop labels for display ticks: 1, 1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22, 32, 45, 64.

### URL Query Sync

Uses the standard `useQueryInit` + `useToolQuerySync` pattern with `PARAM_SCHEMA`:

```typescript
PARAM_SCHEMA = {
  fl: intParam(85, 8, 800),           // focal length
  f: numParam(2.8, 1, 64),            // aperture
  d: numParam(3, 0.1, 100),           // subject distance
  s: sensorParam('ff'),                // sensor
  scene: strParam('park-portrait', [...]), // scene key
  mode: strParam('figure', ['figure', 'target']),
  orient: strParam('landscape', ['landscape', 'portrait']),
  bokeh: strParam('disc', ['disc', 'blade5', ...]),
  ab: strParam('off', ['off', 'wipe', 'split']),
}
```

A/B mode encodes B settings with `b_` prefix: `b_fl`, `b_f`, `b_d`, `b_s`.

---

## Tool 2: Focus Stacking Calculator

### Concept

Given camera settings and a desired depth range (near limit to far limit), calculates the number of shots needed and the focus distance for each shot, ensuring DOF bands overlap by a configurable margin.

### Algorithm

```
1. Start at nearLimit
2. For current focus distance, compute farFocus using calcDoF()
3. Next focus distance = farFocus - (farFocus - currentFocus) × overlapPercent
4. Repeat until farFocus >= farLimit or focus at infinity
5. Return array of { shotNumber, focusDistance, nearFocus, farFocus }
```

### Layout (standard 3-column, normal sidebar ~280px)

**Left sidebar:**
- Camera panel: focal length (FocalLengthField), aperture (slider), sensor (dropdown)
- Depth Range panel: near limit (slider + editable, 0.1m–100m), far limit (slider + editable, 0.1m–infinity), overlap % (slider, 10–50%, default 20%)
- Results panel: shot count, total depth covered, overlap margin per step

**Center:**
- Stacking sequence visualization (SVG):
  - Horizontal distance axis (camera left, scene right)
  - Each shot as a colored band showing its DOF range
  - Overlap zones in lighter shade
  - Shot numbers labeled on each band
  - Near/far limit markers as vertical dashed lines
  - Draggable handles on near/far limit markers for direct manipulation
- Shot list table below: shot #, focus distance, near focus, far focus

**Right:** LearnPanel

### Export

"Copy to clipboard" button copies focus distances as a numbered text list:
```
Focus Stacking Sequence (85mm f/8 APS-C)
1. 0.45m
2. 0.52m
3. 0.61m
...
```

### Data Structure

```typescript
interface StackingResult {
  shots: Array<{
    number: number
    focusDistance: number   // meters
    nearFocus: number      // meters
    farFocus: number       // meters
  }>
  totalDepth: number       // meters
  overlapMargin: number    // meters (minimum)
  settings: {
    focalLength: number
    aperture: number
    sensorId: string
    coc: number
  }
}
```

### URL Query Sync

```typescript
PARAM_SCHEMA = {
  fl: intParam(50, 8, 800),
  f: numParam(8, 1, 64),
  s: sensorParam('ff'),
  near: numParam(0.5, 0.1, 100),
  far: numParam(5, 0.1, 100),
  overlap: intParam(20, 10, 50),
}
```

---

## Tool 3: Equivalent Settings Calculator

### Concept

"I shoot f/1.4 on full-frame at 85mm — what aperture on APS-C gives the same DOF at the same framing?" Computes equivalent settings across sensor formats.

### Equivalence Math

For the same framing (same field of view):
```
equivalentFL = sourceFL × (targetCrop / sourceCrop)
```

For the same DOF (same total depth of field):
```
equivalentAperture = sourceAperture × (targetCrop / sourceCrop)
```

For constant distance (same perspective, different framing):
```
equivalentFL = sourceFL × (targetCrop / sourceCrop)
equivalentAperture = sourceAperture × (targetCrop / sourceCrop)
// distance stays the same
```

For constant framing (same composition, different distance):
```
equivalentFL = sourceFL × (targetCrop / sourceCrop)
equivalentDistance = sourceDistance × (targetCrop / sourceCrop)
equivalentAperture = sourceAperture × (targetCrop / sourceCrop)
```

### Layout (standard 3-column, normal sidebar ~280px)

**Left sidebar:**
- Source Settings panel: focal length (FocalLengthField), aperture (slider), subject distance (slider + editable), sensor (dropdown) — labeled "Your Camera"
- Target Sensors panel: multi-select checkboxes for target sensors to compare against — labeled "Compare With"

**Center:**
- Equivalence cards (one per target sensor):
  - Source vs target side by side
  - Shows: equivalent FL, equivalent aperture, equivalent distance
  - Mini DOF diagram showing both produce the same DOF band
  - Warning badge if equivalent aperture doesn't physically exist (e.g. "f/0.9 — not available")
  - Warning badge if equivalent FL is outside common range
- Summary insight text: "To match this look on APS-C, you'd need a 56mm f/0.9 — which doesn't exist. The closest real option is 56mm f/1.2, giving slightly deeper DOF."

**Right:** LearnPanel

### Data Structure

```typescript
interface EquivalentResult {
  targetSensor: SensorPreset
  equivalentFL: number
  equivalentAperture: number
  equivalentDistance: number
  sourceDof: DoFResult
  targetDof: DoFResult
  isApertureRealistic: boolean    // false if < f/0.95 or > f/64
  isFLRealistic: boolean          // false if < 8mm or > 800mm
  closestRealAperture: number     // nearest real f-stop
  closestRealFL: number           // nearest real focal length
  dofWithRealSettings: DoFResult  // DOF if using closest real settings
}
```

### URL Query Sync

```typescript
PARAM_SCHEMA = {
  fl: intParam(85, 8, 800),
  f: numParam(1.4, 1, 64),
  d: numParam(3, 0.3, 100),
  s: sensorParam('ff'),
  targets: strParam('apsc,m43', [...]),  // comma-separated sensor IDs
}
```

---

## Shared Concerns

### Math Module Expansion (`src/lib/math/dof.ts`)

Add to existing module:
- `calcBackgroundBlur(input: BlurInput): number` — blur in mm for a given depth
- `calcBlurAtDistance(focalLength, aperture, subjectDist, targetDist, sensorWidth): number` — blur in viewport pixels
- `calcAiryDisk(aperture): number` — diffraction limit
- `calcOptimalAperture(focalLength, subjectDist, targetDist): number` — sweet spot
- `calcIsolationScore(backgroundBlur, coc): number` — 0–100 score
- `calcEquivalentSettings(source, targetCrop): EquivalentResult`
- `calcStackingSequence(settings, nearLimit, farLimit, overlapPct): StackingResult`

All pure functions, fully tested with TDD.

### Data Files

**New files:**
- `src/lib/data/dofSimulator.ts` — scene definitions, framing presets, bokeh shapes, default state
- `src/lib/data/focusStacking.ts` — overlap presets, export format
- `src/lib/data/equivalentSettings.ts` — warning thresholds, realistic aperture/FL ranges

**Modified files:**
- `src/lib/data/sensors.ts` — add 4 new sensor formats (645D, APS-H, APS-C Canon, 1")
- `src/lib/data/camera.ts` — add 1/3-stop aperture array (37 values)
- `src/lib/data/tools.ts` — register 3 new tools, rename existing dof-calculator entry

### i18n

Each tool gets:
- `src/lib/i18n/messages/en/tools/dof-simulator.json`
- `src/lib/i18n/messages/en/tools/focus-stacking-calculator.json`
- `src/lib/i18n/messages/en/tools/equivalent-settings-calculator.json`
- `src/lib/i18n/messages/en/education/dof-simulator.json`
- `src/lib/i18n/messages/en/education/focus-stacking-calculator.json`
- `src/lib/i18n/messages/en/education/equivalent-settings-calculator.json`

All registered in `src/lib/i18n/request.ts`.

### Education Content

Each tool gets a LearnPanel with:
- Beginner explanation (2–3 sentences)
- Deeper explanation (physics/optics sections)
- Key factors
- Pro tips
- 3–5 challenge questions

### Shared Components

**Reuse existing:**
- `ControlPanel` (container with title)
- `FocalLengthField` (logarithmic slider)
- `LearnPanel` + `ChallengeCard`
- `ModeToggle` (for figure/target, wipe/split toggles)
- `ToolActions` (reset, download, share)
- `ShareModal` (URL sharing)
- `InfoTooltip` (hover tooltips on labels)
- `ScenePicker` (thumbnail strip — adapt for DOF scenes)
- `DoFDiagram` (enhance existing for DOF Simulator)

**New shared components (if useful to 2+ tools):**
- `ApertureField` — slider with 1/3-stop snaps and sweet spot indicator (used by DOF Simulator, Focus Stacking, Equivalent Settings)
- `DistanceField` — logarithmic distance slider + editable value (used by DOF Simulator, Focus Stacking, Equivalent Settings)

### Mobile

All three tools follow existing mobile pattern:
- Sidebar hidden, controls move to bottom drawer
- Canvas/viewport takes full width
- LearnPanel collapses to button
- DOF diagram and blur profile stack below viewport

### Testing

**Math (TDD):** Unit tests for all new `dof.ts` functions — blur calculations, stacking algorithm, equivalence math, isolation score. Test against known values from dofsimulator.net formulas.

**Data:** Unit tests for new data files — scene definitions, aperture arrays, framing presets.

**E2E (Playwright):** Smoke tests for all three tool pages. Interaction tests for DOF Simulator (change settings, verify canvas updates, A/B toggle).

---

## File Structure

```
src/app/
  dof-simulator/
    page.tsx
    _components/
      DofSimulator.tsx
      DofSimulator.module.css
      DofSettingsPanel.tsx
      DofResultsPanel.tsx
      DofViewport.tsx              (WebGL canvas + shader management)
      DofToolbar.tsx
      DofDofDiagram.tsx            (enhanced DOF diagram)
      BlurProfileGraph.tsx
      DepthRuler.tsx               (hover tooltip)
      SubjectFigure.tsx            (depth-layered figure renderer)
      FocusTarget.tsx              (focus reticle renderer)
      ABComparison.tsx             (wipe + split logic)
      FramingPanel.tsx
      BokehPanel.tsx
      shaders/
        dofBlur.vert
        dofBlur.frag
        bokehKernels.glsl
      querySync.ts
  focus-stacking-calculator/
    page.tsx
    _components/
      FocusStacking.tsx
      FocusStacking.module.css
      StackingSettingsPanel.tsx
      StackingResultsPanel.tsx
      StackingDiagram.tsx          (SVG sequence visualization)
      querySync.ts
  equivalent-settings-calculator/
    page.tsx
    _components/
      EquivalentSettings.tsx
      EquivalentSettings.module.css
      SourceSettingsPanel.tsx
      TargetSensorPanel.tsx
      EquivalenceCard.tsx          (per-target result card)
      MiniDofDiagram.tsx           (small comparison diagram)
      querySync.ts

src/lib/
  math/
    dof.ts                         (expanded with new functions)
    dof.test.ts                    (expanded tests)
  data/
    dofSimulator.ts
    focusStacking.ts
    equivalentSettings.ts
    sensors.ts                     (4 new sensors added)
    camera.ts                      (1/3-stop apertures added)
    tools.ts                       (3 tools registered)
    education/
      contentDofSimulator.ts
      contentFocusStacking.ts
      contentEquivalentSettings.ts

src/components/shared/
  ApertureField.tsx                (new — 1/3-stop slider)
  ApertureField.module.css
  DistanceField.tsx                (new — logarithmic distance)
  DistanceField.module.css

src/lib/i18n/messages/en/
  tools/
    dof-simulator.json
    focus-stacking-calculator.json
    equivalent-settings-calculator.json
  education/
    dof-simulator.json
    focus-stacking-calculator.json
    equivalent-settings-calculator.json

public/scenes/
  park-portrait.jpg + park-portrait-depth.png
  street.jpg + street-depth.png
  landscape.jpg + landscape-depth.png
  cafe.jpg + cafe-depth.png
  architecture.jpg + architecture-depth.png
  macro.jpg + macro-depth.png
  thumbnails/ (6 thumbnail JPEGs)
```

---

## What's NOT in Scope

- Camera model database (4,328 cameras — too much maintenance)
- Lens database (859 lenses)
- Lens converters / teleconverters / anamorphic
- Custom CoC from print size / viewing distance
- AI-generated depth maps from user uploads
- Offline desktop version
- Privacy Sandbox APIs
