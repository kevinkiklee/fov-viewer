'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { hslToRgb, rgbToHsl, complementary, analogous, triadic, splitComplementary, tetradic } from '@/lib/math/color'
import { ToolActions } from '@/components/shared/ToolActions'
import { LearnPanel } from '@/components/shared/LearnPanel'
import { parseQueryState, useToolQuerySync, intParam, strParam } from '@/lib/utils/querySync'
import styles from './ColorHarmony.module.css'
import { ColorWheel } from './ColorWheel'
import { PhotoPicker } from './PhotoPicker'

type HarmonyType = 'complementary' | 'analogous' | 'triadic' | 'split-complementary' | 'tetradic'

const HARMONY_OPTIONS: { value: HarmonyType; label: string }[] = [
  { value: 'complementary', label: 'Complementary' },
  { value: 'analogous', label: 'Analogous' },
  { value: 'triadic', label: 'Triadic' },
  { value: 'split-complementary', label: 'Split Complementary' },
  { value: 'tetradic', label: 'Tetradic' },
]

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')
}

function getHarmonyHues(hue: number, type: HarmonyType, splitAngle: number, analogousSpread: number, tetradicOffset: number): number[] {
  switch (type) {
    case 'complementary': return complementary(hue)
    case 'analogous': return analogous(hue, analogousSpread)
    case 'triadic': return triadic(hue)
    case 'split-complementary': return splitComplementary(hue, splitAngle)
    case 'tetradic': return tetradic(hue, tetradicOffset)
  }
}

/** Index of the base (key) hue in the harmonyHues array */
function getBaseIndex(type: HarmonyType): number {
  if (type === 'analogous') return 1
  return 0
}

function getSuggestion(hue: number, type: HarmonyType): string {
  const isWarm = (hue >= 0 && hue < 70) || hue >= 330
  const isCool = hue >= 170 && hue < 270

  switch (type) {
    case 'complementary':
      if (isWarm) return 'Great for: warm sunset portraits with cool shadow contrast'
      if (isCool) return 'Great for: moody blue-hour shots with warm accent lighting'
      return 'Great for: high-contrast compositions with strong visual tension'
    case 'analogous':
      if (isWarm) return 'Great for: golden hour landscapes with unified warm tones'
      if (isCool) return 'Great for: serene water scenes and twilight photography'
      return 'Great for: harmonious nature shots with smooth color transitions'
    case 'triadic':
      return 'Use for: vibrant editorial work and bold creative portraits'
    case 'split-complementary':
      if (isWarm) return 'Use for: contrasting wardrobe against a natural backdrop'
      return 'Use for: balanced product photography with visual variety'
    case 'tetradic':
      return 'Use for: rich editorial layouts and complex multi-subject compositions'
  }
}

const PARAM_SCHEMA = {
  h: intParam(200, 0, 359),
  sat: intParam(70, 0, 100),
  l: intParam(50, 0, 100),
  type: strParam<HarmonyType>('complementary', ['complementary', 'analogous', 'triadic', 'split-complementary', 'tetradic'] as const),
  split: intParam(30, 10, 80),
  tet: intParam(60, 10, 170),
  spread: intParam(30, 5, 60),
}

export function ColorHarmony() {
  // Initialize with defaults to avoid hydration mismatch (server has no query params)
  const [hue, setHue] = useState(200)
  const [saturation, setSaturation] = useState(70)
  const [lightness, setLightness] = useState(50)
  const [harmony, setHarmony] = useState<HarmonyType>('complementary')
  const [splitAngle, setSplitAngle] = useState(30)
  const [tetradicOffset, setTetradicOffset] = useState(60)
  const [analogousSpread, setAnalogousSpread] = useState(30)

  // Hydrate from URL query params after mount
  useEffect(() => {
    const params = parseQueryState(PARAM_SCHEMA)
    if (params.h != null) setHue(params.h)
    if (params.sat != null) setSaturation(params.sat)
    if (params.l != null) setLightness(params.l)
    if (params.type) setHarmony(params.type)
    if (params.split != null) setSplitAngle(params.split)
    if (params.tet != null) setTetradicOffset(params.tet)
    if (params.spread != null) setAnalogousSpread(params.spread)
  }, [])

  useToolQuerySync(
    { h: hue, sat: saturation, l: lightness, type: harmony, split: splitAngle, tet: tetradicOffset, spread: analogousSpread },
    PARAM_SCHEMA,
  )
  const [showPhotoPicker, setShowPhotoPicker] = useState(false)
  const [copiedHex, setCopiedHex] = useState<string | null>(null)
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null)
  const [hexDraft, setHexDraft] = useState<string | null>(null)

  const baseRgb = useMemo(() => hslToRgb(hue, saturation, lightness), [hue, saturation, lightness])
  const baseHex = rgbToHex(baseRgb.r, baseRgb.g, baseRgb.b)

  // Displayed hex: show draft while editing, otherwise computed
  const displayedHex = hexDraft ?? baseHex

  const applyHex = useCallback((hex: string) => {
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const hsl = rgbToHsl(r, g, b)
    setHue(Math.round(hsl.h))
    setSaturation(Math.round(hsl.s))
    setLightness(Math.round(hsl.l))
  }, [])

  const baseIndex = getBaseIndex(harmony)

  const harmonyHues = useMemo(
    () => getHarmonyHues(hue, harmony, splitAngle, analogousSpread, tetradicOffset),
    [hue, harmony, splitAngle, analogousSpread, tetradicOffset],
  )

  const swatches = useMemo(() => {
    return harmonyHues.map((h) => {
      const rgb = hslToRgb(h, saturation, lightness)
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
      return { hue: h, rgb, hex }
    })
  }, [harmony, harmonyHues, hue, saturation, lightness])

  const suggestion = useMemo(() => getSuggestion(hue, harmony), [hue, harmony])

  const copyHex = useCallback(async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex)
      setCopiedHex(hex)
      setTimeout(() => setCopiedHex(null), 1500)
    } catch {
      // ignore
    }
  }, [])

  const copyPalette = useCallback(async (format: string) => {
    let text = ''
    if (format === 'hex') {
      text = swatches.map((s) => s.hex).join(', ')
    } else if (format === 'css') {
      text = swatches.map((s, i) => `--color-${i + 1}: ${s.hex};`).join('\n')
    } else if (format === 'rgb') {
      text = swatches.map((s) => `rgb(${s.rgb.r}, ${s.rgb.g}, ${s.rgb.b})`).join(', ')
    }
    try {
      await navigator.clipboard.writeText(text)
      setCopiedFormat(format)
      setTimeout(() => setCopiedFormat(null), 1500)
    } catch {
      // ignore
    }
  }, [swatches])

  const handleSecondaryDrag = useCallback((nodeIndex: number, draggedHue: number) => {
    if (harmony === 'split-complementary') {
      const opposite = (hue + 180) % 360
      let diff = draggedHue - opposite
      if (diff > 180) diff -= 360
      if (diff < -180) diff += 360
      setSplitAngle(Math.round(Math.min(80, Math.max(10, Math.abs(diff)))))
    } else if (harmony === 'analogous') {
      let diff = draggedHue - hue
      if (diff > 180) diff -= 360
      if (diff < -180) diff += 360
      setAnalogousSpread(Math.round(Math.min(60, Math.max(5, Math.abs(diff)))))
    } else if (harmony === 'tetradic') {
      // Nodes 1 and 3 control the offset (rectangle width).
      // Node 1 is at hue+offset, node 3 is at hue+180+offset.
      // Compute offset from dragged position relative to the base hue (node 0) or its opposite (node 2).
      let diff: number
      if (nodeIndex === 1) {
        diff = draggedHue - hue
      } else {
        diff = draggedHue - ((hue + 180) % 360)
      }
      if (diff > 180) diff -= 360
      if (diff < -180) diff += 360
      setTetradicOffset(Math.round(Math.min(170, Math.max(10, Math.abs(diff)))))
    }
  }, [harmony, hue])

  const draggableNodes = useMemo(() => {
    if (harmony === 'split-complementary') return [1, 2]
    if (harmony === 'analogous') return [0, 2]
    if (harmony === 'tetradic') return [1, 3]
    return []
  }, [harmony])

  return (
    <div className={styles.wrapper}>
      {/* Sidebar: full height, touches nav */}
      <aside className={styles.sidebar}>
          <ToolActions toolName="Color Harmony Picker" toolSlug="color-harmony" />

          <div className={styles.field}>
            <span className={styles.label}>Harmony Type</span>
            <div className={styles.radioGroup}>
              {HARMONY_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  className={`${styles.radioBtn} ${harmony === o.value ? styles.radioBtnActive : ''}`}
                  onClick={() => setHarmony(o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Key Color</span>
            <div className={styles.keyColorRow}>
              <input
                type="color"
                value={baseHex}
                onChange={(e) => applyHex(e.target.value)}
                className={styles.colorPicker}
              />
              <input
                type="text"
                value={displayedHex}
                onChange={(e) => {
                  setHexDraft(e.target.value)
                  applyHex(e.target.value)
                }}
                onFocus={() => setHexDraft(baseHex)}
                onBlur={() => setHexDraft(null)}
                className={styles.hexInput}
                spellCheck={false}
                maxLength={7}
              />
            </div>
            <button
              className={styles.photoPickerBtn}
              onClick={() => setShowPhotoPicker(true)}
              title="Pick key color from a photo"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M14 1H2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3.586l1.707 1.707a1 1 0 0 0 1.414 0L10.414 13H14a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm-6 9.5a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
              </svg>
              Pick from photo
            </button>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Hue: <span className={styles.value}>{hue}°</span></span>
            <input
              type="range" className={styles.slider}
              min={0} max={359} step={1} value={hue}
              onChange={(e) => setHue(Number(e.target.value))}
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Saturation: <span className={styles.value}>{saturation}%</span></span>
            <input
              type="range" className={styles.slider}
              min={0} max={100} step={1} value={saturation}
              onChange={(e) => setSaturation(Number(e.target.value))}
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Lightness: <span className={styles.value}>{lightness}%</span></span>
            <input
              type="range" className={styles.slider}
              min={0} max={100} step={1} value={lightness}
              onChange={(e) => setLightness(Number(e.target.value))}
            />
          </div>

          {harmony === 'split-complementary' && (
            <div className={styles.field}>
              <span className={styles.label}>Split angle: <span className={styles.value}>{splitAngle}°</span></span>
              <input
                type="range" className={styles.slider}
                min={10} max={80} step={1} value={splitAngle}
                onChange={(e) => setSplitAngle(Number(e.target.value))}
              />
            </div>
          )}

          {harmony === 'analogous' && (
            <div className={styles.field}>
              <span className={styles.label}>Spread: <span className={styles.value}>{analogousSpread}°</span></span>
              <input
                type="range" className={styles.slider}
                min={5} max={60} step={1} value={analogousSpread}
                onChange={(e) => setAnalogousSpread(Number(e.target.value))}
              />
            </div>
          )}

          {harmony === 'tetradic' && (
            <div className={styles.field}>
              <span className={styles.label}>Rectangle width: <span className={styles.value}>{tetradicOffset}°</span>{tetradicOffset === 90 && ' (square)'}</span>
              <input
                type="range" className={styles.slider}
                min={10} max={170} step={1} value={tetradicOffset}
                onChange={(e) => setTetradicOffset(Number(e.target.value))}
              />
            </div>
          )}

          <div className={styles.suggestion}>
            {suggestion}
          </div>

      </aside>

      {/* Right side: palette bar + wheel */}
      <div className={styles.rightSide}>
        <div className={styles.paletteBar}>
          {swatches.map((s, i) => (
            <button
              key={i}
              className={`${styles.paletteBarSwatch} ${i === baseIndex ? styles.paletteBarSwatchKey : ''}`}
              style={{ backgroundColor: s.hex }}
              onClick={() => copyHex(s.hex)}
              title={i === baseIndex ? 'Key color — click to copy hex' : 'Click to copy hex'}
            >
              <div className={styles.paletteBarInfo}>
                {i === baseIndex && <span className={styles.keyLabel}>KEY</span>}
                <span className={styles.paletteBarHex}>
                  {copiedHex === s.hex ? 'Copied!' : s.hex}
                </span>
                <span className={styles.paletteBarRgb}>
                  rgb({s.rgb.r}, {s.rgb.g}, {s.rgb.b})
                </span>
              </div>
            </button>
          ))}
          <div className={styles.copyGroup}>
            <span className={styles.copyLabel}>Copy colors</span>
            <div className={styles.copyButtons}>
              <button className={styles.copyBtn} onClick={() => copyPalette('hex')} title="Copy hex codes">
                {copiedFormat === 'hex' ? 'Copied!' : 'Hex'}
              </button>
              <button className={styles.copyBtn} onClick={() => copyPalette('css')} title="Copy CSS variables">
                {copiedFormat === 'css' ? 'Copied!' : 'CSS'}
              </button>
              <button className={styles.copyBtn} onClick={() => copyPalette('rgb')} title="Copy RGB values">
                {copiedFormat === 'rgb' ? 'Copied!' : 'RGB'}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.mainArea}>
          <ColorWheel
            hue={hue}
            saturation={saturation}
            lightness={lightness}
            harmonyHues={harmonyHues}
            baseIndex={baseIndex}
            draggableNodes={draggableNodes}
            onHueChange={setHue}
            onSaturationChange={setSaturation}
            onSecondaryDrag={handleSecondaryDrag}
          />
        </div>
      </div>
      <LearnPanel slug="color-harmony" />

      {showPhotoPicker && (
        <PhotoPicker
          onColorPick={(hex) => {
            applyHex(hex)
            setShowPhotoPicker(false)
          }}
          onClose={() => setShowPhotoPicker(false)}
        />
      )}
    </div>
  )
}
