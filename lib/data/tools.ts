import type { ToolDef, ToolStatus } from '@/lib/types'

export const TOOLS: ToolDef[] = [
  { slug: 'fov-simulator', name: 'FOV Simulator', description: 'Compare field of view across focal lengths and sensor sizes', dev: 'live', prod: 'live', category: 'visualizer' },
  { slug: 'color-harmony', name: 'Color Harmony Picker', description: 'Build color palettes for photography shoots', dev: 'live', prod: 'live', category: 'visualizer' },
  { slug: 'exposure-simulator', name: 'Exposure Triangle Simulator', description: 'See how aperture, shutter speed, and ISO interact', dev: 'live', prod: 'draft', category: 'visualizer' },
  { slug: 'dof-calculator', name: 'Depth of Field Calculator', description: 'Calculate near focus, far focus, and total depth of field', dev: 'live', prod: 'draft', category: 'calculator' },
  { slug: 'hyperfocal-table', name: 'Hyperfocal Distance Table', description: 'Quick-reference hyperfocal distances for any lens and aperture', dev: 'live', prod: 'draft', category: 'reference' },
  { slug: 'shutter-speed-guide', name: 'Shutter Speed Guide', description: 'Find the minimum safe shutter speed for sharp handheld shots', dev: 'live', prod: 'draft', category: 'calculator' },
  { slug: 'nd-filter-calculator', name: 'ND Filter Calculator', description: 'Calculate exposure time with any ND filter', dev: 'live', prod: 'draft', category: 'calculator' },
  { slug: 'diffraction-limit', name: 'Diffraction Limit Calculator', description: 'Find the sharpest aperture for your sensor', dev: 'live', prod: 'draft', category: 'calculator' },
  { slug: 'star-trail-calculator', name: 'Star Trail Calculator', description: 'Calculate max exposure for sharp stars or plan star trail shots', dev: 'live', prod: 'draft', category: 'calculator' },
  { slug: 'white-balance', name: 'White Balance Visualizer', description: 'See how color temperature affects your photos', dev: 'live', prod: 'draft', category: 'visualizer' },
  { slug: 'ev-chart', name: 'EV Chart', description: 'Interactive exposure value reference chart', dev: 'live', prod: 'draft', category: 'reference' },
  { slug: 'sensor-size', name: 'Sensor Size Comparison', description: 'Compare camera sensor sizes visually', dev: 'live', prod: 'draft', category: 'visualizer' },
  { slug: 'exif-viewer', name: 'EXIF Viewer', description: 'View EXIF metadata and histogram for any photo — 100% client-side', dev: 'live', prod: 'draft', category: 'file-tool' },
  { slug: 'perspective-compression-simulator', name: 'Perspective Compression Simulator', description: 'See how focal length affects background compression', dev: 'live', prod: 'draft', category: 'visualizer' },
]

function getStatus(tool: ToolDef): ToolStatus {
  return process.env.NODE_ENV === 'development' ? tool.dev : tool.prod
}

export function getToolBySlug(slug: string): ToolDef | undefined {
  return TOOLS.find((t) => t.slug === slug)
}

export function getToolStatus(tool: ToolDef): ToolStatus {
  return getStatus(tool)
}

export function getLiveTools(): ToolDef[] {
  return TOOLS.filter((t) => getStatus(t) === 'live')
}
