import ExifReader from 'exifreader'

export interface ExifResult {
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

export const DASH = '\u2014'

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

export function parseExif(tags: ExifReader.Tags): ExifResult {
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
