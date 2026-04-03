'use client'

import { useState, useMemo } from 'react'
import { shutterWithNd, formatShutterSpeed } from '@/lib/math/exposure'
import { getToolBySlug } from '@/lib/data/tools'
import { useQueryInit, useToolQuerySync, intParam } from '@/lib/utils/querySync'
import { LearnPanel } from '@/components/shared/LearnPanel'
import calc from '../shared/Calculator.module.css'
import nd from './NdFilterCalculator.module.css'

const BASE_SHUTTER_SPEEDS = [
  { label: '1/8000', value: 1 / 8000 },
  { label: '1/4000', value: 1 / 4000 },
  { label: '1/2000', value: 1 / 2000 },
  { label: '1/1000', value: 1 / 1000 },
  { label: '1/500', value: 1 / 500 },
  { label: '1/250', value: 1 / 250 },
  { label: '1/125', value: 1 / 125 },
  { label: '1/60', value: 1 / 60 },
  { label: '1/30', value: 1 / 30 },
  { label: '1/15', value: 1 / 15 },
  { label: '1/8', value: 1 / 8 },
  { label: '1/4', value: 1 / 4 },
  { label: '1/2', value: 1 / 2 },
  { label: '1s', value: 1 },
  { label: '2s', value: 2 },
  { label: '4s', value: 4 },
]

const ND_FILTERS = [
  { label: 'ND2 (1 stop)', factor: 2, stops: 1 },
  { label: 'ND4 (2 stops)', factor: 4, stops: 2 },
  { label: 'ND8 (3 stops)', factor: 8, stops: 3 },
  { label: 'ND16 (4 stops)', factor: 16, stops: 4 },
  { label: 'ND32 (5 stops)', factor: 32, stops: 5 },
  { label: 'ND64 (6 stops)', factor: 64, stops: 6 },
  { label: 'ND128 (7 stops)', factor: 128, stops: 7 },
  { label: 'ND256 (8 stops)', factor: 256, stops: 8 },
  { label: 'ND512 (9 stops)', factor: 512, stops: 9 },
  { label: 'ND1024 (10 stops)', factor: 1024, stops: 10 },
]

const TABLE_FILTERS = ND_FILTERS.filter((f) => [3, 6, 10].includes(f.stops))

const PARAM_SCHEMA = {
  base: intParam(6, 0, 15),
  nd: intParam(2, 0, 9),
}

const tool = getToolBySlug('nd-filter-calculator')!

function ControlsPanel({ baseIdx, ndIdx, resultSpeed, ndStops, onBaseChange, onNdChange }: {
  baseIdx: number
  ndIdx: number
  resultSpeed: number
  ndStops: number
  onBaseChange: (idx: number) => void
  onNdChange: (idx: number) => void
}) {
  return (
    <>
      <div className={nd.header}>
        <h1 className={nd.title}>{tool.name}</h1>
        <p className={nd.description}>{tool.description}</p>
      </div>

      <div className={calc.field}>
        <label className={calc.label}>Base Shutter Speed</label>
        <select
          className={calc.select}
          value={baseIdx}
          onChange={(e) => onBaseChange(Number(e.target.value))}
        >
          {BASE_SHUTTER_SPEEDS.map((s, i) => (
            <option key={s.label} value={i}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className={calc.field}>
        <label className={calc.label}>ND Filter</label>
        <select
          className={calc.select}
          value={ndIdx}
          onChange={(e) => onNdChange(Number(e.target.value))}
        >
          {ND_FILTERS.map((f, i) => (
            <option key={f.factor} value={i}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div className={calc.resultCard}>
        <span className={calc.resultLabel}>Resulting Shutter Speed</span>
        <span className={calc.resultValue}>{formatShutterSpeed(resultSpeed)}</span>
      </div>
      <div className={calc.resultCard}>
        <span className={calc.resultLabel}>Stops Added</span>
        <span className={calc.resultValue}>{ndStops}</span>
      </div>
    </>
  )
}

export function NdFilterCalculator() {
  const [baseIdx, setBaseIdx] = useState(6)
  const [ndIdx, setNdIdx] = useState(2)
  useQueryInit(PARAM_SCHEMA, { base: setBaseIdx, nd: setNdIdx })

  useToolQuerySync({ base: baseIdx, nd: ndIdx }, PARAM_SCHEMA)

  const baseShutter = BASE_SHUTTER_SPEEDS[baseIdx].value
  const ndFilter = ND_FILTERS[ndIdx]

  const resultSpeed = useMemo(() => shutterWithNd(baseShutter, ndFilter.stops), [baseShutter, ndFilter.stops])

  const controlsProps = {
    baseIdx,
    ndIdx,
    resultSpeed,
    ndStops: ndFilter.stops,
    onBaseChange: setBaseIdx,
    onNdChange: setNdIdx,
  }

  return (
    <div className={nd.app}>
      <div className={nd.appBody}>
        <div className={nd.sidebar}>
          <ControlsPanel {...controlsProps} />
        </div>

        <div className={nd.main}>
          <h3 className={nd.tableTitle}>Quick Reference</h3>
          <div className={calc.tableWrap}>
            <table className={calc.table}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Base</th>
                  {TABLE_FILTERS.map((f) => (
                    <th key={f.factor}>{f.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BASE_SHUTTER_SPEEDS.map((s) => (
                  <tr key={s.label}>
                    <td style={{ textAlign: 'left', fontWeight: 500 }}>{s.label}</td>
                    {TABLE_FILTERS.map((f) => (
                      <td key={f.factor}>{formatShutterSpeed(shutterWithNd(s.value, f.stops))}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <LearnPanel slug="nd-filter-calculator" />
      </div>

      <div className={nd.mobileControls}>
        <ControlsPanel {...controlsProps} />
      </div>
    </div>
  )
}
