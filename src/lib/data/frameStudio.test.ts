import { describe, it, expect } from 'vitest'
import {
  ASPECT_RATIOS, DEFAULT_GRID_OPTIONS, GRID_TYPES, PALETTE_COLORS,
  DEFAULT_FRAME_CONFIG, FRAME_PRESETS, PRESET_LIST, FILL_TYPES,
  GRADIENT_DIRS, TEXTURES, MODE_KEYS,
} from './frameStudio'

describe('ASPECT_RATIOS', () => {
  it('contains 8 entries', () => {
    expect(ASPECT_RATIOS).toHaveLength(8)
  })

  it('all have non-empty labels', () => {
    for (const ar of ASPECT_RATIOS) {
      expect(ar.label).toBeTruthy()
    }
  })

  it('numeric ratios have correct w/h proportion', () => {
    for (const ar of ASPECT_RATIOS) {
      if (typeof ar.value === 'number') {
        expect(ar.value).toBeCloseTo(ar.w / ar.h, 5)
      }
    }
  })
})

describe('GRID_TYPES', () => {
  it('contains 8 grid types', () => {
    expect(GRID_TYPES).toHaveLength(8)
  })

  it('IDs are unique', () => {
    const ids = GRID_TYPES.map(g => g.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all have non-empty key', () => {
    for (const g of GRID_TYPES) {
      expect(g.key).toBeTruthy()
    }
  })
})

describe('PALETTE_COLORS', () => {
  it('all are valid hex color strings', () => {
    for (const c of PALETTE_COLORS) {
      expect(c).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})

describe('DEFAULT_FRAME_CONFIG', () => {
  it('has non-negative border width', () => {
    expect(DEFAULT_FRAME_CONFIG.borderWidth).toBeGreaterThanOrEqual(0)
  })

  it('has valid hex colors', () => {
    expect(DEFAULT_FRAME_CONFIG.solidColor).toMatch(/^#[0-9a-f]{6}$/i)
    expect(DEFAULT_FRAME_CONFIG.gradientColor1).toMatch(/^#[0-9a-f]{6}$/i)
    expect(DEFAULT_FRAME_CONFIG.gradientColor2).toMatch(/^#[0-9a-f]{6}$/i)
    expect(DEFAULT_FRAME_CONFIG.innerMatColor).toMatch(/^#[0-9a-f]{6}$/i)
    expect(DEFAULT_FRAME_CONFIG.shadowColor).toMatch(/^#[0-9a-f]{6}$/i)
  })
})

describe('FRAME_PRESETS', () => {
  it('has entries for none, white, black, and custom', () => {
    expect(FRAME_PRESETS.none).toBeDefined()
    expect(FRAME_PRESETS.white).toBeDefined()
    expect(FRAME_PRESETS.black).toBeDefined()
    expect(FRAME_PRESETS.custom).toBeDefined()
  })
})

describe('PRESET_LIST', () => {
  it('IDs match FRAME_PRESETS keys', () => {
    for (const p of PRESET_LIST) {
      expect(FRAME_PRESETS[p.id]).toBeDefined()
    }
  })
})

describe('FILL_TYPES', () => {
  it('contains 3 fill types', () => {
    expect(FILL_TYPES).toHaveLength(3)
  })

  it('IDs are unique', () => {
    const ids = FILL_TYPES.map(f => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('GRADIENT_DIRS', () => {
  it('contains 7 gradient directions', () => {
    expect(GRADIENT_DIRS).toHaveLength(7)
  })
})

describe('TEXTURES', () => {
  it('contains 6 textures', () => {
    expect(TEXTURES).toHaveLength(6)
  })

  it('IDs are unique', () => {
    const ids = TEXTURES.map(t => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('MODE_KEYS', () => {
  it('contains view, crop, and frame modes', () => {
    const values = MODE_KEYS.map(m => m.value)
    expect(values).toContain('view')
    expect(values).toContain('crop')
    expect(values).toContain('frame')
  })
})

describe('DEFAULT_GRID_OPTIONS', () => {
  it('has valid opacity range (0-1)', () => {
    expect(DEFAULT_GRID_OPTIONS.opacity).toBeGreaterThanOrEqual(0)
    expect(DEFAULT_GRID_OPTIONS.opacity).toBeLessThanOrEqual(1)
  })

  it('has valid hex color', () => {
    expect(DEFAULT_GRID_OPTIONS.color).toMatch(/^#[0-9a-f]{6}$/i)
  })
})
