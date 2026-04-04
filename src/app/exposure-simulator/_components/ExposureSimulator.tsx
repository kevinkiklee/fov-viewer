'use client'

import { useState, useMemo, useCallback } from 'react'
import { calcEV } from '@/lib/math/exposure'
import { useQueryInit, useToolQuerySync, intParam, strParam } from '@/lib/utils/querySync'
import { LearnPanel } from '@/components/shared/LearnPanel'
import { ToolActions } from '@/components/shared/ToolActions'
import { APERTURES, SHUTTER_SPEEDS, ISOS } from '@/lib/data/camera'
import { ExposurePreview } from './ExposurePreview'
import sim from './ExposureSimulator.module.css'

type LockTarget = 'aperture' | 'shutter' | 'iso'

const PARAM_SCHEMA = {
  ai: intParam(APERTURES.indexOf(5.6), 0, 8),
  si: intParam(SHUTTER_SPEEDS.indexOf(1 / 125), 0, 18),
  ii: intParam(0, 0, 8),
  lock: strParam<LockTarget>('iso', ['aperture', 'shutter', 'iso']),
}

function formatShutter(s: number): string {
  if (s >= 1) return `${s}s`
  return `1/${Math.round(1 / s)}`
}

function findNearest(arr: number[], target: number): number {
  let best = arr[0]
  let bestDist = Math.abs(Math.log2(target) - Math.log2(best))
  for (const v of arr) {
    const dist = Math.abs(Math.log2(target) - Math.log2(v))
    if (dist < bestDist) {
      bestDist = dist
      best = v
    }
  }
  return best
}

function dofLabel(aperture: number): string {
  if (aperture <= 2) return 'Very Shallow'
  if (aperture <= 4) return 'Shallow'
  if (aperture <= 8) return 'Moderate'
  if (aperture <= 16) return 'Deep'
  return 'Very Deep'
}

function motionLabel(shutter: number): string {
  if (shutter <= 1/1000) return 'Frozen'
  if (shutter <= 1/250) return 'Sharp'
  if (shutter <= 1/60) return 'Moderate'
  if (shutter <= 1/8) return 'Slight Blur'
  return 'Blurred'
}

function noiseLabel(iso: number): string {
  if (iso <= 200) return 'Clean'
  if (iso <= 800) return 'Low Noise'
  if (iso <= 3200) return 'Moderate Noise'
  if (iso <= 12800) return 'Noisy'
  return 'Very Noisy'
}

function effectBar(level: number): string {
  return `${Math.round(level * 100)}%`
}

function dofLevel(aperture: number): number {
  const idx = APERTURES.indexOf(aperture)
  return idx >= 0 ? idx / (APERTURES.length - 1) : 0.5
}

function motionLevel(shutter: number): number {
  const idx = SHUTTER_SPEEDS.indexOf(shutter)
  return idx >= 0 ? idx / (SHUTTER_SPEEDS.length - 1) : 0.5
}

function noiseLevel(iso: number): number {
  const idx = ISOS.indexOf(iso)
  return idx >= 0 ? idx / (ISOS.length - 1) : 0.5
}

function ControlsPanel({ aperture, apertureIdx, shutter, shutterIdx, iso, isoIdx, lock, totalEV, onLockChange, onApertureChange, onShutterChange, onIsoChange }: {
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
}) {
  return (
    <>
      <div className={sim.lockRow}>
        <span className={sim.lockLabel}>Lock:</span>
        {(['aperture', 'shutter', 'iso'] as LockTarget[]).map((t) => (
          <button
            key={t}
            className={`${sim.lockBtn} ${lock === t ? sim.lockBtnActive : ''}`}
            onClick={() => onLockChange(t)}
            aria-pressed={lock === t}
            aria-label={`Lock ${t === 'aperture' ? 'Aperture' : t === 'shutter' ? 'Shutter' : 'ISO'}`}
          >
            {t === 'aperture' ? 'Aperture' : t === 'shutter' ? 'Shutter' : 'ISO'}
          </button>
        ))}
      </div>

      <div className={sim.field}>
        <label className={sim.fieldLabel}>
          Aperture: <span className={sim.fieldValue}>f/{aperture}</span>
          {lock === 'aperture' && <span className={sim.lockIcon}> (locked)</span>}
        </label>
        <input
          type="range"
          className={sim.slider}
          min={0}
          max={APERTURES.length - 1}
          step={1}
          value={apertureIdx}
          onChange={(e) => onApertureChange(Number(e.target.value))}
          disabled={lock === 'aperture'}
        />
      </div>

      <div className={sim.field}>
        <label className={sim.fieldLabel}>
          Shutter Speed: <span className={sim.fieldValue}>{formatShutter(shutter)}</span>
          {lock === 'shutter' && <span className={sim.lockIcon}> (locked)</span>}
        </label>
        <input
          type="range"
          className={sim.slider}
          min={0}
          max={SHUTTER_SPEEDS.length - 1}
          step={1}
          value={shutterIdx}
          onChange={(e) => onShutterChange(Number(e.target.value))}
          disabled={lock === 'shutter'}
        />
      </div>

      <div className={sim.field}>
        <label className={sim.fieldLabel}>
          ISO: <span className={sim.fieldValue}>{iso}</span>
          {lock === 'iso' && <span className={sim.lockIcon}> (locked)</span>}
        </label>
        <input
          type="range"
          className={sim.slider}
          min={0}
          max={ISOS.length - 1}
          step={1}
          value={isoIdx}
          onChange={(e) => onIsoChange(Number(e.target.value))}
          disabled={lock === 'iso'}
        />
      </div>

      <div className={sim.resultCard}>
        <span className={sim.resultLabel}>Exposure Value (EV)</span>
        <span className={sim.resultValue}>{totalEV.toFixed(1)}</span>
      </div>

      <div className={sim.effects}>
        <div className={sim.effectRow}>
          <span className={sim.effectLabel}>Depth of Field</span>
          <div className={sim.effectBarBg}>
            <div className={sim.effectBar} style={{ width: effectBar(dofLevel(aperture)), backgroundColor: 'var(--accent)' }} />
          </div>
          <span className={sim.effectText}>{dofLabel(aperture)}</span>
        </div>
        <div className={sim.effectRow}>
          <span className={sim.effectLabel}>Motion</span>
          <div className={sim.effectBarBg}>
            <div className={sim.effectBar} style={{ width: effectBar(motionLevel(shutter)), backgroundColor: '#f59e0b' }} />
          </div>
          <span className={sim.effectText}>{motionLabel(shutter)}</span>
        </div>
        <div className={sim.effectRow}>
          <span className={sim.effectLabel}>Noise</span>
          <div className={sim.effectBarBg}>
            <div className={sim.effectBar} style={{ width: effectBar(noiseLevel(iso)), backgroundColor: '#ef4444' }} />
          </div>
          <span className={sim.effectText}>{noiseLabel(iso)}</span>
        </div>
      </div>
    </>
  )
}

export function ExposureSimulator() {
  const [apertureIdx, setApertureIdx] = useState(APERTURES.indexOf(5.6))
  const [shutterIdx, setShutterIdx] = useState(SHUTTER_SPEEDS.indexOf(1/125))
  const [isoIdx, setIsoIdx] = useState(0)
  const [lock, setLock] = useState<LockTarget>('iso')
  useQueryInit(PARAM_SCHEMA, { ai: setApertureIdx, si: setShutterIdx, ii: setIsoIdx, lock: setLock })

  const aperture = APERTURES[apertureIdx]
  const shutter = SHUTTER_SPEEDS[shutterIdx]
  const iso = ISOS[isoIdx]

  useToolQuerySync({ ai: apertureIdx, si: shutterIdx, ii: isoIdx, lock }, PARAM_SCHEMA)

  const ev100 = useMemo(() => calcEV(aperture, shutter), [aperture, shutter])
  const totalEV = ev100 + Math.log2(iso / 100)

  const handleApertureChange = useCallback((newIdx: number) => {
    const newAperture = APERTURES[newIdx]
    if (lock === 'aperture') return
    setApertureIdx(newIdx)

    if (lock === 'shutter') {
      const ev100New = calcEV(newAperture, shutter)
      const neededIsoLog = totalEV - ev100New
      const neededIso = 100 * Math.pow(2, neededIsoLog)
      const nearestIso = findNearest(ISOS, neededIso)
      setIsoIdx(ISOS.indexOf(nearestIso))
    } else if (lock === 'iso') {
      const targetEV100 = totalEV - Math.log2(iso / 100)
      const neededShutter = (newAperture * newAperture) / Math.pow(2, targetEV100)
      const nearestShutter = findNearest(SHUTTER_SPEEDS, neededShutter)
      setShutterIdx(SHUTTER_SPEEDS.indexOf(nearestShutter))
    }
  }, [lock, shutter, iso, totalEV])

  const handleShutterChange = useCallback((newIdx: number) => {
    const newShutter = SHUTTER_SPEEDS[newIdx]
    if (lock === 'shutter') return
    setShutterIdx(newIdx)

    if (lock === 'aperture') {
      const ev100New = calcEV(aperture, newShutter)
      const neededIsoLog = totalEV - ev100New
      const neededIso = 100 * Math.pow(2, neededIsoLog)
      const nearestIso = findNearest(ISOS, neededIso)
      setIsoIdx(ISOS.indexOf(nearestIso))
    } else if (lock === 'iso') {
      const targetEV100 = totalEV - Math.log2(iso / 100)
      const neededAperture = Math.sqrt(newShutter * Math.pow(2, targetEV100))
      const nearestAperture = findNearest(APERTURES, neededAperture)
      setApertureIdx(APERTURES.indexOf(nearestAperture))
    }
  }, [lock, aperture, iso, totalEV])

  const handleIsoChange = useCallback((newIdx: number) => {
    const newIso = ISOS[newIdx]
    if (lock === 'iso') return
    setIsoIdx(newIdx)

    if (lock === 'aperture') {
      const targetEV100 = totalEV - Math.log2(newIso / 100)
      const neededShutter = (aperture * aperture) / Math.pow(2, targetEV100)
      const nearestShutter = findNearest(SHUTTER_SPEEDS, neededShutter)
      setShutterIdx(SHUTTER_SPEEDS.indexOf(nearestShutter))
    } else if (lock === 'shutter') {
      const targetEV100 = totalEV - Math.log2(newIso / 100)
      const neededAperture = Math.sqrt(shutter * Math.pow(2, targetEV100))
      const nearestAperture = findNearest(APERTURES, neededAperture)
      setApertureIdx(APERTURES.indexOf(nearestAperture))
    }
  }, [lock, aperture, shutter, totalEV])

  const controlsProps = {
    aperture, apertureIdx, shutter, shutterIdx, iso, isoIdx, lock, totalEV,
    onLockChange: setLock,
    onApertureChange: handleApertureChange,
    onShutterChange: handleShutterChange,
    onIsoChange: handleIsoChange,
  }

  return (
    <div className={sim.app}>
      <div className={sim.appBody}>
        <div className={sim.sidebar}>
          <ToolActions toolName="Exposure Triangle Simulator" toolSlug="exposure-simulator" />
          <ControlsPanel {...controlsProps} />
        </div>

        <ExposurePreview
          aperture={aperture}
          shutterSpeed={shutter}
          iso={iso}
        />
        <div className={sim.desktopOnly}>
          <LearnPanel slug="exposure-simulator" />
        </div>
      </div>

      {/* Mobile: controls below canvas */}
      <div className={sim.mobileControls}>
        <ControlsPanel {...controlsProps} />
      </div>

      <div className={sim.mobileOnly}>
        <LearnPanel slug="exposure-simulator" />
      </div>
    </div>
  )
}
