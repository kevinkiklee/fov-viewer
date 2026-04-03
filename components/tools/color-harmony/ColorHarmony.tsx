'use client'

import { useState, useMemo, useCallback } from 'react'
import { hslToRgb, complementary, analogous, triadic, splitComplementary, tetradic } from '@/lib/math/color'
import styles from '../shared/Calculator.module.css'
import ch from './ColorHarmony.module.css'
import { ColorWheel } from './ColorWheel'

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

function getHarmonyHues(hue: number, type: HarmonyType, splitAngle: number, analogousSpread: number): number[] {
  switch (type) {
    case 'complementary': return complementary(hue)
    case 'analogous': return analogous(hue, analogousSpread)
    case 'triadic': return triadic(hue)
    case 'split-complementary': return splitComplementary(hue, splitAngle)
    case 'tetradic': return tetradic(hue)
  }
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

export function ColorHarmony() {
  const [hue, setHue] = useState(200)
  const [saturation, setSaturation] = useState(70)
  const [lightness, setLightness] = useState(50)
  const [harmony, setHarmony] = useState<HarmonyType>('complementary')
  const [splitAngle, setSplitAngle] = useState(30)
  const [analogousSpread, setAnalogousSpread] = useState(30)
  const [copiedHex, setCopiedHex] = useState<string | null>(null)

  const harmonyHues = useMemo(
    () => getHarmonyHues(hue, harmony, splitAngle, analogousSpread),
    [hue, harmony, splitAngle, analogousSpread],
  )

  const swatches = useMemo(() => {
    return harmonyHues.map((h) => {
      const rgb = hslToRgb(h, saturation, lightness)
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
      return { hue: h, rgb, hex }
    })
  }, [harmonyHues, saturation, lightness])

  const suggestion = useMemo(() => getSuggestion(hue, harmony), [hue, harmony])

  const copyHex = useCallback(async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex)
      setCopiedHex(hex)
      setTimeout(() => setCopiedHex(null), 1500)
    } catch {
      // Fallback: do nothing
    }
  }, [])

  // Handle secondary node drag from the color wheel.
  // The wheel reports which node index was dragged to which hue angle.
  // We compute the new spread/split angle from the difference.
  const handleSecondaryDrag = useCallback((nodeIndex: number, draggedHue: number) => {
    if (harmony === 'split-complementary') {
      // Nodes 1 and 2 are the split pair, opposite the base hue.
      // splitAngle = |draggedHue - (hue + 180)|, clamped to 10-80
      const opposite = (hue + 180) % 360
      let diff = draggedHue - opposite
      // Normalize to -180..180
      if (diff > 180) diff -= 360
      if (diff < -180) diff += 360
      const newAngle = Math.round(Math.min(80, Math.max(10, Math.abs(diff))))
      setSplitAngle(newAngle)
    } else if (harmony === 'analogous') {
      // Nodes 0 and 2 are the spread pair around the base hue (node 1).
      // spread = |draggedHue - hue|, clamped to 5-60
      let diff = draggedHue - hue
      if (diff > 180) diff -= 360
      if (diff < -180) diff += 360
      const newSpread = Math.round(Math.min(60, Math.max(5, Math.abs(diff))))
      setAnalogousSpread(newSpread)
    }
  }, [harmony, hue])

  // Which node indices are draggable for adjusting the angle (not the base hue)
  const draggableNodes = useMemo(() => {
    if (harmony === 'split-complementary') return [1, 2]
    if (harmony === 'analogous') return [0, 2]
    return []
  }, [harmony])

  return (
    <div className={styles.layout}>
      <div className={styles.controls}>
        <div className={styles.field}>
          <label className={styles.label}>
            Hue: <span className={styles.value}>{hue}°</span>
          </label>
          <input
            type="range"
            className={styles.slider}
            min={0}
            max={359}
            step={1}
            value={hue}
            onChange={(e) => setHue(Number(e.target.value))}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            Saturation: <span className={styles.value}>{saturation}%</span>
          </label>
          <input
            type="range"
            className={styles.slider}
            min={0}
            max={100}
            step={1}
            value={saturation}
            onChange={(e) => setSaturation(Number(e.target.value))}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            Lightness: <span className={styles.value}>{lightness}%</span>
          </label>
          <input
            type="range"
            className={styles.slider}
            min={0}
            max={100}
            step={1}
            value={lightness}
            onChange={(e) => setLightness(Number(e.target.value))}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Harmony Type</label>
          <select
            className={styles.select}
            value={harmony}
            onChange={(e) => setHarmony(e.target.value as HarmonyType)}
          >
            {HARMONY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <ColorWheel
          hue={hue}
          saturation={saturation}
          lightness={lightness}
          harmonyHues={harmonyHues}
          draggableNodes={draggableNodes}
          onHueChange={setHue}
          onSaturationChange={setSaturation}
          onSecondaryDrag={handleSecondaryDrag}
        />

        <div className={ch.palette}>
          {swatches.map((s, i) => (
            <button
              key={i}
              className={ch.swatch}
              style={{ backgroundColor: s.hex }}
              onClick={() => copyHex(s.hex)}
              title="Click to copy hex"
            >
              <div className={ch.swatchInfo}>
                <span className={ch.swatchHex}>
                  {copiedHex === s.hex ? 'Copied!' : s.hex}
                </span>
                <span className={ch.swatchRgb}>
                  rgb({s.rgb.r}, {s.rgb.g}, {s.rgb.b})
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className={ch.suggestion}>
          <p>{suggestion}</p>
        </div>
      </div>
    </div>
  )
}
