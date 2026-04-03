import type { ToolDef } from '@/lib/types'

export const TOOLS: ToolDef[] = [
  { slug: 'fov-simulator', name: 'FOV Simulator', description: 'Compare field of view across focal lengths and sensor sizes', status: 'live', category: 'visualizer' },
  { slug: 'color-harmony', name: 'Color Harmony Picker', description: 'Build color palettes for photography shoots', status: 'live', category: 'visualizer' },
  { slug: 'exposure-simulator', name: 'Exposure Triangle Simulator', description: 'See how aperture, shutter speed, and ISO interact', status: 'draft', category: 'visualizer' },
  { slug: 'dof-calculator', name: 'Depth of Field Calculator', description: 'Calculate near focus, far focus, and total depth of field', status: 'draft', category: 'calculator' },
  { slug: 'hyperfocal-table', name: 'Hyperfocal Distance Table', description: 'Quick-reference hyperfocal distances for any lens and aperture', status: 'draft', category: 'reference' },
  { slug: 'shutter-speed-guide', name: 'Shutter Speed Guide', description: 'Find the minimum safe shutter speed for sharp handheld shots', status: 'draft', category: 'calculator' },
  { slug: 'nd-filter-calculator', name: 'ND Filter Calculator', description: 'Calculate exposure time with any ND filter', status: 'draft', category: 'calculator' },
  { slug: 'diffraction-limit', name: 'Diffraction Limit Calculator', description: 'Find the sharpest aperture for your sensor', status: 'draft', category: 'calculator' },
  { slug: 'star-trail-calculator', name: 'Star Trail Calculator', description: 'Calculate max exposure for sharp stars or plan star trail shots', status: 'draft', category: 'calculator' },
  { slug: 'white-balance', name: 'White Balance Visualizer', description: 'See how color temperature affects your photos', status: 'draft', category: 'visualizer' },
  { slug: 'ev-chart', name: 'EV Chart', description: 'Interactive exposure value reference chart', status: 'draft', category: 'reference' },
  { slug: 'sensor-size', name: 'Sensor Size Comparison', description: 'Compare camera sensor sizes visually', status: 'draft', category: 'visualizer' },
  { slug: 'exif-viewer', name: 'EXIF Viewer', description: 'View photo metadata without uploading — 100% client-side', status: 'draft', category: 'file-tool' },
  { slug: 'histogram', name: 'Histogram Explainer', description: 'Understand your photo\'s histogram with annotations', status: 'draft', category: 'file-tool' },
]

export function getToolBySlug(slug: string): ToolDef | undefined {
  return TOOLS.find((t) => t.slug === slug)
}

export function getLiveTools(): ToolDef[] {
  if (process.env.NODE_ENV === 'development') return TOOLS
  return TOOLS.filter((t) => t.status === 'live')
}
