import { ImageResponse } from 'next/og'
import { getToolBySlug } from '@/lib/data/tools'

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
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: 'linear-gradient(145deg, #0d0d0d 0%, #141414 60%, #1a1610 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Geometric diamonds — outer */}
        <div
          style={{
            position: 'absolute',
            right: -40,
            top: -80,
            width: 600,
            height: 600,
            border: '2px solid rgba(245, 158, 11, 0.06)',
            transform: 'rotate(45deg)',
            borderRadius: 60,
          }}
        />
        {/* Geometric diamonds — middle */}
        <div
          style={{
            position: 'absolute',
            right: 40,
            top: 0,
            width: 460,
            height: 460,
            border: '2px solid rgba(245, 158, 11, 0.10)',
            transform: 'rotate(45deg)',
            borderRadius: 45,
          }}
        />
        {/* Geometric diamonds — inner with emoji */}
        <div
          style={{
            position: 'absolute',
            right: 120,
            top: 80,
            width: 300,
            height: 300,
            background: 'rgba(245, 158, 11, 0.03)',
            border: '2px solid rgba(245, 158, 11, 0.14)',
            transform: 'rotate(45deg)',
            borderRadius: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 88, transform: 'rotate(-45deg)' }}>{emoji}</span>
        </div>

        {/* Left content */}
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
          {/* Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#f59e0b' }} />
            <span
              style={{
                color: '#f59e0b',
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 3,
                textTransform: 'uppercase' as const,
              }}
            >
              PHOTOTOOLS.IO
            </span>
          </div>

          {/* Tool name */}
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

          {/* Description */}
          <div style={{ fontSize: 24, color: '#888888', lineHeight: 1.5 }}>
            {tool.description}
          </div>

          {/* Category pill */}
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

        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '40%',
            height: 4,
            background: 'linear-gradient(90deg, #f59e0b, transparent)',
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 },
  )
}

export async function generateHomepageOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: 'linear-gradient(145deg, #0d0d0d 0%, #141414 60%, #1a1610 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Geometric diamonds */}
        <div
          style={{
            position: 'absolute',
            right: -40,
            top: -80,
            width: 600,
            height: 600,
            border: '2px solid rgba(245, 158, 11, 0.06)',
            transform: 'rotate(45deg)',
            borderRadius: 60,
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 40,
            top: 0,
            width: 460,
            height: 460,
            border: '2px solid rgba(245, 158, 11, 0.10)',
            transform: 'rotate(45deg)',
            borderRadius: 45,
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 120,
            top: 80,
            width: 300,
            height: 300,
            background: 'rgba(245, 158, 11, 0.03)',
            border: '2px solid rgba(245, 158, 11, 0.14)',
            transform: 'rotate(45deg)',
            borderRadius: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 88, transform: 'rotate(-45deg)' }}>📷</span>
        </div>

        {/* Left content */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#f59e0b' }} />
            <span
              style={{
                color: '#f59e0b',
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 3,
                textTransform: 'uppercase' as const,
              }}
            >
              PHOTOTOOLS.IO
            </span>
          </div>

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

        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '40%',
            height: 4,
            background: 'linear-gradient(90deg, #f59e0b, transparent)',
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
