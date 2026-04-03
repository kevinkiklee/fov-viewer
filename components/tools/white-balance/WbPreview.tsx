'use client'

import { useState, useCallback, useEffect } from 'react'
import { useWbRenderer } from './useWbRenderer'
import { WB_SCENES } from '@/lib/data/whiteBalance'
import { ScenePicker } from '@/components/shared/ScenePicker'
import styles from './WbPreview.module.css'

const scenes = WB_SCENES.map(s => ({ id: s.id, name: s.label, src: s.src }))

interface WbPreviewProps {
  rgb: { r: number; g: number; b: number }
  kelvin: number
  customSrc: string | null
  onFile: (file: File) => void
  onRemoveCustom?: () => void
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}

export function WbPreview({ rgb, kelvin, customSrc, onFile, onRemoveCustom, canvasRef }: WbPreviewProps) {
  const [sceneIdx, setSceneIdx] = useState(0)
  const [dragOver, setDragOver] = useState(false)

  // Auto-switch to custom image when one is uploaded from the sidebar
  useEffect(() => {
    if (customSrc !== null) setSceneIdx(-1)
  }, [customSrc])

  const useCustom = customSrc !== null && sceneIdx === -1
  const activeSrc = useCustom ? customSrc : WB_SCENES[sceneIdx]?.src ?? WB_SCENES[0].src
  const { isLoading, error } = useWbRenderer(canvasRef, activeSrc, rgb)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      onFile(file)
      setSceneIdx(-1)
    }
  }, [onFile])

  return (
    <div className={styles.canvasArea}>
      <div className={styles.topbar}>
        <ScenePicker
          scenes={scenes}
          selectedIndex={sceneIdx}
          onSelect={setSceneIdx}
          customSrc={customSrc}
          onCustomFile={onFile}
          onCustomRemove={onRemoveCustom}
        />
        <span className={styles.kelvinBadge}>{kelvin}K</span>
      </div>

      <div
        className={`${styles.canvasMain} ${dragOver ? styles.canvasMainDragOver : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
      >
        {error ? (
          <div className={styles.fallback}>
            <p>{error}</p>
          </div>
        ) : isLoading ? (
          <div className={styles.loading}>Loading scene...</div>
        ) : null}
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          style={{ display: error || isLoading ? 'none' : 'block' }}
        />
      </div>
    </div>
  )
}
