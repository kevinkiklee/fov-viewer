'use client'

import { useTranslations } from 'next-intl'
import type { MegapixelControlsProps, DisplayMode } from './megapixelTypes'
import { MpListPanel } from './MpListPanel'
import { ImageSettingsPanel } from './ImageSettingsPanel'
import { CustomMegapixelForm } from './CustomMegapixelForm'
import ss from './MegapixelVisualizer.module.css'

const MODE_OPTIONS: { value: DisplayMode; labelKey: string }[] = [
  { value: 'overlay',      labelKey: 'modeOverlay' },
  { value: 'side-by-side', labelKey: 'modeSideBySide' },
]

export function MegapixelSidebar(props: MegapixelControlsProps) {
  const t = useTranslations('toolUI.megapixels-size-visualizer')
  const {
    visible, customMps, mode,
    aspectId, units,
    onToggleMp, onModeChange, onAspectChange, onUnitsChange,
    onAddCustomMp,
  } = props

  return (
    <>
      <fieldset className={ss.controlGroup}>
        <legend className={ss.legend}>{t('displayMode')}</legend>
        <div className={ss.modeGrid}>
          {MODE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onModeChange(opt.value)}
              className={`${ss.modeBtn} ${mode === opt.value ? ss.modeBtnActive : ''}`}
              aria-pressed={mode === opt.value}
            >
              {t(opt.labelKey)}
            </button>
          ))}
        </div>
      </fieldset>
      <div className={ss.mpListGroup}>
        <MpListPanel
          visible={visible}
          customMps={customMps}
          onToggleMp={onToggleMp}
        />
        <CustomMegapixelForm onAdd={onAddCustomMp} />
      </div>
      <ImageSettingsPanel
        aspectId={aspectId}
        units={units}
        onAspectChange={onAspectChange}
        onUnitsChange={onUnitsChange}
      />
    </>
  )
}
