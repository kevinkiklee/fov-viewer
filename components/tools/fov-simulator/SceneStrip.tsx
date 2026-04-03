'use client'

import { SCENES } from '@/lib/data/scenes'
import styles from './FovSimulator.module.css'

interface SceneStripProps {
  selectedIndex: number
  onChange: (index: number) => void
}

export function SceneStrip({ selectedIndex, onChange }: SceneStripProps) {
  return (
    <div className={styles.sceneStrip}>
      <span className={styles.sceneStripLabel}>Scene:</span>
      {SCENES.map((scene, i) => (
        <button
          key={scene.id}
          className={`${styles.sceneStripThumb} ${i === selectedIndex ? styles.sceneStripThumbActive : ''}`}
          onClick={() => onChange(i)}
          title={scene.name}
        >
          <img src={scene.src} alt={scene.altText} />
        </button>
      ))}
    </div>
  )
}
