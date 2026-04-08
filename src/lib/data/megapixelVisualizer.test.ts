import { describe, it, expect } from 'vitest'
import {
  MP_PRESETS, ALL_MP_ID_SET, DEFAULT_VISIBLE_MP_IDS,
  DPI_PRESETS, DEFAULT_DPI,
  PRINT_SIZES_METRIC, PRINT_SIZES_IMPERIAL,
  CROP_TARGETS, PHONE_BINNING, BIT_DEPTHS,
} from './megapixelVisualizer'

describe('MP_PRESETS', () => {
  it('contains at least 10 entries', () => {
    expect(MP_PRESETS.length).toBeGreaterThanOrEqual(10)
  })
  it('is sorted ascending by mp', () => {
    for (let i = 1; i < MP_PRESETS.length; i++) {
      expect(MP_PRESETS[i].mp).toBeGreaterThan(MP_PRESETS[i - 1].mp)
    }
  })
  it('all ids are unique', () => {
    const ids = MP_PRESETS.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('all ids match mp_<N> format', () => {
    for (const p of MP_PRESETS) expect(p.id).toBe(`mp_${p.mp}`)
  })
  it('all have valid hex color', () => {
    for (const p of MP_PRESETS) expect(p.color).toMatch(/^#[0-9a-f]{6}$/i)
  })
  it('includes 12, 24, 45, 100 (defaults)', () => {
    const mps = MP_PRESETS.map(p => p.mp)
    expect(mps).toEqual(expect.arrayContaining([12, 24, 45, 100]))
  })
})

describe('DEFAULT_VISIBLE_MP_IDS', () => {
  it('all default ids exist in MP_PRESETS', () => {
    for (const id of DEFAULT_VISIBLE_MP_IDS) {
      expect(ALL_MP_ID_SET.has(id)).toBe(true)
    }
  })
})

describe('DPI_PRESETS', () => {
  it('contains 72, 150, 240, 300 at minimum', () => {
    const values = DPI_PRESETS.map(d => d.value)
    expect(values).toEqual(expect.arrayContaining([72, 150, 240, 300]))
  })
})

describe('DEFAULT_DPI', () => {
  it('is 300', () => {
    expect(DEFAULT_DPI).toBe(300)
  })
})

describe('PRINT_SIZES_METRIC', () => {
  it('contains A0 through A6', () => {
    const ids = PRINT_SIZES_METRIC.map(p => p.id)
    for (const id of ['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6']) {
      expect(ids).toContain(id)
    }
  })
  it('A4 is 210×297 mm', () => {
    const a4 = PRINT_SIZES_METRIC.find(p => p.id === 'a4')!
    expect(a4.wMm).toBe(210)
    expect(a4.hMm).toBe(297)
  })
})

describe('PRINT_SIZES_IMPERIAL', () => {
  it('contains 8×10', () => {
    expect(PRINT_SIZES_IMPERIAL.find(p => p.id === '8x10')).toBeDefined()
  })
})

describe('CROP_TARGETS', () => {
  it('excludes ff', () => {
    expect(CROP_TARGETS.find(c => c.id === 'ff')).toBeUndefined()
  })
  it('includes apsc_n', () => {
    expect(CROP_TARGETS.find(c => c.id === 'apsc_n')).toBeDefined()
  })
})

describe('PHONE_BINNING', () => {
  it('48 → 12', () => { expect(PHONE_BINNING[48]).toBe(12) })
  it('200 → 12', () => { expect(PHONE_BINNING[200]).toBe(12) })
})

describe('BIT_DEPTHS', () => {
  it('contains jpeg8, raw14, tiff16', () => {
    const ids = BIT_DEPTHS.map(b => b.id)
    expect(ids).toEqual(expect.arrayContaining(['jpeg8', 'raw14', 'tiff16']))
  })
})
