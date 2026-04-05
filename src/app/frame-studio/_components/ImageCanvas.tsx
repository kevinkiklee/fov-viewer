'use client'

import { useRef, useEffect, useCallback } from 'react'
import { computeExportDimensions, drawSolidBorder, drawGradientBorder, drawTextureBorder, drawInnerMat, drawShadow } from '@/lib/math/frame'
import type { FrameConfig, CropState } from './types'
import styles from './ImageCanvas.module.css'

interface ImageCanvasProps {
  image: HTMLImageElement
  crop: CropState | null
  frameConfig: FrameConfig
  onDimensionsChange?: (dims: { width: number; height: number; offsetX: number; offsetY: number }) => void
}

export function ImageCanvas({ image, crop, frameConfig, onDimensionsChange }: ImageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const onDimsRef = useRef(onDimensionsChange)
  onDimsRef.current = onDimensionsChange

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const sx = crop?.x ?? 0
    const sy = crop?.y ?? 0
    const sw = crop?.width ?? image.naturalWidth
    const sh = crop?.height ?? image.naturalHeight

    const bw = frameConfig.borderWidth
    const matW = frameConfig.innerMatEnabled ? frameConfig.innerMatWidth : 0
    const { width: exportW, height: exportH } = computeExportDimensions(sw, sh, bw, matW)

    const maxW = container.clientWidth
    const maxH = container.clientHeight
    const scale = Math.min(maxW / exportW, maxH / exportH)
    const displayW = Math.round(exportW * scale)
    const displayH = Math.round(exportH * scale)

    const dpr = window.devicePixelRatio || 1
    canvas.width = displayW * dpr
    canvas.height = displayH * dpr
    canvas.style.width = `${displayW}px`
    canvas.style.height = `${displayH}px`
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, displayW, displayH)

    if (bw > 0) {
      if (frameConfig.shadowEnabled) {
        drawShadow(ctx, displayW, displayH, bw * scale, frameConfig.cornerRadius * scale, {
          color: frameConfig.shadowColor,
          blur: frameConfig.shadowBlur * scale,
          offsetX: frameConfig.shadowOffsetX * scale,
          offsetY: frameConfig.shadowOffsetY * scale,
        })
      }

      if (frameConfig.fillType === 'solid') {
        drawSolidBorder(ctx, displayW, displayH, frameConfig.solidColor, frameConfig.cornerRadius * scale)
      } else if (frameConfig.fillType === 'gradient') {
        drawGradientBorder(ctx, displayW, displayH, frameConfig.gradientColor1, frameConfig.gradientColor2, frameConfig.gradientDirection, frameConfig.cornerRadius * scale)
      } else {
        drawTextureBorder(ctx, displayW, displayH, frameConfig.texture, frameConfig.cornerRadius * scale)
      }
    }

    if (frameConfig.innerMatEnabled && matW > 0) {
      drawInnerMat(ctx, displayW, displayH, bw * scale, frameConfig.cornerRadius * scale, matW * scale, frameConfig.innerMatColor)
    }

    const imgX = (bw + matW) * scale
    const imgY = (bw + matW) * scale
    const imgW = displayW - imgX * 2
    const imgH = displayH - imgY * 2
    ctx.drawImage(image, sx, sy, sw, sh, imgX, imgY, imgW, imgH)

    // Account for the flexbox centering of the canvas within the container
    const canvasOffsetX = (maxW - displayW) / 2
    const canvasOffsetY = (maxH - displayH) / 2

    onDimsRef.current?.({ 
      width: imgW, 
      height: imgH, 
      offsetX: canvasOffsetX + imgX, 
      offsetY: canvasOffsetY + imgY 
    })
  }, [image, crop, frameConfig])

  useEffect(() => {
    draw()

    const container = containerRef.current
    if (!container) return

    const ro = new ResizeObserver(() => draw())
    ro.observe(container)

    return () => ro.disconnect()
  }, [draw])

  return (
    <div ref={containerRef} className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}
