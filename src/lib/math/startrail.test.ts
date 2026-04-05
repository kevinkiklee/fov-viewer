import { describe, it, expect } from 'vitest'
import { rule500, ruleNPF, stackingTime, formatDuration } from './startrail'

describe('rule500', () => {
  it('24mm on FF (1x) gives ~20.8s', () => {
    expect(rule500(24, 1.0)).toBeCloseTo(20.83, 1)
  })

  it('50mm on FF gives 10s', () => {
    expect(rule500(50, 1.0)).toBeCloseTo(10, 5)
  })

  it('24mm on APS-C (1.5x) gives shorter exposure', () => {
    const ff = rule500(24, 1.0)
    const apsc = rule500(24, 1.5)
    expect(apsc).toBeLessThan(ff)
    expect(apsc).toBeCloseTo(500 / 36, 1)
  })

  it('longer focal length gives shorter max exposure', () => {
    expect(rule500(200, 1.0)).toBeLessThan(rule500(24, 1.0))
  })
})

describe('ruleNPF', () => {
  it('returns a reasonable value for typical astro setup', () => {
    // 24mm f/2.8, 6µm pitch FF sensor
    const result = ruleNPF(2.8, 24, 6.0)
    // (35*2.8 + 30*6) / 24 = (98 + 180) / 24 = 278/24 ≈ 11.58s
    expect(result).toBeCloseTo(11.58, 1)
  })

  it('wider aperture allows longer exposure', () => {
    const f14 = ruleNPF(1.4, 24, 6.0)
    const f28 = ruleNPF(2.8, 24, 6.0)
    expect(f14).toBeLessThan(f28)
  })

  it('longer focal length requires shorter exposure', () => {
    const wide = ruleNPF(2.8, 24, 6.0)
    const tele = ruleNPF(2.8, 50, 6.0)
    expect(tele).toBeLessThan(wide)
  })
})

describe('stackingTime', () => {
  it('100 frames at 30s with 2s gap = 3200s total', () => {
    expect(stackingTime(30, 100, 2)).toBe(3200)
  })

  it('50 frames at 60s with 0s gap = 3000s', () => {
    expect(stackingTime(60, 50, 0)).toBe(3000)
  })

  it('1 frame returns exposure + gap', () => {
    expect(stackingTime(25, 1, 5)).toBe(30)
  })
})

describe('formatDuration', () => {
  it('formats 3200s as "53m 20s"', () => {
    expect(formatDuration(3200)).toBe('53m 20s')
  })

  it('formats 3600s as "1h"', () => {
    expect(formatDuration(3600)).toBe('1h')
  })

  it('formats 3660s as "1h 1m"', () => {
    expect(formatDuration(3660)).toBe('1h 1m')
  })

  it('formats 120s as "2m"', () => {
    expect(formatDuration(120)).toBe('2m')
  })

  it('formats 90s as "1m 30s"', () => {
    expect(formatDuration(90)).toBe('1m 30s')
  })

  it('formats 7200s as "2h"', () => {
    expect(formatDuration(7200)).toBe('2h')
  })

  it('formats 0s as "0m"', () => {
    expect(formatDuration(0)).toBe('0m')
  })
})

describe('rule500 edge cases', () => {
  it('zero focal length returns Infinity (division by zero)', () => {
    expect(rule500(0, 1)).toBe(Infinity)
  })
})

describe('ruleNPF edge cases', () => {
  it('very small focal length returns a very large max exposure', () => {
    // 1mm focal length should produce a very long max exposure
    const result = ruleNPF(2.8, 1, 6.0)
    // (35*2.8 + 30*6) / 1 = 98 + 180 = 278
    expect(result).toBeCloseTo(278, 0)
    expect(result).toBeGreaterThan(100)
  })
})

describe('stackingTime edge cases', () => {
  it('all zeros returns 0', () => {
    expect(stackingTime(0, 0, 0)).toBe(0)
  })
})
