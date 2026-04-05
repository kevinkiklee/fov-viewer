export const DASH = '\u2014'
export const SAMPLE_PHOTO = '/images/samples/exif-example.jpg'

export interface ExifResult {
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
