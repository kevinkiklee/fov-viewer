'use client'

import { useRef, useCallback } from 'react'
import { Cropper, type CropperRef } from 'react-advanced-cropper'
import 'react-advanced-cropper/dist/style.css'
import type { CropState, GridType, GridOptions, AspectRatioType } from './types'
import { CustomStencil } from './CustomStencil'
import styles from './CropView.module.css'

interface CropViewProps {
  image: HTMLImageElement
  aspectRatio: AspectRatioType
  onCropChange: (crop: CropState) => void
  activeGrids: GridType[]
  options: GridOptions
}

export function CropView({ image, aspectRatio, onCropChange, activeGrids, options }: CropViewProps) {
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

  const numericRatio = aspectRatio === 'original' 
    ? image.naturalWidth / image.naturalHeight 
    : aspectRatio

  return (
    <div className={styles.wrapper} style={{ '--crop-color': options.color } as React.CSSProperties}>
      <Cropper
        key={String(numericRatio)}
        ref={cropperRef}
        src={image.src}
        defaultSize={({ imageSize }) => ({
          width: imageSize.width,
          height: imageSize.height,
        })}
        stencilComponent={CustomStencil}
        stencilProps={{
          aspectRatio: numericRatio ?? undefined,
          activeGrids,
          options,
        }}
        onChange={handleChange}
        className={styles.cropper}
      />
    </div>
  )
}
