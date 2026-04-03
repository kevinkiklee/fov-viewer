import { describe, it, expect } from 'vitest'
import { BASE_SHUTTER_SPEEDS, ND_FILTERS, TABLE_FILTERS } from './ndFilters'

describe('BASE_SHUTTER_SPEEDS', () => {
  it('all have label and positive value', () => {
    for (const s of BASE_SHUTTER_SPEEDS) {
      expect(s.label).toBeTruthy()
      expect(s.value).toBeGreaterThan(0)
    }
  })
  it('is sorted ascending by value (fastest to slowest)', () => {
    for (let i = 1; i < BASE_SHUTTER_SPEEDS.length; i++) {
      expect(BASE_SHUTTER_SPEEDS[i].value).toBeGreaterThan(BASE_SHUTTER_SPEEDS[i - 1].value)
    }
  })
  it('labels are unique', () => {
    const labels = BASE_SHUTTER_SPEEDS.map(s => s.label)
    expect(new Set(labels).size).toBe(labels.length)
  })
})

describe('ND_FILTERS', () => {
  it('all have label, factor, and stops', () => {
    for (const f of ND_FILTERS) {
      expect(f.label).toBeTruthy()
      expect(f.factor).toBeGreaterThan(0)
      expect(f.stops).toBeGreaterThan(0)
    }
  })
  it('factor equals 2^stops', () => {
    for (const f of ND_FILTERS) {
      expect(f.factor).toBe(Math.pow(2, f.stops))
    }
  })
  it('is sorted ascending by stops', () => {
    for (let i = 1; i < ND_FILTERS.length; i++) {
      expect(ND_FILTERS[i].stops).toBeGreaterThan(ND_FILTERS[i - 1].stops)
    }
  })
})

describe('TABLE_FILTERS', () => {
  it('contains only 3, 6, and 10 stop filters', () => {
    const stops = TABLE_FILTERS.map(f => f.stops)
    expect(stops).toEqual([3, 6, 10])
  })
  it('is a subset of ND_FILTERS', () => {
    for (const tf of TABLE_FILTERS) {
      expect(ND_FILTERS).toContainEqual(tf)
    }
  })
})
