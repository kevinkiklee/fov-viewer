import { describe, it, expect } from 'vitest'
import { OVERLAP_PRESETS, formatStackingExport } from './focusStacking'

describe('OVERLAP_PRESETS', () => {
  it('is non-empty', () => {
    expect(OVERLAP_PRESETS.length).toBeGreaterThan(0)
  })
  it('all have a numeric value between 0 and 1 exclusive', () => {
    for (const preset of OVERLAP_PRESETS) {
      expect(preset.value).toBeGreaterThan(0)
      expect(preset.value).toBeLessThan(1)
    }
  })
  it('all have non-empty label strings', () => {
    for (const preset of OVERLAP_PRESETS) {
      expect(preset.label).toBeTruthy()
      expect(typeof preset.label).toBe('string')
      expect(preset.label.length).toBeGreaterThan(0)
    }
  })
  it('has no duplicate values', () => {
    const values = OVERLAP_PRESETS.map((p) => p.value)
    expect(new Set(values).size).toBe(values.length)
  })
  it('is sorted by ascending overlap value', () => {
    for (let i = 1; i < OVERLAP_PRESETS.length; i++) {
      expect(OVERLAP_PRESETS[i].value).toBeGreaterThan(OVERLAP_PRESETS[i - 1].value)
    }
  })
  it('includes the recommended 20% overlap', () => {
    const recommended = OVERLAP_PRESETS.find((p) => p.value === 0.2)
    expect(recommended).toBeDefined()
    expect(recommended!.label).toContain('recommended')
  })
  it('labels include the percentage matching the value', () => {
    for (const preset of OVERLAP_PRESETS) {
      const pct = `${preset.value * 100}%`
      expect(preset.label).toContain(pct)
    }
  })
})

describe('formatStackingExport', () => {
  it('includes focal length, aperture, and sensor name in the header', () => {
    const result = formatStackingExport(100, 8, 'Full Frame', [
      { number: 1, focusDistance: 2 },
    ])
    expect(result).toContain('100mm')
    expect(result).toContain('f/8')
    expect(result).toContain('Full Frame')
    expect(result).toContain('Focus Stacking Sequence')
  })

  it('formats distances >= 1 in meters', () => {
    const result = formatStackingExport(50, 5.6, 'APS-C', [
      { number: 1, focusDistance: 2.5 },
      { number: 2, focusDistance: 10 },
    ])
    expect(result).toContain('1. 2.50 m')
    expect(result).toContain('2. 10.00 m')
  })

  it('formats distances < 1 in centimeters', () => {
    const result = formatStackingExport(50, 5.6, 'APS-C', [
      { number: 1, focusDistance: 0.3 },
      { number: 2, focusDistance: 0.15 },
    ])
    expect(result).toContain('1. 30 cm')
    expect(result).toContain('2. 15 cm')
  })

  it('returns header followed by numbered lines', () => {
    const shots = [
      { number: 1, focusDistance: 0.5 },
      { number: 2, focusDistance: 1.0 },
      { number: 3, focusDistance: 2.0 },
    ]
    const result = formatStackingExport(85, 11, 'Micro 4/3', shots)
    const lines = result.split('\n')
    expect(lines).toHaveLength(4) // 1 header + 3 shots
    expect(lines[0]).toContain('Focus Stacking Sequence')
    expect(lines[1]).toMatch(/^1\./)
    expect(lines[2]).toMatch(/^2\./)
    expect(lines[3]).toMatch(/^3\./)
  })

  it('handles empty shots array', () => {
    const result = formatStackingExport(50, 8, 'Full Frame', [])
    const lines = result.split('\n')
    expect(lines).toHaveLength(1) // header only
    expect(lines[0]).toContain('Focus Stacking Sequence')
  })

  it('handles boundary distance at exactly 1 meter', () => {
    const result = formatStackingExport(50, 8, 'FF', [
      { number: 1, focusDistance: 1.0 },
    ])
    // 1.0 >= 1, so it should be formatted in meters
    expect(result).toContain('1. 1.00 m')
  })

  it('handles very small distances', () => {
    const result = formatStackingExport(100, 2.8, 'FF', [
      { number: 1, focusDistance: 0.05 },
    ])
    expect(result).toContain('1. 5 cm')
  })
})
