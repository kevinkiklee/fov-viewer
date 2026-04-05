'use client'

import { useTranslations } from 'next-intl'
import type { LensConfig } from '@/lib/types'
import { FOCAL_MIN } from '@/lib/data/focalLengths'
import { SENSORS, getSensor } from '@/lib/data/sensors'
import { calcEquivFocalLength } from '@/lib/math/fov'
import { ControlPanel, FocalLengthField, FieldRow, controlPanelStyles as cp } from '@/components/shared/ControlPanel'

interface LensPanelProps {
  label: string
  color: string
  config: LensConfig
  isActive: boolean
  collapsed: boolean
  onChange: (updates: Partial<LensConfig>) => void
  onFocus: () => void
  onToggleCollapse: () => void
  onRemove?: () => void
}

export function LensPanel({
  label, color, config, isActive, collapsed, onChange, onFocus, onRemove,
}: LensPanelProps) {
  const t = useTranslations('toolUI.fov-simulator')
  const sensor = getSensor(config.sensorId)
  const isCrop = sensor.cropFactor > 1
  const minFocal = isCrop ? FOCAL_MIN : 14
  const equiv = calcEquivFocalLength(config.focalLength, sensor.cropFactor)

  return (
    <ControlPanel
      title={label}
      subtitle={sensor.cropFactor !== 1 ? `≡ ${equiv}mm equiv` : undefined}
      color={color}
      active={isActive}
      border
      onAction={onRemove}
      actionLabel={`Remove ${label}`}
      onClick={onFocus}
    >
      <FocalLengthField
        value={config.focalLength}
        onChange={(focal) => onChange({ focalLength: focal })}
        color={color}
        minFocal={minFocal}
      />

      {!collapsed && (
        <FieldRow label={t('sensor')}>
          <select
            className={cp.select}
            value={config.sensorId}
            aria-label={`${label} sensor`}
            onChange={(e) => {
              const newSensor = getSensor(e.target.value)
              const newMin = newSensor.cropFactor > 1 ? FOCAL_MIN : 14
              const updates: Partial<LensConfig> = { sensorId: e.target.value }
              if (config.focalLength < newMin) updates.focalLength = newMin
              onChange(updates)
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {SENSORS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.cropFactor}×)
              </option>
            ))}
          </select>
        </FieldRow>
      )}
    </ControlPanel>
  )
}
