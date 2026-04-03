'use client'

import { useState, useMemo } from 'react'
import { kelvinToRgb } from '@/lib/math/color'
import { parseQueryState, useToolQuerySync, intParam } from '@/lib/utils/querySync'
import styles from '../shared/Calculator.module.css'
import wb from './WhiteBalance.module.css'

const PRESETS = [
  { name: 'Candle', kelvin: 1900 },
  { name: 'Tungsten', kelvin: 2700 },
  { name: 'Fluorescent', kelvin: 4000 },
  { name: 'Daylight', kelvin: 5500 },
  { name: 'Flash', kelvin: 5600 },
  { name: 'Cloudy', kelvin: 6500 },
  { name: 'Shade', kelvin: 7500 },
  { name: 'Blue Sky', kelvin: 10000 },
] as const

const PARAM_SCHEMA = {
  k: intParam(5500, 2000, 10000),
}

export function WhiteBalance() {
  const params = parseQueryState(PARAM_SCHEMA)
  const [kelvin, setKelvin] = useState(params.k ?? 5500)

  useToolQuerySync({ k: kelvin }, PARAM_SCHEMA)

  const rgb = useMemo(() => kelvinToRgb(kelvin), [kelvin])
  const bgColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`

  const activePreset = PRESETS.find((p) => p.kelvin === kelvin)

  return (
    <div className={styles.layout}>
      <div className={styles.controls}>
        <div className={styles.field}>
          <label className={styles.label}>
            Color Temperature: <span className={styles.value}>{kelvin}K</span>
            {activePreset && (
              <span className={wb.presetTag}> ({activePreset.name})</span>
            )}
          </label>
          <input
            type="range"
            className={styles.slider}
            min={2000}
            max={10000}
            step={100}
            value={kelvin}
            onChange={(e) => setKelvin(Number(e.target.value))}
          />
          <div className={wb.sliderLabels}>
            <span>2000K</span>
            <span>Warm</span>
            <span>Neutral</span>
            <span>Cool</span>
            <span>10000K</span>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Presets</label>
          <div className={wb.presetRow}>
            {PRESETS.map((p) => (
              <button
                key={p.name}
                className={`${wb.presetBtn} ${kelvin === p.kelvin ? wb.presetBtnActive : ''}`}
                onClick={() => setKelvin(p.kelvin)}
                title={`${p.name} (${p.kelvin}K)`}
              >
                <span
                  className={wb.presetDot}
                  style={{ backgroundColor: (() => { const c = kelvinToRgb(p.kelvin); return `rgb(${c.r},${c.g},${c.b})` })() }}
                />
                <span className={wb.presetName}>{p.name}</span>
                <span className={wb.presetK}>{p.kelvin}K</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className={wb.preview} style={{ backgroundColor: bgColor }}>
          <span className={wb.previewLabel}>{kelvin}K</span>
        </div>

        <div className={styles.results} style={{ marginTop: 16 }}>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Red</span>
            <span className={styles.resultValue}>{rgb.r}</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Green</span>
            <span className={styles.resultValue}>{rgb.g}</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Blue</span>
            <span className={styles.resultValue}>{rgb.b}</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Hex</span>
            <span className={styles.resultValue}>
              #{rgb.r.toString(16).padStart(2, '0')}
              {rgb.g.toString(16).padStart(2, '0')}
              {rgb.b.toString(16).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
