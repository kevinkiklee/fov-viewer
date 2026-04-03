'use client'

import { useState, useCallback } from 'react'
import ExifReader from 'exifreader'
import { FileDropZone } from '@/components/shared/FileDropZone'
import styles from './ExifViewer.module.css'

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
  const denom = Math.round(1 / num)
  return `1/${denom}s`
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

function Row({ label, value }: { label: string; value: string }) {
  const isMissing = value === DASH
  return (
    <tr>
      <td>{label}</td>
      <td className={isMissing ? styles.missing : undefined}>{value}</td>
    </tr>
  )
}

function Section({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{title}</div>
      <table className={styles.table}>
        <tbody>
          {rows.map(([label, value]) => (
            <Row key={label} label={label} value={value} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ExifViewer() {
  const [data, setData] = useState<ExifResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback((file: File) => {
    setError(null)
    setData(null)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const buffer = reader.result as ArrayBuffer
        const tags = ExifReader.load(buffer)
        setData(parseExif(tags))
      } catch {
        setError('Could not read EXIF data from this image. The file may not contain metadata.')
      }
    }
    reader.onerror = () => setError('Failed to read the file.')
    reader.readAsArrayBuffer(file)
  }, [])

  return (
    <div className={styles.wrapper}>
      <FileDropZone onFile={handleFile} />

      {error && <div className={styles.error}>{error}</div>}

      {data && (
        <>
          <Section
            title="Camera"
            rows={[
              ['Make', data.camera.make],
              ['Model', data.camera.model],
            ]}
          />
          <Section
            title="Lens"
            rows={[
              ['Lens Model', data.lens.model],
              ['Lens Make', data.lens.make],
            ]}
          />
          <Section
            title="Settings"
            rows={[
              ['Aperture', data.settings.fNumber],
              ['Shutter Speed', data.settings.exposureTime],
              ['ISO', data.settings.iso],
              ['Focal Length', data.settings.focalLength],
              ['Focal Length (35mm equiv.)', data.settings.focalLength35],
            ]}
          />
          <Section
            title="Image"
            rows={[
              ['Width', data.image.width],
              ['Height', data.image.height],
              ['Orientation', data.image.orientation],
            ]}
          />
          <Section title="Date" rows={[['Date Taken', data.date]]} />
          {data.gps && (
            <Section
              title="GPS"
              rows={[
                ['Latitude', data.gps.latitude],
                ['Longitude', data.gps.longitude],
              ]}
            />
          )}
          <Section title="Software" rows={[['Software', data.software]]} />
        </>
      )}
    </div>
  )
}
