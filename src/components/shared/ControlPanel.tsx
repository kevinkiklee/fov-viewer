import { useState, useRef, useEffect, useMemo, type ReactNode } from 'react'
import { FOCAL_LENGTHS, FOCAL_MIN, FOCAL_MAX } from '@/lib/data/focalLengths'
import styles from './ControlPanel.module.css'

// Re-export styles for direct use when composing custom layouts
export { styles as controlPanelStyles }

/* ── Logarithmic focal-length helpers ── */

const LOG_MIN = Math.log(FOCAL_MIN)
const LOG_MAX = Math.log(FOCAL_MAX)
const SLIDER_STEPS = 1000
const SNAP_THRESHOLD = 15

function focalToSlider(focal: number): number {
  return Math.round(((Math.log(focal) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * SLIDER_STEPS)
}

function sliderToFocal(pos: number): number {
  return Math.round(Math.exp(LOG_MIN + (pos / SLIDER_STEPS) * (LOG_MAX - LOG_MIN)))
}

/* ── Panel container ── */

interface ControlPanelProps {
  children: ReactNode
  title?: string
  subtitle?: string
  color?: string
  active?: boolean
  border?: boolean
  onAction?: () => void
  actionLabel?: string
  onClick?: () => void
  className?: string
}

export function ControlPanel({
  children, title, subtitle, color, active, border, onAction, actionLabel, onClick, className,
}: ControlPanelProps) {
  const panelClass = [
    styles.panel,
    border ? styles.panelBorder : '',
    active ? styles.panelActive : '',
    className ?? '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={panelClass}
      style={color ? { '--panel-color': color } as React.CSSProperties : undefined}
      onClick={onClick}
    >
      {(title || onAction) && (
        <div className={styles.header}>
          {title && <span className={styles.title}>{title}</span>}
          {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
          {onAction && (
            <button
              className={styles.headerAction}
              onClick={(e) => { e.stopPropagation(); onAction() }}
              aria-label={actionLabel}
            >
              {actionLabel ?? '✕'}
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

/* ── Focal length field with log slider + ticks + presets ── */

interface FocalLengthFieldProps {
  value: number
  onChange: (focal: number) => void
  color?: string
  minFocal?: number
}

export function FocalLengthField({ value, onChange, color, minFocal = FOCAL_MIN }: FocalLengthFieldProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const sliderMin = focalToSlider(minFocal)
  const sliderVal = focalToSlider(Math.max(value, minFocal))

  const filteredPresets = useMemo(
    () => FOCAL_LENGTHS.filter((fl) => fl.value >= minFocal),
    [minFocal],
  )

  const tickPositions = useMemo(
    () => filteredPresets.map((fl) => ({
      value: fl.value,
      pct: ((focalToSlider(fl.value) - sliderMin) / (SLIDER_STEPS - sliderMin)) * 100,
    })),
    [filteredPresets, sliderMin],
  )

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  function commitEdit() {
    const parsed = parseInt(draft, 10)
    if (!isNaN(parsed) && parsed >= minFocal && parsed <= FOCAL_MAX) {
      onChange(parsed)
    }
    setEditing(false)
  }

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const pos = Number(e.target.value)
    let focal = sliderToFocal(pos)

    for (const fl of filteredPresets) {
      if (Math.abs(pos - focalToSlider(fl.value)) <= SNAP_THRESHOLD) {
        focal = fl.value
        break
      }
    }

    onChange(Math.max(minFocal, Math.min(FOCAL_MAX, focal)))
  }

  return (
    <div>
      <div className={styles.fieldRow}>
        <span className={styles.fieldLabel}>Focal length</span>
        {editing ? (
          <input
            ref={inputRef}
            className={styles.editableInput}
            type="number"
            value={draft}
            min={minFocal}
            max={FOCAL_MAX}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit()
              if (e.key === 'Escape') setEditing(false)
            }}
          />
        ) : (
          <button
            className={styles.editableValue}
            onClick={(e) => { e.stopPropagation(); setDraft(String(value)); setEditing(true) }}
            title="Click to enter a value"
          >
            {value}mm
          </button>
        )}
      </div>
      <div className={styles.sliderWrap}>
        <input
          type="range"
          className={styles.slider}
          min={sliderMin}
          max={SLIDER_STEPS}
          step={1}
          value={sliderVal}
          onChange={handleSlider}
          style={color ? { accentColor: color } : undefined}
          aria-label={`Focal length: ${value}mm`}
        />
        <div className={styles.ticks}>
          {tickPositions.map((p) => (
            <div key={p.value} className={styles.tick} style={{ left: `${p.pct}%` }} />
          ))}
        </div>
      </div>
      <div className={styles.presets}>
        {filteredPresets.map((fl) => (
          <button
            key={fl.value}
            className={`${styles.preset} ${value === fl.value ? styles.presetActive : ''}`}
            style={value === fl.value && color ? { background: color, color: '#fff' } : undefined}
            onClick={(e) => { e.stopPropagation(); onChange(fl.value) }}
          >
            {fl.value}mm
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Generic field row ── */

interface FieldRowProps {
  label: string
  value?: string | number
  children?: ReactNode
}

export function FieldRow({ label, value, children }: FieldRowProps) {
  return (
    <div className={styles.fieldRow}>
      <span className={styles.fieldLabel}>{label}</span>
      {value !== undefined && <span className={styles.fieldValue}>{value}</span>}
      {children}
    </div>
  )
}

/* ── Number stepper (input with +/- buttons) ── */

interface NumberStepperProps {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (v: number) => void
}

export function NumberStepper({ value, min = 0, max = 9999, step = 1, onChange }: NumberStepperProps) {
  function clamp(v: number) {
    return Math.max(min, Math.min(max, v))
  }

  return (
    <div className={styles.stepper}>
      <button
        className={styles.stepperBtn}
        onClick={(e) => { e.stopPropagation(); onChange(clamp(value - step)) }}
        disabled={value <= min}
        aria-label="Decrease"
      >
        −
      </button>
      <input
        type="number"
        className={styles.stepperInput}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(clamp(Number(e.target.value) || min))}
      />
      <button
        className={styles.stepperBtn}
        onClick={(e) => { e.stopPropagation(); onChange(clamp(value + step)) }}
        disabled={value >= max}
        aria-label="Increase"
      >
        +
      </button>
    </div>
  )
}

/* ── Slider field (generic, linear) ── */

interface SliderFieldProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (v: number) => void
}

export function SliderField({ label, value, min, max, step = 1, unit = '', onChange }: SliderFieldProps) {
  return (
    <div>
      <div className={styles.fieldRow}>
        <span className={styles.fieldLabel}>{label}</span>
        <span className={styles.fieldValue}>{value}{unit}</span>
      </div>
      <input
        type="range"
        className={styles.slider}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${label}: ${value}${unit}`}
      />
    </div>
  )
}
