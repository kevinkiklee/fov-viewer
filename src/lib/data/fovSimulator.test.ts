import { describe, it, expect } from 'vitest'
import {
  LENS_COLORS, LENS_LABELS, MAX_LENSES, DEFAULT_FOV_STATE, DISTANCE_PRESETS, NEW_LENS_DEFAULTS,
} from './fovSimulator'

describe('lens constants', () => {
  it('LENS_COLORS, LENS_LABELS, and MAX_LENSES are consistent', () => {
    expect(LENS_COLORS).toHaveLength(MAX_LENSES)
    expect(LENS_LABELS).toHaveLength(MAX_LENSES)
  })

  it('all lens colors are valid hex strings', () => {
    for (const c of LENS_COLORS) {
      expect(c).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})

describe('DEFAULT_FOV_STATE', () => {
  it('starts with 2 lenses', () => {
    expect(DEFAULT_FOV_STATE.lenses).toHaveLength(2)
  })

  it('all lenses have positive focal length and valid sensor ID', () => {
    for (const lens of DEFAULT_FOV_STATE.lenses) {
      expect(lens.focalLength).toBeGreaterThan(0)
      expect(lens.sensorId).toBeTruthy()
    }
  })

  it('defaults to landscape orientation', () => {
    expect(DEFAULT_FOV_STATE.orientation).toBe('landscape')
  })
})

describe('DISTANCE_PRESETS', () => {
  it('are all positive and sorted ascending', () => {
    for (let i = 0; i < DISTANCE_PRESETS.length; i++) {
      expect(DISTANCE_PRESETS[i]).toBeGreaterThan(0)
      if (i > 0) expect(DISTANCE_PRESETS[i]).toBeGreaterThan(DISTANCE_PRESETS[i - 1])
    }
  })
})

describe('NEW_LENS_DEFAULTS', () => {
  it('has entries for adding lenses', () => {
    expect(NEW_LENS_DEFAULTS.length).toBeGreaterThan(0)
  })

  it('all have positive focal length', () => {
    for (const lens of NEW_LENS_DEFAULTS) {
      expect(lens.focalLength).toBeGreaterThan(0)
      expect(lens.sensorId).toBeTruthy()
    }
  })
})
