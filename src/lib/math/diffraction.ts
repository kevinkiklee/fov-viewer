import { mpToPixelDimensions } from './resolution'

/**
 * Calculate pixel pitch (the physical size of one pixel) from sensor dimensions.
 *
 * When sensorHeightMm is provided, uses the actual aspect ratio.
 * Otherwise falls back to a 3:2 aspect ratio (standard for most cameras).
 *
 * The derivation:
 *   totalPixels = resolutionMp * 1,000,000
 *   aspectRatio = sensorWidth / sensorHeight
 *   widthPixels = sqrt(totalPixels * aspectRatio)
 *   pixelPitch  = sensorWidth / widthPixels
 *
 * @param sensorWidthMm  - Sensor width in mm (e.g. 36 for full frame)
 * @param resolutionMp   - Sensor resolution in megapixels (e.g. 24)
 * @param sensorHeightMm - Sensor height in mm (optional, defaults to 3:2 aspect)
 * @returns Pixel pitch in micrometers (µm)
 */
export function pixelPitch(sensorWidthMm: number, resolutionMp: number, sensorHeightMm?: number): number {
  const aspect = sensorHeightMm
    ? { w: sensorWidthMm, h: sensorHeightMm }
    : { w: 3, h: 2 }
  const { pxW } = mpToPixelDimensions(resolutionMp, aspect)
  const pitchMm = sensorWidthMm / pxW
  return pitchMm * 1000
}

/**
 * Calculate the aperture at which diffraction begins to soften the image
 * beyond what the sensor can resolve — the "diffraction limit".
 *
 * Based on the Airy disk diameter matching the pixel pitch:
 *   d_airy ≈ 2.44 · λ · N      (diameter, first minimum)
 * Solving for N at d_airy = pixelPitch and λ = 550nm (green light):
 *   N ≈ pixelPitch / (2.44 × 0.00055 mm) ≈ pixelPitch / 0.001342 mm
 *                                        ≈ pixelPitch(µm) / 1.342
 * The 0.67 constant used below is the industry-standard simplification that
 * matches the Airy disk *radius* (not diameter) at the first minimum:
 *   N ≈ pixelPitch(µm) / 0.67
 * Stopping down beyond this f-number will reduce per-pixel sharpness due to
 * diffraction, even though overall depth of field increases.
 *
 * @param pixelPitchUm - Pixel pitch in micrometers
 * @returns Diffraction-limited f-number
 */
export function diffractionLimitedAperture(pixelPitchUm: number): number {
  return pixelPitchUm / 0.67
}
