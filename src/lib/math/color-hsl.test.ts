import { describe, it, expect } from 'vitest'
import { hslToRgb, rgbToHsl } from './color-hsl'

describe('hslToRgb', () => {
  it('pure red: HSL(0, 100, 50) = RGB(255, 0, 0)', () => {
    const { r, g, b } = hslToRgb(0, 100, 50)
    expect(r).toBe(255)
    expect(g).toBe(0)
    expect(b).toBe(0)
  })

  it('pure green: HSL(120, 100, 50) = RGB(0, 255, 0)', () => {
    const { r, g, b } = hslToRgb(120, 100, 50)
    expect(r).toBe(0)
    expect(g).toBe(255)
    expect(b).toBe(0)
  })

  it('pure blue: HSL(240, 100, 50) = RGB(0, 0, 255)', () => {
    const { r, g, b } = hslToRgb(240, 100, 50)
    expect(r).toBe(0)
    expect(g).toBe(0)
    expect(b).toBe(255)
  })

  it('yellow: HSL(60, 100, 50) = RGB(255, 255, 0)', () => {
    const { r, g, b } = hslToRgb(60, 100, 50)
    expect(r).toBe(255)
    expect(g).toBe(255)
    expect(b).toBe(0)
  })

  it('cyan: HSL(180, 100, 50) = RGB(0, 255, 255)', () => {
    const { r, g, b } = hslToRgb(180, 100, 50)
    expect(r).toBe(0)
    expect(g).toBe(255)
    expect(b).toBe(255)
  })

  it('magenta: HSL(300, 100, 50) = RGB(255, 0, 255)', () => {
    const { r, g, b } = hslToRgb(300, 100, 50)
    expect(r).toBe(255)
    expect(g).toBe(0)
    expect(b).toBe(255)
  })

  it('white: HSL(0, 0, 100) = RGB(255, 255, 255)', () => {
    const { r, g, b } = hslToRgb(0, 0, 100)
    expect(r).toBe(255)
    expect(g).toBe(255)
    expect(b).toBe(255)
  })

  it('black: HSL(any, any, 0) = RGB(0, 0, 0)', () => {
    const { r, g, b } = hslToRgb(180, 100, 0)
    expect(r).toBe(0)
    expect(g).toBe(0)
    expect(b).toBe(0)
  })

  it('50% gray: HSL(0, 0, 50) = RGB(128, 128, 128)', () => {
    const { r, g, b } = hslToRgb(0, 0, 50)
    expect(r).toBe(128)
    expect(g).toBe(128)
    expect(b).toBe(128)
  })

  it('desaturated color has equal or near-equal channels', () => {
    const { r, g, b } = hslToRgb(200, 0, 50)
    expect(r).toBe(g)
    expect(g).toBe(b)
  })

  it('low saturation produces muted color', () => {
    const { r, g, b } = hslToRgb(0, 10, 50)
    // Low saturation red: channels are close together
    expect(r).toBeGreaterThan(g)
    expect(r).toBeGreaterThan(b)
    expect(r - g).toBeLessThan(30)
  })

  it('high lightness produces pastel color', () => {
    const { r, g, b } = hslToRgb(0, 100, 90)
    // Light red (pink): high red, moderately high green/blue
    expect(r).toBe(255)
    expect(g).toBeGreaterThan(180)
    expect(b).toBeGreaterThan(180)
  })

  it('low lightness produces dark color', () => {
    const { r, g, b } = hslToRgb(0, 100, 10)
    // Dark red
    expect(r).toBeGreaterThan(0)
    expect(r).toBeLessThan(60)
    expect(g).toBe(0)
    expect(b).toBe(0)
  })

  it('all hue sectors produce values in 0-255 range', () => {
    for (let h = 0; h < 360; h += 30) {
      const { r, g, b } = hslToRgb(h, 80, 50)
      expect(r).toBeGreaterThanOrEqual(0)
      expect(r).toBeLessThanOrEqual(255)
      expect(g).toBeGreaterThanOrEqual(0)
      expect(g).toBeLessThanOrEqual(255)
      expect(b).toBeGreaterThanOrEqual(0)
      expect(b).toBeLessThanOrEqual(255)
    }
  })

  it('boundary between hue sectors (exactly 60 degrees)', () => {
    // At exactly h=60 we are at the yellow peak
    const { r, g, b } = hslToRgb(60, 100, 50)
    expect(r).toBe(255)
    expect(g).toBe(255)
    expect(b).toBe(0)
  })

  it('boundary at h=120', () => {
    const { r, g, b } = hslToRgb(120, 100, 50)
    expect(r).toBe(0)
    expect(g).toBe(255)
    expect(b).toBe(0)
  })

  it('boundary at h=240', () => {
    const { r, g, b } = hslToRgb(240, 100, 50)
    expect(r).toBe(0)
    expect(g).toBe(0)
    expect(b).toBe(255)
  })

  it('boundary at h=300', () => {
    const { r, g, b } = hslToRgb(300, 100, 50)
    expect(r).toBe(255)
    expect(g).toBe(0)
    expect(b).toBe(255)
  })
})

describe('rgbToHsl', () => {
  it('pure red: RGB(255, 0, 0) = HSL(0, 100, 50)', () => {
    const { h, s, l } = rgbToHsl(255, 0, 0)
    expect(h).toBe(0)
    expect(s).toBe(100)
    expect(l).toBe(50)
  })

  it('pure green: RGB(0, 255, 0) = HSL(120, 100, 50)', () => {
    const { h, s, l } = rgbToHsl(0, 255, 0)
    expect(h).toBe(120)
    expect(s).toBe(100)
    expect(l).toBe(50)
  })

  it('pure blue: RGB(0, 0, 255) = HSL(240, 100, 50)', () => {
    const { h, s, l } = rgbToHsl(0, 0, 255)
    expect(h).toBe(240)
    expect(s).toBe(100)
    expect(l).toBe(50)
  })

  it('yellow: RGB(255, 255, 0) = HSL(60, 100, 50)', () => {
    const { h, s, l } = rgbToHsl(255, 255, 0)
    expect(h).toBe(60)
    expect(s).toBe(100)
    expect(l).toBe(50)
  })

  it('cyan: RGB(0, 255, 255) = HSL(180, 100, 50)', () => {
    const { h, s, l } = rgbToHsl(0, 255, 255)
    expect(h).toBe(180)
    expect(s).toBe(100)
    expect(l).toBe(50)
  })

  it('magenta: RGB(255, 0, 255) = HSL(300, 100, 50)', () => {
    const { h, s, l } = rgbToHsl(255, 0, 255)
    expect(h).toBe(300)
    expect(s).toBe(100)
    expect(l).toBe(50)
  })

  it('white: RGB(255, 255, 255) = HSL(0, 0, 100)', () => {
    const { h, s, l } = rgbToHsl(255, 255, 255)
    expect(h).toBe(0)
    expect(s).toBe(0)
    expect(l).toBe(100)
  })

  it('black: RGB(0, 0, 0) = HSL(0, 0, 0)', () => {
    const { h, s, l } = rgbToHsl(0, 0, 0)
    expect(h).toBe(0)
    expect(s).toBe(0)
    expect(l).toBe(0)
  })

  it('50% gray: RGB(128, 128, 128) has saturation 0', () => {
    const { s, l } = rgbToHsl(128, 128, 128)
    expect(s).toBe(0)
    expect(l).toBe(50)
  })

  it('handles green-dominant hue calculation', () => {
    // Teal-ish: green is max
    const { h } = rgbToHsl(0, 200, 100)
    expect(h).toBeGreaterThan(120)
    expect(h).toBeLessThan(180)
  })

  it('handles blue-dominant hue calculation', () => {
    // Purple: blue is max
    const { h } = rgbToHsl(100, 0, 200)
    expect(h).toBeGreaterThan(240)
    expect(h).toBeLessThan(300)
  })

  it('handles red-dominant with negative hue wrap', () => {
    // Red with more blue than green => hue wraps via negative
    const { h } = rgbToHsl(255, 0, 128)
    expect(h).toBeGreaterThan(300)
    expect(h).toBeLessThan(360)
  })
})

describe('hslToRgb <-> rgbToHsl round-trip', () => {
  it('round-trips pure red', () => {
    const rgb = hslToRgb(0, 100, 50)
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    expect(hsl.h).toBe(0)
    expect(hsl.s).toBe(100)
    expect(hsl.l).toBe(50)
  })

  it('round-trips a mid-range color', () => {
    const original = { h: 210, s: 75, l: 45 }
    const rgb = hslToRgb(original.h, original.s, original.l)
    const back = rgbToHsl(rgb.r, rgb.g, rgb.b)
    expect(back.h).toBeCloseTo(original.h, -1)
    expect(back.s).toBeCloseTo(original.s, -1)
    expect(back.l).toBeCloseTo(original.l, -1)
  })

  it('round-trips a warm color', () => {
    const original = { h: 30, s: 90, l: 60 }
    const rgb = hslToRgb(original.h, original.s, original.l)
    const back = rgbToHsl(rgb.r, rgb.g, rgb.b)
    expect(back.h).toBeCloseTo(original.h, -1)
    expect(back.s).toBeCloseTo(original.s, -1)
    expect(back.l).toBeCloseTo(original.l, -1)
  })

  it('round-trips a cool color', () => {
    const original = { h: 270, s: 60, l: 35 }
    const rgb = hslToRgb(original.h, original.s, original.l)
    const back = rgbToHsl(rgb.r, rgb.g, rgb.b)
    expect(back.h).toBeCloseTo(original.h, -1)
    expect(back.s).toBeCloseTo(original.s, -1)
    expect(back.l).toBeCloseTo(original.l, -1)
  })

  it('round-trips white preserves lightness', () => {
    const rgb = hslToRgb(0, 0, 100)
    const back = rgbToHsl(rgb.r, rgb.g, rgb.b)
    expect(back.l).toBe(100)
    expect(back.s).toBe(0)
  })

  it('round-trips black preserves lightness', () => {
    const rgb = hslToRgb(0, 0, 0)
    const back = rgbToHsl(rgb.r, rgb.g, rgb.b)
    expect(back.l).toBe(0)
  })

  it('round-trips gray preserves zero saturation', () => {
    const rgb = hslToRgb(0, 0, 50)
    const back = rgbToHsl(rgb.r, rgb.g, rgb.b)
    expect(back.s).toBe(0)
    expect(back.l).toBe(50)
  })
})
