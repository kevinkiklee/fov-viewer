export function OgBackground({ children }: { children: React.ReactNode }) {
  return (
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
      {children}
    </div>
  )
}

export function OgDiamonds({ emoji }: { emoji: string }) {
  return (
    <>
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
        <span style={{ fontSize: 88, transform: 'rotate(-45deg)' }}>{emoji}</span>
      </div>
    </>
  )
}

export function OgBranding() {
  const bladePaths = [
    'M0.00,-5.00 L2.66,-8.60 A9,9 0 0,1 8.38,-3.28 L3.91,-3.12 Z',
    'M3.91,-3.12 L8.38,-3.28 A9,9 0 0,1 7.79,4.51 L4.87,1.11 Z',
    'M4.87,1.11 L7.79,4.51 A9,9 0 0,1 1.33,8.90 L2.17,4.50 Z',
    'M2.17,4.50 L1.33,8.90 A9,9 0 0,1 -6.13,6.59 L-2.17,4.50 Z',
    'M-2.17,4.50 L-6.13,6.59 A9,9 0 0,1 -8.97,-0.68 L-4.87,1.11 Z',
    'M-4.87,1.11 L-8.97,-0.68 A9,9 0 0,1 -5.06,-7.44 L-3.91,-3.12 Z',
    'M-3.91,-3.12 L-5.06,-7.44 A9,9 0 0,1 2.66,-8.60 L-0.00,-5.00 Z',
  ]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
      <svg width={22} height={22} viewBox="0 0 20 20">
        <g transform="translate(10,10)">
          {bladePaths.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="#f59e0b"
              stroke="#0d0d0d"
              strokeWidth="0.4"
              strokeLinejoin="round"
            />
          ))}
        </g>
      </svg>
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
  )
}

export function OgAccentLine() {
  return (
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
  )
}
