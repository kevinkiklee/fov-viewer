import jpeg from 'jpeg-js'
import UPNG from 'upng-js'

const MAX_TILE_PIXELS = 16_000_000

/**
 * Renders a scene to a full-resolution image blob using tiled canvas rendering.
 * Bypasses iOS Safari's ~16M pixel canvas limit by rendering in horizontal strips,
 * reading pixel data from each strip, and encoding with pure-JS encoders.
 */
export async function renderTiledExport(
  width: number,
  height: number,
  drawScene: (ctx: CanvasRenderingContext2D) => void,
  mimeType: string,
): Promise<Blob> {
  const tileH = Math.min(height, Math.floor(MAX_TILE_PIXELS / width))
  const rgba = new Uint8Array(width * height * 4)

  for (let y = 0; y < height; y += tileH) {
    const h = Math.min(tileH, height - y)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    ctx.translate(0, -y)
    drawScene(ctx)
    const imageData = ctx.getImageData(0, 0, width, h)
    rgba.set(new Uint8Array(imageData.data.buffer), y * width * 4)
    // Yield to keep the UI responsive between tiles
    await new Promise((r) => setTimeout(r, 0))
  }

  if (mimeType === 'image/png') {
    const pngBuffer = UPNG.encode([rgba.buffer], width, height, 0)
    return new Blob([pngBuffer], { type: 'image/png' })
  }

  const jpegData = jpeg.encode({ data: rgba, width, height }, 100)
  return new Blob([new Uint8Array(jpegData.data)], { type: 'image/jpeg' })
}

/** Threshold in pixels above which tiled export is needed */
export const TILED_EXPORT_THRESHOLD = MAX_TILE_PIXELS
