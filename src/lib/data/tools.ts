import type { ToolDef, ToolStatus } from '@/lib/types'

// i18n: name and description are duplicated in messages/en/tools.json.
// These inline strings are kept for backward compatibility during migration.
// Consumer components will be updated to use useTranslations('tools') instead.
export const TOOLS: ToolDef[] = [
  { slug: 'fov-simulator', name: 'FOV Simulator', description: 'Compare field of view across focal lengths and sensor sizes', dev: 'live', prod: 'live', category: 'visualizer' },
  { slug: 'color-scheme-generator', name: 'Color Scheme Generator', description: 'Build color palettes for photography shoots', dev: 'live', prod: 'live', category: 'visualizer' },
  { slug: 'exposure-simulator', name: 'Exposure Triangle Simulator', description: 'See how aperture, shutter speed, and ISO interact', dev: 'live', prod: 'disabled', category: 'visualizer' },
  { slug: 'dof-calculator', name: 'Depth of Field Calculator', description: 'Calculate near focus, far focus, and total depth of field', dev: 'live', prod: 'disabled', category: 'calculator' },
  { slug: 'hyperfocal-simulator', name: 'Hyperfocal Distance Simulator', description: 'Learn where to focus for maximum sharpness from foreground to infinity', dev: 'live', prod: 'disabled', category: 'visualizer' },
  { slug: 'shutter-speed-visualizer', name: 'Shutter Speed Visualizer', description: 'Find the minimum safe shutter speed for sharp handheld shots', dev: 'live', prod: 'disabled', category: 'visualizer' },
  { slug: 'nd-filter-calculator', name: 'ND Filter Calculator', description: 'Calculate exposure time with any ND filter', dev: 'draft', prod: 'disabled', category: 'calculator' },
  { slug: 'star-trail-calculator', name: 'Star Trail Calculator', description: 'Calculate max exposure for sharp stars or plan star trail shots', dev: 'live', prod: 'live', category: 'visualizer' },
  { slug: 'perspective-compression-simulator', name: 'Perspective Compression Simulator', description: 'See how focal length affects background compression', dev: 'live', prod: 'disabled', category: 'visualizer' },
  { slug: 'white-balance-visualizer', name: 'White Balance Visualizer', description: 'See how color temperature affects your photos', dev: 'live', prod: 'live', category: 'visualizer' },
  { slug: 'sensor-size-comparison', name: 'Sensor Size Comparison', description: 'Compare camera sensor sizes visually', dev: 'live', prod: 'live', category: 'visualizer' },
  { slug: 'frame-studio', name: 'Frame Studio', description: 'Crop, frame, and compose photos with grid overlays', dev: 'live', prod: 'live', category: 'file-tool' },
  { slug: 'exif-viewer', name: 'EXIF Viewer', description: 'View EXIF metadata and histogram for any photo — 100% client-side', dev: 'live', prod: 'live', category: 'file-tool' },
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

/** All tools except disabled ones — includes live + draft (coming soon) */
export function getVisibleTools(): ToolDef[] {
  return TOOLS.filter((t) => getStatus(t) !== 'disabled')
}

/** Every tool regardless of status */
export function getAllTools(): ToolDef[] {
  return TOOLS
}
