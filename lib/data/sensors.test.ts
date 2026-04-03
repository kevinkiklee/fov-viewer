import { describe, it, expect } from 'vitest'
import { SENSORS, getSensor, POPULAR_MODELS, COMMON_MP } from './sensors'

describe('SENSORS', () => {
  it('contains 9 sensors', () => { expect(SENSORS).toHaveLength(9) })
  it('all have valid crop factors > 0', () => {
    for (const s of SENSORS) {
      expect(s.cropFactor).toBeGreaterThan(0)
      expect(s.id).toBeTruthy()
      expect(s.name).toBeTruthy()
    }
  })
  it('all have physical dimensions (w, h) in mm', () => {
    for (const s of SENSORS) {
      expect(s.w).toBeGreaterThan(0)
      expect(s.h).toBeGreaterThan(0)
      expect(s.w).toBeGreaterThan(s.h) // landscape orientation
    }
  })
  it('all have a display color', () => {
    for (const s of SENSORS) {
      expect(s.color).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
  it('has unique IDs', () => {
    const ids = SENSORS.map(s => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('is sorted by ascending crop factor', () => {
    for (let i = 1; i < SENSORS.length; i++) {
      expect(SENSORS[i].cropFactor).toBeGreaterThanOrEqual(SENSORS[i-1].cropFactor)
    }
  })
  it('has full frame with crop factor 1.0', () => {
    const ff = SENSORS.find(s => s.id === 'ff')
    expect(ff?.cropFactor).toBe(1.0)
  })
  it('includes medium format, APS-C, micro four thirds, 1-inch, and phone', () => {
    const ids = SENSORS.map(s => s.id)
    expect(ids).toContain('mf')
    expect(ids).toContain('ff')
    expect(ids).toContain('apsc_n')
    expect(ids).toContain('m43')
    expect(ids).toContain('1in')
    expect(ids).toContain('phone')
  })
  it('full frame is larger than APS-C which is larger than M43', () => {
    const ff = SENSORS.find(s => s.id === 'ff')!
    const apsc = SENSORS.find(s => s.id === 'apsc_n')!
    const m43 = SENSORS.find(s => s.id === 'm43')!
    expect(ff.w!).toBeGreaterThan(apsc.w!)
    expect(apsc.w!).toBeGreaterThan(m43.w!)
  })
})

describe('getSensor', () => {
  it('returns matching sensor', () => {
    expect(getSensor('ff').cropFactor).toBe(1.0)
    expect(getSensor('apsc_n').cropFactor).toBe(1.5)
  })
  it('falls back to full frame for unknown ID', () => {
    expect(getSensor('unknown').id).toBe('ff')
  })
  it('falls back for empty string', () => {
    expect(getSensor('').id).toBe('ff')
  })
  it('returns all sensor types correctly', () => {
    for (const s of SENSORS) {
      expect(getSensor(s.id).id).toBe(s.id)
    }
  })
})

describe('POPULAR_MODELS', () => {
  it('has entries for every sensor', () => {
    for (const s of SENSORS) {
      expect(POPULAR_MODELS[s.id]).toBeDefined()
      expect(POPULAR_MODELS[s.id].length).toBeGreaterThan(0)
    }
  })
})

describe('COMMON_MP', () => {
  it('has entries for every sensor', () => {
    for (const s of SENSORS) {
      expect(COMMON_MP[s.id]).toBeDefined()
      expect(COMMON_MP[s.id].length).toBeGreaterThan(0)
    }
  })
  it('megapixel values are positive and sorted ascending per sensor', () => {
    for (const entries of Object.values(COMMON_MP)) {
      for (let i = 0; i < entries.length; i++) {
        expect(entries[i].mp).toBeGreaterThan(0)
        if (i > 0) expect(entries[i].mp).toBeGreaterThan(entries[i-1].mp)
      }
    }
  })
})
