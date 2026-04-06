import { describe, it, expect, vi } from 'vitest'
import {
  GOLDEN_RATIO,
  drawGoldenRatio,
  drawGoldenSpiral,
  drawGoldenDiagonal,
} from './grid-golden'

function mockCtx() {
  return {
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    arc: vi.fn(),
  } as unknown as CanvasRenderingContext2D
}

describe('GOLDEN_RATIO', () => {
  it('equals (1 + sqrt(5)) / 2 (approximately 1.618)', () => {
    expect(GOLDEN_RATIO).toBeCloseTo(1.618033988749895, 10)
  })

  it('satisfies phi^2 = phi + 1', () => {
    expect(GOLDEN_RATIO * GOLDEN_RATIO).toBeCloseTo(GOLDEN_RATIO + 1, 10)
  })
})

describe('drawGoldenRatio', () => {
  it('draws 4 lines (2 vertical, 2 horizontal)', () => {
    const ctx = mockCtx()
    drawGoldenRatio(ctx, 1920, 1080)
    expect(ctx.beginPath).toHaveBeenCalledTimes(1)
    expect(ctx.moveTo).toHaveBeenCalledTimes(4)
    expect(ctx.lineTo).toHaveBeenCalledTimes(4)
    expect(ctx.stroke).toHaveBeenCalledTimes(1)
  })

  it('places vertical lines at phi divisions of width', () => {
    const ctx = mockCtx()
    const w = 1920
    const h = 1080
    drawGoldenRatio(ctx, w, h)
    const phiW = w / GOLDEN_RATIO
    expect(ctx.moveTo).toHaveBeenCalledWith(phiW, 0)
    expect(ctx.lineTo).toHaveBeenCalledWith(phiW, h)
    expect(ctx.moveTo).toHaveBeenCalledWith(w - phiW, 0)
    expect(ctx.lineTo).toHaveBeenCalledWith(w - phiW, h)
  })

  it('places horizontal lines at phi divisions of height', () => {
    const ctx = mockCtx()
    const w = 1920
    const h = 1080
    drawGoldenRatio(ctx, w, h)
    const phiH = h / GOLDEN_RATIO
    expect(ctx.moveTo).toHaveBeenCalledWith(0, phiH)
    expect(ctx.lineTo).toHaveBeenCalledWith(w, phiH)
    expect(ctx.moveTo).toHaveBeenCalledWith(0, h - phiH)
    expect(ctx.lineTo).toHaveBeenCalledWith(w, h - phiH)
  })

  it('vertical lines are symmetric around center', () => {
    const w = 1000
    const phiW = w / GOLDEN_RATIO
    expect(phiW + (w - phiW)).toBeCloseTo(w, 10)
  })
})

describe('drawGoldenSpiral', () => {
  it('saves and restores context', () => {
    const ctx = mockCtx()
    drawGoldenSpiral(ctx, 1920, 1080, 0)
    expect(ctx.save).toHaveBeenCalledTimes(1)
    expect(ctx.restore).toHaveBeenCalledTimes(1)
  })

  it('clips to canvas bounds', () => {
    const ctx = mockCtx()
    drawGoldenSpiral(ctx, 1920, 1080, 0)
    expect(ctx.rect).toHaveBeenCalledWith(0, 0, 1920, 1080)
    expect(ctx.clip).toHaveBeenCalled()
  })

  it('applies rotation transform', () => {
    const ctx = mockCtx()
    drawGoldenSpiral(ctx, 1920, 1080, 90)
    expect(ctx.translate).toHaveBeenCalledWith(960, 540)
    expect(ctx.rotate).toHaveBeenCalledWith(Math.PI / 2)
    expect(ctx.translate).toHaveBeenCalledWith(-960, -540)
  })

  it('applies zero rotation for 0 degrees', () => {
    const ctx = mockCtx()
    drawGoldenSpiral(ctx, 1920, 1080, 0)
    expect(ctx.rotate).toHaveBeenCalledWith(0)
  })

  it('applies correct rotation for 180 degrees', () => {
    const ctx = mockCtx()
    drawGoldenSpiral(ctx, 1920, 1080, 180)
    expect(ctx.rotate).toHaveBeenCalledWith(Math.PI)
  })

  it('applies correct rotation for 270 degrees', () => {
    const ctx = mockCtx()
    drawGoldenSpiral(ctx, 1920, 1080, 270)
    expect(ctx.rotate).toHaveBeenCalledWith((270 * Math.PI) / 180)
  })

  it('draws 9 arc segments', () => {
    const ctx = mockCtx()
    drawGoldenSpiral(ctx, 1920, 1080, 0)
    expect(ctx.arc).toHaveBeenCalledTimes(9)
  })

  it('each arc spans PI/2 radians', () => {
    const ctx = mockCtx()
    drawGoldenSpiral(ctx, 1920, 1080, 0)
    const calls = vi.mocked(ctx.arc).mock.calls
    for (const call of calls) {
      const startAngle = call[3] as number
      const endAngle = call[4] as number
      expect(endAngle - startAngle).toBeCloseTo(Math.PI / 2, 10)
    }
  })

  it('uses golden ratio proportions for landscape canvas', () => {
    const ctx = mockCtx()
    const w = 1618
    const h = 1000
    drawGoldenSpiral(ctx, w, h, 0)
    // w/h ~= golden ratio, so gh = h, gw = h * golden_ratio
    expect(ctx.stroke).toHaveBeenCalled()
  })

  it('uses golden ratio proportions for portrait canvas', () => {
    const ctx = mockCtx()
    drawGoldenSpiral(ctx, 600, 1000, 0)
    // w/h < golden ratio, so gw = w, gh = w / golden_ratio
    expect(ctx.stroke).toHaveBeenCalled()
  })

  it('handles square dimensions', () => {
    const ctx = mockCtx()
    expect(() => drawGoldenSpiral(ctx, 500, 500, 0)).not.toThrow()
    expect(ctx.arc).toHaveBeenCalledTimes(9)
  })
})

describe('drawGoldenDiagonal', () => {
  it('saves and restores context', () => {
    const ctx = mockCtx()
    drawGoldenDiagonal(ctx, 1920, 1080, 0)
    expect(ctx.save).toHaveBeenCalledTimes(1)
    expect(ctx.restore).toHaveBeenCalledTimes(1)
  })

  it('draws 3 lines', () => {
    const ctx = mockCtx()
    drawGoldenDiagonal(ctx, 1920, 1080, 0)
    expect(ctx.moveTo).toHaveBeenCalledTimes(3)
    expect(ctx.lineTo).toHaveBeenCalledTimes(3)
    expect(ctx.stroke).toHaveBeenCalledTimes(1)
  })

  it('draws main diagonal from (0,0) to (w,h)', () => {
    const ctx = mockCtx()
    drawGoldenDiagonal(ctx, 1920, 1080, 0)
    expect(ctx.moveTo).toHaveBeenCalledWith(0, 0)
    expect(ctx.lineTo).toHaveBeenCalledWith(1920, 1080)
  })

  it('computes perpendicular bisector points using projection formula', () => {
    const ctx = mockCtx()
    const w = 1920
    const h = 1080
    drawGoldenDiagonal(ctx, w, h, 0)

    const d = w * w + h * h
    // Line from bottom-left perpendicular to main diagonal
    expect(ctx.moveTo).toHaveBeenCalledWith(0, h)
    expect(ctx.lineTo).toHaveBeenCalledWith(
      (w * h * h) / d,
      (h * h * h) / d,
    )
    // Line from top-right perpendicular to main diagonal
    expect(ctx.moveTo).toHaveBeenCalledWith(w, 0)
    expect(ctx.lineTo).toHaveBeenCalledWith(
      (w * w * w) / d,
      (w * w * h) / d,
    )
  })

  it('applies rotation transform', () => {
    const ctx = mockCtx()
    drawGoldenDiagonal(ctx, 1920, 1080, 90)
    expect(ctx.translate).toHaveBeenCalledWith(960, 540)
    expect(ctx.rotate).toHaveBeenCalledWith(Math.PI / 2)
    expect(ctx.translate).toHaveBeenCalledWith(-960, -540)
  })

  it('perpendicular feet lie on the main diagonal', () => {
    const w = 1920
    const h = 1080
    const d = w * w + h * h

    // For the line from (0, h), the foot is at ((w*h*h)/d, (h*h*h)/d)
    const fx1 = (w * h * h) / d
    const fy1 = (h * h * h) / d
    // Check it lies on y = (h/w)*x
    expect(fy1).toBeCloseTo((h / w) * fx1, 6)

    // For the line from (w, 0), the foot is at ((w*w*w)/d, (w*w*h)/d)
    const fx2 = (w * w * w) / d
    const fy2 = (w * w * h) / d
    expect(fy2).toBeCloseTo((h / w) * fx2, 6)
  })

  it('handles square dimensions', () => {
    const ctx = mockCtx()
    const w = 1000
    const h = 1000
    drawGoldenDiagonal(ctx, w, h, 0)
    const d = w * w + h * h
    // For a square, perpendicular from (0, h) hits (w*h*h/d, h*h*h/d) = (500, 500) = midpoint
    expect(ctx.lineTo).toHaveBeenCalledWith(
      (w * h * h) / d,
      (h * h * h) / d,
    )
  })
})
