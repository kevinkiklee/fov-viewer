'use client'

import { useTranslations } from 'next-intl'
import { FileDropZone } from '@/components/shared/FileDropZone'
import { ModeToggle } from '@/components/shared/ModeToggle'
import { CropPanel } from './CropPanel'
import { FramePanel } from './FramePanel'
import { GridControls } from './GridControls'
import type { EditorMode, GridType, GridOptions, FrameConfig, AspectRatioType } from './types'
import { MODE_KEYS } from '@/lib/data/frameStudio'
import styles from './FrameStudio.module.css'

interface FrameSidebarProps {
  mode: EditorMode
  onModeChange: (m: EditorMode) => void
  onFile: (f: File) => void
  aspectRatio: AspectRatioType
  onRatioChange: (r: AspectRatioType) => void
  onApplyCrop: () => void
  frameConfig: FrameConfig
  onFrameConfigChange: (c: FrameConfig) => void
  activeGrids: GridType[]
  onActiveGridsChange: (g: GridType[]) => void
  gridOptions: GridOptions
  onGridOptionsChange: (o: GridOptions) => void
  originalImage: HTMLImageElement | null
  onResetGrid: () => void
  onResetEdits: () => void
  onDeletePhoto: () => void
  onExport: () => void
}

export function FrameSidebar({
  mode, onModeChange, onFile, aspectRatio, onRatioChange, onApplyCrop,
  frameConfig, onFrameConfigChange, activeGrids, onActiveGridsChange,
  gridOptions, onGridOptionsChange, originalImage, onResetGrid,
  onResetEdits, onDeletePhoto, onExport,
}: FrameSidebarProps) {
  const t = useTranslations('toolUI.frame-studio')
  const modeOptions = MODE_KEYS.map((m) => ({ value: m.value, label: t(m.key) }))

  return (
    <>
      <div className={styles.photoSection}>
        <span className={styles.heading}>{t('photo')}</span>
        <FileDropZone onFile={onFile} prompt={t('dropPrompt')} />
      </div>

      <ModeToggle options={modeOptions} value={mode} onChange={onModeChange} title={t('mode')} />

      {mode === 'crop' && (
        <CropPanel selectedRatio={aspectRatio} onRatioChange={onRatioChange} onApply={onApplyCrop} />
      )}
      {mode === 'frame' && (
        <FramePanel config={frameConfig} onChange={onFrameConfigChange} />
      )}

      <GridControls
        activeGrids={activeGrids}
        onActiveGridsChange={onActiveGridsChange}
        options={gridOptions}
        onOptionsChange={onGridOptionsChange}
        onResetGrid={onResetGrid}
      />

      {originalImage && (
        <div className={styles.actionGroup}>
          <div className={styles.actionRow}>
            <button className={styles.secondaryBtn} onClick={onResetEdits}>{t('resetPhoto')}</button>
            <button className={styles.dangerBtn} onClick={onDeletePhoto}>{t('deletePhoto')}</button>
          </div>
          <button className={styles.exportBtn} onClick={onExport}>{t('export')}</button>
        </div>
      )}
    </>
  )
}
