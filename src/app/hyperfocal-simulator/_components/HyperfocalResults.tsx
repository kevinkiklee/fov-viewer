'use client'

import type { DoFResult } from '@/lib/math/dof'

interface HyperfocalResultsProps {
  result: DoFResult
  distance: number
  isAtHyperfocal: boolean
}

function formatDistance(meters: number): string {
  if (!isFinite(meters)) return '∞'
  if (meters < 1) return `${(meters * 100).toFixed(0)} cm`
  return `${meters.toFixed(2)} m`
}

export function HyperfocalResults({ result, distance, isAtHyperfocal }: HyperfocalResultsProps) {
  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
          Hyperfocal Distance
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 600, color: isAtHyperfocal ? 'var(--accent)' : 'var(--text-primary)' }}>
          {formatDistance(result.hyperfocal)}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ padding: 10, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8 }}>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Near Limit</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600 }}>{formatDistance(result.nearFocus)}</div>
        </div>
        <div style={{ padding: 10, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8 }}>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Far Limit</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600 }}>{formatDistance(result.farFocus)}</div>
        </div>
      </div>
      <div style={{ marginTop: 8, padding: 10, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8 }}>
        <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Focus Distance</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600 }}>{formatDistance(distance)}</div>
      </div>
    </div>
  )
}
