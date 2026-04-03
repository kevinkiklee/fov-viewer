import { describe, it, expect } from 'vitest'
import { APERTURES, SHUTTER_SPEEDS, ISOS } from './camera'

describe('APERTURES', () => {
  it('contains standard full-stop aperture values', () => {
    expect(APERTURES).toContain(1.4)
    expect(APERTURES).toContain(2.8)
    expect(APERTURES).toContain(5.6)
    expect(APERTURES).toContain(8)
    expect(APERTURES).toContain(16)
  })
  it('is sorted ascending (wider to narrower)', () => {
    for (let i = 1; i < APERTURES.length; i++) {
      expect(APERTURES[i]).toBeGreaterThan(APERTURES[i - 1])
    }
  })
  it('all values are positive', () => {
    for (const a of APERTURES) expect(a).toBeGreaterThan(0)
  })
})

describe('SHUTTER_SPEEDS', () => {
  it('is sorted descending (slowest to fastest)', () => {
    for (let i = 1; i < SHUTTER_SPEEDS.length; i++) {
      expect(SHUTTER_SPEEDS[i]).toBeLessThan(SHUTTER_SPEEDS[i - 1])
    }
  })
  it('includes common values', () => {
    expect(SHUTTER_SPEEDS).toContain(1)
    expect(SHUTTER_SPEEDS).toContain(30)
  })
  it('contains values for both slow and fast shutter', () => {
    expect(SHUTTER_SPEEDS[0]).toBeGreaterThanOrEqual(30)
    expect(SHUTTER_SPEEDS[SHUTTER_SPEEDS.length - 1]).toBeLessThanOrEqual(1 / 8000)
  })
  it('all values are positive', () => {
    for (const s of SHUTTER_SPEEDS) expect(s).toBeGreaterThan(0)
  })
})

describe('ISOS', () => {
  it('starts at 100', () => {
    expect(ISOS[0]).toBe(100)
  })
  it('each value doubles the previous (full stops)', () => {
    for (let i = 1; i < ISOS.length; i++) {
      expect(ISOS[i]).toBe(ISOS[i - 1] * 2)
    }
  })
  it('all values are positive integers', () => {
    for (const iso of ISOS) {
      expect(iso).toBeGreaterThan(0)
      expect(Number.isInteger(iso)).toBe(true)
    }
  })
})
