import type { ExifResult } from './exifTypes'
import type { HistogramTripleHandle } from './HistogramTriple'

const DASH = '\u2014'

export function buildExportCanvas(
  exportCanvas: HTMLCanvasElement,
  data: ExifResult,
  photoImg: HTMLImageElement | null,
  histogramHandle: HistogramTripleHandle | null,
) {
  const dpr = 2
  const margin = 32
  const gap = 16
  const colW = 400
  const photoMaxH = 300
  const histH = 80
  const histGap = 8

  const photoW = colW
  const photoH = photoImg ? Math.min(photoMaxH, (photoImg.naturalHeight / photoImg.naturalWidth) * colW) : photoMaxH

  const sections: { title: string; rows: [string, string][] }[] = [
    { title: 'Camera', rows: [['Make', data.camera.make], ['Model', data.camera.model]] },
    { title: 'Lens', rows: [['Lens Model', data.lens.model], ['Lens Make', data.lens.make]] },
    { title: 'Exposure', rows: [
      ['Aperture', data.settings.fNumber], ['Shutter Speed', data.settings.exposureTime],
      ['ISO', data.settings.iso], ['Focal Length', data.settings.focalLength],
      ['35mm Equiv.', data.settings.focalLength35], ['Program', data.settings.exposureProgram],
      ['Metering', data.settings.meteringMode], ['Flash', data.settings.flash],
      ['White Balance', data.settings.whiteBalance], ['Focus Distance', data.settings.focusDistance],
    ]},
    { title: 'Image', rows: [
      ['Dimensions', data.image.widthRaw && data.image.heightRaw ? `${data.image.width} × ${data.image.height}` : DASH],
      ['Megapixels', data.image.megapixels], ['Aspect Ratio', data.image.aspectRatio],
      ['Color Space', data.image.colorSpace], ['File Size', data.file.size],
    ]},
    { title: 'Date', rows: [['Date Taken', data.date]] },
  ]
  if (data.gps) sections.push({ title: 'GPS', rows: [['Latitude', data.gps.latitude], ['Longitude', data.gps.longitude]] })
  if (data.software !== DASH) sections.push({ title: 'Software', rows: [['Software', data.software]] })

  const filteredSections = sections.map(s => ({
    ...s, rows: s.rows.filter(([, v]) => v !== DASH),
  })).filter(s => s.rows.length > 0)

  const sectionTitleH = 24
  const rowH = 18
  const sectionGap = 12
  const exifH = filteredSections.reduce((h, s) => h + sectionTitleH + s.rows.length * rowH + sectionGap, 0)

  const leftH = photoH + gap + (histH + histGap) * 4 - histGap
  const rightH = exifH
  const contentH = Math.max(leftH, rightH)
  const totalW = margin * 2 + colW + gap + colW
  const totalH = margin * 2 + contentH

  exportCanvas.width = totalW * dpr
  exportCanvas.height = totalH * dpr
  const ctx = exportCanvas.getContext('2d')
  if (!ctx) return
  ctx.scale(dpr, dpr)

  ctx.fillStyle = '#0d0d0d'
  ctx.fillRect(0, 0, totalW, totalH)

  let y = margin
  if (photoImg) ctx.drawImage(photoImg, margin, y, photoW, photoH)
  y += photoH + gap

  const histCanvases = histogramHandle?.getCanvases() ?? []
  const histLabels = ['Luminance', 'Red', 'Green', 'Blue']
  const histColors = ['rgba(255,255,255,0.6)', 'rgba(239,68,68,0.7)', 'rgba(34,197,94,0.7)', 'rgba(59,130,246,0.7)']
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.fillRect(margin, y, colW, histH)
    const hc = histCanvases[i]
    if (hc) ctx.drawImage(hc, margin, y, colW, histH)
    ctx.fillStyle = histColors[i]
    ctx.font = '10px system-ui, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(histLabels[i], margin + 4, y + 4)
    y += histH + histGap
  }

  let ey = margin
  const exifX = margin + colW + gap
  for (const section of filteredSections) {
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 12px system-ui, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(section.title, exifX, ey)
    ey += sectionTitleH
    for (const [label, value] of section.rows) {
      ctx.fillStyle = '#888'
      ctx.font = '11px system-ui, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(label, exifX, ey)
      ctx.fillStyle = '#ccc'
      ctx.textAlign = 'left'
      ctx.fillText(value, exifX + 140, ey)
      ey += rowH
    }
    ey += sectionGap
  }
}
