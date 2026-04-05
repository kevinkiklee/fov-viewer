'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { computeExportDimensions, drawSolidBorder, drawGradientBorder, drawTextureBorder, drawInnerMat, drawShadow } from '@/lib/math/frame'
import { transferExif } from '@/lib/utils/exif'
import {
  drawRuleOfThirds, drawGoldenRatio, drawGoldenSpiral, drawGoldenDiagonal,
  drawDiagonalLines, drawCenterCross, drawSquareGrid, drawTriangles,
  GOLDEN_RATIO,
} from '@/lib/math/grid'
import type { FrameConfig, CropState, GridType, GridOptions } from './types'
import { thicknessToPx } from './types'
import styles from './ExportDialog.module.css'

interface ExportDialogProps {
  image: HTMLImageElement
  crop: CropState | null
  frameConfig: FrameConfig
  activeGrids: GridType[]
  gridOptions: GridOptions
  gridOffset?: { x: number; y: number }
  gridDisplaySize?: { width: number; height: number }
  originalFile: File
  originalMimeType: string
  onClose: () => void
}

type DrawFn = (ctx: CanvasRenderingContext2D, w: number, h: number, opts: GridOptions) => void

const GRID_DRAW_MAP: Record<GridType, DrawFn> = {
  'rule-of-thirds': (ctx, w, h) => drawRuleOfThirds(ctx, w, h),
  'golden-ratio': (ctx, w, h) => drawGoldenRatio(ctx, w, h),
  'golden-spiral': (ctx, w, h, opts) => drawGoldenSpiral(ctx, w, h, opts.spiralRotation),
  'golden-diagonal': (ctx, w, h, opts) => drawGoldenDiagonal(ctx, w, h, opts.spiralRotation),
  'diagonal-lines': (ctx, w, h) => drawDiagonalLines(ctx, w, h),
  'center-cross': (ctx, w, h) => drawCenterCross(ctx, w, h),
  'square-grid': (ctx, w, h, opts) => drawSquareGrid(ctx, w, h, opts.gridDensity),
  'triangles': (ctx, w, h) => drawTriangles(ctx, w, h),
}

function getLinePositions(
  gridType: GridType, w: number, h: number, opts: GridOptions,
): { v: number[]; h: number[] } | null {
  switch (gridType) {
    case 'rule-of-thirds':
      return { v: [0, w / 3, 2 * w / 3], h: [0, h / 3, 2 * h / 3] }
    case 'golden-ratio': {
      const pw = w / GOLDEN_RATIO, ph = h / GOLDEN_RATIO
      return { v: [0, w - pw, pw], h: [0, h - ph, ph] }
    }
    case 'center-cross':
      return { v: [0, w / 2], h: [0, h / 2] }
    case 'square-grid':
      return {
        v: Array.from({ length: opts.gridDensity }, (_, i) => (i * w) / opts.gridDensity),
        h: Array.from({ length: opts.gridDensity }, (_, i) => (i * h) / opts.gridDensity),
      }
    default:
      return null
  }
}

function drawExportGrid(
  ctx: CanvasRenderingContext2D, gridType: GridType, drawFn: DrawFn,
  originX: number, originY: number, gw: number, gh: number,
  ox: number, oy: number, opts: GridOptions,
) {
  if (ox === 0 && oy === 0) {
    ctx.save()
    ctx.translate(originX, originY)
    ctx.beginPath()
    drawFn(ctx, gw, gh, opts)
    ctx.restore()
    return
  }

  const positions = getLinePositions(gridType, gw, gh, opts)
  if (positions) {
    ctx.beginPath()
    for (const base of positions.v) {
      const x = ((base + ox) % gw + gw) % gw
      if (x > 0.5) { ctx.moveTo(originX + x, originY); ctx.lineTo(originX + x, originY + gh) }
    }
    for (const base of positions.h) {
      const y = ((base + oy) % gh + gh) % gh
      if (y > 0.5) { ctx.moveTo(originX, originY + y); ctx.lineTo(originX + gw, originY + y) }
    }
    ctx.stroke()
  } else {
    const px = ((ox % gw) + gw) % gw
    const py = ((oy % gh) + gh) % gh
    for (let dx = -1; dx <= 0; dx++) {
      for (let dy = -1; dy <= 0; dy++) {
        ctx.save()
        ctx.translate(originX + px + dx * gw, originY + py + dy * gh)
        ctx.beginPath()
        drawFn(ctx, gw, gh, opts)
        ctx.restore()
      }
    }
  }
}

export function ExportDialog({
  image, crop, frameConfig, activeGrids, gridOptions,
  gridOffset, gridDisplaySize, originalFile, originalMimeType, onClose,
}: ExportDialogProps) {
  const t = useTranslations('toolUI.frame-studio')
  const [includeGrid, setIncludeGrid] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [closing, setClosing] = useState(false)

  const handleClose = useCallback(() => {
    setClosing(true)
    setTimeout(onClose, 150)
  }, [onClose])

  const handleExport = useCallback(async () => {
    setExporting(true)

    try {
      const sx = crop?.x ?? 0
      const sy = crop?.y ?? 0
      const sw = crop?.width ?? image.naturalWidth
      const sh = crop?.height ?? image.naturalHeight

      const bw = frameConfig.borderWidth
      const matW = frameConfig.innerMatEnabled ? frameConfig.innerMatWidth : 0
      const { width: canvasW, height: canvasH } = computeExportDimensions(sw, sh, bw, matW)

      const canvas = document.createElement('canvas')
      canvas.width = canvasW
      canvas.height = canvasH
      const ctx = canvas.getContext('2d')!

      if (frameConfig.shadowEnabled && bw > 0) {
        drawShadow(ctx, canvasW, canvasH, bw, frameConfig.cornerRadius, {
          color: frameConfig.shadowColor,
          blur: frameConfig.shadowBlur,
          offsetX: frameConfig.shadowOffsetX,
          offsetY: frameConfig.shadowOffsetY,
        })
      }

      if (bw > 0) {
        if (frameConfig.fillType === 'solid') {
          drawSolidBorder(ctx, canvasW, canvasH, frameConfig.solidColor, frameConfig.cornerRadius)
        } else if (frameConfig.fillType === 'gradient') {
          drawGradientBorder(ctx, canvasW, canvasH, frameConfig.gradientColor1, frameConfig.gradientColor2, frameConfig.gradientDirection, frameConfig.cornerRadius)
        } else {
          drawTextureBorder(ctx, canvasW, canvasH, frameConfig.texture, frameConfig.cornerRadius)
        }
      }

      if (frameConfig.innerMatEnabled && matW > 0) {
        drawInnerMat(ctx, canvasW, canvasH, bw, frameConfig.cornerRadius, matW, frameConfig.innerMatColor)
      }

      const imgX = bw + matW
      const imgY = bw + matW
      ctx.drawImage(image, sx, sy, sw, sh, imgX, imgY, sw, sh)

      if (includeGrid && activeGrids.length > 0) {
        ctx.save()
        ctx.beginPath()
        ctx.rect(imgX, imgY, sw, sh)
        ctx.clip()
        const scaleX = gridDisplaySize && gridDisplaySize.width > 0 ? sw / gridDisplaySize.width : 1
        const scaleY = gridDisplaySize && gridDisplaySize.height > 0 ? sh / gridDisplaySize.height : 1
        const ox = (gridOffset?.x ?? 0) * scaleX
        const oy = (gridOffset?.y ?? 0) * scaleY
        ctx.strokeStyle = gridOptions.color
        ctx.globalAlpha = gridOptions.opacity
        ctx.lineWidth = thicknessToPx(gridOptions.thickness)
        for (const gridType of activeGrids) {
          const drawFn = GRID_DRAW_MAP[gridType]
          if (drawFn) drawExportGrid(ctx, gridType, drawFn, imgX, imgY, sw, sh, ox, oy, gridOptions)
        }
        ctx.restore()
      }

      const quality = (originalMimeType === 'image/png') ? undefined : 0.92
      let blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (b) => resolve(b!),
          originalMimeType,
          quality,
        )
      })

      const originalBuffer = await originalFile.arrayBuffer()
      blob = await transferExif(originalBuffer, blob, originalMimeType)

      const baseName = originalFile.name.replace(/\.[^.]+$/, '')
      const ext = originalFile.name.match(/\.[^.]+$/)?.[0] ?? '.png'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${baseName}_edited${ext}`
      a.click()
      URL.revokeObjectURL(url)
      onClose()
    } finally {
      setExporting(false)
    }
  }, [image, crop, frameConfig, includeGrid, activeGrids, gridOptions, gridOffset, gridDisplaySize, originalFile, originalMimeType, onClose])

  return (
    <div className={`${styles.overlay} ${closing ? styles.closing : ''}`} onClick={handleClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>{t('exportPhoto')}</h3>

        <div className={styles.info}>
          <span>{t('format')} {originalMimeType.split('/')[1]?.toUpperCase() ?? 'PNG'}</span>
          <span>{t('quality')} {t('qualityMaximum')}</span>
        </div>

        {activeGrids.length > 0 && (
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={includeGrid}
              onChange={(e) => setIncludeGrid(e.target.checked)}
            />
            <span>{t('includeGridOverlay')}</span>
          </label>
        )}

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={handleClose}>{t('cancel')}</button>
          <button className={styles.exportBtn} onClick={handleExport} disabled={exporting}>
            {exporting ? t('exporting') : t('download')}
          </button>
        </div>
      </div>
    </div>
  )
}
