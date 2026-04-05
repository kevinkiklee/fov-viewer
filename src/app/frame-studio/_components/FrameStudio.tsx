'use client'

import { useState, useCallback, useEffect } from 'react'
import { PhotoUploadPanel } from '@/components/shared/PhotoUploadPanel'
import { LearnPanel } from '@/components/shared/LearnPanel'
import { DraftBanner } from '@/components/shared/DraftBanner'
import { ToolActions } from '@/components/shared/ToolActions'
import { ModeToggle } from '@/components/shared/ModeToggle'
import { getToolBySlug, getToolStatus } from '@/lib/data/tools'
import { ImageCanvas } from './ImageCanvas'
import { GridCanvas } from './GridCanvas'
import { CropView } from './CropView'
import { CropPanel } from './CropPanel'
import { FramePanel } from './FramePanel'
import { GridControls } from './GridControls'
import { ExportDialog } from './ExportDialog'
import type {
  EditorMode, GridType, GridOptions, FrameConfig, CropState, AspectRatioType
} from './types'
import { DEFAULT_GRID_OPTIONS, DEFAULT_FRAME_CONFIG } from './types'
import styles from './FrameStudio.module.css'

const SLUG = 'frame-studio'

const MODE_OPTIONS: { value: EditorMode; label: string }[] = [
  { value: 'view', label: 'View' },
  { value: 'crop', label: 'Crop' },
  { value: 'frame', label: 'Frame' },
]

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

  useEffect(() => {
    fetch(DEFAULT_PHOTO_URL)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], 'wildlife.jpg', { type: 'image/jpeg' })
        handleFile(file)
      })
      .catch((err) => console.error('Failed to load default photo', err))
  }, [handleFile])

  const handleResetEdits = useCallback(() => {
    setMode('view')
    setCropState(null)
    setActiveGrids(['rule-of-thirds'])
    setGridOptions(DEFAULT_GRID_OPTIONS)
    setFrameConfig(DEFAULT_FRAME_CONFIG)
    setAspectRatio('original')
  }, [])

  const handleDeletePhoto = useCallback(() => {
    setOriginalFile(null)
    setOriginalImage(null)
    setShowExport(false)
    handleResetEdits()
  }, [handleResetEdits])

  const handleReset = useCallback(() => {
    handleDeletePhoto()
  }, [handleDeletePhoto])

  const handleApplyCrop = useCallback(() => {
    setMode('view')
  }, [])

  const sidebarControls = (
    <>
      <ModeToggle options={MODE_OPTIONS} value={mode} onChange={setMode} title="Mode" />

      {mode === 'crop' && (
        <CropPanel
          selectedRatio={aspectRatio}
          onRatioChange={setAspectRatio}
          onApply={handleApplyCrop}
        />
      )}
      {mode === 'frame' && (
        <FramePanel config={frameConfig} onChange={setFrameConfig} />
      )}

      <GridControls
        activeGrids={activeGrids}
        onActiveGridsChange={setActiveGrids}
        options={gridOptions}
        onOptionsChange={setGridOptions}
      />

      {originalImage && (
        <div className={styles.actionGroup}>
          <div className={styles.actionRow}>
            <button className={styles.secondaryBtn} onClick={handleResetEdits}>
              Reset Photo
            </button>
            <button className={styles.dangerBtn} onClick={handleDeletePhoto}>
              Delete Photo
            </button>
          </div>
          <button className={styles.exportBtn} onClick={() => setShowExport(true)}>
            Export
          </button>
        </div>
      )}
    </>
  )

  return (
    <>
      {isDraft && <DraftBanner />}
      <div className={styles.app}>
        <div className={styles.appBody}>
          {/* Desktop sidebar */}
          <aside className={styles.sidebar}>
            <ToolActions
              toolName={tool?.name ?? 'Frame Studio'}
              toolSlug={SLUG}
              onReset={handleReset}
            />
            {sidebarControls}
          </aside>

          {/* Canvas area */}
          <main className={styles.canvasArea}>
            <section className={styles.canvasMain}>
              {!originalImage ? (
                <PhotoUploadPanel
                  onFile={handleFile}
                  label="Your Photo"
                  prompt="Drop a photo here or click to browse"
                />
              ) : (
                <div className={styles.canvasWrap}>
                  {mode === 'crop' ? (
                    <CropView
                      image={originalImage}
                      aspectRatio={aspectRatio}
                      onCropChange={setCropState}
                      activeGrids={activeGrids}
                      options={gridOptions}
                    />
                  ) : (
                    <>
                      <ImageCanvas
                        image={originalImage}
                        crop={cropState}
                        frameConfig={mode === 'frame' ? frameConfig : NO_FRAME_CONFIG}
                        onDimensionsChange={setCanvasDims}
                      />
                      {activeGrids.length > 0 && canvasDims.width > 0 && (
                        <div style={{
                          position: 'absolute',
                          left: `${canvasDims.offsetX}px`,
                          top: `${canvasDims.offsetY}px`,
                          pointerEvents: 'none',
                        }}>
                          <GridCanvas
                            width={canvasDims.width}
                            height={canvasDims.height}
                            activeGrids={activeGrids}
                            options={gridOptions}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </section>
          </main>

          {/* Desktop: LearnPanel as right sidebar */}
          <div className={styles.desktopOnly}>
            <LearnPanel slug={SLUG} closable />
          </div>
        </div>

        {/* Mobile controls below canvas */}
        <div className={styles.mobileControls}>
          <ToolActions
            toolName={tool?.name ?? 'Frame Studio'}
            toolSlug={SLUG}
            onReset={handleReset}
            hideTitle
          />
          <div className={styles.mobileDivider} />
          {sidebarControls}
        </div>

        {/* Mobile: LearnPanel below controls */}
        <div className={styles.mobileOnly}>
          <LearnPanel slug={SLUG} closable />
        </div>
      </div>

      {showExport && originalImage && originalFile && (
        <ExportDialog
          image={originalImage}
          crop={cropState}
          frameConfig={frameConfig}
          activeGrids={activeGrids}
          gridOptions={gridOptions}
          originalFile={originalFile}
          originalMimeType={originalMimeType}
          onClose={() => setShowExport(false)}
        />
      )}
    </>
  )
}
