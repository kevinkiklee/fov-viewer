'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import ExifReader from 'exifreader'
import { FileDropZone } from '@/components/shared/FileDropZone'
import { LearnPanel } from '@/components/shared/LearnPanel'
import { getToolBySlug } from '@/lib/data/tools'
import { computeHistogram, detectClipping } from '@/lib/math/histogram'
import type { HistogramData } from '@/lib/math/histogram'
import styles from './HistogramExplainer.module.css'

// ── Types ──

type ViewMode = 'luminance' | 'rgb' | 'channels'

interface ClipInfo {
  hasBlackClip: boolean
  hasWhiteClip: boolean
  blackClipPercent: number
  whiteClipPercent: number
}

interface ExifResult {
  camera: { make: string; model: string }
  lens: { model: string; make: string }
  settings: {
    fNumber: string
    exposureTime: string
    iso: string
    focalLength: string
    focalLength35: string
  }
  image: { width: string; height: string; orientation: string }
  date: string
  gps: { latitude: string; longitude: string } | null
  software: string
}

// ── EXIF helpers ──

const DASH = '\u2014'

function getTagValue(tags: ExifReader.Tags, key: string): string | undefined {
  const tag = tags[key]
  if (!tag) return undefined
  if ('description' in tag && typeof tag.description === 'string' && tag.description) {
    return tag.description
  }
  if ('value' in tag) {
    const v = tag.value as unknown
    if (typeof v === 'string') return v
    if (typeof v === 'number') return String(v)
    if (Array.isArray(v) && v.length > 0) return String(v[0])
  }
  return undefined
}

function formatExposureTime(raw: string | undefined): string {
  if (!raw) return DASH
  const num = parseFloat(raw)
  if (isNaN(num)) return raw
  if (num >= 1) return `${num}s`
  return `1/${Math.round(1 / num)}s`
}

function formatFNumber(raw: string | undefined): string {
  if (!raw) return DASH
  const num = parseFloat(raw)
  if (isNaN(num)) return raw
  return `f/${num}`
}

function formatFocalLength(raw: string | undefined): string {
  if (!raw) return DASH
  const num = parseFloat(raw)
  if (isNaN(num)) return raw
  return `${num}mm`
}

function parseGps(tags: ExifReader.Tags): { latitude: string; longitude: string } | null {
  const lat = tags['GPSLatitude']
  const lon = tags['GPSLongitude']
  if (!lat || !lon) return null
  const latDesc = 'description' in lat ? lat.description : undefined
  const lonDesc = 'description' in lon ? lon.description : undefined
  if (typeof latDesc === 'string' && typeof lonDesc === 'string' && latDesc && lonDesc) {
    return { latitude: `${latDesc}\u00B0`, longitude: `${lonDesc}\u00B0` }
  }
  return null
}

function parseExif(tags: ExifReader.Tags): ExifResult {
  return {
    camera: {
      make: getTagValue(tags, 'Make') ?? DASH,
      model: getTagValue(tags, 'Model') ?? DASH,
    },
    lens: {
      model: getTagValue(tags, 'LensModel') ?? DASH,
      make: getTagValue(tags, 'LensMake') ?? DASH,
    },
    settings: {
      fNumber: formatFNumber(getTagValue(tags, 'FNumber')),
      exposureTime: formatExposureTime(getTagValue(tags, 'ExposureTime')),
      iso: getTagValue(tags, 'ISOSpeedRatings') ?? getTagValue(tags, 'PhotographicSensitivity') ?? DASH,
      focalLength: formatFocalLength(getTagValue(tags, 'FocalLength')),
      focalLength35: formatFocalLength(getTagValue(tags, 'FocalLengthIn35mmFilm')),
    },
    image: {
      width: getTagValue(tags, 'ImageWidth') ?? getTagValue(tags, 'PixelXDimension') ?? DASH,
      height: getTagValue(tags, 'ImageHeight') ?? getTagValue(tags, 'PixelYDimension') ?? DASH,
      orientation: getTagValue(tags, 'Orientation') ?? DASH,
    },
    date: getTagValue(tags, 'DateTimeOriginal') ?? getTagValue(tags, 'DateTime') ?? DASH,
    gps: parseGps(tags),
    software: getTagValue(tags, 'Software') ?? DASH,
  }
}

// ── Histogram drawing ──

function drawHistogram(
  canvas: HTMLCanvasElement,
  hist: HistogramData,
  mode: ViewMode,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.scale(dpr, dpr)

  const w = rect.width
  const h = rect.height
  ctx.clearRect(0, 0, w, h)

  const barWidth = w / 256

  function drawChannel(data: number[], color: string, alpha: number) {
    const max = Math.max(...data)
    if (max === 0 || !ctx) return
    ctx.fillStyle = color
    ctx.globalAlpha = alpha
    for (let i = 0; i < 256; i++) {
      const barHeight = (data[i] / max) * h
      ctx.fillRect(i * barWidth, h - barHeight, barWidth + 0.5, barHeight)
    }
    ctx.globalAlpha = 1
  }

  if (mode === 'luminance') {
    drawChannel(hist.luma, '#e0e0e0', 0.8)
  } else if (mode === 'rgb') {
    drawChannel(hist.r, '#ef4444', 0.4)
    drawChannel(hist.g, '#22c55e', 0.4)
    drawChannel(hist.b, '#3b82f6', 0.4)
  } else {
    drawChannel(hist.r, '#ef4444', 0.6)
    drawChannel(hist.g, '#22c55e', 0.6)
    drawChannel(hist.b, '#3b82f6', 0.6)
    drawChannel(hist.luma, '#e0e0e0', 0.3)
  }
}

// ── Sub-components ──

const tool = getToolBySlug('exif-viewer')!

const HISTOGRAM_MODES: { key: ViewMode; label: string }[] = [
  { key: 'luminance', label: 'Luminance' },
  { key: 'rgb', label: 'RGB Overlay' },
  { key: 'channels', label: 'All Channels' },
]

function ControlsPanel({ hist, clip, onFile }: {
  hist: HistogramData | null
  clip: ClipInfo | null
  onFile: (file: File) => void
}) {
  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>{tool.name}</h1>
        <p className={styles.description}>{tool.description}</p>
      </div>

      <FileDropZone onFile={onFile} />

      {hist && (clip?.hasBlackClip || clip?.hasWhiteClip) && (
        <div className={styles.annotations}>
          {clip?.hasBlackClip && (
            <div className={styles.warning}>
              Black clipping &mdash; {clip.blackClipPercent.toFixed(1)}% pure black
            </div>
          )}
          {clip?.hasWhiteClip && (
            <div className={styles.warning}>
              White clipping &mdash; {clip.whiteClipPercent.toFixed(1)}% pure white
            </div>
          )}
        </div>
      )}
    </>
  )
}

function HistogramCard({ hist, mode, label }: {
  hist: HistogramData
  mode: ViewMode
  label: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const draw = useCallback(() => {
    if (canvasRef.current) drawHistogram(canvasRef.current, hist, mode)
  }, [hist, mode])

  useEffect(() => { draw() }, [draw])

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const observer = new ResizeObserver(() => draw())
    observer.observe(el)
    return () => observer.disconnect()
  }, [draw])

  return (
    <div className={styles.histCard}>
      <div className={styles.histLabel}>{label}</div>
      <canvas ref={canvasRef} className={styles.canvas} aria-label={`${label} histogram`} role="img" />
      <div className={styles.regionLabels}>
        <span>Shadows</span>
        <span>Midtones</span>
        <span>Highlights</span>
      </div>
    </div>
  )
}

function ExifRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td>{label}</td>
      <td className={value === DASH ? styles.missing : undefined}>{value}</td>
    </tr>
  )
}

function ExifSection({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className={styles.exifSection}>
      <div className={styles.exifSectionTitle}>{title}</div>
      <table className={styles.exifTable}>
        <tbody>
          {rows.map(([label, value]) => (
            <ExifRow key={label} label={label} value={value} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ExifPanel({ data }: { data: ExifResult }) {
  return (
    <div className={styles.exifPanel}>
      <ExifSection title="Camera" rows={[['Make', data.camera.make], ['Model', data.camera.model]]} />
      <ExifSection title="Lens" rows={[['Lens Model', data.lens.model], ['Lens Make', data.lens.make]]} />
      <ExifSection
        title="Settings"
        rows={[
          ['Aperture', data.settings.fNumber],
          ['Shutter Speed', data.settings.exposureTime],
          ['ISO', data.settings.iso],
          ['Focal Length', data.settings.focalLength],
          ['Focal Length (35mm equiv.)', data.settings.focalLength35],
        ]}
      />
      <ExifSection
        title="Image"
        rows={[
          ['Width', data.image.width],
          ['Height', data.image.height],
          ['Orientation', data.image.orientation],
        ]}
      />
      <ExifSection title="Date" rows={[['Date Taken', data.date]]} />
      {data.gps && (
        <ExifSection title="GPS" rows={[['Latitude', data.gps.latitude], ['Longitude', data.gps.longitude]]} />
      )}
      <ExifSection title="Software" rows={[['Software', data.software]]} />
    </div>
  )
}

// ── Main component ──

const SAMPLE_IMAGE = '/images/samples/example.jpg'

export function HistogramExplainer() {
  const [hist, setHist] = useState<HistogramData | null>(null)
  const [clip, setClip] = useState<ClipInfo | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [exif, setExif] = useState<ExifResult | null>(null)
  const [exifError, setExifError] = useState<string | null>(null)
  const fileRef = useRef<File | null>(null)
  const loadedRef = useRef(false)

  const processFile = useCallback((file: File, previewUrl?: string) => {
    fileRef.current = file

    // 1. Read EXIF from ArrayBuffer
    setExifError(null)
    setExif(null)
    const exifReader = new FileReader()
    exifReader.onload = () => {
      try {
        const buffer = exifReader.result as ArrayBuffer
        const tags = ExifReader.load(buffer)
        setExif(parseExif(tags))
      } catch {
        setExifError('No EXIF data found in this image.')
      }
    }
    exifReader.readAsArrayBuffer(file)

    // 2. Read image for histogram + preview
    const img = new Image()
    const url = previewUrl ?? URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const histogram = computeHistogram(imageData.data, canvas.width, canvas.height)
      const clipping = detectClipping(histogram)
      setHist(histogram)
      setClip(clipping)
      setImageUrl((prev) => {
        if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev)
        return url
      })
    }
    img.src = url
  }, [])

  const handleFile = useCallback((file: File) => {
    processFile(file)
  }, [processFile])

  // Load sample image on mount
  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    fetch(SAMPLE_IMAGE)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], 'example.jpg', { type: 'image/jpeg' })
        processFile(file, SAMPLE_IMAGE)
      })
      .catch(() => { /* ignore — user can upload manually */ })
  }, [processFile])

  const controlsProps = { hist, clip, onFile: handleFile }
  const hasData = hist || exif

  return (
    <div className={styles.app}>
      <div className={styles.appBody}>
        <div className={styles.sidebar}>
          <ControlsPanel {...controlsProps} />
        </div>

        <div className={styles.main}>
          {hasData ? (
            <>
              {/* Photo + EXIF row */}
              <div className={styles.topRow}>
                {imageUrl && (
                  <div className={styles.imagePreview}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Uploaded photo" className={styles.previewImg} />
                  </div>
                )}
                {exif && <ExifPanel data={exif} />}
                {exifError && !exif && (
                  <div className={styles.exifError}>{exifError}</div>
                )}
              </div>

              {/* Histograms */}
              {hist && (
                <div className={styles.histogramGrid}>
                  {HISTOGRAM_MODES.map((m) => (
                    <HistogramCard key={m.key} hist={hist} mode={m.key} label={m.label} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyMain}>Upload an image to view EXIF data and histogram</div>
          )}
        </div>

        <div className={styles.desktopOnly}>
          <LearnPanel slug="exif-viewer" />
        </div>
      </div>

      <div className={styles.mobileControls}>
        <ControlsPanel {...controlsProps} />
      </div>

      <div className={styles.mobileOnly}>
        <LearnPanel slug="exif-viewer" />
      </div>
    </div>
  )
}
