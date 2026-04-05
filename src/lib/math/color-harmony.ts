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
export function tetradic(hue: number, offset: number = 60): number[] {
  return [normalizeHue(hue), normalizeHue(hue + offset), normalizeHue(hue + 180), normalizeHue(hue + 180 + offset)]
}
