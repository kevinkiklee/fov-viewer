'use client'

import { useRef, useEffect, useCallback } from 'react'
import { calcFOV } from '@/lib/math/fov'
import { getSensor } from '@/lib/data/sensors'
import { PILLAR_COUNT, PILLAR_SPACING, PILLAR_COLORS, ACCENT_COLOR } from './compressionConstants'
import styles from './CompressionScene.module.css'

interface DiagramProps {
  focalLength: number
  sensorId: string
  distance: number
}

export function CompressionDiagram({ focalLength, sensorId, distance }: DiagramProps) {
  const diagramCanvasRef = useRef<HTMLCanvasElement>(null)

  const renderDiagram = useCallback(() => {
    const canvas = diagramCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const dpr = window.devicePixelRatio || 1

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(20, 20, 30, 1)'
    ctx.fillRect(0, 0, w, h)

    const sensor = getSensor(sensorId)
    const fov = calcFOV(focalLength, sensor.cropFactor)
    const hFovRad = (fov.horizontal * Math.PI) / 180

    const maxRange = Math.max(distance, 150) + 20
    const margin = 40 * dpr
    const usableW = w - margin * 2

    const mapX = (z: number) => margin + ((distance - z) / maxRange) * usableW
    const centerY = h / 2
    const cameraX = mapX(distance)

    const coneLen = 200
    const halfSpread = Math.tan(hFovRad / 2) * coneLen
    const coneEndX = mapX(distance - coneLen)
    const topY = centerY - (halfSpread / maxRange) * usableW
    const botY = centerY + (halfSpread / maxRange) * usableW

    ctx.save()
    ctx.globalAlpha = 0.15
    ctx.fillStyle = ACCENT_COLOR
    ctx.beginPath()
    ctx.moveTo(cameraX, centerY)
    ctx.lineTo(coneEndX, topY)
    ctx.lineTo(coneEndX, botY)
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    ctx.save()
    ctx.globalAlpha = 0.5
    ctx.strokeStyle = ACCENT_COLOR
    ctx.lineWidth = 1 * dpr
    ctx.beginPath()
    ctx.moveTo(cameraX, centerY)
    ctx.lineTo(coneEndX, topY)
    ctx.moveTo(cameraX, centerY)
    ctx.lineTo(coneEndX, botY)
    ctx.stroke()
    ctx.restore()

    for (let i = 0; i < PILLAR_COUNT; i++) {
      const pz = -(i * PILLAR_SPACING)
      const px = mapX(pz)
      const [r, g, b] = PILLAR_COLORS[i % PILLAR_COLORS.length]
      ctx.fillStyle = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`
      ctx.beginPath()
      ctx.arc(px, centerY, 4 * dpr, 0, Math.PI * 2)
      ctx.fill()

      if (i === 0) {
        ctx.fillStyle = 'white'
        ctx.font = `bold ${9 * dpr}px sans-serif`
        ctx.textAlign = 'center'
        ctx.fillText('SUBJECT', px, centerY - 10 * dpr)
      }
    }

    ctx.fillStyle = ACCENT_COLOR
    ctx.beginPath()
    const triSize = 7 * dpr
    ctx.moveTo(cameraX + triSize, centerY)
    ctx.lineTo(cameraX - triSize * 0.6, centerY - triSize * 0.8)
    ctx.lineTo(cameraX - triSize * 0.6, centerY + triSize * 0.8)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.font = `${11 * dpr}px system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(`${focalLength}mm`, cameraX, centerY - 15 * dpr)
    ctx.fillText(`${Math.round(distance)}ft`, (cameraX + mapX(0)) / 2, centerY + 18 * dpr)
  }, [focalLength, sensorId, distance])

  useEffect(() => {
    const canvas = diagramCanvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(() => {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      renderDiagram()
    })
    observer.observe(canvas.parentElement!)
    return () => observer.disconnect()
  }, [renderDiagram])

  useEffect(() => { renderDiagram() }, [renderDiagram])

  return (
    <div className={styles.diagram}>
      <canvas
        ref={diagramCanvasRef}
        className={styles.diagramCanvas}
        aria-label="Top-down compression diagram"
        role="img"
      />
    </div>
  )
}
