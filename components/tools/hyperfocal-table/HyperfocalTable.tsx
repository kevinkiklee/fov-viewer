'use client'

import { useState, useMemo } from 'react'
import { calcHyperfocal } from '@/lib/math/dof'
import { SENSORS } from '@/lib/data/sensors'
import { getToolBySlug } from '@/lib/data/tools'
import { parseQueryState, useToolQuerySync, sensorParam } from '@/lib/utils/querySync'
import { LearnPanel } from '@/components/shared/LearnPanel'
import calc from '../shared/Calculator.module.css'
import hf from './HyperfocalTable.module.css'

const FOCAL_LENGTHS = [14, 20, 24, 28, 35, 50, 85, 100, 135, 200]
const APERTURES = [2.8, 4, 5.6, 8, 11, 16, 22]

const PARAM_SCHEMA = {
  s: sensorParam('ff'),
}

const tool = getToolBySlug('hyperfocal-table')!

function ControlsPanel({ sensorId, onSensorChange }: {
  sensorId: string
  onSensorChange: (id: string) => void
}) {
  return (
    <>
      <div className={hf.header}>
        <h1 className={hf.title}>{tool.name}</h1>
        <p className={hf.description}>{tool.description}</p>
      </div>

      <div className={calc.field}>
        <label className={calc.label}>Sensor</label>
        <select
          className={calc.select}
          value={sensorId}
          onChange={(e) => onSensorChange(e.target.value)}
        >
          {SENSORS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
    </>
  )
}

export function HyperfocalTable() {
  const params = parseQueryState(PARAM_SCHEMA)
  const [sensorId, setSensorId] = useState(params.s ?? 'ff')

  useToolQuerySync({ s: sensorId }, PARAM_SCHEMA)

  const sensor = SENSORS.find((s) => s.id === sensorId) ?? SENSORS[1]
  const coc = 0.03 / sensor.cropFactor

  const rows = useMemo(
    () =>
      FOCAL_LENGTHS.map((fl) => ({
        fl,
        values: APERTURES.map((ap) => calcHyperfocal(fl, ap, coc)),
      })),
    [coc],
  )

  const controlsProps = { sensorId, onSensorChange: setSensorId }

  return (
    <div className={hf.app}>
      <div className={hf.appBody}>
        <div className={hf.sidebar}>
          <ControlsPanel {...controlsProps} />
        </div>

        <div className={hf.main}>
          <div className={calc.tableWrap}>
            <table className={calc.table}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Focal Length</th>
                  {APERTURES.map((a) => (
                    <th key={a}>f/{a}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.fl}>
                    <td style={{ textAlign: 'left', fontWeight: 500 }}>{row.fl}mm</td>
                    {row.values.map((v, i) => (
                      <td key={APERTURES[i]}>{v.toFixed(1)}m</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <LearnPanel slug="hyperfocal-table" />
      </div>

      <div className={hf.mobileControls}>
        <ControlsPanel {...controlsProps} />
      </div>
    </div>
  )
}
