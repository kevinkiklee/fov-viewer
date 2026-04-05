'use client'

import { useTranslations } from 'next-intl'
import { APERTURES, SHUTTER_SPEEDS, ISOS } from '@/lib/data/camera'
import type { LockTarget } from './exposure-helpers'
import {
  formatShutter, dofLabelKey, motionLabelKey, noiseLabelKey,
  effectBar, dofLevel, motionLevel, noiseLevel,
} from './exposure-helpers'
import sim from './ExposureSimulator.module.css'

interface ControlsPanelProps {
  aperture: number
  apertureIdx: number
  shutter: number
  shutterIdx: number
  iso: number
  isoIdx: number
  lock: LockTarget
  totalEV: number
  onLockChange: (t: LockTarget) => void
  onApertureChange: (idx: number) => void
  onShutterChange: (idx: number) => void
  onIsoChange: (idx: number) => void
}

const LOCK_TARGETS: { key: LockTarget; labelKey: string; ariaKey: string }[] = [
  { key: 'aperture', labelKey: 'lockAperture', ariaKey: 'lockApertureLabel' },
  { key: 'shutter', labelKey: 'lockShutter', ariaKey: 'lockShutterLabel' },
  { key: 'iso', labelKey: 'lockISO', ariaKey: 'lockISOLabel' },
]

export function ExposureControlsPanel({
  aperture, apertureIdx, shutter, shutterIdx, iso, isoIdx,
  lock, totalEV, onLockChange, onApertureChange, onShutterChange, onIsoChange,
}: ControlsPanelProps) {
  const t = useTranslations('toolUI.exposure-simulator')
  return (
    <>
      <div className={sim.lockRow}>
        <span className={sim.lockLabel}>{t('lock')}</span>
        {LOCK_TARGETS.map((lt) => (
          <button
            key={lt.key}
            className={`${sim.lockBtn} ${lock === lt.key ? sim.lockBtnActive : ''}`}
            onClick={() => onLockChange(lt.key)}
            aria-pressed={lock === lt.key}
            aria-label={t(lt.ariaKey)}
          >
            {t(lt.labelKey)}
          </button>
        ))}
      </div>

      <div className={sim.field}>
        <label className={sim.fieldLabel}>
          {t('aperture')} <span className={sim.fieldValue}>f/{aperture}</span>
          {lock === 'aperture' && <span className={sim.lockIcon}> {t('locked')}</span>}
        </label>
        <input type="range" className={sim.slider} min={0} max={APERTURES.length - 1} step={1}
          value={apertureIdx} onChange={(e) => onApertureChange(Number(e.target.value))} disabled={lock === 'aperture'} />
      </div>

      <div className={sim.field}>
        <label className={sim.fieldLabel}>
          {t('shutterSpeed')} <span className={sim.fieldValue}>{formatShutter(shutter)}</span>
          {lock === 'shutter' && <span className={sim.lockIcon}> {t('locked')}</span>}
        </label>
        <input type="range" className={sim.slider} min={0} max={SHUTTER_SPEEDS.length - 1} step={1}
          value={shutterIdx} onChange={(e) => onShutterChange(Number(e.target.value))} disabled={lock === 'shutter'} />
      </div>

      <div className={sim.field}>
        <label className={sim.fieldLabel}>
          {t('iso')} <span className={sim.fieldValue}>{iso}</span>
          {lock === 'iso' && <span className={sim.lockIcon}> {t('locked')}</span>}
        </label>
        <input type="range" className={sim.slider} min={0} max={ISOS.length - 1} step={1}
          value={isoIdx} onChange={(e) => onIsoChange(Number(e.target.value))} disabled={lock === 'iso'} />
      </div>

      <div className={sim.resultCard}>
        <span className={sim.resultLabel}>{t('exposureValue')}</span>
        <span className={sim.resultValue}>{totalEV.toFixed(1)}</span>
      </div>

      <div className={sim.effects}>
        <div className={sim.effectRow}>
          <span className={sim.effectLabel}>{t('depthOfField')}</span>
          <div className={sim.effectBarBg}>
            <div className={sim.effectBar} style={{ width: effectBar(dofLevel(aperture)), backgroundColor: 'var(--accent)' }} />
          </div>
          <span className={sim.effectText}>{t(dofLabelKey(aperture))}</span>
        </div>
        <div className={sim.effectRow}>
          <span className={sim.effectLabel}>{t('motion')}</span>
          <div className={sim.effectBarBg}>
            <div className={sim.effectBar} style={{ width: effectBar(motionLevel(shutter)), backgroundColor: '#f59e0b' }} />
          </div>
          <span className={sim.effectText}>{t(motionLabelKey(shutter))}</span>
        </div>
        <div className={sim.effectRow}>
          <span className={sim.effectLabel}>{t('noise')}</span>
          <div className={sim.effectBarBg}>
            <div className={sim.effectBar} style={{ width: effectBar(noiseLevel(iso)), backgroundColor: '#ef4444' }} />
          </div>
          <span className={sim.effectText}>{t(noiseLabelKey(iso))}</span>
        </div>
      </div>
    </>
  )
}
