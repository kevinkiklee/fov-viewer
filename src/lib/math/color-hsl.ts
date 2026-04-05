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
