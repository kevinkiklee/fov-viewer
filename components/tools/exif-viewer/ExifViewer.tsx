'use client'

import { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import ExifReader from 'exifreader'
import { PhotoUploadPanel } from '@/components/shared/PhotoUploadPanel'
import { LearnPanel } from '@/components/shared/LearnPanel'
import { ToolActions } from '@/components/shared/ToolActions'
import { getToolBySlug } from '@/lib/data/tools'
import { calcEV } from '@/lib/math/exposure'
import { diffractionLimitedAperture, pixelPitch } from '@/lib/math/diffraction'
import { computeHistogram, detectClipping } from '@/lib/math/histogram'
import type { HistogramData } from '@/lib/math/histogram'
import styles from './ExifViewer.module.css'

const DASH = '\u2014'
const SAMPLE_PHOTO = '/images/samples/exif-example.jpg'

const EXPOSURE_PROGRAMS: Record<string, string> = {
  '0': 'Not defined', '1': 'Manual', '2': 'Program AE', '3': 'Aperture Priority',
  '4': 'Shutter Priority', '5': 'Creative', '6': 'Action', '7': 'Portrait', '8': 'Landscape',
}

const METERING_MODES: Record<string, string> = {
  '0': 'Unknown', '1': 'Average', '2': 'Center-weighted', '3': 'Spot',
  '4': 'Multi-spot', '5': 'Multi-segment', '6': 'Partial',
}

const FLASH_MODES: Record<number, string> = {
  0x00: 'No flash', 0x01: 'Flash fired', 0x05: 'Flash fired, strobe return not detected',
  0x07: 'Flash fired, strobe return detected', 0x08: 'Flash did not fire, compulsory',
  0x09: 'Flash fired, compulsory', 0x10: 'Flash did not fire, compulsory suppressed',
  0x18: 'Flash did not fire, auto', 0x19: 'Flash fired, auto',
  0x20: 'No flash function', 0x41: 'Flash fired, red-eye reduction',
}

const WHITE_BALANCE: Record<string, string> = { '0': 'Auto', '1': 'Manual' }
const COLOR_SPACES: Record<string, string> = { '1': 'sRGB', '2': 'Adobe RGB', '65535': 'Uncalibrated' }

interface ExifResult {
  camera: { make: string; model: string }
  lens: { model: string; make: string }
  settings: {
    fNumber: string; fNumberRaw: number | null
    exposureTime: string; exposureTimeRaw: number | null
    iso: string; isoRaw: number | null
    focalLength: string; focalLengthRaw: number | null; focalLength35: string
    exposureProgram: string; meteringMode: string; flash: string
    whiteBalance: string; focusDistance: string
  }
  image: {
    width: string; widthRaw: number | null; height: string; heightRaw: number | null
    orientation: string; colorSpace: string; megapixels: string; aspectRatio: string
  }
  file: { size: string }
  date: string
  gps: { latitude: string; longitude: string } | null
  software: string
  analysis: { ev: string | null; evDescription: string | null; diffractionWarning: string | null }
}

function getTagValue(tags: ExifReader.Tags, key: string): string | undefined {
  const tag = tags[key]
  if (!tag) return undefined
  if ('description' in tag && typeof tag.description === 'string' && tag.description) return tag.description
  if ('value' in tag) {
    const v = tag.value as unknown
    if (typeof v === 'string') return v
    if (typeof v === 'number') return String(v)
    if (Array.isArray(v) && v.length > 0) return String(v[0])
  }
  return undefined
}

function getTagNumeric(tags: ExifReader.Tags, key: string): number | null {
  const raw = getTagValue(tags, key)
  if (!raw) return null
  const num = parseFloat(raw)
  return isNaN(num) ? null : num
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
  return isNaN(num) ? raw : `f/${num}`
}

function formatFocalLength(raw: string | undefined): string {
  if (!raw) return DASH
  const num = parseFloat(raw)
  return isNaN(num) ? raw : `${num}mm`
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatAspectRatio(w: number, h: number): string {
  const ratio = w / h
  if (Math.abs(ratio - 1.5) < 0.02) return '3:2'
  if (Math.abs(ratio - 1.333) < 0.02) return '4:3'
  if (Math.abs(ratio - 1.778) < 0.02) return '16:9'
  if (Math.abs(ratio - 1) < 0.02) return '1:1'
  if (Math.abs(ratio - 0.667) < 0.02) return '2:3'
  if (Math.abs(ratio - 0.75) < 0.02) return '3:4'
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
  const d = gcd(w, h)
  return `${w / d}:${h / d}`
}

function evDescription(ev: number): string {
  if (ev >= 15) return 'Bright sunlight'
  if (ev >= 13) return 'Overcast / hazy sun'
  if (ev >= 11) return 'Open shade'
  if (ev >= 8) return 'Bright indoor'
  if (ev >= 6) return 'Indoor'
  if (ev >= 4) return 'Dim indoor'
  if (ev >= 2) return 'Night street'
  if (ev >= 0) return 'Dim night'
  return 'Very dark'
}

function parseFlash(tags: ExifReader.Tags): string {
  const tag = tags['Flash']
  if (!tag) return DASH
  if ('value' in tag) {
    const v = tag.value as unknown
    const num = typeof v === 'number' ? v : typeof v === 'string' ? parseInt(v) : Array.isArray(v) ? parseInt(String(v[0])) : NaN
    if (!isNaN(num) && num in FLASH_MODES) return FLASH_MODES[num]
  }
  if ('description' in tag && typeof tag.description === 'string') return tag.description
  return DASH
}

function parseGps(tags: ExifReader.Tags): { latitude: string; longitude: string } | null {
  const lat = tags['GPSLatitude'], lon = tags['GPSLongitude']
  if (!lat || !lon) return null
  const latDesc = 'description' in lat ? lat.description : undefined
  const lonDesc = 'description' in lon ? lon.description : undefined
  if (typeof latDesc === 'string' && typeof lonDesc === 'string' && latDesc && lonDesc) {
    return { latitude: `${latDesc}\u00B0`, longitude: `${lonDesc}\u00B0` }
  }
  return null
}

function parseExif(tags: ExifReader.Tags, fileSize: number): ExifResult {
  const fNumberRaw = getTagNumeric(tags, 'FNumber')
  const exposureTimeRaw = getTagNumeric(tags, 'ExposureTime')
  const isoRaw = getTagNumeric(tags, 'ISOSpeedRatings') ?? getTagNumeric(tags, 'PhotographicSensitivity')
  const focalLengthRaw = getTagNumeric(tags, 'FocalLength')
  const widthRaw = getTagNumeric(tags, 'ImageWidth') ?? getTagNumeric(tags, 'PixelXDimension')
  const heightRaw = getTagNumeric(tags, 'ImageHeight') ?? getTagNumeric(tags, 'PixelYDimension')

  let ev: string | null = null, evDesc: string | null = null
  if (fNumberRaw && exposureTimeRaw) {
    const evVal = calcEV(fNumberRaw, exposureTimeRaw)
    const totalEV = isoRaw ? evVal + Math.log2(isoRaw / 100) : evVal
    ev = `EV ${totalEV.toFixed(1)}`
    evDesc = evDescription(totalEV)
  }

  let diffractionWarning: string | null = null
  if (fNumberRaw && focalLengthRaw && widthRaw && heightRaw) {
    const focalLength35Raw = getTagNumeric(tags, 'FocalLengthIn35mmFilm')
    if (focalLength35Raw && focalLength35Raw > 0) {
      const cropFactor = focalLength35Raw / focalLengthRaw
      const sensorWidth = 36 / cropFactor
      const mp = (widthRaw * heightRaw) / 1e6
      const pitch = pixelPitch(sensorWidth, mp)
      const limitAperture = diffractionLimitedAperture(pitch)
      if (fNumberRaw > limitAperture) {
        diffractionWarning = `Shot at f/${fNumberRaw} — past diffraction limit f/${limitAperture.toFixed(1)}. Sharpness may be reduced.`
      }
    }
  }

  let megapixels = DASH, aspectRatio = DASH
  if (widthRaw && heightRaw) {
    megapixels = `${((widthRaw * heightRaw) / 1e6).toFixed(1)} MP`
    aspectRatio = formatAspectRatio(widthRaw, heightRaw)
  }

  return {
    camera: { make: getTagValue(tags, 'Make') ?? DASH, model: getTagValue(tags, 'Model') ?? DASH },
    lens: { model: getTagValue(tags, 'LensModel') ?? DASH, make: getTagValue(tags, 'LensMake') ?? DASH },
    settings: {
      fNumber: formatFNumber(getTagValue(tags, 'FNumber')), fNumberRaw,
      exposureTime: formatExposureTime(getTagValue(tags, 'ExposureTime')), exposureTimeRaw,
      iso: isoRaw ? String(isoRaw) : DASH, isoRaw,
      focalLength: formatFocalLength(getTagValue(tags, 'FocalLength')), focalLengthRaw,
      focalLength35: formatFocalLength(getTagValue(tags, 'FocalLengthIn35mmFilm')),
      exposureProgram: EXPOSURE_PROGRAMS[getTagValue(tags, 'ExposureProgram') ?? ''] ?? getTagValue(tags, 'ExposureProgram') ?? DASH,
      meteringMode: METERING_MODES[getTagValue(tags, 'MeteringMode') ?? ''] ?? getTagValue(tags, 'MeteringMode') ?? DASH,
      flash: parseFlash(tags),
      whiteBalance: WHITE_BALANCE[getTagValue(tags, 'WhiteBalance') ?? ''] ?? getTagValue(tags, 'WhiteBalance') ?? DASH,
      focusDistance: getTagValue(tags, 'SubjectDistance') ?? getTagValue(tags, 'FocusDistance') ?? DASH,
    },
    image: {
      width: widthRaw ? String(widthRaw) : DASH, widthRaw,
      height: heightRaw ? String(heightRaw) : DASH, heightRaw,
      orientation: getTagValue(tags, 'Orientation') ?? DASH,
      colorSpace: COLOR_SPACES[getTagValue(tags, 'ColorSpace') ?? ''] ?? getTagValue(tags, 'ColorSpace') ?? DASH,
      megapixels, aspectRatio,
    },
    file: { size: formatFileSize(fileSize) },
    date: getTagValue(tags, 'DateTimeOriginal') ?? getTagValue(tags, 'DateTime') ?? DASH,
    gps: parseGps(tags),
    software: getTagValue(tags, 'Software') ?? DASH,
    analysis: { ev, evDescription: evDesc, diffractionWarning },
  }
}

// ── UI Components ──

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td>{label}</td>
      <td className={value === DASH ? styles.missing : undefined}>{value}</td>
    </tr>
  )
}

function Section({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{title}</div>
      <table className={styles.table}>
        <tbody>
          {rows.map(([label, value]) => <Row key={label} label={label} value={value} />)}
        </tbody>
      </table>
    </div>
  )
}

function AnalysisCards({ analysis }: { analysis: ExifResult['analysis'] }) {
  if (!analysis.ev && !analysis.diffractionWarning) return null
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Analysis</div>
      {analysis.ev && (
        <div className={styles.analysisCard}>
          <div className={styles.analysisLabel}>Exposure Value</div>
          <div className={styles.analysisValue}>{analysis.ev}</div>
          {analysis.evDescription && <div className={styles.analysisNote}>{analysis.evDescription}</div>}
        </div>
      )}
      {analysis.diffractionWarning && (
        <div className={styles.warningCard}>{analysis.diffractionWarning}</div>
      )}
    </div>
  )
}

// ── 3-panel histogram ──

function drawSingleHistogram(
  canvas: HTMLCanvasElement,
  hist: HistogramData,
  mode: 'luminance' | 'red' | 'green' | 'blue',
) {
  const dpr = window.devicePixelRatio || 1
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  canvas.width = w * dpr
  canvas.height = h * dpr
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, w, h)

  const barW = w / 256 + 0.5

  if (mode === 'luminance') {
    const max = Math.max(...hist.luma.slice(1, 255))
    if (max === 0) return
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
    for (let i = 0; i < 256; i++) {
      const bh = (hist.luma[i] / max) * h
      ctx.fillRect((i / 255) * w, h - bh, barW, bh)
    }
  } else if (mode === 'red') {
    const max = Math.max(...hist.r.slice(1, 255))
    if (max === 0) return
    ctx.fillStyle = 'rgba(239, 68, 68, 0.5)'
    for (let i = 0; i < 256; i++) {
      const bh = (hist.r[i] / max) * h
      ctx.fillRect((i / 255) * w, h - bh, barW, bh)
    }
  } else if (mode === 'green') {
    const max = Math.max(...hist.g.slice(1, 255))
    if (max === 0) return
    ctx.fillStyle = 'rgba(34, 197, 94, 0.5)'
    for (let i = 0; i < 256; i++) {
      const bh = (hist.g[i] / max) * h
      ctx.fillRect((i / 255) * w, h - bh, barW, bh)
    }
  } else {
    const max = Math.max(...hist.b.slice(1, 255))
    if (max === 0) return
    ctx.fillStyle = 'rgba(59, 130, 246, 0.5)'
    for (let i = 0; i < 256; i++) {
      const bh = (hist.b[i] / max) * h
      ctx.fillRect((i / 255) * w, h - bh, barW, bh)
    }
  }
}

interface HistogramTripleHandle {
  getCanvases(): (HTMLCanvasElement | null)[]
}

const HistogramTriple = forwardRef<HistogramTripleHandle, { imageUrl: string }>(function HistogramTriple({ imageUrl }, ref) {
  const lumaRef = useRef<HTMLCanvasElement>(null)
  const redRef = useRef<HTMLCanvasElement>(null)
  const greenRef = useRef<HTMLCanvasElement>(null)
  const blueRef = useRef<HTMLCanvasElement>(null)

  useImperativeHandle(ref, () => ({
    getCanvases: () => [lumaRef.current, redRef.current, greenRef.current, blueRef.current],
  }))

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      const offscreen = document.createElement('canvas')
      const maxDim = 400
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1)
      offscreen.width = Math.round(img.width * scale)
      offscreen.height = Math.round(img.height * scale)
      const offCtx = offscreen.getContext('2d')
      if (!offCtx) return
      offCtx.drawImage(img, 0, 0, offscreen.width, offscreen.height)
      const imageData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height)
      const hist = computeHistogram(imageData.data, offscreen.width, offscreen.height)

      if (lumaRef.current) drawSingleHistogram(lumaRef.current, hist, 'luminance')
      if (redRef.current) drawSingleHistogram(redRef.current, hist, 'red')
      if (greenRef.current) drawSingleHistogram(greenRef.current, hist, 'green')
      if (blueRef.current) drawSingleHistogram(blueRef.current, hist, 'blue')
    }
    img.src = imageUrl
  }, [imageUrl])

  return (
    <div className={styles.histogramRow}>
      <div className={styles.histogramPanel}>
        <div className={styles.histogramTitle}>Luminance</div>
        <canvas ref={lumaRef} className={styles.histogramCanvas} />
        <div className={styles.histogramLabels}><span>Shadows</span><span>Highlights</span></div>
      </div>
      <div className={styles.histogramPanel}>
        <div className={styles.histogramTitle}>Red</div>
        <canvas ref={redRef} className={styles.histogramCanvas} />
        <div className={styles.histogramLabels}><span>Shadows</span><span>Highlights</span></div>
      </div>
      <div className={styles.histogramPanel}>
        <div className={styles.histogramTitle}>Green</div>
        <canvas ref={greenRef} className={styles.histogramCanvas} />
        <div className={styles.histogramLabels}><span>Shadows</span><span>Highlights</span></div>
      </div>
      <div className={styles.histogramPanel}>
        <div className={styles.histogramTitle}>Blue</div>
        <canvas ref={blueRef} className={styles.histogramCanvas} />
        <div className={styles.histogramLabels}><span>Shadows</span><span>Highlights</span></div>
      </div>
    </div>
  )
})

// ── Main Component ──

const tool = getToolBySlug('exif-viewer')!

function ControlsPanel({ onFile, onSample }: { onFile: (file: File) => void; onSample: () => void }) {
  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>{tool.name}</h1>
        <p className={styles.description}>{tool.description}</p>
      </div>
      <PhotoUploadPanel onFile={onFile} />
      <button className={styles.sampleBtn} onClick={onSample}>
        Load example photo
      </button>
    </>
  )
}

export function ExifViewer() {
  const [data, setData] = useState<ExifResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const exportCanvasRef = useRef<HTMLCanvasElement>(null)
  const histogramRef = useRef<HistogramTripleHandle>(null)
  const photoImgRef = useRef<HTMLImageElement>(null)

  const loadFromUrl = useCallback(async (url: string) => {
    setError(null)
    setData(null)
    setImageUrl(url)
    try {
      const resp = await fetch(url)
      const buffer = await resp.arrayBuffer()
      const tags = ExifReader.load(buffer)
      setData(parseExif(tags, buffer.byteLength))
    } catch {
      setError('Could not read EXIF data from this image.')
    }
  }, [])

  const handleFile = useCallback((file: File) => {
    setError(null)
    setData(null)
    if (imageUrl && imageUrl.startsWith('blob:')) URL.revokeObjectURL(imageUrl)
    setImageUrl(URL.createObjectURL(file))

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const buffer = reader.result as ArrayBuffer
        const tags = ExifReader.load(buffer)
        setData(parseExif(tags, file.size))
      } catch {
        setError('Could not read EXIF data from this image.')
      }
    }
    reader.onerror = () => setError('Failed to read the file.')
    reader.readAsArrayBuffer(file)
  }, [imageUrl])

  const buildExportCanvas = useCallback(() => {
    const canvas = exportCanvasRef.current
    if (!canvas || !data) return

    const dpr = 2
    const margin = 32
    const gap = 16
    const colW = 400
    const photoMaxH = 300
    const histH = 80
    const histGap = 8

    // Measure photo dimensions
    const img = photoImgRef.current
    const photoW = colW
    const photoH = img ? Math.min(photoMaxH, (img.naturalHeight / img.naturalWidth) * colW) : photoMaxH

    // Build EXIF text rows
    const sections: { title: string; rows: [string, string][] }[] = [
      { title: 'Camera', rows: [['Make', data.camera.make], ['Model', data.camera.model]] },
      { title: 'Lens', rows: [['Lens Model', data.lens.model], ['Lens Make', data.lens.make]] },
      { title: 'Exposure', rows: [
        ['Aperture', data.settings.fNumber], ['Shutter Speed', data.settings.exposureTime],
        ['ISO', data.settings.iso], ['Focal Length', data.settings.focalLength],
        ['35mm Equiv.', data.settings.focalLength35], ['Program', data.settings.exposureProgram],
        ['Metering', data.settings.meteringMode], ['Flash', data.settings.flash],
        ['White Balance', data.settings.whiteBalance], ['Focus Distance', data.settings.focusDistance],
      ]},
      { title: 'Image', rows: [
        ['Dimensions', data.image.widthRaw && data.image.heightRaw ? `${data.image.width} × ${data.image.height}` : DASH],
        ['Megapixels', data.image.megapixels], ['Aspect Ratio', data.image.aspectRatio],
        ['Color Space', data.image.colorSpace], ['File Size', data.file.size],
      ]},
      { title: 'Date', rows: [['Date Taken', data.date]] },
    ]
    if (data.gps) sections.push({ title: 'GPS', rows: [['Latitude', data.gps.latitude], ['Longitude', data.gps.longitude]] })
    if (data.software !== DASH) sections.push({ title: 'Software', rows: [['Software', data.software]] })

    // Filter out dash-only rows
    const filteredSections = sections.map(s => ({
      ...s,
      rows: s.rows.filter(([, v]) => v !== DASH),
    })).filter(s => s.rows.length > 0)

    // Measure EXIF height
    const sectionTitleH = 24
    const rowH = 18
    const sectionGap = 12
    const exifH = filteredSections.reduce((h, s) => h + sectionTitleH + s.rows.length * rowH + sectionGap, 0)

    // Left column: photo + histograms. Right column: EXIF data
    const leftH = photoH + gap + (histH + histGap) * 4 - histGap
    const rightH = exifH
    const contentH = Math.max(leftH, rightH)
    const totalW = margin * 2 + colW + gap + colW
    const totalH = margin * 2 + contentH

    canvas.width = totalW * dpr
    canvas.height = totalH * dpr
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)

    // Background
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, totalW, totalH)

    // Draw photo
    let y = margin
    if (img) {
      ctx.drawImage(img, margin, y, photoW, photoH)
    }
    y += photoH + gap

    // Draw histograms
    const histCanvases = histogramRef.current?.getCanvases() ?? []
    const histLabels = ['Luminance', 'Red', 'Green', 'Blue']
    const histColors = ['rgba(255,255,255,0.6)', 'rgba(239,68,68,0.7)', 'rgba(34,197,94,0.7)', 'rgba(59,130,246,0.7)']
    for (let i = 0; i < 4; i++) {
      // Histogram background
      ctx.fillStyle = 'rgba(255,255,255,0.04)'
      ctx.fillRect(margin, y, colW, histH)

      // Draw histogram canvas content
      const hc = histCanvases[i]
      if (hc) {
        ctx.drawImage(hc, margin, y, colW, histH)
      }

      // Label
      ctx.fillStyle = histColors[i]
      ctx.font = '10px system-ui, sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText(histLabels[i], margin + 4, y + 4)

      y += histH + histGap
    }

    // Draw EXIF sections (right column)
    let ey = margin
    const exifX = margin + colW + gap
    for (const section of filteredSections) {
      // Section title
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 12px system-ui, sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText(section.title, exifX, ey)
      ey += sectionTitleH

      for (const [label, value] of section.rows) {
        ctx.fillStyle = '#888'
        ctx.font = '11px system-ui, sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(label, exifX, ey)

        ctx.fillStyle = '#ccc'
        ctx.textAlign = 'left'
        ctx.fillText(value, exifX + 140, ey)
        ey += rowH
      }
      ey += sectionGap
    }
  }, [data])

  // Auto-load sample photo on mount
  useEffect(() => {
    loadFromUrl(SAMPLE_PHOTO)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.app}>
      <div className={styles.appBody}>
        <div className={styles.sidebar}>
          <ToolActions toolName="EXIF Viewer" toolSlug="exif-viewer" canvasRef={exportCanvasRef} imageFilename="exif-data.png" onBeforeCopyImage={buildExportCanvas} />
          <ControlsPanel onFile={handleFile} onSample={() => loadFromUrl(SAMPLE_PHOTO)} />
        </div>

        <div className={styles.main}>
          {error && <div className={styles.error}>{error}</div>}

          {imageUrl && (
            <div className={styles.imagePreview}>
              <img ref={photoImgRef} src={imageUrl} alt="Uploaded photo" className={styles.previewImg} />
            </div>
          )}

          {data ? (
            <>
              <AnalysisCards analysis={data.analysis} />

              {imageUrl && <HistogramTriple ref={histogramRef} imageUrl={imageUrl} />}

              <div className={styles.sectionsGrid}>
                <Section title="Camera" rows={[
                  ['Make', data.camera.make],
                  ['Model', data.camera.model],
                ]} />
                <Section title="Lens" rows={[
                  ['Lens Model', data.lens.model],
                  ['Lens Make', data.lens.make],
                ]} />
                <Section title="Exposure" rows={[
                  ['Aperture', data.settings.fNumber],
                  ['Shutter Speed', data.settings.exposureTime],
                  ['ISO', data.settings.iso],
                  ['Focal Length', data.settings.focalLength],
                  ['35mm Equiv.', data.settings.focalLength35],
                  ['Program', data.settings.exposureProgram],
                  ['Metering', data.settings.meteringMode],
                  ['Flash', data.settings.flash],
                  ['White Balance', data.settings.whiteBalance],
                  ['Focus Distance', data.settings.focusDistance],
                ]} />
                <Section title="Image" rows={[
                  ['Dimensions', data.image.widthRaw && data.image.heightRaw ? `${data.image.width} × ${data.image.height}` : DASH],
                  ['Megapixels', data.image.megapixels],
                  ['Aspect Ratio', data.image.aspectRatio],
                  ['Color Space', data.image.colorSpace],
                  ['Orientation', data.image.orientation],
                  ['File Size', data.file.size],
                ]} />
                <Section title="Date" rows={[['Date Taken', data.date]]} />
                {data.gps && <Section title="GPS" rows={[
                  ['Latitude', data.gps.latitude],
                  ['Longitude', data.gps.longitude],
                ]} />}
                <Section title="Software" rows={[['Software', data.software]]} />
              </div>
            </>
          ) : null}
        </div>

        <LearnPanel slug="exif-viewer" />
      </div>

      <div className={styles.mobileControls}>
        <ControlsPanel onFile={handleFile} onSample={() => loadFromUrl(SAMPLE_PHOTO)} />
      </div>
      <canvas ref={exportCanvasRef} style={{ display: 'none' }} />
    </div>
  )
}
