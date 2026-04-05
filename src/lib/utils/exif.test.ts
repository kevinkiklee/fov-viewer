import { describe, it, expect } from 'vitest'
import { transferExif } from './exif'

/** Build a minimal JPEG with SOI + one segment + SOS stub. */
function makeJpeg(segments: { marker: number; data: Uint8Array }[]): ArrayBuffer {
  const parts: number[] = [0xff, 0xd8] // SOI
  for (const seg of segments) {
    parts.push((seg.marker >> 8) & 0xff, seg.marker & 0xff)
    const len = seg.data.length + 2
    parts.push((len >> 8) & 0xff, len & 0xff)
    parts.push(...seg.data)
  }
  parts.push(0xff, 0xda) // SOS marker
  parts.push(0x00, 0x02) // minimal SOS length
  return new Uint8Array(parts).buffer as ArrayBuffer
}

describe('transferExif', () => {
  it('returns blob unchanged for PNG', async () => {
    const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' })
    const result = await transferExif(new ArrayBuffer(0), blob, 'image/png')
    expect(result).toBe(blob)
  })

  it('returns blob unchanged when original has no APP1', async () => {
    const original = makeJpeg([{ marker: 0xffe0, data: new Uint8Array([0x4a, 0x46]) }])
    const exported = makeJpeg([])
    const exportedBlob = new Blob([exported], { type: 'image/jpeg' })

    const result = await transferExif(original, exportedBlob, 'image/jpeg')
    expect(result).toBe(exportedBlob)
  })

  it('inserts APP1 segment into exported JPEG', async () => {
    const exifData = new Uint8Array([0x45, 0x78, 0x69, 0x66, 0x00, 0x00]) // "Exif\0\0"
    const original = makeJpeg([{ marker: 0xffe1, data: exifData }])
    const exported = makeJpeg([{ marker: 0xffe0, data: new Uint8Array([0x4a, 0x46]) }])
    const exportedBlob = new Blob([exported], { type: 'image/jpeg' })

    const result = await transferExif(original, exportedBlob, 'image/jpeg')
    const buf = await result.arrayBuffer()
    const view = new DataView(buf)

    // SOI still at offset 0
    expect(view.getUint16(0)).toBe(0xffd8)
    // APP1 inserted at offset 2
    expect(view.getUint16(2)).toBe(0xffe1)
    // Original APP0 follows after the APP1 segment
    const app1Len = view.getUint16(4)
    expect(view.getUint16(2 + 2 + app1Len)).toBe(0xffe0)
  })

  it('preserves multiple APP1 segments', async () => {
    const exif = new Uint8Array([0x45, 0x78, 0x69, 0x66, 0x00, 0x00])
    const xmp = new Uint8Array([0x58, 0x4d, 0x50, 0x00])
    const original = makeJpeg([
      { marker: 0xffe1, data: exif },
      { marker: 0xffe0, data: new Uint8Array([0x00]) }, // non-APP1 in between
      { marker: 0xffe1, data: xmp },
    ])
    const exported = makeJpeg([])
    const exportedBlob = new Blob([exported], { type: 'image/jpeg' })

    const result = await transferExif(original, exportedBlob, 'image/jpeg')
    const buf = await result.arrayBuffer()
    const view = new DataView(buf)

    // Both APP1 segments should be present after SOI
    expect(view.getUint16(2)).toBe(0xffe1)
    const firstLen = view.getUint16(4)
    expect(view.getUint16(2 + 2 + firstLen)).toBe(0xffe1)
  })
})
