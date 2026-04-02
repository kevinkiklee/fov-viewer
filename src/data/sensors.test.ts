import { describe, it, expect } from 'vitest'
import { SENSORS, getSensor } from './sensors'

describe('SENSORS', () => {
  it('contains expected sensor types', () => {
    const ids = SENSORS.map((s) => s.id)
    expect(ids).toContain('ff')
    expect(ids).toContain('apsc_n')
    expect(ids).toContain('m43')
  })

  it('does not include smartphone', () => {
    const ids = SENSORS.map((s) => s.id)
    expect(ids).not.toContain('phone')
  })

  it('has full frame with crop factor 1.0', () => {
    const ff = SENSORS.find((s) => s.id === 'ff')!
    expect(ff.cropFactor).toBe(1.0)
    expect(ff.name).toBe('Full Frame')
  })

  it('all sensors have valid crop factors', () => {
    for (const sensor of SENSORS) {
      expect(sensor.cropFactor).toBeGreaterThan(0)
      expect(sensor.id).toBeTruthy()
      expect(sensor.name).toBeTruthy()
    }
  })

  it('sensors are ordered by crop factor ascending', () => {
    for (let i = 1; i < SENSORS.length; i++) {
      expect(SENSORS[i].cropFactor).toBeGreaterThanOrEqual(SENSORS[i - 1].cropFactor)
    }
  })

  it('has unique IDs', () => {
    const ids = SENSORS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('getSensor', () => {
  it('returns matching sensor by ID', () => {
    const ff = getSensor('ff')
    expect(ff.id).toBe('ff')
    expect(ff.cropFactor).toBe(1.0)
  })

  it('returns full frame as fallback for unknown ID', () => {
    const fallback = getSensor('nonexistent')
    expect(fallback.id).toBe('ff')
  })

  it('returns full frame for empty string', () => {
    expect(getSensor('').id).toBe('ff')
  })

  it('returns correct sensor for all known IDs', () => {
    for (const sensor of SENSORS) {
      const result = getSensor(sensor.id)
      expect(result).toEqual(sensor)
    }
  })
})
