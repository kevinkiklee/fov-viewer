'use client'

import { useState, useMemo } from 'react'
import { calcEV } from '@/lib/math/exposure'
import { parseQueryState, useToolQuerySync, intParam } from '@/lib/utils/querySync'
import styles from '../shared/Calculator.module.css'
import ev from './EVChart.module.css'

const APERTURES = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22]
const SHUTTER_SPEEDS = [30, 15, 8, 4, 2, 1, 1/2, 1/4, 1/8, 1/15, 1/30, 1/60, 1/125, 1/250, 1/500, 1/1000, 1/2000, 1/4000, 1/8000]
const ISOS = [100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600]

const LIGHTING_CONDITIONS = [
  { label: 'Bright sun', ev: 15 },
  { label: 'Hazy sun', ev: 14 },
  { label: 'Cloudy bright', ev: 13 },
  { label: 'Cloudy', ev: 12 },
  { label: 'Open shade', ev: 11 },
  { label: 'Indoor bright', ev: 8 },
  { label: 'Indoor normal', ev: 6 },
  { label: 'Indoor dim', ev: 4 },
  { label: 'Night street', ev: 2 },
] as const

function formatShutter(s: number): string {
  if (s >= 1) return `${s}s`
  return `1/${Math.round(1 / s)}`
}

interface SelectedCell {
  apertureIdx: number
  shutterIdx: number
  evValue: number
}

const LIGHTING_EVS: number[] = LIGHTING_CONDITIONS.map((c) => c.ev)

const PARAM_SCHEMA = {
  ev: {
    default: null as number | null,
    parse: (raw: string) => {
      const n = Math.round(Number(raw))
      return !isNaN(n) && LIGHTING_EVS.includes(n) ? n : undefined
    },
    serialize: (v: number | null) => v !== null ? String(v) : '',
  },
}

export function EVChart() {
  const params = parseQueryState(PARAM_SCHEMA)
  const [selected, setSelected] = useState<SelectedCell | null>(null)
  const [conditionEV, setConditionEV] = useState<number | null>(params.ev !== undefined ? params.ev : null)

  useToolQuerySync({ ev: conditionEV }, PARAM_SCHEMA)

  // Pre-compute all EV values at ISO 100
  const evGrid = useMemo(() => {
    return SHUTTER_SPEEDS.map((s) =>
      APERTURES.map((a) => Math.round(calcEV(a, s) * 10) / 10)
    )
  }, [])

  const matchingISOs = useMemo(() => {
    if (!selected) return []
    // For a given EV at ISO 100, find which ISOs can achieve equivalent exposure
    // at different EVs. Show ISO options that give the same exposure.
    return ISOS.map((iso) => ({
      iso,
      effectiveEV: selected.evValue + Math.log2(iso / 100),
    }))
  }, [selected])

  return (
    <div>
      <div className={ev.toolbar}>
        <div className={styles.field}>
          <label className={styles.label}>Lighting Condition</label>
          <select
            className={styles.select}
            value={conditionEV ?? ''}
            onChange={(e) => {
              const val = e.target.value
              setConditionEV(val ? Number(val) : null)
            }}
          >
            <option value="">— None —</option>
            {LIGHTING_CONDITIONS.map((c) => (
              <option key={c.label} value={c.ev}>
                {c.label} (EV {c.ev})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={ev.cornerCell}>Shutter \ Aperture</th>
              {APERTURES.map((a) => (
                <th key={a}>f/{a}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SHUTTER_SPEEDS.map((s, si) => (
              <tr key={si}>
                <th style={{ textAlign: 'left' }}>{formatShutter(s)}</th>
                {APERTURES.map((a, ai) => {
                  const cellEV = evGrid[si][ai]
                  const roundedEV = Math.round(cellEV)
                  const isSelected = selected?.apertureIdx === ai && selected?.shutterIdx === si
                  const isHighlighted = conditionEV !== null && roundedEV === conditionEV

                  return (
                    <td
                      key={ai}
                      className={`${isSelected ? ev.cellSelected : ''} ${isHighlighted ? ev.cellHighlighted : ''}`}
                      onClick={() => setSelected({ apertureIdx: ai, shutterIdx: si, evValue: cellEV })}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelected({ apertureIdx: ai, shutterIdx: si, evValue: cellEV }) }}
                      tabIndex={0}
                      role="button"
                      aria-label={`EV ${cellEV.toFixed(1)} at f/${APERTURES[ai]} ${formatShutter(s)}`}
                      aria-pressed={isSelected}
                      style={{ cursor: 'pointer' }}
                    >
                      {cellEV.toFixed(1)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className={ev.details}>
          <div className={styles.results}>
            <div className={styles.resultCard}>
              <span className={styles.resultLabel}>Aperture</span>
              <span className={styles.resultValue}>f/{APERTURES[selected.apertureIdx]}</span>
            </div>
            <div className={styles.resultCard}>
              <span className={styles.resultLabel}>Shutter</span>
              <span className={styles.resultValue}>{formatShutter(SHUTTER_SPEEDS[selected.shutterIdx])}</span>
            </div>
            <div className={styles.resultCard}>
              <span className={styles.resultLabel}>EV (ISO 100)</span>
              <span className={styles.resultValue}>{selected.evValue.toFixed(1)}</span>
            </div>
          </div>

          <div className={ev.isoTable}>
            <h3 className={ev.isoTitle}>Equivalent EV at different ISOs</h3>
            <div className={ev.isoGrid}>
              {matchingISOs.map(({ iso, effectiveEV }) => (
                <div key={iso} className={ev.isoCard}>
                  <span className={ev.isoLabel}>ISO {iso}</span>
                  <span className={ev.isoValue}>EV {effectiveEV.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
