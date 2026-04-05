'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { DraftBanner } from '@/components/shared/DraftBanner'
import { ToolActions } from '@/components/shared/ToolActions'
import { getToolBySlug, getToolStatus } from '@/lib/data/tools'
import { ImageCanvas } from './ImageCanvas'
import { GridCanvas } from './GridCanvas'
import { CropView } from './CropView'
import { ExportDialog } from './ExportDialog'
import { FrameSidebar } from './FrameSidebar'
import type { EditorMode, GridType, GridOptions, FrameConfig, CropState, AspectRatioType } from './types'
import { DEFAULT_GRID_OPTIONS, DEFAULT_FRAME_CONFIG } from '@/lib/data/frameStudio'
import styles from './FrameStudio.module.css'

const SLUG = 'frame-studio'
const NO_FRAME_CONFIG: FrameConfig = { ...DEFAULT_FRAME_CONFIG, borderWidth: 0 }
const DEFAULT_PHOTO_URL = '/images/scenes/wildlife.jpg'

export function FrameStudio() {
  const tool = getToolBySlug(SLUG)
  const isDraft = tool ? getToolStatus(tool) === 'draft' : false

  const [mode, setMode] = useState<EditorMode>('view')
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null)
  const [originalMimeType, setOriginalMimeType] = useState('image/png')
  const [cropState, setCropState] = useState<CropState | null>(null)
  const [activeGrids, setActiveGrids] = useState<GridType[]>([])
  const [gridOffset, setGridOffset] = useState({ x: 0, y: 0 })
  const [gridOptions, setGridOptions] = useState<GridOptions>(DEFAULT_GRID_OPTIONS)
  const [frameConfig, setFrameConfig] = useState<FrameConfig>(DEFAULT_FRAME_CONFIG)
  const [canvasDims, setCanvasDims] = useState({ width: 0, height: 0, offsetX: 0, offsetY: 0 })
  const [showExport, setShowExport] = useState(false)
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('original')

  const handleFile = useCallback((file: File) => {
    setOriginalFile(file)
    setOriginalMimeType(file.type || 'image/jpeg')
    const img = new Image()
    img.onload = () => setOriginalImage(img)
    img.src = URL.createObjectURL(file)
  }, [])

  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null)
  const offsetRef = useRef(gridOffset)
  offsetRef.current = gridOffset

  const handleGridPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX, startY: e.clientY, ox: offsetRef.current.x, oy: offsetRef.current.y }
  }, [])

  const handleGridPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return
    setGridOffset({
      x: dragRef.current.ox + (e.clientX - dragRef.current.startX),
      y: dragRef.current.oy + (e.clientY - dragRef.current.startY),
    })
  }, [])

  const handleGridPointerUp = useCallback(() => { dragRef.current = null }, [])

  useEffect(() => {
    fetch(DEFAULT_PHOTO_URL)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], 'wildlife.jpg', { type: 'image/jpeg' })
        handleFile(file)
      })
      .catch((err) => console.error('Failed to load default photo', err))
  }, [handleFile])

  const handleActiveGridsChange = useCallback((grids: GridType[]) => {
    setActiveGrids(grids)
    setGridOffset({ x: 0, y: 0 })
  }, [])

  const handleResetGrid = useCallback(() => {
    setGridOffset({ x: 0, y: 0 })
  }, [])

  const handleResetEdits = useCallback(() => {
    setMode('view')
    setCropState(null)
    setActiveGrids(['rule-of-thirds'])
    setGridOptions(DEFAULT_GRID_OPTIONS)
    setGridOffset({ x: 0, y: 0 })
    setFrameConfig(DEFAULT_FRAME_CONFIG)
    setAspectRatio('original')
  }, [])

  const handleDeletePhoto = useCallback(() => {
    setOriginalFile(null)
    setOriginalImage(null)
    setShowExport(false)
    handleResetEdits()
  }, [handleResetEdits])

  const sidebarProps = {
    mode, onModeChange: setMode, onFile: handleFile,
    aspectRatio, onRatioChange: setAspectRatio, onApplyCrop: useCallback(() => setMode('view'), []),
    frameConfig, onFrameConfigChange: setFrameConfig,
    activeGrids, onActiveGridsChange: handleActiveGridsChange,
    gridOptions, onGridOptionsChange: setGridOptions,
    originalImage, onResetGrid: handleResetGrid, onResetEdits: handleResetEdits,
    onDeletePhoto: handleDeletePhoto, onExport: () => setShowExport(true),
  }

  return (
    <>
      {isDraft && <DraftBanner />}
      <div className={styles.app}>
        <div className={styles.appBody}>
          <aside className={styles.sidebar}>
            <ToolActions toolName={tool?.name ?? 'Frame Studio'} toolSlug={SLUG} onReset={handleDeletePhoto} />
            <FrameSidebar {...sidebarProps} />
          </aside>

          <main className={styles.canvasArea}>
            <section className={styles.canvasMain}>
              {originalImage ? (
                <div className={styles.canvasWrap}>
                  {mode === 'crop' ? (
                    <CropView image={originalImage} aspectRatio={aspectRatio} onCropChange={setCropState}
                      activeGrids={activeGrids} options={gridOptions} />
                  ) : (
                    <>
                      <ImageCanvas image={originalImage} crop={cropState}
                        frameConfig={mode === 'frame' ? frameConfig : NO_FRAME_CONFIG} onDimensionsChange={setCanvasDims} />
                      {activeGrids.length > 0 && canvasDims.width > 0 && (
                        <div
                          className={styles.gridOverlay}
                          style={{ left: canvasDims.offsetX, top: canvasDims.offsetY, width: canvasDims.width, height: canvasDims.height }}
                          onPointerDown={handleGridPointerDown}
                          onPointerMove={handleGridPointerMove}
                          onPointerUp={handleGridPointerUp}
                          onPointerCancel={handleGridPointerUp}
                        >
                          <GridCanvas width={canvasDims.width} height={canvasDims.height}
                            activeGrids={activeGrids} options={gridOptions} offset={gridOffset} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <span className={styles.emptyPrompt}>{/* upload prompt handled by sidebar */}</span>
              )}
            </section>
          </main>
        </div>

        <div className={styles.mobileControls}>
          <ToolActions toolName={tool?.name ?? 'Frame Studio'} toolSlug={SLUG} onReset={handleDeletePhoto} hideTitle />
          <div className={styles.mobileDivider} />
          <FrameSidebar {...sidebarProps} />
        </div>
      </div>

      {showExport && originalImage && originalFile && (
        <ExportDialog image={originalImage} crop={cropState} frameConfig={frameConfig}
          activeGrids={activeGrids} gridOptions={gridOptions} gridOffset={gridOffset}
          gridDisplaySize={{ width: canvasDims.width, height: canvasDims.height }}
          originalFile={originalFile} originalMimeType={originalMimeType}
          onClose={() => setShowExport(false)} />
      )}
    </>
  )
}
