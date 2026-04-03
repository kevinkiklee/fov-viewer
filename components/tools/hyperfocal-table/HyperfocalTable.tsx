'use client'

import { useState, useMemo } from 'react'
import { calcHyperfocal } from '@/lib/math/dof'
import { SENSORS } from '@/lib/data/sensors'
import { parseQueryState, useToolQuerySync, sensorParam } from '@/lib/utils/querySync'
import styles from '../shared/Calculator.module.css'

const FOCAL_LENGTHS = [14, 20, 24, 28, 35, 50, 85, 100, 135, 200]
const APERTURES = [2.8, 4, 5.6, 8, 11, 16, 22]

const PARAM_SCHEMA = {
  s: sensorParam('ff'),
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

  return (
    <div>
      <div className={styles.controls} style={{ marginBottom: 16, maxWidth: 300 }}>
        <div className={styles.field}>
          <label className={styles.label}>Sensor</label>
          <select
            className={styles.select}
            value={sensorId}
            onChange={(e) => setSensorId(e.target.value)}
          >
            {SENSORS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
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
  )
}
