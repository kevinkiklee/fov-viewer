'use client'

import { calcHyperfocal } from '@/lib/math/dof'
import { APERTURES } from '@/lib/data/camera'

interface HyperfocalMiniTableProps {
  focalLength: number
  aperture: number
  coc: number
}

function formatDist(m: number): string {
  if (m < 1) return `${(m * 100).toFixed(0)} cm`
  return `${m.toFixed(2)} m`
}

export function HyperfocalMiniTable({ focalLength, aperture, coc }: HyperfocalMiniTableProps) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: 8 }}>
        Hyperfocal Reference — {focalLength}mm
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <tbody>
          {APERTURES.map((ap) => {
            const hf = calcHyperfocal(focalLength, ap, coc)
            const isCurrent = ap === aperture
            return (
              <tr key={ap} style={{ background: isCurrent ? 'var(--bg-primary)' : undefined }}>
                <td style={{ padding: '4px 8px', color: isCurrent ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: isCurrent ? 600 : 400 }}>
                  f/{ap}
                </td>
                <td style={{ padding: '4px 8px', fontFamily: 'var(--font-mono)', textAlign: 'right', color: isCurrent ? 'var(--accent)' : 'var(--text-primary)', fontWeight: isCurrent ? 600 : 400 }}>
                  {formatDist(hf)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
