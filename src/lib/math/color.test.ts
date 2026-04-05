import { describe, it, expect } from 'vitest'
import {
  kelvinToRgb,
  hslToRgb,
  rgbToHsl,
  complementary,
  analogous,
  triadic,
  splitComplementary,
  tetradic,
} from './color'

describe('kelvinToRgb', () => {
  it('6500K (daylight) is close to white', () => {
    const { r, g, b } = kelvinToRgb(6500)
    expect(r).toBeGreaterThan(200)
    expect(g).toBeGreaterThan(200)
    expect(b).toBeGreaterThan(200)
  })

  it('2700K (warm/incandescent) has high red, low blue', () => {
    const { r, b } = kelvinToRgb(2700)
    expect(r).toBe(255)
    expect(b).toBeLessThan(100)
    expect(r).toBeGreaterThan(b)
  })

  it('10000K (overcast/blue) has high blue component', () => {
    const { r, b } = kelvinToRgb(10000)
    expect(b).toBe(255)
    expect(r).toBeLessThan(b)
  })

  it('all values are in 0-255 range', () => {
    for (const k of [1000, 3000, 5500, 6500, 10000, 40000]) {
      const { r, g, b } = kelvinToRgb(k)
      expect(r).toBeGreaterThanOrEqual(0)
      expect(r).toBeLessThanOrEqual(255)
      expect(g).toBeGreaterThanOrEqual(0)
      expect(g).toBeLessThanOrEqual(255)
      expect(b).toBeGreaterThanOrEqual(0)
      expect(b).toBeLessThanOrEqual(255)
    }
  })

  it('higher temperature shifts toward blue', () => {
    const warm = kelvinToRgb(3000)
    const cool = kelvinToRgb(8000)
    expect(cool.b).toBeGreaterThan(warm.b)
  })

  it('1000K (minimum boundary) produces valid warm RGB', () => {
    const { r, g, b } = kelvinToRgb(1000)
    expect(r).toBe(255)
    expect(b).toBe(0) // temp/100 = 10, which is <= 19 so blue = 0
    expect(g).toBeGreaterThanOrEqual(0)
    expect(g).toBeLessThanOrEqual(255)
  })

  it('40000K (maximum boundary) produces valid cool RGB', () => {
    const { r, g, b } = kelvinToRgb(40000)
    expect(b).toBe(255) // temp >= 66 so blue is saturated
    expect(r).toBeGreaterThanOrEqual(0)
    expect(r).toBeLessThanOrEqual(255)
    expect(g).toBeGreaterThanOrEqual(0)
    expect(g).toBeLessThanOrEqual(255)
  })

  it('500K (below minimum) clamps to 1000K', () => {
    const clamped = kelvinToRgb(500)
    const atMin = kelvinToRgb(1000)
    expect(clamped.r).toBe(atMin.r)
    expect(clamped.g).toBe(atMin.g)
    expect(clamped.b).toBe(atMin.b)
  })

  it('50000K (above maximum) clamps to 40000K', () => {
    const clamped = kelvinToRgb(50000)
    const atMax = kelvinToRgb(40000)
    expect(clamped.r).toBe(atMax.r)
    expect(clamped.g).toBe(atMax.g)
    expect(clamped.b).toBe(atMax.b)
  })
})

describe('hslToRgb', () => {
  it('red hue (0°, 100%, 50%) = pure red', () => {
    const { r, g, b } = hslToRgb(0, 100, 50)
    expect(r).toBe(255)
    expect(g).toBe(0)
    expect(b).toBe(0)
  })

  it('green hue (120°, 100%, 50%) = pure green', () => {
    const { r, g, b } = hslToRgb(120, 100, 50)
    expect(r).toBe(0)
    expect(g).toBe(255)
    expect(b).toBe(0)
  })

  it('white (any hue, 0%, 100%) = 255,255,255', () => {
    const { r, g, b } = hslToRgb(0, 0, 100)
    expect(r).toBe(255)
    expect(g).toBe(255)
    expect(b).toBe(255)
  })

  it('black (any hue, any sat, 0%) = 0,0,0', () => {
    const { r, g, b } = hslToRgb(180, 100, 0)
    expect(r).toBe(0)
    expect(g).toBe(0)
    expect(b).toBe(0)
  })
})

describe('rgbToHsl', () => {
  it('pure red (255,0,0) = hue 0°, sat 100%, light 50%', () => {
    const { h, s, l } = rgbToHsl(255, 0, 0)
    expect(h).toBe(0)
    expect(s).toBe(100)
    expect(l).toBe(50)
  })

  it('white (255,255,255) = sat 0%, light 100%', () => {
    const { s, l } = rgbToHsl(255, 255, 255)
    expect(s).toBe(0)
    expect(l).toBe(100)
  })

  it('HSL round-trip is consistent', () => {
    const original = { h: 210, s: 75, l: 45 }
    const rgb = hslToRgb(original.h, original.s, original.l)
    const back = rgbToHsl(rgb.r, rgb.g, rgb.b)
    expect(back.h).toBeCloseTo(original.h, -1) // within ~10 degrees due to rounding
    expect(back.s).toBeCloseTo(original.s, -1)
    expect(back.l).toBeCloseTo(original.l, -1)
  })
})

describe('color harmonies', () => {
  it('complementary returns 2 hues 180° apart', () => {
    const hues = complementary(30)
    expect(hues).toHaveLength(2)
    expect(hues[0]).toBe(30)
    expect(hues[1]).toBe(210)
  })

  it('complementary wraps around 360°', () => {
    const hues = complementary(270)
    expect(hues[1]).toBe(90)
  })

  it('analogous returns 3 hues 30° apart', () => {
    const hues = analogous(60)
    expect(hues).toHaveLength(3)
    expect(hues[0]).toBe(30)
    expect(hues[1]).toBe(60)
    expect(hues[2]).toBe(90)
  })

  it('triadic returns 3 hues 120° apart', () => {
    const hues = triadic(0)
    expect(hues).toHaveLength(3)
    expect(hues[0]).toBe(0)
    expect(hues[1]).toBe(120)
    expect(hues[2]).toBe(240)
  })

  it('splitComplementary returns 3 hues at +0, +150, +210', () => {
    const hues = splitComplementary(0)
    expect(hues).toHaveLength(3)
    expect(hues[0]).toBe(0)
    expect(hues[1]).toBe(150)
    expect(hues[2]).toBe(210)
  })

  it('splitComplementary accepts custom split angle', () => {
    const hues = splitComplementary(0, 45)
    expect(hues[1]).toBe(135)
    expect(hues[2]).toBe(225)
  })

  it('analogous accepts custom spread', () => {
    const hues = analogous(60, 15)
    expect(hues[0]).toBe(45)
    expect(hues[1]).toBe(60)
    expect(hues[2]).toBe(75)
  })

  it('tetradic returns 4 hues forming a rectangle', () => {
    const hues = tetradic(0)
    expect(hues).toHaveLength(4)
    expect(hues[0]).toBe(0)
    expect(hues[1]).toBe(60)
    expect(hues[2]).toBe(180)
    expect(hues[3]).toBe(240)
  })

  it('tetradic accepts custom offset (square at 90°)', () => {
    const hues = tetradic(0, 90)
    expect(hues[0]).toBe(0)
    expect(hues[1]).toBe(90)
    expect(hues[2]).toBe(180)
    expect(hues[3]).toBe(270)
  })

  it('all harmony functions normalize hues to 0-360', () => {
    const fns = [complementary, analogous, triadic, splitComplementary, tetradic]
    for (const fn of fns) {
      const hues = fn(350)
      for (const h of hues) {
        expect(h).toBeGreaterThanOrEqual(0)
        expect(h).toBeLessThan(360)
      }
    }
  })

  it('complementary wraps correctly near 360° (hue=350 → complement near 170)', () => {
    const hues = complementary(350)
    expect(hues[0]).toBe(350)
    expect(hues[1]).toBe(170)
  })

  it('analogous wraps correctly near 360° (hue=350)', () => {
    const hues = analogous(350)
    expect(hues[0]).toBe(320) // 350 - 30
    expect(hues[1]).toBe(350)
    expect(hues[2]).toBe(20)  // (350 + 30) % 360
  })

  it('triadic wraps correctly near 360° (hue=350)', () => {
    const hues = triadic(350)
    expect(hues[0]).toBe(350)
    expect(hues[1]).toBe(110) // (350 + 120) % 360
    expect(hues[2]).toBe(230) // (350 + 240) % 360
  })
})
