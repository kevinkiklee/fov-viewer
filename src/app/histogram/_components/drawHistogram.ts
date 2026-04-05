import type { HistogramData } from '@/lib/math/histogram'

export type ViewMode = 'luminance' | 'rgb' | 'channels'

export function drawHistogram(
  canvas: HTMLCanvasElement,
  hist: HistogramData,
  mode: ViewMode,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.scale(dpr, dpr)

  const w = rect.width
  const h = rect.height
  ctx.clearRect(0, 0, w, h)

  const barWidth = w / 256

  function drawChannel(data: number[], color: string, alpha: number) {
    const max = Math.max(...data)
    if (max === 0 || !ctx) return
    ctx.fillStyle = color
    ctx.globalAlpha = alpha
    for (let i = 0; i < 256; i++) {
      const barHeight = (data[i] / max) * h
      ctx.fillRect(i * barWidth, h - barHeight, barWidth + 0.5, barHeight)
    }
    ctx.globalAlpha = 1
  }

  if (mode === 'luminance') {
    drawChannel(hist.luma, '#e0e0e0', 0.8)
  } else if (mode === 'rgb') {
    drawChannel(hist.r, '#ef4444', 0.4)
    drawChannel(hist.g, '#22c55e', 0.4)
    drawChannel(hist.b, '#3b82f6', 0.4)
  } else {
    drawChannel(hist.r, '#ef4444', 0.6)
    drawChannel(hist.g, '#22c55e', 0.6)
    drawChannel(hist.b, '#3b82f6', 0.6)
    drawChannel(hist.luma, '#e0e0e0', 0.3)
  }
}
