'use client'

import { useState, useCallback } from 'react'
import { PhotoUploadPanel } from '@/components/shared/PhotoUploadPanel'
import { LearnPanel } from '@/components/shared/LearnPanel'
import { DraftBanner } from '@/components/shared/DraftBanner'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { ToolIcon } from '@/components/shared/ToolIcon'
import { ToolActions } from '@/components/shared/ToolActions'
import { getToolBySlug, getToolStatus } from '@/lib/data/tools'
import { Toolbar } from './Toolbar'
import { ImageCanvas } from './ImageCanvas'
import { GridCanvas } from './GridCanvas'
import { CropView } from './CropView'
import { CropPanel } from './CropPanel'
import { GridControls } from './GridControls'
import type {
  EditorMode, GridType, GridOptions, FrameConfig, CropState,
} from './types'
import { DEFAULT_GRID_OPTIONS, DEFAULT_FRAME_CONFIG } from './types'
import styles from './FrameStudio.module.css'

const SLUG = 'frame-studio'

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
  const [gridOpen, setGridOpen] = useState(false)
  const [canvasDims, setCanvasDims] = useState({ width: 0, height: 0, offsetX: 0, offsetY: 0 })
  const [showExport, setShowExport] = useState(false)
  const [aspectRatio, setAspectRatio] = useState<number | null>(null)

  const handleFile = useCallback((file: File) => {
    setOriginalFile(file)
    setOriginalMimeType(file.type || 'image/png')
    const img = new Image()
    img.onload = () => setOriginalImage(img)
    img.src = URL.createObjectURL(file)
  }, [])

  const handleReset = useCallback(() => {
    setMode('view')
    setOriginalFile(null)
    setOriginalImage(null)
    setCropState(null)
    setActiveGrids([])
    setGridOptions(DEFAULT_GRID_OPTIONS)
    setFrameConfig(DEFAULT_FRAME_CONFIG)
    setGridOpen(false)
    setShowExport(false)
    setAspectRatio(null)
  }, [])

  const handleApplyCrop = useCallback(() => {
    setMode('view')
  }, [])

  return (
    <>
      {isDraft && <DraftBanner />}
      <div className={styles.outer}>
        <div className={styles.main}>
          {tool && (
            <header className={styles.header}>
              <Breadcrumbs category={tool.category} toolName={tool.name} />
              <h1 className={styles.title}>
                <ToolIcon slug={SLUG} className={styles.titleIcon} />
                {tool.name}
              </h1>
              <p className={styles.description}>{tool.description}</p>
              <ToolActions toolName={tool.name} toolSlug={SLUG} onReset={handleReset} />
            </header>
          )}

          <div className={styles.editor}>
            <Toolbar
              mode={mode}
              onModeChange={setMode}
              hasImage={!!originalImage}
              gridOpen={gridOpen}
              onGridToggle={() => setGridOpen((v) => !v)}
              onExport={() => setShowExport(true)}
              onReset={handleReset}
            />

            <div className={styles.workspace}>
              {!originalImage ? (
                <PhotoUploadPanel
                  onFile={handleFile}
                  label="Your Photo"
                  prompt="Drop a photo here or click to browse"
                />
              ) : (
                <div className={styles.canvasArea}>
                  {mode === 'crop' ? (
                    <CropView
                      image={originalImage}
                      aspectRatio={aspectRatio}
                      onCropChange={setCropState}
                    />
                  ) : (
                    <>
                      <ImageCanvas
                        image={originalImage}
                        crop={cropState}
                        frameConfig={mode === 'frame' ? frameConfig : DEFAULT_FRAME_CONFIG}
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
            </div>

            {originalImage && (mode === 'crop' || mode === 'frame' || gridOpen) && (
              <div className={styles.sidePanel}>
                {mode === 'crop' && (
                  <CropPanel
                    selectedRatio={aspectRatio}
                    onRatioChange={setAspectRatio}
                    onApply={handleApplyCrop}
                  />
                )}
                {gridOpen && (
                  <GridControls
                    activeGrids={activeGrids}
                    onActiveGridsChange={setActiveGrids}
                    options={gridOptions}
                    onOptionsChange={setGridOptions}
                  />
                )}
              </div>
            )}
          </div>
        </div>
        <LearnPanel slug={SLUG} />
      </div>
    </>
  )
}
