import { describe, it, expect } from 'vitest'
import { calcHyperfocal, calcDoF } from './dof'

describe('calcHyperfocal', () => {
  it('calculates hyperfocal for 50mm f/2.8 FF (coc=0.03)', () => {
    // H = (50^2 / (2.8 * 0.03)) + 50 = (2500 / 0.084) + 50 ≈ 29762 mm ≈ 29.76 m
    const H = calcHyperfocal(50, 2.8, 0.03)
    expect(H).toBeCloseTo(29.81, 0)
  })

  it('calculates hyperfocal for 24mm f/8 FF (coc=0.03)', () => {
    // H = (576 / (8 * 0.03)) + 24 = (576 / 0.24) + 24 = 2400 + 24 = 2424 mm = 2.424 m
    const H = calcHyperfocal(24, 8, 0.03)
    expect(H).toBeCloseTo(2.424, 2)
  })

  it('wider aperture produces greater hyperfocal distance', () => {
    const H_wide = calcHyperfocal(50, 1.8, 0.03)
    const H_narrow = calcHyperfocal(50, 11, 0.03)
    expect(H_wide).toBeGreaterThan(H_narrow)
  })

  it('longer focal length produces greater hyperfocal distance', () => {
    const H_long = calcHyperfocal(200, 8, 0.03)
    const H_short = calcHyperfocal(24, 8, 0.03)
    expect(H_long).toBeGreaterThan(H_short)
  })
})

describe('calcDoF', () => {
  it('calculates near/far focus for 50mm f/2.8 at 3m FF', () => {
    const result = calcDoF({ focalLength: 50, aperture: 2.8, distance: 3, coc: 0.03 })
    expect(result.nearFocus).toBeGreaterThan(0)
    expect(result.farFocus).toBeGreaterThan(result.nearFocus)
    expect(result.totalDoF).toBeCloseTo(result.farFocus - result.nearFocus, 5)
    expect(result.nearFocus).toBeCloseTo(2.73, 1)
    expect(result.farFocus).toBeCloseTo(3.32, 1)
  })

  it('returns Infinity for far focus when distance >= hyperfocal', () => {
    // 24mm f/8 hyperfocal ≈ 2.4m, so distance=3 is past hyperfocal
    const result = calcDoF({ focalLength: 24, aperture: 8, distance: 3, coc: 0.03 })
    expect(result.farFocus).toBe(Infinity)
    expect(result.totalDoF).toBe(Infinity)
  })

  it('returns Infinity for far focus exactly at hyperfocal distance', () => {
    const H = calcHyperfocal(50, 2.8, 0.03)
    const result = calcDoF({ focalLength: 50, aperture: 2.8, distance: H, coc: 0.03 })
    expect(result.farFocus).toBe(Infinity)
  })

  it('wider aperture produces shallower DoF', () => {
    const shallow = calcDoF({ focalLength: 85, aperture: 1.4, distance: 5, coc: 0.03 })
    const deep = calcDoF({ focalLength: 85, aperture: 11, distance: 5, coc: 0.03 })
    expect(shallow.totalDoF).toBeLessThan(deep.totalDoF as number)
  })

  it('longer focal length produces shallower DoF at same distance', () => {
    const tele = calcDoF({ focalLength: 200, aperture: 5.6, distance: 10, coc: 0.03 })
    const wide = calcDoF({ focalLength: 35, aperture: 5.6, distance: 10, coc: 0.03 })
    expect(tele.totalDoF).toBeLessThan(wide.totalDoF as number)
  })

  it('closer distance produces shallower DoF', () => {
    const close = calcDoF({ focalLength: 50, aperture: 2.8, distance: 1, coc: 0.03 })
    const far = calcDoF({ focalLength: 50, aperture: 2.8, distance: 5, coc: 0.03 })
    expect(close.totalDoF).toBeLessThan(far.totalDoF as number)
  })

  it('reports hyperfocal distance in result', () => {
    const result = calcDoF({ focalLength: 50, aperture: 2.8, distance: 3, coc: 0.03 })
    const H = calcHyperfocal(50, 2.8, 0.03)
    expect(result.hyperfocal).toBeCloseTo(H, 5)
  })

  it('near focus is always less than subject distance', () => {
    const result = calcDoF({ focalLength: 50, aperture: 5.6, distance: 5, coc: 0.03 })
    expect(result.nearFocus).toBeLessThan(5)
  })

  it('handles very close focus distance (macro: 0.1m with 50mm lens)', () => {
    const result = calcDoF({ focalLength: 50, aperture: 2.8, distance: 0.1, coc: 0.03 })
    expect(result.nearFocus).toBeGreaterThan(0)
    expect(result.nearFocus).toBeLessThan(0.1)
    expect(result.farFocus).toBeGreaterThan(0.1)
    // Macro distances produce extremely shallow DoF
    expect(result.totalDoF).toBeLessThan(0.01)
  })

  it('handles very wide aperture (f/1.0)', () => {
    const result = calcDoF({ focalLength: 50, aperture: 1.0, distance: 3, coc: 0.03 })
    expect(result.nearFocus).toBeGreaterThan(0)
    expect(result.farFocus).toBeGreaterThan(result.nearFocus)
    // f/1.0 should produce shallower DoF than f/2.8 at the same distance
    const refResult = calcDoF({ focalLength: 50, aperture: 2.8, distance: 3, coc: 0.03 })
    expect(result.totalDoF).toBeLessThan(refResult.totalDoF as number)
  })

  it('handles very small CoC (0.001mm)', () => {
    const result = calcDoF({ focalLength: 50, aperture: 8, distance: 5, coc: 0.001 })
    expect(result.nearFocus).toBeGreaterThan(0)
    expect(result.farFocus).toBeGreaterThan(result.nearFocus)
    // Tiny CoC means much larger hyperfocal distance and shallower DoF
    const refResult = calcDoF({ focalLength: 50, aperture: 8, distance: 5, coc: 0.03 })
    expect(result.totalDoF).toBeLessThan(refResult.totalDoF as number)
    expect(result.hyperfocal).toBeGreaterThan(refResult.hyperfocal)
  })

  it('focus at exactly hyperfocal yields Infinity far focus', () => {
    // Compute hyperfocal first, then focus at that exact distance
    const H = calcHyperfocal(85, 4, 0.03)
    const result = calcDoF({ focalLength: 85, aperture: 4, distance: H, coc: 0.03 })
    expect(result.farFocus).toBe(Infinity)
    expect(result.totalDoF).toBe(Infinity)
    // Near focus should be approximately half the hyperfocal distance
    expect(result.nearFocus).toBeCloseTo(H / 2, 0)
  })
})
