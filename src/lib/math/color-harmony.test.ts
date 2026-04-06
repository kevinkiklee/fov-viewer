import { describe, it, expect } from 'vitest'
import { complementary, analogous, triadic, splitComplementary, tetradic } from './color-harmony'

describe('complementary', () => {
  it('returns 2 hues 180 degrees apart', () => {
    const hues = complementary(0)
    expect(hues).toHaveLength(2)
    expect(hues[0]).toBe(0)
    expect(hues[1]).toBe(180)
  })

  it('works for mid-range hue', () => {
    const hues = complementary(30)
    expect(hues[0]).toBe(30)
    expect(hues[1]).toBe(210)
  })

  it('wraps around 360 degrees', () => {
    const hues = complementary(270)
    expect(hues[0]).toBe(270)
    expect(hues[1]).toBe(90)
  })

  it('wraps correctly near 360 (hue=350)', () => {
    const hues = complementary(350)
    expect(hues[0]).toBe(350)
    expect(hues[1]).toBe(170)
  })

  it('handles hue of exactly 180', () => {
    const hues = complementary(180)
    expect(hues[0]).toBe(180)
    expect(hues[1]).toBe(0)
  })

  it('normalizes negative hue input', () => {
    const hues = complementary(-30)
    expect(hues[0]).toBe(330)
    expect(hues[1]).toBe(150)
  })

  it('normalizes hue greater than 360', () => {
    const hues = complementary(400)
    expect(hues[0]).toBe(40)
    expect(hues[1]).toBe(220)
  })

  it('handles zero hue', () => {
    const hues = complementary(0)
    expect(hues[0]).toBe(0)
    expect(hues[1]).toBe(180)
  })

  it('handles hue of exactly 360 (same as 0)', () => {
    const hues = complementary(360)
    expect(hues[0]).toBe(0)
    expect(hues[1]).toBe(180)
  })
})

describe('analogous', () => {
  it('returns 3 hues with default 30 degree spread', () => {
    const hues = analogous(60)
    expect(hues).toHaveLength(3)
    expect(hues[0]).toBe(30)
    expect(hues[1]).toBe(60)
    expect(hues[2]).toBe(90)
  })

  it('accepts custom spread', () => {
    const hues = analogous(60, 15)
    expect(hues[0]).toBe(45)
    expect(hues[1]).toBe(60)
    expect(hues[2]).toBe(75)
  })

  it('wraps correctly near 0 (hue=10, spread=30)', () => {
    const hues = analogous(10)
    expect(hues[0]).toBe(340)
    expect(hues[1]).toBe(10)
    expect(hues[2]).toBe(40)
  })

  it('wraps correctly near 360 (hue=350)', () => {
    const hues = analogous(350)
    expect(hues[0]).toBe(320)
    expect(hues[1]).toBe(350)
    expect(hues[2]).toBe(20)
  })

  it('handles zero hue', () => {
    const hues = analogous(0)
    expect(hues[0]).toBe(330)
    expect(hues[1]).toBe(0)
    expect(hues[2]).toBe(30)
  })

  it('handles large custom spread', () => {
    const hues = analogous(0, 90)
    expect(hues[0]).toBe(270)
    expect(hues[1]).toBe(0)
    expect(hues[2]).toBe(90)
  })

  it('normalizes negative hue', () => {
    const hues = analogous(-10)
    expect(hues[0]).toBe(320)
    expect(hues[1]).toBe(350)
    expect(hues[2]).toBe(20)
  })
})

describe('triadic', () => {
  it('returns 3 hues 120 degrees apart', () => {
    const hues = triadic(0)
    expect(hues).toHaveLength(3)
    expect(hues[0]).toBe(0)
    expect(hues[1]).toBe(120)
    expect(hues[2]).toBe(240)
  })

  it('wraps correctly for hue near 360', () => {
    const hues = triadic(350)
    expect(hues[0]).toBe(350)
    expect(hues[1]).toBe(110)
    expect(hues[2]).toBe(230)
  })

  it('works for mid-range hue', () => {
    const hues = triadic(60)
    expect(hues[0]).toBe(60)
    expect(hues[1]).toBe(180)
    expect(hues[2]).toBe(300)
  })

  it('handles hue of 120', () => {
    const hues = triadic(120)
    expect(hues[0]).toBe(120)
    expect(hues[1]).toBe(240)
    expect(hues[2]).toBe(0)
  })

  it('normalizes negative hue', () => {
    const hues = triadic(-60)
    expect(hues[0]).toBe(300)
    expect(hues[1]).toBe(60)
    expect(hues[2]).toBe(180)
  })
})

describe('splitComplementary', () => {
  it('returns 3 hues at +0, +150, +210 by default', () => {
    const hues = splitComplementary(0)
    expect(hues).toHaveLength(3)
    expect(hues[0]).toBe(0)
    expect(hues[1]).toBe(150)
    expect(hues[2]).toBe(210)
  })

  it('accepts custom split angle', () => {
    const hues = splitComplementary(0, 45)
    expect(hues[0]).toBe(0)
    expect(hues[1]).toBe(135)
    expect(hues[2]).toBe(225)
  })

  it('wraps correctly near 360', () => {
    const hues = splitComplementary(350)
    expect(hues[0]).toBe(350)
    expect(hues[1]).toBe(140)
    expect(hues[2]).toBe(200)
  })

  it('works for mid-range hue', () => {
    const hues = splitComplementary(90)
    expect(hues[0]).toBe(90)
    expect(hues[1]).toBe(240)
    expect(hues[2]).toBe(300)
  })

  it('normalizes negative hue', () => {
    const hues = splitComplementary(-30)
    expect(hues[0]).toBe(330)
    expect(hues[1]).toBe(120)
    expect(hues[2]).toBe(180)
  })

  it('with split angle of 0 degenerates to complementary pair at position 1 and 2', () => {
    const hues = splitComplementary(60, 0)
    expect(hues[0]).toBe(60)
    expect(hues[1]).toBe(240)
    expect(hues[2]).toBe(240)
  })
})

describe('tetradic', () => {
  it('returns 4 hues forming a rectangle with default 60 degree offset', () => {
    const hues = tetradic(0)
    expect(hues).toHaveLength(4)
    expect(hues[0]).toBe(0)
    expect(hues[1]).toBe(60)
    expect(hues[2]).toBe(180)
    expect(hues[3]).toBe(240)
  })

  it('accepts custom offset to form a square (90 degrees)', () => {
    const hues = tetradic(0, 90)
    expect(hues[0]).toBe(0)
    expect(hues[1]).toBe(90)
    expect(hues[2]).toBe(180)
    expect(hues[3]).toBe(270)
  })

  it('wraps correctly near 360', () => {
    const hues = tetradic(330)
    expect(hues[0]).toBe(330)
    expect(hues[1]).toBe(30)
    expect(hues[2]).toBe(150)
    expect(hues[3]).toBe(210)
  })

  it('works for mid-range hue', () => {
    const hues = tetradic(45)
    expect(hues[0]).toBe(45)
    expect(hues[1]).toBe(105)
    expect(hues[2]).toBe(225)
    expect(hues[3]).toBe(285)
  })

  it('normalizes negative hue', () => {
    const hues = tetradic(-10)
    expect(hues[0]).toBe(350)
    expect(hues[1]).toBe(50)
    expect(hues[2]).toBe(170)
    expect(hues[3]).toBe(230)
  })

  it('with offset of 0 produces two complementary pairs', () => {
    const hues = tetradic(30, 0)
    expect(hues[0]).toBe(30)
    expect(hues[1]).toBe(30)
    expect(hues[2]).toBe(210)
    expect(hues[3]).toBe(210)
  })
})

describe('all harmony functions', () => {
  it('all results are in the 0-359 range', () => {
    const fns = [complementary, analogous, triadic, splitComplementary, tetradic]
    const testHues = [0, 45, 90, 180, 270, 350, 359, -30, 400, 720]
    for (const fn of fns) {
      for (const hue of testHues) {
        const hues = fn(hue)
        for (const h of hues) {
          expect(h).toBeGreaterThanOrEqual(0)
          expect(h).toBeLessThan(360)
        }
      }
    }
  })

  it('all results are integers', () => {
    const fns = [complementary, analogous, triadic, splitComplementary, tetradic]
    for (const fn of fns) {
      const hues = fn(75)
      for (const h of hues) {
        expect(Number.isInteger(h)).toBe(true)
      }
    }
  })
})
