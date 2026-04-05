# DOF Tools Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build three depth-of-field tools — DOF Simulator (WebGL), Focus Stacking Calculator, and Equivalent Settings Calculator — by renaming the existing DOF Calculator and building on its foundation.

**Architecture:** Rename existing `/dof-calculator` to `/dof-simulator` and transform it from a simple calculator into a WebGL-powered simulation. Extract shared math into expanded `dof.ts`. Two additional tools (Focus Stacking, Equivalent Settings) share the same math module and UI patterns. All tools use the standard sidebar + canvas + LearnPanel layout.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, WebGL2 + GLSL shaders, CSS Modules, next-intl, Vitest, Playwright

**Spec:** `docs/superpowers/specs/2026-04-05-dof-tools-design.md`

---

## Phase 1: Foundation — Math, Data, Shared Components

### Task 1: Expand DOF math module with new functions

**Files:**
- Modify: `src/lib/math/dof.ts`
- Modify: `src/lib/math/dof.test.ts`

- [ ] **Step 1: Write failing tests for `calcBackgroundBlur`**

Add to `src/lib/math/dof.test.ts`:

```typescript
import { calcHyperfocal, calcDoF, calcBackgroundBlur, calcAiryDisk, calcOptimalAperture, calcIsolationScore } from './dof'

describe('calcBackgroundBlur', () => {
  it('calculates blur in mm for background behind subject', () => {
    // 85mm f/1.4, subject at 3m, background at 10m
    // blur = f/N * (s/(s-f) * ((d-f)/d) - 1)
    // blur = 85/1.4 * (3000/(3000-85) * ((10000-85)/10000) - 1)
    // blur = 60.71 * (1.0292 * 0.9915 - 1) ≈ 60.71 * 0.0204 ≈ 1.24mm
    const blur = calcBackgroundBlur({ focalLength: 85, aperture: 1.4, subjectDistance: 3, targetDistance: 10 })
    expect(blur).toBeCloseTo(1.24, 0)
    expect(blur).toBeGreaterThan(0)
  })

  it('returns larger blur for closer background', () => {
    const close = calcBackgroundBlur({ focalLength: 85, aperture: 1.4, subjectDistance: 3, targetDistance: 5 })
    const far = calcBackgroundBlur({ focalLength: 85, aperture: 1.4, subjectDistance: 3, targetDistance: 50 })
    // Closer background = less blur (it's nearer to the focus plane)
    // Wait — actually closer to the subject means LESS blur. Farther = more blur up to a limit.
    // At infinite distance: blur = f/N * (s/(s-f) - 1) = f/N * f/(s-f) = f^2 / (N*(s-f))
    // So far > close is correct
    expect(far).toBeGreaterThan(close)
  })

  it('returns zero blur when target equals subject distance', () => {
    const blur = calcBackgroundBlur({ focalLength: 50, aperture: 2.8, subjectDistance: 3, targetDistance: 3 })
    expect(blur).toBeCloseTo(0, 5)
  })

  it('wider aperture produces more blur', () => {
    const wide = calcBackgroundBlur({ focalLength: 85, aperture: 1.4, subjectDistance: 3, targetDistance: 10 })
    const narrow = calcBackgroundBlur({ focalLength: 85, aperture: 8, subjectDistance: 3, targetDistance: 10 })
    expect(wide).toBeGreaterThan(narrow)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/lib/math/dof.test.ts`
Expected: FAIL — `calcBackgroundBlur` is not exported

- [ ] **Step 3: Implement `calcBackgroundBlur`**

Add to `src/lib/math/dof.ts`:

```typescript
export interface BlurInput {
  focalLength: number   // mm
  aperture: number      // f-number
  subjectDistance: number // meters
  targetDistance: number  // meters (depth at which to compute blur)
}

/**
 * Calculate the blur disc diameter (in mm) at a given distance from the camera,
 * when focused at subjectDistance.
 *
 * For targets BEHIND the subject (targetDistance > subjectDistance):
 *   blur = f/N × (s/(s-f) × ((d-f)/d) - 1)
 *
 * For targets IN FRONT of the subject (targetDistance < subjectDistance):
 *   blur = f/N × (1 - s/(s-f) × ((d-f)/d))
 *
 * Where: f = focal length (mm), N = f-number, s = subject distance (mm), d = target distance (mm)
 */
export function calcBackgroundBlur(input: BlurInput): number {
  const { focalLength: f, aperture: N, subjectDistance, targetDistance } = input
  const s = subjectDistance * 1000 // meters to mm
  const d = targetDistance * 1000
  if (d <= f || s <= f) return 0
  const ratio = (s / (s - f)) * ((d - f) / d)
  if (d > s) {
    return Math.abs((f / N) * (ratio - 1))
  }
  return Math.abs((f / N) * (1 - ratio))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/lib/math/dof.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Write failing tests for `calcAiryDisk`**

Add to `src/lib/math/dof.test.ts`:

```typescript
describe('calcAiryDisk', () => {
  it('calculates Airy disk diameter for f/8', () => {
    // airy = 2.44 × λ × N = 2.44 × 0.00055 × 8 = 0.01074mm
    const airy = calcAiryDisk(8)
    expect(airy).toBeCloseTo(0.01074, 4)
  })

  it('increases linearly with f-number', () => {
    const a8 = calcAiryDisk(8)
    const a16 = calcAiryDisk(16)
    expect(a16).toBeCloseTo(a8 * 2, 5)
  })

  it('returns small value for fast aperture', () => {
    const airy = calcAiryDisk(1.4)
    expect(airy).toBeLessThan(0.002)
  })
})
```

- [ ] **Step 6: Implement `calcAiryDisk`**

Add to `src/lib/math/dof.ts`:

```typescript
/** Wavelength of green light in mm (~550nm) */
const LAMBDA_MM = 0.00055

/**
 * Calculate the Airy disk diameter — the diffraction limit for a given f-number.
 * airy = 2.44 × λ × N
 *
 * When the Airy disk exceeds the geometric blur disc, diffraction dominates
 * and further stopping down reduces sharpness.
 */
export function calcAiryDisk(aperture: number): number {
  return 2.44 * LAMBDA_MM * aperture
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm test -- --run src/lib/math/dof.test.ts`
Expected: All tests PASS

- [ ] **Step 8: Write failing tests for `calcOptimalAperture` and `calcIsolationScore`**

Add to `src/lib/math/dof.test.ts`:

```typescript
describe('calcOptimalAperture', () => {
  it('returns an f-number where diffraction equals geometric blur', () => {
    // For 85mm, subject at 3m, background at 10m
    const optN = calcOptimalAperture(85, 3, 10)
    expect(optN).toBeGreaterThan(1)
    expect(optN).toBeLessThan(64)
    // At optimal aperture, Airy disk ≈ geometric blur
    const airy = calcAiryDisk(optN)
    const blur = calcBackgroundBlur({ focalLength: 85, aperture: optN, subjectDistance: 3, targetDistance: 10 })
    expect(airy).toBeCloseTo(blur, 2)
  })
})

describe('calcIsolationScore', () => {
  it('returns 100 for very blurred background', () => {
    const score = calcIsolationScore(1.5, 0.03)
    expect(score).toBe(100)
  })

  it('returns 0 for no blur', () => {
    const score = calcIsolationScore(0, 0.03)
    expect(score).toBe(0)
  })

  it('returns intermediate value for moderate blur', () => {
    const score = calcIsolationScore(0.15, 0.03)
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(100)
  })

  it('wider aperture gives higher score', () => {
    const scoreWide = calcIsolationScore(1.2, 0.03)
    const scoreNarrow = calcIsolationScore(0.1, 0.03)
    expect(scoreWide).toBeGreaterThan(scoreNarrow)
  })
})
```

- [ ] **Step 9: Implement `calcOptimalAperture` and `calcIsolationScore`**

Add to `src/lib/math/dof.ts`:

```typescript
/**
 * Calculate the aperture where diffraction equals geometric background blur.
 * This is the "sweet spot" — stopping down further softens via diffraction.
 *
 * Solve: 2.44 × λ × N = f/N × (s/(s-f) × ((d-f)/d) - 1)
 * → N² = f × blurFactor / (2.44 × λ)
 * → N = sqrt(f × blurFactor / (2.44 × λ))
 *
 * Where blurFactor = s/(s-f) × ((d-f)/d) - 1
 */
export function calcOptimalAperture(focalLength: number, subjectDistance: number, targetDistance: number): number {
  const f = focalLength
  const s = subjectDistance * 1000
  const d = targetDistance * 1000
  if (d <= f || s <= f) return 8 // fallback
  const blurFactor = Math.abs((s / (s - f)) * ((d - f) / d) - 1)
  if (blurFactor <= 0) return 8
  return Math.sqrt((f * blurFactor) / (2.44 * LAMBDA_MM))
}

/**
 * Calculate a subject isolation score (0–100) based on background blur.
 * Uses a reference threshold of 0.5mm — blur at or above this value = 100.
 *
 * The score is non-linear (sqrt) so small blur amounts still show meaningful differences.
 */
export function calcIsolationScore(backgroundBlurMm: number, coc: number): number {
  const COC_THRESHOLD = 0.5 // mm — clearly separated
  const raw = Math.sqrt(backgroundBlurMm / COC_THRESHOLD) * 100
  return Math.round(Math.min(Math.max(raw, 0), 100))
}
```

- [ ] **Step 10: Run test to verify it passes**

Run: `npm test -- --run src/lib/math/dof.test.ts`
Expected: All tests PASS

- [ ] **Step 11: Write failing tests for `calcStackingSequence`**

Add to `src/lib/math/dof.test.ts`:

```typescript
import { calcStackingSequence } from './dof'

describe('calcStackingSequence', () => {
  it('returns multiple shots for a depth range wider than single DoF', () => {
    const result = calcStackingSequence({
      focalLength: 100, aperture: 8, coc: 0.03,
      nearLimit: 1, farLimit: 5, overlapPct: 0.2,
    })
    expect(result.shots.length).toBeGreaterThan(1)
    expect(result.shots[0].focusDistance).toBeGreaterThanOrEqual(1)
  })

  it('first shot covers the near limit', () => {
    const result = calcStackingSequence({
      focalLength: 50, aperture: 11, coc: 0.03,
      nearLimit: 0.5, farLimit: 3, overlapPct: 0.2,
    })
    expect(result.shots[0].nearFocus).toBeLessThanOrEqual(0.5 + 0.01)
  })

  it('last shot covers the far limit', () => {
    const result = calcStackingSequence({
      focalLength: 50, aperture: 11, coc: 0.03,
      nearLimit: 0.5, farLimit: 3, overlapPct: 0.2,
    })
    const lastShot = result.shots[result.shots.length - 1]
    expect(lastShot.farFocus).toBeGreaterThanOrEqual(3)
  })

  it('adjacent shots overlap by the requested percentage', () => {
    const result = calcStackingSequence({
      focalLength: 50, aperture: 8, coc: 0.03,
      nearLimit: 1, farLimit: 10, overlapPct: 0.2,
    })
    for (let i = 0; i < result.shots.length - 1; i++) {
      const current = result.shots[i]
      const next = result.shots[i + 1]
      // Next shot's near focus should be within current shot's far focus
      expect(next.nearFocus).toBeLessThan(current.farFocus)
    }
  })

  it('returns single shot when DoF covers entire range', () => {
    // 24mm f/16 at hyperfocal — enormous DoF
    const result = calcStackingSequence({
      focalLength: 24, aperture: 16, coc: 0.03,
      nearLimit: 1, farLimit: 5, overlapPct: 0.2,
    })
    expect(result.shots.length).toBe(1)
  })

  it('caps at 100 shots to prevent infinite loops', () => {
    const result = calcStackingSequence({
      focalLength: 200, aperture: 2.8, coc: 0.03,
      nearLimit: 0.5, farLimit: 1000, overlapPct: 0.2,
    })
    expect(result.shots.length).toBeLessThanOrEqual(100)
  })
})
```

- [ ] **Step 12: Implement `calcStackingSequence`**

Add to `src/lib/math/dof.ts`:

```typescript
export interface StackingInput {
  focalLength: number  // mm
  aperture: number     // f-number
  coc: number          // mm
  nearLimit: number    // meters
  farLimit: number     // meters
  overlapPct: number   // 0–1 (e.g. 0.2 for 20%)
}

export interface StackingShot {
  number: number
  focusDistance: number  // meters
  nearFocus: number     // meters
  farFocus: number      // meters
}

export interface StackingResult {
  shots: StackingShot[]
  totalDepth: number    // meters
}

const MAX_STACKING_SHOTS = 100

/**
 * Calculate a focus stacking sequence — the set of focus distances needed
 * to cover a depth range with overlapping DoF bands.
 *
 * Algorithm:
 * 1. Find the focus distance whose near DoF limit = nearLimit
 * 2. Compute the far DoF limit for that focus distance
 * 3. Next focus = step forward by (1 - overlapPct) of the DoF range
 * 4. Repeat until farDoF >= farLimit
 */
export function calcStackingSequence(input: StackingInput): StackingResult {
  const { focalLength, aperture, coc, nearLimit, farLimit, overlapPct } = input
  const shots: StackingShot[] = []

  // Start: find focus distance whose near limit = nearLimit
  // From Dn = s(H-f)/(H+s-2f), solve for s given Dn:
  // We use a simpler approach: start focus at nearLimit and iterate
  let focusDist = nearLimit
  let shotNum = 0

  while (shotNum < MAX_STACKING_SHOTS) {
    shotNum++
    const dof = calcDoF({ focalLength, aperture, distance: focusDist, coc })
    shots.push({
      number: shotNum,
      focusDistance: focusDist,
      nearFocus: dof.nearFocus,
      farFocus: dof.farFocus,
    })

    if (dof.farFocus >= farLimit || dof.farFocus === Infinity) break

    // Step forward: advance by DoF range minus overlap
    const dofRange = dof.farFocus - dof.nearFocus
    const step = dofRange * (1 - overlapPct)
    if (step <= 0.001) break // prevent infinite loop for very tiny DoF
    focusDist = focusDist + step
  }

  return {
    shots,
    totalDepth: farLimit - nearLimit,
  }
}
```

- [ ] **Step 13: Run test to verify it passes**

Run: `npm test -- --run src/lib/math/dof.test.ts`
Expected: All tests PASS

- [ ] **Step 14: Write failing tests for `calcEquivalentSettings`**

Add to `src/lib/math/dof.test.ts`:

```typescript
import { calcEquivalentSettings } from './dof'

describe('calcEquivalentSettings', () => {
  it('FF 85mm f/1.4 → APS-C equivalent', () => {
    const result = calcEquivalentSettings({
      focalLength: 85, aperture: 1.4, distance: 3,
      sourceCrop: 1.0, targetCrop: 1.5,
    })
    // Equivalent FL = 85 * 1.5 / 1.0 = 127.5mm — wait, we want SAME framing on APS-C
    // So APS-C needs shorter FL: 85 / 1.5 * 1.0 = 56.67mm
    // Wait — equivalentFL = sourceFL * (targetCrop / sourceCrop) means 85 * 1.5 = 127.5
    // That's the "equivalent" field of view description. But to GET the same framing,
    // you need 85 / 1.5 ≈ 56.7mm on APS-C.
    // The spec says: equivalentFL = sourceFL × (targetCrop / sourceCrop) for "same framing"
    // Let me re-read... "For the same framing (same field of view): equivalentFL = sourceFL × (targetCrop / sourceCrop)"
    // This doesn't match. sourceFL × (targetCrop/sourceCrop) = 85 * 1.5 = 127.5 — that's not right for "same framing".
    // Actually — to get the SAME framing on a SMALLER sensor, you need a SHORTER focal length.
    // equivalentFL = sourceFL / (targetCrop / sourceCrop) = sourceFL * sourceCrop / targetCrop
    // = 85 * 1.0 / 1.5 = 56.67mm

    // The spec formula is wrong. The correct formula:
    // equivalentFL = sourceFL * (sourceCrop / targetCrop) for same framing
    // equivalentAperture = sourceAperture * (sourceCrop / targetCrop) for same DOF
    expect(result.equivalentFL).toBeCloseTo(56.67, 0)
    expect(result.equivalentAperture).toBeCloseTo(0.93, 1)
  })

  it('APS-C 35mm f/2 → FF equivalent', () => {
    const result = calcEquivalentSettings({
      focalLength: 35, aperture: 2, distance: 3,
      sourceCrop: 1.5, targetCrop: 1.0,
    })
    // Same framing on FF: 35 * 1.5 / 1.0 = 52.5mm
    // Same DOF on FF: f/2 * 1.5 / 1.0 = f/3
    expect(result.equivalentFL).toBeCloseTo(52.5, 0)
    expect(result.equivalentAperture).toBeCloseTo(3, 0)
  })

  it('same sensor returns same values', () => {
    const result = calcEquivalentSettings({
      focalLength: 50, aperture: 2.8, distance: 5,
      sourceCrop: 1.0, targetCrop: 1.0,
    })
    expect(result.equivalentFL).toBeCloseTo(50, 5)
    expect(result.equivalentAperture).toBeCloseTo(2.8, 5)
  })

  it('flags unrealistic apertures', () => {
    // FF 85mm f/1.4 → APS-C needs f/0.93 which doesn't exist
    const result = calcEquivalentSettings({
      focalLength: 85, aperture: 1.4, distance: 3,
      sourceCrop: 1.0, targetCrop: 1.5,
    })
    expect(result.isApertureRealistic).toBe(false)
  })

  it('marks aperture as realistic when feasible', () => {
    const result = calcEquivalentSettings({
      focalLength: 50, aperture: 5.6, distance: 3,
      sourceCrop: 1.0, targetCrop: 1.5,
    })
    expect(result.isApertureRealistic).toBe(true)
  })
})
```

- [ ] **Step 15: Implement `calcEquivalentSettings`**

Add to `src/lib/math/dof.ts`:

```typescript
export interface EquivalenceInput {
  focalLength: number   // mm
  aperture: number      // f-number
  distance: number      // meters
  sourceCrop: number    // source sensor crop factor
  targetCrop: number    // target sensor crop factor
}

export interface EquivalenceResult {
  equivalentFL: number
  equivalentAperture: number
  equivalentDistance: number
  isApertureRealistic: boolean
  isFLRealistic: boolean
}

/**
 * Calculate equivalent settings on a target sensor to match the DOF and framing
 * of the source sensor.
 *
 * To get the same framing: multiply FL by sourceCrop/targetCrop ratio
 * To get the same DOF: multiply aperture by the same ratio
 * Distance stays the same (same perspective).
 */
export function calcEquivalentSettings(input: EquivalenceInput): EquivalenceResult {
  const { focalLength, aperture, distance, sourceCrop, targetCrop } = input
  const ratio = sourceCrop / targetCrop
  const equivalentFL = focalLength * ratio
  const equivalentAperture = aperture * ratio
  return {
    equivalentFL,
    equivalentAperture,
    equivalentDistance: distance,
    isApertureRealistic: equivalentAperture >= 0.95 && equivalentAperture <= 64,
    isFLRealistic: equivalentFL >= 8 && equivalentFL <= 800,
  }
}
```

- [ ] **Step 16: Run all DOF tests**

Run: `npm test -- --run src/lib/math/dof.test.ts`
Expected: All tests PASS

- [ ] **Step 17: Commit**

```bash
git add src/lib/math/dof.ts src/lib/math/dof.test.ts
git commit -m "feat(math): expand dof module with blur, diffraction, stacking, and equivalence functions"
```

---

### Task 2: Expand camera and sensor data

**Files:**
- Modify: `src/lib/data/camera.ts`
- Modify: `src/lib/data/sensors.ts`

- [ ] **Step 1: Add 1/3-stop aperture array to camera.ts**

Add to `src/lib/data/camera.ts`:

```typescript
/** Full 1/3-stop aperture scale for fine-grained DOF control */
export const APERTURES_THIRD_STOP = [
  1, 1.1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.5, 2.8, 3.2, 3.5, 4, 4.5, 5,
  5.6, 6.3, 7.1, 8, 9, 10, 11, 13, 14, 16, 18, 20, 22, 25, 29, 32, 36,
  40, 45, 51, 57, 64,
]

/** Full-stop apertures for display tick labels */
export const APERTURES_FULL_STOP = [1, 1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22, 32, 45, 64]
```

- [ ] **Step 2: Add APS-H sensor to sensors.ts**

Add after `apsc_c` in the SENSORS array in `src/lib/data/sensors.ts`:

```typescript
  { id: 'apsh', name: 'APS-H', cropFactor: 1.26, w: 28.5, h: 19, color: '#06b6d4' },
```

- [ ] **Step 3: Run existing tests to ensure no breakage**

Run: `npm test -- --run`
Expected: All existing tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/data/camera.ts src/lib/data/sensors.ts
git commit -m "feat(data): add 1/3-stop apertures and APS-H sensor"
```

---

### Task 3: Create shared ApertureField and DistanceField components

**Files:**
- Create: `src/components/shared/ApertureField.tsx`
- Create: `src/components/shared/ApertureField.module.css`
- Create: `src/components/shared/DistanceField.tsx`
- Create: `src/components/shared/DistanceField.module.css`

- [ ] **Step 1: Create ApertureField component**

Create `src/components/shared/ApertureField.tsx`:

```typescript
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { APERTURES_THIRD_STOP, APERTURES_FULL_STOP } from '@/lib/data/camera'
import s from './ApertureField.module.css'

interface ApertureFieldProps {
  value: number
  onChange: (aperture: number) => void
  sweetSpot?: number | null  // optimal aperture f-number, shown as green marker
  min?: number
  max?: number
}

const SNAP_THRESHOLD = 0.02 // slider fraction

function apertureToSlider(aperture: number): number {
  const minLog = Math.log(APERTURES_THIRD_STOP[0])
  const maxLog = Math.log(APERTURES_THIRD_STOP[APERTURES_THIRD_STOP.length - 1])
  return (Math.log(aperture) - minLog) / (maxLog - minLog)
}

function sliderToAperture(val: number): number {
  const minLog = Math.log(APERTURES_THIRD_STOP[0])
  const maxLog = Math.log(APERTURES_THIRD_STOP[APERTURES_THIRD_STOP.length - 1])
  const raw = Math.exp(minLog + val * (maxLog - minLog))
  // Snap to nearest 1/3-stop
  let closest = APERTURES_THIRD_STOP[0]
  let closestDist = Infinity
  for (const a of APERTURES_THIRD_STOP) {
    const dist = Math.abs(apertureToSlider(a) - val)
    if (dist < closestDist) {
      closestDist = dist
      closest = a
    }
  }
  return closestDist < SNAP_THRESHOLD ? closest : Math.round(raw * 10) / 10
}

export function ApertureField({ value, onChange, sweetSpot, min, max }: ApertureFieldProps) {
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const sliderVal = apertureToSlider(value)

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(sliderToAperture(Number(e.target.value)))
  }, [onChange])

  const startEdit = useCallback(() => {
    setEditVal(String(value))
    setEditing(true)
  }, [value])

  const commitEdit = useCallback(() => {
    setEditing(false)
    const n = Number(editVal)
    if (!isNaN(n) && n >= (min ?? 1) && n <= (max ?? 64)) {
      onChange(n)
    }
  }, [editVal, onChange, min, max])

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const sweetSpotPos = sweetSpot != null ? apertureToSlider(sweetSpot) : null

  return (
    <div className={s.wrapper}>
      <div className={s.valueRow}>
        {editing ? (
          <input ref={inputRef} className={s.editInput} type="number" step="0.1"
            value={editVal} onChange={(e) => setEditVal(e.target.value)}
            onBlur={commitEdit} onKeyDown={(e) => e.key === 'Enter' && commitEdit()} />
        ) : (
          <button className={s.valueBtn} onClick={startEdit} title="Click to edit">
            f/{value}
          </button>
        )}
      </div>
      <div className={s.sliderWrap}>
        <input type="range" className={s.slider} min={0} max={1} step={0.001}
          value={sliderVal} onChange={handleSlider} />
        {sweetSpotPos != null && (
          <div className={s.sweetSpot} style={{ left: `${sweetSpotPos * 100}%` }} title={`Sweet spot: f/${sweetSpot!.toFixed(1)}`} />
        )}
      </div>
      <div className={s.ticks}>
        {APERTURES_FULL_STOP.filter(a => (min == null || a >= min) && (max == null || a <= max)).map((a) => (
          <button key={a} className={`${s.tick} ${a === value ? s.tickActive : ''}`}
            onClick={() => onChange(a)} style={{ left: `${apertureToSlider(a) * 100}%` }}>
            {a}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create ApertureField CSS**

Create `src/components/shared/ApertureField.module.css`:

```css
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.valueRow {
  display: flex;
  align-items: center;
}

.valueBtn {
  background: none;
  border: none;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: var(--radius-sm);
}

.valueBtn:hover {
  background: var(--bg-surface);
}

.editInput {
  width: 60px;
  padding: 2px 4px;
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  outline: none;
}

.sliderWrap {
  position: relative;
  height: 20px;
  display: flex;
  align-items: center;
}

.slider {
  width: 100%;
  accent-color: var(--accent);
}

.sweetSpot {
  position: absolute;
  width: 3px;
  height: 14px;
  background: #22c55e;
  border-radius: 1px;
  top: 3px;
  transform: translateX(-50%);
  pointer-events: none;
  opacity: 0.8;
}

.ticks {
  position: relative;
  height: 16px;
}

.tick {
  position: absolute;
  transform: translateX(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 9px;
  font-family: var(--font-mono);
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.tick:hover {
  color: var(--text-primary);
}

.tickActive {
  color: var(--accent);
  font-weight: 600;
}
```

- [ ] **Step 3: Create DistanceField component**

Create `src/components/shared/DistanceField.tsx`:

```typescript
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import s from './DistanceField.module.css'

interface DistanceFieldProps {
  value: number          // meters
  onChange: (meters: number) => void
  min?: number           // meters (default 0.1)
  max?: number           // meters (default 100)
  label?: string
}

function distToSlider(dist: number, min: number, max: number): number {
  const minLog = Math.log(min)
  const maxLog = Math.log(max)
  return (Math.log(dist) - minLog) / (maxLog - minLog)
}

function sliderToDist(val: number, min: number, max: number): number {
  const minLog = Math.log(min)
  const maxLog = Math.log(max)
  return Math.exp(minLog + val * (maxLog - minLog))
}

export function formatDistance(meters: number): string {
  if (!isFinite(meters)) return '∞'
  if (meters < 1) return `${(meters * 100).toFixed(0)} cm`
  return `${meters.toFixed(2)} m`
}

export function DistanceField({ value, onChange, min = 0.1, max = 100, label }: DistanceFieldProps) {
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const sliderVal = distToSlider(value, min, max)

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(sliderToDist(Number(e.target.value), min, max))
  }, [onChange, min, max])

  const startEdit = useCallback(() => {
    setEditVal(value.toFixed(2))
    setEditing(true)
  }, [value])

  const commitEdit = useCallback(() => {
    setEditing(false)
    const n = Number(editVal)
    if (!isNaN(n) && n >= min && n <= max) {
      onChange(n)
    }
  }, [editVal, onChange, min, max])

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  return (
    <div className={s.wrapper}>
      <div className={s.valueRow}>
        {label && <span className={s.label}>{label}</span>}
        {editing ? (
          <input ref={inputRef} className={s.editInput} type="number" step="0.01"
            value={editVal} onChange={(e) => setEditVal(e.target.value)}
            onBlur={commitEdit} onKeyDown={(e) => e.key === 'Enter' && commitEdit()} />
        ) : (
          <button className={s.valueBtn} onClick={startEdit} title="Click to edit">
            {formatDistance(value)}
          </button>
        )}
      </div>
      <input type="range" className={s.slider} min={0} max={1} step={0.001}
        value={sliderVal} onChange={handleSlider} />
    </div>
  )
}
```

- [ ] **Step 4: Create DistanceField CSS**

Create `src/components/shared/DistanceField.module.css`:

```css
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.valueRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.valueBtn {
  background: none;
  border: none;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: var(--radius-sm);
}

.valueBtn:hover {
  background: var(--bg-surface);
}

.editInput {
  width: 80px;
  padding: 2px 4px;
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  outline: none;
}

.slider {
  width: 100%;
  accent-color: var(--accent);
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/ApertureField.tsx src/components/shared/ApertureField.module.css src/components/shared/DistanceField.tsx src/components/shared/DistanceField.module.css
git commit -m "feat(shared): add ApertureField and DistanceField components"
```

---

### Task 4: Register new tools and add icons

**Files:**
- Modify: `src/lib/data/tools.ts`
- Modify: `src/components/shared/ToolIcon.tsx`

- [ ] **Step 1: Update tools registry — rename dof-calculator and add new tools**

In `src/lib/data/tools.ts`, replace the `dof-calculator` entry and add two new entries:

Replace `dof-calculator` line:
```typescript
  { slug: 'dof-simulator', name: 'Depth-of-Field Simulator', description: 'Visualize how aperture, focal length, and distance affect background blur', dev: 'live', prod: 'disabled', category: 'visualizer' },
```

Add after it:
```typescript
  { slug: 'focus-stacking-calculator', name: 'Focus Stacking Calculator', description: 'Calculate optimal focus distances for front-to-back sharpness', dev: 'live', prod: 'disabled', category: 'calculator' },
  { slug: 'equivalent-settings-calculator', name: 'Equivalent Settings Calculator', description: 'Find equivalent aperture and focal length across sensor formats', dev: 'live', prod: 'disabled', category: 'calculator' },
```

- [ ] **Step 2: Add icons for new tools in ToolIcon.tsx**

Add three new icon components before the `ICON_MAP` in `src/components/shared/ToolIcon.tsx`:

```typescript
/** Depth-of-Field Simulator — layered depth circles */
function DofSimulator(p: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="7" strokeDasharray="3 2" />
      <circle cx="12" cy="12" r="10" strokeDasharray="2 3" opacity={0.4} />
    </svg>
  )
}

/** Focus Stacking Calculator — stacked layers */
function FocusStackingCalc(p: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="4" y="14" width="16" height="4" rx="1" />
      <rect x="5" y="9" width="14" height="4" rx="1" opacity={0.7} />
      <rect x="6" y="4" width="12" height="4" rx="1" opacity={0.4} />
      <path d="M12 19v3" />
    </svg>
  )
}

/** Equivalent Settings Calculator — scale / balance */
function EquivalentSettingsCalc(p: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 3v18" />
      <path d="M4 7l8-4 8 4" />
      <path d="M2 11a6 6 0 004 0" />
      <path d="M18 11a6 6 0 004 0" />
      <circle cx="4" cy="11" r="1" />
      <circle cx="20" cy="11" r="1" />
    </svg>
  )
}
```

Update the `ICON_MAP`:
```typescript
const ICON_MAP: Record<string, (props: IconProps) => React.JSX.Element> = {
  'fov-simulator': FovSimulator,
  'color-scheme-generator': ColorHarmony,
  'exposure-simulator': ExposureSimulator,
  'dof-simulator': DofSimulator,
  'dof-calculator': DofSimulator, // backward compat
  'hyperfocal-simulator': HyperfocalSimulator,
  'shutter-speed-visualizer': ShutterSpeedGuide,
  'nd-filter-calculator': NdFilterCalculator,
  'star-trail-calculator': StarTrailCalculator,
  'white-balance-visualizer': WhiteBalance,
  'sensor-size-comparison': SensorSize,
  'exif-viewer': ExifViewer,
  'perspective-compression-simulator': PerspectiveCompression,
  'frame-studio': FrameStudioIcon,
  'focus-stacking-calculator': FocusStackingCalc,
  'equivalent-settings-calculator': EquivalentSettingsCalc,
}
```

- [ ] **Step 3: Run lint and existing tests**

Run: `npm run lint && npm test -- --run`
Expected: All pass

- [ ] **Step 4: Commit**

```bash
git add src/lib/data/tools.ts src/components/shared/ToolIcon.tsx
git commit -m "feat: register dof-simulator, focus-stacking-calculator, and equivalent-settings-calculator tools"
```

---

### Task 5: Create data files for new tools

**Files:**
- Create: `src/lib/data/dofSimulator.ts`
- Create: `src/lib/data/focusStacking.ts`
- Create: `src/lib/data/equivalentSettings.ts`
- Modify: `src/lib/data/dofCalculator.ts` (delete — no longer needed)

- [ ] **Step 1: Create DOF Simulator data file**

Create `src/lib/data/dofSimulator.ts`:

```typescript
export interface DofScene {
  key: string
  name: string
  photo: string
  depthMap: string
  nearDistance: number     // meters (white in depth map)
  farDistance: number      // meters (black in depth map)
  defaultSubjectDistance: number
  thumbnail: string
}

export const DOF_SCENES: DofScene[] = [
  { key: 'park-portrait', name: 'Park Portrait', photo: '/scenes/park-portrait.jpg', depthMap: '/scenes/park-portrait-depth.png', nearDistance: 2, farDistance: 50, defaultSubjectDistance: 3, thumbnail: '/scenes/thumbnails/park-portrait.jpg' },
  { key: 'street', name: 'Urban Street', photo: '/scenes/street.jpg', depthMap: '/scenes/street-depth.png', nearDistance: 3, farDistance: 200, defaultSubjectDistance: 5, thumbnail: '/scenes/thumbnails/street.jpg' },
  { key: 'landscape', name: 'Landscape', photo: '/scenes/landscape.jpg', depthMap: '/scenes/landscape-depth.png', nearDistance: 0.5, farDistance: 1000, defaultSubjectDistance: 10, thumbnail: '/scenes/thumbnails/landscape.jpg' },
  { key: 'cafe', name: 'Indoor Café', photo: '/scenes/cafe.jpg', depthMap: '/scenes/cafe-depth.png', nearDistance: 1, farDistance: 15, defaultSubjectDistance: 2, thumbnail: '/scenes/thumbnails/cafe.jpg' },
  { key: 'architecture', name: 'Architecture', photo: '/scenes/architecture.jpg', depthMap: '/scenes/architecture-depth.png', nearDistance: 5, farDistance: 100, defaultSubjectDistance: 15, thumbnail: '/scenes/thumbnails/architecture.jpg' },
  { key: 'macro', name: 'Macro', photo: '/scenes/macro.jpg', depthMap: '/scenes/macro-depth.png', nearDistance: 0.1, farDistance: 2, defaultSubjectDistance: 0.3, thumbnail: '/scenes/thumbnails/macro.jpg' },
]

export type DofSceneKey = typeof DOF_SCENES[number]['key']

export function getDofScene(key: string): DofScene {
  return DOF_SCENES.find((sc) => sc.key === key) ?? DOF_SCENES[0]
}

export type SubjectMode = 'figure' | 'target'
export type ABMode = 'off' | 'wipe' | 'split'
export type BokehShape = 'disc' | 'blade5' | 'blade6' | 'blade7' | 'blade8' | 'blade9' | 'cata'

export const BOKEH_SHAPES: { key: BokehShape; name: string }[] = [
  { key: 'disc', name: 'Circular' },
  { key: 'blade5', name: '5 Blades' },
  { key: 'blade6', name: '6 Blades' },
  { key: 'blade7', name: '7 Blades' },
  { key: 'blade8', name: '8 Blades' },
  { key: 'blade9', name: '9 Blades' },
  { key: 'cata', name: 'Catadioptric' },
]

export interface FramingPreset {
  key: string
  name: string
  heightMm: number
}

export const FRAMING_PRESETS: FramingPreset[] = [
  { key: 'face', name: 'Face', heightMm: 320 },
  { key: 'portrait', name: 'Portrait', heightMm: 480 },
  { key: 'medium', name: 'Medium', heightMm: 700 },
  { key: 'american', name: 'American', heightMm: 1000 },
  { key: 'full', name: 'Full', heightMm: 1700 },
]

/** Depth zones of the depth-layered figure, relative to subject distance */
export const FIGURE_DEPTH_ZONES = [
  { key: 'nose', offsetMm: -50, label: 'Nose' },
  { key: 'face', offsetMm: -20, label: 'Face' },
  { key: 'eyes', offsetMm: 0, label: 'Eyes (focus)' },
  { key: 'ears', offsetMm: 70, label: 'Ears' },
  { key: 'body', offsetMm: 100, label: 'Body' },
]
```

- [ ] **Step 2: Create Focus Stacking data file**

Create `src/lib/data/focusStacking.ts`:

```typescript
export const OVERLAP_PRESETS = [
  { value: 0.1, label: '10% (minimal)' },
  { value: 0.2, label: '20% (recommended)' },
  { value: 0.3, label: '30% (safe)' },
  { value: 0.5, label: '50% (maximum overlap)' },
]

export function formatStackingExport(
  focalLength: number,
  aperture: number,
  sensorName: string,
  shots: Array<{ number: number; focusDistance: number }>
): string {
  const header = `Focus Stacking Sequence (${focalLength}mm f/${aperture} ${sensorName})`
  const lines = shots.map((s) => {
    const dist = s.focusDistance < 1
      ? `${(s.focusDistance * 100).toFixed(0)} cm`
      : `${s.focusDistance.toFixed(2)} m`
    return `${s.number}. ${dist}`
  })
  return [header, ...lines].join('\n')
}
```

- [ ] **Step 3: Create Equivalent Settings data file**

Create `src/lib/data/equivalentSettings.ts`:

```typescript
import { APERTURES_THIRD_STOP } from './camera'

/**
 * Find the closest real aperture to a computed equivalent.
 */
export function closestRealAperture(target: number): number {
  let closest = APERTURES_THIRD_STOP[0]
  let minDist = Infinity
  for (const a of APERTURES_THIRD_STOP) {
    const dist = Math.abs(Math.log(a) - Math.log(target))
    if (dist < minDist) {
      minDist = dist
      closest = a
    }
  }
  return closest
}

/** Common focal length presets for "closest real" matching */
export const COMMON_FOCAL_LENGTHS = [
  8, 10, 12, 14, 16, 18, 20, 24, 28, 35, 40, 50, 56, 70, 85, 100, 105, 135, 200, 300, 400, 500, 600, 800,
]

export function closestRealFL(target: number): number {
  let closest = COMMON_FOCAL_LENGTHS[0]
  let minDist = Infinity
  for (const fl of COMMON_FOCAL_LENGTHS) {
    const dist = Math.abs(fl - target)
    if (dist < minDist) {
      minDist = dist
      closest = fl
    }
  }
  return closest
}
```

- [ ] **Step 4: Delete old dofCalculator.ts data file**

Delete `src/lib/data/dofCalculator.ts` — it only contained `DOF_SCENE_PRESETS` which is replaced by `DOF_SCENES` in `dofSimulator.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/data/dofSimulator.ts src/lib/data/focusStacking.ts src/lib/data/equivalentSettings.ts
git rm src/lib/data/dofCalculator.ts
git commit -m "feat(data): add dofSimulator, focusStacking, and equivalentSettings data files"
```

---

### Task 6: Create i18n message files and register in request.ts

**Files:**
- Create: `src/lib/i18n/messages/en/tools/dof-simulator.json`
- Create: `src/lib/i18n/messages/en/tools/focus-stacking-calculator.json`
- Create: `src/lib/i18n/messages/en/tools/equivalent-settings-calculator.json`
- Create: `src/lib/i18n/messages/en/education/dof-simulator.json`
- Create: `src/lib/i18n/messages/en/education/focus-stacking-calculator.json`
- Create: `src/lib/i18n/messages/en/education/equivalent-settings-calculator.json`
- Modify: `src/lib/i18n/messages/en/tools.json` (add tool names/descriptions)
- Modify: `src/lib/i18n/messages/en/metadata.json` (add metadata)
- Modify: `src/lib/i18n/request.ts` (register new files)
- Modify: existing `dof-calculator` i18n files (rename to `dof-simulator`)

- [ ] **Step 1: Create tool UI message files**

Create `src/lib/i18n/messages/en/tools/dof-simulator.json` with all UI strings for the DOF Simulator. Include labels for all panels (Camera, Lens, Distance, Framing, Bokeh, Results), all controls, scene names, mode names, result labels, and tooltip text.

Create `src/lib/i18n/messages/en/tools/focus-stacking-calculator.json` with UI strings for the Focus Stacking Calculator.

Create `src/lib/i18n/messages/en/tools/equivalent-settings-calculator.json` with UI strings for the Equivalent Settings Calculator.

- [ ] **Step 2: Create education message files**

Create education JSON files for all three tools following the pattern in `src/lib/i18n/messages/en/education/dof-calculator.json`. Each needs: beginner text, deeper explanation, keyFactors, tips, tooltips, and challenge text.

Rename `education/dof-calculator.json` to `education/dof-simulator.json` and update the top-level key from `"dof-calculator"` to `"dof-simulator"`.

- [ ] **Step 3: Update metadata.json**

Add metadata entries for all three tools in `src/lib/i18n/messages/en/metadata.json`:

```json
"dof-simulator": {
  "title": "Depth-of-Field Simulator | PhotoTools",
  "description": "Visualize how aperture, focal length, and distance affect background blur with real-time WebGL simulation"
},
"focus-stacking-calculator": {
  "title": "Focus Stacking Calculator | PhotoTools",
  "description": "Calculate optimal focus distances for front-to-back sharpness in macro and landscape photography"
},
"equivalent-settings-calculator": {
  "title": "Equivalent Settings Calculator | PhotoTools",
  "description": "Find equivalent aperture and focal length across sensor formats to match depth of field"
}
```

- [ ] **Step 4: Register in request.ts**

Add imports and references for all six new message files in `src/lib/i18n/request.ts`, following the existing pattern. Remove the `dof-calculator` imports and replace with `dof-simulator`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/i18n/
git commit -m "feat(i18n): add message files for dof-simulator, focus-stacking, and equivalent-settings tools"
```

---

### Task 7: Create education skeletons for new tools

**Files:**
- Modify: `src/lib/data/education/content-dof.ts` (rename skeleton slug)
- Create: `src/lib/data/education/content-focus-stacking.ts`
- Create: `src/lib/data/education/content-equivalent-settings.ts`
- Modify: `src/lib/data/education/content.ts` (register new skeletons)

- [ ] **Step 1: Rename DOF skeleton slug**

In `src/lib/data/education/content-dof.ts`, change `slug: 'dof-calculator'` to `slug: 'dof-simulator'`. Add additional tooltipKeys for the new features: `'backgroundBlur'`, `'isolationScore'`, `'bokehShape'`, `'diffraction'`, `'cocExplained'`.

- [ ] **Step 2: Create Focus Stacking skeleton**

Create `src/lib/data/education/content-focus-stacking.ts`:

```typescript
import type { ToolEducationSkeleton } from './types'

export const FOCUS_STACKING_SKELETON: ToolEducationSkeleton = {
  slug: 'focus-stacking-calculator',
  keyFactorCount: 3,
  tipCount: 3,
  tooltipKeys: ['focalLength', 'aperture', 'nearLimit', 'farLimit', 'overlap', 'shotCount'],
  challenges: [
    {
      id: 'stacking-macro-count',
      difficulty: 'beginner',
      targetField: 'aperture',
      optionValues: ['f/2.8 — 25 shots', 'f/8 — 8 shots', 'f/16 — 4 shots', 'f/22 — 2 shots'],
      correctOption: 'f/8 — 8 shots',
    },
    {
      id: 'stacking-landscape-technique',
      difficulty: 'intermediate',
      targetField: 'focusDistance',
      optionValues: ['Focus at infinity', 'Focus at hyperfocal', 'Stack from 1m to infinity', 'Use f/22'],
      correctOption: 'Stack from 1m to infinity',
    },
    {
      id: 'stacking-overlap-purpose',
      difficulty: 'beginner',
      targetField: 'overlap',
      optionValues: ['Sharper image', 'Alignment tolerance', 'More bokeh', 'Wider field of view'],
      correctOption: 'Alignment tolerance',
    },
  ],
}
```

- [ ] **Step 3: Create Equivalent Settings skeleton**

Create `src/lib/data/education/content-equivalent-settings.ts`:

```typescript
import type { ToolEducationSkeleton } from './types'

export const EQUIVALENT_SETTINGS_SKELETON: ToolEducationSkeleton = {
  slug: 'equivalent-settings-calculator',
  keyFactorCount: 3,
  tipCount: 3,
  tooltipKeys: ['cropFactor', 'equivalentFL', 'equivalentAperture', 'dofEquivalence'],
  challenges: [
    {
      id: 'equiv-ff-to-apsc',
      difficulty: 'beginner',
      targetField: 'equivalentFL',
      optionValues: ['50mm', '56mm', '75mm', '85mm'],
      correctOption: '75mm',
    },
    {
      id: 'equiv-aperture-myth',
      difficulty: 'intermediate',
      targetField: 'equivalentAperture',
      optionValues: ['Same — f/1.4', 'f/2.1', 'f/0.9 (impossible)', 'Depends on distance'],
      correctOption: 'f/2.1',
    },
    {
      id: 'equiv-same-perspective',
      difficulty: 'advanced',
      targetField: 'perspective',
      optionValues: ['Changes with sensor', 'Only depends on distance', 'Changes with focal length', 'Changes with aperture'],
      correctOption: 'Only depends on distance',
    },
  ],
}
```

- [ ] **Step 4: Register skeletons in content.ts**

In `src/lib/data/education/content.ts`, import and add the new skeletons:

```typescript
import { FOCUS_STACKING_SKELETON } from './content-focus-stacking'
import { EQUIVALENT_SETTINGS_SKELETON } from './content-equivalent-settings'

export const TOOL_EDUCATION_SKELETONS: ToolEducationSkeleton[] = [
  DOF_CALCULATOR_SKELETON,
  EXPOSURE_SIMULATOR_SKELETON,
  STAR_TRAIL_SKELETON,
  ND_FILTER_SKELETON,
  WHITE_BALANCE_SKELETON,
  SHUTTER_SPEED_SKELETON,
  PERSPECTIVE_COMPRESSION_SKELETON,
  FOCUS_STACKING_SKELETON,
  EQUIVALENT_SETTINGS_SKELETON,
]
```

- [ ] **Step 5: Run tests**

Run: `npm test -- --run`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/data/education/
git commit -m "feat(education): add skeletons for dof-simulator, focus-stacking, and equivalent-settings"
```

---

## Phase 2: DOF Simulator — Route Rename and Core UI

### Task 8: Rename route from dof-calculator to dof-simulator

**Files:**
- Rename: `src/app/[locale]/dof-calculator/` → `src/app/[locale]/dof-simulator/`
- Modify: all component files to update slugs, imports, and translations keys

- [ ] **Step 1: Rename directory**

```bash
git mv src/app/[locale]/dof-calculator src/app/[locale]/dof-simulator
```

- [ ] **Step 2: Update page.tsx**

Update `src/app/[locale]/dof-simulator/page.tsx` to use `dof-simulator` metadata key and import from new path.

- [ ] **Step 3: Update DoFCalculator.tsx**

Rename the component to `DofSimulator`. Update all `dof-calculator` references to `dof-simulator` — the `useTranslations('toolUI.dof-simulator')` call, the `ToolActions` slug, and the `LearnPanel` slug.

Update import of `DOF_SCENE_PRESETS` from `dofCalculator` to use the new `DOF_SCENES` from `dofSimulator.ts`.

- [ ] **Step 4: Update i18n references**

Rename the `dof-calculator` key to `dof-simulator` in tool UI and education JSON files. Update `request.ts` accordingly.

- [ ] **Step 5: Update any test references**

Check if `dof-calculator` appears in any e2e tests or unit tests. Update references.

Run: `npm test -- --run && npm run lint`
Expected: All pass

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: rename dof-calculator to dof-simulator"
```

---

### Task 9: Build DOF Simulator WebGL viewport

**Files:**
- Create: `src/app/[locale]/dof-simulator/_components/shaders/passthrough.vert.ts`
- Create: `src/app/[locale]/dof-simulator/_components/shaders/dofBlur.frag.ts`
- Create: `src/app/[locale]/dof-simulator/_components/webglHelpers.ts`
- Create: `src/app/[locale]/dof-simulator/_components/useDofRenderer.ts`
- Create: `src/app/[locale]/dof-simulator/_components/DofViewport.tsx`
- Create: `src/app/[locale]/dof-simulator/_components/DofViewport.module.css`

- [ ] **Step 1: Create passthrough vertex shader**

Reuse the same pattern from exposure simulator. Create `src/app/[locale]/dof-simulator/_components/shaders/passthrough.vert.ts`:

```typescript
export const passthroughVertexShader = `#version 300 es
precision highp float;

layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_texCoord;
out vec2 v_texCoord;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
`
```

- [ ] **Step 2: Create DOF blur fragment shader**

Create `src/app/[locale]/dof-simulator/_components/shaders/dofBlur.frag.ts` — the main depth-of-field shader. This shader:
- Samples depth per-pixel from depth map texture
- Converts depth to world distance using near/far range uniforms
- Computes blur radius using the DOF formula
- Optionally applies diffraction limit (Airy disk)
- Performs separable Gaussian blur with variable radius

The shader is a more advanced version of the exposure simulator's DOF shader, with per-pixel depth map support and bokeh shape awareness via uniforms.

- [ ] **Step 3: Create WebGL helpers**

Create `src/app/[locale]/dof-simulator/_components/webglHelpers.ts` — copy and adapt from exposure simulator's `webglHelpers.ts`. Same functions: `compileShader`, `createProgram`, `createFramebuffer`, `loadImageAsTexture`, `setupFullScreenQuad`. Adjust the `GLResources` interface for DOF-specific needs (no motion program, add uniforms for DOF params).

- [ ] **Step 4: Create `useDofRenderer` hook**

Create `src/app/[locale]/dof-simulator/_components/useDofRenderer.ts` — follows the same pattern as `useExposureRenderer.ts`. Manages WebGL context, loads scene + depth map textures, and triggers re-render when camera settings change. Accepts: `canvasRef`, `scene` (DofScene), `focalLength`, `aperture`, `subjectDistance`, `sensorWidth`, `diffraction` boolean.

- [ ] **Step 5: Create DofViewport component**

Create `src/app/[locale]/dof-simulator/_components/DofViewport.tsx` — renders the WebGL canvas. Handles mouse hover for depth ruler tooltip (reads depth at cursor position). Manages canvas sizing with ResizeObserver.

- [ ] **Step 6: Create DofViewport CSS**

Create `src/app/[locale]/dof-simulator/_components/DofViewport.module.css`:
- Canvas fills container, border-radius 8px
- Depth ruler tooltip: positioned absolute, follows cursor, dark bg, mono font, shows distance + blur

- [ ] **Step 7: Verify it renders**

Run: `npm run dev`, navigate to `/dof-simulator`, verify the WebGL viewport renders a scene with depth-based blur.

- [ ] **Step 8: Commit**

```bash
git add src/app/[locale]/dof-simulator/_components/shaders/ src/app/[locale]/dof-simulator/_components/webglHelpers.ts src/app/[locale]/dof-simulator/_components/useDofRenderer.ts src/app/[locale]/dof-simulator/_components/DofViewport.tsx src/app/[locale]/dof-simulator/_components/DofViewport.module.css
git commit -m "feat(dof-simulator): add WebGL viewport with depth-mapped blur shader"
```

---

### Task 10: Build DOF Simulator control panels

**Files:**
- Rewrite: `src/app/[locale]/dof-simulator/_components/DoFSettingsPanel.tsx` → `DofSettingsPanel.tsx`
- Rewrite: `src/app/[locale]/dof-simulator/_components/DoFResultsPanel.tsx` → `DofResultsPanel.tsx`
- Create: `src/app/[locale]/dof-simulator/_components/FramingPanel.tsx`
- Create: `src/app/[locale]/dof-simulator/_components/BokehPanel.tsx`

- [ ] **Step 1: Rewrite DofSettingsPanel**

Replace the simple dropdowns with: FocalLengthField (logarithmic slider), ApertureField (with sweet spot), DistanceField (logarithmic), sensor dropdown, orientation toggle. Use ControlPanel wrapper. InfoTooltips on each label.

- [ ] **Step 2: Rewrite DofResultsPanel**

Expand beyond the 2x2 grid: add background blur (mm + %), CoC, isolation score (color-coded badge), diffraction warning. Keep the 2x2 grid for near/far/total/hyperfocal but add the new metrics below.

- [ ] **Step 3: Create FramingPanel**

Framing preset buttons (Face/Portrait/Medium/American/Full) + lock mode toggle (Constant FL / Constant Distance). When a preset is clicked, adjust either distance or focal length based on lock mode. Uses ModeToggle for lock mode.

- [ ] **Step 4: Create BokehPanel**

Collapsed by default (progressive disclosure). Contains: bokeh shape dropdown (`BOKEH_SHAPES`), diffraction toggle checkbox. When expanded, shows selected shape name.

- [ ] **Step 5: Verify panels render**

Run: `npm run dev`, check sidebar renders all panels with proper spacing and labels.

- [ ] **Step 6: Commit**

```bash
git add src/app/[locale]/dof-simulator/_components/
git commit -m "feat(dof-simulator): add settings, results, framing, and bokeh panels"
```

---

### Task 11: Build DOF Simulator toolbar and subject modes

**Files:**
- Create: `src/app/[locale]/dof-simulator/_components/DofToolbar.tsx`
- Create: `src/app/[locale]/dof-simulator/_components/SubjectFigure.tsx`
- Create: `src/app/[locale]/dof-simulator/_components/FocusTarget.tsx`

- [ ] **Step 1: Create DofToolbar**

Horizontal toolbar above viewport. Contains: scene picker (thumbnail strip using adapted ScenePicker), Figure/Target mode toggle (ModeToggle), Single/A|B toggle (ModeToggle, with Wipe/Split sub-toggle when A|B active), blur % readout.

- [ ] **Step 2: Create SubjectFigure**

The depth-layered figure overlay. Renders as SVG positioned over the WebGL canvas. 5 depth zones (nose, face, eyes, ears, body) with individually computed blur opacity/filter. Color-coded: amber for behind-focus, cyan for in-front, green for in-focus (eyes). Scales height based on field of view.

- [ ] **Step 3: Create FocusTarget**

Camera-style focus reticle as SVG overlay. Concentric circles + crosshair lines. Distance label. IN FOCUS / OUT OF FOCUS indicator based on whether the target is within the DOF range.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/dof-simulator/_components/
git commit -m "feat(dof-simulator): add toolbar, subject figure, and focus target overlays"
```

---

### Task 12: Build DOF diagram and blur profile graph

**Files:**
- Create: `src/app/[locale]/dof-simulator/_components/DofDiagramBar.tsx`
- Create: `src/app/[locale]/dof-simulator/_components/BlurProfileGraph.tsx`

- [ ] **Step 1: Create DofDiagramBar**

Enhanced version of the shared DoFDiagram but specifically for the DOF Simulator. Horizontal distance bar with: camera icon (left), subject marker (draggable, amber), green in-focus zone between near/far limits, distance scale labels (non-linear), infinity symbol at right end. When subject marker is dragged, updates the distance state.

- [ ] **Step 2: Create BlurProfileGraph**

Small SVG chart below the DOF diagram. X-axis = distance from camera (0 to 25m + infinity), Y-axis = blur amount. Renders a curve showing how blur changes with distance: high at close range, dips to zero at focus point, rises again behind subject. The sharp zone (where blur < CoC) is highlighted in green. Uses `calcBackgroundBlur` to compute points along the curve.

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/dof-simulator/_components/
git commit -m "feat(dof-simulator): add DOF diagram bar and blur profile graph"
```

---

### Task 13: Build A/B comparison mode

**Files:**
- Create: `src/app/[locale]/dof-simulator/_components/ABComparison.tsx`
- Create: `src/app/[locale]/dof-simulator/_components/ABComparison.module.css`

- [ ] **Step 1: Create ABComparison component**

Manages two sets of settings (A and B). Renders in two sub-modes:

**Wipe mode:** Single canvas, split by a draggable vertical divider. Left half renders with A uniforms, right half with B uniforms. This is implemented by rendering A to a framebuffer, then rendering B to a second framebuffer, then compositing both in a final pass using the divider position as the cutoff. Labels in corners.

**Split mode:** Two separate canvas elements side by side in a flex container with a 6px gap. Each renders independently. Results overlay in each corner.

- [ ] **Step 2: Create ABComparison CSS**

- Wipe divider: 3px amber line, centered grip handle (20x36px pill), cursor: col-resize
- Split: two canvases in flex with 6px gap
- Labels: positioned absolute, amber/cyan backgrounds with border

- [ ] **Step 3: Add A/B toggle to sidebar**

When A/B mode is active, show an A/B toggle at the top of the sidebar to select which settings set to edit. The non-active set is dimmed.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/dof-simulator/_components/
git commit -m "feat(dof-simulator): add A/B comparison with wipe and split modes"
```

---

### Task 14: Assemble DOF Simulator main component

**Files:**
- Rewrite: `src/app/[locale]/dof-simulator/_components/DofSimulator.tsx` (was DoFCalculator.tsx)
- Rewrite: `src/app/[locale]/dof-simulator/_components/DofSimulator.module.css` (was DoFCalculator.module.css)
- Update: `src/app/[locale]/dof-simulator/_components/querySync.ts`

- [ ] **Step 1: Rewrite main component**

Wire together all panels, toolbar, viewport, diagram, and blur profile. State management via `useState` for each setting. URL query sync via `useQueryInit` + `useToolQuerySync` with the full PARAM_SCHEMA from the spec. `useMemo` for computed values (DOF result, blur, isolation score). Layout uses the wider 320px sidebar.

- [ ] **Step 2: Rewrite layout CSS**

Based on existing `DoFCalculator.module.css` but with:
- `.sidebar` width changed from 280px to 320px
- New `.toolbar` section above viewport
- `.blurProfile` section below `.depthBar`
- Mobile responsive layout preserved

- [ ] **Step 3: Create querySync.ts**

Define `PARAM_SCHEMA` with all DOF Simulator URL params. B settings use `b_` prefix.

- [ ] **Step 4: Verify full tool works**

Run: `npm run dev`, navigate to `/dof-simulator`. Verify:
- All controls update the viewport
- DOF diagram and blur profile respond to setting changes
- Subject modes toggle
- A/B comparison works in both wipe and split
- Mobile layout works
- LearnPanel renders

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/dof-simulator/
git commit -m "feat(dof-simulator): assemble full simulator with all panels and viewport"
```

---

## Phase 3: Focus Stacking Calculator

### Task 15: Build Focus Stacking Calculator

**Files:**
- Create: `src/app/[locale]/focus-stacking-calculator/page.tsx`
- Create: `src/app/[locale]/focus-stacking-calculator/opengraph-image.tsx`
- Create: `src/app/[locale]/focus-stacking-calculator/_components/FocusStacking.tsx`
- Create: `src/app/[locale]/focus-stacking-calculator/_components/FocusStacking.module.css`
- Create: `src/app/[locale]/focus-stacking-calculator/_components/StackingSettingsPanel.tsx`
- Create: `src/app/[locale]/focus-stacking-calculator/_components/StackingResultsPanel.tsx`
- Create: `src/app/[locale]/focus-stacking-calculator/_components/StackingDiagram.tsx`
- Create: `src/app/[locale]/focus-stacking-calculator/_components/querySync.ts`

- [ ] **Step 1: Create page.tsx**

Follow the same pattern as existing tool pages — metadata from translations, render the main component.

- [ ] **Step 2: Create main component FocusStacking.tsx**

Standard sidebar + canvas layout (280px sidebar). State: focalLength, aperture, sensorId, nearLimit, farLimit, overlapPct. Compute stacking sequence via `calcStackingSequence`. URL sync with PARAM_SCHEMA.

- [ ] **Step 3: Create StackingSettingsPanel**

Camera panel: FocalLengthField, ApertureField, sensor dropdown. Depth Range panel: two DistanceField components (near/far limits), overlap percentage slider (10-50%).

- [ ] **Step 4: Create StackingResultsPanel**

Shot count, total depth, minimum overlap margin. "Copy to clipboard" button using `formatStackingExport`.

- [ ] **Step 5: Create StackingDiagram (SVG visualization)**

Horizontal SVG showing: camera icon left, distance axis right. Each shot as a colored band (using `--lens-a`, `--lens-b`, `--lens-c` colors cycling). Overlap zones in lighter shade. Shot numbers labeled. Near/far limit markers as dashed vertical lines. Scale labels on axis.

- [ ] **Step 6: Create layout CSS**

Follow `DoFCalculator.module.css` pattern exactly: sidebar + canvas area + mobile responsive. The diagram takes the place of the canvas — no WebGL here, just SVG.

- [ ] **Step 7: Create querySync.ts**

Define PARAM_SCHEMA for focus stacking URL params.

- [ ] **Step 8: Create opengraph-image.tsx**

Follow existing OG image pattern.

- [ ] **Step 9: Verify**

Run: `npm run dev`, navigate to `/focus-stacking-calculator`. Verify all controls, diagram, and results work.

- [ ] **Step 10: Commit**

```bash
git add src/app/[locale]/focus-stacking-calculator/
git commit -m "feat: add Focus Stacking Calculator tool"
```

---

## Phase 4: Equivalent Settings Calculator

### Task 16: Build Equivalent Settings Calculator

**Files:**
- Create: `src/app/[locale]/equivalent-settings-calculator/page.tsx`
- Create: `src/app/[locale]/equivalent-settings-calculator/opengraph-image.tsx`
- Create: `src/app/[locale]/equivalent-settings-calculator/_components/EquivalentSettings.tsx`
- Create: `src/app/[locale]/equivalent-settings-calculator/_components/EquivalentSettings.module.css`
- Create: `src/app/[locale]/equivalent-settings-calculator/_components/SourceSettingsPanel.tsx`
- Create: `src/app/[locale]/equivalent-settings-calculator/_components/TargetSensorPanel.tsx`
- Create: `src/app/[locale]/equivalent-settings-calculator/_components/EquivalenceCard.tsx`
- Create: `src/app/[locale]/equivalent-settings-calculator/_components/MiniDofDiagram.tsx`
- Create: `src/app/[locale]/equivalent-settings-calculator/_components/querySync.ts`

- [ ] **Step 1: Create page.tsx**

Standard page with metadata.

- [ ] **Step 2: Create main component EquivalentSettings.tsx**

Standard sidebar + content layout (280px sidebar). State: focalLength, aperture, distance, sensorId (source), targetSensorIds (Set of selected targets). Compute equivalent settings for each target via `calcEquivalentSettings`.

- [ ] **Step 3: Create SourceSettingsPanel**

Labeled "Your Camera". Contains FocalLengthField, ApertureField, DistanceField, sensor dropdown.

- [ ] **Step 4: Create TargetSensorPanel**

Labeled "Compare With". Multi-select checkboxes for each sensor in SENSORS (excluding the source sensor). Each checkbox shows sensor name + color dot.

- [ ] **Step 5: Create EquivalenceCard**

One card per selected target sensor. Shows:
- Target sensor name + color
- Equivalent FL, aperture, distance
- Warning badge if aperture < f/0.95 or FL out of range
- "Closest real" suggestion when equivalent is unrealistic
- Uses `closestRealAperture` and `closestRealFL` from data file

- [ ] **Step 6: Create MiniDofDiagram**

Small inline SVG comparing source vs target DOF — two overlapping horizontal bars showing they produce the same (or similar) DOF range. Compact version of DoFDiagram.

- [ ] **Step 7: Create layout CSS and querySync**

Same pattern as other tools.

- [ ] **Step 8: Create opengraph-image.tsx**

Standard OG image.

- [ ] **Step 9: Verify**

Run: `npm run dev`, navigate to `/equivalent-settings-calculator`. Check all controls, cards, and diagrams.

- [ ] **Step 10: Commit**

```bash
git add src/app/[locale]/equivalent-settings-calculator/
git commit -m "feat: add Equivalent Settings Calculator tool"
```

---

## Phase 5: Polish, Testing, and Cleanup

### Task 17: Update tools.json, add to smoke tests

**Files:**
- Modify: `src/lib/i18n/messages/en/tools.json` (add tool entries for nav/homepage)
- Modify: `src/e2e/smoke/all-pages.spec.ts` (add new tool routes)

- [ ] **Step 1: Add tool entries to tools.json**

Add `dof-simulator`, `focus-stacking-calculator`, and `equivalent-settings-calculator` entries with name and description for the nav mega-menu and homepage cards.

- [ ] **Step 2: Add routes to smoke tests**

The parameterized smoke test in `src/e2e/smoke/all-pages.spec.ts` should automatically pick up new tools from the registry. Verify by running:

Run: `npm run build && npm run test:e2e -- src/e2e/smoke/all-pages.spec.ts`
Expected: New tool pages pass smoke tests (200 status, no console errors, content renders)

- [ ] **Step 3: Commit**

```bash
git add src/lib/i18n/messages/en/tools.json src/e2e/smoke/all-pages.spec.ts
git commit -m "test: add new DOF tools to smoke tests and nav entries"
```

---

### Task 18: Clean up old dof-calculator references

**Files:**
- Search entire codebase for remaining `dof-calculator` references

- [ ] **Step 1: Find all remaining references**

```bash
grep -r "dof-calculator" src/ --include="*.ts" --include="*.tsx" --include="*.json" --include="*.css" -l
```

- [ ] **Step 2: Update each file**

Replace `dof-calculator` with `dof-simulator` everywhere except git history and comments. Pay special attention to:
- `tools.json` (nav descriptions)
- `glossary.json` (related tool references)
- Smoke test URLs
- Any hardcoded slugs

- [ ] **Step 3: Run full test suite**

Run: `npm run lint && npm test -- --run`
Expected: All pass

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: Clean build with no errors

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: clean up remaining dof-calculator references"
```

---

### Task 19: Create placeholder scene assets

**Files:**
- Create: `public/scenes/` directory with placeholder images

- [ ] **Step 1: Create scene directories**

```bash
mkdir -p public/scenes/thumbnails
```

- [ ] **Step 2: Create placeholder scene photos and depth maps**

For V1, create simple gradient images as placeholders for each of the 6 scenes. These will be replaced with real photographs and hand-painted depth maps before going live:

- `public/scenes/park-portrait.jpg` — solid green-ish color (1920x1080)
- `public/scenes/park-portrait-depth.png` — linear gradient white-to-black (same dimensions)
- Repeat for: street, landscape, cafe, architecture, macro
- Create 6 thumbnail versions (320x180)

Use a simple script or canvas-based generator to create these procedurally.

- [ ] **Step 3: Commit**

```bash
git add public/scenes/
git commit -m "feat: add placeholder scene assets for DOF simulator"
```

---

### Task 20: Final integration test

- [ ] **Step 1: Run full test suite**

Run: `npm test -- --run`
Expected: All unit tests pass

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: Clean build

- [ ] **Step 3: Run e2e tests**

Run: `npm run test:e2e`
Expected: All e2e tests pass including new tool smoke tests

- [ ] **Step 4: Manual verification**

Start dev server: `npm run dev`
Check each tool:
1. `/dof-simulator` — WebGL renders, all controls work, A/B mode, subject modes, DOF diagram, blur profile
2. `/focus-stacking-calculator` — stacking diagram renders, shot count updates, export works
3. `/equivalent-settings-calculator` — equivalence cards render, warnings show, mini diagrams work

- [ ] **Step 5: Final commit if needed**

```bash
git add -A
git commit -m "chore: final integration fixes for DOF tools suite"
```
