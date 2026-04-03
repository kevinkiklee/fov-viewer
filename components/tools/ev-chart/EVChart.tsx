'use client'

import { useState, useMemo } from 'react'
import { calcEV } from '@/lib/math/exposure'
import { getToolBySlug } from '@/lib/data/tools'
import { parseQueryState, useToolQuerySync, intParam } from '@/lib/utils/querySync'
import { LearnPanel } from '@/components/shared/LearnPanel'
import calc from '../shared/Calculator.module.css'
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

const tool = getToolBySlug('ev-chart')!

function ControlsPanel({ conditionEV, selected, matchingISOs, onConditionChange }: {
  conditionEV: number | null
  selected: SelectedCell | null
  matchingISOs: { iso: number; effectiveEV: number }[]
  onConditionChange: (ev: number | null) => void
}) {
  return (
    <>
      <div className={ev.header}>
        <h1 className={ev.title}>{tool.name}</h1>
        <p className={ev.description}>{tool.description}</p>
      </div>

      <div className={calc.field}>
        <label className={calc.label}>Lighting Condition</label>
        <div className={ev.conditionBtns}>
          <button
            className={`${ev.conditionBtn} ${ev.conditionBtnNone} ${conditionEV === null ? ev.conditionBtnActive : ''}`}
            onClick={() => onConditionChange(null)}
          >
            None
          </button>
          {LIGHTING_CONDITIONS.map((c) => (
            <button
              key={c.label}
              className={`${ev.conditionBtn} ${conditionEV === c.ev ? ev.conditionBtnActive : ''}`}
              onClick={() => onConditionChange(c.ev)}
            >
              {c.label} (EV {c.ev})
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <>
          <div className={calc.resultCard}>
            <span className={calc.resultLabel}>Selected Cell</span>
            <span className={calc.resultValue}>EV {selected.evValue.toFixed(1)}</span>
          </div>
          <div className={calc.resultCard}>
            <span className={calc.resultLabel}>Aperture</span>
            <span className={calc.resultValue}>f/{APERTURES[selected.apertureIdx]}</span>
          </div>
          <div className={calc.resultCard}>
            <span className={calc.resultLabel}>Shutter</span>
            <span className={calc.resultValue}>{formatShutter(SHUTTER_SPEEDS[selected.shutterIdx])}</span>
          </div>

          <div>
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
        </>
      )}
    </>
  )
}

export function EVChart() {
  const params = parseQueryState(PARAM_SCHEMA)
  const [selected, setSelected] = useState<SelectedCell | null>(null)
  const [conditionEV, setConditionEV] = useState<number | null>(params.ev !== undefined ? params.ev : null)

  useToolQuerySync({ ev: conditionEV }, PARAM_SCHEMA)

  const evGrid = useMemo(() => {
    return SHUTTER_SPEEDS.map((s) =>
      APERTURES.map((a) => Math.round(calcEV(a, s) * 10) / 10)
    )
  }, [])

  const matchingISOs = useMemo(() => {
    if (!selected) return []
    return ISOS.map((iso) => ({
      iso,
      effectiveEV: selected.evValue + Math.log2(iso / 100),
    }))
  }, [selected])

  const controlsProps = {
    conditionEV,
    selected,
    matchingISOs,
    onConditionChange: setConditionEV,
  }

  return (
    <div className={ev.app}>
      <div className={ev.appBody}>
        <div className={ev.sidebar}>
          <ControlsPanel {...controlsProps} />
        </div>

        <div className={ev.main}>
          <div className={calc.tableWrap}>
            <table className={calc.table}>
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
        </div>

        <LearnPanel slug="ev-chart" />
      </div>

      <div className={ev.mobileControls}>
        <ControlsPanel {...controlsProps} />
      </div>
    </div>
  )
}
