import { describe, it, expect } from 'vitest'
import { kelvinToRgb } from './color-kelvin'

describe('kelvinToRgb', () => {
  describe('known color temperatures', () => {
    it('candlelight (~1800K) is very warm: max red, low blue', () => {
      const { r, g, b } = kelvinToRgb(1800)
      expect(r).toBe(255)
      expect(b).toBeLessThan(10)
      expect(r).toBeGreaterThan(g)
    })

    it('incandescent (~2700K) is warm: max red, low blue', () => {
      const { r, b } = kelvinToRgb(2700)
      expect(r).toBe(255)
      expect(b).toBeLessThan(100)
      expect(r).toBeGreaterThan(b)
    })

    it('warm white (~3500K) has noticeable blue component', () => {
      const { r, b } = kelvinToRgb(3500)
      expect(r).toBe(255)
      expect(b).toBeGreaterThan(50)
      expect(b).toBeLessThan(200)
    })

    it('daylight (~5500K) is close to neutral white', () => {
      const { r, g, b } = kelvinToRgb(5500)
      expect(r).toBeGreaterThan(200)
      expect(g).toBeGreaterThan(200)
      expect(b).toBeGreaterThan(200)
    })

    it('D65 daylight (~6500K) is near-white with all channels high', () => {
      const { r, g, b } = kelvinToRgb(6500)
      expect(r).toBeGreaterThan(200)
      expect(g).toBeGreaterThan(200)
      expect(b).toBeGreaterThan(200)
    })

    it('overcast sky (~7500K) has blue higher than red', () => {
      const { r, b } = kelvinToRgb(7500)
      expect(b).toBeGreaterThan(r)
    })

    it('deep blue sky (~10000K) has max blue, reduced red', () => {
      const { r, b } = kelvinToRgb(10000)
      expect(b).toBe(255)
      expect(r).toBeLessThan(b)
    })

    it('clear sky (~15000K) has max blue, low red', () => {
      const { r, b } = kelvinToRgb(15000)
      expect(b).toBe(255)
      expect(r).toBeLessThan(200)
    })
  })

  describe('temperature trends', () => {
    it('higher temperature shifts blue channel up', () => {
      const warm = kelvinToRgb(3000)
      const cool = kelvinToRgb(8000)
      expect(cool.b).toBeGreaterThan(warm.b)
    })

    it('higher temperature shifts red channel down', () => {
      const warm = kelvinToRgb(3000)
      const cool = kelvinToRgb(8000)
      expect(cool.r).toBeLessThan(warm.r)
    })

    it('red is monotonically non-increasing from 1000K to 40000K', () => {
      let prevR = 256
      for (let k = 1000; k <= 40000; k += 500) {
        const { r } = kelvinToRgb(k)
        expect(r).toBeLessThanOrEqual(prevR)
        prevR = r
      }
    })

    it('blue is monotonically non-decreasing from 1000K to 40000K', () => {
      let prevB = -1
      for (let k = 1000; k <= 40000; k += 500) {
        const { b } = kelvinToRgb(k)
        expect(b).toBeGreaterThanOrEqual(prevB)
        prevB = b
      }
    })
  })

  describe('boundary and clamping', () => {
    it('1000K (minimum) produces valid warm RGB', () => {
      const { r, g, b } = kelvinToRgb(1000)
      expect(r).toBe(255)
      expect(b).toBe(0)
      expect(g).toBeGreaterThanOrEqual(0)
      expect(g).toBeLessThanOrEqual(255)
    })

    it('40000K (maximum) produces valid cool RGB', () => {
      const { r, g, b } = kelvinToRgb(40000)
      expect(b).toBe(255)
      expect(r).toBeGreaterThanOrEqual(0)
      expect(r).toBeLessThanOrEqual(255)
      expect(g).toBeGreaterThanOrEqual(0)
      expect(g).toBeLessThanOrEqual(255)
    })

    it('below minimum (500K) clamps to 1000K', () => {
      const clamped = kelvinToRgb(500)
      const atMin = kelvinToRgb(1000)
      expect(clamped).toEqual(atMin)
    })

    it('above maximum (50000K) clamps to 40000K', () => {
      const clamped = kelvinToRgb(50000)
      const atMax = kelvinToRgb(40000)
      expect(clamped).toEqual(atMax)
    })

    it('zero kelvin clamps to 1000K', () => {
      const clamped = kelvinToRgb(0)
      const atMin = kelvinToRgb(1000)
      expect(clamped).toEqual(atMin)
    })

    it('negative kelvin clamps to 1000K', () => {
      const clamped = kelvinToRgb(-500)
      const atMin = kelvinToRgb(1000)
      expect(clamped).toEqual(atMin)
    })
  })

  describe('channel constraints', () => {
    it('all channels are in 0-255 range across the spectrum', () => {
      for (const k of [1000, 1500, 2000, 3000, 4000, 5000, 5500, 6500, 8000, 10000, 20000, 40000]) {
        const { r, g, b } = kelvinToRgb(k)
        expect(r).toBeGreaterThanOrEqual(0)
        expect(r).toBeLessThanOrEqual(255)
        expect(g).toBeGreaterThanOrEqual(0)
        expect(g).toBeLessThanOrEqual(255)
        expect(b).toBeGreaterThanOrEqual(0)
        expect(b).toBeLessThanOrEqual(255)
      }
    })

    it('all channels are integers', () => {
      for (const k of [1000, 2700, 5500, 6500, 10000, 40000]) {
        const { r, g, b } = kelvinToRgb(k)
        expect(Number.isInteger(r)).toBe(true)
        expect(Number.isInteger(g)).toBe(true)
        expect(Number.isInteger(b)).toBe(true)
      }
    })

    it('red is 255 at and below 6600K (temp <= 66)', () => {
      for (const k of [1000, 2000, 3000, 4000, 5000, 6000, 6600]) {
        const { r } = kelvinToRgb(k)
        expect(r).toBe(255)
      }
    })

    it('blue is 255 at and above 6600K (temp >= 66)', () => {
      for (const k of [6600, 7000, 8000, 10000, 20000, 40000]) {
        const { b } = kelvinToRgb(k)
        expect(b).toBe(255)
      }
    })

    it('blue is 0 at and below 1900K (temp <= 19)', () => {
      for (const k of [1000, 1500, 1900]) {
        const { b } = kelvinToRgb(k)
        expect(b).toBe(0)
      }
    })
  })

  describe('inflection point at 6600K', () => {
    it('at exactly 6600K, red is 255 and blue is 255', () => {
      const { r, b } = kelvinToRgb(6600)
      expect(r).toBe(255)
      expect(b).toBe(255)
    })

    it('just above 6600K, red starts to decrease', () => {
      const { r } = kelvinToRgb(6700)
      expect(r).toBeLessThan(255)
    })

    it('just below 6600K, blue is not yet 255', () => {
      const { b } = kelvinToRgb(6500)
      expect(b).toBeLessThan(255)
    })
  })
})
