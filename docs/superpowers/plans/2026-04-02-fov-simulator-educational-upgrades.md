# FOV Simulator Educational Upgrades Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add educational overlays, lens distortion simulation, perspective compression visualization, and crop comparison to the FOV Simulator.

**Architecture:** The FOV Simulator gains three view modes (FOV/Distortion/Compression) controlled by a toggle in the sidebar. FOV mode extends the existing Canvas 2D with frame info and framing guides. Distortion mode uses a WebGL2 fullscreen-quad shader. Compression mode renders a 3D pillars scene. A crop comparison strip sits below the canvas in all modes. New state fields (distance, viewMode, showGrid, showGuides) are persisted via URL params.

**Tech Stack:** React 19, TypeScript, Canvas 2D, WebGL2 + GLSL shaders, CSS Modules

---

## File Structure

### New files

```
components/tools/fov-simulator/
  FrameInfoPanel.tsx            — distance slider + frame width readout + toggle checkboxes
  FrameInfoPanel.module.css
  CropStrip.tsx                 — side-by-side crop thumbnails below canvas
  CropStrip.module.css
  ViewModeToggle.tsx            — FOV/Distortion/Compression segmented control
  ViewModeToggle.module.css
  DistortionCanvas.tsx          — WebGL2 distortion rendering with grid overlay
  CompressionScene.tsx          — WebGL2 3D pillars + Canvas 2D diagram
  CompressionScene.module.css
  shaders/
    distortion.vert.ts          — passthrough vertex shader (exported string)
    distortion.frag.ts          — barrel/pincushion fragment shader (exported string)
    compression.vert.ts         — 3D projection vertex shader
    compression.frag.ts         — basic lit fragment shader
lib/math/
  distortion.ts                 — distortion coefficient from focal length
  distortion.test.ts
  compression.ts                — camera distance for constant subject size
  compression.test.ts
```

### Modified files

```
components/tools/fov-simulator/
  types.ts                      — add ViewMode, distance, showGrid, showGuides
  FovSimulator.tsx              — add new state, reducer actions, wire new components
  FovSimulator.module.css       — cropStrip area, compression diagram area
  Canvas.tsx                    — add framing guides + equiv focal length in labels
  Sidebar.tsx                   — no changes needed (just a wrapper)
  querySync.ts                  — persist dist, mode, grid, guides params
```

---

## Task 1: Extend State & URL Sync

**Files:**
- Modify: `components/tools/fov-simulator/types.ts`
- Modify: `components/tools/fov-simulator/querySync.ts`

- [ ] **Step 1: Update types.ts with new state fields**

```typescript
// In types.ts, add:
export type ViewMode = 'fov' | 'distortion' | 'compression'

// Update FovSimulatorState interface:
export interface FovSimulatorState {
  lenses: LensConfig[]
  imageIndex: number
  orientation: Orientation
  activeLens: number
  distance: number      // feet, 3-100
  viewMode: ViewMode
  showGrid: boolean
  showGuides: boolean
}

// Update DEFAULT_FOV_STATE:
export const DEFAULT_FOV_STATE: FovSimulatorState = {
  lenses: [
    { focalLength: 20, sensorId: 'ff' },
    { focalLength: 35, sensorId: 'ff' },
  ],
  imageIndex: 0,
  orientation: 'landscape',
  activeLens: 0,
  distance: 10,
  viewMode: 'fov',
  showGrid: false,
  showGuides: false,
}
```

- [ ] **Step 2: Update querySync.ts to persist new params**

Add parsing in `parseQueryParams()`:

```typescript
// After the existing img parsing:
const dist = Number(params.get('dist'))
if (!isNaN(dist) && dist >= 3 && dist <= 100) state.distance = dist

const mode = params.get('mode')
if (mode === 'distortion' || mode === 'compression') state.viewMode = mode as ViewMode

if (params.get('grid') === '1') state.showGrid = true
if (params.get('guides') === '1') state.showGuides = true
```

Add serialization in `stateToQueryString()`:

```typescript
// After existing params:
if (state.distance !== 10) params.set('dist', String(state.distance))
if (state.viewMode !== 'fov') params.set('mode', state.viewMode)
if (state.showGrid) params.set('grid', '1')
if (state.showGuides) params.set('guides', '1')
```

Import `ViewMode` from `./types` in querySync.ts.

- [ ] **Step 3: Add reducer actions in FovSimulator.tsx**

Add to the `Action` union type:

```typescript
| { type: 'SET_DISTANCE'; payload: number }
| { type: 'SET_VIEW_MODE'; payload: ViewMode }
| { type: 'SET_SHOW_GRID'; payload: boolean }
| { type: 'SET_SHOW_GUIDES'; payload: boolean }
```

Add cases to reducer:

```typescript
case 'SET_DISTANCE':
  return { ...state, distance: action.payload }
case 'SET_VIEW_MODE':
  return { ...state, viewMode: action.payload }
case 'SET_SHOW_GRID':
  return { ...state, showGrid: action.payload }
case 'SET_SHOW_GUIDES':
  return { ...state, showGuides: action.payload }
```

Import `ViewMode` from `./types`.

- [ ] **Step 4: Verify build passes**

Run: `npm run build`
Expected: Successful build (new state fields have defaults, no consumers yet)

- [ ] **Step 5: Commit**

```bash
git add components/tools/fov-simulator/types.ts components/tools/fov-simulator/querySync.ts components/tools/fov-simulator/FovSimulator.tsx
git commit -m "feat(fov): add viewMode, distance, grid, guides state and URL sync"
```

---

## Task 2: Frame Info Panel

**Files:**
- Create: `components/tools/fov-simulator/FrameInfoPanel.tsx`
- Create: `components/tools/fov-simulator/FrameInfoPanel.module.css`

- [ ] **Step 1: Create FrameInfoPanel.module.css**

```css
.panel {
  background: var(--bg-surface);
  border-radius: 10px;
  padding: 14px;
}

.title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.readout {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}

.readoutRow {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.readoutLabel {
  font-weight: 600;
}

.readoutValue {
  color: var(--text-secondary);
}

.sliderSection {
  margin-bottom: 8px;
}

.sliderLabel {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.slider {
  width: 100%;
  height: 6px;
  cursor: pointer;
  accent-color: var(--accent);
}

.presets {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.preset {
  padding: 3px 7px;
  background: var(--bg-primary);
  border: none;
  border-radius: 4px;
  font-size: 11px;
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.15s;
}

.preset:hover {
  background: var(--border);
}

.presetActive {
  background: var(--accent);
  color: #fff;
}

.toggleRow {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-secondary);
  cursor: pointer;
}

.toggleRow input {
  accent-color: var(--accent);
}
```

- [ ] **Step 2: Create FrameInfoPanel.tsx**

```typescript
'use client'

import type { LensConfig } from '@/lib/types'
import { calcFOV, calcFrameWidth } from '@/lib/math/fov'
import { getSensor } from '@/lib/data/sensors'
import { LENS_COLORS, LENS_LABELS } from './types'
import styles from './FrameInfoPanel.module.css'

const LOG_MIN = Math.log(3)
const LOG_MAX = Math.log(100)
const SLIDER_STEPS = 500

function distToSlider(dist: number): number {
  return Math.round(((Math.log(dist) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * SLIDER_STEPS)
}

function sliderToDist(pos: number): number {
  return Math.round(Math.exp(LOG_MIN + (pos / SLIDER_STEPS) * (LOG_MAX - LOG_MIN)))
}

const DISTANCE_PRESETS = [5, 10, 25, 50]

interface FrameInfoPanelProps {
  lenses: LensConfig[]
  distance: number
  showGuides: boolean
  onDistanceChange: (d: number) => void
  onShowGuidesChange: (v: boolean) => void
}

export function FrameInfoPanel({ lenses, distance, showGuides, onDistanceChange, onShowGuidesChange }: FrameInfoPanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.title}>Frame Info</div>

      <div className={styles.readout}>
        {lenses.map((lens, i) => {
          const sensor = getSensor(lens.sensorId)
          const fov = calcFOV(lens.focalLength, sensor.cropFactor)
          const width = calcFrameWidth(fov.horizontal, distance)
          return (
            <div key={i} className={styles.readoutRow}>
              <span className={styles.readoutLabel} style={{ color: LENS_COLORS[i] }}>
                {LENS_LABELS[i]} {lens.focalLength}mm
              </span>
              <span className={styles.readoutValue}>{width.toFixed(1)}ft wide</span>
            </div>
          )
        })}
      </div>

      <div className={styles.sliderSection}>
        <div className={styles.sliderLabel}>
          <span>Distance</span>
          <span>{distance}ft</span>
        </div>
        <input
          type="range"
          className={styles.slider}
          min={0}
          max={SLIDER_STEPS}
          value={distToSlider(distance)}
          onChange={(e) => onDistanceChange(sliderToDist(Number(e.target.value)))}
          aria-label="Subject distance in feet"
          aria-valuetext={`${distance} feet`}
        />
      </div>

      <div className={styles.presets}>
        {DISTANCE_PRESETS.map((d) => (
          <button
            key={d}
            className={`${styles.preset} ${distance === d ? styles.presetActive : ''}`}
            onClick={() => onDistanceChange(d)}
          >
            {d}ft
          </button>
        ))}
      </div>

      <label className={styles.toggleRow}>
        <input
          type="checkbox"
          checked={showGuides}
          onChange={(e) => onShowGuidesChange(e.target.checked)}
        />
        Show framing guides
      </label>
    </div>
  )
}
```

- [ ] **Step 3: Wire FrameInfoPanel into FovSimulator.tsx**

Import the component and add it in the sidebar (after the add lens button, before ActionBar) and in the mobile controls:

```typescript
import { FrameInfoPanel } from './FrameInfoPanel'

// In the sidebar, between add lens button and ActionBar:
<FrameInfoPanel
  lenses={state.lenses}
  distance={state.distance}
  showGuides={state.showGuides}
  onDistanceChange={(d) => dispatch({ type: 'SET_DISTANCE', payload: d })}
  onShowGuidesChange={(v) => dispatch({ type: 'SET_SHOW_GUIDES', payload: v })}
/>

// Same in the mobile controls section (after add lens button, before ActionBar)
```

- [ ] **Step 4: Verify it renders**

Run: `npm run dev`
Expected: Frame Info panel appears in sidebar with distance slider, presets, and frame width readout for each lens.

- [ ] **Step 5: Commit**

```bash
git add components/tools/fov-simulator/FrameInfoPanel.tsx components/tools/fov-simulator/FrameInfoPanel.module.css components/tools/fov-simulator/FovSimulator.tsx
git commit -m "feat(fov): add Frame Info panel with distance slider and frame width readout"
```

---

## Task 3: Framing Guides on Canvas

**Files:**
- Modify: `components/tools/fov-simulator/Canvas.tsx`

- [ ] **Step 1: Add framing guides props and drawing logic**

Add new props to `CanvasProps`:

```typescript
interface CanvasProps {
  lenses: LensConfig[]
  imageIndex: number
  orientation: Orientation
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  distance: number        // new
  showGuides: boolean     // new
  activeLens: number      // new
}
```

Add framing guide constants and drawing function inside Canvas.tsx:

```typescript
const FRAMING_GUIDES = [
  { label: 'full body', height: 5.5 },
  { label: 'waist up', height: 3.0 },
  { label: 'head & shoulders', height: 1.5 },
  { label: 'headshot', height: 0.8 },
]

function drawFramingGuides(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  verticalFrameHeight: number,
  dpr: number,
) {
  const fontSize = 10 * dpr
  ctx.font = `500 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`

  for (const guide of FRAMING_GUIDES) {
    // What fraction of the vertical frame does this subject occupy?
    const fraction = guide.height / verticalFrameHeight
    if (fraction > 1) continue // doesn't fit in frame
    if (fraction < 0.05) continue // too small to be useful

    // Position: centered vertically in the rect, sized by fraction
    const guideH = rect.h * fraction
    const guideY = rect.y + (rect.h - guideH) / 2

    // Draw tick line on the left edge of the rect
    const tickX = rect.x + 6 * dpr
    const tickW = 12 * dpr

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.lineWidth = 1 * dpr
    ctx.setLineDash([3 * dpr, 3 * dpr])

    // Top tick
    ctx.beginPath()
    ctx.moveTo(tickX, guideY)
    ctx.lineTo(tickX + tickW, guideY)
    ctx.stroke()

    // Bottom tick
    ctx.beginPath()
    ctx.moveTo(tickX, guideY + guideH)
    ctx.lineTo(tickX + tickW, guideY + guideH)
    ctx.stroke()

    // Vertical connector
    ctx.beginPath()
    ctx.moveTo(tickX + tickW / 2, guideY)
    ctx.lineTo(tickX + tickW / 2, guideY + guideH)
    ctx.stroke()

    ctx.setLineDash([])

    // Label
    const labelY = guideY + guideH / 2 + fontSize / 3
    const text = guide.label
    const metrics = ctx.measureText(text)
    const bgX = tickX + tickW + 2 * dpr
    const bgY = labelY - fontSize + 1 * dpr
    const bgW = metrics.width + 6 * dpr
    const bgH = fontSize + 4 * dpr

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.beginPath()
    ctx.roundRect(bgX, bgY, bgW, bgH, 2 * dpr)
    ctx.fill()

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.fillText(text, bgX + 3 * dpr, labelY)
  }
}
```

- [ ] **Step 2: Call drawFramingGuides in the draw function**

In the `draw` callback, after drawing FOV overlay borders and before drawing lens labels, add:

```typescript
// Draw framing guides on the active lens rect
if (showGuides && rects[activeLens]) {
  const activeRect = rects[activeLens]
  const activeFov = fovs[activeLens]
  const verticalFOV = orientation === 'portrait' ? activeFov.horizontal : activeFov.vertical
  const verticalFrameHeight = calcFrameWidth(verticalFOV, distance)
  drawFramingGuides(ctx, activeRect, verticalFrameHeight, dpr)
}
```

Import `calcFrameWidth` at the top of Canvas.tsx:

```typescript
import { calcFOV, calcCropRatio, calcFrameWidth } from '@/lib/math/fov'
```

- [ ] **Step 3: Update Canvas usage in FovSimulator.tsx**

Pass the new props to Canvas:

```typescript
<Canvas
  lenses={state.lenses}
  imageIndex={state.imageIndex}
  orientation={state.orientation}
  canvasRef={canvasRef}
  distance={state.distance}
  showGuides={state.showGuides}
  activeLens={state.activeLens}
/>
```

- [ ] **Step 4: Update lens labels to show equiv focal length**

In the `draw` function of Canvas.tsx, update the label text construction:

```typescript
// Replace:
const text = `${r.label} — ${r.focalLength}mm`

// With:
const sensor = getSensor(lenses[r.index].sensorId)
const equivText = sensor.cropFactor !== 1
  ? ` (${calcEquivFocalLength(r.focalLength, sensor.cropFactor)}mm eq)`
  : ''
const text = `${r.label} — ${r.focalLength}mm${equivText}`
```

Import `calcEquivFocalLength` from `@/lib/math/fov`.

- [ ] **Step 5: Verify framing guides render**

Run: `npm run dev`
Expected: Check "Show framing guides" in the Frame Info panel. Dashed horizontal tick marks appear on the active lens rect showing full body / waist up / head & shoulders / headshot markers. Changing distance slider adjusts which markers are visible.

- [ ] **Step 6: Commit**

```bash
git add components/tools/fov-simulator/Canvas.tsx components/tools/fov-simulator/FovSimulator.tsx
git commit -m "feat(fov): add framing guides and equiv focal length labels on canvas"
```

---

## Task 4: View Mode Toggle

**Files:**
- Create: `components/tools/fov-simulator/ViewModeToggle.tsx`
- Create: `components/tools/fov-simulator/ViewModeToggle.module.css`

- [ ] **Step 1: Create ViewModeToggle.module.css**

```css
.toggle {
  display: flex;
  gap: 2px;
  background: var(--bg-primary);
  border-radius: 6px;
  padding: 2px;
}

.option {
  flex: 1;
  padding: 5px 4px;
  background: none;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  color: var(--text-secondary);
  cursor: pointer;
  text-align: center;
  transition: background 0.15s, color 0.15s;
}

.option:hover {
  color: var(--text-primary);
}

.optionActive {
  background: var(--accent);
  color: #fff;
}
```

- [ ] **Step 2: Create ViewModeToggle.tsx**

```typescript
'use client'

import type { ViewMode } from './types'
import styles from './ViewModeToggle.module.css'

const OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'fov', label: 'FOV' },
  { value: 'distortion', label: 'Distortion' },
  { value: 'compression', label: 'Compression' },
]

interface ViewModeToggleProps {
  value: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div className={styles.toggle} role="radiogroup" aria-label="View mode">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          className={`${styles.option} ${value === opt.value ? styles.optionActive : ''}`}
          onClick={() => onChange(opt.value)}
          role="radio"
          aria-checked={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Wire into FovSimulator.tsx sidebar**

Import and add the toggle in the sidebar (after the lens panels, before FrameInfoPanel):

```typescript
import { ViewModeToggle } from './ViewModeToggle'

// In sidebar, after add lens button:
<ViewModeToggle
  value={state.viewMode}
  onChange={(m) => dispatch({ type: 'SET_VIEW_MODE', payload: m })}
/>

// Same in mobile controls
```

- [ ] **Step 4: Conditionally render canvas based on viewMode**

In FovSimulator.tsx, the canvas section should conditionally render based on `state.viewMode`:

```typescript
<section className={styles.canvasMain}>
  {state.viewMode === 'fov' && (
    <Canvas
      lenses={state.lenses}
      imageIndex={state.imageIndex}
      orientation={state.orientation}
      canvasRef={canvasRef}
      distance={state.distance}
      showGuides={state.showGuides}
      activeLens={state.activeLens}
    />
  )}
  {state.viewMode === 'distortion' && (
    <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
      Distortion view coming soon
    </div>
  )}
  {state.viewMode === 'compression' && (
    <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
      Compression view coming soon
    </div>
  )}
</section>
```

- [ ] **Step 5: Verify toggle works**

Run: `npm run dev`
Expected: Three-segment toggle appears. FOV shows canvas, Distortion/Compression show placeholder text. URL updates with `mode` param.

- [ ] **Step 6: Commit**

```bash
git add components/tools/fov-simulator/ViewModeToggle.tsx components/tools/fov-simulator/ViewModeToggle.module.css components/tools/fov-simulator/FovSimulator.tsx
git commit -m "feat(fov): add view mode toggle (FOV/Distortion/Compression)"
```

---

## Task 5: Crop Comparison Strip

**Files:**
- Create: `components/tools/fov-simulator/CropStrip.tsx`
- Create: `components/tools/fov-simulator/CropStrip.module.css`
- Modify: `components/tools/fov-simulator/FovSimulator.module.css`

- [ ] **Step 1: Create CropStrip.module.css**

```css
.strip {
  border-top: 1px solid var(--border);
  padding: 8px 16px;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

.label {
  font-size: 10px;
  color: var(--text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
}

.thumbs {
  display: flex;
  gap: 8px;
  flex: 1;
  overflow-x: auto;
}

.thumb {
  position: relative;
  flex: 1;
  min-width: 80px;
  max-width: 200px;
  height: 48px;
  border-radius: 4px;
  border: 2px solid;
  overflow: hidden;
  cursor: pointer;
  padding: 0;
  background: var(--bg-primary);
}

.thumb canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.thumbLabel {
  position: absolute;
  bottom: 2px;
  left: 4px;
  font-size: 9px;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  pointer-events: none;
}

.toggle {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
  padding: 2px 4px;
  flex-shrink: 0;
}

@media (max-width: 1023px) {
  .strip {
    display: none;
  }
}
```

- [ ] **Step 2: Create CropStrip.tsx**

```typescript
'use client'

import { useRef, useEffect } from 'react'
import type { LensConfig } from '@/lib/types'
import type { Orientation } from './types'
import { LENS_COLORS, LENS_LABELS } from './types'
import { calcFOV, calcCropRatio } from '@/lib/math/fov'
import { getSensor } from '@/lib/data/sensors'
import { SCENES } from '@/lib/data/scenes'
import styles from './CropStrip.module.css'

const REF_FOV = calcFOV(14, 1.0)

interface CropStripProps {
  lenses: LensConfig[]
  imageIndex: number
  orientation: Orientation
  activeLens: number
  onSelectLens: (index: number) => void
}

export function CropStrip({ lenses, imageIndex, orientation, activeLens, onSelectLens }: CropStripProps) {
  return (
    <div className={styles.strip}>
      <span className={styles.label}>Crop view:</span>
      <div className={styles.thumbs}>
        {lenses.map((lens, i) => (
          <CropThumb
            key={i}
            lens={lens}
            index={i}
            imageIndex={imageIndex}
            orientation={orientation}
            isActive={activeLens === i}
            onSelect={() => onSelectLens(i)}
          />
        ))}
      </div>
    </div>
  )
}

interface CropThumbProps {
  lens: LensConfig
  index: number
  imageIndex: number
  orientation: Orientation
  isActive: boolean
  onSelect: () => void
}

function CropThumb({ lens, index, imageIndex, orientation, isActive, onSelect }: CropThumbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      imageRef.current = img
      drawCrop()
    }
    img.src = SCENES[imageIndex].src

    function drawCrop() {
      const canvas = canvasRef.current
      const image = imageRef.current
      if (!canvas || !image) return

      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const sensor = getSensor(lens.sensorId)
      const fov = calcFOV(lens.focalLength, sensor.cropFactor)
      const isPortrait = orientation === 'portrait'

      const ratioW = calcCropRatio(
        isPortrait ? fov.vertical : fov.horizontal,
        isPortrait ? REF_FOV.vertical : REF_FOV.horizontal,
      )
      const ratioH = calcCropRatio(
        isPortrait ? fov.horizontal : fov.vertical,
        isPortrait ? REF_FOV.horizontal : REF_FOV.vertical,
      )

      // Crop from the center of the image
      const imgAspect = image.width / image.height
      const canvasAspect = canvas.width / canvas.height

      // First compute the "cover" region (what the full canvas would show)
      let coverW: number, coverH: number, coverX: number, coverY: number
      if (imgAspect > canvasAspect) {
        coverH = image.height
        coverW = coverH * canvasAspect
        coverX = (image.width - coverW) / 2
        coverY = 0
      } else {
        coverW = image.width
        coverH = coverW / canvasAspect
        coverX = 0
        coverY = (image.height - coverH) / 2
      }

      // Now crop to the lens FOV ratio (centered)
      const cropW = coverW * ratioW
      const cropH = coverH * ratioH
      const cropX = coverX + (coverW - cropW) / 2
      const cropY = coverY + (coverH - cropH) / 2

      ctx.drawImage(image, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height)
    }
  }, [lens, imageIndex, orientation])

  return (
    <button
      className={styles.thumb}
      style={{ borderColor: LENS_COLORS[index], opacity: isActive ? 1 : 0.7 }}
      onClick={onSelect}
      title={`${LENS_LABELS[index]} — ${lens.focalLength}mm`}
    >
      <canvas ref={canvasRef} />
      <span className={styles.thumbLabel}>{LENS_LABELS[index]} — {lens.focalLength}mm</span>
    </button>
  )
}
```

- [ ] **Step 3: Wire CropStrip into FovSimulator.tsx**

Add below the `<section className={styles.canvasMain}>` section, inside the `<main className={styles.canvasArea}>`:

```typescript
import { CropStrip } from './CropStrip'

// After </section> (canvasMain), before </main>:
{state.viewMode === 'fov' && (
  <CropStrip
    lenses={state.lenses}
    imageIndex={state.imageIndex}
    orientation={state.orientation}
    activeLens={state.activeLens}
    onSelectLens={(i) => dispatch({ type: 'SET_ACTIVE_LENS', payload: i })}
  />
)}
```

- [ ] **Step 4: Verify crop strip renders**

Run: `npm run dev`
Expected: Crop thumbnails appear below the canvas, one per lens. Each shows the cropped view for that lens. Clicking selects the lens.

- [ ] **Step 5: Commit**

```bash
git add components/tools/fov-simulator/CropStrip.tsx components/tools/fov-simulator/CropStrip.module.css components/tools/fov-simulator/FovSimulator.tsx
git commit -m "feat(fov): add crop comparison strip below canvas"
```

---

## Task 6: Distortion Math Module

**Files:**
- Create: `lib/math/distortion.ts`
- Create: `lib/math/distortion.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// lib/math/distortion.test.ts
import { describe, it, expect } from 'vitest'
import { calcDistortionK1 } from './distortion'

describe('calcDistortionK1', () => {
  it('returns negative k1 (barrel) for wide angles', () => {
    const k1 = calcDistortionK1(14)
    expect(k1).toBeLessThan(0)
  })

  it('returns near-zero k1 for normal focal lengths', () => {
    const k1 = calcDistortionK1(50)
    expect(Math.abs(k1)).toBeLessThan(0.05)
  })

  it('returns positive k1 (pincushion) for telephoto', () => {
    const k1 = calcDistortionK1(135)
    expect(k1).toBeGreaterThan(0)
  })

  it('clamps barrel distortion to -0.5', () => {
    const k1 = calcDistortionK1(8)
    expect(k1).toBeGreaterThanOrEqual(-0.5)
  })

  it('clamps pincushion distortion to 0.3', () => {
    const k1 = calcDistortionK1(800)
    expect(k1).toBeLessThanOrEqual(0.3)
  })

  it('returns 0 for exactly 50mm', () => {
    const k1 = calcDistortionK1(50)
    expect(k1).toBe(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/math/distortion.test.ts`
Expected: FAIL — `calcDistortionK1` not found

- [ ] **Step 3: Implement distortion.ts**

```typescript
// lib/math/distortion.ts

/**
 * Calculate a simplified radial distortion coefficient (k1) from focal length.
 *
 * This is an educational approximation, not a physically accurate lens model.
 * Negative k1 = barrel distortion (wide angles), positive = pincushion (telephoto).
 * 50mm is the neutral point (zero distortion).
 *
 * @param focalLength - Lens focal length in mm
 * @returns k1 coefficient, clamped to [-0.5, 0.3]
 */
export function calcDistortionK1(focalLength: number): number {
  const raw = -0.4 * (1 - focalLength / 50)
  return Math.max(-0.5, Math.min(0.3, raw))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/math/distortion.test.ts`
Expected: All 6 tests pass

- [ ] **Step 5: Commit**

```bash
git add lib/math/distortion.ts lib/math/distortion.test.ts
git commit -m "feat(math): add lens distortion coefficient calculation"
```

---

## Task 7: Distortion Shaders

**Files:**
- Create: `components/tools/fov-simulator/shaders/distortion.vert.ts`
- Create: `components/tools/fov-simulator/shaders/distortion.frag.ts`

- [ ] **Step 1: Create vertex shader**

```typescript
// components/tools/fov-simulator/shaders/distortion.vert.ts
export const distortionVertexShader = `#version 300 es
precision highp float;

in vec2 a_position;
out vec2 v_texCoord;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_position * 0.5 + 0.5;
}
`
```

- [ ] **Step 2: Create fragment shader**

```typescript
// components/tools/fov-simulator/shaders/distortion.frag.ts
export const distortionFragmentShader = `#version 300 es
precision highp float;

uniform sampler2D u_image;
uniform float u_k1;
uniform bool u_showGrid;
uniform vec2 u_resolution;

in vec2 v_texCoord;
out vec4 fragColor;

vec2 distort(vec2 uv, float k1) {
  vec2 centered = uv - 0.5;
  float r2 = dot(centered, centered);
  vec2 distorted = centered * (1.0 + k1 * r2);
  return distorted + 0.5;
}

float grid(vec2 uv, float lineWidth) {
  vec2 gridUV = fract(uv * 10.0);
  vec2 edge = smoothstep(vec2(lineWidth), vec2(lineWidth * 2.0), gridUV)
            * smoothstep(vec2(lineWidth), vec2(lineWidth * 2.0), 1.0 - gridUV);
  return 1.0 - min(edge.x, edge.y);
}

void main() {
  vec2 distortedUV = distort(v_texCoord, u_k1);

  // Clamp to valid range — out-of-bounds shows black
  if (distortedUV.x < 0.0 || distortedUV.x > 1.0 || distortedUV.y < 0.0 || distortedUV.y > 1.0) {
    fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  // Flip Y for correct image orientation
  vec2 sampleUV = vec2(distortedUV.x, 1.0 - distortedUV.y);
  fragColor = texture(u_image, sampleUV);

  if (u_showGrid) {
    float lineWidth = 1.5 / max(u_resolution.x, u_resolution.y) * 10.0;
    float g = grid(v_texCoord, lineWidth);
    fragColor = mix(fragColor, vec4(1.0, 1.0, 1.0, 1.0), g * 0.5);
  }
}
`
```

- [ ] **Step 3: Commit**

```bash
git add components/tools/fov-simulator/shaders/
git commit -m "feat(fov): add distortion vertex and fragment shaders"
```

---

## Task 8: Distortion Canvas Component

**Files:**
- Create: `components/tools/fov-simulator/DistortionCanvas.tsx`
- Modify: `components/tools/fov-simulator/FovSimulator.tsx`

- [ ] **Step 1: Create DistortionCanvas.tsx**

```typescript
'use client'

import { useRef, useEffect, useCallback } from 'react'
import type { LensConfig } from '@/lib/types'
import type { Orientation } from './types'
import { getSensor } from '@/lib/data/sensors'
import { calcDistortionK1 } from '@/lib/math/distortion'
import { SCENES } from '@/lib/data/scenes'
import { distortionVertexShader } from './shaders/distortion.vert'
import { distortionFragmentShader } from './shaders/distortion.frag'
import styles from './FovSimulator.module.css'

interface DistortionCanvasProps {
  lens: LensConfig
  imageIndex: number
  orientation: Orientation
  showGrid: boolean
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}

interface GLResources {
  gl: WebGL2RenderingContext
  program: WebGLProgram
  vao: WebGLVertexArrayObject
  texture: WebGLTexture
  locs: {
    u_k1: WebGLUniformLocation
    u_showGrid: WebGLUniformLocation
    u_resolution: WebGLUniformLocation
    u_image: WebGLUniformLocation
  }
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`Shader compile error: ${info}`)
  }
  return shader
}

function createProgram(gl: WebGL2RenderingContext, vertSrc: string, fragSrc: string): WebGLProgram {
  const vert = compileShader(gl, gl.VERTEX_SHADER, vertSrc)
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc)
  const program = gl.createProgram()!
  gl.attachShader(program, vert)
  gl.attachShader(program, frag)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Program link error: ${gl.getProgramInfoLog(program)}`)
  }
  gl.deleteShader(vert)
  gl.deleteShader(frag)
  return program
}

export function DistortionCanvas({ lens, imageIndex, orientation, showGrid, canvasRef }: DistortionCanvasProps) {
  const glRef = useRef<GLResources | null>(null)
  const imageLoadedRef = useRef(false)

  // Initialize WebGL
  const initGL = useCallback((canvas: HTMLCanvasElement): GLResources | null => {
    const gl = canvas.getContext('webgl2', { premultipliedAlpha: false })
    if (!gl) return null

    const program = createProgram(gl, distortionVertexShader, distortionFragmentShader)

    // Fullscreen quad
    const vao = gl.createVertexArray()!
    gl.bindVertexArray(vao)
    const buf = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const posLoc = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)
    gl.bindVertexArray(null)

    const texture = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    return {
      gl, program, vao, texture,
      locs: {
        u_k1: gl.getUniformLocation(program, 'u_k1')!,
        u_showGrid: gl.getUniformLocation(program, 'u_showGrid')!,
        u_resolution: gl.getUniformLocation(program, 'u_resolution')!,
        u_image: gl.getUniformLocation(program, 'u_image')!,
      },
    }
  }, [])

  // Load image as texture
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (!glRef.current) {
      glRef.current = initGL(canvas)
    }
    const res = glRef.current
    if (!res) return

    imageLoadedRef.current = false
    const img = new Image()
    img.onload = () => {
      const { gl, texture } = res
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      imageLoadedRef.current = true
    }
    img.src = SCENES[imageIndex].src
  }, [canvasRef, imageIndex, initGL])

  // Render
  useEffect(() => {
    const canvas = canvasRef.current
    const res = glRef.current
    if (!canvas || !res || !imageLoadedRef.current) return

    const sensor = getSensor(lens.sensorId)
    const k1 = calcDistortionK1(lens.focalLength / sensor.cropFactor)

    const { gl, program, vao, locs } = res

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.useProgram(program)
    gl.uniform1f(locs.u_k1, k1)
    gl.uniform1i(locs.u_showGrid, showGrid ? 1 : 0)
    gl.uniform2f(locs.u_resolution, canvas.width, canvas.height)
    gl.uniform1i(locs.u_image, 0)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, res.texture)

    gl.bindVertexArray(vao)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    gl.bindVertexArray(null)
  }, [canvasRef, lens, showGrid])

  // Resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const observer = new ResizeObserver(() => {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const aspect = orientation === 'landscape' ? 3 / 2 : 2 / 3

      let w = rect.width
      let h = w / aspect
      if (h > rect.height) { h = rect.height; w = h * aspect }

      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      canvas.width = w * dpr
      canvas.height = h * dpr
    })

    observer.observe(canvas.parentElement!)
    return () => observer.disconnect()
  }, [canvasRef, orientation])

  // Cleanup
  useEffect(() => {
    return () => {
      const res = glRef.current
      if (res) {
        res.gl.deleteProgram(res.program)
        res.gl.deleteTexture(res.texture)
        glRef.current = null
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={styles.fovCanvas}
      aria-label="Lens distortion preview"
      role="img"
    />
  )
}
```

- [ ] **Step 2: Add grid toggle to sidebar when in distortion mode**

In FovSimulator.tsx, add a grid checkbox in the FrameInfoPanel area or as a standalone control when in distortion mode. Add to the sidebar after ViewModeToggle:

```typescript
{state.viewMode === 'distortion' && (
  <div className={styles.lensPanel} style={{ borderLeftColor: 'var(--text-secondary)', padding: '10px 14px' }}>
    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={state.showGrid}
        onChange={(e) => dispatch({ type: 'SET_SHOW_GRID', payload: e.target.checked })}
        style={{ accentColor: 'var(--accent)' }}
      />
      Show distortion grid
    </label>
  </div>
)}
```

- [ ] **Step 3: Replace distortion placeholder with DistortionCanvas**

In FovSimulator.tsx, replace the distortion placeholder. Need a separate canvasRef for distortion since the 2D and WebGL contexts can't share:

```typescript
const distortionCanvasRef = useRef<HTMLCanvasElement | null>(null)

// Import:
import { DistortionCanvas } from './DistortionCanvas'

// In the canvasMain section, replace the distortion placeholder:
{state.viewMode === 'distortion' && (
  <DistortionCanvas
    lens={state.lenses[state.activeLens]}
    imageIndex={state.imageIndex}
    orientation={state.orientation}
    showGrid={state.showGrid}
    canvasRef={distortionCanvasRef}
  />
)}
```

Update the `handleCopyImage` to use the correct canvas ref:

```typescript
const handleCopyImage = useCallback(async () => {
  const canvas = state.viewMode === 'distortion'
    ? distortionCanvasRef.current
    : canvasRef.current
  if (!canvas) return
  const success = await copyCanvasToClipboard(canvas)
  setToast(success ? 'Copied image!' : 'Failed to copy')
}, [state.viewMode])
```

- [ ] **Step 4: Verify distortion mode**

Run: `npm run dev`
Expected: Switch to Distortion mode. Scene image renders with barrel distortion for wide angles (14-35mm) and subtle pincushion for telephoto (85mm+). Toggling "Show distortion grid" overlays a warped grid.

- [ ] **Step 5: Commit**

```bash
git add components/tools/fov-simulator/DistortionCanvas.tsx components/tools/fov-simulator/FovSimulator.tsx
git commit -m "feat(fov): add WebGL lens distortion view with grid overlay"
```

---

## Task 9: Compression Math Module

**Files:**
- Create: `lib/math/compression.ts`
- Create: `lib/math/compression.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// lib/math/compression.test.ts
import { describe, it, expect } from 'vitest'
import { calcCameraDistance } from './compression'

describe('calcCameraDistance', () => {
  it('returns subject distance for the reference focal length', () => {
    // At 50mm, camera should be at the subject distance
    const d = calcCameraDistance(50, 50, 10)
    expect(d).toBeCloseTo(10, 1)
  })

  it('moves camera farther for longer focal lengths', () => {
    const d50 = calcCameraDistance(50, 50, 10)
    const d200 = calcCameraDistance(200, 50, 10)
    expect(d200).toBeGreaterThan(d50)
  })

  it('moves camera closer for shorter focal lengths', () => {
    const d50 = calcCameraDistance(50, 50, 10)
    const d24 = calcCameraDistance(24, 50, 10)
    expect(d24).toBeLessThan(d50)
  })

  it('keeps subject the same apparent size', () => {
    // The ratio of focalLength / distance should be constant
    const refFL = 50
    const subjectDist = 10
    const d50 = calcCameraDistance(50, refFL, subjectDist)
    const d100 = calcCameraDistance(100, refFL, subjectDist)
    expect(50 / d50).toBeCloseTo(100 / d100, 2)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/math/compression.test.ts`
Expected: FAIL — `calcCameraDistance` not found

- [ ] **Step 3: Implement compression.ts**

```typescript
// lib/math/compression.ts

/**
 * Calculate camera distance to keep a subject the same apparent size
 * when changing focal length.
 *
 * For perspective compression demonstration: as focal length increases,
 * the camera moves farther away. The subject stays the same size in frame,
 * but the background appears more compressed (flattened).
 *
 * The relationship is linear: distance / focalLength = constant
 * (for the same angular size of subject in frame).
 *
 * @param focalLength    - Current focal length in mm
 * @param refFocalLength - Reference focal length (where camera is at subjectDistance)
 * @param subjectDistance - Distance to subject at reference focal length
 * @returns Camera distance for the given focal length
 */
export function calcCameraDistance(
  focalLength: number,
  refFocalLength: number,
  subjectDistance: number,
): number {
  return subjectDistance * (focalLength / refFocalLength)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/math/compression.test.ts`
Expected: All 4 tests pass

- [ ] **Step 5: Commit**

```bash
git add lib/math/compression.ts lib/math/compression.test.ts
git commit -m "feat(math): add camera distance calculation for perspective compression"
```

---

## Task 10: Compression Shaders

**Files:**
- Create: `components/tools/fov-simulator/shaders/compression.vert.ts`
- Create: `components/tools/fov-simulator/shaders/compression.frag.ts`

- [ ] **Step 1: Create 3D vertex shader**

```typescript
// components/tools/fov-simulator/shaders/compression.vert.ts
export const compressionVertexShader = `#version 300 es
precision highp float;

in vec3 a_position;
in vec3 a_normal;
in vec3 a_color;

uniform mat4 u_projection;
uniform mat4 u_view;

out vec3 v_normal;
out vec3 v_color;
out vec3 v_worldPos;

void main() {
  v_worldPos = a_position;
  v_normal = a_normal;
  v_color = a_color;
  gl_Position = u_projection * u_view * vec4(a_position, 1.0);
}
`
```

- [ ] **Step 2: Create 3D fragment shader**

```typescript
// components/tools/fov-simulator/shaders/compression.frag.ts
export const compressionFragmentShader = `#version 300 es
precision highp float;

in vec3 v_normal;
in vec3 v_color;
in vec3 v_worldPos;

uniform vec3 u_lightDir;
uniform vec3 u_cameraPos;

out vec4 fragColor;

void main() {
  // Simple directional + ambient lighting
  vec3 normal = normalize(v_normal);
  float diffuse = max(dot(normal, normalize(u_lightDir)), 0.0);
  float ambient = 0.3;
  float lighting = ambient + diffuse * 0.7;

  // Subtle depth fog for depth cue
  float dist = length(v_worldPos - u_cameraPos);
  float fog = 1.0 - smoothstep(20.0, 60.0, dist);

  vec3 bgColor = vec3(0.08, 0.08, 0.15);
  vec3 litColor = v_color * lighting;
  vec3 finalColor = mix(bgColor, litColor, fog);

  fragColor = vec4(finalColor, 1.0);
}
`
```

- [ ] **Step 3: Commit**

```bash
git add components/tools/fov-simulator/shaders/compression.vert.ts components/tools/fov-simulator/shaders/compression.frag.ts
git commit -m "feat(fov): add 3D compression scene shaders"
```

---

## Task 11: Compression Scene Component

**Files:**
- Create: `components/tools/fov-simulator/CompressionScene.tsx`
- Create: `components/tools/fov-simulator/CompressionScene.module.css`
- Modify: `components/tools/fov-simulator/FovSimulator.tsx`

- [ ] **Step 1: Create CompressionScene.module.css**

```css
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.sceneCanvas {
  flex: 1;
  display: block;
  max-width: 100%;
  min-height: 0;
  border-radius: 8px;
}

.diagram {
  height: 80px;
  flex-shrink: 0;
  border-top: 1px solid var(--border);
}

.diagramCanvas {
  width: 100%;
  height: 100%;
  display: block;
}

@media (max-width: 1023px) {
  .diagram {
    height: 60px;
  }
}
```

- [ ] **Step 2: Create CompressionScene.tsx**

This is a large component. It has two canvases: a WebGL 3D pillars scene and a Canvas 2D top-down diagram.

```typescript
'use client'

import { useRef, useEffect, useCallback } from 'react'
import { calcCameraDistance } from '@/lib/math/compression'
import { calcFOV } from '@/lib/math/fov'
import { getSensor } from '@/lib/data/sensors'
import type { LensConfig } from '@/lib/types'
import { LENS_COLORS } from './types'
import { compressionVertexShader } from './shaders/compression.vert'
import { compressionFragmentShader } from './shaders/compression.frag'
import styles from './CompressionScene.module.css'

const PILLAR_COUNT = 5
const PILLAR_SPACING = 5 // feet between pillars
const PILLAR_RADIUS = 0.3
const PILLAR_HEIGHT = 4.0
const REF_FOCAL = 50
const SUBJECT_DIST = 10 // distance to nearest pillar at ref focal length
const PILLAR_SEGMENTS = 16 // vertices around circumference

const PILLAR_COLORS = [
  [0.9, 0.3, 0.3],  // red - nearest
  [0.9, 0.6, 0.2],  // orange
  [0.9, 0.9, 0.3],  // yellow
  [0.3, 0.8, 0.4],  // green
  [0.3, 0.5, 0.9],  // blue - farthest
]

interface CompressionSceneProps {
  lens: LensConfig
  activeLensIndex: number
  distance: number
}

// --- Matrix utilities (minimal, no dependency) ---

function mat4Perspective(fovYRad: number, aspect: number, near: number, far: number): Float32Array {
  const f = 1.0 / Math.tan(fovYRad / 2)
  const nf = 1 / (near - far)
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ])
}

function mat4LookAt(eye: number[], target: number[], up: number[]): Float32Array {
  const zx = eye[0] - target[0], zy = eye[1] - target[1], zz = eye[2] - target[2]
  let len = Math.sqrt(zx * zx + zy * zy + zz * zz)
  const z0 = zx / len, z1 = zy / len, z2 = zz / len

  const xx = up[1] * z2 - up[2] * z1
  const xy = up[2] * z0 - up[0] * z2
  const xz = up[0] * z1 - up[1] * z0
  len = Math.sqrt(xx * xx + xy * xy + xz * xz)
  const x0 = xx / len, x1 = xy / len, x2 = xz / len

  const y0 = z1 * x2 - z2 * x1
  const y1 = z2 * x0 - z0 * x2
  const y2 = z0 * x1 - z1 * x0

  return new Float32Array([
    x0, y0, z0, 0,
    x1, y1, z1, 0,
    x2, y2, z2, 0,
    -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]),
    -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]),
    -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]),
    1,
  ])
}

// --- Geometry builders ---

function buildCylinder(cx: number, cz: number, radius: number, height: number, segments: number, color: number[]): { positions: number[]; normals: number[]; colors: number[] } {
  const positions: number[] = []
  const normals: number[] = []
  const colors: number[] = []

  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI * 2
    const a1 = ((i + 1) / segments) * Math.PI * 2
    const cos0 = Math.cos(a0), sin0 = Math.sin(a0)
    const cos1 = Math.cos(a1), sin1 = Math.sin(a1)

    const x0 = cx + radius * cos0, z0 = cz + radius * sin0
    const x1 = cx + radius * cos1, z1 = cz + radius * sin1

    // Two triangles per segment (side face)
    // Triangle 1: bottom-left, bottom-right, top-left
    positions.push(x0, 0, z0, x1, 0, z1, x0, height, z0)
    // Triangle 2: top-left, bottom-right, top-right
    positions.push(x0, height, z0, x1, 0, z1, x1, height, z1)

    const n0 = [cos0, 0, sin0]
    const n1 = [cos1, 0, sin1]
    normals.push(...n0, ...n1, ...n0, ...n0, ...n1, ...n1)

    for (let v = 0; v < 6; v++) colors.push(...color)
  }

  return { positions, normals, colors }
}

function buildGroundPlane(): { positions: number[]; normals: number[]; colors: number[] } {
  const size = 50
  const color = [0.15, 0.15, 0.2]
  const positions = [
    -size, 0, -size, size, 0, -size, -size, 0, size,
    -size, 0, size, size, 0, -size, size, 0, size,
  ]
  const normals = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]
  const colors = [...color, ...color, ...color, ...color, ...color, ...color]
  return { positions, normals, colors }
}

// --- Component ---

export function CompressionScene({ lens, activeLensIndex, distance }: CompressionSceneProps) {
  const sceneCanvasRef = useRef<HTMLCanvasElement>(null)
  const diagramCanvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<{
    gl: WebGL2RenderingContext
    program: WebGLProgram
    vao: WebGLVertexArrayObject
    vertexCount: number
    locs: Record<string, WebGLUniformLocation>
  } | null>(null)

  const sensor = getSensor(lens.sensorId)
  const fov = calcFOV(lens.focalLength, sensor.cropFactor)
  const cameraDist = calcCameraDistance(lens.focalLength, REF_FOCAL, distance)

  // Build scene geometry (once)
  const buildScene = useCallback((gl: WebGL2RenderingContext) => {
    const allPos: number[] = []
    const allNorm: number[] = []
    const allCol: number[] = []

    // Ground plane
    const ground = buildGroundPlane()
    allPos.push(...ground.positions)
    allNorm.push(...ground.normals)
    allCol.push(...ground.colors)

    // Pillars
    for (let i = 0; i < PILLAR_COUNT; i++) {
      const z = -(SUBJECT_DIST + i * PILLAR_SPACING) // negative Z = into screen
      const cyl = buildCylinder(0, z, PILLAR_RADIUS, PILLAR_HEIGHT, PILLAR_SEGMENTS, PILLAR_COLORS[i])
      allPos.push(...cyl.positions)
      allNorm.push(...cyl.normals)
      allCol.push(...cyl.colors)
    }

    const vao = gl.createVertexArray()!
    gl.bindVertexArray(vao)

    const posBuf = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allPos), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0)

    const normBuf = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allNorm), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(1)
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0)

    const colBuf = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, colBuf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allCol), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(2)
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0)

    gl.bindVertexArray(null)
    return { vao, vertexCount: allPos.length / 3 }
  }, [])

  // Init WebGL
  useEffect(() => {
    const canvas = sceneCanvasRef.current
    if (!canvas || glRef.current) return

    const gl = canvas.getContext('webgl2')
    if (!gl) return

    function compileShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? '')
      return s
    }

    const vs = compileShader(gl, gl.VERTEX_SHADER, compressionVertexShader)
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, compressionFragmentShader)
    const program = gl.createProgram()!
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.bindAttribLocation(program, 0, 'a_position')
    gl.bindAttribLocation(program, 1, 'a_normal')
    gl.bindAttribLocation(program, 2, 'a_color')
    gl.linkProgram(program)
    gl.deleteShader(vs)
    gl.deleteShader(fs)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? '')
    }

    const { vao, vertexCount } = buildScene(gl)

    glRef.current = {
      gl, program, vao, vertexCount,
      locs: {
        u_projection: gl.getUniformLocation(program, 'u_projection')!,
        u_view: gl.getUniformLocation(program, 'u_view')!,
        u_lightDir: gl.getUniformLocation(program, 'u_lightDir')!,
        u_cameraPos: gl.getUniformLocation(program, 'u_cameraPos')!,
      },
    }

    gl.enable(gl.DEPTH_TEST)
    gl.clearColor(0.08, 0.08, 0.15, 1.0)

    return () => {
      gl.deleteProgram(program)
      glRef.current = null
    }
  }, [buildScene])

  // Render 3D scene
  useEffect(() => {
    const res = glRef.current
    const canvas = sceneCanvasRef.current
    if (!res || !canvas) return

    const { gl, program, vao, vertexCount, locs } = res

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const aspect = canvas.width / canvas.height
    const fovYRad = (fov.vertical * Math.PI) / 180
    const projection = mat4Perspective(fovYRad, aspect, 0.1, 200)

    const eyeY = PILLAR_HEIGHT * 0.5
    const eye = [0, eyeY, 0] // camera at origin, looking -Z
    const target = [0, eyeY, -(cameraDist + 10)]
    const view = mat4LookAt(eye, target, [0, 1, 0])

    // Shift camera back by cameraDist (camera at z=cameraDist, pillars start at z=-SUBJECT_DIST)
    // Actually: camera at z=cameraDist - SUBJECT_DIST so nearest pillar is at distance cameraDist
    const camZ = cameraDist - SUBJECT_DIST
    const adjustedEye = [0, eyeY, camZ]
    const adjustedTarget = [0, eyeY, camZ - 100]
    const adjustedView = mat4LookAt(adjustedEye, adjustedTarget, [0, 1, 0])

    gl.useProgram(program)
    gl.uniformMatrix4fv(locs.u_projection, false, projection)
    gl.uniformMatrix4fv(locs.u_view, false, adjustedView)
    gl.uniform3f(locs.u_lightDir, 0.3, 1.0, 0.5)
    gl.uniform3f(locs.u_cameraPos, adjustedEye[0], adjustedEye[1], adjustedEye[2])

    gl.bindVertexArray(vao)
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount)
    gl.bindVertexArray(null)
  }, [lens, cameraDist, fov])

  // Resize 3D canvas
  useEffect(() => {
    const canvas = sceneCanvasRef.current
    if (!canvas) return

    const observer = new ResizeObserver(() => {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
    })

    observer.observe(canvas.parentElement!)
    return () => observer.disconnect()
  }, [])

  // Draw top-down diagram
  useEffect(() => {
    const canvas = diagramCanvasRef.current
    if (!canvas) return

    const parent = canvas.parentElement
    if (!parent) return
    const rect = parent.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height

    ctx.clearRect(0, 0, w, h)

    // Coordinate mapping: horizontal = Z axis (depth), vertical = X axis
    const totalDepth = SUBJECT_DIST + (PILLAR_COUNT - 1) * PILLAR_SPACING + 5
    const maxCamDist = calcCameraDistance(200, REF_FOCAL, distance)
    const sceneWidth = Math.max(totalDepth, maxCamDist) + 10
    const margin = 20 * dpr
    const scale = (w - margin * 2) / sceneWidth

    // Map world Z to screen X (camera on left, pillars to the right)
    const toScreenX = (z: number) => margin + (cameraDist + z) * scale
    const toScreenY = () => h / 2

    const cy = toScreenY()

    // Draw sight lines (FOV cone)
    const halfAngle = (fov.horizontal / 2) * (Math.PI / 180)
    const coneLen = 40
    const camScreenX = toScreenX(0)

    ctx.strokeStyle = `${LENS_COLORS[activeLensIndex]}44`
    ctx.lineWidth = 1 * dpr
    ctx.beginPath()
    ctx.moveTo(camScreenX, cy)
    ctx.lineTo(camScreenX + coneLen * scale, cy - Math.tan(halfAngle) * coneLen * scale)
    ctx.moveTo(camScreenX, cy)
    ctx.lineTo(camScreenX + coneLen * scale, cy + Math.tan(halfAngle) * coneLen * scale)
    ctx.stroke()

    // Fill cone
    ctx.fillStyle = `${LENS_COLORS[activeLensIndex]}11`
    ctx.beginPath()
    ctx.moveTo(camScreenX, cy)
    ctx.lineTo(camScreenX + coneLen * scale, cy - Math.tan(halfAngle) * coneLen * scale)
    ctx.lineTo(camScreenX + coneLen * scale, cy + Math.tan(halfAngle) * coneLen * scale)
    ctx.closePath()
    ctx.fill()

    // Draw pillars as circles (top-down view)
    for (let i = 0; i < PILLAR_COUNT; i++) {
      const pillarZ = -(SUBJECT_DIST + i * PILLAR_SPACING)
      const px = toScreenX(-pillarZ - cameraDist)
      const r = Math.max(3 * dpr, PILLAR_RADIUS * scale)

      ctx.fillStyle = `rgb(${PILLAR_COLORS[i].map((c) => Math.round(c * 255)).join(',')})`
      ctx.beginPath()
      ctx.arc(px, cy, r, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw camera icon (triangle)
    const camSize = 6 * dpr
    ctx.fillStyle = LENS_COLORS[activeLensIndex]
    ctx.beginPath()
    ctx.moveTo(camScreenX + camSize, cy)
    ctx.lineTo(camScreenX - camSize, cy - camSize)
    ctx.lineTo(camScreenX - camSize, cy + camSize)
    ctx.closePath()
    ctx.fill()

    // Labels
    const fontSize = 10 * dpr
    ctx.font = `500 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.textAlign = 'center'
    ctx.fillText(`${lens.focalLength}mm`, camScreenX, cy - 12 * dpr)
    ctx.fillText(`${Math.round(cameraDist)}ft away`, camScreenX, cy + 18 * dpr)
  }, [lens, cameraDist, fov, activeLensIndex, distance])

  return (
    <div className={styles.container}>
      <div style={{ flex: 1, minHeight: 0 }}>
        <canvas ref={sceneCanvasRef} className={styles.sceneCanvas} aria-label="Perspective compression 3D demonstration" role="img" />
      </div>
      <div className={styles.diagram}>
        <canvas ref={diagramCanvasRef} className={styles.diagramCanvas} aria-label="Top-down diagram showing camera position and sight lines" role="img" />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Wire CompressionScene into FovSimulator.tsx**

Replace the compression placeholder:

```typescript
import { CompressionScene } from './CompressionScene'

// Also need a compression canvas ref is not needed since CompressionScene manages its own refs

// In canvasMain section, replace compression placeholder:
{state.viewMode === 'compression' && (
  <CompressionScene
    lens={state.lenses[state.activeLens]}
    activeLensIndex={state.activeLens}
    distance={state.distance}
  />
)}
```

- [ ] **Step 4: Verify compression scene**

Run: `npm run dev`
Expected: Switch to Compression mode. 5 colored pillars recede into the distance. Changing focal length moves the camera farther back (longer FL) or closer (shorter FL), keeping the nearest pillar the same apparent size while the background compresses/expands. Top-down diagram shows the camera position and FOV cone.

- [ ] **Step 5: Commit**

```bash
git add components/tools/fov-simulator/CompressionScene.tsx components/tools/fov-simulator/CompressionScene.module.css components/tools/fov-simulator/FovSimulator.tsx
git commit -m "feat(fov): add perspective compression 3D scene with top-down diagram"
```

---

## Task 12: Final Integration & Polish

**Files:**
- Modify: `components/tools/fov-simulator/FovSimulator.tsx`
- Modify: `components/tools/fov-simulator/FovSimulator.module.css`

- [ ] **Step 1: Hide scene strip in compression mode**

In FovSimulator.tsx, the scene strip is not relevant in compression mode (it uses a fixed 3D scene). Conditionally hide it:

```typescript
{/* In the canvasTopbar nav: */}
{state.viewMode !== 'compression' && (
  <SceneStrip
    selectedIndex={state.imageIndex}
    onChange={(i) => dispatch({ type: 'SET_IMAGE', payload: i })}
  />
)}
{state.viewMode === 'compression' && (
  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
    Perspective Compression Demo
  </span>
)}
```

- [ ] **Step 2: Hide framing guides and crop strip in non-FOV modes**

Ensure the Canvas component only renders in FOV mode (already done in Task 4). Ensure CropStrip only shows in FOV mode (already done in Task 5). Verify FrameInfoPanel is useful in all modes — the distance slider drives the compression scene too, so keep it visible.

- [ ] **Step 3: Hide rotate/center buttons in non-FOV modes**

In FovSimulator.tsx, wrap the rotate and center buttons:

```typescript
{state.viewMode === 'fov' && <span className={styles.desktopOnly}>{rotateBtn}</span>}
{state.viewMode === 'fov' && <span className={styles.desktopOnly}>{centerBtn}</span>}
```

Same in mobile toolbar.

- [ ] **Step 4: Run full test suite**

Run: `npm test`
Expected: All tests pass (existing + new distortion + compression tests)

- [ ] **Step 5: Run build**

Run: `npm run build`
Expected: Successful production build

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(fov): integrate all educational upgrades and polish view mode transitions"
```

---

## Summary

| Task | What it builds | Key files |
|------|---------------|-----------|
| 1 | State + URL sync | types.ts, querySync.ts, FovSimulator.tsx |
| 2 | Frame Info panel | FrameInfoPanel.tsx |
| 3 | Framing guides + equiv labels | Canvas.tsx |
| 4 | View Mode toggle | ViewModeToggle.tsx |
| 5 | Crop comparison strip | CropStrip.tsx |
| 6 | Distortion math | lib/math/distortion.ts |
| 7 | Distortion shaders | shaders/distortion.*.ts |
| 8 | Distortion canvas | DistortionCanvas.tsx |
| 9 | Compression math | lib/math/compression.ts |
| 10 | Compression shaders | shaders/compression.*.ts |
| 11 | Compression 3D scene + diagram | CompressionScene.tsx |
| 12 | Integration & polish | FovSimulator.tsx |
