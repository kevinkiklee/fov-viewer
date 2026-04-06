import { describe, it, expect, vi } from 'vitest'
import {
  drawRuleOfThirds,
  drawDiagonalLines,
  drawCenterCross,
  drawSquareGrid,
  drawTriangles,
} from './grid-basic'

function mockCtx() {
  return {
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
  } as unknown as CanvasRenderingContext2D
}

describe('drawRuleOfThirds', () => {
  it('draws 4 lines (2 vertical, 2 horizontal)', () => {
    const ctx = mockCtx()
    drawRuleOfThirds(ctx, 1920, 1080)
    expect(ctx.beginPath).toHaveBeenCalledTimes(1)
    expect(ctx.moveTo).toHaveBeenCalledTimes(4)
    expect(ctx.lineTo).toHaveBeenCalledTimes(4)
    expect(ctx.stroke).toHaveBeenCalledTimes(1)
  })

  it('places vertical lines at 1/3 and 2/3 of width', () => {
    const ctx = mockCtx()
    drawRuleOfThirds(ctx, 1920, 1080)
    expect(ctx.moveTo).toHaveBeenCalledWith(640, 0)
    expect(ctx.lineTo).toHaveBeenCalledWith(640, 1080)
    expect(ctx.moveTo).toHaveBeenCalledWith(1280, 0)
    expect(ctx.lineTo).toHaveBeenCalledWith(1280, 1080)
  })

  it('places horizontal lines at 1/3 and 2/3 of height', () => {
    const ctx = mockCtx()
    drawRuleOfThirds(ctx, 1920, 1080)
    expect(ctx.moveTo).toHaveBeenCalledWith(0, 360)
    expect(ctx.lineTo).toHaveBeenCalledWith(1920, 360)
    expect(ctx.moveTo).toHaveBeenCalledWith(0, 720)
    expect(ctx.lineTo).toHaveBeenCalledWith(1920, 720)
  })

  it('handles square dimensions', () => {
    const ctx = mockCtx()
    drawRuleOfThirds(ctx, 900, 900)
    expect(ctx.moveTo).toHaveBeenCalledWith(300, 0)
    expect(ctx.moveTo).toHaveBeenCalledWith(600, 0)
    expect(ctx.moveTo).toHaveBeenCalledWith(0, 300)
    expect(ctx.moveTo).toHaveBeenCalledWith(0, 600)
  })

  it('handles zero dimensions without error', () => {
    const ctx = mockCtx()
    expect(() => drawRuleOfThirds(ctx, 0, 0)).not.toThrow()
  })
})

describe('drawDiagonalLines', () => {
  it('draws 2 diagonal lines (corner to corner)', () => {
    const ctx = mockCtx()
    drawDiagonalLines(ctx, 1920, 1080)
    expect(ctx.beginPath).toHaveBeenCalledTimes(1)
    expect(ctx.moveTo).toHaveBeenCalledTimes(2)
    expect(ctx.lineTo).toHaveBeenCalledTimes(2)
    expect(ctx.stroke).toHaveBeenCalledTimes(1)
  })

  it('draws top-left to bottom-right diagonal', () => {
    const ctx = mockCtx()
    drawDiagonalLines(ctx, 1920, 1080)
    expect(ctx.moveTo).toHaveBeenCalledWith(0, 0)
    expect(ctx.lineTo).toHaveBeenCalledWith(1920, 1080)
  })

  it('draws top-right to bottom-left diagonal', () => {
    const ctx = mockCtx()
    drawDiagonalLines(ctx, 1920, 1080)
    expect(ctx.moveTo).toHaveBeenCalledWith(1920, 0)
    expect(ctx.lineTo).toHaveBeenCalledWith(0, 1080)
  })
})

describe('drawCenterCross', () => {
  it('draws 2 lines through the center', () => {
    const ctx = mockCtx()
    drawCenterCross(ctx, 1920, 1080)
    expect(ctx.beginPath).toHaveBeenCalledTimes(1)
    expect(ctx.moveTo).toHaveBeenCalledTimes(2)
    expect(ctx.lineTo).toHaveBeenCalledTimes(2)
    expect(ctx.stroke).toHaveBeenCalledTimes(1)
  })

  it('places vertical line at center x', () => {
    const ctx = mockCtx()
    drawCenterCross(ctx, 1920, 1080)
    expect(ctx.moveTo).toHaveBeenCalledWith(960, 0)
    expect(ctx.lineTo).toHaveBeenCalledWith(960, 1080)
  })

  it('places horizontal line at center y', () => {
    const ctx = mockCtx()
    drawCenterCross(ctx, 1920, 1080)
    expect(ctx.moveTo).toHaveBeenCalledWith(0, 540)
    expect(ctx.lineTo).toHaveBeenCalledWith(1920, 540)
  })

  it('handles odd dimensions', () => {
    const ctx = mockCtx()
    drawCenterCross(ctx, 101, 201)
    expect(ctx.moveTo).toHaveBeenCalledWith(50.5, 0)
    expect(ctx.moveTo).toHaveBeenCalledWith(0, 100.5)
  })
})

describe('drawSquareGrid', () => {
  it('draws correct number of lines for density 4', () => {
    const ctx = mockCtx()
    drawSquareGrid(ctx, 1200, 800, 4)
    // 3 vertical + 3 horizontal = 6 lines
    expect(ctx.moveTo).toHaveBeenCalledTimes(6)
    expect(ctx.lineTo).toHaveBeenCalledTimes(6)
    expect(ctx.stroke).toHaveBeenCalledTimes(1)
  })

  it('spaces lines evenly for density 3', () => {
    const ctx = mockCtx()
    drawSquareGrid(ctx, 900, 600, 3)
    // stepX = 300, stepY = 200
    expect(ctx.moveTo).toHaveBeenCalledWith(300, 0)
    expect(ctx.lineTo).toHaveBeenCalledWith(300, 600)
    expect(ctx.moveTo).toHaveBeenCalledWith(600, 0)
    expect(ctx.lineTo).toHaveBeenCalledWith(600, 600)
    expect(ctx.moveTo).toHaveBeenCalledWith(0, 200)
    expect(ctx.lineTo).toHaveBeenCalledWith(900, 200)
    expect(ctx.moveTo).toHaveBeenCalledWith(0, 400)
    expect(ctx.lineTo).toHaveBeenCalledWith(900, 400)
  })

  it('draws no lines for density 1', () => {
    const ctx = mockCtx()
    drawSquareGrid(ctx, 800, 600, 1)
    expect(ctx.moveTo).not.toHaveBeenCalled()
    expect(ctx.lineTo).not.toHaveBeenCalled()
    expect(ctx.stroke).toHaveBeenCalledTimes(1)
  })

  it('draws many lines for high density', () => {
    const ctx = mockCtx()
    drawSquareGrid(ctx, 1000, 1000, 10)
    // 9 vertical + 9 horizontal = 18 lines
    expect(ctx.moveTo).toHaveBeenCalledTimes(18)
    expect(ctx.lineTo).toHaveBeenCalledTimes(18)
  })
})

describe('drawTriangles', () => {
  it('draws 4 diagonal lines', () => {
    const ctx = mockCtx()
    drawTriangles(ctx, 1920, 1080)
    expect(ctx.beginPath).toHaveBeenCalledTimes(1)
    expect(ctx.moveTo).toHaveBeenCalledTimes(4)
    expect(ctx.lineTo).toHaveBeenCalledTimes(4)
    expect(ctx.stroke).toHaveBeenCalledTimes(1)
  })

  it('draws lines from all four corners to opposite corners', () => {
    const ctx = mockCtx()
    drawTriangles(ctx, 1920, 1080)
    // top-left to bottom-right
    expect(ctx.moveTo).toHaveBeenCalledWith(0, 0)
    expect(ctx.lineTo).toHaveBeenCalledWith(1920, 1080)
    // top-right to bottom-left
    expect(ctx.moveTo).toHaveBeenCalledWith(1920, 0)
    expect(ctx.lineTo).toHaveBeenCalledWith(0, 1080)
    // bottom-left to top-right
    expect(ctx.moveTo).toHaveBeenCalledWith(0, 1080)
    expect(ctx.lineTo).toHaveBeenCalledWith(1920, 0)
    // bottom-right to top-left
    expect(ctx.moveTo).toHaveBeenCalledWith(1920, 1080)
    expect(ctx.lineTo).toHaveBeenCalledWith(0, 0)
  })
})
