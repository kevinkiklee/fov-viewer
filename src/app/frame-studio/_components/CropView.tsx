'use client'

import { useRef, useCallback } from 'react'
import { Cropper, type CropperRef } from 'react-advanced-cropper'
import 'react-advanced-cropper/dist/style.css'
import type { CropState } from './types'
import styles from './CropView.module.css'

interface CropViewProps {
  image: HTMLImageElement
  aspectRatio: number | null
  onCropChange: (crop: CropState) => void
}

export function CropView({ image, aspectRatio, onCropChange }: CropViewProps) {
  const cropperRef = useRef<CropperRef>(null)

  const handleChange = useCallback((cropper: CropperRef) => {
    const coords = cropper.getCoordinates()
    if (coords) {
      onCropChange({
        x: coords.left,
        y: coords.top,
        width: coords.width,
        height: coords.height,
      })
    }
  }, [onCropChange])

  return (
    <div className={styles.wrapper}>
      <Cropper
        ref={cropperRef}
        src={image.src}
        stencilProps={{
          aspectRatio: aspectRatio ?? undefined,
        }}
        onChange={handleChange}
        className={styles.cropper}
      />
    </div>
  )
}
