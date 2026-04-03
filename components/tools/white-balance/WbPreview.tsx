'use client'

import { useState, useRef, useCallback } from 'react'
import { useWbRenderer } from './useWbRenderer'
import styles from './WbPreview.module.css'

const SCENES = [
  { id: 'landscape', label: 'Landscape', src: '/images/scenes/landscape-boat-lake.jpg' },
  { id: 'portrait', label: 'Portrait', src: '/images/scenes/portrait-woman.jpg' },
  { id: 'city', label: 'City Street', src: '/images/scenes/city-street.jpg' },
  { id: 'wildlife', label: 'Wildlife', src: '/images/scenes/wildlife-condor.jpg' },
  { id: 'milkyway', label: 'Milky Way', src: '/images/scenes/milky-way-night-sky.jpg' },
]

interface WbPreviewProps {
  rgb: { r: number; g: number; b: number }
  kelvin: number
}

export function WbPreview({ rgb, kelvin }: WbPreviewProps) {
  const [sceneIdx, setSceneIdx] = useState(0)
  const [customSrc, setCustomSrc] = useState<string | null>(null)
  const [customThumb, setCustomThumb] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const activeSrc = customSrc && sceneIdx === -1 ? customSrc : SCENES[sceneIdx]?.src ?? SCENES[0].src
  const { isLoading, error } = useWbRenderer(canvasRef, activeSrc, rgb)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    // Revoke previous URL
    if (customSrc) URL.revokeObjectURL(customSrc)
    const url = URL.createObjectURL(file)
    setCustomSrc(url)
    setCustomThumb(url)
    setSceneIdx(-1)
  }, [customSrc])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const selectScene = useCallback((idx: number) => {
    setSceneIdx(idx)
  }, [])

  const selectCustom = useCallback(() => {
    if (customSrc) {
      setSceneIdx(-1)
    } else {
      fileRef.current?.click()
    }
  }, [customSrc])

  return (
    <div className={styles.canvasArea}>
      <div className={styles.topbar}>
        <div className={styles.sceneStrip}>
          <span className={styles.sceneStripLabel}>Scene:</span>
          {SCENES.map((scene, idx) => (
            <button
              key={scene.id}
              className={`${styles.sceneThumb} ${idx === sceneIdx ? styles.sceneThumbActive : ''}`}
              onClick={() => selectScene(idx)}
              aria-label={`Select ${scene.label} scene`}
              title={scene.label}
            >
              <img src={scene.src} alt={scene.label} width={48} height={32} />
            </button>
          ))}
          {/* Upload / custom photo button */}
          <button
            className={`${styles.sceneThumb} ${styles.uploadThumb} ${sceneIdx === -1 ? styles.sceneThumbActive : ''}`}
            onClick={selectCustom}
            aria-label="Upload your own photo"
            title="Your photo"
          >
            {customThumb ? (
              <img src={customThumb} alt="Your photo" width={48} height={32} />
            ) : (
              <span className={styles.uploadIcon}>+</span>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
        </div>
        <span className={styles.kelvinBadge}>{kelvin}K</span>
      </div>

      <div className={styles.canvasMain}>
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
