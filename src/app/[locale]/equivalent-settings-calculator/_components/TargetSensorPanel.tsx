'use client'

import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { SENSORS } from '@/lib/data/sensors'
import s from './EquivalentSettings.module.css'

interface TargetSensorPanelProps {
  selectedIds: Set<string>
  excludeId: string
  onChange: (ids: Set<string>) => void
}

export function TargetSensorPanel({ selectedIds, excludeId, onChange }: TargetSensorPanelProps) {
  const t = useTranslations('toolUI.equivalent-settings-calculator')
  const sensorsT = useTranslations('common.sensors')

  const toggle = useCallback((id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    onChange(next)
  }, [selectedIds, onChange])

  return (
    <div className={s.panel}>
      <h3 className={s.panelTitle}>{t('targetSensors')}</h3>
      <div className={s.checkboxList}>
        {SENSORS.filter((sensor) => sensor.id !== excludeId).map((sensor) => (
          <label key={sensor.id} className={s.checkboxItem}>
            <input
              type="checkbox"
              checked={selectedIds.has(sensor.id)}
              onChange={() => toggle(sensor.id)}
            />
            <span className={s.colorDot} style={{ background: sensor.color }} />
            <span>{sensorsT.has(sensor.id) ? sensorsT(sensor.id) : sensor.name}</span>
            <span className={s.cropLabel}>({sensor.cropFactor}x)</span>
          </label>
        ))}
      </div>
    </div>
  )
}
