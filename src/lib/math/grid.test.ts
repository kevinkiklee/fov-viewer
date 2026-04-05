import { describe, it, expect, vi } from 'vitest'
import {
  drawRuleOfThirds,
  drawGoldenRatio,
  drawGoldenSpiral,
  drawGoldenDiagonal,
  drawDiagonalLines,
  drawCenterCross,
  drawSquareGrid,
  drawTriangles,
  GOLDEN_RATIO,
} from './grid'

function mockCtx() {
  return {
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    strokeStyle: '',
    lineWidth: 0,
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D
}

describe('drawRuleOfThirds', () => {
  it('draws 4 lines (2 horizontal + 2 vertical)', () => {
    const ctx = mockCtx()
    drawRuleOfThirds(ctx, 300, 200)
    expect(ctx.moveTo).toHaveBeenCalledTimes(4)
    expect(ctx.lineTo).toHaveBeenCalledTimes(4)
  })

  it('horizontal lines at 1/3 and 2/3 height', () => {
    const ctx = mockCtx()
    drawRuleOfThirds(ctx, 300, 300)
    const moveCalls = vi.mocked(ctx.moveTo).mock.calls
    expect(moveCalls).toContainEqual([0, 100])
    expect(moveCalls).toContainEqual([0, 200])
  })

  it('vertical lines at 1/3 and 2/3 width', () => {
    const ctx = mockCtx()
    drawRuleOfThirds(ctx, 300, 300)
    const moveCalls = vi.mocked(ctx.moveTo).mock.calls
    expect(moveCalls).toContainEqual([100, 0])
    expect(moveCalls).toContainEqual([200, 0])
  })
})

describe('drawGoldenRatio', () => {
  it('draws 4 lines based on phi', () => {
    const ctx = mockCtx()
    drawGoldenRatio(ctx, 400, 300)
    expect(ctx.moveTo).toHaveBeenCalledTimes(4)
    expect(ctx.lineTo).toHaveBeenCalledTimes(4)
  })

  it('vertical lines are placed at 1/phi and 1-1/phi of width', () => {
    const ctx = mockCtx()
    drawGoldenRatio(ctx, 400, 300)
    const moveCalls = vi.mocked(ctx.moveTo).mock.calls
    const phiPos = 400 / GOLDEN_RATIO
    expect(moveCalls).toContainEqual([expect.closeTo(phiPos, 0), 0])
    expect(moveCalls).toContainEqual([expect.closeTo(400 - phiPos, 0), 0])
  })
})

describe('drawGoldenSpiral', () => {
  it('draws arc segments', () => {
    const ctx = mockCtx()
    drawGoldenSpiral(ctx, 400, 300, 0)
    expect(ctx.arc).toHaveBeenCalled()
  })

  it('accepts rotation parameter', () => {
    const ctx = mockCtx()
    drawGoldenSpiral(ctx, 400, 300, 90)
    expect(ctx.rotate).toHaveBeenCalled()
  })
})

describe('drawDiagonalLines', () => {
  it('draws 2 diagonal lines corner to corner', () => {
    const ctx = mockCtx()
    drawDiagonalLines(ctx, 400, 300)
    expect(ctx.moveTo).toHaveBeenCalledTimes(2)
    expect(ctx.lineTo).toHaveBeenCalledTimes(2)
  })

  it('goes from (0,0) to (w,h) and (w,0) to (0,h)', () => {
    const ctx = mockCtx()
    drawDiagonalLines(ctx, 400, 300)
    const moveCalls = vi.mocked(ctx.moveTo).mock.calls
    const lineCalls = vi.mocked(ctx.lineTo).mock.calls
    expect(moveCalls).toContainEqual([0, 0])
    expect(lineCalls).toContainEqual([400, 300])
    expect(moveCalls).toContainEqual([400, 0])
    expect(lineCalls).toContainEqual([0, 300])
  })
})

describe('drawCenterCross', () => {
  it('draws 2 lines (horizontal + vertical center)', () => {
    const ctx = mockCtx()
    drawCenterCross(ctx, 400, 300)
    expect(ctx.moveTo).toHaveBeenCalledTimes(2)
    expect(ctx.lineTo).toHaveBeenCalledTimes(2)
  })

  it('cross is at center of dimensions', () => {
    const ctx = mockCtx()
    drawCenterCross(ctx, 400, 300)
    const moveCalls = vi.mocked(ctx.moveTo).mock.calls
    const lineCalls = vi.mocked(ctx.lineTo).mock.calls
    expect(moveCalls).toContainEqual([200, 0])
    expect(lineCalls).toContainEqual([200, 300])
    expect(moveCalls).toContainEqual([0, 150])
    expect(lineCalls).toContainEqual([400, 150])
  })
})

describe('drawSquareGrid', () => {
  it('draws NxN grid lines', () => {
    const ctx = mockCtx()
    drawSquareGrid(ctx, 400, 400, 4)
    expect(ctx.moveTo).toHaveBeenCalledTimes(6)
    expect(ctx.lineTo).toHaveBeenCalledTimes(6)
  })

  it('handles density of 2 (single cross)', () => {
    const ctx = mockCtx()
    drawSquareGrid(ctx, 400, 400, 2)
    expect(ctx.moveTo).toHaveBeenCalledTimes(2)
  })
})

describe('drawTriangles', () => {
  it('draws dynamic symmetry triangle lines', () => {
    const ctx = mockCtx()
    drawTriangles(ctx, 400, 300)
    expect(ctx.moveTo).toHaveBeenCalled()
    expect(ctx.lineTo).toHaveBeenCalled()
  })
})

describe('drawGoldenDiagonal', () => {
  it('draws main diagonal and two perpendiculars', () => {
    const ctx = mockCtx()
    drawGoldenDiagonal(ctx, 400, 300, 0)
    // 3 moveTo (main diagonal + 2 perpendiculars) and 3 lineTo
    expect(ctx.moveTo).toHaveBeenCalledTimes(3)
    expect(ctx.lineTo).toHaveBeenCalledTimes(3)
  })

  it('calls save/restore for rotation context', () => {
    const ctx = mockCtx()
    drawGoldenDiagonal(ctx, 400, 300, 90)
    expect(ctx.save).toHaveBeenCalled()
    expect(ctx.restore).toHaveBeenCalled()
    expect(ctx.rotate).toHaveBeenCalled()
  })

  it('main diagonal goes from (0,0) to (w,h) at rotation 0', () => {
    const ctx = mockCtx()
    drawGoldenDiagonal(ctx, 400, 300, 0)
    const moveCalls = vi.mocked(ctx.moveTo).mock.calls
    const lineCalls = vi.mocked(ctx.lineTo).mock.calls
    expect(moveCalls[0]).toEqual([0, 0])
    expect(lineCalls[0]).toEqual([400, 300])
  })
})

describe('GOLDEN_RATIO', () => {
  it('is approximately 1.618', () => {
    expect(GOLDEN_RATIO).toBeCloseTo(1.618, 3)
  })
})
