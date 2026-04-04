'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import styles from './PhotoPicker.module.css'

interface PhotoPickerProps {
  onColorPick: (hex: string) => void
  onClose: () => void
  /** Pre-selected file to load immediately */
  initialFile?: File
}

function getPixelColor(ctx: CanvasRenderingContext2D, x: number, y: number): string {
  const [r, g, b] = ctx.getImageData(x, y, 1, 1).data
  return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')
}

interface MagnifierState {
  // viewport position for CSS `fixed` placement
  vpX: number
  vpY: number
  hex: string
  // canvas coords for zoom source
  canvasX: number
  canvasY: number
}

export function PhotoPicker({ onColorPick, onClose, initialFile }: PhotoPickerProps) {
  const [dragOver, setDragOver] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [magnifier, setMagnifier] = useState<MagnifierState | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const magCanvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Draw image onto the main canvas, fitting within max dimensions
  const drawImage = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const maxW = window.innerWidth * 0.8
    const maxH = window.innerHeight * 0.7
    const scale = Math.min(1, maxW / img.naturalWidth, maxH / img.naturalHeight)
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  }, [])

  const loadFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const src = e.target?.result as string
        const img = new Image()
        img.onload = () => {
          imageRef.current = img
          drawImage(img)
          setImageLoaded(true)
          setMagnifier(null)
        }
        img.src = src
      }
      reader.readAsDataURL(file)
    },
    [drawImage],
  )

  // Load initial file if provided
  useEffect(() => {
    if (initialFile) loadFile(initialFile)
  }, [initialFile, loadFile])

  // Redraw on window resize when image is loaded
  useEffect(() => {
    if (!imageLoaded) return
    const handleResize = () => {
      if (imageRef.current) drawImage(imageRef.current)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [imageLoaded, drawImage])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Draw magnifier zoom
  const drawMagnifier = useCallback(
    (canvasX: number, canvasY: number) => {
      const magCanvas = magCanvasRef.current
      const srcCanvas = canvasRef.current
      if (!magCanvas || !srcCanvas) return
      const zoom = 4
      const srcSize = 20 // 20x20 source pixels → 80px magnifier canvas
      const magSize = srcSize * zoom
      magCanvas.width = magSize
      magCanvas.height = magSize
      const ctx = magCanvas.getContext('2d')
      if (!ctx) return
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(
        srcCanvas,
        canvasX - srcSize / 2,
        canvasY - srcSize / 2,
        srcSize,
        srcSize,
        0,
        0,
        magSize,
        magSize,
      )
      // Crosshair lines
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(magSize / 2, 0)
      ctx.lineTo(magSize / 2, magSize)
      ctx.moveTo(0, magSize / 2)
      ctx.lineTo(magSize, magSize / 2)
      ctx.stroke()
    },
    [],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      // Scale from CSS display size to canvas pixel coords
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const canvasX = Math.round((e.clientX - rect.left) * scaleX)
      const canvasY = Math.round((e.clientY - rect.top) * scaleY)
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const hex = getPixelColor(ctx, canvasX, canvasY)

      // Position magnifier offset from cursor so it doesn't cover the pick point
      const offsetX = 50
      const offsetY = -90
      let vpX = e.clientX + offsetX
      let vpY = e.clientY + offsetY
      // Keep magnifier within viewport
      const magDiameter = 80
      if (vpX + magDiameter > window.innerWidth) vpX = e.clientX - offsetX - magDiameter
      if (vpY < 0) vpY = e.clientY + 20

      setMagnifier({ vpX, vpY, hex, canvasX, canvasY })
      drawMagnifier(canvasX, canvasY)
    },
    [drawMagnifier],
  )

  const handlePointerLeave = useCallback(() => {
    setMagnifier(null)
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const canvasX = Math.round((e.clientX - rect.left) * scaleX)
      const canvasY = Math.round((e.clientY - rect.top) * scaleY)
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const hex = getPixelColor(ctx, canvasX, canvasY)
      onColorPick(hex)
      onClose()
    },
    [onColorPick, onClose],
  )

  // Drop zone handlers
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) loadFile(file)
    },
    [loadFile],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => setDragOver(false), [])

  const handleDropZoneClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) loadFile(file)
    },
    [loadFile],
  )

  const handleChangePhoto = useCallback(() => {
    setImageLoaded(false)
    setMagnifier(null)
    // Reset the canvas
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx?.clearRect(0, 0, canvas.width, canvas.height)
    }
    setTimeout(() => fileInputRef.current?.click(), 0)
  }, [])

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Pick color from photo"
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <h3 className={styles.title}>Pick color from photo</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">&times;</button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleInputChange}
        />

        {!imageLoaded && (
          /* Drop zone */
          <div
            className={`${styles.dropZone} ${dragOver ? styles.dropZoneDragOver : ''}`}
            onClick={handleDropZoneClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            role="button"
            tabIndex={0}
            aria-label="Drop a photo here or click to browse"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleDropZoneClick()
            }}
          >
            <span className={styles.dropIcon}>📷</span>
            <span className={styles.dropPrompt}>Drop a photo here or click to browse</span>
            <span className={styles.dropPromptMobile}>Tap to choose a photo</span>
            <span className={styles.dropSub}>Tap anywhere on the photo to sample that color</span>
          </div>
        )}

        {/* Canvas always in DOM so drawImage can write to it before state updates */}
        <div className={styles.canvasWrapper} style={{ display: imageLoaded ? 'flex' : 'none' }}>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPointerDown={handlePointerDown}
          />
        </div>

        {imageLoaded && (
          <button className={styles.changeLink} onClick={handleChangePhoto}>
            Change photo
          </button>
        )}

        <p className={styles.privacy}>Your photo stays in your browser — nothing is uploaded</p>
      </div>

      {/* Magnifier — rendered outside the modal div so it can go over everything */}
      {magnifier && (
        <>
          <div
            className={styles.magnifier}
            style={{ left: magnifier.vpX, top: magnifier.vpY }}
          >
            <canvas
              ref={magCanvasRef}
              style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }}
            />
          </div>
          <div
            className={styles.hexBadge}
            style={{
              left: magnifier.vpX,
              top: magnifier.vpY + 86,
            }}
          >
            {magnifier.hex}
          </div>
        </>
      )}
    </div>
  )
}
