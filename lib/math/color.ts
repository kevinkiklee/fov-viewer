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
  const temp = Math.max(1000, Math.min(40000, kelvin)) / 100

  let r: number
  let g: number
  let b: number

  // Red
  if (temp <= 66) {
    r = 255
  } else {
    r = temp - 60
    r = 329.698727446 * Math.pow(r, -0.1332047592)
    r = Math.max(0, Math.min(255, r))
  }

  // Green
  if (temp <= 66) {
    g = temp
    g = 99.4708025861 * Math.log(g) - 161.1195681661
    g = Math.max(0, Math.min(255, g))
  } else {
    g = temp - 60
    g = 288.1221695283 * Math.pow(g, -0.0755148492)
    g = Math.max(0, Math.min(255, g))
  }

  // Blue
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

/**
 * Convert HSL (Hue, Saturation, Lightness) to RGB.
 *
 * Uses the standard HSL-to-RGB conversion with chroma/hue sector mapping.
 *
 * @param h - Hue in degrees (0-360)
 * @param s - Saturation as percentage (0-100)
 * @param l - Lightness as percentage (0-100)
 * @returns RGB values, each 0-255
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const sn = s / 100
  const ln = l / 100

  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = ln - c / 2

  let r1 = 0
  let g1 = 0
  let b1 = 0

  if (h < 60) {
    r1 = c; g1 = x; b1 = 0
  } else if (h < 120) {
    r1 = x; g1 = c; b1 = 0
  } else if (h < 180) {
    r1 = 0; g1 = c; b1 = x
  } else if (h < 240) {
    r1 = 0; g1 = x; b1 = c
  } else if (h < 300) {
    r1 = x; g1 = 0; b1 = c
  } else {
    r1 = c; g1 = 0; b1 = x
  }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  }
}

/**
 * Convert RGB to HSL (Hue, Saturation, Lightness).
 *
 * Uses the standard algorithm: find min/max of normalized RGB channels,
 * compute lightness as their average, saturation from the delta, and
 * hue from which channel is dominant.
 *
 * @param r - Red channel (0-255)
 * @param g - Green channel (0-255)
 * @param b - Blue channel (0-255)
 * @returns HSL values: h (0-360), s (0-100), l (0-100)
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255

  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min

  const l = (max + min) / 2

  let s = 0
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1))
  }

  let h = 0
  if (delta !== 0) {
    if (max === rn) {
      h = 60 * (((gn - bn) / delta) % 6)
    } else if (max === gn) {
      h = 60 * ((bn - rn) / delta + 2)
    } else {
      h = 60 * ((rn - gn) / delta + 4)
    }
  }

  if (h < 0) h += 360

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

/** Normalize hue to 0-360 range */
function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360
}

/**
 * Complementary color harmony: two colors opposite on the color wheel.
 * Creates high contrast and visual tension. Common in sunset/blue-hour photography.
 * @returns [baseHue, baseHue + 180]
 */
export function complementary(hue: number): number[] {
  return [normalizeHue(hue), normalizeHue(hue + 180)]
}

/**
 * Analogous color harmony: three adjacent colors on the color wheel.
 * Creates a smooth, unified feel. Common in nature and golden-hour landscapes.
 * @returns [baseHue - 30, baseHue, baseHue + 30]
 */
export function analogous(hue: number, spread: number = 30): number[] {
  return [normalizeHue(hue - spread), normalizeHue(hue), normalizeHue(hue + spread)]
}

/**
 * Triadic color harmony: three colors evenly spaced (120 degrees apart).
 * Creates vibrant, balanced compositions. Used in editorial and creative work.
 * @returns [baseHue, baseHue + 120, baseHue + 240]
 */
export function triadic(hue: number): number[] {
  return [normalizeHue(hue), normalizeHue(hue + 120), normalizeHue(hue + 240)]
}

/**
 * Split-complementary color harmony: base color plus two colors adjacent
 * to its complement. Less tension than complementary, more variety than analogous.
 * @returns [baseHue, baseHue + 150, baseHue + 210]
 */
export function splitComplementary(hue: number, splitAngle: number = 30): number[] {
  return [normalizeHue(hue), normalizeHue(hue + 180 - splitAngle), normalizeHue(hue + 180 + splitAngle)]
}

/**
 * Tetradic (rectangular) harmony — four colors forming a rectangle on the wheel.
 * Provides rich color variety with two complementary pairs.
 * @returns [baseHue, baseHue + 60, baseHue + 180, baseHue + 240]
 */
export function tetradic(hue: number): number[] {
  return [normalizeHue(hue), normalizeHue(hue + 60), normalizeHue(hue + 180), normalizeHue(hue + 240)]
}
