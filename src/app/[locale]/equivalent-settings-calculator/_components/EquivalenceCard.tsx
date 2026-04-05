'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { calcDoF, type EquivalenceResult } from '@/lib/math/dof'
import { closestRealAperture, closestRealFL } from '@/lib/data/equivalentSettings'
import type { SensorPreset } from '@/lib/types'
import { formatDistance } from '@/components/shared/DistanceField'
import { MiniDofDiagram } from './MiniDofDiagram'
import s from './EquivalenceCard.module.css'

interface EquivalenceCardProps {
  sourceSensor: SensorPreset
  targetSensor: SensorPreset
  sourceFocalLength: number
  sourceAperture: number
  sourceDistance: number
  result: EquivalenceResult
}

function formatFL(mm: number): string {
  return mm % 1 === 0 ? `${mm}mm` : `${mm.toFixed(1)}mm`
}

function formatAperture(f: number): string {
  return f % 1 === 0 ? `f/${f}` : `f/${f.toFixed(1)}`
}

export function EquivalenceCard({
  sourceSensor, targetSensor,
  sourceFocalLength, sourceAperture, sourceDistance,
  result,
}: EquivalenceCardProps) {
  const t = useTranslations('toolUI.equivalent-settings-calculator')

  const warnings: string[] = []

  if (!result.isApertureRealistic) {
    const closest = closestRealAperture(result.equivalentAperture)
    warnings.push(
      t('warningUnrealisticAperture', { value: formatAperture(result.equivalentAperture) })
      + ' ' + t('warningClosestReal', { value: closestRealFL(result.equivalentFL).toString(), aperture: closest.toFixed(1) }),
    )
  }

  if (!result.isFLRealistic) {
    warnings.push(
      t('warningUnrealisticFL', { value: result.equivalentFL.toFixed(1) }),
    )
  }

  const sourceCoc = 0.03 / sourceSensor.cropFactor
  const targetCoc = 0.03 / targetSensor.cropFactor

  const sourceDoF = useMemo(() => calcDoF({
    focalLength: sourceFocalLength,
    aperture: sourceAperture,
    distance: sourceDistance,
    coc: sourceCoc,
  }), [sourceFocalLength, sourceAperture, sourceDistance, sourceCoc])

  const targetDoF = useMemo(() => calcDoF({
    focalLength: result.equivalentFL,
    aperture: result.equivalentAperture,
    distance: result.equivalentDistance,
    coc: targetCoc,
  }), [result.equivalentFL, result.equivalentAperture, result.equivalentDistance, targetCoc])

  const sourceColor = sourceSensor.color ?? '#3b82f6'
  const targetColor = targetSensor.color ?? '#10b981'

  return (
    <div className={s.card} style={{ '--card-color': targetColor } as React.CSSProperties}>
      {/* Header */}
      <div className={s.header}>
        <span className={s.colorDot} style={{ background: targetColor }} />
        <span className={s.sensorName}>{targetSensor.name}</span>
        <span className={s.cropBadge}>{targetSensor.cropFactor}x crop</span>
      </div>

      {/* Comparison grid */}
      <div className={s.grid}>
        <div className={s.column}>
          <div className={s.columnLabel}>{t('diagramSource')}</div>
          <div className={s.row}>
            <span className={s.rowLabel}>{t('sourceFocalLength')}</span>
            <span className={s.rowValue}>{formatFL(sourceFocalLength)}</span>
          </div>
          <div className={s.row}>
            <span className={s.rowLabel}>{t('sourceAperture')}</span>
            <span className={s.rowValue}>{formatAperture(sourceAperture)}</span>
          </div>
          <div className={s.row}>
            <span className={s.rowLabel}>{t('sourceDistance')}</span>
            <span className={s.rowValue}>{formatDistance(sourceDistance)}</span>
          </div>
        </div>

        <div className={s.column}>
          <div className={s.columnLabel}>{t('equivalenceCard')}</div>
          <div className={s.row}>
            <span className={s.rowLabel}>{t('equivalentFL')}</span>
            <span className={s.rowValue}>{formatFL(result.equivalentFL)}</span>
          </div>
          <div className={s.row}>
            <span className={s.rowLabel}>{t('equivalentAperture')}</span>
            <span className={s.rowValue}>{formatAperture(result.equivalentAperture)}</span>
          </div>
          <div className={s.row}>
            <span className={s.rowLabel}>{t('equivalentDistance')}</span>
            <span className={s.rowValue}>{formatDistance(result.equivalentDistance)}</span>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className={s.warnings}>
          {warnings.map((msg, i) => (
            <div key={i} className={s.warningBadge}>
              <span className={s.warningIcon}>&#9888;</span>
              <span>{msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* Mini DOF diagram */}
      <div className={s.dofSection}>
        <div className={s.dofLabel}>{t('equivalentDoF')}</div>
        <MiniDofDiagram
          sourceNear={sourceDoF.nearFocus}
          sourceFar={sourceDoF.farFocus}
          targetNear={targetDoF.nearFocus}
          targetFar={targetDoF.farFocus}
          distance={sourceDistance}
          sourceColor={sourceColor}
          targetColor={targetColor}
        />
      </div>
    </div>
  )
}
