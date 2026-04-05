export function drawInfoOverlay(canvas: HTMLCanvasElement, info: {
  mode: string; focalLength: number; sensor: string; aperture: number;
  latitude: number; resolution: number;
  sharpResults?: { max500: number; maxNPF: number };
  trailInfo?: { exposurePerFrame: number; numFrames: number; totalTime: string; totalExposure: string };
}) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const dpr = window.devicePixelRatio || 1
  const w = canvas.width / dpr

  ctx.save()
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const barH = info.mode === 'trails' ? 56 : 44
  const h = canvas.height / dpr
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.fillRect(0, h - barH, w, barH)

  ctx.fillStyle = '#ccc'
  ctx.font = '11px system-ui, sans-serif'
  const settingsLine = `${info.focalLength}mm  ·  f/${info.aperture}  ·  ${info.sensor}  ·  ${info.resolution}MP  ·  Lat ${info.latitude}°`
  ctx.fillText(settingsLine, 12, h - barH + 16)

  ctx.fillStyle = '#fff'
  ctx.font = 'bold 12px system-ui, sans-serif'
  if (info.mode === 'sharp' && info.sharpResults) {
    ctx.fillText(`500 Rule: ${info.sharpResults.max500.toFixed(1)}s  ·  NPF Rule: ${info.sharpResults.maxNPF.toFixed(1)}s`, 12, h - barH + 36)
  } else if (info.mode === 'trails' && info.trailInfo) {
    ctx.fillText(`${info.trailInfo.exposurePerFrame}s × ${info.trailInfo.numFrames} frames  ·  Total: ${info.trailInfo.totalTime}`, 12, h - barH + 36)
    ctx.fillStyle = '#999'
    ctx.font = '11px system-ui, sans-serif'
    ctx.fillText(`Exposure: ${info.trailInfo.totalExposure}`, 12, h - barH + 52)
  }

  ctx.restore()
}
