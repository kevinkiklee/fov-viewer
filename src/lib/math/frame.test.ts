import { describe, it, expect, vi } from 'vitest'
import {
  drawSolidBorder,
  drawGradientBorder,
  drawTextureBorder,
  drawInnerMat,
  drawShadow,
  generateTexture,
  computeExportDimensions,
  TEXTURE_PRESETS,
} from './frame'

function mockCtx() {
  return {
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    rect: vi.fn(),
    fillRect: vi.fn(),
    roundRect: vi.fn(),
    clip: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    shadowColor: '',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    globalAlpha: 1,
    putImageData: vi.fn(),
    createImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(16),
      width: 2,
      height: 2,
    })),
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(16),
      width: 2,
      height: 2,
    })),
  } as unknown as CanvasRenderingContext2D
}

describe('computeExportDimensions', () => {
  it('adds border width on all sides', () => {
    const { width, height } = computeExportDimensions(800, 600, 20, 0)
    expect(width).toBe(840)
    expect(height).toBe(640)
  })

  it('adds inner mat width when present', () => {
    const { width, height } = computeExportDimensions(800, 600, 20, 5)
    expect(width).toBe(850)
    expect(height).toBe(650)
  })

  it('returns original dimensions with zero border', () => {
    const { width, height } = computeExportDimensions(800, 600, 0, 0)
    expect(width).toBe(800)
    expect(height).toBe(600)
  })
})

describe('drawSolidBorder', () => {
  it('fills the canvas with the border color', () => {
    const ctx = mockCtx()
    drawSolidBorder(ctx, 840, 640, '#ffffff', 0)
    expect(ctx.fillRect).toHaveBeenCalled()
    expect(ctx.fillStyle).toBe('#ffffff')
  })

  it('applies corner radius when > 0', () => {
    const ctx = mockCtx()
    drawSolidBorder(ctx, 840, 640, '#ffffff', 10)
    expect(ctx.roundRect).toHaveBeenCalled()
  })
})

describe('drawGradientBorder', () => {
  it('creates a linear gradient for non-radial directions', () => {
    const ctx = mockCtx()
    drawGradientBorder(ctx, 840, 640, '#ff0000', '#0000ff', 'top', 0)
    expect(ctx.createLinearGradient).toHaveBeenCalled()
  })

  it('creates a radial gradient for radial direction', () => {
    const ctx = mockCtx()
    drawGradientBorder(ctx, 840, 640, '#ff0000', '#0000ff', 'radial', 0)
    expect(ctx.createRadialGradient).toHaveBeenCalled()
  })
})

describe('drawInnerMat', () => {
  it('draws a rectangular mat around the image area', () => {
    const ctx = mockCtx()
    drawInnerMat(ctx, 840, 640, 20, 0, 4, '#cccccc')
    expect(ctx.fillRect).toHaveBeenCalled()
    expect(ctx.fillStyle).toBe('#cccccc')
  })
})

describe('drawShadow', () => {
  it('sets shadow properties on context', () => {
    const ctx = mockCtx()
    drawShadow(ctx, 840, 640, 20, 0, {
      color: '#000000',
      blur: 20,
      offsetX: 0,
      offsetY: 4,
    })
    expect(ctx.shadowColor).toBe('#000000')
    expect(ctx.shadowBlur).toBe(20)
  })
})

describe('generateTexture', () => {
  it('returns a function', () => {
    expect(typeof generateTexture).toBe('function')
  })
})

describe('TEXTURE_PRESETS', () => {
  it('contains all 6 preset types', () => {
    expect(Object.keys(TEXTURE_PRESETS)).toHaveLength(6)
    expect(TEXTURE_PRESETS).toHaveProperty('linen')
    expect(TEXTURE_PRESETS).toHaveProperty('film-grain')
    expect(TEXTURE_PRESETS).toHaveProperty('canvas')
    expect(TEXTURE_PRESETS).toHaveProperty('paper')
    expect(TEXTURE_PRESETS).toHaveProperty('wood')
    expect(TEXTURE_PRESETS).toHaveProperty('marble')
  })
})
