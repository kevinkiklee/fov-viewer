/**
 * Extract and transfer EXIF metadata between JPEG files.
 *
 * JPEG structure: FF D8 (SOI) followed by segments.
 * Each segment: FF XX (marker) + 2-byte length + data.
 * APP1 (FF E1) carries EXIF and XMP metadata.
 */

const SOI = 0xffd8
const SOS = 0xffda
const APP1 = 0xffe1

/** Extract all APP1 (EXIF/XMP) segments from a JPEG buffer as sliced ArrayBuffers. */
function extractApp1Segments(jpeg: ArrayBuffer): ArrayBuffer[] {
  const view = new DataView(jpeg)
  const segments: ArrayBuffer[] = []

  if (view.byteLength < 4 || view.getUint16(0) !== SOI) return segments

  let offset = 2
  while (offset + 3 < view.byteLength) {
    const marker = view.getUint16(offset)
    if (marker === SOS) break
    if ((marker & 0xff00) !== 0xff00) break

    const segLen = view.getUint16(offset + 2)
    const totalLen = 2 + segLen // marker(2) is separate from length field

    if (marker === APP1) {
      segments.push(jpeg.slice(offset, offset + totalLen))
    }

    offset += totalLen
  }

  return segments
}

/**
 * Copy EXIF metadata from an original JPEG into an exported JPEG blob.
 * Returns the original blob unchanged for non-JPEG types.
 */
export async function transferExif(
  originalBuffer: ArrayBuffer,
  exportedBlob: Blob,
  mimeType: string,
): Promise<Blob> {
  if (mimeType !== 'image/jpeg' && mimeType !== 'image/jpg') return exportedBlob

  const exifSegments = extractApp1Segments(originalBuffer)
  if (exifSegments.length === 0) return exportedBlob

  const exportedBuffer = await exportedBlob.arrayBuffer()
  const exportedView = new DataView(exportedBuffer)
  if (exportedView.byteLength < 2 || exportedView.getUint16(0) !== SOI) return exportedBlob

  // Insert EXIF segments right after SOI (FF D8)
  const parts: ArrayBuffer[] = [
    exportedBuffer.slice(0, 2),
    ...exifSegments,
    exportedBuffer.slice(2),
  ]

  return new Blob(parts, { type: mimeType })
}
