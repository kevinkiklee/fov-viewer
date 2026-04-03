'use client'

interface HyperfocalBadgeProps {
  isAtHyperfocal: boolean
  nearLimit: number
}

function formatDist(m: number): string {
  if (m < 1) return `${(m * 100).toFixed(0)} cm`
  return `${m.toFixed(2)} m`
}

export function HyperfocalBadge({ isAtHyperfocal, nearLimit }: HyperfocalBadgeProps) {
  if (!isAtHyperfocal) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        background: 'rgba(99, 102, 241, 0.9)',
        color: '#fff',
        padding: '8px 14px',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1.5,
        backdropFilter: 'blur(8px)',
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontSize: 14 }}>∞ Sharp to infinity</div>
      <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.85 }}>
        Near limit: {formatDist(nearLimit)}
      </div>
    </div>
  )
}
