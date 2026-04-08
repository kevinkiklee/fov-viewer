'use client'

import type { MegapixelControlsProps } from './megapixelTypes'
import { MpListPanel } from './MpListPanel'
import { ImageSettingsPanel } from './ImageSettingsPanel'
import { PrintSettingsPanel } from './PrintSettingsPanel'
import { PrintPresetPanel } from './PrintPresetPanel'
import { CropReachPanel } from './CropReachPanel'
import { CustomMegapixelForm } from './CustomMegapixelForm'

export function MegapixelSidebar(props: MegapixelControlsProps) {
  const {
    visible, customMps, mode,
    aspectId, units, dpi, viewingDistance, bitDepth,
    printPresetId, printOrientation, printFitMode, cropTargetId,
    onToggleMp, onAspectChange, onUnitsChange, onDpiChange,
    onViewingDistanceChange, onBitDepthChange,
    onPrintPresetChange, onPrintOrientationChange, onPrintFitModeChange,
    onCropTargetChange, onAddCustomMp,
  } = props

  return (
    <>
      <MpListPanel
        visible={visible}
        customMps={customMps}
        onToggleMp={onToggleMp}
      />
      <CustomMegapixelForm onAdd={onAddCustomMp} />
      <ImageSettingsPanel
        aspectId={aspectId}
        units={units}
        onAspectChange={onAspectChange}
        onUnitsChange={onUnitsChange}
      />
      <PrintSettingsPanel
        dpi={dpi}
        viewingDistance={viewingDistance}
        bitDepth={bitDepth}
        onDpiChange={onDpiChange}
        onViewingDistanceChange={onViewingDistanceChange}
        onBitDepthChange={onBitDepthChange}
      />
      {mode === 'print-preset' && (
        <PrintPresetPanel
          printPresetId={printPresetId}
          printOrientation={printOrientation}
          printFitMode={printFitMode}
          units={units}
          onPrintPresetChange={onPrintPresetChange}
          onPrintOrientationChange={onPrintOrientationChange}
          onPrintFitModeChange={onPrintFitModeChange}
        />
      )}
      <CropReachPanel
        cropTargetId={cropTargetId}
        onCropTargetChange={onCropTargetChange}
      />
    </>
  )
}
