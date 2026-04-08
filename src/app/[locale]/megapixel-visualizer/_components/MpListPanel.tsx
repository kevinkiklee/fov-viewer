'use client'

import { useTranslations } from 'next-intl'
import { MP_PRESETS, PHONE_BINNING } from '@/lib/data/megapixelVisualizer'
import type { CustomMegapixel } from '@/lib/types'
import ss from './MegapixelVisualizer.module.css'

interface Props {
  visible: Set<string>
  customMps: CustomMegapixel[]
  onToggleMp: (id: string) => void
}

export function MpListPanel({ visible, customMps, onToggleMp }: Props) {
  const t = useTranslations('toolUI.megapixel-visualizer')

  return (
    <>
      <fieldset className={ss.controlGroup}>
        <legend className={ss.legend}>{t('megapixels')}</legend>
        <div className={ss.checkboxes}>
          {MP_PRESETS.map(p => {
            const binned = PHONE_BINNING[p.mp]
            return (
              <label key={p.id} className={ss.checkLabel}>
                <input
                  type="checkbox"
                  checked={visible.has(p.id)}
                  onChange={() => onToggleMp(p.id)}
                  data-testid={`mp-toggle-${p.id}`}
                />
                <span className={ss.checkDot} style={{ backgroundColor: p.color }} />
                <span className={ss.checkName}>{p.name}</span>
                {p.models && (
                  <span className={ss.modelTooltip} data-models={p.models}>
                    ?
                  </span>
                )}
                {binned && (
                  <span className={ss.binningNote}>
                    {t('phoneBinningNote', { advertised: p.mp, effective: binned })}
                  </span>
                )}
              </label>
            )
          })}
        </div>
      </fieldset>

      {customMps.length > 0 && (
        <>
          <div className={ss.sectionLabel}>{t('customMegapixels')}</div>
          <div className={ss.checkboxes}>
            {customMps.map(c => (
              <label key={c.id} className={ss.checkLabel}>
                <input
                  type="checkbox"
                  checked={visible.has(c.id)}
                  onChange={() => onToggleMp(c.id)}
                  data-testid={`custom-mp-toggle-${c.id}`}
                />
                <span className={ss.checkDot} style={{ backgroundColor: c.color }} />
                <span className={ss.checkName}>
                  {c.name} ({c.mp} MP)
                </span>
              </label>
            ))}
          </div>
        </>
      )}
    </>
  )
}
