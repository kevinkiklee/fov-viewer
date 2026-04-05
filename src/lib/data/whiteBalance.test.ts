import { describe, it, expect } from 'vitest'
import { WB_PRESETS, WB_SCENES } from './whiteBalance'

describe('WB_PRESETS', () => {
  it('has at least 5 presets', () => {
    expect(WB_PRESETS.length).toBeGreaterThanOrEqual(5)
  })
  it('all have name and valid kelvin range', () => {
    for (const p of WB_PRESETS) {
      expect(p.name).toBeTruthy()
      expect(p.kelvin).toBeGreaterThanOrEqual(1000)
      expect(p.kelvin).toBeLessThanOrEqual(15000)
    }
  })
  it('is sorted ascending by kelvin', () => {
    for (let i = 1; i < WB_PRESETS.length; i++) {
      expect(WB_PRESETS[i].kelvin).toBeGreaterThanOrEqual(WB_PRESETS[i - 1].kelvin)
    }
  })
  it('names are unique', () => {
    const names = WB_PRESETS.map(p => p.name)
    expect(new Set(names).size).toBe(names.length)
  })
  it('includes common lighting conditions (by kelvin)', () => {
    const kelvins = WB_PRESETS.map(p => p.kelvin)
    expect(kelvins).toContain(5500) // Daylight
    expect(kelvins).toContain(2700) // Tungsten
    expect(kelvins.some(k => k === 6500 || k === 7500)).toBe(true) // Cloudy or Shade
  })
})

describe('WB_SCENES', () => {
  it('has at least 3 scenes', () => {
    expect(WB_SCENES.length).toBeGreaterThanOrEqual(3)
  })
  it('all have id, label, and src pointing to /images/', () => {
    for (const s of WB_SCENES) {
      expect(s.id).toBeTruthy()
      expect(s.label).toBeTruthy()
      expect(s.src).toMatch(/^\/images\//)
    }
  })
  it('IDs are unique', () => {
    const ids = WB_SCENES.map(s => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
