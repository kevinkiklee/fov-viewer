'use client'

import { useState, useMemo, useCallback } from 'react'
import { kelvinToRgb } from '@/lib/math/color'
import { getToolBySlug } from '@/lib/data/tools'
import { useQueryInit, useToolQuerySync, intParam } from '@/lib/utils/querySync'
import { LearnPanel } from '@/components/shared/LearnPanel'
import { FileDropZone } from '@/components/shared/FileDropZone'
import { WbPreview } from './WbPreview'
import calc from '../shared/Calculator.module.css'
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

const tool = getToolBySlug('white-balance')!

function ControlsPanel({ kelvin, rgb, activePreset, onKelvinChange, onFile }: {
  kelvin: number
  rgb: { r: number; g: number; b: number }
  activePreset: (typeof PRESETS)[number] | undefined
  onKelvinChange: (k: number) => void
  onFile: (file: File) => void
}) {
  return (
    <>
      <div className={wb.header}>
        <h1 className={wb.title}>{tool.name}</h1>
        <p className={wb.description}>{tool.description}</p>
      </div>

      <div className={calc.field}>
        <label className={calc.label}>
          Color Temperature: <span className={calc.value}>{kelvin}K</span>
          {activePreset && (
            <span className={wb.presetTag}> ({activePreset.name})</span>
          )}
        </label>
        <input
          type="range"
          className={calc.slider}
          min={2000}
          max={10000}
          step={100}
          value={kelvin}
          onChange={(e) => onKelvinChange(Number(e.target.value))}
        />
        <div className={wb.sliderLabels}>
          <span>2000K</span>
          <span>Warm</span>
          <span>Neutral</span>
          <span>Cool</span>
          <span>10000K</span>
        </div>
      </div>

      <div className={calc.field}>
        <label className={calc.label}>Presets</label>
        <div className={wb.presetRow}>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              className={`${wb.presetBtn} ${kelvin === p.kelvin ? wb.presetBtnActive : ''}`}
              onClick={() => onKelvinChange(p.kelvin)}
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

      <div className={wb.rgbCards}>
        <div className={calc.resultCard}>
          <span className={calc.resultLabel}>Red</span>
          <span className={calc.resultValue}>{rgb.r}</span>
        </div>
        <div className={calc.resultCard}>
          <span className={calc.resultLabel}>Green</span>
          <span className={calc.resultValue}>{rgb.g}</span>
        </div>
        <div className={calc.resultCard}>
          <span className={calc.resultLabel}>Blue</span>
          <span className={calc.resultValue}>{rgb.b}</span>
        </div>
        <div className={calc.resultCard}>
          <span className={calc.resultLabel}>Hex</span>
          <span className={calc.resultValue}>
            #{rgb.r.toString(16).padStart(2, '0')}
            {rgb.g.toString(16).padStart(2, '0')}
            {rgb.b.toString(16).padStart(2, '0')}
          </span>
        </div>
      </div>

      <FileDropZone onFile={onFile} />
    </>
  )
}

export function WhiteBalance() {
  const [kelvin, setKelvin] = useState(5500)
  const [customSrc, setCustomSrc] = useState<string | null>(null)

  useQueryInit(PARAM_SCHEMA, { k: setKelvin })
  useToolQuerySync({ k: kelvin }, PARAM_SCHEMA)

  const rgb = useMemo(() => kelvinToRgb(kelvin), [kelvin])

  const activePreset = PRESETS.find((p) => p.kelvin === kelvin)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    if (customSrc) URL.revokeObjectURL(customSrc)
    setCustomSrc(URL.createObjectURL(file))
  }, [customSrc])

  const controlsProps = { kelvin, rgb, activePreset, onKelvinChange: setKelvin, onFile: handleFile }

  return (
    <div className={wb.app}>
      <div className={wb.appBody}>
        <div className={wb.sidebar}>
          <ControlsPanel {...controlsProps} />
        </div>

        <WbPreview rgb={rgb} kelvin={kelvin} customSrc={customSrc} onFile={handleFile} />

        <LearnPanel slug="white-balance" />
      </div>

      <div className={wb.mobileControls}>
        <ControlsPanel {...controlsProps} />
      </div>
    </div>
  )
}
