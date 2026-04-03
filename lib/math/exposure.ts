/**
 * Calculate Exposure Value (EV) at ISO 100.
 *
 * EV is a single number that represents a combination of aperture and shutter
 * speed producing the same exposure. Higher EV = brighter scene / less exposure.
 *
 * Formula: EV = log2(N^2 / t)
 *
 * @param aperture     - F-number (e.g. 2.8, 5.6, 11)
 * @param shutterSpeed - Shutter speed in seconds (e.g. 0.008 for 1/125s)
 * @returns EV at ISO 100
 */
export function calcEV(aperture: number, shutterSpeed: number): number {
  return Math.log2((aperture * aperture) / shutterSpeed)
}

/**
 * Calculate the adjusted shutter speed when using an ND (neutral density) filter.
 *
 * An ND filter reduces light by a number of stops. Each stop doubles the
 * required exposure time: adjustedShutter = baseShutter * 2^stops
 *
 * @param baseShutter - Original shutter speed in seconds (without filter)
 * @param ndStops     - ND filter strength in stops (e.g. 3 for ND8, 10 for ND1024)
 * @returns Adjusted shutter speed in seconds
 */
export function shutterWithNd(baseShutter: number, ndStops: number): number {
  return baseShutter * Math.pow(2, ndStops)
}

/**
 * Convert an ND filter's light-reduction factor to stops.
 *
 * stops = log2(factor), e.g. ND8 (factor=8) = 3 stops, ND1024 (factor=1024) = 10 stops.
 *
 * @param factor - ND filter factor (e.g. 8 for ND8)
 * @returns Number of stops of light reduction
 */
export function ndFactorToStops(factor: number): number {
  return Math.log2(factor)
}

/**
 * Format a shutter speed in seconds to a photographer-friendly string.
 *
 * Uses conventional camera display formats:
 *   - Sub-second: "1/N" fraction (e.g. 0.008 -> "1/125")
 *   - Seconds:    "Xs" (e.g. 2 -> "2s")
 *   - Minutes:    "Xm Ys" (e.g. 90 -> "1m 30s")
 *
 * @param seconds - Shutter speed in seconds
 * @returns Human-readable shutter speed string
 */
export function formatShutterSpeed(seconds: number): string {
  if (seconds < 1) {
    const denominator = Math.round(1 / seconds)
    return `1/${denominator}`
  }
  if (seconds < 60) {
    const s = Math.round(seconds)
    return `${s}s`
  }
  const totalSeconds = Math.round(seconds)
  const minutes = Math.floor(totalSeconds / 60)
  const remainderSeconds = totalSeconds % 60
  if (remainderSeconds === 0) {
    return `${minutes}m`
  }
  return `${minutes}m ${remainderSeconds}s`
}

/**
 * Calculate the minimum handheld shutter speed using the reciprocal rule.
 *
 * The reciprocal rule states that the minimum shutter speed for sharp handheld
 * photos is 1 / (focalLength * cropFactor). Image stabilization allows slower
 * speeds: each stop of stabilization doubles the allowed exposure time.
 *
 *   minShutter = (1 / (focalLength * cropFactor)) * 2^stabStops
 *
 * Example: 200mm on APS-C (1.5x) with 3-stop IBIS = 1/300 * 8 = 1/37.5s
 *
 * @param focalLength - Focal length in mm
 * @param cropFactor  - Sensor crop factor
 * @param stabStops   - Stops of image stabilization (0 = none)
 * @returns Minimum shutter speed in seconds
 */
export function reciprocalRule(focalLength: number, cropFactor: number, stabStops: number): number {
  const baseShutter = 1 / (focalLength * cropFactor)
  // Each stop of stabilization allows 2x longer shutter
  return baseShutter * Math.pow(2, stabStops)
}

/**
 * Solve for shutter speed given target EV, aperture, and ISO.
 *
 * Derived from the exposure equation:
 *   EV = log2(N^2 / t) + log2(ISO / 100)
 *   t  = N^2 * 100 / (2^EV * ISO)
 *
 * @param ev       - Target exposure value
 * @param aperture - F-number
 * @param iso      - ISO sensitivity
 * @returns Required shutter speed in seconds
 */
export function solveForShutter(ev: number, aperture: number, iso: number): number {
  return (aperture * aperture * 100) / (Math.pow(2, ev) * iso)
}

/**
 * Solve for aperture given target EV, shutter speed, and ISO.
 *
 * Derived from: N = sqrt(t * 2^EV * ISO / 100)
 *
 * @param ev           - Target exposure value
 * @param shutterSpeed - Shutter speed in seconds
 * @param iso          - ISO sensitivity
 * @returns Required f-number
 */
export function solveForAperture(ev: number, shutterSpeed: number, iso: number): number {
  return Math.sqrt((shutterSpeed * Math.pow(2, ev) * iso) / 100)
}

/**
 * Solve for ISO given target EV, aperture, and shutter speed.
 *
 * Derived from: ISO = 100 * N^2 / (t * 2^EV)
 *
 * @param ev           - Target exposure value
 * @param aperture     - F-number
 * @param shutterSpeed - Shutter speed in seconds
 * @returns Required ISO sensitivity
 */
export function solveForISO(ev: number, aperture: number, shutterSpeed: number): number {
  return (100 * aperture * aperture) / (shutterSpeed * Math.pow(2, ev))
}

export function calcCircleOfConfusion(
  depth: number,
  focusDistance: number,
  aperture: number,
  maxRadius: number = 20
): number {
  const maxAperture = 1.4
  const minAperture = 22
  const apertureScale = 1.0 - Math.log2(aperture / maxAperture) / Math.log2(minAperture / maxAperture)
  const coc = Math.abs(depth - focusDistance) * apertureScale * maxRadius
  return Math.min(Math.max(coc, 0), maxRadius)
}

export function calcMotionBlurAmount(shutterSpeed: number, maxBlur: number = 40): number {
  const minShutter = 1 / 8000
  const maxShutter = 30
  const logMin = Math.log2(minShutter)
  const logMax = Math.log2(maxShutter)
  const logCurrent = Math.log2(Math.max(shutterSpeed, minShutter))
  const t = (logCurrent - logMin) / (logMax - logMin)
  return Math.min(Math.max(t * maxBlur, 0), maxBlur)
}

export function calcNoiseAmplitude(iso: number): number {
  if (iso <= 100) return 0
  return Math.log2(iso / 100) / 16
}
