'use client'

import { useTranslations } from 'next-intl'
import { ModeToggle } from '@/components/shared/ModeToggle'
import type { MegapixelControlsProps, DisplayMode } from './megapixelTypes'
import { MpListPanel } from './MpListPanel'
import { ImageSettingsPanel } from './ImageSettingsPanel'
import { PrintSettingsPanel } from './PrintSettingsPanel'
import { PrintPresetPanel } from './PrintPresetPanel'
import { CropReachPanel } from './CropReachPanel'
import { CustomMegapixelForm } from './CustomMegapixelForm'

export function MegapixelSidebar(props: MegapixelControlsProps) {
  const t = useTranslations('toolUI.megapixel-visualizer')
  const {
    visible, customMps, mode,
    aspectId, units, dpi, viewingDistance, bitDepth,
    printPresetId, printOrientation, printFitMode, cropTargetId,
    onToggleMp, onModeChange, onAspectChange, onUnitsChange, onDpiChange,
    onViewingDistanceChange, onBitDepthChange,
    onPrintPresetChange, onPrintOrientationChange, onPrintFitModeChange,
    onCropTargetChange, onAddCustomMp,
  } = props

  return (
    <>
      <ModeToggle<DisplayMode>
        title={t('displayMode')}
        options={[
          { value: 'overlay', label: t('modeOverlay') },
          { value: 'side-by-side', label: t('modeSideBySide') },
          { value: 'print-preset', label: t('modePrintPreset') },
          { value: 'print-table', label: t('modePrintTable') },
        ]}
        value={mode}
        onChange={onModeChange}
      />
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
