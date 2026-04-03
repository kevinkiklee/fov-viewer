/**
 * Calculate the camera distance needed to maintain the same apparent subject
 * size when switching from a reference focal length to a different focal length.
 *
 * This is the basis of "perspective compression" — a telephoto lens shot from
 * farther away produces the same subject size but compresses background depth,
 * while a wide-angle shot from closer away expands perceived depth.
 *
 * Formula:
 *   newDistance = subjectDistance * (focalLength / refFocalLength)
 *
 * Derivation: apparent size ∝ focalLength / distance. To keep apparent size
 * constant, focalLength / distance = refFocalLength / subjectDistance, so
 * distance = subjectDistance * (focalLength / refFocalLength).
 *
 * @param focalLength      - Target lens focal length in mm
 * @param refFocalLength   - Reference lens focal length in mm
 * @param subjectDistance  - Camera-to-subject distance at the reference focal length
 *                           (any unit; result uses the same unit)
 * @returns Camera distance needed to keep the subject the same apparent size
 */
export function calcCameraDistance(
  focalLength: number,
  refFocalLength: number,
  subjectDistance: number,
): number {
  return subjectDistance * (focalLength / refFocalLength)
}
