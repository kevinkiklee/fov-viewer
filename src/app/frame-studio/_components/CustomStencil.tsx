'use client'

import React, { forwardRef, useRef, useImperativeHandle } from 'react'
import { RectangleStencil } from 'react-advanced-cropper'
import { getStencilCoordinates } from 'advanced-cropper'
import { GridCanvas } from './GridCanvas'
import type { GridType, GridOptions } from './types'

interface CustomStencilProps extends React.ComponentProps<typeof RectangleStencil> {
  activeGrids?: GridType[]
  options?: GridOptions
}

export const CustomStencil = forwardRef((props: CustomStencilProps, ref: React.ForwardedRef<unknown>) => {
  const { activeGrids = [], options, ...rest } = props

  const stencilRef = useRef(null)
  useImperativeHandle(ref, () => stencilRef.current)

  // Get stencil screen coordinates from the cropper state
  const state = rest.cropper?.getState?.()
  const coords = state ? getStencilCoordinates(state) : null
  const hasGrid = activeGrids.length > 0 && options && coords && coords.width > 0

  return (
    <>
      <RectangleStencil
        {...rest}
        grid={false}
        ref={stencilRef}
      />
      {hasGrid && coords && (
        <div style={{
          position: 'absolute',
          left: coords.left,
          top: coords.top,
          width: coords.width,
          height: coords.height,
          pointerEvents: 'none',
          zIndex: 10,
        }}>
          <GridCanvas
            width={Math.round(coords.width)}
            height={Math.round(coords.height)}
            activeGrids={activeGrids}
            options={options}
          />
        </div>
      )}
    </>
  )
})
