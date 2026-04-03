'use client'

import { useState, useRef } from 'react'
import { useExposureRenderer, type SceneAssets } from './useExposureRenderer'
import styles from './ExposurePreview.module.css'

const SCENES: { id: string; label: string; assets: SceneAssets }[] = [
  {
    id: 'street',
    label: 'Street',
    assets: {
      photo: '/images/exposure-simulator/street.jpg',
      depthMap: '/images/exposure-simulator/street-depth.png',
      motionMask: '/images/exposure-simulator/street-motion.png',
    },
  },
  {
    id: 'landscape',
    label: 'Landscape',
    assets: {
      photo: '/images/exposure-simulator/landscape.jpg',
      depthMap: '/images/exposure-simulator/landscape-depth.png',
      motionMask: '/images/exposure-simulator/landscape-motion.png',
    },
  },
  {
    id: 'portrait',
    label: 'Portrait',
    assets: {
      photo: '/images/exposure-simulator/portrait.jpg',
      depthMap: '/images/exposure-simulator/portrait-depth.png',
      motionMask: '/images/exposure-simulator/portrait-motion.png',
    },
  },
  {
    id: 'lowlight',
    label: 'Low Light',
    assets: {
      photo: '/images/exposure-simulator/lowlight.jpg',
      depthMap: '/images/exposure-simulator/lowlight-depth.png',
      motionMask: '/images/exposure-simulator/lowlight-motion.png',
    },
  },
]

interface ExposurePreviewProps {
  aperture: number
  shutterSpeed: number
  iso: number
}

export function ExposurePreview({ aperture, shutterSpeed, iso }: ExposurePreviewProps) {
  const [sceneIdx, setSceneIdx] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const currentScene = SCENES[sceneIdx]
  const { isLoading, error } = useExposureRenderer(
    canvasRef,
    currentScene.assets,
    aperture,
    shutterSpeed,
    iso
  )

  return (
    <div className={styles.canvasArea}>
      <div className={styles.topbar}>
        <div className={styles.sceneStrip}>
          <span className={styles.sceneStripLabel}>Scene:</span>
          {SCENES.map((scene, idx) => (
            <button
              key={scene.id}
              className={`${styles.sceneThumb} ${idx === sceneIdx ? styles.sceneThumbActive : ''}`}
              onClick={() => setSceneIdx(idx)}
              aria-label={`Select ${scene.label} scene`}
              title={scene.label}
            >
              <img
                src={scene.assets.photo}
                alt={scene.label}
                width={48}
                height={32}
              />
            </button>
          ))}
        </div>
      </div>

      <div className={styles.canvasMain}>
        {error ? (
          <div className={styles.fallback}>
            <img
              src={currentScene.assets.photo}
              alt={currentScene.label}
              className={styles.fallbackImg}
            />
            <p>{error}. Image effects preview is unavailable.</p>
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
