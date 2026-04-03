import { describe, it, expect } from 'vitest'
import {
  calcEV,
  shutterWithNd,
  ndFactorToStops,
  formatShutterSpeed,
  reciprocalRule,
  solveForShutter,
  solveForAperture,
  solveForISO,
  calcCircleOfConfusion,
  calcMotionBlurAmount,
  calcNoiseAmplitude,
} from './exposure'

describe('calcEV', () => {
  it('f/8 at 1/125s = EV 13', () => {
    // EV = log2(64 / (1/125)) = log2(64 * 125) = log2(8000) ≈ 12.97
    expect(calcEV(8, 1 / 125)).toBeCloseTo(13, 0)
  })

  it('f/1 at 1s = EV 0', () => {
    expect(calcEV(1, 1)).toBeCloseTo(0, 5)
  })

  it('f/2 at 1s = EV 2', () => {
    // log2(4/1) = 2
    expect(calcEV(2, 1)).toBeCloseTo(2, 5)
  })

  it('higher EV for faster shutter at same aperture', () => {
    expect(calcEV(8, 1 / 1000)).toBeGreaterThan(calcEV(8, 1 / 100))
  })
})

describe('shutterWithNd', () => {
  it('ND1000 (10 stops) extends 1/125s to ~8s', () => {
    // 1/125 * 2^10 = 1/125 * 1024 ≈ 8.19s
    const result = shutterWithNd(1 / 125, 10)
    expect(result).toBeCloseTo(8.19, 1)
  })

  it('ND3 (1.5 stops) extends 1s proportionally', () => {
    // actually ND3 ≈ log2(3) ≈ 1.585 stops
    const stops = ndFactorToStops(3)
    const result = shutterWithNd(1, stops)
    expect(result).toBeCloseTo(3, 5)
  })

  it('0 stops leaves shutter unchanged', () => {
    expect(shutterWithNd(1 / 60, 0)).toBeCloseTo(1 / 60, 5)
  })
})

describe('ndFactorToStops', () => {
  it('ND2 = 1 stop', () => {
    expect(ndFactorToStops(2)).toBeCloseTo(1, 5)
  })

  it('ND8 = 3 stops', () => {
    expect(ndFactorToStops(8)).toBeCloseTo(3, 5)
  })

  it('ND1000 = ~10 stops', () => {
    expect(ndFactorToStops(1000)).toBeCloseTo(9.97, 1)
  })

  it('ND1024 = exactly 10 stops', () => {
    expect(ndFactorToStops(1024)).toBeCloseTo(10, 5)
  })
})

describe('formatShutterSpeed', () => {
  it('formats 1/1000s as "1/1000"', () => {
    expect(formatShutterSpeed(1 / 1000)).toBe('1/1000')
  })

  it('formats 1/60s as "1/60"', () => {
    expect(formatShutterSpeed(1 / 60)).toBe('1/60')
  })

  it('formats 2s as "2s"', () => {
    expect(formatShutterSpeed(2)).toBe('2s')
  })

  it('formats 30s as "30s"', () => {
    expect(formatShutterSpeed(30)).toBe('30s')
  })

  it('formats 120s as "2m"', () => {
    expect(formatShutterSpeed(120)).toBe('2m')
  })

  it('formats 90s as "1m 30s"', () => {
    expect(formatShutterSpeed(90)).toBe('1m 30s')
  })
})

describe('reciprocalRule', () => {
  it('50mm on FF (1x crop) without stabilization = 1/50s', () => {
    const shutter = reciprocalRule(50, 1.0, 0)
    expect(shutter).toBeCloseTo(1 / 50, 5)
  })

  it('50mm on APS-C (1.5x crop) without stabilization = 1/75s', () => {
    const shutter = reciprocalRule(50, 1.5, 0)
    expect(shutter).toBeCloseTo(1 / 75, 5)
  })

  it('3 stops of IBIS allows 8x longer shutter', () => {
    const withoutStab = reciprocalRule(50, 1.0, 0)
    const withStab = reciprocalRule(50, 1.0, 3)
    expect(withStab).toBeCloseTo(withoutStab * 8, 5)
  })
})

describe('solve exposure triangle', () => {
  it('solveForShutter: EV13 at f/8 ISO100 gives 1/125s', () => {
    // At ISO 100, EV13: t = 64 * 100 / (8192 * 100) = 1/128... let's verify
    // t = N^2 * 100 / (2^EV * ISO) = 64 * 100 / (8192 * 100) = 6400/819200 = 1/128
    const t = solveForShutter(13, 8, 100)
    expect(t).toBeCloseTo(1 / 128, 4)
  })

  it('solveForAperture: EV13 at 1/125s ISO100 gives ~f/8', () => {
    const N = solveForAperture(13, 1 / 128, 100)
    expect(N).toBeCloseTo(8, 1)
  })

  it('solveForISO: round-trip consistency', () => {
    const ev = 10
    const aperture = 4
    const shutter = 1 / 60
    const iso = solveForISO(ev, aperture, shutter)
    // Verify round-trip: solve for shutter using computed ISO should match
    const shutterBack = solveForShutter(ev, aperture, iso)
    expect(shutterBack).toBeCloseTo(shutter, 5)
  })
})

describe('calcCircleOfConfusion', () => {
  it('returns 0 at the focus distance', () => {
    expect(calcCircleOfConfusion(0.3, 0.3, 1.4)).toBe(0)
  })
  it('returns larger CoC for wider apertures', () => {
    const cocWide = calcCircleOfConfusion(0.8, 0.3, 1.4)
    const cocNarrow = calcCircleOfConfusion(0.8, 0.3, 22)
    expect(cocWide).toBeGreaterThan(cocNarrow)
  })
  it('returns larger CoC for points further from focus', () => {
    const cocNear = calcCircleOfConfusion(0.4, 0.3, 5.6)
    const cocFar = calcCircleOfConfusion(0.9, 0.3, 5.6)
    expect(cocFar).toBeGreaterThan(cocNear)
  })
  it('returns 0 for f/22 regardless of depth (near-zero blur)', () => {
    const coc = calcCircleOfConfusion(0.8, 0.3, 22)
    expect(coc).toBeLessThan(0.01)
  })
  it('clamps to maxRadius', () => {
    const coc = calcCircleOfConfusion(1.0, 0.3, 1.4)
    expect(coc).toBeLessThanOrEqual(20)
  })
})

describe('calcMotionBlurAmount', () => {
  it('returns 0 for very fast shutter speeds', () => {
    expect(calcMotionBlurAmount(1/8000)).toBeLessThan(0.5)
  })
  it('returns max blur for 30s exposure', () => {
    expect(calcMotionBlurAmount(30)).toBe(40)
  })
  it('returns more blur for slower shutters', () => {
    const blurFast = calcMotionBlurAmount(1/1000)
    const blurSlow = calcMotionBlurAmount(1/30)
    expect(blurSlow).toBeGreaterThan(blurFast)
  })
  it('clamps to maxBlur', () => {
    expect(calcMotionBlurAmount(30, 40)).toBeLessThanOrEqual(40)
  })
})

describe('calcNoiseAmplitude', () => {
  it('returns 0 at ISO 100', () => {
    expect(calcNoiseAmplitude(100)).toBe(0)
  })
  it('returns small value at ISO 200', () => {
    const amp = calcNoiseAmplitude(200)
    expect(amp).toBeGreaterThan(0)
    expect(amp).toBeLessThan(0.1)
  })
  it('increases with ISO', () => {
    const amp400 = calcNoiseAmplitude(400)
    const amp3200 = calcNoiseAmplitude(3200)
    const amp25600 = calcNoiseAmplitude(25600)
    expect(amp3200).toBeGreaterThan(amp400)
    expect(amp25600).toBeGreaterThan(amp3200)
  })
  it('returns max amplitude at ISO 25600', () => {
    const amp = calcNoiseAmplitude(25600)
    expect(amp).toBeCloseTo(0.5, 1)
  })
})
