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
  return (
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
