import { ImageResponse } from 'next/og'

export const alt = 'PhotoTools — Free Photography Tools'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '40px',
          }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
          <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#fff' }}>phototools.io</span>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            maxWidth: '1000px',
          }}
        >
          <div
            style={{
              fontSize: '84px',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '32px',
              color: '#fff',
            }}
          >
            Professional tools for modern photographers.
          </div>
          <div
            style={{
              fontSize: '32px',
              lineHeight: 1.4,
              color: '#888',
              fontWeight: 400,
            }}
          >
            Free calculators, simulators, and references. No sign-up, no ads, runs entirely in the browser.
          </div>
        </div>

        <div
          style={{
            marginTop: '60px',
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {['FOV', 'DOF', 'Exposure', 'Sensor Size', 'EXIF'].map((label) => (
            <div
              key={label}
              style={{
                padding: '8px 20px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '100px',
                fontSize: '18px',
                color: '#3b82f6',
                border: '1px solid rgba(59,130,246,0.2)',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
