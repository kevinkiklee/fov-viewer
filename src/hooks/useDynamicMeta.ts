import { useEffect } from 'react'
import type { LensConfig } from '../types'
import { getSensor } from '../data/sensors'

const BASE_TITLE = 'FOV Viewer — Camera Field of View & Focal Length Comparison Tool'

function buildTitle(lenses: LensConfig[]): string {
  if (lenses.length === 0) return BASE_TITLE
  const parts = lenses.map((l) => `${l.focalLength}mm`)
  const sensorNames = [...new Set(lenses.map((l) => getSensor(l.sensorId).name))]
  const sensorSuffix = sensorNames.length === 1 ? ` (${sensorNames[0]})` : ''
  return `${parts.join(' vs ')}${sensorSuffix} — FOV Viewer`
}

function buildDescription(lenses: LensConfig[]): string {
  if (lenses.length === 0) {
    return 'Free tool to visualize and compare camera field of view across focal lengths (14mm to 800mm) and sensor sizes (full frame, APS-C, Micro Four Thirds).'
  }
  const parts = lenses.map((l) => {
    const sensor = getSensor(l.sensorId)
    return `${l.focalLength}mm on ${sensor.name}`
  })
  return `See the field of view difference between ${parts.join(' and ')}. Compare focal lengths visually with FOV Viewer.`
}

export function useDynamicMeta(lenses: LensConfig[]): void {
  useEffect(() => {
    const hasParams = new URLSearchParams(window.location.search).has('a')
    if (!hasParams) return

    document.title = buildTitle(lenses)

    const descMeta = document.querySelector('meta[name="description"]')
    if (descMeta) descMeta.setAttribute('content', buildDescription(lenses))

    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', buildTitle(lenses))

    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) ogDesc.setAttribute('content', buildDescription(lenses))

    const ogUrl = document.querySelector('meta[property="og:url"]')
    if (ogUrl) ogUrl.setAttribute('content', window.location.href)

    return () => {
      document.title = BASE_TITLE
    }
  }, [lenses])
}
