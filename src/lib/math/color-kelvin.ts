/**
 * Convert a color temperature in Kelvin to approximate RGB values.
 *
 * Based on Tanner Helland's algorithm, which curve-fits the CIE 1964
 * standard observer data. Used for white balance visualization.
 *
 * Clamps input to 1000K-40000K range. Lower values produce warm (orange/red)
 * tones, higher values produce cool (blue) tones.
 *
 * @param kelvin - Color temperature in Kelvin (e.g. 5500 for daylight)
 * @returns RGB values, each 0-255
 */
export function kelvinToRgb(kelvin: number): { r: number; g: number; b: number } {
  // Divide by 100 so threshold checks use "temp 66" = 6600K, the inflection
  // point where the CIE color response curve changes shape for each channel.
  const temp = Math.max(1000, Math.min(40000, kelvin)) / 100

  let r: number
  let g: number
  let b: number

  // Each channel uses different curve-fitted polynomials above/below 6600K
  // because R/G/B respond differently to blackbody radiation at that boundary.
  // Coefficients (329.69…, 99.47…, etc.) are from Helland's polynomial fit
  // to the CIE 1964 10° standard observer color matching functions.

  // Red: saturated below 6600K, power-law decay above
  if (temp <= 66) {
    r = 255
  } else {
    r = temp - 60
    r = 329.698727446 * Math.pow(r, -0.1332047592)
    r = Math.max(0, Math.min(255, r))
  }

  // Green: logarithmic rise below 6600K, power-law decay above
  if (temp <= 66) {
    g = temp
    g = 99.4708025861 * Math.log(g) - 161.1195681661
    g = Math.max(0, Math.min(255, g))
  } else {
    g = temp - 60
    g = 288.1221695283 * Math.pow(g, -0.0755148492)
    g = Math.max(0, Math.min(255, g))
  }

  // Blue: saturated above 6600K, zero below 1900K, logarithmic rise between
  if (temp >= 66) {
    b = 255
  } else if (temp <= 19) {
    b = 0
  } else {
    b = temp - 10
    b = 138.5177312231 * Math.log(b) - 305.0447927307
    b = Math.max(0, Math.min(255, b))
  }

  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b),
  }
}
