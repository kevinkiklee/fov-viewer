import { ImageResponse } from 'next/og'
import { getToolBySlug } from '@/lib/data/tools'

export async function generateOgImage(slug: string) {
  const tool = getToolBySlug(slug)
  if (!tool) return new Response('Not Found', { status: 404 })

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f0f14',
          backgroundImage: 'radial-gradient(circle at 25% 25%, #1a1a24 0%, #0f0f14 100%)',
          color: '#e0e0e0',
          fontFamily: 'system-ui',
          padding: '80px',
        }}
      >
        {/* Decorative corner element */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 40,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#888' }}>phototools.io</span>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            maxWidth: '900px',
          }}
        >
          <div
            style={{
              fontSize: '84px',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '24px',
              background: 'linear-gradient(to bottom right, #fff, #888)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {tool.name}
          </div>
          <div
            style={{
              fontSize: '32px',
              lineHeight: 1.4,
              color: '#888',
              fontWeight: 400,
            }}
          >
            {tool.description}
          </div>
        </div>

        {/* Bottom indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            display: 'flex',
            padding: '12px 24px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '100px',
            fontSize: '18px',
            color: '#3b82f6',
            border: '1px solid rgba(59,130,246,0.2)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          {tool.category.replace('-', ' ')}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
