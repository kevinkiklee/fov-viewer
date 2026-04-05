import { ImageResponse } from 'next/og'
import { getToolBySlug } from '@/lib/data/tools'
import { OgBackground, OgDiamonds, OgBranding, OgAccentLine } from './og-layout'

const TOOL_EMOJIS: Record<string, string> = {
  'fov-simulator': '🔭',
  'color-scheme-generator': '🎨',
  'exposure-simulator': '📸',
  'dof-calculator': '🌿',
  'hyperfocal-simulator': '🎯',
  'shutter-speed-visualizer': '⏱️',
  'nd-filter-calculator': '🕶️',
  'diffraction-limit': '🔬',
  'star-trail-calculator': '⭐',
  'white-balance-visualizer': '🌡️',
  'sensor-size-comparison': '📏',
  'exif-viewer': '🗂️',
  'perspective-compression-simulator': '🏔️',
}

const CATEGORY_LABELS: Record<string, string> = {
  visualizer: 'Visualizer',
  calculator: 'Calculator',
  'file-tool': 'File Tool',
}

export async function generateOgImage(slug: string) {
  const tool = getToolBySlug(slug)
  if (!tool) return new Response('Not Found', { status: 404 })

  const emoji = TOOL_EMOJIS[slug] ?? '📷'
  const categoryLabel = CATEGORY_LABELS[tool.category] ?? tool.category

  return new ImageResponse(
    (
      <OgBackground>
        <OgDiamonds emoji={emoji} />
        <div
          style={{
            position: 'absolute',
            left: 80,
            top: '50%',
            transform: 'translateY(-50%)',
            maxWidth: '52%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <OgBranding />
          <div
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: '#e5e5e5',
              lineHeight: 1.15,
              marginBottom: 24,
            }}
          >
            {tool.name}
          </div>
          <div style={{ fontSize: 24, color: '#888888', lineHeight: 1.5 }}>
            {tool.description}
          </div>
          <div style={{ display: 'flex', marginTop: 28 }}>
            <span
              style={{
                color: '#f59e0b',
                fontSize: 16,
                textTransform: 'uppercase' as const,
                letterSpacing: 3,
                border: '1.5px solid rgba(245, 158, 11, 0.25)',
                padding: '6px 20px',
                borderRadius: 100,
              }}
            >
              {categoryLabel}
            </span>
          </div>
        </div>
        <OgAccentLine />
      </OgBackground>
    ),
    { width: 1200, height: 630 },
  )
}

export async function generateHomepageOgImage() {
  return new ImageResponse(
    (
      <OgBackground>
        <OgDiamonds emoji="📷" />
        <div
          style={{
            position: 'absolute',
            left: 80,
            top: '50%',
            transform: 'translateY(-50%)',
            maxWidth: '55%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <OgBranding />
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: '#e5e5e5',
              lineHeight: 1.15,
              marginBottom: 24,
            }}
          >
            Free Photography Tools
          </div>
          <div style={{ fontSize: 28, color: '#888888', lineHeight: 1.5 }}>
            Interactive calculators, simulators, and visualizers for photographers. No sign-up required.
          </div>
        </div>
        <OgAccentLine />
      </OgBackground>
    ),
    { width: 1200, height: 630 },
  )
}
