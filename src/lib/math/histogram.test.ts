import { describe, it, expect } from 'vitest'
import { computeHistogram, detectClipping } from './histogram'

function makePixels(width: number, height: number, r: number, g: number, b: number, a = 255): Uint8ClampedArray {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < width * height; i++) {
    data[i * 4] = r
    data[i * 4 + 1] = g
    data[i * 4 + 2] = b
    data[i * 4 + 3] = a
  }
  return data
}

describe('computeHistogram', () => {
  it('all-white image accumulates only in bin 255 for each channel', () => {
    const data = makePixels(10, 10, 255, 255, 255)
    const hist = computeHistogram(data, 10, 10)
    expect(hist.r[255]).toBe(100)
    expect(hist.g[255]).toBe(100)
    expect(hist.b[255]).toBe(100)
    expect(hist.r[0]).toBe(0)
  })

  it('all-black image accumulates only in bin 0', () => {
    const data = makePixels(10, 10, 0, 0, 0)
    const hist = computeHistogram(data, 10, 10)
    expect(hist.r[0]).toBe(100)
    expect(hist.g[0]).toBe(100)
    expect(hist.b[0]).toBe(100)
    expect(hist.r[255]).toBe(0)
  })

  it('pure red image has r=255 bin full, g/b in bin 0', () => {
    const data = makePixels(5, 5, 255, 0, 0)
    const hist = computeHistogram(data, 5, 5)
    expect(hist.r[255]).toBe(25)
    expect(hist.g[0]).toBe(25)
    expect(hist.b[0]).toBe(25)
  })

  it('all bins sum to total pixel count', () => {
    const data = makePixels(8, 8, 128, 64, 192)
    const hist = computeHistogram(data, 8, 8)
    const totalR = hist.r.reduce((s, v) => s + v, 0)
    const totalG = hist.g.reduce((s, v) => s + v, 0)
    const totalB = hist.b.reduce((s, v) => s + v, 0)
    expect(totalR).toBe(64)
    expect(totalG).toBe(64)
    expect(totalB).toBe(64)
  })

  it('luma values are computed and fall in bin 0-255', () => {
    const data = makePixels(4, 4, 100, 150, 200)
    const hist = computeHistogram(data, 4, 4)
    const totalLuma = hist.luma.reduce((s, v) => s + v, 0)
    expect(totalLuma).toBe(16)
  })
})

describe('detectClipping', () => {
  it('all-white image reports 100% white clip', () => {
    const data = makePixels(10, 10, 255, 255, 255)
    const hist = computeHistogram(data, 10, 10)
    const result = detectClipping(hist)
    expect(result.whiteClipPercent).toBeCloseTo(100, 0)
    expect(result.hasWhiteClip).toBe(true)
    expect(result.hasBlackClip).toBe(false)
  })

  it('all-black image reports 100% black clip', () => {
    const data = makePixels(10, 10, 0, 0, 0)
    const hist = computeHistogram(data, 10, 10)
    const result = detectClipping(hist)
    expect(result.blackClipPercent).toBeCloseTo(100, 0)
    expect(result.hasBlackClip).toBe(true)
    expect(result.hasWhiteClip).toBe(false)
  })

  it('mid-gray image has no clipping', () => {
    const data = makePixels(10, 10, 128, 128, 128)
    const hist = computeHistogram(data, 10, 10)
    const result = detectClipping(hist)
    expect(result.hasBlackClip).toBe(false)
    expect(result.hasWhiteClip).toBe(false)
    expect(result.blackClipPercent).toBe(0)
    expect(result.whiteClipPercent).toBe(0)
  })

  it('hasWhiteClip is true only when >1% of pixels at bin 255', () => {
    // 2 white pixels out of 100 = 2% — should trigger
    const data = new Uint8ClampedArray(100 * 4)
    // Most pixels gray
    for (let i = 0; i < 98; i++) {
      data[i * 4] = 128; data[i * 4 + 1] = 128; data[i * 4 + 2] = 128; data[i * 4 + 3] = 255
    }
    // 2 white pixels
    data[98 * 4] = 255; data[98 * 4 + 1] = 255; data[98 * 4 + 2] = 255; data[98 * 4 + 3] = 255
    data[99 * 4] = 255; data[99 * 4 + 1] = 255; data[99 * 4 + 2] = 255; data[99 * 4 + 3] = 255

    const hist = computeHistogram(data, 100, 1)
    const result = detectClipping(hist)
    expect(result.hasWhiteClip).toBe(true)
    expect(result.whiteClipPercent).toBeCloseTo(2, 0)
  })

  it('exactly 1% white clip does not trigger hasWhiteClip', () => {
    // 1 white pixel out of 100 = 1% — should NOT trigger (must be > 1%)
    const data = new Uint8ClampedArray(100 * 4)
    for (let i = 0; i < 99; i++) {
      data[i * 4] = 128; data[i * 4 + 1] = 128; data[i * 4 + 2] = 128; data[i * 4 + 3] = 255
    }
    data[99 * 4] = 255; data[99 * 4 + 1] = 255; data[99 * 4 + 2] = 255; data[99 * 4 + 3] = 255

    const hist = computeHistogram(data, 100, 1)
    const result = detectClipping(hist)
    expect(result.hasWhiteClip).toBe(false)
  })

  it('exactly 1% black clip does not trigger hasBlackClip', () => {
    const data = new Uint8ClampedArray(100 * 4)
    for (let i = 0; i < 99; i++) {
      data[i * 4] = 128; data[i * 4 + 1] = 128; data[i * 4 + 2] = 128; data[i * 4 + 3] = 255
    }
    data[99 * 4] = 0; data[99 * 4 + 1] = 0; data[99 * 4 + 2] = 0; data[99 * 4 + 3] = 255

    const hist = computeHistogram(data, 100, 1)
    const result = detectClipping(hist)
    expect(result.hasBlackClip).toBe(false)
  })
})

describe('computeHistogram edge cases', () => {
  it('handles single pixel image (1x1)', () => {
    const data = makePixels(1, 1, 42, 100, 200)
    const hist = computeHistogram(data, 1, 1)

    expect(hist.r[42]).toBe(1)
    expect(hist.g[100]).toBe(1)
    expect(hist.b[200]).toBe(1)

    const totalR = hist.r.reduce((s, v) => s + v, 0)
    const totalG = hist.g.reduce((s, v) => s + v, 0)
    const totalB = hist.b.reduce((s, v) => s + v, 0)
    const totalLuma = hist.luma.reduce((s, v) => s + v, 0)
    expect(totalR).toBe(1)
    expect(totalG).toBe(1)
    expect(totalB).toBe(1)
    expect(totalLuma).toBe(1)
  })
})
